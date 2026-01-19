import { Video, Sector } from '@/types/academy';
import { VideoCard } from './VideoCard';
import { VideoAccordion } from './VideoAccordion';
import { BookOpen, TrendingUp } from 'lucide-react';

interface VideoGridProps {
  videos: Video[];
  sectors: Sector[];
  selectedSectorId: string | null;
  getSectorName: (sectorId: string | null) => string;
  onWatch: (video: Video) => void;
  isWatched?: (videoId: string) => boolean;
  watchedCount?: number;
  totalCount?: number;
}

export function VideoGrid({ 
  videos, 
  sectors,
  selectedSectorId,
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
        <div className="bg-card rounded-xl p-4 md:p-5 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm md:text-base font-semibold text-card-foreground">Seu Progresso</p>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {watchedCount} de {totalCount} treinamentos concluídos
                </p>
              </div>
            </div>
            <span className="text-xl md:text-2xl font-bold text-primary">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2.5">
            <div 
              className="bg-primary h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Videos Display */}
      {videos.length > 0 ? (
        selectedSectorId === null ? (
          // Accordion view when "Todos os setores" is selected
          <VideoAccordion
            videos={videos}
            sectors={sectors}
            getSectorName={getSectorName}
            onWatch={onWatch}
            isWatched={isWatched}
          />
        ) : (
          // Grid view when a specific sector is selected
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
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
        )
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
