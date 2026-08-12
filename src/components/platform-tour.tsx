'use client';

/**
 * PlatformTour — Tour guiado interactivo de FTP Digital Plus
 *
 * Recorre 8 pasos destacando funciones clave de la plataforma usando un
 * spotlight (overlay oscuro con un "agujero" recortado alrededor del elemento
 * objetivo). El tour puede navegar entre vistas (dashboard, editor,
 * template-gallery, stats) para mostrar distintas funciones.
 *
 * Estado global: store.tourActive / store.setTourActive (session-only).
 * Persistencia: al finalizar, se guarda `ftp-tour-completed` en localStorage.
 */

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useSyncExternalStore,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
  MousePointerClick,
  Compass,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { ViewType } from '@/lib/types';
import { cn } from '@/lib/utils';

const TOUR_STORAGE_KEY = 'ftp-tour-completed';
const TOTAL_STEPS = 8;
const SPOTLIGHT_PADDING = 8;

// ---------------------------------------------------------------------------
// localStorage flag (client-only via useSyncExternalStore to avoid
// setState-in-effect lint warnings).
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

interface TargetRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

const EMPTY_RECT: TargetRect = { left: 0, top: 0, width: 0, height: 0 };

/**
 * Encuentra un elemento objetivo a partir de un selector "extendido".
 * Soporta el pseudo-selector `:has-text("...")` además de selectores CSS
 * estándar pasados a `document.querySelector`.
 */
