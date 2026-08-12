'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Zap, ShieldCheck, WifiOff, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * InstalPrompt
 * Banner de instalación PWA personalizado.
 * - Escucha el evento `beforeinstallprompt` (Chrome/Android/Edge desktop).
 * - Muestra un banner bonito con gradiente esmeralda + acento oro.
 * - Permite cerrarlo; la decisión se guarda en localStorage (no se vuelve a mostrar
 *   durante 7 días o hasta que el usuario limpie el storage).
 * - En iOS Safari no se dispara `beforeinstallprompt`, por lo que mostramos un
 *   mini-instructivo "Añadir a pantalla de inicio" cuando detectamos iOS.
 */

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt: () => Promise<void>;
}

const DISMISS_KEY = 'ftp:pwa-install-dismissed';
const DISMISS_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 días
const INSTALLED_KEY = 'ftp:pwa-installed';

function isStandalone() {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // @ts-expect-error iOS Safari
    window.navigator.standalone === true
  );
}

function isIOS() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  // iPadOS 13+ reports as Mac, so check for touch + Mac
  const isIPad = /iPad/.test(ua) || (/Macintosh/.test(ua) && 'ontouchend' in document);
  return /iPhone|iPod/.test(ua) || isIPad;
}

function isDismissed() {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const ts = Number(raw);
    if (!ts) return false;
    return Date.now() - ts < DISMISS_TTL_MS;
  } catch {
    return false;
  }
}

function markDismissed() {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    /* noop */
  }
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [iosHint, setIosHint] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (isStandalone()) {
      try {
        localStorage.setItem(INSTALLED_KEY, '1');
      } catch {
        /* noop */
      }
      return;
    }
    if (isDismissed()) return;

    const onBeforeInstall = (e: Event) => {
      // Prevenir el mini-infobar por defecto de Chrome
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    const onAppInstalled = () => {
      setVisible(false);
      setDeferredPrompt(null);
      try {
        localStorage.setItem(INSTALLED_KEY, '1');
      } catch {
        /* noop */
      }
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onAppInstalled);

    // En iOS no hay beforeinstallprompt; mostramos un hint diferido (3.5s)
    let iosTimer: ReturnType<typeof setTimeout> | undefined;
    if (isIOS() && !isStandalone()) {
      iosTimer = setTimeout(() => {
        setIosHint(true);
        setVisible(true);
      }, 3500);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onAppInstalled);
      if (iosTimer) clearTimeout(iosTimer);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // iOS u otros sin beforeinstallprompt — solo cerramos
      setVisible(false);
      markDismissed();
      return;
    }
    try {
      setInstalling(true);
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'dismissed') {
        markDismissed();
      }
    } catch {
      /* noop */
    } finally {
      setInstalling(false);
      setDeferredPrompt(null);
      setVisible(false);
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    markDismissed();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="install-prompt"
          initial={{ y: 120, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 120, opacity: 0, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          className="fixed inset-x-0 bottom-0 z-[60] px-3 pb-3 sm:px-4 sm:pb-4"
          role="dialog"
          aria-labelledby="pwa-install-title"
          aria-describedby="pwa-install-desc"
        >
          <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-emerald-200/70 bg-white shadow-2xl ring-1 ring-emerald-500/10 dark:border-emerald-900/40 dark:bg-card">
            {/* Banda superior con gradiente esmeralda + oro */}
            <div className="relative bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-500 px-4 py-3 sm:px-5">
              <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-amber-400/30 to-transparent" />
              <div className="relative flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* App icon */}
                  <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/15 backdrop-blur-sm ring-1 ring-white/30">
                    <img
                      src="/icon-192.png"
                      alt="FTP Digital Plus"
                      className="size-8 rounded-md"
                      width={32}
                      height={32}
                    />
                  </div>
                  <div className="text-white">
                    <p className="text-sm font-semibold leading-tight sm:text-base">
                      Instalar FTP Digital Plus
                    </p>
                    <p className="text-[11px] text-emerald-50/90 sm:text-xs">
                      Acceso rápido desde tu pantalla de inicio
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleDismiss}
                  aria-label="Cerrar aviso de instalación"
                  className="grid size-8 shrink-0 place-items-center rounded-lg text-white/90 transition hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* Cuerpo */}
            <div className="px-4 py-4 sm:px-5 sm:py-5">
              <p
                id="pwa-install-title"
                className="text-sm font-semibold text-foreground sm:text-base"
              >
                Lleva tus tarjetas digitales a todas partes
              </p>
              <p
                id="pwa-install-desc"
                className="mt-1 text-xs text-muted-foreground sm:text-[13px]"
              >
                Instala la app para acceder sin navegador, con modo offline y
                notificaciones instantáneas.
              </p>

              {/* Beneficios */}
              <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                <BenefitItem
                  icon={<Zap className="size-3.5 text-amber-500" />}
                  text="Inicio rápido"
                />
                <BenefitItem
                  icon={<WifiOff className="size-3.5 text-emerald-600" />}
                  text="Funciona sin conexión"
                />
                <BenefitItem
                  icon={<ShieldCheck className="size-3.5 text-emerald-600" />}
                  text="Datos seguros en tu equipo"
                />
              </ul>

              {iosHint && (
                <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
                  <Sparkles className="mr-1 inline size-3.5 align-text-bottom" />
                  En iPhone/iPad: toca <strong>Compartir</strong> y luego{' '}
                  <strong>“Añadir a pantalla de inicio”</strong>.
                </div>
              )}

              {/* Acciones */}
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="order-2 sm:order-1"
                >
                  Ahora no
                </Button>
                <Button
                  size="sm"
                  onClick={handleInstall}
                  disabled={installing}
                  className="order-1 gap-1.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-sm hover:from-emerald-700 hover:to-emerald-600 sm:order-2"
                >
                  <Download className="size-4" />
                  {installing ? 'Instalando…' : 'Instalar App'}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function BenefitItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <li className="flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50/50 px-2.5 py-1.5 dark:border-emerald-900/30 dark:bg-emerald-950/20">
      <span className="grid size-5 shrink-0 place-items-center rounded-full bg-white shadow-sm ring-1 ring-emerald-100 dark:bg-card dark:ring-emerald-900/40">
        {icon}
      </span>
      <span className="text-[11px] font-medium leading-tight text-emerald-900 dark:text-emerald-100 sm:text-xs">
        {text}
      </span>
    </li>
  );
}
