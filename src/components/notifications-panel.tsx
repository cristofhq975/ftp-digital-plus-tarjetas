'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Mail,
  Calendar,
  QrCode,
  AlertCircle,
  Sparkles,
  Check,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/lib/store';
import { PLANS } from '@/lib/plans';
import { getRelativeTime } from '@/lib/card-utils';
import { cn } from '@/lib/utils';

type NotificationType = 'message' | 'appointment' | 'qr' | 'limit' | 'plan';

interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  onAction: () => void;
}

const TYPE_CONFIG: Record<NotificationType, {
  icon: LucideIcon;
  bg: string;
  iconColor: string;
}> = {
  message:     { icon: Mail,         bg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
  appointment: { icon: Calendar,     bg: 'bg-amber-100',   iconColor: 'text-amber-600' },
  qr:          { icon: QrCode,       bg: 'bg-teal-100',    iconColor: 'text-teal-600' },
  limit:       { icon: AlertCircle,  bg: 'bg-rose-100',    iconColor: 'text-rose-600' },
  plan:        { icon: Sparkles,     bg: 'bg-amber-100',   iconColor: 'text-amber-600' },
};

export function NotificationsPanel({ className }: { className?: string }) {
  const currentUser = useAppStore(s => s.currentUser);
  const cards = useAppStore(s => s.cards);
  const messages = useAppStore(s => s.messages);
  const appointments = useAppStore(s => s.appointments);
  const navigate = useAppStore(s => s.navigate);
  const markMessageRead = useAppStore(s => s.markMessageRead);

  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'all' | 'unread'>('all');
  const [localRead, setLocalRead] = useState<Set<string>>(new Set());

  const notifications = useMemo<AppNotification[]>(() => {
    if (!currentUser) return [];
    const list: AppNotification[] = [];
    const userCards = cards.filter(c => c.userId === currentUser.id);
    const now = Date.now();

    // Welcome / plan notification
    list.push({
      id: 'welcome-plan',
      type: 'plan',
      title: '¡Bienvenido a FTP Digital Plus!',
      description:
        'Estamos felices de tenerte aquí. Empieza creando tu primera tarjeta de presentación digital.',
      timestamp: currentUser.createdAt,
      read: false,
      onAction: () => navigate('dashboard'),
    });

    // Messages
    messages.forEach(m => {
      list.push({
        id: `msg-${m.id}`,
        type: 'message',
        title: `${m.name} te envió un mensaje`,
        description:
          m.message.length > 90 ? `${m.message.slice(0, 90).trim()}…` : m.message,
        timestamp: m.date,
        read: m.read,
        onAction: () => navigate('dashboard'),
      });
    });

    // Appointments (today or upcoming)
    appointments.forEach(a => {
      const apptTime = new Date(a.date).getTime();
      if (apptTime >= now - 24 * 60 * 60 * 1000) {
        const dateLabel = new Date(a.date).toLocaleDateString('es-MX', {
          day: 'numeric',
          month: 'short',
        });
        list.push({
          id: `appt-${a.id}`,
          type: 'appointment',
          title: `Nueva cita de ${a.clientName}`,
          description: `${dateLabel} · ${a.time} · ${a.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}`,
          timestamp: new Date(apptTime - 60 * 60 * 1000).toISOString(),
          read: false,
          onAction: () => navigate('dashboard'),
        });
      }
    });

    // QR scanned today (mock based on real scan totals)
    const totalScans = userCards.reduce((sum, c) => sum + c.qrScans, 0);
    if (totalScans > 0) {
      const todayScans = Math.max(1, Math.floor(totalScans * 0.1));
      list.push({
        id: 'qr-scanned-today',
        type: 'qr',
        title: 'Tu QR fue escaneado',
        description: `Hoy tu QR fue escaneado ${todayScans} ${todayScans === 1 ? 'vez' : 'veces'}. ¡Sigue compartiendo tu tarjeta!`,
        timestamp: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
        read: false,
        onAction: () => navigate('dashboard'),
      });
    }

    // Plan limit reached
    const planConfig = PLANS[currentUser.plan];
    if (userCards.length >= planConfig.maxCards) {
      list.push({
        id: 'plan-limit',
        type: 'limit',
        title: 'Has alcanzado el límite de tarjetas de tu plan',
        description: `Tu plan ${planConfig.name} permite ${planConfig.maxCards} ${planConfig.maxCards === 1 ? 'tarjeta' : 'tarjetas'}. Mejora tu plan para crear más.`,
        timestamp: new Date(now - 6 * 60 * 60 * 1000).toISOString(),
        read: false,
        onAction: () => navigate('pricing'),
      });
    }

    return list.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [currentUser, cards, messages, appointments, navigate]);

  // Merge local read state with store-derived read state
  const notificationsWithRead = useMemo(
    () =>
      notifications.map(n =>
        n.read || localRead.has(n.id) ? { ...n, read: true } : n
      ),
    [notifications, localRead]
  );

  const unreadCount = notificationsWithRead.filter(n => !n.read).length;

  const visible =
    tab === 'all'
      ? notificationsWithRead
      : notificationsWithRead.filter(n => !n.read);

  const handleMarkAllRead = useCallback(() => {
    const newRead = new Set(localRead);
    notificationsWithRead.forEach(n => {
      if (!n.read) {
        newRead.add(n.id);
        if (n.type === 'message') {
          const msgId = n.id.replace('msg-', '');
          markMessageRead(msgId);
        }
      }
    });
    setLocalRead(newRead);
  }, [localRead, notificationsWithRead, markMessageRead]);

  const handleClickNotification = useCallback(
    (n: AppNotification) => {
      if (!n.read) {
        setLocalRead(prev => new Set(prev).add(n.id));
        if (n.type === 'message') {
          const msgId = n.id.replace('msg-', '');
          markMessageRead(msgId);
        }
      }
      n.onAction();
      setOpen(false);
    },
    [markMessageRead]
  );

  if (!currentUser) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('relative', className)}
          aria-label={`Notificaciones${unreadCount > 0 ? ` (${unreadCount} sin leer)` : ''}`}
        >
          <Bell className="h-5 w-5" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                key="badge"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[calc(100vw-1.5rem)] border-emerald-100/80 p-0 shadow-xl shadow-emerald-900/5 sm:w-96"
      >
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2 border-b border-emerald-100/70 bg-gradient-to-r from-emerald-50/70 to-amber-50/40 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600/10">
                <Bell className="h-3.5 w-3.5 text-emerald-700" />
              </div>
              <h3 className="text-sm font-semibold text-slate-800">Notificaciones</h3>
              {unreadCount > 0 && (
                <Badge className="h-5 bg-rose-500 px-1.5 text-[10px] font-bold text-white hover:bg-rose-500">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
              className="h-7 gap-1 px-2 text-xs text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 disabled:opacity-40 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
            >
              <Check className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Marcar todas como leídas</span>
              <span className="sm:hidden">Marcar</span>
            </Button>
          </div>

          {/* Tabs */}
          <div className="px-3 pt-3">
            <Tabs
              value={tab}
              onValueChange={v => setTab(v as 'all' | 'unread')}
            >
              <TabsList className="grid w-full grid-cols-2 bg-emerald-50/60">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm"
                >
                  Todas
                </TabsTrigger>
                <TabsTrigger
                  value="unread"
                  className="data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm"
                >
                  Sin leer
                  {unreadCount > 0 && (
                    <span className="ml-1.5 rounded-full bg-rose-500 px-1.5 text-[10px] font-bold leading-none text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* List */}
          <ScrollArea className="max-h-[22rem]">
            <div className="p-2">
              <AnimatePresence mode="popLayout">
                {visible.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 ring-4 ring-emerald-50/50">
                      <Bell className="h-6 w-6 text-emerald-500" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700">
                      No tienes notificaciones
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {tab === 'unread'
                        ? 'No hay notificaciones sin leer.'
                        : 'Las novedades aparecerán aquí.'}
                    </p>
                  </motion.div>
                ) : (
                  visible.map(n => {
                    const cfg = TYPE_CONFIG[n.type];
                    const Icon = cfg.icon;
                    return (
                      <motion.button
                        key={n.id}
                        layout
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.18 }}
                        onClick={() => handleClickNotification(n)}
                        className={cn(
                          'group mb-1 flex w-full items-start gap-3 rounded-lg px-2.5 py-2.5 text-left transition-colors hover:bg-emerald-50/70',
                          !n.read && 'bg-emerald-50/40'
                        )}
                      >
                        <div
                          className={cn(
                            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-1 ring-black/5',
                            cfg.bg
                          )}
                        >
                          <Icon className={cn('h-4 w-4', cfg.iconColor)} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium leading-tight text-slate-800">
                              {n.title}
                            </p>
                            {!n.read && (
                              <span
                                aria-label="Sin leer"
                                className="mt-1 h-2 w-2 shrink-0 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900"
                              />
                            )}
                          </div>
                          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                            {n.description}
                          </p>
                          <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground/70">
                            {getRelativeTime(n.timestamp)}
                          </p>
                        </div>
                      </motion.button>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>

          {/* Footer */}
          <Separator className="bg-emerald-100/70" />
          <div className="p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full gap-1 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
              onClick={() => {
                setOpen(false);
                navigate('notifications');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              Ver todas
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </motion.div>
      </PopoverContent>
    </Popover>
  );
}
