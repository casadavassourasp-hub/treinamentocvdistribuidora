import { Video } from '@/types/academy';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Play } from 'lucide-react';

interface VideoListProps {
  videos: Video[];
  getSectorName: (sectorId: string | null) => string;
  onEdit: (video: Video) => void;
  onDelete: (video: Video) => void;
}

export function VideoList({ videos, getSectorName, onEdit, onDelete }: VideoListProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-card-foreground">Vídeos Cadastrados ({videos.length})</h3>

      {videos.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">Nenhum vídeo encontrado.</p>
      ) : (
        <div className="space-y-3">
          {videos.map((video) => (
            <div
              key={video.id}
              className="flex items-center gap-4 p-3 bg-muted rounded-lg group"
            >
              <div className="relative w-24 h-14 bg-muted-foreground/20 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={`https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-background/30">
                  <Play className="w-6 h-6 text-foreground" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-card-foreground truncate">{video.title}</h4>
                <p className="text-sm text-muted-foreground truncate">
                  {getSectorName(video.sector_id) || 'Sem setor'}
                </p>
              </div>
              
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(video)}
                  className="h-8 w-8"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(video)}
                  className="h-8 w-8 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
