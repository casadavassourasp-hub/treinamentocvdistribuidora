import { useState } from 'react';
import { User, Settings, LogOut, FolderOpen, ChevronDown, ChevronRight, Users } from 'lucide-react';
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
  onViewModeChange: (mode: ViewMode) => void;
  onSectorSelect: (sectorId: string | null) => void;
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
  onViewModeChange,
  onSectorSelect,
  onLogout
}: SidebarProps) {
  const [sectorsOpen, setSectorsOpen] = useState(true);
  const [employeesOpen, setEmployeesOpen] = useState(false);

  // Count videos per sector - only used in admin mode
  const getVideoCount = (sectorId: string) => {
    return videos.filter(v => v.sector_id === sectorId).length;
  };

  // Filter only employees (not admins)
  const employeeList = employees.filter(e => e.role === 'employee');

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground p-5 flex flex-col min-h-screen">
      <div className="flex flex-col items-center gap-2 mb-8">
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
            {sectorsOpen && (
              <div className="ml-4 mt-1 space-y-1 border-l border-sidebar-border pl-2">
                {sectors.map(sector => (
                  <button 
                    key={sector.id} 
                    onClick={() => onSectorSelect(sector.id)} 
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 group ${
                      selectedSectorId === sector.id 
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm' 
                        : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:translate-x-1 hover:text-sidebar-foreground hover:shadow-sm'
                    }`}
                  >
                    <span className="truncate">{sector.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                      selectedSectorId === sector.id 
                        ? 'bg-primary/20 text-primary' 
                        : 'bg-sidebar-accent/50 text-sidebar-muted'
                    }`}>
                      {getVideoCount(sector.id)}
                    </span>
                  </button>
                ))}
              </div>
            )}
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
            {employeesOpen && (
              <div className="ml-4 mt-1 space-y-1 border-l border-sidebar-border pl-2 max-h-48 overflow-y-auto">
                {employeeList.length === 0 ? (
                  <p className="text-xs text-sidebar-muted px-3 py-2">Nenhum funcionário cadastrado</p>
                ) : (
                  employeeList.map(employee => (
                    <div 
                      key={employee.id} 
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/80"
                    >
                      <User className="w-3 h-3 text-sidebar-muted flex-shrink-0" />
                      <span className="truncate text-xs">
                        {employee.full_name || employee.email || 'Sem nome'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
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
  );
}
