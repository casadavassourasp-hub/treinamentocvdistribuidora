import { Video } from '@/types/academy';
import { VideoCard } from './VideoCard';
import { BookOpen } from 'lucide-react';

interface VideoGridProps {
  videos: Video[];
  getSectorName: (sectorId: string | null) => string;
  onWatch: (video: Video) => void;
}

export function VideoGrid({ videos, getSectorName, onWatch }: VideoGridProps) {
  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
          <BookOpen className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Nenhum treinamento encontrado
        </h3>
        <p className="text-muted-foreground max-w-md">
          Não há treinamentos disponíveis para este setor no momento. Selecione outro setor ou aguarde novos conteúdos.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video, index) => (
        <div key={video.id} style={{ animationDelay: `${index * 50}ms` }}>
          <VideoCard
            video={video}
            sectorName={getSectorName(video.sector_id)}
            onWatch={onWatch}
          />
        </div>
      ))}
    </div>
  );
}
