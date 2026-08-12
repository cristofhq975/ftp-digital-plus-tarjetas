'use client';

/**
 * TourTrigger — Botón flotante que abre el tour guiado de la plataforma.
 *
 * - Aparece en la esquina inferior derecha.
 * - Solo se muestra si hay usuario logueado y el tour NO ha sido completado
 *   (flag `ftp-tour-completed` en localStorage).
 * - Animación de pulso para llamar la atención.
 * - Tooltip al hacer hover: "¿Quieres un tour guiado?".
 * - Al hacer clic, activa el tour (store.setTourActive(true)).
 */

import { useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';

const TOUR_STORAGE_KEY = 'ftp-tour-completed';

// Leer flag de localStorage (client-only) usando useSyncExternalStore
const subscribeNoop = () => () => {};
function readTourCompletedClient(): boolean {
  try {
    return localStorage.getItem(TOUR_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}
function readTourCompletedServer(): boolean {
  return false;
}

export function TourTrigger() {
  const currentUser = useAppStore(s => s.currentUser);
  const setTourActive = useAppStore(s => s.setTourActive);
  const tourActive = useAppStore(s => s.tourActive);
  const currentView = useAppStore(s => s.currentView);

  const tourCompleted = useSyncExternalStore(
    subscribeNoop,
    readTourCompletedClient,
    readTourCompletedServer
  );

  // Mostrar solo si el usuario está logueado, el tour no está completado,
  // el tour no está ya activo, y NO estamos en la landing/pricing/checkout/login
  // (donde no tiene sentido ofrecerlo).
  const hiddenViews = new Set([
    'landing',
    'pricing',
    'checkout',
    'login',
    'register',
    'public-card',
    'qr-expired',
  ]);

  const shouldShow =
    !!currentUser &&
    !tourCompleted &&
    !tourActive &&
    !hiddenViews.has(currentView);

  const handleStartTour = () => {
    setTourActive(true);
  };

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="fixed bottom-6 right-6 z-40 sm:bottom-8 sm:right-8"
        >
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  type="button"
                  onClick={handleStartTour}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Iniciar tour guiado de la plataforma"
                  className={cn(
                    'relative flex h-14 w-14 items-center justify-center rounded-full',
                    'bg-gradient-to-br from-emerald-600 via-emerald-600 to-amber-500',
                    'text-white shadow-xl shadow-emerald-900/25 ring-4 ring-white',
                    'transition-colors hover:from-emerald-700 hover:via-emerald-700 hover:to-amber-600',
                    'focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400/60'
                  )}
                >
                  {/* Pulse ring animado */}
                  <motion.span
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-emerald-500/60"
                    animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      ease: 'easeOut',
                    }}
                  />
                  {/* Segundo pulse desfasado */}
                  <motion.span
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-amber-400/50"
                    animate={{ scale: [1, 1.8], opacity: [0.4, 0] }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      ease: 'easeOut',
                      delay: 0.6,
                    }}
                  />
                  <Compass className="relative h-6 w-6" />
                </motion.button>
              </TooltipTrigger>
              <TooltipContent
                side="left"
                sideOffset={12}
                className="border-emerald-100 bg-white text-slate-700 shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <Compass className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-xs font-medium">
                    ¿Quieres un tour guiado?
                  </span>
                </div>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  Descubre la plataforma en 2 min
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default TourTrigger;
