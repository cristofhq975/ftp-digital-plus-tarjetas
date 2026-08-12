'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Eye, Plus, Trash2, Edit, Save, Upload, X, Star,
  Check, Lock, AlertTriangle, Sparkles, QrCode as QrIcon, RefreshCw,
  CreditCard, Download, Code,
  ExternalLink, Image as ImageIcon, Crown, Menu, Video,
  Phone, MessageCircle, Send, BadgeCheck, Info, FileText,
  Search, ChevronDown, ChevronRight, Clock, Maximize2, Minimize2, Grip,
  Link2, AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { QRCodeCanvas } from 'qrcode.react';
import { useAppStore, useSelectedCard } from '@/lib/store';
import { EDITOR_SECTIONS, TEMPLATES, FONTS, COLOR_PRESETS } from '@/lib/plans';
import {
  BusinessCard, Service, Product, GalleryItem, BlogPost, Testimonial,
  TeamMember, FloatingFrame, Schedule, SocialLinks, Banner,
} from '@/lib/types';
import {
  fileToBase64, generateId, generateVerificationCode,
  getQrDaysRemaining, isQrExpired, formatCurrency, formatDate, formatPhone,
  buildWhatsappUrl,
} from '@/lib/card-utils';
import { DynamicIcon } from '@/components/dynamic-icon';
import { CardPreview } from '@/components/card-preview';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

// Secciones disponibles en plan Gratis (todas las demás están restringidas)
const FREE_PLAN_ALLOWED: string[] = ['detalles', 'plantillas', 'dinamica', 'horario', 'qr', 'whatsapp'];

// Secciones activables en la tarjeta (Administrar Secciones)
const TOGGLEABLE_SECTIONS = [
  { id: 'detalles', name: 'Detalles Básicos', description: 'Nombre, foto y descripción' },
  { id: 'servicios', name: 'Servicios', description: 'Lista de servicios que ofreces' },
  { id: 'productos', name: 'Productos', description: 'Catálogo de productos' },
  { id: 'galeria', name: 'Galería', description: 'Imágenes y videos' },
  { id: 'blog', name: 'Blog', description: 'Artículos y publicaciones' },
  { id: 'testimonios', name: 'Testimonios', description: 'Opiniones de clientes' },
  { id: 'equipo', name: 'Equipo y Citas', description: 'Miembros del equipo y citas' },
  { id: 'sociales', name: 'Enlaces Sociales', description: 'Redes sociales' },
  { id: 'qr', name: 'Código QR', description: 'Código QR descargable' },
  { id: 'horario', name: 'Horario', description: 'Horario de atención' },
];

