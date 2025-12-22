import { useState } from 'react';
import { Trophy, Medal, Award, Flame, User, Filter } from 'lucide-react';
import { LeaderboardEntry, SectorLeaderboardEntry } from '@/types/gamification';
import { useAuth } from '@/hooks/useAuth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sector } from '@/types/academy';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  sectorEntries: SectorLeaderboardEntry[];
  sectors: Sector[];
  loading?: boolean;
  onSectorChange: (sectorId: string | null) => void;
}

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy className="w-5 h-5 text-yellow-500" />;
    case 2:
      return <Medal className="w-5 h-5 text-gray-400" />;
    case 3:
      return <Award className="w-5 h-5 text-amber-600" />;
    default:
      return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">{rank}</span>;
  }
};

const getRankBg = (rank: number, isCurrentUser: boolean) => {
  if (isCurrentUser) return 'bg-primary/10 border-primary/30';
  switch (rank) {
    case 1:
      return 'bg-yellow-500/10 border-yellow-500/30';
    case 2:
      return 'bg-gray-400/10 border-gray-400/30';
    case 3:
      return 'bg-amber-600/10 border-amber-600/30';
    default:
      return 'bg-card border-border';
  }
};

export function Leaderboard({ entries, sectorEntries, sectors, loading, onSectorChange }: LeaderboardProps) {
  const { user } = useAuth();
  const [selectedSector, setSelectedSector] = useState<string>('all');

  const handleSectorChange = (value: string) => {
    setSelectedSector(value);
    onSectorChange(value === 'all' ? null : value);
  };

  const displayEntries = selectedSector === 'all' 
    ? entries.map(e => ({ ...e, points: e.total_points }))
    : sectorEntries;

  if (loading) {
    return (
      <div className="bg-card rounded-xl p-5 shadow-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Trophy className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-semibold text-card-foreground">Ranking</h3>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-5 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Trophy className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-card-foreground">Ranking</h3>
            <p className="text-xs text-muted-foreground">Top 10 funcionários</p>
          </div>
        </div>

        <Select value={selectedSector} onValueChange={handleSectorChange}>
          <SelectTrigger className="w-36 h-8 text-xs">
            <Filter className="w-3 h-3 mr-1" />
            <SelectValue placeholder="Filtrar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Geral</SelectItem>
            {sectors.map((sector) => (
              <SelectItem key={sector.id} value={sector.id}>
                {sector.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {displayEntries.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          {selectedSector === 'all' 
            ? 'Nenhum participante ainda. Seja o primeiro!'
            : 'Nenhum participante neste setor ainda.'}
        </p>
      ) : (
        <div className="space-y-2">
          {displayEntries.map((entry) => {
            const isCurrentUser = user?.id === entry.user_id;
            const displayName = entry.full_name || entry.email?.split('@')[0] || 'Usuário';

            return (
              <div
                key={entry.user_id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${getRankBg(entry.rank, isCurrentUser)}`}
              >
                <div className="w-8 flex justify-center">{getRankIcon(entry.rank)}</div>

                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-card-foreground truncate">
                    {displayName}
                    {isCurrentUser && <span className="text-primary ml-1">(você)</span>}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{entry.videos_watched} vídeos</span>
                    {'current_streak' in entry && entry.current_streak > 0 && (
                      <span className="flex items-center gap-0.5">
                        <Flame className="w-3 h-3 text-orange-500" />
                        {entry.current_streak}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-bold text-primary">{entry.points}</p>
                  <p className="text-xs text-muted-foreground">pts</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
