import { useGame } from '@/contexts/GameContext';
import { RotateCcw, Skull } from 'lucide-react';

export const GameOverModal = () => {
  const { resetGame } = useGame();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" />
      <div className="relative bg-card border border-destructive/40 shadow-2xl rounded-2xl w-[92%] max-w-md p-6 text-center">
        <div className="mx-auto mb-3 w-14 h-14 rounded-full bg-red-100 text-red-700 flex items-center justify-center">
          <Skull className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-extrabold text-red-700">Game Over</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Your rabbit colony has perished. You don't have enough resources to keep it alive. Try a new strategy and build it back stronger!
        </p>
        <button
          className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 bg-primary text-primary-foreground hover:opacity-90"
          onClick={resetGame}
        >
          <RotateCcw className="w-4 h-4" /> Restart Game
        </button>
      </div>
    </div>
  );
}
