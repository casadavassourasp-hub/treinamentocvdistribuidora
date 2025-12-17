import { useState } from 'react';
import { X, FolderPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AddSectorModalProps {
  onClose: () => void;
  onSave: (name: string) => void;
}

export function AddSectorModal({ onClose, onSave }: AddSectorModalProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim());
    }
  };

  return (
    <div
      className="fixed inset-0 bg-foreground/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-card w-full max-w-md rounded-xl overflow-hidden shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-accent p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FolderPlus className="w-5 h-5 text-accent-foreground" />
            <h3 className="text-accent-foreground font-semibold text-lg">Novo Setor</h3>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg bg-accent-foreground/10 hover:bg-accent-foreground/20 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-accent-foreground" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Nome do Setor
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Marketing, RH, TI..."
              className="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              autoFocus
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="accent">
              Salvar Setor
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