function findTargetElement(selector: string): HTMLElement | null {
  if (!selector || typeof document === 'undefined') return null;

  // Caso 1: pseudo-selector :has-text("...")
  const hasTextMatch = selector.match(/:has-text\(["'](.+?)["']\)/);
  if (hasTextMatch) {
    const text = hasTextMatch[1].toLowerCase();
    const candidates = Array.from(
      document.querySelectorAll<HTMLElement>('button, a, [role="button"]')
    );
    // Primero intentamos coincidencia exacta (trim)
    let match = candidates.find(el =>
      (el.textContent || '').trim().toLowerCase().includes(text)
    );
    if (match) return match;
  }

  // Caso 2: selector CSS estándar (sin el pseudo)
  const cssSelector = selector.replace(/:has-text\(["'].+?["']\)/, '').trim();
  if (cssSelector) {
    try {
      const el = document.querySelector<HTMLElement>(cssSelector);
      if (el) return el;
    } catch {
      /* selector inválido, ignórase */
    }
  }
  return null;
}

function getRect(el: HTMLElement): TargetRect {
  const r = el.getBoundingClientRect();
  return {
    left: r.left,
    top: r.top,
    width: r.width,
    height: r.height,
  };
}

function scrollToElement(el: HTMLElement) {
  try {
    el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
  } catch {
    /* noop */
  }
}

// ---------------------------------------------------------------------------
// Definición de los pasos del tour
// ---------------------------------------------------------------------------

type CueType = 'sparkles' | 'pointer' | 'pulse' | 'check';
type Placement = 'auto' | 'top' | 'bottom' | 'center';

interface TourStep {
  title: string;
  description: string;
  /** Selector del elemento a destacar. Si ausente o no encontrado, modal centrado. */
  selector?: string;
  /** Vista a la que navegar antes de mostrar el paso. */
  view?: ViewType;
  /** Sección del editor a activar (si view === 'editor'). */
  editorSection?: string;
  /** Asegura que haya una tarjeta seleccionada antes de mostrar el paso. */
  ensureCardSelected?: boolean;
  placement?: Placement;
  cue?: CueType;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: '¡Bienvenido a FTP Digital Plus!',
    description:
      'Te llevaremos a un recorrido por las funciones principales de la plataforma. En menos de 2 minutos sabrás cómo crear, personalizar y compartir tus tarjetas digitales. ¡Comencemos!',
    placement: 'center',
    cue: 'sparkles',
  },
  {
    title: 'Crear Tarjeta',
    description:
      'Desde el Tablero, usa este botón para crear una nueva tarjeta digital. Cada plan permite un número máximo de tarjetas: Gratis (1), Básico (2) y Pro (5).',
    selector: 'button:has-text("Crear Nueva Tarjeta")',
    view: 'dashboard',
    placement: 'auto',
    cue: 'pointer',
  },
  {
    title: 'Editor de Tarjetas',
    description:
      'El editor tiene 24 secciones organizadas por categorías: Básico, Contenido, Diseño y Avanzado. Aquí configuras todos los detalles de tu tarjeta digital.',
    selector: 'aside.border-r nav, aside[class*="border-r"] nav',
    view: 'editor',
    ensureCardSelected: true,
    placement: 'auto',
    cue: 'pulse',
  },
  {
    title: 'Personalización',
    description:
      'Personaliza colores, fuentes y plantillas para que tu tarjeta refleje tu marca. Elige entre 5 plantillas profesionales y 8 paletas de colores predefinidas.',
    selector: 'aside.border-r, aside[class*="border-r"]',
    view: 'editor',
    editorSection: 'plantillas',
    ensureCardSelected: true,
    placement: 'auto',
    cue: 'pulse',
  },
  {
    title: 'Vista Previa en Vivo',
    description:
      'Mientras editas, mira en tiempo real cómo se ve tu tarjeta. Los cambios que hagas en el formulario se reflejan instantáneamente en este panel lateral.',
    selector: 'aside.border-l, aside[class*="border-l"]',
    view: 'editor',
    ensureCardSelected: true,
    placement: 'auto',
    cue: 'pulse',
  },
  {
    title: 'Galería de Plantillas',
    description:
      'Explora nuestra galería de plantillas profesionales y elige el diseño que mejor se adapte a tu marca o negocio: moderno, clásico, minimalista, elegante o dinámico.',
    selector: 'h1',
    view: 'template-gallery',
    placement: 'center',
    cue: 'sparkles',
  },
  {
    title: 'Analítica',
    description:
      'Revisa cuántas visitas, escaneos QR y mensajes recibe tu tarjeta. Filtra por rango de tiempo (7, 30 o 90 días) y compara el rendimiento entre tus tarjetas.',
    selector: 'h1',
    view: 'stats',
    placement: 'center',
    cue: 'sparkles',
  },
  {
    title: '¡Listo para empezar!',
    description:
      'Ya conoces las funciones principales de FTP Digital Plus. Crea tu primera tarjeta, personalízala con las 24 secciones del editor y compártela con el mundo. ¡Mucho éxito!',
    placement: 'center',
    cue: 'check',
  },
];

// ---------------------------------------------------------------------------
// Sub-componentes visuales
// ---------------------------------------------------------------------------

function CueIcon({ cue }: { cue?: CueType }) {
  switch (cue) {
    case 'pointer':
      return <MousePointerClick className="h-4 w-4" />;
    case 'check':
      return <Check className="h-4 w-4" />;
    case 'pulse':
      return <Sparkles className="h-4 w-4" />;
    case 'sparkles':
    default:
      return <Sparkles className="h-4 w-4" />;
  }
}

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn(
            'h-1.5 rounded-full transition-all',
            i + 1 === current
              ? 'w-6 bg-emerald-600'
              : i + 1 < current
                ? 'w-1.5 bg-emerald-400'
                : 'w-1.5 bg-slate-200'
          )}
        />
      ))}
    </div>
  );
}

