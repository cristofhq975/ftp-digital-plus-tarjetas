'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CardPreview } from '@/components/card-preview';
import { TEMPLATES, COLOR_PRESETS } from '@/lib/plans';
import { BusinessCard, Schedule, SocialLinks } from '@/lib/types';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Search,
  Star,
  Eye,
  Check,
  ArrowLeft,
  Sparkles,
  Crown,
  Zap,
  Layers,
  ArrowRight,
  LayoutDashboard,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';

/* ============================================================
   Types & Constants
   ============================================================ */

type TemplateId = (typeof TEMPLATES)[number]['id'];

type PlanRequirement = 'all' | 'basico' | 'pro';

interface TemplateMeta {
  id: TemplateId;
  category: 'profesional' | 'creativo' | 'minimalista';
  plan: PlanRequirement;
  rating: number;
  reviews: number;
  isNew: boolean;
  isFeatured?: boolean;
  popularity: number; // higher = more popular, used for sort
  highlights: string[];
}

const TEMPLATE_META: Record<TemplateId, TemplateMeta> = {
  moderno: {
    id: 'moderno',
    category: 'profesional',
    plan: 'all',
    rating: 4.8,
    reviews: 1247,
    isNew: false,
    isFeatured: true,
    popularity: 98,
    highlights: ['Diseño limpio', 'Gradientes vibrantes', 'Ideal para profesionales'],
  },
  clasico: {
    id: 'clasico',
    category: 'profesional',
    plan: 'basico',
    rating: 4.6,
    reviews: 892,
    isNew: false,
    popularity: 84,
    highlights: ['Elegante atemporal', 'Estructura tradicional', 'Alta legibilidad'],
  },
  minimalista: {
    id: 'minimalista',
    category: 'minimalista',
    plan: 'all',
    rating: 4.9,
    reviews: 1583,
    isNew: false,
    popularity: 95,
    highlights: ['Solo lo esencial', 'Enfoque en contenido', 'Carga ultrarrápida'],
  },
  elegante: {
    id: 'elegante',
    category: 'creativo',
    plan: 'pro',
    rating: 4.7,
    reviews: 743,
    isNew: false,
    popularity: 76,
    highlights: ['Tipografía serif', 'Estética sofisticada', 'Para marcas premium'],
  },
  dinamica: {
    id: 'dinamica',
    category: 'creativo',
    plan: 'pro',
    rating: 4.5,
    reviews: 651,
    isNew: true,
    popularity: 72,
    highlights: ['Animaciones suaves', 'Efectos visuales', 'Experiencia inmersiva'],
  },
  corporativo: {
    id: 'corporativo',
    category: 'profesional',
    plan: 'pro',
    rating: 4.7,
    reviews: 412,
    isNew: true,
    popularity: 80,
    highlights: ['Layout formal con sidebar', 'Acentos esmeralda y serif', 'Para empresas y consultoras'],
  },
  creativo: {
    id: 'creativo',
    category: 'creativo',
    plan: 'pro',
    rating: 4.6,
    reviews: 287,
    isNew: true,
    popularity: 78,
    highlights: ['Colores vibrantes', 'Layout asimétrico y blobs', 'Para marcas creativas'],
  },
  oscuro: {
    id: 'oscuro',
    category: 'minimalista',
    plan: 'pro',
    rating: 4.8,
    reviews: 538,
    isNew: true,
    isFeatured: false,
    popularity: 88,
    highlights: ['Modo oscuro elegante', 'Glassmorphism', 'Acentos esmeralda'],
  },
  vintage: {
    id: 'vintage',
    category: 'creativo',
    plan: 'pro',
    rating: 4.4,
    reviews: 196,
    isNew: true,
    popularity: 64,
    highlights: ['Textura de papel sepia', 'Bordes ornamentales', 'Tipografía Playfair'],
  },
  tech: {
    id: 'tech',
    category: 'minimalista',
    plan: 'pro',
    rating: 4.7,
    reviews: 321,
    isNew: true,
    isFeatured: false,
    popularity: 82,
    highlights: ['Estética futurista', 'Efectos neón y grid', 'Tipografía monoespaciada'],
  },
};

const CATEGORIES = [
  { id: 'todas', label: 'Todos' },
  { id: 'profesional', label: 'Profesional' },
  { id: 'creativo', label: 'Creativo' },
  { id: 'minimalista', label: 'Minimalista' },
] as const;

