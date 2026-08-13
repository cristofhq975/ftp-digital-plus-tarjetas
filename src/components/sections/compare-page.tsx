'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend,
} from 'recharts';
import {
  ArrowLeft, GitCompare, TrendingUp, Eye, QrCode, MessageSquare,
  Star, Lightbulb, Plus, Crown, Sparkles, Calendar, Activity,
  Users, ShoppingBag, Briefcase, Images, Palette, Clock, Lock,
  CheckCircle2, AlertCircle, ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Card, CardHeader, CardContent, CardTitle, CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from '@/components/ui/table';
import { CardPreview } from '@/components/card-preview';
import { FTPLogo } from '@/components/ftp-logo';
import { useAppStore, useCurrentUserCards } from '@/lib/store';
import { BusinessCard, PlanType } from '@/lib/types';
import { cn } from '@/lib/utils';

// ============================ PALETA ============================
const COLORS = {
  emerald: '#059669',
  emeraldLight: '#10b981',
  gold: '#f59e0b',
  goldLight: '#fbbf24',
  cyan: '#0891b2',
  rose: '#be123c',
  purple: '#7c3aed',
  orange: '#ea580c',
};

const COMPARE_PALETTE = [
  COLORS.emerald, COLORS.gold, COLORS.cyan, COLORS.rose, COLORS.purple,
];

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
const DAYS_ES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

/** Genera datos de series temporales deterministas para cada tarjeta. */
function generateCardTimeSeries(card: BusinessCard, days = 14) {
  const data: { date: string; views: number; scans: number }[] = [];
  const today = new Date();
  const seedBase = card.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const avg = Math.max(3, Math.floor(card.views / Math.max(1, days)));
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dayIdx = d.getDay();
    const seed = seedBase + Math.floor(d.getTime() / 86400000);
    const wave = Math.sin(seed * 0.7) * 0.4 + 0.6;
    const weekendBoost = dayIdx === 0 || dayIdx === 6 ? 1.25 : 1;
    const noise = ((seed * 13) % 7) / 10;
    const v = Math.max(1, Math.floor(avg * wave * weekendBoost + noise));
    const s = Math.max(0, Math.floor(v * 0.35 + ((seed * 5) % 4)));
    data.push({
      date: d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit' }),
      views: v,
      scans: s,
    });
  }
  return data;
}

/** Día más popular (mock basado en id de la tarjeta). */
function mostPopularDay(card: BusinessCard): string {
  const seed = card.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return DAYS_ES[(seed % 6) + 1];
}

/** Hora pico (mock basado en id de la tarjeta). */
function peakHour(card: BusinessCard): string {
  const seed = card.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const hours = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];
  return hours[seed % hours.length];
}

/** Promedio diario de visitas (estimado sobre 30 días). */
function dailyAverage(card: BusinessCard): number {
  const createdAt = new Date(card.createdAt).getTime();
  const days = Math.max(1, Math.min(30, Math.floor((Date.now() - createdAt) / 86400000)));
  return Math.round((card.views / days) * 10) / 10;
}

/** Tasa de conversión (mensajes / visitas * 100). */
function conversionRate(card: BusinessCard, messagesCount: number): number {
  if (card.views === 0) return 0;
  return Math.round((messagesCount / card.views) * 1000) / 10;
}

/** Datos para el radar chart. */
function radarData(cards: BusinessCard[]) {
  const dims = [
    { key: 'visitas', label: 'Visitas' },
    { key: 'qr', label: 'QR' },
    { key: 'mensajes', label: 'Mensajes' },
    { key: 'servicios', label: 'Servicios' },
    { key: 'productos', label: 'Productos' },
  ];
  // Normalizamos cada dimensión al máximo entre las tarjetas comparadas
  const max = { visitas: 0, qr: 0, mensajes: 0, servicios: 0, productos: 0 };
  cards.forEach(c => {
    max.visitas = Math.max(max.visitas, c.views);
    max.qr = Math.max(max.qr, c.qrScans);
    max.mensajes = Math.max(max.mensajes, 1); // se rellenará abajo
    max.servicios = Math.max(max.servicios, c.services.length, 1);
    max.productos = Math.max(max.productos, c.products.length, 1);
  });
  return dims.map(dim => {
    const row: Record<string, number | string> = { dimension: dim.label };
    cards.forEach(c => {
      let raw = 0;
      if (dim.key === 'visitas') raw = c.views;
      else if (dim.key === 'qr') raw = c.qrScans;
      else if (dim.key === 'servicios') raw = c.services.length;
      else if (dim.key === 'productos') raw = c.products.length;
      const m = (max as any)[dim.key] || 1;
      row[c.id] = m === 0 ? 0 : Math.round((raw / m) * 100);
    });
    return row;
  });
}

