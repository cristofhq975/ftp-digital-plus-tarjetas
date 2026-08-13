'use client';

/**
 * GlobalSearch — Búsqueda global de FTP Digital Plus.
 *
 * Busca simultáneamente en:
 *  - Tarjetas (nombre, descripción, linkName, servicios, productos)
 *  - Mensajes (contenido, remitente, email)
 *  - Citas (cliente, email, fecha)
 *  - Secciones del editor (las 24 secciones)
 *  - Páginas (todas las vistas navegables)
 *  - Acciones rápidas (crear tarjeta, ver perfil, cerrar sesión)
 *
 * Características:
 *  - Atajo "/" para abrir (cuando no se está escribiendo en un input)
 *  - Búsqueda difusa (case-insensitive, parcial) con debounce de 200 ms
 *  - Resultados agrupados por tipo
 *  - Cada resultado muestra: icono, título, descripción, badge de tipo
 *  - Navegación por teclado (↑/↓/Enter) vía cmdk
 *  - Búsquedas recientes persistidas en localStorage (últimas 10)
 *  - Estado de carga con skeleton shimmer
 *  - Estado vacío con mensaje claro
 *  - Cierre con ESC o clic fuera
 *
 * Eventos:
 *  - Escucha el evento `ftp:open-global-search` para apertura programática
 *    (por ejemplo, desde el botón "Buscar" del dashboard).
 */

import * as React from 'react';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Search, X, Clock, FileText, MessageSquare, Calendar, Layout,
  CreditCard, Mail, Users, Package, Database, Settings as SettingsIcon,
  LayoutDashboard, LayoutTemplate, BarChart3, HelpCircle, LifeBuoy,
  ShieldCheck, RefreshCw, Home, LogIn, Plus, CircleUser, LogOut,
  ArrowUp, ArrowDown, CornerDownLeft, Sparkles,
  type LucideIcon,
} from 'lucide-react';

import {
  Dialog, DialogContent, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  Command, CommandInput, CommandList, CommandEmpty,
  CommandGroup, CommandItem, CommandSeparator,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import { EDITOR_SECTIONS } from '@/lib/plans';
import type { BusinessCard, ViewType } from '@/lib/types';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Tipos internos                                                     */
/* ------------------------------------------------------------------ */

type ResultKind = 'tarjeta' | 'mensaje' | 'cita' | 'seccion' | 'pagina' | 'accion';

interface SearchResult {
  id: string;
  kind: ResultKind;
  title: string;
  description: string;
  icon: LucideIcon;
  /** texto contra el que se hace matching (title + description + extras) */
  haystack: string;
  /** grupo donde se muestra */
  group: string;
  /** función a ejecutar al seleccionar */
  onSelect: () => void;
}

/* ------------------------------------------------------------------ */
/*  Constantes de páginas y acciones                                   */
/* ------------------------------------------------------------------ */

interface PageEntry {
  view: ViewType;
  label: string;
  description: string;
  icon: LucideIcon;
  /** requiere sesión */
  auth?: boolean;
}

const PAGES: PageEntry[] = [
  { view: 'landing', label: 'Inicio', description: 'Página principal de FTP Digital Plus', icon: Home },
  { view: 'pricing', label: 'Planes', description: 'Compara planes Gratis, Básico y Pro', icon: CreditCard },
  { view: 'login', label: 'Iniciar Sesión', description: 'Acceder a tu cuenta', icon: LogIn },
  { view: 'register', label: 'Crear Cuenta', description: 'Regístrate gratis en segundos', icon: Plus },
  { view: 'dashboard', label: 'Dashboard', description: 'Panel principal de gestión', icon: LayoutDashboard, auth: true },
  { view: 'editor', label: 'Editor de Tarjeta', description: 'Personaliza tu tarjeta digital', icon: Layout, auth: true },
  { view: 'messages', label: 'Mensajes / Consultas', description: 'Bandeja de mensajes recibidos', icon: Mail, auth: true },
  { view: 'appointments', label: 'Citas', description: 'Citas agendadas con tu equipo', icon: Calendar, auth: true },
  { view: 'stats', label: 'Analítica', description: 'Estadísticas de tus tarjetas', icon: BarChart3, auth: true },
  { view: 'template-gallery', label: 'Plantillas', description: 'Galería de plantillas disponibles', icon: LayoutTemplate },
  { view: 'help', label: 'Centro de Ayuda', description: 'Preguntas frecuentes y guías', icon: HelpCircle },
  { view: 'support', label: 'Soporte', description: 'Contacta al equipo de soporte', icon: LifeBuoy },
  { view: 'profile', label: 'Perfil', description: 'Tus datos de cuenta', icon: CircleUser, auth: true },
  { view: 'orders', label: 'Pedidos', description: 'Solicitudes de productos', icon: Package, auth: true },
  { view: 'virtual-funds', label: 'Fondos Virtuales', description: 'Imágenes para tarjetas NFC', icon: CreditCard, auth: true },
  { view: 'affiliations', label: 'Afiliados', description: 'Programa de afiliados', icon: Users, auth: true },
  { view: 'storage', label: 'Almacenamiento', description: 'Capacidad de almacenamiento', icon: Database, auth: true },
  { view: 'settings', label: 'Ajustes', description: 'Configuración de cuenta y pagos', icon: SettingsIcon, auth: true },
  { view: 'terms', label: 'Términos y Condiciones', description: 'Documento legal', icon: FileText },
  { view: 'privacy', label: 'Privacidad', description: 'Política de privacidad', icon: ShieldCheck },
  { view: 'refunds', label: 'Reembolsos', description: 'Política de reembolsos', icon: RefreshCw },
];

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  keywords: string;
  run: (ctx: ActionContext) => void;
}