type CategoryId = (typeof CATEGORIES)[number]['id'];

const SORT_OPTIONS = [
  { id: 'populares', label: 'Populares' },
  { id: 'nuevas', label: 'Nuevas' },
  { id: 'az', label: 'A - Z' },
] as const;

type SortId = (typeof SORT_OPTIONS)[number]['id'];

const PLAN_BADGE: Record<PlanRequirement, { label: string; className: string; icon: typeof Check }> = {
  all: { label: 'Todos los planes', className: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: Check },
  basico: { label: 'Básico +', className: 'bg-amber-100 text-amber-800 border-amber-200', icon: Zap },
  pro: { label: 'Pro', className: 'premium-badge border-0 font-semibold', icon: Crown },
};

/* ============================================================
   Mock card factory
   ============================================================ */

const MOCK_SCHEDULE: Schedule = {
  monday: { open: true, start: '09:00', end: '18:00' },
  tuesday: { open: true, start: '09:00', end: '18:00' },
  wednesday: { open: true, start: '09:00', end: '18:00' },
  thursday: { open: true, start: '09:00', end: '18:00' },
  friday: { open: true, start: '09:00', end: '18:00' },
  saturday: { open: true, start: '10:00', end: '14:00' },
  sunday: { open: false, start: '00:00', end: '00:00' },
};

const EMPTY_SOCIAL: SocialLinks = {
  facebook: '',
  instagram: '',
  twitter: '',
  linkedin: '',
  youtube: '',
  tiktok: '',
  whatsapp: '',
  telegram: '',
};

const FONT_BY_TEMPLATE: Record<TemplateId, string> = {
  moderno: 'poppins',
  clasico: 'roboto',
  minimalista: 'raleway',
  elegante: 'playfair',
  dinamica: 'montserrat',
  corporativo: 'playfair',
  creativo: 'poppins',
  oscuro: 'inter',
  vintage: 'playfair',
  tech: 'inter',
};

const PRESET_BY_TEMPLATE: Record<TemplateId, (typeof COLOR_PRESETS)[number]> = {
  moderno: COLOR_PRESETS[0], // Esmeralda
  clasico: COLOR_PRESETS[1], // Oro
  minimalista: COLOR_PRESETS[7], // Grafito
  elegante: COLOR_PRESETS[2], // Corinto
  dinamica: COLOR_PRESETS[5], // Naranja
  corporativo: COLOR_PRESETS[6], // Esmeralda Oscuro
  creativo: COLOR_PRESETS[5], // Naranja
  oscuro: COLOR_PRESETS[0], // Esmeralda
  vintage: COLOR_PRESETS[1], // Oro
  tech: COLOR_PRESETS[4], // Cian
};

function makeMockCard(template: TemplateId): BusinessCard {
  const preset = PRESET_BY_TEMPLATE[template];
  return {
    id: `mock-${template}`,
    userId: 'mock-user',
    linkName: 'estudio-aurora',
    cardName: 'Estudio Creativo Aurora',
    description:
      'Diseño, branding y estrategia digital para marcas que quieren crecer. Creamos identidades memorables.',
    logo: '',
    coverPhoto: '',
    profilePhoto: '',
    template,
    primaryColor: preset.primary,
    secondaryColor: preset.secondary,
    backgroundColor: preset.background,
    textColor: preset.text,
    fontFamily: FONT_BY_TEMPLATE[template],
    fontSize: 16,
    customCSS: '',
    customJS: '',
    qrStyle: 'cuadrado',
    qrColor: preset.primary,
    qrBgColor: '#ffffff',
    qrLogo: '',
    qrGeneratedAt: new Date().toISOString(),
    qrExpiresAt: null,
    whatsappNumber: '525512345678',
    whatsappVerified: true,
    whatsappMessage: '¡Hola! Vi tu tarjeta digital y me gustaría más información sobre sus servicios.',
    schedule: { ...MOCK_SCHEDULE },
    services: [
      {
        id: 'svc-1',
        name: 'Diseño de Identidad',
        url: '',
        description: 'Logotipo, paleta y manual de marca completo.',
        photo: '',
      },
      {
        id: 'svc-2',
        name: 'Estrategia Digital',
        url: '',
        description: 'Plan de marketing y presencia online.',
        photo: '',
      },
    ],
    products: [],
    gallery: [],
    blog: [],
    testimonials: [
      {
        id: 'tst-1',
        name: 'Mariana López',
        text: 'Profesionales excepcionales. Transformaron por completo la imagen de nuestra marca.',
        photo: '',
        rating: 5,
      },
    ],
    team: [],
    socialLinks: {
      ...EMPTY_SOCIAL,
      facebook: 'https://facebook.com/estudio-aurora',
      instagram: 'https://instagram.com/estudio-aurora',
      linkedin: 'https://linkedin.com/company/estudio-aurora',
    },
    instagramEmbed: '',
    floatingFrames: [],
    banner: { enabled: false, title: '', text: '', imageUrl: '', linkUrl: '' },
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    privacyPolicy: '',
    terms: '',
    activeSections: ['detalles', 'servicios', 'testimonios', 'sociales', 'qr'],
    hideBrand: false,
    passwordProtected: false,
    cardPassword: '',
    views: 0,
    qrScans: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
    affiliateCode: '',
    affiliateClicks: 0,
  };
}

