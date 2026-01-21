import { useState, useEffect, useRef, useCallback } from 'react';
import { User, Settings, LogOut, FolderOpen, ChevronDown, ChevronRight, Users, PanelLeftClose, PanelLeft, PlayCircle, X, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sector, ViewMode, Video } from '@/types/academy';
import { Employee } from '@/hooks/useAcademy';
import { useIsMobile } from '@/hooks/use-mobile';
import logoCV from '@/assets/logo-cv-distribuidora.png';

export type AdminSection = 'sectors' | 'videos' | 'users' | null;

interface SidebarProps {
  sectors: Sector[];
  videos: Video[];
  employees: Employee[];
  viewMode: ViewMode;
  selectedSectorId: string | null;
  isAdmin: boolean;
  userName?: string;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onSectorSelect: (sectorId: string | null) => void;
  onEmployeeSelect?: (employee: Employee) => void;
  onAdminSectionSelect?: (section: AdminSection) => void;
  onLogout: () => void;
}

// Swipe detection hook with visual feedback
function useSwipeGesture(
  onSwipeLeft: () => void,
  onSwipeRight: () => void,
  enabled: boolean = true,
  sidebarOpen: boolean = false
) {
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const [swipeProgress, setSwipeProgress] = useState<number>(0);
  const [isSwipping, setIsSwipping] = useState(false);

  const minSwipeDistance = 50;
  const edgeThreshold = 30; // Only detect swipe from edge when sidebar is closed

  const onTouchStart = useCallback((e: TouchEvent) => {
    const startX = e.targetTouches[0].clientX;
    touchStartX.current = startX;
    touchStartY.current = e.targetTouches[0].clientY;
    
    // Only start tracking if: sidebar is open OR touch starts from left edge
    if (sidebarOpen || startX < edgeThreshold) {
      setIsSwipping(true);
    }
  }, [sidebarOpen]);

  const onTouchMove = useCallback((e: TouchEvent) => {
    if (!enabled || !isSwipping) return;
    
    const currentX = e.targetTouches[0].clientX;
    const deltaX = currentX - touchStartX.current;
    const deltaY = Math.abs(e.targetTouches[0].clientY - touchStartY.current);
    
    // Only track horizontal swipes
    if (Math.abs(deltaX) > deltaY) {
      // Calculate progress (0 to 1)
      const maxDistance = 150;
      let progress = deltaX / maxDistance;
      
      // If sidebar is open, we track left swipes (negative progress)
      // If sidebar is closed, we track right swipes (positive progress)
      if (sidebarOpen) {
        progress = Math.max(-1, Math.min(0, progress));
      } else {
        progress = Math.max(0, Math.min(1, progress));
      }
      
      setSwipeProgress(progress);
    }
  }, [enabled, isSwipping, sidebarOpen]);

  const onTouchEnd = useCallback(() => {
    if (!enabled || !isSwipping) {
      setIsSwipping(false);
      setSwipeProgress(0);
      return;
    }
    
    const deltaX = swipeProgress * 150;
    
    if (Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX < 0 && sidebarOpen) {
        onSwipeLeft();
      } else if (deltaX > 0 && !sidebarOpen) {
        onSwipeRight();
      }
    }
    
    setIsSwipping(false);
    setSwipeProgress(0);
  }, [enabled, isSwipping, swipeProgress, sidebarOpen, onSwipeLeft, onSwipeRight]);

  useEffect(() => {
    if (!enabled) return;
    
    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchend', onTouchEnd);

    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [enabled, onTouchStart, onTouchMove, onTouchEnd]);

  return { swipeProgress, isSwipping };
}

