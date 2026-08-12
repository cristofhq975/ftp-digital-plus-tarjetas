'use client';

import { useState, useMemo, type FormEvent, type ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAppStore } from '@/lib/store';
import { FTPLogo } from '@/components/ftp-logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { PLANS, PLAN_ORDER } from '@/lib/plans';
import type { PlanType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  CreditCard,
  Lock,
  Check,
  ArrowLeft,
  ArrowRight,
  Shield,
  ShieldCheck,
  Calendar,
  Building2,
  Wallet,
  CheckCircle2,
  Loader2,
  Sparkles,
  Tag,
  Upload,
  PartyPopper,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

type PaymentMethod = 'tarjeta' | 'paypal' | 'transferencia';
type Step = 'plan' | 'pago' | 'confirmacion';

const PROMO_CODES: Record<string, number> = {
  FTP10: 0.1,
  BIENVENIDA: 0.2,
};

const IVA_RATE = 0.16;

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: typeof CreditCard; hint: string }[] = [
  { id: 'tarjeta', label: 'Tarjeta', icon: CreditCard, hint: 'Visa, Mastercard, Amex' },
  { id: 'paypal', label: 'PayPal', icon: Wallet, hint: 'Cuenta PayPal' },
  { id: 'transferencia', label: 'Transferencia', icon: Building2, hint: 'SPEI / CLABE' },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

type CardBrand = 'visa' | 'mastercard' | 'amex' | 'desconocida';

function detectBrand(rawNumber: string): CardBrand {
  const n = rawNumber.replace(/\s+/g, '');
  if (/^4/.test(n)) return 'visa';
  if (/^3[47]/.test(n)) return 'amex';
  if (/^(5[1-5]|2[2-7])/.test(n)) return 'mastercard';
  return 'desconocida';
}

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function formatCvc(value: string): string {
  return value.replace(/\D/g, '').slice(0, 4);
}

function currency(n: number): string {
  return n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* ------------------------------------------------------------------ */
/*  Validation schemas                                                 */
/* ------------------------------------------------------------------ */

const cardSchema = z.object({
  cardNumber: z
    .string()
    .min(1, 'El número de tarjeta es obligatorio')
    .refine(v => v.replace(/\s+/g, '').length >= 13, 'Número de tarjeta incompleto')
    .refine(v => v.replace(/\s+/g, '').length <= 16, 'Máximo 16 dígitos'),
  expiry: z
    .string()
    .min(1, 'Fecha requerida')
    .regex(/^\d{2}\/\d{2}$/, 'Formato MM/YY')
    .refine(v => {
      const [mm, yy] = v.split('/').map(Number);
      if (mm < 1 || mm > 12) return false;
      const now = new Date();
      const currentYear = now.getFullYear() % 100;
      const currentMonth = now.getMonth() + 1;
      if (yy < currentYear) return false;
      if (yy === currentYear && mm < currentMonth) return false;
      return true;
    }, 'Tarjeta vencida'),
  cvc: z
    .string()
    .min(3, 'CVC inválido')
    .max(4, 'CVC inválido'),
  nameOnCard: z
    .string()
    .min(3, 'El nombre es demasiado corto')
    .max(60, 'El nombre es demasiado largo'),
  email: z
    .string()
    .min(1, 'Email requerido')
    .email('Email inválido'),
});

const paypalSchema = z.object({
  email: z.string().min(1, 'Email requerido').email('Email inválido'),
});

const transferSchema = z.object({
  holderName: z.string().min(3, 'Nombre del titular requerido'),
});

type CardFormValues = z.infer<typeof cardSchema>;
type PaypalFormValues = z.infer<typeof paypalSchema>;
type TransferFormValues = z.infer<typeof transferSchema>;

/* ------------------------------------------------------------------ */
/*  Header                                                             */
/* ------------------------------------------------------------------ */

function CheckoutHeader({ onBack }: { onBack: () => void }) {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 transition-opacity hover:opacity-90"
          aria-label="Volver"
        >
          <FTPLogo variant="full" className="h-9 w-auto" />
        </button>
        <div className="flex items-center gap-2">
          <ThemeToggle className="text-slate-600 hover:bg-emerald-50 hover:text-emerald-700" />
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
          >
            <ArrowLeft className="mr-1 size-4" />
            Volver
          </Button>
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*  Step indicator                                                     */
/* ------------------------------------------------------------------ */

function StepIndicator({ current }: { current: Step }) {
  const steps: { id: Step; label: string; n: number }[] = [
    { id: 'plan', label: 'Plan', n: 1 },
    { id: 'pago', label: 'Pago', n: 2 },
    { id: 'confirmacion', label: 'Confirmación', n: 3 },
  ];
  const currentIndex = steps.findIndex(s => s.id === current);

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2">
      {steps.map((s, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <div key={s.id} className="flex items-center gap-1 sm:gap-2">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'flex size-8 items-center justify-center rounded-full text-sm font-semibold transition-all sm:size-9',
                  done && 'bg-emerald-600 text-white',
                  active && 'bg-gradient-to-br from-emerald-600 to-emerald-500 text-white ring-4 ring-emerald-100',
                  !done && !active && 'bg-slate-100 text-slate-500',
                )}
              >
                {done ? <Check className="size-4" /> : s.n}
              </div>
              <span
                className={cn(
                  'hidden text-sm font-medium sm:inline',
                  active ? 'text-emerald-700' : done ? 'text-slate-700' : 'text-slate-400',
                )}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  'h-0.5 w-6 rounded-full sm:w-12',
                  i < currentIndex ? 'bg-emerald-500' : 'bg-slate-200',
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Plan selection screen                                              */
/* ------------------------------------------------------------------ */

function PlanSelectionScreen({ onPick }: { onPick: (plan: PlanType) => void }) {
  const paidPlans = PLAN_ORDER.filter(id => id !== 'gratis');

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-2xl text-center"
      >
        <Badge className="border-amber-200 bg-amber-50 text-amber-700">
          <Sparkles className="mr-1 size-3.5" />
          Paso 1 · Elige tu plan
        </Badge>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Selecciona el plan a contratar
        </h1>
        <p className="mt-3 text-slate-600">
          Elige el plan que deseas y continúa al pago seguro. Podrás activar tu
          plan de inmediato tras completar la transacción.
        </p>
      </motion.div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {paidPlans.map((planId, idx) => {
          const plan = PLANS[planId];
          const isHighlight = plan.highlight;
          return (
            <motion.div
              key={planId}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
            >
              <Card
                className={cn(
                  'relative h-full transition-all duration-300 hover:-translate-y-1',
                  isHighlight
                    ? 'border-emerald-400 shadow-xl shadow-emerald-100 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:shadow-lg hover:shadow-slate-100',
                )}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="border-0 bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-1 text-xs font-semibold text-amber-950 shadow-md">
                      {plan.badge}
                    </Badge>
                  </div>
                )}
                <CardContent className="flex h-full flex-col gap-5 pt-5">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                    <p className="text-sm text-slate-500">{plan.description}</p>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-extrabold text-slate-900">${plan.price}</span>
                    <span className="text-sm text-slate-500">MXN / {plan.period}</span>
                  </div>
                  <ul className="flex flex-col gap-2 text-sm">
                    {plan.features.slice(0, 6).map(f => (
                      <li key={f.name} className="flex items-start gap-2">
                        <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                        <span className="text-slate-700">{f.name}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={() => onPick(planId)}
                    className={cn(
                      'mt-auto w-full',
                      isHighlight
                        ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-700 hover:to-emerald-600'
                        : 'bg-slate-900 text-white hover:bg-slate-800',
                    )}
                  >
                    Elegir este plan
                    <ArrowRight className="ml-1 size-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Card brand icon                                                    */
/* ------------------------------------------------------------------ */

function BrandBadge({ brand }: { brand: CardBrand }) {
  if (brand === 'desconocida') return null;
  const map: Record<Exclude<CardBrand, 'desconocida'>, { label: string; cls: string }> = {
    visa: { label: 'VISA', cls: 'bg-slate-800 text-white' },
    mastercard: { label: 'MC', cls: 'bg-amber-500 text-white' },
    amex: { label: 'AMEX', cls: 'bg-emerald-600 text-white' },
  };
  const { label, cls } = map[brand];
  return (
    <span
      className={cn(
        'rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wide',
        cls,
      )}
    >
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Card form                                                          */
/* ------------------------------------------------------------------ */

function CardForm({
  register,
  errors,
  cardNumber,
  brand,
  onCardNumber,
  expiry,
  cvc,
  onExpiry,
  onCvc,
  saveCard,
  setSaveCard,
  emailDefault,
}: {
  register: ReturnType<typeof useForm<CardFormValues>>['register'];
  errors: ReturnType<typeof useForm<CardFormValues>>['formState']['errors'];
  cardNumber: string;
  brand: CardBrand;
  onCardNumber: (e: ChangeEvent<HTMLInputElement>) => void;
  expiry: string;
  cvc: string;
  onExpiry: (e: ChangeEvent<HTMLInputElement>) => void;
  onCvc: (e: ChangeEvent<HTMLInputElement>) => void;
  saveCard: boolean;
  setSaveCard: (v: boolean) => void;
  emailDefault: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      className="space-y-4"
    >
      <div className="space-y-1.5">
        <Label htmlFor="cardNumber" className="text-sm font-medium text-slate-700">
          Número de tarjeta
        </Label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <CreditCard className="size-4" />
          </span>
          <Input
            id="cardNumber"
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="1234 5678 9012 3456"
            value={cardNumber}
            {...register('cardNumber')}
            onChange={onCardNumber}
            className={cn(
              'pl-9 pr-16',
              errors.cardNumber && 'border-red-400 focus-visible:ring-red-300',
            )}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            <BrandBadge brand={brand} />
          </span>
        </div>
        {errors.cardNumber && (
          <p className="text-xs text-red-600">{errors.cardNumber.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="expiry" className="text-sm font-medium text-slate-700">
            Vencimiento
          </Label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Calendar className="size-4" />
            </span>
            <Input
              id="expiry"
              inputMode="numeric"
              autoComplete="cc-exp"
              placeholder="MM/YY"
              value={expiry}
              {...register('expiry')}
              onChange={onExpiry}
              className={cn(
                'pl-9',
                errors.expiry && 'border-red-400 focus-visible:ring-red-300',
              )}
            />
          </div>
          {errors.expiry && (
            <p className="text-xs text-red-600">{errors.expiry.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cvc" className="text-sm font-medium text-slate-700">
            CVC
          </Label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Lock className="size-4" />
            </span>
            <Input
              id="cvc"
              inputMode="numeric"
              autoComplete="cc-csc"
              placeholder="123"
              value={cvc}
              {...register('cvc')}
              onChange={onCvc}
              className={cn(
                'pl-9',
                errors.cvc && 'border-red-400 focus-visible:ring-red-300',
              )}
            />
          </div>
          {errors.cvc && (
            <p className="text-xs text-red-600">{errors.cvc.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="nameOnCard" className="text-sm font-medium text-slate-700">
          Nombre como aparece en la tarjeta
        </Label>
        <Input
          id="nameOnCard"
          autoComplete="cc-name"
          placeholder="JUAN PÉREZ LÓPEZ"
          {...register('nameOnCard')}
          className={cn(
            errors.nameOnCard && 'border-red-400 focus-visible:ring-red-300',
          )}
        />
        {errors.nameOnCard && (
          <p className="text-xs text-red-600">{errors.nameOnCard.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-sm font-medium text-slate-700">
          Correo electrónico (recibo)
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          defaultValue={emailDefault}
          placeholder="tucorreo@ejemplo.com"
          {...register('email')}
          className={cn(
            errors.email && 'border-red-400 focus-visible:ring-red-300',
          )}
        />
        {errors.email && (
          <p className="text-xs text-red-600">{errors.email.message}</p>
        )}
      </div>

      <label
        htmlFor="saveCard"
        className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50/60 p-3 text-sm text-slate-700 transition-colors hover:bg-slate-50"
      >
        <Checkbox
          id="saveCard"
          checked={saveCard}
          onCheckedChange={(v) => setSaveCard(v === true)}
        />
        <span className="font-medium">Guardar tarjeta para futuros pagos</span>
      </label>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  PayPal form                                                        */
/* ------------------------------------------------------------------ */

function PayPalForm({
  register,
  errors,
  emailDefault,
}: {
  register: ReturnType<typeof useForm<PaypalFormValues>>['register'];
  errors: ReturnType<typeof useForm<PaypalFormValues>>['formState']['errors'];
  emailDefault: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      className="space-y-4"
    >
      <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-6 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-500 text-white">
          <Wallet className="size-7" />
        </div>
        <p className="text-sm text-slate-600">
          Serás redirigido a <span className="font-semibold text-slate-900">PayPal</span> para completar el pago de forma segura.
        </p>
        <Badge variant="secondary" className="border-emerald-200 bg-emerald-50 text-emerald-700">
          <Shield className="mr-1 size-3" /> Protegido por PayPal
        </Badge>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ppEmail" className="text-sm font-medium text-slate-700">
          Correo electrónico de PayPal
        </Label>
        <Input
          id="ppEmail"
          type="email"
          autoComplete="email"
          defaultValue={emailDefault}
          placeholder="tucorreo@paypal.com"
          {...register('email')}
          className={cn(
            errors.email && 'border-red-400 focus-visible:ring-red-300',
          )}
        />
        {errors.email && (
          <p className="text-xs text-red-600">{errors.email.message}</p>
        )}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Transferencia form                                                 */
/* ------------------------------------------------------------------ */

const BANK_DETAILS = {
  bank: 'Banco FTP Fiduciario',
  clabe: '012 345 67890 1234567',
  holder: 'FTP Digital Plus S.A. de C.V.',
  reference: 'FTP-2024-XXXX',
};

function TransferenciaForm({
  register,
  errors,
}: {
  register: ReturnType<typeof useForm<TransferFormValues>>['register'];
  errors: ReturnType<typeof useForm<TransferFormValues>>['formState']['errors'];
}) {
  const copyToClipboard = (text: string, label: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(
        () => toast.success(`${label} copiado al portapapeles`),
        () => toast.error('No se pudo copiar'),
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      className="space-y-4"
    >
      <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 text-sm text-amber-900">
        <p className="font-semibold">Instrucciones de transferencia SPEI</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-amber-800">
          <li>Realiza la transferencia a la cuenta indicada abajo.</li>
          <li>Guarda el comprobante PDF o imagen.</li>
          <li>Sube el comprobante usando el botón.</li>
          <li>Tu plan se activará en un máximo de 24 horas hábiles tras verificación.</li>
        </ol>
      </div>

      <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
        <Row label="Banco" value={BANK_DETAILS.bank} onCopy={() => copyToClipboard(BANK_DETAILS.bank, 'Banco')} />
        <Separator />
        <Row label="CLABE interbancaria" value={BANK_DETAILS.clabe} onCopy={() => copyToClipboard(BANK_DETAILS.clabe.replace(/\s+/g, ''), 'CLABE')} mono />
        <Separator />
        <Row label="Titular de la cuenta" value={BANK_DETAILS.holder} onCopy={() => copyToClipboard(BANK_DETAILS.holder, 'Titular')} />
        <Separator />
        <Row label="Referencia" value={BANK_DETAILS.reference} onCopy={() => copyToClipboard(BANK_DETAILS.reference, 'Referencia')} mono />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="holderName" className="text-sm font-medium text-slate-700">
          Nombre del titular que transfiere
        </Label>
        <Input
          id="holderName"
          placeholder="Tu nombre completo"
          {...register('holderName')}
          className={cn(
            errors.holderName && 'border-red-400 focus-visible:ring-red-300',
          )}
        />
        {errors.holderName && (
          <p className="text-xs text-red-600">{errors.holderName.message}</p>
        )}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={() => toast.success('Comprobante recibido (demo)', { description: 'Tu pago será verificado en un máximo de 24h.' })}
        className="w-full border-dashed"
      >
        <Upload className="mr-2 size-4" />
        Subir comprobante
      </Button>
    </motion.div>
  );
}

function Row({ label, value, onCopy, mono }: { label: string; value: string; onCopy: () => void; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <div>
        <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
        <p className={cn('text-sm font-semibold text-slate-900', mono && 'font-mono tracking-tight')}>{value}</p>
      </div>
      <Button type="button" variant="ghost" size="sm" onClick={onCopy} className="text-emerald-700 hover:bg-emerald-50">
        Copiar
      </Button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Security badges                                                    */
/* ------------------------------------------------------------------ */

function SecurityBadges() {
  const items = [
    { icon: Lock, label: 'Encriptación SSL 256-bit' },
    { icon: ShieldCheck, label: 'PCI DSS Compliant' },
    { icon: Check, label: 'Pago seguro' },
  ];
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-xs text-slate-600">
      {items.map(it => (
        <span key={it.label} className="inline-flex items-center gap-1.5">
          <it.icon className="size-3.5 text-emerald-600" />
          {it.label}
        </span>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Order summary                                                      */
/* ------------------------------------------------------------------ */

function OrderSummary({
  plan,
  promo,
  promoApplied,
  onApplyPromo,
  onRemovePromo,
}: {
  plan: PlanType;
  promo: { code: string; percent: number } | null;
  promoApplied: boolean;
  onApplyPromo: (code: string) => void;
  onRemovePromo: () => void;
}) {
  const config = PLANS[plan];
  const subtotal = config.price;
  const discount = promo ? subtotal * promo.percent : 0;
  const base = subtotal - discount;
  const iva = base * IVA_RATE;
  const total = base + iva;

  const [code, setCode] = useState('');

  const handleApply = () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      toast.error('Ingresa un código de descuento');
      return;
    }
    onApplyPromo(trimmed);
    setCode('');
  };

  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm">
      <CardHeader className="border-b border-slate-100 bg-gradient-to-br from-emerald-50 to-white">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-lg text-slate-900">Resumen del pedido</CardTitle>
            <CardDescription className="text-slate-500">Plan {config.name}</CardDescription>
          </div>
          {config.badge && (
            <Badge className="bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950">
              {config.badge}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-5">
        <div>
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-slate-600">Plan {config.name}</span>
            <span className="text-sm font-semibold text-slate-900">
              ${currency(subtotal)} MXN
            </span>
          </div>
          <p className="text-xs text-slate-500">{config.period}</p>
        </div>

        {/* Promo code */}
        {promo && promoApplied ? (
          <div className="flex items-center justify-between gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm">
            <span className="inline-flex items-center gap-1.5 text-emerald-700">
              <Tag className="size-3.5" />
              Código <strong className="font-mono">{promo.code}</strong> ({Math.round(promo.percent * 100)}% off)
            </span>
            <button
              onClick={onRemovePromo}
              className="text-xs font-medium text-emerald-700 underline-offset-2 hover:underline"
            >
              Quitar
            </button>
          </div>
        ) : (
          <div className="space-y-1.5">
            <Label htmlFor="promo" className="text-xs font-medium text-slate-600">
              Código de descuento
            </Label>
            <div className="flex gap-2">
              <Input
                id="promo"
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="Ej. FTP10"
                className="h-9 uppercase"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleApply();
                  }
                }}
              />
              <Button type="button" size="sm" variant="secondary" onClick={handleApply} className="bg-emerald-600 text-white hover:bg-emerald-700">
                Aplicar
              </Button>
            </div>
            <p className="text-[11px] text-slate-400">
              Prueba: <span className="font-mono">FTP10</span> (10%) o <span className="font-mono">BIENVENIDA</span> (20%)
            </p>
          </div>
        )}

        <Separator />

        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Subtotal</span>
            <span className="font-medium text-slate-900">${currency(subtotal)} MXN</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Descuento ({Math.round((discount / subtotal) * 100)}%)</span>
              <span className="font-medium">-${currency(discount)} MXN</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-slate-600">IVA (16%)</span>
            <span className="font-medium text-slate-900">${currency(iva)} MXN</span>
          </div>
        </div>

        <Separator />

        <div className="flex items-baseline justify-between">
          <span className="text-base font-semibold text-slate-900">Total</span>
          <span className="text-2xl font-extrabold text-emerald-700">
            ${currency(total)} <span className="text-sm font-medium text-slate-500">MXN</span>
          </span>
        </div>

        <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
          <p className="flex items-start gap-1.5">
            <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />
            Tu plan se activará inmediatamente después del pago.
          </p>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            Incluye
          </p>
          <ul className="max-h-56 space-y-1.5 overflow-y-auto pr-1 text-sm">
            {config.features.filter(f => f.included).slice(0, 12).map(f => (
              <li key={f.name} className="flex items-start gap-2">
                <Check className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />
                <span className="text-slate-700">{f.name}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2 text-xs text-amber-800">
          <ShieldCheck className="size-4 shrink-0 text-amber-600" />
          <span>
            <strong>Garantía de devolución</strong> 7/15 días. Sin preguntas.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Payment layout                                                     */
/* ------------------------------------------------------------------ */

function PaymentLayout({ plan, onBack, onSuccess }: { plan: PlanType; onBack: () => void; onSuccess: () => void }) {
  const currentUser = useAppStore(s => s.currentUser);
  const emailDefault = currentUser?.email ?? '';

  const [method, setMethod] = useState<PaymentMethod>('tarjeta');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [saveCard, setSaveCard] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [promo, setPromo] = useState<{ code: string; percent: number } | null>(null);
  const [promoApplied, setPromoApplied] = useState(false);

  const cardForm = useForm<CardFormValues>({
    resolver: zodResolver(cardSchema),
    mode: 'onTouched',
    defaultValues: {
      cardNumber: '',
      expiry: '',
      cvc: '',
      nameOnCard: currentUser?.name ?? '',
      email: emailDefault,
    },
  });

  const paypalForm = useForm<PaypalFormValues>({
    resolver: zodResolver(paypalSchema),
    mode: 'onTouched',
    defaultValues: { email: emailDefault },
  });

  const transferForm = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema),
    mode: 'onTouched',
    defaultValues: { holderName: currentUser?.name ?? '' },
  });

  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const brand = useMemo<CardBrand>(() => detectBrand(cardNumber), [cardNumber]);

  const onCardNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
    cardForm.setValue('cardNumber', formatted, { shouldValidate: true });
  };
  const onExpiryChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiry(e.target.value);
    setExpiry(formatted);
    cardForm.setValue('expiry', formatted, { shouldValidate: true });
  };
  const onCvcChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCvc(e.target.value);
    setCvc(formatted);
    cardForm.setValue('cvc', formatted, { shouldValidate: true });
  };

  const config = PLANS[plan];
  const subtotal = config.price;
  const discount = promo ? subtotal * promo.percent : 0;
  const base = subtotal - discount;
  const iva = base * IVA_RATE;
  const total = base + iva;

  const handleApplyPromo = (code: string) => {
    const pct = PROMO_CODES[code];
    if (!pct) {
      toast.error('Código de descuento inválido', { description: `Intenta con FTP10 o BIENVENIDA` });
      return;
    }
    setPromo({ code, percent: pct });
    setPromoApplied(true);
    toast.success(`Código ${code} aplicado`, { description: `${Math.round(pct * 100)}% de descuento` });
  };
  const handleRemovePromo = () => {
    setPromo(null);
    setPromoApplied(false);
    toast('Código de descuento removido');
  };

  const isFormValid = useMemo(() => {
    if (!acceptTerms) return false;
    if (method === 'tarjeta') return cardForm.formState.isValid;
    if (method === 'paypal') return paypalForm.formState.isValid;
    return transferForm.formState.isValid;
  }, [acceptTerms, method, cardForm.formState.isValid, paypalForm.formState.isValid, transferForm.formState.isValid]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!acceptTerms) {
      toast.error('Debes aceptar los Términos y Condiciones');
      return;
    }

    let valid = false;
    if (method === 'tarjeta') {
      valid = await cardForm.trigger();
    } else if (method === 'paypal') {
      valid = await paypalForm.trigger();
    } else {
      valid = await transferForm.trigger();
    }
    if (!valid) {
      toast.error('Revisa los campos del formulario');
      return;
    }

    setProcessing(true);
    const methodLabel = method === 'tarjeta' ? 'tarjeta' : method === 'paypal' ? 'PayPal' : 'transferencia';
    toast.loading(`Procesando pago vía ${methodLabel}...`, { id: 'pay-toast' });

    await new Promise(resolve => setTimeout(resolve, 2000));

    toast.dismiss('pay-toast');
    toast.success('¡Pago completado!', {
      description: `Plan ${config.name} activado correctamente.`,
    });
    setProcessing(false);
    onSuccess();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col items-center gap-4">
        <StepIndicator current="pago" />
      </div>

      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Left: payment form (60%) */}
        <div className="lg:col-span-3">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-lg text-slate-900">Información de pago</CardTitle>
              <CardDescription>Elige tu método de pago preferido y completa los datos.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 p-5 sm:p-6">
              <Tabs value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
                <TabsList className="grid w-full grid-cols-3">
                  {PAYMENT_METHODS.map(m => (
                    <TabsTrigger key={m.id} value={m.id} className="flex flex-col gap-1 py-2">
                      <m.icon className="size-4" />
                      <span className="text-xs">{m.label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="tarjeta" className="mt-5">
                  <CardForm
                    register={cardForm.register}
                    errors={cardForm.formState.errors}
                    cardNumber={cardNumber}
                    brand={brand}
                    onCardNumber={onCardNumberChange}
                    expiry={expiry}
                    cvc={cvc}
                    onExpiry={onExpiryChange}
                    onCvc={onCvcChange}
                    saveCard={saveCard}
                    setSaveCard={setSaveCard}
                    emailDefault={emailDefault}
                  />
                </TabsContent>

                <TabsContent value="paypal" className="mt-5">
                  <PayPalForm
                    register={paypalForm.register}
                    errors={paypalForm.formState.errors}
                    emailDefault={emailDefault}
                  />
                </TabsContent>

                <TabsContent value="transferencia" className="mt-5">
                  <TransferenciaForm
                    register={transferForm.register}
                    errors={transferForm.formState.errors}
                  />
                </TabsContent>
              </Tabs>

              <SecurityBadges />

              <label
                htmlFor="terms"
                className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-slate-200 bg-slate-50/60 p-3 text-sm text-slate-700 transition-colors hover:bg-slate-50"
              >
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={(v) => setAcceptTerms(v === true)}
                  className="mt-0.5"
                />
                <span className="leading-relaxed">
                  Acepto los{' '}
                  <button type="button" onClick={onBack} className="font-medium text-emerald-700 underline-offset-2 hover:underline">
                    Términos y Condiciones
                  </button>{' '}
                  y la{' '}
                  <button type="button" onClick={onBack} className="font-medium text-emerald-700 underline-offset-2 hover:underline">
                    Política de Privacidad
                  </button>
                  .
                </span>
              </label>

              <Button
                type="submit"
                disabled={!isFormValid || processing}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-md hover:from-emerald-700 hover:to-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                size="lg"
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Procesando pago...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 size-4" />
                    Pagar ${currency(total)} MXN
                  </>
                )}
              </Button>

              <p className="text-center text-[11px] text-slate-400">
                Al confirmar el pago, tu plan se activará de inmediato. Esta es una transacción simulada con fines demostrativos.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right: order summary (40%) */}
        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-24">
            <OrderSummary
              plan={plan}
              promo={promo}
              promoApplied={promoApplied}
              onApplyPromo={handleApplyPromo}
              onRemovePromo={handleRemovePromo}
            />
          </div>
        </div>
      </form>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Success screen                                                     */
/* ------------------------------------------------------------------ */

function SuccessScreen({ plan, onGoDashboard, onGoEditor }: { plan: PlanType; onGoDashboard: () => void; onGoEditor: () => void }) {
  const config = PLANS[plan];
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-4 py-12 sm:px-6">
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        className="relative mb-6"
      >
        <div className="absolute inset-0 -z-10 animate-pulse rounded-full bg-emerald-200/60 blur-2xl" />
        <div className="flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-xl shadow-emerald-200">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 14, delay: 0.2 }}
          >
            <Check className="size-12" strokeWidth={3} />
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center"
      >
        <Badge className="border-amber-200 bg-amber-50 text-amber-700">
          <PartyPopper className="mr-1 size-3.5" />
          Paso 3 · Confirmación
        </Badge>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          ¡Pago completado!
        </h1>
        <p className="mt-3 text-slate-600">
          Tu plan <strong className="text-emerald-700">{config.name}</strong> se ha activado correctamente. Disfruta de todas las funciones incluidas.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="mt-8 w-full"
      >
        <Card className="border-emerald-200 shadow-sm">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-br from-emerald-50 to-white">
            <CardTitle className="text-base text-slate-900">Detalles de tu plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Plan</span>
              <span className="font-semibold text-slate-900">{config.name}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Precio</span>
              <span className="font-semibold text-slate-900">${config.price} MXN / {config.period}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Tarjetas virtuales</span>
              <span className="font-semibold text-slate-900">{config.maxCards}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Almacenamiento</span>
              <span className="font-semibold text-slate-900">{config.storage} MB</span>
            </div>
            <Separator />
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Siguientes pasos</p>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                  <span>Explora tu panel de control y las nuevas secciones disponibles.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                  <span>Crea tu primera tarjeta digital con todas las funciones premium.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                  <span>Personaliza el código QR y comparte tu tarjeta con clientes.</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-6 flex w-full flex-col gap-3 sm:flex-row"
      >
        <Button
          onClick={onGoDashboard}
          variant="outline"
          className="flex-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
          size="lg"
        >
          <ArrowLeft className="mr-2 size-4" />
          Ir a mi panel
        </Button>
        <Button
          onClick={onGoEditor}
          className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-md hover:from-emerald-700 hover:to-emerald-600"
          size="lg"
        >
          Crear mi primera tarjeta
          <ArrowRight className="ml-2 size-4" />
        </Button>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export function CheckoutPage() {
  const navigate = useAppStore(s => s.navigate);
  const selectedPlan = useAppStore(s => s.selectedPlanForCheckout);
  const setSelectedPlanForCheckout = useAppStore(s => s.setSelectedPlanForCheckout);
  const upgradePlan = useAppStore(s => s.upgradePlan);

  const [success, setSuccess] = useState(false);
  const [pickedPlan, setPickedPlan] = useState<PlanType | null>(selectedPlan);

  const handlePickPlan = (plan: PlanType) => {
    setSelectedPlanForCheckout(plan);
    setPickedPlan(plan);
    toast.success(`Plan ${PLANS[plan].name} seleccionado`, {
      description: 'Continúa con el pago seguro.',
    });
  };

  const handleSuccess = () => {
    if (pickedPlan) {
      upgradePlan(pickedPlan);
    }
    setSuccess(true);
  };

  const handleBack = () => {
    if (success) {
      setSuccess(false);
      return;
    }
    navigate('pricing');
  };

  const activePlan = pickedPlan ?? selectedPlan;

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 to-white">
      <CheckoutHeader onBack={handleBack} />

      <main className="flex-1">
        <AnimatePresence mode="wait">
          {success && activePlan ? (
            <motion.div
              key="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <SuccessScreen
                plan={activePlan}
                onGoDashboard={() => {
                  setSelectedPlanForCheckout(null);
                  navigate('dashboard');
                }}
                onGoEditor={() => {
                  setSelectedPlanForCheckout(null);
                  navigate('editor');
                }}
              />
            </motion.div>
          ) : !activePlan ? (
            <motion.div
              key="select"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <PlanSelectionScreen onPick={handlePickPlan} />
            </motion.div>
          ) : (
            <motion.div
              key="pay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <PaymentLayout
                plan={activePlan}
                onBack={() => navigate('pricing')}
                onSuccess={handleSuccess}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="mt-auto border-t border-slate-200/70 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-slate-500 sm:flex-row sm:px-6 lg:px-8">
          <p className="inline-flex items-center gap-1.5">
            <Lock className="size-3 text-emerald-600" />
            Pagos procesados de forma segura · Encriptación SSL 256-bit
          </p>
          <p>© {new Date().getFullYear()} FTP Digital Plus · Todos los derechos reservados</p>
        </div>
      </footer>
    </div>
  );
}
