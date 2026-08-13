'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { FTPLogo } from '@/components/ftp-logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { NotificationsPanel } from '@/components/notifications-panel';
import { AnimatedCounter } from '@/components/visual/animated-counter';
import { GradientText } from '@/components/visual/gradient-text';
import { Marquee } from '@/components/visual/marquee';
import { Typewriter } from '@/components/animations/typewriter';
import { PLANS, PLAN_ORDER } from '@/lib/plans';
import type { PlanType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { GlassCard } from '@/components/visual/glass-card';
import {
  MeshGradientBackground,
  ParticleBackground,
} from '@/components/visual/improved-backgrounds';
import { WaveDivider, DotsDivider } from '@/components/visual/section-divider';
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
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  Users,
  Award,
  TrendingUp,
  FileText,
  Shield,
  RefreshCw,
  Send,
  Quote,
  Building2,
  Target,
  Lightbulb,
  Clock,
} from 'lucide-react';
import { getFeaturedCases, INDUSTRY_LABELS } from '@/lib/cases-data';

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

const ADDITIONAL_FEATURES = [
  {
    icon: MessageCircle,
    title: 'WhatsApp Integrado',
    description:
      'Recibe mensajes directos de tus clientes a tu WhatsApp sin exponer tu número públicamente.',
    accent: 'from-emerald-500 to-teal-600',
  },
  {
    icon: Users,
    title: 'Equipo y Citas',
    description:
      'Agrega miembros de tu equipo con perfiles individuales y sistema de citas independiente.',
    accent: 'from-amber-500 to-orange-600',
  },
  {
    icon: Award,
    title: 'Testimonios',
    description:
      'Muestra reseñas y calificaciones de tus clientes para generar confianza social.',
    accent: 'from-emerald-500 to-green-600',
  },
  {
    icon: Globe,
    title: 'SEO Optimizado',
    description:
      'Cada tarjeta está optimizada para buscadores con metadatos personalizables por ti.',
    accent: 'from-amber-500 to-yellow-600',
  },
  {
    icon: TrendingUp,
    title: 'Afiliados',
    description:
      'Genera ingresos extras recomendando FTP Digital Plus con tu código de afiliado.',
    accent: 'from-emerald-500 to-emerald-700',
  },
  {
    icon: Heart,
    title: 'Personalización Total',
    description:
      'Colores, fuentes, CSS personalizado y hasta JavaScript para control absoluto del diseño.',
    accent: 'from-amber-500 to-rose-600',
  },
];

const TRUSTED_COMPANIES = [
  { name: 'Consultorio González', initials: 'CG' },
  { name: 'Restaurante El Sabor', initials: 'RS' },
  { name: 'Boutique Rosa', initials: 'BR' },
  { name: 'Tech Solutions MX', initials: 'TS' },
];

