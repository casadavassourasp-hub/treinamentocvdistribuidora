import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';
import { Sector, Video } from '@/types/academy';
import { extractYoutubeId } from '@/lib/errorHandler';
import { toast } from 'sonner';

interface EditVideoModalProps {
  video: Video;
  sectors: Sector[];
  onClose: () => void;
  onSave: (id: string, data: { title: string; description: string; sector_id: string; youtube_id: string }) => Promise<{ error: any }>;
}

export function EditVideoModal({ video, sectors, onClose, onSave }: EditVideoModalProps) {
  const [title, setTitle] = useState(video.title);
  const [url, setUrl] = useState(`https://youtube.com/watch?v=${video.youtube_id}`);
  const [sectorId, setSectorId] = useState(video.sector_id || '');
  const [description, setDescription] = useState(video.description || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const youtubeId = extractYoutubeId(url);
    
    if (!youtubeId) {
      toast.error('URL do YouTube inválida. Verifique o link e tente novamente.');
      return;
    }
    
    if (!title || !sectorId) return;
    
    setLoading(true);
    const result = await onSave(video.id, { title, description, sector_id: sectorId, youtube_id: youtubeId });
    setLoading(false);
    
    if (!result.error) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl shadow-lg w-full max-w-lg">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold text-card-foreground">Editar Vídeo</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-card-foreground mb-1 block">Título</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título do vídeo"
              required
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-card-foreground mb-1 block">URL do YouTube</label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              required
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-card-foreground mb-1 block">Setor</label>
            <select
              value={sectorId}
              onChange={(e) => setSectorId(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-input bg-background text-foreground"
              required
            >
              <option value="">Selecione um setor</option>
              {sectors.map((sector) => (
                <option key={sector.id} value={sector.id}>{sector.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="text-sm font-medium text-card-foreground mb-1 block">Descrição</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição do vídeo"
              rows={3}
            />
          </div>
          
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
