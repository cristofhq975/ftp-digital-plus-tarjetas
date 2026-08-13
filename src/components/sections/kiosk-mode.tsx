'use client';

/**
 * kiosk-mode.tsx — Modo kiosko a pantalla completa (Task 12-a)
 *
 * Características:
 *  - Pantalla completa sin header/footer/nav
 *  - Auto-rotación entre tarjetas cada 10s (si hay varias)
 *  - CardPreview grande y centrado + QR prominente
 *  - Controles auto-ocultos (mouse move): prev/next, pause/play, exit, fullscreen
 *  - ESC para salir
 *  - Pantalla idle tras 2 min sin interacción (screensaver con logo FTP)
 *  - Fondo: malla de gradiente animada con colores de la tarjeta
 *  - Overlay de stats (visitas + escaneos QR)
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeCanvas } from 'qrcode.react';
import {
  ChevronLeft, ChevronRight, Pause, Play, X, Maximize2, Minimize2,
  QrCode, Eye, Sparkles,
} from 'lucide-react';
import { useAppStore, useCurrentUserCards } from '@/lib/store';
import { PLANS } from '@/lib/plans';
import { buildWhatsappUrl } from '@/lib/card-utils';
import { FTPLogo } from '@/components/ftp-logo';
import { CardPreview } from '@/components/card-preview';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ROTATION_MS = 10_000;       // 10 segundos entre tarjetas
const CONTROLS_HIDE_MS = 5_000;   // auto-hide controles tras 5s
const IDLE_MS = 120_000;          // 2 minutos para screensaver

export function KioskMode() {
  const navigate = useAppStore(s => s.navigate);
  const cards = useCurrentUserCards();

  if (cards.length === 0) {
    return <EmptyKiosk onExit={() => navigate('dashboard')} />;
  }
  return <KioskContent cards={cards} />;
}

function KioskContent({ cards }: { cards: NonNullable<ReturnType<typeof useCurrentUserCards>> }) {
  const navigate = useAppStore(s => s.navigate);
  const currentUser = useAppStore(s => s.currentUser);
  const selectCard = useAppStore(s => s.selectCard);

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isIdle, setIsIdle] = useState(false);

  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const userPlan = currentUser?.plan || 'gratis';

  // Asegurar índice válido (las tarjetas pueden eliminarse)
  const safeIndex = Math.min(index, cards.length - 1);
  const currentCard = cards[safeIndex];

  const next = useCallback(() => {
    if (cards.length <= 1) return;
    setIndex(i => (i + 1) % cards.length);
  }, [cards.length]);

  const prev = useCallback(() => {
    if (cards.length <= 1) return;
    setIndex(i => (i - 1 + cards.length) % cards.length);
  }, [cards.length]);

  // Rotación automática
  useEffect(() => {
    if (paused || cards.length <= 1) return;
    const id = setInterval(() => {
      setIndex(i => (i + 1) % cards.length);
    }, ROTATION_MS);
    return () => clearInterval(id);
  }, [paused, cards.length]);

  // Notificar selección de tarjeta al store (para stats/QR consistentes)
  useEffect(() => {
    if (currentCard) selectCard(currentCard.id);
  }, [currentCard?.id, selectCard]);

  // Auto-hide controles tras inactividad de mouse
  const wakeControls = useCallback(() => {
    setControlsVisible(true);
    setIsIdle(false);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setControlsVisible(false), CONTROLS_HIDE_MS);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => setIsIdle(true), IDLE_MS);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    wakeControls();
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [wakeControls]);

  // ESC para salir
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Si estamos en fullscreen, ESC primero sale de fullscreen (comportamiento del navegador)
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
          setIsFullscreen(false);
          return;
        }
        navigate('dashboard');
      } else if (e.key === 'ArrowRight') {
        next();
        wakeControls();
      } else if (e.key === 'ArrowLeft') {
        prev();
        wakeControls();
      } else if (e.key === ' ') {
        e.preventDefault();
        setPaused(p => !p);
        wakeControls();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate, next, prev, wakeControls]);

  // Sincronizar estado fullscreen
  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

  const exit = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    navigate('dashboard');
  }, [navigate]);

  // Sincronizar índice si cambia el total de tarjetas
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (index > cards.length - 1) setIndex(0);
  }, [cards.length, index]);

  // QR value
  const qrValue = currentCard?.whatsappNumber
    ? buildWhatsappUrl(currentCard.whatsappNumber, currentCard.whatsappMessage || 'Hola, vi tu tarjeta digital')
    : 'https://ftpdigitalplus.com';

  return (
    <div
      ref={containerRef}
      onMouseMove={wakeControls}
      onTouchStart={wakeControls}
      className="relative h-screen w-screen overflow-hidden bg-slate-950 text-white"
    >
      {/* Animated gradient mesh background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentCard?.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(circle at 20% 30%, ${currentCard?.primaryColor}40 0%, transparent 50%),
                radial-gradient(circle at 80% 70%, ${currentCard?.secondaryColor}40 0%, transparent 50%),
                radial-gradient(circle at 50% 50%, ${currentCard?.primaryColor}20 0%, transparent 70%),
                #0b1120
              `,
            }}
          />
          {/* Floating blobs */}
          <motion.div
            className="absolute -left-32 top-1/4 h-96 w-96 rounded-full blur-3xl"
            style={{ background: `${currentCard?.primaryColor}30` }}
            animate={{ y: [0, 50, 0], x: [0, 30, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -right-32 bottom-1/4 h-96 w-96 rounded-full blur-3xl"
            style={{ background: `${currentCard?.secondaryColor}30` }}
            animate={{ y: [0, -40, 0], x: [0, -20, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Stats overlay (top-left) */}
      <div
        className={cn(
          'absolute left-4 top-4 z-20 flex items-center gap-3 transition-opacity duration-500',
          controlsVisible ? 'opacity-100' : 'opacity-0'
        )}
      >
        <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium backdrop-blur-md ring-1 ring-white/10">
          <Eye className="h-3.5 w-3.5 text-emerald-400" />
          <span className="font-semibold text-white">{currentCard?.views.toLocaleString('es-MX') ?? 0}</span>
          <span className="text-white/60">visitas</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium backdrop-blur-md ring-1 ring-white/10">
          <QrCode className="h-3.5 w-3.5 text-amber-400" />
          <span className="font-semibold text-white">{currentCard?.qrScans.toLocaleString('es-MX') ?? 0}</span>
          <span className="text-white/60">QR</span>
        </div>
      </div>

      {/* Pagination indicator (top-right) */}
      {cards.length > 1 && (
        <div
          className={cn(
            'absolute right-4 top-4 z-20 flex items-center gap-2 transition-opacity duration-500',
            controlsVisible ? 'opacity-100' : 'opacity-0'
          )}
        >
          <div className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium backdrop-blur-md ring-1 ring-white/10">
            {cards.map((c, i) => (
              <button
                key={c.id}
                onClick={() => setIndex(i)}
                aria-label={`Ir a tarjeta ${i + 1}`}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  i === safeIndex
                    ? 'w-6 bg-emerald-400'
                    : 'w-1.5 bg-white/30 hover:bg-white/50'
                )}
              />
            ))}
          </div>
        </div>
      )}

      {/* Main content: Card + QR */}
      <div className="relative z-10 flex h-full w-full items-center justify-center px-4 py-8 sm:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard?.id}
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.96 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-10"
          >
            {/* Card */}
            <div className="mx-auto w-full max-w-md lg:max-w-none">
              {currentCard && (
                <CardPreview card={currentCard} userPlan={userPlan} />
              )}
            </div>

            {/* QR prominent */}
            <div className="flex flex-col items-center justify-center gap-4">
              <motion.div
                className="rounded-2xl bg-white p-4 shadow-2xl ring-4 ring-white/10"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <QRCodeCanvas
                  value={qrValue}
                  size={224}
                  level="H"
                  includeMargin={false}
                  bgColor="#ffffff"
                  fgColor={currentCard?.primaryColor || '#059669'}
                />
              </motion.div>
              <div className="text-center">
                <p className="flex items-center justify-center gap-1.5 text-sm font-semibold text-white">
                  <QrCode className="h-4 w-4 text-emerald-400" />
                  Escanea para contactar
                </p>
                <p className="mt-0.5 text-xs text-white/60">
                  {currentCard?.cardName}
                </p>
                <p className="mt-0.5 font-mono text-[10px] text-white/40">
                  ftpdigitalplus.com/t/{currentCard?.linkName}
                </p>
              </div>
              {/* Progress bar for rotation */}
              {!paused && cards.length > 1 && (
                <div className="h-1 w-48 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    key={`progress-${currentCard?.id}`}
                    className="h-full bg-emerald-400"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: ROTATION_MS / 1000, ease: 'linear' }}
                  />
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls bar (auto-hide) */}
      <AnimatePresence>
        {controlsVisible && !isIdle && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-6 left-1/2 z-30 -translate-x-1/2"
          >
            <div className="flex items-center gap-1 rounded-full bg-white/10 p-1.5 backdrop-blur-xl ring-1 ring-white/15">
              <ControlButton
                onClick={prev}
                disabled={cards.length <= 1}
                aria-label="Tarjeta anterior"
              >
                <ChevronLeft className="h-5 w-5" />
              </ControlButton>

              <ControlButton
                onClick={() => setPaused(p => !p)}
                aria-label={paused ? 'Reanudar' : 'Pausar'}
                className={cn(
                  paused
                    ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                    : 'hover:bg-white/15'
                )}
              >
                {paused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
              </ControlButton>

              <ControlButton
                onClick={next}
                disabled={cards.length <= 1}
                aria-label="Siguiente tarjeta"
              >
                <ChevronRight className="h-5 w-5" />
              </ControlButton>

              <div className="mx-1 h-6 w-px bg-white/15" />

              <ControlButton
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
              >
                {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
              </ControlButton>

              <ControlButton
                onClick={exit}
                aria-label="Salir del modo kiosko"
                className="text-rose-300 hover:bg-rose-500/30 hover:text-rose-200"
              >
                <X className="h-5 w-5" />
              </ControlButton>
            </div>
            <p className="mt-2 text-center text-[10px] text-white/50">
              Presiona <kbd className="rounded bg-white/10 px-1">ESC</kbd> para salir ·
              <kbd className="ml-1 rounded bg-white/10 px-1">←</kbd>
              <kbd className="ml-1 rounded bg-white/10 px-1">→</kbd> para navegar
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Idle screensaver */}
      <AnimatePresence>
        {isIdle && <IdleScreen onWake={wakeControls} cardName={currentCard?.cardName} />}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Subcomponentes                                                    */
/* ------------------------------------------------------------------ */

function ControlButton({
  children, onClick, disabled, className, ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-full text-white transition-all',
        'disabled:cursor-not-allowed disabled:opacity-30',
        !disabled && 'hover:bg-white/15 active:scale-95',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function EmptyKiosk({ onExit }: { onExit: () => void }) {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-6 bg-slate-950 text-center text-white">
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle at 30% 30%, #05966930 0%, transparent 50%),
              radial-gradient(circle at 70% 70%, #f59e0b30 0%, transparent 50%),
              #0b1120
            `,
          }}
        />
      </div>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative flex flex-col items-center gap-6"
      >
        <FTPLogo className="h-16 w-auto" theme="dark" />
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">No hay tarjetas para mostrar</h1>
          <p className="max-w-md text-sm text-white/60">
            Crea al menos una tarjeta digital en tu panel para activar el modo kiosko.
          </p>
        </div>
        <Button
          onClick={onExit}
          className="bg-emerald-600 text-white hover:bg-emerald-700"
        >
          Volver al panel
        </Button>
      </motion.div>
    </div>
  );
}

function IdleScreen({ onWake, cardName }: { onWake: () => void; cardName?: string }) {
  return (
    <motion.button
      type="button"
      onClick={onWake}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="absolute inset-0 z-40 flex cursor-pointer flex-col items-center justify-center bg-slate-950/90 backdrop-blur-sm"
      aria-label="Pantalla en reposo, toca para activar"
    >
      <motion.div
        animate={{
          y: [0, -16, 0],
          rotate: [0, 4, -4, 0],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <FTPLogo className="h-24 w-auto" theme="dark" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-center"
      >
        <p className="flex items-center gap-2 text-lg font-semibold text-white">
          <Sparkles className="h-5 w-5 text-amber-400" />
          FTP Digital Plus
        </p>
        <p className="mt-1 text-sm text-white/50">
          Modo kiosko en reposo
        </p>
        {cardName && (
          <p className="mt-3 text-xs text-white/40">
            Mostrando: {cardName}
          </p>
        )}
        <motion.p
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mt-6 text-xs text-white/60"
        >
          Toca la pantalla para continuar
        </motion.p>
      </motion.div>
    </motion.button>
  );
}

export default KioskMode;
