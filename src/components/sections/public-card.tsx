'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeCanvas } from 'qrcode.react';
import { toast } from 'sonner';
import {
  Download, Share2, Copy, Calendar, Clock, AlertTriangle,
  MessageCircle, Lock, X, Check, Home, Facebook, Twitter,
  Send, ChevronRight, Sparkles, Mail, User as UserIcon, Phone,
  ExternalLink, Heart,
} from 'lucide-react';

import { useAppStore, useSelectedCard } from '@/lib/store';
import { PLANS } from '@/lib/plans';
import { BusinessCard, PlanType } from '@/lib/types';
import {
  buildWhatsappUrl, isQrExpired, getQrDaysRemaining, formatPhone,
} from '@/lib/card-utils';
import { generateCardImage, downloadDataUrl } from '@/lib/card-image';
import { CardPreview } from '@/components/card-preview';
import { FTPLogo } from '@/components/ftp-logo';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

/* ---------- helpers ---------- */

function getQrValue(card: BusinessCard, plan: PlanType): string {
  const planConfig = PLANS[plan];
  const expired = planConfig.qrExpires && card.qrExpiresAt ? isQrExpired(card) : false;
  if (expired) return 'https://ftpdigitalplus.com/qr-expirado';
  if (card.whatsappNumber) {
    return buildWhatsappUrl(card.whatsappNumber, card.whatsappMessage || 'Hola, vi tu tarjeta digital');
  }
  return 'https://ftpdigitalplus.com';
}

function useCardDownload(card: BusinessCard, userPlan: PlanType) {
  const qrRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    const qrCanvas = qrRef.current?.querySelector('canvas');
    if (!qrCanvas) {
      toast.error('No se pudo generar el código QR');
      return;
    }
    setDownloading(true);
    try {
      const qrDataUrl = (qrCanvas as HTMLCanvasElement).toDataURL('image/png');
      const imageDataUrl = await generateCardImage(card, userPlan, qrDataUrl);
      downloadDataUrl(imageDataUrl, `tarjeta-${card.linkName}.png`);
      toast.success('Tarjeta descargada correctamente');
    } catch {
      toast.error('Ocurrió un error al generar la imagen');
    } finally {
      setDownloading(false);
    }
  };

  return { qrRef, handleDownload, downloading };
}

/* ---------- main export ---------- */

export function PublicCardSection() {
  const card = useSelectedCard();
  const users = useAppStore(s => s.users);
  const recordCardView = useAppStore(s => s.recordCardView);
  const navigate = useAppStore(s => s.navigate);
  const addMessage = useAppStore(s => s.addMessage);
  const addAppointment = useAppStore(s => s.addAppointment);

  // Record a single view on mount (and when the card changes)
  useEffect(() => {
    if (card?.id) {
      recordCardView(card.id);
    }
  }, [card?.id, recordCardView]);

  if (!card) {
    return <CardNotFound onHome={() => navigate('landing')} />;
  }

  const userPlan = (users.find(u => u.id === card.userId)?.plan || 'gratis') as PlanType;
  const plan = PLANS[userPlan];
  const isPaidPlan = plan.hasWebCard && !plan.hasWatermark;

  return (
    <PublicCardLayout card={card}>
      <PasswordGate card={card}>
        {isPaidPlan ? (
          <PaidPlanView
            card={card}
            userPlan={userPlan}
            onAddMessage={(data) => addMessage(card.id, data)}
            onAddAppointment={addAppointment}
          />
        ) : (
          <FreePlanView card={card} userPlan={userPlan} />
        )}
      </PasswordGate>

      {/* Owner CTA */}
      <div className="mt-6 text-center">
        <button
          onClick={() => navigate('login')}
          className="text-xs text-muted-foreground underline-offset-4 transition hover:text-primary hover:underline"
        >
          ¿Eres el dueño de esta tarjeta? Inicia sesión
        </button>
      </div>
    </PublicCardLayout>
  );
}

/* ---------- layout shell ---------- */