/** Actividad reciente combinada para todas las tarjetas seleccionadas. */
interface ActivityItem {
  id: string;
  cardId: string;
  cardName: string;
  type: 'view' | 'qr' | 'message' | 'appointment' | 'created' | 'updated';
  title: string;
  description: string;
  timestamp: string;
}

function recentActivityForCard(card: BusinessCard, messages: any[], appointments: any[]): ActivityItem[] {
  const items: ActivityItem[] = [];

  // Visitas (mock distribuidas en las últimas horas)
  const viewSeed = card.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  for (let i = 0; i < 3; i++) {
    const minutesAgo = 20 + ((viewSeed * (i + 1) * 17) % (60 * 8));
    items.push({
      id: `${card.id}-v${i}`,
      cardId: card.id,
      cardName: card.cardName,
      type: 'view',
      title: 'Nueva visita',
      description: `${card.cardName} · página pública`,
      timestamp: new Date(Date.now() - minutesAgo * 60 * 1000).toISOString(),
    });
  }
  // Escaneos QR
  for (let i = 0; i < 2; i++) {
    const minutesAgo = 90 + ((viewSeed * (i + 3) * 23) % (60 * 12));
    items.push({
      id: `${card.id}-q${i}`,
      cardId: card.id,
      cardName: card.cardName,
      type: 'qr',
      title: 'QR escaneado',
      description: `${card.cardName} · WhatsApp`,
      timestamp: new Date(Date.now() - minutesAgo * 60 * 1000).toISOString(),
    });
  }
  // Mensajes reales del store
  messages
    .filter(m => m.cardId === card.id)
    .slice(0, 2)
    .forEach((m, i) => {
      items.push({
        id: `${card.id}-m${i}`,
        cardId: card.id,
        cardName: card.cardName,
        type: 'message',
        title: 'Nuevo mensaje',
        description: `${m.name} · ${card.cardName}`,
        timestamp: m.date,
      });
    });
  // Citas reales del store
  appointments
    .filter(a => a.teamMemberId && card.team.some(t => t.id === a.teamMemberId))
    .slice(0, 1)
    .forEach((a, i) => {
      items.push({
        id: `${card.id}-a${i}`,
        cardId: card.id,
        cardName: card.cardName,
        type: 'appointment',
        title: 'Cita agendada',
        description: `${a.clientName} · ${card.cardName}`,
        timestamp: a.date,
      });
    });
  // Tarjeta creada
  items.push({
    id: `${card.id}-c`,
    cardId: card.id,
    cardName: card.cardName,
    type: 'created',
    title: 'Tarjeta creada',
    description: card.cardName,
    timestamp: card.createdAt,
  });

  return items;
}

const ACTIVITY_META: Record<ActivityItem['type'], { icon: any; bg: string; text: string }> = {
  view: { icon: Eye, bg: 'bg-emerald-100', text: 'text-emerald-700' },
  qr: { icon: QrCode, bg: 'bg-teal-100', text: 'text-teal-700' },
  message: { icon: MessageSquare, bg: 'bg-amber-100', text: 'text-amber-700' },
  appointment: { icon: Calendar, bg: 'bg-rose-100', text: 'text-rose-700' },
  created: { icon: Plus, bg: 'bg-emerald-100', text: 'text-emerald-700' },
  updated: { icon: Sparkles, bg: 'bg-purple-100', text: 'text-purple-700' },
};

function relTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(diff / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  if (day > 7) return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
  if (day > 0) return `hace ${day}d`;
  if (hr > 0) return `hace ${hr}h`;
  if (min > 0) return `hace ${min} min`;
  return 'hace un momento';
}

