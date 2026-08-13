'use client';

import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  User as UserIcon, Shield, Bell, CreditCard, Settings, Trash2,
  Download, Globe, Clock, Smartphone, Monitor, LogOut, Check,
  AlertTriangle, Crown, Zap, Sparkles, Mail, Phone, Camera, X,
  Lock, KeyRound, History, MapPin, Chrome, Apple, MonitorSmartphone,
  Languages, Coins, Palette, Calendar, ChevronRight, ArrowLeft,
  Eye, EyeOff, FileText, CreditCard as CardIcon, PlusCircle,
  Moon, Sun, Laptop, ChevronDown, MoreVertical, Fingerprint,
  CircleDot, ShieldCheck, ChevronLeft, type LucideIcon,
} from 'lucide-react';
import { useAppStore, useCurrentUserCards } from '@/lib/store';
import { PLANS, PLAN_ORDER } from '@/lib/plans';
import { PlanType, User } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import { FTPLogo } from '@/components/ftp-logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { formatDate } from '@/lib/card-utils';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

type TabId = 'perfil' | 'seguridad' | 'notificaciones' | 'facturacion' | 'preferencias' | 'privacidad';

interface TabDef {
  id: TabId;
  name: string;
  description: string;
  icon: LucideIcon;
}

const TABS: TabDef[] = [
  { id: 'perfil',         name: 'Mi Perfil',        description: 'Tu información personal',         icon: UserIcon },
  { id: 'seguridad',      name: 'Seguridad',        description: 'Contraseña, 2FA y sesiones',      icon: Shield },
  { id: 'notificaciones', name: 'Notificaciones',   description: 'Email, push y SMS',               icon: Bell },
  { id: 'facturacion',    name: 'Facturación',      description: 'Plan, pagos e historial',         icon: CreditCard },
  { id: 'preferencias',   name: 'Preferencias',     description: 'Idioma, zona horaria y tema',     icon: Settings },
  { id: 'privacidad',     name: 'Datos y Privacidad', description: 'Exportar y eliminar datos',     icon: Trash2 },
];

const PLAN_COLORS: Record<PlanType, { bg: string; text: string; ring: string; label: string }> = {
  gratis: { bg: 'bg-slate-100', text: 'text-slate-700', ring: 'ring-slate-200', label: 'Gratis' },
  basico: { bg: 'bg-emerald-100', text: 'text-emerald-700', ring: 'ring-emerald-200', label: 'Básico' },
  pro:     { bg: 'bg-amber-100', text: 'text-amber-700', ring: 'ring-amber-200', label: 'Pro' },
};

const TIMEZONES = [
  'America/Mexico_City',
  'America/Monterrey',
  'America/Guadalajara',
  'America/Tijuana',
  'America/Cancun',
  'America/Bogota',
  'America/Lima',
  'America/Buenos_Aires',
  'America/Santiago',
  'Europe/Madrid',
];

const LANGUAGES = [
  { code: 'es-MX', name: 'Español (México)', flag: '🇲🇽' },
  { code: 'es-ES', name: 'Español (España)', flag: '🇪🇸' },
  { code: 'en-US', name: 'English (US)',      flag: '🇺🇸' },
  { code: 'pt-BR', name: 'Português (BR)',    flag: '🇧🇷' },
];

// ---------------------------------------------------------------------------
// Componente principal: ProfilePage
// ---------------------------------------------------------------------------

