import { useState, useEffect } from 'react';
import { GameProvider, useGame, setSoundCallbacks } from '@/contexts/GameContext';
import { GameHeader } from '@/components/GameHeader';
import { Dashboard } from '@/components/Dashboard';
import { Shop } from '@/components/Shop';
import { Statistics } from '@/components/Statistics';
import { Leaderboard } from '@/components/Leaderboard';
import farmBackground from '@/assets/farm-background.jpg';
import { AchievementNotification } from '@/components/AchievementNotification';
import { EventNotification } from '@/components/EventNotification';
import { FeverModal } from '@/components/FeverModal';
import { ACHIEVEMENTS } from '@/data/achievements';
import { GameOverModal } from '@/components/GameOverModal';
import { useSounds } from '@/hooks/useSounds';

const GameContent = () => {
  const [showShop, setShowShop] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showRanks, setShowRanks] = useState(false);
  const { gameState, newAchievement, clearAchievementNotification, dismissEvent } = useGame();
  const { isMuted, toggleMute, playAchievement, playEvent } = useSounds();
  
  const currentAchievement = newAchievement 
    ? ACHIEVEMENTS.find(a => a.id === newAchievement) 
    : null;

  // Play sound when achievement unlocked
  useEffect(() => {
    if (currentAchievement) {
      playAchievement();
    }
  }, [currentAchievement, playAchievement]);

  // Play sound when event occurs
  useEffect(() => {
    if (gameState.currentEvent) {
      playEvent(gameState.currentEvent.type === 'positive');
    }
  }, [gameState.currentEvent, playEvent]);

  // Set sound callbacks
  const { playPurchase, playNextDay } = useSounds();
  useEffect(() => {
    setSoundCallbacks(playPurchase, playNextDay);
  }, [playPurchase, playNextDay]);

  return (
    <div className="min-h-screen bg-gradient-sky">
      <div 
        className="fixed inset-0 opacity-20 bg-cover bg-center"
        style={{ backgroundImage: `url(${farmBackground})` }}
      />
      {gameState.feverActive && (
        <div className="fixed inset-0 bg-red-900/40 backdrop-blur-[1px]" />
      )}
      
      <div className="relative z-10">
        <GameHeader 
          onToggleShop={() => {
            setShowShop(!showShop);
            setShowStats(false);
            setShowRanks(false);
          }}
          showingShop={showShop}
          onToggleStats={() => {
            setShowStats(!showStats);
            setShowShop(false);
            setShowRanks(false);
          }}
          showingStats={showStats}
          isMuted={isMuted}
          onToggleMute={toggleMute}
          onToggleRanks={() => {
            setShowRanks(!showRanks);
            setShowShop(false);
            setShowStats(false);
          }}
          showingRanks={showRanks}
        />
        
        <main className="container mx-auto px-3 md:px-4 py-4 md:py-8 max-w-6xl">
          <div className="animate-slide-up">
            {showShop ? <Shop /> : showRanks ? <Leaderboard /> : showStats ? <Statistics /> : <Dashboard />}
          </div>
        </main>
        
        <footer className={`text-center py-4 md:py-6 text-xs md:text-sm ${gameState.feverActive ? 'text-red-200/80' : 'text-muted-foreground'}`}>
          <p>🐰 Rabbit Tycoon • Build your rabbit empire! • Approved & designed by Albert</p>
        </footer>
      </div>
      
      {/* Notifications */}
      {currentAchievement && (
        <AchievementNotification
          achievement={currentAchievement}
          onClose={clearAchievementNotification}
        />
      )}
      
      {gameState.currentEvent && gameState.currentEvent.id !== 'rabbit-fever' && (
        <EventNotification
          event={gameState.currentEvent}
          onClose={dismissEvent}
        />
      )}
      {gameState.currentEvent && gameState.currentEvent.id === 'rabbit-fever' && (
        <FeverModal onClose={dismissEvent} />
      )}
      {gameState.rabbits.length === 0 && (
        <GameOverModal />
      )}
    </div>
  );
};

const Index = () => {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
};

export default Index;
