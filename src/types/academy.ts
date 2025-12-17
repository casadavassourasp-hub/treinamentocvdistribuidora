export interface Sector {
  id: number;
  name: string;
}

export interface Video {
  id: number;
  title: string;
  description: string;
  sectorId: number;
  youtubeId: string;
}

export type ViewMode = 'employee' | 'admin';
