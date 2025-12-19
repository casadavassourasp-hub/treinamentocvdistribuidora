-- Create user_points table
CREATE TABLE public.user_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  total_points INTEGER DEFAULT 0,
  videos_watched INTEGER DEFAULT 0,
  sectors_completed INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_points
CREATE POLICY "Users can view all points for ranking"
ON public.user_points FOR SELECT
USING (true);

CREATE POLICY "Users can insert own points"
ON public.user_points FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own points"
ON public.user_points FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all points"
ON public.user_points FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create achievements table
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL,
  points_required INTEGER,
  videos_required INTEGER,
  sectors_required INTEGER,
  streak_required INTEGER,
  badge_color TEXT DEFAULT 'primary',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Everyone can view achievements
CREATE POLICY "Anyone can view achievements"
ON public.achievements FOR SELECT
USING (true);

CREATE POLICY "Admins can manage achievements"
ON public.achievements FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create user_achievements table
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_achievements
CREATE POLICY "Users can view all achievements for display"
ON public.user_achievements FOR SELECT
USING (true);

CREATE POLICY "Users can insert own achievements"
ON public.user_achievements FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all achievements"
ON public.user_achievements FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default achievements
INSERT INTO public.achievements (name, description, icon, videos_required, badge_color) VALUES
('Primeiro Passo', 'Assistiu seu primeiro vídeo', 'play', 1, 'green'),
('Em Progresso', 'Assistiu 5 vídeos', 'trending-up', 5, 'blue'),
('Dedicado', 'Assistiu 10 vídeos', 'award', 10, 'purple'),
('Expert', 'Assistiu 25 vídeos', 'star', 25, 'yellow');

INSERT INTO public.achievements (name, description, icon, sectors_required, badge_color) VALUES
('Especialista', 'Completou todos os vídeos de 1 setor', 'folder-check', 1, 'cyan');

INSERT INTO public.achievements (name, description, icon, streak_required, badge_color) VALUES
('Consistente', 'Manteve um streak de 7 dias', 'flame', 7, 'orange'),
('Inabalável', 'Manteve um streak de 30 dias', 'zap', 30, 'red');

INSERT INTO public.achievements (name, description, icon, points_required, badge_color) VALUES
('Pontuador', 'Alcançou 500 pontos', 'trophy', 500, 'gold');

-- Function to initialize user points on signup
CREATE OR REPLACE FUNCTION public.initialize_user_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_points (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger to create user_points when profile is created
CREATE TRIGGER on_profile_created_init_points
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_user_points();

-- Function to update user points when video progress changes
CREATE OR REPLACE FUNCTION public.update_user_points_on_video_watch()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  points_to_add INTEGER := 10;
  today DATE := CURRENT_DATE;
  last_date DATE;
  new_streak INTEGER;
BEGIN
  -- Only process if video was just marked as watched
  IF NEW.watched = true AND (OLD IS NULL OR OLD.watched = false) THEN
    -- Get current user points
    SELECT last_activity_date, current_streak INTO last_date, new_streak
    FROM public.user_points WHERE user_id = NEW.user_id;
    
    -- Calculate streak
    IF last_date IS NULL OR last_date < today - 1 THEN
      new_streak := 1;
    ELSIF last_date = today - 1 THEN
      new_streak := COALESCE(new_streak, 0) + 1;
      points_to_add := points_to_add + 5; -- Streak bonus
    END IF;
    
    -- Upsert user points
    INSERT INTO public.user_points (user_id, total_points, videos_watched, current_streak, longest_streak, last_activity_date)
    VALUES (NEW.user_id, points_to_add, 1, new_streak, new_streak, today)
    ON CONFLICT (user_id) DO UPDATE SET
      total_points = user_points.total_points + points_to_add,
      videos_watched = user_points.videos_watched + 1,
      current_streak = new_streak,
      longest_streak = GREATEST(user_points.longest_streak, new_streak),
      last_activity_date = today,
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger for video progress
CREATE TRIGGER on_video_progress_update_points
  AFTER INSERT OR UPDATE ON public.video_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_points_on_video_watch();