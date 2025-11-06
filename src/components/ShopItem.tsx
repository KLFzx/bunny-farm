import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShopItem as ShopItemType, useGame } from '@/contexts/GameContext';
import { Coins } from 'lucide-react';
import { RABBIT_BREEDS } from '@/data/rabbitBreeds';
import { Badge } from './ui/badge';
import { useState } from 'react';

interface ShopItemProps {
  item: ShopItemType;
}

export const ShopItem = ({ item }: ShopItemProps) => {
  const [justPurchased, setJustPurchased] = useState(false);
  const { gameState, buyItem, getPrice } = useGame();
  
  const foodTier: Record<'carrots' | 'lettuce' | 'pellets', number> = {
    carrots: 0,
    lettuce: 1,
    pellets: 2,
  };

  const isFoodUpgrade = item.type === 'upgrade' && !!item.effect.foodType;
  const isWaterUpgrade = item.type === 'upgrade' && !!item.effect.waterType;
  const isGenericUpgrade = item.type === 'upgrade' && !item.effect.foodType && !item.effect.waterType;

  let isUpgradeOwned = false;
  let isUpgradeLocked = false;
  let upgradeTooltip: string | undefined;
  let daysLeftToUnlock: number | undefined;

  if (isFoodUpgrade && item.effect.foodType) {
    const current = foodTier[gameState.foodType];
    const target = foodTier[item.effect.foodType];
    isUpgradeOwned = current === target;
    // Locked if downgrade or trying to skip directly to pellets without lettuce
    if (target < current) {
      isUpgradeLocked = true;
      upgradeTooltip = 'Cannot downgrade';
    } else if (item.effect.foodType === 'pellets' && current < foodTier.lettuce) {
      isUpgradeLocked = true;
      upgradeTooltip = 'Unlock Lettuce Garden first';
    } else if (item.effect.foodType === 'lettuce' && current > foodTier.carrots) {
      isUpgradeLocked = true;
      upgradeTooltip = 'Already surpassed this upgrade';
    }
  }

  if (isWaterUpgrade && item.effect.waterType) {
    isUpgradeOwned = gameState.waterType === item.effect.waterType;
    // Only allowed from normal -> purified; if already purified then owned
    if (!isUpgradeOwned && gameState.waterType !== 'normal') {
      isUpgradeLocked = true;
      upgradeTooltip = 'Water upgrade not available';
    }
  }

  if (isGenericUpgrade) {
    if (gameState.ownedUpgrades?.includes(item.id)) {
      isUpgradeOwned = true;
    }

    if (!isUpgradeOwned) {
      // Mirror key prerequisites for UI lock state and days left
      const minDayByUpgrade: Record<string, number | undefined> = {
        'carrot-farm': 100,
        'deep-well': 30,
        'solar-panels': 70,
        'logistics-network': 150,
      };
      const minDay = minDayByUpgrade[item.id];
      if (typeof minDay === 'number' && gameState.day < minDay) {
        isUpgradeLocked = true;
        daysLeftToUnlock = minDay - gameState.day;
        upgradeTooltip = `Unlocks in ${daysLeftToUnlock} day${daysLeftToUnlock === 1 ? '' : 's'}`;
      }

      // Non-day prerequisites
      const requiresLettuce = ['training-grounds', 'fertilizer-system'].includes(item.id);
      const requiresPurified = ['bunny-nursery', 'hydration-station', 'purifier-plus'].includes(item.id);
      if (!isUpgradeLocked && requiresLettuce && gameState.foodType === 'carrots') {
        isUpgradeLocked = true;
        upgradeTooltip = 'Requires Lettuce Garden first';
      }
      if (!isUpgradeLocked && requiresPurified && gameState.waterType !== 'purified') {
        isUpgradeLocked = true;
        upgradeTooltip = 'Requires Water Filter first';
      }
      if (!isUpgradeLocked && item.id === 'mega-hutch' && gameState.houses < 2) {
        isUpgradeLocked = true;
        upgradeTooltip = 'Requires at least 2 houses';
      }
      if (!isUpgradeLocked && item.id === 'market-stall' && !gameState.ownedUpgrades?.includes('training-grounds')) {
        isUpgradeLocked = true;
        upgradeTooltip = 'Requires Training Grounds first';
      }
      if (!isUpgradeLocked && item.id === 'logistics-network' && gameState.day >= (minDayByUpgrade['logistics-network'] || 0) && gameState.houses < 3) {
        // Day met but still needs houses
        isUpgradeLocked = true;
        upgradeTooltip = 'Requires 3+ houses';
      }
    }
  }
  
  const tryBuy = (qty: number) => {
    if (buyItem(item, qty)) {
      setJustPurchased(true);
      setTimeout(() => setJustPurchased(false), 600);
    }
  };
  
  const handlePurchase = () => tryBuy(1);
  
  const breedInfo = item.breed ? RABBIT_BREEDS[item.breed] : null;
  
  const getRarityColor = () => {
    if (!breedInfo) return '';
    switch (breedInfo.rarity) {
      case 'legendary':
        return 'border-yellow-500 bg-yellow-500/5';
      case 'rare':
        return 'border-blue-500 bg-blue-500/5';
      default:
        return '';
    }
  };

  return (
    <Card 
      className={`p-4 shadow-card transition-all duration-300 hover:scale-105 hover:shadow-soft ${
        justPurchased ? 'animate-scale-in border-2 border-accent' : ''
      } ${getRarityColor()}`}
    >
      <div className="flex items-start gap-3">
        <div className={`text-4xl ${justPurchased ? 'animate-bounce' : ''}`}>
          {item.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-foreground">{item.name}</h3>
            {breedInfo && breedInfo.rarity !== 'common' && (
              <Badge 
                variant="outline" 
                className={
                  breedInfo.rarity === 'legendary' 
                    ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500' 
                    : 'bg-blue-500/10 text-blue-600 border-blue-500'
                }
              >
                {breedInfo.rarity}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-accent font-bold">
              <Coins className="w-4 h-4" />
              <span>{getPrice(item, 1)}</span>
            </div>
            { (item.type === 'food' || item.type === 'water' || item.type === 'house') ? (
              <div className="flex gap-2">
                <Button
                  onClick={() => tryBuy(1)}
                  disabled={gameState.coins < getPrice(item, 1)}
                  size="sm"
                  className="bg-gradient-farm hover:opacity-90 transition-all"
                >
                  Buy x1
                </Button>
                <Button
                  onClick={() => tryBuy(5)}
                  disabled={gameState.coins < getPrice(item, 5)}
                  size="sm"
                  className="bg-gradient-farm hover:opacity-90 transition-all"
                >
                  {`x5 (${getPrice(item, 5)})`}
                </Button>
                <Button
                  onClick={() => tryBuy(10)}
                  disabled={gameState.coins < getPrice(item, 10)}
                  size="sm"
                  className="bg-gradient-farm hover:opacity-90 transition-all"
                >
                  {`x10 (${getPrice(item, 10)})`}
                </Button>
              </div>
            ) : (
              <Button
                onClick={handlePurchase}
                disabled={gameState.coins < getPrice(item, 1) || isUpgradeOwned || isUpgradeLocked}
                size="sm"
                className="bg-gradient-farm hover:opacity-90 transition-all"
                title={isUpgradeOwned ? 'Already acquired' : (isUpgradeLocked ? (upgradeTooltip || 'Locked') : 'Buy')}
              >
                {isUpgradeOwned ? 'Owned' : isUpgradeLocked ? `Locked${typeof daysLeftToUnlock === 'number' ? ` (${daysLeftToUnlock}d)` : ''}` : 'Buy'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
