import { useState } from 'react';
import { Video } from '@/types/academy';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Trash2, Play, Search, X } from 'lucide-react';

interface VideoListProps {
  videos: Video[];
  getSectorName: (sectorId: string | null) => string;
  onEdit: (video: Video) => void;
  onDelete: (video: Video) => void;
}

export function VideoList({ videos, getSectorName, onEdit, onDelete }: VideoListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVideos = searchTerm.trim()
    ? videos.filter(v => 
        v.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : videos;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-semibold text-card-foreground">
          Vídeos Cadastrados ({filteredVideos.length}{searchTerm && ` de ${videos.length}`})
        </h3>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar vídeo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-9 h-9"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {filteredVideos.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          {searchTerm ? 'Nenhum vídeo encontrado para esta busca.' : 'Nenhum vídeo encontrado.'}
        </p>
      ) : (
        <div className="space-y-3">
          {filteredVideos.map((video) => (
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