// ============================ RECOMENDACIONES ============================
function buildRecommendations(cards: BusinessCard[], messagesCount: Record<string, number>) {
  const recs: { id: string; title: string; description: string; tone: 'success' | 'warning' | 'info' }[] = [];

  // 1. Tarjeta con más visitas pero baja conversión
  if (cards.length >= 2) {
    const sortedByViews = [...cards].sort((a, b) => b.views - a.views);
    const top = sortedByViews[0];
    const topConv = conversionRate(top, messagesCount[top.id] || 0);
    const worst = sortedByViews[sortedByViews.length - 1];
    const worstConv = conversionRate(worst, messagesCount[worst.id] || 0);
    if (topConv < worstConv) {
      recs.push({
        id: 'conv',
        title: `Tu tarjeta "${top.cardName}" tiene más visitas pero menor conversión`,
        description: `Considera añadir más servicios o un llamado a la acción más claro para mejorar la tasa de conversión (${topConv}%).`,
        tone: 'warning',
      });
    } else {
      recs.push({
        id: 'conv',
        title: `"${top.cardName}" lidera en visitas y conversión`,
        description: `Esta tarjeta está convirtiendo bien (${topConv}%). Replica su estructura en las demás tarjetas para mejorar resultados.`,
        tone: 'success',
      });
    }
  }

  // 2. Tarjeta sin testimonios
  const noTestimonials = cards.find(c => c.testimonials.length === 0);
  if (noTestimonials) {
    recs.push({
      id: 'testimonials',
      title: `La tarjeta "${noTestimonials.cardName}" no tiene testimonios`,
      description: 'Añadir testimonios de clientes satisfechos puede aumentar la confianza y la conversión hasta en un 25%.',
      tone: 'warning',
    });
  }

  // 3. Tarjeta sin servicios ni productos
  const noContent = cards.find(c => c.services.length === 0 && c.products.length === 0);
  if (noContent) {
    recs.push({
      id: 'no-content',
      title: `"${noContent.cardName}" no tiene servicios ni productos`,
      description: 'Agregar al menos 3 servicios o productos ayuda a los visitantes a entender mejor tu oferta.',
      tone: 'warning',
    });
  }

  // 4. Tarjeta sin escaneos QR
  const noQr = cards.find(c => c.qrScans === 0);
  if (noQr) {
    recs.push({
      id: 'no-qr',
      title: `"${noQr.cardName}" no ha recibido escaneos QR`,
      description: 'Comparte el código QR en tus materiales impresos, mostradores y empaques para aumentar las visitas.',
      tone: 'info',
    });
  }

  // 5. Comparación de engagement
  if (cards.length >= 2) {
    const byTeam = [...cards].sort((a, b) => b.team.length - a.team.length);
    if (byTeam[0].team.length > 0 && byTeam[byTeam.length - 1].team.length === 0) {
      recs.push({
        id: 'team',
        title: `"${byTeam[0].cardName}" muestra tu equipo, las demás no`,
        description: 'Mostrar miembros del equipo humaniza tu marca. Considera añadir equipo a tus otras tarjetas.',
        tone: 'info',
      });
    }
  }

  // 6. Tarjeta inactiva
  const inactive = cards.find(c => !c.isActive);
  if (inactive) {
    recs.push({
      id: 'inactive',
      title: `"${inactive.cardName}" está inactiva`,
      description: 'Las tarjetas inactivas no son visibles públicamente. Actívala para que reciba visitas.',
      tone: 'warning',
    });
  }

  // 7. Best performer
  const best = [...cards].sort((a, b) =>
    (b.views + b.qrScans) - (a.views + a.qrScans)
  )[0];
  if (best) {
    recs.push({
      id: 'best',
      title: `"${best.cardName}" es tu mejor tarjeta`,
      description: `Con ${best.views} visitas y ${best.qrScans} escaneos QR, esta tarjeta lidera el engagement total. ¡Sigue promoviendo su enlace!`,
      tone: 'success',
    });
  }

  return recs.slice(0, 5);
}

