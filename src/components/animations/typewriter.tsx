'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';

interface TypewriterProps {
  /** Texto completo a mostrar. */
  text: string;
  /** Milisegundos entre cada carácter. Por defecto: 70. */
  speed?: number;
  /** Clase CSS opcional para el span contenedor. */
  className?: string;
  /** Mostrar cursor parpadeante al final. Por defecto: true. */
  cursor?: boolean;
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
 * Typewriter — Efecto de máquina de escribir para titulares.
 *
 * - Anuncia el texto completo a lectores de pantalla vía `aria-label`.
 * - Respeta `prefers-reduced-motion`: muestra el texto completo de inmediato.
 * - El cursor parpadea mientras se escribe y al terminar.
 *
 * @example
 *   <Typewriter text="Impresionan" speed={120} />
 */
export function Typewriter({
  text,
  speed = 70,
  className,
  cursor = true,
}: TypewriterProps) {
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
  const [animatedText, setAnimatedText] = useState('');

  useEffect(() => {
    if (prefersReducedMotion) {
      // Sin animación; el render usa `text` directamente.
      return;
    }
    let index = 0;
    const interval = window.setInterval(() => {
      index += 1;
      setAnimatedText(text.slice(0, index));
      if (index >= text.length) {
        window.clearInterval(interval);
      }
    }, speed);

    return () => window.clearInterval(interval);
  }, [text, speed, prefersReducedMotion]);

  const displayed = prefersReducedMotion ? text : animatedText;

  return (
    <span className={className} aria-label={text}>
      <span aria-hidden="true">{displayed}</span>
      {cursor && (
        <span
          aria-hidden="true"
          className="ml-0.5 inline-block w-[2px] animate-pulse bg-current align-middle"
          style={{ height: '0.9em' }}
        />
      )}
    </span>
  );
}
