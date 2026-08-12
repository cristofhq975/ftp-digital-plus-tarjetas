'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Send, Paperclip, Clock, Mail, MessageCircle, AlertCircle,
  CheckCircle, ChevronDown, ChevronUp, LifeBuoy, Headphones, Zap,
  ShieldCheck, Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Card, CardHeader, CardContent, CardTitle, CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Collapsible, CollapsibleTrigger, CollapsibleContent,
} from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FTPLogo } from '@/components/ftp-logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAppStore } from '@/lib/store';
import {
  SupportTicket, SupportTicketCategory, SupportTicketPriority, SupportTicketStatus,
} from '@/lib/types';
import { cn } from '@/lib/utils';

// ============================ CONSTANTES ============================
type CategoryKey = SupportTicketCategory;
type PriorityKey = SupportTicketPriority;
type StatusKey = SupportTicketStatus;

const CATEGORIES: { value: CategoryKey; label: string; description: string }[] = [
  { value: 'cuenta', label: 'Cuenta', description: 'Login, registro, perfil' },
  { value: 'facturacion', label: 'Facturación', description: 'Pagos, reembolsos, planes' },
  { value: 'tecnico', label: 'Técnico', description: 'Errores, bugs, rendimiento' },
  { value: 'tarjeta', label: 'Tarjeta', description: 'Edición, QR, plantillas' },
  { value: 'otro', label: 'Otro', description: 'Cualquier otro tema' },
];

const PRIORITIES: {
  value: PriorityKey;
  label: string;
  color: string;
  ring: string;
  dot: string;
  description: string;
}[] = [
  {
    value: 'baja', label: 'Baja', color: 'text-teal-700 dark:text-teal-400',
    ring: 'border-teal-300 dark:border-teal-800', dot: 'bg-teal-500',
    description: 'Consulta general, no urgente',
  },
  {
    value: 'media', label: 'Media', color: 'text-amber-700 dark:text-amber-400',
    ring: 'border-amber-300 dark:border-amber-800', dot: 'bg-amber-500',
    description: 'Necesita atención, sin bloqueo',
  },
  {
    value: 'alta', label: 'Alta', color: 'text-rose-700 dark:text-rose-400',
    ring: 'border-rose-300 dark:border-rose-800', dot: 'bg-rose-500',
    description: 'Urgente, bloquea mi trabajo',
  },
];

const STATUS_META: Record<StatusKey, { label: string; className: string }> = {
  abierto: { label: 'Abierto', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' },
  en_progreso: { label: 'En Progreso', className: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' },
  resuelto: { label: 'Resuelto', className: 'bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400' },
  cerrado: { label: 'Cerrado', className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
};

const CATEGORY_LABEL: Record<CategoryKey, string> = {
  cuenta: 'Cuenta',
  facturacion: 'Facturación',
  tecnico: 'Técnico',
  tarjeta: 'Tarjeta',
  otro: 'Otro',
};

const AUTO_RESPONSE_MESSAGE =
  'Gracias por contactar a soporte. Nuestro equipo revisará tu solicitud y responderá en menos de 24 horas.';

const MAX_SUBJECT = 100;
const MIN_MESSAGE = 20;
const MAX_MESSAGE = 1000;

// ============================ HELPERS ============================
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: 'easeOut' as const },
});