// ============================ UPGRADE SCREEN ============================
function UpgradeScreen({ onUpgrade, onBack }: { onUpgrade: () => void; onBack: () => void }) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      <header className="sticky top-0 z-20 border-b bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-4 md:px-8">
          <Button variant="ghost" size="icon" onClick={onBack} aria-label="Volver">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900 md:text-2xl">
              <GitCompare className="h-5 w-5 text-emerald-600" />
              Comparar Tarjetas
            </h1>
            <p className="text-sm text-muted-foreground">Analiza y compara el rendimiento de tus tarjetas</p>
          </div>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-lg"
        >
          <Card className="overflow-hidden border-0 shadow-xl">
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-8 text-center text-white">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur">
                <Lock className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold">Comparación exclusiva</h2>
              <p className="mt-2 text-sm text-emerald-50">
                Compara hasta 3 tarjetas lado a lado con gráficas, métricas y recomendaciones inteligentes.
              </p>
            </div>
            <CardContent className="p-6">
              <p className="text-center text-sm text-muted-foreground">
                La comparación de tarjetas está disponible en los planes{' '}
                <span className="font-semibold text-emerald-700">Básico</span> y{' '}
                <span className="font-semibold text-amber-600">Pro</span>.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2.5">
                  <GitCompare className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span className="text-xs font-medium text-slate-700">2-3 tarjetas</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2.5">
                  <TrendingUp className="h-4 w-4 shrink-0 text-amber-600" />
                  <span className="text-xs font-medium text-slate-700">Gráficas comparativas</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2.5">
                  <Lightbulb className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span className="text-xs font-medium text-slate-700">Recomendaciones IA</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2.5">
                  <Activity className="h-4 w-4 shrink-0 text-amber-600" />
                  <span className="text-xs font-medium text-slate-700">Línea de tiempo</span>
                </div>
              </div>
              <Button
                className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700"
                size="lg"
                onClick={onUpgrade}
              >
                <Crown className="h-4 w-4" />
                Mejorar Plan
              </Button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Sin costos ocultos · Cancela cuando quieras · Soporte en español
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}

// ============================ ONE CARD SCREEN ============================
function OneCardScreen({ onCreate, onBack }: { onCreate: () => void; onBack: () => void }) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      <header className="sticky top-0 z-20 border-b bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-4 md:px-8">
          <Button variant="ghost" size="icon" onClick={onBack} aria-label="Volver">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900 md:text-2xl">
              <GitCompare className="h-5 w-5 text-emerald-600" />
              Comparar Tarjetas
            </h1>
            <p className="text-sm text-muted-foreground">Analiza y compara el rendimiento de tus tarjetas</p>
          </div>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-lg"
        >
          <Card className="border-0 shadow-xl">
            <CardContent className="flex flex-col items-center p-8 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <GitCompare className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Necesitas al menos 2 tarjetas</h2>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Para usar la comparación necesitas tener 2 o más tarjetas creadas. Actualmente solo tienes 1 tarjeta.
              </p>
              <Button className="mt-6 bg-emerald-600 hover:bg-emerald-700" size="lg" onClick={onCreate}>
                <Plus className="h-4 w-4" />
                Crear nueva tarjeta
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}

// ============================ FOOTER ============================
function Footer() {
  return (
    <footer className="mt-auto border-t bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-center sm:flex-row sm:px-8 sm:text-left">
        <div className="flex items-center gap-2">
          <FTPLogo variant="icon" className="h-6 w-6" />
          <span className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} FTP Digital Plus · Tarjetas de Presentación Digitales
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          Comparación de tarjetas ·{' '}
          <span className="font-medium text-emerald-700">Plan Básico / Pro</span>
        </span>
      </div>
    </footer>
  );
}

