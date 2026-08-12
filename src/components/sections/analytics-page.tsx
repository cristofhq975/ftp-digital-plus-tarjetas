'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Cell, ResponsiveContainer, Tooltip, Legend,
} from 'recharts';
import {
  TrendingUp, TrendingDown, Eye, QrCode, Mail, Calendar, Download,
  Globe, Smartphone, Monitor, Tablet, ArrowLeft, Sparkles, Lock, Clock,
  MousePointerClick, CalendarDays, MapPin, Activity, Award,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Card, CardHeader, CardContent, CardTitle, CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from '@/components/ui/table';
import { FTPLogo } from '@/components/ftp-logo';
import { useAppStore, useCurrentUserCards } from '@/lib/store';
import { cn } from '@/lib/utils';

// ============================ PALETA DE COLORES ============================
const COLORS = {
  emerald: '#059669',
  emeraldLight: '#10b981',
  gold: '#f59e0b',
  goldLight: '#fbbf24',
  cyan: '#0891b2',
  rose: '#be123c',
  purple: '#7c3aed',
};

const PIE_COLORS = [COLORS.emerald, COLORS.gold, COLORS.cyan, COLORS.rose];
const DONUT_COLORS = [COLORS.emerald, COLORS.gold, COLORS.cyan];

// Estilos compartidos de Tooltip
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
function generateTimeSeriesData(days: number): { date: string; views: number; scans: number }[] {
  const data: { date: string; views: number; scans: number }[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const seed = Math.floor(d.getTime() / 86400000);
    const wave = Math.sin(seed * 0.7);
    const wave2 = Math.cos(seed * 0.5);
    // Escala los datos según el rango para que se vean realistas
    const factor = days <= 7 ? 1 : days <= 30 ? 1.4 : 2.2;
    const baseViews = Math.max(3, Math.floor((15 + wave * 9 + (seed % 14)) * factor));
    const baseScans = Math.max(1, Math.floor((5 + wave2 * 4 + (seed % 8)) * factor));
    data.push({
      date: d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit' }),
      views: baseViews,
      scans: baseScans,
    });
  }
  return data;
}

// Animación entrada (sin hooks)
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: 'easeOut' as const },
});

// ============================ SUB-COMPONENTES ============================
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
          Analítica avanzada · Plan {''}
          <span className="font-medium text-emerald-700">Básico / Pro</span>
        </span>
      </div>
    </footer>
  );
}

