import { useEffect, useRef, useState } from 'react';

export const useSounds = () => {
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem('soundMuted');
    return saved === 'true';
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const bgMusicRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    localStorage.setItem('soundMuted', isMuted.toString());
  }, [isMuted]);

  const getAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  const playTone = (frequency: number, duration: number, type: OscillatorType = 'sine') => {
    if (isMuted) return;

    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  };

  const playPurchase = () => {
    if (isMuted) return;
    // Happy purchase sound - ascending notes
    playTone(523.25, 0.1, 'sine'); // C5
    setTimeout(() => playTone(659.25, 0.1, 'sine'), 100); // E5
    setTimeout(() => playTone(783.99, 0.15, 'sine'), 200); // G5
  };

  const playNextDay = () => {
    if (isMuted) return;
    // Morning bell sound
    playTone(880, 0.1, 'sine'); // A5
    setTimeout(() => playTone(1046.5, 0.2, 'sine'), 150); // C6
  };

  const playAchievement = () => {
    if (isMuted) return;
    // Triumphant fanfare
    playTone(523.25, 0.1, 'square'); // C5
    setTimeout(() => playTone(659.25, 0.1, 'square'), 100); // E5
    setTimeout(() => playTone(783.99, 0.1, 'square'), 200); // G5
    setTimeout(() => playTone(1046.5, 0.3, 'square'), 300); // C6
  };

  const playEvent = (isPositive: boolean) => {
    if (isMuted) return;
    if (isPositive) {
      // Positive event - bright chime
      playTone(1046.5, 0.15, 'sine'); // C6
      setTimeout(() => playTone(1318.51, 0.2, 'sine'), 150); // E6
    } else {
      // Negative event - low warning
      playTone(220, 0.2, 'triangle'); // A3
      setTimeout(() => playTone(196, 0.25, 'triangle'), 200); // G3
    }
  };

  const startBackgroundMusic = () => {
    if (isMuted || bgMusicRef.current) return;

    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Soft background drone
    oscillator.frequency.value = 110; // A2
    oscillator.type = 'sine';
    gainNode.gain.value = 0.02; // Very quiet

    oscillator.start();

    bgMusicRef.current = oscillator;
    gainNodeRef.current = gainNode;
  };

  const stopBackgroundMusic = () => {
    if (bgMusicRef.current) {
      bgMusicRef.current.stop();
      bgMusicRef.current = null;
      gainNodeRef.current = null;
    }
  };

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    
    if (newMutedState) {
      stopBackgroundMusic();
    }
  };

  return {
    isMuted,
    toggleMute,
    playPurchase,
    playNextDay,
    playAchievement,
    playEvent,
    startBackgroundMusic,
    stopBackgroundMusic,
  };
};
