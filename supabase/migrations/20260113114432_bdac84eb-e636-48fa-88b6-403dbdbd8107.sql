-- Add published_at column to videos table for YouTube publish date
ALTER TABLE public.videos 
ADD COLUMN published_at timestamp with time zone;