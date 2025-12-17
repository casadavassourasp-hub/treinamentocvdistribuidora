import { useState } from 'react';
import { Sidebar } from '@/components/academy/Sidebar';
import { VideoGrid } from '@/components/academy/VideoGrid';
import { VideoModal } from '@/components/academy/VideoModal';
import { AdminPanel } from '@/components/academy/AdminPanel';
import { useAcademy } from '@/hooks/useAcademy';
import { Video } from '@/types/academy';
import { BookOpen, Settings } from 'lucide-react';

const Index = () => {
  const {
    sectors,
    videos,
    allVideos,
    viewMode,
    selectedSectorId,
    setViewMode,
    setSelectedSectorId,
    addSector,
    addVideo,
    getSectorName,
  } = useAcademy();

  const [watchingVideo, setWatchingVideo] = useState<Video | null>(null);

  const pageTitle = viewMode === 'employee' ? 'Meus Treinamentos' : 'Painel Administrativo';
  const PageIcon = viewMode === 'employee' ? BookOpen : Settings;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        sectors={sectors}
        viewMode={viewMode}
        selectedSectorId={selectedSectorId}
        onViewModeChange={setViewMode}
        onSectorSelect={setSelectedSectorId}
      />

      <main className="flex-1 flex flex-col">
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <PageIcon className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-card-foreground">{pageTitle}</h2>
          </div>
        </header>

        <section className="flex-1 p-6 overflow-y-auto">
          {viewMode === 'employee' ? (
            <VideoGrid
              videos={videos}
              getSectorName={getSectorName}
              onWatch={setWatchingVideo}
            />
          ) : (
            <AdminPanel
              sectors={sectors}
              videosCount={allVideos.length}
              onAddSector={addSector}
              onAddVideo={addVideo}
            />
          )}
        </section>
      </main>

      <VideoModal
        video={watchingVideo}
        sectorName={watchingVideo ? getSectorName(watchingVideo.sectorId) : ''}
        onClose={() => setWatchingVideo(null)}
      />
    </div>
  );
};

export default Index;
