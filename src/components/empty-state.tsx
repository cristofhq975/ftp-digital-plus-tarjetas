'use client';

/**
 * empty-state.tsx — Componente de estado vacío reutilizable.
 *
 * Props:
 *  - icon?: ReactNode (default: Inbox icon)
 *  - title: string
 *  - description?: string
 *  - action?: { label: string; onClick: () => void }
 *  - secondaryAction?: { label: string; onClick: () => void }
 *  - variant?: 'default' | 'search' | 'error' | 'success' | 'locked'
 *  - className?: string
 *
 * El `variant` determina el icono por defecto y los colores del círculo.
 * Animación sutil de entrada (fade + slide up) usando framer-motion.
 */

import { motion } from 'framer-motion';
import {
  Inbox, Search, AlertCircle, CheckCircle, Lock,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export type EmptyStateVariant = 'default' | 'search' | 'error' | 'success' | 'locked';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  secondaryAction?: { label: string; onClick: () => void };
  variant?: EmptyStateVariant;
  className?: string;
}

interface VariantConfig {
  icon: LucideIcon;
  // Clases para el círculo con gradiente
  circleBg: string;
  circleText: string;
  // Patrón decorativo
  pattern: 'dots' | 'lines' | 'cross' | 'sparkle';
}

const VARIANT_CONFIG: Record<EmptyStateVariant, VariantConfig> = {
  default: {
    icon: Inbox,
    circleBg: 'bg-gradient-to-br from-slate-100 to-slate-200',
    circleText: 'text-slate-500',
    pattern: 'dots',
  },
  search: {
    icon: Search,
    circleBg: 'bg-gradient-to-br from-slate-100 to-slate-200',
    circleText: 'text-slate-500',
    pattern: 'lines',
  },
  error: {
    icon: AlertCircle,
    circleBg: 'bg-gradient-to-br from-rose-100 to-rose-200',
    circleText: 'text-rose-600',
    pattern: 'cross',
  },
  success: {
    icon: CheckCircle,
    circleBg: 'bg-gradient-to-br from-emerald-100 to-emerald-200',
    circleText: 'text-emerald-600',
    pattern: 'sparkle',
  },
  locked: {
    icon: Lock,
    circleBg: 'bg-gradient-to-br from-amber-100 to-amber-200',
    circleText: 'text-amber-600',
    pattern: 'cross',
  },
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  variant = 'default',
  className,
}: EmptyStateProps) {
  const cfg = VARIANT_CONFIG[variant] ?? VARIANT_CONFIG.default;
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn(
        'flex flex-col items-center justify-center px-6 py-10 text-center',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      {/* Ilustración: círculo con gradiente + patrón decorativo */}
      <div className="relative mb-5">
        {/* Patrón decorativo de fondo */}
        <PatternSVG pattern={cfg.pattern} />

        <div
          className={cn(
            'relative flex h-20 w-20 items-center justify-center rounded-full shadow-sm ring-1 ring-black/5',
            cfg.circleBg,
          )}
        >
          {icon ?? <Icon className={cn('h-10 w-10', cfg.circleText)} aria-hidden />}
        </div>

        {/* Halo sutil */}
        <div
          className={cn(
            'absolute inset-0 -z-10 rounded-full opacity-50 blur-xl',
            cfg.circleBg,
          )}
          aria-hidden
        />
      </div>

      <h3 className="text-lg font-bold text-slate-800 sm:text-xl">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      )}

      {(action || secondaryAction) && (
        <div className="mt-6 flex flex-col items-center gap-2 sm:flex-row">
          {action && (
            <Button
              type="button"
              onClick={action.onClick}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              type="button"
              variant="ghost"
              onClick={secondaryAction.onClick}
              className="text-slate-700 hover:bg-slate-100"
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Patrón SVG decorativo (opcional)                                   */
/* ------------------------------------------------------------------ */

function PatternSVG({ pattern }: { pattern: VariantConfig['pattern'] }) {
  if (pattern === 'dots') {
    return (
      <svg
        className="absolute -inset-3 -z-10 h-[calc(100%+1.5rem)] w-[calc(100%+1.5rem)] opacity-[0.18]"
        viewBox="0 0 100 100"
        aria-hidden
      >
        <defs>
          <pattern id="es-dots" width="10" height="10" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.2" fill="#059669" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#es-dots)" />
      </svg>
    );
  }
  if (pattern === 'lines') {
    return (
      <svg
        className="absolute -inset-3 -z-10 h-[calc(100%+1.5rem)] w-[calc(100%+1.5rem)] opacity-[0.15]"
        viewBox="0 0 100 100"
        aria-hidden
      >
        <defs>
          <pattern id="es-lines" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="8" stroke="#64748b" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#es-lines)" />
      </svg>
    );
  }
  if (pattern === 'sparkle') {
    return (
      <svg
        className="absolute -inset-3 -z-10 h-[calc(100%+1.5rem)] w-[calc(100%+1.5rem)] opacity-[0.25]"
        viewBox="0 0 100 100"
        aria-hidden
      >
        <g fill="#f59e0b">
          <path d="M50 6 L52 14 L60 16 L52 18 L50 26 L48 18 L40 16 L48 14 Z" />
          <circle cx="20" cy="80" r="1.5" />
          <circle cx="80" cy="22" r="1.2" />
          <circle cx="84" cy="78" r="1.4" />
          <circle cx="16" cy="24" r="1" />
        </g>
      </svg>
    );
  }
  // 'cross' — pequeña X decorativa
  return (
    <svg
      className="absolute -inset-3 -z-10 h-[calc(100%+1.5rem)] w-[calc(100%+1.5rem)] opacity-[0.15]"
      viewBox="0 0 100 100"
      aria-hidden
    >
      <g stroke="#f43f5e" strokeWidth="1" strokeLinecap="round">
        <line x1="10" y1="14" x2="18" y2="22" />
        <line x1="18" y1="14" x2="10" y2="22" />
        <line x1="82" y1="78" x2="90" y2="86" />
        <line x1="90" y1="78" x2="82" y2="86" />
      </g>
    </svg>
  );
}

export default EmptyState;
