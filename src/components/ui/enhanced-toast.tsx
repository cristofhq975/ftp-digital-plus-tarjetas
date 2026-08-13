'use client';

/**
 * enhanced-toast.tsx — Wrapper sobre sonner con presets personalizados
 * para FTP Digital Plus (paleta esmeralda + oro).
 *
 * Exporta `toast` (objeto con presets) y `enhancedToast` (alias).
 * Reemplaza importaciones de `sonner` en algunos lugares del proyecto.
 *
 * Presets:
 *  - toast.success(title, description?)
 *  - toast.error(title, description?)
 *  - toast.warning(title, description?)
 *  - toast.info(title, description?) — usa esmeralda (sin azul)
 *  - toast.loading(title, description?) — gris con spinner
 *  - toast.plan(planName) — confeti + plan mejorado
 *  - toast.action(title, actionLabel, onAction) — toast con botón de acción
 *  - toast.promise(promise, { loading, success, error })
 *
 * También reenvía los métodos nativos de sonner (toast.dismiss, toast.custom,
 * toast.message, etc.) para compatibilidad con código existente.
 */

import { toast as sonnerToast, type ToasterProps, type ExternalToast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import {
  CheckCircle2, XCircle, AlertCircle, Info, Loader2, Crown, Bell,
} from 'lucide-react';
import type { ReactNode } from 'react';

export type { ToasterProps };

/* ------------------------------------------------------------------ */
/*  Tokens de color                                                    */
/* ------------------------------------------------------------------ */

const COLORS = {
  emerald: {
    bg: '#ecfdf5',
    border: '#a7f3d0',
    text: '#065f46',
    accent: '#059669',
  },
  red: {
    bg: '#fef2f2',
    border: '#fecaca',
    text: '#991b1b',
    accent: '#dc2626',
  },
  amber: {
    bg: '#fffbeb',
    border: '#fde68a',
    text: '#92400e',
    accent: '#f59e0b',
  },
  slate: {
    bg: '#f8fafc',
    border: '#e2e8f0',
    text: '#334155',
    accent: '#64748b',
  },
  gold: {
    bg: '#fffbeb',
    border: '#fde68a',
    text: '#92400e',
    accent: '#f59e0b',
  },
} as const;

type ColorKey = keyof typeof COLORS;

/* ------------------------------------------------------------------ */
/*  Iconos por tipo                                                    */
/* ------------------------------------------------------------------ */

function iconFor(type: ColorKey): ReactNode {
  const iconProps = { className: 'h-5 w-5 shrink-0', 'aria-hidden': true };
  switch (type) {
    case 'emerald': return <CheckCircle2 {...iconProps} />;
    case 'red':     return <XCircle {...iconProps} />;
    case 'amber':   return <AlertCircle {...iconProps} />;
    case 'gold':   return <Crown {...iconProps} />;
    case 'slate':  return <Loader2 {...iconProps} className="h-5 w-5 shrink-0 animate-spin" />;
    default:       return <Info {...iconProps} />;
  }
}

/* ------------------------------------------------------------------ */
/*  Estilo compartido                                                  */
/* ------------------------------------------------------------------ */

function styleFor(color: ColorKey): React.CSSProperties {
  const c = COLORS[color];
  return {
    background: c.bg,
    border: `1px solid ${c.border}`,
    color: c.text,
    borderRadius: '12px',
    boxShadow: '0 8px 24px -8px rgba(5, 150, 105, 0.18)',
  };
}

/* ------------------------------------------------------------------ */
/*  API de presets                                                     */
/* ------------------------------------------------------------------ */

interface PresetOptions {
  description?: string;
  duration?: number;
  id?: string | number;
}

/**
 * Acepta tanto la firma simple `description: string` como la firma de sonner
 * `{ description: string; ... }` para compatibilidad con código existente.
 */
function normalizeDescription(
  descriptionOrOpts?: string | PresetOptions,
): { description: string | undefined; opts: PresetOptions } {
  if (typeof descriptionOrOpts === 'string') {
    return { description: descriptionOrOpts, opts: {} };
  }
  if (descriptionOrOpts && typeof descriptionOrOpts === 'object') {
    const { description, ...rest } = descriptionOrOpts;
    return { description, opts: rest };
  }
  return { description: undefined, opts: {} };
}

const success = (
  title: string,
  descriptionOrOpts?: string | PresetOptions,
  opts: PresetOptions = {},
) => {
  const { description: desc, opts: descOpts } = normalizeDescription(descriptionOrOpts);
  const merged = { ...descOpts, ...opts };
  return sonnerToast(title, {
    description: desc ?? merged.description,
    duration: merged.duration ?? 4000,
    id: merged.id,
    icon: iconFor('emerald'),
    style: styleFor('emerald'),
  });
};

const error = (
  title: string,
  descriptionOrOpts?: string | PresetOptions,
  opts: PresetOptions = {},
) => {
  const { description: desc, opts: descOpts } = normalizeDescription(descriptionOrOpts);
  const merged = { ...descOpts, ...opts };
  return sonnerToast(title, {
    description: desc ?? merged.description,
    duration: merged.duration ?? 5000,
    id: merged.id,
    icon: iconFor('red'),
    style: styleFor('red'),
  });
};

const warning = (
  title: string,
  descriptionOrOpts?: string | PresetOptions,
  opts: PresetOptions = {},
) => {
  const { description: desc, opts: descOpts } = normalizeDescription(descriptionOrOpts);
  const merged = { ...descOpts, ...opts };
  return sonnerToast(title, {
    description: desc ?? merged.description,
    duration: merged.duration ?? 4500,
    id: merged.id,
    icon: iconFor('amber'),
    style: styleFor('amber'),
  });
};

const info = (
  title: string,
  descriptionOrOpts?: string | PresetOptions,
  opts: PresetOptions = {},
) => {
  const { description: desc, opts: descOpts } = normalizeDescription(descriptionOrOpts);
  const merged = { ...descOpts, ...opts };
  return sonnerToast(title, {
    description: desc ?? merged.description,
    duration: merged.duration ?? 4000,
    id: merged.id,
    icon: iconFor('emerald'), // esmeralda en lugar de azul
    style: styleFor('emerald'),
  });
};

const loading = (
  title: string,
  descriptionOrOpts?: string | PresetOptions,
  opts: PresetOptions = {},
) => {
  const { description: desc, opts: descOpts } = normalizeDescription(descriptionOrOpts);
  const merged = { ...descOpts, ...opts };
  return sonnerToast(title, {
    description: desc ?? merged.description,
    duration: merged.duration ?? Infinity,
    id: merged.id,
    icon: iconFor('slate'),
    style: styleFor('slate'),
  });
};

/**
 * toast.plan — notificación especial para mejoras de plan.
 * Dispara un confeti CSS (vía CustomEvent) y muestra un toast festivo.
 */
const plan = (planName: string, description?: string) => {
  // Dispara confeti global (lo escucha el componente Confetti si está montado)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('ftp:confetti', { detail: { duration: 3500, count: 60 } }));
  }
  return sonnerToast(`¡Plan ${planName} activado!`, {
    description: description ?? 'Disfruta de todas las funciones premium.',
    duration: 5000,
    icon: iconFor('gold'),
    style: styleFor('gold'),
  });
};

