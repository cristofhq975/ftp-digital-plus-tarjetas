'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Check, X, ChevronDown, ChevronUp, Sparkles, ArrowRight,
  Camera, MessageCircle, Palette, Briefcase, Share2, Plus,
} from 'lucide-react';

import { BusinessCard } from '@/lib/types';
import { useAppStore, useCurrentUserCards } from '@/lib/store';
import { cn } from '@/lib/utils';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'ftp-onboarding-skipped';
const SHARE_FLAG_KEY = 'ftp-card-shared';
const DEFAULT_PRIMARY_COLOR = '#059669';

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  icon: typeof Camera;
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: 'card-created',
    label: 'Crea tu primera tarjeta',
    description: 'Define el nombre y enlace único de tu tarjeta digital.',
    icon: Plus,
  },
  {
    id: 'photo-uploaded',
    label: 'Sube tu foto de perfil',
    description: 'Personaliza tu tarjeta con una imagen representativa.',
    icon: Camera,
  },
  {
    id: 'whatsapp-configured',
    label: 'Configura tu número de WhatsApp',
    description: 'Para que tus clientes te contacten con un solo toque.',
    icon: MessageCircle,
  },
  {
    id: 'colors-customized',
    label: 'Personaliza los colores',
    description: 'Ajusta la paleta a tu identidad de marca.',
    icon: Palette,
  },
  {
    id: 'content-added',
    label: 'Agrega un servicio o producto',
    description: 'Muestra lo que ofreces en tu tarjeta.',
    icon: Briefcase,
  },
  {
    id: 'card-shared',
    label: 'Comparte tu tarjeta',
    description: 'Difúndela en redes o por WhatsApp.',
    icon: Share2,
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function useCardSharedFlag(): boolean {
  // Lazy initializer: leer del localStorage una sola vez al montar.
  const [shared, setShared] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(SHARE_FLAG_KEY) === 'true';
  });
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Escuchar cambios desde otras pestañas/ventanas y desde el evento custom
    // que dispara el ShareModal cuando el usuario comparte por primera vez.
    const handler = () => {
      const next = localStorage.getItem(SHARE_FLAG_KEY) === 'true';
      setShared(prev => (prev !== next ? next : prev));
    };
    window.addEventListener('storage', handler);
    window.addEventListener('ftp:share-flag-changed', handler as EventListener);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('ftp:share-flag-changed', handler as EventListener);
    };
  }, []);
  return shared;
}

