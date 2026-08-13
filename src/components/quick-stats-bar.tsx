'use client';

/**
 * QuickStatsBar — Barra compacta de estadísticas rápidas para el dashboard.
 *
 * Muestra 6 mini-estadísticas clickeables con icono + número animado + etiqueta:
 *  - Tarjetas activas
 *  - Visitas hoy (mock)
 *  - QR escaneados hoy (mock)
 *  - Mensajes sin leer
 *  - Citas próximas
 *  - Promedio de conversión
 *
 * En móvil: scroll horizontal. En desktop: barra completa.
 * Estilo glassmorphism sutil con acentos esmeralda.
 */

import * as React from 'react';
import {
  CreditCard,
  Eye,
  QrCode,
  Mail,
  CalendarClock,
  Percent,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';
import { AnimatedCounter } from '@/components/visual/animated-counter';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export interface QuickStatsBarProps {
  className?: string;
  /** Callback opcional para navegar a una sección interna del dashboard. */
  onNavigateSection?: (section: 'messages' | 'appointments') => void;
}

interface MiniStat {
  id: string;
  label: string;
  value: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  accent: string;
  onClick?: () => void;
  hint?: string;
}

/**
 * Genera un número determinista basado en el día actual.
 * Útil para mocks estables que no cambian en cada render.
 */
function dailySeed(offset: number): number {
  const today = new Date();
  const dayKey = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  // Multiplier pseudo-random
  const x = Math.sin(dayKey + offset) * 10000;
  return Math.abs(x - Math.floor(x));
}

export function QuickStatsBar({ className, onNavigateSection }: QuickStatsBarProps) {
  const cards = useAppStore(s => s.cards);
  const currentUser = useAppStore(s => s.currentUser);
  const messages = useAppStore(s => s.messages);
  const appointments = useAppStore(s => s.appointments);
  const navigate = useAppStore(s => s.navigate);

  const userCards = React.useMemo(
    () => (currentUser ? cards.filter(c => c.userId === currentUser.id) : []),
    [cards, currentUser],
  );

  const activeCards = userCards.filter(c => c.isActive).length;

  // Visitas hoy (mock, basado en total de vistas y día)
  const viewsToday = React.useMemo(() => {
    if (userCards.length === 0) return 0;
    const totalViews = userCards.reduce((s, c) => s + c.views, 0);
    return Math.max(1, Math.round(totalViews * (0.02 + dailySeed(1) * 0.04)));
  }, [userCards]);

  // QR hoy (mock)
  const qrToday = React.useMemo(() => {
    if (userCards.length === 0) return 0;
    const totalScans = userCards.reduce((s, c) => s + c.qrScans, 0);
    return Math.max(0, Math.round(totalScans * (0.015 + dailySeed(2) * 0.035)));
  }, [userCards]);

  // Mensajes sin leer
  const unreadCount = messages.filter(m => !m.read).length;

  // Citas próximas (fecha >= hoy, estado pending/confirmed)
  const upcomingAppointments = React.useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return appointments.filter(a => {
      try {
        const d = new Date(a.date);
        d.setHours(0, 0, 0, 0);
        return d >= now && (a.status === 'pending' || a.status === 'confirmed');
      } catch {
        return false;
      }
    });
  }, [appointments]);

  // Promedio de conversión (mensajes / vistas)
  const avgConversion = React.useMemo(() => {
    const totalViews = userCards.reduce((s, c) => s + c.views, 0);
    if (totalViews === 0) return 0;
    const userCardIds = new Set(userCards.map(c => c.id));
    const userMessages = messages.filter(m => userCardIds.has(m.cardId)).length;
    return (userMessages / totalViews) * 100;
  }, [userCards, messages]);

  const handleMessagesClick = () => {
    if (onNavigateSection) {
      onNavigateSection('messages');
    } else {
      navigate('dashboard');
    }
  };
  const handleAppointmentsClick = () => {
    if (onNavigateSection) {
      onNavigateSection('appointments');
    } else {
      navigate('dashboard');
    }
  };

  const stats: MiniStat[] = [
    {
      id: 'cards',
      label: 'Tarjetas activas',
      value: activeCards,
      icon: CreditCard,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      accent: 'text-emerald-700',
      onClick: () => navigate('dashboard'),
      hint: `${userCards.length} total`,
    },
    {
      id: 'views',
      label: 'Visitas hoy',
      value: viewsToday,
      icon: Eye,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      accent: 'text-emerald-700',
      onClick: () => navigate('stats'),
    },
    {
      id: 'qr',
      label: 'QR hoy',
      value: qrToday,
      icon: QrCode,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      accent: 'text-amber-700',
      onClick: () => navigate('stats'),
    },
    {
      id: 'messages',
      label: 'Mensajes sin leer',
      value: unreadCount,
      icon: Mail,
      iconBg: unreadCount > 0 ? 'bg-rose-50' : 'bg-emerald-50',
      iconColor: unreadCount > 0 ? 'text-rose-600' : 'text-emerald-600',
      accent: unreadCount > 0 ? 'text-rose-700' : 'text-emerald-700',
      onClick: handleMessagesClick,
      hint: unreadCount > 0 ? 'Requiere atención' : 'Todo al día',
    },
    {
      id: 'appointments',
      label: 'Citas próximas',
      value: upcomingAppointments.length,
      icon: CalendarClock,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      accent: 'text-amber-700',
      onClick: handleAppointmentsClick,
      hint: upcomingAppointments.length > 0 ? 'Próximas' : 'Sin citas',
    },
    {
      id: 'conversion',
      label: 'Conversión prom.',
      value: avgConversion,
      decimals: 1,
      suffix: '%',
      icon: Percent,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      accent: 'text-emerald-700',
      onClick: () => navigate('stats'),
      hint: 'Mensajes / Visitas',
    },
  ];

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-white/40 bg-white/60 shadow-sm backdrop-blur-md',
        'ring-1 ring-emerald-100/50',
        className,
      )}
      role="region"
      aria-label="Estadísticas rápidas"
    >
      <div
        className="flex gap-2 overflow-x-auto p-3 [scrollbar-width:thin] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'thin' }}
      >
        {stats.map((stat) => (
          <button
            key={stat.id}
            type="button"
            onClick={stat.onClick}
            className={cn(
              'group flex min-w-[148px] flex-1 items-center gap-3 rounded-xl border border-transparent bg-white/70 px-3.5 py-2.5 text-left transition-all',
              'hover:border-emerald-200 hover:bg-white hover:shadow-sm',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-1',
              'active:scale-[0.98]',
            )}
            aria-label={`${stat.label}: ${stat.value}${stat.suffix ?? ''}${stat.hint ? ` — ${stat.hint}` : ''}`}
          >
            <div
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-105',
                stat.iconBg,
              )}
            >
              <stat.icon className={cn('h-4 w-4', stat.iconColor)} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {stat.label}
              </p>
              <div className="flex items-baseline gap-1">
                <span className={cn('text-lg font-bold leading-tight tabular-nums', stat.accent)}>
                  <AnimatedCounter
                    value={stat.value}
                    duration={1200}
                    decimals={stat.decimals ?? 0}
                    suffix={stat.suffix ?? ''}
                    prefix={stat.prefix ?? ''}
                  />
                </span>
                {stat.hint && (
                  <span className="hidden truncate text-[10px] text-muted-foreground sm:inline">
                    · {stat.hint}
                  </span>
                )}
              </div>
            </div>
            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-emerald-500" />
          </button>
        ))}
      </div>
    </div>
  );
}

export default QuickStatsBar;
