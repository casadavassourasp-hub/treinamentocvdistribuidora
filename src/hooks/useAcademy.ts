import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Sector, Video, ViewMode } from '@/types/academy';
import { useToast } from '@/hooks/use-toast';
import { handleDatabaseError } from '@/lib/errorHandler';

export interface Employee {
  id: string;
  email: string | null;
  full_name: string | null;
  role: 'admin' | 'employee';
}

export function useAcademy() {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('employee');
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSectors();
    fetchVideos();
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      // Fetch profiles with their roles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .order('full_name');

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      const rolesMap = new Map(roles?.map(r => [r.user_id, r.role]) || []);

      const employeesWithRoles: Employee[] = (profiles || []).map(p => ({
        id: p.id,
        email: p.email,
        full_name: p.full_name,
        role: (rolesMap.get(p.id) as 'admin' | 'employee') || 'employee'
      }));

      setEmployees(employeesWithRoles);
    } catch (error: any) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchSectors = async () => {
    try {
      const { data, error } = await supabase
        .from('sectors')
        .select('*')
        .order('name');

      if (error) throw error;
      setSectors(data || []);
    } catch (error: any) {
      console.error('Error fetching sectors:', error);
      toast({ title: 'Erro ao carregar setores', variant: 'destructive' });
    }
  };

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setVideos(data || []);
    } catch (error: any) {
      console.error('Error fetching videos:', error);
      toast({ title: 'Erro ao carregar vídeos', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const addSector = async (name: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('sectors')
        .insert({ name, created_by: userData.user?.id })
        .select()
        .single();

      if (error) throw error;
      
      setSectors((prev) => [...prev, data]);
      toast({ title: 'Setor criado com sucesso!' });
      return { error: null };
    } catch (error: any) {
      const safeMessage = handleDatabaseError(error, 'addSector');
      toast({ title: 'Erro ao criar setor', description: safeMessage, variant: 'destructive' });
      return { error };
    }
  };

  const updateSector = async (id: string, name: string) => {
    try {
      const { error } = await supabase
        .from('sectors')
        .update({ name })
        .eq('id', id);

      if (error) throw error;
      
      setSectors((prev) => prev.map((s) => s.id === id ? { ...s, name } : s));
      toast({ title: 'Setor atualizado com sucesso!' });
      return { error: null };
    } catch (error: any) {
      const safeMessage = handleDatabaseError(error, 'updateSector');
      toast({ title: 'Erro ao atualizar setor', description: safeMessage, variant: 'destructive' });
      return { error };
    }
  };

  const deleteSector = async (id: string) => {
    try {
      const { error } = await supabase
        .from('sectors')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setSectors((prev) => prev.filter((s) => s.id !== id));
      toast({ title: 'Setor excluído com sucesso!' });
      return { error: null };
    } catch (error: any) {
      const safeMessage = handleDatabaseError(error, 'deleteSector');
      toast({ title: 'Erro ao excluir setor', description: safeMessage, variant: 'destructive' });
      return { error };
    }
  };

  const addVideo = async (video: { title: string; description: string; sector_id: string; youtube_id: string }) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('videos')
        .insert({ ...video, created_by: userData.user?.id })
        .select()
        .single();

      if (error) throw error;
      
      setVideos((prev) => [...prev, data]);
      toast({ title: 'Vídeo adicionado com sucesso!' });
      return { error: null };
    } catch (error: any) {
      const safeMessage = handleDatabaseError(error, 'addVideo');
      toast({ title: 'Erro ao adicionar vídeo', description: safeMessage, variant: 'destructive' });
      return { error };
    }
  };

  const updateVideo = async (id: string, data: { title: string; description: string; sector_id: string; youtube_id: string }) => {
    try {
      const { error } = await supabase
        .from('videos')
        .update(data)
        .eq('id', id);

      if (error) throw error;
      
      setVideos((prev) => prev.map((v) => v.id === id ? { ...v, ...data } : v));
      toast({ title: 'Vídeo atualizado com sucesso!' });
      return { error: null };
    } catch (error: any) {
      const safeMessage = handleDatabaseError(error, 'updateVideo');
      toast({ title: 'Erro ao atualizar vídeo', description: safeMessage, variant: 'destructive' });
      return { error };
    }
  };

  const deleteVideo = async (id: string) => {
    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setVideos((prev) => prev.filter((v) => v.id !== id));
      toast({ title: 'Vídeo excluído com sucesso!' });
      return { error: null };
    } catch (error: any) {
      const safeMessage = handleDatabaseError(error, 'deleteVideo');
      toast({ title: 'Erro ao excluir vídeo', description: safeMessage, variant: 'destructive' });
      return { error };
    }
  };

  const filteredVideos = selectedSectorId
    ? videos.filter((v) => v.sector_id === selectedSectorId)
    : videos;

  const getSectorName = (sectorId: string | null) => {
    if (!sectorId) return '';
    return sectors.find((s) => s.id === sectorId)?.name || '';
  };

  return {
    sectors,
    videos: filteredVideos,
    allVideos: videos,
    employees,
    viewMode,
    selectedSectorId,
    loading,
    setViewMode,
    setSelectedSectorId,
    addSector,
    updateSector,
    deleteSector,
    addVideo,
    updateVideo,
    deleteVideo,
    getSectorName,
    refetchSectors: fetchSectors,
    refetchVideos: fetchVideos,
    refetchEmployees: fetchEmployees,
  };
}
