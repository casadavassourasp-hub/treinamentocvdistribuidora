import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface VideoProgress {
  video_id: string;
  watched: boolean;
  watched_at: string | null;
}

export function useVideoProgress() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<Map<string, VideoProgress>>(new Map());
  const [loading, setLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    if (!user) {
      setProgress(new Map());
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('video_progress')
        .select('video_id, watched, watched_at')
        .eq('user_id', user.id);

      if (error) throw error;

      const progressMap = new Map<string, VideoProgress>();
      data?.forEach((p) => {
        progressMap.set(p.video_id, {
          video_id: p.video_id,
          watched: p.watched ?? false,
          watched_at: p.watched_at,
        });
      });
      setProgress(progressMap);
    } catch (error) {
      console.error('Error fetching video progress:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const markAsWatched = async (videoId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('video_progress')
        .upsert(
          {
            user_id: user.id,
            video_id: videoId,
            watched: true,
            watched_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,video_id' }
        );

      if (error) throw error;

      setProgress((prev) => {
        const newMap = new Map(prev);
        newMap.set(videoId, {
          video_id: videoId,
          watched: true,
          watched_at: new Date().toISOString(),
        });
        return newMap;
      });
    } catch (error) {
      console.error('Error marking video as watched:', error);
    }
  };

  const isWatched = (videoId: string): boolean => {
    return progress.get(videoId)?.watched ?? false;
  };

  const getWatchedCount = (): number => {
    return Array.from(progress.values()).filter((p) => p.watched).length;
  };

  return {
    progress,
    loading,
    markAsWatched,
    isWatched,
    getWatchedCount,
    refetch: fetchProgress,
  };
}