export function ProfilePage() {
  const currentUser = useAppStore(s => s.currentUser);
  const navigate = useAppStore(s => s.navigate);
  const updateUser = useAppStore(s => s.updateUser);

  const [activeTab, setActiveTab] = useState<TabId>('perfil');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (!currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <Card className="max-w-md p-6 text-center">
          <p className="text-muted-foreground">Debes iniciar sesión para ver tu perfil.</p>
          <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700" onClick={() => navigate('login')}>
            Iniciar Sesión
          </Button>
        </Card>
      </div>
    );
  }

  const plan = PLANS[currentUser.plan];
  const planColors = PLAN_COLORS[currentUser.plan];

  const handleSelectTab = (tab: TabId) => {
    setActiveTab(tab);
    setMobileSidebarOpen(false);
  };

  const initials = currentUser.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      {/* Top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-white/85 px-4 py-3 backdrop-blur md:px-8">
        <div className="flex items-center gap-2">
          {/* Mobile menu */}
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileSidebarOpen(true)}
            aria-label="Abrir menú de perfil"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <FTPLogo variant="icon" className="h-7 w-7" />
          <div>
            <h1 className="text-sm font-bold text-slate-800 md:text-base">Mi Perfil</h1>
            <p className="hidden text-xs text-muted-foreground sm:block">
              Configura tu cuenta y preferencias
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('dashboard')}
            className="hidden gap-1.5 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 sm:flex"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al panel
          </Button>
          <ThemeToggle className="text-slate-600 hover:bg-emerald-50 hover:text-emerald-700" />
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-0 px-0 lg:gap-6 lg:px-8 lg:py-8">
        {/* Desktop sidebar */}
        <aside className="sticky top-[64px] hidden h-[calc(100vh-64px)] w-72 shrink-0 lg:block">
          <ProfileSidebar
            user={currentUser}
            initials={initials}
            planName={plan.name}
            planColors={planColors}
            activeTab={activeTab}
            onSelectTab={handleSelectTab}
            onBack={() => navigate('dashboard')}
          />
        </aside>

        {/* Mobile drawer */}
        <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
          <SheetContent side="left" className="w-[85vw] max-w-[320px] p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Menú de Perfil</SheetTitle>
            </SheetHeader>
            <ProfileSidebar
              user={currentUser}
              initials={initials}
              planName={plan.name}
              planColors={planColors}
              activeTab={activeTab}
              onSelectTab={handleSelectTab}
              onBack={() => navigate('dashboard')}
            />
          </SheetContent>
        </Sheet>

        {/* Main content */}
        <main className="min-w-0 flex-1 px-4 py-6 lg:px-0 lg:py-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="mx-auto max-w-3xl"
            >
              {activeTab === 'perfil' && <PerfilTab user={currentUser} updateUser={updateUser} planColors={planColors} onUpgrade={() => navigate('pricing')} />}
              {activeTab === 'seguridad' && <SeguridadTab />}
              {activeTab === 'notificaciones' && <NotificacionesTab user={currentUser} updateUser={updateUser} />}
              {activeTab === 'facturacion' && <FacturacionTab user={currentUser} planColors={planColors} onUpgrade={() => navigate('pricing')} />}
              {activeTab === 'preferencias' && <PreferenciasTab />}
              {activeTab === 'privacidad' && <PrivacidadTab user={currentUser} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t bg-white/70 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 text-xs text-muted-foreground md:flex-row md:px-8">
          <p>© {new Date().getFullYear()} FTP Digital Plus — Tarjetas de Presentación Digitales</p>
          <p className="flex items-center gap-1">
            Hecho con <Sparkles className="h-3 w-3 text-amber-500" /> en México
          </p>
        </div>
      </footer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------

function ProfileSidebar({
  user, initials, planName, planColors, activeTab, onSelectTab, onBack,
}: {
  user: User;
  initials: string;
  planName: string;
  planColors: { bg: string; text: string; ring: string; label: string };
  activeTab: TabId;
  onSelectTab: (t: TabId) => void;
  onBack: () => void;
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
      {/* User mini-profile */}
      <div className="relative border-b bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 p-5 text-white">
        <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-emerald-400/30 blur-2xl" />
        <div className="relative flex items-center gap-3">
          <Avatar className="h-14 w-14 ring-2 ring-white/40">
            {user.avatar ? null : (
              <AvatarFallback className="bg-gradient-to-br from-amber-300 to-amber-500 text-base font-bold text-amber-950">
                {initials}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-xs text-emerald-100/90">{user.email}</p>
            <div className={cn('mt-1.5 inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold backdrop-blur ring-1 ring-white/30')}>
              {user.plan === 'pro' && <Crown className="h-3 w-3 text-amber-300" />}
              {user.plan === 'basico' && <Zap className="h-3 w-3 text-amber-300" />}
              {user.plan === 'gratis' && <Sparkles className="h-3 w-3 text-amber-300" />}
              Plan {planName}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <nav className="flex-1 overflow-y-auto p-3">
        <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
          Configuración
        </p>
        <ul className="space-y-1">
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <li key={tab.id}>
                <button
                  onClick={() => onSelectTab(tab.id)}
                  className={cn(
                    'group flex w-full min-h-[44px] items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-all',
                    isActive
                      ? 'bg-emerald-600 font-medium text-white shadow-sm shadow-emerald-600/20'
                      : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700',
                  )}
                >
                  <tab.icon className={cn('h-[18px] w-[18px] shrink-0', isActive ? 'text-white' : 'text-slate-500 group-hover:text-emerald-600')} />
                  <span className="flex-1">{tab.name}</span>
                  {isActive && <ChevronRight className="h-4 w-4" />}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Back to dashboard */}
      <div className="border-t p-3">
        <Button
          variant="ghost"
          onClick={onBack}
          className="w-full justify-start gap-3 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
        >
          <ArrowLeft className="h-[18px] w-[18px]" />
          Volver al panel
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers compartidos
// ---------------------------------------------------------------------------

function TabHeader({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) {
  return (
    <div className="mb-6 flex items-start gap-3">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-md">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ===========================================================================
// TAB 1: Mi Perfil
// ===========================================================================

function PerfilTab({
  user, updateUser, planColors, onUpgrade,
}: {
  user: User;
  updateUser: (u: Partial<User>) => void;
  planColors: { bg: string; text: string; ring: string; label: string };
  onUpgrade: () => void;
}) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('El nombre no puede estar vacío');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      toast.error('Ingresa un correo electrónico válido');
      return;
    }
    updateUser({ name: name.trim(), email: email.trim(), avatar });
    toast.success('Perfil actualizado correctamente');
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten imágenes');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe superar los 5 MB');
      return;
    }
    try {
      const base64 = await fileToBase64(file);
      setAvatar(base64);
      toast.success('Foto cargada. Guarda los cambios para confirmar.');
    } catch {
      toast.error('No se pudo cargar la foto');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const plan = PLANS[user.plan];
  const isPro = user.plan === 'pro';

  return (
    <div className="space-y-6">
      <TabHeader icon={UserIcon} title="Mi Perfil" description="Actualiza tu información personal y foto de perfil" />

      {/* Photo + identity summary */}
      <Card className="overflow-hidden border-slate-200/70 shadow-sm">
        <div className="relative h-24 bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800">
          <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-full bg-amber-400/20 blur-3xl" />
        </div>
        <CardContent className="relative px-6 pb-6">
          <div className="-mt-12 flex flex-col items-start gap-4 sm:flex-row sm:items-end">
            <div className="relative">
              <Avatar className="h-24 w-24 ring-4 ring-white shadow-lg">
                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-2xl font-bold text-white">
                  {name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md ring-2 ring-white transition-transform hover:scale-110 active:scale-95"
                aria-label="Subir foto de perfil"
              >
                <Camera className="h-4 w-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
            <div className="flex-1 pb-1">
              <h3 className="text-lg font-bold text-slate-900">{name}</h3>
              <p className="text-sm text-muted-foreground">{email}</p>
              <div className={cn('mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1', planColors.bg, planColors.text, planColors.ring)}>
                {user.plan === 'pro' && <Crown className="h-3 w-3" />}
                {user.plan === 'basico' && <Zap className="h-3 w-3" />}
                {user.plan === 'gratis' && <Sparkles className="h-3 w-3" />}
                Plan {plan.name}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Editable fields */}
      <Card className="border-slate-200/70 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Información personal</CardTitle>
          <CardDescription>Estos datos aparecerán en tu cuenta y notificaciones</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="p-name" className="text-sm font-medium">Nombre completo</Label>
              <Input
                id="p-name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Tu nombre"
                className="h-11 border-slate-200 focus-visible:ring-emerald-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-email" className="text-sm font-medium">Correo electrónico</Label>
              <Input
                id="p-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="h-11 border-slate-200 focus-visible:ring-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="p-phone" className="text-sm font-medium">Teléfono</Label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="p-phone"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+52 55 1234 5678"
                className="h-11 pl-9 border-slate-200 focus-visible:ring-emerald-500"
              />
            </div>
            <p className="text-xs text-muted-foreground">Se usa para notificaciones SMS y verificación.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="p-bio" className="text-sm font-medium">Biografía</Label>
            <Textarea
              id="p-bio"
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Cuenta un poco sobre ti..."
              rows={4}
              maxLength={280}
              className="resize-none border-slate-200 focus-visible:ring-emerald-500"
            />
            <p className="text-right text-xs text-muted-foreground">{bio.length}/280</p>
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => { setName(user.name); setEmail(user.email); setPhone(''); setBio(''); setAvatar(user.avatar || ''); }} className="h-11">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="h-11 bg-emerald-600 hover:bg-emerald-700">
              <Check className="h-4 w-4" /> Guardar cambios
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account meta */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-slate-200/70 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Cuenta creada el</p>
                <p className="text-sm font-semibold text-slate-800">{formatDate(user.createdAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-slate-200/70 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                  {isPro ? <Crown className="h-5 w-5" /> : user.plan === 'basico' ? <Zap className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Plan actual</p>
                  <p className="text-sm font-semibold text-slate-800">Plan {plan.name}</p>
                </div>
              </div>
              {!isPro && (
                <Button size="sm" onClick={onUpgrade} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600">
                  <Crown className="h-3.5 w-3.5" /> Mejorar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ===========================================================================
// TAB 2: Seguridad
// ===========================================================================

function calcPasswordStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: 'Vacía', color: 'bg-slate-200' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 2) return { score: 25, label: 'Muy débil', color: 'bg-rose-500' };
  if (score <= 3) return { score: 50, label: 'Débil', color: 'bg-orange-500' };
  if (score <= 4) return { score: 75, label: 'Buena', color: 'bg-amber-500' };
  return { score: 100, label: 'Muy fuerte', color: 'bg-emerald-500' };
}

const MOCK_SESSIONS = [
  {
    id: 's1',
    device: 'Chrome en Windows',
    location: 'Ciudad de México, MX',
    ip: '189.203.x.x',
    lastActive: 'Ahora mismo',
    current: true,
    icon: Monitor,
  },
  {
    id: 's2',
    device: 'Safari en iPhone 14',
    location: 'Guadalajara, MX',
    ip: '187.190.x.x',
    lastActive: 'hace 3 horas',
    current: false,
    icon: Smartphone,
  },
];

const MOCK_LOGIN_HISTORY = [
  { id: 'h1', device: 'Chrome en Windows', ip: '189.203.x.x', location: 'Ciudad de México, MX', date: new Date().toISOString(), status: 'success' as const },
  { id: 'h2', device: 'Safari en iPhone 14', ip: '187.190.x.x', location: 'Guadalajara, MX', date: new Date(Date.now() - 86400000).toISOString(), status: 'success' as const },
  { id: 'h3', device: 'Firefox en Linux',   ip: '200.57.x.x',   location: 'Monterrey, MX',    date: new Date(Date.now() - 172800000).toISOString(), status: 'success' as const },
  { id: 'h4', device: 'Chrome en Android',  ip: '189.203.x.x',  location: 'Puebla, MX',       date: new Date(Date.now() - 259200000).toISOString(), status: 'failed' as const },
  { id: 'h5', device: 'Safari en macOS',    ip: '187.190.x.x',  location: 'Querétaro, MX',   date: new Date(Date.now() - 345600000).toISOString(), status: 'success' as const },
];

function SeguridadTab() {
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [twoFADialogOpen, setTwoFADialogOpen] = useState(false);
  const [twoFAStep, setTwoFAStep] = useState<'intro' | 'qr' | 'verify' | 'done'>('intro');
  const [twoFACode, setTwoFACode] = useState('');

  const strength = useMemo(() => calcPasswordStrength(newPw), [newPw]);
  const passwordsMatch = newPw && confirmPw && newPw === confirmPw;
  const passwordsMismatch = confirmPw.length > 0 && newPw !== confirmPw;

  const handleChangePassword = () => {
    if (!currentPw || !newPw || !confirmPw) {
      toast.error('Completa todos los campos de contraseña');
      return;
    }
    if (newPw !== confirmPw) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    if (strength.score < 50) {
      toast.error('La contraseña es demasiado débil');
      return;
    }
    toast.success('Contraseña actualizada correctamente');
    setCurrentPw(''); setNewPw(''); setConfirmPw('');
  };

  const handleToggle2FA = (checked: boolean) => {
    if (checked && !twoFAEnabled) {
      setTwoFADialogOpen(true);
      setTwoFAStep('intro');
    } else if (!checked && twoFAEnabled) {
      setTwoFAEnabled(false);
      toast.success('Autenticación de dos factores desactivada');
    }
  };

  const handle2FAVerify = () => {
    if (twoFACode.length !== 6) {
      toast.error('Ingresa los 6 dígitos del código');
      return;
    }
    setTwoFAEnabled(true);
    setTwoFADialogOpen(false);
    setTwoFAStep('intro');
    setTwoFACode('');
    toast.success('2FA activado correctamente');
  };

  return (
    <div className="space-y-6">
      <TabHeader icon={Shield} title="Seguridad" description="Mantén tu cuenta protegida" />

      {/* Change password */}
      <Card className="border-slate-200/70 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <KeyRound className="h-5 w-5 text-emerald-600" />
            Cambiar contraseña
          </CardTitle>
          <CardDescription>Usa una contraseña fuerte y única</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="cur-pw" className="text-sm font-medium">Contraseña actual</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="cur-pw"
                type={showPw ? 'text' : 'password'}
                value={currentPw}
                onChange={e => setCurrentPw(e.target.value)}
                placeholder="••••••••"
                className="h-11 pl-9 pr-10 border-slate-200 focus-visible:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-muted"
                aria-label={showPw ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-pw" className="text-sm font-medium">Nueva contraseña</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="new-pw"
                type={showPw ? 'text' : 'password'}
                value={newPw}
                onChange={e => setNewPw(e.target.value)}
                placeholder="••••••••"
                className="h-11 pl-9 border-slate-200 focus-visible:ring-emerald-500"
              />
            </div>
            {newPw && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Progress value={strength.score} className={cn('h-2 flex-1')} />
                  <span className={cn(
                    'text-xs font-semibold',
                    strength.score >= 75 ? 'text-emerald-600' :
                    strength.score >= 50 ? 'text-amber-600' : 'text-rose-600',
                  )}>
                    {strength.label}
                  </span>
                </div>
                <ul className="grid grid-cols-2 gap-1 text-[11px] text-muted-foreground sm:grid-cols-3">
                  <li className={cn('flex items-center gap-1', newPw.length >= 8 ? 'text-emerald-600' : '')}>
                    <Check className="h-3 w-3" /> 8+ caracteres
                  </li>
                  <li className={cn('flex items-center gap-1', /[A-Z]/.test(newPw) ? 'text-emerald-600' : '')}>
                    <Check className="h-3 w-3" /> Mayúscula
                  </li>
                  <li className={cn('flex items-center gap-1', /[a-z]/.test(newPw) ? 'text-emerald-600' : '')}>
                    <Check className="h-3 w-3" /> Minúscula
                  </li>
                  <li className={cn('flex items-center gap-1', /[0-9]/.test(newPw) ? 'text-emerald-600' : '')}>
                    <Check className="h-3 w-3" /> Número
                  </li>
                  <li className={cn('flex items-center gap-1', /[^a-zA-Z0-9]/.test(newPw) ? 'text-emerald-600' : '')}>
                    <Check className="h-3 w-3" /> Símbolo
                  </li>
                  <li className={cn('flex items-center gap-1', newPw.length >= 12 ? 'text-emerald-600' : '')}>
                    <Check className="h-3 w-3" /> 12+ caracteres
                  </li>
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="conf-pw" className="text-sm font-medium">Confirmar contraseña</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="conf-pw"
                type={showPw ? 'text' : 'password'}
                value={confirmPw}
                onChange={e => setConfirmPw(e.target.value)}
                placeholder="••••••••"
                className={cn(
                  'h-11 pl-9 border-slate-200 focus-visible:ring-emerald-500',
                  passwordsMismatch && 'border-rose-300 focus-visible:ring-rose-500',
                  passwordsMatch && 'border-emerald-300 focus-visible:ring-emerald-500',
                )}
              />
              {passwordsMatch && <Check className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-600" />}
              {passwordsMismatch && <X className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-rose-500" />}
            </div>
            {passwordsMismatch && (
              <p className="text-xs text-rose-600">Las contraseñas no coinciden</p>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={handleChangePassword} className="h-11 bg-emerald-600 hover:bg-emerald-700">
              <Shield className="h-4 w-4" /> Actualizar contraseña
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 2FA */}
      <Card className="border-slate-200/70 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Fingerprint className="h-5 w-5 text-emerald-600" />
            Autenticación de dos factores (2FA)
          </CardTitle>
          <CardDescription>Añade una capa extra de seguridad</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200/70 bg-slate-50/50 p-4">
            <div className="flex items-start gap-3">
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', twoFAEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500')}>
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {twoFAEnabled ? '2FA activado' : '2FA desactivado'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {twoFAEnabled
                    ? 'Tu cuenta está protegida con código de verificación'
                    : 'Solicita un código cada vez que inicias sesión'}
                </p>
              </div>
            </div>
            <Switch checked={twoFAEnabled} onCheckedChange={handleToggle2FA} />
          </div>
        </CardContent>
      </Card>

      {/* Active sessions */}
      <Card className="border-slate-200/70 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MonitorSmartphone className="h-5 w-5 text-emerald-600" />
              Sesiones activas
            </CardTitle>
            <CardDescription>Dispositivos conectados a tu cuenta</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="h-9 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700">
            <LogOut className="h-3.5 w-3.5" /> Cerrar todas
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {MOCK_SESSIONS.map(session => (
            <div key={session.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/70 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                  <session.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                    {session.device}
                    {session.current && (
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">Este dispositivo</Badge>
                    )}
                  </p>
                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {session.location}
                    <span className="text-slate-300">·</span>
                    <Globe className="h-3 w-3" /> {session.ip}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock className="h-3 w-3" /> {session.lastActive}
                  </p>
                </div>
              </div>
              {!session.current && (
                <Button variant="ghost" size="sm" className="h-9 text-rose-600 hover:bg-rose-50 hover:text-rose-700">
                  Cerrar
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Login history */}
      <Card className="border-slate-200/70 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="h-5 w-5 text-emerald-600" />
            Historial de inicios de sesión
          </CardTitle>
          <CardDescription>Últimos 5 accesos a tu cuenta</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {MOCK_LOGIN_HISTORY.map((entry, i) => (
              <li key={entry.id} className="relative flex items-start gap-3 pb-3 last:pb-0">
                {i !== MOCK_LOGIN_HISTORY.length - 1 && (
                  <span className="absolute left-[14px] top-8 h-[calc(100%-12px)] w-px bg-slate-200" aria-hidden />
                )}
                <div className={cn(
                  'relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full ring-2 ring-white',
                  entry.status === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700',
                )}>
                  {entry.status === 'success' ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800">{entry.device}</p>
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {entry.location}</span>
                    <span className="text-slate-300">·</span>
                    <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> {entry.ip}</span>
                    <span className="text-slate-300">·</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDate(entry.date)}</span>
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* 2FA Setup Dialog */}
      <Dialog open={twoFADialogOpen} onOpenChange={setTwoFADialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Fingerprint className="h-5 w-5 text-emerald-600" />
              Configurar autenticación de dos factores
            </DialogTitle>
            <DialogDescription>
              {twoFAStep === 'intro' && 'Protege tu cuenta con una capa adicional de seguridad'}
              {twoFAStep === 'qr' && 'Escanea este código QR con tu app autenticadora'}
              {twoFAStep === 'verify' && 'Ingresa el código de 6 dígitos de tu app'}
              {twoFAStep === 'done' && '¡Listo! Tu cuenta está protegida'}
            </DialogDescription>
          </DialogHeader>

          {twoFAStep === 'intro' && (
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>La autenticación de dos factores (2FA) requiere un código de verificación además de tu contraseña al iniciar sesión.</p>
              <ol className="ml-4 list-decimal space-y-1">
                <li>Descarga una app como Google Authenticator o Authy</li>
                <li>Escanea el código QR que te mostraremos</li>
                <li>Ingresa el código de 6 dígitos para verificar</li>
              </ol>
            </div>
          )}

          {twoFAStep === 'qr' && (
            <div className="flex flex-col items-center gap-3 py-2">
              <div className="grid h-44 w-44 grid-cols-12 grid-rows-12 gap-px rounded-lg bg-white p-2 ring-1 ring-slate-200">
                {Array.from({ length: 144 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'rounded-[1px]',
                      // Pseudo-random pattern deterministic
                      (i * 7 % 3 === 0 || (i + i / 13) % 5 === 0 || (i % 11 === 0)) ? 'bg-slate-900' : 'bg-white',
                    )}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">O ingresa este código manualmente:</p>
              <code className="rounded bg-slate-100 px-3 py-1.5 text-xs font-mono text-slate-700">
                JBSWY3DPEHPK3PXP
              </code>
            </div>
          )}

          {twoFAStep === 'verify' && (
            <div className="space-y-3">
              <Label htmlFor="2fa-code" className="text-sm font-medium">Código de verificación</Label>
              <Input
                id="2fa-code"
                value={twoFACode}
                onChange={e => setTwoFACode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="h-12 text-center text-lg font-mono tracking-[0.5em] border-slate-200 focus-visible:ring-emerald-500"
                maxLength={6}
              />
              <p className="text-xs text-muted-foreground">El código cambia cada 30 segundos.</p>
            </div>
          )}

          {twoFAStep === 'done' && (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <Check className="h-7 w-7" />
              </div>
              <p className="text-sm font-medium text-slate-800">Autenticación activada</p>
            </div>
          )}

          <DialogFooter>
            {twoFAStep === 'intro' && (
              <>
                <Button variant="outline" onClick={() => setTwoFADialogOpen(false)}>Cancelar</Button>
                <Button onClick={() => setTwoFAStep('qr')} className="bg-emerald-600 hover:bg-emerald-700">Continuar</Button>
              </>
            )}
            {twoFAStep === 'qr' && (
              <>
                <Button variant="outline" onClick={() => setTwoFAStep('intro')}>Atrás</Button>
                <Button onClick={() => setTwoFAStep('verify')} className="bg-emerald-600 hover:bg-emerald-700">Ya escaneé el código</Button>
              </>
            )}
            {twoFAStep === 'verify' && (
              <>
                <Button variant="outline" onClick={() => setTwoFAStep('qr')}>Atrás</Button>
                <Button onClick={handle2FAVerify} className="bg-emerald-600 hover:bg-emerald-700">Verificar y activar</Button>
              </>
            )}
            {twoFAStep === 'done' && (
              <Button onClick={() => setTwoFADialogOpen(false)} className="bg-emerald-600 hover:bg-emerald-700">Finalizar</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ===========================================================================
// TAB 3: Notificaciones
// ===========================================================================

interface NotifToggle {
  id: string;
  label: string;
  description: string;
}

const EMAIL_NOTIFS: NotifToggle[] = [
  { id: 'new_messages', label: 'Nuevos mensajes', description: 'Cuando recibes un mensaje en tus tarjetas' },
  { id: 'appointments', label: 'Citas', description: 'Cuando alguien agenda o modifica una cita' },
  { id: 'orders',       label: 'Pedidos', description: 'Cuando recibes un pedido de producto' },
  { id: 'weekly_summary', label: 'Resumen semanal', description: 'Estadísticas y resumen cada lunes' },
  { id: 'promotions',   label: 'Promociones', description: 'Ofertas y novedades de FTP Digital Plus' },
];

const PUSH_NOTIFS: NotifToggle[] = [
  { id: 'push_messages', label: 'Mensajes push', description: 'Notificaciones en el navegador' },
  { id: 'push_appointments', label: 'Citas push', description: 'Alertas de nuevas citas' },
  { id: 'push_qr_scans', label: 'Escaneos QR', description: 'Cuando alguien escanea tu QR' },
];

const SMS_NOTIFS: NotifToggle[] = [
  { id: 'sms_messages', label: 'Mensajes SMS', description: 'SMS al recibir un mensaje' },
  { id: 'sms_appointments', label: 'Citas SMS', description: 'Recordatorios de citas por SMS' },
];

function NotifRow({ item, checked, onChange }: { item: NotifToggle; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex min-h-[44px] items-center justify-between gap-3 rounded-lg border border-slate-200/70 bg-white p-3 transition-colors hover:bg-slate-50/50">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-800">{item.label}</p>
        <p className="text-xs text-muted-foreground">{item.description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function NotificacionesTab({ user, updateUser }: { user: User; updateUser: (u: Partial<User>) => void }) {
  const [emailSettings, setEmailSettings] = useState<Record<string, boolean>>({
    new_messages: true, appointments: true, orders: true, weekly_summary: false, promotions: false,
  });
  const [pushSettings, setPushSettings] = useState<Record<string, boolean>>({
    push_messages: true, push_appointments: true, push_qr_scans: false,
  });
  const [smsSettings, setSmsSettings] = useState<Record<string, boolean>>({
    sms_messages: false, sms_appointments: false,
  });
  const [dndEnabled, setDndEnabled] = useState(false);
  const [dndStart, setDndStart] = useState('22:00');
  const [dndEnd, setDndEnd] = useState('07:00');

  const handleEmailChange = (id: string, v: boolean) => {
    setEmailSettings(s => ({ ...s, [id]: v }));
    toast.success(`${v ? 'Activada' : 'Desactivada'}: ${EMAIL_NOTIFS.find(n => n.id === id)?.label}`);
  };
  const handlePushChange = (id: string, v: boolean) => {
    setPushSettings(s => ({ ...s, [id]: v }));
    toast.success(`${v ? 'Activada' : 'Desactivada'}: ${PUSH_NOTIFS.find(n => n.id === id)?.label}`);
  };
  const handleSmsChange = (id: string, v: boolean) => {
    setSmsSettings(s => ({ ...s, [id]: v }));
    if (v) toast.info('Se requiere verificación de teléfono para activar SMS');
    else toast.success(`Desactivada: ${SMS_NOTIFS.find(n => n.id === id)?.label}`);
  };

  const handleSaveDnd = () => {
    toast.success('Horario de "No molestar" guardado');
  };

  return (
    <div className="space-y-6">
      <TabHeader icon={Bell} title="Notificaciones" description="Controla cómo y cuándo recibes alertas" />

      {/* Email */}
      <Card className="border-slate-200/70 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mail className="h-5 w-5 text-emerald-600" />
            Notificaciones por correo
          </CardTitle>
          <CardDescription>Recibe alertas en {user.email}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {EMAIL_NOTIFS.map(item => (
            <NotifRow
              key={item.id}
              item={item}
              checked={emailSettings[item.id]}
              onChange={v => handleEmailChange(item.id, v)}
            />
          ))}
        </CardContent>
      </Card>

      {/* Push */}
      <Card className="border-slate-200/70 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-5 w-5 text-emerald-600" />
            Notificaciones push
          </CardTitle>
          <CardDescription>Alertas instantáneas en tus dispositivos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {PUSH_NOTIFS.map(item => (
            <NotifRow
              key={item.id}
              item={item}
              checked={pushSettings[item.id]}
              onChange={v => handlePushChange(item.id, v)}
            />
          ))}
        </CardContent>
      </Card>

      {/* SMS */}
      <Card className="border-slate-200/70 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Smartphone className="h-5 w-5 text-emerald-600" />
            Notificaciones SMS
          </CardTitle>
          <CardDescription>Mensajes de texto a tu teléfono</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Verificación de teléfono requerida</p>
              <p className="text-xs text-amber-700">Para activar las notificaciones SMS debes verificar tu número telefónico.</p>
              <Button size="sm" variant="outline" className="mt-2 h-9 border-amber-300 bg-white text-amber-700 hover:bg-amber-100">
                <Phone className="h-3.5 w-3.5" /> Verificar teléfono
              </Button>
            </div>
          </div>
          {SMS_NOTIFS.map(item => (
            <NotifRow
              key={item.id}
              item={item}
              checked={smsSettings[item.id]}
              onChange={v => handleSmsChange(item.id, v)}
            />
          ))}
        </CardContent>
      </Card>

      {/* Do Not Disturb */}
      <Card className="border-slate-200/70 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-emerald-600" />
            Horario de "No molestar"
          </CardTitle>
          <CardDescription>Silencia las notificaciones en un horario específico</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200/70 p-3">
            <div>
              <p className="text-sm font-medium text-slate-800">Activar "No molestar"</p>
              <p className="text-xs text-muted-foreground">No recibirás notificaciones en este horario</p>
            </div>
            <Switch checked={dndEnabled} onCheckedChange={setDndEnabled} />
          </div>
          {dndEnabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-3"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dnd-start" className="text-sm font-medium">Desde</Label>
                  <Input
                    id="dnd-start"
                    type="time"
                    value={dndStart}
                    onChange={e => setDndStart(e.target.value)}
                    className="h-11 border-slate-200 focus-visible:ring-emerald-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dnd-end" className="text-sm font-medium">Hasta</Label>
                  <Input
                    id="dnd-end"
                    type="time"
                    value={dndEnd}
                    onChange={e => setDndEnd(e.target.value)}
                    className="h-11 border-slate-200 focus-visible:ring-emerald-500"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveDnd} size="sm" className="h-10 bg-emerald-600 hover:bg-emerald-700">
                  <Check className="h-4 w-4" /> Guardar horario
                </Button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ===========================================================================
// TAB 4: Facturación
// ===========================================================================

const MOCK_INVOICES = [
  { id: 'inv-001', date: new Date().toISOString(),                   amount: 199, currency: 'MXN', status: 'paid' as const,    description: 'Plan Básico — Pago único' },
  { id: 'inv-002', date: new Date(Date.now() - 2592000000).toISOString(),   amount: 199, currency: 'MXN', status: 'paid' as const,    description: 'Plan Básico — Pago único' },
  { id: 'inv-003', date: new Date(Date.now() - 5184000000).toISOString(),   amount: 0,   currency: 'MXN', status: 'free' as const,    description: 'Plan Gratis — Sin cargo' },
];

function FacturacionTab({
  user, planColors, onUpgrade,
}: {
  user: User;
  planColors: { bg: string; text: string; ring: string; label: string };
  onUpgrade: () => void;
}) {
  const plan = PLANS[user.plan];
  const isPro = user.plan === 'pro';
  const renewalDate = new Date();
  renewalDate.setFullYear(renewalDate.getFullYear() + 1);

  const handleDownloadInvoice = (id: string) => {
    toast.success(`Descargando factura ${id}...`, { description: 'La descarga comenzará en breve' });
  };

  return (
    <div className="space-y-6">
      <TabHeader icon={CreditCard} title="Facturación" description="Gestiona tu plan, pagos e historial" />

      {/* Current plan card */}
      <Card className="overflow-hidden border-slate-200/70 shadow-sm">
        <div className={cn('flex items-center justify-between px-6 py-5', planColors.bg)}>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
              {user.plan === 'pro' && <Crown className="h-6 w-6 text-amber-600" />}
              {user.plan === 'basico' && <Zap className="h-6 w-6 text-emerald-600" />}
              {user.plan === 'gratis' && <Sparkles className="h-6 w-6 text-slate-600" />}
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Tu plan actual</p>
              <p className={cn('text-lg font-bold', planColors.text)}>Plan {plan.name}</p>
            </div>
          </div>
          <div className="text-right">
            <p className={cn('text-2xl font-bold', planColors.text)}>
              ${plan.price.toLocaleString('es-MX')}
              {plan.price > 0 && <span className="ml-1 text-xs font-medium text-muted-foreground">{plan.period}</span>}
            </p>
          </div>
        </div>
        <CardContent className="p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Detalles</p>
              <ul className="space-y-1.5 text-sm text-slate-700">
                <li className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-emerald-600" />
                  {plan.maxCards} tarjeta{plan.maxCards !== 1 ? 's' : ''} incluida{plan.maxCards !== 1 ? 's' : ''}
                </li>
                <li className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-emerald-600" />
                  {plan.storage} MB de almacenamiento
                </li>
                <li className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-emerald-600" />
                  {plan.price === 0 ? 'Sin vencimiento' : `Renueva el ${formatDate(renewalDate.toISOString())}`}
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Funciones principales</p>
              <ul className="space-y-1 text-sm text-slate-700">
                {plan.features.filter(f => f.included).slice(0, 4).map(f => (
                  <li key={f.name} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    <span className="line-clamp-1">{f.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {!isPro && (
            <div className="mt-5 flex flex-col items-start gap-3 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 p-4 ring-1 ring-amber-200 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-600" />
                <p className="text-sm text-amber-800">Mejora para desbloquear más funciones y capacidad</p>
              </div>
              <Button onClick={onUpgrade} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600">
                <Crown className="h-4 w-4" /> Mejorar plan
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment methods */}
      <Card className="border-slate-200/70 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CardIcon className="h-5 w-5 text-emerald-600" />
              Métodos de pago
            </CardTitle>
            <CardDescription>Tarjetas y cuentas guardadas</CardDescription>
          </div>
          <Button size="sm" variant="outline" className="h-9 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800">
            <PlusCircle className="h-3.5 w-3.5" /> Agregar
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/70 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-14 items-center justify-center rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 text-xs font-bold text-white">
                VISA
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">•••• •••• •••• 4242</p>
                <p className="text-xs text-muted-foreground">Vence 12/2027 · Predeterminada</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">Activa</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Billing history */}
      <Card className="border-slate-200/70 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-emerald-600" />
            Historial de facturación
          </CardTitle>
          <CardDescription>Facturas y recibos de pagos anteriores</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-lg border border-slate-200 sm:block">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">Fecha</th>
                  <th className="px-4 py-3 font-semibold">Descripción</th>
                  <th className="px-4 py-3 font-semibold">Monto</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 text-right font-semibold">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {MOCK_INVOICES.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 text-slate-700">{formatDate(inv.date)}</td>
                    <td className="px-4 py-3 text-slate-700">{inv.description}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {inv.amount === 0 ? 'Gratis' : `$${inv.amount.toLocaleString('es-MX')} ${inv.currency}`}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className={cn(
                        inv.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600',
                      )}>
                        {inv.status === 'paid' ? 'Pagada' : 'Sin cargo'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" variant="ghost" className="h-8 text-emerald-700 hover:bg-emerald-50" onClick={() => handleDownloadInvoice(inv.id)}>
                        <Download className="h-3.5 w-3.5" /> Factura
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Mobile cards */}
          <div className="space-y-3 sm:hidden">
            {MOCK_INVOICES.map(inv => (
              <div key={inv.id} className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-800">{inv.description}</p>
                  <Badge variant="secondary" className={cn(
                    inv.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600',
                  )}>
                    {inv.status === 'paid' ? 'Pagada' : 'Sin cargo'}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{formatDate(inv.date)}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-800">
                    {inv.amount === 0 ? 'Gratis' : `$${inv.amount.toLocaleString('es-MX')} ${inv.currency}`}
                  </span>
                  <Button size="sm" variant="ghost" className="h-8 px-2 text-emerald-700 hover:bg-emerald-50" onClick={() => handleDownloadInvoice(inv.id)}>
                    <Download className="h-3.5 w-3.5" /> Descargar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ===========================================================================
// TAB 5: Preferencias
// ===========================================================================

function PreferenciasTab() {
  const [language, setLanguage] = useState('es-MX');
  const [timezone, setTimezone] = useState('America/Mexico_City');
  const [currency, setCurrency] = useState('MXN');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [dateFormat, setDateFormat] = useState<'DD/MM/YYYY' | 'MM/DD/YYYY'>('DD/MM/YYYY');

  const handleSave = () => {
    toast.success('Preferencias guardadas');
  };

  const today = new Date();
  const datePreview = dateFormat === 'DD/MM/YYYY'
    ? `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`
    : `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`;

  return (
    <div className="space-y-6">
      <TabHeader icon={Settings} title="Preferencias" description="Personaliza tu experiencia" />

      {/* Language & Region */}
      <Card className="border-slate-200/70 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Languages className="h-5 w-5 text-emerald-600" />
            Idioma y región
          </CardTitle>
          <CardDescription>Configuración regional de la aplicación</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Idioma</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="h-11 border-slate-200 focus-visible:ring-emerald-500">
                <SelectValue placeholder="Selecciona un idioma" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map(lang => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <span className="mr-2">{lang.flag}</span> {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Zona horaria</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger className="h-11 border-slate-200 focus-visible:ring-emerald-500">
                <SelectValue placeholder="Selecciona una zona horaria" />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map(tz => (
                  <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Moneda</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="h-11 border-slate-200 focus-visible:ring-emerald-500">
                <SelectValue placeholder="Selecciona una moneda" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MXN">🇲🇽 Peso Mexicano (MXN)</SelectItem>
                <SelectItem value="USD">🇺🇸 Dólar Americano (USD)</SelectItem>
                <SelectItem value="EUR">🇪🇺 Euro (EUR)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Theme */}
      <Card className="border-slate-200/70 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Palette className="h-5 w-5 text-emerald-600" />
            Tema
          </CardTitle>
          <CardDescription>Personaliza la apariencia visual</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={theme} onValueChange={(v) => setTheme(v as 'light' | 'dark' | 'system')} className="grid gap-3 sm:grid-cols-3">
            <ThemeOption value="light" label="Claro" icon={Sun} selected={theme === 'light'} />
            <ThemeOption value="dark" label="Oscuro" icon={Moon} selected={theme === 'dark'} />
            <ThemeOption value="system" label="Sistema" icon={Laptop} selected={theme === 'system'} />
          </RadioGroup>
          <p className="mt-3 text-xs text-muted-foreground">
            Usa el botón de tema en la barra superior para aplicar el cambio ahora.
          </p>
        </CardContent>
      </Card>

      {/* Date format */}
      <Card className="border-slate-200/70 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-emerald-600" />
            Formato de fecha
          </CardTitle>
          <CardDescription>Cómo se muestran las fechas en la aplicación</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <RadioGroup value={dateFormat} onValueChange={(v) => setDateFormat(v as 'DD/MM/YYYY' | 'MM/DD/YYYY')}>
            <label className={cn(
              'flex min-h-[44px] cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors',
              dateFormat === 'DD/MM/YYYY' ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 hover:bg-slate-50',
            )}>
              <RadioGroupItem value="DD/MM/YYYY" />
              <div>
                <p className="text-sm font-medium text-slate-800">DD/MM/YYYY</p>
                <p className="text-xs text-muted-foreground">Ejemplo: {datePreview}</p>
              </div>
            </label>
            <label className={cn(
              'flex min-h-[44px] cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors',
              dateFormat === 'MM/DD/YYYY' ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 hover:bg-slate-50',
            )}>
              <RadioGroupItem value="MM/DD/YYYY" />
              <div>
                <p className="text-sm font-medium text-slate-800">MM/DD/YYYY</p>
                <p className="text-xs text-muted-foreground">Ejemplo: {datePreview}</p>
              </div>
            </label>
          </RadioGroup>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="h-11 bg-emerald-600 hover:bg-emerald-700">
          <Check className="h-4 w-4" /> Guardar preferencias
        </Button>
      </div>
    </div>
  );
}

function ThemeOption({ value, label, icon: Icon, selected }: { value: string; label: string; icon: LucideIcon; selected: boolean }) {
  return (
    <label className={cn(
      'flex min-h-[80px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all',
      selected ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200' : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50',
    )}>
      <RadioGroupItem value={value} className="sr-only" />
      <div className={cn(
        'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
        selected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600',
      )}>
        <Icon className="h-5 w-5" />
      </div>
      <span className={cn('text-sm font-medium', selected ? 'text-emerald-700' : 'text-slate-700')}>{label}</span>
    </label>
  );
}

// ===========================================================================
// TAB 6: Datos y Privacidad
// ===========================================================================

function PrivacidadTab({ user }: { user: User }) {
  const navigate = useAppStore(s => s.navigate);
  const logout = useAppStore(s => s.logout);
  const cards = useCurrentUserCards();
  const messages = useAppStore(s => s.messages);
  const appointments = useAppStore(s => s.appointments);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  const handleExportData = () => {
    const userCards = cards;
    const exportPayload = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        createdAt: user.createdAt,
      },
      cards: userCards,
      messages: messages.filter(m => userCards.some(c => c.id === m.cardId)),
      appointments,
      exportedAt: new Date().toISOString(),
    };

    try {
      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ftp-digital-plus-datos-${user.email.split('@')[0]}-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Datos exportados correctamente', { description: 'Se descargó el archivo JSON' });
    } catch {
      toast.error('No se pudieron exportar los datos');
    }
  };

  const handleClearMessages = () => {
    toast.success('Historial de mensajes limpiado');
  };
  const handleClearHistory = () => {
    toast.success('Historial de actividad limpiado');
  };

  const handleDeleteAccount = () => {
    if (deleteConfirm !== 'ELIMINAR') {
      toast.error('Debes escribir "ELIMINAR" para confirmar');
      return;
    }
    logout();
    navigate('landing');
    toast.success('Cuenta eliminada (demo)');
  };

  return (
    <div className="space-y-6">
      <TabHeader icon={Trash2} title="Datos y Privacidad" description="Gestiona tus datos personales" />

      {/* Export data */}
      <Card className="border-slate-200/70 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Download className="h-5 w-5 text-emerald-600" />
            Exportar mis datos
          </CardTitle>
          <CardDescription>Descarga una copia completa de tus datos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-amber-50/40 p-4 ring-1 ring-emerald-200/40">
            <p className="text-sm text-slate-700">
              El archivo JSON incluirá: tu información de cuenta, {cards.length} tarjeta{cards.length !== 1 ? 's' : ''},
              {' '}{messages.filter(m => cards.some(c => c.id === m.cardId)).length} mensaje{messages.filter(m => cards.some(c => c.id === m.cardId)).length !== 1 ? 's' : ''} y
              {' '}{appointments.length} cita{appointments.length !== 1 ? 's' : ''}.
            </p>
          </div>
          <Button onClick={handleExportData} className="h-11 w-full bg-emerald-600 hover:bg-emerald-700 sm:w-auto">
            <Download className="h-4 w-4" /> Descargar todos mis datos (JSON)
          </Button>
        </CardContent>
      </Card>

      {/* Delete activity */}
      <Card className="border-slate-200/70 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="h-5 w-5 text-amber-600" />
            Eliminar actividad
          </CardTitle>
          <CardDescription>Borra historiales específicos sin perder tu cuenta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col items-start justify-between gap-3 rounded-lg border border-slate-200/70 p-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-medium text-slate-800">Mensajes de contacto</p>
              <p className="text-xs text-muted-foreground">Borra todos los mensajes recibidos de tus tarjetas</p>
            </div>
            <Button variant="outline" size="sm" className="h-9 border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800" onClick={handleClearMessages}>
              <Trash2 className="h-3.5 w-3.5" /> Limpiar
            </Button>
          </div>
          <div className="flex flex-col items-start justify-between gap-3 rounded-lg border border-slate-200/70 p-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-medium text-slate-800">Historial de actividad</p>
              <p className="text-xs text-muted-foreground">Elimina el registro de acciones recientes</p>
            </div>
            <Button variant="outline" size="sm" className="h-9 border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800" onClick={handleClearHistory}>
              <Trash2 className="h-3.5 w-3.5" /> Limpiar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete account */}
      <Card className="border-rose-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-rose-700">
            <AlertTriangle className="h-5 w-5" />
            Zona de peligro
          </CardTitle>
          <CardDescription>Acciones irreversibles que afectan tu cuenta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
            <p className="text-sm font-semibold text-rose-800">Eliminar cuenta permanentemente</p>
            <p className="mt-1 text-xs text-rose-700">
              Se borrarán todos tus datos: tarjetas, mensajes, citas y configuración. Esta acción
              <strong> no se puede deshacer</strong>.
            </p>
            <Button
              variant="destructive"
              onClick={() => setDeleteOpen(true)}
              className="mt-3 h-11 bg-rose-600 hover:bg-rose-700"
            >
              <Trash2 className="h-4 w-4" /> Eliminar cuenta
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-700">
              <AlertTriangle className="h-5 w-5" />
              Confirmar eliminación de cuenta
            </DialogTitle>
            <DialogDescription>
              Esta acción es permanente. Todos tus datos se perderán sin posibilidad de recuperación.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="rounded-lg bg-rose-50 p-3 text-sm text-rose-800">
              <p className="font-semibold">Para confirmar, escribe: <code className="rounded bg-rose-200 px-1.5 py-0.5 font-mono">ELIMINAR</code></p>
            </div>
            <Input
              value={deleteConfirm}
              onChange={e => setDeleteConfirm(e.target.value)}
              placeholder="Escribe ELIMINAR"
              className="h-11 border-rose-200 focus-visible:ring-rose-500"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDeleteOpen(false); setDeleteConfirm(''); }}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={deleteConfirm !== 'ELIMINAR'}
              onClick={handleDeleteAccount}
              className="bg-rose-600 hover:bg-rose-700"
            >
              <Trash2 className="h-4 w-4" /> Eliminar permanentemente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ProfilePage;
