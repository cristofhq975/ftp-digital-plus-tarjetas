'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Search, X, Command, Keyboard, ArrowRight, LifeBuoy,
  CornerDownLeft,
} from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';

// ============================ Types ============================
interface Shortcut {
  keys: string[];
  description: string;
  search: string; // for filtering
}

interface ShortcutCategory {
  id: string;
  title: string;
  icon: string;
  shortcuts: Shortcut[];
}

// ============================ Data ============================
const CATEGORIES: ShortcutCategory[] = [
  {
    id: 'navegacion',
    title: 'Navegación',
    icon: 'Compass',
    shortcuts: [
      { keys: ['⌘', 'K'], description: 'Paleta de comandos', search: 'cmd k command palette comandos' },
      { keys: ['/'], description: 'Búsqueda global', search: 'buscar search global' },
      { keys: ['?'], description: 'Esta ayuda', search: 'ayuda help atajos shortcuts' },
      { keys: ['ESC'], description: 'Cerrar dialog/overlay', search: 'cerrar escape salir' },
      { keys: ['G', 'D'], description: 'Ir al Dashboard', search: 'g d dashboard tablero' },
      { keys: ['G', 'E'], description: 'Ir al Editor', search: 'g e editor editar' },
      { keys: ['G', 'A'], description: 'Ir a Analítica', search: 'g a analitica stats' },
      { keys: ['G', 'P'], description: 'Ir a Plantillas', search: 'g p plantillas templates' },
    ],
  },
  {
    id: 'acciones',
    title: 'Acciones',
    icon: 'Zap',
    shortcuts: [
      { keys: ['N'], description: 'Nueva tarjeta', search: 'n nueva tarjeta create' },
      { keys: ['S'], description: 'Compartir tarjeta', search: 's share compartir' },
      { keys: ['E'], description: 'Editar tarjeta', search: 'e edit editar' },
      { keys: ['D'], description: 'Duplicar tarjeta', search: 'd duplicate duplicar' },
      { keys: ['⌫'], description: 'Eliminar tarjeta', search: 'delete borrar eliminar' },
    ],
  },
  {
    id: 'editor',
    title: 'Editor',
    icon: 'Edit',
    shortcuts: [
      { keys: ['⌘', 'S'], description: 'Guardar cambios', search: 'cmd s save guardar' },
      { keys: ['⇥'], description: 'Navegar secciones', search: 'tab section seccion' },
      { keys: ['⇧', '⇥'], description: 'Navegar hacia atrás', search: 'shift tab back' },
      { keys: ['⌘', 'Z'], description: 'Deshacer', search: 'cmd z undo deshacer' },
    ],
  },
  {
    id: 'vista',
    title: 'Vista',
    icon: 'Eye',
    shortcuts: [
      { keys: ['T'], description: 'Cambiar tema (claro/oscuro)', search: 't theme tema claro oscuro' },
      { keys: ['F'], description: 'Pantalla completa', search: 'f fullscreen pantalla completa' },
      { keys: ['K'], description: 'Modo kiosko', search: 'k kiosk kiosko' },
    ],
  },
  {
    id: 'tour',
    title: 'Tour',
    icon: 'Compass',
    shortcuts: [
      { keys: ['⇧', 'T'], description: 'Iniciar tour guiado', search: 'shift t tour tour' },
    ],
  },
];

// ============================ Kbd component ============================
function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd
      className={cn(
        'inline-flex h-7 min-w-[28px] items-center justify-center gap-0.5 rounded-md border border-slate-300/80 bg-gradient-to-b from-slate-50 to-slate-100 px-2 text-xs font-semibold text-slate-700 shadow-[0_2px_0_rgba(0,0,0,0.06),inset_0_-1px_0_rgba(0,0,0,0.08)]',
        'dark:border-slate-600/60 dark:from-slate-700 dark:to-slate-800 dark:text-slate-100'
      )}
    >
      {children}
    </kbd>
  );
}

