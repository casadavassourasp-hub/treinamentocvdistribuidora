import { useState, useEffect, useRef } from 'react';
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
import { Plus, Video as VideoIcon, FolderPlus, Users, Pencil, Trash2, BarChart3, ChevronDown, ChevronRight, Play } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AdminSection } from './Sidebar';

interface AdminPanelProps {
  sectors: Sector[];
  videos: Video[];
  videosCount: number;
  selectedSectorId: string | null;
  activeSection?: AdminSection;
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
  activeSection,
  onAddSector, 
  onUpdateSector,
  onDeleteSector,
  onAddVideo,
  onUpdateVideo,
  onDeleteVideo,
  getSectorName 
}: AdminPanelProps) {
  const sectorsRef = useRef<HTMLDivElement>(null);
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
  const [videosListOpen, setVideosListOpen] = useState(false);
  const [openSectorIds, setOpenSectorIds] = useState<Set<string>>(new Set());

  // Get videos grouped by sector
  const getVideosForSector = (sectorId: string) => {
    return videos.filter(v => v.sector_id === sectorId);
  };

  // Toggle a sector's video list
  const toggleSectorVideos = (sectorId: string) => {
    setOpenSectorIds(prev => {
      const next = new Set(prev);
      if (next.has(sectorId)) {
        next.delete(sectorId);
      } else {
        next.add(sectorId);
      }
      return next;
    });
  };

  useEffect(() => {
    fetchUsersCount();
  }, []);

  // Scroll to sectors section when activeSection is 'sectors'
  useEffect(() => {
    if (activeSection === 'sectors' && sectorsRef.current) {
      sectorsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeSection]);

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
      <div ref={sectorsRef} className="bg-card rounded-xl p-6 shadow-card scroll-mt-6">
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

      {/* Videos List - Organized by Sector */}
      <div className="bg-card rounded-xl shadow-card overflow-hidden">
        <button
          onClick={() => setVideosListOpen(!videosListOpen)}
          className="w-full flex items-center gap-3 p-6 text-left hover:bg-muted/50 transition-colors"
        >
          {videosListOpen ? (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          )}
          <VideoIcon className="w-5 h-5 text-primary" />
          <span className="font-semibold text-card-foreground">Vídeos Cadastrados</span>
          <span className="ml-auto text-sm px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            {videos.length}
          </span>
        </button>
        
        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
          videosListOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="px-6 pb-6 space-y-2">
            {sectors.map(sector => {
              const sectorVideos = getVideosForSector(sector.id);
              const isSectorOpen = openSectorIds.has(sector.id);
              
              return (
                <div key={sector.id} className="border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSectorVideos(sector.id)}
                    className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/50 transition-colors bg-muted/30"
                  >
                    {isSectorOpen ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                    <FolderPlus className="w-4 h-4 text-primary" />
                    <span className="font-medium text-card-foreground">{sector.name}</span>
                    <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {sectorVideos.length} vídeo{sectorVideos.length !== 1 ? 's' : ''}
                    </span>
                  </button>
                  
                  <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isSectorOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    <div className="p-3 space-y-2 bg-background">
                      {sectorVideos.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Nenhum vídeo neste setor
                        </p>
                      ) : (
                        sectorVideos.map(video => (
                          <div
                            key={video.id}
                            className="flex items-center gap-3 p-3 bg-muted rounded-lg group"
                          >
                            <div className="relative w-20 h-12 bg-muted-foreground/20 rounded overflow-hidden flex-shrink-0">
                              <img
                                src={`https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`}
                                alt={video.title}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-background/30">
                                <Play className="w-5 h-5 text-foreground" />
                              </div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-card-foreground text-sm truncate">{video.title}</h4>
                            </div>
                            
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditingVideo(video)}
                                className="h-7 w-7"
                              >
                                <Pencil className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeletingVideo(video)}
                                className="h-7 w-7 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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
