'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit, Eye, Copy, Trash2, ExternalLink, MoreVertical, Menu, X,
  LogOut, ChevronRight, TrendingUp, QrCode, Mail, MessageCircle,
  Check, Clock, Calendar as CalendarIcon, Package, CreditCard,
  Database, Settings as SettingsIcon, LayoutDashboard, Users, Share2,
  Sparkles, Crown, Zap, ArrowUpRight, Bell, Star, Phone, FileText,
  ShoppingCart, Wallet, Gift, Download, ShieldCheck, CheckCircle2,
  AlertCircle, CircleUser, Mailbox, LucideIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card, CardHeader, CardContent, CardTitle, CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogTrigger, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from '@/components/ui/sheet';
import { FTPLogo } from '@/components/ftp-logo';
import { DynamicIcon } from '@/components/dynamic-icon';
import { ThemeToggle } from '@/components/theme-toggle';
import { NotificationsPanel } from '@/components/notifications-panel';
import { OnboardingWizard } from '@/components/onboarding-wizard';
import { useAppStore, useCurrentUserCards } from '@/lib/store';
import { PLANS, DASHBOARD_SECTIONS } from '@/lib/plans';
import { BusinessCard, PlanType, ContactMessage, Appointment } from '@/lib/types';
import { cn } from '@/lib/utils';
import { formatDate, formatDateTime } from '@/lib/card-utils';

type SectionId =
  | 'tablero' | 'messages' | 'appointments' | 'orders'
  | 'virtual-funds' | 'affiliations' | 'storage' | 'settings';

const PLAN_COLORS: Record<PlanType, { bg: string; text: string; ring: string; label: string }> = {
  gratis: { bg: 'bg-slate-100', text: 'text-slate-700', ring: 'ring-slate-200', label: 'Gratis' },
  basico: { bg: 'bg-emerald-100', text: 'text-emerald-700', ring: 'ring-emerald-200', label: 'Básico' },
  pro:     { bg: 'bg-amber-100', text: 'text-amber-700', ring: 'ring-amber-200', label: 'Pro' },
};

// ============================ MAIN ============================
export function Dashboard() {
  const currentUser = useAppStore(s => s.currentUser);
  const navigate = useAppStore(s => s.navigate);
  const logout = useAppStore(s => s.logout);
  const cards = useCurrentUserCards();
  const messages = useAppStore(s => s.messages);
  const appointments = useAppStore(s => s.appointments);

  const [activeSection, setActiveSection] = useState<SectionId>('tablero');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  if (!currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <Card className="max-w-md p-6 text-center">
          <p className="text-muted-foreground">Debes iniciar sesión para ver tu panel.</p>
          <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700" onClick={() => navigate('login')}>
            Iniciar Sesión
          </Button>
        </Card>
      </div>
    );
  }

  const plan = PLANS[currentUser.plan];
  const unreadCount = messages.filter(m => !m.read).length;

  const handleNavigate = (id: SectionId) => {
    // 'stats' and 'template-gallery' are full-page navigations
    if (id === 'stats' as any) {
      navigate('stats');
      setMobileOpen(false);
      return;
    }
    if (id === 'template-gallery' as any) {
      navigate('template-gallery');
      setMobileOpen(false);
      return;
    }
    setActiveSection(id);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('landing');
    toast.success('Sesión cerrada correctamente');
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      {/* Top mobile bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-white/80 px-4 py-3 backdrop-blur md:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Abrir menú">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SidebarContent
              user={currentUser}
              cardsCount={cards.length}
              maxCards={plan.maxCards}
              unreadCount={unreadCount}
              activeSection={activeSection}
              onNavigate={handleNavigate}
              onLogout={handleLogout}
            />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <FTPLogo variant="icon" className="h-7 w-7" />
          <span className="text-sm font-bold text-slate-800">FTP Digital Plus</span>
        </div>
        <div className="flex items-center gap-0.5">
          <ThemeToggle className="text-slate-600 hover:bg-emerald-50 hover:text-emerald-700" />
          <NotificationsPanel />
        </div>
      </header>

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r bg-white lg:w-72">
          <SidebarContent
            user={currentUser}
            cardsCount={cards.length}
            maxCards={plan.maxCards}
            unreadCount={unreadCount}
            activeSection={activeSection}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-x-hidden px-4 py-6 md:px-8 md:py-8">
          <div className="mx-auto max-w-7xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                {activeSection === 'tablero' && (
                  <TableroSection onCreateOpen={() => setCreateOpen(true)} />
                )}
                {activeSection === 'messages' && <MessagesSection />}
                {activeSection === 'appointments' && <AppointmentsSection />}
                {activeSection === 'orders' && <OrdersSection />}
                {activeSection === 'virtual-funds' && <VirtualFundsSection />}
                {activeSection === 'affiliations' && <AffiliationsSection />}
                {activeSection === 'storage' && <StorageSection />}
                {activeSection === 'settings' && <SettingsSection />}
              </motion.div>
            </AnimatePresence>
          </div>
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

      {/* Create Card Dialog */}
      <CreateCardDialog open={createOpen} onOpenChange={setCreateOpen} />

      {/* First-time onboarding wizard */}
      <OnboardingWizard />
    </div>
  );
}

