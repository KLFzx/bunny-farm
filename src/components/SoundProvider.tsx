import { useGame } from '@/contexts/GameContext';
import { useSounds } from '@/hooks/useSounds';
import { useEffect } from 'react';

export const SoundProvider = ({ children }: { children: React.ReactNode }) => {
  const { gameState } = useGame();
  const { playPurchase, playNextDay } = useSounds();

  // This component can listen for specific state changes
  // But we'll handle sounds in the components directly for better control

  return <>{children}</>;
};
