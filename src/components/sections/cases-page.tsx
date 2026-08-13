'use client';

/**
 * cases-page.tsx — Casos de Éxito / Case Studies page (Task 11-a)
 *
 * Características:
 *  - Hero con gradiente esmeralda → oro + subtítulo
 *  - Stats banner (4 métricas)
 *  - Filter bar: tabs por industria + select de orden
 *  - Featured case destacado
 *  - Grid responsivo (1/2/3 cols) de cards
 *  - Dialog con caso completo
 *  - CTA final
 *  - Footer sticky
 */

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  ArrowLeft,
  TrendingUp,
  Quote,
  Star,
  ArrowRight,
  Sparkles,
  Clock,
  Target,
  Lightbulb,
  BarChart3,
  Building2,
  type LucideIcon,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import {
  SUCCESS_CASES,
  INDUSTRY_LABELS,
  type CaseStudy,
} from '@/lib/cases-data';
import { cn } from '@/lib/utils';
import { FTPLogo } from '@/components/ftp-logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

type IndustryFilter = 'todos' | CaseStudy['industry'];
type SortBy = 'recientes' | 'mejores';

const PLAN_BADGE: Record<CaseStudy['plan'], { label: string; className: string }> = {
  basico: { label: 'Plan Básico',  className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  pro:    { label: 'Plan Pro',     className: 'bg-amber-100 text-amber-700 border-amber-200' },
};

function fadeUpProps(delay = 0) {
  return {
    initial: { opacity: 0, y: 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-80px' },
    transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
  };
}

function getImprovementValue(c: CaseStudy): number {
  // Saca el primer número de la primera mejora (p.ej. "+45% en 3 meses" → 45)
  const first = c.results[0]?.improvement ?? '';
  const match = first.match(/-?\+?(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

/* ------------------------------------------------------------------ */
/*  Hero                                                                */
/* ------------------------------------------------------------------ */

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-600 to-amber-500 py-16 sm:py-24">
      {/* Blobs decorativos */}
      <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-amber-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 size-96 rounded-full bg-emerald-400/30 blur-3xl" />
      {/* Patrón sutil */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <Badge className="border-amber-200 bg-amber-100/90 text-amber-800 backdrop-blur">
            <Sparkles className="mr-1 size-3.5" />
            Historias reales
          </Badge>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-white drop-shadow-sm sm:text-5xl lg:text-6xl">
            Casos de Éxito
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-emerald-50 sm:text-lg lg:text-xl">
            Historias reales de empresas que transformaron su presencia digital con FTP Digital Plus.
            Resultados medibles, clientes satisfechos y crecimiento sostenido.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Stats banner                                                        */
/* ------------------------------------------------------------------ */

function StatsBanner() {
  const stats = [
    { value: '500+', label: 'clientes activos', icon: Building2 },
    { value: '85%', label: 'satisfacción', icon: Star },
    { value: '3.2x', label: 'crecimiento promedio', icon: TrendingUp },
    { value: '12', label: 'sectores diferentes', icon: Target },
  ];
  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                {...fadeUpProps(i * 0.05)}
                className="flex flex-col items-center text-center"
              >
                <div className="mb-2 flex size-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <Icon className="size-5" />
                </div>
                <p className="text-3xl font-bold tabular-nums text-slate-900 sm:text-4xl">
                  {s.value}
                </p>
                <p className="mt-1 text-xs text-slate-500 sm:text-sm">{s.label}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Featured case                                                       */
/* ------------------------------------------------------------------ */

function FeaturedCase({ caseItem, onView }: { caseItem: CaseStudy; onView: (c: CaseStudy) => void }) {
  const planBadge = PLAN_BADGE[caseItem.plan];
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <motion.div
        {...fadeUpProps()}
        className="text-center"
      >
        <Badge className="border-amber-200 bg-amber-50 text-amber-700">
          <Star className="mr-1 size-3.5 fill-amber-400 text-amber-500" />
          Caso destacado
        </Badge>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Una transformación completa
        </h2>
        <p className="mt-3 text-slate-600">
          Conoce cómo {caseItem.clientName} revolucionó su presencia digital.
        </p>
      </motion.div>

      <motion.div {...fadeUpProps(0.1)}>
        <Card className="relative mt-10 overflow-hidden border-0 shadow-2xl shadow-emerald-900/10">
          {/* Fondo gradiente */}
          <div
            className={cn(
              'absolute inset-0 bg-gradient-to-br opacity-95',
              caseItem.image,
            )}
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-black/10"
            aria-hidden
          />

          <CardContent className="relative grid gap-6 p-6 text-white sm:p-10 lg:grid-cols-2 lg:gap-10 lg:p-12">
            {/* Left: info */}
            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="border-0 bg-white/20 text-white backdrop-blur">
                  {caseItem.clientType}
                </Badge>
                <Badge className="border-0 bg-white/20 text-white backdrop-blur">
                  {INDUSTRY_LABELS[caseItem.industry]}
                </Badge>
                <Badge className={cn('border-0', planBadge.className)}>
                  {planBadge.label}
                </Badge>
              </div>

              <h3 className="mt-4 text-2xl font-bold sm:text-3xl">{caseItem.clientName}</h3>
              <p className="mt-2 text-sm text-white/90 sm:text-base">{caseItem.challenge}</p>

              {/* Testimonial */}
              <div className="mt-6 rounded-xl bg-white/10 p-4 backdrop-blur-md ring-1 ring-white/20">
                <Quote className="size-6 text-white/70" />
                <p className="mt-2 text-sm italic text-white/95 sm:text-base">
                  “{caseItem.testimonial.quote}”
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex size-9 items-center justify-center rounded-full bg-white/20 text-sm font-bold backdrop-blur">
                    {caseItem.testimonial.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{caseItem.testimonial.author}</p>
                    <p className="text-xs text-white/80">{caseItem.testimonial.role}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button
                  onClick={() => onView(caseItem)}
                  className="bg-white text-emerald-700 hover:bg-emerald-50"
                >
                  Ver caso completo
                  <ArrowRight className="ml-1 size-4" />
                </Button>
                <span className="flex items-center gap-1.5 text-xs text-white/80">
                  <Clock className="size-3.5" />
                  Duración: {caseItem.duration}
                </span>
              </div>
            </div>

            {/* Right: key results */}
            <div className="flex flex-col">
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/80">
                Resultados clave
              </h4>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {caseItem.results.map(r => (
                  <div
                    key={r.metric}
                    className="rounded-xl bg-white/10 p-4 backdrop-blur-md ring-1 ring-white/20"
                  >
                    <p className="text-2xl font-bold tabular-nums sm:text-3xl">{r.value}</p>
                    <p className="mt-1 text-xs text-white/80 sm:text-sm">{r.metric}</p>
                    <p className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-emerald-500/30 px-2 py-0.5 text-[10px] font-medium text-emerald-50">
                      <TrendingUp className="size-3" />
                      {r.improvement}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Filter bar                                                          */
/* ------------------------------------------------------------------ */

interface FilterBarProps {
  industry: IndustryFilter;
  onIndustry: (i: IndustryFilter) => void;
  sortBy: SortBy;
  onSortBy: (s: SortBy) => void;
  industries: { id: IndustryFilter; label: string }[];
}

function FilterBar({ industry, onIndustry, sortBy, onSortBy, industries }: FilterBarProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs
          value={industry}
          onValueChange={v => onIndustry(v as IndustryFilter)}
          className="w-full lg:w-auto"
        >
          <TabsList className="flex w-full flex-wrap justify-start gap-1 bg-emerald-50/60 lg:w-auto">
            {industries.map(i => (
              <TabsTrigger
                key={i.id}
                value={i.id}
                className="data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm"
              >
                {i.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <span className="hidden text-sm text-slate-500 sm:inline">Ordenar:</span>
          <Select value={sortBy} onValueChange={v => onSortBy(v as SortBy)}>
            <SelectTrigger size="sm" className="h-9 min-w-[180px] border-slate-200 bg-white text-sm">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recientes">Recientes</SelectItem>
              <SelectItem value="mejores">Mejores resultados</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Case card                                                           */
/* ------------------------------------------------------------------ */

function CaseCard({ caseItem, onView }: { caseItem: CaseStudy; onView: (c: CaseStudy) => void }) {
  const planBadge = PLAN_BADGE[caseItem.plan];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="group flex h-full flex-col overflow-hidden border-slate-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-100">
        {/* Header con gradiente + avatar */}
        <div className={cn('relative h-28 bg-gradient-to-br', caseItem.image)}>
          <div className="absolute inset-0 bg-black/5" />
          <div className="absolute left-4 top-4 flex gap-2">
            <Badge className="border-0 bg-white/25 text-white backdrop-blur">
              {INDUSTRY_LABELS[caseItem.industry]}
            </Badge>
          </div>
          <div className="absolute -bottom-6 left-4 flex size-14 items-center justify-center rounded-xl bg-white shadow-md ring-2 ring-white">
            <div className="flex size-full items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 text-lg font-bold text-white">
              {caseItem.testimonial.avatar}
            </div>
          </div>
          <div className="absolute right-3 top-3">
            <Badge className={cn('border-0', planBadge.className)}>
              {planBadge.label}
            </Badge>
          </div>
        </div>

        <CardContent className="flex flex-1 flex-col gap-3 p-5 pt-8">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{caseItem.clientName}</h3>
            <p className="text-xs text-slate-500">{caseItem.clientType} · {caseItem.duration}</p>
          </div>

          {/* Challenge summary */}
          <p className="line-clamp-2 text-sm text-slate-600">
            <span className="font-medium text-slate-700">Reto:</span>{' '}
            {caseItem.challenge.split('.')[0]}.
          </p>

          {/* Key results (3) */}
          <div className="flex flex-col gap-2">
            {caseItem.results.slice(0, 3).map(r => (
              <div key={r.metric} className="flex items-center justify-between gap-2 text-sm">
                <span className="text-slate-600">{r.metric}</span>
                <span className="flex items-center gap-1.5">
                  <span className="font-semibold tabular-nums text-slate-900">{r.value}</span>
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
                    <TrendingUp className="size-3" />
                    {r.improvement}
                  </span>
                </span>
              </div>
            ))}
          </div>

          {/* Testimonial snippet */}
          <div className="mt-1 rounded-lg bg-slate-50 p-3">
            <div className="mb-1 flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'size-3',
                    i < 5 ? 'fill-amber-400 text-amber-400' : 'text-slate-300',
                  )}
                />
              ))}
            </div>
            <p className="line-clamp-2 text-xs italic text-slate-600">
              “{caseItem.testimonial.quote}”
            </p>
            <p className="mt-1 text-[10px] font-medium text-slate-500">
              — {caseItem.testimonial.author}, {caseItem.testimonial.role}
            </p>
          </div>

          {/* Tags */}
          <div className="mt-auto flex flex-wrap gap-1.5">
            {caseItem.tags.slice(0, 3).map(tag => (
              <Badge
                key={tag}
                variant="outline"
                className="border-slate-200 bg-white text-[10px] font-normal text-slate-500"
              >
                {tag}
              </Badge>
            ))}
          </div>

          <Button
            variant="outline"
            onClick={() => onView(caseItem)}
            className="mt-2 w-full gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
          >
            Ver caso completo
            <ArrowRight className="size-4" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Case study dialog                                                   */
/* ------------------------------------------------------------------ */

function CaseDialog({
  caseItem,
  open,
  onOpenChange,
}: {
  caseItem: CaseStudy | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useAppStore(s => s.navigate);
  if (!caseItem) return null;
  const planBadge = PLAN_BADGE[caseItem.plan];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="max-h-[90vh] max-w-3xl overflow-hidden p-0 sm:max-w-3xl"
      >
        <DialogTitle className="sr-only">
          Caso de éxito: {caseItem.clientName}
        </DialogTitle>
        <ScrollArea className="max-h-[90vh]">
          <div>
            {/* Hero del caso */}
            <div className={cn('relative h-44 bg-gradient-to-br p-6 sm:h-56', caseItem.image)}>
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative flex h-full flex-col justify-end text-white">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="border-0 bg-white/25 text-white backdrop-blur">
                    {caseItem.clientType}
                  </Badge>
                  <Badge className="border-0 bg-white/25 text-white backdrop-blur">
                    {INDUSTRY_LABELS[caseItem.industry]}
                  </Badge>
                  <Badge className={cn('border-0', planBadge.className)}>
                    {planBadge.label}
                  </Badge>
                </div>
                <h2 className="mt-3 text-2xl font-bold sm:text-3xl">{caseItem.clientName}</h2>
                <p className="mt-1 text-sm text-white/90">
                  <Clock className="mr-1 inline size-3.5" />
                  Duración del proyecto: {caseItem.duration}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-6 p-6 sm:p-8">
              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {caseItem.tags.map(tag => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="border-emerald-200 bg-emerald-50 text-xs font-normal text-emerald-700"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Reto */}
              <section>
                <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                  <span className="flex size-7 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                    <Target className="size-4" />
                  </span>
                  El Reto
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{caseItem.challenge}</p>
              </section>

              <Separator />

              {/* Solución */}
              <section>
                <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                  <span className="flex size-7 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                    <Lightbulb className="size-4" />
                  </span>
                  La Solución
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{caseItem.solution}</p>
              </section>

              <Separator />

              {/* Resultados */}
              <section>
                <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                  <span className="flex size-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <BarChart3 className="size-4" />
                  </span>
                  Resultados
                </h3>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {caseItem.results.map(r => (
                    <div
                      key={r.metric}
                      className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 text-center"
                    >
                      <p className="text-2xl font-bold tabular-nums text-emerald-700">{r.value}</p>
                      <p className="mt-1 text-xs text-slate-600">{r.metric}</p>
                      <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                        <TrendingUp className="size-3" />
                        {r.improvement}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <Separator />

              {/* Testimonio */}
              <section className="rounded-xl bg-gradient-to-br from-emerald-50 to-amber-50 p-5">
                <Quote className="size-8 text-emerald-300" />
                <p className="mt-2 text-base italic text-slate-800">
                  “{caseItem.testimonial.quote}”
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-base font-bold text-white shadow-md">
                    {caseItem.testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{caseItem.testimonial.author}</p>
                    <p className="text-sm text-slate-600">{caseItem.testimonial.role}</p>
                  </div>
                </div>
              </section>

              {/* CTA */}
              <div className="flex flex-col items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 text-center sm:flex-row sm:justify-between sm:text-left">
                <div>
                  <p className="font-semibold text-slate-900">
                    ¿Quieres resultados similares?
                  </p>
                  <p className="text-sm text-slate-600">
                    Habla con nuestro equipo y descubre el plan ideal para tu negocio.
                  </p>
                </div>
                <Button
                  onClick={() => {
                    onOpenChange(false);
                    navigate('pricing');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    toast.success('Te llevamos a los planes para que elijas el ideal');
                  }}
                  className="gap-1.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-700 hover:to-emerald-600"
                >
                  Quiero resultados similares
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/*  Final CTA                                                           */
/* ------------------------------------------------------------------ */

function FinalCTA() {
  const navigate = useAppStore(s => s.navigate);
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <motion.div
        {...fadeUpProps()}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-emerald-600 to-amber-500 px-6 py-12 text-center shadow-2xl shadow-emerald-900/20 sm:px-12 sm:py-16"
      >
        <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-amber-300/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-20 size-80 rounded-full bg-emerald-400/30 blur-3xl" />

        <div className="relative mx-auto max-w-2xl">
          <Badge className="border-amber-200 bg-amber-100/90 text-amber-800 backdrop-blur">
            <Sparkles className="mr-1 size-3.5" />
            Tu caso de éxito empieza hoy
          </Badge>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            ¿Listo para ser nuestro próximo caso de éxito?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-emerald-50 sm:text-lg">
            Únete a más de 500 empresas que ya transformaron su presencia digital con FTP Digital Plus.
            Resultados medibles, soporte humano y herramientas que crecen contigo.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              onClick={() => {
                navigate('login');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="bg-white text-emerald-700 shadow-lg hover:bg-emerald-50"
            >
              Comenzar ahora
              <ArrowRight className="ml-1 size-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                navigate('pricing');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="border-white/40 bg-white/10 text-white backdrop-blur hover:bg-white/20"
            >
              Ver planes
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export function CasesPage() {
  const navigate = useAppStore(s => s.navigate);
  const [industry, setIndustry] = useState<IndustryFilter>('todos');
  const [sortBy, setSortBy] = useState<SortBy>('recientes');
  const [selected, setSelected] = useState<CaseStudy | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const industries = useMemo<{ id: IndustryFilter; label: string }[]>(
    () => [
      { id: 'todos', label: 'Todos' },
      { id: 'restaurantes', label: INDUSTRY_LABELS.restaurantes },
      { id: 'salud', label: INDUSTRY_LABELS.salud },
      { id: 'retail', label: INDUSTRY_LABELS.retail },
      { id: 'servicios', label: INDUSTRY_LABELS.servicios },
      { id: 'legal', label: INDUSTRY_LABELS.legal },
      { id: 'bienestar', label: INDUSTRY_LABELS.bienestar },
    ],
    [],
  );

  const featured = useMemo(
    () => SUCCESS_CASES.find(c => c.featured) ?? SUCCESS_CASES[0],
    [],
  );

  const visibleCases = useMemo(() => {
    let list = SUCCESS_CASES.filter(c => c.id !== featured.id);
    if (industry !== 'todos') list = list.filter(c => c.industry === industry);
    if (sortBy === 'recientes') {
      list = [...list].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } else if (sortBy === 'mejores') {
      list = [...list].sort((a, b) => getImprovementValue(b) - getImprovementValue(a));
    }
    return list;
  }, [industry, sortBy, featured.id]);

  const handleView = (c: CaseStudy) => {
    setSelected(c);
    setDialogOpen(true);
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-emerald-100/60 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                navigate('landing');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              aria-label="Volver al inicio"
              className="text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
            >
              <ArrowLeft className="size-5" />
            </Button>
            <button
              onClick={() => {
                navigate('landing');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 transition-opacity hover:opacity-90"
              aria-label="Ir al inicio de FTP Digital Plus"
            >
              <FTPLogo variant="full" className="h-8 w-auto" />
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            <ThemeToggle className="text-slate-600 hover:bg-emerald-50 hover:text-emerald-700" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                navigate('pricing');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hidden text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 sm:inline-flex"
            >
              Ver Planes
            </Button>
            <Button
              size="sm"
              onClick={() => {
                navigate('login');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-700 hover:to-emerald-600"
            >
              Iniciar Sesión
              <ArrowRight className="ml-1 size-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Hero />
        <StatsBanner />
        <FeaturedCase caseItem={featured} onView={handleView} />

        {/* Filter + grid */}
        <section className="py-10 sm:py-14">
          <FilterBar
            industry={industry}
            onIndustry={setIndustry}
            sortBy={sortBy}
            onSortBy={setSortBy}
            industries={industries}
          />

          <div className="mx-auto mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
            <AnimatePresence mode="popLayout">
              {visibleCases.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center"
                >
                  <p className="text-base font-semibold text-slate-700">
                    No hay casos en esta industria todavía
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Prueba con otro filtro o explora todas las industrias.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIndustry('todos')}
                    className="mt-4 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  >
                    Ver todos los casos
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  layout
                  className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                >
                  {visibleCases.map(c => (
                    <CaseCard key={c.id} caseItem={c} onView={handleView} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        <FinalCTA />
      </main>

      {/* Footer sticky */}
      <footer className="mt-auto border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2 lg:col-span-2">
              <FTPLogo variant="full" className="h-9 w-auto" />
              <p className="mt-3 max-w-md text-sm text-slate-600">
                FTP Digital Plus — Agencia de Diseño Web y Marketing Digital. Creamos experiencias digitales que conectan.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Producto</h3>
              <ul className="mt-3 flex flex-col gap-2 text-sm">
                <li>
                  <button
                    onClick={() => { navigate('pricing'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="text-slate-600 transition-colors hover:text-emerald-700"
                  >
                    Planes
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => { navigate('cases'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="text-slate-600 transition-colors hover:text-emerald-700"
                  >
                    Casos de Éxito
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => { navigate('template-gallery'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="text-slate-600 transition-colors hover:text-emerald-700"
                  >
                    Plantillas
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => { navigate('blog'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="text-slate-600 transition-colors hover:text-emerald-700"
                  >
                    Blog y Recursos
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Empresa</h3>
              <ul className="mt-3 flex flex-col gap-2 text-sm">
                <li>
                  <button
                    onClick={() => { navigate('landing'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="text-slate-600 transition-colors hover:text-emerald-700"
                  >
                    Inicio
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => { navigate('login'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="text-slate-600 transition-colors hover:text-emerald-700"
                  >
                    Iniciar Sesión
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => { navigate('help'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="text-slate-600 transition-colors hover:text-emerald-700"
                  >
                    Centro de Ayuda
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <Separator className="my-6 bg-slate-200" />

          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} FTP Digital Plus — Casos de Éxito
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
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
                onClick={() => navigate('refunds')}
                className="transition-colors hover:text-emerald-700"
              >
                Reembolsos
              </button>
            </div>
          </div>
        </div>
      </footer>

      <CaseDialog caseItem={selected} open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}

export default CasesPage;
