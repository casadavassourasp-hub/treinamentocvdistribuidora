import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/academy/Sidebar';
import { VideoGrid } from '@/components/academy/VideoGrid';
import { VideoModal } from '@/components/academy/VideoModal';
import { AdminPanel } from '@/components/academy/AdminPanel';
import { Leaderboard } from '@/components/academy/Leaderboard';
import { AchievementBadges } from '@/components/academy/AchievementBadges';
import { UserStatsCard } from '@/components/academy/UserStatsCard';
import { useAcademy } from '@/hooks/useAcademy';
import { useAuth } from '@/hooks/useAuth';
import { useVideoProgress } from '@/hooks/useVideoProgress';
import { useGamification } from '@/hooks/useGamification';
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
    updateSector,
    deleteSector,
    addVideo,
    updateVideo,
    deleteVideo,
    getSectorName,
  } = useAcademy();
  
  const { isWatched, markAsWatched, getWatchedCount, loading: progressLoading } = useVideoProgress();
  const { 
    userPoints, 
    achievements, 
    userAchievements, 
    leaderboard,
    sectorLeaderboard,
    loading: gamificationLoading,
    getUserRank,
    fetchSectorLeaderboard,
    refetch: refetchGamification
  } = useGamification();

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

  const handleMarkWatched = async (videoId: string) => {
    await markAsWatched(videoId);
    // Refetch gamification data after watching a video
    setTimeout(() => refetchGamification(), 1000);
  };

  if (authLoading || dataLoading || progressLoading) {
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

  const unlockedAchievementIds = new Set(userAchievements.map((ua) => ua.achievement_id));

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
            <div className="space-y-6">
              {/* User Stats */}
              <UserStatsCard 
                userPoints={userPoints} 
                userRank={getUserRank()} 
                loading={gamificationLoading}
              />

              {/* Achievements */}
              <AchievementBadges 
                achievements={achievements} 
                unlockedIds={unlockedAchievementIds}
                loading={gamificationLoading}
              />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Videos Grid */}
                <div className="lg:col-span-2">
                  <VideoGrid
                    videos={videos}
                    getSectorName={getSectorName}
                    onWatch={setWatchingVideo}
                    isWatched={isWatched}
                    watchedCount={getWatchedCount()}
                    totalCount={allVideos.length}
                  />
                </div>

                {/* Leaderboard */}
                <div className="lg:col-span-1">
                  <Leaderboard 
                    entries={leaderboard} 
                    sectorEntries={sectorLeaderboard}
                    sectors={sectors}
                    loading={gamificationLoading}
                    onSectorChange={(sectorId) => {
                      if (sectorId) {
                        fetchSectorLeaderboard(sectorId);
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <AdminPanel
              sectors={sectors}
              videos={allVideos}
              videosCount={allVideos.length}
              selectedSectorId={selectedSectorId}
              onAddSector={addSector}
              onUpdateSector={updateSector}
              onDeleteSector={deleteSector}
              onAddVideo={addVideo}
              onUpdateVideo={updateVideo}
              onDeleteVideo={deleteVideo}
              getSectorName={getSectorName}
            />
          )}
        </section>
      </main>

      <VideoModal
        video={watchingVideo}
        sectorName={watchingVideo ? getSectorName(watchingVideo.sector_id) : ''}
        watched={watchingVideo ? isWatched(watchingVideo.id) : false}
        onClose={() => setWatchingVideo(null)}
        onMarkWatched={handleMarkWatched}
      />
    </div>
  );
};

export default Index;
