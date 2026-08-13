'use client';

/**
 * CardAnalyticsModal — Modal de analítica detallada para una tarjeta.
 *
 * Incluye:
 *  - Header con avatar + nombre + link + cierre
 *  - 4 tarjetas de estadísticas con AnimatedCounter y tendencia
 *  - 4 gráficas (recharts): Area, Bar, Donut, Horizontal Bar
 *  - Tabla de contenido (servicios, productos, etc.) con barras relativas
 *  - Top Performers (servicio más visto, día pico, etc.)
 *  - Comparación vs promedio del usuario
 *  - Footer: "Ver analítica completa" + "Exportar datos"
 *
 * Paleta esmeralda (#059669) + oro (#f59e0b). 100% español.
 */

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import {
  Eye, QrCode, MessageSquare, TrendingUp, TrendingDown,
  X, Download, ArrowRight, Clock, Star, BarChart3, Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { differenceInCalendarDays, format } from 'date-fns';
import { es } from 'date-fns/locale';

import {
  Dialog, DialogContent, DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from '@/components/ui/table';
import { AnimatedCounter } from '@/components/visual/animated-counter';
import { useAppStore } from '@/lib/store';
import type { BusinessCard } from '@/lib/types';
import { cn } from '@/lib/utils';

// ============================ PALETA ============================
const COLORS = {
  emerald: '#059669',
  emeraldLight: '#10b981',
  gold: '#f59e0b',
  goldLight: '#fbbf24',
  cyan: '#0891b2',
  violet: '#7c3aed',
  rose: '#be123c',
  slate: '#64748b',
};

const TOOLTIP_STYLE = {
  backgroundColor: 'rgba(255,255,255,0.96)',
  border: '1px solid #e2e8f0',
  borderRadius: 10,
  fontSize: 12,
  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.10)',
  padding: '8px 12px',
} as const;

const TOOLTIP_LABEL_STYLE = { fontWeight: 600, color: '#0f172a', marginBottom: 4 } as const;

// ============================ HELPERS ============================
/** Genera datos de series temporales (mock, deterministas por día). */
function generateDailyData(days: number, base: number, variance: number, seedOffset = 1) {
  const data: { date: string; value: number; fullDate: string }[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dayKey = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
    const x = Math.sin(dayKey + seedOffset) * 10000;
    const r = Math.abs(x - Math.floor(x));
    const weekendBoost = (d.getDay() === 0 || d.getDay() === 6) ? 1.15 : 0.9;
    const value = Math.max(
      Math.round(variance / 2),
      Math.round((base + r * variance) * weekendBoost),
    );
    data.push({
      date: format(d, 'dd/MM', { locale: es }),
      value,
      fullDate: format(d, "EEEE d 'de' MMMM", { locale: es }),
    });
  }
  return data;
}

/** Genera datos de engagement por sección (mock, determinista por tarjeta). */
function generateEngagementData(card: BusinessCard) {
  const seed = card.id
    .split('')
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const rand = (offset: number) => {
    const x = Math.sin(seed + offset) * 10000;
    return Math.abs(x - Math.floor(x));
  };
  const items = [
    { name: 'Servicios', base: 28, has: card.services.length > 0 },
    { name: 'Productos', base: 22, has: card.products.length > 0 },
    { name: 'QR', base: 18, has: true },
    { name: 'WhatsApp', base: 15, has: Boolean(card.whatsappNumber) },
    { name: 'Galería', base: 9, has: card.gallery.length > 0 },
    { name: 'Testimonios', base: 8, has: card.testimonials.length > 0 },
  ];
  return items
    .map((item, i) => ({
      name: item.name,
      value: item.has ? Math.round(item.base + rand(i) * 8) : 0,
    }))
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value);
}

/** Encuentra el día de la semana con más visitas (mock basado en series). */
function getPeakWeekday(card: BusinessCard): string {
  const seed = card.id
    .split('')
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const weekdays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  // Distribución mock — martes/jueves suelen ser altos
  const weights = [12, 18, 14, 19, 16, 13, 8];
  const idx = seed % 7;
  // Reordenar para variar por tarjeta
  const rotated = [...weights.slice(idx), ...weights.slice(0, idx)];
  const maxIdx = rotated.indexOf(Math.max(...rotated));
  return weekdays[maxIdx];
}

