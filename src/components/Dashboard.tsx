import { Button } from '@/components/ui/button';
import { ResourceCard } from './ResourceCard';
import { useGame } from '@/contexts/GameContext';
import { Calendar, Home, Droplets, Carrot, Trophy } from 'lucide-react';
import rabbitIcon from '@/assets/rabbit-icon.png';
import { RABBIT_BREEDS } from '@/data/rabbitBreeds';
import { Badge } from './ui/badge';
import { useState } from 'react';
import { AchievementsModal } from './AchievementsModal';

export const Dashboard = () => {
  const { gameState, nextDay, sellRabbits } = useGame();
  const [showAchievements, setShowAchievements] = useState(false);
  
  const rabbitCount = gameState.rabbits.length;
  const maxCapacity = gameState.houses * 4;
  const foodNeededPerDay = rabbitCount;
  const waterNeededPerDay = rabbitCount;
  
  const canSurviveNextDay = 
    gameState.food >= foodNeededPerDay && 
    gameState.water >= waterNeededPerDay;

  // Sell availability: only on day multiples of 100 and not sold already that day
  const isSellDay = gameState.day % 100 === 0;
  const alreadySoldToday = (gameState as any).lastRabbitSaleDay === gameState.day;
  const canSell = isSellDay && !alreadySoldToday && rabbitCount > 0;
  const nextSellDay = isSellDay ? gameState.day : gameState.day + (100 - (gameState.day % 100));

  // Calculate breed distribution
  const breedCounts = gameState.rabbits.reduce((acc, rabbit) => {
    acc[rabbit.breed] = (acc[rabbit.breed] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Rabbit Population */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-farm p-4 md:p-8 shadow-soft">
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3 md:gap-6 w-full md:w-auto">
              <img 
                src={rabbitIcon} 
                alt="Rabbit" 
                className="w-16 h-16 md:w-20 md:h-20 animate-bounce-gentle"
              />
              <div className="flex-1">
                <h2 className="text-white/90 text-base md:text-lg font-medium mb-1">Colony Population</h2>
                <p className="text-3xl md:text-5xl font-bold text-white">
                  {rabbitCount}
                  <span className="text-lg md:text-xl opacity-80">/{maxCapacity}</span>
                </p>
                <p className="text-white/80 text-xs md:text-sm mt-2">
                  Food: {gameState.foodType} • Water: {gameState.waterType}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 md:gap-3 w-full md:w-auto">
              <Button
                onClick={() => setShowAchievements(true)}
                variant="secondary"
                size="lg"
                className="gap-2 w-full sm:w-auto"
              >
                <Trophy className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-sm md:text-base">Achievements</span>
                <Badge variant="default" className="bg-accent text-accent-foreground">
                  {gameState.unlockedAchievements.length}
                </Badge>
              </Button>
              
              <Button
                onClick={sellRabbits}
                variant="outline"
                size="lg"
                disabled={!canSell}
                className="gap-2 w-full sm:w-auto"
                title={canSell ? 'Sell 10-50% of rabbits for 25 coins each' : `Available on Day ${nextSellDay}`}
              >
                💱
                <span className="text-sm md:text-base">{canSell ? 'Sell Rabbits' : `Next sell is available on Day ${nextSellDay}`}</span>
              </Button>
              
              <Button
                onClick={nextDay}
                size="lg"
                disabled={!canSurviveNextDay}
                className="bg-white text-primary hover:bg-white/90 shadow-lg px-6 md:px-8 py-5 md:py-6 h-auto animate-pulse-gentle w-full sm:w-auto"
              >
                <Calendar className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                <span className="text-base md:text-lg">Next Day</span>
              </Button>
            </div>
          </div>
          
          {/* Breed Distribution */}
          {rabbitCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {Object.entries(breedCounts).map(([breed, count]) => {
                const breedInfo = RABBIT_BREEDS[breed as keyof typeof RABBIT_BREEDS];
                return (
                  <Badge 
                    key={breed} 
                    variant="outline" 
                    className="bg-white/10 text-white border-white/30 text-xs md:text-sm"
                  >
                    {breedInfo.icon} {breedInfo.name}: {count}
                  </Badge>
                );
              })}
            </div>
          )}
        </div>
        
        {!canSurviveNextDay && (
          <p className="text-white/90 text-xs md:text-sm mt-4 bg-destructive/20 px-3 md:px-4 py-2 rounded-lg backdrop-blur-sm">
            ⚠️ Not enough resources for next day! Buy more food or water.
          </p>
        )}
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">{/* Changed to single column on mobile */}
        <ResourceCard
          title="Food Stock"
          value={gameState.food}
          max={Math.max(50, gameState.food)}
          icon={<Carrot className="w-8 h-8 text-food" />}
          colorClass="bg-food/10"
          showProgress
        />
        
        <ResourceCard
          title="Water Supply"
          value={gameState.water}
          max={Math.max(50, gameState.water)}
          icon={<Droplets className="w-8 h-8 text-water" />}
          colorClass="bg-water/10"
          showProgress
        />
        
        <ResourceCard
          title="Housing"
          value={gameState.houses}
          icon={<Home className="w-8 h-8 text-housing" />}
          colorClass="bg-housing/10"
        />
      </div>

      {/* Stats */}
      <div className="bg-card border border-border rounded-xl p-4 md:p-6 shadow-card">
        <h3 className="font-bold text-base md:text-lg mb-4">Daily Consumption</h3>
        <div className="grid grid-cols-2 gap-3 md:gap-4">{/* Changed from grid-cols-4 to grid-cols-2 on mobile */}
          <div>
            <p className="text-muted-foreground text-xs md:text-sm">Food/Day</p>
            <p className="text-xl md:text-2xl font-bold text-food">{foodNeededPerDay}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs md:text-sm">Water/Day</p>
            <p className="text-xl md:text-2xl font-bold text-water">{waterNeededPerDay}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs md:text-sm">Days Left</p>
            <p className="text-xl md:text-2xl font-bold text-foreground">
              {rabbitCount > 0 ? Math.min(
                Math.floor(gameState.food / foodNeededPerDay),
                Math.floor(gameState.water / waterNeededPerDay)
              ) : '∞'}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs md:text-sm">Capacity</p>
            <p className="text-xl md:text-2xl font-bold text-housing">{maxCapacity}</p>
          </div>
        </div>
      </div>

      <AchievementsModal
        open={showAchievements}
        onClose={() => setShowAchievements(false)}
        unlockedAchievements={gameState.unlockedAchievements}
      />
    </div>
  );
};
