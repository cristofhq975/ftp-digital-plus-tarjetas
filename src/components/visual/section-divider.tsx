'use client';

/**
 * Divisores de sección SVG para la landing page de FTP Digital Plus.
 * Cada divisor cubre todo el ancho, es responsivo y conserva la relación
 * de aspecto mediante `preserveAspectRatio="none"`.
 *
 * Paleta: esmeralda (#059669) + oro (#f59e0b).
 *
 * Uso típico:
 *   <section className="bg-white">...</section>
 *   <WaveDivider />
 *   <section className="bg-emerald-700">...</section>
 *
 *   o entre dos secciones del mismo color:
 *   <WaveDivider fillTop="white" fillBottom="transparent" />
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

interface DividerProps {
  /** Color de relleno superior. Por defecto `white`. */
  fillTop?: string;
  /** Color de relleno inferior (segunda capa). Por defecto `transparent`. */
  fillBottom?: string;
  /** Altura en píxeles. Por defecto 64. */
  height?: number;
  /** Clase CSS adicional para el contenedor. */
  className?: string;
  /** Voltear verticalmente. Útil para usar como divisor inferior. */
  flip?: boolean;
}

/* ------------------------------------------------------------------ */
/*  WaveDivider — onda suave                                          */
/* ------------------------------------------------------------------ */

export function WaveDivider({
  fillTop = 'white',
  fillBottom = 'transparent',
  height = 64,
  className,
  flip = false,
}: DividerProps) {
  return (
    <div
      className={cn('relative w-full leading-[0]', flip && 'rotate-180', className)}
      style={{ height }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 80"
        className="block h-full w-full"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="ftp-wave-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="oklch(0.55 0.15 160)" />
            <stop offset="50%" stopColor="oklch(0.6 0.12 170)" />
            <stop offset="100%" stopColor="oklch(0.75 0.18 85)" />
          </linearGradient>
        </defs>
        {/* Capa inferior — onda de respaldo */}
        <path
          d="M0,40 C240,80 480,0 720,32 C960,64 1200,16 1440,48 L1440,80 L0,80 Z"
          fill={fillBottom}
          opacity="0.5"
        />
        {/* Capa superior — onda principal con gradiente */}
        <path
          d="M0,32 C360,80 1080,80 1440,32 L1440,80 L0,80 Z"
          fill={fillTop}
          fillOpacity="0.96"
        />
        {/* Línea de gradiente sutil sobre la onda */}
        <path
          d="M0,32 C360,80 1080,80 1440,32"
          stroke="url(#ftp-wave-grad)"
          strokeWidth="2"
          fill="none"
        />
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CurveDivider — curva suave sin ondas                              */
/* ------------------------------------------------------------------ */

export function CurveDivider({
  fillTop = 'white',
  height = 48,
  className,
  flip = false,
}: DividerProps) {
  return (
    <div
      className={cn('relative w-full leading-[0]', flip && 'rotate-180', className)}
      style={{ height }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 60"
        className="block h-full w-full"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="ftp-curve-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="oklch(0.55 0.15 160)" />
            <stop offset="100%" stopColor="oklch(0.75 0.18 85)" />
          </linearGradient>
        </defs>
        <path
          d="M0,32 C360,0 1080,0 1440,32 L1440,60 L0,60 Z"
          fill={fillTop}
        />
        <path
          d="M0,32 C360,0 1080,0 1440,32"
          stroke="url(#ftp-curve-grad)"
          strokeWidth="2.5"
          fill="none"
        />
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  TriangleDivider — patrón de triángulos                             */
/* ------------------------------------------------------------------ */

export function TriangleDivider({
  fillTop = 'white',
  height = 56,
  className,
  flip = false,
}: DividerProps) {
  // Genera triángulos equiláteros a lo largo del ancho
  const triangles = Array.from({ length: 24 }, (_, i) => i);
  return (
    <div
      className={cn(
        'relative w-full overflow-hidden leading-[0]',
        flip && 'rotate-180',
        className,
      )}
      style={{ height, backgroundColor: fillTop }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 56"
        className="block h-full w-full"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="ftp-tri-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="oklch(0.55 0.15 160)" />
            <stop offset="50%" stopColor="oklch(0.6 0.12 170)" />
            <stop offset="100%" stopColor="oklch(0.75 0.18 85)" />
          </linearGradient>
        </defs>
        {/* Rectángulo base */}
        <rect x="0" y="28" width="1440" height="28" fill={fillTop} />
        {/* Triángulos invertidos */}
        {triangles.map(i => {
          const w = 1440 / triangles.length;
          const x = i * w;
          return (
            <polygon
              key={i}
              points={`${x},28 ${x + w / 2},0 ${x + w},28`}
              fill={fillTop}
            />
          );
        })}
        {/* Línea de gradiente sobre los triángulos */}
        <line
          x1="0"
          y1="28"
          x2="1440"
          y2="28"
          stroke="url(#ftp-tri-grad)"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  DotsDivider — patrón de puntos                                     */
/* ------------------------------------------------------------------ */

export function DotsDivider({
  height = 56,
  className,
  flip = false,
}: Pick<DividerProps, 'height' | 'className' | 'flip'>) {
  // Dots en un patrón de cuadrícula con gradiente esmeralda→oro
  const cols = 32;
  const rows = 3;
  const dots = Array.from({ length: cols * rows }, (_, i) => i);

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden leading-[0]',
        flip && 'rotate-180',
        className,
      )}
      style={{ height }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 56"
        className="block h-full w-full"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="ftp-dots-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="oklch(0.55 0.15 160)" />
            <stop offset="100%" stopColor="oklch(0.75 0.18 85)" />
          </linearGradient>
          <mask id="ftp-dots-mask">
            {dots.map(i => {
              const col = i % cols;
              const row = Math.floor(i / cols);
              const x = (col + 0.5) * (1440 / cols);
              const y = (row + 0.5) * (56 / rows) + 4;
              const r = 3 + (row === 1 ? 2 : 0); // fila central con puntos más grandes
              return (
                <circle key={i} cx={x} cy={y} r={r} fill="white" />
              );
            })}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="1440"
          height="56"
          fill="url(#ftp-dots-grad)"
          mask="url(#ftp-dots-mask)"
          opacity="0.7"
        />
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SectionDivider — envoltura genérica                                */
/* ------------------------------------------------------------------ */

export type SectionDividerVariant = 'wave' | 'curve' | 'triangle' | 'dots';

export function SectionDivider({
  variant = 'wave',
  ...props
}: DividerProps & { variant?: SectionDividerVariant }) {
  switch (variant) {
    case 'wave':
      return <WaveDivider {...props} />;
    case 'curve':
      return <CurveDivider {...props} />;
    case 'triangle':
      return <TriangleDivider {...props} />;
    case 'dots':
      return <DotsDivider {...props} />;
    default:
      return <WaveDivider {...props} />;
  }
}

export default SectionDivider;
