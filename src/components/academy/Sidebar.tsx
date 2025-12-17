import { GraduationCap, User, Settings, FolderOpen, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sector, ViewMode } from '@/types/academy';

interface SidebarProps {
  sectors: Sector[];
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
  viewMode,
  selectedSectorId,
  isAdmin,
  userName,
  onViewModeChange,
  onSectorSelect,
  onLogout,
}: SidebarProps) {
  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground p-5 flex flex-col min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
          <GraduationCap className="w-6 h-6 text-accent-foreground" />
        </div>
        <h1 className="text-xl font-bold">Empresa Academy</h1>
      </div>

      <div className="space-y-2 mb-8">
        <Button
          variant={viewMode === 'employee' ? 'sidebar-active' : 'sidebar'}
          onClick={() => onViewModeChange('employee')}
          className="h-11"
        >
          <User className="w-5 h-5 mr-2" />
          Funcionário
        </Button>
        {isAdmin && (
          <Button
            variant={viewMode === 'admin' ? 'sidebar-active' : 'sidebar'}
            onClick={() => onViewModeChange('admin')}
            className="h-11"
          >
            <Settings className="w-5 h-5 mr-2" />
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
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              selectedSectorId === null
                ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50'
            }`}
          >
            Todos os setores
          </button>
          {sectors.map((sector) => (
            <button
              key={sector.id}
              onClick={() => onSectorSelect(sector.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedSectorId === sector.id
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                  : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50'
              }`}
            >
              {sector.name}
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
        <Button
          variant="sidebar"
          onClick={onLogout}
          className="h-10 text-sm"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      </div>
    </aside>
  );
}
