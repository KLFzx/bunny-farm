import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { ACHIEVEMENTS, GameStats } from '@/data/achievements';
import { getRandomEvent, GameEvent } from '@/data/events';
import { RABBIT_BREEDS } from '@/data/rabbitBreeds';
import { syncPlayerProgress, initializePlayerProgress } from '@/services/playerDataSync';
import { getOrCreatePlayerId } from '@/utils/playerId';

export interface RabbitWithBreed {
  id: string;
  breed: 'common' | 'rare' | 'legendary';
}

export interface GameState {
  rabbits: RabbitWithBreed[];
  coins: number;
  food: number;
  water: number;
  houses: number;
  day: number;
  foodType: 'carrots' | 'lettuce' | 'pellets';
  waterType: 'normal' | 'purified';
  unlockedAchievements: string[];
  totalRabbitsBorn: number;
  totalCoinsEarned: number;
  currentEvent: GameEvent | null;
  coinsSpentByDay: { day: number; spent: number }[];
  achievementUnlockDay: Record<string, number>;
  ownedUpgrades: string[];
  brokenUpgrades: string[];
  breaksCount: number;
  repairsCount: number;
  // Upgrade effect accumulators
  coinMultiplier: number;
  breedingBonusMultiplier: number;
  foodConsumptionMultiplier: number;
  waterConsumptionMultiplier: number;
  capacityBonusPerHouse: number;
  passiveCoinsPerDay: number;
  passiveFoodPerDay: number;
  passiveWaterPerDay: number;
  shopDiscountBonus: number; // additional discount applied in getPrice (0..0.3)
  // Fever event state
  feverActive: boolean;
  infectedIds: string[];
  isolatedIds: string[];
  infectionDays: Record<string, number>;
  infectionDeathAt: Record<string, number>; // remaining days to death for isolated
  feverDaysLeft?: number; // fixed-duration fever
  feverIsolated?: boolean; // whether player chose isolate route
  feverSurvivals?: number; // number of times player survived (ended) fever
  // Meta
  lastRabbitSaleDay: number;
  // Runs history (local-only)
  runHistory?: Array<{
    day: number;
    totalCoinsEarned: number;
    endAt: number;
    rabbits: number;
    houses: number;
    achievements: string[];
  }>;
}

interface GameContextType {
  gameState: GameState;
  nextDay: () => void;
  buyItem: (item: ShopItem, quantity?: number) => boolean;
  resetGame: () => void;
  newAchievement: string | null;
  clearAchievementNotification: () => void;
  dismissEvent: () => void;
  cureFever: () => void;
  isolateAllInfected: () => void;
  cureFeverWithCost: (percent?: number) => void;
  onPurchaseSound?: () => void;
  onNextDaySound?: () => void;
  getPrice: (item: ShopItem, quantity?: number) => number;
  sellRabbits: () => void;
}

// Sound callback refs to be set by components
let purchaseSoundCallback: (() => void) | undefined;
let nextDaySoundCallback: (() => void) | undefined;

export const setSoundCallbacks = (purchase: () => void, nextDay: () => void) => {
  purchaseSoundCallback = purchase;
  nextDaySoundCallback = nextDay;
};

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  type: 'rabbit' | 'food' | 'water' | 'house' | 'upgrade';
  effect: {
    rabbits?: number;
    food?: number;
    water?: number;
    houses?: number;
    foodType?: 'carrots' | 'lettuce' | 'pellets';
    waterType?: 'normal' | 'purified';
    // New upgrade effect fields
    coinMultiplier?: number;
    breedingBonusMultiplier?: number;
    foodConsumptionMultiplier?: number;
    waterConsumptionMultiplier?: number;
    capacityBonusPerHouse?: number;
    passiveCoinsPerDay?: number;
    passiveFoodPerDay?: number;
    passiveWaterPerDay?: number;
    shopDiscountBonus?: number;
  };
  icon: string;
  breed?: 'common' | 'rare' | 'legendary';
}

const INITIAL_STATE: GameState = {
  rabbits: [{ id: '1', breed: 'common' }],
  coins: 50,
  food: 10,
  water: 10,
  houses: 1,
  day: 1,
  foodType: 'carrots',
  waterType: 'normal',
  unlockedAchievements: [],
  totalRabbitsBorn: 0,
  totalCoinsEarned: 0,
  currentEvent: null,
  coinsSpentByDay: [],
  achievementUnlockDay: {},
  ownedUpgrades: [],
  brokenUpgrades: [],
  breaksCount: 0,
  repairsCount: 0,
  coinMultiplier: 1,
  breedingBonusMultiplier: 1,
  foodConsumptionMultiplier: 1,
  waterConsumptionMultiplier: 1,
  capacityBonusPerHouse: 0,
  passiveCoinsPerDay: 0,
  passiveFoodPerDay: 0,
  passiveWaterPerDay: 0,
  shopDiscountBonus: 0,
  feverActive: false,
  infectedIds: [],
  isolatedIds: [],
  infectionDays: {},
  infectionDeathAt: {},
  feverDaysLeft: 0,
  feverIsolated: false,
  feverSurvivals: 0,
  // Meta
  lastRabbitSaleDay: 0,
  runHistory: [],
};