// ============================ SIDEBAR ============================
function SidebarContent({
  user, cardsCount, maxCards, unreadCount, activeSection, onNavigate, onLogout,
}: {
  user: { name: string; email: string; plan: PlanType };
  cardsCount: number;
  maxCards: number;
  unreadCount: number;
  activeSection: SectionId;
  onNavigate: (id: SectionId) => void;
  onLogout: () => void;
}) {
  const planColors = PLAN_COLORS[user.plan];

  return (
    <div className="flex h-full flex-col">
      {/* Logo + theme toggle */}
      <div className="flex items-center justify-between border-b px-5 py-4">
        <FTPLogo className="h-9 w-auto" />
        <ThemeToggle className="text-slate-600 hover:bg-emerald-50 hover:text-emerald-700" />
      </div>

      {/* User info */}
      <div className="border-b px-5 py-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-11 w-11 ring-2 ring-emerald-200">
            <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-sm font-bold text-white">
              {user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <div className={cn('mt-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1', planColors.bg, planColors.text, planColors.ring)}>
          {user.plan === 'pro' && <Crown className="h-3 w-3" />}
          {user.plan === 'basico' && <Zap className="h-3 w-3" />}
          {user.plan === 'gratis' && <Sparkles className="h-3 w-3" />}
          Plan {planColors.label}
        </div>
        <div className="mt-2 text-[11px] text-muted-foreground">
          {cardsCount} de {maxCards} tarjetas usadas
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
          Menú Principal
        </p>
        <ul className="space-y-1">
          {DASHBOARD_SECTIONS.map((section) => {
            const isActive = activeSection === section.id;
            const isMessages = section.id === 'messages';
            return (
              <li key={section.id}>
                <button
                  onClick={() => onNavigate(section.id as SectionId)}
                  className={cn(
                    'group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                      : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                  )}
                >
                  <DynamicIcon name={section.icon} className={cn('h-[18px] w-[18px] shrink-0', isActive ? 'text-white' : 'text-slate-500 group-hover:text-emerald-600')} />
                  <span className="flex-1 text-left">{section.name}</span>
                  {isMessages && unreadCount > 0 && (
                    <span className={cn(
                      'rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                      isActive ? 'bg-white text-emerald-700' : 'bg-amber-500 text-white'
                    )}>
                      {unreadCount}
                    </span>
                  )}
                  {isActive && <ChevronRight className="h-4 w-4" />}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="border-t p-3">
        <Button
          variant="ghost"
          onClick={onLogout}
          className="w-full justify-start gap-3 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );
}

// ============================ TABLERO ============================
function TableroSection({ onCreateOpen }: { onCreateOpen: () => void }) {
  const currentUser = useAppStore(s => s.currentUser)!;
  const cards = useCurrentUserCards();
  const messages = useAppStore(s => s.messages);
  const selectCard = useAppStore(s => s.selectCard);
  const navigate = useAppStore(s => s.navigate);
  const deleteCard = useAppStore(s => s.deleteCard);
  const toggleCardActive = useAppStore(s => s.toggleCardActive);

  const plan = PLANS[currentUser.plan];
  const totalViews = cards.reduce((sum, c) => sum + c.views, 0);
  const totalQrScans = cards.reduce((sum, c) => sum + c.qrScans, 0);
  const unreadCount = messages.filter(m => !m.read).length;
  const canCreateMore = cards.length < plan.maxCards;

  const handleEdit = (card: BusinessCard) => {
    selectCard(card.id);
    navigate('editor');
  };
  const handleView = (card: BusinessCard) => {
    selectCard(card.id);
    navigate('public-card');
  };
  const handleCopy = (card: BusinessCard) => {
    const link = `ftpdigitalplus.com/t/${card.linkName}`;
    navigator.clipboard?.writeText(link);
    toast.success('Enlace copiado', { description: link });
  };
  const handleDelete = (card: BusinessCard) => {
    deleteCard(card.id);
    toast.success(`Tarjeta "${card.cardName}" eliminada`);
  };
  const handleUpgrade = () => navigate('pricing');

  const stats = [
    {
      label: 'Total de tarjetas',
      value: cards.length,
      sub: `de ${plan.maxCards} disponibles`,
      icon: CreditCard,
      color: 'emerald',
      gradient: 'from-emerald-500 to-emerald-700',
    },
    {
      label: 'Total de visitas',
      value: totalViews,
      sub: 'en todas las tarjetas',
      icon: Eye,
      color: 'amber',
      gradient: 'from-amber-500 to-orange-600',
    },
    {
      label: 'Escaneos QR',
      value: totalQrScans,
      sub: 'total acumulado',
      icon: QrCode,
      color: 'emerald',
      gradient: 'from-teal-500 to-emerald-600',
    },
    {
      label: 'Mensajes sin leer',
      value: unreadCount,
      sub: unreadCount > 0 ? 'requieren atención' : 'todo al día',
      icon: Mail,
      color: unreadCount > 0 ? 'rose' : 'emerald',
      gradient: unreadCount > 0 ? 'from-rose-500 to-pink-600' : 'from-slate-500 to-slate-700',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 p-6 text-white shadow-xl md:p-8">
        <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-emerald-400/30 blur-2xl" />
        <div className="relative">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-emerald-100">¡Bienvenido de vuelta!</p>
              <h1 className="mt-1 text-2xl font-bold md:text-3xl">
                Hola, {currentUser.name.split(' ')[0]} <span className="inline-block animate-[wave_1.5s_ease-in-out_infinite] origin-[70%_70%]">👋</span>
              </h1>
              <p className="mt-2 max-w-lg text-sm text-emerald-100">
                Gestiona tus tarjetas digitales, revisa estadísticas y mantén tu presencia al día.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-sm font-semibold backdrop-blur">
              {currentUser.plan === 'pro' && <Crown className="h-4 w-4 text-amber-300" />}
              {currentUser.plan === 'basico' && <Zap className="h-4 w-4 text-amber-300" />}
              {currentUser.plan === 'gratis' && <Sparkles className="h-4 w-4 text-amber-300" />}
              Plan {plan.name}
            </div>
          </div>
          {!canCreateMore && (
            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg bg-amber-500/20 px-4 py-2.5 text-sm ring-1 ring-amber-300/40">
              <AlertCircle className="h-4 w-4 text-amber-200" />
              <span className="flex-1">Has alcanzado el límite de tarjetas de tu plan.</span>
              <Button size="sm" variant="secondary" onClick={handleUpgrade} className="bg-amber-400 text-amber-900 hover:bg-amber-300">
                <Crown className="mr-1 h-3.5 w-3.5" /> Mejorar Plan
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <Card className="overflow-hidden border-slate-200/60 shadow-sm transition-all hover:shadow-md">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md', stat.gradient)}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  {i === 0 && !canCreateMore && (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700">Máx</Badge>
                  )}
                </div>
                <p className="mt-4 text-3xl font-bold text-slate-800">{stat.value.toLocaleString('es-MX')}</p>
                <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{stat.sub}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* My cards section */}
      <Card className="border-slate-200/60 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="h-5 w-5 text-emerald-600" />
              Mis Tarjetas
            </CardTitle>
            <CardDescription className="mt-1">
              {cards.length > 0
                ? `${cards.length} tarjeta${cards.length !== 1 ? 's' : ''} • ${canCreateMore ? `Puedes crear ${plan.maxCards - cards.length} más` : 'Límite alcanzado'}`
                : 'Aún no tienes tarjetas, crea tu primera'}
            </CardDescription>
          </div>
          <Button
            onClick={onCreateOpen}
            disabled={!canCreateMore}
            className={cn(
              'shrink-0',
              canCreateMore
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-slate-300 text-slate-500'
            )}
          >
            {canCreateMore ? <Plus className="h-4 w-4" /> : <Crown className="h-4 w-4" />}
            <span className="hidden sm:inline">Crear Nueva Tarjeta</span>
            <span className="sm:hidden">Crear</span>
          </Button>
        </CardHeader>
        <CardContent>
          {cards.length === 0 ? (
            <EmptyState
              icon={CreditCard}
              title="No tienes tarjetas todavía"
              description="Crea tu primera tarjeta digital y comienza a compartirla con tus clientes."
              action={
                <Button onClick={onCreateOpen} disabled={!canCreateMore} className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="h-4 w-4" /> Crear mi primera tarjeta
                </Button>
              }
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <AnimatePresence>
                {cards.map((card, idx) => (
                  <motion.div
                    key={card.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <CardItem
                      card={card}
                      onEdit={() => handleEdit(card)}
                      onView={() => handleView(card)}
                      onCopy={() => handleCopy(card)}
                      onDelete={() => handleDelete(card)}
                      onToggle={() => toggleCardActive(card.id)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plan info card */}
      <PlanInfoCard onUpgrade={handleUpgrade} />
    </div>
  );
}

// ============================ CARD ITEM ============================
function CardItem({
  card, onEdit, onView, onCopy, onDelete, onToggle,
}: {
  card: BusinessCard;
  onEdit: () => void;
  onView: () => void;
  onCopy: () => void;
  onDelete: () => void;
  onToggle: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const initials = card.cardName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-200/70 bg-white shadow-sm transition-all hover:shadow-md">
      {/* Top color bar */}
      <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${card.primaryColor}, ${card.secondaryColor})` }} />

      <div className="p-5">
        <div className="flex items-start gap-3">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-base font-bold text-white shadow-md"
            style={{ background: `linear-gradient(135deg, ${card.primaryColor}, ${card.secondaryColor})` }}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate font-semibold text-slate-800">{card.cardName}</h3>
              <Badge
                variant="secondary"
                className={cn(
                  'shrink-0 text-[10px]',
                  card.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                )}
              >
                {card.isActive ? '● Activa' : '○ Inactiva'}
              </Badge>
            </div>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              ftpdigitalplus.com/t/<span className="font-medium text-emerald-700">{card.linkName}</span>
            </p>
          </div>
        </div>

        {/* Stats inline */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
            <Eye className="h-4 w-4 text-slate-400" />
            <div>
              <p className="text-xs text-muted-foreground">Visitas</p>
              <p className="text-sm font-semibold text-slate-800">{card.views.toLocaleString('es-MX')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
            <QrCode className="h-4 w-4 text-slate-400" />
            <div>
              <p className="text-xs text-muted-foreground">Escaneos QR</p>
              <p className="text-sm font-semibold text-slate-800">{card.qrScans.toLocaleString('es-MX')}</p>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Actions */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={onEdit} className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800">
                    <Edit className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Editar</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Editar tarjeta</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={onView} className="h-8 w-8">
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Ver tarjeta pública</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={onCopy} className="h-8 w-8">
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copiar enlace</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="flex items-center gap-2">
            <AlertDialogWrap onDelete={onDelete} cardName={card.cardName} />
            {/* Active toggle */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-medium text-muted-foreground">Activa</span>
              <Switch checked={card.isActive} onCheckedChange={onToggle} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Small inline alert dialog using Dialog
function AlertDialogWrap({ onDelete, cardName }: { onDelete: () => void; cardName: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-rose-700">
            <AlertCircle className="h-5 w-5" /> Eliminar tarjeta
          </DialogTitle>
          <DialogDescription>
            ¿Seguro que deseas eliminar <strong className="text-slate-700">{cardName}</strong>? Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button
            variant="destructive"
            onClick={() => { onDelete(); setOpen(false); }}
            className="bg-rose-600 hover:bg-rose-700"
          >
            <Trash2 className="h-4 w-4" /> Eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================ PLAN INFO CARD ============================
function PlanInfoCard({ onUpgrade }: { onUpgrade: () => void }) {
  const currentUser = useAppStore(s => s.currentUser)!;
  const cards = useCurrentUserCards();
  const plan = PLANS[currentUser.plan];
  const planColors = PLAN_COLORS[currentUser.plan];
  const usagePercent = Math.min(100, (cards.length / plan.maxCards) * 100);

  const isPro = currentUser.plan === 'pro';

  return (
    <Card className="overflow-hidden border-slate-200/60 shadow-sm">
      <div className={cn('flex items-center justify-between px-6 py-4', planColors.bg)}>
        <div className="flex items-center gap-3">
          {currentUser.plan === 'pro' && <Crown className="h-6 w-6 text-amber-600" />}
          {currentUser.plan === 'basico' && <Zap className="h-6 w-6 text-emerald-600" />}
          {currentUser.plan === 'gratis' && <Sparkles className="h-6 w-6 text-slate-600" />}
          <div>
            <p className="text-sm font-medium text-muted-foreground">Tu plan actual</p>
            <p className={cn('text-lg font-bold', planColors.text)}>Plan {plan.name}</p>
          </div>
        </div>
        <div className="text-right">
          <p className={cn('text-2xl font-bold', planColors.text)}>
            ${plan.price.toLocaleString('es-MX')}
          </p>
          <p className="text-xs text-muted-foreground">{plan.period}</p>
        </div>
      </div>
      <CardContent className="p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">Tarjetas usadas</span>
                <span className="text-muted-foreground">{cards.length} / {plan.maxCards}</span>
              </div>
              <Progress value={usagePercent} className="mt-2 h-2 bg-slate-100" />
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <InfoTile label="Almacenamiento" value={`${plan.storage} MB`} />
              <InfoTile label="Tarjeta web" value={plan.hasWebCard ? 'Sí' : 'No'} />
              <InfoTile label="Marca de agua" value={plan.hasWatermark ? 'Sí' : 'Sin marca'} />
              <InfoTile label="QR permanente" value={plan.qrExpires ? '7 días' : 'Permanente'} />
            </div>
          </div>
          <div className="flex flex-col justify-between gap-4 rounded-xl bg-gradient-to-br from-slate-50 to-emerald-50/50 p-4 ring-1 ring-slate-200/50">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {isPro ? '¡Estás al máximo potencial! 🎉' : '¿Necesitas más funciones?'}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {isPro
                  ? 'Tienes acceso a todas las funciones premium de FTP Digital Plus.'
                  : `Mejora a ${currentUser.plan === 'gratis' ? 'Básico o Pro' : 'Pro'} y desbloquea más tarjetas, funciones y capacidad.`}
              </p>
            </div>
            {!isPro && (
              <Button onClick={onUpgrade} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md hover:from-amber-600 hover:to-orange-600">
                <Crown className="h-4 w-4" /> Mejorar Plan
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200/60 bg-slate-50/50 px-3 py-2">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}

// ============================ CREATE CARD DIALOG ============================
function CreateCardDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const createCard = useAppStore(s => s.createCard);
  const selectCard = useAppStore(s => s.selectCard);
  const navigate = useAppStore(s => s.navigate);
  const cards = useCurrentUserCards();
  const currentUser = useAppStore(s => s.currentUser)!;
  const plan = PLANS[currentUser.plan];

  const [linkName, setLinkName] = useState('');
  const [cardName, setCardName] = useState('');
  const [error, setError] = useState('');

  const canCreate = cards.length < plan.maxCards;

  const reset = () => {
    setLinkName('');
    setCardName('');
    setError('');
  };

  const handleSubmit = () => {
    const trimmedLink = linkName.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const trimmedName = cardName.trim();

    if (!trimmedLink || !trimmedName) {
      setError('Completa todos los campos');
      return;
    }
    if (trimmedLink.length < 3) {
      setError('El enlace debe tener al menos 3 caracteres');
      return;
    }
    const exists = useAppStore.getState().cards.some(c => c.linkName === trimmedLink);
    if (exists) {
      setError('Ese enlace ya está en uso. Prueba con otro.');
      return;
    }

    const newId = createCard(trimmedLink, trimmedName);
    if (!newId) {
      setError('No se pudo crear la tarjeta. Límite alcanzado.');
      return;
    }
    toast.success('¡Tarjeta creada!', { description: `ftpdigitalplus.com/t/${trimmedLink}` });
    reset();
    onOpenChange(false);
    selectCard(newId);
    navigate('editor');
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <Plus className="h-4 w-4" />
            </div>
            Crear Nueva Tarjeta
          </DialogTitle>
          <DialogDescription>
            Define el nombre y enlace único de tu nueva tarjeta digital.
          </DialogDescription>
        </DialogHeader>

        {!canCreate ? (
          <div className="rounded-lg bg-amber-50 p-4 text-center ring-1 ring-amber-200">
            <Crown className="mx-auto h-8 w-8 text-amber-500" />
            <p className="mt-2 text-sm font-semibold text-amber-800">Límite de plan alcanzado</p>
            <p className="mt-1 text-xs text-amber-700">
              Tu plan {plan.name} permite {plan.maxCards} tarjeta{plan.maxCards !== 1 ? 's' : ''}. Mejora para crear más.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="card-name" className="text-sm font-medium">Nombre de la tarjeta</Label>
              <Input
                id="card-name"
                placeholder="Ej: Juan Pérez, Mi Negocio, Dra. González"
                value={cardName}
                onChange={(e) => { setCardName(e.target.value); setError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
              <p className="text-xs text-muted-foreground">Así aparecerá en la tarjeta y en la lista.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="link-name" className="text-sm font-medium">Enlace único</Label>
              <div className="flex items-center rounded-md border bg-slate-50 px-3">
                <span className="text-sm text-muted-foreground">ftpdigitalplus.com/t/</span>
                <Input
                  id="link-name"
                  placeholder="mi-enlace"
                  value={linkName}
                  onChange={(e) => { setLinkName(e.target.value); setError(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  className="border-0 bg-transparent px-1 shadow-none focus-visible:ring-0"
                />
              </div>
              <p className="text-xs text-muted-foreground">Solo letras minúsculas, números y guiones.</p>
            </div>
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">
                <AlertCircle className="h-4 w-4 shrink-0" /> {error}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          {canCreate && (
            <Button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4" /> Crear Tarjeta
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================ MESSAGES ============================
function MessagesSection() {
  const messages = useAppStore(s => s.messages);
  const markMessageRead = useAppStore(s => s.markMessageRead);
  const currentUser = useAppStore(s => s.currentUser)!;
  const cards = useCurrentUserCards();

  // Filter messages relevant to this user's cards (for demo: show all)
  const userMessages = messages; // demo: show all
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const filtered = useMemo(() => {
    const sorted = [...userMessages].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (filter === 'unread') return sorted.filter(m => !m.read);
    if (filter === 'read') return sorted.filter(m => m.read);
    return sorted;
  }, [userMessages, filter]);

  const unreadCount = userMessages.filter(m => !m.read).length;

  const handleMarkRead = (id: string) => {
    markMessageRead(id);
    toast.success('Mensaje marcado como leído');
  };

  const handleReply = (msg: ContactMessage) => {
    const wa = msg.phone ? `https://wa.me/${msg.phone.replace(/[^0-9]/g, '')}` : '#';
    if (msg.phone) {
      window.open(wa, '_blank');
    } else {
      window.open(`mailto:${msg.email}`, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Consultas"
        description="Mensajes recibidos desde el formulario de contacto de tus tarjetas."
        icon={Mail}
        accent="emerald"
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList>
            <TabsTrigger value="all">Todos ({userMessages.length})</TabsTrigger>
            <TabsTrigger value="unread">Sin leer ({unreadCount})</TabsTrigger>
            <TabsTrigger value="read">Leídos</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Mailbox}
          title="No hay mensajes"
          description="Cuando alguien te contacte desde tus tarjetas, los mensajes aparecerán aquí."
        />
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((msg, i) => (
              <motion.div
                key={msg.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card className={cn(
                  'transition-all hover:shadow-md',
                  msg.read ? 'border-slate-200/60 bg-white' : 'border-emerald-200 bg-emerald-50/40'
                )}>
                  <CardContent className="p-4 md:p-5">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start">
                      <Avatar className="h-11 w-11 shrink-0 ring-2 ring-slate-100">
                        <AvatarFallback className={cn(
                          'text-sm font-bold text-white',
                          msg.read ? 'bg-slate-400' : 'bg-gradient-to-br from-emerald-500 to-emerald-700'
                        )}>
                          {msg.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-slate-800">{msg.name}</h3>
                          {!msg.read && (
                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Nuevo</Badge>
                          )}
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">{formatDate(msg.date)}</span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {msg.email}</span>
                          {msg.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {msg.phone}</span>}
                        </div>
                        <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                          “{msg.message}”
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          {!msg.read && (
                            <Button size="sm" variant="outline" onClick={() => handleMarkRead(msg.id)} className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                              <Check className="h-3.5 w-3.5" /> Marcar como leído
                            </Button>
                          )}
                          <Button size="sm" variant="outline" onClick={() => handleReply(msg)}>
                            <MessageCircle className="h-3.5 w-3.5" /> Responder
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard?.writeText(msg.email); toast.success('Correo copiado'); }}>
                            <Copy className="h-3.5 w-3.5" /> Copiar correo
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// ============================ APPOINTMENTS ============================
function AppointmentsSection() {
  const appointments = useAppStore(s => s.appointments);

  const sorted = [...appointments].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const pending = sorted.filter(a => a.status === 'pending');
  const confirmed = sorted.filter(a => a.status === 'confirmed');
  const cancelled = sorted.filter(a => a.status === 'cancelled');

  const statusConfig = {
    pending:   { label: 'Pendiente',  bg: 'bg-amber-100',   text: 'text-amber-700',   dot: 'bg-amber-500' },
    confirmed: { label: 'Confirmada', bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    cancelled: { label: 'Cancelada',  bg: 'bg-rose-100',    text: 'text-rose-700',    dot: 'bg-rose-500' },
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Equipo / Citas"
        description="Citas agendadas a través de tus tarjetas digitales."
        icon={CalendarIcon}
        accent="emerald"
      />

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryTile label="Pendientes" value={pending.length} icon={Clock} color="amber" />
        <SummaryTile label="Confirmadas" value={confirmed.length} icon={CheckCircle2} color="emerald" />
        <SummaryTile label="Canceladas" value={cancelled.length} icon={X} color="rose" />
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          icon={CalendarIcon}
          title="No hay citas agendadas"
          description="Cuando alguien agende una cita desde tus tarjetas, aparecerá aquí."
        />
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {sorted.map((appt, i) => {
              const cfg = statusConfig[appt.status];
              return (
                <motion.div
                  key={appt.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="overflow-hidden border-slate-200/60 shadow-sm transition-all hover:shadow-md">
                    <div className="flex">
                      {/* Date block */}
                      <div className="flex w-20 shrink-0 flex-col items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700 p-3 text-white">
                        <span className="text-[10px] font-medium uppercase tracking-wide text-emerald-100">
                          {new Date(appt.date).toLocaleDateString('es-MX', { month: 'short' })}
                        </span>
                        <span className="text-2xl font-bold leading-none">{new Date(appt.date).getDate()}</span>
                        <span className="mt-1 text-xs text-emerald-100">{appt.time}</span>
                      </div>
                      <CardContent className="flex-1 p-4 md:p-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-slate-800">{appt.clientName}</h3>
                              <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold', cfg.bg, cfg.text)}>
                                <span className={cn('h-1.5 w-1.5 rounded-full', cfg.dot)} />
                                {cfg.label}
                              </span>
                            </div>
                            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                              <Mail className="h-3 w-3" /> {appt.clientEmail}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {formatDate(appt.date)} a las {appt.time}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                              <CalendarIcon className="h-3.5 w-3.5" /> Ver detalles
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function SummaryTile({ label, value, icon: Icon, color }: { label: string; value: number; icon: LucideIcon; color: 'emerald' | 'amber' | 'rose' }) {
  const colors = {
    emerald: 'from-emerald-500 to-emerald-700',
    amber: 'from-amber-500 to-orange-600',
    rose: 'from-rose-500 to-pink-600',
  };
  return (
    <Card className="border-slate-200/60 shadow-sm">
      <CardContent className="flex items-center gap-3 p-4">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow', colors[color])}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-800">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================ ORDERS ============================
function OrdersSection() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Pedidos"
        description="Gestiona las solicitudes de productos que recibas en tus tarjetas."
        icon={Package}
        accent="emerald"
      />
      <Card className="border-slate-200/60 shadow-sm">
        <CardContent className="p-12">
          <EmptyState
            icon={ShoppingCart}
            title="Próximamente: Gestión de pedidos de productos"
            description="Estamos trabajando en esta función. Pronto podrás gestionar todos los pedidos de productos de tus tarjetas digitales desde aquí: estados, pagos, envíos y más."
            large
            action={
              <Button variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                <Bell className="h-4 w-4" /> Notificarme al lanzar
              </Button>
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}

// ============================ VIRTUAL FUNDS (NFC) ============================
function VirtualFundsSection() {
  const cards = useCurrentUserCards();
  const primaryCard = cards[0];
  const primary = primaryCard?.primaryColor || '#059669';
  const secondary = primaryCard?.secondaryColor || '#10b981';

  const designs = useMemo(() => [
    {
      id: 'd1', name: 'Esmeralda Clásico', orientation: 'horizontal',
      bg: `linear-gradient(135deg, ${primary}, ${secondary})`,
      text: 'white',
    },
    {
      id: 'd2', name: 'Oro Lujo', orientation: 'horizontal',
      bg: `linear-gradient(135deg, #f59e0b, #fbbf24, #f59e0b)`,
      text: 'white',
    },
    {
      id: 'd3', name: 'Esmeralda Vertical', orientation: 'vertical',
      bg: `linear-gradient(180deg, ${secondary}, ${primary})`,
      text: 'white',
    },
    {
      id: 'd4', name: 'Geométrico Oscuro', orientation: 'horizontal',
      bg: `linear-gradient(120deg, #0f172a 0%, ${primary} 60%, #0f172a 100%)`,
      text: 'white',
    },
    {
      id: 'd5', name: 'Dorado Vertical', orientation: 'vertical',
      bg: `linear-gradient(180deg, #fbbf24, #d97706)`,
      text: 'white',
    },
    {
      id: 'd6', name: 'Mármol Esmeralda', orientation: 'horizontal',
      bg: `radial-gradient(circle at 30% 30%, ${secondary}40, transparent), radial-gradient(circle at 70% 70%, ${primary}40, transparent), linear-gradient(135deg, #f8fafc, #ecfdf5)`,
      text: 'slate-800',
    },
  ], [primary, secondary]);

  const handleDownload = (name: string) => {
    toast.success('Descargando diseño...', { description: `${name}.png se está generando` });
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Fondos Virtuales NFC"
        description="Diseños listos para descargar y configurar en tus tarjetas NFC físicas."
        icon={CreditCard}
        accent="emerald"
      />

      <Card className="border-emerald-200/60 bg-gradient-to-br from-emerald-50/50 to-amber-50/30 shadow-sm">
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-800">Personaliza tus tarjetas NFC</p>
            <p className="text-xs text-muted-foreground">
              Descarga estos fondos, grábalos en tu tarjeta NFC y compártelos con tus clientes.
              {primaryCard && ` Usando colores de "${primaryCard.cardName}".`}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {designs.map((d, i) => (
          <motion.div
            key={d.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.06 }}
          >
            <Card className="group overflow-hidden border-slate-200/60 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
              {/* Card preview */}
              <div
                className={cn(
                  'relative flex items-center justify-center p-6',
                  d.orientation === 'horizontal' ? 'aspect-[1.586/1]' : 'aspect-[1/1.586]'
                )}
                style={{ background: d.bg }}
              >
                {/* Chip decoration */}
                <div className="absolute left-4 top-4 h-6 w-8 rounded-md bg-amber-300/80 shadow-inner" />
                {/* NFC icon */}
                <div className={cn(
                  'flex flex-col items-center gap-1 opacity-90',
                  d.text === 'white' ? 'text-white' : 'text-slate-800'
                )}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur">
                    <span className="text-lg font-bold">NFC</span>
                  </div>
                </div>
                {/* Brand text */}
                <div className={cn(
                  'absolute bottom-4 right-4 text-right',
                  d.text === 'white' ? 'text-white' : 'text-slate-800'
                )}>
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">FTP Digital</p>
                  <p className="text-xs font-bold">Plus</p>
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/30 group-hover:opacity-100">
                  <Button size="sm" onClick={() => handleDownload(d.name)} className="bg-white text-slate-800 hover:bg-white/90">
                    <Download className="h-3.5 w-3.5" /> Descargar
                  </Button>
                </div>
              </div>
              <CardContent className="flex items-center justify-between p-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{d.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{d.orientation}</p>
                </div>
                <Badge variant="secondary" className="bg-slate-100 text-slate-600">PNG</Badge>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ============================ AFFILIATIONS ============================
function AffiliationsSection() {
  const cards = useCurrentUserCards();
  const navigate = useAppStore(s => s.navigate);
  const currentUser = useAppStore(s => s.currentUser)!;
  const plan = PLANS[currentUser.plan];
  const hasAffiliation = plan.features.some(f => f.name.toLowerCase().includes('afiliación') && f.included);

  const affiliateCode = cards[0]?.affiliateCode || `FTP-${currentUser.name.split(' ')[0].toUpperCase()}-${currentUser.id.slice(-4).toUpperCase()}`;
  const clicks = cards.reduce((sum, c) => sum + c.affiliateClicks, 0);
  const referralLink = `ftpdigitalplus.com/r/${affiliateCode}`;

  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard?.writeText(`https://${referralLink}`);
    setCopied(true);
    toast.success('Enlace de referido copiado');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!hasAffiliation) {
    return (
      <div className="space-y-6">
        <SectionHeader title="Afiliaciones" description="Programa de afiliados de FTP Digital Plus." icon={Users} accent="emerald" />
        <Card className="border-amber-200/60 bg-gradient-to-br from-amber-50/50 to-orange-50/30 shadow-sm">
          <CardContent className="p-8">
            <EmptyState
              icon={Gift}
              title="Función exclusiva de planes Básico y Pro"
              description="Únete al programa de afiliados y gana comisiones por cada referido que contrate un plan de pago."
              action={
                <Button onClick={() => navigate('pricing')} className="bg-emerald-600 hover:bg-emerald-700">
                  <Crown className="h-4 w-4" /> Mejorar Plan
                </Button>
              }
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  const benefits = [
    { label: 'Comisión por referido', value: '15%', icon: Wallet },
    { label: 'Clics totales', value: clicks.toString(), icon: TrendingUp },
    { label: 'Tarjetas con afiliación', value: cards.filter(c => c.affiliateCode).length.toString(), icon: CreditCard },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Afiliaciones"
        description="Invita a otros a usar FTP Digital Plus y gana comisiones."
        icon={Users}
        accent="emerald"
      />

      <div className="grid gap-4 md:grid-cols-3">
        {benefits.map((b) => (
          <Card key={b.label} className="border-slate-200/60 shadow-sm">
            <CardContent className="flex items-center gap-3 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-md">
                <b.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{b.value}</p>
                <p className="text-xs text-muted-foreground">{b.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden border-slate-200/60 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-amber-50/50 pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Gift className="h-5 w-5 text-emerald-600" /> Tu enlace de referido
          </CardTitle>
          <CardDescription>Comparte este enlace. Cada vez que alguien contrate un plan, ganas comisión.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-amber-400">
              <CreditCard className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">Tu código de afiliado</p>
              <p className="font-mono text-lg font-bold text-slate-800">{affiliateCode}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => { navigator.clipboard?.writeText(affiliateCode); toast.success('Código copiado'); }}>
              <Copy className="h-3.5 w-3.5" /> Copiar
            </Button>
          </div>

          <Separator />

          <div>
            <Label className="text-sm font-medium">Enlace de referido</Label>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <div className="flex flex-1 items-center rounded-md border bg-slate-50 px-3 py-2.5">
                <span className="truncate text-sm text-slate-700">{referralLink}</span>
              </div>
              <Button onClick={handleCopy} className={cn('shrink-0', copied ? 'bg-emerald-700' : 'bg-emerald-600 hover:bg-emerald-700')}>
                {copied ? <><Check className="h-4 w-4" /> Copiado</> : <><Copy className="h-4 w-4" /> Copiar enlace</>}
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <ShareButton network="WhatsApp" icon={MessageCircle} color="bg-[#25D366]" />
            <ShareButton network="Facebook" icon={Share2} color="bg-[#1877F2]" />
            <ShareButton network="Email" icon={Mail} color="bg-slate-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200/60 bg-gradient-to-br from-amber-50/30 to-white shadow-sm">
        <CardContent className="p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <TrendingUp className="h-4 w-4 text-emerald-600" /> ¿Cómo funciona?
          </h3>
          <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2"><span className="font-bold text-emerald-600">1.</span> Comparte tu enlace de referido.</li>
            <li className="flex gap-2"><span className="font-bold text-emerald-600">2.</span> Alguien se registra y contrata un plan de pago.</li>
            <li className="flex gap-2"><span className="font-bold text-emerald-600">3.</span> Recibes el 15% de comisión automáticamente.</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

function ShareButton({ network, icon: Icon, color }: { network: string; icon: LucideIcon; color: string }) {
  return (
    <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50">
      <span className={cn('flex h-5 w-5 items-center justify-center rounded text-white', color)}>
        <Icon className="h-3 w-3" />
      </span>
      {network}
    </Button>
  );
}

// ============================ STORAGE ============================
function StorageSection() {
  const cards = useCurrentUserCards();
  const currentUser = useAppStore(s => s.currentUser)!;
  const plan = PLANS[currentUser.plan];
  const maxStorage = plan.storage; // MB

  // Fake storage calculation
  const items = useMemo(() => {
    const result: { card: string; type: string; size: number; icon: LucideIcon }[] = [];
    cards.forEach(card => {
      if (card.profilePhoto) result.push({ card: card.cardName, type: 'Foto de perfil', size: 1.2, icon: CircleUser });
      if (card.coverPhoto) result.push({ card: card.cardName, type: 'Foto de portada', size: 2.5, icon: FileText });
      card.gallery.forEach(() => result.push({ card: card.cardName, type: 'Imagen de galería', size: 1.8, icon: FileText }));
      card.services.forEach(s => s.photo && result.push({ card: card.cardName, type: `Foto servicio: ${s.name}`, size: 1.5, icon: Briefcase }));
      card.products.forEach(p => p.image && result.push({ card: card.cardName, type: `Imagen producto: ${p.name}`, size: 1.5, icon: ShoppingBag }));
    });
    // Add demo items if empty
    if (result.length === 0) {
      cards.forEach(card => {
        result.push({ card: card.cardName, type: 'Logo de marca', size: 0.8, icon: Sparkles });
      });
    }
    return result;
  }, [cards]);

  const usedStorage = items.reduce((sum, i) => sum + i.size, 0);
  const usagePercent = Math.min(100, (usedStorage / maxStorage) * 100);
  const isNearLimit = usagePercent > 80;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Almacenamiento"
        description="Gestiona el espacio utilizado por tus tarjetas digitales."
        icon={Database}
        accent="emerald"
      />

      <Card className="overflow-hidden border-slate-200/60 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Almacenamiento usado</p>
              <p className="mt-1 text-3xl font-bold text-slate-800">
                {usedStorage.toFixed(1)} <span className="text-lg font-medium text-muted-foreground">/ {maxStorage} MB</span>
              </p>
            </div>
            <Badge className={cn(
              'px-3 py-1',
              isNearLimit ? 'bg-rose-100 text-rose-700 hover:bg-rose-100' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
            )}>
              {usagePercent.toFixed(0)}% usado
            </Badge>
          </div>
          <Progress
            value={usagePercent}
            className={cn('mt-4 h-3 bg-slate-100', isNearLimit && '[&_[data-slot=progress-indicator]]:bg-rose-500')}
          />
          {isNearLimit && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Estás cerca del límite. Considera eliminar archivos o mejorar tu plan.</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-200/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-emerald-600" /> Archivos almacenados
          </CardTitle>
          <CardDescription>{items.length} elemento(s) usando espacio</CardDescription>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <EmptyState
              icon={Database}
              title="Sin archivos"
              description="Todavía no has subido imágenes a tus tarjetas."
            />
          ) : (
            <div className="max-h-96 space-y-2 overflow-y-auto pr-2">
              {items.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 rounded-lg border border-slate-200/60 bg-white p-3 transition-colors hover:bg-slate-50"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">{item.type}</p>
                    <p className="truncate text-xs text-muted-foreground">{item.card}</p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-slate-600">{item.size.toFixed(1)} MB</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-rose-500 hover:bg-rose-50">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================ SETTINGS ============================
function SettingsSection() {
  const [paypal, setPaypal] = useState(true);
  const [stripe, setStripe] = useState(false);
  const [bank, setBank] = useState(true);
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const currentUser = useAppStore(s => s.currentUser)!;

  const save = () => toast.success('Configuración guardada correctamente');

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Ajustes / Pagos"
        description="Configura tus métodos de pago y preferencias generales."
        icon={SettingsIcon}
        accent="emerald"
      />

      <Tabs defaultValue="payments">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="payments"><Wallet className="mr-1.5 h-4 w-4" /> Pagos</TabsTrigger>
          <TabsTrigger value="general"><SettingsIcon className="mr-1.5 h-4 w-4" /> General</TabsTrigger>
        </TabsList>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-4">
          <Card className="border-slate-200/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Métodos de pago</CardTitle>
              <CardDescription>Configura cómo recibirás pagos en tus tarjetas (demostración).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <PaymentMethodRow
                name="PayPal"
                description="Recibe pagos a través de PayPal"
                icon={<Wallet className="h-5 w-5 text-[#003087]" />}
                enabled={paypal}
                onToggle={() => { setPaypal(!paypal); toast.info(`PayPal ${!paypal ? 'activado' : 'desactivado'}`); }}
                configured={paypal}
              />
              <Separator />
              <PaymentMethodRow
                name="Stripe"
                description="Pagos con tarjeta a través de Stripe"
                icon={<CreditCard className="h-5 w-5 text-[#635bff]" />}
                enabled={stripe}
                onToggle={() => { setStripe(!stripe); toast.info(`Stripe ${!stripe ? 'activado' : 'desactivado'}`); }}
                configured={stripe}
              />
              <Separator />
              <PaymentMethodRow
                name="Transferencia Bancaria"
                description="Recibe pagos por transferencia bancaria directa"
                icon={<Database className="h-5 w-5 text-emerald-600" />}
                enabled={bank}
                onToggle={() => { setBank(!bank); toast.info(`Transferencia ${!bank ? 'activada' : 'desactivada'}`); }}
                configured={bank}
              />
            </CardContent>
          </Card>

          <Card className="border-slate-200/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Información de cobro</CardTitle>
              <CardDescription>Datos para recibir pagos (solo demostración).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="account-name">Nombre del titular</Label>
                  <Input id="account-name" placeholder={currentUser.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account-email">Correo de cobro</Label>
                  <Input id="account-email" type="email" placeholder={currentUser.email} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clabe">CLABE interbancaria</Label>
                  <Input id="clabe" placeholder="012 345 67890 1234567" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank-name">Banco</Label>
                  <Input id="bank-name" placeholder="Nombre del banco" />
                </div>
              </div>
              <Button onClick={save} className="bg-emerald-600 hover:bg-emerald-700">
                <ShieldCheck className="h-4 w-4" /> Guardar datos
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-4">
          <Card className="border-slate-200/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Notificaciones</CardTitle>
              <CardDescription>Define cómo quieres enterarte de novedades.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <SettingToggle
                icon={<Mail className="h-4 w-4" />}
                title="Notificaciones por correo"
                description="Recibe mensajes y citas en tu correo"
                checked={emailNotif}
                onCheckedChange={setEmailNotif}
              />
              <Separator />
              <SettingToggle
                icon={<Phone className="h-4 w-4" />}
                title="Notificaciones por SMS"
                description="Recibe alertas por mensaje de texto"
                checked={smsNotif}
                onCheckedChange={setSmsNotif}
              />
              <Separator />
              <SettingToggle
                icon={<ShieldCheck className="h-4 w-4" />}
                title="Autenticación en dos pasos"
                description="Añade una capa extra de seguridad a tu cuenta"
                checked={twoFactor}
                onCheckedChange={setTwoFactor}
              />
            </CardContent>
          </Card>

          <Card className="border-slate-200/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Cuenta</CardTitle>
              <CardDescription>Información de tu cuenta FTP Digital Plus.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                <div>
                  <p className="text-xs text-muted-foreground">Nombre</p>
                  <p className="text-sm font-medium text-slate-800">{currentUser.name}</p>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                <div>
                  <p className="text-xs text-muted-foreground">Correo</p>
                  <p className="text-sm font-medium text-slate-800">{currentUser.email}</p>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                <div>
                  <p className="text-xs text-muted-foreground">Plan actual</p>
                  <p className="text-sm font-medium text-slate-800 capitalize">{PLANS[currentUser.plan].name}</p>
                </div>
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                  {PLANS[currentUser.plan].price === 0 ? 'Gratis' : `$${PLANS[currentUser.plan].price}`}
                </Badge>
              </div>
              <Button onClick={save} className="bg-emerald-600 hover:bg-emerald-700">
                <ShieldCheck className="h-4 w-4" /> Guardar cambios
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PaymentMethodRow({
  name, description, icon, enabled, onToggle, configured,
}: {
  name: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  onToggle: () => void;
  configured: boolean;
}) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 ring-1 ring-slate-200/60">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-slate-800">{name}</p>
          {enabled && configured && (
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="mr-0.5 h-3 w-3" /> Configurado
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={enabled} onCheckedChange={onToggle} />
    </div>
  );
}

function SettingToggle({
  icon, title, description, checked, onCheckedChange,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-800">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

// ============================ HELPERS ============================
function SectionHeader({ title, description, icon: Icon, accent }: { title: string; description: string; icon: LucideIcon; accent: 'emerald' | 'amber' }) {
  const colors = {
    emerald: 'from-emerald-500 to-emerald-700',
    amber: 'from-amber-500 to-orange-600',
  };
  return (
    <div className="flex items-center gap-4">
      <div className={cn('flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg', colors[accent])}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function EmptyState({
  icon: Icon, title, description, action, large,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  large?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className={cn('flex items-center justify-center rounded-full bg-slate-100 text-slate-400', large ? 'h-20 w-20' : 'h-14 w-14')}>
        <Icon className={large ? 'h-10 w-10' : 'h-7 w-7'} />
      </div>
      <h3 className={cn('mt-4 font-bold text-slate-800', large ? 'text-xl' : 'text-base')}>{title}</h3>
      <p className={cn('mt-1 max-w-md text-muted-foreground', large ? 'text-sm' : 'text-xs')}>{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
