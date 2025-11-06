import { useEffect, useState } from 'react';
import { Achievement } from '@/data/achievements';

interface AchievementNotificationProps {
  achievement: Achievement;
  onClose: () => void;
}

export const AchievementNotification = ({ achievement, onClose }: AchievementNotificationProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 100);
    
    // Auto-close after 4 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for exit animation
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-20 right-4 z-50 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl p-4 shadow-2xl border-2 border-yellow-300 max-w-sm transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="text-4xl animate-bounce">{achievement.icon}</div>
        <div className="flex-1">
          <div className="font-bold text-sm uppercase tracking-wide mb-1">Achievement Unlocked!</div>
          <div className="font-bold text-lg">{achievement.name}</div>
          <div className="text-sm text-white/90 mt-1">{achievement.description}</div>
        </div>
      </div>
    </div>
  );
};
