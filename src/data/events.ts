export interface GameEvent {
  id: string;
  name: string;
  description: string;
  icon: string;
  effect: {
    coins?: number;
    food?: number;
    water?: number;
    rabbits?: number;
    houses?: number;
    breedingBonus?: number; // Temporary breeding multiplier
  };
  type: 'positive' | 'negative' | 'neutral';
  rarity: 'common' | 'uncommon' | 'rare';
}

export const RANDOM_EVENTS: GameEvent[] = [
  // Positive Events
  {
    id: 'generous-visitor',
    name: 'Generous Visitor',
    description: 'A kind traveler leaves you a gift of 50 coins!',
    icon: '🎁',
    effect: { coins: 50 },
    type: 'positive',
    rarity: 'common',
  },
  {
    id: 'food-delivery',
    name: 'Food Delivery',
    description: 'A local farmer drops off extra vegetables!',
    icon: '🥕',
    effect: { food: 20 },
    type: 'positive',
    rarity: 'common',
  },
  {
    id: 'rain-blessing',
    name: 'Blessed Rain',
    description: 'Fresh rainwater fills your reserves!',
    icon: '🌧️',
    effect: { water: 25 },
    type: 'positive',
    rarity: 'common',
  },
  {
    id: 'perfect-weather',
    name: 'Perfect Weather',
    description: 'The ideal conditions boost breeding success!',
    icon: '☀️',
    effect: { breedingBonus: 2 },
    type: 'positive',
    rarity: 'uncommon',
  },
  {
    id: 'treasure-find',
    name: 'Hidden Treasure',
    description: 'You discover a buried treasure worth 100 coins!',
    icon: '💰',
    effect: { coins: 100 },
    type: 'positive',
    rarity: 'rare',
  },
  {
    id: 'wandering-rabbit',
    name: 'Wandering Rabbit',
    description: 'A friendly rabbit joins your colony!',
    icon: '🐰',
    effect: { rabbits: 1 },
    type: 'positive',
    rarity: 'uncommon',
  },
  {
    id: 'supply-donation',
    name: 'Supply Donation',
    description: 'A charity organization donates food and water!',
    icon: '📦',
    effect: { food: 15, water: 15 },
    type: 'positive',
    rarity: 'uncommon',
  },
  {
    id: 'lucky-day',
    name: 'Lucky Day',
    description: 'Everything seems to be going your way! Bonus coins!',
    icon: '🍀',
    effect: { coins: 75 },
    type: 'positive',
    rarity: 'rare',
  },
  {
    id: 'free-house',
    name: 'Gifted Hutch',
    description: 'A benefactor donates a sturdy new house! Capacity +4.',
    icon: '🏠',
    effect: { houses: 1 },
    type: 'positive',
    rarity: 'rare',
  },

  // Negative Events
  {
    id: 'food-spoiled',
    name: 'Food Spoiled',
    description: 'Some of your food has gone bad.',
    icon: '🦠',
    effect: { food: -10 },
    type: 'negative',
    rarity: 'common',
  },
  {
    id: 'water-leak',
    name: 'Water Leak',
    description: 'A leak in your water tank wastes resources.',
    icon: '💧',
    effect: { water: -8 },
    type: 'negative',
    rarity: 'common',
  },
  {
    id: 'tax-collector',
    name: 'Tax Collector',
    description: 'The tax collector takes a portion of your earnings.',
    icon: '👔',
    effect: { coins: -30 },
    type: 'negative',
    rarity: 'common',
  },
  {
    id: 'storm-damage',
    name: 'Storm Damage',
    description: 'A storm damages some supplies.',
    icon: '⛈️',
    effect: { food: -5, water: -5, coins: -20 },
    type: 'negative',
    rarity: 'uncommon',
  },
  {
    id: 'predator-scare',
    name: 'Predator Scare',
    description: 'A predator frightens the rabbits, reducing breeding today.',
    icon: '🦊',
    effect: { breedingBonus: -0.5 },
    type: 'negative',
    rarity: 'uncommon',
  },
  {
    id: 'fox-attack',
    name: 'Fox Attack',
    description: 'A fox sneaks into the farm and eats about 10% of your rabbits.',
    icon: '🦊',
    effect: {},
    type: 'negative',
    rarity: 'uncommon',
  },
  {
    id: 'wolf-raid',
    name: 'Wolf Raid',
    description: 'A wolf pack raids the farm, taking roughly 20% of your rabbits.',
    icon: '🐺',
    effect: {},
    type: 'negative',
    rarity: 'uncommon',
  },
  {
    id: 'bear-rampage',
    name: 'Bear Rampage',
    description: 'A bear goes on a rampage! Up to 35% of your rabbits are lost.',
    icon: '🐻',
    effect: {},
    type: 'negative',
    rarity: 'rare',
  },
  {
    id: 'rabbit-fever',
    name: 'Rabbit Fever',
    description: '💀 A contagious fever is spreading! Breeding is heavily reduced and water needs spike on carrots. Take action to cure or isolate.',
    icon: '💀',
    effect: { breedingBonus: 0.25 },
    type: 'negative',
    rarity: 'rare',
  },

  // Neutral Events
  {
    id: 'peaceful-day',
    name: 'Peaceful Day',
    description: 'A calm, uneventful day on the farm.',
    icon: '😌',
    effect: {},
    type: 'neutral',
    rarity: 'common',
  },
  {
    id: 'traveling-merchant',
    name: 'Traveling Merchant',
    description: 'A merchant passes by but you have nothing to trade.',
    icon: '🛒',
    effect: {},
    type: 'neutral',
    rarity: 'common',
  },
];

// Helper function to get a random event based on rarity weights
export const getRandomEvent = (): GameEvent | null => {
  // 30% chance of an event occurring
  if (Math.random() > 0.3) return null;

  // Rarity weights: common (60%), uncommon (30%), rare (10%)
  const rarityRoll = Math.random();
  let targetRarity: 'common' | 'uncommon' | 'rare';
  
  if (rarityRoll < 0.6) {
    targetRarity = 'common';
  } else if (rarityRoll < 0.9) {
    targetRarity = 'uncommon';
  } else {
    targetRarity = 'rare';
  }

  const eligibleEvents = RANDOM_EVENTS.filter(e => e.rarity === targetRarity);
  return eligibleEvents[Math.floor(Math.random() * eligibleEvents.length)];
};
