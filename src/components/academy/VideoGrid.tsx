import { Video } from '@/types/academy';
import { VideoCard } from './VideoCard';
import { BookOpen, TrendingUp } from 'lucide-react';

interface VideoGridProps {
  videos: Video[];
  getSectorName: (sectorId: string | null) => string;
  onWatch: (video: Video) => void;
  isWatched?: (videoId: string) => boolean;
  watchedCount?: number;
  totalCount?: number;
}

export function VideoGrid({ 
  videos, 
  getSectorName, 
  onWatch, 
  isWatched,
  watchedCount = 0,
  totalCount = 0
}: VideoGridProps) {
  const progressPercentage = totalCount > 0 ? Math.round((watchedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Progress Summary */}
      {totalCount > 0 && (
        <div className="bg-card rounded-xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-card-foreground">Seu Progresso</p>
                <p className="text-sm text-muted-foreground">
                  {watchedCount} de {totalCount} treinamentos concluídos
                </p>
              </div>
            </div>
            <span className="text-2xl font-bold text-primary">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2.5">
            <div 
              className="bg-primary h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Videos Grid */}
      {videos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video, index) => (
            <div key={video.id} style={{ animationDelay: `${index * 50}ms` }}>
              <VideoCard
                video={video}
                sectorName={getSectorName(video.sector_id)}
                watched={isWatched?.(video.id) ?? false}
                onWatch={onWatch}
              />
            </div>
          ))}
        </div>
      ) : (
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
      )}
    </div>
  );
}