function formatRelative(dateISO: string): string {
  const date = new Date(dateISO);
  const now = Date.now();
  const diff = now - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Hace un momento';
  if (minutes < 60) return `Hace ${minutes} min`;
  if (hours < 24) return `Hace ${hours} h`;
  if (days < 7) return `Hace ${days} d`;
  return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatFull(dateISO: string): string {
  return new Date(dateISO).toLocaleString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ============================ SUB-COMPONENTES ============================
function Footer() {
  return (
    <footer className="mt-auto border-t bg-white/80 backdrop-blur dark:bg-slate-950/60">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-center sm:flex-row sm:px-8 sm:text-left">
        <div className="flex items-center gap-2">
          <FTPLogo variant="icon" className="h-6 w-6" />
          <span className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} FTP Digital Plus · Tarjetas de Presentación Digitales
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          Soporte Técnico · <span className="font-medium text-emerald-700 dark:text-emerald-400">SLA 24 h</span>
        </span>
      </div>
    </footer>
  );
}

function HeaderBar() {
  const navigate = useAppStore(s => s.navigate);
  const currentUser = useAppStore(s => s.currentUser);

  return (
    <header className="sticky top-0 z-30 border-b border-emerald-100/60 bg-white/80 backdrop-blur dark:border-emerald-900/40 dark:bg-slate-950/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(currentUser ? 'dashboard' : 'landing')}
          className="gap-2 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-300 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Volver al Panel</span>
          <span className="sm:hidden">Volver</span>
        </Button>

        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <Headphones className="h-4 w-4" />
          </div>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Soporte Técnico</span>
        </div>

        <div className="flex items-center gap-1">
          <ThemeToggle className="text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-300 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400" />
          <Button
            size="sm"
            variant="outline"
            className="hidden border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 sm:inline-flex dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
            onClick={() => navigate('help')}
          >
            <LifeBuoy className="mr-1.5 h-4 w-4" />
            Centro de Ayuda
          </Button>
        </div>
      </div>
    </header>
  );
}

function PageHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-800 px-4 py-10 sm:px-8 sm:py-14">
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-amber-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-emerald-400/30 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur">
            <Headphones className="h-3.5 w-3.5 text-amber-300" />
            Soporte Técnico
          </div>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            ¿Cómo podemos ayudarte?
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-emerald-50/90 sm:text-base">
            Crea un ticket y nuestro equipo te responderá en menos de 24 horas. También puedes consultar nuestro Centro de Ayuda.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function TicketForm({ onCreated }: { onCreated: (ticketId: string) => void }) {
  const currentUser = useAppStore(s => s.currentUser)!;
  const addTicket = useAppStore(s => s.addTicket);

  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<CategoryKey>('tecnico');
  const [priority, setPriority] = useState<PriorityKey>('media');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const subjectTooLong = subject.length > MAX_SUBJECT;
  const messageTooShort = message.trim().length < MIN_MESSAGE;
  const messageTooLong = message.length > MAX_MESSAGE;
  const canSubmit = !!subject.trim() && !subjectTooLong && !messageTooShort && !messageTooLong && !submitting;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      if (!subject.trim()) toast.error('El asunto es obligatorio');
      else if (subjectTooLong) toast.error(`El asunto no puede exceder ${MAX_SUBJECT} caracteres`);
      else if (messageTooShort) toast.error(`El mensaje debe tener al menos ${MIN_MESSAGE} caracteres`);
      else if (messageTooLong) toast.error(`El mensaje no puede exceder ${MAX_MESSAGE} caracteres`);
      return;
    }
    setSubmitting(true);
    // Simula un pequeño delay de red
    setTimeout(() => {
      const newId = addTicket({
        userId: currentUser.id,
        subject: subject.trim(),
        category,
        priority,
        message: message.trim(),
      });
      onCreated(newId);
      setSubject('');
      setCategory('tecnico');
      setPriority('media');
      setMessage('');
      setSubmitting(false);
      toast.success('Ticket creado correctamente', {
        description: 'Nuestro equipo te responderá en menos de 24 horas.',
      });
    }, 500);
  };

  const handleAttachment = () => {
    toast.info('Archivos disponibles en versión Pro', {
      description: 'Actualiza al plan Pro para adjuntar imágenes y documentos a tus tickets.',
    });
  };

  return (
    <Card className="border-slate-200 shadow-sm dark:border-slate-800">
      <CardHeader className="border-b bg-gradient-to-r from-emerald-50 to-amber-50/40 pb-4 dark:from-emerald-950/30 dark:to-amber-950/10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <Send className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg">Nuevo Ticket de Soporte</CardTitle>
            <CardDescription className="mt-0.5 text-xs">
              Completa el formulario y te responderemos a la brevedad.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Asunto */}
          <div className="space-y-1.5">
            <Label htmlFor="subject" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Asunto <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={MAX_SUBJECT + 50}
              placeholder="Describe brevemente tu problema o consulta"
              className={cn(
                subjectTooLong && 'border-rose-400 focus-visible:ring-rose-200',
              )}
              aria-invalid={subjectTooLong}
            />
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">Máximo {MAX_SUBJECT} caracteres.</span>
              <span className={cn(
                'tabular-nums',
                subject.length > MAX_SUBJECT ? 'font-semibold text-rose-600' : 'text-muted-foreground',
              )}>
                {subject.length}/{MAX_SUBJECT}
              </span>
            </div>
          </div>

          {/* Categoría */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Categoría <span className="text-rose-500">*</span>
            </Label>
            <Select value={category} onValueChange={(v) => setCategory(v as CategoryKey)}>
              <SelectTrigger className="w-full" aria-label="Selecciona una categoría">
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{c.label}</span>
                      <span className="text-[10px] text-muted-foreground">{c.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Prioridad */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Prioridad <span className="text-rose-500">*</span>
            </Label>
            <RadioGroup
              value={priority}
              onValueChange={(v) => setPriority(v as PriorityKey)}
              className="grid grid-cols-1 gap-2 sm:grid-cols-3"
            >
              {PRIORITIES.map((p) => {
                const isSelected = priority === p.value;
                return (
                  <Label
                    key={p.value}
                    htmlFor={`p-${p.value}`}
                    className={cn(
                      'flex cursor-pointer items-start gap-2.5 rounded-lg border bg-white p-3 transition-all dark:bg-slate-900',
                      isSelected
                        ? cn('ring-2 ring-offset-1 dark:ring-offset-slate-950', p.ring, 'border-transparent')
                        : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700',
                    )}
                  >
                    <RadioGroupItem id={`p-${p.value}`} value={p.value} className="mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className={cn('h-1.5 w-1.5 rounded-full', p.dot)} />
                        <span className={cn('text-sm font-semibold', p.color)}>{p.label}</span>
                      </div>
                      <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">{p.description}</p>
                    </div>
                  </Label>
                );
              })}
            </RadioGroup>
          </div>

          {/* Mensaje */}
          <div className="space-y-1.5">
            <Label htmlFor="message" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Mensaje <span className="text-rose-500">*</span>
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={MAX_MESSAGE + 100}
              rows={5}
              placeholder={`Describe tu solicitud con el mayor detalle posible (mínimo ${MIN_MESSAGE} caracteres)...`}
              className={cn(
                'resize-y',
                (messageTooShort && message.length > 0) && 'border-amber-400 focus-visible:ring-amber-200',
                messageTooLong && 'border-rose-400 focus-visible:ring-rose-200',
              )}
              aria-invalid={messageTooLong}
            />
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">
                {message.trim().length < MIN_MESSAGE
                  ? `Faltan ${MIN_MESSAGE - message.trim().length} caracteres`
                  : 'Longitud adecuada'}
              </span>
              <span className={cn(
                'tabular-nums',
                messageTooLong ? 'font-semibold text-rose-600' : 'text-muted-foreground',
              )}>
                {message.length}/{MAX_MESSAGE}
              </span>
            </div>
          </div>

          {/* Adjuntar (mock) */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAttachment}
              className="gap-1.5 border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
            >
              <Paperclip className="h-4 w-4" />
              Adjuntar archivo
            </Button>
            <span className="text-[11px] text-muted-foreground">
              PNG, JPG, PDF · Máx 5 MB (Pro)
            </span>
          </div>

          <Separator />

          {/* Submit */}
          <div className="flex items-center justify-between gap-3">
            <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              Tus datos están protegidos y son confidenciales.
            </p>
            <Button
              type="submit"
              disabled={!canSubmit}
              className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {submitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Enviar Ticket
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function TicketResponses({ ticket }: { ticket: SupportTicket }) {
  const sortedResponses = [...ticket.responses].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  if (sortedResponses.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-3 dark:bg-slate-900/60">
        <Clock className="h-4 w-4 text-amber-500" />
        <p className="text-xs text-muted-foreground">
          Esperando respuesta del equipo de soporte...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sortedResponses.map((resp, i) => {
        const isSupport = resp.author !== 'Usuario';
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className={cn(
              'rounded-lg border p-3',
              isSupport
                ? 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/30'
                : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60'
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white',
                  isSupport ? 'bg-emerald-600' : 'bg-slate-500'
                )}>
                  {isSupport ? <Headphones className="h-3.5 w-3.5" /> : resp.author.split(' ').map(p => p[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                    {resp.author}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{formatRelative(resp.date)}</p>
                </div>
              </div>
              {isSupport && (
                <Badge variant="outline" className="border-emerald-300 bg-white text-[9px] text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
                  Soporte
                </Badge>
              )}
            </div>
            <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              {resp.message}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}

function TicketItem({ ticket }: { ticket: SupportTicket }) {
  const [open, setOpen] = useState(false);
  const status = STATUS_META[ticket.status];
  const priority = PRIORITIES.find((p) => p.value === ticket.priority)!;
  const lastResponse = ticket.responses.length > 0
    ? ticket.responses[ticket.responses.length - 1]
    : null;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <motion.div
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25 }}
        className={cn(
          'rounded-xl border bg-white shadow-sm transition-all dark:bg-slate-900',
          open
            ? 'border-emerald-300 dark:border-emerald-800'
            : 'border-slate-200 hover:border-emerald-200 dark:border-slate-800 dark:hover:border-emerald-900'
        )}
      >
        <CollapsibleTrigger asChild>
          <button
            className="w-full p-4 text-left"
            aria-expanded={open}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge className={cn('text-[10px]', status.className)} variant="secondary">
                    {status.label}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] text-slate-600 dark:text-slate-300">
                    {CATEGORY_LABEL[ticket.category]}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn('gap-1 text-[10px]', priority.color, priority.ring)}
                  >
                    <span className={cn('h-1.5 w-1.5 rounded-full', priority.dot)} />
                    {priority.label}
                  </Badge>
                </div>
                <h3 className="mt-2 truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {ticket.subject}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {ticket.message}
                </p>
                <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span title={formatFull(ticket.createdAt)}>{formatRelative(ticket.createdAt)}</span>
                  {ticket.responses.length > 0 && (
                    <>
                      <span>·</span>
                      <MessageCircle className="h-3 w-3" />
                      <span>{ticket.responses.length} respuesta{ticket.responses.length === 1 ? '' : 's'}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="shrink-0">
                {open ? (
                  <ChevronUp className="h-4 w-4 text-slate-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                )}
              </div>
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t border-slate-100 p-4 dark:border-slate-800">
            <AnimatePresence>
              <div className="space-y-3">
                <div>
                  <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Tu solicitud original
                  </p>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
                    {ticket.message}
                  </div>
                </div>
                <div>
                  <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Respuestas ({ticket.responses.length})
                  </p>
                  <TicketResponses ticket={ticket} />
                </div>
              </div>
            </AnimatePresence>
          </div>
        </CollapsibleContent>
      </motion.div>
    </Collapsible>
  );
}

function MyTicketsList({ tickets, loading }: { tickets: SupportTicket[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900" />
        ))}
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/40">
          <CheckCircle className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h3 className="mt-4 text-sm font-semibold text-slate-800 dark:text-slate-100">
          No tienes tickets abiertos
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Crea un nuevo ticket usando el formulario de la izquierda y nuestro equipo te ayudará.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {tickets.map((t) => (
          <TicketItem key={t.id} ticket={t} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function SupportInfoSidebar() {
  const methods = [
    {
      icon: Mail,
      label: 'Correo electrónico',
      value: 'soporte@ftpdigitalplus.com',
      detail: 'Respuesta en menos de 24 h',
      iconBg: 'bg-emerald-100 dark:bg-emerald-950/40',
      iconColor: 'text-emerald-700 dark:text-emerald-400',
    },
    {
      icon: MessageCircle,
      label: 'WhatsApp Business',
      value: '+52 55 1234 5678',
      detail: 'Lun a Vie, 9:00 - 18:00',
      iconBg: 'bg-amber-100 dark:bg-amber-950/40',
      iconColor: 'text-amber-700 dark:text-amber-400',
    },
    {
      icon: Clock,
      label: 'Horario de soporte',
      value: '24/7 para plan Pro',
      detail: 'Lun-Vie 9-18h para Básico',
      iconBg: 'bg-rose-100 dark:bg-rose-950/40',
      iconColor: 'text-rose-700 dark:text-rose-400',
    },
  ];

  const sla = [
    { label: 'Tiempo de primera respuesta', value: '< 24 h', icon: Clock, color: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Resolución de tickets', value: '< 72 h', icon: CheckCircle, color: 'text-amber-600 dark:text-amber-400' },
    { label: 'Soporte prioritario (Pro)', value: '< 4 h', icon: Zap, color: 'text-rose-600 dark:text-rose-400' },
  ];

  return (
    <Card className="border-slate-200 shadow-sm dark:border-slate-800">
      <CardHeader className="border-b bg-gradient-to-r from-amber-50 to-emerald-50/40 pb-4 dark:from-amber-950/20 dark:to-emerald-950/10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500 text-white">
            <LifeBuoy className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base">Información de Soporte</CardTitle>
            <CardDescription className="mt-0.5 text-xs">
              Canales y tiempos de respuesta
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-5">
        <div className="space-y-2">
          {methods.map((m) => (
            <div
              key={m.label}
              className="flex items-start gap-3 rounded-lg border border-slate-100 bg-white p-3 dark:border-slate-800 dark:bg-slate-900/60"
            >
              <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', m.iconBg)}>
                <m.icon className={cn('h-4 w-4', m.iconColor)} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {m.label}
                </p>
                <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {m.value}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{m.detail}</p>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Acuerdos de Nivel de Servicio (SLA)
          </p>
          <div className="space-y-2">
            {sla.map((s) => (
              <div key={s.label} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <s.icon className={cn('h-4 w-4', s.color)} />
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                </div>
                <span className={cn('text-xs font-semibold', s.color)}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div className="rounded-lg bg-gradient-to-br from-emerald-50 to-amber-50/50 p-3 dark:from-emerald-950/30 dark:to-amber-950/10">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">
              ¿Sabías que...?
            </p>
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
            Los usuarios del plan <span className="font-semibold text-emerald-700 dark:text-emerald-400">Pro</span> tienen soporte prioritario 24/7 con respuesta garantizada en menos de 4 horas.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function TicketsHeader({ count }: { count: number }) {
  const openCount = count;
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div>
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          Mis Tickets
        </h2>
        <p className="text-xs text-muted-foreground">
          {openCount === 0
            ? 'Aún no has creado tickets'
            : openCount === 1
              ? '1 ticket en total'
              : `${openCount} tickets en total`}
        </p>
      </div>
      <Badge variant="outline" className="gap-1 border-emerald-300 text-emerald-700 dark:border-emerald-800 dark:text-emerald-400">
        <MessageCircle className="h-3 w-3" />
        Histórico
      </Badge>
    </div>
  );
}

// ============================ MAIN ============================
export function SupportPage() {
  const navigate = useAppStore(s => s.navigate);
  const currentUser = useAppStore(s => s.currentUser);
  const supportTickets = useAppStore(s => s.supportTickets);
  const addTicketResponse = useAppStore(s => s.addTicketResponse);

  const [newTicketId, setNewTicketId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const ticketsContainerRef = useRef<HTMLDivElement>(null);

  // Auto-response simulation: cuando se crea un ticket nuevo, simula respuesta de soporte en 2 segundos.
  useEffect(() => {
    if (!newTicketId) return;
    const timer = setTimeout(() => {
      addTicketResponse(newTicketId, {
        author: 'Soporte FTP Digital Plus',
        message: AUTO_RESPONSE_MESSAGE,
        date: new Date().toISOString(),
      }, 'en_progreso');
      setNewTicketId(null);
      toast.success('Nueva respuesta de soporte', {
        description: 'Tu ticket ha sido actualizado.',
      });
    }, 2000);
    return () => clearTimeout(timer);
  }, [newTicketId, addTicketResponse]);

  const myTickets = useMemo(() => {
    if (!currentUser) return [];
    return supportTickets
      .filter((t) => t.userId === currentUser.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [supportTickets, currentUser]);

  if (!currentUser) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-b from-white to-emerald-50/30 dark:from-slate-950 dark:to-emerald-950/10">
        <HeaderBar />
        <main className="flex flex-1 items-center justify-center p-4">
          <Card className="max-w-md p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/40">
              <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="mt-3 text-lg font-semibold text-slate-800 dark:text-slate-100">
              Inicia sesión para continuar
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Debes iniciar sesión para crear y gestionar tus tickets de soporte.
            </p>
            <Button
              className="mt-4 bg-emerald-600 hover:bg-emerald-700"
              onClick={() => navigate('login')}
            >
              Iniciar Sesión
            </Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const handleTicketCreated = (ticketId: string) => {
    setLoading(true);
    setNewTicketId(ticketId);
    setTimeout(() => {
      setLoading(false);
      // Scroll a la lista de tickets
      if (ticketsContainerRef.current && window.innerWidth < 1024) {
        ticketsContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 600);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-white via-emerald-50/30 to-white dark:from-slate-950 dark:via-emerald-950/10 dark:to-slate-950">
      <HeaderBar />

      <main className="flex-1">
        <PageHero />

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-10">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Columna izquierda: Form + Info */}
            <motion.div
              {...fadeUp(0)}
              className="space-y-6 lg:col-span-7"
            >
              <TicketForm onCreated={handleTicketCreated} />
              <SupportInfoSidebar />
            </motion.div>

            {/* Columna derecha: Tickets list */}
            <motion.div
              {...fadeUp(0.1)}
              ref={ticketsContainerRef}
              className="lg:col-span-5 lg:sticky lg:top-20 lg:self-start"
            >
              <Card className="border-slate-200 shadow-sm dark:border-slate-800">
                <CardHeader className="border-b bg-gradient-to-r from-emerald-50 to-amber-50/40 pb-4 dark:from-emerald-950/30 dark:to-amber-950/10">
                  <TicketsHeader count={myTickets.length} />
                </CardHeader>
                <CardContent className="p-4">
                  <ScrollArea className="max-h-[640px] pr-2">
                    <MyTicketsList tickets={myTickets} loading={loading} />
                  </ScrollArea>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default SupportPage;
