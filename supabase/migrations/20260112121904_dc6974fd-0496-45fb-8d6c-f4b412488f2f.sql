-- Create function to update timestamps (if not exists)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create table to store YouTube playlist to sector mappings
CREATE TABLE public.youtube_playlist_mappings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id TEXT NOT NULL UNIQUE,
  playlist_name TEXT,
  sector_id UUID NOT NULL REFERENCES public.sectors(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.youtube_playlist_mappings ENABLE ROW LEVEL SECURITY;

-- Only admins can manage playlist mappings
CREATE POLICY "Admins can manage playlist mappings" ON public.youtube_playlist_mappings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- All authenticated users can view mappings (needed for display)
CREATE POLICY "Authenticated users can view mappings" ON public.youtube_playlist_mappings
  FOR SELECT TO authenticated
  USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_youtube_playlist_mappings_updated_at
  BEFORE UPDATE ON public.youtube_playlist_mappings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();