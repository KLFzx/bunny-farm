export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: (stats: GameStats) => boolean;
  category: 'rabbits' | 'coins' | 'days' | 'resources' | 'upgrades';
}

export interface GameStats {
  rabbits: number;
  coins: number;
  day: number;
  totalRabbitsBorn: number;
  totalCoinsEarned: number;
  houses: number;
  foodType: string;
  waterType: string;
  ownedUpgrades?: string[];
  breaksCount?: number;
  repairsCount?: number;
  feverSurvivals?: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  // Rabbit Achievements
  {
    id: 'first-rabbit',
    name: 'First Steps',
    description: 'Welcome your first rabbit',
    icon: '🐰',
    category: 'rabbits',
    requirement: (stats) => stats.rabbits >= 1,
  },
  {
    id: 'colony-5',
    name: 'Small Colony',
    description: 'Grow your colony to 5 rabbits',
    icon: '🐇',
    category: 'rabbits',
    requirement: (stats) => stats.rabbits >= 5,
  },
  {
    id: 'colony-10',
    name: 'Growing Family',
    description: 'Reach 10 rabbits',
    icon: '👨‍👩‍👧‍👦',
    category: 'rabbits',
    requirement: (stats) => stats.rabbits >= 10,
  },
  {
    id: 'colony-25',
    name: 'Rabbit Empire',
    description: 'Build an empire of 25 rabbits',
    icon: '👑',
    category: 'rabbits',
    requirement: (stats) => stats.rabbits >= 25,
  },
  {
    id: 'breeder-100',
    name: 'Master Breeder',
    description: 'Birth 100 rabbits total',
    icon: '🌟',
    category: 'rabbits',
    requirement: (stats) => stats.totalRabbitsBorn >= 100,
  },

  // Coin Achievements
  {
    id: 'coins-100',
    name: 'Penny Pincher',
    description: 'Accumulate 100 coins',
    icon: '💰',
    category: 'coins',
    requirement: (stats) => stats.coins >= 100,
  },
  {
    id: 'coins-500',
    name: 'Small Fortune',
    description: 'Accumulate 500 coins',
    icon: '💵',
    category: 'coins',
    requirement: (stats) => stats.coins >= 500,
  },
  {
    id: 'coins-1000',
    name: 'Coin Collector',
    description: 'Accumulate 1,000 coins',
    icon: '💎',
    category: 'coins',
    requirement: (stats) => stats.coins >= 1000,
  },
  {
    id: 'earnings-5000',
    name: 'Tycoon',
    description: 'Earn 5,000 coins total',
    icon: '🏆',
    category: 'coins',
    requirement: (stats) => stats.totalCoinsEarned >= 5000,
  },

  // Day Achievements
  {
    id: 'day-7',
    name: 'First Week',
    description: 'Survive for 7 days',
    icon: '📅',
    category: 'days',
    requirement: (stats) => stats.day >= 7,
  },
  {
    id: 'day-30',
    name: 'One Month Strong',
    description: 'Survive for 30 days',
    icon: '📆',
    category: 'days',
    requirement: (stats) => stats.day >= 30,
  },
  {
    id: 'day-50',
    name: 'Dedicated Farmer',
    description: 'Survive for 50 days',
    icon: '🎖️',
    category: 'days',
    requirement: (stats) => stats.day >= 50,
  },
  {
    id: 'day-100',
    name: 'Century Club',
    description: 'Reach day 100',
    icon: '💯',
    category: 'days',
    requirement: (stats) => stats.day >= 100,
  },
  {
    id: 'day-1000',
    name: 'Ranch Owner',
    description: 'Reach day 1000',
    icon: '🐰',
    category: 'days',
    requirement: (stats) => stats.day >= 1000,
  },

