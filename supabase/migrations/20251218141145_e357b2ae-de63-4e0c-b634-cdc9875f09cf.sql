-- Create video_progress table to track employee video watching
CREATE TABLE public.video_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE NOT NULL,
  watched BOOLEAN DEFAULT false,
  watched_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, video_id)
);

ALTER TABLE public.video_progress ENABLE ROW LEVEL SECURITY;

-- Users can view their own progress
CREATE POLICY "Users can view own progress" 
ON public.video_progress 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Users can insert their own progress
CREATE POLICY "Users can insert own progress" 
ON public.video_progress 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own progress
CREATE POLICY "Users can update own progress" 
ON public.video_progress 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

-- Admins can view all progress for reporting
CREATE POLICY "Admins can view all progress" 
ON public.video_progress 
FOR SELECT 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'));