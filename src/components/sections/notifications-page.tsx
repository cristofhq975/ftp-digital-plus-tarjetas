'use client';

/**
 * notifications-page.tsx — Centro de Notificaciones completo (Task 11-a)
 *
 * Características:
 *  - Header con back button, título y theme toggle
 *  - Barra de filtros: Tabs (Todas / Sin leer / Importantes), Select por tipo,
 *    "Marcar todas como leídas" y "Eliminar leídas"
 *  - Resumen con 3 mini cards (Total / Sin leer / Importantes)
 *  - Lista scrollable con iconos por tipo, prioridad badge, acción, swipe-delete
 *  - Empty state con EmptyState component
 *  - Footer sticky
 */

import { useMemo, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Bell,
  CheckCheck,
  Trash2,
  Filter,
  MessageSquare,
  Calendar,
  QrCode,
  Eye,
  Crown,
  Settings,
  Plus,
  Edit,
  AlertCircle,
  CreditCard,
  type LucideIcon,
} from 'lucide-react';
import { useAppStore, type AppNotification, type NotificationType } from '@/lib/store';
import { getRelativeTime } from '@/lib/card-utils';
import { cn } from '@/lib/utils';
import { FTPLogo } from '@/components/ftp-logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { EmptyState } from '@/components/empty-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/* ------------------------------------------------------------------ */
/*  Configuración de tipos de notificación                              */
/* ------------------------------------------------------------------ */

interface TypeConfig {
  icon: LucideIcon;
  bg: string;
  iconColor: string;
  label: string;
}

const TYPE_CONFIG: Record<NotificationType, TypeConfig> = {
  message:        { icon: MessageSquare, bg: 'bg-emerald-100',  iconColor: 'text-emerald-600',  label: 'Mensaje' },
  appointment:    { icon: Calendar,      bg: 'bg-cyan-100',      iconColor: 'text-cyan-600',     label: 'Cita' },
  qr_scan:         { icon: QrCode,        bg: 'bg-violet-100',    iconColor: 'text-violet-600',   label: 'QR' },
  view_milestone: { icon: Eye,           bg: 'bg-emerald-100',   iconColor: 'text-emerald-600',  label: 'Vistas' },
  plan:            { icon: Crown,        bg: 'bg-amber-100',     iconColor: 'text-amber-600',    label: 'Plan' },
  system:         { icon: Settings,      bg: 'bg-slate-100',     iconColor: 'text-slate-600',    label: 'Sistema' },
  card_created:   { icon: Plus,          bg: 'bg-emerald-100',   iconColor: 'text-emerald-600',  label: 'Tarjeta creada' },
  card_updated:   { icon: Edit,          bg: 'bg-amber-100',     iconColor: 'text-amber-600',    label: 'Tarjeta actualizada' },
  limit_warning:  { icon: AlertCircle,   bg: 'bg-rose-100',      iconColor: 'text-rose-600',     label: 'Límite' },
  payment:        { icon: CreditCard,    bg: 'bg-emerald-100',   iconColor: 'text-emerald-600',  label: 'Pago' },
};

