import { Play, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Video } from '@/types/academy';

interface VideoCardProps {
  video: Video;
  sectorName: string;
  watched?: boolean;
  onWatch: (video: Video) => void;
}

export function VideoCard({ video, sectorName, watched = false, onWatch }: VideoCardProps) {
  return (
    <div className="bg-card rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden group animate-slide-up relative">
      {watched && (
        <div className="absolute top-2 right-2 md:top-3 md:right-3 z-10">
          <div className="bg-green-500 text-white px-1.5 py-0.5 md:px-2 md:py-1 rounded-md text-[10px] md:text-xs font-medium flex items-center gap-1">
            <CheckCircle className="w-2.5 h-2.5 md:w-3 md:h-3" />
            <span className="hidden xs:inline">Assistido</span>
          </div>
        </div>
      )}
      <div className="relative aspect-video bg-muted overflow-hidden">
        <img
          src={`https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`}
          alt={video.title}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${watched ? 'opacity-80' : ''}`}
        />
        <button
          onClick={() => onWatch(video)}
          className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 md:transition-opacity duration-300 flex items-center justify-center cursor-pointer active:opacity-100"
        >
          <div className="w-12 h-12 md:w-16 md:h-16 bg-accent rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform">
            <Play className="w-6 h-6 md:w-8 md:h-8 text-accent-foreground ml-0.5" />
          </div>
        </button>
      </div>
      <div className="p-3 md:p-5">
        <span className="inline-block px-2 py-0.5 md:px-2.5 md:py-1 bg-primary/10 text-primary text-[10px] md:text-xs font-medium rounded-md mb-2 md:mb-3">
          {sectorName}
        </span>
        <h3 className="font-semibold text-card-foreground mb-1.5 md:mb-2 text-sm md:text-base line-clamp-2">
          {video.title}
        </h3>
        <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4 line-clamp-2">
          {video.description}
        </p>
        <Button
          variant={watched ? 'secondary' : 'accent'}
          className="w-full h-9 md:h-10 text-xs md:text-sm"
          onClick={() => onWatch(video)}
        >
          <Play className="w-3.5 h-3.5 md:w-4 md:h-4" />
          {watched ? 'Assistir Novamente' : 'Assistir'}
        </Button>
      </div>
    </div>
  );
}