function computeChecklist(cards: BusinessCard[], shared: boolean) {
  // Usamos la primera tarjeta del usuario como referencia para los checks
  // de detalle (foto, whatsapp, colores, contenido). Si no hay tarjetas,
  // todo está pendiente excepto el primero (que depende solo de length).
  const card: BusinessCard | null = cards[0] || null;

  const checks: Record<string, boolean> = {
    'card-created': cards.length > 0,
    'photo-uploaded': !!card?.profilePhoto,
    'whatsapp-configured': !!card?.whatsappNumber && !!card?.whatsappVerified,
    'colors-customized': !!card && card.primaryColor !== DEFAULT_PRIMARY_COLOR,
    'content-added': !!card && (card.services.length > 0 || card.products.length > 0),
    'card-shared': shared,
  };

  const completed = CHECKLIST_ITEMS.filter(item => checks[item.id]).length;
  const percent = Math.round((completed / CHECKLIST_ITEMS.length) * 100);

  return { checks, completed, percent, total: CHECKLIST_ITEMS.length };
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

/**
 * Widget de lista de verificación de onboarding para usuarios nuevos.
 * Muestra el progreso de configuración y guía al usuario a completar su tarjeta.
 * Se oculta automáticamente cuando el progreso es 100% o el usuario lo cierra.
 */
export function OnboardingChecklist({ className }: { className?: string }) {
  const currentUser = useAppStore(s => s.currentUser);
  const cards = useCurrentUserCards();
  const navigate = useAppStore(s => s.navigate);
  const selectCard = useAppStore(s => s.selectCard);

  const shared = useCardSharedFlag();

  // Inicializar estado desde localStorage usando lazy initializer (sin effect)
  const [skipped, setSkipped] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEY) === 'true';
  });
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('ftp-onboarding-collapsed') === 'true';
  });

  const { checks, completed, percent, total } = useMemo(
    () => computeChecklist(cards, shared),
    [cards, shared]
  );

  const handleSkip = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, 'true');
    }
    setSkipped(true);
    toast.success('Lista de configuración oculta', {
      description: 'Puedes completar los pasos cuando quieras desde el editor.',
    });
  }, []);

  const toggleCollapse = useCallback(() => {
    setCollapsed(prev => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('ftp-onboarding-collapsed', String(next));
      }
      return next;
    });
  }, []);

  const handleContinue = useCallback(() => {
    if (cards.length === 0) {
      // Disparar el botón de crear tarjeta (evento custom que escucha el dashboard)
      window.dispatchEvent(new CustomEvent('ftp:open-create-card'));
      return;
    }
    const targetCard = cards[0];
    selectCard(targetCard.id);
    navigate('editor');
    toast.info('Continúa configurando tu tarjeta', {
      description: 'Te llevamos al editor para completar los pasos pendientes.',
    });
  }, [cards, navigate, selectCard]);

  // No mostrar si: no hay usuario, está saltado, o ya completó todo
  if (!currentUser) return null;
  if (skipped) return null;
  if (percent >= 100) return null;

  return (
    <Card
      className={cn(
        'relative overflow-hidden border-emerald-200/60 shadow-sm',
        className
      )}
    >
      {/* Barra de color superior esmeralda→oro */}
      <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-emerald-500 to-amber-500" />

      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-amber-500 text-white shadow-md">
              <Sparkles className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold text-slate-800">
                Configura tu tarjeta
              </h3>
              <p className="text-[11px] text-muted-foreground">
                {completed} de {total} pasos completados · {percent}%
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleSkip}
              aria-label="Ocultar lista de configuración"
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={toggleCollapse}
              aria-label={collapsed ? 'Expandir' : 'Colapsar'}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-5 pb-3">
          <div className="flex items-center gap-3">
            <Progress
              value={percent}
              className="h-2 flex-1 bg-slate-100"
            />
            <span className="text-xs font-bold text-emerald-700">{percent}%</span>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              key="checklist-body"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="px-3 pb-3 pt-1">
                <ul className="space-y-0.5">
                  {CHECKLIST_ITEMS.map((item, idx) => {
                    const done = checks[item.id];
                    const Icon = item.icon;
                    return (
                      <motion.li
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={cn(
                          'group flex items-start gap-3 rounded-lg px-2 py-2 transition-colors',
                          done ? 'opacity-70' : 'hover:bg-emerald-50/60'
                        )}
                      >
                        <div className="flex items-center pt-0.5">
                          <Checkbox
                            checked={done}
                            disabled
                            className={cn(
                              'data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 data-[state=checked]:text-white',
                              !done && 'border-slate-300'
                            )}
                            aria-label={item.label}
                          />
                        </div>
                        <span
                          className={cn(
                            'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors',
                            done
                              ? 'bg-emerald-100 text-emerald-600'
                              : 'bg-slate-100 text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-600'
                          )}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p
                            className={cn(
                              'text-sm font-medium',
                              done ? 'text-slate-500 line-through' : 'text-slate-800'
                            )}
                          >
                            {item.label}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                        {done && (
                          <Check className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                        )}
                      </motion.li>
                    );
                  })}
                </ul>
              </div>

              {/* Footer con CTA */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t bg-gradient-to-br from-emerald-50/40 to-amber-50/20 px-5 py-3">
                <p className="text-[11px] text-muted-foreground">
                  {completed < total
                    ? `Te faltan ${total - completed} paso${total - completed !== 1 ? 's' : ''} para completar tu perfil.`
                    : '¡Todo listo! 🎉'}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSkip}
                    className="text-xs text-muted-foreground hover:text-slate-700"
                  >
                    Saltar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleContinue}
                    className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    Continuar configuración
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

export default OnboardingChecklist;
