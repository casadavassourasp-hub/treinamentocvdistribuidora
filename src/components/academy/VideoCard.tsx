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
        <div className="absolute top-3 right-3 z-10">
          <div className="bg-green-500 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Assistido
          </div>
        </div>
      )}
      <div className="relative aspect-video bg-muted overflow-hidden">
        <img
          src={`https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`}
          alt={video.title}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${watched ? 'opacity-80' : ''}`}
        />
        <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center shadow-lg">
            <Play className="w-8 h-8 text-accent-foreground ml-1" />
          </div>
        </div>
      </div>
      <div className="p-5">
        <span className="inline-block px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-md mb-3">
          {sectorName}
        </span>
        <h3 className="font-semibold text-card-foreground mb-2 line-clamp-2">
          {video.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {video.description}
        </p>
        <Button
          variant={watched ? 'secondary' : 'accent'}
          className="w-full"
          onClick={() => onWatch(video)}
        >
          <Play className="w-4 h-4" />
          {watched ? 'Assistir Novamente' : 'Assistir Treinamento'}
        </Button>
      </div>
    </div>
  );
}