  // Resource/Upgrade Achievements
  {
    id: 'house-5',
    name: 'Real Estate Mogul',
    description: 'Own 5 rabbit houses',
    icon: '🏘️',
    category: 'resources',
    requirement: (stats) => stats.houses >= 5,
  },
  {
    id: 'lettuce-garden',
    name: 'Lettuce Garden',
    description: 'Upgrade to lettuce',
    icon: '🥬',
    category: 'upgrades',
    requirement: (stats) => stats.foodType === 'lettuce',
  },
  {
    id: 'premium-food',
    name: 'Gourmet Chef',
    description: 'Upgrade to premium pellets',
    icon: '🌾',
    category: 'upgrades',
    requirement: (stats) => stats.foodType === 'pellets',
  },
  {
    id: 'purified-water',
    name: 'Water Connoisseur',
    description: 'Upgrade to purified water',
    icon: '💎',
    category: 'upgrades',
    requirement: (stats) => stats.waterType === 'purified',
  },
  // New upgrade achievements
  {
    id: 'upg-training-grounds',
    name: 'Training Grounds',
    description: 'Build training grounds (+25% coins)',
    icon: '🥇',
    category: 'upgrades',
    requirement: (stats) => !!stats.ownedUpgrades?.includes('training-grounds'),
  },
  {
    id: 'upg-bunny-nursery',
    name: 'Bunny Nursery',
    description: 'Open a bunny nursery (+25% breeding)',
    icon: '🍼',
    category: 'upgrades',
    requirement: (stats) => !!stats.ownedUpgrades?.includes('bunny-nursery'),
  },
  {
    id: 'upg-fertilizer-system',
    name: 'Fertilizer System',
    description: 'Install fertilizer system (-25% food use)',
    icon: '🧪',
    category: 'upgrades',
    requirement: (stats) => !!stats.ownedUpgrades?.includes('fertilizer-system'),
  },
  {
    id: 'upg-hydration-station',
    name: 'Hydration Station',
    description: 'Install hydration station (-25% water use)',
    icon: '🚿',
    category: 'upgrades',
    requirement: (stats) => !!stats.ownedUpgrades?.includes('hydration-station'),
  },
  {
    id: 'upg-carrot-farm',
    name: 'Carrot Farm',
    description: 'Start a carrot farm (+food/day)',
    icon: '🌾',
    category: 'upgrades',
    requirement: (stats) => !!stats.ownedUpgrades?.includes('carrot-farm'),
  },
  {
    id: 'upg-deep-well',
    name: 'Deep Well',
    description: 'Dig a deep well (+water/day)',
    icon: '🏞️',
    category: 'upgrades',
    requirement: (stats) => !!stats.ownedUpgrades?.includes('deep-well'),
  },
  {
    id: 'upg-solar-panels',
    name: 'Solar Panels',
    description: 'Install solar panels (+coins/day)',
    icon: '🔆',
    category: 'upgrades',
    requirement: (stats) => !!stats.ownedUpgrades?.includes('solar-panels'),
  },
  {
    id: 'upg-market-stall',
    name: 'Market Stall',
    description: 'Open a market stall (+coins)',
    icon: '🛒',
    category: 'upgrades',
    requirement: (stats) => !!stats.ownedUpgrades?.includes('market-stall'),
  },
  {
    id: 'upg-logistics-network',
    name: 'Logistics Network',
    description: 'Build a logistics network (shop discounts)',
    icon: '📦',
    category: 'upgrades',
    requirement: (stats) => !!stats.ownedUpgrades?.includes('logistics-network'),
  },
  {
    id: 'upg-purifier-plus',
    name: 'Purifier Plus',
    description: 'Enhance your purifier (+breeding)',
    icon: '💠',
    category: 'upgrades',
    requirement: (stats) => !!stats.ownedUpgrades?.includes('purifier-plus'),
  },
  // Break/Repair Achievements
  {
    id: 'first-break',
    name: 'Uh Oh!'
    ,
    description: 'Experience your first upgrade break',
    icon: '💥',
    category: 'upgrades',
    requirement: (stats) => (stats.breaksCount || 0) >= 1,
  },
  {
    id: 'first-repair',
    name: 'Fix-It Bun',
    description: 'Repair your first broken upgrade',
    icon: '🛠️',
    category: 'upgrades',
    requirement: (stats) => (stats.repairsCount || 0) >= 1,
  },
  {
    id: 'full-upgrade',
    name: 'Perfectionist',
    description: 'Get all upgrades',
    icon: '⭐',
    category: 'upgrades',
    requirement: (stats) => stats.foodType === 'pellets' && stats.waterType === 'purified',
  },
  // Event Achievements (grouped under 'days')
  {
    id: 'survive-fever',
    name: 'Plague Survivor',
    description: 'Survive a Rabbit Fever outbreak',
    icon: '🧫',
    category: 'days',
    requirement: (stats) => (stats.feverSurvivals || 0) >= 1,
  },
];
