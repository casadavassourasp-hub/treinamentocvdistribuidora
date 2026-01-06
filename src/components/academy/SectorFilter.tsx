import { Sector, Video } from '@/types/academy';
import { FolderOpen, Check } from 'lucide-react';

interface SectorFilterProps {
  sectors: Sector[];
  videos: Video[];
  selectedSectorId: string | null;
  onSectorSelect: (sectorId: string | null) => void;
}

export function SectorFilter({
  sectors,
  videos,
  selectedSectorId,
  onSectorSelect
}: SectorFilterProps) {
  const getVideoCount = (sectorId: string | null) => {
    if (sectorId === null) return videos.length;
    return videos.filter(v => v.sector_id === sectorId).length;
  };

  return (
    <div className="bg-card rounded-xl p-5 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <FolderOpen className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-card-foreground">Filtrar por Setor</h3>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <button 
          onClick={() => onSectorSelect(null)} 
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
            selectedSectorId === null 
              ? 'bg-primary text-primary-foreground font-medium shadow-md' 
              : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
          }`}
        >
          {selectedSectorId === null && <Check className="w-4 h-4" />}
          <span>Todos</span>
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
            selectedSectorId === null 
              ? 'bg-primary-foreground/20 text-primary-foreground' 
              : 'bg-background text-muted-foreground'
          }`}>
            {getVideoCount(null)}
          </span>
        </button>
        
        {sectors.map(sector => (
          <button 
            key={sector.id} 
            onClick={() => onSectorSelect(sector.id)} 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
              selectedSectorId === sector.id 
                ? 'bg-primary text-primary-foreground font-medium shadow-md' 
                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
            }`}
          >
            {selectedSectorId === sector.id && <Check className="w-4 h-4" />}
            <span className="truncate max-w-[150px]">{sector.name}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              selectedSectorId === sector.id 
                ? 'bg-primary-foreground/20 text-primary-foreground' 
                : 'bg-background text-muted-foreground'
            }`}>
              {getVideoCount(sector.id)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
