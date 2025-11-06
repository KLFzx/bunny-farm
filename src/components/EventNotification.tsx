import { useEffect, useState } from 'react';
import { GameEvent } from '@/data/events';

interface EventNotificationProps {
  event: GameEvent;
  onClose: () => void;
}

export const EventNotification = ({ event, onClose }: EventNotificationProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
    
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getBgColor = () => {
    switch (event.type) {
      case 'positive':
        return 'bg-gradient-to-r from-green-500 to-emerald-500';
      case 'negative':
        return 'bg-gradient-to-r from-red-500 to-rose-500';
      default:
        return 'bg-gradient-to-r from-blue-500 to-indigo-500';
    }
  };

  const getBorderColor = () => {
    switch (event.type) {
      case 'positive':
        return 'border-green-300';
      case 'negative':
        return 'border-red-300';
      default:
        return 'border-blue-300';
    }
  };

  return (
    <div
      className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 ${getBgColor()} text-white rounded-xl p-4 shadow-2xl border-2 ${getBorderColor()} max-w-md transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-10 opacity-0 scale-95'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="text-4xl">{event.icon}</div>
        <div className="flex-1">
          <div className="font-bold text-sm uppercase tracking-wide mb-1">
            {event.type === 'positive' ? '✨ Good Fortune!' : event.type === 'negative' ? '⚠️ Challenge' : '📰 News'}
          </div>
          <div className="font-bold text-lg">{event.name}</div>
          <div className="text-sm text-white/90 mt-1">{event.description}</div>
        </div>
      </div>
    </div>
  );
};
