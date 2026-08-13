'use client';

/**
 * loading-states.tsx — Colección de componentes de carga con efecto shimmer
 * y tonos esmeralda.
 *
 * Exporta:
 *  - LoadingCard       — Card skeleton con shimmer
 *  - LoadingList       — Lista de items skeleton
 *  - LoadingTable      — Tabla con filas skeleton
 *  - LoadingGrid       — Grid de cards skeleton
 *  - LoadingChart      — Área de chart con barras/líneas skeleton
 *  - FullScreenLoader  — Loader full screen con logo FTP + spinner
 *  - InlineLoader      — Spinner pequeño inline con texto
 *
 * Todos usan la clase utilitaria `.ftp-shimmer` (definida abajo en globals
 * inline o reusando `.skeleton`) con gradiente esmeralda.
 */

import { cn } from '@/lib/utils';
import { FTPLogo } from '@/components/ftp-logo';
import { Spinner } from '@/components/loading/spinner';

/* ------------------------------------------------------------------ */
/*  Bloque base con shimmer esmeralda                                  */
/* ------------------------------------------------------------------ */

interface ShimmerProps {
  className?: string;
  /** Aspect ratio opcional (ej. "16/9", "1/1"). Si se omite, usa altura fija. */
  aspect?: string;
}

function ShimmerBox({ className, aspect }: ShimmerProps) {
  return (
    <div
      className={cn('ftp-shimmer rounded-md', className)}
      style={aspect ? { aspectRatio: aspect } : undefined}
      aria-hidden
    />
  );
}

/* ------------------------------------------------------------------ */
/*  LoadingCard                                                        */
/* ------------------------------------------------------------------ */

interface LoadingCardProps {
  className?: string;
  withHeader?: boolean;
  withChart?: boolean;
}

