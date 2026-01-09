import { useState } from 'react';
import { X, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sector } from '@/types/academy';
import { extractYoutubeId } from '@/lib/errorHandler';
import { toast } from 'sonner';

interface AddVideoModalProps {
  sectors: Sector[];
  onClose: () => void;
  onSave: (video: { title: string; description: string; sector_id: string; youtube_id: string }) => void;
}

export function AddVideoModal({ sectors, onClose, onSave }: AddVideoModalProps) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [sectorId, setSectorId] = useState(sectors[0]?.id || '');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const youtube_id = extractYoutubeId(url);
    
    if (!youtube_id) {
      toast.error('URL do YouTube inválida. Verifique o link e tente novamente.');
      return;
    }
    
    if (title.trim() && sectorId) {
      onSave({
        title: title.trim(),
        description: description.trim(),
        sector_id: sectorId,
        youtube_id,
      });
    }
  };

  return (
    <div
      className="fixed inset-0 bg-foreground/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-card w-full max-w-lg rounded-xl overflow-hidden shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-primary p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Video className="w-5 h-5 text-primary-foreground" />
            <h3 className="text-primary-foreground font-semibold text-lg">Novo Vídeo</h3>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-primary-foreground" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Título do Vídeo
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Introdução ao CRM"
              className="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              URL do YouTube
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Setor
            </label>
            <select
              value={sectorId}
              onChange={(e) => setSectorId(e.target.value)}
              className="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {sectors.map((sector) => (
                <option key={sector.id} value={sector.id}>
                  {sector.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o conteúdo do treinamento..."
              rows={3}
              className="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              Salvar Vídeo
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
