import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/academy/Sidebar';
import { VideoGrid } from '@/components/academy/VideoGrid';
import { VideoModal } from '@/components/academy/VideoModal';
import { AdminPanel } from '@/components/academy/AdminPanel';
import { useAcademy } from '@/hooks/useAcademy';
import { useAuth } from '@/hooks/useAuth';
import { Video } from '@/types/academy';
import { BookOpen, Settings, Loader2 } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const {
    sectors,
    videos,
    allVideos,
    viewMode,
    selectedSectorId,
    loading: dataLoading,
    setViewMode,
    setSelectedSectorId,
    addSector,
    addVideo,
    getSectorName,
  } = useAcademy();

  const [watchingVideo, setWatchingVideo] = useState<Video | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [authLoading, user, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const pageTitle = viewMode === 'employee' ? 'Meus Treinamentos' : 'Painel Administrativo';
  const PageIcon = viewMode === 'employee' ? BookOpen : Settings;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        sectors={sectors}
        viewMode={viewMode}
        selectedSectorId={selectedSectorId}
        isAdmin={isAdmin}
        userName={user.email || undefined}
        onViewModeChange={setViewMode}
        onSectorSelect={setSelectedSectorId}
        onLogout={handleLogout}
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
        sectorName={watchingVideo ? getSectorName(watchingVideo.sector_id) : ''}
        onClose={() => setWatchingVideo(null)}
      />
    </div>
  );
};

export default Index;
