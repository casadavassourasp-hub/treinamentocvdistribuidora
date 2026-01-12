import { useState, useEffect } from 'react';
import { X, Youtube, Plus, Trash2, RefreshCw, Link, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Sector } from '@/types/academy';
import { toast } from 'sonner';

interface PlaylistMapping {
  id: string;
  playlist_id: string;
  playlist_name: string | null;
  sector_id: string;
}

interface YouTubeSyncModalProps {
  sectors: Sector[];
  onClose: () => void;
  onSyncComplete: () => void;
}

export function YouTubeSyncModal({ sectors, onClose, onSyncComplete }: YouTubeSyncModalProps) {
  const [mappings, setMappings] = useState<PlaylistMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [newPlaylistUrl, setNewPlaylistUrl] = useState('');
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newSectorId, setNewSectorId] = useState(sectors[0]?.id || '');
  const [addingMapping, setAddingMapping] = useState(false);

  useEffect(() => {
    fetchMappings();
  }, []);

  const fetchMappings = async () => {
    try {
      const { data, error } = await supabase
        .from('youtube_playlist_mappings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMappings((data as PlaylistMapping[]) || []);
    } catch (error) {
      console.error('Error fetching mappings:', error);
      toast.error('Erro ao carregar mapeamentos');
    } finally {
      setLoading(false);
    }
  };

  const extractPlaylistId = (url: string): string | null => {
    // Handle different YouTube playlist URL formats
    const patterns = [
      /[?&]list=([a-zA-Z0-9_-]+)/,
      /playlist\?list=([a-zA-Z0-9_-]+)/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    
    // If it's already just an ID
    if (/^[a-zA-Z0-9_-]{10,}$/.test(url.trim())) {
      return url.trim();
    }
    
    return null;
  };

  const addMapping = async () => {
    const playlistId = extractPlaylistId(newPlaylistUrl);
    
    if (!playlistId) {
      toast.error('URL de playlist inválida');
      return;
    }

    if (!newSectorId) {
      toast.error('Selecione um setor');
      return;
    }

    setAddingMapping(true);
    try {
      const { error } = await supabase
        .from('youtube_playlist_mappings')
        .insert({
          playlist_id: playlistId,
          playlist_name: newPlaylistName.trim() || null,
          sector_id: newSectorId,
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('Esta playlist já está cadastrada');
        } else {
          throw error;
        }
        return;
      }

      toast.success('Playlist adicionada!');
      setNewPlaylistUrl('');
      setNewPlaylistName('');
      fetchMappings();
    } catch (error) {
      console.error('Error adding mapping:', error);
      toast.error('Erro ao adicionar playlist');
    } finally {
      setAddingMapping(false);
    }
  };

  const deleteMapping = async (id: string) => {
    try {
      const { error } = await supabase
        .from('youtube_playlist_mappings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setMappings(prev => prev.filter(m => m.id !== id));
      toast.success('Playlist removida');
    } catch (error) {
      console.error('Error deleting mapping:', error);
      toast.error('Erro ao remover playlist');
    }
  };

  const syncVideos = async () => {
    if (mappings.length === 0) {
      toast.error('Adicione pelo menos uma playlist primeiro');
      return;
    }

    setSyncing(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('sync-youtube-playlist', {
        headers: {
          Authorization: `Bearer ${sessionData.session?.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const result = response.data;
      
      if (result.synced > 0) {
        toast.success(result.message);
        onSyncComplete();
      } else {
        toast.info(result.message);
      }

      if (result.errors?.length > 0) {
        console.error('Sync errors:', result.errors);
        toast.warning(`${result.errors.length} erro(s) durante a sincronização`);
      }
    } catch (error: any) {
      console.error('Sync error:', error);
      toast.error(error.message || 'Erro ao sincronizar vídeos');
    } finally {
      setSyncing(false);
    }
  };

  const getSectorName = (sectorId: string) => {
    return sectors.find(s => s.id === sectorId)?.name || 'Setor desconhecido';
  };

  return (
    <div
      className="fixed inset-0 bg-foreground/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-card w-full max-w-2xl rounded-xl overflow-hidden shadow-2xl animate-scale-in max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-red-600 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Youtube className="w-6 h-6 text-white" />
            <h3 className="text-white font-semibold text-lg">Sincronizar YouTube</h3>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Add new mapping */}
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium text-foreground flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Adicionar Playlist
            </h4>
            
            <div className="grid gap-3">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  URL ou ID da Playlist
                </label>
                <div className="relative">
                  <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={newPlaylistUrl}
                    onChange={(e) => setNewPlaylistUrl(e.target.value)}
                    placeholder="https://youtube.com/playlist?list=PLxxxx ou PLxxxx"
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">
                    Nome (opcional)
                  </label>
                  <Input
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    placeholder="Ex: Treinamento Vendas"
                  />
                </div>
                
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">
                    Setor
                  </label>
                  <select
                    value={newSectorId}
                    onChange={(e) => setNewSectorId(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-input bg-background text-foreground"
                  >
                    {sectors.length === 0 ? (
                      <option value="">Nenhum setor disponível</option>
                    ) : (
                      sectors.map((sector) => (
                        <option key={sector.id} value={sector.id}>
                          {sector.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>
              
              <Button 
                onClick={addMapping} 
                disabled={addingMapping || !newPlaylistUrl || sectors.length === 0}
                className="w-full"
              >
                {addingMapping ? 'Adicionando...' : 'Adicionar Playlist'}
              </Button>
            </div>
          </div>

          {/* Existing mappings */}
          <div className="space-y-3">
            <h4 className="font-medium text-foreground flex items-center gap-2">
              <FolderOpen className="w-4 h-4" />
              Playlists Configuradas ({mappings.length})
            </h4>
            
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : mappings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma playlist configurada ainda
              </div>
            ) : (
              <div className="space-y-2">
                {mappings.map((mapping) => (
                  <div
                    key={mapping.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {mapping.playlist_name || mapping.playlist_id}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Setor: {getSectorName(mapping.sector_id)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMapping(mapping.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Fechar
          </Button>
          <Button
            onClick={syncVideos}
            disabled={syncing || mappings.length === 0}
            className="flex-1 bg-red-600 hover:bg-red-700"
          >
            {syncing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Sincronizando...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Sincronizar Agora
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
