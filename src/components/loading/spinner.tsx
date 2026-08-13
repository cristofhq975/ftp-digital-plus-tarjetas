'use client';

import { useId } from 'react';
import { cn } from '@/lib/utils';

interface SpinnerProps {
  /** Tamaño en píxeles. Por defecto: 40. */
  size?: number;
  /** Clase CSS opcional para el <svg>. */
  className?: string;
  /** Etiqueta accesible. Por defecto: "Cargando". */
  label?: string;
}

/**
 * Spinner — Indicador de carga con degradado esmeralda → oro.
 *
 * Usa un <svg> con un círculo de fondo y un arco con degradado que rota.
 * El degradado tiene un id único por instancia para evitar colisiones
 * cuando hay varios spinners en la misma página.
 */
export function Spinner({ size = 40, className, label = 'Cargando' }: SpinnerProps) {
  const rawId = useId();
  const gradientId = `ftp-spinner-${rawId.replace(/:/g, '')}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 50 50"
      className={cn('animate-spin', className)}
      role="status"
      aria-label={label}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="55%" stopColor="#059669" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      {/* Pista de fondo */}
      <circle
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke="oklch(0.92 0.01 150)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Arco con degradado */}
      <circle
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="80 200"
      />
    </svg>
  );
}
