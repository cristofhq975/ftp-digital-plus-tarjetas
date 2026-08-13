'use client';

import { useEffect } from 'react';

/**
 * RegisterSW
 * Registra el Service Worker (/sw.js) en producción para habilitar PWA.
 * - En desarrollo (NEXT_DEV) lo omite para evitar caches molestos.
 * - Escucha el evento 'controllerchange' para recargar cuando se actualiza el SW.
 */
export function RegisterSW() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    // No registramos en dev para evitar conflictos con hot-reload
    if (process.env.NODE_ENV === 'development') {
      // dev: solo log informativo
      console.info('[PWA] Service Worker no registrado en desarrollo.');
      return;
    }

    const register = () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.info('[PWA] Service Worker registrado:', registration.scope);

          // Si hay un nuevo SW esperando, fuerza la activación
          if (registration.waiting) {
            registration.waiting.postMessage('SKIP_WAITING');
          }

          // Detecta actualizaciones futuras
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (!newWorker) return;
            newWorker.addEventListener('statechange', () => {
              if (
                newWorker.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                // Hay una nueva versión lista — fuerza el cambio
                newWorker.postMessage('SKIP_WAITING');
              }
            });
          });
        })
        .catch((err) => {
          console.warn('[PWA] Error registrando Service Worker:', err);
        });
    };

    // Espera a que la página termine de cargar para no competir con recursos críticos
    if (document.readyState === 'complete') {
      register();
    } else {
      window.addEventListener('load', register, { once: true });
    }

    // Recarga la página cuando el nuevo SW tome el control
    const onControllerChange = () => {
      // Solo recargamos si ya había un controller previo (evita recarga doble al inicio)
      if (navigator.serviceWorker.controller) {
        window.location.reload();
      }
    };
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

    return () => {
      window.removeEventListener('load', register);
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
    };
  }, []);

  return null;
}
