'use client';

/**
 * fab-menu.tsx — Botón flotante de acción rápida (FAB) con menú expandible.
 *
 * Características:
 * - Posición fija abajo-derecha (respeta safe-area de iOS).
 * - Botón principal con gradiente esmeralda e icono Plus.
 * - Al expandirse, muestra 5 acciones rápidas en pila vertical animada.
 * - Backdrop semitransparente para cerrar al hacer click fuera.
 * - Auto-hide al hacer scroll hacia abajo, mostrar al subir.
 * - ESC para cerrar.
 * - Solo se muestra cuando hay currentUser.
 * - Tooltip con etiqueta al hacer hover en cada acción.
 *
 * Paleta: esmeralda + oro (FTP Digital Plus).
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, X, Layout, BarChart3, HelpCircle, Monitor, ChevronUp,
  type LucideIcon,
} from 'lucide-react';

import { useAppStore } from '@/lib/store';
import { ViewType } from '@/lib/types';
import { cn } from '@/lib/utils';

interface QuickAction {
  id: string;
  label: string;
  icon: LucideIcon;
  /** Clases Tailwind para el gradiente del botón circular. */
  gradient: string;
  /** Acción a ejecutar: dispara evento custom o navega a una vista. */
  action: () => void;
}

export function FabMenu() {
  const currentUser = useAppStore(s => s.currentUser);
  const navigate = useAppStore(s => s.navigate);
  const cards = useAppStore(s => s.cards);

  const [expanded, setExpanded] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Listener de scroll para auto-hide.
  useEffect(() => {
    if (!currentUser) return;

    const handleScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY.current;
      // Cerca del top siempre visible.
      if (currentY < 80) {
        setVisible(true);
      } else if (delta > 8) {
        // Scroll hacia abajo: ocultar.
        setVisible(false);
        setExpanded(false);
      } else if (delta < -8) {
        // Scroll hacia arriba: mostrar.
        setVisible(true);
      }
      lastScrollY.current = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentUser]);

  // ESC para cerrar.
  useEffect(() => {
    if (!expanded) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setExpanded(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [expanded]);

  // Cerrar al hacer click fuera del contenedor.
  useEffect(() => {
    if (!expanded) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setExpanded(false);
      }
    };
    // Pequeño delay para que el click que abre no lo cierre inmediatamente.
    const t = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);
    return () => {
      clearTimeout(t);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [expanded]);

  const handleCreateCard = useCallback(() => {
    setExpanded(false);
    // Lleva al dashboard y dispara el dialog de crear tarjeta.
    navigate('dashboard');
    // Pequeño retardo para que el dashboard esté montado.
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('ftp:open-create-card'));
    }, 80);
  }, [navigate]);

  const handleNavigate = useCallback(
    (view: ViewType) => {
      setExpanded(false);
      navigate(view);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [navigate],
  );

  const handleKiosk = useCallback(() => {
    setExpanded(false);
    // Si hay tarjetas, ir a kiosk; si no, llevar al dashboard.
    const userCards = currentUser
      ? cards.filter(c => c.userId === currentUser.id)
      : [];
    if (userCards.length > 0) {
      const first = userCards[0];
      useAppStore.getState().selectCard(first.id);
      navigate('kiosk');
    } else {
      navigate('dashboard');
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('ftp:open-create-card'));
      }, 80);
    }
  }, [cards, currentUser, navigate]);

  const actions: QuickAction[] = [
    {
      id: 'new-card',
      label: 'Nueva Tarjeta',
      icon: Plus,
      gradient: 'from-emerald-500 to-emerald-700',
      action: handleCreateCard,
    },
    {
      id: 'templates',
      label: 'Ver Plantillas',
      icon: Layout,
      gradient: 'from-amber-400 to-amber-600',
      action: () => handleNavigate('template-gallery'),
    },
    {
      id: 'analytics',
      label: 'Analítica',
      icon: BarChart3,
      gradient: 'from-teal-500 to-emerald-600',
      action: () => handleNavigate('stats'),
    },
    {
      id: 'kiosk',
      label: 'Modo Kiosko',
      icon: Monitor,
      gradient: 'from-emerald-600 to-teal-700',
      action: handleKiosk,
    },
    {
      id: 'help',
      label: 'Ayuda',
      icon: HelpCircle,
      gradient: 'from-amber-500 to-orange-600',
      action: () => handleNavigate('help'),
    },
  ];

  // No renderizar si no hay sesión activa.
  if (!currentUser) return null;

  return (
    <div
      ref={containerRef}
      className={cn(
        'fixed right-4 bottom-4 z-50 flex flex-col items-end gap-3 transition-transform duration-300 md:right-6 md:bottom-6',
        '[margin-bottom:env(safe-area-inset-bottom)]',
        visible ? 'translate-y-0' : 'translate-y-[120%]',
      )}
      aria-label="Menú de acciones rápidas"
    >
      {/* Backdrop semitransparente para cerrar */}
      <AnimatePresence>
        {expanded && (
          <motion.button
            type="button"
            aria-label="Cerrar menú"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setExpanded(false)}
            className="fixed inset-0 -z-10 cursor-default bg-slate-900/20 backdrop-blur-[1px]"
            // No captura el click si el contenedor lo maneja
            tabIndex={-1}
          />
        )}
      </AnimatePresence>

      {/* Pila de acciones rápidas */}
      <AnimatePresence>
        {expanded && (
          <motion.ul
            className="flex flex-col items-end gap-2.5"
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {actions.map((act, i) => {
              const Icon = act.icon;
              return (
                <motion.li
                  key={act.id}
                  layout
                  variants={{
                    hidden: { opacity: 0, y: 20, scale: 0.6 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: {
                        type: 'spring',
                        stiffness: 400,
                        damping: 22,
                        delay: i * 0.05,
                      },
                    },
                    exit: {
                      opacity: 0,
                      y: 10,
                      scale: 0.6,
                      transition: { duration: 0.15, delay: (actions.length - i) * 0.03 },
                    },
                  }}
                  className="group flex items-center gap-2.5"
                >
                  {/* Etiqueta / tooltip */}
                  <span
                    className={cn(
                      'pointer-events-none select-none rounded-md bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-md ring-1 ring-slate-200/60',
                      'opacity-0 transition-opacity duration-150 group-hover:opacity-100',
                    )}
                  >
                    {act.label}
                  </span>

                  {/* Botón circular */}
                  <button
                    type="button"
                    onClick={act.action}
                    aria-label={act.label}
                    title={act.label}
                    className={cn(
                      'flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br text-white shadow-lg ring-2 ring-white/60 transition-transform',
                      'hover:scale-110 active:scale-95',
                      'md:h-12 md:w-12',
                      act.gradient,
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                </motion.li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>

      {/* Botón principal FAB */}
      <motion.button
        type="button"
        onClick={() => setExpanded(prev => !prev)}
        aria-label={expanded ? 'Cerrar menú de acciones' : 'Abrir menú de acciones'}
        aria-expanded={expanded}
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        className={cn(
          'relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-xl ring-4 ring-white/70',
          'md:h-16 md:w-16',
          // Anillo dorado sutil
          'before:absolute before:inset-0 before:rounded-full before:ring-2 before:ring-amber-400/40 before:transition-all before:content-[""]',
          'hover:before:ring-amber-400/70',
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          {expanded ? (
            <motion.span
              key="x"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="h-6 w-6" />
            </motion.span>
          ) : (
            <motion.span
              key="plus"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Plus className="h-6 w-6" />
            </motion.span>
          )}
        </AnimatePresence>

        {/* Indicador "scroll up" cuando está oculto por scroll */}
        {!visible && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-amber-900 shadow">
            <ChevronUp className="h-3 w-3" />
          </span>
        )}
      </motion.button>
    </div>
  );
}

export default FabMenu;
