'use client';

import { useState, type FormEvent } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { toast } from 'sonner';
import { useAppStore } from '@/lib/store';
import { FTPLogo } from '@/components/ftp-logo';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import type { PlanType } from '@/lib/types';
import {
  ArrowLeft,
  ArrowRight,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles,
  Zap,
  ShieldCheck,
  QrCode,
  User,
  Chrome,
  AlertCircle,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Globe,
  Phone,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Demo accounts                                                      */
/* ------------------------------------------------------------------ */

const DEMO_ACCOUNTS: {
  email: string;
  password: string;
  plan: PlanType;
  label: string;
  description: string;
  badge: string;
  badgeColor: string;
}[] = [
  {
    email: 'demo@gratis.com',
    password: 'demo123',
    plan: 'gratis',
    label: 'Plan Gratis',
    description: '1 tarjeta · QR con vencimiento · Marca de agua',
    badge: 'Gratis',
    badgeColor: 'bg-slate-100 text-slate-700',
  },
  {
    email: 'demo@basico.com',
    password: 'demo123',
    plan: 'basico',
    label: 'Plan Básico',
    description: '2 tarjetas · QR permanente · Sin marca de agua',
    badge: 'Básico',
    badgeColor: 'bg-emerald-100 text-emerald-700',
  },
  {
    email: 'demo@pro.com',
    password: 'demo123',
    plan: 'pro',
    label: 'Plan Pro',
    description: '5 tarjetas · Enlaces personalizados · Analítica avanzada',
    badge: 'Pro',
    badgeColor: 'bg-amber-100 text-amber-700',
  },
];

const BENEFITS = [
  {
    icon: Zap,
    title: 'Configura en minutos',
    description:
      'Crea tu tarjeta digital completa en menos de 5 minutos con nuestro editor visual.',
  },
  {
    icon: QrCode,
    title: 'Comparte con QR y NFC',
    description:
      'Tu tarjeta siempre disponible. Un escaneo QR o un toque NFC y listo.',
  },
  {
    icon: ShieldCheck,
    title: 'Datos siempre seguros',
    description:
      'Tu información y la de tus clientes protegida con estándares modernos.',
  },
];

/* ------------------------------------------------------------------ */
/*  Motion helper                                                      */
/* ------------------------------------------------------------------ */

function useFadeIn(delay = 0) {
  const reduce = useReducedMotion();
  return {
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 20 },
    animate: reduce ? { opacity: 1 } : { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const },
  };
}

/* ------------------------------------------------------------------ */
/*  Left panel (brand)                                                 */
/* ------------------------------------------------------------------ */

