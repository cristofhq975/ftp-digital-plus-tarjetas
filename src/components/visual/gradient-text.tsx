'use client';

/**
 * GradientText — Texto con gradiente para FTP Digital Plus.
 *
 * Variantes:
 *  - emerald:     gradiente esmeralda
 *  - gold:        gradiente oro
 *  - emerald-gold: esmeralda → oro (por defecto)
 *  - sunset:      naranja → rosa
 *  - ocean:       teal → cian
 *
 * @example
 *   <GradientText variant="emerald-gold">Tarjetas digitales</GradientText>
 *   <GradientText variant="gold" animated>Premium</GradientText>
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

export type GradientTextVariant = 'emerald' | 'gold' | 'emerald-gold' | 'sunset' | 'ocean';

export interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  variant?: GradientTextVariant;
  /** Si true, el gradiente se desplaza en bucle (animación). */
  animated?: boolean;
}

const VARIANT_GRADIENTS: Record<GradientTextVariant, string> = {
  emerald: 'linear-gradient(135deg, oklch(0.55 0.15 160), oklch(0.65 0.16 165))',
  gold: 'linear-gradient(135deg, oklch(0.75 0.18 85), oklch(0.85 0.15 75))',
  'emerald-gold': 'linear-gradient(135deg, oklch(0.55 0.15 160), oklch(0.75 0.18 85))',
  sunset: 'linear-gradient(135deg, oklch(0.7 0.18 40), oklch(0.7 0.2 10))',
  ocean: 'linear-gradient(135deg, oklch(0.6 0.13 200), oklch(0.7 0.13 190))',
};

export function GradientText({
  children,
  className,
  variant = 'emerald-gold',
  animated = false,
}: GradientTextProps) {
  const gradient = VARIANT_GRADIENTS[variant];
  return (
    <span
      className={cn(
        'inline-block bg-clip-text text-transparent [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]',
        animated && 'bg-[length:200%_auto] [animation:text-gradient-shift_3s_linear_infinite]',
        className,
      )}
      style={{ backgroundImage: gradient }}
    >
      {children}
    </span>
  );
}

export default GradientText;
