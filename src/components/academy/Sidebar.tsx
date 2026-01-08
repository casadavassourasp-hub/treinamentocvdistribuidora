import { useState } from 'react';
import { User, Settings, LogOut, FolderOpen, ChevronDown, ChevronRight, Users, PanelLeftClose, PanelLeft, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sector, ViewMode, Video } from '@/types/academy';
import { Employee } from '@/hooks/useAcademy';
import logoCV from '@/assets/logo-cv-distribuidora.png';

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
  onLogout: () => void;
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
  onLogout
}: SidebarProps) {
  const [sectorsOpen, setSectorsOpen] = useState(true);
  const [employeesOpen, setEmployeesOpen] = useState(false);
  const [openSectorIds, setOpenSectorIds] = useState<Set<string>>(new Set());

  // Get videos for a specific sector
  const getVideosForSector = (sectorId: string) => {
    return videos.filter(v => v.sector_id === sectorId);
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

  return (
    <>
      {/* Toggle button when collapsed */}
      {collapsed && (
        <button
          onClick={() => onCollapsedChange(false)}
          className="fixed left-0 top-4 z-50 bg-sidebar text-sidebar-foreground p-2 rounded-r-lg shadow-lg hover:bg-sidebar-accent/50 transition-all duration-200"
        >
          <PanelLeft className="w-5 h-5" />
        </button>
      )}

      {/* Sidebar */}
      <aside 
        className={`bg-sidebar text-sidebar-foreground p-5 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
          collapsed ? 'w-0 p-0 overflow-hidden opacity-0' : 'w-64 opacity-100'
        }`}
      >
        {/* Collapse button - left side */}
        <button
          onClick={() => onCollapsedChange(true)}
          className="absolute left-2 top-2 p-1.5 rounded-lg text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all duration-200"
          title="Fechar menu"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center gap-2 mb-8 mt-4">
          <img src={logoCV} alt="CV Distribuidora" className="h-12 w-auto" />
          <h1 className="text-lg font-bold text-center leading-tight">Treinamento CV Distribuidora</h1>
        </div>

        <div className="space-y-2 mb-8">
          <Button 
            variant={viewMode === 'employee' ? 'sidebar-active' : 'sidebar'} 
            onClick={() => onViewModeChange('employee')} 
            className="h-11"
          >
            <User className="w-5 h-5 mr-2 transition-transform duration-200 group-hover:scale-110" />
            Funcionário
          </Button>
          {isAdmin && (
            <Button 
              variant={viewMode === 'admin' ? 'sidebar-active' : 'sidebar'} 
              onClick={() => onViewModeChange('admin')} 
              className="h-11"
            >
              <Settings className="w-5 h-5 mr-2 transition-transform duration-200 group-hover:scale-110" />
              Administrador
            </Button>
          )}
        </div>

        {/* Admin folders - only shown for admin mode */}
        {viewMode === 'admin' && (
          <div className="flex-1 space-y-2">
            {/* Collapsible Sectors Folder */}
            <div>
              <button
                onClick={() => setSectorsOpen(!sectorsOpen)}
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
                onClick={() => setEmployeesOpen(!employeesOpen)}
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
                      onClick={() => onEmployeeSelect?.(employee)}
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

        {/* Spacer for employee mode */}
        {viewMode === 'employee' && <div className="flex-1" />}

        <div className="pt-4 border-t border-sidebar-border mt-4 space-y-3">
          {userName && (
            <p className="text-xs text-sidebar-muted text-center truncate">
              {userName}
            </p>
          )}
          <Button variant="sidebar" onClick={onLogout} className="h-10 text-sm hover:bg-destructive/10 hover:text-destructive">
            <LogOut className="w-4 h-4 mr-2 transition-transform duration-200 group-hover:scale-110" />
            Sair
          </Button>
        </div>
      </aside>
    </>
  );
}