interface ActionContext {
  navigate: (view: ViewType) => void;
  selectCard: (id: string | null) => void;
  setEditorSection: (section: string) => void;
  logout: () => void;
  cards: BusinessCard[];
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'qa-create-card',
    label: 'Crear Nueva Tarjeta',
    description: 'Abre el asistente de creación de tarjeta',
    icon: Plus,
    keywords: 'crear nueva agregar tarjeta',
    run: ctx => {
      ctx.navigate('dashboard');
      setTimeout(() => {
        toast.info('Pulsa “Crear Nueva Tarjeta” en el panel', {
          description: 'Te llevamos al dashboard para continuar.',
        });
      }, 250);
    },
  },
  {
    id: 'qa-view-profile',
    label: 'Ver Mi Perfil',
    description: 'Datos de tu cuenta y plan contratado',
    icon: CircleUser,
    keywords: 'perfil cuenta datos plan',
    run: ctx => ctx.navigate('profile'),
  },
  {
    id: 'qa-analytics',
    label: 'Ver Analítica',
    description: 'Estadísticas detalladas de tus tarjetas',
    icon: BarChart3,
    keywords: 'estadisticas analitica stats metricas',
    run: ctx => ctx.navigate('stats'),
  },
  {
    id: 'qa-templates',
    label: 'Ver Plantillas',
    description: 'Galería de plantillas profesionales',
    icon: LayoutTemplate,
    keywords: 'plantillas template galeria diseño',
    run: ctx => ctx.navigate('template-gallery'),
  },
  {
    id: 'qa-support',
    label: 'Contactar Soporte',
    description: 'Crea un ticket de soporte',
    icon: LifeBuoy,
    keywords: 'soporte ayuda ticket contacto',
    run: ctx => ctx.navigate('support'),
  },
  {
    id: 'qa-logout',
    label: 'Cerrar Sesión',
    description: 'Sale de tu cuenta actual',
    icon: LogOut,
    keywords: 'logout salir cerrar sesion',
    run: ctx => {
      ctx.logout();
      ctx.navigate('landing');
      toast.success('Sesión cerrada correctamente');
    },
  },
];

/* ------------------------------------------------------------------ */
/*  Utilidades                                                         */
/* ------------------------------------------------------------------ */

const RECENT_KEY = 'ftp-global-search-recent';
const MAX_RECENT = 10;

function loadRecent(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveRecent(items: string[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(items.slice(0, MAX_RECENT)));
  } catch {
    // ignore
  }
}

function matches(haystack: string, query: string): boolean {
  if (!query.trim()) return false;
  const h = haystack.toLowerCase();
  const q = query.toLowerCase().trim();
  // cada token debe estar presente (búsqueda difusa por palabras)
  return q.split(/\s+/).every(tok => h.includes(tok));
}

