'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { FTPLogo } from '@/components/ftp-logo';
import { PLANS, PLAN_ORDER } from '@/lib/plans';
import type { PlanType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  Sparkles,
  Star,
  HelpCircle,
  Menu,
  Phone,
  Mail,
  Globe,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  FAQ                                                                */
/* ------------------------------------------------------------------ */

const FAQS = [
  {
    question: '¿Puedo cambiar de plan en cualquier momento?',
    answer:
      'Sí. Puedes actualizar o cambiar tu plan cuando lo desees. Al mejorar de plan, se aplican las nuevas funciones de inmediato. Si cambias a un plan inferior, los cambios surten efecto al final del periodo contratado.',
  },
  {
    question: '¿El código QR del plan gratis realmente expira?',
    answer:
      'Sí. En el plan Gratis el código QR tiene una vigencia de 7 días a partir de su generación, después de los cuales necesitarás regenerarlo. En los planes Básico y Pro el QR es permanente y nunca expira.',
  },
  {
    question: '¿Puedo tener múltiples tarjetas digitales?',
    answer:
      'El plan Gratis incluye 1 tarjeta, el plan Básico hasta 2 tarjetas y el plan Pro hasta 5 tarjetas. Cada tarjeta puede tener su propia plantilla, colores, servicios y configuración independiente.',
  },
  {
    question: '¿Hay algún costo oculto o cobro adicional?',
    answer:
      'No. El precio que ves es el precio que pagas. El plan Básico es un pago único de $199 MXN sin renovaciones. El plan Pro es $500 MXN por año. No hay comisiones por transacción ni cargos sorpresa.',
  },
  {
    question: '¿Puedo cancelar mi suscripción cuando quiera?',
    answer:
      'Por supuesto. El plan Gratis no requiere cancelación. El plan Básico es pago único, así que no hay nada que cancelar. El plan Pro puede cancelarse en cualquier momento y seguirás teniendo acceso hasta el final del periodo anual pagado.',
  },
];

/* ------------------------------------------------------------------ */
/*  Motion helper                                                      */
/* ------------------------------------------------------------------ */

function fadeUpProps(delay = 0) {
  return {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-80px' },
    transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
  };
}

/* ------------------------------------------------------------------ */
/*  Header (simplified)                                                */
/* ------------------------------------------------------------------ */

function PricingHeader() {
  const navigate = useAppStore(s => s.navigate);
  return (
    <header className="sticky top-0 z-50 w-full border-b border-emerald-100/60 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('landing')}
          className="flex items-center gap-2 transition-opacity hover:opacity-90"
          aria-label="Volver al inicio"
        >
          <FTPLogo variant="full" className="h-9 w-auto" />
        </button>

        <div className="hidden items-center gap-2 md:flex">
          <Button
            variant="ghost"
            onClick={() => navigate('landing')}
            className="text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
          >
            <ArrowLeft className="mr-1 size-4" />
            Inicio
          </Button>
          <Button
            onClick={() => navigate('login')}
            className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-sm hover:from-emerald-700 hover:to-emerald-600"
          >
            Iniciar Sesión
            <ArrowRight className="ml-1 size-4" />
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('landing')}
          className="md:hidden"
          aria-label="Volver al inicio"
        >
          <Menu className="size-5" />
        </Button>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*  Page hero                                                          */
/* ------------------------------------------------------------------ */

function PricingHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-800 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 size-96 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="absolute -bottom-32 right-0 size-[28rem] rounded-full bg-emerald-400/30 blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
        <motion.div {...fadeUpProps()} className="mx-auto flex max-w-2xl flex-col items-center gap-4">
          <Badge className="border-amber-300/40 bg-amber-400/15 text-amber-100 backdrop-blur-sm">
            <Sparkles className="mr-1 size-3.5" />
            Planes transparentes
          </Badge>
          <h1 className="text-balance text-4xl font-extrabold tracking-tight sm:text-5xl">
            Planes que se adaptan a ti
          </h1>
          <p className="max-w-xl text-pretty text-lg text-emerald-50/90">
            Sin costos ocultos. Sin sorpresas. Empieza gratis y mejora cuando lo
            necesites. Diseñado para profesionales, negocios y emprendedores en México.
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-emerald-50/80">
            <span>✓ Pago seguro</span>
            <span>✓ Cancela cuando quieras</span>
            <span>✓ Soporte en español</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Plan cards                                                         */
/* ------------------------------------------------------------------ */

function PlanCards() {
  const navigate = useAppStore(s => s.navigate);
  const currentUser = useAppStore(s => s.currentUser);
  const setSelectedPlanForCheckout = useAppStore(s => s.setSelectedPlanForCheckout);

  const handleChoose = (planId: PlanType) => {
    // Gratis = registro directo (no requiere checkout)
    if (planId === 'gratis') {
      navigate('login');
      return;
    }
    setSelectedPlanForCheckout(planId);
    if (currentUser) {
      navigate('checkout');
    } else {
      navigate('login');
    }
  };

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {PLAN_ORDER.map((planId: PlanType, idx) => {
            const plan = PLANS[planId];
            const isHighlight = plan.highlight;
            return (
              <motion.div key={planId} {...fadeUpProps(idx * 0.1)}>
                <Card
                  className={cn(
                    'relative h-full transition-all duration-300 hover:-translate-y-1',
                    isHighlight
                      ? 'border-emerald-400 shadow-xl shadow-emerald-100 ring-2 ring-emerald-500/20 lg:scale-105'
                      : 'border-slate-200 hover:shadow-lg hover:shadow-slate-100',
                  )}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge
                        className={cn(
                          'border-0 px-3 py-1 text-xs font-semibold shadow-md',
                          isHighlight
                            ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950'
                            : 'bg-slate-800 text-white',
                        )}
                      >
                        {plan.badge}
                      </Badge>
                    </div>
                  )}

                  <CardContent className="flex h-full flex-col gap-5 pt-4">
                    <div className="flex flex-col gap-1">
                      <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                      <p className="text-sm text-slate-500">{plan.description}</p>
                    </div>

                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl font-extrabold text-slate-900">
                        ${plan.price}
                      </span>
                      <span className="text-sm text-slate-500">
                        MXN / {plan.period}
                      </span>
                    </div>

                    <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                      <p className="flex items-center gap-2">
                        <Star className="size-4 text-amber-500" />
                        {plan.maxCards} {plan.maxCards === 1 ? 'tarjeta' : 'tarjetas'} virtual{plan.maxCards === 1 ? '' : 'es'}
                      </p>
                      <p className="mt-1 flex items-center gap-2">
                        <Star className="size-4 text-amber-500" />
                        {plan.storage} MB de almacenamiento
                      </p>
                    </div>

                    <Button
                      className={cn(
                        'mt-auto w-full',
                        isHighlight
                          ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-700 hover:to-emerald-600'
                          : 'bg-slate-900 text-white hover:bg-slate-800',
                      )}
                      onClick={() => handleChoose(planId)}
                    >
                      Elegir Plan
                      <ArrowRight className="ml-1 size-4" />
                    </Button>

                    <ul className="flex flex-col gap-2 border-t border-slate-100 pt-4 text-sm">
                      {plan.features.slice(0, 7).map(f => (
                        <li key={f.name} className="flex items-start gap-2">
                          {f.included ? (
                            <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                          ) : (
                            <X className="mt-0.5 size-4 shrink-0 text-slate-300" />
                          )}
                          <span className={f.included ? 'text-slate-700' : 'text-slate-400'}>
                            {f.name}
                          </span>
                        </li>
                      ))}
                      <li className="pt-1 text-xs font-medium text-emerald-700">
                        + {Math.max(0, plan.features.length - 7)} funciones más en la tabla de comparación
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Comparison table                                                   */
/* ------------------------------------------------------------------ */

function ComparisonTable() {
  // All plans share the same feature index order in plans.ts
  const featureNames = PLANS.gratis.features.map(f => f.name);

  return (
    <section className="bg-gradient-to-b from-slate-50 to-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeUpProps()} className="mx-auto max-w-2xl text-center">
          <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
            <Sparkles className="mr-1 size-3.5" />
            Comparativa completa
          </Badge>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Compara todas las funciones
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Revisa en detalle todo lo que incluye cada plan antes de decidir.
          </p>
        </motion.div>

        <motion.div {...fadeUpProps(0.1)} className="mt-12">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="ftp-comparison-scroll max-h-[640px] overflow-y-auto">
              <Table className="w-full">
                <TableHeader className="sticky top-0 z-10 bg-white shadow-[0_1px_0_0_#e2e8f0]">
                  <TableRow className="border-b border-slate-200 hover:bg-transparent">
                    <TableHead className="min-w-[220px] py-4 pl-5 pr-2 text-left text-sm font-semibold text-slate-900">
                      Función
                    </TableHead>
                    {PLAN_ORDER.map(planId => {
                      const plan = PLANS[planId];
                      const isHighlight = plan.highlight;
                      return (
                        <TableHead
                          key={planId}
                          className={cn(
                            'min-w-[140px] py-4 text-center',
                            isHighlight && 'bg-emerald-50/70',
                          )}
                        >
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-sm font-bold text-slate-900">
                              {plan.name}
                            </span>
                            <span className="text-xs font-normal text-slate-500">
                              ${plan.price} MXN
                            </span>
                            {isHighlight && (
                              <span className="mt-0.5 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-semibold text-amber-950">
                                Más popular
                              </span>
                            )}
                          </div>
                        </TableHead>
                      );
                    })}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {featureNames.map((featureName, idx) => (
                    <TableRow
                      key={featureName}
                      className={cn(
                        'border-b border-slate-100',
                        idx % 2 === 1 && 'bg-slate-50/40',
                      )}
                    >
                      <TableCell className="py-3 pl-5 pr-2 text-left text-sm font-medium text-slate-700">
                        {featureName}
                      </TableCell>
                      {PLAN_ORDER.map(planId => {
                        const plan = PLANS[planId];
                        // Match by index since all plans share the same order
                        const f = plan.features[idx];
                        const included = f?.included ?? false;
                        const isHighlight = plan.highlight;
                        return (
                          <TableCell
                            key={planId}
                            className={cn(
                              'py-3 text-center',
                              isHighlight && 'bg-emerald-50/40',
                            )}
                          >
                            {included ? (
                              <span className="inline-flex size-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                                <Check className="size-4" />
                              </span>
                            ) : (
                              <span className="inline-flex size-6 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                                <X className="size-3.5" />
                              </span>
                            )}
                            <span className="sr-only">
                              {included ? 'Incluido' : 'No incluido'}
                            </span>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Custom scrollbar styling for the comparison table */}
          <style>{`
            .ftp-comparison-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
            .ftp-comparison-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 9999px; }
            .ftp-comparison-scroll::-webkit-scrollbar-track { background: transparent; }
            .ftp-comparison-scroll { scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent; }
          `}</style>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  FAQ                                                                */
/* ------------------------------------------------------------------ */

function FAQ() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeUpProps()} className="text-center">
          <Badge className="border-amber-200 bg-amber-50 text-amber-700">
            <HelpCircle className="mr-1 size-3.5" />
            Preguntas frecuentes
          </Badge>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Resolvemos tus dudas
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            ¿No encuentras tu respuesta? Escríbenos a hola@ftpdigitalplus.com
          </p>
        </motion.div>

        <motion.div {...fadeUpProps(0.1)} className="mt-10">
          <Card className="border-slate-200 shadow-sm">
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {FAQS.map((faq, idx) => (
                  <AccordionItem key={idx} value={`item-${idx}`}>
                    <AccordionTrigger className="text-left text-base font-semibold text-slate-900 hover:text-emerald-700">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm leading-relaxed text-slate-600">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Final CTA                                                          */
/* ------------------------------------------------------------------ */

function FinalCTA() {
  const navigate = useAppStore(s => s.navigate);
  return (
    <section className="bg-gradient-to-b from-white to-slate-50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          {...fadeUpProps()}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-800 px-6 py-12 text-center shadow-xl shadow-emerald-100/50 sm:px-12"
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-16 -top-16 size-72 rounded-full bg-amber-400/20 blur-3xl" />
            <div className="absolute -bottom-16 -right-16 size-72 rounded-full bg-teal-300/20 blur-3xl" />
          </div>
          <div className="relative flex flex-col items-center gap-5">
            <h2 className="max-w-xl text-balance text-3xl font-bold text-white sm:text-4xl">
              ¿Listo para crear tu tarjeta digital?
            </h2>
            <p className="max-w-lg text-pretty text-emerald-50/90">
              Empieza gratis hoy mismo. Sin tarjeta de crédito, sin
              compromisos.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                onClick={() => navigate('login')}
                className="bg-amber-400 text-amber-950 shadow-lg shadow-amber-500/30 hover:bg-amber-300"
              >
                Crear mi Tarjeta Gratis
                <ArrowRight className="ml-1 size-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('landing')}
                className="border-white/40 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
              >
                <ArrowLeft className="mr-1 size-4" />
                Volver al inicio
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Footer                                                             */
/* ------------------------------------------------------------------ */

function SiteFooter() {
  const navigate = useAppStore(s => s.navigate);
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-4">
          <div className="flex flex-col gap-4">
            <FTPLogo variant="full" className="h-9 w-auto" />
            <p className="max-w-xs text-sm text-slate-600">
              Agencia de Diseño Web y Marketing Digital. Creamos experiencias
              digitales que conectan.
            </p>
            <div className="flex gap-2">
              {[
                { Icon: Facebook, label: 'Facebook' },
                { Icon: Instagram, label: 'Instagram' },
                { Icon: Linkedin, label: 'LinkedIn' },
                { Icon: Twitter, label: 'Twitter' },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  onClick={e => e.preventDefault()}
                  aria-label={label}
                  className="flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">Producto</h3>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm">
              <li>
                <button
                  onClick={() => navigate('landing')}
                  className="text-slate-600 transition-colors hover:text-emerald-700"
                >
                  Inicio
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('pricing')}
                  className="text-slate-600 transition-colors hover:text-emerald-700"
                >
                  Planes
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('login')}
                  className="text-slate-600 transition-colors hover:text-emerald-700"
                >
                  Iniciar Sesión
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">Empresa</h3>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm">
              {['Sobre nosotros', 'Blog', 'Contacto', 'Soporte'].map(label => (
                <li key={label}>
                  <a
                    href="#"
                    onClick={e => e.preventDefault()}
                    className="text-slate-600 transition-colors hover:text-emerald-700"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">Contacto</h3>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <Mail className="size-4 text-emerald-600" />
                hola@ftpdigitalplus.com
              </li>
              <li className="flex items-center gap-2">
                <Phone className="size-4 text-emerald-600" />
                +52 55 1234 5678
              </li>
              <li className="flex items-center gap-2">
                <Globe className="size-4 text-emerald-600" />
                Ciudad de México, México
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 sm:flex-row">
          <p className="text-sm text-slate-500">
            © {year} FTP Digital Plus — Agencia de Diseño Web y Marketing Digital.
          </p>
          <div className="flex gap-6 text-sm text-slate-500">
            <a href="#" onClick={e => e.preventDefault()} className="hover:text-emerald-700">
              Privacidad
            </a>
            <a href="#" onClick={e => e.preventDefault()} className="hover:text-emerald-700">
              Términos
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <PricingHeader />
      <main className="flex-1">
        <PricingHero />
        <PlanCards />
        <ComparisonTable />
        <FAQ />
        <FinalCTA />
      </main>
      <SiteFooter />
    </div>
  );
}
