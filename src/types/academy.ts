export interface Sector {
  id: string;
  name: string;
  created_at?: string;
  created_by?: string;
}

export interface Video {
  id: string;
  title: string;
  description: string | null;
  sector_id: string | null;
  youtube_id: string;
  created_at?: string;
  created_by?: string;
}

export type ViewMode = 'employee' | 'admin';

export type AppRole = 'admin' | 'employee';

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
}