function formatDateShort(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

/* ------------------------------------------------------------------ */
/*  Componente principal                                               */
/* ------------------------------------------------------------------ */

export interface GlobalSearchProps {
  /** Elemento disparador opcional. Si se omite, no se renderiza botón visible. */
  trigger?: React.ReactNode;
  /** Renderiza un botón flotante fijo (default: false). */
  floatingButton?: boolean;
  className?: string;
}

export function GlobalSearch({ trigger, floatingButton = false, className }: GlobalSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);

  const navigate = useAppStore(s => s.navigate);
  const selectCard = useAppStore(s => s.selectCard);
  const setEditorSection = useAppStore(s => s.setEditorSection);
  const logout = useAppStore(s => s.logout);
  const cards = useAppStore(s => s.cards);
  const messages = useAppStore(s => s.messages);
  const appointments = useAppStore(s => s.appointments);
  const currentUser = useAppStore(s => s.currentUser);

  /* Cargar recientes al montar */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRecent(loadRecent());
  }, []);

  /* Atajos de teclado y evento programático */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable ||
        target?.getAttribute('role') === 'combobox';

      // "/" abre la búsqueda sólo si no se está escribiendo
      if (
        e.key === '/' &&
        !isInput &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey
      ) {
        e.preventDefault();
        setOpen(true);
        return;
      }

      // ESC cierra
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handler);

    const openHandler = () => setOpen(true);
    window.addEventListener('ftp:open-global-search', openHandler as EventListener);

    return () => {
      window.removeEventListener('keydown', handler);
      window.removeEventListener('ftp:open-global-search', openHandler as EventListener);
    };
  }, [open]);

  /* Debounce 200 ms + estado de carga.
     Nota: usamos requestAnimationFrame para marcar "loading" sin setState
     síncrono en el cuerpo del efecto, y setTimeout para el debounce. */
  useEffect(() => {
    if (!query) {
      const r = requestAnimationFrame(() => {
        setDebounced('');
        setLoading(false);
      });
      return () => cancelAnimationFrame(r);
    }
    const raf = requestAnimationFrame(() => setLoading(true));
    const t = setTimeout(() => {
      setDebounced(query);
      setLoading(false);
    }, 200);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [query]);

  /* Limpiar búsqueda al cerrar */
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => setQuery(''), 180);
      return () => clearTimeout(t);
    }
  }, [open]);

  /* Registrar búsqueda en recientes al seleccionar */
  const recordSearch = useCallback((q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setRecent(prev => {
      const next = [trimmed, ...prev.filter(s => s !== trimmed)].slice(0, MAX_RECENT);
      saveRecent(next);
      return next;
    });
  }, []);

  const closeAndClear = useCallback(() => {
    setOpen(false);
  }, []);

  /* Contexto para acciones rápidas */
  const actionCtx: ActionContext = useMemo(
    () => ({
      navigate,
      selectCard,
      setEditorSection,
      logout,
      cards,
    }),
    [navigate, selectCard, setEditorSection, logout, cards],
  );

  /* Filtrado de páginas según auth */
  const visiblePages = useMemo(
    () => PAGES.filter(p => !p.auth || currentUser),
    [currentUser],
  );

  /* Construir todos los resultados */
  const allResults = useMemo<SearchResult[]>(() => {
    const out: SearchResult[] = [];

    /* TARJETAS */
    cards.forEach(card => {
      const haystack = [
        card.cardName, card.linkName, card.description,
        ...card.services.map(s => s.name),
        ...card.products.map(p => p.name),
      ].join(' ');
      out.push({
        id: `tarjeta-${card.id}`,
        kind: 'tarjeta',
        title: card.cardName,
        description: card.description || `/${card.linkName}`,
        icon: CreditCard,
        haystack,
        group: 'Tarjetas',
        onSelect: () => {
          selectCard(card.id);
          navigate('editor');
        },
      });
    });

    /* MENSAJES */
    messages.forEach(msg => {
      const haystack = `${msg.message} ${msg.name} ${msg.email} ${msg.phone}`;
      out.push({
        id: `mensaje-${msg.id}`,
        kind: 'mensaje',
        title: msg.name,
        description: msg.message.slice(0, 80) + (msg.message.length > 80 ? '…' : ''),
        icon: MessageSquare,
        haystack,
        group: 'Mensajes',
        onSelect: () => navigate('messages'),
      });
    });

    /* CITAS */
    appointments.forEach(appt => {
      const haystack = `${appt.clientName} ${appt.clientEmail} ${formatDateShort(appt.date)} ${appt.time} ${appt.status}`;
      out.push({
        id: `cita-${appt.id}`,
        kind: 'cita',
        title: `Cita — ${appt.clientName}`,
        description: `${formatDateShort(appt.date)} · ${appt.time} · ${appt.clientEmail}`,
        icon: Calendar,
        haystack,
        group: 'Citas',
        onSelect: () => navigate('appointments'),
      });
    });

    /* SECCIONES DEL EDITOR */
    EDITOR_SECTIONS.forEach(section => {
      const haystack = `${section.name} ${section.description} ${section.id}`;
      out.push({
        id: `seccion-${section.id}`,
        kind: 'seccion',
        title: section.name,
        description: section.description,
        icon: Layout,
        haystack,
        group: 'Secciones del Editor',
        onSelect: () => {
          // si hay al menos una tarjeta del usuario, la selecciona y abre el editor en esa sección
          const userCard = currentUser
            ? cards.find(c => c.userId === currentUser.id)
            : undefined;
          if (userCard) {
            selectCard(userCard.id);
            setEditorSection(section.id);
            navigate('editor');
            toast.info(`Sección “${section.name}” abierta en el editor`);
          } else {
            toast.info('Inicia sesión y crea una tarjeta para editar secciones', {
              description: section.name,
            });
            navigate('login');
          }
        },
      });
    });

    /* PÁGINAS */
    visiblePages.forEach(page => {
      out.push({
        id: `pagina-${page.view}`,
        kind: 'pagina',
        title: page.label,
        description: page.description,
        icon: page.icon,
        haystack: `${page.label} ${page.description} ${page.view}`,
        group: 'Páginas',
        onSelect: () => navigate(page.view),
      });
    });

    /* ACCIONES RÁPIDAS */
    QUICK_ACTIONS.forEach(action => {
      out.push({
        id: action.id,
        kind: 'accion',
        title: action.label,
        description: action.description,
        icon: action.icon,
        haystack: `${action.label} ${action.description} ${action.keywords}`,
        group: 'Acciones',
        onSelect: () => action.run(actionCtx),
      });
    });

    return out;
  }, [cards, messages, appointments, visiblePages, currentUser, selectCard, navigate, setEditorSection, actionCtx]);

  /* Resultados filtrados */
  const filtered = useMemo<SearchResult[]>(() => {
    if (!debounced.trim()) return [];
    return allResults.filter(r => matches(r.haystack, debounced));
  }, [allResults, debounced]);

  /* Agrupar resultados preservando el orden de grupos */
  const grouped = useMemo<[string, SearchResult[]][]>(() => {
    const order = ['Tarjetas', 'Mensajes', 'Citas', 'Secciones del Editor', 'Páginas', 'Acciones'];
    const map = new Map<string, SearchResult[]>();
    filtered.forEach(r => {
      if (!map.has(r.group)) map.set(r.group, []);
      map.get(r.group)!.push(r);
    });
    return order
      .filter(g => map.has(g))
      .map(g => [g, map.get(g)!] as [string, SearchResult[]]);
  }, [filtered]);

  const hasResults = grouped.length > 0;

  /* Handler al seleccionar un resultado */
  const handleSelect = useCallback(
    (r: SearchResult) => {
      if (debounced.trim()) recordSearch(debounced.trim());
      closeAndClear();
      // defer para permitir que el diálogo se cierre antes
      setTimeout(() => r.onSelect(), 30);
    },
    [debounced, recordSearch, closeAndClear],
  );

  /* Click en una búsqueda reciente */
  const applyRecent = useCallback((q: string) => {
    setQuery(q);
  }, []);

  /* Limpiar todo el historial */
  const clearRecent = useCallback(() => {
    setRecent([]);
    saveRecent([]);
    toast.success('Historial de búsquedas borrado');
  }, []);

  return (
    <>
      {/* Disparador opcional */}
      {trigger && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn('inline-flex items-center', className)}
          aria-label="Abrir búsqueda global"
        >
          {trigger}
        </button>
      )}

      {/* Botón flotante opcional */}
      {floatingButton && !trigger && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Buscar"
          className={cn(
            'fixed bottom-6 right-6 z-40 flex size-12 items-center justify-center rounded-full',
            'bg-gradient-to-br from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/40',
            'transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2',
            className,
          )}
        >
          <Search className="size-5" />
          <span className="sr-only">Buscar (atajo: /)</span>
        </button>
      )}

      {/* Overlay de búsqueda */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className={cn(
            'max-w-3xl gap-0 overflow-hidden rounded-2xl border-emerald-100/80 bg-white/95 p-0',
            'shadow-2xl shadow-emerald-900/10 backdrop-blur-xl',
            'sm:max-w-3xl',
          )}
        >
          <DialogTitle className="sr-only">Búsqueda global</DialogTitle>
          <DialogDescription className="sr-only">
            Busca tarjetas, mensajes, citas, secciones, páginas y acciones.
          </DialogDescription>

          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <Command
              className="bg-transparent"
              loop
              shouldFilter={false}
            >
              {/* Encabezado: input de búsqueda */}
              <div className="flex items-center gap-3 border-b border-emerald-100/70 px-4 py-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <Search className="size-4" />
                </div>
                <CommandInput
                  value={query}
                  onValueChange={setQuery}
                  autoFocus
                  placeholder="Busca en toda la plataforma…  (tarjetas, mensajes, páginas, acciones)"
                  className="flex-1 border-0 px-0 text-sm focus-visible:ring-0"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    aria-label="Limpiar búsqueda"
                    className="flex size-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
                <kbd className="hidden shrink-0 items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-[10px] text-slate-500 sm:flex">
                  ESC
                </kbd>
              </div>

              {/* Cuerpo: resultados / estados */}
              <CommandList className="max-h-[60vh] overflow-y-auto">
                {/* Estado de carga */}
                {loading && (
                  <div className="space-y-3 p-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="size-9 shrink-0 animate-pulse rounded-lg bg-slate-200" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-3 w-1/3 animate-pulse rounded bg-slate-200" />
                          <div className="h-2.5 w-2/3 animate-pulse rounded bg-slate-100" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Sin query → mostrar recientes */}
                {!loading && !debounced.trim() && (
                  <>
                    {recent.length > 0 ? (
                      <CommandGroup heading="Búsquedas recientes">
                        {recent.map((q, i) => (
                          <CommandItem
                            key={`recent-${i}`}
                            value={`recent ${q}`}
                            onSelect={() => applyRecent(q)}
                            className="group"
                          >
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500 transition-colors group-data-[selected=true]:bg-emerald-100 group-data-[selected=true]:text-emerald-700">
                              <Clock className="size-4" />
                            </span>
                            <span className="flex-1 truncate text-sm text-slate-700">
                              {q}
                            </span>
                            <kbd className="font-mono text-[10px] text-slate-400">Enter</kbd>
                          </CommandItem>
                        ))}
                        <CommandSeparator />
                        <div className="px-2 py-2">
                          <button
                            type="button"
                            onClick={clearRecent}
                            className="text-xs text-slate-400 transition-colors hover:text-rose-600"
                          >
                            Borrar historial
                          </button>
                        </div>
                      </CommandGroup>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                        <div className="flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                          <Search className="size-6" />
                        </div>
                        <p className="text-sm font-medium text-slate-700">
                          Escribe para buscar
                        </p>
                        <p className="max-w-xs text-xs text-muted-foreground">
                          Encuentra tarjetas, mensajes, citas, secciones del editor, páginas y acciones rápidas.
                        </p>
                      </div>
                    )}
                  </>
                )}

                {/* Resultados vacíos */}
                {!loading && debounced.trim() && !hasResults && (
                  <CommandEmpty>
                    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                      <div className="flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        <Search className="size-6" />
                      </div>
                      <p className="text-sm font-medium text-slate-600">
                        No se encontraron resultados para &ldquo;{debounced}&rdquo;
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Revisa la ortografía o prueba con términos más generales.
                      </p>
                    </div>
                  </CommandEmpty>
                )}

                {/* Resultados agrupados */}
                {!loading && hasResults && (
                  <>
                    {grouped.map(([groupName, items], groupIdx) => (
                      <React.Fragment key={groupName}>
                        <CommandGroup heading={groupName}>
                          {items.map(r => (
                            <ResultRow key={r.id} result={r} query={debounced} onSelect={handleSelect} />
                          ))}
                        </CommandGroup>
                        {groupIdx < grouped.length - 1 && <CommandSeparator />}
                      </React.Fragment>
                    ))}
                  </>
                )}
              </CommandList>

              {/* Pie: atajos + contador */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/70 px-4 py-2.5 text-[11px] text-muted-foreground">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="flex items-center gap-1">
                    <kbd className="flex size-5 items-center justify-center rounded border border-slate-200 bg-white">
                      <ArrowUp className="size-3" />
                    </kbd>
                    <kbd className="flex size-5 items-center justify-center rounded border border-slate-200 bg-white">
                      <ArrowDown className="size-3" />
                    </kbd>
                    Navegar
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="flex size-5 items-center justify-center rounded border border-slate-200 bg-white">
                      <CornerDownLeft className="size-3" />
                    </kbd>
                    Seleccionar
                  </span>
                  <span className="hidden items-center gap-1 sm:flex">
                    <kbd className="rounded border border-slate-200 bg-white px-1 py-0.5 font-mono">ESC</kbd>
                    Cerrar
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="size-3 text-amber-500" />
                  <span className="font-medium text-emerald-700">
                    {hasResults ? `${filtered.length} resultado${filtered.length === 1 ? '' : 's'}` : 'Búsqueda global'}
                  </span>
                </div>
              </div>
            </Command>
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Fila de resultado                                                  */
/* ------------------------------------------------------------------ */

const KIND_BADGE: Record<ResultKind, { label: string; className: string; iconClass: string }> = {
  tarjeta:  { label: 'Tarjeta',  className: 'bg-emerald-100 text-emerald-700 border-emerald-200',       iconClass: 'bg-emerald-50 text-emerald-700 group-data-[selected=true]:bg-emerald-100' },
  mensaje:  { label: 'Mensaje',  className: 'bg-amber-100 text-amber-700 border-amber-200',             iconClass: 'bg-amber-50 text-amber-700 group-data-[selected=true]:bg-amber-100' },
  cita:     { label: 'Cita',     className: 'bg-teal-100 text-teal-700 border-teal-200',                iconClass: 'bg-teal-50 text-teal-700 group-data-[selected=true]:bg-teal-100' },
  seccion:  { label: 'Sección', className: 'bg-slate-100 text-slate-700 border-slate-200',            iconClass: 'bg-slate-50 text-slate-700 group-data-[selected=true]:bg-slate-100' },
  pagina:   { label: 'Página',  className: 'bg-emerald-50 text-emerald-700 border-emerald-200',       iconClass: 'bg-emerald-50 text-emerald-700 group-data-[selected=true]:bg-emerald-100' },
  accion:   { label: 'Acción',   className: 'bg-amber-50 text-amber-800 border-amber-200',             iconClass: 'bg-amber-50 text-amber-700 group-data-[selected=true]:bg-amber-100' },
};

function ResultRow({
  result, query, onSelect,
}: {
  result: SearchResult;
  query: string;
  onSelect: (r: SearchResult) => void;
}) {
  const badge = KIND_BADGE[result.kind];
  return (
    <CommandItem
      value={result.haystack}
      onSelect={() => onSelect(result)}
      className="group py-2.5"
    >
      <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-md transition-colors', badge.iconClass)}>
        <result.icon className="size-4" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-sm font-medium text-slate-800 group-data-[selected=true]:text-emerald-800">
          <Highlight text={result.title} query={query} />
        </span>
        {result.description && (
          <span className="truncate text-[11px] text-muted-foreground">
            <Highlight text={result.description} query={query} />
          </span>
        )}
      </div>
      <Badge variant="outline" className={cn('ml-2 shrink-0 text-[10px] font-medium', badge.className)}>
        {badge.label}
      </Badge>
    </CommandItem>
  );
}

/* ------------------------------------------------------------------ */
/*  Resaltado de coincidencias                                        */
/* ------------------------------------------------------------------ */

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const tokens = query.toLowerCase().trim().split(/\s+/).filter(Boolean).sort((a, b) => b.length - a.length);
  if (tokens.length === 0) return <>{text}</>;

  // Construir regex segura escapando cada token
  const escaped = tokens.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const re = new RegExp(`(${escaped.join('|')})`, 'gi');
  const parts = text.split(re);

  return (
    <>
      {parts.map((part, i) =>
        tokens.includes(part.toLowerCase()) ? (
          <mark
            key={i}
            className="rounded bg-amber-200/70 px-0.5 text-slate-900"
          >
            {part}
          </mark>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        ),
      )}
    </>
  );
}

export default GlobalSearch;
