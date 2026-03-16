import { useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';

interface CelebrationProps {
  trigger: boolean;
  duration?: number;
  particleCount?: number;
  type?: 'confetti' | 'stars' | 'fireworks' | 'success';
}

export function Celebration({ 
  trigger, 
  duration = 3000, 
  particleCount = 100,
  type = 'confetti' 
}: CelebrationProps) {
  
  const fireConfetti = useCallback(() => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    // Multiple bursts for a more impressive effect
    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });
    fire(0.2, {
      spread: 60,
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  }, []);

  const fireStars = useCallback(() => {
    const defaults = {
      spread: 360,
      ticks: 50,
      gravity: 0,
      decay: 0.94,
      startVelocity: 30,
      shapes: ['star'] as confetti.Shape[],
      colors: ['FFE400', 'FFBD00', 'E89400', 'FFCA6C', 'FDFFB8'],
      zIndex: 9999,
    };

    confetti({
      ...defaults,
      particleCount: 40,
      scalar: 1.2,
      shapes: ['star'] as confetti.Shape[],
    });

    confetti({
      ...defaults,
      particleCount: 10,
      scalar: 0.75,
      shapes: ['circle'] as confetti.Shape[],
    });
  }, []);

  const fireFireworks = useCallback(() => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: ReturnType<typeof setInterval> = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  }, []);

  const fireSuccess = useCallback(() => {
    // Green/blue success colors
    const colors = ['#22c55e', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'];
    
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors,
      zIndex: 9999,
    });

    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
        zIndex: 9999,
      });
    }, 150);

    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
        zIndex: 9999,
      });
    }, 300);
  }, []);

  useEffect(() => {
    if (trigger) {
      switch (type) {
        case 'stars':
          fireStars();
          break;
        case 'fireworks':
          fireFireworks();
          break;
        case 'success':
          fireSuccess();
          break;
        case 'confetti':
        default:
          fireConfetti();
          break;
      }
    }
  }, [trigger, type, fireConfetti, fireStars, fireFireworks, fireSuccess]);

  return null;
}

// Hook for imperative celebration control
export function useCelebration() {
  const celebrate = useCallback((type: 'confetti' | 'stars' | 'fireworks' | 'success' = 'confetti') => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    };

    if (type === 'success') {
      const colors = ['#22c55e', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'];
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors,
        zIndex: 9999,
      });
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
          zIndex: 9999,
        });
      }, 150);
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors,
          zIndex: 9999,
        });
      }, 300);
      return;
    }

    if (type === 'stars') {
      confetti({
        spread: 360,
        ticks: 50,
        gravity: 0,
        decay: 0.94,
        startVelocity: 30,
        shapes: ['star'] as confetti.Shape[],
        colors: ['FFE400', 'FFBD00', 'E89400', 'FFCA6C', 'FDFFB8'],
        particleCount: 40,
        scalar: 1.2,
        zIndex: 9999,
      });
      return;
    }

    if (type === 'fireworks') {
      const duration = 2000;
      const animationEnd = Date.now() + duration;
      const interval: ReturnType<typeof setInterval> = setInterval(function() {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);
        confetti({
          startVelocity: 30,
          spread: 360,
          ticks: 60,
          particleCount: 50 * (timeLeft / duration),
          origin: { x: Math.random(), y: Math.random() - 0.2 },
          zIndex: 9999,
        });
      }, 250);
      return;
    }

    // Default confetti
    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  }, []);

  return { celebrate };
}
