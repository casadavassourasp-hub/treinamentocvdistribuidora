export interface UserPoints {
  id: string;
  user_id: string;
  total_points: number;
  videos_watched: number;
  sectors_completed: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  points_required: number | null;
  videos_required: number | null;
  sectors_required: number | null;
  streak_required: number | null;
  badge_color: string;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
}

export interface LeaderboardEntry {
  user_id: string;
  full_name: string | null;
  email: string | null;
  total_points: number;
  videos_watched: number;
  current_streak: number;
  rank: number;
}

export interface SectorLeaderboardEntry {
  user_id: string;
  full_name: string | null;
  email: string | null;
  sector_id: string;
  points: number;
  videos_watched: number;
  rank: number;
}
