'use client';

/**
 * Fondos animados para FTP Digital Plus.
 * Todos usan animaciones CSS puras (sin JS por rendimiento),
 * son absolutamente posicionados y cubren todo su contenedor padre,
 * y respetan `prefers-reduced-motion`.
 *
 * Paleta: esmeralda (#059669) + oro (#f59e0b).
 */

import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Mesh Gradient — gradiente animado esmeralda + oro                 */
/* ------------------------------------------------------------------ */

export function MeshGradientBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden',
        className,
      )}
    >
      {/* Capa base: gradiente mesh animado */}
      <div className="mesh-gradient-animated absolute inset-0" />

      {/* Resplandores esmeralda y oro */}
      <div
        className="absolute -left-24 -top-24 size-96 rounded-full opacity-60 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, oklch(0.55 0.15 160 / 0.35) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute -bottom-32 -right-16 size-[28rem] rounded-full opacity-60 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, oklch(0.75 0.18 85 / 0.3) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute left-1/2 top-1/3 size-72 -translate-x-1/2 rounded-full opacity-40 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, oklch(0.6 0.12 180 / 0.25) 0%, transparent 70%)',
        }}
      />

      {/* Patrón de puntos sutil */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, oklch(0.55 0.15 160) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Particle Background — puntos que flotan lentamente                */
/* ------------------------------------------------------------------ */

interface ParticleConfig {
  size: number;
  top: string;
  left: string;
  delay: string;
  duration: string;
  color: 'emerald' | 'gold' | 'teal';
  opacity: number;
}

const PARTICLES: ParticleConfig[] = [
  { size: 6, top: '12%', left: '8%', delay: '0s', duration: '18s', color: 'emerald', opacity: 0.5 },
  { size: 4, top: '20%', left: '32%', delay: '2s', duration: '22s', color: 'gold', opacity: 0.6 },
  { size: 8, top: '68%', left: '12%', delay: '1s', duration: '20s', color: 'teal', opacity: 0.4 },
  { size: 5, top: '40%', left: '52%', delay: '3s', duration: '24s', color: 'emerald', opacity: 0.5 },
  { size: 3, top: '80%', left: '38%', delay: '0.5s', duration: '16s', color: 'gold', opacity: 0.7 },
  { size: 7, top: '25%', left: '75%', delay: '2.5s', duration: '26s', color: 'emerald', opacity: 0.45 },
  { size: 4, top: '55%', left: '88%', delay: '1.5s', duration: '21s', color: 'teal', opacity: 0.5 },
  { size: 6, top: '85%', left: '68%', delay: '3.5s', duration: '23s', color: 'gold', opacity: 0.55 },
  { size: 3, top: '15%', left: '60%', delay: '4s', duration: '17s', color: 'emerald', opacity: 0.6 },
  { size: 5, top: '75%', left: '92%', delay: '0.8s', duration: '19s', color: 'gold', opacity: 0.5 },
  { size: 4, top: '35%', left: '18%', delay: '2.2s', duration: '25s', color: 'teal', opacity: 0.45 },
  { size: 6, top: '50%', left: '42%', delay: '1.2s', duration: '20s', color: 'emerald', opacity: 0.5 },
];

const PARTICLE_COLORS: Record<ParticleConfig['color'], string> = {
  emerald: 'oklch(0.55 0.15 160)',
  gold: 'oklch(0.75 0.18 85)',
  teal: 'oklch(0.6 0.12 180)',
};

export function ParticleBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden',
        className,
      )}
    >
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            top: p.top,
            left: p.left,
            backgroundColor: PARTICLE_COLORS[p.color],
            opacity: p.opacity,
            animation: `particle-float ${p.duration} ease-in-out ${p.delay} infinite`,
            boxShadow: `0 0 8px ${PARTICLE_COLORS[p.color]}`,
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Grid Pattern Background — cuadrícula sutil + overlay gradiente     */
/* ------------------------------------------------------------------ */

export function GridPatternBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden',
        className,
      )}
    >
      {/* Cuadrícula base */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'linear-gradient(oklch(0.55 0.15 160 / 0.12) 1px, transparent 1px), linear-gradient(90deg, oklch(0.55 0.15 160 / 0.12) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Overlay con gradiente esmeralda → oro */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at top, oklch(0.55 0.15 160 / 0.08) 0%, transparent 60%), radial-gradient(ellipse at bottom right, oklch(0.75 0.18 85 / 0.08) 0%, transparent 60%)',
        }}
      />

      {/* Máscara para difuminar los bordes */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 0%, transparent 50%, oklch(0.99 0.005 150 / 0.9) 100%)',
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Aurora Background — aurora animada esmeralda + teal + oro          */
/* ------------------------------------------------------------------ */

export function AuroraBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden',
        className,
      )}
    >
      {/* Capa base oscura para que la aurora destaque */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900" />

      {/* Tres blobs de aurora con animación CSS */}
      <div
        className="absolute -inset-[20%] opacity-60 blur-3xl"
        style={{
          background:
            'conic-gradient(from 0deg at 30% 40%, oklch(0.55 0.15 160 / 0.8), oklch(0.6 0.12 180 / 0.6), oklch(0.75 0.18 85 / 0.5), oklch(0.55 0.15 160 / 0.8))',
          animation: 'aurora 18s ease-in-out infinite',
        }}
      />
      <div
        className="absolute -inset-[15%] opacity-40 blur-3xl"
        style={{
          background:
            'conic-gradient(from 180deg at 70% 60%, oklch(0.6 0.12 200 / 0.7), oklch(0.55 0.15 160 / 0.5), oklch(0.75 0.18 85 / 0.6), oklch(0.6 0.12 200 / 0.7))',
          animation: 'aurora 22s ease-in-out infinite reverse',
        }}
      />

      {/* Estrellas sutiles */}
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Viñeta para contraste con texto */}
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/40 via-transparent to-transparent" />
    </div>
  );
}
