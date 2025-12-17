import { X } from 'lucide-react';
import { Video } from '@/types/academy';

interface VideoModalProps {
  video: Video | null;
  sectorName: string;
  onClose: () => void;
}

export function VideoModal({ video, sectorName, onClose }: VideoModalProps) {
  if (!video) return null;

  return (
    <div
      className="fixed inset-0 bg-foreground/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-card w-full max-w-4xl rounded-xl overflow-hidden shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-primary p-4 flex items-center justify-between">
          <div>
            <h3 className="text-primary-foreground font-semibold text-lg">
              {video.title}
            </h3>
            <span className="text-primary-foreground/70 text-sm">
              {sectorName}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-primary-foreground" />
          </button>
        </div>
        <div className="aspect-video bg-foreground">
          <iframe
            src={`https://www.youtube.com/embed/${video.youtube_id}?autoplay=1`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <div className="p-5 bg-card">
          <h4 className="font-semibold text-card-foreground mb-2">Descrição</h4>
          <p className="text-muted-foreground">{video.description}</p>
        </div>
      </div>
    </div>
  );
}