const WEEK_DAYS: { key: keyof Schedule; label: string }[] = [
  { key: 'monday', label: 'Lunes' },
  { key: 'tuesday', label: 'Martes' },
  { key: 'wednesday', label: 'Miércoles' },
  { key: 'thursday', label: 'Jueves' },
  { key: 'friday', label: 'Viernes' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
];

interface SectionProps {
  card: BusinessCard;
  updateCard: (cardId: string, updates: Partial<BusinessCard>) => void;
  plan: string;
}

// ---------------------------------------------------------------------------
// Helpers UI reutilizables
// ---------------------------------------------------------------------------

/** Encabezado estándar de cada sección de edición. */
function SectionHeader({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="mb-6 flex items-start gap-3 sm:mb-8">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md">
        <DynamicIcon name={icon} className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

/** Aviso de función no disponible en plan Gratis. */
function RestrictedNotice({ onUpgrade }: { onUpgrade: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 p-10 text-center dark:border-amber-700/50 dark:bg-amber-950/20">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300">
        <Lock className="h-8 w-8" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-foreground">Función no disponible en plan Gratis</h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Mejora al plan Básico para desbloquear esta y muchas más funciones para tu tarjeta digital.
        </p>
      </div>
      <Button onClick={onUpgrade} className="bg-amber-500 text-white hover:bg-amber-600">
        <Crown className="h-4 w-4" /> Mejorar a Básico
      </Button>
    </div>
  );
}

/** Campo de carga de imagen con preview. */
function ImageUpload({
  label, value, onChange, aspect = 'square', description,
}: {
  label: string;
  value: string;
  onChange: (base64: string) => void;
  aspect?: 'square' | 'wide' | 'circle';
  description?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten archivos de imagen');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe superar los 5 MB');
      return;
    }
    try {
      const base64 = await fileToBase64(file);
      onChange(base64);
      toast.success('Imagen cargada correctamente');
    } catch {
      toast.error('No se pudo cargar la imagen');
    }
    if (inputRef.current) inputRef.current.value = '';
  };

  const aspectClass =
    aspect === 'wide' ? 'h-20 w-32' :
    aspect === 'circle' ? 'h-20 w-20 rounded-full' :
    'h-20 w-20';

  return (
    <div>
      <Label className="text-sm font-medium">{label}</Label>
      {description && <p className="mb-2 text-xs text-muted-foreground">{description}</p>}
      <div className="mt-2 flex items-center gap-3">
        {value ? (
          <div className="relative">
            <div className={cn('overflow-hidden rounded-lg border', aspectClass)}>
              <img src={value} alt={label} className="h-full w-full object-cover" />
            </div>
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-white shadow-md hover:bg-destructive/90"
              aria-label="Eliminar imagen"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <div className={cn('flex items-center justify-center border-2 border-dashed bg-muted/30 text-muted-foreground', aspectClass)}>
            <ImageIcon className="h-6 w-6" />
          </div>
        )}
        <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        <Button variant="outline" size="sm" type="button" onClick={() => inputRef.current?.click()}>
          <Upload className="h-4 w-4" /> Subir imagen
        </Button>
      </div>
    </div>
  );
}

/** Campo de color con label y muestra. */
function ColorField({
  label, value, onChange,
}: {
  label: string;
  value: string;
  onChange: (color: string) => void;
}) {
  return (
    <div>
      <Label className="text-sm font-medium">{label}</Label>
      <div className="mt-2 flex items-center gap-2">
        <div className="relative h-9 w-9 overflow-hidden rounded-md border">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute -left-1 -top-1 h-12 w-12 cursor-pointer border-0 p-0"
            aria-label={label}
          />
        </div>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-28 font-mono text-xs"
        />
      </div>
    </div>
  );
}

/** Botón para mejorar de plan. */
function useUpgrade() {
  const navigate = useAppStore(s => s.navigate);
  return () => navigate('pricing');
}

// ---------------------------------------------------------------------------
// 1. Detalles Básicos
// ---------------------------------------------------------------------------

function DetallesSection({ card, updateCard }: SectionProps) {
  // Completitud: calcula qué porcentaje de los campos clave están completos
  const completitud = useMemo(() => {
    const fields = [
      { ok: !!card.cardName?.trim(), weight: 15 },
      { ok: !!card.linkName?.trim() && card.linkName.length >= 3, weight: 10 },
      { ok: !!card.description?.trim() && card.description.length >= 20, weight: 20 },
      { ok: !!card.profilePhoto, weight: 15 },
      { ok: !!card.coverPhoto, weight: 10 },
      { ok: !!card.logo, weight: 10 },
      { ok: !!card.whatsappNumber?.trim(), weight: 15 },
      { ok: card.services.length > 0, weight: 5 },
    ];
    const total = fields.reduce((sum, f) => sum + f.weight, 0);
    const got = fields.reduce((sum, f) => sum + (f.ok ? f.weight : 0), 0);
    return Math.round((got / total) * 100);
  }, [card]);

  const completitudLabel =
    completitud >= 80 ? '¡Excelente!' :
    completitud >= 50 ? 'Buen progreso' :
    completitud >= 25 ? 'Recién empezando' : 'Completa los campos';

  return (
    <div className="space-y-6">
      <SectionHeader icon="User" title="Detalles Básicos" description="Información principal de tu tarjeta" />

      {/* Completitud progress bar */}
      <Card className="border-emerald-200/60 bg-gradient-to-br from-emerald-50/40 to-amber-50/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={cn(
                'flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-sm',
                completitud >= 80 ? 'bg-gradient-to-br from-emerald-500 to-emerald-700' :
                completitud >= 50 ? 'bg-gradient-to-br from-amber-500 to-orange-600' :
                'bg-gradient-to-br from-slate-400 to-slate-600'
              )}>
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Completitud de la tarjeta</p>
                <p className="text-xs text-muted-foreground">{completitudLabel}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-slate-800">{completitud}%</p>
            </div>
          </div>
          <Progress value={completitud} className="mt-3 h-2" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-5">
          <div>
            <Label htmlFor="linkName" className="flex items-center gap-1.5">
              <Link2 className="h-3.5 w-3.5 text-emerald-600" />
              Nombre del enlace (URL)
            </Label>
            <div className="mt-2 flex items-center gap-1">
              <span className="rounded-l-md border border-r-0 bg-muted px-3 py-2 text-sm text-muted-foreground">
                ftpdigitalplus.com/
              </span>
              <Input
                id="linkName"
                value={card.linkName}
                onChange={(e) => updateCard(card.id, { linkName: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                className="rounded-l-none"
                placeholder="mi-nombre"
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Solo letras minúsculas, números y guiones. Mínimo 3 caracteres.</p>

            {/* Live URL preview */}
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50/60 px-3 py-2.5 ring-1 ring-emerald-200/40">
              <ExternalLink className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-700">Vista previa del enlace público</p>
                <p className="truncate font-mono text-sm font-semibold text-emerald-800">
                  ftpdigitalplus.com/t/<span className="text-amber-700">{card.linkName || 'mi-enlace'}</span>
                </p>
              </div>
              {card.linkName.length >= 3 ? (
                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                  <Check className="mr-1 h-3 w-3" /> Disponible
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                  <AlertTriangle className="mr-1 h-3 w-3" /> Muy corto
                </Badge>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="cardName">Nombre en la tarjeta</Label>
            <Input
              id="cardName"
              className="mt-2"
              value={card.cardName}
              onChange={(e) => updateCard(card.id, { cardName: e.target.value })}
              placeholder="Ej. Juan Pérez / Mi Empresa"
              maxLength={60}
            />
            <p className="mt-1 text-right text-xs text-muted-foreground">
              {card.cardName.length}/60 caracteres
            </p>
          </div>

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              className="mt-2"
              value={card.description}
              onChange={(e) => updateCard(card.id, { description: e.target.value })}
              placeholder="Una breve descripción sobre ti o tu negocio"
              rows={3}
              maxLength={300}
            />
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className={cn(
                'font-medium',
                card.description.length < 20 ? 'text-amber-600' : 'text-emerald-600'
              )}>
                {card.description.length < 20 ? `Te faltan ${20 - card.description.length} caracteres para un mínimo recomendado` : 'Longitud adecuada'}
              </span>
              <span className="text-muted-foreground">{card.description.length}/300</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-5 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Imágenes</h3>
          <ImageUpload
            label="Logo"
            description="Aparece en la cabecera de tu tarjeta (recomendado 400x400px)"
            value={card.logo}
            onChange={(logo) => updateCard(card.id, { logo })}
            aspect="square"
          />
          <ImageUpload
            label="Foto de portada"
            description="Imagen de fondo en la parte superior (recomendado 1200x400px)"
            value={card.coverPhoto}
            onChange={(coverPhoto) => updateCard(card.id, { coverPhoto })}
            aspect="wide"
          />
          <ImageUpload
            label="Foto de perfil"
            description="Tu foto principal que verán los visitantes"
            value={card.profilePhoto}
            onChange={(profilePhoto) => updateCard(card.id, { profilePhoto })}
            aspect="circle"
          />
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. Plantillas
// ---------------------------------------------------------------------------

function PlantillasSection({ card, updateCard, plan }: SectionProps) {
  const upgrade = useUpgrade();
  const isFree = plan === 'gratis';
  // En plan gratis, solo 'moderno' y 'minimalista' están disponibles
  const lockedForFree = (id: string) => isFree && !['moderno', 'minimalista'].includes(id);

  return (
    <div className="space-y-6">
      <SectionHeader icon="Layout" title="Plantillas" description="Elige el diseño de tu tarjeta" />

      {isFree && (
        <Alert className="border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-700/50 dark:bg-amber-950/30 dark:text-amber-200">
          <Crown className="h-4 w-4" />
          <AlertTitle>Plantillas premium disponibles</AlertTitle>
          <AlertDescription>
            Con el plan Gratis solo puedes usar 2 plantillas. Mejora a Básico para desbloquear todas.
            <Button variant="link" className="h-auto p-0 ml-2 text-amber-700 underline" onClick={upgrade}>
              Mejorar ahora
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {TEMPLATES.map((tpl) => {
          const locked = lockedForFree(tpl.id);
          const selected = card.template === tpl.id;
          return (
            <button
              key={tpl.id}
              type="button"
              disabled={locked}
              onClick={() => {
                if (locked) return;
                updateCard(card.id, { template: tpl.id as BusinessCard['template'] });
                toast.success(`Plantilla "${tpl.name}" aplicada`);
              }}
              className={cn(
                'group relative overflow-hidden rounded-xl border-2 p-4 text-left transition-all',
                selected
                  ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30'
                  : 'border-border hover:border-emerald-400 hover:bg-muted/40',
                locked && 'cursor-not-allowed opacity-60'
              )}
            >
              <div
                className="mb-3 h-20 w-full rounded-md"
                style={{
                  background: tpl.id === 'minimalista'
                    ? `#ffffff`
                    : `linear-gradient(135deg, ${card.primaryColor}, ${card.secondaryColor})`,
                }}
              >
                <div className="flex h-full items-center justify-center">
                  {tpl.id === 'minimalista' && (
                    <div className="h-10 w-10 rounded-full" style={{ background: card.primaryColor }} />
                  )}
                  {tpl.id === 'moderno' && (
                    <div className="flex gap-1">
                      <div className="h-2 w-8 rounded-full bg-white/80" />
                      <div className="h-2 w-4 rounded-full bg-white/60" />
                    </div>
                  )}
                  {tpl.id === 'clasico' && (
                    <div className="text-sm font-serif font-bold text-white">Aa</div>
                  )}
                  {tpl.id === 'elegante' && (
                    <div className="text-lg font-serif italic text-amber-200">Aa</div>
                  )}
                  {tpl.id === 'dinamica' && (
                    <Sparkles className="h-6 w-6 text-white animate-pulse" />
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">{tpl.name}</p>
                  <p className="text-xs text-muted-foreground">{tpl.description}</p>
                </div>
                {selected && (
                  <Badge className="bg-emerald-600 text-white">
                    <Check className="mr-1 h-3 w-3" /> Activa
                  </Badge>
                )}
                {locked && (
                  <Badge variant="outline" className="border-amber-400 text-amber-600">
                    <Lock className="mr-1 h-3 w-3" /> Premium
                  </Badge>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3. Tarjeta Dinámica
// ---------------------------------------------------------------------------

function DinamicaSection({ card, updateCard, plan }: SectionProps) {
  const isFree = plan === 'gratis';
  const upgrade = useUpgrade();
  const isDynamic = card.template === 'dinamica';
  const [animation, setAnimation] = useState<string>('float');
  const [gradientDir, setGradientDir] = useState<string>('diagonal');

  const animations = [
    { id: 'float', name: 'Flotación', desc: 'Movimiento suave vertical' },
    { id: 'pulse', name: 'Pulso', desc: 'Escala sutil continua' },
    { id: 'shine', name: 'Brillo', desc: 'Destello periódico' },
  ];
  const directions = [
    { id: 'vertical', name: 'Vertical' },
    { id: 'horizontal', name: 'Horizontal' },
    { id: 'diagonal', name: 'Diagonal' },
    { id: 'radial', name: 'Radial' },
  ];

  if (isFree) {
    return (
      <div className="space-y-6">
        <SectionHeader icon="Sparkles" title="Tarjeta Dinámica" description="Apariencia dinámica de la tarjeta" />
        <RestrictedNotice onUpgrade={upgrade} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader icon="Sparkles" title="Tarjeta Dinámica" description="Apariencia dinámica de la tarjeta" />

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-semibold">Modo dinámico</Label>
              <p className="text-sm text-muted-foreground">
                Activa animaciones y efectos visuales en tu tarjeta
              </p>
            </div>
            <Switch
              checked={isDynamic}
              onCheckedChange={(checked) => {
                updateCard(card.id, { template: checked ? 'dinamica' : 'moderno' });
                toast.success(checked ? 'Modo dinámico activado' : 'Modo dinámico desactivado');
              }}
            />
          </div>
          <Separator />
          <div className={cn('space-y-4 transition-opacity', !isDynamic && 'pointer-events-none opacity-50')}>
            <div>
              <Label className="text-sm font-semibold">Tipo de animación</Label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {animations.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => {
                      setAnimation(a.id);
                      toast.success(`Animación "${a.name}" seleccionada`);
                    }}
                    className={cn(
                      'rounded-lg border-2 p-3 text-center transition',
                      animation === a.id
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30'
                        : 'border-border hover:border-emerald-400'
                    )}
                  >
                    <Sparkles className="mx-auto mb-1 h-4 w-4 text-emerald-600" />
                    <p className="text-xs font-semibold">{a.name}</p>
                    <p className="text-[10px] text-muted-foreground">{a.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold">Dirección del degradado</Label>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {directions.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      setGradientDir(d.id);
                      toast.success(`Dirección "${d.name}" aplicada`);
                    }}
                    className={cn(
                      'rounded-lg border-2 p-3 text-center text-xs font-semibold transition',
                      gradientDir === d.id
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30'
                        : 'border-border hover:border-emerald-400'
                    )}
                  >
                    {d.name}
                  </button>
                ))}
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Las animaciones se aplican automáticamente al activar el modo dinámico.
                La dirección del degradado afecta la portada de tu tarjeta.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 4. Horario de Atención
// ---------------------------------------------------------------------------

function HorarioSection({ card, updateCard }: SectionProps) {
  const updateDay = (day: keyof Schedule, field: 'open' | 'start' | 'end', value: string | boolean) => {
    updateCard(card.id, {
      schedule: {
        ...card.schedule,
        [day]: { ...card.schedule[day], [field]: value },
      },
    });
  };

  return (
    <div className="space-y-6">
      <SectionHeader icon="Clock" title="Horario de Atención" description="Configura tu horario semanal" />

      <Card>
        <CardContent className="space-y-2 p-4">
          {WEEK_DAYS.map(({ key, label }) => {
            const day = card.schedule[key];
            return (
              <div
                key={key}
                className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <Switch
                    checked={day.open}
                    onCheckedChange={(checked) => updateDay(key, 'open', checked)}
                  />
                  <span className="w-24 font-medium">{label}</span>
                  {day.open ? (
                    <Badge className="bg-emerald-600 text-white">Abierto</Badge>
                  ) : (
                    <Badge variant="secondary">Cerrado</Badge>
                  )}
                </div>
                {day.open && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={day.start}
                      onChange={(e) => updateDay(key, 'start', e.target.value)}
                      className="w-32"
                    />
                    <span className="text-muted-foreground">—</span>
                    <Input
                      type="time"
                      value={day.end}
                      onChange={(e) => updateDay(key, 'end', e.target.value)}
                      className="w-32"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 5. Personalizar QR
// ---------------------------------------------------------------------------

function QrSection({ card, updateCard, plan }: SectionProps) {
  const generateQr = useAppStore(s => s.generateQr);
  const isFree = plan === 'gratis';
  const qrExpired = isFree && card.qrExpiresAt ? isQrExpired(card) : false;
  const daysLeft = isFree && card.qrExpiresAt ? getQrDaysRemaining(card) : 0;
  const qrCanvasRef = useRef<HTMLDivElement | null>(null);

  // Live QR value (whatsapp URL or fallback)
  const whatsappUrl = card.whatsappNumber
    ? buildWhatsappUrl(card.whatsappNumber, card.whatsappMessage || 'Hola, vi tu tarjeta digital')
    : '';
  const qrValue = qrExpired
    ? 'https://ftpdigitalplus.com/qr-expirado'
    : whatsappUrl || `https://ftpdigitalplus.com/t/${card.linkName || 'enlace'}`;

  const handleGenerate = () => {
    generateQr(card.id);
    toast.success(isFree ? 'QR generado. Vence en 7 días.' : 'QR permanente generado.');
  };

  const handleDownloadQr = () => {
    const canvas = qrCanvasRef.current?.querySelector('canvas');
    if (!canvas) {
      toast.error('No se pudo generar la imagen del QR');
      return;
    }
    try {
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `qr-${card.linkName || 'tarjeta'}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success('QR descargado como PNG');
    } catch {
      toast.error('No se pudo descargar el QR');
    }
  };

  const handleTestQr = () => {
    if (!card.whatsappNumber) {
      toast.error('Configura primero tu número de WhatsApp');
      return;
    }
    if (qrExpired) {
      toast.error('Tu QR ha expirado. Regénéralo primero.');
      return;
    }
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    toast.success('Abriendo WhatsApp en nueva pestaña…');
  };

  // QR error-correction level (qrcode.react expects L | M | Q | H)
  const qrLevel: 'L' | 'M' | 'Q' | 'H' = 'M';

  return (
    <div className="space-y-6">
      <SectionHeader icon="QrCode" title="Personalizar QR" description="Estilo y apariencia del código QR" />

      {isFree && (
        <Alert className="border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-700/50 dark:bg-amber-950/30 dark:text-amber-200">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Plan Gratis: QR con vencimiento</AlertTitle>
          <AlertDescription>
            Tu código QR expira cada 7 días. Debes regenerarlo para seguir compartiéndolo.
            {card.qrExpiresAt && !qrExpired && (
              <span className="ml-1 font-semibold">Expira en {daysLeft} día{daysLeft !== 1 ? 's' : ''}.</span>
            )}
            {qrExpired && (
              <span className="ml-1 font-bold text-red-600">Tu QR ha expirado. Regenera ahora.</span>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="space-y-4 p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Estilo del QR</h3>
            <RadioGroup
              value={card.qrStyle}
              onValueChange={(v) => updateCard(card.id, { qrStyle: v as BusinessCard['qrStyle'] })}
              className="grid grid-cols-3 gap-2"
            >
              {[
                { id: 'cuadrado', name: 'Cuadrado' },
                { id: 'redondo', name: 'Redondo' },
                { id: 'puntos', name: 'Puntos' },
              ].map((s) => (
                <Label
                  key={s.id}
                  htmlFor={`qr-style-${s.id}`}
                  className={cn(
                    'flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 p-3 transition',
                    card.qrStyle === s.id
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30'
                      : 'border-border hover:border-emerald-400'
                  )}
                >
                  <RadioGroupItem value={s.id} id={`qr-style-${s.id}`} className="sr-only" />
                  <QrIcon className="h-8 w-8 text-emerald-600" />
                  <span className="text-xs font-medium">{s.name}</span>
                </Label>
              ))}
            </RadioGroup>

            <div className="grid grid-cols-2 gap-3">
              <ColorField
                label="Color del QR"
                value={card.qrColor}
                onChange={(qrColor) => updateCard(card.id, { qrColor })}
              />
              <ColorField
                label="Color de fondo"
                value={card.qrBgColor}
                onChange={(qrBgColor) => updateCard(card.id, { qrBgColor })}
              />
            </div>

            <ImageUpload
              label="Logo central (opcional)"
              value={card.qrLogo}
              onChange={(qrLogo) => updateCard(card.id, { qrLogo })}
              aspect="square"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-4 p-5">
            <h3 className="self-start text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Vista previa en vivo
            </h3>
            {/* Live QR preview using QRCodeCanvas */}
            <div
              ref={qrCanvasRef}
              className="relative rounded-xl border-2 p-4 transition-colors"
              style={{ borderColor: card.qrColor, background: card.qrBgColor }}
            >
              <QRCodeCanvas
                value={qrValue}
                size={180}
                fgColor={card.qrColor}
                bgColor={card.qrBgColor}
                level={qrLevel}
                marginSize={1}
                imageSettings={card.qrLogo ? {
                  src: card.qrLogo,
                  height: 36,
                  width: 36,
                  excavate: true,
                } : undefined}
              />
              {/* Live badge */}
              <span className="absolute -right-2 -top-2 flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-md">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />
                EN VIVO
              </span>
            </div>
            <p className="text-center text-xs text-muted-foreground">
              {isFree
                ? 'El QR redirige a WhatsApp y expira cada 7 días.'
                : 'El QR es permanente y redirige a WhatsApp.'}
            </p>

            {/* Action buttons */}
            <div className="grid w-full grid-cols-1 gap-2">
              <Button onClick={handleGenerate} className="w-full bg-emerald-600 text-white hover:bg-emerald-700">
                <RefreshCw className="h-4 w-4" />
                {card.qrGeneratedAt ? 'Regenerar QR' : 'Generar QR'}
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={handleDownloadQr}
                  className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                >
                  <Download className="h-4 w-4" /> Descargar PNG
                </Button>
                <Button
                  variant="outline"
                  onClick={handleTestQr}
                  className="border-amber-200 text-amber-700 hover:bg-amber-50"
                >
                  <ExternalLink className="h-4 w-4" /> Probar QR
                </Button>
              </div>
            </div>
            {card.qrGeneratedAt && (
              <p className="text-xs text-muted-foreground">
                Generado: {formatDate(card.qrGeneratedAt)}
              </p>
            )}
            {!card.whatsappNumber && (
              <p className="flex items-center gap-1.5 text-[11px] text-amber-600">
                <AlertTriangle className="h-3 w-3" />
                Configura tu número de WhatsApp para activar el QR.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 6. Servicios (CRUD)
// ---------------------------------------------------------------------------

function emptyService(): Service {
  return { id: generateId(), name: '', url: '', description: '', photo: '' };
}

function ServiciosSection({ card, updateCard }: SectionProps) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState<Service>(emptyService());

  const openAdd = () => {
    setEditing(null);
    setForm(emptyService());
    setOpen(true);
  };
  const openEdit = (s: Service) => {
    setEditing(s);
    setForm({ ...s });
    setOpen(true);
  };
  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error('El nombre del servicio es obligatorio');
      return;
    }
    if (editing) {
      updateCard(card.id, { services: card.services.map(s => s.id === form.id ? form : s) });
      toast.success('Servicio actualizado');
    } else {
      updateCard(card.id, { services: [...card.services, form] });
      toast.success('Servicio agregado');
    }
    setOpen(false);
  };
  const handleDelete = (id: string) => {
    updateCard(card.id, { services: card.services.filter(s => s.id !== id) });
    toast.success('Servicio eliminado');
  };

  return (
    <div className="space-y-6">
      <SectionHeader icon="Briefcase" title="Servicios" description="Administra los servicios que ofreces" />

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {card.services.length} servicio{card.services.length !== 1 ? 's' : ''} configurado{card.services.length !== 1 ? 's' : ''}
        </p>
        <Button onClick={openAdd} className="bg-emerald-600 text-white hover:bg-emerald-700">
          <Plus className="h-4 w-4" /> Agregar servicio
        </Button>
      </div>

      {card.services.length === 0 ? (
        <EmptyState icon="Briefcase" text="Aún no has agregado servicios" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {card.services.map(s => (
            <Card key={s.id}>
              <CardContent className="p-4">
                <div className="flex gap-3">
                  {s.photo ? (
                    <img src={s.photo} alt={s.name} className="h-16 w-16 rounded-lg object-cover" />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                      <BriefcaseServiceIcon />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate font-semibold">{s.name}</h4>
                    {s.description && <p className="line-clamp-2 text-xs text-muted-foreground">{s.description}</p>}
                    {s.url && (
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-600 hover:underline">
                        <ExternalLink className="h-3 w-3" /> {s.url}
                      </a>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(s)}>
                    <Edit className="h-3 w-3" /> Editar
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(s.id)}>
                    <Trash2 className="h-3 w-3" /> Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CrudDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? 'Editar servicio' : 'Nuevo servicio'}
        description="Completa la información del servicio"
        onSave={handleSave}
      >
        <div className="space-y-4">
          <div>
            <Label>Nombre *</Label>
            <Input className="mt-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej. Consultoría empresarial" />
          </div>
          <div>
            <Label>URL (opcional)</Label>
            <Input className="mt-2" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." />
          </div>
          <div>
            <Label>Descripción</Label>
            <Textarea className="mt-2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
          </div>
          <ImageUpload label="Foto" value={form.photo} onChange={(photo) => setForm({ ...form, photo })} />
        </div>
      </CrudDialog>
    </div>
  );
}

function BriefcaseServiceIcon() {
  return <Sparkles className="h-6 w-6" />;
}

// ---------------------------------------------------------------------------
// 7. Productos (CRUD)
// ---------------------------------------------------------------------------

function emptyProduct(): Product {
  return { id: generateId(), name: '', price: 0, currency: 'MXN', description: '', image: '', url: '' };
}

function ProductosSection({ card, updateCard }: SectionProps) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<Product>(emptyProduct());

  const openAdd = () => { setEditing(null); setForm(emptyProduct()); setOpen(true); };
  const openEdit = (p: Product) => { setEditing(p); setForm({ ...p }); setOpen(true); };
  const handleSave = () => {
    if (!form.name.trim()) { toast.error('El nombre es obligatorio'); return; }
    if (editing) {
      updateCard(card.id, { products: card.products.map(p => p.id === form.id ? form : p) });
      toast.success('Producto actualizado');
    } else {
      updateCard(card.id, { products: [...card.products, form] });
      toast.success('Producto agregado');
    }
    setOpen(false);
  };
  const handleDelete = (id: string) => {
    updateCard(card.id, { products: card.products.filter(p => p.id !== id) });
    toast.success('Producto eliminado');
  };

  return (
    <div className="space-y-6">
      <SectionHeader icon="ShoppingBag" title="Productos" description="Catálogo de productos" />

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{card.products.length} producto(s)</p>
        <Button onClick={openAdd} className="bg-emerald-600 text-white hover:bg-emerald-700">
          <Plus className="h-4 w-4" /> Agregar producto
        </Button>
      </div>

      {card.products.length === 0 ? (
        <EmptyState icon="ShoppingBag" text="Aún no has agregado productos" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {card.products.map(p => (
            <Card key={p.id}>
              <CardContent className="p-4">
                <div className="flex gap-3">
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="h-16 w-16 rounded-lg object-cover" />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                      <ImageIcon className="h-6 w-6" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate font-semibold">{p.name}</h4>
                    <p className="font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(p.price, p.currency)}</p>
                    {p.description && <p className="line-clamp-2 text-xs text-muted-foreground">{p.description}</p>}
                  </div>
                </div>
                <div className="mt-3 flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(p)}><Edit className="h-3 w-3" /> Editar</Button>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(p.id)}><Trash2 className="h-3 w-3" /> Eliminar</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CrudDialog
        open={open} onOpenChange={setOpen}
        title={editing ? 'Editar producto' : 'Nuevo producto'}
        description="Información del producto"
        onSave={handleSave}
      >
        <div className="space-y-4">
          <div>
            <Label>Nombre *</Label>
            <Input className="mt-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Precio</Label>
              <Input className="mt-2" type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Moneda</Label>
              <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
                <SelectTrigger className="mt-2 w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MXN">MXN - Peso mexicano</SelectItem>
                  <SelectItem value="USD">USD - Dólar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Descripción</Label>
            <Textarea className="mt-2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
          </div>
          <div>
            <Label>URL de compra (opcional)</Label>
            <Input className="mt-2" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." />
          </div>
          <ImageUpload label="Imagen del producto" value={form.image} onChange={(image) => setForm({ ...form, image })} />
        </div>
      </CrudDialog>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 8. Feed de Instagram
// ---------------------------------------------------------------------------

function InstagramSection({ card, updateCard }: SectionProps) {
  return (
    <div className="space-y-6">
      <SectionHeader icon="Instagram" title="Feed de Instagram" description="Incrusta tu perfil de Instagram" />

      <Card>
        <CardContent className="space-y-4 p-5">
          <div>
            <Label>URL del perfil de Instagram</Label>
            <Input
              className="mt-2"
              value={card.instagramEmbed}
              onChange={(e) => updateCard(card.id, { instagramEmbed: e.target.value })}
              placeholder="https://instagram.com/tu_usuario"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Pega la URL completa de tu perfil de Instagram.
            </p>
          </div>

          {card.instagramEmbed && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Tu feed de Instagram aparecerá como un enlace en tu tarjeta.
                <a href={card.instagramEmbed} target="_blank" rel="noopener noreferrer" className="ml-2 inline-flex items-center gap-1 font-medium text-emerald-600 hover:underline">
                  Ver perfil <ExternalLink className="h-3 w-3" />
                </a>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 9. Galería (CRUD)
// ---------------------------------------------------------------------------

function GaleriaSection({ card, updateCard }: SectionProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAddFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const items: GalleryItem[] = [];
    for (const file of files) {
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');
      if (!isVideo && !isImage) continue;
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`El archivo ${file.name} supera los 10 MB`);
        continue;
      }
      try {
        const url = await fileToBase64(file);
        items.push({
          id: generateId(),
          type: isImage ? 'image' : 'video',
          url,
          caption: '',
        });
      } catch {
        toast.error(`No se pudo cargar ${file.name}`);
      }
    }
    if (items.length > 0) {
      updateCard(card.id, { gallery: [...card.gallery, ...items] });
      toast.success(`${items.length} elemento(s) agregado(s)`);
    }
    if (inputRef.current) inputRef.current.value = '';
  };

  const updateCaption = (id: string, caption: string) => {
    updateCard(card.id, { gallery: card.gallery.map(g => g.id === id ? { ...g, caption } : g) });
  };
  const handleDelete = (id: string) => {
    updateCard(card.id, { gallery: card.gallery.filter(g => g.id !== id) });
    toast.success('Elemento eliminado');
  };

  return (
    <div className="space-y-6">
      <SectionHeader icon="Images" title="Galería" description="Imágenes y videos de tu tarjeta" />

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{card.gallery.length} elemento(s)</p>
        <div>
          <input ref={inputRef} type="file" accept="image/*,video/*" multiple onChange={handleAddFiles} className="hidden" />
          <Button onClick={() => inputRef.current?.click()} className="bg-emerald-600 text-white hover:bg-emerald-700">
            <Upload className="h-4 w-4" /> Subir archivos
          </Button>
        </div>
      </div>

      {card.gallery.length === 0 ? (
        <EmptyState icon="Images" text="Tu galería está vacía" />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {card.gallery.map(g => (
            <Card key={g.id}>
              <CardContent className="p-2">
                <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
                  {g.type === 'image' ? (
                    <img src={g.url} alt={g.caption || 'Galería'} className="h-full w-full object-cover" />
                  ) : (
                    <video src={g.url} className="h-full w-full object-cover" controls />
                  )}
                  <button
                    onClick={() => handleDelete(g.id)}
                    className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-white shadow-md hover:bg-destructive/90"
                    aria-label="Eliminar"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                  {g.type === 'video' && (
                    <div className="absolute left-1 top-1">
                      <Badge className="bg-black/70 text-white"><Video className="mr-1 h-3 w-3" /> Video</Badge>
                    </div>
                  )}
                </div>
                <Input
                  className="mt-2 text-xs"
                  placeholder="Descripción..."
                  value={g.caption}
                  onChange={(e) => updateCaption(g.id, e.target.value)}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 10. Blog (CRUD)
// ---------------------------------------------------------------------------

function emptyBlogPost(): BlogPost {
  return { id: generateId(), title: '', description: '', image: '', date: new Date().toISOString() };
}

function BlogSection({ card, updateCard }: SectionProps) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [form, setForm] = useState<BlogPost>(emptyBlogPost());

  const openAdd = () => { setEditing(null); setForm(emptyBlogPost()); setOpen(true); };
  const openEdit = (b: BlogPost) => { setEditing(b); setForm({ ...b }); setOpen(true); };
  const handleSave = () => {
    if (!form.title.trim()) { toast.error('El título es obligatorio'); return; }
    if (editing) {
      updateCard(card.id, { blog: card.blog.map(b => b.id === form.id ? form : b) });
      toast.success('Publicación actualizada');
    } else {
      updateCard(card.id, { blog: [form, ...card.blog] });
      toast.success('Publicación agregada');
    }
    setOpen(false);
  };
  const handleDelete = (id: string) => {
    updateCard(card.id, { blog: card.blog.filter(b => b.id !== id) });
    toast.success('Publicación eliminada');
  };

  return (
    <div className="space-y-6">
      <SectionHeader icon="FileText" title="Blog" description="Artículos y publicaciones" />

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{card.blog.length} publicación(es)</p>
        <Button onClick={openAdd} className="bg-emerald-600 text-white hover:bg-emerald-700">
          <Plus className="h-4 w-4" /> Nueva publicación
        </Button>
      </div>

      {card.blog.length === 0 ? (
        <EmptyState icon="FileText" text="Aún no has publicado artículos" />
      ) : (
        <div className="space-y-3">
          {card.blog.map(b => (
            <Card key={b.id}>
              <CardContent className="flex gap-4 p-4">
                {b.image ? (
                  <img src={b.image} alt={b.title} className="h-20 w-20 shrink-0 rounded-lg object-cover" />
                ) : (
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                    <FileText className="h-6 w-6" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold">{b.title}</h4>
                  <p className="text-xs text-muted-foreground">{formatDate(b.date)}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{b.description}</p>
                  <div className="mt-2 flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(b)}><Edit className="h-3 w-3" /> Editar</Button>
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(b.id)}><Trash2 className="h-3 w-3" /> Eliminar</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CrudDialog
        open={open} onOpenChange={setOpen}
        title={editing ? 'Editar publicación' : 'Nueva publicación'}
        description="Información del artículo"
        onSave={handleSave}
      >
        <div className="space-y-4">
          <div>
            <Label>Título *</Label>
            <Input className="mt-2" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <Label>Descripción</Label>
            <Textarea className="mt-2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} />
          </div>
          <div>
            <Label>Fecha</Label>
            <Input className="mt-2" type="date" value={form.date.slice(0, 10)} onChange={(e) => setForm({ ...form, date: new Date(e.target.value).toISOString() })} />
          </div>
          <ImageUpload label="Imagen destacada" value={form.image} onChange={(image) => setForm({ ...form, image })} />
        </div>
      </CrudDialog>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 11. Testimonios (CRUD)
// ---------------------------------------------------------------------------

function emptyTestimonial(): Testimonial {
  return { id: generateId(), name: '', text: '', photo: '', rating: 5 };
}

function TestimoniosSection({ card, updateCard }: SectionProps) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState<Testimonial>(emptyTestimonial());

  const openAdd = () => { setEditing(null); setForm(emptyTestimonial()); setOpen(true); };
  const openEdit = (t: Testimonial) => { setEditing(t); setForm({ ...t }); setOpen(true); };
  const handleSave = () => {
    if (!form.name.trim()) { toast.error('El nombre es obligatorio'); return; }
    if (editing) {
      updateCard(card.id, { testimonials: card.testimonials.map(t => t.id === form.id ? form : t) });
      toast.success('Testimonio actualizado');
    } else {
      updateCard(card.id, { testimonials: [...card.testimonials, form] });
      toast.success('Testimonio agregado');
    }
    setOpen(false);
  };
  const handleDelete = (id: string) => {
    updateCard(card.id, { testimonials: card.testimonials.filter(t => t.id !== id) });
    toast.success('Testimonio eliminado');
  };

  return (
    <div className="space-y-6">
      <SectionHeader icon="Quote" title="Testimonios" description="Opiniones de tus clientes" />

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{card.testimonials.length} testimonio(s)</p>
        <Button onClick={openAdd} className="bg-emerald-600 text-white hover:bg-emerald-700">
          <Plus className="h-4 w-4" /> Agregar testimonio
        </Button>
      </div>

      {card.testimonials.length === 0 ? (
        <EmptyState icon="Quote" text="Aún no has agregado testimonios" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {card.testimonials.map(t => (
            <Card key={t.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {t.photo ? (
                    <img src={t.photo} alt={t.name} className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                      {t.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate font-semibold">{t.name}</h4>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={cn('h-3 w-3', i < t.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground')} />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="mt-2 text-sm italic text-muted-foreground">"{t.text}"</p>
                <div className="mt-3 flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(t)}><Edit className="h-3 w-3" /> Editar</Button>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(t.id)}><Trash2 className="h-3 w-3" /> Eliminar</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CrudDialog
        open={open} onOpenChange={setOpen}
        title={editing ? 'Editar testimonio' : 'Nuevo testimonio'}
        description="Opinión del cliente"
        onSave={handleSave}
      >
        <div className="space-y-4">
          <div>
            <Label>Nombre *</Label>
            <Input className="mt-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label>Calificación</Label>
            <div className="mt-2 flex gap-1">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} type="button" onClick={() => setForm({ ...form, rating: n })}>
                  <Star className={cn('h-7 w-7 transition', n <= form.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground hover:text-amber-300')} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>Testimonio</Label>
            <Textarea className="mt-2" value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} rows={3} />
          </div>
          <ImageUpload label="Foto del cliente (opcional)" value={form.photo} onChange={(photo) => setForm({ ...form, photo })} aspect="circle" />
        </div>
      </CrudDialog>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 12. Marcos Flotantes (CRUD)
// ---------------------------------------------------------------------------

function emptyFrame(): FloatingFrame {
  return { id: generateId(), title: '', url: '' };
}

function MarcosSection({ card, updateCard }: SectionProps) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<FloatingFrame | null>(null);
  const [form, setForm] = useState<FloatingFrame>(emptyFrame());

  const openAdd = () => { setEditing(null); setForm(emptyFrame()); setOpen(true); };
  const openEdit = (f: FloatingFrame) => { setEditing(f); setForm({ ...f }); setOpen(true); };
  const handleSave = () => {
    if (!form.title.trim()) { toast.error('El título es obligatorio'); return; }
    if (!form.url.trim()) { toast.error('La URL es obligatoria'); return; }
    if (editing) {
      updateCard(card.id, { floatingFrames: card.floatingFrames.map(f => f.id === form.id ? form : f) });
      toast.success('Marco actualizado');
    } else {
      updateCard(card.id, { floatingFrames: [...card.floatingFrames, form] });
      toast.success('Marco agregado');
    }
    setOpen(false);
  };
  const handleDelete = (id: string) => {
    updateCard(card.id, { floatingFrames: card.floatingFrames.filter(f => f.id !== id) });
    toast.success('Marco eliminado');
  };

  return (
    <div className="space-y-6">
      <SectionHeader icon="Frame" title="Marcos Flotantes" description="Ventanas a webs externas (iframe)" />

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Los marcos flotantes permiten incrustar contenido externo (mapas, formularios, videos) dentro de tu tarjeta.
        </AlertDescription>
      </Alert>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{card.floatingFrames.length} marco(s)</p>
        <Button onClick={openAdd} className="bg-emerald-600 text-white hover:bg-emerald-700">
          <Plus className="h-4 w-4" /> Agregar marco
        </Button>
      </div>

      {card.floatingFrames.length === 0 ? (
        <EmptyState icon="Frame" text="Aún no has agregado marcos flotantes" />
      ) : (
        <div className="space-y-3">
          {card.floatingFrames.map(f => (
            <Card key={f.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="min-w-0 flex-1">
                  <h4 className="truncate font-semibold">{f.title}</h4>
                  <a href={f.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:underline">
                    <ExternalLink className="h-3 w-3" /> {f.url}
                  </a>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(f)}><Edit className="h-3 w-3" /></Button>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(f.id)}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CrudDialog
        open={open} onOpenChange={setOpen}
        title={editing ? 'Editar marco' : 'Nuevo marco'}
        description="Información del marco flotante"
        onSave={handleSave}
      >
        <div className="space-y-4">
          <div>
            <Label>Título *</Label>
            <Input className="mt-2" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ej. Ubicación en mapa" />
          </div>
          <div>
            <Label>URL del contenido a incrustar *</Label>
            <Input className="mt-2" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." />
            <p className="mt-1 text-xs text-muted-foreground">Pega aquí la URL de Google Maps, YouTube, Calendly, etc.</p>
          </div>
        </div>
      </CrudDialog>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 13. Equipo y Citas (CRUD)
// ---------------------------------------------------------------------------

function emptyTeamMember(): TeamMember {
  return { id: generateId(), name: '', role: '', photo: '', bio: '', appointmentDuration: 30, appointmentPrice: 0, isPaid: false };
}

function EquipoSection({ card, updateCard }: SectionProps) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [form, setForm] = useState<TeamMember>(emptyTeamMember());

  const openAdd = () => { setEditing(null); setForm(emptyTeamMember()); setOpen(true); };
  const openEdit = (m: TeamMember) => { setEditing(m); setForm({ ...m }); setOpen(true); };
  const handleSave = () => {
    if (!form.name.trim()) { toast.error('El nombre es obligatorio'); return; }
    if (editing) {
      updateCard(card.id, { team: card.team.map(m => m.id === form.id ? form : m) });
      toast.success('Miembro actualizado');
    } else {
      updateCard(card.id, { team: [...card.team, form] });
      toast.success('Miembro agregado');
    }
    setOpen(false);
  };
  const handleDelete = (id: string) => {
    updateCard(card.id, { team: card.team.filter(m => m.id !== id) });
    toast.success('Miembro eliminado');
  };

  return (
    <div className="space-y-6">
      <SectionHeader icon="Users" title="Equipo y Citas" description="Gestiona tu equipo y reservas" />

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{card.team.length} miembro(s)</p>
        <Button onClick={openAdd} className="bg-emerald-600 text-white hover:bg-emerald-700">
          <Plus className="h-4 w-4" /> Agregar miembro
        </Button>
      </div>

      {card.team.length === 0 ? (
        <EmptyState icon="Users" text="Aún no has agregado miembros al equipo" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {card.team.map(m => (
            <Card key={m.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {m.photo ? (
                    <img src={m.photo} alt={m.name} className="h-14 w-14 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-lg font-bold text-white">
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate font-semibold">{m.name}</h4>
                    <p className="text-xs text-emerald-600">{m.role}</p>
                    {m.bio && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{m.bio}</p>}
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <Badge variant="outline">{m.appointmentDuration} min</Badge>
                      {m.isPaid && <Badge className="bg-amber-500 text-white">{formatCurrency(m.appointmentPrice)}</Badge>}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(m)}><Edit className="h-3 w-3" /> Editar</Button>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(m.id)}><Trash2 className="h-3 w-3" /> Eliminar</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CrudDialog
        open={open} onOpenChange={setOpen}
        title={editing ? 'Editar miembro' : 'Nuevo miembro'}
        description="Información del miembro del equipo"
        onSave={handleSave}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Nombre *</Label>
              <Input className="mt-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label>Rol / Puesto</Label>
              <Input className="mt-2" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Ej. Diseñador" />
            </div>
          </div>
          <div>
            <Label>Biografía</Label>
            <Textarea className="mt-2" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Duración de cita (minutos)</Label>
              <Input className="mt-2" type="number" min={5} step={5} value={form.appointmentDuration} onChange={(e) => setForm({ ...form, appointmentDuration: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Precio (MXN)</Label>
              <Input className="mt-2" type="number" min={0} value={form.appointmentPrice} onChange={(e) => setForm({ ...form, appointmentPrice: Number(e.target.value) })} disabled={!form.isPaid} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={form.isPaid} onCheckedChange={(checked) => setForm({ ...form, isPaid: checked })} />
            <Label>Cita de pago (requiere pago previo)</Label>
          </div>
          <ImageUpload label="Foto del miembro" value={form.photo} onChange={(photo) => setForm({ ...form, photo })} aspect="circle" />
        </div>
      </CrudDialog>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 14. Enlaces Sociales
// ---------------------------------------------------------------------------

const SOCIAL_FIELDS: { key: keyof SocialLinks; label: string; placeholder: string; color: string }[] = [
  { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/...', color: '#1877F2' },
  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/...', color: '#E4405F' },
  { key: 'twitter', label: 'Twitter / X', placeholder: 'https://twitter.com/...', color: '#000000' },
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/...', color: '#0A66C2' },
  { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/...', color: '#FF0000' },
  { key: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@...', color: '#000000' },
  { key: 'whatsapp', label: 'WhatsApp (número)', placeholder: '525512345678', color: '#25D366' },
  { key: 'telegram', label: 'Telegram', placeholder: 'https://t.me/...', color: '#0088CC' },
];

function SocialesSection({ card, updateCard }: SectionProps) {
  const update = (key: keyof SocialLinks, value: string) => {
    updateCard(card.id, { socialLinks: { ...card.socialLinks, [key]: value } });
  };

  return (
    <div className="space-y-6">
      <SectionHeader icon="Share2" title="Enlaces Sociales" description="Tus redes sociales" />

      <Card>
        <CardContent className="space-y-4 p-5">
          {SOCIAL_FIELDS.map(f => (
            <div key={f.key}>
              <Label className="flex items-center gap-2 text-sm font-medium">
                <span className="h-3 w-3 rounded-full" style={{ background: f.color }} />
                {f.label}
              </Label>
              <Input
                className="mt-2"
                value={card.socialLinks[f.key]}
                onChange={(e) => update(f.key, e.target.value)}
                placeholder={f.placeholder}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 15. Bandera / Anuncio
// ---------------------------------------------------------------------------

function BanderaSection({ card, updateCard }: SectionProps) {
  const banner: Banner = card.banner;
  const update = (updates: Partial<Banner>) => {
    updateCard(card.id, { banner: { ...card.banner, ...updates } });
  };

  return (
    <div className="space-y-6">
      <SectionHeader icon="Flag" title="Bandera / Anuncio" description="Ventana emergente promocional" />

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-semibold">Activar anuncio</Label>
              <p className="text-sm text-muted-foreground">Muestra una ventana emergente en tu tarjeta</p>
            </div>
            <Switch checked={banner.enabled} onCheckedChange={(enabled) => update({ enabled })} />
          </div>

          <Separator />

          <div className={cn('space-y-4 transition-opacity', !banner.enabled && 'pointer-events-none opacity-50')}>
            <div>
              <Label>Título</Label>
              <Input className="mt-2" value={banner.title} onChange={(e) => update({ title: e.target.value })} placeholder="Ej. ¡Promoción especial!" />
            </div>
            <div>
              <Label>Texto</Label>
              <Textarea className="mt-2" value={banner.text} onChange={(e) => update({ text: e.target.value })} rows={3} placeholder="Describe tu promoción o anuncio" />
            </div>
            <div>
              <Label>URL de destino (opcional)</Label>
              <Input className="mt-2" value={banner.linkUrl} onChange={(e) => update({ linkUrl: e.target.value })} placeholder="https://..." />
            </div>
            <ImageUpload label="Imagen del anuncio (opcional)" value={banner.imageUrl} onChange={(imageUrl) => update({ imageUrl })} aspect="wide" />

            {banner.enabled && (banner.title || banner.text) && (
              <Alert className="border-emerald-300 bg-emerald-50 dark:border-emerald-700/50 dark:bg-emerald-950/20">
                <AlertTitle>Vista previa del anuncio</AlertTitle>
                <AlertDescription>
                  <div className="mt-2 rounded-lg bg-white p-3 shadow dark:bg-background">
                    {banner.imageUrl && <img src={banner.imageUrl} alt="" className="mb-2 h-24 w-full rounded object-cover" />}
                    {banner.title && <p className="font-bold text-emerald-700">{banner.title}</p>}
                    {banner.text && <p className="text-sm text-muted-foreground">{banner.text}</p>}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 16. Fuentes
// ---------------------------------------------------------------------------

function FuentesSection({ card, updateCard }: SectionProps) {
  return (
    <div className="space-y-6">
      <SectionHeader icon="Type" title="Fuentes" description="Personaliza tipografía y colores" />

      <Card>
        <CardContent className="space-y-5 p-5">
          <div>
            <Label className="text-sm font-semibold">Familia tipográfica</Label>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {FONTS.map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => updateCard(card.id, { fontFamily: f.id })}
                  className={cn(
                    'rounded-lg border-2 p-3 text-center transition',
                    card.fontFamily === f.id
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30'
                      : 'border-border hover:border-emerald-400'
                  )}
                >
                  <p className="text-base font-semibold" style={{ fontFamily: f.css }}>Aa</p>
                  <p className="mt-1 text-xs text-muted-foreground">{f.name}</p>
                </button>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Tamaño de fuente</Label>
              <Badge variant="secondary">{card.fontSize}px</Badge>
            </div>
            <Slider
              className="mt-3"
              min={12}
              max={24}
              step={1}
              value={[card.fontSize]}
              onValueChange={([v]) => updateCard(card.id, { fontSize: v })}
            />
            <div className="mt-1 flex justify-between text-xs text-muted-foreground">
              <span>12px</span><span>24px</span>
            </div>
          </div>

          <Separator />

          <div>
            <Label className="text-sm font-semibold">Presets de color</Label>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {COLOR_PRESETS.map(p => {
                const isSelected = card.primaryColor === p.primary && card.secondaryColor === p.secondary;
                return (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => updateCard(card.id, {
                      primaryColor: p.primary,
                      secondaryColor: p.secondary,
                      backgroundColor: p.background,
                      textColor: p.text,
                    })}
                    className={cn(
                      'overflow-hidden rounded-lg border-2 transition',
                      isSelected ? 'border-emerald-600' : 'border-border hover:border-emerald-400'
                    )}
                  >
                    <div className="flex h-10" style={{ background: `linear-gradient(135deg, ${p.primary}, ${p.secondary})` }} />
                    <p className="bg-background px-2 py-1 text-xs font-medium">{p.name}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <ColorField label="Color primario" value={card.primaryColor} onChange={(primaryColor) => updateCard(card.id, { primaryColor })} />
            <ColorField label="Color secundario" value={card.secondaryColor} onChange={(secondaryColor) => updateCard(card.id, { secondaryColor })} />
            <ColorField label="Color de fondo" value={card.backgroundColor} onChange={(backgroundColor) => updateCard(card.id, { backgroundColor })} />
            <ColorField label="Color de texto" value={card.textColor} onChange={(textColor) => updateCard(card.id, { textColor })} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 17. Avanzado (CSS/JS)
// ---------------------------------------------------------------------------

function AvanzadoSection({ card, updateCard }: SectionProps) {
  return (
    <div className="space-y-6">
      <SectionHeader icon="Code" title="Avanzado (CSS/JS)" description="Código personalizado para usuarios avanzados" />

      <Alert className="border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-700/50 dark:bg-amber-950/30 dark:text-amber-200">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Advertencia para usuarios avanzados</AlertTitle>
        <AlertDescription>
          El código personalizado puede afectar el funcionamiento de tu tarjeta.
          Asegúrate de probarlo cuidadosamente. Solo para usuarios con conocimientos técnicos.
        </AlertDescription>
      </Alert>

      <Card>
        <CardContent className="space-y-4 p-5">
          <div>
            <Label className="flex items-center gap-2 text-sm font-semibold">
              <Code className="h-4 w-4" /> CSS personalizado
            </Label>
            <Textarea
              className="mt-2 font-mono text-xs"
              rows={8}
              value={card.customCSS}
              onChange={(e) => updateCard(card.id, { customCSS: e.target.value })}
              placeholder={'/* Ejemplo */\n.card-section {\n  border-radius: 16px;\n}'}
            />
          </div>

          <div>
            <Label className="flex items-center gap-2 text-sm font-semibold">
              <Code className="h-4 w-4" /> JavaScript personalizado
            </Label>
            <Textarea
              className="mt-2 font-mono text-xs"
              rows={8}
              value={card.customJS}
              onChange={(e) => updateCard(card.id, { customJS: e.target.value })}
              placeholder={'// Ejemplo\nconsole.log("Hola desde mi tarjeta");'}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 18. Motores de Búsqueda (SEO)
// ---------------------------------------------------------------------------

function MotoresSection({ card, updateCard }: SectionProps) {
  return (
    <div className="space-y-6">
      <SectionHeader icon="Search" title="Motores de Búsqueda (SEO)" description="Optimiza tu tarjeta para buscadores" />

      <Card>
        <CardContent className="space-y-4 p-5">
          <div>
            <Label>Título SEO</Label>
            <Input
              className="mt-2"
              value={card.seoTitle}
              onChange={(e) => updateCard(card.id, { seoTitle: e.target.value })}
              placeholder="Título que aparecerá en Google"
              maxLength={60}
            />
            <p className="mt-1 text-right text-xs text-muted-foreground">{card.seoTitle.length}/60</p>
          </div>
          <div>
            <Label>Descripción SEO</Label>
            <Textarea
              className="mt-2"
              value={card.seoDescription}
              onChange={(e) => updateCard(card.id, { seoDescription: e.target.value })}
              placeholder="Descripción para los resultados de búsqueda"
              rows={3}
              maxLength={160}
            />
            <p className="mt-1 text-right text-xs text-muted-foreground">{card.seoDescription.length}/160</p>
          </div>
          <div>
            <Label>Palabras clave</Label>
            <Input
              className="mt-2"
              value={card.seoKeywords}
              onChange={(e) => updateCard(card.id, { seoKeywords: e.target.value })}
              placeholder="palabra1, palabra2, palabra3"
            />
            <p className="mt-1 text-xs text-muted-foreground">Separa las palabras con comas.</p>
          </div>

          {(card.seoTitle || card.seoDescription) && (
            <div>
              <Label className="text-sm font-semibold">Vista previa en Google</Label>
              <div className="mt-2 rounded-lg border p-3">
                <p className="text-xs text-emerald-700">{`ftpdigitalplus.com/${card.linkName}`}</p>
                <p className="text-base font-medium text-blue-800 dark:text-blue-300">{card.seoTitle || card.cardName}</p>
                <p className="text-sm text-muted-foreground">{card.seoDescription || card.description}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 19. Políticas de Privacidad
// ---------------------------------------------------------------------------

function PrivacidadSection({ card, updateCard }: SectionProps) {
  return (
    <div className="space-y-6">
      <SectionHeader icon="Shield" title="Políticas de Privacidad" description="Texto legal de privacidad" />

      <Card>
        <CardContent className="space-y-3 p-5">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Este texto aparecerá en una página de privacidad dentro de tu tarjeta digital.
            </AlertDescription>
          </Alert>
          <Textarea
            rows={14}
            value={card.privacyPolicy}
            onChange={(e) => updateCard(card.id, { privacyPolicy: e.target.value })}
            placeholder="Escribe aquí tu política de privacidad..."
            className="text-sm"
          />
          <p className="text-right text-xs text-muted-foreground">{card.privacyPolicy.length} caracteres</p>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 20. Términos y Condiciones
// ---------------------------------------------------------------------------

function TerminosSection({ card, updateCard }: SectionProps) {
  return (
    <div className="space-y-6">
      <SectionHeader icon="ScrollText" title="Términos y Condiciones" description="Texto legal de términos" />

      <Card>
        <CardContent className="space-y-3 p-5">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Este texto aparecerá en una página de términos dentro de tu tarjeta digital.
            </AlertDescription>
          </Alert>
          <Textarea
            rows={14}
            value={card.terms}
            onChange={(e) => updateCard(card.id, { terms: e.target.value })}
            placeholder="Escribe aquí tus términos y condiciones..."
            className="text-sm"
          />
          <p className="text-right text-xs text-muted-foreground">{card.terms.length} caracteres</p>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 21. Administrar Secciones
// ---------------------------------------------------------------------------

function SeccionesSection({ card, updateCard }: SectionProps) {
  const toggleSection = (sectionId: string) => {
    const isActive = card.activeSections.includes(sectionId);
    const newSections = isActive
      ? card.activeSections.filter(s => s !== sectionId)
      : [...card.activeSections, sectionId];
    updateCard(card.id, { activeSections: newSections });
    toast.success(isActive ? 'Sección oculta' : 'Sección visible');
  };

  return (
    <div className="space-y-6">
      <SectionHeader icon="Settings" title="Administrar Secciones" description="Activa o desactiva módulos de tu tarjeta" />

      <Card>
        <CardContent className="space-y-3 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Secciones de la tarjeta</h3>
          {TOGGLEABLE_SECTIONS.map(s => {
            const checked = card.activeSections.includes(s.id);
            return (
              <div key={s.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <Checkbox checked={checked} onCheckedChange={() => toggleSection(s.id)} id={`sec-${s.id}`} />
                  <div>
                    <Label htmlFor={`sec-${s.id}`} className="cursor-pointer font-medium">{s.name}</Label>
                    <p className="text-xs text-muted-foreground">{s.description}</p>
                  </div>
                </div>
                <Badge variant={checked ? 'default' : 'secondary'} className={checked ? 'bg-emerald-600 text-white' : ''}>
                  {checked ? 'Visible' : 'Oculta'}
                </Badge>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Opciones avanzadas</h3>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label className="font-medium">Ocultar marca FTP</Label>
              <p className="text-xs text-muted-foreground">Elimina el crédito "FTP Digital Plus" del pie de tu tarjeta</p>
            </div>
            <Switch checked={card.hideBrand} onCheckedChange={(hideBrand) => updateCard(card.id, { hideBrand })} />
          </div>

          <div className="space-y-3 rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Proteger con contraseña</Label>
                <p className="text-xs text-muted-foreground">Solicita una contraseña para ver tu tarjeta</p>
              </div>
              <Switch checked={card.passwordProtected} onCheckedChange={(passwordProtected) => updateCard(card.id, { passwordProtected })} />
            </div>
            {card.passwordProtected && (
              <div>
                <Label>Contraseña de la tarjeta</Label>
                <Input
                  className="mt-2"
                  type="text"
                  value={card.cardPassword}
                  onChange={(e) => updateCard(card.id, { cardPassword: e.target.value })}
                  placeholder="Contraseña que verán los visitantes"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 22. Configuración WhatsApp
// ---------------------------------------------------------------------------

function WhatsappSection({ card, updateCard }: SectionProps) {
  const [code, setCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);

  const handleSendCode = () => {
    if (!card.whatsappNumber || card.whatsappNumber.replace(/[^0-9]/g, '').length < 10) {
      toast.error('Ingresa un número de WhatsApp válido con código de país');
      return;
    }
    const generated = generateVerificationCode();
    setCode(generated);
    setCodeSent(true);
    toast.info(`Código de verificación: ${generated}`, {
      description: 'En un entorno real, este código se enviaría por WhatsApp.',
      duration: 8000,
    });
  };

  const handleVerify = () => {
    if (enteredCode === code && code) {
      updateCard(card.id, { whatsappVerified: true });
      toast.success('Número de WhatsApp verificado correctamente');
      setCodeSent(false);
      setCode('');
      setEnteredCode('');
    } else {
      toast.error('El código de verificación es incorrecto');
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader icon="MessageCircle" title="Configuración WhatsApp" description="Verifica tu número de WhatsApp" />

      <Card>
        <CardContent className="space-y-4 p-5">
          <div>
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Phone className="h-4 w-4" /> Número de WhatsApp (con código de país)
            </Label>
            <Input
              className="mt-2"
              value={card.whatsappNumber}
              onChange={(e) => updateCard(card.id, { whatsappNumber: e.target.value.replace(/[^0-9]/g, '') })}
              placeholder="525512345678"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Ejemplo: 52 (México) + 55 (CDMX) + 12345678. Sin espacios ni símbolos.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-lg border p-3">
            {card.whatsappVerified ? (
              <>
                <BadgeCheck className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="text-sm font-semibold text-emerald-700">Número verificado</p>
                  <p className="text-xs text-muted-foreground">{formatPhone(card.whatsappNumber)}</p>
                </div>
              </>
            ) : (
              <>
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="text-sm font-semibold text-amber-700">Sin verificar</p>
                  <p className="text-xs text-muted-foreground">Verifica tu número para activar el QR</p>
                </div>
              </>
            )}
          </div>

          {!card.whatsappVerified && (
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="mb-3 text-sm font-medium">Verificación del número</p>
              {!codeSent ? (
                <Button onClick={handleSendCode} className="bg-emerald-600 text-white hover:bg-emerald-700">
                  <Send className="h-4 w-4" /> Enviar código de verificación
                </Button>
              ) : (
                <div className="space-y-3">
                  <div>
                    <Label>Código de verificación (6 dígitos)</Label>
                    <Input
                      className="mt-2 font-mono text-lg tracking-widest"
                      maxLength={6}
                      value={enteredCode}
                      onChange={(e) => setEnteredCode(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="000000"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleVerify} className="bg-emerald-600 text-white hover:bg-emerald-700">
                      <Check className="h-4 w-4" /> Verificar
                    </Button>
                    <Button variant="outline" onClick={handleSendCode}>Reenviar código</Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Código generado: <span className="font-mono font-bold">{code}</span> (demostración)
                  </p>
                </div>
              )}
            </div>
          )}

          <Separator />

          <div>
            <Label className="flex items-center gap-2 text-sm font-medium">
              <MessageCircle className="h-4 w-4" /> Mensaje predeterminado
            </Label>
            <Textarea
              className="mt-2"
              rows={3}
              value={card.whatsappMessage}
              onChange={(e) => updateCard(card.id, { whatsappMessage: e.target.value })}
              placeholder="Mensaje que se enviará al escanear el QR"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Este mensaje se enviará automáticamente cuando alguien escanee tu código QR.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 23. Fondos Virtuales NFC
// ---------------------------------------------------------------------------

function FondosSection({ card }: SectionProps) {
  const buildNfcSvg = (orientation: 'horizontal' | 'vertical') => {
    const isH = orientation === 'horizontal';
    const w = isH ? 600 : 340;
    const h = isH ? 340 : 600;
    const initials = card.cardName.charAt(0).toUpperCase() || '?';
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${card.primaryColor}" />
          <stop offset="100%" stop-color="${card.secondaryColor}" />
        </linearGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="url(#g1)" rx="20" />
      <circle cx="${isH ? 80 : 170}" cy="${isH ? 80 : 90}" r="40" fill="white" fill-opacity="0.2" />
      ${card.profilePhoto
        ? `<clipPath id="c1"><circle cx="${isH ? 80 : 170}" cy="${isH ? 80 : 90}" r="35"/></clipPath><image href="${card.profilePhoto}" x="${isH ? 45 : 135}" y="${isH ? 55 : 55}" width="70" height="70" clip-path="url(#c1)"/>`
        : `<text x="${isH ? 80 : 170}" y="${isH ? 95 : 105}" font-family="Arial" font-size="40" font-weight="bold" fill="white" text-anchor="middle">${initials}</text>`}
      <text x="${isH ? 140 : 30}" y="${isH ? 230 : 260}" font-family="Arial" font-size="28" font-weight="bold" fill="white">${escapeXml(card.cardName)}</text>
      <text x="${isH ? 140 : 30}" y="${isH ? 265 : 300}" font-family="Arial" font-size="16" fill="white" fill-opacity="0.85">ftpdigitalplus.com/${escapeXml(card.linkName)}</text>
      <rect x="${isH ? 460 : 250}" y="${isH ? 260 : 540}" width="120" height="30" fill="white" fill-opacity="0.2" rx="6" />
      <text x="${isH ? 520 : 310}" y="${isH ? 280 : 560}" font-family="Arial" font-size="14" font-weight="bold" fill="white" text-anchor="middle">FTP DIGITAL+</text>
    </svg>`;
  };

  const downloadSvg = (orientation: 'horizontal' | 'vertical') => {
    const svg = buildNfcSvg(orientation);
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ftp-nfc-${card.linkName}-${orientation}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Fondo ${orientation === 'horizontal' ? 'horizontal' : 'vertical'} descargado`);
  };

  return (
    <div className="space-y-6">
      <SectionHeader icon="CreditCard" title="Fondos Virtuales NFC" description="Imágenes para tarjetas NFC físicas" />

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Descarga estos fondos personalizados con tu marca para imprimirlos en tarjetas NFC físicas.
          Al acercar la tarjeta a un teléfono, este abrirá tu tarjeta digital.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-5">
            <h3 className="self-start text-sm font-semibold">Formato horizontal</h3>
            <div
              className="flex aspect-[600/340] w-full max-w-xs items-center justify-center overflow-hidden rounded-xl shadow-md"
              style={{ background: `linear-gradient(135deg, ${card.primaryColor}, ${card.secondaryColor})` }}
            >
              <div className="flex w-full items-center gap-3 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-lg font-bold text-white">
                  {card.profilePhoto ? (
                    <img src={card.profilePhoto} alt="" className="h-full w-full rounded-full object-cover" />
                  ) : (
                    card.cardName.charAt(0).toUpperCase() || '?'
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-white">{card.cardName}</p>
                  <p className="truncate text-[10px] text-white/80">ftpdigitalplus.com/{card.linkName}</p>
                </div>
                <Badge className="bg-white/20 text-white">FTP+</Badge>
              </div>
            </div>
            <Button onClick={() => downloadSvg('horizontal')} className="w-full bg-emerald-600 text-white hover:bg-emerald-700">
              <Download className="h-4 w-4" /> Descargar horizontal
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-5">
            <h3 className="self-start text-sm font-semibold">Formato vertical</h3>
            <div
              className="flex aspect-[340/600] w-32 flex-col items-center gap-3 overflow-hidden rounded-xl p-4 shadow-md"
              style={{ background: `linear-gradient(135deg, ${card.primaryColor}, ${card.secondaryColor})` }}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-lg font-bold text-white">
                {card.profilePhoto ? (
                  <img src={card.profilePhoto} alt="" className="h-full w-full rounded-full object-cover" />
                ) : (
                  card.cardName.charAt(0).toUpperCase() || '?'
                )}
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-white">{card.cardName}</p>
                <p className="text-[10px] text-white/80">ftpdigitalplus.com/{card.linkName}</p>
              </div>
              <Badge className="mt-auto bg-white/20 text-white">FTP+</Badge>
            </div>
            <Button onClick={() => downloadSvg('vertical')} className="mt-3 w-full bg-emerald-600 text-white hover:bg-emerald-700">
              <Download className="h-4 w-4" /> Descargar vertical
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]!));
}

// ---------------------------------------------------------------------------
// 24. Métodos de Pago (Demo)
// ---------------------------------------------------------------------------

interface PaymentMethods {
  paypal: { enabled: boolean; email: string };
  stripe: { enabled: boolean; key: string };
  bank: { enabled: boolean; account: string; clabe: string; bank: string };
  cash: { enabled: boolean; instructions: string };
}

function PagosSection(): React.ReactElement {
  const [methods, setMethods] = useState<PaymentMethods>({
    paypal: { enabled: false, email: '' },
    stripe: { enabled: false, key: '' },
    bank: { enabled: false, account: '', clabe: '', bank: '' },
    cash: { enabled: false, instructions: '' },
  });

  const update = <K extends keyof PaymentMethods>(key: K, updates: Partial<PaymentMethods[K]>) => {
    setMethods(prev => ({ ...prev, [key]: { ...prev[key], ...updates } }));
  };

  return (
    <div className="space-y-6">
      <SectionHeader icon="CreditCard" title="Métodos de Pago" description="Configura cómo recibes pagos (demo)" />

      <Alert className="border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-700/50 dark:bg-amber-950/30 dark:text-amber-200">
        <Info className="h-4 w-4" />
        <AlertTitle>Modo demostración</AlertTitle>
        <AlertDescription>
          Esta sección es solo una demostración. Las configuraciones no se guardan en este demo.
        </AlertDescription>
      </Alert>

      <Card>
        <CardContent className="space-y-3 p-5">
          {/* PayPal */}
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-300">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">PayPal</p>
                  <p className="text-xs text-muted-foreground">Recibe pagos vía PayPal</p>
                </div>
              </div>
              <Switch checked={methods.paypal.enabled} onCheckedChange={(v) => update('paypal', { enabled: v })} />
            </div>
            {methods.paypal.enabled && (
              <div className="mt-3">
                <Label>Correo de PayPal</Label>
                <Input className="mt-2" type="email" value={methods.paypal.email} onChange={(e) => update('paypal', { email: e.target.value })} placeholder="tu@email.com" />
              </div>
            )}
          </div>

          {/* Stripe */}
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-950/30 dark:text-violet-300">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">Stripe</p>
                  <p className="text-xs text-muted-foreground">Pagos con tarjeta vía Stripe</p>
                </div>
              </div>
              <Switch checked={methods.stripe.enabled} onCheckedChange={(v) => update('stripe', { enabled: v })} />
            </div>
            {methods.stripe.enabled && (
              <div className="mt-3">
                <Label>Clave pública de Stripe</Label>
                <Input className="mt-2 font-mono text-xs" value={methods.stripe.key} onChange={(e) => update('stripe', { key: e.target.value })} placeholder="pk_live_..." />
              </div>
            )}
          </div>

          {/* Bank Transfer */}
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-300">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">Transferencia bancaria</p>
                  <p className="text-xs text-muted-foreground">Datos de tu cuenta bancaria</p>
                </div>
              </div>
              <Switch checked={methods.bank.enabled} onCheckedChange={(v) => update('bank', { enabled: v })} />
            </div>
            {methods.bank.enabled && (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>Banco</Label>
                  <Input className="mt-2" value={methods.bank.bank} onChange={(e) => update('bank', { bank: e.target.value })} placeholder="BBVA" />
                </div>
                <div>
                  <Label>Número de cuenta</Label>
                  <Input className="mt-2" value={methods.bank.account} onChange={(e) => update('bank', { account: e.target.value })} placeholder="0123 4567 8901" />
                </div>
                <div className="sm:col-span-2">
                  <Label>CLABE interbancaria</Label>
                  <Input className="mt-2 font-mono" value={methods.bank.clabe} onChange={(e) => update('bank', { clabe: e.target.value })} placeholder="012180..." maxLength={18} />
                </div>
              </div>
            )}
          </div>

          {/* Cash */}
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-300">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">Efectivo</p>
                  <p className="text-xs text-muted-foreground">Pago en efectivo contra entrega</p>
                </div>
              </div>
              <Switch checked={methods.cash.enabled} onCheckedChange={(v) => update('cash', { enabled: v })} />
            </div>
            {methods.cash.enabled && (
              <div className="mt-3">
                <Label>Instrucciones</Label>
                <Textarea className="mt-2" rows={2} value={methods.cash.instructions} onChange={(e) => update('cash', { instructions: e.target.value })} placeholder="Ej. Pagar al recibir el producto" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Componentes genéricos
// ---------------------------------------------------------------------------

function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <DynamicIcon name={icon} className="h-7 w-7" />
      </div>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

function CrudDialog({
  open, onOpenChange, title, description, onSave, children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onSave: () => void;
  children: React.ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="py-2">{children}</div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={onSave} className="bg-emerald-600 text-white hover:bg-emerald-700">
            <Save className="h-4 w-4" /> Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Switch de secciones
// ---------------------------------------------------------------------------

function SectionEditor({ card, updateCard, plan, section }: SectionProps & { section: string }) {
  const upgrade = useUpgrade();

  // Si la sección está restringida para plan gratis, mostrar aviso
  if (plan === 'gratis' && !FREE_PLAN_ALLOWED.includes(section)) {
    return <RestrictedNotice onUpgrade={upgrade} />;
  }

  const props: SectionProps = { card, updateCard, plan };

  switch (section) {
    case 'detalles': return <DetallesSection {...props} />;
    case 'plantillas': return <PlantillasSection {...props} />;
    case 'dinamica': return <DinamicaSection {...props} />;
    case 'horario': return <HorarioSection {...props} />;
    case 'qr': return <QrSection {...props} />;
    case 'servicios': return <ServiciosSection {...props} />;
    case 'productos': return <ProductosSection {...props} />;
    case 'instagram': return <InstagramSection {...props} />;
    case 'galeria': return <GaleriaSection {...props} />;
    case 'blog': return <BlogSection {...props} />;
    case 'testimonios': return <TestimoniosSection {...props} />;
    case 'marcos': return <MarcosSection {...props} />;
    case 'equipo': return <EquipoSection {...props} />;
    case 'sociales': return <SocialesSection {...props} />;
    case 'bandera': return <BanderaSection {...props} />;
    case 'fuentes': return <FuentesSection {...props} />;
    case 'avanzado': return <AvanzadoSection {...props} />;
    case 'motores': return <MotoresSection {...props} />;
    case 'privacidad': return <PrivacidadSection {...props} />;
    case 'terminos': return <TerminosSection {...props} />;
    case 'secciones': return <SeccionesSection {...props} />;
    case 'whatsapp': return <WhatsappSection {...props} />;
    case 'fondos': return <FondosSection {...props} />;
    case 'pagos': return <PagosSection />;
    default: return <DetallesSection {...props} />;
  }
}

// ---------------------------------------------------------------------------
// Categorías del sidebar del editor
// ---------------------------------------------------------------------------

const EDITOR_CATEGORIES: { id: string; name: string; sections: string[] }[] = [
  {
    id: 'basico',
    name: 'Básico',
    sections: ['detalles', 'plantillas', 'dinamica', 'horario', 'whatsapp'],
  },
  {
    id: 'contenido',
    name: 'Contenido',
    sections: ['servicios', 'productos', 'instagram', 'galeria', 'blog', 'testimonios', 'marcos', 'equipo', 'sociales', 'bandera'],
  },
  {
    id: 'diseno',
    name: 'Diseño',
    sections: ['qr', 'fuentes'],
  },
  {
    id: 'avanzado',
    name: 'Avanzado',
    sections: ['avanzado', 'motores', 'privacidad', 'terminos', 'secciones', 'fondos', 'pagos'],
  },
];

/** Computa el % de completitud global de la tarjeta (para mostrar en el sidebar). */
function useCardCompletitud(card: BusinessCard | null): number {
  return useMemo(() => {
    if (!card) return 0;
    const fields = [
      { ok: !!card.cardName?.trim(), weight: 10 },
      { ok: !!card.linkName?.trim() && card.linkName.length >= 3, weight: 8 },
      { ok: !!card.description?.trim() && card.description.length >= 20, weight: 12 },
      { ok: !!card.profilePhoto, weight: 12 },
      { ok: !!card.coverPhoto, weight: 8 },
      { ok: !!card.logo, weight: 6 },
      { ok: !!card.whatsappNumber?.trim(), weight: 12 },
      { ok: card.services.length > 0, weight: 8 },
      { ok: card.products.length > 0, weight: 6 },
      { ok: card.gallery.length > 0, weight: 6 },
      { ok: card.testimonials.length > 0, weight: 5 },
      { ok: Object.values(card.socialLinks).some(v => v), weight: 4 },
      { ok: !!card.qrGeneratedAt, weight: 3 },
    ];
    const total = fields.reduce((s, f) => s + f.weight, 0);
    const got = fields.reduce((s, f) => s + (f.ok ? f.weight : 0), 0);
    return Math.round((got / total) * 100);
  }, [card]);
}

// ---------------------------------------------------------------------------
// Floating Vista Previa panel (draggable, resizable, minimizable)
// ---------------------------------------------------------------------------

function FloatingPreviewPanel({ card, plan }: { card: BusinessCard; plan: string }) {
  const [minimized, setMinimized] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [visible, setVisible] = useState(true);
  // "Last saved" timestamp updates automatically when the card changes
  const savedTime = useMemo(
    () => new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
    [card]
  );

  if (!visible) {
    return (
      <motion.button
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={() => setVisible(true)}
        className="fixed bottom-20 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 transition-transform hover:scale-110 sm:bottom-6 sm:right-6"
        aria-label="Mostrar vista previa"
      >
        <Eye className="h-5 w-5" />
      </motion.button>
    );
  }

  // Mobile (< sm): full-screen; Tablet/Desktop (>= sm): draggable card
  const widthClass = 'inset-0 w-full sm:inset-auto sm:w-auto ' + (expanded ? 'sm:w-[420px]' : minimized ? 'sm:w-72' : 'sm:w-80');
  const heightClass = 'h-full sm:h-auto ' + (minimized ? 'sm:h-12' : expanded ? 'sm:h-[600px]' : 'sm:h-[420px]');
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  return (
    <motion.div
      drag={!isMobile}
      dragMomentum={false}
      dragElastic={0.12}
      initial={{ x: 0, y: 0, opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className={cn(
        'fixed z-40 flex flex-col overflow-hidden bg-white shadow-2xl shadow-emerald-900/10 ring-1 ring-emerald-900/5',
        'inset-0 sm:inset-auto sm:bottom-6 sm:right-6 sm:rounded-xl sm:border sm:border-emerald-200/60',
        widthClass,
        heightClass,
        minimized && 'overflow-hidden'
      )}
      style={{ maxWidth: isMobile ? '100vw' : 'calc(100vw - 3rem)' }}
    >
      {/* Drag handle / header */}
      <div
        className="flex cursor-grab items-center gap-2 border-b bg-gradient-to-r from-emerald-600 to-emerald-700 px-3 py-2 text-white active:cursor-grabbing"
      >
        <Grip className="h-3.5 w-3.5 text-emerald-100" />
        <Eye className="h-3.5 w-3.5" />
        <span className="flex-1 truncate text-xs font-semibold">Vista Previa en Vivo</span>
        {/* Live indicator */}
        <span className="flex items-center gap-1 rounded-full bg-white/15 px-1.5 py-0.5 text-[10px] font-bold">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />
          LIVE
        </span>
        {/* Minimize button */}
        <button
          type="button"
          onClick={() => setMinimized(m => !m)}
          className="rounded p-0.5 transition-colors hover:bg-white/20"
          aria-label={minimized ? 'Expandir panel' : 'Minimizar panel'}
        >
          {minimized ? <Maximize2 className="h-3.5 w-3.5" /> : <Minimize2 className="h-3.5 w-3.5" />}
        </button>
        {/* Expand button */}
        {!minimized && (
          <button
            type="button"
            onClick={() => setExpanded(e => !e)}
            className="rounded p-0.5 transition-colors hover:bg-white/20"
            aria-label={expanded ? 'Contraer panel' : 'Expandir panel'}
          >
            {expanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        )}
        {/* Close button */}
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="rounded p-0.5 transition-colors hover:bg-white/20"
          aria-label="Cerrar panel"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      {/* Content */}
      {!minimized && (
        <div className="flex flex-1 flex-col overflow-hidden">
          <ScrollArea className="flex-1">
            <div className="bg-muted/30 p-3">
              <CardPreview card={card} userPlan={plan} />
            </div>
          </ScrollArea>
          {/* Save indicator footer */}
          <div className="flex items-center justify-between gap-2 border-t bg-emerald-50/40 px-3 py-1.5 text-[11px] text-emerald-700">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              Guardado automáticamente
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" /> {savedTime}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Componente principal: CardEditor
// ---------------------------------------------------------------------------

export function CardEditor() {
  const card = useSelectedCard();
  const user = useAppStore(s => s.currentUser);
  const selectedSection = useAppStore(s => s.selectedEditorSection);
  const setEditorSection = useAppStore(s => s.setEditorSection);
  const navigate = useAppStore(s => s.navigate);
  const updateCard = useAppStore(s => s.updateCard);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedCats, setCollapsedCats] = useState<Record<string, boolean>>({});

  const plan = user?.plan || 'gratis';
  const completitud = useCardCompletitud(card);

  // No hay tarjeta seleccionada
  if (!card) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <AlertTriangle className="h-10 w-10" />
        </div>
        <div>
          <h2 className="text-xl font-bold">No hay tarjeta seleccionada</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Selecciona una tarjeta desde el panel para comenzar a editar.
          </p>
        </div>
        <Button onClick={() => navigate('dashboard')} className="bg-emerald-600 text-white hover:bg-emerald-700">
          <ArrowLeft className="h-4 w-4" /> Volver al Panel
        </Button>
      </div>
    );
  }

  const currentSection = EDITOR_SECTIONS.find(s => s.id === selectedSection) || EDITOR_SECTIONS[0];

  // Lista de secciones con marca de restringidas
  const sectionList = EDITOR_SECTIONS.map(s => ({
    ...s,
    restricted: plan === 'gratis' && !FREE_PLAN_ALLOWED.includes(s.id),
  }));

  // Filter sections by search query
  const filteredSections = searchQuery.trim()
    ? sectionList.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : sectionList;

  const toggleCat = (catId: string) => {
    setCollapsedCats(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  // Build categorized sections for sidebar (when not searching)
  const categorizedSections = EDITOR_CATEGORIES.map(cat => ({
    ...cat,
    items: cat.sections
      .map(sid => sectionList.find(s => s.id === sid))
      .filter((s): s is NonNullable<typeof s> => Boolean(s)),
  })).filter(cat => cat.items.length > 0);

  // Helper to render a section button
  const renderSectionButton = (s: typeof sectionList[number]) => {
    const isActive = selectedSection === s.id;
    return (
      <button
        key={s.id}
        onClick={() => {
          setEditorSection(s.id);
          setSidebarOpen(false);
        }}
        className={cn(
          'group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition',
          isActive
            ? 'bg-emerald-600 font-medium text-white shadow-sm'
            : 'text-foreground/80 hover:bg-muted hover:text-foreground'
        )}
      >
        <DynamicIcon name={s.icon} className={cn('h-4 w-4 shrink-0', isActive ? 'text-white' : 'text-muted-foreground group-hover:text-foreground')} />
        <span className="flex-1 truncate">{s.name}</span>
        {s.restricted && (
          <Lock className={cn('h-3 w-3', isActive ? 'text-white/70' : 'text-amber-500')} />
        )}
      </button>
    );
  };

  // Contenido del sidebar (compartido entre vista fija y Sheet móvil)
  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="p-3">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={() => navigate('dashboard')}
        >
          <ArrowLeft className="h-4 w-4" /> Volver al Panel
        </Button>
      </div>

      {/* Completion % indicator */}
      <div className="px-3 pb-3">
        <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-amber-50/40 p-3 ring-1 ring-emerald-200/40">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[11px] font-medium text-slate-700">Completitud</p>
              <p className="text-[10px] text-muted-foreground">
                {completitud >= 80 ? '¡Casi lista!' : 'Sigue completando'}
              </p>
            </div>
            <div className="relative h-10 w-10">
              <svg width="40" height="40" className="-rotate-90">
                <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="4" className="text-slate-200" />
                <circle
                  cx="20" cy="20" r="16" fill="none"
                  stroke="url(#sidebarGrad)" strokeWidth="4" strokeLinecap="round"
                  strokeDasharray={`${(completitud / 100) * (2 * Math.PI * 16)} ${2 * Math.PI * 16}`}
                  className="transition-all duration-500"
                />
                <defs>
                  <linearGradient id="sidebarGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#059669" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-bold text-slate-700">{completitud}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search / filter */}
      <div className="px-3 pb-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filtrar secciones…"
            className="h-8 pl-8 pr-8 text-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:bg-muted"
              aria-label="Limpiar búsqueda"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      <Separator />

      <ScrollArea className="flex-1">
        {searchQuery.trim() ? (
          /* Flat filtered list when searching */
          <nav className="space-y-0.5 p-2">
            {filteredSections.length > 0 ? (
              filteredSections.map(renderSectionButton)
            ) : (
              <p className="px-3 py-6 text-center text-xs text-muted-foreground">
                Sin coincidencias para &quot;{searchQuery}&quot;
              </p>
            )}
          </nav>
        ) : (
          /* Categorized list */
          <nav className="space-y-1 p-2">
            {categorizedSections.map(cat => {
              const collapsed = collapsedCats[cat.id];
              return (
                <Collapsible key={cat.id} open={!collapsed} onOpenChange={() => toggleCat(cat.id)}>
                  <CollapsibleTrigger asChild>
                    <button
                      type="button"
                      className="group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 transition-colors hover:bg-muted/60 hover:text-foreground"
                    >
                      {collapsed
                        ? <ChevronRight className="h-3 w-3" />
                        : <ChevronDown className="h-3 w-3" />}
                      <span className="flex-1 text-left">{cat.name}</span>
                      <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
                        {cat.items.length}
                      </span>
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-0.5 pt-1">
                    {cat.items.map(renderSectionButton)}
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </nav>
        )}
      </ScrollArea>

      <Separator />

      {/* Save indicator */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 text-[11px]">
        <span className="flex items-center gap-1.5 text-emerald-700">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          Guardado automático
        </span>
        <span className="flex items-center gap-1 text-muted-foreground">
          <Clock className="h-3 w-3" />
          {new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      <div className="p-3 pt-1">
        <Button
          variant="outline"
          className="w-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 dark:hover:bg-emerald-950/50 xl:hidden"
          onClick={() => setPreviewOpen(true)}
        >
          <Eye className="h-4 w-4" /> Ver Vista Previa
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col bg-background lg:flex-row">
      {/* Sidebar - desktop */}
      <aside className="hidden w-72 shrink-0 border-r bg-card lg:block">
        {sidebarContent}
      </aside>

      {/* Sidebar - mobile (Sheet) */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-[85vw] max-w-[320px] p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Secciones del editor</SheetTitle>
          </SheetHeader>
          {sidebarContent}
        </SheetContent>
      </Sheet>

      {/* Centro: formulario */}
      <main className="flex-1 overflow-y-auto">
        {/* Topbar móvil */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
          <Button variant="outline" size="sm" onClick={() => setSidebarOpen(true)} className="min-h-[40px]">
            <Menu className="h-4 w-4" /> Secciones
          </Button>
          <Button variant="outline" size="sm" onClick={() => setPreviewOpen(true)} className="min-h-[40px]">
            <Eye className="h-4 w-4" /> Preview
          </Button>
        </div>

        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <SectionEditor
            card={card}
            updateCard={updateCard}
            plan={plan}
            section={selectedSection}
          />
        </div>
      </main>

      {/* Preview - desktop (right column) */}
      <aside className="hidden w-96 shrink-0 border-l bg-card xl:flex xl:flex-col">
        <div className="border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-emerald-600" />
            <h3 className="text-sm font-semibold">Vista Previa en Vivo</h3>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {currentSection.name} — cambios en tiempo real
          </p>
        </div>
        <ScrollArea className="flex-1">
          <div className="bg-muted/30 p-4">
            <CardPreview card={card} userPlan={plan} />
          </div>
        </ScrollArea>
      </aside>

      {/* Floating Vista Previa panel - shown on screens below xl */}
      <div className="xl:hidden">
        <FloatingPreviewPanel card={card} plan={plan} />
      </div>

      {/* Preview - mobile/tablet (Dialog) - kept for explicit "Ver Vista Previa" button */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-h-[95vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-emerald-600" /> Vista Previa
            </DialogTitle>
            <DialogDescription>
              {currentSection.name} — {card.cardName}
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted/30 p-4">
            <CardPreview card={card} userPlan={plan} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CardEditor;
