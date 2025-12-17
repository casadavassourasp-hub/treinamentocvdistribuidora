import { useState } from 'react';
import { Plus, FolderPlus, Video, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sector } from '@/types/academy';
import { AddSectorModal } from './AddSectorModal';
import { AddVideoModal } from './AddVideoModal';

interface AdminPanelProps {
  sectors: Sector[];
  videosCount: number;
  onAddSector: (name: string) => Promise<{ error: any }>;
  onAddVideo: (video: { title: string; description: string; sector_id: string; youtube_id: string }) => Promise<{ error: any }>;
}

export function AdminPanel({ sectors, videosCount, onAddSector, onAddVideo }: AdminPanelProps) {
  const [showSectorModal, setShowSectorModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl p-5 shadow-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Video className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{videosCount}</p>
              <p className="text-sm text-muted-foreground">Vídeos cadastrados</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-5 shadow-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
              <FolderPlus className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{sectors.length}</p>
              <p className="text-sm text-muted-foreground">Setores ativos</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-5 shadow-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">--</p>
              <p className="text-sm text-muted-foreground">Funcionários</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-card rounded-xl p-6 shadow-card">
        <h3 className="font-semibold text-card-foreground mb-4">Gerenciar Conteúdo</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="accent" onClick={() => setShowSectorModal(true)}>
            <Plus className="w-4 h-4" />
            Novo Setor
          </Button>
          <Button onClick={() => setShowVideoModal(true)}>
            <Plus className="w-4 h-4" />
            Novo Vídeo
          </Button>
        </div>
      </div>

      {/* Sectors List */}
      <div className="bg-card rounded-xl p-6 shadow-card">
        <h3 className="font-semibold text-card-foreground mb-4">Setores Cadastrados</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sectors.map((sector) => (
            <div
              key={sector.id}
              className="flex items-center gap-3 p-3 bg-muted rounded-lg"
            >
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <FolderPlus className="w-4 h-4 text-primary" />
              </div>
              <span className="font-medium text-card-foreground">{sector.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {showSectorModal && (
        <AddSectorModal
          onClose={() => setShowSectorModal(false)}
          onSave={async (name) => {
            await onAddSector(name);
            setShowSectorModal(false);
          }}
        />
      )}
      {showVideoModal && (
        <AddVideoModal
          sectors={sectors}
          onClose={() => setShowVideoModal(false)}
          onSave={async (video) => {
            await onAddVideo(video);
            setShowVideoModal(false);
          }}
        />
      )}
    </div>
  );
}
