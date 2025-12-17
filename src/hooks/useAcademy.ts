import { useState } from 'react';
import { Sector, Video, ViewMode } from '@/types/academy';

const initialSectors: Sector[] = [
  { id: 1, name: 'Televendas' },
  { id: 2, name: 'Estoque' },
  { id: 3, name: 'Financeiro' },
];

const initialVideos: Video[] = [
  {
    id: 1,
    title: 'Técnicas de Vendas por Telefone',
    description: 'Aprenda as melhores técnicas para converter leads em vendas através do telefone.',
    sectorId: 1,
    youtubeId: 'dQw4w9WgXcQ',
  },
  {
    id: 2,
    title: 'Gestão de Estoque Eficiente',
    description: 'Como organizar e gerenciar seu estoque para maximizar a eficiência operacional.',
    sectorId: 2,
    youtubeId: 'dQw4w9WgXcQ',
  },
  {
    id: 3,
    title: 'Atendimento ao Cliente',
    description: 'Estratégias para um atendimento excepcional que fideliza clientes.',
    sectorId: 1,
    youtubeId: 'dQw4w9WgXcQ',
  },
];

export function useAcademy() {
  const [sectors, setSectors] = useState<Sector[]>(initialSectors);
  const [videos, setVideos] = useState<Video[]>(initialVideos);
  const [viewMode, setViewMode] = useState<ViewMode>('employee');
  const [selectedSectorId, setSelectedSectorId] = useState<number | null>(null);

  const addSector = (name: string) => {
    const newSector: Sector = {
      id: Date.now(),
      name,
    };
    setSectors((prev) => [...prev, newSector]);
  };

  const addVideo = (video: Omit<Video, 'id'>) => {
    const newVideo: Video = {
      ...video,
      id: Date.now(),
    };
    setVideos((prev) => [...prev, newVideo]);
  };

  const filteredVideos = selectedSectorId
    ? videos.filter((v) => v.sectorId === selectedSectorId)
    : videos;

  const getSectorName = (sectorId: number) => {
    return sectors.find((s) => s.id === sectorId)?.name || '';
  };

  return {
    sectors,
    videos: filteredVideos,
    allVideos: videos,
    viewMode,
    selectedSectorId,
    setViewMode,
    setSelectedSectorId,
    addSector,
    addVideo,
    getSectorName,
  };
}