function BrandPanel() {
  const navigate = useAppStore(s => s.navigate);
  return (
    <div className="relative hidden overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-800 p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
      {/* Decorative */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 -top-20 size-80 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-10 size-96 rounded-full bg-teal-300/20 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      {/* Top: logo */}
      <div className="relative">
        <button
          onClick={() => navigate('landing')}
          className="transition-opacity hover:opacity-90"
          aria-label="Volver al inicio"
        >
          <FTPLogo variant="full" theme="dark" className="h-10 w-auto" />
        </button>
      </div>

      {/* Middle: tagline + benefits */}
      <div className="relative flex flex-col gap-8">
        <motion.div {...useFadeIn(0.1)} className="flex flex-col gap-4">
          <Badge className="w-fit border-amber-300/40 bg-amber-400/15 text-amber-100 backdrop-blur-sm">
            <Sparkles className="mr-1 size-3.5" />
            Tarjetas de Presentación Digitales
          </Badge>
          <h2 className="text-balance text-3xl font-bold leading-tight xl:text-4xl">
            Conecta con tus clientes como{' '}
            <span className="bg-gradient-to-r from-amber-300 to-amber-400 bg-clip-text text-transparent">
              nunca antes
            </span>
          </h2>
          <p className="max-w-md text-pretty text-emerald-50/90">
            Una sola tarjeta digital con QR, portafolio, catálogo, citas,
            estadísticas y mucho más. Todo en una sola plataforma.
          </p>
        </motion.div>

        <motion.ul {...useFadeIn(0.25)} className="flex flex-col gap-4">
          {BENEFITS.map(benefit => (
            <li key={benefit.title} className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm ring-1 ring-white/20">
                <benefit.icon className="size-5 text-amber-300" />
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-semibold text-white">{benefit.title}</p>
                <p className="text-sm text-emerald-50/80">{benefit.description}</p>
              </div>
            </li>
          ))}
        </motion.ul>
      </div>

      {/* Bottom: stats */}
      <motion.div {...useFadeIn(0.4)} className="relative flex items-center gap-6 border-t border-white/15 pt-6">
        <div>
          <p className="text-2xl font-extrabold text-amber-300">1000+</p>
          <p className="text-xs text-emerald-50/80">Tarjetas creadas</p>
        </div>
        <div className="h-10 w-px bg-white/20" />
        <div>
          <p className="text-2xl font-extrabold text-amber-300">50k+</p>
          <p className="text-xs text-emerald-50/80">Escaneos QR</p>
        </div>
        <div className="h-10 w-px bg-white/20" />
        <div>
          <p className="text-2xl font-extrabold text-amber-300">24</p>
          <p className="text-xs text-emerald-50/80">Funciones</p>
        </div>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Login form                                                         */
/* ------------------------------------------------------------------ */

function LoginForm() {
  const login = useAppStore(s => s.login);
  const navigate = useAppStore(s => s.navigate);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Por favor ingresa tu correo y contraseña.');
      return;
    }

    setLoading(true);
    // Simulate small delay for UX feedback
    setTimeout(() => {
      const ok = login(email.trim(), password);
      if (!ok) {
        setError('Correo o contraseña incorrectos. Intenta con una cuenta demo.');
        setLoading(false);
      }
      // If ok, the store auto-navigates to dashboard
    }, 350);
  };

  const quickLogin = (demoEmail: string, demoPassword: string, planLabel: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError(null);
    setLoading(true);
    setTimeout(() => {
      const ok = login(demoEmail, demoPassword);
      if (ok) {
        toast.success(`Bienvenido al ${planLabel}`, {
          description: 'Iniciando sesión…',
        });
      } else {
        setLoading(false);
        setError('No se pudo iniciar sesión con la cuenta demo.');
      }
    }, 250);
  };

  return (
    <Card className="border-slate-200 shadow-lg shadow-slate-100">
      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-2xl font-bold text-slate-900">Iniciar Sesión</h2>
          <p className="text-sm text-slate-500">
            Ingresa a tu panel para administrar tus tarjetas digitales.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email" className="text-sm font-medium text-slate-700">
              Correo electrónico
            </Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="pl-9"
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                Contraseña
              </Label>
              <button
                type="button"
                onClick={() =>
                  toast.info('Recuperación de contraseña', {
                    description: 'Próximamente disponible. Usa una cuenta demo para probar.',
                  })
                }
                className="text-xs font-medium text-emerald-700 hover:text-emerald-800"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="px-9"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-sm hover:from-emerald-700 hover:to-emerald-600"
          >
            {loading ? (
              <>
                <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Ingresando…
              </>
            ) : (
              <>
                Iniciar Sesión
                <ArrowRight className="ml-1 size-4" />
              </>
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center py-1">
          <div className="flex-1 border-t border-slate-200" />
          <span className="px-3 text-xs font-medium uppercase tracking-wider text-slate-400">
            o continúa con
          </span>
          <div className="flex-1 border-t border-slate-200" />
        </div>

        {/* Registration */}
        <div className="grid gap-2 sm:grid-cols-2">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              toast.info('Próximamente disponible', {
                description: 'El registro de nuevas cuentas estará listo muy pronto.',
              })
            }
            className="border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <User className="mr-1.5 size-4" />
            Registrarse con correo
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              toast.info('Próximamente disponible', {
                description: 'El inicio de sesión con Google estará listo muy pronto.',
              })
            }
            className="border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <Chrome className="mr-1.5 size-4" />
            Continuar con Google
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Demo accounts                                                      */
/* ------------------------------------------------------------------ */

function DemoAccounts() {
  return (
    <Card className="border-dashed border-emerald-300 bg-emerald-50/40">
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-start gap-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <Sparkles className="size-4" />
          </div>
          <div className="flex flex-col gap-0.5">
            <h3 className="text-sm font-semibold text-slate-900">
              Cuentas de demostración
            </h3>
            <p className="text-xs text-slate-600">
              Explora la plataforma sin registro. Haz clic para entrar al instante.
            </p>
          </div>
        </div>

        <div className="grid gap-2.5">
          {DEMO_ACCOUNTS.map(account => (
            <DemoAccountRow key={account.email} account={account} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function DemoAccountRow({
  account,
}: {
  account: (typeof DEMO_ACCOUNTS)[number];
}) {
  const login = useAppStore(s => s.login);
  const [loading, setLoading] = useState(false);

  const handleUse = () => {
    setLoading(true);
    setTimeout(() => {
      const ok = login(account.email, account.password);
      if (ok) {
        toast.success(`Bienvenido al ${account.label}`, {
          description: 'Iniciando sesión…',
        });
      } else {
        setLoading(false);
        toast.error('No se pudo iniciar sesión con la cuenta demo.');
      }
    }, 250);
  };

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-900">{account.label}</span>
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
              account.badgeColor,
            )}
          >
            {account.badge}
          </span>
        </div>
        <p className="font-mono text-xs text-slate-500">{account.email}</p>
        <p className="text-xs text-slate-500">{account.description}</p>
      </div>
      <Button
        size="sm"
        onClick={handleUse}
        disabled={loading}
        className="shrink-0 bg-emerald-600 text-white hover:bg-emerald-700"
      >
        {loading ? (
          <span className="size-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        ) : (
          <>
            Usar esta cuenta
            <ArrowRight className="ml-1 size-3.5" />
          </>
        )}
      </Button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Right panel                                                        */
/* ------------------------------------------------------------------ */

function FormPanel() {
  const navigate = useAppStore(s => s.navigate);

  return (
    <div className="flex flex-1 flex-col bg-slate-50/50">
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <button
          onClick={() => navigate('landing')}
          className="transition-opacity hover:opacity-90"
          aria-label="Volver al inicio"
        >
          <FTPLogo variant="icon" className="h-8 w-8" />
        </button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('landing')}
          className="text-slate-600 hover:bg-slate-100"
        >
          <ArrowLeft className="mr-1 size-4" />
          Inicio
        </Button>
      </div>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-4 py-8 sm:px-6 sm:py-12">
        {/* Back link */}
        <button
          onClick={() => navigate('landing')}
          className="group flex w-fit items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-emerald-700"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          Volver al inicio
        </button>

        <motion.div {...useFadeIn(0.05)} className="flex flex-col gap-6">
          <LoginForm />
          <DemoAccounts />
        </motion.div>

        {/* Reassurance */}
        <motion.div
          {...useFadeIn(0.2)}
          className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-slate-500"
        >
          <span className="inline-flex items-center gap-1">
            <CheckCircle2 className="size-3.5 text-emerald-600" /> Sin tarjeta de crédito
          </span>
          <span className="inline-flex items-center gap-1">
            <CheckCircle2 className="size-3.5 text-emerald-600" /> Cancela cuando quieras
          </span>
          <span className="inline-flex items-center gap-1">
            <CheckCircle2 className="size-3.5 text-emerald-600" /> 100% en español
          </span>
        </motion.div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Footer                                                             */
/* ------------------------------------------------------------------ */

function LoginFooter() {
  const navigate = useAppStore(s => s.navigate);
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-5 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <FTPLogo variant="icon" className="h-6 w-6" />
          <p className="text-xs text-slate-500">
            © {year} FTP Digital Plus — Agencia de Diseño Web y Marketing Digital.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <button
            onClick={() => navigate('landing')}
            className="hover:text-emerald-700"
          >
            Inicio
          </button>
          <button
            onClick={() => navigate('pricing')}
            className="hover:text-emerald-700"
          >
            Planes
          </button>
          <span className="hidden items-center gap-2 sm:flex">
            <Phone className="size-3.5 text-emerald-600" />
            +52 55 1234 5678
          </span>
          <span className="hidden items-center gap-2 sm:flex">
            <Globe className="size-3.5 text-emerald-600" />
            CDMX, México
          </span>
          <div className="hidden gap-1.5 sm:flex">
            {[Facebook, Instagram, Linkedin, Twitter].map((Icon, i) => (
              <a
                key={i}
                href="#"
                onClick={e => e.preventDefault()}
                className="text-slate-400 hover:text-emerald-700"
                aria-label="Red social"
              >
                <Icon className="size-3.5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <div className="flex flex-1 overflow-hidden">
        <BrandPanel />
        <FormPanel />
      </div>
      <LoginFooter />
    </div>
  );
}
