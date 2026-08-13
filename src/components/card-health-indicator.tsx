'use client';

/**
 * CardHealthIndicator — Indicador visual de salud de una tarjeta.
 *
 * Calcula un score 0-100 basado en 10 criterios (10 pts cada uno):
 *  - Tiene foto de perfil
 *  - Tiene descripción
 *  - Tiene WhatsApp configurado
 *  - Tiene servicios
 *  - Tiene productos
 *  - Tiene testimonios
 *  - Tiene galería
 *  - Tiene enlaces sociales
 *  - Tiene horario configurado
 *  - Tiene > 100 visitas
 *
 * Muestra un anillo circular SVG con color:
 *  - < 30 → rojo
 *  - 30-70 → ámbar
 *  - > 70 → esmeralda
 *
 * Variantes de tamaño: sm (48px), md (64px), lg (96px).
 * Tooltip con desglose detallado.
 */

import * as React from 'react';
import { Heart, AlertCircle, CheckCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { BusinessCard } from '@/lib/types';

export interface CardHealthBreakdownItem {
  label: string;
  points: number;
  earned: boolean;
}

export interface CardHealthResult {
  score: number;
  breakdown: CardHealthBreakdownItem[];
}

/**
 * Calcula la salud de una tarjeta (0-100) con un desglose detallado.
 * Función pura — sin efectos secundarios.
 */
export function calculateCardHealth(card: BusinessCard): CardHealthResult {
  const hasSocialLinks = Boolean(
    card.socialLinks.facebook ||
    card.socialLinks.instagram ||
    card.socialLinks.twitter ||
    card.socialLinks.linkedin ||
    card.socialLinks.youtube ||
    card.socialLinks.tiktok ||
    card.socialLinks.whatsapp ||
    card.socialLinks.telegram,
  );

  // Horario: al menos un día abierto con horas válidas (distinto de 00:00-00:00)
  const hasSchedule = Object.values(card.schedule).some(
    (day) => day.open && day.start !== '00:00' && day.end !== '00:00',
  );

  const breakdown: CardHealthBreakdownItem[] = [
    { label: 'Foto de perfil', points: 10, earned: Boolean(card.profilePhoto) },
    { label: 'Descripción', points: 10, earned: Boolean(card.description?.trim()) },
    { label: 'WhatsApp configurado', points: 10, earned: Boolean(card.whatsappNumber) },
    { label: 'Servicios', points: 10, earned: card.services.length > 0 },
    { label: 'Productos', points: 10, earned: card.products.length > 0 },
    { label: 'Testimonios', points: 10, earned: card.testimonials.length > 0 },
    { label: 'Galería', points: 10, earned: card.gallery.length > 0 },
    { label: 'Redes sociales', points: 10, earned: hasSocialLinks },
    { label: 'Horario configurado', points: 10, earned: hasSchedule },
    { label: 'Más de 100 visitas', points: 10, earned: card.views > 100 },
  ];

  const score = breakdown.reduce((sum, item) => sum + (item.earned ? item.points : 0), 0);
  return { score, breakdown };
}

type SizeVariant = 'sm' | 'md' | 'lg';

const SIZE_MAP: Record<SizeVariant, { px: number; stroke: number; font: string; icon: number }> = {
  sm: { px: 48, stroke: 4, font: 'text-[11px] font-bold', icon: 12 },
  md: { px: 64, stroke: 5, font: 'text-sm font-bold', icon: 16 },
  lg: { px: 96, stroke: 7, font: 'text-xl font-bold', icon: 22 },
};

function getHealthColor(score: number): { stroke: string; text: string; bg: string; ring: string } {
  if (score < 30) {
    return {
      stroke: '#ef4444', // red-500
      text: 'text-red-600',
      bg: 'bg-red-50',
      ring: 'ring-red-100',
    };
  }
  if (score <= 70) {
    return {
      stroke: '#f59e0b', // gold
      text: 'text-amber-600',
      bg: 'bg-amber-50',
      ring: 'ring-amber-100',
    };
  }
  return {
    stroke: '#059669', // emerald
    text: 'text-emerald-600',
    bg: 'bg-emerald-50',
    ring: 'ring-emerald-100',
  };
}

/** Renderiza el icono de salud correspondiente directamente (evita el lint de componentes dinámicos). */
function renderHealthIcon(score: number, className?: string, style?: React.CSSProperties) {
  if (score < 30) return <AlertCircle className={className} style={style} />;
  if (score <= 70) return <Heart className={className} style={style} />;
  return <CheckCircle className={className} style={style} />;
}

function getHealthLabel(score: number): string {
  if (score < 30) return 'Necesita atención';
  if (score <= 70) return 'En progreso';
  return 'Excelente';
}

export interface CardHealthIndicatorProps {
  card: BusinessCard;
  className?: string;
  size?: SizeVariant;
  /** Si true, muestra etiqueta de texto debajo del anillo. */
  showLabel?: boolean;
}

export function CardHealthIndicator({
  card,
  className,
  size = 'md',
  showLabel = false,
}: CardHealthIndicatorProps) {
  const { score, breakdown } = React.useMemo(() => calculateCardHealth(card), [card]);
  const colors = getHealthColor(score);
  const dims = SIZE_MAP[size];

  // SVG ring math
  const radius = (dims.px - dims.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  // Center text color and sizing
  const ring = (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: dims.px, height: dims.px }}
      role="img"
      aria-label={`Salud de tarjeta: ${score} de 100 — ${getHealthLabel(score)}`}
    >
      <svg
        width={dims.px}
        height={dims.px}
        viewBox={`0 0 ${dims.px} ${dims.px}`}
        className="-rotate-90"
        aria-hidden="true"
      >
        {/* Track */}
        <circle
          cx={dims.px / 2}
          cy={dims.px / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={dims.stroke}
          className="text-slate-100"
        />
        {/* Progress */}
        <circle
          cx={dims.px / 2}
          cy={dims.px / 2}
          r={radius}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={dims.stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn(dims.font, colors.text)}>{score}</span>
        {size === 'lg' && (
          <span className="mt-0.5 text-[10px] font-medium text-muted-foreground">/ 100</span>
        )}
      </div>
    </div>
  );

  const labelNode = showLabel && (
    <div className="mt-1 flex items-center gap-1">
      {renderHealthIcon(score, cn('shrink-0', colors.text), { width: dims.icon, height: dims.icon })}
      <span className={cn('text-[10px] font-medium', colors.text)}>{getHealthLabel(score)}</span>
    </div>
  );

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="flex flex-col items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 rounded-md"
            aria-label={`Ver desglose de salud — ${score}/100`}
          >
            {ring}
            {labelNode}
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="w-64 max-w-[80vw] bg-white p-0 text-slate-700 shadow-xl border border-slate-200"
        >
          <div className="space-y-2 p-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5">
                {renderHealthIcon(score, cn('h-3.5 w-3.5', colors.text))}
                <span className="text-xs font-bold text-slate-800">Salud de la tarjeta</span>
              </div>
              <span className={cn('text-sm font-bold', colors.text)}>{score}/100</span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              {getHealthLabel(score)} — completa más secciones para mejorar.
            </p>
            <ul className="space-y-1">
              {breakdown.map((item) => (
                <li key={item.label} className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5">
                    {item.earned ? (
                      <CheckCircle className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <AlertCircle className="h-3 w-3 text-slate-300" />
                    )}
                    <span className={item.earned ? 'text-slate-700' : 'text-slate-400'}>
                      {item.label}
                    </span>
                  </span>
                  <span className={cn('font-semibold', item.earned ? 'text-emerald-600' : 'text-slate-300')}>
                    +{item.points}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default CardHealthIndicator;
