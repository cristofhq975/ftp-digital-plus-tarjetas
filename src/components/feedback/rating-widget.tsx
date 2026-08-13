'use client';

/**
 * rating-widget.tsx — Widget de calificación por estrellas.
 *
 * Props:
 *  - value?: number (0-5, default 0)
 *  - onChange?: (value: number) => void
 *  - readOnly?: boolean (default false)
 *  - size?: 'sm' (16px) | 'md' (20px) | 'lg' (24px) (default 'md')
 *  - label?: string (sr-only label)
 *  - className?: string
 *
 * Características:
 *  - Hover preview (solo en modo interactivo)
 *  - Click para seleccionar
 *  - Estrellas llenas en esmeralda
 *  - Accesible por teclado (←/→ para mover, Enter/Espacio para seleccionar)
 *  - Rol slider con aria-valuenow / aria-valuemin / aria-valuemax
 */

import { useCallback, useId, useState, type KeyboardEvent } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RatingWidgetProps {
  value?: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

const SIZE_MAP: Record<NonNullable<RatingWidgetProps['size']>, number> = {
  sm: 16,
  md: 20,
  lg: 24,
};

const RATING_LABELS = [
  'Sin calificar',
  'Muy mala',
  'Regular',
  'Buena',
  'Muy buena',
  'Excelente',
];

export function RatingWidget({
  value = 0,
  onChange,
  readOnly = false,
  size = 'md',
  label = 'Calificación',
  className,
}: RatingWidgetProps) {
  const [hover, setHover] = useState<number>(0);
  const baseId = useId();
  const px = SIZE_MAP[size];

  const current = hover || value;
  const interactive = !readOnly;

  const handleClick = useCallback(
    (star: number) => {
      if (!interactive || !onChange) return;
      // Click en la misma estrella → reset a 0
      const newValue = star === value ? 0 : star;
      onChange(newValue);
    },
    [interactive, onChange, value],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (!interactive || !onChange) return;
      let next = value;
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowUp':
          next = Math.min(5, value + 1);
          break;
        case 'ArrowLeft':
        case 'ArrowDown':
          next = Math.max(0, value - 1);
          break;
        case 'Home':
          next = 0;
          break;
        case 'End':
          next = 5;
          break;
        case ' ':
        case 'Enter':
          // Toggle: si está en 0, marcar 5; si tiene valor, resetear
          next = value === 0 ? 5 : 0;
          break;
        default:
          return;
      }
      e.preventDefault();
      onChange(next);
    },
    [interactive, onChange, value],
  );

  const labelId = `${baseId}-label`;

  return (
    <div className={cn('inline-flex flex-col items-center gap-1', className)}>
      <div
        role={interactive ? 'slider' : 'img'}
        aria-label={label}
        aria-labelledby={labelId}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={5}
        aria-valuetext={RATING_LABELS[value] ?? RATING_LABELS[0]}
        aria-readonly={readOnly || undefined}
        tabIndex={interactive ? 0 : -1}
        onKeyDown={handleKeyDown}
        onMouseLeave={() => setHover(0)}
        className={cn(
          'inline-flex items-center gap-0.5 rounded-md outline-none',
          interactive && 'focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1',
        )}
      >
        {Array.from({ length: 5 }).map((_, i) => {
          const starValue = i + 1;
          const filled = starValue <= current;
          return (
            <button
              key={i}
              type="button"
              disabled={!interactive}
              onClick={() => handleClick(starValue)}
              onMouseEnter={() => interactive && setHover(starValue)}
              onFocus={() => interactive && setHover(starValue)}
              onBlur={() => setHover(0)}
              tabIndex={-1}
              aria-hidden={readOnly || undefined}
              className={cn(
                'inline-flex items-center justify-center p-0.5 transition-transform',
                interactive && 'hover:scale-110 active:scale-95',
                !interactive && 'cursor-default',
              )}
              style={{ width: px + 8, height: px + 8 }}
            >
              <Star
                style={{ width: px, height: px }}
                className={cn(
                  'transition-colors',
                  filled
                    ? 'fill-emerald-500 text-emerald-500'
                    : 'fill-slate-200 text-slate-200',
                )}
                strokeWidth={1.5}
              />
            </button>
          );
        })}
      </div>
      <span id={labelId} className="sr-only">
        {RATING_LABELS[value] ?? RATING_LABELS[0]}
      </span>
    </div>
  );
}

export default RatingWidget;
