'use client';

/**
 * themes-page.tsx — Explorador de temas y paletas (Task 12-a)
 *
 * Características:
 *  - Hero con gradiente esmeralda + oro
 *  - Tabs por categoría (Todas / Profesional / Lujo / Creativo / Minimalista / Cálido / Fresco)
 *  - Búsqueda por nombre
 *  - Grid de paletas: preview mini-card + swatches + aplicar + vista previa (Dialog)
 *  - Constructor de paleta personalizada: 5 color pickers + preview en vivo + guardar/aplicar
 *  - Paletas guardadas (localStorage)
 *  - Tips de teoría del color
 *  - Footer sticky
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  ArrowLeft, Palette, Search, Eye, Check, Heart, Save, Plus,
  Sparkles, Trash2, Wand2, Lightbulb, X,
} from 'lucide-react';
import { useAppStore, useSelectedCard, useCurrentUserCards } from '@/lib/store';
import { COLOR_PRESETS, THEME_CATEGORIES } from '@/lib/plans';
import type { ColorPreset, ThemeCategory } from '@/lib/plans';
import { cn } from '@/lib/utils';
import { FTPLogo } from '@/components/ftp-logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { CardPreview } from '@/components/card-preview';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

/* ------------------------------------------------------------------ */
/*  Tipos locales                                                      */
/* ------------------------------------------------------------------ */

type CategoryFilter = 'todos' | ThemeCategory;

interface SavedPalette {
  palettes: ColorPreset[];
}

const STORAGE_KEY = 'ftp-digital-plus:custom-palettes';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function readContrast(fg: string, bg: string): boolean {
  // Aproximación WCAG: devuelve true si el contraste es suficiente.
  const hex = (c: string) => {
    const h = c.replace('#', '');
    if (h.length === 3) return h.split('').map(x => x + x).join('');
    return h;
  };
  const toRgb = (c: string) => {
    const h = hex(c);
    return [
      parseInt(h.slice(0, 2), 16) / 255,
      parseInt(h.slice(2, 4), 16) / 255,
      parseInt(h.slice(4, 6), 16) / 255,
    ];
  };
  const lin = (v: number) => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  const lum = (rgb: number[]) =>
    0.2126 * lin(rgb[0]) + 0.7152 * lin(rgb[1]) + 0.0722 * lin(rgb[2]);
  const l1 = lum(toRgb(fg));
  const l2 = lum(toRgb(bg));
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05) >= 4.5;
}

function loadSavedPalettes(): ColorPreset[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedPalette;
    return Array.isArray(parsed?.palettes) ? parsed.palettes : [];
  } catch {
    return [];
  }
}

function persistSavedPalettes(palettes: ColorPreset[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ palettes } satisfies SavedPalette));
  } catch {
    /* noop */
  }
}

/* ------------------------------------------------------------------ */
/*  Mini preview de paleta                                            */
/* ------------------------------------------------------------------ */