const COMPARISON_ROWS = [
  {
    label: 'Precio',
    ftp: 'Desde $0',
    others: '$200 - $1,500/mes',
    traditional: '$500 - $2,000 una vez',
  },
  {
    label: 'QR incluido',
    ftp: 'Sí, en todos los planes',
    others: 'Sí, con costo extra',
    traditional: 'No',
  },
  {
    label: 'Actualizable',
    ftp: 'En tiempo real',
    others: 'Sí, pero lento',
    traditional: 'No, debes reimprimir',
  },
  {
    label: 'Estadísticas',
    ftp: 'Completas y en vivo',
    others: 'Limitadas',
    traditional: 'Ninguna',
  },
  {
    label: 'Múltiples funciones',
    ftp: '24+ secciones',
    others: '5-10 secciones',
    traditional: 'Solo contacto',
  },
  {
    label: 'Sin costos ocultos',
    ftp: '100% transparente',
    others: 'Comisiones por uso',
    traditional: 'Costos de reimpresión',
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
  { value: 1000, suffix: '+', label: 'Tarjetas creadas' },
  { value: 50, suffix: 'k+', label: 'Escaneos QR' },
  { value: 24, suffix: '', label: 'Funciones incluidas' },
  { value: 99, suffix: '.9%', label: 'Disponibilidad' },
];

const TESTIMONIALS = [
  {
    name: 'Dra. María González',
    role: 'Médico Internista',
    company: 'Consultorio González',
    text: 'FTP Digital Plus transformó la manera en que mis pacientes me contactan. Las citas en línea me ahorran horas cada semana.',
    rating: 5,
    initials: 'MG',
  },
  {
    name: 'Roberto Cruz',
    role: 'Restaurantero',
    company: 'Restaurante El Sabor',
    text: 'El menú digital con QR es espectacular. Mis clientes lo aman y las reservaciones aumentaron un 40% en dos meses.',
    rating: 5,
    initials: 'RC',
  },
  {
    name: 'Patricia López',
    role: 'Diseñadora Gráfica',
    company: 'Boutique Rosa',
    text: 'Mi portafolio se ve increíble. El plan Básico me dio todo lo que necesitaba para impresionar a mis clientes.',
    rating: 5,
    initials: 'PL',
  },
  {
    name: 'Miguel Ángel Torres',
    role: 'Chef Ejecutivo',
    company: 'Tech Solutions MX',
    text: 'La analítica avanzada del plan Pro me permitió entender mejor a mis clientes y duplicar mis ventas en línea.',
    rating: 5,
    initials: 'MT',
  },
  {
    name: 'Laura Sánchez',
    role: 'Gerente de Marketing',
    company: 'Agencia Creativa',
    text: 'Probamos varias plataformas y FTP Digital Plus es sin duda la más completa y fácil de usar. 100% recomendada.',
    rating: 5,
    initials: 'LS',
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
          <button
            onClick={() => {
              navigate('blog');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-50 hover:text-emerald-800"
          >
            <FileText className="size-4 text-amber-500" />
            Blog
          </button>
          <button
            onClick={() => {
              navigate('cases');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-50 hover:text-amber-800"
          >
            <Award className="size-4 text-amber-500" />
            Casos de Éxito
          </button>
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
            className="inline-flex size-11 items-center justify-center rounded-md text-slate-700 hover:bg-emerald-50"
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
                className="min-h-[48px] rounded-md px-3 py-3 text-left text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => {
                setOpen(false);
                navigate('blog');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex min-h-[48px] items-center gap-2 rounded-md px-3 py-3 text-left text-sm font-medium text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
            >
              <FileText className="size-4 text-amber-500" />
              Blog y Recursos
            </button>
            <button
              onClick={() => {
                setOpen(false);
                navigate('cases');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex min-h-[48px] items-center gap-2 rounded-md px-3 py-3 text-left text-sm font-medium text-amber-700 hover:bg-amber-50 hover:text-amber-800"
            >
              <Award className="size-4 text-amber-500" />
              Casos de Éxito
            </button>
            <div className="mt-2 flex flex-col gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  navigate('pricing');
                }}
                className="min-h-[48px] border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              >
                Ver Planes
              </Button>
              <Button
                onClick={() => {
                  setOpen(false);
                  navigate('login');
                }}
                className="min-h-[48px] bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-700 hover:to-emerald-600"
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

  const scrollToNext = () => {
    const el = document.getElementById('caracteristicas');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section
      id="inicio"
      className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-800 text-white"
    >
      {/* Animated mesh gradient overlay — Task 9-b */}
      <MeshGradientBackground className="opacity-30 mix-blend-overlay" />

      {/* Animated gradient overlay */}
      <div className="pointer-events-none absolute inset-0 animate-gradient bg-gradient-to-br from-emerald-600 via-emerald-700 to-amber-600/40 opacity-30" />

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

      {/* Floating decorative shapes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 180, 360] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute right-[8%] top-[18%] hidden size-12 rounded-2xl border border-amber-300/30 bg-amber-400/10 backdrop-blur-sm lg:block"
        />
        <motion.div
          animate={{ y: [0, 18, 0], x: [0, 8, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          className="absolute left-[5%] top-[40%] hidden size-3 rounded-full bg-amber-300/60 lg:block"
        />
        <motion.div
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute right-[15%] bottom-[20%] hidden size-4 rounded-full bg-emerald-200/50 lg:block"
        />
        <motion.div
          animate={{ y: [0, 16, 0], rotate: [0, -90, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
          className="absolute left-[12%] bottom-[15%] hidden size-8 rounded-lg border border-emerald-200/30 bg-emerald-300/10 backdrop-blur-sm lg:block"
        />
        <motion.div
          animate={{ y: [0, -10, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          className="absolute right-[40%] top-[12%] hidden size-2 rounded-full bg-amber-200/70 lg:block"
        />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:py-28">
        {/* Left: copy */}
        <motion.div {...fade} className="flex flex-col items-start gap-6">
          <Badge className="border-amber-300/40 bg-amber-400/15 text-amber-100 backdrop-blur-sm">
            <Sparkles className="mr-1 size-3.5" />
            Plataforma #1 en tarjetas digitales
          </Badge>

          <h1 className="text-balance text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl sm:leading-tight lg:text-6xl">
            Tarjetas de Presentación Digitales que{' '}
            <span className="bg-gradient-to-r from-amber-300 to-amber-400 bg-clip-text text-transparent">
              <Typewriter text="Impresionan" speed={110} />
            </span>
          </h1>

          <p className="max-w-xl text-pretty text-base text-emerald-50/90 sm:text-lg">
            Crea tu tarjeta digital profesional con QR, NFC, portafolio, catálogo
            de productos, sistema de citas y mucho más. Todo en una sola
            plataforma, lista para compartir.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              onClick={() => navigate('login')}
              className="min-h-[48px] bg-amber-400 text-amber-950 shadow-lg shadow-amber-500/25 hover:bg-amber-300"
            >
              Crear mi Tarjeta Gratis
              <ArrowRight className="ml-1 size-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('pricing')}
              className="min-h-[48px] border-white/40 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
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

          {/* Trusted by row */}
          <div className="flex flex-col gap-3 pt-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-100/70">
              Empresas que confían en nosotros
            </p>
            <div className="flex flex-wrap items-center gap-3">
              {TRUSTED_COMPANIES.map((company, idx) => (
                <motion.div
                  key={company.name}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + idx * 0.1, duration: 0.4 }}
                  className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 backdrop-blur-sm"
                >
                  <span className="flex size-6 items-center justify-center rounded-md bg-gradient-to-br from-amber-300 to-amber-400 text-[10px] font-bold text-amber-950">
                    {company.initials}
                  </span>
                  <span className="text-xs font-medium text-emerald-50/90">
                    {company.name}
                  </span>
                </motion.div>
              ))}
            </div>
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

      {/* Scroll indicator */}
      <button
        onClick={scrollToNext}
        aria-label="Desplazarse hacia abajo"
        className="absolute bottom-4 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-1 text-emerald-50/70 transition-colors hover:text-white lg:flex"
      >
        <span className="text-[10px] font-medium uppercase tracking-widest">
          Explora más
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="size-5" />
        </motion.div>
      </button>

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
  const [showMore, setShowMore] = useState(false);

  return (
    <section id="caracteristicas" className="relative bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeUpProps()} className="mx-auto max-w-2xl text-center">
          <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
            <Sparkles className="mr-1 size-3.5" />
            24 funciones incluidas
          </Badge>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Todo lo que necesitas para{' '}
            <GradientText variant="emerald-gold" animated>destacar</GradientText>
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Una plataforma completa para profesionales, negocios y emprendedores
            que quieren proyectar una imagen digital impecable.
          </p>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 stagger-children">
          {FEATURES.map((feature, idx) => (
            <motion.div key={feature.title} {...fadeUpProps(idx * 0.08)}>
              <GlassCard
                variant="light"
                hover
                glow
                className="group relative h-full overflow-hidden p-6"
              >
                {/* Glow accent */}
                <div
                  className={cn(
                    'pointer-events-none absolute -right-12 -top-12 size-32 rounded-full bg-gradient-to-br opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-30',
                    feature.accent,
                  )}
                />
                <div className="relative flex h-full flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div
                      className={cn(
                        'flex size-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md transition-transform duration-300 group-hover:scale-110',
                        feature.accent,
                      )}
                    >
                      <feature.icon className="size-6" />
                    </div>
                    <span className="font-mono text-3xl font-bold text-slate-100 transition-colors group-hover:text-emerald-100">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {feature.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-600">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Expandable additional features */}
        <AnimatePresence initial={false}>
          {showMore && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 stagger-children">
                {ADDITIONAL_FEATURES.map((feature, idx) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.4 }}
                  >
                    <GlassCard
                      variant="light"
                      hover
                      glow
                      className="group relative h-full overflow-hidden p-6"
                    >
                      <div
                        className={cn(
                          'pointer-events-none absolute -right-12 -top-12 size-32 rounded-full bg-gradient-to-br opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-30',
                          feature.accent,
                        )}
                      />
                      <div className="relative flex h-full flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <div
                            className={cn(
                              'flex size-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md transition-transform duration-300 group-hover:scale-110',
                              feature.accent,
                            )}
                          >
                            <feature.icon className="size-6" />
                          </div>
                          <span className="font-mono text-3xl font-bold text-slate-100 transition-colors group-hover:text-emerald-100">
                            {String(FEATURES.length + idx + 1).padStart(2, '0')}
                          </span>
                        </div>
                        <div className="flex flex-col gap-2">
                          <h3 className="text-lg font-semibold text-slate-900">
                            {feature.title}
                          </h3>
                          <p className="text-sm leading-relaxed text-slate-600">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div {...fadeUpProps(0.15)} className="mt-10 text-center">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setShowMore(v => !v)}
            className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
          >
            {showMore ? (
              <>
                Ver menos funciones
                <ChevronDown className="size-4 rotate-180" />
              </>
            ) : (
              <>
                Ver más funciones
                <ChevronDown className="size-4" />
              </>
            )}
          </Button>
          {!showMore && (
            <p className="mt-3 text-xs text-slate-500">
              Descubre {ADDITIONAL_FEATURES.length} funciones adicionales que
              hacen de FTP Digital Plus la plataforma más completa.
            </p>
          )}
        </motion.div>
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
            Empieza en{' '}
            <span className="text-gradient-animated">3 simples pasos</span>
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
      {/* Wave divider — transición suave hacia la sección Stats */}
      <WaveDivider fillTop="#047857" />
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Stats                                                              */
/* ------------------------------------------------------------------ */

function Stats() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-700 py-16 text-white">
      {/* Floating particles — Task 9-b */}
      <ParticleBackground className="opacity-70" />
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
                <AnimatedCounter value={stat.value} suffix={stat.suffix} duration={1800} />
              </p>
              <p className="mt-2 text-sm font-medium text-emerald-50/90">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
      {/* Wave divider — transición hacia la sección de Comparativa */}
      <WaveDivider fillTop="#f8fafc" />
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Comparison section                                                 */
/* ------------------------------------------------------------------ */

function Comparison() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeUpProps()} className="mx-auto max-w-2xl text-center">
          <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
            <Award className="mr-1 size-3.5" />
            Comparativa
          </Badge>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            FTP Digital Plus vs. la competencia
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Compara nuestras funciones con otras plataformas digitales y las
            tarjetas tradicionales de papel.
          </p>
        </motion.div>

        {/* Mobile: stacked cards */}
        <motion.div {...fadeUpProps(0.1)} className="mt-12 lg:hidden">
          {/* Hint for horizontal scroll */}
          <p className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <ArrowRight className="size-3 text-emerald-600" />
            Desliza horizontalmente para comparar todas las opciones
          </p>
          <div className="-mx-4 overflow-x-auto px-4 pb-2 ftp-comparison-scroll">
            <div className="flex gap-3" style={{ minWidth: 'min-content' }}>
              {COMPARISON_ROWS.map(row => (
                <Card key={row.label} className="w-64 shrink-0 overflow-hidden border-slate-200">
                  <CardContent className="p-0">
                    <div className="border-b border-slate-100 bg-slate-50 px-4 py-2.5">
                      <p className="text-sm font-semibold text-slate-900">{row.label}</p>
                    </div>
                    <div className="grid grid-cols-1 divide-y divide-slate-100">
                      <div className="bg-emerald-50/50 p-3">
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">FTP Digital Plus</p>
                        <p className="text-xs font-medium text-slate-800">{row.ftp}</p>
                      </div>
                      <div className="p-3">
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Otras plataformas</p>
                        <p className="text-xs text-slate-600">{row.others}</p>
                      </div>
                      <div className="p-3">
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Tarjetas de papel</p>
                        <p className="text-xs text-slate-600">{row.traditional}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Desktop: table */}
        <motion.div {...fadeUpProps(0.1)} className="mt-12 hidden lg:block">
          <Card className="overflow-hidden border-slate-200 shadow-lg">
            <CardContent className="p-0">
              {/* Header row */}
              <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] border-b border-slate-200">
                <div className="bg-slate-50 px-6 py-5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Característica
                  </span>
                </div>
                <div className="relative bg-gradient-to-b from-emerald-600 to-emerald-700 px-6 py-5 text-center">
                  <div className="absolute inset-x-0 -top-3 mx-auto w-fit">
                    <Badge className="border-0 bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-amber-950 shadow">
                      RECOMENDADO
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm font-bold text-white">FTP Digital Plus</p>
                </div>
                <div className="bg-slate-50 px-6 py-5 text-center">
                  <p className="text-sm font-semibold text-slate-700">Otras plataformas</p>
                </div>
                <div className="bg-slate-50 px-6 py-5 text-center">
                  <p className="text-sm font-semibold text-slate-700">Tarjetas tradicionales</p>
                </div>
              </div>

              {/* Data rows */}
              {COMPARISON_ROWS.map((row, idx) => (
                <div
                  key={row.label}
                  className={cn(
                    'grid grid-cols-[1.5fr_1fr_1fr_1fr] border-b border-slate-100 last:border-b-0',
                    idx % 2 === 1 && 'bg-slate-50/40',
                  )}
                >
                  <div className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-900">{row.label}</p>
                  </div>
                  <div className="bg-emerald-50/40 px-6 py-4 text-center">
                    <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-800">
                      <CheckCircle2 className="size-4 text-emerald-600" />
                      {row.ftp}
                    </p>
                  </div>
                  <div className="px-6 py-4 text-center">
                    <p className="text-sm text-slate-600">{row.others}</p>
                  </div>
                  <div className="px-6 py-4 text-center">
                    <p className="text-sm text-slate-500">{row.traditional}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...fadeUpProps(0.2)} className="mt-8 text-center">
          <p className="text-sm text-slate-600">
            <Sparkles className="mr-1 inline size-4 text-amber-500" />
            FTP Digital Plus ofrece la mejor relación precio-funcionalidades del
            mercado mexicano.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Cases preview                                                      */
/* ------------------------------------------------------------------ */

function CasesPreview() {
  const navigate = useAppStore(s => s.navigate);
  const featuredCases = getFeaturedCases(3);

  return (
    <section id="casos" className="bg-gradient-to-b from-white to-emerald-50/40 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeUpProps()} className="mx-auto max-w-2xl text-center">
          <Badge className="border-amber-200 bg-amber-50 text-amber-700">
            <Award className="mr-1 size-3.5" />
            Casos de Éxito
          </Badge>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Resultados que hablan por sí solos
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Más de 500 empresas ya transformaron su presencia digital. Conoce sus historias.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredCases.map((c, idx) => (
            <motion.div key={c.id} {...fadeUpProps(idx * 0.1)}>
              <Card className="group flex h-full flex-col overflow-hidden border-slate-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-100">
                {/* Header con gradiente */}
                <div className={cn('relative h-28 bg-gradient-to-br', c.image)}>
                  <div className="absolute inset-0 bg-black/5" />
                  <div className="absolute left-4 top-4">
                    <Badge className="border-0 bg-white/25 text-white backdrop-blur">
                      {INDUSTRY_LABELS[c.industry]}
                    </Badge>
                  </div>
                  <div className="absolute -bottom-6 left-4 flex size-14 items-center justify-center rounded-xl bg-white shadow-md ring-2 ring-white">
                    <div className="flex size-full items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 text-lg font-bold text-white">
                      {c.testimonial.avatar}
                    </div>
                  </div>
                  <div className="absolute right-3 top-3">
                    <Badge
                      className={cn(
                        'border-0',
                        c.plan === 'pro'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700',
                      )}
                    >
                      {c.plan === 'pro' ? 'Plan Pro' : 'Plan Básico'}
                    </Badge>
                  </div>
                </div>

                <CardContent className="flex flex-1 flex-col gap-3 p-5 pt-8">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{c.clientName}</h3>
                    <p className="text-xs text-slate-500">
                      {c.clientType} · {c.duration}
                    </p>
                  </div>

                  <p className="line-clamp-2 text-sm text-slate-600">
                    <span className="font-medium text-slate-700">Reto:</span>{' '}
                    {c.challenge.split('.')[0]}.
                  </p>

                  {/* Key results (3) */}
                  <div className="flex flex-col gap-2">
                    {c.results.slice(0, 3).map(r => (
                      <div
                        key={r.metric}
                        className="flex items-center justify-between gap-2 text-sm"
                      >
                        <span className="text-slate-600">{r.metric}</span>
                        <span className="flex items-center gap-1.5">
                          <span className="font-semibold tabular-nums text-slate-900">
                            {r.value}
                          </span>
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
                        <Star key={i} className="size-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="line-clamp-2 text-xs italic text-slate-600">
                      “{c.testimonial.quote}”
                    </p>
                    <p className="mt-1 text-[10px] font-medium text-slate-500">
                      — {c.testimonial.author}, {c.testimonial.role}
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => {
                      navigate('cases');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="mt-2 w-full gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                  >
                    Ver caso completo
                    <ArrowRight className="size-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div {...fadeUpProps(0.2)} className="mt-12 text-center">
          <Button
            size="lg"
            onClick={() => {
              navigate('cases');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md hover:from-amber-600 hover:to-amber-700"
          >
            <Award className="size-4" />
            Ver todos los casos de éxito
            <ArrowRight className="size-4" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Pricing preview                                                    */
/* ------------------------------------------------------------------ */

function PricingPreview() {
  const navigate = useAppStore(s => s.navigate);
  const currentUser = useAppStore(s => s.currentUser);
  const setSelectedPlanForCheckout = useAppStore(s => s.setSelectedPlanForCheckout);

  const handleChoose = (planId: PlanType) => {
    if (planId === 'gratis') {
      navigate('login');
      return;
    }
    setSelectedPlanForCheckout(planId);
    if (currentUser) {
      navigate('checkout');
    } else {
      navigate('login');
    }
  };

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
                      onClick={() => handleChoose(planId)}
                    >
                      Elegir Plan
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
      {/* Dots divider — separación visual hacia Testimonios */}
      <DotsDivider />
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Testimonials                                                       */
/* ------------------------------------------------------------------ */

function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const next = useCallback(() => {
    setActiveIndex(i => (i + 1) % TESTIMONIALS.length);
  }, []);

  const prev = useCallback(() => {
    setActiveIndex(i => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveIndex(i => (i + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const active = TESTIMONIALS[activeIndex];

  return (
    <section
      className="bg-gradient-to-b from-white to-slate-50 py-20 sm:py-28"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeUpProps()} className="mx-auto max-w-2xl text-center">
          <Badge className="border-amber-200 bg-amber-50 text-amber-700">
            <Star className="mr-1 size-3.5 fill-amber-400 text-amber-500" />
            Testimonios
          </Badge>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Lo que dicen nuestros clientes
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Cientos de profesionales ya confían en FTP Digital Plus.
          </p>
        </motion.div>

        {/* Main carousel */}
        <motion.div {...fadeUpProps(0.1)} className="mx-auto mt-14 max-w-4xl">
          <Card className="relative overflow-hidden border-emerald-100 shadow-lg">
            <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-amber-200/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 size-48 rounded-full bg-emerald-200/30 blur-3xl" />

            <CardContent className="relative flex flex-col items-center gap-6 p-8 text-center sm:p-12">
              <Quote className="size-10 text-emerald-200" />

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35 }}
                  className="flex w-full flex-col items-center gap-5"
                >
                  <div className="flex gap-1">
                    {Array.from({ length: active.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="size-5 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>

                  <p className="max-w-2xl text-balance text-lg font-medium leading-relaxed text-slate-800 sm:text-xl">
                    “{active.text}”
                  </p>

                  <div className="flex items-center gap-3">
                    <div className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-base font-bold text-white shadow-md">
                      {active.initials}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-slate-900">{active.name}</p>
                      <p className="text-sm text-slate-500">{active.role}</p>
                      <p className="flex items-center gap-1 text-xs text-emerald-700">
                        <Building2 className="size-3" />
                        {active.company}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={prev}
                  aria-label="Testimonio anterior"
                  className="flex size-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <div className="flex items-center gap-1.5">
                  {TESTIMONIALS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveIndex(i)}
                      aria-label={`Ir al testimonio ${i + 1}`}
                      className={cn(
                        'h-2 rounded-full transition-all',
                        i === activeIndex
                          ? 'w-6 bg-emerald-600'
                          : 'w-2 bg-slate-300 hover:bg-slate-400',
                      )}
                    />
                  ))}
                </div>
                <button
                  onClick={next}
                  aria-label="Testimonio siguiente"
                  className="flex size-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                >
                  <ChevronRight className="size-5" />
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Company logos / names strip */}
        <motion.div
          {...fadeUpProps(0.2)}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          {TESTIMONIALS.map((t, idx) => (
            <button
              key={t.name}
              onClick={() => setActiveIndex(idx)}
              className={cn(
                'flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
                idx === activeIndex
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:text-emerald-700',
              )}
            >
              <span className="flex size-5 items-center justify-center rounded-md bg-gradient-to-br from-amber-300 to-amber-400 text-[9px] font-bold text-amber-950">
                {t.initials}
              </span>
              {t.company}
            </button>
          ))}
        </motion.div>

        {/* Marquee de empresas que confían en FTP Digital Plus */}
        <motion.div
          {...fadeUpProps(0.25)}
          className="mt-12"
        >
          <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Confían en nosotros
          </p>
          <Marquee speed={28} pauseOnHover>
            {TESTIMONIALS.concat(TESTIMONIALS).map((t, i) => (
              <div
                key={`${t.name}-${i}`}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm"
              >
                <span className="flex size-6 items-center justify-center rounded-md bg-gradient-to-br from-emerald-400 to-emerald-600 text-[10px] font-bold text-white">
                  {t.initials}
                </span>
                <span className="text-xs font-semibold text-slate-700">{t.company}</span>
              </div>
            ))}
          </Marquee>
        </motion.div>
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
  const [email, setEmail] = useState('');

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Por favor ingresa tu correo electrónico');
      return;
    }
    toast.success('¡Gracias por suscribirte! Te mantendremos al tanto de nuestras novedades.');
    setEmail('');
  };

  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:gap-10 lg:grid-cols-12">
          {/* Brand + social */}
          <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-4">
            <FTPLogo variant="full" className="h-9 w-auto" />
            <p className="max-w-xs text-sm text-slate-600">
              Agencia de Diseño Web y Marketing Digital. Creamos experiencias
              digitales que conectan.
            </p>
            <div className="flex gap-2">
              {[
                { Icon: Facebook, label: 'Facebook', color: 'hover:bg-[#1877F2] hover:border-[#1877F2] hover:text-white' },
                { Icon: Instagram, label: 'Instagram', color: 'hover:bg-gradient-to-br hover:from-[#E4405F] hover:to-[#F77737] hover:border-transparent hover:text-white' },
                { Icon: Linkedin, label: 'LinkedIn', color: 'hover:bg-[#0A66C2] hover:border-[#0A66C2] hover:text-white' },
                { Icon: Twitter, label: 'Twitter', color: 'hover:bg-black hover:border-black hover:text-white' },
                { Icon: MessageCircle, label: 'WhatsApp', color: 'hover:bg-[#25D366] hover:border-[#25D366] hover:text-white' },
              ].map(({ Icon, label, color }) => (
                <a
                  key={label}
                  href="#"
                  onClick={e => e.preventDefault()}
                  aria-label={label}
                  className={cn(
                    'flex size-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
                    color,
                  )}
                >
                  <Icon className="size-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div className="sm:col-span-1 lg:col-span-2">
            <h3 className="text-sm font-semibold text-slate-900">Producto</h3>
            <ul className="mt-4 flex flex-col gap-3 text-sm sm:gap-2.5">
              {[
                { label: 'Características', action: () => document.getElementById('caracteristicas')?.scrollIntoView({ behavior: 'smooth' }) },
                { label: 'Planes', action: () => navigate('pricing') },
                { label: 'Casos de Éxito', action: () => { navigate('cases'); window.scrollTo({ top: 0, behavior: 'smooth' }); } },
                { label: 'Plantillas', action: () => navigate('template-gallery') },
                { label: 'Blog y Recursos', action: () => { navigate('blog'); window.scrollTo({ top: 0, behavior: 'smooth' }); } },
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

          {/* Legal */}
          <div className="sm:col-span-1 lg:col-span-2">
            <h3 className="text-sm font-semibold text-slate-900">Legal</h3>
            <ul className="mt-4 flex flex-col gap-3 text-sm sm:gap-2.5">
              {[
                { label: 'Términos y Condiciones', view: 'terms' as const, icon: FileText },
                { label: 'Política de Privacidad', view: 'privacy' as const, icon: Shield },
                { label: 'Política de Reembolsos', view: 'refunds' as const, icon: RefreshCw },
              ].map(item => (
                <li key={item.label}>
                  <button
                    onClick={() => {
                      navigate(item.view);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex items-center gap-1.5 text-slate-600 transition-colors hover:text-emerald-700"
                  >
                    <item.icon className="size-3.5 text-emerald-500" />
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter + contact */}
          <div className="sm:col-span-2 lg:col-span-4">
            <h3 className="text-sm font-semibold text-slate-900">
              Mantente al día
            </h3>
            <p className="mt-4 text-sm text-slate-600">
              Suscríbete a nuestro newsletter y recibe tips, novedades y promociones
              exclusivas.
            </p>
            <form onSubmit={handleNewsletter} className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                aria-label="Correo electrónico"
                className="min-h-[44px] border-slate-200 bg-white focus-visible:ring-emerald-500"
              />
              <Button
                type="submit"
                className="min-h-[44px] gap-1.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-sm hover:from-emerald-700 hover:to-emerald-600"
              >
                <Send className="size-4" />
                <span>Suscribirme</span>
              </Button>
            </form>

            <ul className="mt-5 flex flex-col gap-2 text-xs text-slate-500">
              <li className="flex items-center gap-2">
                <Mail className="size-3.5 text-emerald-600" />
                hola@ftpdigitalplus.com
              </li>
              <li className="flex items-center gap-2">
                <Phone className="size-3.5 text-emerald-600" />
                +52 55 1234 5678
              </li>
              <li className="flex items-center gap-2">
                <Globe className="size-3.5 text-emerald-600" />
                Ciudad de México, México
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 sm:flex-row">
          <p className="text-sm text-slate-500">
            © {year} FTP Digital Plus — Agencia de Diseño Web y Marketing Digital.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
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
  );
}

/* ------------------------------------------------------------------ */
/*  Live Demo floating button                                          */
/* ------------------------------------------------------------------ */

function LiveDemoButton() {
  const navigate = useAppStore(s => s.navigate);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          onClick={() => navigate('login')}
          aria-label="Ver demostración"
          className="group fixed bottom-20 right-4 z-40 flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/40 transition-transform hover:scale-105 sm:bottom-6 sm:right-6"
        >
          {/* Pulse rings */}
          <span className="pointer-events-none absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-30" />
          <span className="pointer-events-none absolute inset-0 animate-pulse rounded-full bg-emerald-300 opacity-20" />
          <span className="relative flex size-5 items-center justify-center rounded-full bg-white/20">
            <Sparkles className="size-3.5 text-amber-200" />
          </span>
          <span className="relative">Ver Demo</span>
          <ArrowRight className="relative size-4 transition-transform group-hover:translate-x-0.5" />
        </motion.button>
      )}
    </AnimatePresence>
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
        <Comparison />
        <CasesPreview />
        <PricingPreview />
        <Testimonials />
        <FinalCTA />
      </main>
      <SiteFooter />
      <LiveDemoButton />
    </div>
  );
}
