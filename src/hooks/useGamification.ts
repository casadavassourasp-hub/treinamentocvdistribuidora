import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { UserPoints, Achievement, UserAchievement, LeaderboardEntry, SectorLeaderboardEntry } from '@/types/gamification';

export function useGamification() {
  const { user } = useAuth();
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [sectorLeaderboard, setSectorLeaderboard] = useState<SectorLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserPoints = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_points')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user points:', error);
      return;
    }

    setUserPoints(data);
  }, [user]);

  const fetchAchievements = useCallback(async () => {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .order('videos_required', { ascending: true, nullsFirst: false });

    if (error) {
      console.error('Error fetching achievements:', error);
      return;
    }

    setAchievements(data || []);
  }, []);

  const fetchUserAchievements = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching user achievements:', error);
      return;
    }

    setUserAchievements(data || []);
  }, [user]);

  const fetchLeaderboard = useCallback(async () => {
    const { data: pointsData, error: pointsError } = await supabase
      .from('user_points')
      .select('user_id, total_points, videos_watched, current_streak')
      .order('total_points', { ascending: false })
      .limit(10);

    if (pointsError) {
      console.error('Error fetching leaderboard:', pointsError);
      return;
    }

    if (!pointsData || pointsData.length === 0) {
      setLeaderboard([]);
      return;
    }

    // Fetch profiles for users in leaderboard
    const userIds = pointsData.map((p) => p.user_id);
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', userIds);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return;
    }

    const profilesMap = new Map(profilesData?.map((p) => [p.id, p]));

    const entries: LeaderboardEntry[] = pointsData.map((p, index) => {
      const profile = profilesMap.get(p.user_id);
      return {
        user_id: p.user_id,
        full_name: profile?.full_name || null,
        email: profile?.email || null,
        total_points: p.total_points,
        videos_watched: p.videos_watched,
        current_streak: p.current_streak,
        rank: index + 1,
      };
    });

    setLeaderboard(entries);
  }, []);

  const fetchSectorLeaderboard = useCallback(async (sectorId: string) => {
    const { data: sectorPointsData, error: sectorError } = await supabase
      .from('user_sector_points')
      .select('user_id, sector_id, points, videos_watched')
      .eq('sector_id', sectorId)
      .order('points', { ascending: false })
      .limit(10);

    if (sectorError) {
      console.error('Error fetching sector leaderboard:', sectorError);
      return;
    }

    if (!sectorPointsData || sectorPointsData.length === 0) {
      setSectorLeaderboard([]);
      return;
    }

    // Fetch profiles for users in sector leaderboard
    const userIds = sectorPointsData.map((p) => p.user_id);
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', userIds);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return;
    }

    const profilesMap = new Map(profilesData?.map((p) => [p.id, p]));

    const entries: SectorLeaderboardEntry[] = sectorPointsData.map((p, index) => {
      const profile = profilesMap.get(p.user_id);
      return {
        user_id: p.user_id,
        full_name: profile?.full_name || null,
        email: profile?.email || null,
        sector_id: p.sector_id,
        points: p.points ?? 0,
        videos_watched: p.videos_watched ?? 0,
        rank: index + 1,
      };
    });

    setSectorLeaderboard(entries);
  }, []);

  const checkAndUnlockAchievements = useCallback(async () => {
    if (!user || !userPoints) return;

    const unlockedIds = new Set(userAchievements.map((ua) => ua.achievement_id));

    for (const achievement of achievements) {
      if (unlockedIds.has(achievement.id)) continue;

      let shouldUnlock = false;

      if (achievement.videos_required && userPoints.videos_watched >= achievement.videos_required) {
        shouldUnlock = true;
      }
      if (achievement.points_required && userPoints.total_points >= achievement.points_required) {
        shouldUnlock = true;
      }
      if (achievement.streak_required && userPoints.current_streak >= achievement.streak_required) {
        shouldUnlock = true;
      }

      if (shouldUnlock) {
        const { error } = await supabase.from('user_achievements').insert({
          user_id: user.id,
          achievement_id: achievement.id,
        });

        if (!error) {
          setUserAchievements((prev) => [
            ...prev,
            { id: crypto.randomUUID(), user_id: user.id, achievement_id: achievement.id, earned_at: new Date().toISOString() },
          ]);
        }
      }
    }
  }, [user, userPoints, achievements, userAchievements]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchUserPoints(), fetchAchievements(), fetchUserAchievements(), fetchLeaderboard()]);
      setLoading(false);
    };

    loadData();
  }, [fetchUserPoints, fetchAchievements, fetchUserAchievements, fetchLeaderboard]);

  useEffect(() => {
    if (!loading && userPoints && achievements.length > 0) {
      checkAndUnlockAchievements();
    }
  }, [loading, userPoints, achievements, checkAndUnlockAchievements]);

  const getUserRank = (): number | null => {
    if (!user) return null;
    const entry = leaderboard.find((e) => e.user_id === user.id);
    return entry?.rank || null;
  };

  const isAchievementUnlocked = (achievementId: string): boolean => {
    return userAchievements.some((ua) => ua.achievement_id === achievementId);
  };

  return {
    userPoints,
    achievements,
    userAchievements,
    leaderboard,
    sectorLeaderboard,
    loading,
    getUserRank,
    isAchievementUnlocked,
    fetchSectorLeaderboard,
    refetch: async () => {
      await Promise.all([fetchUserPoints(), fetchLeaderboard(), fetchUserAchievements()]);
    },
  };
}
