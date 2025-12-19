import { Achievement } from '@/types/gamification';
import { 
  Play, TrendingUp, Award, Star, FolderCheck, 
  Flame, Zap, Trophy, Lock 
} from 'lucide-react';

interface AchievementBadgesProps {
  achievements: Achievement[];
  unlockedIds: Set<string>;
  loading?: boolean;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  play: Play,
  'trending-up': TrendingUp,
  award: Award,
  star: Star,
  'folder-check': FolderCheck,
  flame: Flame,
  zap: Zap,
  trophy: Trophy,
};

const colorMap: Record<string, string> = {
  green: 'bg-green-500/20 text-green-500 border-green-500/30',
  blue: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
  purple: 'bg-purple-500/20 text-purple-500 border-purple-500/30',
  yellow: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
  cyan: 'bg-cyan-500/20 text-cyan-500 border-cyan-500/30',
  orange: 'bg-orange-500/20 text-orange-500 border-orange-500/30',
  red: 'bg-red-500/20 text-red-500 border-red-500/30',
  gold: 'bg-amber-500/20 text-amber-500 border-amber-500/30',
  primary: 'bg-primary/20 text-primary border-primary/30',
};

export function AchievementBadges({ achievements, unlockedIds, loading }: AchievementBadgesProps) {
  if (loading) {
    return (
      <div className="bg-card rounded-xl p-5 shadow-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Award className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-semibold text-card-foreground">Conquistas</h3>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const unlockedCount = achievements.filter((a) => unlockedIds.has(a.id)).length;

  return (
    <div className="bg-card rounded-xl p-5 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Award className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-card-foreground">Conquistas</h3>
            <p className="text-xs text-muted-foreground">
              {unlockedCount} de {achievements.length} desbloqueadas
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-4 gap-3">
        {achievements.map((achievement) => {
          const isUnlocked = unlockedIds.has(achievement.id);
          const IconComponent = iconMap[achievement.icon] || Award;
          const colorClass = colorMap[achievement.badge_color] || colorMap.primary;

          return (
            <div
              key={achievement.id}
              className={`relative flex flex-col items-center p-3 rounded-lg border transition-all ${
                isUnlocked 
                  ? colorClass 
                  : 'bg-muted/50 text-muted-foreground border-border opacity-50'
              }`}
              title={`${achievement.name}: ${achievement.description}`}
            >
              {!isUnlocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-lg">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
              <IconComponent className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-medium text-center leading-tight">
                {achievement.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
