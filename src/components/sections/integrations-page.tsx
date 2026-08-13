'use client';

/**
 * integrations-page.tsx — Mercado de integraciones (Task 14-a)
 *
 * Características:
 *  - Hero con gradiente esmeralda + oro
 *  - Filtro por categoría (Tabs) y búsqueda por nombre
 *  - Grid de tarjetas de integración: icono, nombre, descripción,
 *    badge de estado (Disponible/Próximamente/Premium), features,
 *    botón Conectar + Documentación
 *  - Dialog de setup con pasos numerados
 *  - CTA "¿No encuentras tu integración?"
 *  - Footer sticky
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  ArrowLeft, ArrowRight, Search, Plug, Check, Clock, Crown,
  ExternalLink, Zap, X, Sparkles, LifeBuoy, ShieldCheck,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { FTPLogo } from '@/components/ftp-logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  INTEGRATIONS, INTEGRATION_CATEGORIES,
  type Integration,
} from '@/lib/integrations-data';

type CategoryId = (typeof INTEGRATION_CATEGORIES)[number]['id'];

// ============================ Helpers ============================
const STATUS_META: Record<
  Integration['status'],
  { label: string; icon: typeof Check; classes: string; ring: string }
> = {
  available: {
    label: 'Disponible',
    icon: Check,
    classes: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
    ring: 'ring-emerald-200 dark:ring-emerald-800',
  },
  coming_soon: {
    label: 'Próximamente',
    icon: Clock,
    classes: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
    ring: 'ring-amber-200 dark:ring-amber-800',
  },
  premium: {
    label: 'Premium',
    icon: Crown,
    classes: 'bg-gradient-to-r from-amber-200 to-amber-100 text-amber-800 ring-1 ring-amber-300 dark:from-amber-900/60 dark:to-amber-800/60 dark:text-amber-200 dark:ring-amber-700',
    ring: 'ring-amber-300 dark:ring-amber-700',
  },
};

const CATEGORY_COLOR_CLASSES: Record<string, string> = {
  pago: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
  comunicacion: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300',
  calendario: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
  analytics: 'bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300',
  social: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
  productividad: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
  marketing: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
};

const CATEGORY_LABEL: Record<string, string> = {
  pago: 'Pago',
  comunicacion: 'Comunicación',
  calendario: 'Calendario',
  analytics: 'Analytics',
  social: 'Social',
  productividad: 'Productividad',
  marketing: 'Marketing',
};

// ============================ Subcomponents ============================

function StatusBadge({ status }: { status: Integration['status'] }) {
  const meta = STATUS_META[status];
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1',
        meta.classes,
        meta.ring
      )}
    >
      <Icon className="h-3 w-3" />
      {meta.label}
    </span>
  );
}

function IntegrationIcon({
  integration,
  size = 'md',
}: {
  integration: Integration;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClass =
    size === 'lg' ? 'h-16 w-16 text-3xl' :
    size === 'sm' ? 'h-9 w-9 text-base' :
    'h-12 w-12 text-xl';
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-2xl text-white shadow-md ring-1 ring-black/5',
        sizeClass
      )}
      style={{
        background: `linear-gradient(135deg, ${integration.color}, ${integration.color}dd)`,
      }}
      aria-hidden
    >
      <span className="drop-shadow-sm">{integration.icon}</span>
    </div>
  );
}

function IntegrationCard({
  integration,
  onConnect,
}: {
  integration: Integration;
  onConnect: (i: Integration) => void;
}) {
  const status = integration.status;
  const isDisabled = status !== 'available';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.25 }}
      whileHover={{ y: -4 }}
    >
      <Card
        className={cn(
          'group relative flex h-full flex-col overflow-hidden border-slate-200/80 shadow-sm transition-all hover:shadow-md dark:border-slate-800',
          integration.popular && 'ring-2 ring-amber-300/70 dark:ring-amber-700/60'
        )}
      >
        {/* Glow on hover */}
        <div
          className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-20"
          style={{ background: integration.color }}
        />

        <CardContent className="flex flex-1 flex-col gap-3 p-5">
          {/* Header: icon + name + popular + status */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <IntegrationIcon integration={integration} />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    {integration.name}
                  </h3>
                  {integration.popular && (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:ring-amber-800">
                      <Sparkles className="h-2.5 w-2.5" />
                      Popular
                    </span>
                  )}
                </div>
                <span className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-medium text-slate-400">
                  <span
                    className={cn(
                      'rounded px-1.5 py-0.5 font-semibold',
                      CATEGORY_COLOR_CLASSES[integration.category]
                    )}
                  >
                    {CATEGORY_LABEL[integration.category]}
                  </span>
                </span>
              </div>
            </div>
            <StatusBadge status={status} />
          </div>

          {/* Description (2 lines) */}
          <p className="line-clamp-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            {integration.description}
          </p>

          {/* Features */}
          <ul className="space-y-1">
            {integration.features.slice(0, 4).map((f, i) => (
              <li
                key={i}
                className="flex items-start gap-1.5 text-[11px] text-slate-600 dark:text-slate-300"
              >
                <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span className="leading-snug">{f}</span>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="mt-auto flex items-center gap-2 pt-2">
            <Button
              size="sm"
              className={cn(
                'flex-1 gap-1.5 text-xs',
                isDisabled
                  ? 'bg-slate-200 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-800'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              )}
              onClick={() => onConnect(integration)}
              disabled={isDisabled}
            >
              {isDisabled ? (
                <>
                  <Clock className="h-3.5 w-3.5" />
                  No disponible
                </>
              ) : (
                <>
                  <Plug className="h-3.5 w-3.5" />
                  Conectar
                </>
              )}
            </Button>
            {integration.docsUrl && (
              <Button
                size="sm"
                variant="outline"
                className="gap-1 text-xs"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.open(integration.docsUrl, '_blank', 'noopener,noreferrer');
                  }
                }}
                aria-label={`Documentación de ${integration.name}`}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Docs</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function SetupDialog({
  integration,
  open,
  onOpenChange,
}: {
  integration: Integration | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  if (!integration) return null;

  const handleConnect = () => {
    toast.success('Integración conectada', {
      description: `${integration.name} está listo para usarse en tus tarjetas.`,
      icon: <Plug className="h-4 w-4" />,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-hidden p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Configurar {integration.name}</DialogTitle>
          <DialogDescription>
            Pasos para conectar {integration.name} con FTP Digital Plus.
          </DialogDescription>
        </DialogHeader>

        {/* Header */}
        <div className="relative overflow-hidden px-6 py-5 text-white">
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${integration.color}, ${integration.color}cc)`,
            }}
          />
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
          <div className="relative flex items-start justify-between gap-3">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-3xl backdrop-blur-sm ring-1 ring-white/30">
                {integration.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold tracking-tight">
                    {integration.name}
                  </h2>
                  <StatusBadge status={integration.status} />
                </div>
                <p className="mt-1 max-w-md text-xs text-white/85">
                  {integration.description}
                </p>
              </div>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-white hover:bg-white/15 hover:text-white"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Body */}
        <div className="max-h-[55vh] overflow-y-auto px-6 py-5 custom-scrollbar">
          {/* Features */}
          <div className="mb-5">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Qué incluye
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {integration.features.map((f, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 rounded-lg border border-slate-200/70 bg-slate-50/50 p-2.5 dark:border-slate-800 dark:bg-slate-900/40"
                >
                  <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
                    <Check className="h-2.5 w-2.5 text-emerald-700 dark:text-emerald-400" />
                  </div>
                  <span className="text-xs text-slate-700 dark:text-slate-200">
                    {f}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Separator className="mb-5" />

          {/* Setup steps */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Pasos para configurar
              </p>
              <span className="text-[10px] font-medium text-muted-foreground">
                {integration.setupSteps.length} pasos
              </span>
            </div>
            <ol className="space-y-2.5">
              {integration.setupSteps.map((step, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.2 }}
                  className="flex gap-3"
                >
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-[11px] font-bold text-white shadow-sm"
                  >
                    {i + 1}
                  </span>
                  <p className="pt-0.5 text-xs leading-relaxed text-slate-700 dark:text-slate-200">
                    {step}
                  </p>
                </motion.li>
              ))}
            </ol>
          </div>

          {/* Security note */}
          <div className="mt-5 flex items-start gap-2 rounded-lg border border-emerald-200/70 bg-emerald-50/60 p-3 dark:border-emerald-800/60 dark:bg-emerald-950/30">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <p className="text-[11px] leading-relaxed text-emerald-800 dark:text-emerald-200">
              FTP Digital Plus nunca almacena tus credenciales privadas en texto plano.
              Toda conexión está cifrada de extremo a extremo.
            </p>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="gap-2 border-t border-slate-200 bg-slate-50/60 px-6 py-3 dark:border-slate-800 dark:bg-slate-900/40 sm:justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={handleConnect}
            className="gap-1.5 bg-emerald-600 text-xs hover:bg-emerald-700"
          >
            <Plug className="h-3.5 w-3.5" />
            Conectar ahora
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================ Main ============================
export function IntegrationsPage() {
  const navigate = useAppStore(s => s.navigate);
  const [tab, setTab] = useState<CategoryId>('todas');
  const [search, setSearch] = useState('');
  const [setupIntegration, setSetupIntegration] = useState<Integration | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return INTEGRATIONS.filter((i) => {
      if (tab !== 'todas' && i.category !== tab) return false;
      if (q && !i.name.toLowerCase().includes(q) && !i.description.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [tab, search]);

  const stats = useMemo(() => {
    const available = INTEGRATIONS.filter(i => i.status === 'available').length;
    const comingSoon = INTEGRATIONS.filter(i => i.status === 'coming_soon').length;
    const premium = INTEGRATIONS.filter(i => i.status === 'premium').length;
    return { total: INTEGRATIONS.length, available, comingSoon, premium };
  }, []);

  const handleConnect = (integration: Integration) => {
    setSetupIntegration(integration);
  };

  const handleRequestIntegration = () => {
    toast.success('Solicitud enviada', {
      description: 'Nuestro equipo revisará tu solicitud de integración.',
      icon: <LifeBuoy className="h-4 w-4" />,
    });
    setTimeout(() => navigate('support'), 800);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-emerald-50/40">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-emerald-100/60 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                navigate('dashboard');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              aria-label="Volver al panel"
              className="text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
            >
              <ArrowLeft className="size-5" />
            </Button>
            <FTPLogo variant="icon" className="hidden size-8 sm:block" />
            <div>
              <h1 className="text-base font-bold text-slate-900 sm:text-lg">
                Integraciones
              </h1>
              <p className="hidden text-xs text-slate-500 sm:block">
                Conecta tus herramientas favoritas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.dispatchEvent(new CustomEvent('ftp:open-keyboard-shortcuts'))}
              className="hidden gap-1.5 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 sm:flex"
            >
              <span className="text-xs font-bold">?</span>
              <span className="text-xs">Atajos</span>
            </Button>
            <ThemeToggle className="text-slate-600 hover:bg-emerald-50 hover:text-emerald-700" />
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto max-w-7xl">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="relative mb-6 overflow-hidden rounded-2xl p-6 text-white shadow-xl sm:mb-8 sm:p-8"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-700 to-amber-600" />
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-amber-400/30 blur-3xl" />
            <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-emerald-400/30 blur-3xl" />
            <div className="relative">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur ring-1 ring-white/20">
                <Plug className="h-3.5 w-3.5" />
                {stats.total} integraciones · {stats.available} disponibles
              </div>
              <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
                Integraciones
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-emerald-50 sm:text-base">
                Conecta tus herramientas favoritas con FTP Digital Plus y potencia
                tus tarjetas digitales con pagos, automatizaciones, analítica y más.
              </p>

              {/* Stats inline */}
              <div className="mt-5 flex flex-wrap gap-3">
                <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-xs backdrop-blur ring-1 ring-white/15">
                  <Check className="h-3.5 w-3.5 text-emerald-200" />
                  <span className="font-semibold">{stats.available}</span>
                  <span className="text-emerald-50/80">Disponibles</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-xs backdrop-blur ring-1 ring-white/15">
                  <Clock className="h-3.5 w-3.5 text-amber-200" />
                  <span className="font-semibold">{stats.comingSoon}</span>
                  <span className="text-emerald-50/80">Próximamente</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-xs backdrop-blur ring-1 ring-white/15">
                  <Crown className="h-3.5 w-3.5 text-amber-200" />
                  <span className="font-semibold">{stats.premium}</span>
                  <span className="text-emerald-50/80">Premium</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Search + tabs */}
          <Card className="mb-5 border-slate-200 shadow-sm">
            <CardContent className="flex flex-col gap-3 p-4 sm:p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <Tabs
                  value={tab}
                  onValueChange={(v) => setTab(v as CategoryId)}
                >
                  <TabsList className="grid grid-cols-4 gap-1 bg-emerald-50/60 sm:grid-cols-8">
                    {INTEGRATION_CATEGORIES.map((c) => (
                      <TabsTrigger
                        key={c.id}
                        value={c.id}
                        className="text-[11px] data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm"
                      >
                        {c.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>

                <div className="relative w-full sm:w-72">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar integración..."
                    className="h-9 pl-8 pr-8 text-sm"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:bg-muted"
                      aria-label="Limpiar búsqueda"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results count */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Mostrando{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {filtered.length}
              </span>{' '}
              de {INTEGRATIONS.length} integraciones
            </p>
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                  <Search className="h-5 w-5 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  No encontramos integraciones
                </p>
                <p className="text-xs text-muted-foreground">
                  Prueba con otra búsqueda o categoría
                </p>
              </CardContent>
            </Card>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              <AnimatePresence mode="popLayout">
                {filtered.map((integration) => (
                  <IntegrationCard
                    key={integration.id}
                    integration={integration}
                    onConnect={handleConnect}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* CTA — request integration */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35 }}
            className="mt-8 overflow-hidden rounded-2xl border border-amber-200/70 bg-gradient-to-br from-amber-50 via-white to-emerald-50/40 p-6 shadow-sm dark:border-amber-800/60 dark:from-amber-950/40 dark:to-emerald-950/30 sm:p-8"
          >
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-sm">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                    ¿No encuentras tu integración?
                  </h3>
                  <p className="mt-1 max-w-md text-xs text-slate-600 dark:text-slate-300">
                    Solicítala y nuestro equipo la evaluará para incluirla en
                    nuestro marketplace de integraciones.
                  </p>
                </div>
              </div>
              <Button
                onClick={handleRequestIntegration}
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
              >
                Solicitar integración
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer sticky */}
      <footer className="mt-auto border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <FTPLogo variant="icon" className="size-7" />
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} FTP Digital Plus — Integraciones
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-slate-500">
            <button
              onClick={() => navigate('terms')}
              className="transition-colors hover:text-emerald-700"
            >
              Términos
            </button>
            <span className="text-slate-300">·</span>
            <button
              onClick={() => navigate('privacy')}
              className="transition-colors hover:text-emerald-700"
            >
              Privacidad
            </button>
            <span className="text-slate-300">·</span>
            <button
              onClick={() => {
                navigate('help');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="transition-colors hover:text-emerald-700"
            >
              Ayuda
            </button>
          </div>
        </div>
      </footer>

      {/* Setup Dialog */}
      <SetupDialog
        integration={setupIntegration}
        open={!!setupIntegration}
        onOpenChange={(o) => { if (!o) setSetupIntegration(null); }}
      />
    </div>
  );
}
