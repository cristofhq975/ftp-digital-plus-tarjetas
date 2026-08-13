'use client';

/**
 * Marquee — Marquee horizontal con scroll infinito para FTP Digital Plus.
 *
 * Características:
 *  - Scroll infinito (duplica el contenido para loop seamless).
 *  - Animación CSS pura (transform: translateX).
 *  - Velocidad configurable (px/s).
 *  - Dirección configurable (left | right).
 *  - Pausa al hacer hover.
 *  - Respeta `prefers-reduced-motion` (contenido estático sin animar).
 *
 * @example
 *   <Marquee speed={30} pauseOnHover>
 *     <Logo /> <Logo /> ...
 *   </Marquee>
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface MarqueeProps {
  children: React.ReactNode;
  /** Velocidad en px/s. Por defecto: 30. */
  speed?: number;
  /** Dirección del movimiento. Por defecto: 'left'. */
  direction?: 'left' | 'right';
  /** Pausar al hacer hover. Por defecto: true. */
  pauseOnHover?: boolean;
  /** Clase CSS opcional para el contenedor. */
  className?: string;
}

/* --- Suscripción a prefers-reduced-motion --- */
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

export function Marquee({
  children,
  speed = 30,
  direction = 'left',
  pauseOnHover = true,
  className,
}: MarqueeProps) {
  const prefersReducedMotion = React.useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

  // Medimos el ancho del contenido para calcular la duración en base a `speed` (px/s).
  const trackRef = React.useRef<HTMLDivElement | null>(null);
  const [duration, setDuration] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (prefersReducedMotion) return;
    const el = trackRef.current;
    if (!el) return;
    // El track contiene el contenido duplicado; medimos la mitad (un set).
    const measure = () => {
      const width = el.scrollWidth / 2;
      if (width > 0 && speed > 0) {
        setDuration(width / speed);
      }
    };
    measure();
    // Re-medir al cambiar tamaño de viewport.
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    if (ro) ro.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [speed, prefersReducedMotion, children]);

  // Si el usuario prefiere movimiento reducido, mostramos contenido estático
  // (sin duplicar ni animar) — accesibilidad.
  if (prefersReducedMotion) {
    return (
      <div className={cn('w-full overflow-hidden', className)}>
        <div className="flex flex-wrap items-center gap-4">{children}</div>
      </div>
    );
  }

  const reverse = direction === 'right';

  return (
    <div
      className={cn(
        'group relative w-full overflow-hidden',
        pauseOnHover && '[&:hover_.marquee-track]:[animation-play-state:paused]',
        className,
      )}
    >
      <div
        ref={trackRef}
        className="marquee-track flex w-max items-center gap-4"
        style={{
          animationDuration: duration ? `${duration}s` : undefined,
          animationDirection: reverse ? 'reverse' : 'normal',
        }}
      >
        {/* Set 1 */}
        <div className="flex items-center gap-4" aria-hidden={false}>
          {children}
        </div>
        {/* Set 2 (duplicado para loop seamless) */}
        <div className="flex items-center gap-4" aria-hidden={true}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default Marquee;
