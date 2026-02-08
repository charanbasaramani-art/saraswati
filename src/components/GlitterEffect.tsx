import { useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
  angle: number;
  distance: number;
}

const GLITTER_COLORS = [
  "hsl(350 80% 65%)",
  "hsl(30 90% 60%)",
  "hsl(55 85% 55%)",
  "hsl(160 70% 50%)",
  "hsl(210 80% 60%)",
  "hsl(270 75% 65%)",
  "hsl(320 70% 62%)",
  "hsl(45 95% 70%)",
  "hsl(0 0% 100%)",
  "hsl(200 90% 70%)",
];

export function GlitterEffect({ trigger }: { trigger: number }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (trigger === 0) return;

    const count = 80;
    const newParticles: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 2,
      color: GLITTER_COLORS[Math.floor(Math.random() * GLITTER_COLORS.length)],
      delay: Math.random() * 0.3,
      duration: 0.6 + Math.random() * 0.8,
      angle: Math.random() * 360,
      distance: 20 + Math.random() * 60,
    }));

    setParticles(newParticles);
    const timeout = setTimeout(() => setParticles([]), 1800);
    return () => clearTimeout(timeout);
  }, [trigger]);

  if (particles.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 9999,
        overflow: "hidden",
      }}
    >
      {particles.map((p) => {
        const rad = (p.angle * Math.PI) / 180;
        const tx = Math.cos(rad) * p.distance;
        const ty = Math.sin(rad) * p.distance;

        return (
          <span
            key={p.id}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: p.color,
              boxShadow: `0 0 ${p.size * 2}px ${p.color}, 0 0 ${p.size * 4}px ${p.color}`,
              animation: `glitter-burst ${p.duration}s ${p.delay}s ease-out forwards`,
              opacity: 0,
              ["--tx" as string]: `${tx}px`,
              ["--ty" as string]: `${ty}px`,
            }}
          />
        );
      })}
    </div>
  );
}
