'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { ReactNode } from 'react';
import { useAppStore } from '@/lib/store';

interface PageTransitionProps {
  children: ReactNode;
}

/**
 * PageTransition — Envuelve el contenido principal para animar transiciones
 * suaves entre vistas (fade + slide) usando framer-motion AnimatePresence.
 *
 * La `key` se basa en `currentView` del store Zustand, de modo que cada
 * cambio de vista dispare la animación de salida/entrada. `mode="wait"`
 * espera a que termine la salida antes de montar la nueva vista, evitando
 * solapamientos extraños.
 */
export function PageTransition({ children }: PageTransitionProps) {
  const currentView = useAppStore(s => s.currentView);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={currentView}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
