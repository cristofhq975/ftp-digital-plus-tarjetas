'use client';

/**
 * agenda-widget.tsx — Widget de agenda para el dashboard.
 *
 * Muestra un mini-calendario (mes actual) con indicadores de citas y una lista
 * de próximas citas filtrable por día seleccionado.
 *
 * - Paleta esmeralda + oro (FTP Digital Plus).
 * - 100% español, localización vía date-fns/locale/es.
 * - Animaciones con framer-motion.
 * - Responsive: calendario y lista se apilan en móvil.
 */

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock,
  MapPin, User, ArrowRight, CalendarPlus,
} from 'lucide-react';
import {
  addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, isToday, isTomorrow,
  isThisWeek, differenceInDays, parseISO, format,
} from 'date-fns';
import { es } from 'date-fns/locale';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/lib/store';
import { Appointment } from '@/lib/types';
import { cn } from '@/lib/utils';

export interface AgendaWidgetProps {
  className?: string;
  /** Número máximo de citas a mostrar en la lista (default 5). */
  maxItems?: number;
}

// Días de la semana en español, semana iniciando lunes.
const WEEKDAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'] as const;

// Etiquetas de estado según el status del Appointment.
const STATUS_META: Record<
  Appointment['status'],
  { label: string; dot: string; badge: string; ring: string }
> = {
  confirmed: {
    label: 'Confirmada',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
    ring: 'ring-emerald-200',
  },
  pending: {
    label: 'Pendiente',
    dot: 'bg-amber-500',
    badge: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200',
    ring: 'ring-amber-200',
  },
  cancelled: {
    label: 'Cancelada',
    dot: 'bg-rose-500',
    badge: 'bg-rose-100 text-rose-700 ring-1 ring-rose-200',
    ring: 'ring-rose-200',
  },
};

/** Texto relativo corto para una fecha futura. */
function getRelativeDayLabel(date: Date): string {
  if (isToday(date)) return 'Hoy';
  if (isTomorrow(date)) return 'Mañana';
  const diff = differenceInDays(date, new Date());
  if (diff > 0 && diff <= 7 && isThisWeek(date, { weekStartsOn: 1 })) {
    return `En ${diff} día${diff !== 1 ? 's' : ''}`;
  }
  if (diff > 0) return `En ${diff} días`;
  // Pasada
  const absDiff = Math.abs(diff);
  if (absDiff === 1) return 'Ayer';
  return `Hace ${absDiff} días`;
}

