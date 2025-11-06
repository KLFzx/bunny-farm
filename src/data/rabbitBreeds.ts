export interface RabbitBreed {
  id: string;
  name: string;
  rarity: 'common' | 'rare' | 'legendary';
  coinMultiplier: number; // Multiplier for coin generation
  breedingRate: number; // Multiplier for breeding chance
  icon: string;
  description: string;
}

export const RABBIT_BREEDS: Record<string, RabbitBreed> = {
  common: {
    id: 'common',
    name: 'Common Rabbit',
    rarity: 'common',
    coinMultiplier: 1,
    breedingRate: 1,
    icon: '🐰',
    description: 'Your everyday rabbit. Reliable and steady.',
  },
  rare: {
    id: 'rare',
    name: 'Angora Rabbit',
    rarity: 'rare',
    coinMultiplier: 1.5,
    breedingRate: 1.2,
    icon: '🐇',
    description: 'A fluffy Angora rabbit. Produces 50% more coins!',
  },
  legendary: {
    id: 'legendary',
    name: 'Golden Rabbit',
    rarity: 'legendary',
    coinMultiplier: 2.5,
    breedingRate: 1.5,
    icon: '✨',
    description: 'A legendary golden rabbit! Massive coin boost!',
  },
};
