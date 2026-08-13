'use client';

import { useCallback, useEffect, useRef } from 'react';

/**
 * Módulo que mantiene una referencia al nodo live-region actual.
 * Lo gestiona <ScreenReaderAnnouncer /> cuando se monta en el layout.
 */
let announcerEl: HTMLElement | null = null;

export function setAnnouncerElement(el: HTMLElement | null) {
  announcerEl = el;
}

export interface AnnounceOptions {
  /** 'polite' (espera pausa) o 'assertive' (interrumpe). Por defecto: 'polite'. */
  politeness?: 'polite' | 'assertive';
}

/**
 * useAnnouncer — Hook que devuelve una función para anunciar mensajes a
 * lectores de pantalla. Ejemplo:
 *
 *   const announce = useAnnouncer();
 *   announce('Tarjeta creada correctamente');
 *   announce('Error al guardar', { politeness: 'assertive' });
 *
 * El mensaje se inserta en una región aria-live gestionada por
 * <ScreenReaderAnnouncer /> que debe montarse una sola vez en el layout.
 */
export function useAnnouncer() {
  return useCallback((message: string, options?: AnnounceOptions) => {
    if (typeof window === 'undefined' || !announcerEl) return;
    const politeness = options?.politeness ?? 'polite';
    announcerEl.setAttribute('aria-live', politeness);
    // Limpiar y re-setear con un micro-delay para forzar el re-anuncio
    // incluso si el mensaje es idéntico al anterior.
    announcerEl.textContent = '';
    window.setTimeout(() => {
      if (announcerEl) announcerEl.textContent = message;
    }, 60);
  }, []);
}

/**
 * ScreenReaderAnnouncer — Región live invisible para anunciar cambios
 * dinámicos a usuarios de lectores de pantalla. Debe montarse una sola vez
 * en el layout de la aplicación.
 */
export function ScreenReaderAnnouncer() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAnnouncerElement(ref.current);
    return () => setAnnouncerElement(null);
  }, []);

  return (
    <div
      ref={ref}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    />
  );
}
