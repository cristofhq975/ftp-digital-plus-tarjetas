'use client';

import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import {
  Home, CreditCard, LogIn, LayoutDashboard, Plus, LayoutTemplate,
  BarChart3, LifeBuoy, HelpCircle, FileText, ShieldCheck, Bell,
  Moon, Sun, Search, Command as CommandIcon, CornerDownLeft,
  ArrowUp, ArrowDown,
  type LucideIcon,
} from 'lucide-react';

import {
  Command, CommandInput, CommandList, CommandEmpty,
  CommandGroup, CommandItem, CommandShortcut, CommandSeparator,
} from '@/components/ui/command';
import {
  Dialog, DialogContent, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import { BusinessCard, ViewType } from '@/lib/types';
import { cn } from '@/lib/utils';

interface CommandEntry {
  id: string;
  label: string;
  description?: string;
  icon: LucideIcon;
  shortcut?: string;
  keywords?: string;
  group: string;
  action: () => void;
  iconClass?: string;
}

const RECENT_KEY = 'ftp-cmd-recent';
const MAX_RECENT = 5;

function loadRecent(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecent(ids: string[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(ids.slice(0, MAX_RECENT)));
  } catch {
    // ignore
  }
}

/**
 * Paleta de comandos (Cmd+K / Ctrl+K / /).
 * Se monta globalmente en layout.tsx. Escucha combinaciones de teclas
 * y se abre con un overlay + búsqueda difusa + agrupaciones.
 */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  const navigate = useAppStore(s => s.navigate);
  const selectCard = useAppStore(s => s.selectCard);
  const currentUser = useAppStore(s => s.currentUser);
  const cards = useAppStore(s => s.cards);
  const { theme, setTheme, resolvedTheme } = useTheme();

  // Load recent on mount (client-only; localStorage is unavailable during SSR)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRecentIds(loadRecent());
  }, []);

  // Global key listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable ||
        target?.getAttribute('role') === 'combobox';

      // Cmd+K / Ctrl+K
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setOpen(o => !o);
        return;
      }

      // "/" only when not typing
      if (e.key === '/' && !isInput && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', handler);

    // Allow other components to programmatically open the palette
    const openHandler = () => setOpen(true);
    window.addEventListener('ftp:open-command-palette', openHandler as EventListener);

    return () => {
      window.removeEventListener('keydown', handler);
      window.removeEventListener('ftp:open-command-palette', openHandler as EventListener);
    };
  }, []);

  // Clear search on close
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => setSearch(''), 150);
      return () => clearTimeout(t);
    }
  }, [open]);

  const userCards = useMemo<BusinessCard[]>(() => {
    if (!currentUser) return [];
    return cards.filter(c => c.userId === currentUser.id);
  }, [currentUser, cards]);

  const toggleTheme = useCallback(() => {
    const isDark = (resolvedTheme || theme) === 'dark';
    setTheme(isDark ? 'light' : 'dark');
    toast.success(isDark ? 'Tema claro activado' : 'Tema oscuro activado');
  }, [theme, resolvedTheme, setTheme]);

  const runCommand = useCallback((entry: CommandEntry) => {
    // Track recent
    setRecentIds(prev => {
      const next = [entry.id, ...prev.filter(id => id !== entry.id)].slice(0, MAX_RECENT);
      saveRecent(next);
      return next;
    });
    entry.action();
    setOpen(false);
  }, []);

  // Build the full command list (memoized; depends on user/cards)
  const allCommands = useMemo<CommandEntry[]>(() => {
    const cmds: CommandEntry[] = [];

    /* NAVEGACIÓN */
    cmds.push({
      id: 'nav-inicio',
      label: 'Inicio',
      description: 'Página principal de FTP Digital Plus',
      icon: Home,
      group: 'Navegación',
      keywords: 'home landing principal',
      action: () => navigate('landing'),
    });
    cmds.push({
      id: 'nav-planes',
      label: 'Planes',
      description: 'Compara planes Gratis, Básico y Pro',
      icon: CreditCard,
      group: 'Navegación',
      keywords: 'pricing precios upgrade comprar',
      action: () => navigate('pricing'),
    });
    cmds.push({
      id: 'nav-login',
      label: 'Iniciar Sesión',
      description: 'Accede a tu cuenta',
      icon: LogIn,
      group: 'Navegación',
      keywords: 'login sesion entrar cuenta',
      action: () => navigate('login'),
    });
    if (currentUser) {
      cmds.push({
        id: 'nav-dashboard',
        label: 'Dashboard',
        description: 'Panel principal de gestión',
        icon: LayoutDashboard,
        group: 'Navegación',
        shortcut: '⌘D',
        keywords: 'panel tablero admin',
        action: () => navigate('dashboard'),
      });
    }

    /* MIS TARJETAS */
    userCards.forEach(card => {
      cmds.push({
        id: `card-${card.id}`,
        label: card.cardName,
        description: `ftpdigitalplus.com/t/${card.linkName}`,
        icon: CreditCard,
        group: 'Mis Tarjetas',
        keywords: `tarjeta ${card.linkName} ${card.description} editar`,
        action: () => {
          selectCard(card.id);
          navigate('editor');
        },
      });
    });

    /* CREAR */
    cmds.push({
      id: 'crear-nueva',
      label: 'Nueva Tarjeta',
      description: 'Crear una nueva tarjeta digital',
      icon: Plus,
      group: 'Crear',
      keywords: 'new crear agregar',
      action: () => {
        if (!currentUser) {
          toast.info('Inicia sesión para crear tarjetas');
          navigate('login');
          return;
        }
        navigate('dashboard');
        toast.info('Pulsa "Crear Nueva Tarjeta" en el panel');
      },
    });
    cmds.push({
      id: 'crear-plantillas',
      label: 'Ver Plantillas',
      description: 'Galería de plantillas disponibles',
      icon: LayoutTemplate,
      group: 'Crear',
      keywords: 'template gallery plantilla diseño',
      action: () => navigate('template-gallery'),
    });
    cmds.push({
      id: 'crear-analitica',
      label: 'Ver Analítica',
      description: 'Estadísticas de tus tarjetas',
      icon: BarChart3,
      group: 'Crear',
      keywords: 'stats analytics estadisticas',
      action: () => navigate('stats'),
    });

    /* AYUDA */
    cmds.push({
      id: 'ayuda-centro',
      label: 'Centro de Ayuda',
      description: 'Preguntas frecuentes y guías',
      icon: HelpCircle,
      group: 'Ayuda',
      keywords: 'help faq guia',
      action: () => navigate('help'),
    });
    cmds.push({
      id: 'ayuda-soporte',
      label: 'Soporte',
      description: 'Contacta al equipo de soporte',
      icon: LifeBuoy,
      group: 'Ayuda',
      keywords: 'support ticket contacto ayuda',
      action: () => navigate('support'),
    });
    cmds.push({
      id: 'ayuda-terminos',
      label: 'Términos y Condiciones',
      icon: FileText,
      group: 'Ayuda',
      keywords: 'terms legal condiciones',
      action: () => navigate('terms'),
    });
    cmds.push({
      id: 'ayuda-privacidad',
      label: 'Privacidad',
      icon: ShieldCheck,
      group: 'Ayuda',
      keywords: 'privacy privacidad datos',
      action: () => navigate('privacy'),
    });

    /* ACCIONES */
    const isDark = (resolvedTheme || theme) === 'dark';
    cmds.push({
      id: 'accion-tema',
      label: isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro',
      description: 'Alterna entre tema claro y oscuro',
      icon: isDark ? Sun : Moon,
      group: 'Acciones',
      iconClass: isDark ? 'text-amber-500' : 'text-slate-600',
      keywords: 'theme dark light tema modo oscuro claro',
      action: toggleTheme,
    });
    cmds.push({
      id: 'accion-notificaciones',
      label: 'Ver Notificaciones',
      description: 'Revisa tus notificaciones recientes',
      icon: Bell,
      group: 'Acciones',
      keywords: 'notifications avisos bell',
      action: () => {
        toast.info('Pulsa el ícono de campana 🔔 en la barra superior', {
          description: 'Ahí verás tus mensajes, citas y avisos.',
        });
      },
    });

    return cmds;
  }, [currentUser, userCards, navigate, selectCard, toggleTheme, theme, resolvedTheme]);

  // Recent commands
  const recentCommands = useMemo(() => {
    if (recentIds.length === 0) return [];
    return recentIds
      .map(id => allCommands.find(c => c.id === id))
      .filter((c): c is CommandEntry => Boolean(c));
  }, [recentIds, allCommands]);

  // Group the commands
  const groupedCommands = useMemo(() => {
    const groups = new Map<string, CommandEntry[]>();
    for (const c of allCommands) {
      if (!groups.has(c.group)) groups.set(c.group, []);
      groups.get(c.group)!.push(c);
    }
    return Array.from(groups.entries());
  }, [allCommands]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        showCloseButton={false}
        className="max-w-2xl gap-0 overflow-hidden p-0 sm:max-w-2xl"
      >
        <DialogTitle className="sr-only">Paleta de comandos</DialogTitle>
        <DialogDescription className="sr-only">
          Busca y ejecuta comandos rápidamente.
        </DialogDescription>

        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          <Command
            className="bg-background"
            filter={(value, search) => {
              // Custom fuzzy-ish filter: lowercase, split words, every search token must be substring
              const v = value.toLowerCase();
              const s = search.toLowerCase().trim();
              if (!s) return 1;
              const tokens = s.split(/\s+/);
              const matched = tokens.every(t => v.includes(t));
              return matched ? 1 : 0;
            }}
            shouldFilter={true}
            loop
          >
            {/* Search input */}
            <div className="flex items-center gap-3 border-b border-emerald-100/60 px-4 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <Search className="h-4 w-4" />
              </div>
              <CommandInput
                value={search}
                onValueChange={setSearch}
                autoFocus
                placeholder="Busca comandos, tarjetas, páginas…"
                className="flex-1 border-0 px-0 text-sm focus-visible:ring-0"
              />
              <kbd className="hidden shrink-0 items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-[10px] text-slate-500 sm:flex">
                ESC
              </kbd>
            </div>

            <CommandList ref={listRef} className="max-h-[420px] overflow-y-auto">
              <CommandEmpty>
                <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                  <Search className="h-8 w-8 text-slate-300" />
                  <p className="text-sm font-medium text-slate-600">Sin coincidencias</p>
                  <p className="text-xs text-muted-foreground">
                    Prueba con otro término como “tarjetas”, “planes” o “ayuda”.
                  </p>
                </div>
              </CommandEmpty>

              {/* Recent commands when search empty */}
              <AnimatePresence mode="wait">
                {!search && recentCommands.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <CommandGroup heading="Recientes">
                      {recentCommands.map(cmd => (
                        <CommandRow
                          key={`recent-${cmd.id}`}
                          cmd={cmd}
                          onRun={runCommand}
                        />
                      ))}
                    </CommandGroup>
                    <CommandSeparator />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Grouped commands */}
              {groupedCommands.map(([groupName, items]) => (
                <CommandGroup key={groupName} heading={groupName}>
                  {items.map(cmd => (
                    <CommandRow
                      key={cmd.id}
                      cmd={cmd}
                      onRun={runCommand}
                    />
                  ))}
                </CommandGroup>
              ))}
            </CommandList>

            {/* Footer hints */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/50 px-4 py-2.5 text-[11px] text-muted-foreground">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="flex h-5 w-5 items-center justify-center rounded border border-slate-200 bg-white">
                    <ArrowUp className="h-3 w-3" />
                  </kbd>
                  <kbd className="flex h-5 w-5 items-center justify-center rounded border border-slate-200 bg-white">
                    <ArrowDown className="h-3 w-3" />
                  </kbd>
                  Navegar
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="flex h-5 items-center gap-0.5 rounded border border-slate-200 bg-white px-1">
                    <CornerDownLeft className="h-3 w-3" />
                  </kbd>
                  Seleccionar
                </span>
                <span className="hidden items-center gap-1 sm:flex">
                  <kbd className="flex h-5 items-center gap-0.5 rounded border border-slate-200 bg-white px-1 font-mono">ESC</kbd>
                  Cerrar
                </span>
              </div>
              <div className="flex items-center gap-1">
                <CommandIcon className="h-3 w-3 text-emerald-600" />
                <span>FTP Digital Plus</span>
              </div>
            </div>
          </Command>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

/* ----------------------------- Row ----------------------------- */

function CommandRow({
  cmd, onRun,
}: {
  cmd: CommandEntry;
  onRun: (cmd: CommandEntry) => void;
}) {
  return (
    <CommandItem
      value={`${cmd.label} ${cmd.description ?? ''} ${cmd.keywords ?? ''} ${cmd.group}`}
      onSelect={() => onRun(cmd)}
      className="group py-2.5"
    >
      <span
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-700 transition-colors group-data-[selected=true]:bg-emerald-100',
          cmd.iconClass
        )}
      >
        <cmd.icon className="h-4 w-4" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium text-slate-800 group-data-[selected=true]:text-emerald-800">
          {cmd.label}
        </span>
        {cmd.description && (
          <span className="truncate text-[11px] text-muted-foreground">
            {cmd.description}
          </span>
        )}
      </div>
      {cmd.shortcut && (
        <CommandShortcut className="font-mono">{cmd.shortcut}</CommandShortcut>
      )}
    </CommandItem>
  );
}