// ============================ SELECTOR ============================
function CardSelector({
  cards,
  selectedIds,
  onChange,
}: {
  cards: BusinessCard[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const toggleCard = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(x => x !== id));
    } else if (selectedIds.length < 3) {
      onChange([...selectedIds, id]);
    } else {
      toast.info('Máximo 3 tarjetas', { description: 'Solo puedes comparar hasta 3 tarjetas a la vez.' });
    }
  };

  return (
    <Card className="border-slate-200/70 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <GitCompare className="h-4 w-4 text-emerald-600" />
          Selecciona las tarjetas a comparar
        </CardTitle>
        <CardDescription>
          Elige entre 2 y 3 tarjetas · {selectedIds.length} seleccionada{selectedIds.length !== 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {cards.map(card => {
            const isSelected = selectedIds.includes(card.id);
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => toggleCard(card.id)}
                className={cn(
                  'group relative flex flex-col items-start gap-1.5 rounded-xl border p-3 text-left transition-all',
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/30 shadow-sm'
                    : 'border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30'
                )}
                aria-pressed={isSelected}
              >
                <div className="flex w-full items-center justify-between">
                  <div
                    className="h-7 w-7 rounded-md shadow-sm"
                    style={{ background: `linear-gradient(135deg, ${card.primaryColor}, ${card.secondaryColor})` }}
                  />
                  {isSelected ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-slate-300 group-hover:border-emerald-400" />
                  )}
                </div>
                <p className="line-clamp-1 text-sm font-semibold text-slate-800">{card.cardName}</p>
                <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Eye className="h-3 w-3" /> {card.views} visitas
                </p>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================ SECCIONES DE COMPARACIÓN ============================
function VisualPreviewSection({ cards, plan }: { cards: BusinessCard[]; plan: PlanType }) {
  return (
    <Card className="border-slate-200/70 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Eye className="h-4 w-4 text-emerald-600" />
          Vista previa visual
        </CardTitle>
        <CardDescription>Comparación visual de las tarjetas seleccionadas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className={cn(
          'grid gap-4',
          cards.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'
        )}>
          {cards.map((card, i) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="space-y-2"
            >
              <div className="flex items-center gap-2">
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold text-white"
                  style={{ background: COMPARE_PALETTE[i % COMPARE_PALETTE.length] }}
                >
                  {i + 1}
                </span>
                <p className="line-clamp-1 text-sm font-semibold text-slate-800">{card.cardName}</p>
              </div>
              <div className="origin-top scale-[0.62] sm:scale-[0.7] lg:scale-[0.75]" style={{ transformOrigin: 'top center' }}>
                <CardPreview card={card} userPlan={plan} previewMode="compact" />
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function StatsTableSection({
  cards,
  messagesCounts,
}: {
  cards: BusinessCard[];
  messagesCounts: Record<string, number>;
}) {
  const rows = [
    { label: 'Visitas totales', icon: Eye, get: (c: BusinessCard) => c.views.toLocaleString('es-MX') },
    { label: 'Escaneos QR', icon: QrCode, get: (c: BusinessCard) => c.qrScans.toLocaleString('es-MX') },
    {
      label: 'Tasa de conversión',
      icon: MessageSquare,
      get: (c: BusinessCard) => `${conversionRate(c, messagesCounts[c.id] || 0)}%`,
    },
    {
      label: 'Promedio diario de visitas',
      icon: TrendingUp,
      get: (c: BusinessCard) => `${dailyAverage(c)}/día`,
    },
    { label: 'Día más popular', icon: Calendar, get: (c: BusinessCard) => mostPopularDay(c) },
    { label: 'Hora pico', icon: Clock, get: (c: BusinessCard) => peakHour(c) },
  ];
  return (
    <Card className="border-slate-200/70 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="h-4 w-4 text-amber-600" />
          Estadísticas comparativas
        </CardTitle>
        <CardDescription>Métricas clave de rendimiento por tarjeta</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Métrica</TableHead>
                {cards.map((c, i) => (
                  <TableHead key={c.id} className="text-right">
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ background: COMPARE_PALETTE[i % COMPARE_PALETTE.length] }}
                        />
                        <span className="line-clamp-1 max-w-[140px] text-xs font-semibold">{c.cardName}</span>
                      </div>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(row => (
                <TableRow key={row.label}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <row.icon className="h-4 w-4 text-muted-foreground" />
                      {row.label}
                    </div>
                  </TableCell>
                  {cards.map((c, i) => {
                    const allValues = cards.map(cc => {
                      if (row.label === 'Visitas totales') return cc.views;
                      if (row.label === 'Escaneos QR') return cc.qrScans;
                      if (row.label === 'Tasa de conversión') return conversionRate(cc, messagesCounts[cc.id] || 0);
                      if (row.label === 'Promedio diario de visitas') return dailyAverage(cc);
                      return -1;
                    });
                    const isBest = (
                      row.label === 'Visitas totales' ||
                      row.label === 'Escaneos QR' ||
                      row.label === 'Tasa de conversión' ||
                      row.label === 'Promedio diario de visitas'
                    ) && c.id === cards.reduce((best, cc) =>
                      (row.label === 'Visitas totales' ? cc.views :
                       row.label === 'Escaneos QR' ? cc.qrScans :
                       row.label === 'Tasa de conversión' ? conversionRate(cc, messagesCounts[cc.id] || 0) :
                       dailyAverage(cc)) >
                      (row.label === 'Visitas totales' ? best.views :
                       row.label === 'Escaneos QR' ? best.qrScans :
                       row.label === 'Tasa de conversión' ? conversionRate(best, messagesCounts[best.id] || 0) :
                       dailyAverage(best)) ? cc : best
                    ).id;
                    return (
                      <TableCell
                        key={c.id}
                        className={cn(
                          'text-right text-sm tabular-nums',
                          isBest ? 'font-bold text-emerald-700' : 'text-slate-700'
                        )}
                      >
                        <span className="inline-flex items-center gap-1.5">
                          {isBest && <Star className="h-3 w-3 fill-amber-400 text-amber-400" />}
                          {row.get(c)}
                        </span>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function ChartsSection({ cards }: { cards: BusinessCard[] }) {
  const barData = useMemo(
    () => cards.map((c, i) => ({
      name: c.cardName.length > 14 ? c.cardName.slice(0, 12) + '…' : c.cardName,
      fullName: c.cardName,
      Visitas: c.views,
      'Escaneos QR': c.qrScans,
      color: COMPARE_PALETTE[i % COMPARE_PALETTE.length],
    })),
    [cards],
  );

  const lineData = useMemo(() => {
    const series = cards.map(c => generateCardTimeSeries(c, 14));
    const merged: any[] = [];
    for (let i = 0; i < 14; i++) {
      const row: any = { date: series[0][i].date };
      cards.forEach((c, idx) => {
        row[c.id] = series[idx][i].views;
      });
      row._cards = cards;
    }
    // Re-generate properly
    const result: any[] = [];
    for (let i = 0; i < 14; i++) {
      const row: any = { date: series[0][i].date };
      cards.forEach((c, idx) => {
        row[c.id] = series[idx][i].views;
      });
      result.push(row);
    }
    return result;
  }, [cards]);

  const radar = useMemo(() => radarData(cards), [cards]);

  return (
    <Card className="border-slate-200/70 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="h-4 w-4 text-emerald-600" />
          Gráficas comparativas
        </CardTitle>
        <CardDescription>Visualización de datos de rendimiento</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="bar" className="w-full">
          <TabsList className="bg-muted/60">
            <TabsTrigger value="bar">Barras</TabsTrigger>
            <TabsTrigger value="line">Tendencia</TabsTrigger>
            <TabsTrigger value="radar">Radar</TabsTrigger>
          </TabsList>

          {/* Bar chart */}
          <TabsContent value="bar" className="mt-4">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} cursor={{ fill: 'rgba(5,150,105,0.05)' }} />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                  <Bar dataKey="Visitas" fill={COLORS.emerald} radius={[6, 6, 0, 0]} maxBarSize={48} />
                  <Bar dataKey="Escaneos QR" fill={COLORS.gold} radius={[6, 6, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          {/* Line chart */}
          <TabsContent value="line" className="mt-4">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData} margin={{ top: 10, right: 10, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                  {cards.map((c, i) => (
                    <Line
                      key={c.id}
                      type="monotone"
                      dataKey={c.id}
                      name={c.cardName.length > 16 ? c.cardName.slice(0, 14) + '…' : c.cardName}
                      stroke={COMPARE_PALETTE[i % COMPARE_PALETTE.length]}
                      strokeWidth={2.5}
                      dot={{ r: 2 }}
                      activeDot={{ r: 5 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          {/* Radar chart */}
          <TabsContent value="radar" className="mt-4">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radar} outerRadius="75%">
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11, fill: '#475569' }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                  {cards.map((c, i) => (
                    <Radar
                      key={c.id}
                      name={c.cardName.length > 16 ? c.cardName.slice(0, 14) + '…' : c.cardName}
                      dataKey={c.id}
                      stroke={COMPARE_PALETTE[i % COMPARE_PALETTE.length]}
                      fill={COMPARE_PALETTE[i % COMPARE_PALETTE.length]}
                      fillOpacity={0.15}
                      strokeWidth={2}
                    />
                  ))}
                  <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function ContentTableSection({ cards }: { cards: BusinessCard[] }) {
  const rows = [
    { label: 'Servicios', icon: Briefcase, get: (c: BusinessCard) => c.services.length },
    { label: 'Productos', icon: ShoppingBag, get: (c: BusinessCard) => c.products.length },
    { label: 'Testimonios', icon: Star, get: (c: BusinessCard) => c.testimonials.length },
    { label: 'Imágenes en galería', icon: Images, get: (c: BusinessCard) => c.gallery.length },
    { label: 'Miembros de equipo', icon: Users, get: (c: BusinessCard) => c.team.length },
    { label: 'Plantilla', icon: Sparkles, get: (c: BusinessCard) => c.template, isText: true },
    {
      label: 'Color principal',
      icon: Palette,
      get: (c: BusinessCard) => c.primaryColor,
      isColor: true,
    },
  ];
  return (
    <Card className="border-slate-200/70 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Briefcase className="h-4 w-4 text-emerald-600" />
          Contenido comparativo
        </CardTitle>
        <CardDescription>Cantidad de elementos y configuración por tarjeta</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Elemento</TableHead>
                {cards.map((c, i) => (
                  <TableHead key={c.id} className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: COMPARE_PALETTE[i % COMPARE_PALETTE.length] }}
                      />
                      <span className="line-clamp-1 max-w-[140px] text-xs font-semibold">{c.cardName}</span>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(row => (
                <TableRow key={row.label}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <row.icon className="h-4 w-4 text-muted-foreground" />
                      {row.label}
                    </div>
                  </TableCell>
                  {cards.map(c => {
                    const value = row.get(c);
                    const numericValues = cards.map(cc => row.get(cc) as number);
                    const isBest = !row.isText && !row.isColor && value === Math.max(...numericValues) && value > 0;
                    return (
                      <TableCell
                        key={c.id}
                        className={cn(
                          'text-right text-sm tabular-nums',
                          isBest ? 'font-bold text-emerald-700' : 'text-slate-700',
                          row.isColor && 'text-right'
                        )}
                      >
                        {row.isColor ? (
                          <div className="flex items-center justify-end gap-2">
                            <span
                              className="inline-block h-5 w-5 rounded-md border border-slate-200 shadow-sm"
                              style={{ background: value as string }}
                            />
                            <code className="text-xs text-slate-500">{value as string}</code>
                          </div>
                        ) : row.isText ? (
                          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 capitalize">{value as string}</Badge>
                        ) : (
                          <span className="inline-flex items-center gap-1.5">
                            {isBest && <Star className="h-3 w-3 fill-amber-400 text-amber-400" />}
                            {value as number}
                          </span>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityTimelineSection({ cards }: { cards: BusinessCard[] }) {
  const messages = useAppStore(s => s.messages);
  const appointments = useAppStore(s => s.appointments);

  const activities = useMemo(() => {
    const all: ActivityItem[] = [];
    cards.forEach(c => {
      all.push(...recentActivityForCard(c, messages, appointments));
    });
    return all.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 12);
  }, [cards, messages, appointments]);

  return (
    <Card className="border-slate-200/70 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-4 w-4 text-amber-600" />
          Actividad reciente
        </CardTitle>
        <CardDescription>Eventos recientes combinados de todas las tarjetas</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <ol className="relative max-h-96 space-y-2 overflow-y-auto pr-1 custom-scrollbar">
          {activities.map((act, i) => {
            const meta = ACTIVITY_META[act.type];
            const cardIdx = cards.findIndex(c => c.id === act.cardId);
            const accent = COMPARE_PALETTE[cardIdx % COMPARE_PALETTE.length];
            return (
              <motion.li
                key={act.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.4) }}
                className="relative flex items-start gap-3 rounded-lg border border-slate-100 bg-white p-2.5"
              >
                <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full', meta.bg, meta.text)}>
                  <meta.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800">{act.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{act.description}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span
                    className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold text-white"
                    style={{ background: accent }}
                  >
                    T{cardIdx + 1}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{relTime(act.timestamp)}</span>
                </div>
              </motion.li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}

function RecommendationsSection({
  cards,
  messagesCounts,
}: {
  cards: BusinessCard[];
  messagesCounts: Record<string, number>;
}) {
  const recs = useMemo(() => buildRecommendations(cards, messagesCounts), [cards, messagesCounts]);

  const toneConfig: Record<string, { bg: string; text: string; border: string; icon: any }> = {
    success: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle2 },
    warning: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: AlertCircle },
    info: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', icon: Lightbulb },
  };

  return (
    <Card className="border-emerald-200/70 bg-gradient-to-br from-emerald-50/40 via-white to-amber-50/30 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-sm">
            <Lightbulb className="h-4 w-4" />
          </div>
          Recomendaciones inteligentes
        </CardTitle>
        <CardDescription>Sugerencias basadas en el análisis de tus tarjetas</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid gap-3 sm:grid-cols-2">
          {recs.map((rec, i) => {
            const cfg = toneConfig[rec.tone];
            return (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className={cn('flex items-start gap-3 rounded-xl border p-3', cfg.bg, cfg.border)}
              >
                <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm', cfg.text)}>
                  <cfg.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800">{rec.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{rec.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================ MAIN ============================
export function ComparePage() {
  const currentUser = useAppStore(s => s.currentUser);
  const navigate = useAppStore(s => s.navigate);
  const setSelectedPlanForCheckout = useAppStore(s => s.setSelectedPlanForCheckout);
  const setCompareCards = useAppStore(s => s.setCompareCards);
  const storedCompareIds = useAppStore(s => s.compareCardIds);
  const messages = useAppStore(s => s.messages);
  const cards = useCurrentUserCards();

  // Local selection state (initialized once from store, then synced via setCompareCards).
  // We use the store's compareCardIds as the canonical source of truth, mirrored locally
  // so users can deselect without an extra network round-trip.
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    const valid = storedCompareIds.filter(id => cards.some(c => c.id === id));
    return valid.length >= 2 ? valid.slice(0, 3) : [];
  });

  const handleSelectionChange = useCallback((ids: string[]) => {
    setSelectedIds(ids);
    setCompareCards(ids);
  }, [setCompareCards]);

  const selectedCards = useMemo(
    () => selectedIds.map(id => cards.find(c => c.id === id)).filter(Boolean) as BusinessCard[],
    [selectedIds, cards],
  );

  const messagesCounts = useMemo(() => {
    const map: Record<string, number> = {};
    cards.forEach(c => {
      map[c.id] = messages.filter(m => m.cardId === c.id).length;
    });
    return map;
  }, [cards, messages]);

  // Not logged in
  if (!currentUser) {
    return (
      <div className="flex min-h-screen flex-col bg-muted/30">
        <main className="flex flex-1 items-center justify-center p-4">
          <Card className="max-w-md p-6 text-center">
            <p className="text-muted-foreground">Debes iniciar sesión para comparar tarjetas.</p>
            <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700" onClick={() => navigate('login')}>
              Iniciar Sesión
            </Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // Free plan: upgrade screen
  if (currentUser.plan === 'gratis') {
    return (
      <UpgradeScreen
        onBack={() => navigate('dashboard')}
        onUpgrade={() => {
          setSelectedPlanForCheckout('basico');
          navigate('checkout');
        }}
      />
    );
  }

  // Only 1 card
  if (cards.length < 2) {
    return (
      <OneCardScreen
        onBack={() => navigate('dashboard')}
        onCreate={() => navigate('dashboard')}
      />
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b bg-white/85 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-4 md:px-8 md:py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('dashboard')}
                aria-label="Volver al panel"
                className="mt-0.5 shrink-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-slate-900 md:text-2xl">
                    Comparar Tarjetas
                  </h1>
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                    <GitCompare className="h-3 w-3" />
                    {currentUser.plan === 'pro' ? 'Pro' : 'Básico'}
                  </Badge>
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Analiza y compara el rendimiento de tus tarjetas
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('stats')}
                className="border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300"
              >
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Ver analítica</span>
              </Button>
              <Button
                size="sm"
                onClick={() => navigate('dashboard')}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Nueva tarjeta</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1">
        <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:px-8 md:py-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <CardSelector
              cards={cards}
              selectedIds={selectedIds}
              onChange={handleSelectionChange}
            />
          </motion.div>

          {selectedCards.length >= 2 ? (
            <motion.div
              key={selectedIds.join('-')}
              initial="initial"
              animate="animate"
              variants={{ initial: { opacity: 0 }, animate: { opacity: 1, transition: { staggerChildren: 0.06 } } }}
              className="space-y-6"
            >
              <motion.div variants={{ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }}>
                <VisualPreviewSection cards={selectedCards} plan={currentUser.plan} />
              </motion.div>
              <motion.div variants={{ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }}>
                <StatsTableSection cards={selectedCards} messagesCounts={messagesCounts} />
              </motion.div>
              <motion.div variants={{ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }}>
                <ChartsSection cards={selectedCards} />
              </motion.div>
              <motion.div variants={{ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }}>
                <ContentTableSection cards={selectedCards} />
              </motion.div>
              <motion.div variants={{ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }}>
                <ActivityTimelineSection cards={selectedCards} />
              </motion.div>
              <motion.div variants={{ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }}>
                <RecommendationsSection cards={selectedCards} messagesCounts={messagesCounts} />
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <Card className="border-dashed border-emerald-200 bg-emerald-50/30 shadow-sm">
                <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <GitCompare className="h-7 w-7" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">Selecciona al menos 2 tarjetas</h2>
                  <p className="mt-1 max-w-md text-sm text-muted-foreground">
                    Elige 2 o 3 tarjetas del selector de arriba para ver la comparación completa con gráficas, estadísticas y recomendaciones.
                  </p>
                  <Button
                    className="mt-5 bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => handleSelectionChange(cards.slice(0, Math.min(2, cards.length)).map(c => c.id))}
                  >
                    <Sparkles className="h-4 w-4" />
                    Comparar mis 2 primeras tarjetas
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
