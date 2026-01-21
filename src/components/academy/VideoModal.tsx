import { useEffect, useState } from 'react';
import { X, CheckCircle, Loader2 } from 'lucide-react';
import { Video } from '@/types/academy';

interface VideoModalProps {
  video: Video | null;
  sectorName: string;
  watched?: boolean;
  onClose: () => void;
  onMarkWatched?: (videoId: string) => void;
}

export function VideoModal({ video, sectorName, watched = false, onClose, onMarkWatched }: VideoModalProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (video) {
      setIsLoading(true);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [video]);

  useEffect(() => {
    if (video && onMarkWatched) {
      // Mark as watched after 5 seconds of viewing
      const timer = setTimeout(() => {
        onMarkWatched(video.id);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [video, onMarkWatched]);

  if (!video) return null;

  return (
    <div
      className="fixed inset-0 bg-foreground/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 md:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-card w-full max-w-4xl max-h-[95vh] md:max-h-[90vh] rounded-xl overflow-hidden shadow-2xl animate-scale-in flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-primary p-3 md:p-4 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
            <div className="min-w-0 flex-1">
              <h3 className="text-primary-foreground font-semibold text-sm md:text-lg truncate">
                {video.title}
              </h3>
              <span className="text-primary-foreground/70 text-xs md:text-sm">
                {sectorName}
              </span>
            </div>
            {watched && (
              <div className="bg-green-500 text-white px-1.5 py-0.5 md:px-2 md:py-1 rounded-md text-[10px] md:text-xs font-medium flex items-center gap-1 shrink-0">
                <CheckCircle className="w-2.5 h-2.5 md:w-3 md:h-3" />
                <span className="hidden sm:inline">Assistido</span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 active:bg-primary-foreground/30 flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-4 h-4 md:w-5 md:h-5 text-primary-foreground" />
          </button>
        </div>

        {/* Video Player */}
        <div className="aspect-video bg-foreground relative shrink-0">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-foreground z-10">
              <div className="flex flex-col items-center gap-2 md:gap-3">
                <Loader2 className="w-8 h-8 md:w-12 md:h-12 text-primary animate-spin" />
                <span className="text-primary-foreground/70 text-xs md:text-sm">Carregando vídeo...</span>
              </div>
            </div>
          )}
          <iframe
            src={`https://www.youtube.com/embed/${video.youtube_id}?autoplay=1&playsinline=1`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={() => setIsLoading(false)}
          />
        </div>

        {/* Description - scrollable on mobile */}
        <div className="p-3 md:p-5 bg-card overflow-y-auto flex-1 min-h-0">
          <h4 className="font-semibold text-card-foreground text-sm md:text-base mb-1.5 md:mb-2">Descrição</h4>
          <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">{video.description}</p>
        </div>
      </div>
    </div>
  );
}