function PublicCardLayout({ card, children }: { card: BusinessCard; children: React.ReactNode }) {
  const navigate = useAppStore(s => s.navigate);
  const showHeaderLogo = !card.hideBrand;

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-emerald-50 via-background to-amber-50/40">
      {/* Decorative background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-emerald-200/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-amber-200/20 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-emerald-100/50 bg-white/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          {showHeaderLogo ? (
            <button
              onClick={() => navigate('landing')}
              className="flex items-center gap-2 transition hover:opacity-80"
              aria-label="FTP Digital Plus"
            >
              <FTPLogo variant="icon" className="h-8 w-8" />
              <span className="text-sm font-bold tracking-tight">
                <span className="text-emerald-700">FTP Digital</span>{' '}
                <span className="bg-gradient-to-r from-amber-500 to-amber-400 bg-clip-text text-transparent">Plus</span>
              </span>
            </button>
          ) : (
            <span className="text-xs text-muted-foreground">Tarjeta digital</span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('landing')}
            className="text-muted-foreground hover:text-emerald-700"
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Inicio</span>
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 px-4 py-6 sm:py-10">
        <div className="mx-auto max-w-[500px]">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-auto border-t border-emerald-100/50 bg-white/70 backdrop-blur-md">
        <div className="mx-auto max-w-2xl px-4 py-4 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} FTP Digital Plus · Tarjetas de Presentación Digitales
          </p>
          <p className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
            Hecho con <Heart className="h-3 w-3 fill-rose-500 text-rose-500" /> en México
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ---------- not found ---------- */

function CardNotFound({ onHome }: { onHome: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-emerald-50 to-amber-50/40 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md text-center"
      >
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
          <AlertTriangle className="h-10 w-10 text-amber-500" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Tarjeta no encontrada</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          La tarjeta que buscas no existe o ha sido eliminada. Verifica el enlace e inténtalo de nuevo.
        </p>
        <Button onClick={onHome} className="mt-6 bg-emerald-600 text-white hover:bg-emerald-700">
          <Home className="h-4 w-4" />
          Ir al inicio
        </Button>
      </motion.div>
    </div>
  );
}

/* ---------- password gate ---------- */

function PasswordGate({ card, children }: { card: BusinessCard; children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(!card.passwordProtected);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  if (unlocked) return <>{children}</>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === card.cardPassword) {
      setUnlocked(true);
      toast.success('Acceso concedido');
    } else {
      setError(true);
      toast.error('Contraseña incorrecta');
    }
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <Card className="border-emerald-100 shadow-xl">
          <CardContent className="pt-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <Lock className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Tarjeta protegida</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Esta tarjeta está protegida con contraseña. Ingrésala para continuar.
            </p>
            <form onSubmit={handleSubmit} className="mt-5 space-y-3 text-left">
              <div className="space-y-1.5">
                <Label htmlFor="card-password" className="text-xs">Contraseña</Label>
                <Input
                  id="card-password"
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(false); }}
                  placeholder="••••••••"
                  autoFocus
                  className={cn(error && 'border-destructive focus-visible:ring-destructive/20')}
                />
                {error && <p className="text-xs text-destructive">Contraseña incorrecta. Inténtalo de nuevo.</p>}
              </div>
              <Button type="submit" className="w-full bg-emerald-600 text-white hover:bg-emerald-700">
                <Lock className="h-4 w-4" />
                Desbloquear tarjeta
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

/* ---------- floating banner ---------- */

function FloatingBanner({ card }: { card: BusinessCard }) {
  const [dismissed, setDismissed] = useState(false);

  if (!card.banner.enabled || !card.banner.title || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -16, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        exit={{ opacity: 0, y: -16, height: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-4 overflow-hidden"
      >
        <div className="relative overflow-hidden rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-amber-100/70 p-4 shadow-sm">
          <div className="flex items-start gap-3 pr-8">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-400 text-white shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-amber-900">{card.banner.title}</p>
              {card.banner.text && (
                <p className="mt-0.5 text-xs text-amber-800/80">{card.banner.text}</p>
              )}
              {card.banner.linkUrl && (
                <a
                  href={card.banner.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-amber-900 underline-offset-2 hover:underline"
                >
                  Ver más <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full text-amber-700 transition hover:bg-amber-200/60"
            aria-label="Cerrar anuncio"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ---------- hidden QR (for image generation) ---------- */

function HiddenQrCanvas({ qrRef, value }: { qrRef: React.RefObject<HTMLDivElement | null>; value: string }) {
  return (
    <div
      ref={qrRef}
      aria-hidden="true"
      style={{ position: 'absolute', left: '-9999px', top: 0, opacity: 0, pointerEvents: 'none' }}
    >
      <QRCodeCanvas value={value} size={256} level="H" />
    </div>
  );
}

/* ---------- free plan view ---------- */

function FreePlanView({ card, userPlan }: { card: BusinessCard; userPlan: PlanType }) {
  const plan = PLANS[userPlan];
  const { qrRef, handleDownload, downloading } = useCardDownload(card, userPlan);
  const qrValue = getQrValue(card, userPlan);
  const qrExpired = plan.qrExpires && card.qrExpiresAt ? isQrExpired(card) : false;
  const daysLeft = plan.qrExpires && card.qrExpiresAt ? getQrDaysRemaining(card) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <HiddenQrCanvas qrRef={qrRef} value={qrValue} />

      {/* Status badges */}
      <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
          <Sparkles className="h-3 w-3" /> Plan Gratis
        </Badge>
        {qrExpired ? (
          <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100">
            <AlertTriangle className="h-3 w-3" /> QR Expirado
          </Badge>
        ) : daysLeft > 0 ? (
          <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700">
            <Clock className="h-3 w-3" /> Expira en {daysLeft}d
          </Badge>
        ) : null}
      </div>

      {/* The card itself (FreeCardPreview) */}
      <CardPreview card={card} userPlan={userPlan} />

      {/* Prominent download button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mt-5"
      >
        <Button
          onClick={handleDownload}
          disabled={downloading}
          size="lg"
          className="w-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700"
        >
          {downloading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Generando imagen…
            </>
          ) : (
            <>
              <Download className="h-5 w-5" />
              Descargar Tarjeta
            </>
          )}
        </Button>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Descarga tu tarjeta con código QR para compartir donde quieras
        </p>
      </motion.div>

      {/* Upgrade hint */}
      <div className="mt-6 rounded-xl border border-emerald-100 bg-white/70 p-4 text-center shadow-sm">
        <p className="text-sm font-semibold text-foreground">¿Quieres una tarjeta web interactiva?</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Mejora al plan Básico y obtén tarjeta web compartible, QR permanente, servicios, galería y mucho más.
        </p>
      </div>
    </motion.div>
  );
}

/* ---------- paid plan view ---------- */

interface PaidPlanViewProps {
  card: BusinessCard;
  userPlan: PlanType;
  onAddMessage: (data: { name: string; email: string; phone: string; message: string }) => void;
  onAddAppointment: (appt: {
    teamMemberId: string;
    clientName: string;
    clientEmail: string;
    date: string;
    time: string;
    status: 'pending' | 'confirmed' | 'cancelled';
  }) => void;
}

function PaidPlanView({ card, userPlan, onAddMessage, onAddAppointment }: PaidPlanViewProps) {
  const { qrRef, handleDownload, downloading } = useCardDownload(card, userPlan);
  const qrValue = getQrValue(card, userPlan);
  const shareUrl = `https://ftpdigitalplus.com/t/${card.linkName}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Enlace copiado al portapapeles');
    } catch {
      toast.error('No se pudo copiar el enlace');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <HiddenQrCanvas qrRef={qrRef} value={qrValue} />

      {/* Floating banner */}
      <FloatingBanner card={card} />

      {/* The web card */}
      <CardPreview card={card} userPlan={userPlan} />

      {/* Action toolbar */}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Button
          onClick={handleDownload}
          disabled={downloading}
          className="col-span-2 bg-emerald-600 text-white shadow-md hover:bg-emerald-700 sm:col-span-1"
        >
          {downloading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {downloading ? 'Generando…' : 'Descargar imagen'}
        </Button>

        <a
          href={`https://wa.me/?text=${encodeURIComponent(`Mira esta tarjeta digital: ${shareUrl}`)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outline" className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800">
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </Button>
        </a>

        <Button
          onClick={handleCopyLink}
          variant="outline"
          className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
        >
          <Copy className="h-4 w-4" /> Copiar
        </Button>
      </div>

      {/* Secondary share row */}
      <div className="mt-2 flex items-center justify-center gap-2">
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Share2 className="h-3 w-3" /> Compartir:
        </span>
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Compartir en Facebook"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-100 text-muted-foreground transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
        >
          <Facebook className="h-4 w-4" />
        </a>
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('Mira esta tarjeta digital')}&url=${encodeURIComponent(shareUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Compartir en Twitter / X"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-100 text-muted-foreground transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
        >
          <Twitter className="h-4 w-4" />
        </a>
      </div>

      {/* Contact form + Appointment booking */}
      <div className="mt-6 grid gap-4">
        <ContactFormCard onAddMessage={onAddMessage} primaryColor={card.primaryColor} />
        {card.team.length > 0 && (
          <AppointmentBookingCard card={card} onAddAppointment={onAddAppointment} primaryColor={card.primaryColor} />
        )}
      </div>
    </motion.div>
  );
}

/* ---------- contact form ---------- */

function ContactFormCard({
  onAddMessage,
  primaryColor,
}: {
  onAddMessage: (data: { name: string; email: string; phone: string; message: string }) => void;
  primaryColor: string;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error('Completa nombre, correo y mensaje');
      return;
    }
    setSubmitting(true);
    // Simulate async submit for nicer UX
    setTimeout(() => {
      onAddMessage({ name, email, phone, message });
      setName(''); setEmail(''); setPhone(''); setMessage('');
      setSubmitting(false);
      toast.success('¡Mensaje enviado! El dueño de la tarjeta te contactará pronto.');
    }, 400);
  };

  return (
    <Card className="border-emerald-100 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
            style={{ background: primaryColor }}
          >
            <Mail className="h-4 w-4" />
          </span>
          Envía un mensaje
        </CardTitle>
        <CardDescription className="text-xs">
          Completa el formulario y el dueño de la tarjeta recibirá tu mensaje.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="c-name" className="text-xs">Nombre *</Label>
              <Input
                id="c-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-phone" className="text-xs">Teléfono</Label>
              <Input
                id="c-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="55 1234 5678"
                className="h-9"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c-email" className="text-xs">Correo electrónico *</Label>
            <Input
              id="c-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className="h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c-message" className="text-xs">Mensaje *</Label>
            <Textarea
              id="c-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe tu mensaje aquí…"
              rows={3}
              className="resize-none"
            />
          </div>
          <Button
            type="submit"
            disabled={submitting}
            className="w-full text-white shadow-md"
            style={{ background: primaryColor }}
          >
            {submitting ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {submitting ? 'Enviando…' : 'Enviar mensaje'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

/* ---------- appointment booking ---------- */

function AppointmentBookingCard({
  card,
  onAddAppointment,
  primaryColor,
}: {
  card: BusinessCard;
  onAddAppointment: (appt: {
    teamMemberId: string;
    clientName: string;
    clientEmail: string;
    date: string;
    time: string;
    status: 'pending' | 'confirmed' | 'cancelled';
  }) => void;
  primaryColor: string;
}) {
  const [open, setOpen] = useState(false);
  const [teamMemberId, setTeamMemberId] = useState(card.team[0]?.id || '');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const selectedMember = card.team.find(m => m.id === teamMemberId);
  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamMemberId || !date || !time || !clientName.trim() || !clientEmail.trim()) {
      toast.error('Completa todos los campos para agendar');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      onAddAppointment({
        teamMemberId,
        clientName,
        clientEmail,
        date: new Date(`${date}T${time}`).toISOString(),
        time,
        status: 'pending',
      });
      setSubmitting(false);
      setOpen(false);
      // reset
      setDate(''); setTime(''); setClientName(''); setClientEmail('');
      toast.success('¡Cita agendada! Recibirás confirmación por correo.');
    }, 400);
  };

  return (
    <Card className="border-emerald-100 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
            style={{ background: primaryColor }}
          >
            <Calendar className="h-4 w-4" />
          </span>
          Agenda una cita
        </CardTitle>
        <CardDescription className="text-xs">
          Selecciona un miembro del equipo y elige fecha y hora disponibles.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Team preview */}
        <div className="mb-3 flex flex-wrap gap-2">
          {card.team.map((m) => (
            <div
              key={m.id}
              className={cn(
                'flex items-center gap-2 rounded-full border px-3 py-1 transition',
                m.id === teamMemberId
                  ? 'border-emerald-300 bg-emerald-50'
                  : 'border-muted bg-background'
              )}
            >
              {m.photo ? (
                <img src={m.photo} alt={m.name} className="h-6 w-6 rounded-full object-cover" />
              ) : (
                <div
                  className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ background: primaryColor }}
                >
                  {m.name.charAt(0)}
                </div>
              )}
              <span className="text-xs font-medium">{m.name}</span>
            </div>
          ))}
        </div>

        <Button
          onClick={() => setOpen(true)}
          className="w-full text-white shadow-md"
          style={{ background: primaryColor }}
        >
          <Calendar className="h-4 w-4" />
          Agendar cita
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" style={{ color: primaryColor }} />
              Agendar cita
            </DialogTitle>
            <DialogDescription>
              Completa tus datos para agendar una cita. Recibirás confirmación por correo.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Miembro del equipo</Label>
              <Select value={teamMemberId} onValueChange={setTeamMemberId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona un miembro" />
                </SelectTrigger>
                <SelectContent>
                  {card.team.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name} · {m.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedMember && (
                <p className="text-xs text-muted-foreground">
                  Duración: {selectedMember.appointmentDuration} min
                  {selectedMember.isPaid && selectedMember.appointmentPrice > 0 && (
                    <span className="ml-2 font-semibold" style={{ color: primaryColor }}>
                      · ${selectedMember.appointmentPrice} MXN
                    </span>
                  )}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="appt-date" className="text-xs">Fecha</Label>
                <Input
                  id="appt-date"
                  type="date"
                  min={today}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="appt-time" className="text-xs">Hora</Label>
                <Input
                  id="appt-time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="h-9"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="appt-name" className="text-xs flex items-center gap-1">
                <UserIcon className="h-3 w-3" /> Tu nombre
              </Label>
              <Input
                id="appt-name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Nombre completo"
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="appt-email" className="text-xs flex items-center gap-1">
                <Mail className="h-3 w-3" /> Correo electrónico
              </Label>
              <Input
                id="appt-email"
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="h-9"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="text-white"
                style={{ background: primaryColor }}
              >
                {submitting ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Confirmar cita
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