/** Hora pico (mock). */
function getPeakHour(card: BusinessCard): string {
  const seed = card.id
    .split('')
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const hours = ['11:00', '12:00', '14:00', '16:00', '18:00', '19:00', '20:00'];
  return hours[seed % hours.length];
}

// ============================ SUB-COMPONENTES ============================
interface OverviewStatCardProps {
  label: string;
  value: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  trend: number;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  delay?: number;
}

function OverviewStatCard({
  label, value, decimals = 0, suffix = '', prefix = '', trend,
  icon: Icon, iconBg, iconColor, delay = 0,
}: OverviewStatCardProps) {
  const isUp = trend >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <div className="rounded-xl border border-slate-200/70 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', iconBg)}>
            <Icon className={cn('h-4 w-4', iconColor)} />
          </div>
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-semibold',
              isUp ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700',
            )}
          >
            {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {isUp ? '+' : ''}{trend.toFixed(1)}%
          </span>
        </div>
        <p className="mt-3 text-2xl font-bold text-slate-900">
          <AnimatedCounter
            value={value}
            duration={1400}
            decimals={decimals}
            suffix={suffix}
            prefix={prefix}
          />
        </p>
        <p className="mt-0.5 text-xs font-medium text-muted-foreground">{label}</p>
      </div>
    </motion.div>
  );
}

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  delay?: number;
  accent?: 'emerald' | 'gold' | 'cyan' | 'violet';
}

function ChartCard({ title, description, children, delay = 0, accent = 'emerald' }: ChartCardProps) {
  const dotColor = {
    emerald: 'bg-emerald-500',
    gold: 'bg-amber-500',
    cyan: 'bg-cyan-500',
    violet: 'bg-violet-500',
  }[accent];
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45 }}
      className="rounded-xl border border-slate-200/70 bg-white p-4 shadow-sm"
    >
      <div className="mb-3">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <span className={cn('inline-block h-2 w-2 rounded-full', dotColor)} />
          {title}
        </h4>
        {description && (
          <p className="mt-0.5 text-[11px] text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </motion.div>
  );
}

interface ContentStatRowProps {
  label: string;
  count: number;
  max: number;
  color: string;
}

