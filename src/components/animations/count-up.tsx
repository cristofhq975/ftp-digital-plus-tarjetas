'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

interface CountUpProps {
  /** Valor final al que animar. */
  value: number;
  /** Duración de la animación en milisegundos. Por defecto: 1500. */
  duration?: number;
  /** Clase CSS opcional para el span contenedor. */
  className?: string;
  /** Texto a mostrar antes del número (ej: "$"). */
  prefix?: string;
  /** Texto a mostrar después del número (ej: "+", "%", "k+"). */
  suffix?: string;
}

/**
 * easeOutExpo — función de easing que produce una desaceleración natural.
 */
function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
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
 * CountUp — Componente que anima un número desde 0 hasta `value` usando
 * requestAnimationFrame. Respeta `prefers-reduced-motion` mostrando el valor
 * final de inmediato.
 *
 * @example
 *   <CountUp value={1000} suffix="+" />
 *   <CountUp value={99} suffix=".9%" />
 */
export function CountUp({
  value,
  duration = 1500,
  className,
  prefix = '',
  suffix = '',
}: CountUpProps) {
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
  const [displayValue, setDisplayValue] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (prefersReducedMotion || duration <= 0) {
      // No hay animación; el valor final se renderiza directamente abajo.
      return;
    }
    const start = performance.now();
    const from = 0;
    const to = value;

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutExpo(progress);
      setDisplayValue(Math.round(from + (to - from) * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setDisplayValue(to);
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration, prefersReducedMotion]);

  const shown = prefersReducedMotion ? value : displayValue;

  return (
    <span
      className={className}
      aria-label={`${prefix}${value.toLocaleString('es-MX')}${suffix}`}
    >
      <span aria-hidden="true">
        {prefix}
        {shown.toLocaleString('es-MX')}
        {suffix}
      </span>
    </span>
  );
}
