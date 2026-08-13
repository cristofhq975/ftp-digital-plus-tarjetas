'use client';

/**
 * GlassCard — Tarjeta con efecto glassmorphism para FTP Digital Plus.
 *
 * Variantes:
 *  - light  (por defecto): vidrio claro translúcido
 *  - dark: vidrio oscuro
 *  - emerald: vidrio con tinte esmeralda
 *  - gold: vidrio con tinte oro
 *
 * Opciones:
 *  - hover:  eleva la tarjeta al pasar el cursor
 *  - glow:   añade un resplandor esmeralda/oro
 *  - onClick: la hace clicable (con rol button)
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

export type GlassCardVariant = 'light' | 'dark' | 'emerald' | 'gold';

export interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: GlassCardVariant;
  hover?: boolean;
  glow?: boolean;
  onClick?: () => void;
  /** aria-label para tarjetas clicables */
  'aria-label'?: string;
}

const VARIANT_CLASSES: Record<GlassCardVariant, string> = {
  light: 'glass-card',
  dark:
    'bg-slate-900/60 backdrop-blur-xl border border-white/10 text-white ' +
    'dark:bg-slate-950/70 dark:border-white/15',
  emerald: 'glass-emerald',
  gold: 'glass-gold',
};

const GLOW_CLASSES: Record<GlassCardVariant, string> = {
  light: 'hover:shadow-[0_20px_50px_-12px_oklch(0.55_0.15_160/0.25)]',
  dark: 'hover:shadow-[0_20px_50px_-12px_oklch(0.75_0.18_85/0.35)]',
  emerald:
    'shadow-[0_0_30px_-8px_oklch(0.55_0.15_160/0.4)] hover:shadow-[0_0_45px_-8px_oklch(0.55_0.15_160/0.6)]',
  gold:
    'shadow-[0_0_30px_-8px_oklch(0.75_0.18_85/0.4)] hover:shadow-[0_0_45px_-8px_oklch(0.75_0.18_85/0.6)]',
};

export function GlassCard({
  children,
  className,
  variant = 'light',
  hover = false,
  glow = false,
  onClick,
  'aria-label': ariaLabel,
}: GlassCardProps) {
  const isClickable = typeof onClick === 'function';

  const classes = cn(
    'relative rounded-2xl backdrop-blur-xl transition-all duration-300',
    VARIANT_CLASSES[variant],
    hover && 'hover:-translate-y-1 cursor-pointer',
    glow && GLOW_CLASSES[variant],
    glow && 'animate-pulse-glow',
    isClickable && 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2',
    className,
  );

  if (isClickable) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={ariaLabel}
        className={cn(classes, 'text-left w-full block')}
      >
        {children}
      </button>
    );
  }

  return <div className={classes}>{children}</div>;
}

export default GlassCard;