const PRIORITY_CONFIG: Record<AppNotification['priority'], { label: string; className: string }> = {
  high:   { label: 'Alta',  className: 'bg-rose-100 text-rose-700 border-rose-200' },
  medium: { label: 'Media', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  low:    { label: 'Baja',  className: 'bg-slate-100 text-slate-600 border-slate-200' },
};

type TabFilter = 'todas' | 'unread' | 'important';
type TypeFilter = NotificationType | 'todos';

/* ------------------------------------------------------------------ */
/*  Mini stat cards                                                    */
/* ------------------------------------------------------------------ */

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  delay,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  accent: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
    >
      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <CardContent className="flex items-center gap-3 p-4 sm:gap-4 sm:p-5">
          <div
            className={cn(
              'flex size-10 shrink-0 items-center justify-center rounded-full ring-1 ring-black/5 sm:size-12',
              accent,
            )}
          >
            <Icon className="size-5 sm:size-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-2xl font-bold tabular-nums text-slate-900 sm:text-3xl">{value}</p>
            <p className="text-xs text-slate-500 sm:text-sm">{label}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Notification row                                                    */
/* ------------------------------------------------------------------ */

interface NotificationRowProps {
  notification: AppNotification;
  onMarkRead: (id: string) => void;
  onAction: (n: AppNotification) => void;
  onDelete: (id: string) => void;
  isMobile: boolean;
}

function NotificationRow({ notification, onMarkRead, onAction, onDelete }: NotificationRowProps) {
  const cfg = TYPE_CONFIG[notification.type];
  const Icon = cfg.icon;
  const priority = PRIORITY_CONFIG[notification.priority];
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);
  const [dragX, setDragX] = useState(0);

  const isUnread = !notification.read;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.touches[0].clientX - touchStartX.current;
    // solo deslizar a la izquierda (negativo), máximo -120px
    const clamped = Math.max(-120, Math.min(0, delta));
    touchDeltaX.current = clamped;
    setDragX(clamped);
  };

  const handleTouchEnd = () => {
    if (touchDeltaX.current < -80) {
      // threshold reached → eliminar
      onDelete(notification.id);
      toast.success('Notificación eliminada');
    }
    setDragX(0);
    touchStartX.current = null;
    touchDeltaX.current = 0;
  };

  const handleClick = () => {
    if (isUnread) {
      onMarkRead(notification.id);
    }
    if (notification.actionView) {
      onAction(notification);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16, height: 0, marginTop: 0 }}
      transition={{ duration: 0.2 }}
      className="relative"
    >
      {/* Fondo del swipe (rojo con trash) */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-end overflow-hidden rounded-xl bg-gradient-to-l from-rose-500 to-rose-600 px-5">
        <Trash2 className="size-5 text-white" />
      </div>

      <motion.div
        drag="x"
        style={{ x: dragX }}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.12}
        onDragEnd={(_, info) => {
          if (info.offset.x < -100) {
            onDelete(notification.id);
            toast.success('Notificación eliminada');
          }
          setDragX(0);
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={cn(
          'relative cursor-pointer overflow-hidden rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md',
          isUnread
            ? 'border-emerald-200 border-l-4 border-l-emerald-500'
            : 'border-slate-200',
        )}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-label={`${notification.title} — ${cfg.label}`}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        <div className="flex items-start gap-3 p-4 sm:gap-4 sm:p-5">
          {/* Icono por tipo */}
          <div
            className={cn(
              'flex size-10 shrink-0 items-center justify-center rounded-full ring-1 ring-black/5 sm:size-12',
              cfg.bg,
            )}
          >
            <Icon className={cn('size-5 sm:size-6', cfg.iconColor)} />
          </div>

          {/* Contenido */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-900 sm:text-base">
                    {notification.title}
                  </h3>
                  {isUnread && (
                    <span
                      aria-label="Sin leer"
                      className="inline-flex size-2 shrink-0 rounded-full bg-emerald-500 ring-2 ring-emerald-100"
                    />
                  )}
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-slate-600">{notification.description}</p>
              </div>

              {/* Botón eliminar en desktop */}
              <button
                onClick={e => {
                  e.stopPropagation();
                  onDelete(notification.id);
                  toast.success('Notificación eliminada');
                }}
                aria-label="Eliminar notificación"
                className="hidden shrink-0 rounded-md p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 sm:block"
              >
                <Trash2 className="size-4" />
              </button>
            </div>

            {/* Footer: prioridad + tiempo + acción */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className={cn('gap-1 px-2 py-0.5 text-[10px] font-medium', priority.className)}
              >
                Prioridad {priority.label}
              </Badge>
              <Badge
                variant="outline"
                className={cn('gap-1 px-2 py-0.5 text-[10px] font-medium', cfg.bg, cfg.iconColor, 'border-transparent')}
              >
                {cfg.label}
              </Badge>
              <span className="text-xs text-slate-400">
                {getRelativeTime(notification.timestamp)}
              </span>

              {notification.actionLabel && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={e => {
                    e.stopPropagation();
                    if (isUnread) onMarkRead(notification.id);
                    onAction(notification);
                  }}
                  className="ml-auto h-7 gap-1 px-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                >
                  {notification.actionLabel}
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export function NotificationsPage() {
  const navigate = useAppStore(s => s.navigate);
  const notifications = useAppStore(s => s.notifications);
  const markNotificationRead = useAppStore(s => s.markNotificationRead);
  const markAllNotificationsRead = useAppStore(s => s.markAllNotificationsRead);
  const deleteNotification = useAppStore(s => s.deleteNotification);

  const [tab, setTab] = useState<TabFilter>('todas');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('todos');

  const stats = useMemo(() => {
    const total = notifications.length;
    const unread = notifications.filter(n => !n.read).length;
    const important = notifications.filter(n => n.priority === 'high').length;
    return { total, unread, important };
  }, [notifications]);

  const filtered = useMemo(() => {
    let list = [...notifications];
    if (tab === 'unread') list = list.filter(n => !n.read);
    if (tab === 'important') list = list.filter(n => n.priority === 'high');
    if (typeFilter !== 'todos') list = list.filter(n => n.type === typeFilter);
    return list.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [notifications, tab, typeFilter]);

  const handleAction = useCallback(
    (n: AppNotification) => {
      if (n.actionView) {
        navigate(n.actionView);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [navigate],
  );

  const handleMarkAllRead = useCallback(() => {
    if (stats.unread === 0) {
      toast.info('No tienes notificaciones sin leer');
      return;
    }
    markAllNotificationsRead();
    toast.success(`${stats.unread} notificación${stats.unread > 1 ? 'es' : ''} marcada${stats.unread > 1 ? 's' : ''} como leída${stats.unread > 1 ? 's' : ''}`);
  }, [stats.unread, markAllNotificationsRead]);

  const handleDeleteRead = useCallback(() => {
    const readCount = notifications.filter(n => n.read).length;
    if (readCount === 0) {
      toast.info('No tienes notificaciones leídas para eliminar');
      return;
    }
    notifications.forEach(n => {
      if (n.read) deleteNotification(n.id);
    });
    toast.success(`${readCount} notificación${readCount > 1 ? 'es' : ''} eliminada${readCount > 1 ? 's' : ''}`);
  }, [notifications, deleteNotification]);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-emerald-50/40">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-emerald-100/60 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
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
            <div className="hidden items-center gap-2 sm:flex">
              <FTPLogo variant="icon" className="size-8" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 sm:text-lg">Notificaciones</h1>
              <p className="hidden text-xs text-slate-500 sm:block">
                {stats.unread > 0
                  ? `${stats.unread} sin leer de ${stats.total} en total`
                  : 'Estás al día'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <ThemeToggle className="text-slate-600 hover:bg-emerald-50 hover:text-emerald-700" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                navigate('dashboard');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
            >
              <span className="hidden sm:inline">Volver al Panel</span>
              <span className="sm:hidden">Panel</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto max-w-5xl">
          {/* Title section */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="flex size-9 items-center justify-center rounded-full bg-emerald-100">
                  <Bell className="size-5 text-emerald-700" />
                </span>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Centro de Notificaciones
                </h2>
              </div>
              <p className="mt-2 max-w-xl text-sm text-slate-600">
                Mantente al tanto de mensajes, citas, escaneos QR, hitos y actualizaciones de tu cuenta.
              </p>
            </div>
          </motion.div>

          {/* Stats summary */}
          <div className="mb-6 grid grid-cols-1 gap-3 sm:mb-8 sm:grid-cols-3 sm:gap-4">
            <StatCard
              label="Notificaciones totales"
              value={stats.total}
              icon={Bell}
              accent="bg-emerald-100 text-emerald-700"
              delay={0}
            />
            <StatCard
              label="Sin leer"
              value={stats.unread}
              icon={MessageSquare}
              accent="bg-amber-100 text-amber-700"
              delay={0.05}
            />
            <StatCard
              label="Importantes (alta prioridad)"
              value={stats.important}
              icon={AlertCircle}
              accent="bg-rose-100 text-rose-700"
              delay={0.1}
            />
          </div>

          {/* Filter bar */}
          <Card className="mb-5 border-slate-200 shadow-sm">
            <CardContent className="flex flex-col gap-3 p-4 sm:p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <Tabs value={tab} onValueChange={v => setTab(v as TabFilter)}>
                  <TabsList className="grid w-full grid-cols-3 bg-emerald-50/60 sm:w-auto lg:grid-cols-3">
                    <TabsTrigger
                      value="todas"
                      className="data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm"
                    >
                      Todas
                    </TabsTrigger>
                    <TabsTrigger
                      value="unread"
                      className="data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm"
                    >
                      Sin leer
                      {stats.unread > 0 && (
                        <span className="ml-1.5 rounded-full bg-rose-500 px-1.5 text-[10px] font-bold leading-none text-white">
                          {stats.unread > 9 ? '9+' : stats.unread}
                        </span>
                      )}
                    </TabsTrigger>
                    <TabsTrigger
                      value="important"
                      className="data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm"
                    >
                      Importantes
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="flex flex-wrap items-center gap-2">
                  <Select value={typeFilter} onValueChange={v => setTypeFilter(v as TypeFilter)}>
                    <SelectTrigger
                      size="sm"
                      className="h-9 min-w-[160px] gap-2 border-slate-200 bg-white text-sm"
                      aria-label="Filtrar por tipo"
                    >
                      <Filter className="size-3.5 text-slate-400" />
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los tipos</SelectItem>
                      <SelectItem value="message">Mensajes</SelectItem>
                      <SelectItem value="appointment">Citas</SelectItem>
                      <SelectItem value="qr_scan">Escaneos QR</SelectItem>
                      <SelectItem value="view_milestone">Hitos de vistas</SelectItem>
                      <SelectItem value="plan">Plan</SelectItem>
                      <SelectItem value="system">Sistema</SelectItem>
                      <SelectItem value="card_created">Tarjeta creada</SelectItem>
                      <SelectItem value="card_updated">Tarjeta actualizada</SelectItem>
                      <SelectItem value="limit_warning">Límites</SelectItem>
                      <SelectItem value="payment">Pagos</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkAllRead}
                    disabled={stats.unread === 0}
                    className="h-9 gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 disabled:opacity-50"
                  >
                    <CheckCheck className="size-4" />
                    <span className="hidden sm:inline">Marcar todas como leídas</span>
                    <span className="sm:hidden">Marcar leídas</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeleteRead}
                    disabled={notifications.every(n => !n.read)}
                    className="h-9 gap-1.5 border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800 disabled:opacity-50"
                  >
                    <Trash2 className="size-4" />
                    <span className="hidden sm:inline">Eliminar leídas</span>
                    <span className="sm:hidden">Borrar leídas</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications list */}
          {filtered.length === 0 ? (
            <Card className="border-dashed border-slate-200 bg-white">
              <CardContent className="p-0">
                <EmptyState
                  variant="default"
                  icon={<Bell className="size-10 text-emerald-500" />}
                  title="No tienes notificaciones"
                  description={
                    tab === 'unread'
                      ? 'No tienes notificaciones sin leer. ¡Estás al día!'
                      : tab === 'important'
                        ? 'No tienes notificaciones marcadas como importantes.'
                        : typeFilter !== 'todos'
                          ? 'No hay notificaciones del tipo seleccionado. Prueba con otro filtro.'
                          : 'Las novedades de tu cuenta aparecerán aquí.'
                  }
                  action={{
                    label: 'Volver al Panel',
                    onClick: () => {
                      navigate('dashboard');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    },
                  }}
                />
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="max-h-[calc(100vh-22rem)] min-h-[200px]">
              <div className="flex flex-col gap-3 pr-1">
                <AnimatePresence mode="popLayout">
                  {filtered.map(n => (
                    <NotificationRow
                      key={n.id}
                      notification={n}
                      onMarkRead={markNotificationRead}
                      onAction={handleAction}
                      onDelete={deleteNotification}
                      isMobile={false}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
          )}

          <Separator className="mt-8 bg-slate-200" />

          {/* Hint */}
          <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="size-3.5" />
            Tip: En móvil, desliza una notificación hacia la izquierda para eliminarla.
          </p>
        </div>
      </main>

      {/* Footer sticky */}
      <footer className="mt-auto border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-4 py-6 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <FTPLogo variant="icon" className="size-7" />
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} FTP Digital Plus — Notificaciones
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
    </div>
  );
}

export default NotificationsPage;
