'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, QrCode, MessageSquare, Calendar, Plus, Edit, Activity,
  ArrowRight, ChevronRight, RefreshCw,
} from 'lucide-react';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/lib/store';
import { BusinessCard, ContactMessage, Appointment } from '@/lib/types';
import { getRelativeTime } from '@/lib/card-utils';
import { cn } from '@/lib/utils';

// ============================ TYPES ============================
type ActivityType =
  | 'view' | 'qr' | 'message' | 'appointment'
  | 'card_created' | 'card_updated';

interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  cardId?: string;
  cardName?: string;
  senderName?: string;
  clientName?: string;
  appointmentDate?: string;
}

// ============================ META DE ICONOS ============================
const ACTIVITY_META: Record<
  ActivityType,
  { icon: typeof Eye; bg: string; text: string; label: string }
> = {
  view: { icon: Eye, bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Nueva visita' },
  qr: { icon: QrCode, bg: 'bg-teal-100', text: 'text-teal-700', label: 'QR escaneado' },
  message: { icon: MessageSquare, bg: 'bg-amber-100', text: 'text-amber-700', label: 'Nuevo mensaje' },
  appointment: { icon: Calendar, bg: 'bg-rose-100', text: 'text-rose-700', label: 'Nueva cita' },
  card_created: { icon: Plus, bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Tarjeta creada' },
  card_updated: { icon: Edit, bg: 'bg-purple-100', text: 'text-purple-700', label: 'Tarjeta actualizada' },
};

// ============================ MOCK DATA GENERATOR ============================
/**
 * Genera actividades recientes basadas en las tarjetas reales del usuario.
 * Combina datos reales del store (mensajes, citas) con datos simulados (visitas, escaneos).
 */
export function generateMockActivity(
  cards: BusinessCard[],
  messages: ContactMessage[] = [],
  appointments: Appointment[] = [],
): Activity[] {
  if (cards.length === 0) return [];

  const activities: Activity[] = [];

  // 1. Datos reales del store (mensajes y citas)

  // Mensajes recientes
  messages
    .filter(m => cards.some(c => c.id === m.cardId) || cards.length > 0)
    .slice(0, 6)
    .forEach(m => {
      const card = cards.find(c => c.id === m.cardId) || cards[0];
      activities.push({
        id: `msg-${m.id}`,
        type: 'message',
        title: 'Nuevo mensaje',
        description: `${m.name} te escribió${card ? ' · ' + card.cardName : ''}`,
        timestamp: m.date,
        cardId: card?.id,
        cardName: card?.cardName,
        senderName: m.name,
      });
    });

  // Citas recientes
  appointments
    .slice(0, 4)
    .forEach(a => {
      const card = cards.find(c => c.team.some(t => t.id === a.teamMemberId)) || cards[0];
      activities.push({
        id: `apt-${a.id}`,
        type: 'appointment',
        title: 'Nueva cita agendada',
        description: `${a.clientName} · ${card ? card.cardName + ' · ' : ''}${new Date(a.date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })} ${a.time}`,
        timestamp: a.date,
        cardId: card?.id,
        cardName: card?.cardName,
        clientName: a.clientName,
        appointmentDate: a.date,
      });
    });

  // 2. Datos simulados (visitas y escaneos) basados en las tarjetas
  const now = Date.now();
  cards.forEach(card => {
    // Visitas simuladas (3-5 por tarjeta en las últimas horas)
    const viewCount = 2 + (card.id.charCodeAt(0) % 3);
    for (let i = 0; i < viewCount; i++) {
      const minutesAgo = 5 + Math.floor(Math.random() * 240);
      activities.push({
        id: `view-${card.id}-${i}-${now}`,
        type: 'view',
        title: 'Nueva visita',
        description: `${card.cardName} · tarjeta pública`,
        timestamp: new Date(now - minutesAgo * 60 * 1000).toISOString(),
        cardId: card.id,
        cardName: card.cardName,
      });
    }
    // Escaneos QR simulados (1-3 por tarjeta)
    const qrCount = 1 + (card.id.charCodeAt(2) % 2);
    for (let i = 0; i < qrCount; i++) {
      const minutesAgo = 15 + Math.floor(Math.random() * 360);
      activities.push({
        id: `qr-${card.id}-${i}-${now}`,
        type: 'qr',
        title: 'QR escaneado',
        description: `${card.cardName} · enlace WhatsApp`,
        timestamp: new Date(now - minutesAgo * 60 * 1000).toISOString(),
        cardId: card.id,
        cardName: card.cardName,
      });
    }
  });

  // 3. Evento de creación de cada tarjeta (si fue reciente)
  cards.forEach(card => {
    const created = new Date(card.createdAt).getTime();
    const daysAgo = (now - created) / (1000 * 60 * 60 * 24);
    if (daysAgo < 30) {
      activities.push({
        id: `created-${card.id}`,
        type: 'card_created',
        title: 'Tarjeta creada',
        description: card.cardName,
        timestamp: card.createdAt,
        cardId: card.id,
        cardName: card.cardName,
      });
    }
  });

  // Ordenar por fecha descendente
  return activities.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

// ============================ COMPONENT ============================
export interface ActivityWidgetProps {
  className?: string;
  maxItems?: number;
  showHeader?: boolean;
}

export function ActivityWidget({
  className,
  maxItems = 8,
  showHeader = true,
}: ActivityWidgetProps) {
  const cards = useAppStore(s => s.cards);
  const currentUser = useAppStore(s => s.currentUser);
  const navigate = useAppStore(s => s.navigate);

  const userCards = useMemo(
    () => (currentUser ? cards.filter(c => c.userId === currentUser.id) : []),
    [cards, currentUser],
  );

  const messages = useAppStore(s => s.messages);
  const appointments = useAppStore(s => s.appointments);

  const [refreshKey, setRefreshKey] = useState(0);
  const [isLive, setIsLive] = useState(true);

  // Genera actividades combinando datos reales del store (mensajes, citas) con
  // datos simulados (visitas, escaneos). useMemo evita renders en cascada.
  const activities = useMemo<Activity[]>(
    () => generateMockActivity(userCards, messages, appointments),
    [userCards, messages, appointments, refreshKey],
  );

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    if (userCards.length === 0) return;
    const interval = setInterval(() => {
      setRefreshKey(k => k + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, [userCards.length]);

  const visibleActivities = activities.slice(0, maxItems);

  const handleRefresh = useCallback(() => {
    setRefreshKey(k => k + 1);
    setIsLive(true);
  }, []);

  if (userCards.length === 0) {
    return (
      <Card className={cn('border-slate-200/70 shadow-sm', className)}>
        {showHeader && (
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4 text-emerald-600" />
              Actividad en vivo
            </CardTitle>
          </CardHeader>
        )}
        <CardContent className="pt-0">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted/50 text-muted-foreground">
              <Activity className="h-5 w-5" />
            </div>
            <p className="text-sm text-muted-foreground">Sin actividad reciente</p>
            <p className="mt-1 text-xs text-muted-foreground/70">Crea una tarjeta para ver actividad en tiempo real</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('border-slate-200/70 shadow-sm', className)}>
      {showHeader && (
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-sm">
              <Activity className="h-3.5 w-3.5" />
            </div>
            Actividad en vivo
          </CardTitle>
          <div className="flex items-center gap-2">
            {isLive && (
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                En vivo
              </span>
            )}
            <button
              type="button"
              onClick={handleRefresh}
              aria-label="Actualizar actividad"
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition hover:bg-emerald-50 hover:text-emerald-700"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        </CardHeader>
      )}
      <CardContent className={cn('pt-0', !showHeader && 'pt-3')}>
        {visibleActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted/50 text-muted-foreground">
              <Activity className="h-5 w-5" />
            </div>
            <p className="text-sm text-muted-foreground">Sin actividad reciente</p>
            <p className="mt-1 text-xs text-muted-foreground/70">Vuelve en unos minutos para ver novedades</p>
          </div>
        ) : (
          <ScrollArea className="h-[360px] pr-3">
            <ol className="relative space-y-1.5">
              <AnimatePresence initial={false}>
                {visibleActivities.map((act, i) => {
                  const meta = ACTIVITY_META[act.type] || ACTIVITY_META.view;
                  const Icon = meta.icon;
                  return (
                    <motion.li
                      key={act.id}
                      layout
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.18) }}
                      className="relative flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-emerald-50/40"
                    >
                      {/* Timeline line */}
                      {i !== visibleActivities.length - 1 && (
                        <span
                          className="absolute left-[18px] top-10 h-[calc(100%-16px)] w-px bg-slate-200"
                          aria-hidden
                        />
                      )}
                      <div
                        className={cn(
                          'relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-4 ring-white',
                          meta.bg,
                          meta.text
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1 pt-0.5">
                        <p className="text-sm font-semibold text-slate-800">{act.title}</p>
                        <p className="truncate text-xs text-muted-foreground">{act.description}</p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground/80">
                          {getRelativeTime(act.timestamp)}
                        </p>
                      </div>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ol>
          </ScrollArea>
        )}
        <div className="mt-3 flex items-center justify-between border-t pt-3">
          <Badge variant="secondary" className="bg-slate-100 text-slate-600">
            {activities.length} evento{activities.length !== 1 ? 's' : ''} totales
          </Badge>
          <button
            type="button"
            onClick={() => navigate('stats')}
            className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 transition hover:text-emerald-800"
          >
            Ver todo
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
