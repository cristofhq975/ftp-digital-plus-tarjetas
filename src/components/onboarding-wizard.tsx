'use client';

import { useState, useMemo, useCallback, useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeCanvas } from 'qrcode.react';
import { toast } from 'sonner';
import {
  X,
  Check,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  User,
  QrCode,
  Share2,
  Copy,
  Wand2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppStore, useCurrentUserCards } from '@/lib/store';
import { PLANS, EDITOR_SECTIONS } from '@/lib/plans';
import { DynamicIcon } from '@/components/dynamic-icon';
import { slugify } from '@/lib/card-utils';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'ftp-onboarding-completed';
const TOTAL_STEPS = 4;

// Read onboarding-completed flag from localStorage (client-only) via
// useSyncExternalStore to avoid setState-in-effect lint warnings.
const subscribeNoop = () => () => {};
function readCompletedClient(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}
function readCompletedServer(): boolean {
  return false;
}

export function OnboardingWizard() {
  const currentUser = useAppStore(s => s.currentUser);
  const createCard = useAppStore(s => s.createCard);
  const cards = useCurrentUserCards();
  const selectedCard = useAppStore(s => {
    if (!s.selectedCardId) return null;
    return s.cards.find(c => c.id === s.selectedCardId) || null;
  });

  const isCompleted = useSyncExternalStore(
    subscribeNoop,
    readCompletedClient,
    readCompletedServer
  );
  const [dismissed, setDismissed] = useState(false);
  const shouldShow = !!currentUser && !isCompleted && !dismissed;

  const [step, setStep] = useState(1);
  const [cardName, setCardName] = useState('');
  const [linkName, setLinkName] = useState('');
  const [linkTouched, setLinkTouched] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newCardLinkName, setNewCardLinkName] = useState<string | null>(null);
  const [startTourAfterFinish, setStartTourAfterFinish] = useState(true);

  const closeWizard = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* ignore */
    }
    setDismissed(true);
  }, []);

  const hasExistingCard = cards.length > 0;
  const plan = currentUser ? PLANS[currentUser.plan] : null;
  const atLimit = plan ? cards.length >= plan.maxCards : false;

  const canCreate = useMemo(() => {
    if (!cardName.trim() || !linkName.trim()) return false;
    if (cards.some(c => c.linkName === linkName)) return false;
    return true;
  }, [cardName, linkName, cards]);

  const handleCreateCard = useCallback(() => {
    if (!canCreate || atLimit) return;
    setCreating(true);
    // Small delay for UX feedback
    setTimeout(() => {
      const id = createCard(linkName.trim(), cardName.trim());
      setCreating(false);
      if (id) {
        setNewCardLinkName(linkName.trim());
        toast.success('¡Tarjeta creada!', {
          description: `"${cardName}" está lista para personalizar.`,
        });
        setStep(3);
      } else {
        toast.error('No se pudo crear la tarjeta', {
          description: 'Es posible que hayas alcanzado el límite de tu plan.',
        });
      }
    }, 400);
  }, [canCreate, atLimit, createCard, linkName, cardName]);

  const handleNext = useCallback(() => {
    setStep(s => Math.min(TOTAL_STEPS, s + 1));
  }, []);

  const handlePrev = useCallback(() => {
    setStep(s => Math.max(1, s - 1));
  }, []);

  const handleSkip = useCallback(() => {
    toast.info('Tutorial omitido', {
      description: 'Puedes completarlo más adelante si lo deseas.',
    });
    closeWizard();
  }, [closeWizard]);

  const handleFinish = useCallback(() => {
    toast.success('¡Listo! Bienvenido a FTP Digital Plus', {
      description: 'Ya puedes empezar a crear y compartir tus tarjetas.',
    });
    closeWizard();
    // Iniciar tour guiado si el usuario lo solicitó
    if (startTourAfterFinish) {
      // Pequeño retardo para que el modal se cierre antes de abrir el tour
      setTimeout(() => {
        useAppStore.getState().setTourActive(true);
      }, 350);
    }
  }, [closeWizard, startTourAfterFinish]);

  if (!shouldShow || !currentUser) return null;

  // Determine which card link name to show in step 4
  const shareLinkName =
    newCardLinkName ||
    (selectedCard?.linkName ?? null) ||
    (cards[0]?.linkName ?? null);

  const progress = (step / TOTAL_STEPS) * 100;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-3 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-emerald-900/10"
      >
        {/* Top bar */}
        <div className="flex items-center justify-between gap-3 border-b border-emerald-100/70 bg-gradient-to-r from-emerald-50/80 via-white to-amber-50/50 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-sm">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-emerald-700">
                Tutorial · Paso {step} de {TOTAL_STEPS}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {step === 1 && 'Bienvenida'}
                {step === 2 && 'Crea tu primera tarjeta'}
                {step === 3 && 'Personaliza tu tarjeta'}
                {step === 4 && 'Comparte con el mundo'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-xs text-slate-600 hover:bg-slate-100 hover:text-slate-800"
            >
              <span className="hidden sm:inline">Saltar tutorial</span>
              <span className="sm:hidden">Saltar</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={closeWizard}
              className="size-8 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 w-full bg-emerald-50">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-500 to-amber-500"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          />
        </div>

        {/* Step content */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="px-4 py-6 sm:px-8 sm:py-8"
            >
              {step === 1 && <StepWelcome />}
              {step === 2 && (
                <StepCreateCard
                  cardName={cardName}
                  linkName={linkName}
                  onCardNameChange={v => {
                    setCardName(v);
                    if (!linkTouched) setLinkName(slugify(v));
                  }}
                  onLinkNameChange={v => {
                    setLinkTouched(true);
                    setLinkName(v);
                  }}
                  hasExistingCard={hasExistingCard}
                  existingCount={cards.length}
                  atLimit={atLimit}
                  linkTaken={cards.some(c => c.linkName === linkName)}
                />
              )}
              {step === 3 && <StepPersonalize />}
              {step === 4 && (
                <StepShare
                  linkName={shareLinkName}
                  startTour={startTourAfterFinish}
                  onStartTourChange={setStartTourAfterFinish}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom navigation */}
        <div className="flex items-center justify-between gap-3 border-t border-emerald-100/70 bg-white px-4 py-3 sm:px-8">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  i + 1 === step
                    ? 'w-6 bg-emerald-600'
                    : i + 1 < step
                      ? 'w-1.5 bg-emerald-400'
                      : 'w-1.5 bg-slate-200'
                )}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {step > 1 && step !== 4 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
              >
                <ArrowLeft className="h-4 w-4" />
                Atrás
              </Button>
            )}
            {step === 1 && (
              <Button
                size="sm"
                onClick={handleNext}
                className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-sm hover:from-emerald-700 hover:to-emerald-600"
              >
                Siguiente
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
            {step === 2 && (
              <>
                {hasExistingCard && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleNext}
                    className="border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    Continuar sin crear
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
                {!atLimit && (
                  <Button
                    size="sm"
                    onClick={handleCreateCard}
                    disabled={!canCreate || creating}
                    className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-sm hover:from-emerald-700 hover:to-emerald-600 disabled:opacity-50"
                  >
                    {creating ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Creando…
                      </>
                    ) : (
                      <>
                        Crear y continuar
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
                {atLimit && !hasExistingCard && (
                  <Button
                    size="sm"
                    onClick={handleNext}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm hover:from-amber-600 hover:to-amber-700"
                  >
                    Continuar
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </>
            )}
            {step === 3 && (
              <Button
                size="sm"
                onClick={handleNext}
                className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-sm hover:from-emerald-700 hover:to-emerald-600"
              >
                Entendido
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
            {step === 4 && (
              <Button
                size="sm"
                onClick={handleFinish}
                className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-sm hover:from-emerald-700 hover:to-emerald-600"
              >
                <Check className="h-4 w-4" />
                Finalizar
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 1 - Welcome                                                    */
/* ------------------------------------------------------------------ */
function StepWelcome() {
  return (
    <div className="flex flex-col items-center text-center">
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.1 }}
        className="relative mb-6"
      >
        <div className="absolute inset-0 -z-10 rounded-full bg-emerald-400/30 blur-2xl" />
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 text-5xl shadow-xl shadow-emerald-500/30 ring-4 ring-white">
          <motion.span
            animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
          >
            👋
          </motion.span>
        </div>
      </motion.div>

      <h2
        id="onboarding-title"
        className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
      >
        ¡Bienvenido a{' '}
        <span className="bg-gradient-to-r from-emerald-600 to-amber-500 bg-clip-text text-transparent">
          FTP Digital Plus
        </span>
        !
      </h2>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
        En menos de 2 minutos vas a crear tu primera tarjeta de presentación
        digital, personalizarla con tus datos y compartir con quien tú quieras
        mediante QR o enlace.
      </p>

      <div className="mt-6 grid w-full max-w-md grid-cols-1 gap-2 sm:grid-cols-3">
        {[
          { icon: User, label: 'Crea', color: 'text-emerald-600 bg-emerald-50' },
          { icon: Wand2, label: 'Personaliza', color: 'text-amber-600 bg-amber-50' },
          { icon: Share2, label: 'Comparte', color: 'text-emerald-600 bg-emerald-50' },
        ].map(({ icon: Icon, label, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className="flex flex-col items-center gap-1.5 rounded-xl border border-emerald-100/70 bg-white/60 px-3 py-3"
          >
            <div className={cn('flex h-8 w-8 items-center justify-center rounded-full', color)}>
              <Icon className="h-4 w-4" />
            </div>
            <span className="text-xs font-medium text-slate-700">{label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 2 - Create first card                                          */
/* ------------------------------------------------------------------ */
function StepCreateCard({
  cardName,
  linkName,
  onCardNameChange,
  onLinkNameChange,
  hasExistingCard,
  existingCount,
  atLimit,
  linkTaken,
}: {
  cardName: string;
  linkName: string;
  onCardNameChange: (v: string) => void;
  onLinkNameChange: (v: string) => void;
  hasExistingCard: boolean;
  existingCount: number;
  atLimit: boolean;
  linkTaken: boolean;
}) {
  return (
    <div>
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
          <User className="h-5 w-5 text-emerald-700" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Crea tu primera tarjeta</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Dale un nombre a tu tarjeta y elige un enlace fácil de recordar.
          </p>
        </div>
      </div>

      {hasExistingCard && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50/60 px-3 py-2.5 text-xs text-emerald-800">
          Ya tienes <strong>{existingCount}</strong>{' '}
          {existingCount === 1 ? 'tarjeta creada' : 'tarjetas creadas'}.
          Puedes crear una nueva o continuar con las que ya tienes.
        </div>
      )}

      {atLimit && hasExistingCard && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2.5 text-xs text-amber-800">
          Has alcanzado el límite de tarjetas de tu plan. Puedes continuar sin
          crear una nueva.
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="ob-card-name" className="text-sm font-medium text-slate-700">
            Nombre de la tarjeta
          </Label>
          <Input
            id="ob-card-name"
            placeholder="Ej. Juan Pérez, Boutique Rosa, Restaurante El Sabor"
            value={cardName}
            onChange={e => onCardNameChange(e.target.value)}
            maxLength={60}
            className="border-slate-200 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500"
            autoFocus
          />
          <p className="text-[11px] text-muted-foreground">
            Así aparecerá en tu tarjeta y en el panel.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ob-link-name" className="text-sm font-medium text-slate-700">
            Enlace personalizado
          </Label>
          <div className="flex items-stretch overflow-hidden rounded-md border border-slate-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20">
            <span className="flex select-none items-center bg-slate-50 px-3 text-sm text-muted-foreground">
              ftpdigitalplus.com/t/
            </span>
            <Input
              id="ob-link-name"
              placeholder="juan-perez"
              value={linkName}
              onChange={e => onLinkNameChange(slugify(e.target.value))}
              className="border-0 shadow-none focus-visible:ring-0 focus-visible:border-0"
            />
          </div>
          {linkTaken && linkName.length > 0 && (
            <p className="flex items-center gap-1 text-[11px] font-medium text-rose-600">
              <X className="h-3 w-3" />
              Este enlace ya está en uso. Prueba con otro.
            </p>
          )}
          {!linkTaken && linkName.length > 0 && (
            <p className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
              <Check className="h-3 w-3" />
              Enlace disponible.
            </p>
          )}
          {linkName.length === 0 && (
            <p className="text-[11px] text-muted-foreground">
              Se genera automáticamente a partir del nombre. Solo minúsculas y guiones.
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-slate-100 bg-slate-50/60 p-3">
        <p className="text-xs font-medium text-slate-600">Vista previa del enlace</p>
        <p className="mt-1 break-all font-mono text-xs text-emerald-700">
          ftpdigitalplus.com/t/{linkName || 'tu-enlace'}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 3 - Personalize (24 sections tips)                             */
/* ------------------------------------------------------------------ */
function StepPersonalize() {
  return (
    <div>
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100">
          <Wand2 className="h-5 w-5 text-amber-700" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Personaliza tu tarjeta</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Tienes <strong className="text-emerald-700">24 secciones</strong>{' '}
            disponibles para dejar tu tarjeta lista para todo.
          </p>
        </div>
      </div>

      <div className="grid max-h-64 grid-cols-2 gap-1.5 overflow-y-auto rounded-lg border border-slate-100 bg-slate-50/40 p-2 sm:grid-cols-3">
        {EDITOR_SECTIONS.map((section, i) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.015 }}
            className="flex items-center gap-2 rounded-md bg-white px-2 py-1.5 ring-1 ring-slate-100"
          >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-gradient-to-br from-emerald-50 to-amber-50">
              <DynamicIcon name={section.icon} className="h-3.5 w-3.5 text-emerald-600" />
            </div>
            <span className="truncate text-[11px] font-medium text-slate-700">
              {section.name}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {[
          {
            icon: '🎨',
            title: 'Colores y fuentes',
            desc: 'Elige tu paleta y tipografía',
          },
          {
            icon: '🖼️',
            title: 'Fotos y galería',
            desc: 'Sube tu logo, portada y productos',
          },
          {
            icon: '📊',
            title: 'SEO y analítica',
            desc: 'Optimiza para buscadores',
          },
        ].map(tip => (
          <div
            key={tip.title}
            className="rounded-lg border border-emerald-100/70 bg-gradient-to-br from-white to-emerald-50/30 p-3"
          >
            <div className="text-xl">{tip.icon}</div>
            <p className="mt-1 text-xs font-semibold text-slate-800">{tip.title}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{tip.desc}</p>
          </div>
        ))}
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Podrás editar todo esto en cualquier momento desde el editor de tarjetas.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 4 - Share                                                      */
/* ------------------------------------------------------------------ */
function StepShare({
  linkName,
  startTour,
  onStartTourChange,
}: {
  linkName: string | null;
  startTour: boolean;
  onStartTourChange: (v: boolean) => void;
}) {
  const publicUrl = linkName
    ? `ftpdigitalplus.com/t/${linkName}`
    : 'ftpdigitalplus.com/t/tu-tarjeta';

  const handleCopy = () => {
    navigator.clipboard?.writeText(`https://${publicUrl}`).then(
      () =>
        toast.success('Enlace copiado', {
          description: publicUrl,
        }),
      () => toast.error('No se pudo copiar el enlace')
    );
  };

  return (
    <div>
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
          <Share2 className="h-5 w-5 text-emerald-700" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Comparte tu tarjeta</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Tu tarjeta tiene un enlace público y un código QR listos para compartir.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Public URL */}
        <div className="flex flex-col justify-between rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50/60 to-white p-4">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-600 text-white">
                <Share2 className="h-3.5 w-3.5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-800">Enlace público</h3>
            </div>
            <p className="break-all rounded-md bg-white px-2.5 py-2 font-mono text-xs text-emerald-700 ring-1 ring-emerald-100">
              {publicUrl}
            </p>
          </div>
          <Button
            size="sm"
            onClick={handleCopy}
            className="mt-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-700 hover:to-emerald-600"
          >
            <Copy className="h-4 w-4" />
            Copiar enlace
          </Button>
        </div>

        {/* QR preview */}
        <div className="rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50/60 to-white p-4">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-500 text-white">
              <QrCode className="h-3.5 w-3.5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">Código QR</h3>
          </div>
          <div className="flex items-center justify-center rounded-md bg-white p-3 ring-1 ring-amber-100">
            <div className="rounded-lg bg-white p-2 shadow-sm">
              <QRCodeCanvas
                value={`https://${publicUrl}`}
                size={120}
                fgColor="#059669"
                bgColor="#ffffff"
                level="M"
                marginSize={1}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-emerald-100 bg-emerald-50/40 p-3">
        <div className="flex items-start gap-2">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <div>
            <p className="text-xs font-semibold text-slate-800">¡Estás listo!</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Imprime tu QR, compártelo en redes o envíalo por WhatsApp. Cada
              escaneo llevará a tu tarjeta digital.
            </p>
          </div>
        </div>
      </div>

      {/* Tour opcional al finalizar */}
      <button
        type="button"
        onClick={() => onStartTourChange(!startTour)}
        className={cn(
          'mt-4 flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all',
          startTour
            ? 'border-emerald-300 bg-gradient-to-r from-emerald-50 to-amber-50/60 ring-1 ring-emerald-200/60'
            : 'border-slate-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/30'
        )}
        aria-pressed={startTour}
      >
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition',
            startTour
              ? 'bg-gradient-to-br from-emerald-600 to-amber-500 text-white shadow-md'
              : 'bg-slate-100 text-slate-500'
          )}
        >
          <Wand2 className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-800">
            Ver tour de la plataforma
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Recorre las funciones principales en 2 minutos al cerrar este tutorial.
          </p>
        </div>
        <span
          className={cn(
            'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition',
            startTour ? 'bg-emerald-600' : 'bg-slate-300'
          )}
        >
          <span
            className={cn(
              'inline-block h-5 w-5 transform rounded-full bg-white shadow transition',
              startTour ? 'translate-x-5' : 'translate-x-0.5'
            )}
          />
        </span>
      </button>
    </div>
  );
}
