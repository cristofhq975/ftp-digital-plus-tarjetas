'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * Selector de elementos enfocables dentro del contenedor.
 */
const FOCUSABLE_SELECTOR = [
  'a[href]:not([disabled])',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
  'summary',
].join(',');

interface FocusManagerProps {
  /** Contenido del diálogo o modal. */
  children: ReactNode;
  /** Cuando es `true`, captura el foco dentro del contenedor. */
  active: boolean;
  /** Llamado al pulsar Escape mientras el gestor está activo. */
  onEscape?: () => void;
  /** Si restaurar el foco al elemento que abrió el diálogo al cerrar. */
  restoreFocus?: boolean;
  /** Clase CSS opcional para el contenedor. */
  className?: string;
}

/**
 * FocusManager — Gestiona el "focus trap" dentro de modales y diálogos.
 *
 * - Autoenfoca el primer elemento enfocable cuando `active` pasa a `true`.
 * - Mantiene el foco dentro del contenedor (Tab y Shift+Tab ciclados).
 * - Restaura el foco al elemento que abrió el diálogo al cerrar.
 * - Llama a `onEscape` cuando se presiona Escape.
 *
 * Pensado para modales personalizados; los Dialog de shadcn/ui ya incluyen
 * su propio manejo de foco vía Radix UI.
 */
export function FocusManager({
  children,
  active,
  onEscape,
  restoreFocus = true,
  className,
}: FocusManagerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Guardar / restaurar foco y autoenfoque inicial.
  useEffect(() => {
    if (active) {
      previousFocusRef.current = document.activeElement as HTMLElement | null;
      const container = containerRef.current;
      if (!container) return;
      const focusable = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      const target = focusable[0] ?? container;
      // Pequeño delay para asegurar que el contenido esté renderizado.
      const id = window.setTimeout(() => target.focus(), 0);
      return () => window.clearTimeout(id);
    }
    if (restoreFocus && previousFocusRef.current) {
      const ref = previousFocusRef.current;
      const id = window.setTimeout(() => {
        try {
          ref.focus();
        } catch {
          /* noop */
        }
        previousFocusRef.current = null;
      }, 0);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [active, restoreFocus]);

  // Captura de Tab + Escape.
  useEffect(() => {
    if (!active) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onEscape) {
        e.stopPropagation();
        onEscape();
        return;
      }
      if (e.key !== 'Tab') return;
      const container = containerRef.current;
      if (!container) return;
      const focusable = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter(el => el.offsetParent !== null || el === document.activeElement);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [active, onEscape]);

  return (
    <div ref={containerRef} tabIndex={-1} className={className}>
      {children}
    </div>
  );
}
