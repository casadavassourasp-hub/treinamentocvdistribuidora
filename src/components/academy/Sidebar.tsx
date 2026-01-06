import { User, Settings, FolderOpen, LogOut, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sector, ViewMode, Video } from '@/types/academy';
import logoCV from '@/assets/logo-cv-distribuidora.png';

interface SidebarProps {
  sectors: Sector[];
  videos: Video[];
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
  viewMode,
  selectedSectorId,
  isAdmin,
  userName,
  onViewModeChange,
  onSectorSelect,
  onLogout
}: SidebarProps) {
  // Count videos per sector
  const getVideoCount = (sectorId: string | null) => {
    if (sectorId === null) return videos.length;
    return videos.filter(v => v.sector_id === sectorId).length;
  };

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

      <div className="flex-1">
        <div className="flex items-center gap-2 mb-3">
          <FolderOpen className="w-4 h-4 text-sidebar-muted" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-sidebar-muted">
            Setores
          </h3>
        </div>
        <div className="space-y-1">
          <button 
            onClick={() => onSectorSelect(null)} 
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 group ${
              selectedSectorId === null 
                ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm' 
                : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:translate-x-1 hover:text-sidebar-foreground hover:shadow-sm'
            }`}
          >
            <span className="flex items-center gap-2">
              {selectedSectorId === null && <Check className="w-4 h-4 text-primary transition-transform duration-200 group-hover:scale-110" />}
              Todos os setores
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              selectedSectorId === null 
                ? 'bg-primary/20 text-primary' 
                : 'bg-sidebar-accent/50 text-sidebar-muted'
            }`}>
              {getVideoCount(null)}
            </span>
          </button>
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
              <span className="flex items-center gap-2 truncate">
                {selectedSectorId === sector.id && <Check className="w-4 h-4 text-primary flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />}
                <span className="truncate">{sector.name}</span>
              </span>
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
      </div>

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