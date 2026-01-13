import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface YouTubePlaylistItem {
  snippet: {
    title: string;
    description: string;
    publishedAt: string;
    resourceId: {
      videoId: string;
    };
  };
}

interface YouTubePlaylistResponse {
  items: YouTubePlaylistItem[];
  nextPageToken?: string;
}

interface PlaylistMapping {
  playlist_id: string;
  playlist_name: string | null;
  sector_id: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const youtubeApiKey = Deno.env.get("YOUTUBE_API_KEY");

    if (!youtubeApiKey) {
      console.error("YOUTUBE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Chave da API do YouTube não configurada" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with user's token to check admin status
    const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify user is admin
    const { data: userData, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !userData.user) {
      console.error("Failed to get user:", userError);
      return new Response(
        JSON.stringify({ error: "Usuário não autenticado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is admin using service role
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .single();

    if (roleError || roleData?.role !== "admin") {
      console.error("User is not admin:", roleError);
      return new Response(
        JSON.stringify({ error: "Apenas administradores podem sincronizar vídeos" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get playlist mappings
    const { data: mappings, error: mappingsError } = await supabaseAdmin
      .from("youtube_playlist_mappings")
      .select("playlist_id, playlist_name, sector_id");

    if (mappingsError) {
      console.error("Failed to fetch playlist mappings:", mappingsError);
      return new Response(
        JSON.stringify({ error: "Erro ao buscar mapeamentos de playlist" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!mappings || mappings.length === 0) {
      console.log("No playlist mappings found");
      return new Response(
        JSON.stringify({ 
          message: "Nenhuma playlist configurada. Adicione mapeamentos de playlist primeiro.",
          synced: 0,
          skipped: 0 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${mappings.length} playlist mappings`);

    // Get existing videos to avoid duplicates
    const { data: existingVideos, error: existingError } = await supabaseAdmin
      .from("videos")
      .select("youtube_id");

    if (existingError) {
      console.error("Failed to fetch existing videos:", existingError);
      return new Response(
        JSON.stringify({ error: "Erro ao verificar vídeos existentes" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const existingYoutubeIds = new Set(existingVideos?.map((v) => v.youtube_id) || []);
    console.log(`Found ${existingYoutubeIds.size} existing videos`);

    let totalSynced = 0;
    let totalSkipped = 0;
    const errors: string[] = [];

    // Process each playlist
    for (const mapping of mappings as PlaylistMapping[]) {
      console.log(`Processing playlist: ${mapping.playlist_id}`);
      
      try {
        let nextPageToken: string | undefined;
        
        do {
          // Fetch playlist items from YouTube
          const url = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
          url.searchParams.set("part", "snippet");
          url.searchParams.set("playlistId", mapping.playlist_id);
          url.searchParams.set("maxResults", "50");
          url.searchParams.set("key", youtubeApiKey);
          if (nextPageToken) {
            url.searchParams.set("pageToken", nextPageToken);
          }

          console.log(`Fetching playlist items from YouTube: ${mapping.playlist_id}`);
          const response = await fetch(url.toString());
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`YouTube API error for playlist ${mapping.playlist_id}:`, errorText);
            errors.push(`Playlist ${mapping.playlist_name || mapping.playlist_id}: ${response.status}`);
            break;
          }

          const data: YouTubePlaylistResponse = await response.json();
          console.log(`Received ${data.items?.length || 0} items from playlist ${mapping.playlist_id}`);

          // Process videos
          for (const item of data.items || []) {
            const videoId = item.snippet.resourceId.videoId;
            
            if (existingYoutubeIds.has(videoId)) {
              totalSkipped++;
              continue;
            }

            // Insert new video with YouTube publish date
            const { error: insertError } = await supabaseAdmin
              .from("videos")
              .insert({
                title: item.snippet.title,
                description: item.snippet.description || null,
                youtube_id: videoId,
                sector_id: mapping.sector_id,
                created_by: userData.user.id,
                published_at: item.snippet.publishedAt || null,
              });

            if (insertError) {
              console.error(`Failed to insert video ${videoId}:`, insertError);
              if (insertError.code === "23505") {
                // Duplicate, skip
                totalSkipped++;
              } else {
                errors.push(`Vídeo ${item.snippet.title}: ${insertError.message}`);
              }
            } else {
              console.log(`Synced video: ${item.snippet.title}`);
              existingYoutubeIds.add(videoId); // Prevent duplicates in same run
              totalSynced++;
            }
          }

          nextPageToken = data.nextPageToken;
        } while (nextPageToken);
        
      } catch (playlistError) {
        console.error(`Error processing playlist ${mapping.playlist_id}:`, playlistError);
        errors.push(`Playlist ${mapping.playlist_name || mapping.playlist_id}: erro interno`);
      }
    }

    console.log(`Sync complete: ${totalSynced} synced, ${totalSkipped} skipped, ${errors.length} errors`);

    return new Response(
      JSON.stringify({
        message: totalSynced > 0 
          ? `Sincronização concluída! ${totalSynced} vídeo(s) adicionado(s).`
          : "Nenhum vídeo novo encontrado.",
        synced: totalSynced,
        skipped: totalSkipped,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
