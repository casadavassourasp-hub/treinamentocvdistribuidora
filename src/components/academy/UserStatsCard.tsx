import { UserPoints } from '@/types/gamification';
import { Star, Flame, Target, TrendingUp } from 'lucide-react';

interface UserStatsCardProps {
  userPoints: UserPoints | null;
  userRank: number | null;
  loading?: boolean;
}

export function UserStatsCard({ userPoints, userRank, loading }: UserStatsCardProps) {
  if (loading) {
    return (
      <div className="bg-card rounded-xl p-5 shadow-card">
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  const stats = [
    {
      icon: Star,
      label: 'Pontos',
      value: userPoints?.total_points || 0,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      icon: Target,
      label: 'Vídeos',
      value: userPoints?.videos_watched || 0,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: Flame,
      label: 'Streak',
      value: userPoints?.current_streak || 0,
      suffix: 'd',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      icon: TrendingUp,
      label: 'Ranking',
      value: userRank || '-',
      prefix: '#',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
  ];

  return (
    <div className="bg-card rounded-xl p-5 shadow-card">
      <h3 className="font-semibold text-card-foreground mb-4">Suas Estatísticas</h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`flex flex-col items-center p-3 rounded-lg ${stat.bgColor}`}
          >
            <stat.icon className={`w-5 h-5 ${stat.color} mb-1`} />
            <span className={`text-xl font-bold ${stat.color}`}>
              {stat.prefix}
              {stat.value}
              {stat.suffix}
            </span>
            <span className="text-xs text-muted-foreground">{stat.label}</span>
          </div>
        ))}
      </div>

      {userPoints && userPoints.longest_streak > 0 && (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Melhor streak: <span className="font-semibold text-orange-500">{userPoints.longest_streak} dias</span>
          </p>
        </div>
      )}
    </div>
  );
}
