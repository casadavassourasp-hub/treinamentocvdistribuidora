import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, AdminSection } from '@/components/academy/Sidebar';
import { VideoGrid } from '@/components/academy/VideoGrid';
import { VideoModal } from '@/components/academy/VideoModal';
import { AdminPanel } from '@/components/academy/AdminPanel';
import { Leaderboard } from '@/components/academy/Leaderboard';
import { AchievementBadges } from '@/components/academy/AchievementBadges';
import { UserStatsCard } from '@/components/academy/UserStatsCard';
import { SectorFilter } from '@/components/academy/SectorFilter';
import { EmployeeDetail } from '@/components/academy/EmployeeDetail';
import { useAcademy, Employee } from '@/hooks/useAcademy';
import { useAuth } from '@/hooks/useAuth';
import { useVideoProgress } from '@/hooks/useVideoProgress';
import { useGamification } from '@/hooks/useGamification';
import { Video } from '@/types/academy';
import { BookOpen, Settings, Loader2 } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

const Index = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const {
    sectors,
    videos,
    allVideos,
    employees,
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
    refetchVideos,
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [adminSection, setAdminSection] = useState<AdminSection>(null);

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
        videos={allVideos}
        employees={employees}
        viewMode={viewMode}
        selectedSectorId={selectedSectorId}
        isAdmin={isAdmin}
        userName={user.email || undefined}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
        onViewModeChange={(mode) => {
          setViewMode(mode);
          setSelectedEmployee(null);
          setAdminSection(null);
        }}
        onSectorSelect={setSelectedSectorId}
        onEmployeeSelect={setSelectedEmployee}
        onAdminSectionSelect={(section) => {
          setAdminSection(section);
          setSelectedEmployee(null);
        }}
        onLogout={handleLogout}
      />

      <main className="flex-1 flex flex-col min-w-0">
        <header className="bg-card border-b border-border px-3 md:px-6 py-2.5 md:py-4 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 ml-10 md:ml-0">
              <PageIcon className="w-4 h-4 md:w-6 md:h-6 text-primary" />
              <h2 className="text-base md:text-xl font-bold text-card-foreground truncate">{pageTitle}</h2>
            </div>
            <ThemeToggle />
          </div>
        </header>

        <section className="flex-1 p-3 md:p-6 overflow-y-auto">
          {viewMode === 'employee' ? (
            <div className="space-y-3 md:space-y-6">
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

              {/* Sector Filter */}
              <SectorFilter
                sectors={sectors}
                videos={allVideos}
                selectedSectorId={selectedSectorId}
                onSectorSelect={setSelectedSectorId}
              />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                {/* Videos Grid */}
                <div className="lg:col-span-2">
                  <VideoGrid
                    videos={videos}
                    sectors={sectors}
                    selectedSectorId={selectedSectorId}
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
          ) : selectedEmployee ? (
            <EmployeeDetail
              employee={selectedEmployee}
              onBack={() => setSelectedEmployee(null)}
            />
          ) : (
            <AdminPanel
              sectors={sectors}
              videos={allVideos}
              videosCount={allVideos.length}
              selectedSectorId={selectedSectorId}
              activeSection={adminSection}
              onAddSector={addSector}
              onUpdateSector={updateSector}
              onDeleteSector={deleteSector}
              onAddVideo={addVideo}
              onUpdateVideo={updateVideo}
              onDeleteVideo={deleteVideo}
              getSectorName={getSectorName}
              onRefreshVideos={refetchVideos}
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
