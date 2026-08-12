'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { FTPLogo } from '@/components/ftp-logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { NotificationsPanel } from '@/components/notifications-panel';
import { PLANS, PLAN_ORDER } from '@/lib/plans';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  QrCode,
  Briefcase,
  ShoppingBag,
  CalendarDays,
  BarChart3,
  LayoutTemplate,
  ArrowRight,
  Menu,
  X,
  Star,
  Sparkles,
  Zap,
  Globe,
  CheckCircle2,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  MessageCircle,
  Mail,
  Phone,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Shared data                                                        */
/* ------------------------------------------------------------------ */

const NAV_LINKS = [
  { label: 'Inicio', target: 'inicio' },
  { label: 'Planes', target: 'planes' },
  { label: 'Características', target: 'caracteristicas' },
  { label: 'Contacto', target: 'contacto' },
];

const FEATURES = [
  {
    icon: QrCode,
    title: 'Tarjeta NFC / QR',
    description:
      'Comparte tu tarjeta con un solo toque NFC o escaneando un código QR. Compatible con cualquier smartphone.',
    accent: 'from-emerald-500 to-emerald-600',
  },
  {
    icon: Briefcase,
    title: 'Portafolio Digital',
    description:
      'Muestra tus trabajos, proyectos y artículos de blog en una galería visual atractiva y profesional.',
    accent: 'from-amber-500 to-amber-600',
  },
  {
    icon: ShoppingBag,
    title: 'Catálogo de Productos',
    description:
      'Vende más mostrando tus productos con precio, descripción y enlace directo a tu tienda.',
    accent: 'from-emerald-500 to-teal-600',
  },
  {
    icon: CalendarDays,
    title: 'Sistema de Citas',
    description:
      'Permite a tus clientes agendar citas con tu equipo, con horarios y confirmación automática.',
    accent: 'from-amber-500 to-orange-600',
  },
  {
    icon: BarChart3,
    title: 'Estadísticas',
    description:
      'Mide el rendimiento de tu tarjeta: vistas, escaneos de QR, mensajes recibidos y más.',
    accent: 'from-emerald-500 to-green-600',
  },
  {
    icon: LayoutTemplate,
    title: 'Múltiples Plantillas',
    description:
      '5 plantillas profesionales (Moderno, Clásico, Minimalista, Elegante y Dinámica) totalmente editables.',
    accent: 'from-amber-500 to-yellow-600',
  },
];

const STEPS = [
  {
    number: '01',
    title: 'Crea tu cuenta',
    description:
      'Regístrate gratis en segundos. Sin tarjeta de crédito. Comienza con el plan gratuito o elige uno de pago.',
    icon: Sparkles,
  },
  {
    number: '02',
    title: 'Personaliza tu tarjeta',
    description:
      'Elige plantilla, colores, fuentes, agrega servicios, productos, galería, testimonios y mucho más.',
    icon: LayoutTemplate,
  },
  {
    number: '03',
    title: 'Comparte y conecta',
    description:
      'Imprime tu QR, usa NFC o comparte el enlace. Recibe mensajes, citas y conecta con tus clientes.',
    icon: Zap,
  },
];

const STATS = [
  { value: '1000+', label: 'Tarjetas creadas' },
  { value: '50k+', label: 'Escaneos QR' },
  { value: '24', label: 'Funciones incluidas' },
  { value: '99.9%', label: 'Disponibilidad' },
];

const TESTIMONIALS = [
  {
    name: 'Dra. María González',
    role: 'Médico Internista',
    text: 'FTP Digital Plus transformó la manera en que mis pacientes me contactan. Las citas en línea me ahorran horas cada semana.',
    rating: 5,
    initials: 'MG',
  },
  {
    name: 'Roberto Cruz',
    role: 'Restaurantero',
    text: 'El menú digital con QR es espectacular. Mis clientes lo aman y las reservaciones aumentaron un 40% en dos meses.',
    rating: 5,
    initials: 'RC',
  },
  {
    name: 'Patricia López',
    role: 'Diseñadora Gráfica',
    text: 'Mi portafolio se ve increíble. El plan Básico me dio todo lo que necesitaba para impresionar a mis clientes.',
    rating: 5,
    initials: 'PL',
  },
];

/* ------------------------------------------------------------------ */
/*  Motion helpers                                                     */
/* ------------------------------------------------------------------ */