function ContentStatRow({ label, count, max, color }: ContentStatRowProps) {
  const pct = max > 0 ? Math.min(100, (count / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="w-24 shrink-0 text-xs font-medium text-slate-700">{label}</span>
      <div className="relative h-6 flex-1 overflow-hidden rounded-md bg-slate-100">
        <div
          className="absolute left-0 top-0 h-full rounded-md transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-700">
          {count}
        </span>
      </div>
    </div>
  );
}

// ============================ MODAL PRINCIPAL ============================
export interface CardAnalyticsModalProps {
  card: BusinessCard | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CardAnalyticsModal({ card, open, onOpenChange }: CardAnalyticsModalProps) {
  const navigate = useAppStore(s => s.navigate);
  const allCards = useAppStore(s => s.cards);
  const messages = useAppStore(s => s.messages);
  const appointments = useAppStore(s => s.appointments);

  // Datos derivados de la tarjeta seleccionada
  const data = React.useMemo(() => {
    if (!card) return null;
    const cardMessages = messages.filter(m => m.cardId === card.id).length;
    const cardAppointments = appointments.filter(a => a.teamMemberId === card.team?.[0]?.id).length;
    const conversion = card.views > 0 ? (cardMessages / card.views) * 100 : 0;

    const createdDate = new Date(card.createdAt);
    const daysSinceCreation = Math.max(1, differenceInCalendarDays(new Date(), createdDate));
    const dailyAvg = card.views / daysSinceCreation;

    // Series de tiempo (mock, 14 días)
    const viewsSeries = generateDailyData(14, Math.max(3, Math.round(dailyAvg)), Math.max(2, Math.round(dailyAvg / 2)), 1);
    const qrSeries = generateDailyData(14, Math.max(1, Math.round(card.qrScans / daysSinceCreation)), Math.max(1, Math.round(card.qrScans / daysSinceCreation / 2)), 2);

    // Distribución de interacciones
    const distribution = [
      { name: 'Visitas', value: card.views, color: COLORS.emerald },
      { name: 'QR', value: card.qrScans, color: COLORS.gold },
      { name: 'Mensajes', value: cardMessages, color: COLORS.cyan },
      { name: 'Citas', value: cardAppointments, color: COLORS.violet },
    ].filter(d => d.value > 0);

    // Engagement por sección
    const engagement = generateEngagementData(card);

    // Conteo de contenido
    const contentStats = [
      { label: 'Servicios', count: card.services.length, color: COLORS.emerald },
      { label: 'Productos', count: card.products.length, color: COLORS.gold },
      { label: 'Testimonios', count: card.testimonials.length, color: COLORS.cyan },
      { label: 'Galería', count: card.gallery.length, color: COLORS.violet },
      { label: 'Blog', count: card.blog.length, color: COLORS.rose },
      { label: 'Equipo', count: card.team.length, color: COLORS.slate },
    ];
    const contentMax = Math.max(1, ...contentStats.map(c => c.count));

    // Top performers (mocks)
    const topService = card.services[0]?.name || 'Sin servicios';
    const topProduct = card.products[0]?.name || 'Sin productos';
    const peakWeekday = getPeakWeekday(card);
    const peakHour = getPeakHour(card);

    // Tendencias (mocks deterministas)
    const seed = card.id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    const trendViews = 4 + (seed % 18);
    const trendQr = 2 + (seed % 15);
    const trendConversion = -2 + (seed % 14);
    const trendDaily = 1 + (seed % 12);

    // Comparación vs promedio del usuario
    const userCards = allCards.filter(c => c.userId === card.userId);
    const avgViews = userCards.length > 0
      ? userCards.reduce((s, c) => s + c.views, 0) / userCards.length
      : card.views;
    const avgQr = userCards.length > 0
      ? userCards.reduce((s, c) => s + c.qrScans, 0) / userCards.length
      : card.qrScans;
    const avgMessages = userCards.length > 0
      ? userCards.reduce((s, c) => {
          const cm = messages.filter(m => m.cardId === c.id).length;
          return s + cm;
        }, 0) / userCards.length
      : cardMessages;

    const diffViews = avgViews > 0 ? ((card.views - avgViews) / avgViews) * 100 : 0;
    const diffQr = avgQr > 0 ? ((card.qrScans - avgQr) / avgQr) * 100 : 0;
    const diffMessages = avgMessages > 0 ? ((cardMessages - avgMessages) / avgMessages) * 100 : 0;

    return {
      cardMessages,
      cardAppointments,
      conversion,
      daysSinceCreation,
      dailyAvg,
      viewsSeries,
      qrSeries,
      distribution,
      engagement,
      contentStats,
      contentMax,
      topService,
      topProduct,
      peakWeekday,
      peakHour,
      trendViews,
      trendQr,
      trendConversion,
      trendDaily,
      diffViews,
      diffQr,
      diffMessages,
    };
  }, [card, allCards, messages, appointments]);

  // Handlers
  const handleViewFullAnalytics = () => {
    if (card) {
      useAppStore.getState().selectCard(card.id);
    }
    onOpenChange(false);
    navigate('stats');
  };

  const handleExport = () => {
    if (!card) return;
    try {
      // Exporta un CSV simple con las métricas principales
      const rows = [
        ['Métrica', 'Valor'],
        ['Nombre de tarjeta', card.cardName],
        ['Link', `ftpdigitalplus.com/t/${card.linkName}`],
        ['Visitas totales', String(card.views)],
        ['Escaneos QR', String(card.qrScans)],
        ['Mensajes recibidos', String(data?.cardMessages ?? 0)],
        ['Tasa de conversión (%)', (data?.conversion ?? 0).toFixed(2)],
        ['Promedio diario', (data?.dailyAvg ?? 0).toFixed(2)],
        ['Días desde creación', String(data?.daysSinceCreation ?? 0)],
        ['Servicios', String(card.services.length)],
        ['Productos', String(card.products.length)],
        ['Testimonios', String(card.testimonials.length)],
        ['Galería', String(card.gallery.length)],
        ['Blog', String(card.blog.length)],
        ['Equipo', String(card.team.length)],
      ];
      const csv = rows
        .map((r) => r.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
        .join('\n');
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analitica-${card.linkName}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Datos exportados', {
        description: `analitica-${card.linkName}.csv`,
      });
    } catch (err) {
      toast.error('No se pudo exportar', {
        description: err instanceof Error ? err.message : 'Error desconocido',
      });
    }
  };

  // Render seguro si no hay tarjeta
  const safeCard = card;
  const safeData = data;
  const initials = safeCard
    ? safeCard.cardName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[92vh] max-w-4xl overflow-y-auto rounded-2xl border-slate-200 bg-slate-50/50 p-0 sm:max-w-4xl"
        showCloseButton={false}
      >
        {/* DialogTitle sr-only para accesibilidad */}
        <DialogTitle className="sr-only">
          Analítica detallada de tarjeta{safeCard ? `: ${safeCard.cardName}` : ''}
        </DialogTitle>

        <AnimatePresence>
          {safeCard && safeData && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col"
            >
              {/* ============================ HEADER ============================ */}
              <div
                className="relative overflow-hidden p-5 text-white sm:p-6"
                style={{
                  background: `linear-gradient(135deg, ${safeCard.primaryColor}, ${safeCard.secondaryColor})`,
                }}
              >
                {/* Patrón decorativo */}
                <div className="pointer-events-none absolute inset-0 opacity-20">
                  <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/30 blur-2xl" />
                  <div className="absolute -bottom-16 left-1/3 h-40 w-40 rounded-full bg-amber-200/30 blur-2xl" />
                </div>
                <div className="relative flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/20 text-base font-bold text-white ring-1 ring-white/30 backdrop-blur">
                      {safeCard.profilePhoto ? (
                        <img
                          src={safeCard.profilePhoto}
                          alt={safeCard.cardName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span>{initials}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-bold text-white sm:text-xl">
                        {safeCard.cardName}
                      </h2>
                      <p className="mt-0.5 truncate text-xs text-white/80">
                        ftpdigitalplus.com/t/
                        <span className="font-semibold text-white">{safeCard.linkName}</span>
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <Badge className="bg-white/20 text-white hover:bg-white/30">
                          <BarChart3 className="mr-1 h-3 w-3" />
                          Analítica detallada
                        </Badge>
                        <Badge className="bg-white/15 text-white hover:bg-white/25">
                          {safeData.daysSinceCreation} días activa
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenChange(false)}
                    aria-label="Cerrar modal"
                    className="shrink-0 rounded-full bg-white/20 p-2 text-white transition hover:bg-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* ============================ BODY ============================ */}
              <div className="space-y-5 p-5 sm:p-6">
                {/* ---------- Overview Stats ---------- */}
                <section
                  aria-label="Resumen general"
                  className="grid grid-cols-2 gap-3 lg:grid-cols-4"
                >
                  <OverviewStatCard
                    label="Total de visitas"
                    value={safeCard.views}
                    trend={safeData.trendViews}
                    icon={Eye}
                    iconBg="bg-emerald-50"
                    iconColor="text-emerald-600"
                    delay={0.05}
                  />
                  <OverviewStatCard
                    label="Escaneos QR"
                    value={safeCard.qrScans}
                    trend={safeData.trendQr}
                    icon={QrCode}
                    iconBg="bg-amber-50"
                    iconColor="text-amber-600"
                    delay={0.1}
                  />
                  <OverviewStatCard
                    label="Tasa de conversión"
                    value={safeData.conversion}
                    decimals={1}
                    suffix="%"
                    trend={safeData.trendConversion}
                    icon={MessageSquare}
                    iconBg="bg-cyan-50"
                    iconColor="text-cyan-700"
                    delay={0.15}
                  />
                  <OverviewStatCard
                    label="Promedio diario"
                    value={safeData.dailyAvg}
                    decimals={1}
                    trend={safeData.trendDaily}
                    icon={TrendingUp}
                    iconBg="bg-emerald-50"
                    iconColor="text-emerald-600"
                    delay={0.2}
                  />
                </section>

                {/* ---------- Charts 2x2 ---------- */}
                <section aria-label="Gráficas" className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {/* 1. Visitas por día - AreaChart */}
                  <ChartCard
                    title="Visitas por día"
                    description="Últimos 14 días"
                    accent="emerald"
                    delay={0.1}
                  >
                    <div className="h-[220px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={safeData.viewsSeries}
                          margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="gradViews" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={COLORS.emerald} stopOpacity={0.4} />
                              <stop offset="100%" stopColor={COLORS.emerald} stopOpacity={0.02} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                          <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            fontSize={10}
                            tick={{ fill: '#64748b' }}
                            interval="preserveStartEnd"
                            minTickGap={20}
                          />
                          <YAxis
                            tickLine={false}
                            axisLine={false}
                            fontSize={10}
                            tick={{ fill: '#64748b' }}
                            width={32}
                          />
                          <RTooltip
                            contentStyle={TOOLTIP_STYLE}
                            labelStyle={TOOLTIP_LABEL_STYLE}
                            formatter={(value: number) => [`${value} visitas`, 'Visitas']}
                            labelFormatter={(_label, payload) => {
                              const p = payload?.[0]?.payload as { fullDate?: string } | undefined;
                              return p?.fullDate || _label;
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="value"
                            name="Visitas"
                            stroke={COLORS.emerald}
                            strokeWidth={2.5}
                            fill="url(#gradViews)"
                            dot={false}
                            activeDot={{ r: 5, fill: COLORS.emerald, stroke: '#fff', strokeWidth: 2 }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </ChartCard>

                  {/* 2. Escaneos QR por día - BarChart */}
                  <ChartCard
                    title="Escaneos QR por día"
                    description="Últimos 14 días"
                    accent="gold"
                    delay={0.15}
                  >
                    <div className="h-[220px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={safeData.qrSeries}
                          margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                          <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            fontSize={10}
                            tick={{ fill: '#64748b' }}
                            interval="preserveStartEnd"
                            minTickGap={20}
                          />
                          <YAxis
                            tickLine={false}
                            axisLine={false}
                            fontSize={10}
                            tick={{ fill: '#64748b' }}
                            width={32}
                          />
                          <RTooltip
                            contentStyle={TOOLTIP_STYLE}
                            labelStyle={TOOLTIP_LABEL_STYLE}
                            formatter={(value: number) => [`${value} escaneos`, 'QR']}
                            labelFormatter={(_label, payload) => {
                              const p = payload?.[0]?.payload as { fullDate?: string } | undefined;
                              return p?.fullDate || _label;
                            }}
                          />
                          <Bar
                            dataKey="value"
                            name="Escaneos QR"
                            fill={COLORS.gold}
                            radius={[4, 4, 0, 0]}
                            maxBarSize={28}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </ChartCard>

                  {/* 3. Distribución de interacciones - DonutChart */}
                  <ChartCard
                    title="Distribución de interacciones"
                    description="Visitas, QR, mensajes, citas"
                    accent="cyan"
                    delay={0.2}
                  >
                    <div className="flex h-[220px] w-full items-center">
                      {safeData.distribution.length === 0 ? (
                        <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                          Sin datos suficientes
                        </div>
                      ) : (
                        <>
                          <div className="h-full flex-1">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={safeData.distribution}
                                  dataKey="value"
                                  nameKey="name"
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={48}
                                  outerRadius={78}
                                  paddingAngle={3}
                                  stroke="#fff"
                                  strokeWidth={2}
                                >
                                  {safeData.distribution.map((entry, idx) => (
                                    <Cell key={`cell-${idx}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <RTooltip
                                  contentStyle={TOOLTIP_STYLE}
                                  labelStyle={TOOLTIP_LABEL_STYLE}
                                  formatter={(value: number, name: string) => [
                                    value.toLocaleString('es-MX'),
                                    name,
                                  ]}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="flex w-32 flex-col gap-1.5 pr-1">
                            {safeData.distribution.map((d) => (
                              <div key={d.name} className="flex items-center justify-between gap-1.5 text-[11px]">
                                <span className="flex items-center gap-1.5">
                                  <span
                                    className="inline-block h-2 w-2 rounded-full"
                                    style={{ backgroundColor: d.color }}
                                  />
                                  <span className="text-slate-700">{d.name}</span>
                                </span>
                                <span className="font-semibold text-slate-900">
                                  {d.value.toLocaleString('es-MX')}
                                </span>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </ChartCard>

                  {/* 4. Engagement por sección - Horizontal BarChart */}
                  <ChartCard
                    title="Engagement por sección"
                    description="% de interacción por sección"
                    accent="violet"
                    delay={0.25}
                  >
                    <div className="h-[220px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={safeData.engagement}
                          layout="vertical"
                          margin={{ top: 4, right: 16, left: 8, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                          <XAxis
                            type="number"
                            tickLine={false}
                            axisLine={false}
                            fontSize={10}
                            tick={{ fill: '#64748b' }}
                            domain={[0, 'dataMax + 5']}
                            tickFormatter={(v) => `${v}%`}
                          />
                          <YAxis
                            type="category"
                            dataKey="name"
                            tickLine={false}
                            axisLine={false}
                            fontSize={11}
                            tick={{ fill: '#475569' }}
                            width={72}
                          />
                          <RTooltip
                            contentStyle={TOOLTIP_STYLE}
                            labelStyle={TOOLTIP_LABEL_STYLE}
                            formatter={(value: number) => [`${value}%`, 'Interacción']}
                          />
                          <Bar
                            dataKey="value"
                            name="Engagement"
                            radius={[0, 4, 4, 0]}
                            maxBarSize={20}
                          >
                            {safeData.engagement.map((entry, idx) => {
                              const color = [
                                COLORS.emerald, COLORS.gold, COLORS.cyan,
                                COLORS.violet, COLORS.rose, COLORS.slate,
                              ][idx % 6];
                              return <Cell key={`e-cell-${idx}`} fill={color} />;
                            })}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </ChartCard>
                </section>

                {/* ---------- Content Stats Table ---------- */}
                <section aria-label="Estadísticas de contenido">
                  <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.45 }}
                    className="rounded-xl border border-slate-200/70 bg-white p-4 shadow-sm"
                  >
                    <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      Estadísticas de contenido
                    </h4>
                    <div className="space-y-1">
                      {safeData.contentStats.map((stat) => (
                        <ContentStatRow
                          key={stat.label}
                          label={stat.label}
                          count={stat.count}
                          max={safeData.contentMax}
                          color={stat.color}
                        />
                      ))}
                    </div>
                  </motion.div>
                </section>

                {/* ---------- Top Performers + Comparación ---------- */}
                <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {/* Top Performers */}
                  <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.45 }}
                    className="rounded-xl border border-slate-200/70 bg-white p-4 shadow-sm"
                  >
                    <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                      <Star className="h-4 w-4 text-amber-500" />
                      Top performers
                    </h4>
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between rounded-lg bg-emerald-50/60 px-3 py-2">
                        <span className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Star className="h-3.5 w-3.5 text-emerald-600" />
                          Servicio más visto
                        </span>
                        <span className="truncate pl-2 text-xs font-semibold text-slate-800">
                          {safeData.topService}
                        </span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-amber-50/60 px-3 py-2">
                        <span className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                          Producto más visto
                        </span>
                        <span className="truncate pl-2 text-xs font-semibold text-slate-800">
                          {safeData.topProduct}
                        </span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-cyan-50/60 px-3 py-2">
                        <span className="flex items-center gap-2 text-xs text-muted-foreground">
                          <TrendingUp className="h-3.5 w-3.5 text-cyan-700" />
                          Día con más visitas
                        </span>
                        <span className="text-xs font-semibold text-slate-800">
                          {safeData.peakWeekday}
                        </span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-violet-50/60 px-3 py-2">
                        <span className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5 text-violet-600" />
                          Hora pico
                        </span>
                        <span className="text-xs font-semibold text-slate-800">
                          {safeData.peakHour}
                        </span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Comparación vs promedio */}
                  <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.45 }}
                    className="rounded-xl border border-slate-200/70 bg-white p-4 shadow-sm"
                  >
                    <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                      <BarChart3 className="h-4 w-4 text-emerald-600" />
                      Comparación vs. tu promedio
                    </h4>
                    <p className="mb-3 text-[11px] text-muted-foreground">
                      Cómo se compara esta tarjeta con el promedio de tus tarjetas.
                    </p>
                    <div className="space-y-2.5">
                      {[
                        { label: 'Visitas', diff: safeData.diffViews, value: safeCard.views },
                        { label: 'Escaneos QR', diff: safeData.diffQr, value: safeCard.qrScans },
                        { label: 'Mensajes', diff: safeData.diffMessages, value: safeData.cardMessages },
                      ].map((row) => {
                        const isUp = row.diff >= 0;
                        return (
                          <div
                            key={row.label}
                            className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2"
                          >
                            <div>
                              <p className="text-xs font-medium text-slate-700">{row.label}</p>
                              <p className="text-[10px] text-muted-foreground">
                                {row.value.toLocaleString('es-MX')} en esta tarjeta
                              </p>
                            </div>
                            <span
                              className={cn(
                                'inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-bold',
                                isUp
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-rose-50 text-rose-700',
                              )}
                            >
                              {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                              {isUp ? '+' : ''}{row.diff.toFixed(1)}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                </section>

                <Separator />

                {/* ---------- FOOTER ---------- */}
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button
                    variant="outline"
                    onClick={handleExport}
                    className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                  >
                    <Download className="h-4 w-4" />
                    Exportar datos
                  </Button>
                  <Button
                    onClick={handleViewFullAnalytics}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    Ver analítica completa
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

export default CardAnalyticsModal;
