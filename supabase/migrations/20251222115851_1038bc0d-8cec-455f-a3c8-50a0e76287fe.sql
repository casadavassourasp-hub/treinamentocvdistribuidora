-- Create user_sector_points table
CREATE TABLE public.user_sector_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  sector_id UUID NOT NULL REFERENCES public.sectors(id) ON DELETE CASCADE,
  points INTEGER DEFAULT 0,
  videos_watched INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, sector_id)
);

-- Enable RLS
ALTER TABLE public.user_sector_points ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view all sector points for ranking"
ON public.user_sector_points FOR SELECT
USING (true);

CREATE POLICY "Users can insert own sector points"
ON public.user_sector_points FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sector points"
ON public.user_sector_points FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all sector points"
ON public.user_sector_points FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger function to update sector points on video watch
CREATE OR REPLACE FUNCTION public.update_user_sector_points_on_video_watch()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  video_sector_id UUID;
  points_to_add INTEGER := 10;
BEGIN
  -- Only process if video was just marked as watched
  IF NEW.watched = true AND (OLD IS NULL OR OLD.watched = false) THEN
    -- Get the sector of the video
    SELECT sector_id INTO video_sector_id
    FROM public.videos WHERE id = NEW.video_id;
    
    -- Only update if video has a sector
    IF video_sector_id IS NOT NULL THEN
      -- Upsert sector points
      INSERT INTO public.user_sector_points (user_id, sector_id, points, videos_watched, updated_at)
      VALUES (NEW.user_id, video_sector_id, points_to_add, 1, now())
      ON CONFLICT (user_id, sector_id) DO UPDATE SET
        points = user_sector_points.points + points_to_add,
        videos_watched = user_sector_points.videos_watched + 1,
        updated_at = now();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER update_sector_points_on_video_watch
AFTER INSERT OR UPDATE ON public.video_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_user_sector_points_on_video_watch();