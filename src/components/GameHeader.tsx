import { Button } from '@/components/ui/button';
import { Coins, RotateCcw, ShoppingBag, Volume2, VolumeX, BarChart3, Trophy } from 'lucide-react';
import { useGame } from '@/contexts/GameContext';

interface GameHeaderProps {
  onToggleShop: () => void;
  showingShop: boolean;
  onToggleStats: () => void;
  showingStats: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onToggleRanks: () => void;
  showingRanks: boolean;
}

export const GameHeader = ({ 
  onToggleShop, 
  showingShop, 
  onToggleStats, 
  showingStats,
  isMuted,
  onToggleMute,
  onToggleRanks,
  showingRanks,
}: GameHeaderProps) => {
  const { gameState, resetGame } = useGame();

  return (
    <header className={`border-b shadow-card sticky top-0 z-10 backdrop-blur-sm ${gameState.feverActive ? 'bg-red-900/80 border-red-600' : 'bg-card/95 border-border'}`}>
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center justify-between gap-2">{/* Changed gap from 4 to 2 for mobile */}
          <div className="flex items-center gap-2 md:gap-4">{/* Responsive gap */}
            <h1 className={`text-lg md:text-2xl lg:text-3xl font-bold ${gameState.feverActive ? 'text-red-200' : 'text-primary'}`}>
              🐰 Rabbit Tycoon
            </h1>
            <div className={`hidden sm:flex items-center gap-2 px-3 md:px-4 py-2 rounded-full ${gameState.feverActive ? 'bg-red-800/60' : 'bg-accent/20'}`}>
              <span className="text-xs md:text-sm font-medium">Day</span>
              <span className={`text-lg md:text-xl font-bold ${gameState.feverActive ? 'text-red-300' : 'text-accent'}`}>{gameState.day}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1 md:gap-3">{/* Responsive gap */}
            <div className={`flex items-center gap-2 px-2 md:px-4 py-2 rounded-full ${gameState.feverActive ? 'bg-red-800/60' : 'bg-accent/20'}`}>
              <Coins className={`w-4 h-4 md:w-5 md:h-5 ${gameState.feverActive ? 'text-red-300' : 'text-accent'}`} />
              <span className={`font-bold text-sm md:text-base ${gameState.feverActive ? 'text-red-200' : 'text-accent'}`}>{gameState.coins}</span>
            </div>
            
            <Button
              onClick={onToggleMute}
              variant="outline"
              size="sm"
              className="hidden sm:flex"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            
            <Button
              onClick={onToggleStats}
              variant={showingStats ? "default" : "outline"}
              size="sm"
              className="gap-1 md:gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Stats</span>
            </Button>
            
            <Button
              onClick={onToggleRanks}
              variant={showingRanks ? "default" : "outline"}
              size="sm"
              className="gap-1 md:gap-2"
            >
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">Ranks</span>
            </Button>
            
            <Button
              onClick={onToggleShop}
              variant={showingShop ? "default" : "outline"}
              size="sm"
              className="gap-1 md:gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Shop</span>
            </Button>
            
            <Button
              onClick={resetGame}
              variant="outline"
              size="sm"
              className="hidden lg:flex"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>

            {/* Fever actions moved to FeverModal popup */}
          </div>
        </div>
        
        {/* Mobile Day Counter */}
        <div className={`sm:hidden flex items-center gap-2 px-3 py-1.5 rounded-full mt-2 w-fit ${gameState.feverActive ? 'bg-red-800/60' : 'bg-accent/20'}`}>
          <span className="text-xs font-medium">Day</span>
          <span className={`text-base font-bold ${gameState.feverActive ? 'text-red-300' : 'text-accent'}`}>{gameState.day}</span>
        </div>

        {/* Fever actions moved to FeverModal popup */}
      </div>
    </header>
  );
};
