import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowUpDown, Users, Flame, Trophy, Video, ChevronDown, ChevronRight, FolderOpen } from 'lucide-react';
import { DateRangeFilter, DateRange } from './DateRangeFilter';

interface SectorPoints {
  sector_id: string;
  sector_name: string;
  points: number;
  videos_watched: number;
}

interface EmployeeProgress {
  user_id: string;
  full_name: string | null;
  email: string | null;
  total_points: number;
  videos_watched: number;
  current_streak: number;
  longest_streak: number;
  sector_points: SectorPoints[];
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
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });

  useEffect(() => {
    const fetchEmployeeProgress = async () => {
      setLoading(true);

      // Fetch base data
      const [profilesResult, sectorsResult] = await Promise.all([
        supabase.from('profiles').select('id, full_name, email'),
        supabase.from('sectors').select('id, name'),
      ]);

      if (profilesResult.error) {
        console.error('Error fetching profiles:', profilesResult.error);
        setLoading(false);
        return;
      }

      const sectorsMap = new Map(sectorsResult.data?.map((s) => [s.id, s.name]));

      // If no date filter, use the aggregated tables for better performance
      if (!dateRange.from && !dateRange.to) {
        const [pointsResult, sectorPointsResult] = await Promise.all([
          supabase.from('user_points').select('user_id, total_points, videos_watched, current_streak, longest_streak'),
          supabase.from('user_sector_points').select('user_id, sector_id, points, videos_watched'),
        ]);

        const pointsMap = new Map(pointsResult.data?.map((p) => [p.user_id, p]));
        
        const userSectorPointsMap = new Map<string, SectorPoints[]>();
        sectorPointsResult.data?.forEach((sp) => {
          const existing = userSectorPointsMap.get(sp.user_id) || [];
          existing.push({
            sector_id: sp.sector_id,
            sector_name: sectorsMap.get(sp.sector_id) || 'Setor Desconhecido',
            points: sp.points ?? 0,
            videos_watched: sp.videos_watched ?? 0,
          });
          userSectorPointsMap.set(sp.user_id, existing);
        });

        const employeeData: EmployeeProgress[] = (profilesResult.data || []).map((profile) => {
          const userPoints = pointsMap.get(profile.id);
          const sectorPoints = userSectorPointsMap.get(profile.id) || [];
          sectorPoints.sort((a, b) => b.points - a.points);
          
          return {
            user_id: profile.id,
            full_name: profile.full_name,
            email: profile.email,
            total_points: userPoints?.total_points || 0,
            videos_watched: userPoints?.videos_watched || 0,
            current_streak: userPoints?.current_streak || 0,
            longest_streak: userPoints?.longest_streak || 0,
            sector_points: sectorPoints,
          };
        });

        setEmployees(employeeData);
      } else {
        // Date filter active - calculate from video_progress
        let query = supabase
          .from('video_progress')
          .select('user_id, video_id, watched_at, videos(sector_id)')
          .eq('watched', true);

        if (dateRange.from) {
          query = query.gte('watched_at', dateRange.from.toISOString());
        }
        if (dateRange.to) {
          const endOfDay = new Date(dateRange.to);
          endOfDay.setHours(23, 59, 59, 999);
          query = query.lte('watched_at', endOfDay.toISOString());
        }

        const progressResult = await query;

        if (progressResult.error) {
          console.error('Error fetching video progress:', progressResult.error);
          setLoading(false);
          return;
        }

        // Calculate points from video progress
        const userStatsMap = new Map<string, { points: number; videos: number; sectorStats: Map<string, { points: number; videos: number }> }>();

        (progressResult.data || []).forEach((progress) => {
          const userId = progress.user_id;
          const sectorId = (progress.videos as any)?.sector_id;
          
          if (!userStatsMap.has(userId)) {
            userStatsMap.set(userId, { points: 0, videos: 0, sectorStats: new Map() });
          }
          
          const userStats = userStatsMap.get(userId)!;
          userStats.points += 10; // 10 points per video
          userStats.videos += 1;

          if (sectorId) {
            if (!userStats.sectorStats.has(sectorId)) {
              userStats.sectorStats.set(sectorId, { points: 0, videos: 0 });
            }
            const sectorStats = userStats.sectorStats.get(sectorId)!;
            sectorStats.points += 10;
            sectorStats.videos += 1;
          }
        });

        // Get current streak info from user_points (not date-filtered)
        const pointsResult = await supabase
          .from('user_points')
          .select('user_id, current_streak, longest_streak');
        
        const streakMap = new Map(pointsResult.data?.map((p) => [p.user_id, { current: p.current_streak || 0, longest: p.longest_streak || 0 }]));

        const employeeData: EmployeeProgress[] = (profilesResult.data || []).map((profile) => {
          const userStats = userStatsMap.get(profile.id);
          const streakInfo = streakMap.get(profile.id);
          
          const sectorPoints: SectorPoints[] = [];
          if (userStats) {
            userStats.sectorStats.forEach((stats, sectorId) => {
              sectorPoints.push({
                sector_id: sectorId,
                sector_name: sectorsMap.get(sectorId) || 'Setor Desconhecido',
                points: stats.points,
                videos_watched: stats.videos,
              });
            });
            sectorPoints.sort((a, b) => b.points - a.points);
          }
          
          return {
            user_id: profile.id,
            full_name: profile.full_name,
            email: profile.email,
            total_points: userStats?.points || 0,
            videos_watched: userStats?.videos || 0,
            current_streak: streakInfo?.current || 0,
            longest_streak: streakInfo?.longest || 0,
            sector_points: sectorPoints,
          };
        });

        setEmployees(employeeData);
      }

      setLoading(false);
    };

    fetchEmployeeProgress();
  }, [dateRange]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const toggleRow = (userId: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-card-foreground">Relatório de Progresso</h2>
            <p className="text-sm text-muted-foreground">Acompanhe o desempenho de todos os funcionários</p>
          </div>
        </div>
        
        <DateRangeFilter dateRange={dateRange} onDateRangeChange={setDateRange} />
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
                <TableHead className="w-12"></TableHead>
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
              {sortedEmployees.map((employee, index) => {
                const isExpanded = expandedRows.has(employee.user_id);
                const hasSectorData = employee.sector_points.length > 0;

                return (
                  <>
                    <TableRow key={employee.user_id} className={hasSectorData ? 'cursor-pointer hover:bg-muted/50' : ''} onClick={() => hasSectorData && toggleRow(employee.user_id)}>
                      <TableCell className="w-12">
                        {hasSectorData && (
                          <span className="text-muted-foreground">
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </span>
                        )}
                      </TableCell>
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
                    
                    {/* Sector details row */}
                    {isExpanded && employee.sector_points.length > 0 && (
                      <TableRow key={`${employee.user_id}-sectors`} className="bg-muted/30">
                        <TableCell colSpan={7} className="py-3 px-8">
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                              Pontuação por Setor
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                              {employee.sector_points.map((sp) => (
                                <div
                                  key={sp.sector_id}
                                  className="flex items-center justify-between bg-card rounded-lg px-3 py-2 border border-border"
                                >
                                  <div className="flex items-center gap-2">
                                    <FolderOpen className="w-4 h-4 text-primary" />
                                    <span className="text-sm font-medium text-card-foreground">{sp.sector_name}</span>
                                  </div>
                                  <div className="flex items-center gap-3 text-xs">
                                    <span className="text-muted-foreground">{sp.videos_watched} vídeos</span>
                                    <span className="font-semibold text-yellow-500">{sp.points} pts</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
