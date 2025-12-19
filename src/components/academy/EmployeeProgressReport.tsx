import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowUpDown, Users, Flame, Trophy, Video } from 'lucide-react';

interface EmployeeProgress {
  user_id: string;
  full_name: string | null;
  email: string | null;
  total_points: number;
  videos_watched: number;
  current_streak: number;
  longest_streak: number;
}

interface EmployeeProgressReportProps {
  onBack: () => void;
}

type SortField = 'name' | 'points' | 'videos' | 'streak';
type SortDirection = 'asc' | 'desc';

export function EmployeeProgressReport({ onBack }: EmployeeProgressReportProps) {
  const [employees, setEmployees] = useState<EmployeeProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('points');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  useEffect(() => {
    const fetchEmployeeProgress = async () => {
      setLoading(true);

      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email');

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        setLoading(false);
        return;
      }

      // Fetch all user points
      const { data: points, error: pointsError } = await supabase
        .from('user_points')
        .select('user_id, total_points, videos_watched, current_streak, longest_streak');

      if (pointsError) {
        console.error('Error fetching points:', pointsError);
        setLoading(false);
        return;
      }

      const pointsMap = new Map(points?.map((p) => [p.user_id, p]));

      const employeeData: EmployeeProgress[] = (profiles || []).map((profile) => {
        const userPoints = pointsMap.get(profile.id);
        return {
          user_id: profile.id,
          full_name: profile.full_name,
          email: profile.email,
          total_points: userPoints?.total_points || 0,
          videos_watched: userPoints?.videos_watched || 0,
          current_streak: userPoints?.current_streak || 0,
          longest_streak: userPoints?.longest_streak || 0,
        };
      });

      setEmployees(employeeData);
      setLoading(false);
    };

    fetchEmployeeProgress();
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedEmployees = [...employees].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case 'name':
        comparison = (a.full_name || a.email || '').localeCompare(b.full_name || b.email || '');
        break;
      case 'points':
        comparison = a.total_points - b.total_points;
        break;
      case 'videos':
        comparison = a.videos_watched - b.videos_watched;
        break;
      case 'streak':
        comparison = a.current_streak - b.current_streak;
        break;
    }
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const totalPoints = employees.reduce((sum, e) => sum + e.total_points, 0);
  const totalVideos = employees.reduce((sum, e) => sum + e.videos_watched, 0);
  const avgStreak = employees.length > 0 
    ? Math.round(employees.reduce((sum, e) => sum + e.current_streak, 0) / employees.length) 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-xl font-bold text-card-foreground">Relatório de Progresso</h2>
          <p className="text-sm text-muted-foreground">Acompanhe o desempenho de todos os funcionários</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{employees.length}</p>
              <p className="text-xs text-muted-foreground">Funcionários</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
              <Trophy className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{totalPoints}</p>
              <p className="text-xs text-muted-foreground">Pontos Totais</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
              <Video className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{totalVideos}</p>
              <p className="text-xs text-muted-foreground">Vídeos Assistidos</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{avgStreak}d</p>
              <p className="text-xs text-muted-foreground">Streak Médio</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl shadow-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Carregando...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    Nome
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('points')}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    Pontos
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('videos')}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    Vídeos
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('streak')}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    Streak
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </TableHead>
                <TableHead>Melhor Streak</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedEmployees.map((employee, index) => (
                <TableRow key={employee.user_id}>
                  <TableCell className="font-medium text-muted-foreground">
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-card-foreground">
                        {employee.full_name || 'Sem nome'}
                      </p>
                      <p className="text-xs text-muted-foreground">{employee.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-yellow-500">{employee.total_points}</span>
                  </TableCell>
                  <TableCell>{employee.videos_watched}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1">
                      {employee.current_streak > 0 && (
                        <Flame className="w-4 h-4 text-orange-500" />
                      )}
                      {employee.current_streak}d
                    </span>
                  </TableCell>
                  <TableCell>{employee.longest_streak}d</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