function fadeUpProps(delay = 0) {
  return {
    initial: { opacity: 0, y: 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-80px' },
    transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
  };
}

/* ------------------------------------------------------------------ */
/*  Header                                                             */
/* ------------------------------------------------------------------ */

function SiteHeader() {
  const navigate = useAppStore(s => s.navigate);
  const currentUser = useAppStore(s => s.currentUser);
  const [open, setOpen] = useState(false);

  const scrollTo = (id: string) => {
    setOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-emerald-100/60 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => {
            navigate('landing');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2 transition-opacity hover:opacity-90"
          aria-label="Ir al inicio de FTP Digital Plus"
        >
          <FTPLogo variant="full" className="h-9 w-auto" />
        </button>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Navegación principal">
          {NAV_LINKS.map(link => (
            <button
              key={link.target}
              onClick={() => scrollTo(link.target)}
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="hidden items-center gap-1.5 md:flex">
          <ThemeToggle className="text-slate-600 hover:bg-emerald-50 hover:text-emerald-700" />
          {currentUser && <NotificationsPanel />}
          <Button
            variant="ghost"
            onClick={() => navigate('pricing')}
            className="text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
          >
            Ver Planes
          </Button>
          <Button
            onClick={() => navigate('login')}
            className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-sm hover:from-emerald-700 hover:to-emerald-600"
          >
            Iniciar Sesión
            <ArrowRight className="ml-1 size-4" />
          </Button>
        </div>

        {/* Mobile controls: theme toggle + notifications + menu toggle */}
        <div className="flex items-center gap-0.5 md:hidden">
          <ThemeToggle className="text-slate-600 hover:bg-emerald-50 hover:text-emerald-700" />
          {currentUser && <NotificationsPanel />}
          <button
            onClick={() => setOpen(v => !v)}
            className="inline-flex size-10 items-center justify-center rounded-md text-slate-700 hover:bg-emerald-50"
            aria-label="Abrir menú"
            aria-expanded={open}
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="border-t border-emerald-100 bg-white md:hidden"
        >
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3" aria-label="Navegación móvil">
            {NAV_LINKS.map(link => (
              <button
                key={link.target}
                onClick={() => scrollTo(link.target)}
                className="rounded-md px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
              >
                {link.label}
              </button>
            ))}
            <div className="mt-2 flex flex-col gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  navigate('pricing');
                }}
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              >
                Ver Planes
              </Button>
              <Button
                onClick={() => {
                  setOpen(false);
                  navigate('login');
                }}
                className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-700 hover:to-emerald-600"
              >
                Iniciar Sesión
              </Button>
            </div>
          </nav>
        </motion.div>
      )}
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero                                                               */
/* ------------------------------------------------------------------ */

function Hero() {
  const navigate = useAppStore(s => s.navigate);
  const fade = fadeUpProps();

  return (
    <section
      id="inicio"
      className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-800 text-white"
    >
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 size-96 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="absolute -bottom-32 right-0 size-[28rem] rounded-full bg-emerald-400/30 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 size-72 -translate-x-1/2 rounded-full bg-teal-300/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:py-28">
        {/* Left: copy */}
        <motion.div {...fade} className="flex flex-col items-start gap-6">
          <Badge className="border-amber-300/40 bg-amber-400/15 text-amber-100 backdrop-blur-sm">
            <Sparkles className="mr-1 size-3.5" />
            Plataforma #1 en tarjetas digitales
          </Badge>

          <h1 className="text-balance text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Tarjetas de Presentación Digitales que{' '}
            <span className="bg-gradient-to-r from-amber-300 to-amber-400 bg-clip-text text-transparent">
              Impresionan
            </span>
          </h1>

          <p className="max-w-xl text-pretty text-lg text-emerald-50/90">
            Crea tu tarjeta digital profesional con QR, NFC, portafolio, catálogo
            de productos, sistema de citas y mucho más. Todo en una sola
            plataforma, lista para compartir.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              onClick={() => navigate('login')}
              className="bg-amber-400 text-amber-950 shadow-lg shadow-amber-500/25 hover:bg-amber-300"
            >
              Crear mi Tarjeta Gratis
              <ArrowRight className="ml-1 size-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('pricing')}
              className="border-white/40 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
            >
              Ver Planes
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-sm text-emerald-50/80">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-amber-300" /> Sin tarjeta de crédito
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-amber-300" /> Listo en 5 minutos
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-amber-300" /> 100% en español
            </span>
          </div>
        </motion.div>

        {/* Right: floating card mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full max-w-md"
        >
          <FloatingCardPreview />
        </motion.div>
      </div>

      {/* Bottom wave */}
      <div className="relative">
        <svg
          viewBox="0 0 1440 80"
          className="block h-12 w-full sm:h-16"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0,32 C360,80 1080,80 1440,32 L1440,80 L0,80 Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
}

function FloatingCardPreview() {
  return (
    <div className="relative">
      {/* Glow */}
      <div className="absolute -inset-4 rounded-3xl bg-amber-300/20 blur-2xl" />

      {/* Main card */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="relative rounded-2xl border border-white/60 bg-white p-6 shadow-2xl shadow-emerald-900/30"
      >
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-base font-bold text-white shadow-md">
              MG
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Dra. María González</p>
              <p className="text-xs text-slate-500">Médico Internista</p>
            </div>
          </div>
          <div className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
            BÁSICO
          </div>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-slate-600">
          Médico cirujano especialista en medicina interna. Cédula profesional
          1234567. Atención con cita previa.
        </p>

        {/* Quick actions */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { icon: MessageCircle, label: 'WhatsApp', color: 'text-emerald-600 bg-emerald-50' },
            { icon: Phone, label: 'Llamar', color: 'text-amber-600 bg-amber-50' },
            { icon: CalendarDays, label: 'Cita', color: 'text-emerald-600 bg-emerald-50' },
          ].map(item => (
            <div
              key={item.label}
              className={cn(
                'flex flex-col items-center gap-1 rounded-lg py-2 text-[10px] font-medium',
                item.color,
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </div>
          ))}
        </div>

        {/* QR */}
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
          <div className="grid size-14 shrink-0 grid-cols-5 grid-rows-5 gap-px rounded-md bg-white p-1">
            {Array.from({ length: 25 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'rounded-[1px]',
                  [0, 1, 2, 5, 7, 10, 12, 14, 17, 19, 22, 24, 3, 9, 11, 15, 21, 23, 6, 18].includes(i)
                    ? 'bg-emerald-700'
                    : 'bg-transparent',
                )}
              />
            ))}
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-slate-900">Escanea mi QR</p>
            <p className="text-[10px] text-slate-500">Permanente · Sin vencimiento</p>
          </div>
        </div>
      </motion.div>

      {/* Floating badges */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        className="absolute -left-6 top-8 hidden rounded-xl border border-slate-100 bg-white px-3 py-2 shadow-xl sm:block"
      >
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
            <BarChart3 className="size-4" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500">Vistas este mes</p>
            <p className="text-sm font-bold text-slate-900">+342</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute -right-4 bottom-8 hidden rounded-xl border border-slate-100 bg-white px-3 py-2 shadow-xl sm:block"
      >
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
            <QrCode className="size-4" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500">Escaneos QR</p>
            <p className="text-sm font-bold text-slate-900">156</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Features                                                           */
/* ------------------------------------------------------------------ */

function Features() {
  return (
    <section id="caracteristicas" className="relative bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeUpProps()} className="mx-auto max-w-2xl text-center">
          <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
            <Sparkles className="mr-1 size-3.5" />
            24 funciones incluidas
          </Badge>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Todo lo que necesitas para destacar
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Una plataforma completa para profesionales, negocios y emprendedores
            que quieren proyectar una imagen digital impecable.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, idx) => (
            <motion.div key={feature.title} {...fadeUpProps(idx * 0.08)}>
              <Card className="group h-full border-slate-200/70 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-100/60">
                <CardContent className="flex h-full flex-col gap-4">
                  <div
                    className={cn(
                      'flex size-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md transition-transform duration-300 group-hover:scale-110',
                      feature.accent,
                    )}
                  >
                    <feature.icon className="size-6" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {feature.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-600">
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  How it works                                                       */
/* ------------------------------------------------------------------ */

function HowItWorks() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeUpProps()} className="mx-auto max-w-2xl text-center">
          <Badge className="border-amber-200 bg-amber-50 text-amber-700">
            <Zap className="mr-1 size-3.5" />
            Súper fácil
          </Badge>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Empieza en 3 simples pasos
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            No necesitas experiencia técnica. En minutos tendrás tu tarjeta
            digital lista para compartir.
          </p>
        </motion.div>

        <div className="relative mt-16">
          {/* Connector line */}
          <div className="absolute left-0 right-0 top-8 hidden h-0.5 bg-gradient-to-r from-emerald-200 via-amber-200 to-emerald-200 lg:block" />

          <div className="grid gap-10 lg:grid-cols-3">
            {STEPS.map((step, idx) => (
              <motion.div
                key={step.number}
                {...fadeUpProps(idx * 0.15)}
                className="relative flex flex-col items-center text-center"
              >
                <div className="relative z-10 flex size-16 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-200">
                  <step.icon className="size-7" />
                  <span className="absolute -right-1 -top-1 flex size-7 items-center justify-center rounded-full bg-amber-400 text-xs font-bold text-amber-950 shadow">
                    {step.number}
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-semibold text-slate-900">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-xs text-sm text-slate-600">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Stats                                                              */
/* ------------------------------------------------------------------ */

function Stats() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-700 py-16 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-0 size-72 rounded-full bg-amber-400/15 blur-3xl" />
        <div className="absolute -right-20 bottom-0 size-72 rounded-full bg-teal-300/15 blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {STATS.map((stat, idx) => (
            <motion.div
              key={stat.label}
              {...fadeUpProps(idx * 0.1)}
              className="text-center"
            >
              <p className="bg-gradient-to-r from-amber-300 to-amber-200 bg-clip-text text-4xl font-extrabold text-transparent sm:text-5xl">
                {stat.value}
              </p>
              <p className="mt-2 text-sm font-medium text-emerald-50/90">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Pricing preview                                                    */
/* ------------------------------------------------------------------ */

function PricingPreview() {
  const navigate = useAppStore(s => s.navigate);

  return (
    <section id="planes" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeUpProps()} className="mx-auto max-w-2xl text-center">
          <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
            <Star className="mr-1 size-3.5" />
            Planes para cada necesidad
          </Badge>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Elige el plan ideal para ti
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Desde gratis hasta Pro. Sin costos ocultos. Cancela cuando quieras.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {PLAN_ORDER.map((planId, idx) => {
            const plan = PLANS[planId];
            const isHighlight = plan.highlight;
            return (
              <motion.div key={planId} {...fadeUpProps(idx * 0.1)}>
                <Card
                  className={cn(
                    'relative h-full transition-all duration-300 hover:-translate-y-1',
                    isHighlight
                      ? 'border-emerald-400 shadow-xl shadow-emerald-100 ring-2 ring-emerald-500/20 lg:scale-105'
                      : 'border-slate-200 hover:shadow-lg hover:shadow-slate-100',
                  )}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge
                        className={cn(
                          'border-0 px-3 py-1 text-xs font-semibold shadow-md',
                          isHighlight
                            ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950'
                            : 'bg-slate-800 text-white',
                        )}
                      >
                        {plan.badge}
                      </Badge>
                    </div>
                  )}
                  <CardContent className="flex h-full flex-col gap-5 pt-4">
                    <div className="flex flex-col gap-1">
                      <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                      <p className="text-sm text-slate-500">{plan.description}</p>
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-slate-900">
                        ${plan.price}
                      </span>
                      <span className="text-sm text-slate-500">MXN {plan.period}</span>
                    </div>

                    <ul className="flex flex-col gap-2.5 text-sm">
                      {plan.features.slice(0, 6).map(f => (
                        <li key={f.name} className="flex items-start gap-2">
                          <CheckCircle2
                            className={cn(
                              'mt-0.5 size-4 shrink-0',
                              f.included ? 'text-emerald-600' : 'text-slate-300',
                            )}
                          />
                          <span className={f.included ? 'text-slate-700' : 'text-slate-400 line-through'}>
                            {f.name}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className={cn(
                        'mt-auto',
                        isHighlight
                          ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-700 hover:to-emerald-600'
                          : 'bg-slate-900 text-white hover:bg-slate-800',
                      )}
                      onClick={() => navigate('pricing')}
                    >
                      Ver detalles
                      <ArrowRight className="ml-1 size-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <motion.div {...fadeUpProps(0.2)} className="mt-10 text-center">
          <Button
            variant="link"
            onClick={() => navigate('pricing')}
            className="text-emerald-700 hover:text-emerald-800"
          >
            Comparar todos los planes
            <ArrowRight className="ml-1 size-4" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Testimonials                                                       */
/* ------------------------------------------------------------------ */

function Testimonials() {
  return (
    <section className="bg-gradient-to-b from-white to-slate-50 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeUpProps()} className="mx-auto max-w-2xl text-center">
          <Badge className="border-amber-200 bg-amber-50 text-amber-700">
            <Star className="mr-1 size-3.5" />
            Testimonios
          </Badge>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Lo que dicen nuestros clientes
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Cientos de profesionales ya confían en FTP Digital Plus.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {TESTIMONIALS.map((t, idx) => (
            <motion.div key={t.name} {...fadeUpProps(idx * 0.1)}>
              <Card className="h-full border-slate-200/70 shadow-sm hover:shadow-md">
                <CardContent className="flex h-full flex-col gap-4">
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="flex-1 text-sm leading-relaxed text-slate-700">
                    “{t.text}”
                  </p>
                  <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
                    <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-sm font-bold text-white">
                      {t.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                      <p className="text-xs text-slate-500">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Final CTA                                                          */
/* ------------------------------------------------------------------ */

function FinalCTA() {
  const navigate = useAppStore(s => s.navigate);
  return (
    <section id="contacto" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          {...fadeUpProps()}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-800 px-6 py-16 text-center shadow-2xl shadow-emerald-200/50 sm:px-12"
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-16 -top-16 size-72 rounded-full bg-amber-400/20 blur-3xl" />
            <div className="absolute -bottom-16 -right-16 size-72 rounded-full bg-teal-300/20 blur-3xl" />
            <div
              className="absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                backgroundSize: '24px 24px',
              }}
            />
          </div>
          <div className="relative flex flex-col items-center gap-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-amber-400/15 px-4 py-1.5 text-sm font-medium text-amber-100 backdrop-blur-sm">
              <Sparkles className="size-4" />
              Empieza hoy mismo
            </div>
            <h2 className="max-w-2xl text-balance text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              Crea tu tarjeta digital y empieza a impresionar
            </h2>
            <p className="max-w-xl text-pretty text-emerald-50/90">
              Únete a más de 1,000 profesionales que ya transformaron su
              presencia digital. Sin compromisos, cancela cuando quieras.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                onClick={() => navigate('login')}
                className="bg-amber-400 text-amber-950 shadow-lg shadow-amber-500/30 hover:bg-amber-300"
              >
                Crear mi Tarjeta Gratis
                <ArrowRight className="ml-1 size-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('pricing')}
                className="border-white/40 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
              >
                Ver Planes
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Footer                                                             */
/* ------------------------------------------------------------------ */

function SiteFooter() {
  const navigate = useAppStore(s => s.navigate);
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-4">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <FTPLogo variant="full" className="h-9 w-auto" />
            <p className="max-w-xs text-sm text-slate-600">
              Agencia de Diseño Web y Marketing Digital. Creamos experiencias
              digitales que conectan.
            </p>
            <div className="flex gap-2">
              {[
                { Icon: Facebook, label: 'Facebook' },
                { Icon: Instagram, label: 'Instagram' },
                { Icon: Linkedin, label: 'LinkedIn' },
                { Icon: Twitter, label: 'Twitter' },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  onClick={e => e.preventDefault()}
                  aria-label={label}
                  className="flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Producto</h3>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm">
              {[
                { label: 'Características', action: () => document.getElementById('caracteristicas')?.scrollIntoView({ behavior: 'smooth' }) },
                { label: 'Planes', action: () => navigate('pricing') },
                { label: 'Plantillas', action: () => navigate('pricing') },
                { label: 'Iniciar Sesión', action: () => navigate('login') },
              ].map(item => (
                <li key={item.label}>
                  <button
                    onClick={item.action}
                    className="text-slate-600 transition-colors hover:text-emerald-700"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Empresa</h3>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm">
              {['Sobre nosotros', 'Blog', 'Contacto', 'Soporte'].map(label => (
                <li key={label}>
                  <a
                    href="#"
                    onClick={e => e.preventDefault()}
                    className="text-slate-600 transition-colors hover:text-emerald-700"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Contacto</h3>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <Mail className="size-4 text-emerald-600" />
                hola@ftpdigitalplus.com
              </li>
              <li className="flex items-center gap-2">
                <Phone className="size-4 text-emerald-600" />
                +52 55 1234 5678
              </li>
              <li className="flex items-center gap-2">
                <Globe className="size-4 text-emerald-600" />
                Ciudad de México, México
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 sm:flex-row">
          <p className="text-sm text-slate-500">
            © {year} FTP Digital Plus — Agencia de Diseño Web y Marketing Digital.
          </p>
          <div className="flex gap-6 text-sm text-slate-500">
            <a href="#" onClick={e => e.preventDefault()} className="hover:text-emerald-700">
              Privacidad
            </a>
            <a href="#" onClick={e => e.preventDefault()} className="hover:text-emerald-700">
              Términos
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Features />
        <HowItWorks />
        <Stats />
        <PricingPreview />
        <Testimonials />
        <FinalCTA />
      </main>
      <SiteFooter />
    </div>
  );
}
