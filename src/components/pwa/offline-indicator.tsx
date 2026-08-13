'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi } from 'lucide-react';

/**
 * OfflineIndicator
 * Banner flotante que aparece cuando el usuario pierde conexión a internet.
 * - Se muestra en la parte superior con animación slide-down (framer-motion).
 * - Mensaje en español: "Sin conexión - Algunas funciones pueden no estar disponibles".
 * - Cuando vuelve la conexión, muestra brevemente "Conexión restablecida" (2.2s) y luego oculta.
 * - Paleta esmeralda + oro coherente con la marca FTP Digital Plus.
 * - Usa `useSyncExternalStore` para leer `navigator.onLine` de forma segura en SSR.
 * - El toast de "conexión restablecida" se dispara SOLO desde el callback del
 *   evento `online` (no se hace setState sincrónico dentro del cuerpo del efecto).
 */

function subscribeOnline(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

function getOnlineSnapshot() {
  if (typeof window === 'undefined') return true;
  return navigator.onLine;
}

function getServerSnapshot() {
  return true;
}

export function OfflineIndicator() {
  const isOnline = useSyncExternalStore(
    subscribeOnline,
    getOnlineSnapshot,
    getServerSnapshot
  );
  const [showRestored, setShowRestored] = useState(false);

  // Solo reacciona al evento `online` para mostrar el toast temporal.
  // setState dentro del callback del evento está permitido por la regla
  // react-hooks/set-state-in-effect (no es sincrónico en el cuerpo del effect).
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const handleOnline = () => {
      setShowRestored(true);
      timer = setTimeout(() => setShowRestored(false), 2200);
    };
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('online', handleOnline);
      if (timer) clearTimeout(timer);
    };
  }, []);

  const showOffline = !isOnline;
  const showOnline = isOnline && showRestored;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[70] flex justify-center px-3 pt-3 sm:px-4 sm:pt-4"
    >
      <AnimatePresence mode="wait">
        {showOffline && (
          <motion.div
            key="offline"
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="pointer-events-auto flex w-full max-w-2xl items-center gap-3 rounded-xl border border-amber-300/70 bg-gradient-to-r from-amber-500 to-amber-400 px-3 py-2.5 shadow-lg ring-1 ring-amber-500/20 sm:px-4"
            role="status"
          >
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white/20 ring-1 ring-white/40">
              <WifiOff className="size-4 text-white" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-tight text-white">
                Sin conexión
              </p>
              <p className="truncate text-[11px] text-amber-50/95 sm:text-xs">
                Algunas funciones pueden no estar disponibles
              </p>
            </div>
          </motion.div>
        )}

        {showOnline && (
          <motion.div
            key="online"
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="pointer-events-auto flex w-full max-w-2xl items-center gap-3 rounded-xl border border-emerald-300/70 bg-gradient-to-r from-emerald-600 to-emerald-500 px-3 py-2.5 shadow-lg ring-1 ring-emerald-500/20 sm:px-4"
            role="status"
          >
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white/20 ring-1 ring-white/40">
              <Wifi className="size-4 text-white" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-tight text-white">
                Conexión restablecida
              </p>
              <p className="truncate text-[11px] text-emerald-50/95 sm:text-xs">
                Todas las funciones están disponibles de nuevo
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