const FOOD_CONSUMPTION_PER_RABBIT = 1;
const WATER_CONSUMPTION_PER_RABBIT = 1;
const COINS_PER_RABBIT = 2;
const BREEDING_CHANCE = 0.3;

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
};

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem('rabbitTycoonSave');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migrate to include any new fields
        return {
          ...INITIAL_STATE,
          ...parsed,
          coinsSpentByDay: parsed.coinsSpentByDay || [],
          achievementUnlockDay: parsed.achievementUnlockDay || {},
          ownedUpgrades: parsed.ownedUpgrades || [],
          brokenUpgrades: parsed.brokenUpgrades || [],
          breaksCount: parsed.breaksCount ?? 0,
          repairsCount: parsed.repairsCount ?? 0,
          coinMultiplier: parsed.coinMultiplier ?? 1,
          breedingBonusMultiplier: parsed.breedingBonusMultiplier ?? 1,
          foodConsumptionMultiplier: parsed.foodConsumptionMultiplier ?? 1,
          waterConsumptionMultiplier: parsed.waterConsumptionMultiplier ?? 1,
          capacityBonusPerHouse: parsed.capacityBonusPerHouse ?? 0,
          passiveCoinsPerDay: parsed.passiveCoinsPerDay ?? 0,
          passiveFoodPerDay: parsed.passiveFoodPerDay ?? 0,
          passiveWaterPerDay: parsed.passiveWaterPerDay ?? 0,
          shopDiscountBonus: parsed.shopDiscountBonus ?? 0,
          feverActive: parsed.feverActive ?? false,
          infectedIds: parsed.infectedIds || [],
          isolatedIds: parsed.isolatedIds || [],
          infectionDays: parsed.infectionDays || {},
          infectionDeathAt: parsed.infectionDeathAt || {},
          feverDaysLeft: parsed.feverDaysLeft ?? 0,
          feverIsolated: parsed.feverIsolated ?? false,
          feverSurvivals: parsed.feverSurvivals ?? 0,
          lastRabbitSaleDay: parsed.lastRabbitSaleDay ?? 0,
          runHistory: parsed.runHistory || [],
        } as GameState;
      } catch {
        return INITIAL_STATE;
      }
    }
    return INITIAL_STATE;
  });
  
  const [newAchievement, setNewAchievement] = useState<string | null>(null);

  // Initialize player ID on mount
  useEffect(() => {
    const playerId = getOrCreatePlayerId();
    console.log('Player ID:', playerId);
    
    // Initialize player progress in Supabase
    initializePlayerProgress(gameState);
  }, []); // Only run once on mount

  useEffect(() => {
    localStorage.setItem('rabbitTycoonSave', JSON.stringify(gameState));
  }, [gameState]);

  const checkAchievements = (newState: GameState) => {
    const stats: GameStats = {
      rabbits: newState.rabbits.length,
      coins: newState.coins,
      day: newState.day,
      totalRabbitsBorn: newState.totalRabbitsBorn,
      totalCoinsEarned: newState.totalCoinsEarned,
      houses: newState.houses,
      foodType: newState.foodType,
      waterType: newState.waterType,
      ownedUpgrades: newState.ownedUpgrades,
      breaksCount: newState.breaksCount,
      repairsCount: newState.repairsCount,
      feverSurvivals: newState.feverSurvivals,
    };

    for (const achievement of ACHIEVEMENTS) {
      if (
        !newState.unlockedAchievements.includes(achievement.id) &&
        achievement.requirement(stats)
      ) {
        newState.unlockedAchievements.push(achievement.id);
        newState.achievementUnlockDay[achievement.id] = newState.day;
        setNewAchievement(achievement.id);
      }
    }
  };

  const nextDay = () => {
    setGameState((prev) => {
      const rabbitCount = prev.rabbits.length;
      const foodNeeded = Math.ceil(rabbitCount * FOOD_CONSUMPTION_PER_RABBIT * prev.foodConsumptionMultiplier);
      const feverWaterMultiplier = (prev.feverActive && prev.foodType === 'carrots') ? 2 : 1;
      const waterNeeded = Math.ceil(rabbitCount * WATER_CONSUMPTION_PER_RABBIT * prev.waterConsumptionMultiplier * feverWaterMultiplier);
      
      const hasEnoughFood = prev.food >= foodNeeded;
      const hasEnoughWater = prev.water >= waterNeeded;
      
      // Get random event
      let event = getRandomEvent();
      // Do not trigger fever again while it's active
      if (event && event.id === 'rabbit-fever' && prev.feverActive) {
        event = null;
      }
      // Safety: while population is fragile (<4), suppress infection and lethal predator events
      if (event && prev.rabbits.length < 4) {
        const blocked = ['rabbit-fever', 'fox-attack', 'wolf-raid', 'bear-rampage'];
        if (blocked.includes(event.id)) {
          event = null;
        }
      }
      
      
      // Still progress fever timer even if resources are insufficient
      let newRabbitsTemp = [...prev.rabbits];
      if (prev.feverActive) {
        const daysLeft = prev.feverDaysLeft - 1;
        (prev as any).feverDaysLeft = daysLeft;
        if (daysLeft <= 0) {
          // Remove all infected rabbits at the end of the event
          const infectedSet = new Set(prev.infectedIds);
          newRabbitsTemp = newRabbitsTemp.filter(r => !infectedSet.has(r.id));
          (prev as any).feverActive = false;
          (prev as any).infectedIds = [];
          (prev as any).isolatedIds = [];
          (prev as any).infectionDays = {};
          (prev as any).infectionDeathAt = {};
          (prev as any).isolatedIds = [];
          (prev as any).feverIsolated = false;
          (prev as any).feverSurvivals = ((prev as any).feverSurvivals ?? 0) + 1;
        }

        let newState = {
          ...prev,
          rabbits: newRabbitsTemp,
          food: Math.max(0, prev.food - foodNeeded),
          water: Math.max(0, prev.water - waterNeeded),
          day: prev.day + 1,
          currentEvent: event,
        };
        // Final guard: prune infection references against alive rabbits
        if (newState.feverActive) {
          const alive = new Set(newState.rabbits.map(r => r.id));
          newState = {
            ...newState,
            infectedIds: (newState.infectedIds || []).filter(id => alive.has(id)),
            isolatedIds: (newState.isolatedIds || []).filter(id => alive.has(id)),
            infectionDays: Object.fromEntries(Object.entries(newState.infectionDays || {}).filter(([id]) => alive.has(id))),
            infectionDeathAt: Object.fromEntries(Object.entries(newState.infectionDeathAt || {}).filter(([id]) => alive.has(id))),
          } as GameState;
          if ((newState.infectedIds || []).length === 0) {
            newState.feverActive = false;
            newState.infectionDays = {};
            newState.infectionDeathAt = {};
            newState.isolatedIds = [];
          }
        }
        localStorage.setItem('rabbitTycoonSave', JSON.stringify(newState));
        return newState;
      }

      const baseCapacityPerHouse = 4;
      const maxCapacity = prev.houses * (baseCapacityPerHouse + prev.capacityBonusPerHouse);
      const canBreed = rabbitCount >= 2 && rabbitCount < maxCapacity;
      
      let newRabbits = [...prev.rabbits];
      let newBirths = 0;

      // Calculate coin earnings based on rabbit breeds
      let coinsEarned = 0;
      prev.rabbits.forEach(rabbit => {
        const breed = RABBIT_BREEDS[rabbit.breed];
        coinsEarned += COINS_PER_RABBIT * breed.coinMultiplier;
      });

      // Apply food efficiency and global coin multiplier
      const foodEfficiency = prev.foodType === 'pellets' ? 1.5 : prev.foodType === 'lettuce' ? 1.2 : 1;
      const nextDayNumber = prev.day + 1;
      const timeBonus = Math.min(0.95, Math.floor(nextDayNumber / 80) * 0.05);
      coinsEarned = Math.floor(coinsEarned * foodEfficiency * prev.coinMultiplier * (1 + timeBonus));

      // Breeding logic
      if (canBreed && Math.random() < BREEDING_CHANCE) {
        let breedingMultiplier = (prev.waterType === 'purified' ? 2 : 1) * prev.breedingBonusMultiplier;
        
        // Apply event breeding bonus/penalty
        if (event?.effect.breedingBonus) {
          breedingMultiplier *= event.effect.breedingBonus;
        }
        // Persistent fever penalty: -75% breeding (x0.25)
        if (prev.feverActive) {
          breedingMultiplier *= 0.25;
        }
        
        const rabbitsToAdd = Math.floor(breedingMultiplier);
        const actualNewRabbits = Math.min(rabbitsToAdd, maxCapacity - rabbitCount);
        
        if (actualNewRabbits > 0) {
          // New rabbits inherit breed from random parent
          for (let i = 0; i < actualNewRabbits; i++) {
            const parentBreed = prev.rabbits[Math.floor(Math.random() * prev.rabbits.length)].breed;
            newRabbits.push({
              id: `${Date.now()}-${i}`,
              breed: parentBreed,
            });
          }
          newBirths = actualNewRabbits;
          toast.success(`New baby rabbit${actualNewRabbits > 1 ? 's' : ''}! 🐰`);
        }
      }

      // Apply event effects
      let eventCoins = 0;
      let eventFood = 0;
      let eventWater = 0;
      let eventRabbits = 0;
      let eventHouses = 0;

      if (event) {
        eventCoins = event.effect.coins || 0;
        eventFood = event.effect.food || 0;
        eventWater = event.effect.water || 0;
        eventRabbits = event.effect.rabbits || 0;
        eventHouses = event.effect.houses || 0;
        
        // Start fever if rabbit-fever occurs
        if (event.id === 'rabbit-fever' && !prev.feverActive) {
          const pct = 0.1 + Math.random() * 0.4; // 10% - 50%
          const infectedCount = Math.max(1, Math.floor(prev.rabbits.length * pct));
          const infectedIds = new Set<string>();
          while (infectedIds.size < infectedCount && infectedIds.size < prev.rabbits.length) {
            infectedIds.add(prev.rabbits[Math.floor(Math.random() * prev.rabbits.length)].id);
          }
          prev.infectedIds = Array.from(infectedIds);
          prev.isolatedIds = [];
          prev.infectionDays = {};
          prev.infectionDeathAt = {};
          prev.feverDaysLeft = 30;
          prev.feverIsolated = false;
          prev.feverActive = true;
        }
        
        // Add random rabbits from event
        if (eventRabbits > 0 && newRabbits.length < maxCapacity) {
          const rabbitsToAdd = Math.min(eventRabbits, maxCapacity - newRabbits.length);
          for (let i = 0; i < rabbitsToAdd; i++) {
            newRabbits.push({
              id: `event-${Date.now()}-${i}`,
              breed: 'common',
            });
          }
        }

        if (event.id === 'fox-attack' || event.id === 'wolf-raid' || event.id === 'bear-rampage') {
          const pct = event.id === 'fox-attack' ?  (0.01 + Math.random() * 0.09) : event.id === 'wolf-raid' ? (0.05 + Math.random() * 0.15) :  (0.1 + Math.random() * 0.25);
          const toRemoveCount = Math.max(1, Math.floor(newRabbits.length * pct));
          const ids = new Set<string>();
          while (ids.size < toRemoveCount && ids.size < newRabbits.length) {
            ids.add(newRabbits[Math.floor(Math.random() * newRabbits.length)].id);
          }
          const keep: typeof newRabbits = [];
          newRabbits.forEach(r => { if (!ids.has(r.id)) keep.push(r); });
          newRabbits.length = 0;
          newRabbits.push(...keep);
          const alive = new Set(newRabbits.map(r => r.id));
          (prev as any).infectedIds = (prev.infectedIds || []).filter(id => alive.has(id));
          (prev as any).isolatedIds = (prev.isolatedIds || []).filter(id => alive.has(id));
          (prev as any).infectionDays = Object.fromEntries(Object.entries(prev.infectionDays || {}).filter(([id]) => alive.has(id)));
          (prev as any).infectionDeathAt = Object.fromEntries(Object.entries(prev.infectionDeathAt || {}).filter(([id]) => alive.has(id)));
        }
      }

      // 1% chance an upgrade breaks
      let breakNotice: string | null = null;
      const candidates: string[] = [];
      // Generic owned upgrades
      prev.ownedUpgrades.forEach(id => {
        if (!prev.brokenUpgrades.includes(id)) candidates.push(id);
      });
      // Food/water upgrades based on current state
      if (prev.foodType === 'pellets') candidates.push('pellets-upgrade');
      else if (prev.foodType === 'lettuce') candidates.push('lettuce-upgrade');
      if (prev.waterType === 'purified') candidates.push('purified-water');

      let brokenUpgrades = [...prev.brokenUpgrades];
      let brokeThisDay = false;
      let adjustedState = { ...prev } as GameState;
      if (candidates.length > 2 && Math.random() < 0.01) {
        const idx = Math.floor(Math.random() * candidates.length);
        const brokenId = candidates[idx];
        if (!brokenUpgrades.includes(brokenId)) brokenUpgrades.push(brokenId);
        brokeThisDay = true;
        // Revert effects
        switch (brokenId) {
          case 'pellets-upgrade': {
            // pellets downgrade to lettuce
            if (adjustedState.foodType === 'pellets') adjustedState.foodType = 'lettuce';
            breakNotice = 'Your Premium Pellets upgrade broke! Downgraded to Lettuce.';
            break;
          }
          case 'lettuce-upgrade': {
            if (adjustedState.foodType === 'lettuce') adjustedState.foodType = 'carrots';
            breakNotice = 'Your Lettuce Garden broke! Downgraded to Carrots.';
            break;
          }
          case 'purified-water': {
            if (adjustedState.waterType === 'purified') adjustedState.waterType = 'normal';
            breakNotice = 'Your Water Filter broke! Water is back to normal.';
            break;
          }
          case 'training-grounds': {
            adjustedState.coinMultiplier = Math.max(1, adjustedState.coinMultiplier / 1.25);
            adjustedState.ownedUpgrades = adjustedState.ownedUpgrades.filter(u => u !== 'training-grounds');
            breakNotice = 'Training Grounds broke!';
            break;
          }
          case 'bunny-nursery': {
            adjustedState.breedingBonusMultiplier = Math.max(1, adjustedState.breedingBonusMultiplier / 1.25);
            adjustedState.ownedUpgrades = adjustedState.ownedUpgrades.filter(u => u !== 'bunny-nursery');
            breakNotice = 'Bunny Nursery broke!';
            break;
          }
          case 'fertilizer-system': {
            adjustedState.foodConsumptionMultiplier = Math.max(0.1, adjustedState.foodConsumptionMultiplier / 0.75);
            adjustedState.ownedUpgrades = adjustedState.ownedUpgrades.filter(u => u !== 'fertilizer-system');
            breakNotice = 'Fertilizer System broke!';
            break;
          }
          case 'hydration-station': {
            adjustedState.waterConsumptionMultiplier = Math.max(0.1, adjustedState.waterConsumptionMultiplier / 0.75);
            adjustedState.ownedUpgrades = adjustedState.ownedUpgrades.filter(u => u !== 'hydration-station');
            breakNotice = 'Hydration Station broke!';
            break;
          }
          case 'carrot-farm': {
            adjustedState.passiveFoodPerDay = Math.max(0, adjustedState.passiveFoodPerDay - 20); // if user edited to 10, we still subtract 20? keep 10? use 10 if smaller
            // safer: subtract 10 if passiveFoodPerDay >= 10 else 0
            adjustedState.passiveFoodPerDay = Math.max(0, adjustedState.passiveFoodPerDay - 10);
            adjustedState.ownedUpgrades = adjustedState.ownedUpgrades.filter(u => u !== 'carrot-farm');
            breakNotice = 'Carrot Farm broke!';
            break;
          }
          case 'deep-well': {
            adjustedState.passiveWaterPerDay = Math.max(0, adjustedState.passiveWaterPerDay - 10);
            adjustedState.ownedUpgrades = adjustedState.ownedUpgrades.filter(u => u !== 'deep-well');
            breakNotice = 'Deep Well broke!';
            break;
          }
          case 'solar-panels': {
            adjustedState.passiveCoinsPerDay = Math.max(0, adjustedState.passiveCoinsPerDay - 10);
            adjustedState.ownedUpgrades = adjustedState.ownedUpgrades.filter(u => u !== 'solar-panels');
            breakNotice = 'Solar Panels broke!';
            break;
          }
          case 'market-stall': {
            adjustedState.coinMultiplier = Math.max(1, adjustedState.coinMultiplier / 1.15);
            adjustedState.ownedUpgrades = adjustedState.ownedUpgrades.filter(u => u !== 'market-stall');
            breakNotice = 'Market Stall broke!';
            break;
          }
          case 'logistics-network': {
            adjustedState.shopDiscountBonus = Math.max(0, adjustedState.shopDiscountBonus - 0.10);
            adjustedState.ownedUpgrades = adjustedState.ownedUpgrades.filter(u => u !== 'logistics-network');
            breakNotice = 'Logistics Network broke!';
            break;
          }
          case 'purifier-plus': {
            adjustedState.breedingBonusMultiplier = Math.max(1, adjustedState.breedingBonusMultiplier / 1.25);
            adjustedState.ownedUpgrades = adjustedState.ownedUpgrades.filter(u => u !== 'purifier-plus');
            breakNotice = 'Purifier Plus broke!';
            break;
          }
          default:
            break;
        }
      }

      if (breakNotice) {
        toast.error(`${breakNotice} You can repurchase it at 2x price.`);
      }

      toast.success(`Day ${prev.day + 1}: Earned ${coinsEarned} coins!`);

      // Fever progression: fixed duration, no spread/death until end
      if (prev.feverActive) {
        const daysLeft = Math.max(0, (prev.feverDaysLeft ?? 0) - 1);
        (prev as any).feverDaysLeft = daysLeft;
        if (daysLeft === 0) {
          const infectedSet = new Set(prev.infectedIds);
          const keep: typeof newRabbits = [];
          newRabbits.forEach(r => { if (!infectedSet.has(r.id)) keep.push(r); });
          newRabbits.length = 0;
          newRabbits.push(...keep);
          (prev as any).feverActive = false;
          (prev as any).infectedIds = [];
          (prev as any).isolatedIds = [];
          (prev as any).infectionDays = {};
          (prev as any).infectionDeathAt = {};
          (prev as any).feverSurvivals = ((prev as any).feverSurvivals ?? 0) + 1;
          (prev as any).feverIsolated = false;
        }
      }

      let newState = {
        ...prev,
        ...adjustedState,
        rabbits: newRabbits,
        coins: Math.max(0, prev.coins + coinsEarned + eventCoins + prev.passiveCoinsPerDay),
        food: Math.max(0, prev.food - foodNeeded + eventFood + prev.passiveFoodPerDay),
        water: Math.max(0, prev.water - waterNeeded + eventWater + prev.passiveWaterPerDay),
        houses: prev.houses + eventHouses,
        day: prev.day + 1,
        totalRabbitsBorn: prev.totalRabbitsBorn + newBirths + eventRabbits,
        totalCoinsEarned: prev.totalCoinsEarned + coinsEarned,
        currentEvent: event,
        brokenUpgrades,
        breaksCount: prev.breaksCount + (brokeThisDay ? 1 : 0),
      } as GameState;

      // Final guard: prune infection references against alive rabbits
      if (newState.feverActive) {
        const alive = new Set(newState.rabbits.map(r => r.id));
        newState = {
          ...newState,
          infectedIds: (newState.infectedIds || []).filter(id => alive.has(id)),
          isolatedIds: (newState.isolatedIds || []).filter(id => alive.has(id)),
          infectionDays: Object.fromEntries(Object.entries(newState.infectionDays || {}).filter(([id]) => alive.has(id))),
          infectionDeathAt: Object.fromEntries(Object.entries(newState.infectionDeathAt || {}).filter(([id]) => alive.has(id))),
        } as GameState;
        if ((newState.infectedIds || []).length === 0) {
          newState.feverActive = false;
          newState.infectionDays = {};
          newState.infectionDeathAt = {};
          newState.isolatedIds = [];
          newState.feverDaysLeft = 0;
          newState.feverIsolated = false;
        }
      }

      checkAchievements(newState);
      
      // Sync to Supabase after day progression
      syncPlayerProgress(newState);
      
      return newState;
    });
  };

  // Price helper with progression and bulk discounts
  const getPrice = (item: ShopItem, quantity: number = 1): number => {
    const qty = Math.max(1, Math.floor(quantity));

    const dayMultiplier = 1.0 + Math.floor(gameState.day / 10) * 0.01;

    // Base bulk discount: x5: -5%, x10: -10%
    let bulkDiscount = 0;
    if (qty >= 10) bulkDiscount = 0.10;
    else if (qty >= 5) bulkDiscount = 0.05;

    // Progression increase: every 10 days -> +5%, capped at 200%
    const dayAdditionOfPriceSteps = Math.floor(gameState.day / 20);
    const dayAdditionOfPrice = Math.min(2.00, dayAdditionOfPriceSteps * 0.05);

    // Additional small discount per 5 houses -> -2%, capped total 20%
    const houseDiscountSteps = Math.floor(gameState.houses / 5);
    const houseDiscount = Math.min(0.20, houseDiscountSteps * 0.02);

    // Only apply discounts to consumables and housing
    const isDiscountable = item.type === 'food' || item.type === 'water' || item.type === 'house';
    const discountFactor = isDiscountable 
      ? (1 - Math.min(0.8, bulkDiscount - dayAdditionOfPrice + houseDiscount + gameState.shopDiscountBonus))
      : 1;

    // Broken upgrade repurchase costs 2x - 10x
    const brokenMultiplier = (item.type === 'upgrade' && gameState.brokenUpgrades?.includes(item.id)) ? Math.floor(Math.random()*(10-2+1)+2) : 1;
    const total = item.cost * qty * discountFactor * brokenMultiplier * dayMultiplier;
    return Math.ceil(total);
  };

  // Sell a random 10-50% of current rabbits, only on days divisible by 100 and max once that day
  const sellRabbits = () => {
    setGameState((prev) => {
      const day = prev.day;
      const alreadySoldToday = (prev.lastRabbitSaleDay ?? 0) === day;
      const onSellWindow = day % 40 === 0;
      const rabbitCount = prev.rabbits.length;
      if (rabbitCount === 0) {
        toast.error('No rabbits to sell.');
        return prev;
      }
      if (!onSellWindow || alreadySoldToday) {
        const nextWindow = onSellWindow ? day : day + (40 - (day % 40));
        toast.error(`You can sell rabbits on day multiples of 100. Next: Day ${nextWindow}.`);
        return prev;
      }

      const pct = 0.10 + Math.random() * 0.40; // 10% - 50%
      const toSell = Math.max(1, Math.floor(rabbitCount * pct));

      // Pick random rabbits to remove
      const indices = Array.from({ length: rabbitCount }, (_, i) => i);
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      const removeSet = new Set<string>();
      for (let i = 0; i < toSell && i < indices.length; i++) {
        removeSet.add(prev.rabbits[indices[i]].id);
      }

      const kept: typeof prev.rabbits = [];
      prev.rabbits.forEach(r => { if (!removeSet.has(r.id)) kept.push(r); });

      // Prune fever references for sold rabbits
      const alive = new Set(kept.map(r => r.id));
      let next: GameState = {
        ...prev,
        rabbits: kept,
        coins: prev.coins + toSell * 25,
        totalCoinsEarned: prev.totalCoinsEarned + toSell * 25,
        infectedIds: (prev.infectedIds || []).filter(id => alive.has(id)),
        isolatedIds: (prev.isolatedIds || []).filter(id => alive.has(id)),
        infectionDays: Object.fromEntries(Object.entries(prev.infectionDays || {}).filter(([id]) => alive.has(id))),
        infectionDeathAt: Object.fromEntries(Object.entries(prev.infectionDeathAt || {}).filter(([id]) => alive.has(id))),
        lastRabbitSaleDay: day,
      } as GameState;

      if (next.feverActive && (next.infectedIds || []).length === 0) {
        next = {
          ...next,
          feverActive: false,
          infectionDays: {},
          infectionDeathAt: {},
          isolatedIds: [],
          feverIsolated: false,
        } as GameState;
      }

      toast.success(`Sold ${toSell} rabbits for ${toSell * 25} coins.`);

      // Sync after selling
      syncPlayerProgress(next);
      return next;
    });
  };

  const buyItem = (item: ShopItem, quantity: number = 1): boolean => {
    const totalCost = getPrice(item, quantity);
    if (gameState.coins < totalCost) {
      toast.error('Not enough coins!');
      return false;
    }

    setGameState((prev) => {
      const newRabbits = [...prev.rabbits];
      const qty = Math.max(1, Math.floor(quantity));
      const wasBroken = prev.brokenUpgrades?.includes(item.id);
      const baseCapacityPerHouse = 4;
      const maxCapacity = prev.houses * (baseCapacityPerHouse + prev.capacityBonusPerHouse);
      const currentCount = prev.rabbits.length;
      
      // Add rabbits with breed (capacity-enforced)
      if (item.effect.rabbits) {
        const toAdd = item.effect.rabbits * qty;
        if (currentCount + toAdd > maxCapacity) {
          toast.error('Not enough housing capacity for more rabbits.');
          return prev;
        }
        const breed = item.breed || 'common';
        for (let i = 0; i < toAdd; i++) {
          newRabbits.push({
            id: `${Date.now()}-${i}`,
            breed,
          });
        }
      }

      // Prevent buying the same upgrade twice
      if (item.type === 'upgrade') {
        if (item.effect.foodType && prev.foodType === item.effect.foodType) {
          toast.error('Upgrade already acquired.');
          return prev;
        }
        if (item.effect.waterType && prev.waterType === item.effect.waterType) {
          toast.error('Upgrade already acquired.');
          return prev;
        }
        if (!item.effect.foodType && !item.effect.waterType) {
          if (prev.ownedUpgrades.includes(item.id)) {
            toast.error('Upgrade already acquired.');
            return prev;
          }
        }

        // Prevent downgrades and enforce tier order for food upgrades
        const foodTier: Record<string, number> = { carrots: 0, lettuce: 1, pellets: 2 };
        if (item.effect.foodType) {
          const current = foodTier[prev.foodType];
          const target = foodTier[item.effect.foodType];
          if (target < current) {
            toast.error('Cannot downgrade food quality.');
            return prev;
          }
          if (item.effect.foodType === 'pellets' && prev.foodType !== 'lettuce') {
            toast.error('Unlock Lettuce Garden first.');
            return prev;
          }
          if (item.effect.foodType === 'lettuce' && prev.foodType !== 'carrots') {
            toast.error('Lettuce Garden is already surpassed.');
            return prev;
          }
        }

        // Water upgrade: only allow upgrade from normal -> purified
        if (item.effect.waterType) {
          if (prev.waterType !== 'normal') {
            toast.error('Water filter already installed.');
            return prev;
          }
        }

        // Prerequisites for new upgrades
        const require = (cond: boolean, msg: string) => {
          if (!cond) {
            toast.error(msg);
            throw new Error('prereq-failed');
          }
        };
        try {
          switch (item.id) {
            case 'training-grounds':
              require(prev.foodType !== 'carrots', 'Requires Lettuce Garden first.');
              break;
            case 'bunny-nursery':
              require(prev.waterType === 'purified', 'Requires Water Filter first.');
              break;
            case 'mega-hutch':
              require(prev.houses >= 2, 'Requires at least 2 houses.');
              break;
            case 'fertilizer-system':
              require(prev.foodType !== 'carrots', 'Requires Lettuce Garden first.');
              break;
            case 'hydration-station':
              require(prev.waterType === 'purified', 'Requires Water Filter first.');
              break;
            case 'carrot-farm':
              require(prev.day >= 10, 'Unlocks at Day 10.');
              break;
            case 'deep-well':
              require(prev.day >= 10, 'Unlocks at Day 10.');
              break;
            case 'solar-panels':
              require(prev.day >= 20, 'Unlocks at Day 20.');
              break;
            case 'market-stall':
              require(prev.ownedUpgrades.includes('training-grounds'), 'Requires Training Grounds first.');
              break;
            case 'logistics-network':
              require(prev.day >= 15 && prev.houses >= 3, 'Requires Day 15 and 3+ houses.');
              break;
            case 'purifier-plus':
              require(prev.waterType === 'purified', 'Requires Water Filter first.');
              break;
            default:
              break;
          }
        } catch (e) {
          return prev;
        }
      }

      const newState = {
        ...prev,
        coins: prev.coins - totalCost,
        rabbits: newRabbits,
        food: prev.food + ((item.effect.food || 0) * qty),
        water: prev.water + ((item.effect.water || 0) * qty),
        houses: prev.houses + ((item.effect.houses || 0) * qty),
        coinsSpentByDay: (() => {
          const list = [...prev.coinsSpentByDay];
          const idx = list.findIndex(e => e.day === prev.day);
          if (idx >= 0) {
            list[idx] = { day: prev.day, spent: list[idx].spent + totalCost };
          } else {
            list.push({ day: prev.day, spent: totalCost });
          }
          return list;
        })(),
      };

      if (item.effect.foodType) newState.foodType = item.effect.foodType;
      if (item.effect.waterType) newState.waterType = item.effect.waterType;

      // Apply new upgrade accumulators
      if (item.type === 'upgrade' && !item.effect.foodType && !item.effect.waterType) {
        if (item.effect.coinMultiplier) newState.coinMultiplier *= item.effect.coinMultiplier;
        if (item.effect.breedingBonusMultiplier) newState.breedingBonusMultiplier *= item.effect.breedingBonusMultiplier;
        if (item.effect.foodConsumptionMultiplier) newState.foodConsumptionMultiplier *= item.effect.foodConsumptionMultiplier;
        if (item.effect.waterConsumptionMultiplier) newState.waterConsumptionMultiplier *= item.effect.waterConsumptionMultiplier;
        if (item.effect.capacityBonusPerHouse) newState.capacityBonusPerHouse += item.effect.capacityBonusPerHouse;
        if (item.effect.passiveCoinsPerDay) newState.passiveCoinsPerDay += item.effect.passiveCoinsPerDay;
        if (item.effect.passiveFoodPerDay) newState.passiveFoodPerDay += item.effect.passiveFoodPerDay;
        if (item.effect.passiveWaterPerDay) newState.passiveWaterPerDay += item.effect.passiveWaterPerDay;
        if (item.effect.shopDiscountBonus) newState.shopDiscountBonus = Math.min(0.3, newState.shopDiscountBonus + item.effect.shopDiscountBonus);
        if (!newState.ownedUpgrades.includes(item.id)) newState.ownedUpgrades = [...newState.ownedUpgrades, item.id];
        if (newState.brokenUpgrades.includes(item.id)) {
          newState.brokenUpgrades = newState.brokenUpgrades.filter(id => id !== item.id);
        }
      }
      // If repurchasing broken food/water upgrades, clear their broken flags
      if (item.type === 'upgrade' && (item.effect.foodType || item.effect.waterType)) {
        if (newState.brokenUpgrades.includes(item.id)) {
          newState.brokenUpgrades = newState.brokenUpgrades.filter(id => id !== item.id);
        }
      }

      // Count repair if this purchase repaired a broken upgrade
      if (wasBroken) {
        newState.repairsCount = (newState.repairsCount ?? prev.repairsCount) + 1;
      }

      checkAchievements(newState);
      
      // Sync to Supabase after purchase
      syncPlayerProgress(newState);
      
      return newState;
    });

    // Play sound after state update
    setTimeout(() => purchaseSoundCallback?.(), 0);
    
    toast.success(`Purchased ${item.name}!`);
    return true;
  };

  const resetGame = () => {
    setGameState((prev) => {
      const finished = {
        day: prev.day,
        totalCoinsEarned: prev.totalCoinsEarned,
        endAt: Date.now(),
        rabbits: prev.rabbits.length,
        houses: prev.houses,
        achievements: [...(prev.unlockedAchievements || [])],
      };
      const history = [...(prev.runHistory || []), finished];

      // Determine best by total rabbits (new ranking metric)
      const best = history.reduce((a, b) => ((b.rabbits || 0) > (a.rabbits || 0) ? b : a), finished);

      // Sync the best run as the main leaderboard row
      try {
        // lightweight inline upsert without altering current state stats
        // defer import to avoid cycle costs
        import('@/services/playerDataSync').then(async (mod) => {
          const { supabase } = await import('@/lib/supabase');
          const { getOrCreatePlayerId } = await import('@/utils/playerId');
          const player_id = getOrCreatePlayerId();
          // Compare with existing rabbits total and only upsert if improved
          const { data: existing, error: fetchErr } = await supabase
            .from('player_progress')
            .select('rabbits_common, rabbits_rare, rabbits_legendary')
            .eq('player_id', player_id)
            .single();
          const existingTotal = existing ? ((existing.rabbits_common || 0) + (existing.rabbits_rare || 0) + (existing.rabbits_legendary || 0)) : 0;
          const bestRabbits = best.rabbits || 0;
          if (!fetchErr || (fetchErr && fetchErr.code === 'PGRST116') ) {
            if (bestRabbits > existingTotal) {
              await supabase.from('player_progress').upsert({
                player_id,
                achievements_count: best.achievements.length,
                achievements: best.achievements,
                day: best.day,
                house_capacity: best.houses * (4 + (prev.capacityBonusPerHouse || 0)),
                rabbits_common: bestRabbits,
                rabbits_rare: 0,
                rabbits_legendary: 0,
                current_coins: 0,
                total_rabbits_born: prev.totalRabbitsBorn,
                total_coins_earned: best.totalCoinsEarned,
                last_updated: new Date().toISOString(),
              }, { onConflict: 'player_id' });
            }
          }

          // Insert this finished run into player_runs history
          await supabase.from('player_runs').insert({
            player_id,
            run_ended_at: new Date(finished.endAt).toISOString(),
            day: finished.day,
            total_coins_earned: finished.totalCoinsEarned,
            rabbits: finished.rabbits,
            houses: finished.houses,
            achievements: finished.achievements,
          });
        });
      } catch {}

      const next: GameState = { ...INITIAL_STATE, runHistory: history } as GameState;
      setNewAchievement(null);
      localStorage.setItem('rabbitTycoonSave', JSON.stringify(next));
      toast.success('Game reset!');
      return next;
    });
  };

  const clearAchievementNotification = () => {
    setNewAchievement(null);
  };

  const dismissEvent = () => {
    setGameState((prev) => ({ ...prev, currentEvent: null }));
  };

  const cureFever = () => {
    setGameState((prev) => {
      const newState = {
        ...prev,
        feverActive: false,
        infectedIds: [],
        isolatedIds: [],
        infectionDays: {},
        infectionDeathAt: {},
        feverSurvivals: ((prev.feverSurvivals ?? 0) + 1),
      };
      
      // Sync to Supabase
      syncPlayerProgress(newState);
      
      return newState;
    });
    toast.success('You cured the fever. Rabbits are safe!');
  };

  const isolateAllInfected = () => {
    setGameState((prev) => {
      const isolated = Array.from(new Set([...(prev.infectedIds || [])]));
      toast.message('Infected rabbits isolated. Fever will end after 30 days.');
      return {
        ...prev,
        isolatedIds: isolated,
        feverIsolated: true,
      } as GameState;
    });
  };

  const cureFeverWithCost = (percent: number = 0.7) => {
    setGameState((prev) => {
      const cost = Math.floor(prev.coins * Math.min(1, Math.max(0, percent)));
      const next = {
        ...prev,
        coins: Math.max(0, prev.coins - cost),
        feverActive: false,
        infectedIds: [],
        isolatedIds: [],
        infectionDays: {},
        infectionDeathAt: {},
        feverSurvivals: ((prev.feverSurvivals ?? 0) + 1),
      };
      
      // Sync to Supabase
      syncPlayerProgress(next);
      
      toast.success(`Cured the fever for ${cost} coins (${Math.round(percent * 100)}% of savings).`);
      return next;
    });
  };

  return (
    <GameContext.Provider 
      value={{ 
        gameState, 
        nextDay: () => {
          nextDay();
          setTimeout(() => nextDaySoundCallback?.(), 0);
        },
        buyItem, 
        resetGame, 
        newAchievement: newAchievement as string,
        clearAchievementNotification,
        dismissEvent,
        cureFever,
        isolateAllInfected,
        cureFeverWithCost,
        getPrice,
        sellRabbits,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
