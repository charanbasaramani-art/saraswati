import { useState, useEffect } from 'react';
import { Flame } from 'lucide-react';

export function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'dark' | 'glow' | 'spread' | 'fade'>('dark');

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('glow'), 400),
      setTimeout(() => setPhase('spread'), 1200),
      setTimeout(() => setPhase('fade'), 2400),
      setTimeout(() => onComplete(), 3200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-700 ${
        phase === 'fade' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ background: 'hsl(20 15% 6%)' }}
    >
      {/* Radial golden glow */}
      <div
        className="absolute inset-0 transition-opacity duration-1000"
        style={{
          background: 'radial-gradient(circle at 50% 45%, hsl(40 70% 45% / 0.35) 0%, hsl(40 70% 45% / 0.08) 40%, transparent 70%)',
          opacity: phase === 'dark' ? 0 : phase === 'glow' ? 0.6 : 1,
        }}
      />

      {/* Lotus bloom ring */}
      <div
        className="absolute transition-all duration-1000 ease-out rounded-full"
        style={{
          width: phase === 'spread' ? '600px' : '120px',
          height: phase === 'spread' ? '600px' : '120px',
          background: 'radial-gradient(circle, hsl(40 70% 50% / 0.12) 0%, transparent 70%)',
          opacity: phase === 'dark' ? 0 : 0.8,
        }}
      />

      {/* Diya lamp */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Flame */}
        <div
          className={`transition-all duration-700 ${
            phase === 'dark' ? 'opacity-0 scale-50' : 'opacity-100 scale-100'
          }`}
        >
          <div className="relative">
            <Flame
              className={`h-16 w-16 text-amber-400 drop-shadow-[0_0_20px_hsl(40_80%_50%/0.8)] ${
                phase !== 'dark' ? 'flame-flicker' : ''
              }`}
            />
            {/* Glow behind flame */}
            <div
              className="absolute inset-0 rounded-full blur-xl transition-opacity duration-700"
              style={{
                background: 'hsl(40 80% 50% / 0.4)',
                opacity: phase === 'dark' ? 0 : 1,
              }}
            />
          </div>
        </div>

        {/* Lamp base (diya shape) */}
        <div
          className={`mt-1 transition-all duration-500 ${
            phase === 'dark' ? 'opacity-30' : 'opacity-100'
          }`}
        >
          <svg width="60" height="24" viewBox="0 0 60 24" fill="none">
            <ellipse cx="30" cy="12" rx="28" ry="10" fill="hsl(30 45% 40%)" />
            <ellipse cx="30" cy="10" rx="24" ry="7" fill="hsl(40 60% 50%)" />
            <ellipse cx="30" cy="9" rx="18" ry="4" fill="hsl(40 70% 60%)" opacity="0.6" />
          </svg>
        </div>

        {/* Lotus petals around diya */}
        <div
          className={`absolute -bottom-4 transition-all duration-1000 ${
            phase === 'spread' ? 'opacity-60 scale-100' : 'opacity-0 scale-75'
          }`}
        >
          <svg width="120" height="40" viewBox="0 0 120 40" fill="none">
            {[0, 1, 2, 3, 4].map((i) => (
              <ellipse
                key={i}
                cx={60 + Math.cos((i * 72 - 90) * Math.PI / 180) * 35}
                cy={20 + Math.sin((i * 72 - 90) * Math.PI / 180) * 12}
                rx="14"
                ry="6"
                fill="hsl(340 55% 65%)"
                opacity="0.3"
                transform={`rotate(${i * 72 - 90} ${60 + Math.cos((i * 72 - 90) * Math.PI / 180) * 35} ${20 + Math.sin((i * 72 - 90) * Math.PI / 180) * 12})`}
              />
            ))}
          </svg>
        </div>
      </div>

      {/* Text */}
      <p
        className={`mt-12 text-sm font-serif tracking-widest uppercase transition-opacity duration-700 z-10 ${
          phase === 'dark' ? 'opacity-0' : 'opacity-70'
        }`}
        style={{ color: 'hsl(40 50% 70%)' }}
      >
        Initializing SRAI – Saraswati Resume AI...
      </p>

      {/* Subtle particle dots */}
      {phase !== 'dark' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full animate-soft-glow"
              style={{
                width: '3px',
                height: '3px',
                background: 'hsl(40 70% 60%)',
                top: `${20 + Math.random() * 60}%`,
                left: `${20 + Math.random() * 60}%`,
                animationDelay: `${i * 0.4}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