function StepBadge({ step }: { step: number }) {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-md">
      <span className="text-sm font-bold">{step}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Componente principal (envoltura)
// ---------------------------------------------------------------------------

export function PlatformTour() {
  const tourActive = useAppStore(s => s.tourActive);
  const currentUser = useAppStore(s => s.currentUser);

  // El tour solo está activo si: store dice activo + hay usuario logueado.
  // Cuando se desactiva, el componente interno se desmonta y todo su estado
  // se resetea naturalmente (sin llamar setState dentro de effects).
  const isActive = tourActive && !!currentUser;

  if (!isActive) return null;

  return <TourInner />;
}

// ---------------------------------------------------------------------------
// Componente interno — montado solo mientras el tour está activo.
// ---------------------------------------------------------------------------

function TourInner() {
  const setTourActive = useAppStore(s => s.setTourActive);
  const navigate = useAppStore(s => s.navigate);
  const selectCard = useAppStore(s => s.selectCard);
  const setEditorSection = useAppStore(s => s.setEditorSection);
  const currentView = useAppStore(s => s.currentView);
  const currentUser = useAppStore(s => s.currentUser)!;
  const cards = useAppStore(s => s.cards);

  const [step, setStep] = useState(1);
  const [targetRect, setTargetRect] = useState<TargetRect>(EMPTY_RECT);
  const [hasTarget, setHasTarget] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<{ left: number; top: number }>({
    left: 0,
    top: 0,
  });
  const [tooltipPlacement, setTooltipPlacement] = useState<'top' | 'bottom' | 'center'>(
    'center'
  );

  const targetRef = useRef<HTMLElement | null>(null);
  const isAnimatingRef = useRef(false);

  // --- Cierra el tour y marca como completado ---
  const finishTour = useCallback(
    (completed: boolean) => {
      setTourActive(false);
      if (completed) {
        try {
          localStorage.setItem(TOUR_STORAGE_KEY, '1');
        } catch {
          /* ignore */
        }
      }
    },
    [setTourActive]
  );

  // --- Asegura tarjeta seleccionada antes de mostrar pasos del editor ---
  const ensureCardSelected = useCallback(() => {
    if (!currentUser) return;
    const selectedId = useAppStore.getState().selectedCardId;
    if (selectedId) {
      const exists = cards.some(c => c.id === selectedId && c.userId === currentUser.id);
      if (exists) return;
    }
    const userCard = cards.find(c => c.userId === currentUser.id);
    if (userCard) {
      selectCard(userCard.id);
    }
  }, [currentUser, cards, selectCard]);

  // --- Posicionar el spotlight en el objetivo actual ---
  const positionSpotlight = useCallback(() => {
    const currentStepData = TOUR_STEPS[step - 1];
    if (!currentStepData) return;

    // Si es paso centrado (sin selector) o placement === 'center'
    if (!currentStepData.selector || currentStepData.placement === 'center') {
      setHasTarget(false);
      setTooltipPlacement('center');
      // Tooltip centrado en pantalla
      setTooltipPos({ left: -1, top: -1 }); // marker para "centro"
      return;
    }

    const el = findTargetElement(currentStepData.selector);
    targetRef.current = el;

    if (!el) {
      // No encontrado → fallback a modal centrado
      setHasTarget(false);
      setTooltipPlacement('center');
      setTooltipPos({ left: -1, top: -1 });
      return;
    }

    // Asegurarse de que está visible
    scrollToElement(el);

    // Pequeño retardo para que el scrollIntoView termine
    requestAnimationFrame(() => {
      const r = getRect(el);
      setTargetRect(r);
      setHasTarget(true);

      // Calcular placement del tooltip
      const tooltipHeight = 260; // altura aproximada
      const spaceBelow = window.innerHeight - (r.top + r.height);
      const placement: 'top' | 'bottom' =
        currentStepData.placement === 'top'
          ? 'top'
          : currentStepData.placement === 'bottom'
            ? 'bottom'
            : spaceBelow > tooltipHeight + 24
              ? 'bottom'
              : r.top > tooltipHeight + 24
                ? 'top'
                : 'bottom';
      setTooltipPlacement(placement);

      // Calcular posición horizontal (centrada respecto al spotlight, con clamp)
      const tooltipWidth = Math.min(380, window.innerWidth - 32);
      const spotCenterX = r.left + r.width / 2;
      let left = spotCenterX - tooltipWidth / 2;
      left = Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16));

      let top: number;
      if (placement === 'bottom') {
        top = r.top + r.height + SPOTLIGHT_PADDING + 16;
      } else {
        top = r.top - SPOTLIGHT_PADDING - tooltipHeight - 16;
      }
      // Clamp vertical
      top = Math.max(16, Math.min(top, window.innerHeight - tooltipHeight - 16));

      setTooltipPos({ left, top });
    });
  }, [step]);

  // --- Effect principal: cuando cambia el paso o la vista, reposicionar ---
  useEffect(() => {
    const currentStepData = TOUR_STEPS[step - 1];
    if (!currentStepData) return;

    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;

    // 1. Asegurar tarjeta seleccionada si es necesario
    if (currentStepData.ensureCardSelected) {
      ensureCardSelected();
    }

    // 2. Cambiar de sección del editor si es necesario
    if (currentStepData.editorSection) {
      setEditorSection(currentStepData.editorSection);
    }

    // 3. Navegar a la vista si es necesario
    const needsNavigation = currentStepData.view && currentStepData.view !== currentView;
    if (needsNavigation) {
      navigate(currentStepData.view!);
      // Esperar a que la nueva vista se monte y renderice
      const t = setTimeout(() => {
        positionSpotlight();
        isAnimatingRef.current = false;
      }, 600);
      return () => {
        clearTimeout(t);
        isAnimatingRef.current = false;
      };
    }

    // Si no hay navegación, reposicionar tras un microtask
    const raf = requestAnimationFrame(() => {
      positionSpotlight();
      isAnimatingRef.current = false;
    });
    return () => cancelAnimationFrame(raf);
  }, [step, currentView, navigate, positionSpotlight, ensureCardSelected, setEditorSection]);

  // --- Recalcular posición al hacer resize o scroll ---
  useEffect(() => {
    const handle = () => positionSpotlight();
    window.addEventListener('resize', handle);
    window.addEventListener('scroll', handle, true);
    return () => {
      window.removeEventListener('resize', handle);
      window.removeEventListener('scroll', handle, true);
    };
  }, [positionSpotlight]);

  // --- Handlers de navegación ---
  const handleNext = useCallback(() => {
    if (step >= TOTAL_STEPS) {
      finishTour(true);
      return;
    }
    setStep(s => Math.min(TOTAL_STEPS, s + 1));
  }, [step, finishTour]);

  const handlePrev = useCallback(() => {
    setStep(s => Math.max(1, s - 1));
  }, []);

  const handleSkip = useCallback(() => {
    finishTour(false);
  }, [finishTour]);

  // --- Tecla ESC para cerrar ---
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSkip();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft' && step > 1) {
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [step, handleSkip, handleNext, handlePrev]);

  // --- Render ---
  const currentStepData = TOUR_STEPS[step - 1];
  const isLast = step === TOTAL_STEPS;
  const isFirst = step === 1;
  const isCenter = !hasTarget || tooltipPlacement === 'center';

  // Coordenadas del spotlight (con padding)
  const spotLeft = targetRect.left - SPOTLIGHT_PADDING;
  const spotTop = targetRect.top - SPOTLIGHT_PADDING;
  const spotWidth = targetRect.width + SPOTLIGHT_PADDING * 2;
  const spotHeight = targetRect.height + SPOTLIGHT_PADDING * 2;

  return (
    <div
      className="fixed inset-0 z-[100]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-title"
    >
      {/* Click-blocker: bloquea clicks fuera del tooltip */}
      <div
        className="absolute inset-0"
        onClick={handleSkip}
        aria-hidden
      />

      {/* Spotlight con técnica de box-shadow (solo si hay objetivo) */}
      <AnimatePresence>
        {hasTarget && (
          <motion.div
            key="spotlight"
            className="pointer-events-none absolute rounded-xl"
            initial={false}
            animate={{
              left: spotLeft,
              top: spotTop,
              width: spotWidth,
              height: spotHeight,
              opacity: 1,
            }}
            transition={{ type: 'spring', stiffness: 200, damping: 26 }}
            style={{
              boxShadow:
                '0 0 0 9999px rgba(15, 23, 42, 0.72), 0 0 0 2px rgba(245, 158, 11, 0.9) inset',
            }}
          />
        )}
      </AnimatePresence>

      {/* Pulse ring alrededor del objetivo */}
      <AnimatePresence>
        {hasTarget && (
          <motion.div
            key="pulse-ring"
            className="pointer-events-none absolute rounded-xl border-2 border-amber-400"
            initial={false}
            animate={{
              left: spotLeft,
              top: spotTop,
              width: spotWidth,
              height: spotHeight,
            }}
            transition={{ type: 'spring', stiffness: 200, damping: 26 }}
          >
            <motion.span
              className="absolute inset-0 rounded-xl border-2 border-amber-300/70"
              animate={{ opacity: [0.6, 0, 0.6], scale: [1, 1.08, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Si no hay target, overlay oscuro uniforme */}
      {!hasTarget && (
        <div className="absolute inset-0 bg-slate-900/72 backdrop-blur-[1px]" />
      )}

      {/* Tooltip / Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`tooltip-${step}`}
          initial={{ opacity: 0, y: isCenter ? 12 : tooltipPlacement === 'bottom' ? 12 : -12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 280, damping: 24 }}
          className={cn(
            'absolute z-[210] w-[min(380px,calc(100vw-2rem))] overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-emerald-900/10',
            isCenter && 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'
          )}
          style={
            isCenter
              ? undefined
              : { left: tooltipPos.left, top: tooltipPos.top }
          }
        >
          {/* Header con degradado esmeralda → oro */}
          <div className="relative overflow-hidden bg-gradient-to-r from-emerald-50/80 via-white to-amber-50/50 px-5 py-4">
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-amber-400/15 blur-2xl" />
            <div className="relative flex items-start gap-3">
              <StepBadge step={step} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Compass className="h-3.5 w-3.5 text-emerald-600" />
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                    Tour · Paso {step} de {TOTAL_STEPS}
                  </p>
                </div>
                <h3
                  id="tour-title"
                  className="mt-0.5 truncate text-base font-bold text-slate-900"
                >
                  {currentStepData.title}
                </h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSkip}
                className="size-7 shrink-0 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Cerrar tour"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Contenido */}
          <div className="px-5 py-4">
            <div className="flex items-start gap-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
                <CueIcon cue={currentStepData.cue} />
              </div>
              <p className="text-sm leading-relaxed text-slate-700">
                {currentStepData.description}
              </p>
            </div>

            {/* Hint visual cuando hay spotlight */}
            {hasTarget && (
              <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-[11px] font-medium text-amber-700 ring-1 ring-amber-200/60">
                <MousePointerClick className="h-3.5 w-3.5" />
                Mira el elemento destacado en dorado
              </div>
            )}
          </div>

          {/* Footer con dots y botones */}
          <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/50 px-5 py-3">
            <StepDots current={step} total={TOTAL_STEPS} />
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              >
                Saltar tour
              </Button>
              {!isFirst && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrev}
                  className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Anterior</span>
                </Button>
              )}
              <Button
                size="sm"
                onClick={handleNext}
                className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-sm hover:from-emerald-700 hover:to-emerald-600"
              >
                {isLast ? (
                  <>
                    <Check className="h-4 w-4" />
                    Finalizar
                  </>
                ) : (
                  <>
                    Siguiente
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Indicador de teclado (esquina inferior izquierda) */}
      <div className="pointer-events-none absolute bottom-4 left-4 hidden items-center gap-2 rounded-full bg-slate-900/80 px-3 py-1.5 text-[10px] font-medium text-white backdrop-blur sm:flex">
        <kbd className="rounded border border-white/30 bg-white/10 px-1.5 py-0.5 font-mono">ESC</kbd>
        cerrar
        <span className="mx-1 text-white/30">·</span>
        <kbd className="rounded border border-white/30 bg-white/10 px-1.5 py-0.5 font-mono">←</kbd>
        <kbd className="rounded border border-white/30 bg-white/10 px-1.5 py-0.5 font-mono">→</kbd>
        navegar
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Hook de utilidad para iniciar el tour desde otros componentes
// ---------------------------------------------------------------------------

/**
 * Inicia el tour guiado. Marca `tourActive = true` en el store.
 * Si el tour ya está completado, lo reinicia igual (forzado).
 */
export function startPlatformTour() {
  useAppStore.getState().setTourActive(true);
}

/**
 * Hook reactivo que indica si el tour fue completado (localStorage).
 */
export function useTourCompleted(): boolean {
  return useSyncExternalStore(
    subscribeNoop,
    readTourCompletedClient,
    readTourCompletedServer
  );
}

export default PlatformTour;
