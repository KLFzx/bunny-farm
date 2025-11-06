import { Achievement, ACHIEVEMENTS } from '@/data/achievements';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useGame } from '@/contexts/GameContext';

interface AchievementsModalProps {
  open: boolean;
  onClose: () => void;
  unlockedAchievements: string[];
}

export const AchievementsModal = ({ open, onClose, unlockedAchievements }: AchievementsModalProps) => {
  const { gameState } = useGame();
  const categories = {
    all: ACHIEVEMENTS,
    rabbits: ACHIEVEMENTS.filter(a => a.category === 'rabbits'),
    coins: ACHIEVEMENTS.filter(a => a.category === 'coins'),
    days: ACHIEVEMENTS.filter(a => a.category === 'days'),
    resources: ACHIEVEMENTS.filter(a => a.category === 'resources'),
    upgrades: ACHIEVEMENTS.filter(a => a.category === 'upgrades'),
  };

  const completionPercentage = Math.round((unlockedAchievements.length / ACHIEVEMENTS.length) * 100);

  const renderAchievement = (achievement: Achievement) => {
    const isUnlocked = unlockedAchievements.includes(achievement.id);
    const unlockedDay = isUnlocked ? gameState.achievementUnlockDay[achievement.id] : undefined;
    
    return (
      <div
        key={achievement.id}
        className={`p-4 rounded-lg border-2 transition-all ${
          isUnlocked
            ? 'bg-accent/20 border-accent shadow-md'
            : 'bg-muted/50 border-muted opacity-60 grayscale'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className={`text-3xl ${isUnlocked ? 'animate-bounce' : ''}`}>
            {achievement.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-bold">{achievement.name}</h4>
              {isUnlocked && (
                <Badge variant="default" className="bg-accent text-accent-foreground">
                  ✓ Unlocked{unlockedDay ? ` • Day ${unlockedDay}` : ''}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{achievement.description}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">🏆 Achievements</DialogTitle>
          <div className="pt-2">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-medium">
                {unlockedAchievements.length} / {ACHIEVEMENTS.length} Unlocked
              </span>
              <span className="text-muted-foreground">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
        </DialogHeader>

        <Tabs defaultValue="all" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="rabbits">🐰</TabsTrigger>
            <TabsTrigger value="coins">💰</TabsTrigger>
            <TabsTrigger value="days">📅</TabsTrigger>
            <TabsTrigger value="resources">🏠</TabsTrigger>
            <TabsTrigger value="upgrades">⭐</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4">
            {Object.entries(categories).map(([key, achievements]) => (
              <TabsContent key={key} value={key} className="space-y-3 mt-0">
                {achievements.map(renderAchievement)}
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