function KeyIcon({ k }: { k: string }) {
  switch (k) {
    case '⌘':
      return <Command className="h-3.5 w-3.5" />;
    case '⇧':
      return (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v6" />
          <path d="m8 7 4-4 4 4" />
          <rect x="4" y="13" width="16" height="8" rx="2" />
        </svg>
      );
    case '⇥':
      return (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 7h12" /><path d="m11 5-2 2 2 2" />
          <path d="M3 17h12" /><path d="m11 15-2 2 2 2" />
          <path d="M21 3v18" />
        </svg>
      );
    case '⌫':
      return (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Z" />
          <line x1="18" y1="9" x2="12" y2="15" />
          <line x1="12" y1="9" x2="18" y2="15" />
        </svg>
      );
    case 'ESC':
      return <span className="text-[10px] font-bold">ESC</span>;
    default:
      return <span className="text-sm font-bold">{k}</span>;
  }
}

// Event name used to programmatically open the overlay
export const OPEN_KEYBOARD_SHORTCUTS_EVENT = 'ftp:open-keyboard-shortcuts';

// ============================ Main ============================
export function KeyboardShortcutsOverlay({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  enableGlobalListener = true,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** When true (default), listens for the '?' key and the custom open event. */
  enableGlobalListener?: boolean;
}) {
  const navigate = useAppStore(s => s.navigate);
  const [internalOpen, setInternalOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('todas');

  const isOpen = controlledOpen ?? internalOpen;
  const setOpen = controlledOnOpenChange ?? setInternalOpen;

  // Wrapper that clears search state whenever the dialog closes.
  // This avoids calling setState synchronously inside an effect.
  const handleSetOpen = useCallback((next: boolean) => {
    if (!next) {
      setQuery('');
      setActiveCategory('todas');
    }
    setOpen(next);
  }, [setOpen]);

  // Listen for '?' key + custom open event
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement | null;
    const isTyping =
      target &&
      (target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable ||
        target.getAttribute('role') === 'combobox' ||
        target.getAttribute('role') === 'option');

    // Toggle open with '?'
    if (e.key === '?' && !isTyping) {
      e.preventDefault();
      setInternalOpen((prev) => !prev);
      return;
    }

    // Close on ESC
    if (e.key === 'Escape' && isOpen) {
      handleSetOpen(false);
    }
  }, [isOpen, handleSetOpen]);

  // Custom event listener so any button can open the overlay
  const handleOpenEvent = useCallback(() => {
    setInternalOpen(true);
  }, []);

  useEffect(() => {
    if (!enableGlobalListener) return;
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener(OPEN_KEYBOARD_SHORTCUTS_EVENT, handleOpenEvent as EventListener);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener(OPEN_KEYBOARD_SHORTCUTS_EVENT, handleOpenEvent as EventListener);
    };
  }, [handleKeyDown, handleOpenEvent, enableGlobalListener]);

  // Filtered shortcuts
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q && activeCategory === 'todas') return CATEGORIES;

    return CATEGORIES.map((cat) => {
      if (activeCategory !== 'todas' && cat.id !== activeCategory) return null;
      const filteredShortcuts = cat.shortcuts.filter(
        (s) =>
          !q ||
          s.description.toLowerCase().includes(q) ||
          s.search.toLowerCase().includes(q) ||
          s.keys.join(' ').toLowerCase().includes(q)
      );
      if (filteredShortcuts.length === 0) return null;
      return { ...cat, shortcuts: filteredShortcuts };
    }).filter(Boolean) as ShortcutCategory[];
  }, [query, activeCategory]);

  const totalResults = filtered.reduce((sum, c) => sum + c.shortcuts.length, 0);

  const handleGoToHelp = () => {
    handleSetOpen(false);
    navigate('help');
  };

  const categoryTabs = [
    { id: 'todas', label: 'Todas' },
    { id: 'navegacion', label: 'Navegación' },
    { id: 'acciones', label: 'Acciones' },
    { id: 'editor', label: 'Editor' },
    { id: 'vista', label: 'Vista' },
    { id: 'tour', label: 'Tour' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleSetOpen}>
      <DialogContent
        className="max-w-3xl gap-0 overflow-hidden p-0 sm:rounded-2xl"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Atajos de teclado</DialogTitle>
        <DialogDescription className="sr-only">
          Lista completa de atajos de teclado disponibles en FTP Digital Plus
        </DialogDescription>

        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-amber-600 px-6 py-5 text-white">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-amber-300/20 blur-2xl" />
            <div className="relative flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm ring-1 ring-white/20">
                  <Keyboard className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-tight">
                    Atajos de Teclado
                  </h2>
                  <p className="text-xs text-emerald-50/90">
                    Aprende a moverte por FTP Digital Plus como un profesional
                  </p>
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleSetOpen(false)}
                className="text-white hover:bg-white/15 hover:text-white"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Search */}
            <div className="relative mt-4">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
              <Input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar atajos..."
                className={cn(
                  'border-white/20 bg-white/10 pl-10 text-white placeholder:text-white/60',
                  'focus:border-white/40 focus-visible:ring-white/20'
                )}
              />
            </div>
          </div>

          {/* Category tabs */}
          <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 bg-slate-50/60 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/40">
            {categoryTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-semibold transition-all',
                  activeCategory === tab.id
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                    : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60'
                )}
              >
                {tab.label}
              </button>
            ))}
            <div className="ml-auto">
              <Badge variant="outline" className="border-slate-300 text-slate-500 dark:border-slate-700 dark:text-slate-400">
                {totalResults} resultado{totalResults !== 1 ? 's' : ''}
              </Badge>
            </div>
          </div>

          {/* Body */}
          <div className="max-h-[60vh] overflow-y-auto px-6 py-5 custom-scrollbar">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                  <Search className="h-5 w-5 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  No encontramos atajos
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Prueba con otra palabra clave
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {filtered.map((cat) => (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="mb-2.5 flex items-center gap-2">
                      <h3 className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                        {cat.title}
                      </h3>
                      <Separator className="flex-1" />
                      <span className="text-[10px] font-medium text-muted-foreground">
                        {cat.shortcuts.length}
                      </span>
                    </div>
                    <ul className="grid gap-1.5 sm:grid-cols-2">
                      {cat.shortcuts.map((s, i) => (
                        <li
                          key={`${cat.id}-${i}`}
                          className="flex items-center justify-between gap-3 rounded-lg border border-transparent px-2.5 py-2 transition-colors hover:border-slate-200 hover:bg-slate-50 dark:hover:border-slate-700 dark:hover:bg-slate-800/40"
                        >
                          <span className="text-sm text-slate-700 dark:text-slate-200">
                            {s.description}
                          </span>
                          <div className="flex shrink-0 items-center gap-1">
                            {s.keys.map((k, idx) => (
                              <Kbd key={`${k}-${idx}`}>
                                <KeyIcon k={k} />
                              </Kbd>
                            ))}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer CTA */}
          <div className="border-t border-slate-200 bg-gradient-to-r from-emerald-50/70 to-amber-50/70 px-6 py-3 dark:border-slate-800 dark:from-emerald-950/40 dark:to-amber-950/40">
            <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CornerDownLeft className="h-3.5 w-3.5" />
                <span>Presiona <Kbd><KeyIcon k="ESC" /></Kbd> para cerrar</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleGoToHelp}
                className="gap-1.5 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/60"
              >
                <LifeBuoy className="h-4 w-4" />
                <span className="text-xs font-semibold">¿Necesitas más ayuda?</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

// ============================ Trigger button ============================
export function KeyboardShortcutsButton({ className }: { className?: string }) {
  const handleClick = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(OPEN_KEYBOARD_SHORTCUTS_EVENT));
    }
  }, []);
  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Ver atajos de teclado"
      title="Atajos de teclado (?)"
      className={cn(
        'inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700',
        'dark:border-slate-700 dark:bg-slate-900 dark:hover:border-emerald-600 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400',
        className
      )}
    >
      <span className="text-[11px] font-bold">?</span>
    </button>
  );
}