export function LoadingCard({ className, withHeader = true, withChart = false }: LoadingCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-slate-200/60 bg-white p-5 shadow-sm',
        className,
      )}
      role="status"
      aria-label="Cargando contenido"
    >
      {withHeader && (
        <div className="mb-4 flex items-center gap-3">
          <ShimmerBox className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <ShimmerBox className="h-3 w-1/2" />
            <ShimmerBox className="h-2.5 w-1/3" />
          </div>
        </div>
      )}
      <div className="space-y-3">
        <ShimmerBox className="h-3 w-full" />
        <ShimmerBox className="h-3 w-5/6" />
        <ShimmerBox className="h-3 w-4/6" />
      </div>
      {withChart && <ShimmerBox className="mt-4 h-32 w-full" aspect="16/4" />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  LoadingList                                                        */
/* ------------------------------------------------------------------ */

interface LoadingListProps {
  count?: number;
  className?: string;
}

export function LoadingList({ count = 4, className }: LoadingListProps) {
  return (
    <div className={cn('space-y-3', className)} role="status" aria-label="Cargando lista">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-lg border border-slate-200/60 bg-white p-3"
        >
          <ShimmerBox className="h-11 w-11 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <ShimmerBox className="h-3 w-1/3" />
            <ShimmerBox className="h-2.5 w-2/3" />
          </div>
          <ShimmerBox className="h-7 w-16 shrink-0 rounded-md" />
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  LoadingTable                                                       */
/* ------------------------------------------------------------------ */

interface LoadingTableProps {
  rows?: number;
  cols?: number;
  className?: string;
}

export function LoadingTable({ rows = 5, cols = 4, className }: LoadingTableProps) {
  return (
    <div
      className={cn('overflow-hidden rounded-lg border border-slate-200/60', className)}
      role="status"
      aria-label="Cargando tabla"
    >
      {/* Header */}
      <div
        className="grid gap-3 border-b bg-slate-50 p-3"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: cols }).map((_, i) => (
          <ShimmerBox key={`h-${i}`} className="h-3" />
        ))}
      </div>
      {/* Rows */}
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, r) => (
          <div
            key={`r-${r}`}
            className="grid gap-3 bg-white p-3"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: cols }).map((_, c) => (
              <ShimmerBox key={`c-${r}-${c}`} className="h-3" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  LoadingGrid                                                        */
/* ------------------------------------------------------------------ */

interface LoadingGridProps {
  count?: number;
  cols?: '2' | '3' | '4';
  className?: string;
}

export function LoadingGrid({ count = 6, cols = '3', className }: LoadingGridProps) {
  const colsClass =
    cols === '2' ? 'sm:grid-cols-2'
    : cols === '4' ? 'sm:grid-cols-2 lg:grid-cols-4'
    : 'sm:grid-cols-2 lg:grid-cols-3';
  return (
    <div
      className={cn('grid grid-cols-1 gap-4', colsClass, className)}
      role="status"
      aria-label="Cargando tarjetas"
    >
      {Array.from({ length: count }).map((_, i) => (
        <LoadingCard key={i} />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  LoadingChart                                                       */
/* ------------------------------------------------------------------ */

interface LoadingChartProps {
  className?: string;
  variant?: 'bars' | 'line' | 'area';
  bars?: number;
}

export function LoadingChart({ className, variant = 'bars', bars = 8 }: LoadingChartProps) {
  // Alturas pre-calculadas para las barras (patrón reproducible)
  const barHeights = Array.from({ length: bars }).map((_, i) => 30 + ((i * 17) % 65));
  return (
    <div
      className={cn('rounded-xl border border-slate-200/60 bg-white p-5', className)}
      role="status"
      aria-label="Cargando gráfica"
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="space-y-2">
          <ShimmerBox className="h-3 w-32" />
          <ShimmerBox className="h-2.5 w-20" />
        </div>
        <ShimmerBox className="h-7 w-24 rounded-md" />
      </div>

      {/* Chart area */}
      <div className="relative flex h-40 items-end gap-2">
        {variant === 'bars' &&
          barHeights.map((h, i) => (
            <div key={i} className="flex-1" style={{ height: `${h}%` }}>
              <div className="ftp-shimmer h-full w-full rounded-t-md" />
            </div>
          ))}
        {variant === 'line' && (
          <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 40" aria-hidden>
            <defs>
              <linearGradient id="ld-line-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#059669" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon
              fill="url(#ld-line-grad)"
              points="0,28 12,20 24,24 36,12 48,18 60,8 72,14 84,6 100,10 100,40 0,40"
            />
            <polyline
              fill="none"
              stroke="#10b981"
              strokeWidth="0.6"
              points="0,28 12,20 24,24 36,12 48,18 60,8 72,14 84,6 100,10"
              className="opacity-50"
            />
          </svg>
        )}
        {variant === 'area' && <div className="ftp-shimmer h-full w-full rounded-md" />}
      </div>

      {/* X axis labels */}
      <div className="mt-3 flex justify-between">
        {Array.from({ length: 5 }).map((_, i) => (
          <ShimmerBox key={i} className="h-2 w-8" />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  FullScreenLoader                                                   */
/* ------------------------------------------------------------------ */

interface FullScreenLoaderProps {
  label?: string;
  description?: string;
  className?: string;
}

export function FullScreenLoader({
  label = 'Cargando FTP Digital Plus',
  description = 'Preparando tu panel de control…',
  className,
}: FullScreenLoaderProps) {
  return (
    <div
      className={cn(
        'flex min-h-[60vh] w-full flex-col items-center justify-center gap-6 px-4',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <div className="relative flex flex-col items-center gap-5">
        {/* Logo FTP con halo */}
        <div className="relative">
          <div
            className="absolute -inset-3 -z-10 animate-pulse rounded-full bg-emerald-100/70 blur-xl"
            aria-hidden
          />
          <FTPLogo variant="full" className="h-12 w-auto" />
        </div>
        <Spinner size={48} />
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-700">{label}</p>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  InlineLoader                                                       */
/* ------------------------------------------------------------------ */

interface InlineLoaderProps {
  label?: string;
  size?: number;
  className?: string;
}

export function InlineLoader({
  label = 'Cargando…',
  size = 16,
  className,
}: InlineLoaderProps) {
  return (
    <span
      className={cn('inline-flex items-center gap-2 text-xs text-muted-foreground', className)}
      role="status"
      aria-live="polite"
    >
      <Spinner size={size} label={label} />
      <span className="font-medium">{label}</span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Re-exports                                                         */
/* ------------------------------------------------------------------ */

const LoadingStates = {
  LoadingCard,
  LoadingList,
  LoadingTable,
  LoadingGrid,
  LoadingChart,
  FullScreenLoader,
  InlineLoader,
};

export default LoadingStates;
