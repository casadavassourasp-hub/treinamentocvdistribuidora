import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy, Video, Flame, FolderOpen, User } from 'lucide-react';
import { Employee } from '@/hooks/useAcademy';

interface SectorPoints {
  sector_id: string;
  sector_name: string;
  points: number;
  videos_watched: number;
}

interface EmployeeData {
  total_points: number;
  videos_watched: number;
  current_streak: number;
  longest_streak: number;
  sector_points: SectorPoints[];
}

interface EmployeeDetailProps {
  employee: Employee;
  onBack: () => void;
}

export function EmployeeDetail({ employee, onBack }: EmployeeDetailProps) {
  const [data, setData] = useState<EmployeeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      setLoading(true);

      const [pointsResult, sectorPointsResult, sectorsResult] = await Promise.all([
        supabase
          .from('user_points')
          .select('total_points, videos_watched, current_streak, longest_streak')
          .eq('user_id', employee.id)
          .maybeSingle(),
        supabase
          .from('user_sector_points')
          .select('sector_id, points, videos_watched')
          .eq('user_id', employee.id),
        supabase.from('sectors').select('id, name'),
      ]);

      const sectorsMap = new Map(sectorsResult.data?.map((s) => [s.id, s.name]));

      const sectorPoints: SectorPoints[] = (sectorPointsResult.data || []).map((sp) => ({
        sector_id: sp.sector_id,
        sector_name: sectorsMap.get(sp.sector_id) || 'Setor Desconhecido',
        points: sp.points ?? 0,
        videos_watched: sp.videos_watched ?? 0,
      }));

      sectorPoints.sort((a, b) => b.points - a.points);

      setData({
        total_points: pointsResult.data?.total_points || 0,
        videos_watched: pointsResult.data?.videos_watched || 0,
        current_streak: pointsResult.data?.current_streak || 0,
        longest_streak: pointsResult.data?.longest_streak || 0,
        sector_points: sectorPoints,
      });

      setLoading(false);
    };

    fetchEmployeeData();
  }, [employee.id]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-card-foreground">
              {employee.full_name || 'Sem nome'}
            </h2>
            <p className="text-sm text-muted-foreground">{employee.email}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando...</div>
      ) : data ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card rounded-xl p-5 shadow-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-card-foreground">{data.total_points}</p>
                  <p className="text-xs text-muted-foreground">Pontos</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl p-5 shadow-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <Video className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-card-foreground">{data.videos_watched}</p>
                  <p className="text-xs text-muted-foreground">Vídeos</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl p-5 shadow-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                  <Flame className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-card-foreground">{data.current_streak}d</p>
                  <p className="text-xs text-muted-foreground">Streak Atual</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl p-5 shadow-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <Flame className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-card-foreground">{data.longest_streak}d</p>
                  <p className="text-xs text-muted-foreground">Melhor Streak</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sector Points */}
          <div className="bg-card rounded-xl p-6 shadow-card">
            <h3 className="font-semibold text-card-foreground mb-4">Progresso por Setor</h3>
            
            {data.sector_points.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhum progresso registrado ainda
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.sector_points.map((sp) => (
                  <div
                    key={sp.sector_id}
                    className="flex items-center justify-between bg-muted rounded-lg px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <FolderOpen className="w-5 h-5 text-primary" />
                      <span className="font-medium text-card-foreground">{sp.sector_name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">{sp.videos_watched} vídeos</span>
                      <span className="font-semibold text-yellow-500">{sp.points} pts</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          Erro ao carregar dados do funcionário
        </div>
      )}
    </div>
  );
}