/* ============================================================
   Animation variants
   ============================================================ */

const gridContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const gridItem = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 220, damping: 24 },
  },
};

/* ============================================================
   Sub-components
   ============================================================ */

function StarRating({ rating, reviews, size = 'sm' }: { rating: number; reviews?: number; size?: 'sm' | 'md' }) {
  const starSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              starSize,
              i < Math.floor(rating)
                ? 'fill-amber-400 text-amber-400'
                : i < rating
                ? 'fill-amber-400/50 text-amber-400'
                : 'fill-muted text-muted-foreground/40'
            )}
          />
        ))}
      </div>
      <span className="text-xs font-semibold text-foreground">{rating.toFixed(1)}</span>
      {reviews !== undefined && (
        <span className="text-xs text-muted-foreground">({reviews.toLocaleString('es-MX')})</span>
      )}
    </div>
  );
}

function PlanBadge({ plan }: { plan: PlanRequirement }) {
  const config = PLAN_BADGE[plan];
  const Icon = config.icon;
  return (
    <Badge variant="outline" className={cn('gap-1 px-2 py-0.5 text-[11px] font-semibold', config.className)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

function MiniPreview({ card, onClick }: { card: BusinessCard; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Vista previa de plantilla ${card.template}`}
      className="group relative block w-full overflow-hidden rounded-xl border bg-muted/30 text-left focus-ring"
    >
      <div className="relative h-[340px] overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto w-[260px] origin-top scale-[0.92]">
          <CardPreview card={card} userPlan="pro" />
        </div>
        {/* bottom fade */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-card via-card/80 to-transparent" />
        {/* hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-emerald-950/0 transition-colors duration-300 group-hover:bg-emerald-950/30">
          <span
            className={cn(
              'inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-lg',
              'opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2'
            )}
          >
            <Eye className="h-4 w-4" />
            Vista previa
          </span>
        </div>
      </div>
    </button>
  );
}

function TemplateCard({
  template,
  meta,
  mockCard,
  onPreview,
  onUse,
}: {
  template: (typeof TEMPLATES)[number];
  meta: TemplateMeta;
  mockCard: BusinessCard;
  onPreview: () => void;
  onUse: () => void;
}) {
  return (
    <motion.div variants={gridItem} className="h-full">
      <Card className="card-hover relative flex h-full flex-col gap-4 overflow-hidden py-0">
        {/* Top corner: premium + plan + new badges */}
        <div className="absolute right-3 top-3 z-10 flex flex-col items-end gap-1.5">
          {template.premium && (
            <Badge className="border-0 premium-badge shadow-sm">
              <Crown className="h-3 w-3" /> Premium
            </Badge>
          )}
          <PlanBadge plan={meta.plan} />
          {meta.isNew && (
            <Badge className="border-0 bg-emerald-600 text-white shadow-sm">
              <Sparkles className="h-3 w-3" /> Nueva
            </Badge>
          )}
        </div>

        {/* Preview */}
        <div className="p-3 pb-0">
          <MiniPreview card={mockCard} onClick={onPreview} />
        </div>

        <CardContent className="flex flex-1 flex-col gap-3 px-5 pb-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-foreground">{template.name}</h3>
              {meta.isFeatured && (
                <Badge className="border-0 bg-amber-100 text-amber-800">
                  <Sparkles className="h-3 w-3" /> Destacada
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{template.description}</p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {meta.highlights.map((h) => (
              <span
                key={h}
                className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
              >
                <Check className="h-3 w-3" />
                {h}
              </span>
            ))}
          </div>

          <StarRating rating={meta.rating} reviews={meta.reviews} />

          <div className="mt-auto flex flex-col gap-2 pt-2 sm:flex-row">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
              onClick={onPreview}
            >
              <Eye className="h-4 w-4" />
              Vista previa
            </Button>
            <Button
              size="sm"
              className="flex-1 gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={onUse}
            >
              <Check className="h-4 w-4" />
              Usar plantilla
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function FeaturedTemplate({
  template,
  meta,
  mockCard,
  onPreview,
  onUse,
}: {
  template: (typeof TEMPLATES)[number];
  meta: TemplateMeta;
  mockCard: BusinessCard;
  onPreview: () => void;
  onUse: () => void;
}) {
  return (
    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-50 via-white to-amber-50 py-0 dark:from-emerald-950/30 dark:via-card dark:to-amber-950/20">
      {/* decorative blobs */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="relative grid items-center gap-8 p-6 lg:grid-cols-2 lg:p-10">
        {/* Left: info */}
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
            <Sparkles className="h-3.5 w-3.5" />
            Plantilla destacada
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tight text-balance lg:text-4xl">
              <span className="gradient-text">{template.name}</span>
            </h2>
            <p className="text-base text-muted-foreground text-balance lg:text-lg">{template.description}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <PlanBadge plan={meta.plan} />
            <StarRating rating={meta.rating} reviews={meta.reviews} size="md" />
            <Badge variant="outline" className="gap-1 border-emerald-200 text-emerald-700">
              <Layers className="h-3 w-3" />
              {meta.reviews.toLocaleString('es-MX')} usuarios
            </Badge>
          </div>

          <ul className="grid gap-2 sm:grid-cols-2">
            {meta.highlights.map((h) => (
              <li key={h} className="flex items-center gap-2 text-sm text-foreground">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white">
                  <Check className="h-3 w-3" />
                </span>
                {h}
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-2 pt-2 sm:flex-row">
            <Button
              size="lg"
              className="gap-2 bg-emerald-600 text-white shadow-md hover:bg-emerald-700"
              onClick={onUse}
            >
              <Check className="h-4 w-4" />
              Usar esta plantilla
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 border-emerald-200 bg-white/70 text-emerald-700 hover:bg-emerald-50"
              onClick={onPreview}
            >
              <Eye className="h-4 w-4" />
              Ver demostración
            </Button>
          </div>
        </div>

        {/* Right: large preview */}
        <div className="relative">
          <div className="gradient-border overflow-hidden rounded-2xl p-2 shadow-2xl">
            <div className="relative h-[420px] overflow-hidden rounded-xl bg-white">
              <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto w-[300px] origin-top scale-95">
                <CardPreview card={mockCard} userPlan="pro" />
              </div>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white via-white/80 to-transparent" />
            </div>
          </div>
          {/* floating badges */}
          <div className="absolute -right-3 top-6 hidden animate-float sm:block">
            <div className="rounded-xl border border-amber-200 bg-white px-3 py-2 shadow-lg">
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-bold text-amber-800">{meta.rating.toFixed(1)}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">Calificación</p>
            </div>
          </div>
          <div className="absolute -left-3 bottom-10 hidden animate-bounce-subtle sm:block">
            <div className="rounded-xl border border-emerald-200 bg-white px-3 py-2 shadow-lg">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-bold text-emerald-700">Animado</span>
              </div>
              <p className="text-[10px] text-muted-foreground">Efectos visuales</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function ComparisonSection({
  templates,
  onPreview,
}: {
  templates: (typeof TEMPLATES)[number][];
  onPreview: (id: TemplateId) => void;
}) {
  const comparisonFeatures = [
    { label: 'Velocidad de carga', values: ['Rápida', 'Muy rápida', 'Estándar'] },
    { label: 'Personalización', values: ['Alta', 'Media', 'Muy alta'] },
    { label: 'Animaciones', values: ['Suaves', 'Glassmorphism', 'Neón + grid'] },
    { label: 'Tipografía', values: ['Sans-serif', 'Inter', 'Monoespaciada'] },
    { label: 'Ideal para', values: ['Marcas modernas', 'Perfiles sobrios', 'Proyectos tech'] },
  ];

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 self-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 sm:self-start">
          <Layers className="h-3.5 w-3.5" />
          Comparativa
        </div>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Compara <span className="gradient-text">3 estilos</span> lado a lado
        </h2>
        <p className="text-muted-foreground">
          Encuentra la plantilla perfecta según la personalidad de tu marca.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {templates.map((tpl, idx) => {
          const meta = TEMPLATE_META[tpl.id];
          const mockCard = makeMockCard(tpl.id);
          return (
            <Card
              key={tpl.id}
              className={cn(
                'card-hover relative flex flex-col gap-4 overflow-hidden py-0',
                idx === 1 && 'ring-2 ring-emerald-500/40'
              )}
            >
              {idx === 1 && (
                <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 rounded-b-md bg-emerald-600 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                  Recomendada
                </div>
              )}
              <div className="px-3 pt-4">
                <div className="relative h-[220px] overflow-hidden rounded-lg border bg-muted/30">
                  <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto w-[200px] origin-top scale-90">
                    <CardPreview card={mockCard} userPlan="pro" />
                  </div>
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-card to-transparent" />
                </div>
              </div>
              <CardContent className="flex flex-1 flex-col gap-3 px-5 pb-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">{tpl.name}</h3>
                  <div className="flex items-center gap-1.5">
                    {tpl.premium && (
                      <Badge className="border-0 premium-badge">
                        <Crown className="h-3 w-3" /> Premium
                      </Badge>
                    )}
                    <PlanBadge plan={meta.plan} />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{tpl.description}</p>

                <ul className="space-y-2 pt-1 text-sm">
                  {comparisonFeatures.map((f) => (
                    <li key={f.label} className="flex items-center justify-between gap-2 border-b border-dashed border-border pb-1.5 last:border-0">
                      <span className="text-muted-foreground">{f.label}</span>
                      <span className="font-medium text-foreground">{f.values[idx]}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant="outline"
                  size="sm"
                  className="mt-auto gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  onClick={() => onPreview(tpl.id)}
                >
                  <Eye className="h-4 w-4" />
                  Ver detalle
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

function BeforeAfterComparison({ onUse }: { onUse: () => void }) {
  const rows = [
    { label: 'Actualización de datos', paper: 'Imprimir de nuevo', digital: 'Al instante' },
    { label: 'Código QR', paper: 'No incluye', digital: 'Permanente' },
    { label: 'Galería / Servicios', paper: 'Imposible', digital: 'Ilimitados' },
    { label: 'Estadísticas', paper: 'No medible', digital: 'Tiempo real' },
    { label: 'Costo por unidad', paper: '$50 - $200', digital: 'Desde $0' },
    { label: 'Tiempo de entrega', paper: '3 - 7 días', digital: 'Inmediato' },
    { label: 'Sostenibilidad', paper: 'Papel desechable', digital: '100% digital' },
  ];

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 self-center rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 sm:self-start">
          <Layers className="h-3.5 w-3.5" />
          Antes y Después
        </div>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Tarjeta de papel vs. <span className="gradient-text">tarjeta digital</span>
        </h2>
        <p className="text-muted-foreground">
          Moderniza tu presencia: olvídate de reimprimir y empieza a impresionar.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Traditional paper card */}
        <Card className="relative overflow-hidden border-dashed border-slate-300 bg-slate-50 py-0 dark:border-slate-700 dark:bg-slate-900/40">
          <div className="absolute left-3 top-3">
            <Badge variant="outline" className="border-slate-300 bg-white text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <FileText className="mr-1 h-3 w-3" /> Tarjeta de papel
            </Badge>
          </div>
          <div className="p-5 pt-12">
            {/* Mock paper card */}
            <div className="mx-auto mb-5 aspect-[1.75/1] w-full max-w-[320px] rotate-[-2deg] rounded-sm bg-white p-4 shadow-md">
              <p className="text-[10px] uppercase tracking-widest text-slate-400">profesional</p>
              <p className="mt-1 text-base font-bold text-slate-900">Ana Martín</p>
              <p className="text-[10px] text-slate-500">Gerente comercial</p>
              <div className="mt-2 h-px w-full bg-slate-200" />
              <p className="mt-1 text-[9px] text-slate-500">+52 55 1234 5678</p>
              <p className="text-[9px] text-slate-500">ana@empresa.com</p>
              <div className="mt-2 flex justify-end">
                <div className="h-6 w-6 rounded-sm border border-slate-200 bg-slate-100" />
              </div>
            </div>

            <ul className="space-y-2 text-sm">
              {rows.map((r) => (
                <li key={r.label} className="flex items-center justify-between gap-2 border-b border-dashed border-slate-200 pb-1.5 dark:border-slate-700">
                  <span className="text-muted-foreground">{r.label}</span>
                  <span className="font-medium text-slate-600 dark:text-slate-300">{r.paper}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        {/* Digital card */}
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-600 to-emerald-800 py-0 text-white">
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-amber-400/20 blur-3xl" />
          <div className="absolute left-3 top-3">
            <Badge className="border-0 bg-amber-400 text-amber-950">
              <Sparkles className="mr-1 h-3 w-3" /> Tarjeta digital
            </Badge>
          </div>
          <div className="relative p-5 pt-12">
            {/* Mock digital card */}
            <div className="mx-auto mb-5 aspect-[1.75/1] w-full max-w-[320px] rotate-[2deg] overflow-hidden rounded-lg bg-white p-0 shadow-xl">
              <div className="flex h-full">
                <div className="flex w-1/3 items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700 text-2xl font-bold text-white">
                  AM
                </div>
                <div className="flex w-2/3 flex-col justify-center p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Online</p>
                  <p className="text-sm font-bold text-slate-900">Ana Martín</p>
                  <p className="text-[9px] text-slate-500">Gerente comercial</p>
                  <div className="mt-1 flex items-center gap-1">
                    <div className="h-5 w-5 rounded-full bg-emerald-100" />
                    <div className="h-5 w-5 rounded-full bg-amber-100" />
                    <div className="h-5 w-5 rounded-full bg-rose-100" />
                  </div>
                </div>
              </div>
            </div>

            <ul className="space-y-2 text-sm">
              {rows.map((r) => (
                <li key={r.label} className="flex items-center justify-between gap-2 border-b border-white/15 pb-1.5">
                  <span className="text-emerald-50/90">{r.label}</span>
                  <span className="flex items-center gap-1 font-semibold text-white">
                    <Check className="h-3 w-3 text-amber-300" />
                    {r.digital}
                  </span>
                </li>
              ))}
            </ul>

            <Button
              className="mt-4 w-full gap-2 bg-amber-400 text-amber-950 hover:bg-amber-300"
              onClick={onUse}
            >
              <Sparkles className="h-4 w-4" />
              Cambiar a digital
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
}

function EmptyResults({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40">
        <Search className="h-6 w-6" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">Sin resultados</h3>
        <p className="text-sm text-muted-foreground">No encontramos plantillas con esos filtros. Prueba con otra categoría.</p>
      </div>
      <Button variant="outline" className="gap-1.5" onClick={onReset}>
        <ArrowLeft className="h-4 w-4" />
        Limpiar filtros
      </Button>
    </div>
  );
}

/* ============================================================
   Main Component
   ============================================================ */

export function TemplateGallery() {
  const navigate = useAppStore((s) => s.navigate);
  const currentUser = useAppStore((s) => s.currentUser);

  const [category, setCategory] = useState<CategoryId>('todas');
  const [sort, setSort] = useState<SortId>('populares');
  const [query, setQuery] = useState('');
  const [previewId, setPreviewId] = useState<TemplateId | null>(null);

  const mockCards = useMemo(() => {
    const map: Record<TemplateId, BusinessCard> = {} as Record<TemplateId, BusinessCard>;
    for (const t of TEMPLATES) {
      map[t.id] = makeMockCard(t.id);
    }
    return map;
  }, []);

  const featuredTemplate = useMemo(() => {
    const featured = TEMPLATES.find((t) => TEMPLATE_META[t.id].isFeatured) ?? TEMPLATES[0];
    return featured;
  }, []);

  const filteredTemplates = useMemo(() => {
    const items = TEMPLATES.map((t) => ({ template: t, meta: TEMPLATE_META[t.id] }));

    const filtered = items.filter(({ template, meta }) => {
      if (category !== 'todas' && meta.category !== category) return false;
      if (query.trim()) {
        const q = query.toLowerCase().trim();
        if (
          !template.name.toLowerCase().includes(q) &&
          !template.description.toLowerCase().includes(q) &&
          !meta.highlights.some((h) => h.toLowerCase().includes(q))
        ) {
          return false;
        }
      }
      return true;
    });

    const sorted = [...filtered];
    switch (sort) {
      case 'populares':
        sorted.sort((a, b) => b.meta.popularity - a.meta.popularity);
        break;
      case 'nuevas':
        sorted.sort((a, b) => Number(b.meta.isNew) - Number(a.meta.isNew) || b.meta.popularity - a.meta.popularity);
        break;
      case 'az':
        sorted.sort((a, b) => a.template.name.localeCompare(b.template.name, 'es'));
        break;
    }
    return sorted;
  }, [category, sort, query]);

  const comparisonTemplates = useMemo(() => {
    // Pick 3 distinct templates across different styles (one classic, two new).
    const ids: TemplateId[] = ['moderno', 'oscuro', 'tech'];
    return ids.map((id) => TEMPLATES.find((t) => t.id === id)!).filter(Boolean);
  }, []);

  const handleUse = (templateId: TemplateId) => {
    const tpl = TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return;
    if (!currentUser) {
      toast.info('Inicia sesión para usar esta plantilla', {
        description: `Plantilla "${tpl.name}" seleccionada.`,
        action: { label: 'Iniciar sesión', onClick: () => navigate('login') },
      });
      return;
    }
    toast.success(`Plantilla "${tpl.name}" seleccionada`, {
      description: 'Crea una nueva tarjeta desde tu panel para aplicarla.',
      action: { label: 'Ir al panel', onClick: () => navigate('dashboard') },
    });
    navigate('dashboard');
  };

  const handlePreview = (id: TemplateId) => setPreviewId(id);

  const resetFilters = () => {
    setCategory('todas');
    setSort('populares');
    setQuery('');
  };

  const previewTemplate = previewId
    ? TEMPLATES.find((t) => t.id === previewId) ?? null
    : null;
  const previewMeta = previewId ? TEMPLATE_META[previewId] : null;
  const previewMock = previewId ? mockCards[previewId] : null;

  return (
    <div className="flex min-h-screen flex-col bg-background mesh-gradient">
      {/* ====== Header ====== */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground hover:bg-emerald-50 hover:text-emerald-700"
            onClick={() => navigate(currentUser ? 'dashboard' : 'landing')}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Volver al Panel</span>
            <span className="sm:hidden">Volver</span>
          </Button>

          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 dark:border-emerald-900/50 dark:bg-emerald-950/30">
              <LayoutDashboard className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                {TEMPLATES.length} plantillas
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ====== Main ====== */}
      <main className="mx-auto w-full max-w-7xl flex-1 space-y-12 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        {/* Hero / Title */}
        <section className="space-y-3 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
            <Sparkles className="h-3.5 w-3.5" />
            Galería de Plantillas
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl">
            Elige el diseño que <span className="gradient-text">define tu marca</span>
          </h1>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground text-balance sm:mx-0 lg:text-lg">
            Explora nuestras plantillas profesionales, minimalistas y creativas. Cada una está
            optimizada para lucir perfecta en cualquier dispositivo. Personaliza colores, fuentes y
            secciones a tu gusto.
          </p>
        </section>

        {/* Featured template */}
        <FeaturedTemplate
          template={featuredTemplate}
          meta={TEMPLATE_META[featuredTemplate.id]}
          mockCard={mockCards[featuredTemplate.id]}
          onPreview={() => handlePreview(featuredTemplate.id)}
          onUse={() => handleUse(featuredTemplate.id)}
        />

        {/* Filter bar */}
        <section className="space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <Tabs
              value={category}
              onValueChange={(v) => setCategory(v as CategoryId)}
              className="w-full"
            >
              <TabsList className="flex h-auto w-full flex-nowrap gap-1 overflow-x-auto rounded-xl bg-muted/60 p-1 no-scrollbar">
                {CATEGORIES.map((c) => (
                  <TabsTrigger
                    key={c.id}
                    value={c.id}
                    className="flex-1 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-card dark:data-[state=active]:text-emerald-300 sm:text-sm"
                  >
                    {c.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar plantilla..."
                  className="h-9 w-full pl-9 sm:w-56"
                  aria-label="Buscar plantilla"
                />
              </div>
              <Select value={sort} onValueChange={(v) => setSort(v as SortId)}>
                <SelectTrigger className="h-9 w-full sm:w-44" aria-label="Ordenar por">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Grid */}
          {filteredTemplates.length === 0 ? (
            <EmptyResults onReset={resetFilters} />
          ) : (
            <motion.div
              variants={gridContainer}
              initial="hidden"
              animate="show"
              className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
            >
              {filteredTemplates.map(({ template, meta }) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  meta={meta}
                  mockCard={mockCards[template.id]}
                  onPreview={() => handlePreview(template.id)}
                  onUse={() => handleUse(template.id)}
                />
              ))}
            </motion.div>
          )}
        </section>

        {/* Comparison */}
        <ComparisonSection templates={comparisonTemplates} onPreview={handlePreview} />

        {/* Before / After — papel vs digital */}
        <BeforeAfterComparison onUse={() => handleUse('moderno')} />

        {/* CTA */}
        <section className="relative overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-600 to-emerald-800 px-6 py-10 text-center shadow-xl sm:px-10 lg:py-14">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-amber-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-emerald-300/20 blur-3xl" />
          <div className="relative mx-auto max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              ¿No encuentras lo que buscas?
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white text-balance sm:text-3xl lg:text-4xl">
              Personaliza tu tarjeta desde cero
            </h2>
            <p className="mx-auto max-w-xl text-sm text-emerald-50 text-balance sm:text-base">
              Si ninguna plantilla se ajusta a tu visión, empieza con un lienzo en blanco y diseña
              una experiencia única para tus clientes.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
              <Button
                size="lg"
                variant="secondary"
                className="gap-2 bg-white text-emerald-700 hover:bg-emerald-50"
                onClick={() => navigate(currentUser ? 'dashboard' : 'login')}
              >
                <Sparkles className="h-4 w-4" />
                Personalizar desde cero
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
                onClick={() => navigate('pricing')}
              >
                Ver planes
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* ====== Footer (sticky) ====== */}
      <footer className="mt-auto border-t border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-center sm:flex-row sm:px-6 sm:text-left lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md emerald-gradient text-white shadow-sm">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="text-sm">
              <p className="font-bold text-foreground">FTP Digital Plus</p>
              <p className="text-xs text-muted-foreground">Tarjetas de presentación digitales</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} FTP Digital Plus. Hecho con tecnología de punta en México.
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground hover:bg-emerald-50 hover:text-emerald-700"
            onClick={() => navigate('landing')}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Inicio
          </Button>
        </div>
      </footer>

      {/* ====== Preview Dialog ====== */}
      <Dialog open={!!previewTemplate} onOpenChange={(open) => !open && setPreviewId(null)}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-hidden p-0 sm:rounded-2xl">
          <DialogHeader className="border-b bg-gradient-to-br from-emerald-50 to-amber-50 px-6 py-4 dark:from-emerald-950/30 dark:to-amber-950/20">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <DialogTitle className="flex items-center gap-2 text-xl">
                {previewTemplate?.name}
                {previewMeta && <PlanBadge plan={previewMeta.plan} />}
              </DialogTitle>
              {previewMeta && (
                <StarRating rating={previewMeta.rating} reviews={previewMeta.reviews} size="md" />
              )}
            </div>
            <DialogDescription>{previewTemplate?.description}</DialogDescription>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto custom-scrollbar bg-muted/30 px-4 py-6 sm:px-6">
            <AnimatePresence mode="wait">
              {previewMock && (
                <motion.div
                  key={previewMock.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.25 }}
                  className="mx-auto max-w-md"
                >
                  <CardPreview card={previewMock} userPlan="pro" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <DialogFooter className="flex-col gap-2 border-t bg-background px-6 py-4 sm:flex-row sm:justify-between">
            <div className="flex flex-wrap gap-1.5">
              {previewMeta?.highlights.map((h) => (
                <span
                  key={h}
                  className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                >
                  <Check className="h-3 w-3" />
                  {h}
                </span>
              ))}
            </div>
            <div className="flex w-full gap-2 sm:w-auto">
              <Button
                variant="outline"
                className="flex-1 gap-1.5 sm:flex-none"
                onClick={() => setPreviewId(null)}
              >
                Cerrar
              </Button>
              <Button
                className="flex-1 gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700 sm:flex-none"
                onClick={() => {
                  if (previewId) {
                    handleUse(previewId);
                    setPreviewId(null);
                  }
                }}
              >
                <Check className="h-4 w-4" />
                Usar esta plantilla
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TemplateGallery;