function PaletteMiniPreview({ preset, name }: { preset: ColorPreset; name?: string }) {
  const initials = (name || 'FTP').slice(0, 2).toUpperCase();
  return (
    <div
      className="overflow-hidden rounded-xl border border-black/5 shadow-sm"
      style={{ background: preset.background, color: preset.text }}
    >
      {/* Cover */}
      <div
        className="relative h-16 w-full"
        style={{ background: `linear-gradient(135deg, ${preset.primary}, ${preset.secondary})` }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-white/40" />
        </div>
      </div>
      {/* Profile + name */}
      <div className="px-3 pb-3">
        <div className="-mt-6 mb-2 flex justify-center">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full border-2 text-xs font-bold text-white shadow"
            style={{ borderColor: preset.background, background: preset.primary }}
          >
            {initials}
          </div>
        </div>
        <p className="text-center text-[11px] font-bold leading-tight">
          {name || 'Tu Nombre'}
        </p>
        <p className="mt-0.5 text-center text-[9px] opacity-70">Profesional Digital</p>
        <div className="mt-2 flex gap-1">
          <div
            className="h-1.5 flex-1 rounded-full"
            style={{ background: preset.primary }}
          />
          <div
            className="h-1.5 flex-1 rounded-full"
            style={{ background: preset.secondary }}
          />
        </div>
        <div className="mt-1.5 flex gap-1">
          <span
            className="flex-1 rounded px-1 py-0.5 text-center text-[8px] font-semibold text-white"
            style={{ background: preset.primary }}
          >
            WhatsApp
          </span>
          <span
            className="flex-1 rounded px-1 py-0.5 text-center text-[8px] font-semibold text-white"
            style={{ background: preset.secondary }}
          >
            Ver más
          </span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Swatches                                                          */
/* ------------------------------------------------------------------ */

const SWATCH_LABELS: { key: keyof ColorPreset; label: string }[] = [
  { key: 'primary', label: 'Primario' },
  { key: 'secondary', label: 'Secundario' },
  { key: 'background', label: 'Fondo' },
  { key: 'text', label: 'Texto' },
];

function Swatches({ preset }: { preset: ColorPreset }) {
  return (
    <div className="flex items-center gap-1.5">
      {SWATCH_LABELS.map(({ key, label }) => (
        <div
          key={key}
          className="group relative h-6 w-6 rounded-full border-2 border-white shadow-sm ring-1 ring-black/5"
          style={{ background: preset[key] }}
          title={`${label}: ${preset[key]}`}
        >
          <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-900 px-1.5 py-0.5 text-[9px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
            {label}
          </span>
        </div>
      ))}
      {/* Accent swatch = primary darker / synthetic */}
      <div
        className="group relative h-6 w-6 rounded-full border-2 border-white shadow-sm ring-1 ring-black/5"
        style={{ background: preset.secondary }}
        title="Acento"
      >
        <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-900 px-1.5 py-0.5 text-[9px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
          Acento
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tarjeta de paleta en el grid                                      */
/* ------------------------------------------------------------------ */

function PaletteCard({
  preset,
  cardName,
  onApply,
  onPreview,
  onSave,
  isSaved,
}: {
  preset: ColorPreset;
  cardName?: string;
  onApply: () => void;
  onPreview: () => void;
  onSave: () => void;
  isSaved: boolean;
}) {
  const category = THEME_CATEGORIES.find(c => c.id === preset.category);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      whileHover={{ y: -3 }}
    >
      <Card className="group h-full overflow-hidden border-slate-200/70 bg-white shadow-sm transition-shadow hover:shadow-md">
        <CardContent className="flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-bold text-slate-800">{preset.name}</h3>
              <p className="text-[11px] text-muted-foreground">{preset.gradient}</p>
            </div>
            <Badge
              variant="secondary"
              className="shrink-0 bg-emerald-50 text-[10px] text-emerald-700"
            >
              {category?.name ?? preset.category}
            </Badge>
          </div>

          {/* Mini preview */}
          <PaletteMiniPreview preset={preset} name={cardName} />

          {/* Swatches */}
          <Swatches preset={preset} />

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              onClick={onApply}
              className="h-8 flex-1 gap-1 bg-emerald-600 text-xs hover:bg-emerald-700"
            >
              <Check className="h-3.5 w-3.5" />
              Aplicar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onPreview}
              className="h-8 gap-1 border-slate-200 px-2.5 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
              aria-label="Vista previa"
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onSave}
              className={cn(
                'h-8 gap-1 px-2.5 text-xs',
                isSaved
                  ? 'border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100'
                  : 'border-slate-200 text-slate-600 hover:bg-amber-50 hover:text-amber-600'
              )}
              aria-label={isSaved ? 'Quitar de guardadas' : 'Guardar paleta'}
            >
              <Heart className={cn('h-3.5 w-3.5', isSaved && 'fill-amber-500 text-amber-500')} />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Constructor de paleta personalizada                              */
/* ------------------------------------------------------------------ */

interface CustomPresetState {
  name: string;
  primary: string;
  secondary: string;
  background: string;
  text: string;
}

const DEFAULT_CUSTOM: CustomPresetState = {
  name: 'Mi Paleta',
  primary: '#059669',
  secondary: '#f59e0b',
  background: '#ffffff',
  text: '#0f172a',
};

function ColorPicker({
  label, value, onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-medium text-slate-600">{label}</Label>
      <div className="flex items-center gap-2">
        <div className="relative h-9 w-9 overflow-hidden rounded-md border border-slate-200 shadow-sm">
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
          className="h-9 w-24 font-mono text-xs"
        />
      </div>
    </div>
  );
}

function CustomPaletteBuilder({
  savedPalettes,
  onSave,
  onApply,
}: {
  savedPalettes: ColorPreset[];
  onSave: (p: ColorPreset) => void;
  onApply: (p: ColorPreset) => void;
}) {
  const [state, setState] = useState<CustomPresetState>(DEFAULT_CUSTOM);
  const preset: ColorPreset = useMemo(() => ({
    name: state.name || 'Sin nombre',
    primary: state.primary,
    secondary: state.secondary,
    background: state.background,
    text: state.text,
    mood: 'fresh',
    category: 'creativo',
    gradient: 'Paleta personalizada',
  }), [state]);

  const contrastOk = readContrast(state.text, state.background);
  const nameTooShort = state.name.trim().length < 2;
  const isDuplicate = savedPalettes.some(p => p.name.toLowerCase() === state.name.trim().toLowerCase());

  const setField = (k: keyof CustomPresetState) => (v: string) =>
    setState(prev => ({ ...prev, [k]: v }));

  const handleSave = () => {
    if (nameTooShort) {
      toast.error('Nombre muy corto', { description: 'Usa al menos 2 caracteres.' });
      return;
    }
    if (isDuplicate) {
      toast.error('Ya existe una paleta con ese nombre', {
        description: 'Elige un nombre distinto.',
      });
      return;
    }
    onSave(preset);
    toast.success(`Paleta "${preset.name}" guardada`, {
      description: 'La encontrarás en la sección "Paletas guardadas".',
    });
  };

  const handleApply = () => {
    onApply(preset);
    toast.success(`Paleta "${preset.name}" aplicada`, {
      description: 'Los colores de tu tarjeta se actualizaron.',
    });
  };

  return (
    <Card className="overflow-hidden border-emerald-200/60 bg-gradient-to-br from-white via-emerald-50/30 to-amber-50/20 shadow-sm">
      <CardContent className="p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-sm">
            <Wand2 className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Constructor de paleta</h3>
            <p className="text-xs text-muted-foreground">
              Mezcla tus propios colores y previsualiza al instante.
            </p>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {/* Pickers */}
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-medium text-slate-600">Nombre</Label>
              <Input
                value={state.name}
                onChange={(e) => setField('name')(e.target.value)}
                placeholder="Ej. Marca Personal"
                className="mt-1.5 h-9"
                maxLength={28}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <ColorPicker label="Primario" value={state.primary} onChange={setField('primary')} />
              <ColorPicker label="Secundario" value={state.secondary} onChange={setField('secondary')} />
              <ColorPicker label="Fondo" value={state.background} onChange={setField('background')} />
              <ColorPicker label="Texto" value={state.text} onChange={setField('text')} />
            </div>

            {/* Contraste check */}
            <div
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-xs',
                contrastOk
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-700'
              )}
            >
              <span
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-full text-white',
                  contrastOk ? 'bg-emerald-500' : 'bg-rose-500'
                )}
              >
                {contrastOk ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
              </span>
              {contrastOk
                ? 'Contraste texto/fondo suficiente (WCAG AA)'
                : 'Contraste insuficiente — el texto puede ser difícil de leer'}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                onClick={handleApply}
                className="h-9 gap-1.5 bg-emerald-600 hover:bg-emerald-700"
              >
                <Check className="h-4 w-4" />
                Aplicar a mi tarjeta
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleSave}
                disabled={nameTooShort || isDuplicate}
                className="h-9 gap-1.5 border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                Guardar paleta
              </Button>
            </div>
          </div>

          {/* Live preview */}
          <div>
            <p className="mb-2 text-xs font-medium text-slate-600">Vista previa en vivo</p>
            <PaletteMiniPreview preset={preset} name="Tu Nombre" />
            <div className="mt-3">
              <Swatches preset={preset} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Paletas guardadas                                                 */
/* ------------------------------------------------------------------ */

function SavedPalettesGrid({
  palettes,
  cardName,
  onApply,
  onPreview,
  onDelete,
}: {
  palettes: ColorPreset[];
  cardName?: string;
  onApply: (p: ColorPreset) => void;
  onPreview: (p: ColorPreset) => void;
  onDelete: (p: ColorPreset) => void;
}) {
  if (palettes.length === 0) {
    return (
      <Card className="border-dashed border-slate-200 bg-white">
        <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Heart className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium text-slate-700">Aún no has guardado paletas</p>
          <p className="max-w-md text-xs text-muted-foreground">
            Crea tu propia paleta en el constructor de arriba y guárdala, o marca el corazón
            en cualquier paleta de la galería.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <AnimatePresence mode="popLayout">
        {palettes.map((p, i) => (
          <motion.div
            key={`${p.name}-${i}`}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="group h-full overflow-hidden border-slate-200/70 bg-white shadow-sm transition-shadow hover:shadow-md">
              <CardContent className="flex flex-col gap-3 p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="truncate text-sm font-bold text-slate-800">{p.name}</h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(p)}
                    className="h-7 w-7 p-0 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    aria-label="Eliminar paleta guardada"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <PaletteMiniPreview preset={p} name={cardName} />
                <Swatches preset={p} />
                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    onClick={() => onApply(p)}
                    className="h-8 flex-1 gap-1 bg-emerald-600 text-xs hover:bg-emerald-700"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Aplicar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onPreview(p)}
                    className="h-8 gap-1 border-slate-200 px-2.5 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                    aria-label="Vista previa"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tips de teoría del color                                          */
/* ------------------------------------------------------------------ */

const COLOR_TIPS = [
  {
    title: 'Regla 60-30-10',
    text: 'Usa 60% color dominante (fondo), 30% secundario y 10% de acento. Tu tarjeta se verá equilibrada.',
  },
  {
    title: 'Contraste WCAG AA',
    text: 'Para texto legible, el contraste entre texto y fondo debe ser al menos 4.5:1. Lo validamos en el constructor.',
  },
  {
    title: 'Análogos y complementarios',
    text: 'Colores análogos (adyacentes en el círculo) transmiten armonía; complementarios (opuestos) generan contraste y energía.',
  },
  {
    title: 'Identidad de marca',
    text: 'Mantén tu paleta en todas tus redes: genera reconocimiento y profesionalismo.',
  },
];

function ColorTips() {
  return (
    <Card className="border-amber-200/60 bg-gradient-to-br from-amber-50/40 to-white shadow-sm">
      <CardContent className="p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-sm">
            <Lightbulb className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Tips de teoría del color</h3>
            <p className="text-xs text-muted-foreground">Pequeños principios para combinaciones armoniosas.</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {COLOR_TIPS.map(tip => (
            <div
              key={tip.title}
              className="rounded-lg border border-amber-100/60 bg-white/60 p-3"
            >
              <p className="text-xs font-semibold text-emerald-700">{tip.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">{tip.text}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Página principal                                                  */
/* ------------------------------------------------------------------ */

export function ThemesPage() {
  const navigate = useAppStore(s => s.navigate);
  const updateCard = useAppStore(s => s.updateCard);
  const currentUser = useAppStore(s => s.currentUser);
  const selectedCard = useSelectedCard();
  const cards = useCurrentUserCards();

  const currentUserPlan = currentUser?.plan || 'gratis';

  const [tab, setTab] = useState<CategoryFilter>('todos');
  const [search, setSearch] = useState('');
  const [previewPreset, setPreviewPreset] = useState<ColorPreset | null>(null);
  const [savedPalettes, setSavedPalettes] = useState<ColorPreset[]>([]);

  // Cargar paletas guardadas desde localStorage
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSavedPalettes(loadSavedPalettes());
  }, []);

  const persist = useCallback((next: ColorPreset[]) => {
    setSavedPalettes(next);
    persistSavedPalettes(next);
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return COLOR_PRESETS.filter(p => {
      if (tab !== 'todos' && p.category !== tab) return false;
      if (q && !p.name.toLowerCase().includes(q) && !p.gradient.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [tab, search]);

  const applyPreset = useCallback(
    (preset: ColorPreset) => {
      if (!selectedCard) {
        toast.error('No hay tarjeta seleccionada', {
          description: 'Selecciona una tarjeta desde el panel antes de aplicar un tema.',
        });
        return;
      }
      updateCard(selectedCard.id, {
        primaryColor: preset.primary,
        secondaryColor: preset.secondary,
        backgroundColor: preset.background,
        textColor: preset.text,
      });
      toast.success(`Tema "${preset.name}" aplicado`, {
        description: `Tarjeta: ${selectedCard.cardName}`,
      });
    },
    [selectedCard, updateCard]
  );

  const savePreset = useCallback(
    (preset: ColorPreset) => {
      const next = [preset, ...savedPalettes];
      persist(next);
    },
    [savedPalettes, persist]
  );

  const toggleSaved = useCallback(
    (preset: ColorPreset) => {
      const exists = savedPalettes.some(p => p.name === preset.name);
      if (exists) {
        persist(savedPalettes.filter(p => p.name !== preset.name));
        toast.info(`"${preset.name}" quitada de guardadas`);
      } else {
        persist([preset, ...savedPalettes]);
        toast.success(`"${preset.name}" guardada`);
      }
    },
    [savedPalettes, persist]
  );

  const deleteSaved = useCallback(
    (preset: ColorPreset) => {
      persist(savedPalettes.filter(p => p.name !== preset.name));
      toast.success(`Paleta "${preset.name}" eliminada`);
    },
    [savedPalettes, persist]
  );

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-emerald-50/40">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-emerald-100/60 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
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
            <FTPLogo variant="icon" className="size-8 hidden sm:block" />
            <div>
              <h1 className="text-base font-bold text-slate-900 sm:text-lg">Temas y Paletas</h1>
              <p className="hidden text-xs text-slate-500 sm:block">
                {selectedCard
                  ? `Editando: ${selectedCard.cardName}`
                  : 'Selecciona una tarjeta para aplicar temas'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <ThemeToggle className="text-slate-600 hover:bg-emerald-50 hover:text-emerald-700" />
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto max-w-6xl">
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
                <Palette className="h-3.5 w-3.5" />
                {COLOR_PRESETS.length} paletas · {THEME_CATEGORIES.length} categorías
              </div>
              <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
                Temas y Paletas
              </h2>
              <p className="mt-2 max-w-xl text-sm text-emerald-50 sm:text-base">
                Encuentra la combinación perfecta para tu marca. Aplica colores a tu tarjeta con un clic
                o crea tu propia paleta personalizada.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                {selectedCard ? (
                  <div className="flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs backdrop-blur">
                    <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                    Aplicando a:
                    <span className="font-semibold text-white">{selectedCard.cardName}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-full bg-amber-500/20 px-3 py-1.5 text-xs text-amber-100 ring-1 ring-amber-300/40">
                    Selecciona una tarjeta en el panel para aplicar temas.
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Search + tabs */}
          <Card className="mb-5 border-slate-200 shadow-sm">
            <CardContent className="flex flex-col gap-3 p-4 sm:p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <Tabs value={tab} onValueChange={v => setTab(v as CategoryFilter)}>
                  <TabsList className="grid w-full grid-cols-4 bg-emerald-50/60 sm:w-auto lg:grid-cols-7">
                    <TabsTrigger
                      value="todos"
                      className="data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm"
                    >
                      Todos
                    </TabsTrigger>
                    {THEME_CATEGORIES.map(c => (
                      <TabsTrigger
                        key={c.id}
                        value={c.id}
                        className="data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm"
                      >
                        {c.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>

                <div className="relative w-full sm:w-72">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar paleta por nombre…"
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
              <p className="text-xs text-muted-foreground">
                {filtered.length} paleta{filtered.length !== 1 ? 's' : ''} {tab !== 'todos' ? `en ${THEME_CATEGORIES.find(c => c.id === tab)?.name}` : 'en total'}
              </p>
            </CardContent>
          </Card>

          {/* Themes grid */}
          {filtered.length === 0 ? (
            <Card className="border-dashed border-slate-200 bg-white">
              <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <Search className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-slate-700">Sin resultados</p>
                <p className="max-w-md text-xs text-muted-foreground">
                  No encontramos paletas que coincidan con tu búsqueda. Prueba con otros términos.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <AnimatePresence mode="popLayout">
                {filtered.map(p => (
                  <PaletteCard
                    key={p.name}
                    preset={p}
                    cardName={selectedCard?.cardName}
                    onApply={() => applyPreset(p)}
                    onPreview={() => setPreviewPreset(p)}
                    onSave={() => toggleSaved(p)}
                    isSaved={savedPalettes.some(s => s.name === p.name)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Separator */}
          <Separator className="my-8 bg-slate-200" />

          {/* Custom palette builder */}
          <section className="mb-8">
            <div className="mb-4 flex items-center gap-2">
              <Plus className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-slate-900">Crea tu paleta</h2>
            </div>
            <CustomPaletteBuilder
              savedPalettes={savedPalettes}
              onSave={savePreset}
              onApply={applyPreset}
            />
          </section>

          {/* Saved palettes */}
          <section className="mb-8">
            <div className="mb-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-amber-500" />
                <h2 className="text-lg font-bold text-slate-900">Paletas guardadas</h2>
                {savedPalettes.length > 0 && (
                  <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                    {savedPalettes.length}
                  </Badge>
                )}
              </div>
            </div>
            <SavedPalettesGrid
              palettes={savedPalettes}
              cardName={selectedCard?.cardName}
              onApply={applyPreset}
              onPreview={(p) => setPreviewPreset(p)}
              onDelete={deleteSaved}
            />
          </section>

          {/* Color tips */}
          <ColorTips />

          {/* Multi-card note */}
          {cards.length > 1 && (
            <p className="mt-6 flex items-center gap-1.5 text-xs text-slate-400">
              <Sparkles className="h-3.5 w-3.5" />
              Tienes {cards.length} tarjetas. El tema se aplica a la tarjeta seleccionada en el panel.
            </p>
          )}
        </div>
      </main>

      {/* Footer sticky */}
      <footer className="mt-auto border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <FTPLogo variant="icon" className="size-7" />
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} FTP Digital Plus — Temas y Paletas
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

      {/* Vista previa Dialog */}
      <Dialog open={!!previewPreset} onOpenChange={(o) => !o && setPreviewPreset(null)}>
        <DialogContent className="max-h-[95vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-emerald-600" />
              Vista previa: {previewPreset?.name}
            </DialogTitle>
            <DialogDescription>
              Así se vería tu tarjeta con esta paleta. {previewPreset?.gradient}
            </DialogDescription>
          </DialogHeader>
          {previewPreset && selectedCard ? (
            <div className="space-y-4">
              <div className="bg-muted/30 p-4">
                <CardPreview
                  card={{
                    ...selectedCard,
                    primaryColor: previewPreset.primary,
                    secondaryColor: previewPreset.secondary,
                    backgroundColor: previewPreset.background,
                    textColor: previewPreset.text,
                  }}
                  userPlan={currentUserPlan}
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Swatches preset={previewPreset} />
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => previewPreset && toggleSaved(previewPreset)}
                    className={cn(
                      'gap-1.5',
                      savedPalettes.some(s => s.name === previewPreset.name)
                        ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                        : 'border-slate-200 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                    )}
                  >
                    <Heart className={cn('h-4 w-4', savedPalettes.some(s => s.name === previewPreset.name) && 'fill-amber-500 text-amber-500')} />
                    {savedPalettes.some(s => s.name === previewPreset.name) ? 'Guardada' : 'Guardar'}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      if (previewPreset) applyPreset(previewPreset);
                      setPreviewPreset(null);
                    }}
                    className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Check className="h-4 w-4" />
                    Aplicar a mi tarjeta
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-dashed border-amber-200 bg-amber-50 p-6 text-center">
                <p className="text-sm font-medium text-amber-800">No hay tarjeta seleccionada</p>
                <p className="mt-1 text-xs text-amber-700">
                  Selecciona una tarjeta desde el panel para ver la vista previa completa con tus datos.
                  Mientras tanto, aquí va una demo con la paleta:
                </p>
                <div className="mt-4 flex justify-center">
                  {previewPreset && <PaletteMiniPreview preset={previewPreset} name="Demo" />}
                </div>
              </div>
              {previewPreset && <Swatches preset={previewPreset} />}
              <div className="flex justify-end gap-2">
                {previewPreset && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleSaved(previewPreset)}
                      className={cn(
                        'gap-1.5',
                        savedPalettes.some(s => s.name === previewPreset.name)
                          ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                          : 'border-slate-200 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                      )}
                    >
                      <Heart className={cn('h-4 w-4', savedPalettes.some(s => s.name === previewPreset.name) && 'fill-amber-500 text-amber-500')} />
                      Guardar
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        navigate('dashboard');
                        setPreviewPreset(null);
                      }}
                      className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                    >
                      Ir al panel
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ThemesPage;
