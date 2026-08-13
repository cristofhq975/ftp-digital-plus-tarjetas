'use client';

/**
 * AnimatedCounter — Contador animado sofisticado para FTP Digital Plus.
 *
 * Características:
 *  - Animación count-up suave con easing (easeOutExpo).
 *  - Usa requestAnimationFrame.
 *  - Formatea números con locale es-MX.
 *  - Soporta formatos: number, currency (MXN), percent.
 *  - Respeta `prefers-reduced-motion` (render directo).
 *  - IntersectionObserver para disparar la animación cuando entra en viewport.
 *
 * @example
 *   <AnimatedCounter value={1000} suffix="+" />
 *   <AnimatedCounter value={199} format="currency" />
 *   <AnimatedCounter value={99.9} decimals={1} format="percent" />
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface AnimatedCounterProps {
  /** Valor final al que animar. */
  value: number;
  /** Duración de la animación en milisegundos. Por defecto: 2000. */
  duration?: number;
  /** Número de decimales a mostrar. Por defecto: 0. */
  decimals?: number;
  /** Prefijo opcional (ej: "$"). */
  prefix?: string;
  /** Sufijo opcional (ej: "+", "%"). */
  suffix?: string;
  /** Clase CSS opcional para el span contenedor. */
  className?: string;
  /** Formato de salida: número, moneda MXN o porcentaje. */
  format?: 'number' | 'currency' | 'percent';
}

/* --- Suscripción a prefers-reduced-motion vía useSyncExternalStore --- */
function subscribeReducedMotion(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  mq.addEventListener('change', callback);
  return () => mq.removeEventListener('change', callback);
}

function getReducedMotionSnapshot() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function getReducedMotionServerSnapshot() {
  return false;
}

/**
 * easeOutExpo — desaceleración natural al final.
 */
function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/**
 * Formatea un número según el formato seleccionado y el locale es-MX.
 */
function formatNumber(
  n: number,
  format: 'number' | 'currency' | 'percent',
  decimals: number,
): string {
  const safe = Number.isFinite(n) ? n : 0;
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(safe);
    case 'percent':
      return `${new Intl.NumberFormat('es-MX', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(safe)}%`;
    case 'number':
    default:
      return new Intl.NumberFormat('es-MX', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(safe);
  }
}

export function AnimatedCounter({
  value,
  duration = 2000,
  decimals = 0,
  prefix = '',
  suffix = '',
  className,
  format = 'number',
}: AnimatedCounterProps) {
  const prefersReducedMotion = React.useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

  const [displayValue, setDisplayValue] = React.useState(0);
  const [hasStarted, setHasStarted] = React.useState(false);
  const rafRef = React.useRef<number | null>(null);
  const elementRef = React.useRef<HTMLSpanElement | null>(null);

  // Inicia la animación (limpia RAF previo).
  const startAnimation = React.useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const start = performance.now();
    const from = 0;
    const to = value;

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutExpo(progress);
      const current = from + (to - from) * eased;
      // Mantener decimales en cada frame para formato fluido.
      setDisplayValue(current);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setDisplayValue(to);
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [value, duration]);

  // Trigger por IntersectionObserver cuando el elemento entra en viewport.
  React.useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayValue(value);
      setHasStarted(true);
      return;
    }

    const el = elementRef.current;
    if (!el) return;

    // Fallback: si IntersectionObserver no existe, anima de inmediato.
    if (typeof IntersectionObserver === 'undefined') {
      setHasStarted(true);
      startAnimation();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !hasStarted) {
            setHasStarted(true);
            startAnimation();
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.25, rootMargin: '0px 0px -10% 0px' },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [prefersReducedMotion, value, hasStarted, startAnimation]);

  // Re-anima si el valor cambia y ya estaba visible.
  React.useEffect(() => {
    if (hasStarted && !prefersReducedMotion) {
      startAnimation();
    }
  }, [value, hasStarted, prefersReducedMotion, startAnimation]);

  const shown = prefersReducedMotion ? value : displayValue;
  const formatted = formatNumber(shown, format, decimals);

  return (
    <span
      ref={elementRef}
      className={cn('tabular-nums', className)}
      aria-label={`${prefix}${formatNumber(value, format, decimals)}${suffix}`}
    >
      <span aria-hidden="true">
        {prefix}
        {formatted}
        {suffix}
      </span>
    </span>
  );
}

export default AnimatedCounter;