// Pantalla de upgrade para plan gratis
function UpgradeScreen({ onUpgrade }: { onUpgrade: () => void }) {
  const features = [
    { icon: Activity, label: 'Gráficas interactivas' },
    { icon: MapPin, label: 'Distribución geográfica' },
    { icon: Smartphone, label: 'Análisis por dispositivo' },
    { icon: TrendingUp, label: 'Tendencias de crecimiento' },
    { icon: Award, label: 'Tarjetas mejor performers' },
    { icon: Clock, label: 'Métricas de engagement' },
  ];
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-emerald-50/40">
      <main className="flex flex-1 items-center justify-center p-4">
        <motion.div {...fadeUp(0)} className="w-full max-w-lg">
          <Card className="overflow-hidden border-0 shadow-xl">
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-8 text-center text-white">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur">
                <Lock className="h-8 w-8" />
              </div>
              <h1 className="text-2xl font-bold">Analítica avanzada exclusiva</h1>
              <p className="mt-2 text-sm text-emerald-50">
                Desbloquea estadísticas detalladas, gráficas interactivas y métricas de rendimiento para tus tarjetas.
              </p>
            </div>
            <CardContent className="p-6">
              <p className="text-center text-sm text-muted-foreground">
                La analítica avanzada está disponible en los planes{' '}
                <span className="font-semibold text-emerald-700">Básico</span> y{' '}
                <span className="font-semibold text-amber-600">Pro</span>.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {features.map(f => (
                  <div
                    key={f.label}
                    className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2.5"
                  >
                    <f.icon className="h-4 w-4 shrink-0 text-emerald-600" />
                    <span className="text-xs font-medium text-slate-700">{f.label}</span>
                  </div>
                ))}
              </div>
              <Button
                className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700"
                size="lg"
                onClick={onUpgrade}
              >
                <Sparkles className="h-4 w-4" />
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

// Tarjeta de estadística con tendencia
interface StatCardProps {
  title: string;
  value: string | number;
  trend: number;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  delay?: number;
}

function StatCard({ title, value, trend, icon: Icon, iconBg, iconColor, delay = 0 }: StatCardProps) {
  const isUp = trend >= 0;
  return (
    <motion.div {...fadeUp(delay)}>
      <Card className="overflow-hidden border-slate-200/70 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {title}
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">{value}</p>
            </div>
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                iconBg,
              )}
            >
              <Icon className={cn('h-5 w-5', iconColor)} />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5">
            <span
              className={cn(
                'inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-semibold',
                isUp ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700',
              )}
            >
              {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {isUp ? '+' : ''}{trend.toFixed(1)}%
            </span>
            <span className="text-xs text-muted-foreground">vs. periodo anterior</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Tarjeta de métrica de engagement (mock)
interface EngagementCardProps {
  title: string;
  value: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  delay?: number;
}

function EngagementCard({ title, value, hint, icon: Icon, delay = 0 }: EngagementCardProps) {
  return (
    <motion.div {...fadeUp(delay)}>
      <Card className="border-slate-200/70 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
              <Icon className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {title}
            </p>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================ COMPONENTE PRINCIPAL ============================
export function AnalyticsPage() {
  const currentUser = useAppStore(s => s.currentUser);
  const navigate = useAppStore(s => s.navigate);
  const cards = useCurrentUserCards();
  const messages = useAppStore(s => s.messages);
  const appointments = useAppStore(s => s.appointments);

  const [range, setRange] = useState('30');

  // Días efectivos (en demo "Todo el tiempo" usa 90 días)
  const days = range === 'all' ? 90 : parseInt(range, 10);

  // Series temporales (mock)
  const timeSeries = useMemo(() => generateTimeSeriesData(days), [days]);

  // Datos acumulados para área chart
  const cumulativeData = useMemo(() => {
    return timeSeries.reduce<{ date: string; total: number }[]>((acc, d) => {
      const prev = acc.length > 0 ? acc[acc.length - 1].total : 0;
      return [...acc, { date: d.date, total: prev + d.views }];
    }, []);
  }, [timeSeries]);

  // Métricas agregadas reales desde el store
  const totalViews = useMemo(() => cards.reduce((s, c) => s + c.views, 0), [cards]);
  const totalScans = useMemo(() => cards.reduce((s, c) => s + c.qrScans, 0), [cards]);
  const totalMessages = messages.length;
  const totalAppointments = appointments.length;

  // Tendencias (mock pero deterministas)
  const trends = useMemo(() => {
    const seed = days;
    return {
      views: 8 + ((seed * 3) % 14),
      scans: 5 + ((seed * 5) % 11),
      messages: -3 + ((seed * 2) % 12),
      appointments: 6 + ((seed * 7) % 13),
    };
  }, [days]);

  // Datos para bar chart: visitas y escaneos por tarjeta
  const cardsBarData = useMemo(
    () =>
      cards
        .map(c => ({
          name: c.cardName.length > 18 ? c.cardName.slice(0, 16) + '…' : c.cardName,
          fullName: c.cardName,
          views: c.views,
          scans: c.qrScans,
        }))
        .sort((a, b) => b.views - a.views),
    [cards],
  );

  // Datos para pie chart: distribución de interacciones
  const interactionData = useMemo(
    () => [
      { name: 'Visitas', value: totalViews, color: PIE_COLORS[0] },
      { name: 'Escaneos QR', value: totalScans, color: PIE_COLORS[1] },
      { name: 'Mensajes', value: totalMessages, color: PIE_COLORS[2] },
      { name: 'Citas', value: totalAppointments, color: PIE_COLORS[3] },
    ].filter(d => d.value > 0),
    [totalViews, totalScans, totalMessages, totalAppointments],
  );

  // Tabla de top performing cards
  const topCards = useMemo(
    () =>
      cards
        .map(c => {
          const cardMessages = messages.filter(m => m.cardId === c.id).length;
          const conversion = c.views > 0 ? (cardMessages / c.views) * 100 : 0;
          return { ...c, messageCount: cardMessages, conversion };
        })
        .sort((a, b) => b.views - a.views),
    [cards, messages],
  );

  // ----- Datos mock de engagement / geografía / dispositivos -----
  const engagement = useMemo(() => {
    const seed = days;
    const minutes = 1 + (seed % 3);
    const seconds = 30 + (seed % 30);
    return {
      avgTime: `${minutes}m ${seconds}s`,
      bounceRate: 32 + (seed % 18),
      topSection: 'Servicios',
      topSectionPct: 28 + (seed % 12),
      bestDay: 'Miércoles',
      bestDayPct: 22 + (seed % 9),
    };
  }, [days]);

  const geoData = useMemo(
    () => [
      { city: 'Ciudad de México', country: 'México', visitors: 432, pct: 38 },
      { city: 'Guadalajara', country: 'México', visitors: 287, pct: 25 },
      { city: 'Monterrey', country: 'México', visitors: 198, pct: 17 },
      { city: 'Puebla', country: 'México', visitors: 124, pct: 11 },
      { city: 'Tijuana', country: 'México', visitors: 89, pct: 9 },
    ],
    [],
  );

  const deviceData = useMemo(
    () => [
      { name: 'Móvil', value: 67, color: DONUT_COLORS[0] },
      { name: 'Escritorio', value: 24, color: DONUT_COLORS[1] },
      { name: 'Tablet', value: 9, color: DONUT_COLORS[2] },
    ],
    [],
  );

  // ----- Handlers -----
  const handleExport = () => {
    toast.success('Reporte exportado', {
      description: 'Tu reporte en PDF se ha generado correctamente (demo).',
      icon: <Download className="h-4 w-4" />,
    });
  };

  // ----- Access control (después de hooks) -----
  if (!currentUser) {
    return (
      <div className="flex min-h-screen flex-col bg-muted/30">
        <main className="flex flex-1 items-center justify-center p-4">
          <Card className="max-w-md p-6 text-center">
            <p className="text-muted-foreground">
              Debes iniciar sesión para ver tus estadísticas.
            </p>
            <Button
              className="mt-4 bg-emerald-600 hover:bg-emerald-700"
              onClick={() => navigate('login')}
            >
              Iniciar Sesión
            </Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (currentUser.plan === 'gratis') {
    return <UpgradeScreen onUpgrade={() => navigate('pricing')} />;
  }

  // ----- Render principal -----
  const rangeLabel =
    range === 'all'
      ? 'Todo el tiempo'
      : range === '7'
      ? 'Últimos 7 días'
      : range === '30'
      ? 'Últimos 30 días'
      : 'Últimos 90 días';

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      {/* ============================ HEADER ============================ */}
      <header className="sticky top-0 z-30 border-b bg-white/85 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-4 md:px-8 md:py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
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
                    Analítica y Estadísticas
                  </h1>
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                    <Activity className="h-3 w-3" />
                    {currentUser.plan === 'pro' ? 'Pro' : 'Básico'}
                  </Badge>
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Monitorea el rendimiento de tus tarjetas digitales ·{' '}
                  <span className="font-medium text-slate-600">{rangeLabel}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Tabs value={range} onValueChange={setRange}>
                <TabsList className="bg-muted/60">
                  <TabsTrigger value="7">7 días</TabsTrigger>
                  <TabsTrigger value="30">30 días</TabsTrigger>
                  <TabsTrigger value="90">90 días</TabsTrigger>
                  <TabsTrigger value="all">Todo</TabsTrigger>
                </TabsList>
              </Tabs>
              <Button
                onClick={handleExport}
                className="bg-emerald-600 hover:bg-emerald-700"
                size="sm"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Exportar reporte</span>
                <span className="sm:hidden">PDF</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* ============================ MAIN ============================ */}
      <main className="flex-1">
        <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:px-8 md:py-8">
          {/* ---------- Stat cards ---------- */}
          <section
            aria-label="Resumen general"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <StatCard
              title="Total de visitas"
              value={totalViews.toLocaleString('es-MX')}
              trend={trends.views}
              icon={Eye}
              iconBg="bg-emerald-50"
              iconColor="text-emerald-600"
              delay={0.05}
            />
            <StatCard
              title="Escaneos QR"
              value={totalScans.toLocaleString('es-MX')}
              trend={trends.scans}
              icon={QrCode}
              iconBg="bg-amber-50"
              iconColor="text-amber-600"
              delay={0.1}
            />
            <StatCard
              title="Mensajes recibidos"
              value={totalMessages}
              trend={trends.messages}
              icon={Mail}
              iconBg="bg-cyan-50"
              iconColor="text-cyan-700"
              delay={0.15}
            />
            <StatCard
              title="Citas agendadas"
              value={totalAppointments}
              trend={trends.appointments}
              icon={Calendar}
              iconBg="bg-rose-50"
              iconColor="text-rose-600"
              delay={0.2}
            />
          </section>

          {/* ---------- Charts: Line + Area ---------- */}
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Line chart: Visitas y escaneos QR */}
            <motion.div {...fadeUp(0.1)}>
              <Card className="h-full border-slate-200/70 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                    Visitas y escaneos QR
                  </CardTitle>
                  <CardDescription>
                    Tendencia diaria de los últimos {days} días
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={timeSeries}
                        margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis
                          dataKey="date"
                          tickLine={false}
                          axisLine={false}
                          fontSize={11}
                          tick={{ fill: '#64748b' }}
                          interval="preserveStartEnd"
                          minTickGap={20}
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          fontSize={11}
                          tick={{ fill: '#64748b' }}
                          width={36}
                        />
                        <Tooltip
                          contentStyle={TOOLTIP_STYLE}
                          labelStyle={TOOLTIP_LABEL_STYLE}
                        />
                        <Legend
                          iconType="circle"
                          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="views"
                          name="Visitas"
                          stroke={COLORS.emerald}
                          strokeWidth={2.5}
                          dot={false}
                          activeDot={{ r: 5, fill: COLORS.emerald, stroke: '#fff', strokeWidth: 2 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="scans"
                          name="Escaneos QR"
                          stroke={COLORS.gold}
                          strokeWidth={2.5}
                          dot={false}
                          activeDot={{ r: 5, fill: COLORS.gold, stroke: '#fff', strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Area chart: Tendencia de crecimiento */}
            <motion.div {...fadeUp(0.15)}>
              <Card className="h-full border-slate-200/70 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
                    Tendencia de crecimiento
                  </CardTitle>
                  <CardDescription>
                    Visitas acumuladas en el periodo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={cumulativeData}
                        margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="gradGrowth" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={COLORS.emerald} stopOpacity={0.35} />
                            <stop offset="100%" stopColor={COLORS.emerald} stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis
                          dataKey="date"
                          tickLine={false}
                          axisLine={false}
                          fontSize={11}
                          tick={{ fill: '#64748b' }}
                          interval="preserveStartEnd"
                          minTickGap={20}
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          fontSize={11}
                          tick={{ fill: '#64748b' }}
                          width={36}
                        />
                        <Tooltip
                          contentStyle={TOOLTIP_STYLE}
                          labelStyle={TOOLTIP_LABEL_STYLE}
                        />
                        <Area
                          type="monotone"
                          dataKey="total"
                          name="Visitas acumuladas"
                          stroke={COLORS.emerald}
                          strokeWidth={2.5}
                          fill="url(#gradGrowth)"
                          dot={false}
                          activeDot={{ r: 5, fill: COLORS.emerald, stroke: '#fff', strokeWidth: 2 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </section>

          {/* ---------- Charts: Bar + Pie ---------- */}
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Bar chart: Visitas por tarjeta */}
            <motion.div {...fadeUp(0.1)}>
              <Card className="h-full border-slate-200/70 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-600" />
                    Visitas por tarjeta
                  </CardTitle>
                  <CardDescription>
                    Comparativa de rendimiento entre tus tarjetas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {cardsBarData.length === 0 ? (
                    <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
                      No hay tarjetas para mostrar.
                    </div>
                  ) : (
                    <div className="h-[280px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={cardsBarData}
                          margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                          <XAxis
                            dataKey="name"
                            tickLine={false}
                            axisLine={false}
                            fontSize={11}
                            tick={{ fill: '#64748b' }}
                            interval={0}
                            angle={cardsBarData.length > 2 ? -15 : 0}
                            textAnchor={cardsBarData.length > 2 ? 'end' : 'middle'}
                            height={cardsBarData.length > 2 ? 50 : 30}
                          />
                          <YAxis
                            tickLine={false}
                            axisLine={false}
                            fontSize={11}
                            tick={{ fill: '#64748b' }}
                            width={36}
                          />
                          <Tooltip
                            contentStyle={TOOLTIP_STYLE}
                            labelStyle={TOOLTIP_LABEL_STYLE}
                            formatter={(value, _name, item) => [
                              `${value.toLocaleString('es-MX')}`,
                              'Visitas',
                            ]}
                            labelFormatter={(_label, payload) => {
                              const p = payload?.[0]?.payload as { fullName?: string } | undefined;
                              return p?.fullName || _label;
                            }}
                          />
                          <Legend
                            iconType="circle"
                            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                          />
                          <Bar
                            dataKey="views"
                            name="Visitas"
                            fill={COLORS.emerald}
                            radius={[6, 6, 0, 0]}
                            maxBarSize={56}
                          />
                          <Bar
                            dataKey="scans"
                            name="Escaneos QR"
                            fill={COLORS.gold}
                            radius={[6, 6, 0, 0]}
                            maxBarSize={56}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Pie chart: Distribución de interacciones */}
            <motion.div {...fadeUp(0.15)}>
              <Card className="h-full border-slate-200/70 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <span className="inline-block h-2 w-2 rounded-full bg-cyan-600" />
                    Distribución de interacciones
                  </CardTitle>
                  <CardDescription>
                    Cómo se distribuyen las acciones de tus visitantes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {interactionData.length === 0 ? (
                    <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
                      Sin datos suficientes para mostrar.
                    </div>
                  ) : (
                    <div className="h-[280px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={interactionData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={90}
                            paddingAngle={3}
                            stroke="#fff"
                            strokeWidth={2}
                          >
                            {interactionData.map((entry, idx) => (
                              <Cell key={`cell-${idx}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={TOOLTIP_STYLE}
                            labelStyle={TOOLTIP_LABEL_STYLE}
                            formatter={(value: number, name: string) => [
                              value.toLocaleString('es-MX'),
                              name,
                            ]}
                          />
                          <Legend
                            iconType="circle"
                            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </section>

          {/* ---------- Top performing cards table ---------- */}
          <motion.div {...fadeUp(0.1)}>
            <Card className="border-slate-200/70 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Award className="h-4 w-4 text-amber-500" />
                  Tarjetas con mejor rendimiento
                </CardTitle>
                <CardDescription>
                  Ranking de tus tarjetas por número de visitas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {topCards.length === 0 ? (
                  <div className="py-10 text-center text-sm text-muted-foreground">
                    Aún no tienes tarjetas. Crea una desde el panel para ver sus estadísticas.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-200">
                          <TableHead className="w-10 text-center">#</TableHead>
                          <TableHead>Tarjeta</TableHead>
                          <TableHead className="text-right">Visitas</TableHead>
                          <TableHead className="text-right">Escaneos QR</TableHead>
                          <TableHead className="text-right">Mensajes</TableHead>
                          <TableHead className="text-right">Conversión</TableHead>
                          <TableHead className="text-center">Estado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {topCards.map((c, idx) => (
                          <TableRow key={c.id} className="border-slate-100">
                            <TableCell className="text-center">
                              <span
                                className={cn(
                                  'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
                                  idx === 0
                                    ? 'bg-amber-100 text-amber-700'
                                    : idx === 1
                                    ? 'bg-slate-200 text-slate-700'
                                    : idx === 2
                                    ? 'bg-orange-100 text-orange-700'
                                    : 'bg-muted text-muted-foreground',
                                )}
                              >
                                {idx + 1}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div
                                  className="h-8 w-8 shrink-0 rounded-md"
                                  style={{
                                    background: `linear-gradient(135deg, ${c.primaryColor}, ${c.secondaryColor})`,
                                  }}
                                />
                                <div className="min-w-0">
                                  <p className="truncate font-medium text-slate-900">
                                    {c.cardName}
                                  </p>
                                  <p className="truncate text-xs text-muted-foreground">
                                    /{c.linkName}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-medium text-slate-700">
                              {c.views.toLocaleString('es-MX')}
                            </TableCell>
                            <TableCell className="text-right font-medium text-slate-700">
                              {c.qrScans.toLocaleString('es-MX')}
                            </TableCell>
                            <TableCell className="text-right font-medium text-slate-700">
                              {c.messageCount}
                            </TableCell>
                            <TableCell className="text-right">
                              <span
                                className={cn(
                                  'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold',
                                  c.conversion >= 10
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : c.conversion >= 5
                                    ? 'bg-amber-50 text-amber-700'
                                    : 'bg-slate-100 text-slate-600',
                                )}
                              >
                                {c.conversion.toFixed(1)}%
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant={c.isActive ? 'default' : 'secondary'}
                                className={cn(
                                  c.isActive
                                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                                    : 'bg-slate-100 text-slate-500 hover:bg-slate-100',
                                )}
                              >
                                {c.isActive ? 'Activa' : 'Inactiva'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* ---------- Engagement metrics ---------- */}
          <section
            aria-label="Métricas de engagement"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <EngagementCard
              title="Tiempo promedio"
              value={engagement.avgTime}
              hint="En cada tarjeta"
              icon={Clock}
              delay={0.05}
            />
            <EngagementCard
              title="Tasa de rebote"
              value={`${engagement.bounceRate}%`}
              hint="Visitas de una sola página"
              icon={TrendingDown}
              delay={0.1}
            />
            <EngagementCard
              title="Sección más clickeada"
              value={engagement.topSection}
              hint={`${engagement.topSectionPct}% de los clics`}
              icon={MousePointerClick}
              delay={0.15}
            />
            <EngagementCard
              title="Mejor día de la semana"
              value={engagement.bestDay}
              hint={`${engagement.bestDayPct}% del tráfico semanal`}
              icon={CalendarDays}
              delay={0.2}
            />
          </section>

          {/* ---------- Geographic + Device ---------- */}
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Geographic distribution */}
            <motion.div {...fadeUp(0.1)}>
              <Card className="h-full border-slate-200/70 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Globe className="h-4 w-4 text-emerald-600" />
                    Distribución geográfica
                  </CardTitle>
                  <CardDescription>
                    Top 5 ciudades por número de visitantes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {geoData.map((g, idx) => (
                    <div key={g.city} className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-xs font-bold text-emerald-700">
                        {idx + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-medium text-slate-800">
                            {g.city}
                          </p>
                          <p className="shrink-0 text-xs font-semibold text-slate-600">
                            {g.visitors.toLocaleString('es-MX')}
                          </p>
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <Progress
                            value={g.pct}
                            className="h-1.5 bg-slate-100"
                          />
                          <span className="shrink-0 text-[10px] text-muted-foreground">
                            {g.pct}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Device breakdown donut */}
            <motion.div {...fadeUp(0.15)}>
              <Card className="h-full border-slate-200/70 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Smartphone className="h-4 w-4 text-emerald-600" />
                    Dispositivos de los visitantes
                  </CardTitle>
                  <CardDescription>
                    Desde dónde acceden a tus tarjetas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-center">
                    <div className="h-[200px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={deviceData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={48}
                            outerRadius={80}
                            paddingAngle={3}
                            stroke="#fff"
                            strokeWidth={2}
                          >
                            {deviceData.map((entry, idx) => (
                              <Cell key={`d-cell-${idx}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={TOOLTIP_STYLE}
                            labelStyle={TOOLTIP_LABEL_STYLE}
                            formatter={(value: number, name: string) => [`${value}%`, name]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2.5">
                      {deviceData.map(d => {
                        const Icon =
                          d.name === 'Móvil'
                            ? Smartphone
                            : d.name === 'Escritorio'
                            ? Monitor
                            : Tablet;
                        return (
                          <div
                            key={d.name}
                            className="flex items-center justify-between rounded-lg border border-slate-100 bg-muted/30 px-3 py-2"
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className="inline-block h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: d.color }}
                              />
                              <Icon className="h-4 w-4 text-slate-600" />
                              <span className="text-sm font-medium text-slate-700">
                                {d.name}
                              </span>
                            </div>
                            <span className="text-sm font-bold text-slate-900">
                              {d.value}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </section>

          {/* ---------- Resumen ejecutivo ---------- */}
          <motion.div {...fadeUp(0.1)}>
            <Card className="border-0 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-md">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold">Resumen ejecutivo</h3>
                      <p className="mt-0.5 text-sm text-emerald-50">
                        Has recibido{' '}
                        <span className="font-bold text-white">
                          {totalViews.toLocaleString('es-MX')}
                        </span>{' '}
                        visitas y{' '}
                        <span className="font-bold text-white">
                          {totalScans.toLocaleString('es-MX')}
                        </span>{' '}
                        escaneos QR en total.
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    className="bg-white text-emerald-700 hover:bg-emerald-50"
                    onClick={handleExport}
                  >
                    <Download className="h-4 w-4" />
                    Descargar reporte
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