/**
 * toast.action — toast con un botón de acción.
 */
const action = (
  title: string,
  actionLabel: string,
  onAction: () => void,
  description?: string,
) =>
  sonnerToast(title, {
    description,
    duration: 7000,
    icon: <Bell className="h-5 w-5 shrink-0" aria-hidden />,
    style: styleFor('emerald'),
    action: {
      label: actionLabel,
      onClick: () => onAction(),
    },
    cancel: { label: 'Cerrar', onClick: () => {} },
  });

/* ------------------------------------------------------------------ */
/*  Promise helper                                                     */
/* ------------------------------------------------------------------ */

interface PromiseMessages<T = unknown> {
  loading: string;
  success: string | ((data: T) => string);
  error: string | ((err: unknown) => string);
  description?: { loading?: string; success?: string; error?: string };
}

const promise = <T,>(
  p: Promise<T>,
  messages: PromiseMessages<T>,
) =>
  sonnerToast.promise(p, {
    loading: messages.loading,
    success: (data) =>
      typeof messages.success === 'function' ? messages.success(data) : messages.success,
    error: (err) =>
      typeof messages.error === 'function' ? messages.error(err) : messages.error,
    // Estilo base (esmeralda) aplicado a todos los estados del toast
    style: styleFor('emerald'),
  });

/* ------------------------------------------------------------------ */
/*  Objeto `toast` que combina presets + métodos nativos de sonner    */
/* ------------------------------------------------------------------ */

type SonnerToast = typeof sonnerToast;

// Omitimos los métodos preset que reemplazamos para evitar conflicto de tipos
// con la firma de sonner (que usa `(message, data?)` mientras que la nuestra
// usa `(title, descriptionOrOpts?, opts?)`).
type PresetMethods =
  | 'success' | 'error' | 'warning' | 'info'
  | 'loading' | 'promise' | 'message';

type EnhancedToast =
  // Firma de llamada base (compatible con `toast('mensaje')`)
  & ((message: string, data?: ExternalToast) => string | number)
  // Métodos nativos preservados (dismiss, custom, remove, etc.)
  & Omit<SonnerToast, PresetMethods>
  // Presets personalizados
  & {
    success: typeof success;
    error: typeof error;
    warning: typeof warning;
    info: typeof info;
    loading: typeof loading;
    plan: typeof plan;
    action: typeof action;
    promise: typeof promise;
  };

// Cast a través de `unknown` porque TypeScript no detecta suficiente overlap
// entre la firma original de sonner y nuestras firmas personalizadas.
const toast = sonnerToast as unknown as EnhancedToast;
toast.success = success;
toast.error = error;
toast.warning = warning;
toast.info = info;
toast.loading = loading;
toast.plan = plan;
toast.action = action;
toast.promise = promise;

/** Alias solicitado por la API del task. */
export const enhancedToast = toast;

export { Toaster };

export default toast;
