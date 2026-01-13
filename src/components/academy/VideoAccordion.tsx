import { Video, Sector } from '@/types/academy';
import { VideoCard } from './VideoCard';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Folder, CheckCircle } from 'lucide-react';

interface VideoAccordionProps {
  videos: Video[];
  sectors: Sector[];
  getSectorName: (sectorId: string | null) => string;
  onWatch: (video: Video) => void;
  isWatched?: (videoId: string) => boolean;
}

export function VideoAccordion({
  videos,
  sectors,
  getSectorName,
  onWatch,
  isWatched,
}: VideoAccordionProps) {
  // Group videos by sector
  const videosBySector = sectors
    .map((sector) => {
      const sectorVideos = videos
        .filter((v) => v.sector_id === sector.id)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      const watchedCount = sectorVideos.filter((v) => isWatched?.(v.id)).length;
      return {
        sector,
        videos: sectorVideos,
        watchedCount,
        totalCount: sectorVideos.length,
      };
    })
    .filter((group) => group.videos.length > 0);

  // Find the first sector with unwatched videos to set as default open
  const defaultOpen = videosBySector.find(
    (group) => group.watchedCount < group.totalCount
  )?.sector.id;

  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={defaultOpen}
      className="space-y-3"
    >
      {videosBySector.map((group) => {
        const progressPercentage =
          group.totalCount > 0
            ? Math.round((group.watchedCount / group.totalCount) * 100)
            : 0;
        const isComplete = group.watchedCount === group.totalCount;

        return (
          <AccordionItem
            key={group.sector.id}
            value={group.sector.id}
            className="border rounded-xl bg-card shadow-card overflow-hidden"
          >
            <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between w-full pr-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isComplete
                        ? 'bg-green-500/10 text-green-500'
                        : 'bg-primary/10 text-primary'
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Folder className="w-5 h-5" />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-card-foreground">
                      {group.sector.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {group.watchedCount} de {group.totalCount} assistidos
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-muted rounded-full h-2 hidden sm:block">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        isComplete ? 'bg-green-500' : 'bg-primary'
                      }`}
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      isComplete ? 'text-green-500' : 'text-primary'
                    }`}
                  >
                    {progressPercentage}%
                  </span>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {group.videos.map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    sectorName={getSectorName(video.sector_id)}
                    watched={isWatched?.(video.id) ?? false}
                    onWatch={onWatch}
                  />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
