import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AddSectorModal } from './AddSectorModal';
import { AddVideoModal } from './AddVideoModal';
import { EditVideoModal } from './EditVideoModal';
import { EditSectorModal } from './EditSectorModal';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { UserManagement } from './UserManagement';
import { VideoList } from './VideoList';
import { EmployeeProgressReport } from './EmployeeProgressReport';
import { Sector, Video } from '@/types/academy';
import { Plus, Video as VideoIcon, FolderPlus, Users, Pencil, Trash2, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AdminPanelProps {
  sectors: Sector[];
  videos: Video[];
  videosCount: number;
  selectedSectorId: string | null;
  onAddSector: (name: string) => Promise<{ error: any }>;
  onUpdateSector: (id: string, name: string) => Promise<{ error: any }>;
  onDeleteSector: (id: string) => Promise<{ error: any }>;
  onAddVideo: (video: { title: string; description: string; sector_id: string; youtube_id: string }) => Promise<{ error: any }>;
  onUpdateVideo: (id: string, data: { title: string; description: string; sector_id: string; youtube_id: string }) => Promise<{ error: any }>;
  onDeleteVideo: (id: string) => Promise<{ error: any }>;
  getSectorName: (sectorId: string | null) => string;
}

export function AdminPanel({ 
  sectors, 
  videos,
  videosCount, 
  selectedSectorId,
  onAddSector, 
  onUpdateSector,
  onDeleteSector,
  onAddVideo,
  onUpdateVideo,
  onDeleteVideo,
  getSectorName 
}: AdminPanelProps) {
  // Filter videos based on selected sector
  const filteredVideos = selectedSectorId 
    ? videos.filter(v => v.sector_id === selectedSectorId)
    : videos;
  const [showSectorModal, setShowSectorModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showProgressReport, setShowProgressReport] = useState(false);
  const [usersCount, setUsersCount] = useState(0);
  
  // Edit/Delete state
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [editingSector, setEditingSector] = useState<Sector | null>(null);
  const [deletingVideo, setDeletingVideo] = useState<Video | null>(null);
  const [deletingSector, setDeletingSector] = useState<Sector | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchUsersCount();
  }, []);

  const fetchUsersCount = async () => {
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    setUsersCount(count || 0);
  };

  const handleDeleteVideo = async () => {
    if (!deletingVideo) return;
    setDeleteLoading(true);
    await onDeleteVideo(deletingVideo.id);
    setDeleteLoading(false);
    setDeletingVideo(null);
  };

  const handleDeleteSector = async () => {
    if (!deletingSector) return;
    setDeleteLoading(true);
    await onDeleteSector(deletingSector.id);
    setDeleteLoading(false);
    setDeletingSector(null);
  };

  if (showProgressReport) {
    return <EmployeeProgressReport onBack={() => setShowProgressReport(false)} />;
  }

  if (showUserManagement) {
    return <UserManagement onBack={() => setShowUserManagement(false)} />;
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl p-5 shadow-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <VideoIcon className="w-6 h-6 text-primary" />
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
        <button
          onClick={() => setShowUserManagement(true)}
          className="bg-card rounded-xl p-5 shadow-card text-left hover:ring-2 hover:ring-primary/20 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{usersCount}</p>
              <p className="text-sm text-muted-foreground">Funcionários</p>
            </div>
          </div>
        </button>
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
          <Button variant="secondary" onClick={() => setShowUserManagement(true)}>
            <Users className="w-4 h-4" />
            Gerenciar Usuários
          </Button>
          <Button variant="outline" onClick={() => setShowProgressReport(true)}>
            <BarChart3 className="w-4 h-4" />
            Relatório de Progresso
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
              className="flex items-center gap-3 p-3 bg-muted rounded-lg group"
            >
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <FolderPlus className="w-4 h-4 text-primary" />
              </div>
              <span className="font-medium text-card-foreground flex-1">{sector.name}</span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditingSector(sector)}
                  className="h-7 w-7"
                >
                  <Pencil className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeletingSector(sector)}
                  className="h-7 w-7 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Videos List */}
      <div className="bg-card rounded-xl p-6 shadow-card">
        <VideoList
          videos={filteredVideos}
          getSectorName={getSectorName}
          onEdit={setEditingVideo}
          onDelete={setDeletingVideo}
        />
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
      {editingVideo && (
        <EditVideoModal
          video={editingVideo}
          sectors={sectors}
          onClose={() => setEditingVideo(null)}
          onSave={onUpdateVideo}
        />
      )}
      {editingSector && (
        <EditSectorModal
          sector={editingSector}
          onClose={() => setEditingSector(null)}
          onSave={onUpdateSector}
        />
      )}
      {deletingVideo && (
        <DeleteConfirmDialog
          title="Excluir Vídeo"
          description="Tem certeza que deseja excluir este vídeo? Esta ação não pode ser desfeita."
          itemName={deletingVideo.title}
          onConfirm={handleDeleteVideo}
          onCancel={() => setDeletingVideo(null)}
          loading={deleteLoading}
        />
      )}
      {deletingSector && (
        <DeleteConfirmDialog
          title="Excluir Setor"
          description="Tem certeza que deseja excluir este setor? Os vídeos vinculados a ele ficarão sem setor."
          itemName={deletingSector.name}
          onConfirm={handleDeleteSector}
          onCancel={() => setDeletingSector(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