export function Sidebar({
  sectors,
  videos,
  employees,
  viewMode,
  selectedSectorId,
  isAdmin,
  userName,
  collapsed,
  onCollapsedChange,
  onViewModeChange,
  onSectorSelect,
  onEmployeeSelect,
  onAdminSectionSelect,
  onLogout
}: SidebarProps) {
  const [sectorsOpen, setSectorsOpen] = useState(true);
  const [employeesOpen, setEmployeesOpen] = useState(false);
  const [openSectorIds, setOpenSectorIds] = useState<Set<string>>(new Set());
  const isMobile = useIsMobile();

  // Swipe gestures for mobile with visual feedback
  const { swipeProgress, isSwipping } = useSwipeGesture(
    () => onCollapsedChange(true),  // Swipe left = close
    () => onCollapsedChange(false), // Swipe right = open
    isMobile,
    !collapsed
  );

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      onCollapsedChange(true);
    }
  }, [isMobile]);

  // Get videos for a specific sector, sorted by published_at (oldest first)
  const getVideosForSector = (sectorId: string) => {
    return videos
      .filter(v => v.sector_id === sectorId)
      .sort((a, b) => {
        const dateA = a.published_at || a.created_at;
        const dateB = b.published_at || b.created_at;
        return new Date(dateA).getTime() - new Date(dateB).getTime();
      });
  };

  // Toggle a sector's video list
  const toggleSectorVideos = (sectorId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenSectorIds(prev => {
      const next = new Set(prev);
      if (next.has(sectorId)) {
        next.delete(sectorId);
      } else {
        next.add(sectorId);
      }
      return next;
    });
  };

  // Filter only employees (not admins)
  const employeeList = employees.filter(e => e.role === 'employee');

  // Close sidebar when clicking on a navigation item on mobile
  const handleMobileNavigation = (action: () => void) => {
    action();
    if (isMobile) {
      onCollapsedChange(true);
    }
  };

  return (
    <>
      {/* Swipe indicator - edge glow when starting to swipe */}
      {isMobile && isSwipping && collapsed && swipeProgress > 0 && (
        <div 
          className="fixed left-0 top-0 h-full w-1 z-[55] pointer-events-none transition-opacity"
          style={{
            background: `linear-gradient(to right, hsl(var(--primary) / ${swipeProgress * 0.8}), transparent)`,
            boxShadow: `0 0 ${swipeProgress * 30}px ${swipeProgress * 15}px hsl(var(--primary) / ${swipeProgress * 0.4})`,
          }}
        />
      )}

      {/* Mobile overlay with dynamic opacity based on swipe */}
      {isMobile && (!collapsed || (isSwipping && swipeProgress > 0.3)) && (
        <div 
          className="fixed inset-0 bg-black z-40 transition-opacity duration-300"
          style={{
            opacity: collapsed 
              ? swipeProgress * 0.5 
              : isSwipping 
                ? 0.5 + (swipeProgress * 0.5) // swipeProgress is negative when closing
                : 0.5
          }}
          onClick={() => onCollapsedChange(true)}
        />
      )}

      {/* Toggle button */}
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => onCollapsedChange(!collapsed)}
              className={`fixed z-[60] p-2 md:p-2.5 rounded-lg shadow-lg transition-all duration-300 ease-out hover:scale-105 active:scale-95 ${
                isMobile 
                  ? collapsed 
                    ? 'left-3 top-3 bg-primary text-primary-foreground shadow-xl' 
                    : 'left-[200px] top-3 bg-card text-card-foreground border border-border'
                  : collapsed 
                    ? 'left-0 top-1/2 -translate-y-1/2 bg-sidebar text-sidebar-foreground rounded-l-none'
                    : 'left-[248px] top-20 bg-sidebar text-sidebar-foreground rounded-l-none'
              }`}
            >
              {isMobile ? (
                collapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />
              ) : (
                collapsed ? <PanelLeft className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="animate-scale-in hidden md:block">
            <p>{collapsed ? 'Abrir menu' : 'Fechar menu'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Sidebar */}
      <aside 
        className={`bg-sidebar text-sidebar-foreground flex flex-col min-h-screen transition-all duration-300 ease-out ${
          isMobile 
            ? `fixed top-0 left-0 h-full z-50 w-56 ${collapsed ? '-translate-x-full' : 'translate-x-0'} shadow-2xl`
            : collapsed 
              ? 'w-0 overflow-hidden' 
              : 'w-64'
        }`}
      >
        <div className={`flex flex-col items-center gap-1.5 md:gap-2 mb-3 md:mb-4 mt-2 p-4 md:p-5 transition-opacity duration-200 ${collapsed && !isMobile ? 'opacity-0' : 'opacity-100'}`}>
          <img src={logoCV} alt="CV Distribuidora" className="h-8 md:h-12 w-auto" />
          <h1 className="text-sm md:text-lg font-bold text-center leading-tight">Treinamento CV</h1>
        </div>

        <div className={`space-y-1.5 md:space-y-2 mb-6 md:mb-8 px-4 md:px-5 transition-opacity duration-200 ${collapsed && !isMobile ? 'opacity-0' : 'opacity-100'}`}>
          <Button 
            variant={viewMode === 'employee' ? 'sidebar-active' : 'sidebar'} 
            onClick={() => handleMobileNavigation(() => onViewModeChange('employee'))} 
            className="h-10 md:h-11 text-sm"
          >
            <User className="w-4 h-4 md:w-5 md:h-5 mr-2 transition-transform duration-200 group-hover:scale-110" />
            Funcionário
          </Button>
          {isAdmin && (
            <Button 
              variant={viewMode === 'admin' ? 'sidebar-active' : 'sidebar'} 
              onClick={() => handleMobileNavigation(() => onViewModeChange('admin'))} 
              className="h-10 md:h-11 text-sm"
            >
              <Settings className="w-4 h-4 md:w-5 md:h-5 mr-2 transition-transform duration-200 group-hover:scale-110" />
              Administrador
            </Button>
          )}
        </div>

        {viewMode === 'admin' && (
          <div className={`flex-1 space-y-1.5 md:space-y-2 px-4 md:px-5 overflow-y-auto transition-opacity duration-200 ${collapsed && !isMobile ? 'opacity-0' : 'opacity-100'}`}>
            {/* Collapsible Sectors Folder */}
            {/* Collapsible Sectors Folder */}
            <div>
              <button
                onClick={() => {
                  setSectorsOpen(!sectorsOpen);
                  onAdminSectionSelect?.('sectors');
                }}
                className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all duration-200"
              >
                {sectorsOpen ? (
                  <ChevronDown className="w-4 h-4 text-sidebar-muted" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-sidebar-muted" />
                )}
                <FolderOpen className="w-4 h-4 text-sidebar-muted" />
                <span>Setores</span>
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-sidebar-accent/50 text-sidebar-muted">
                  {sectors.length}
                </span>
              </button>
              
              {/* Sectors List */}
              <div className={`ml-4 mt-1 space-y-1 border-l border-sidebar-border pl-2 overflow-hidden transition-all duration-200 ${
                sectorsOpen ? 'max-h-[500px] opacity-100 overflow-y-auto' : 'max-h-0 opacity-0'
              }`}>
                {sectors.map(sector => {
                  const sectorVideos = getVideosForSector(sector.id);
                  const isSectorOpen = openSectorIds.has(sector.id);
                  
                  return (
                    <div key={sector.id}>
                      <button 
                        onClick={(e) => toggleSectorVideos(sector.id, e)} 
                        className={`w-full flex items-center gap-1 px-2 py-2 rounded-lg text-sm transition-all duration-200 group ${
                          selectedSectorId === sector.id 
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm' 
                            : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                        }`}
                      >
                        {isSectorOpen ? (
                          <ChevronDown className="w-3 h-3 text-sidebar-muted flex-shrink-0" />
                        ) : (
                          <ChevronRight className="w-3 h-3 text-sidebar-muted flex-shrink-0" />
                        )}
                        <span className="truncate flex-1 text-left">{sector.name}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                          selectedSectorId === sector.id 
                            ? 'bg-primary/20 text-primary' 
                            : 'bg-sidebar-accent/50 text-sidebar-muted'
                        }`}>
                          {sectorVideos.length}
                        </span>
                      </button>
                      
                      {/* Videos inside sector */}
                      <div className={`ml-4 mt-1 space-y-0.5 border-l border-sidebar-border/50 pl-2 overflow-hidden transition-all duration-200 ${
                        isSectorOpen ? 'max-h-[300px] opacity-100 overflow-y-auto' : 'max-h-0 opacity-0'
                      }`}>
                        {sectorVideos.length === 0 ? (
                          <p className="text-xs text-sidebar-muted px-2 py-1">Nenhum vídeo</p>
                        ) : (
                          sectorVideos.map(video => (
                            <div 
                              key={video.id} 
                              className="flex items-center gap-2 px-2 py-1.5 rounded text-xs text-sidebar-foreground/70"
                            >
                              <PlayCircle className="w-3 h-3 text-sidebar-muted flex-shrink-0" />
                              <span className="truncate">{video.title}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Collapsible Employees Folder */}
            <div>
              <button
                onClick={() => {
                  setEmployeesOpen(!employeesOpen);
                  onAdminSectionSelect?.('users');
                }}
                className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all duration-200"
              >
                {employeesOpen ? (
                  <ChevronDown className="w-4 h-4 text-sidebar-muted" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-sidebar-muted" />
                )}
                <Users className="w-4 h-4 text-sidebar-muted" />
                <span>Funcionários</span>
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-sidebar-accent/50 text-sidebar-muted">
                  {employeeList.length}
                </span>
              </button>
              
              {/* Employees List */}
              <div className={`ml-4 mt-1 space-y-1 border-l border-sidebar-border pl-2 overflow-hidden transition-all duration-200 ${
                employeesOpen ? 'max-h-48 opacity-100 overflow-y-auto' : 'max-h-0 opacity-0'
              }`}>
                {employeeList.length === 0 ? (
                  <p className="text-xs text-sidebar-muted px-3 py-2">Nenhum funcionário cadastrado</p>
                ) : (
                  employeeList.map(employee => (
                    <button 
                      key={employee.id}
                      onClick={() => handleMobileNavigation(() => onEmployeeSelect?.(employee))}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-all duration-200 text-left"
                    >
                      <User className="w-3 h-3 text-sidebar-muted flex-shrink-0" />
                      <span className="truncate text-xs">
                        {employee.full_name || employee.email || 'Sem nome'}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {viewMode === 'employee' && <div className="flex-1" />}

        <div className={`pt-3 md:pt-4 border-t border-sidebar-border mt-3 md:mt-4 space-y-2 md:space-y-3 px-4 md:px-5 pb-4 md:pb-5 transition-opacity duration-200 ${collapsed && !isMobile ? 'opacity-0' : 'opacity-100'}`}>
          {userName && (
            <p className="text-[10px] md:text-xs text-sidebar-muted text-center truncate">
              {userName}
            </p>
          )}
          
          <Button variant="sidebar" onClick={onLogout} className="h-9 md:h-10 text-xs md:text-sm hover:bg-destructive/10 hover:text-destructive">
            <LogOut className="w-3.5 h-3.5 md:w-4 md:h-4 mr-2 transition-transform duration-200 group-hover:scale-110" />
            Sair
          </Button>
        </div>
      </aside>
    </>
  );
}