export function AgendaWidget({ className, maxItems = 5 }: AgendaWidgetProps) {
  const appointments = useAppStore(s => s.appointments);
  const navigate = useAppStore(s => s.navigate);
  const cards = useAppStore(s => s.cards);
  const currentUser = useAppStore(s => s.currentUser);

  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Mapa díaISO -> citas de ese día (solo del usuario actual).
  const appointmentsByDay = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    if (!currentUser) return map;
    const userCardIds = new Set(
      cards.filter(c => c.userId === currentUser.id).map(c => c.id),
    );
    const userTeamMemberIds = new Set(
      cards
        .filter(c => c.userId === currentUser.id)
        .flatMap(c => c.team.map(t => t.id)),
    );

    appointments.forEach(a => {
      // Pertenece al usuario si su teamMemberId está en sus tarjetas;
      // para datos demo (sin teamMember) mostramos todo.
      const belongsToUser =
        userTeamMemberIds.has(a.teamMemberId) ||
        userTeamMemberIds.size === 0 ||
        userCardIds.size > 0;
      if (!belongsToUser) return;

      const dayKey = format(parseISO(a.date), 'yyyy-MM-dd');
      const list = map.get(dayKey) ?? [];
      list.push(a);
      map.set(dayKey, list);
    });
    return map;
  }, [appointments, cards, currentUser]);

  // Días del grid del mes (incluye días del mes previo/siguiente para completar semanas).
  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  // Citas futuras ordenadas ascendentemente por fecha.
  const upcomingAppointments = useMemo(() => {
    if (!currentUser) return [];
    const userTeamMemberIds = new Set(
      cards
        .filter(c => c.userId === currentUser.id)
        .flatMap(c => c.team.map(t => t.id)),
    );
    return [...appointments]
      .filter(a => {
        if (userTeamMemberIds.size === 0) return true;
        return userTeamMemberIds.has(a.teamMemberId);
      })
      .filter(a => a.status !== 'cancelled')
      .sort(
        (a, b) =>
          new Date(`${a.date}T${a.time}`).getTime() -
          new Date(`${b.date}T${b.time}`).getTime(),
      );
  }, [appointments, cards, currentUser]);

  // Si hay día seleccionado, filtramos por ese día; si no, mostramos las próximas.
  const visibleAppointments = useMemo(() => {
    if (selectedDate) {
      const key = format(selectedDate, 'yyyy-MM-dd');
      const list = appointmentsByDay.get(key) ?? [];
      return list.slice(0, maxItems);
    }
    return upcomingAppointments.slice(0, maxItems);
  }, [selectedDate, appointmentsByDay, upcomingAppointments, maxItems]);

  const handlePrevMonth = useCallback(() => {
    setCurrentMonth(m => subMonths(m, 1));
  }, []);
  const handleNextMonth = useCallback(() => {
    setCurrentMonth(m => addMonths(m, 1));
  }, []);
  const handleSelectDay = useCallback((day: Date) => {
    setSelectedDate(prev => (prev && isSameDay(prev, day) ? null : day));
  }, []);

  const handleViewAll = useCallback(() => {
    // El dashboard escucha este evento para cambiar a la sub-sección "appointments".
    window.dispatchEvent(new CustomEvent('ftp:open-appointments'));
  }, []);

  const handleItemClick = useCallback(() => {
    window.dispatchEvent(new CustomEvent('ftp:open-appointments'));
  }, []);

  const handleCreateCta = useCallback(() => {
    // Si no hay tarjetas, llevamos al flujo de creación de tarjeta.
    if (cards.filter(c => currentUser && c.userId === currentUser.id).length === 0) {
      window.dispatchEvent(new CustomEvent('ftp:open-create-card'));
    } else {
      // Si ya hay tarjetas, llevamos a la sección de citas.
      window.dispatchEvent(new CustomEvent('ftp:open-appointments'));
    }
  }, [cards, currentUser]);

  // ---------- ESTADO VACÍO (sin tarjetas / sin citas en absoluto) ----------
  const hasAnyAppointments = upcomingAppointments.length > 0;
  if (!hasAnyAppointments && appointments.length === 0) {
    return (
      <Card
        className={cn(
          'border-slate-200/70 bg-gradient-to-br from-white via-emerald-50/30 to-amber-50/20 shadow-sm',
          className,
        )}
      >
        <CardContent className="flex flex-col items-center justify-center px-6 py-10 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-amber-100 text-emerald-600 ring-1 ring-emerald-200">
            <CalendarIcon className="h-8 w-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            No tienes citas agendadas
          </h3>
          <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
            Configura tu equipo y horarios para que tus clientes puedan agendar
            citas directamente desde tus tarjetas digitales.
          </p>
          <Button
            onClick={handleCreateCta}
            className="mt-5 bg-emerald-600 hover:bg-emerald-700"
            size="sm"
          >
            <CalendarPlus className="h-4 w-4" />
            Configurar equipo y citas
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'overflow-hidden border-slate-200/70 bg-gradient-to-br from-white via-emerald-50/30 to-amber-50/20 shadow-sm',
        className,
      )}
    >
      <CardContent className="grid gap-5 p-5 md:grid-cols-[260px_1fr] md:p-6">
        {/* ===================== MINI CALENDARIO ===================== */}
        <div className="flex flex-col">
          {/* Header del mes */}
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold capitalize text-slate-800">
              {format(currentMonth, 'MMMM yyyy', { locale: es })}
            </h3>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevMonth}
                aria-label="Mes anterior"
                className="h-7 w-7 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNextMonth}
                aria-label="Mes siguiente"
                className="h-7 w-7 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Encabezado días de la semana */}
          <div className="mb-1 grid grid-cols-7 gap-1">
            {WEEKDAY_LABELS.map((d, i) => (
              <div
                key={`wd-${i}`}
                className="flex h-7 items-center justify-center text-[10px] font-semibold uppercase text-muted-foreground"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Grid de días */}
          <div className="grid grid-cols-7 gap-1">
            {monthDays.map(day => {
              const dayKey = format(day, 'yyyy-MM-dd');
              const dayAppointments = appointmentsByDay.get(dayKey) ?? [];
              const inMonth = isSameMonth(day, currentMonth);
              const isTodayCell = isToday(day);
              const isSelected = selectedDate && isSameDay(selectedDate, day);

              // Indicadores: prioridad confirmed > pending.
              const hasConfirmed = dayAppointments.some(a => a.status === 'confirmed');
              const hasPending = dayAppointments.some(a => a.status === 'pending');

              return (
                <button
                  key={dayKey}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  aria-label={`${format(day, "d 'de' MMMM", { locale: es })}${dayAppointments.length > 0 ? `, ${dayAppointments.length} cita${dayAppointments.length !== 1 ? 's' : ''}` : ''}`}
                  aria-pressed={!!isSelected}
                  className={cn(
                    'relative flex h-8 items-center justify-center rounded-md text-xs transition-all',
                    inMonth ? 'text-slate-700' : 'text-muted-foreground/40',
                    isTodayCell && 'font-bold',
                    !isSelected && !isTodayCell && 'hover:bg-emerald-50',
                    isSelected && 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600 ring-offset-1',
                    !isSelected && isTodayCell && 'bg-emerald-100 text-emerald-800',
                  )}
                >
                  {format(day, 'd')}
                  {/* Indicador de citas */}
                  {dayAppointments.length > 0 && !isSelected && (
                    <span
                      className={cn(
                        'absolute -bottom-0.5 h-1 w-1 rounded-full',
                        hasConfirmed ? 'bg-emerald-500' : hasPending ? 'bg-amber-500' : 'bg-slate-400',
                      )}
                      aria-hidden
                    />
                  )}
                  {dayAppointments.length > 1 && !isSelected && (
                    <span
                      className={cn(
                        'absolute -bottom-0.5 ml-1.5 h-1 w-1 rounded-full',
                        hasPending && hasConfirmed ? 'bg-amber-500' : 'bg-emerald-400/60',
                      )}
                      aria-hidden
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Leyenda */}
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Confirmada
            </span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Pendiente
            </span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
              Hoy
            </span>
          </div>

          {selectedDate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedDate(null)}
              className="mt-3 h-7 w-fit text-xs text-muted-foreground hover:bg-emerald-50 hover:text-emerald-700"
            >
              Ver todas las próximas
            </Button>
          )}
        </div>

        {/* ===================== LISTA DE PRÓXIMAS CITAS ===================== */}
        <div className="flex min-w-0 flex-col">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <CalendarIcon className="h-4 w-4 text-emerald-600" />
              {selectedDate
                ? `Citas del ${format(selectedDate, "d 'de' MMMM", { locale: es })}`
                : 'Próximas Citas'}
              <Badge
                className="bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200"
                variant="secondary"
              >
                {visibleAppointments.length}
              </Badge>
            </h3>
            <button
              type="button"
              onClick={handleViewAll}
              className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 transition hover:text-emerald-800"
            >
              Ver todas
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {visibleAppointments.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white/50 py-8 text-center">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <CalendarIcon className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-slate-700">Sin citas programadas</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {selectedDate
                  ? 'No hay citas para este día.'
                  : 'Las próximas citas aparecerán aquí.'}
              </p>
            </div>
          ) : (
            <ScrollArea className="max-h-[360px] pr-3">
              <ul className="space-y-2">
                <AnimatePresence initial={false}>
                  {visibleAppointments.map((apt, i) => {
                    const aptDate = parseISO(apt.date);
                    const statusMeta = STATUS_META[apt.status];
                    return (
                      <motion.li
                        key={apt.id}
                        layout
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25, delay: Math.min(i * 0.04, 0.2) }}
                      >
                        <button
                          type="button"
                          onClick={handleItemClick}
                          className={cn(
                            'group flex w-full items-stretch gap-3 rounded-lg border border-slate-200/70 bg-white p-3 text-left transition-all hover:border-emerald-300 hover:shadow-sm',
                          )}
                        >
                          {/* Bloque de fecha */}
                          <div className="flex w-12 shrink-0 flex-col items-center justify-center rounded-md bg-gradient-to-br from-emerald-500 to-emerald-700 py-1.5 text-white shadow-sm">
                            <span className="text-base font-bold leading-none">
                              {format(aptDate, 'd')}
                            </span>
                            <span className="text-[10px] font-medium uppercase leading-tight">
                              {format(aptDate, 'MMM', { locale: es })}
                            </span>
                          </div>

                          {/* Detalles */}
                          <div className="flex min-w-0 flex-1 flex-col justify-center">
                            <div className="flex items-center gap-2">
                              <User className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                              <p className="truncate text-sm font-semibold text-slate-800">
                                {apt.clientName}
                              </p>
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {apt.time}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {getRelativeDayLabel(aptDate)}
                              </span>
                            </div>
                          </div>

                          {/* Badge de estado */}
                          <div className="flex shrink-0 flex-col items-end justify-center gap-1">
                            <Badge
                              variant="secondary"
                              className={statusMeta.badge}
                            >
                              <span className={cn('h-1.5 w-1.5 rounded-full', statusMeta.dot)} />
                              {statusMeta.label}
                            </Badge>
                          </div>
                        </button>
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </ul>
            </ScrollArea>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default AgendaWidget;
