'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { FTPLogo } from '@/components/ftp-logo';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  FileText,
  Shield,
  RefreshCw,
  Check,
  Mail,
  Phone,
  Globe,
  ChevronRight,
  Sparkles,
  CalendarDays,
  ScrollText,
  AlertCircle,
} from 'lucide-react';

/* ================================================================== */
/*  Shared types                                                       */
/* ================================================================== */

interface LegalBullet {
  text: string;
  highlight?: boolean;
}

interface LegalSection {
  id: string;
  title: string;
  icon?: ReactNode;
  paragraphs?: string[];
  bullets?: LegalBullet[];
  callout?: {
    variant: 'info' | 'warning' | 'success';
    title?: string;
    text: string;
  };
}

interface LegalPageConfig {
  title: string;
  shortTitle: string;
  icon: ReactNode;
  lastUpdated: string;
  intro: string;
  sections: LegalSection[];
  relatedLinks?: { label: string; view: 'terms' | 'privacy' | 'refunds' }[];
}

/* ================================================================== */
/*  Motion helper                                                      */
/* ================================================================== */

function fadeUpProps(delay = 0) {
  return {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-60px' },
    transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] as const },
  };
}

/* ================================================================== */
/*  Sticky header                                                      */
/* ================================================================== */

function LegalHeader({ title, icon }: { title: string; icon: ReactNode }) {
  const navigate = useAppStore(s => s.navigate);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-emerald-100/60 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            navigate('landing');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="gap-1.5 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
        >
          <ArrowLeft className="size-4" />
          <span className="hidden sm:inline">Volver al inicio</span>
          <span className="sm:hidden">Volver</span>
        </Button>

        <button
          onClick={() => {
            navigate('landing');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2 transition-opacity hover:opacity-90"
          aria-label="Ir al inicio de FTP Digital Plus"
        >
          <FTPLogo variant="full" className="h-8 w-auto" />
        </button>

        <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
          <span className="hidden sm:inline-flex size-4 items-center justify-center text-emerald-600">
            {icon}
          </span>
          <span className="truncate max-w-[10rem]">{title}</span>
        </div>
      </div>
    </header>
  );
}

/* ================================================================== */
/*  Hero                                                               */
/* ================================================================== */

function LegalHero({ config }: { config: LegalPageConfig }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-800 text-white">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 size-96 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="absolute -bottom-32 right-0 size-[28rem] rounded-full bg-emerald-400/30 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm"
        >
          <div className="text-amber-300">{config.icon}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.05 }}
        >
          <Badge className="border-amber-300/40 bg-amber-400/15 text-amber-100 backdrop-blur-sm">
            <Shield className="mr-1 size-3.5" />
            Documento legal
          </Badge>
          <h1 className="mt-4 text-balance text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            <span className="bg-gradient-to-r from-amber-300 via-amber-200 to-amber-300 bg-clip-text text-transparent">
              {config.title}
            </span>
          </h1>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-emerald-50/85">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-4 text-amber-300" />
              Última actualización: {config.lastUpdated}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="size-4 text-amber-300" />
              Vigente y actualizado
            </span>
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-emerald-50/90">
            {config.intro}
          </p>
        </motion.div>
      </div>

      {/* Bottom wave */}
      <div className="relative">
        <svg
          viewBox="0 0 1440 80"
          className="block h-12 w-full sm:h-16"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0,32 C360,80 1080,80 1440,32 L1440,80 L0,80 Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  Table of contents sidebar                                          */
/* ================================================================== */

function TableOfContents({ sections }: { sections: LegalSection[] }) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? '');

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-90px 0px -65% 0px', threshold: 0 },
    );

    sections.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav
      aria-label="Índice de contenidos"
      className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm custom-scrollbar"
    >
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
        <ScrollText className="size-4 text-emerald-600" />
        En esta página
      </p>
      <Separator className="my-3 bg-slate-200" />
      <ul className="flex flex-col gap-1">
        {sections.map((section, idx) => {
          const isActive = activeId === section.id;
          return (
            <li key={section.id}>
              <button
                onClick={() => scrollTo(section.id)}
                className={cn(
                  'group flex w-full items-start gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                  isActive
                    ? 'bg-emerald-50 font-medium text-emerald-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md text-[10px] font-bold transition-colors',
                    isActive
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-700',
                  )}
                >
                  {idx + 1}
                </span>
                <span className="leading-snug">{section.title}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/* ================================================================== */
/*  Section block                                                      */
/* ================================================================== */

function SectionBlock({ section, index }: { section: LegalSection; index: number }) {
  const calloutStyles = {
    info: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    warning: 'border-amber-200 bg-amber-50 text-amber-900',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  };
  const calloutIcon = {
    info: <AlertCircle className="size-5 text-emerald-600" />,
    warning: <AlertCircle className="size-5 text-amber-600" />,
    success: <Check className="size-5 text-emerald-600" />,
  };

  return (
    <motion.section
      id={section.id}
      {...fadeUpProps(Math.min(index * 0.04, 0.2))}
      className="scroll-mt-24"
    >
      <div className="mb-4 flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-500 text-sm font-bold text-white shadow-md">
          {String(index + 1).padStart(2, '0')}
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {section.title}
        </h2>
      </div>

      <div className="flex flex-col gap-4 pl-0 sm:pl-12">
        {section.paragraphs?.map((p, i) => (
          <p key={i} className="text-[15px] leading-relaxed text-slate-700">
            {p}
          </p>
        ))}

        {section.bullets && section.bullets.length > 0 && (
          <ul className="flex flex-col gap-2.5">
            {section.bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[15px] text-slate-700">
                <span
                  className={cn(
                    'mt-1 flex size-4 shrink-0 items-center justify-center rounded-full',
                    b.highlight
                      ? 'bg-amber-100 text-amber-600'
                      : 'bg-emerald-100 text-emerald-600',
                  )}
                >
                  <Check className="size-3" />
                </span>
                <span className={b.highlight ? 'font-medium text-slate-900' : ''}>
                  {b.text}
                </span>
              </li>
            ))}
          </ul>
        )}

        {section.callout && (
          <div
            className={cn(
              'mt-2 flex items-start gap-3 rounded-xl border p-4',
              calloutStyles[section.callout.variant],
            )}
          >
            <span className="mt-0.5 shrink-0">{calloutIcon[section.callout.variant]}</span>
            <div className="flex flex-col gap-1">
              {section.callout.title && (
                <p className="text-sm font-semibold">{section.callout.title}</p>
              )}
              <p className="text-sm leading-relaxed opacity-90">{section.callout.text}</p>
            </div>
          </div>
        )}
      </div>
    </motion.section>
  );
}

/* ================================================================== */
/*  Contact CTA                                                        */
/* ================================================================== */

function ContactCTA({ title }: { title: string }) {
  const navigate = useAppStore(s => s.navigate);

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <motion.div
        {...fadeUpProps()}
        className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-800 px-6 py-12 text-center shadow-2xl shadow-emerald-200/50 sm:px-12"
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-16 -top-16 size-72 rounded-full bg-amber-400/20 blur-3xl" />
          <div className="absolute -bottom-16 -right-16 size-72 rounded-full bg-teal-300/20 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />
        </div>

        <div className="relative flex flex-col items-center gap-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-amber-400/15 px-4 py-1.5 text-sm font-medium text-amber-100 backdrop-blur-sm">
            <Mail className="size-4" />
            Estamos para ayudarte
          </div>
          <h2 className="max-w-2xl text-balance text-3xl font-bold text-white sm:text-4xl">
            {title}
          </h2>
          <p className="max-w-xl text-pretty text-emerald-50/90">
            Nuestro equipo legal y de soporte está disponible para resolver
            cualquier duda sobre este documento. Te responderemos en menos de
            24 horas hábiles.
          </p>

          <div className="mt-2 grid w-full max-w-xl gap-3 sm:grid-cols-3">
            <a
              href="mailto:legal@ftpdigitalplus.com"
              className="group flex flex-col items-center gap-1 rounded-xl border border-white/15 bg-white/10 p-4 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              <Mail className="size-5 text-amber-300" />
              <span className="text-xs font-medium">Email legal</span>
              <span className="text-[11px] text-emerald-50/80">legal@ftpdigitalplus.com</span>
            </a>
            <a
              href="tel:+525512345678"
              className="group flex flex-col items-center gap-1 rounded-xl border border-white/15 bg-white/10 p-4 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              <Phone className="size-5 text-amber-300" />
              <span className="text-xs font-medium">Teléfono</span>
              <span className="text-[11px] text-emerald-50/80">+52 55 1234 5678</span>
            </a>
            <button
              onClick={() => navigate('login')}
              className="group flex flex-col items-center gap-1 rounded-xl border border-amber-300/40 bg-amber-400 p-4 text-amber-950 transition-colors hover:bg-amber-300"
            >
              <Sparkles className="size-5" />
              <span className="text-xs font-semibold">Empezar ahora</span>
              <span className="text-[11px] opacity-80">Crea tu tarjeta</span>
            </button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

/* ================================================================== */
/*  Footer (sticky bottom)                                             */
/* ================================================================== */

function LegalFooter() {
  const navigate = useAppStore(s => s.navigate);
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <FTPLogo variant="full" className="h-8 w-auto" />
            <p className="text-xs text-slate-500">
              © {year} FTP Digital Plus — Agencia de Diseño Web y Marketing Digital.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-slate-500">
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
              onClick={() => navigate('refunds')}
              className="transition-colors hover:text-emerald-700"
            >
              Reembolsos
            </button>
            <span className="text-slate-300">·</span>
            <button
              onClick={() => navigate('landing')}
              className="transition-colors hover:text-emerald-700"
            >
              Inicio
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ================================================================== */
/*  Related links card                                                 */
/* ================================================================== */

function RelatedLinks({
  links,
}: {
  links?: { label: string; view: 'terms' | 'privacy' | 'refunds' }[];
}) {
  const navigate = useAppStore(s => s.navigate);
  if (!links || links.length === 0) return null;

  return (
    <Card className="border-emerald-200/60 bg-emerald-50/50">
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-500 text-white shadow-md">
            <FileText className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Documentos relacionados</p>
            <p className="text-xs text-slate-600">
              Consulta también nuestros otros documentos legales
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {links.map(link => (
            <Button
              key={link.view}
              size="sm"
              variant="outline"
              onClick={() => {
                navigate(link.view);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
            >
              {link.label}
              <ChevronRight className="size-3.5" />
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ================================================================== */
/*  Page renderer                                                      */
/* ================================================================== */

function LegalPageView({ config }: { config: LegalPageConfig }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <LegalHeader title={config.shortTitle} icon={config.icon} />
      <main className="flex-1">
        <LegalHero config={config} />

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid gap-10 lg:grid-cols-[260px_1fr] lg:gap-12">
            {/* Sidebar TOC - desktop only */}
            <aside className="hidden lg:block">
              <TableOfContents sections={config.sections} />
            </aside>

            {/* Main content */}
            <div className="flex flex-col gap-12 lg:max-w-3xl">
              {config.sections.map((section, idx) => (
                <SectionBlock key={section.id} section={section} index={idx} />
              ))}

              <Separator className="bg-slate-200" />

              <RelatedLinks links={config.relatedLinks} />

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-start gap-3">
                  <Globe className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                  <div className="flex flex-col gap-1 text-sm text-slate-600">
                    <p className="font-semibold text-slate-900">
                      FTP Digital Plus — Agencia de Diseño Web y Marketing Digital
                    </p>
                    <p>
                      Ciudad de México, México · hola@ftpdigitalplus.com · +52 55 1234 5678
                    </p>
                    <p className="text-xs text-slate-500">
                      Este documento es una traducción al español y rige exclusivamente
                      la relación con usuarios dentro de México.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ContactCTA title={`¿Dudas sobre ${config.shortTitle.toLowerCase()}?`} />
      </main>
      <LegalFooter />
    </div>
  );
}

/* ================================================================== */
/*  TERMS DATA                                                         */
/* ================================================================== */

const TERMS_CONFIG: LegalPageConfig = {
  title: 'Términos y Condiciones',
  shortTitle: 'Términos',
  icon: <FileText className="size-8" />,
  lastUpdated: '15 de enero, 2025',
  intro:
    'Estos Términos y Condiciones establecen las reglas que rigen el uso de la plataforma FTP Digital Plus y los servicios de tarjetas de presentación digitales. Al registrarte o utilizar nuestros servicios, aceptas quedar vinculado por este documento.',
  sections: [
    {
      id: 'aceptacion',
      title: 'Aceptación de términos',
      paragraphs: [
        'Al acceder, registrarte o utilizar cualquier servicio de FTP Digital Plus (en adelante "la Plataforma"), confirmas que has leído, entendido y aceptado en su totalidad estos Términos y Condiciones, así como nuestra Política de Privacidad y Política de Reembolsos.',
        'Si no estás de acuerdo con alguna parte de estos términos, te pedimos no utilizar la Plataforma. El uso continuado de nuestros servicios implica la aceptación tácita de cualquier actualización que realicemos al presente documento.',
      ],
      callout: {
        variant: 'info',
        title: 'Edad mínima requerida',
        text: 'Para utilizar FTP Digital Plus debes ser mayor de 18 años o contar con autorización de un tutor legal. Al registrarte declaras cumplir con este requisito.',
      },
    },
    {
      id: 'descripcion',
      title: 'Descripción del servicio',
      paragraphs: [
        'FTP Digital Plus es una plataforma en línea que permite a profesionales, negocios y emprendedores crear, personalizar y compartir tarjetas de presentación digitales con código QR, NFC, portafolio visual, catálogo de productos, sistema de citas, mensajería y estadísticas de uso.',
        'Ofrecemos tres planes: Gratis, Básico y Pro. Cada uno con distintas funcionalidades y limitaciones. La disponibilidad de funciones específicas está sujeta al plan contratado por el usuario.',
      ],
      bullets: [
        { text: 'Generación de tarjetas digitales personalizables con plantillas profesionales.' },
        { text: 'Código QR y soporte NFC para compartir la tarjeta al instante.' },
        { text: 'Secciones de servicios, productos, galería, blog, testimonios y equipo.' },
        { text: 'Sistema de citas en línea con confirmación automática.' },
        { text: 'Mensajería directa desde la tarjeta pública del usuario.' },
        { text: 'Estadísticas de vistas, escaneos QR y mensajes recibidos.' },
      ],
    },
    {
      id: 'planes',
      title: 'Planes y precios',
      paragraphs: [
        'FTP Digital Plus ofrece tres planes con precios y funcionalidades distintas. Los precios están expresados en pesos mexicanos (MXN) e incluyen los impuestos aplicables.',
      ],
      bullets: [
        {
          text: 'Plan Gratis ($0 MXN): 1 tarjeta digital, QR con vigencia de 7 días, marca de agua FTP, funciones básicas.',
          highlight: true,
        },
        {
          text: 'Plan Básico ($199 MXN, pago único): 2 tarjetas digitales, QR permanente, sin marca de agua, todas las funciones excepto enlaces personalizados.',
          highlight: true,
        },
        {
          text: 'Plan Pro ($500 MXN/año): 5 tarjetas digitales, QR permanente, enlaces personalizados, analítica avanzada y todas las funciones disponibles.',
          highlight: true,
        },
      ],
      callout: {
        variant: 'warning',
        title: 'Cambio de precios',
        text: 'Nos reservamos el derecho de actualizar los precios de nuestros planes en cualquier momento. Los cambios aplicarán a nuevas contrataciones y a renovaciones posteriores, nunca a periodos ya pagados.',
      },
    },
    {
      id: 'obligaciones',
      title: 'Obligaciones del usuario',
      paragraphs: [
        'Como usuario de FTP Digital Plus te comprometes a utilizar la Plataforma de manera lícita, respetuosa y conforme a la legislación mexicana aplicable. Eres el único responsable del contenido que publicas en tus tarjetas digitales.',
      ],
      bullets: [
        { text: 'Proporcionar información veraz, exacta y actualizada en tu perfil y tarjetas.' },
        { text: 'No publicar contenido ofensivo, difamatorio, fraudulento o que viole derechos de terceros.' },
        { text: 'No utilizar la Plataforma para actividades ilegales, spam o envío masivo de mensajes.' },
        { text: 'No intentar acceder a sistemas internos, hackear, o interrumpir el servicio.' },
        { text: 'No suplantar la identidad de otra persona o empresa.' },
        { text: 'Mantener la confidencialidad de tus credenciales de acceso.' },
      ],
      callout: {
        variant: 'warning',
        title: 'Violación de obligaciones',
        text: 'El incumplimiento de estas obligaciones puede resultar en la suspensión o cancelación inmediata de tu cuenta, sin derecho a reembolso, y en su caso, en las acciones legales correspondientes.',
      },
    },
    {
      id: 'propiedad-intelectual',
      title: 'Propiedad intelectual',
      paragraphs: [
        'Todos los elementos de la Plataforma —incluyendo el logotipo, nombre comercial, diseño, código fuente, plantillas, textos y gráficos— son propiedad exclusiva de FTP Digital Plus y están protegidos por las leyes mexicanas e internacionales de propiedad intelectual.',
        'El contenido que el usuario publica en sus tarjetas digitales sigue siendo propiedad del usuario. Al publicarlo, otorgas a FTP Digital Plus una licencia no exclusiva para mostrarlo, almacenarlo y transmitirlo con el único fin de prestar el servicio.',
      ],
      bullets: [
        { text: 'Queda prohibido copiar, modificar, distribuir o explotar comercialmente la Plataforma sin autorización escrita.' },
        { text: 'Las plantillas y diseños no pueden ser revendidos ni redistribuidos por el usuario.' },
        { text: 'FTP Digital Plus respeta los derechos de autor; denuncias vía DMPI serán atendidas en un plazo máximo de 72 horas.' },
      ],
    },
    {
      id: 'responsabilidad',
      title: 'Limitación de responsabilidad',
      paragraphs: [
        'FTP Digital Plus se ofrece "tal cual" y "según disponibilidad". No garantizamos que el servicio sea ininterrumpido, libre de errores o que cumpla con requerimientos específicos del usuario. En la máxima medida permitida por la ley, no seremos responsables por daños directos, indirectos, incidentales o consecuentes derivados del uso o la imposibilidad de uso de la Plataforma.',
      ],
      bullets: [
        { text: 'No nos hacemos responsables por el contenido publicado por los usuarios en sus tarjetas.' },
        { text: 'No garantizamos resultados comerciales derivados del uso de las tarjetas digitales.' },
        { text: 'La responsabilidad máxima de FTP Digital Plus frente a un usuario se limita al monto pagado en los últimos 12 meses.' },
        { text: 'No seremos responsables por fallas técnicas ajenas a nuestra infraestructura (internet, dispositivos, etc.).' },
      ],
    },
    {
      id: 'modificaciones',
      title: 'Modificaciones del servicio',
      paragraphs: [
        'Podemos actualizar, modificar o discontinuar funciones de la Plataforma en cualquier momento, sin previo aviso, con el fin de mejorar el servicio, cumplir con la legislación o adaptarnos a nuevas tecnologías.',
        'Cuando los cambios sean significativos, lo comunicaremos a través del correo electrónico registrado o mediante un aviso visible en la Plataforma con al menos 7 días de anticipación a su entrada en vigor.',
      ],
      callout: {
        variant: 'info',
        title: 'Actualizaciones de términos',
        text: 'Estos Términos pueden actualizarse periódicamente. La fecha de "última actualización" al inicio de este documento refleja la versión vigente. Te recomendamos revisarla regularmente.',
      },
    },
    {
      id: 'cancelacion',
      title: 'Cancelación y reembolsos',
      paragraphs: [
        'Puedes cancelar tu cuenta en cualquier momento desde la configuración de tu panel. La cancelación del plan Pro surtirá efecto al final del periodo anual pagado, manteniendo el acceso hasta esa fecha.',
        'Para reembolsos, aplican ventanas de garantía distintas según el plan contratado. Te invitamos a revisar nuestra Política de Reembolsos completa para conocer los plazos, exclusiones y el proceso de solicitud.',
      ],
      callout: {
        variant: 'info',
        title: 'Garantías disponibles',
        text: 'Plan Básico: 7 días de garantía. Plan Pro: 15 días de garantía. Consulta el documento completo de reembolsos para más detalles.',
      },
    },
    {
      id: 'privacidad',
      title: 'Privacidad y protección de datos',
      paragraphs: [
        'El tratamiento de datos personales se rige por nuestra Política de Privacidad, la cual forma parte integral de estos Términos. Recopilamos, usamos y protegemos tu información conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) de México.',
        'Puedes ejercer tus derechos ARCO (Acceso, Rectificación, Cancelación y Oposición) en cualquier momento contactándonos a través de los canales oficiales.',
      ],
    },
    {
      id: 'jurisdiccion',
      title: 'Jurisdicción y ley aplicable',
      paragraphs: [
        'Estos Términos y Condiciones se rigen por las leyes vigentes en los Estados Unidos Mexicanos. Cualquier controversia derivada de la interpretación o cumplimiento de este documento será resuelta preferentemente mediante mediación.',
        'En caso de no llegar a un acuerdo, las partes se someten a la jurisdicción y competencia de los tribunales civiles de la Ciudad de México, renunciando expresamente a cualquier otra jurisdicción que pudiera corresponderles por razón de sus domicilios presentes o futuros.',
      ],
      callout: {
        variant: 'success',
        title: 'Contacto legal',
        text: 'Para cualquier asunto legal relacionado con estos Términos, contáctanos en legal@ftpdigitalplus.com o en Av. Reforma 123, CDMX, México.',
      },
    },
  ],
  relatedLinks: [
    { label: 'Política de Privacidad', view: 'privacy' },
    { label: 'Política de Reembolsos', view: 'refunds' },
  ],
};

/* ================================================================== */
/*  PRIVACY DATA                                                       */
/* ================================================================== */

const PRIVACY_CONFIG: LegalPageConfig = {
  title: 'Política de Privacidad',
  shortTitle: 'Privacidad',
  icon: <Shield className="size-8" />,
  lastUpdated: '15 de enero, 2025',
  intro:
    'Tu privacidad es fundamental para FTP Digital Plus. Esta Política describe qué información recopilamos, cómo la usamos, con quién la compartimos y qué derechos tienes sobre tus datos personales, conforme a la LFPDPPP de México.',
  sections: [
    {
      id: 'informacion',
      title: 'Información que recopilamos',
      paragraphs: [
        'Recopilamos distintos tipos de información con el fin de prestar y mejorar nuestros servicios. La información que obtenemos depende de cómo interactúas con la Plataforma.',
      ],
      bullets: [
        { text: 'Nombre completo del usuario y/o representante legal.', highlight: true },
        { text: 'Correo electrónico de contacto y teléfono (fijo o móvil).', highlight: true },
        { text: 'Datos de la empresa o negocio (giro, sitio web, redes sociales).', highlight: true },
        { text: 'Información de pago (procesada de forma segura vía pasarelas certificadas; no almacenamos números de tarjeta).', highlight: true },
        { text: 'Contenido publicado en las tarjetas digitales (servicios, productos, fotos, etc.).' },
        { text: 'Datos de uso: dirección IP, tipo de navegador, páginas visitadas, tiempo de sesión.' },
        { text: 'Cookies y tecnologías similares (ver sección correspondiente).' },
      ],
      callout: {
        variant: 'info',
        title: 'Información de visitantes',
        text: 'Cuando alguien escanea el QR de una tarjeta o visita un enlace público, recopilamos métricas anónimas de la visita (vistas, dispositivo, ubicación aproximada) para mostrar estadísticas al titular de la tarjeta.',
      },
    },
    {
      id: 'uso',
      title: 'Cómo usamos tu información',
      paragraphs: [
        'Utilizamos tus datos personales para los siguientes fines, todos ellos consentidos al registrarte en la Plataforma:',
      ],
      bullets: [
        { text: 'Crear y administrar tu cuenta de usuario y tus tarjetas digitales.' },
        { text: 'Procesar pagos y emitir comprobantes fiscales cuando aplique.' },
        { text: 'Enviarte notificaciones operativas (citas, mensajes recibidos, vencimiento de QR).' },
        { text: 'Brindar soporte técnico y atención al cliente.' },
        { text: 'Mejorar la Plataforma mediante análisis de uso y desempeño.' },
        { text: 'Enviar comunicaciones comerciales (solo si has aceptado recibirlas; puedes darte de baja en cualquier momento).' },
        { text: 'Cumplir con obligaciones legales y requerimientos de autoridades competentes.' },
      ],
    },
    {
      id: 'compartir',
      title: 'Compartir información',
      paragraphs: [
        'FTP Digital Plus NO vende, renta ni comercializa tus datos personales con terceros. Sin embargo, en ciertos casos compartimos información limitada con proveedores de servicios que nos ayudan a operar la Plataforma, bajo estrictos acuerdos de confidencialidad.',
      ],
      bullets: [
        { text: 'Proveedores de infraestructura en la nube (hosting, CDN, base de datos).' },
        { text: 'Pasarelas de pago certificadas (PCI-DSS) para procesar transacciones.' },
        { text: 'Servicios de envío de correo electrónico y notificaciones push.' },
        { text: 'Herramientas de analítica agregada y anónima.' },
        { text: 'Autoridades competentes cuando sea requerido por ley o por orden judicial.' },
      ],
      callout: {
        variant: 'info',
        title: 'Datos públicos en tu tarjeta',
        text: 'La información que publicas en tus tarjetas digitales (nombre, servicios, WhatsApp, etc.) es accesible públicamente para quien escanee tu QR o visite tu enlace. Eres responsable de qué datos decides publicar.',
      },
    },
    {
      id: 'cookies',
      title: 'Cookies y tecnologías similares',
      paragraphs: [
        'Utilizamos cookies y tecnologías análogas para recordar tus preferencias, mantener tu sesión activa, analizar el uso de la Plataforma y ofrecer una experiencia personalizada.',
      ],
      bullets: [
        { text: 'Cookies esenciales: necesarias para el funcionamiento básico (sesión, seguridad).' },
        { text: 'Cookies de preferencias: recuerdan idioma, tema y configuración.' },
        { text: 'Cookies analíticas: nos ayudan a entender cómo se usa la Plataforma.' },
        { text: 'Cookies de marketing: solo se activan si aceptas recibir comunicaciones.' },
      ],
      callout: {
        variant: 'warning',
        title: 'Gestión de cookies',
        text: 'Puedes gestionar o desactivar las cookies no esenciales desde la configuración de tu navegador o desde nuestro panel de consentimiento. Las cookies esenciales no pueden desactivarse.',
      },
    },
    {
      id: 'seguridad',
      title: 'Seguridad de datos',
      paragraphs: [
        'Implementamos medidas técnicas, administrativas y físicas de seguridad para proteger tus datos personales contra acceso, divulgación, alteración o destrucción no autorizada. Estas medidas incluyen cifrado en tránsito (TLS 1.3) y en reposo, control de accesos por roles y auditorías periódicas.',
        'Aunque hacemos nuestro mejor esfuerzo, ningún sistema es 100% seguro. En caso de una brecha de seguridad que afecte tus derechos, te notificaremos de acuerdo con la legislación aplicable, en un plazo no mayor a 72 horas.',
      ],
      bullets: [
        { text: 'Cifrado de contraseñas con algoritmo bcrypt.' },
        { text: 'Conexiones HTTPS obligatorias en toda la Plataforma.' },
        { text: 'Backups diarios con cifrado AES-256.' },
        { text: 'Auditorías de seguridad trimestrales.' },
        { text: 'Acceso restringido del personal a datos sensibles, con registro de actividad.' },
      ],
    },
    {
      id: 'derechos',
      title: 'Tus derechos (ARCO)',
      paragraphs: [
        'Conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP), tienes derecho en todo momento a ejercer tus derechos ARCO: Acceso, Rectificación, Cancelación y Oposición, así como a limitar el uso y divulgación de tus datos.',
      ],
      bullets: [
        { text: 'Acceso: conocer qué datos personales tenemos de ti.', highlight: true },
        { text: 'Rectificación: corregir datos inexactos o incompletos.', highlight: true },
        { text: 'Cancelación: solicitar la eliminación de tus datos (sujetas a excepciones legales).', highlight: true },
        { text: 'Oposición: oponerte al tratamiento de tus datos para fines específicos.', highlight: true },
        { text: 'Revocación del consentimiento: retirar tu autorización en cualquier momento.' },
        { text: 'Limitación: restringir el uso y divulgación de tu información.' },
      ],
      callout: {
        variant: 'info',
        title: 'Cómo ejercer tus derechos',
        text: 'Envía tu solicitud a privacidad@ftpdigitalplus.com con copia de tu identificación oficial. Atenderemos tu petición en un plazo máximo de 20 días hábiles conforme a la LFPDPPP.',
      },
    },
    {
      id: 'retencion',
      title: 'Retención de datos',
      paragraphs: [
        'Conservamos tus datos personales únicamente durante el tiempo necesario para cumplir con las finalidades descritas en esta Política, y posteriormente durante los plazos legales aplicables para atender responsabilidades futuras.',
      ],
      bullets: [
        { text: 'Cuenta activa: mientras mantengas tu cuenta vigente.' },
        { text: 'Cuenta cancelada: 90 días para permitir reactivación, después se bloquean los datos.' },
        { text: 'Datos de facturación: 5 años conforme al Código Fiscal de la Federación.' },
        { text: 'Registros de seguridad y auditoría: hasta 24 meses.' },
        { text: 'Mensajes y citas: 12 meses desde su última actualización.' },
      ],
    },
    {
      id: 'cambios',
      title: 'Cambios a esta política',
      paragraphs: [
        'Esta Política de Privacidad puede actualizarse periódicamente para reflejar cambios en nuestras prácticas de tratamiento de datos, en la legislación aplicable o por requerimientos operativos.',
        'Cuando los cambios sean significativos, te notificaremos por correo electrónico y/o mediante un aviso destacado en la Plataforma con al menos 30 días de anticipación a su entrada en vigor. La fecha de "última actualización" al inicio indica la versión vigente.',
      ],
    },
    {
      id: 'contacto',
      title: 'Contacto',
      paragraphs: [
        'FTP Digital Plus es el responsable del tratamiento de tus datos personales. Para cualquier duda, solicitud o queja relacionada con esta Política, puedes contactarnos a través de los siguientes canales:',
      ],
      bullets: [
        { text: 'Correo del Oficial de Protección de Datos: privacidad@ftpdigitalplus.com', highlight: true },
        { text: 'Teléfono: +52 55 1234 5678 (lunes a viernes, 9:00 – 18:00 hrs).' },
        { text: 'Correo legal: legal@ftpdigitalplus.com' },
        { text: 'Dirección: Av. Reforma 123, Col. Centro, CDMX, México, C.P. 06000.' },
      ],
      callout: {
        variant: 'success',
        title: 'Tu confianza es nuestra prioridad',
        text: 'Si consideras que tu derecho a la protección de datos personales fue vulnerado, puedes acudir al INAI (Instituto Nacional de Transparencia, Acceso a la Información y Protección de Datos Personales) en www.inai.org.mx.',
      },
    },
  ],
  relatedLinks: [
    { label: 'Términos y Condiciones', view: 'terms' },
    { label: 'Política de Reembolsos', view: 'refunds' },
  ],
};

/* ================================================================== */
/*  REFUNDS DATA                                                       */
/* ================================================================== */

const REFUNDS_CONFIG: LegalPageConfig = {
  title: 'Política de Reembolsos',
  shortTitle: 'Reembolsos',
  icon: <RefreshCw className="size-8" />,
  lastUpdated: '15 de enero, 2025',
  intro:
    'En FTP Digital Plus queremos que estés completamente satisfecho. Esta Política detalla las condiciones, plazos y procesos para solicitar un reembolso según el plan que hayas contratado.',
  sections: [
    {
      id: 'plan-gratuito',
      title: 'Plan Gratuito ($0 MXN)',
      paragraphs: [
        'El Plan Gratuito de FTP Digital Plus no tiene costo, por lo que no aplica solicitud de reembolso. Puedes dejar de usar la Plataforma en cualquier momento sin cargo alguno.',
        'Si decides cancelar tu cuenta del Plan Gratuito, tus tarjetas digitales y datos asociados serán eliminados conforme a nuestra Política de Privacidad. Si más adelante deseas regresar, puedes crear una nueva cuenta sin problema.',
      ],
      bullets: [
        { text: 'Sin costo, sin cargo recurrente, sin tarjeta de crédito requerida.' },
        { text: 'Cancela cuando quieras directamente desde la configuración de tu cuenta.' },
        { text: 'No aplica reembolso por no existir transacción monetaria.' },
      ],
      callout: {
        variant: 'info',
        title: '¿Listo para más?',
        text: 'Cuando quieras desbloquear QR permanente, eliminación de marca de agua y más tarjetas, puedes mejorar al Plan Básico o Pro.',
      },
    },
    {
      id: 'plan-basico',
      title: 'Plan Básico ($199 MXN) — 7 días de garantía',
      paragraphs: [
        'El Plan Básico es un pago único de $199 MXN. Ofrecemos una garantía de satisfacción de 7 días naturales contados a partir de la fecha y hora de compra.',
        'Si dentro de ese periodo no estás satisfecho con el servicio, te reembolsamos el 100% del monto pagado, sin preguntas y sin penalizaciones.',
      ],
      bullets: [
        { text: 'Garantía: 7 días naturales desde la compra.', highlight: true },
        { text: 'Monto reembolsable: 100% del pago realizado ($199 MXN).' },
        { text: 'Método de reembolso: mismo medio de pago utilizado en la compra.' },
        { text: 'Tiempo de procesamiento: 5 a 10 días hábiles según tu banco.' },
        { text: 'Después de los 7 días, el pago es no reembolsable al ser pago único.' },
      ],
      callout: {
        variant: 'warning',
        title: 'Importante',
        text: 'Una vez solicitado el reembolso, las funciones del Plan Básico se desactivarán de inmediato y tus tarjetas pasarán al Plan Gratuito con sus limitaciones correspondientes.',
      },
    },
    {
      id: 'plan-pro',
      title: 'Plan Pro ($500 MXN/año) — 15 días de garantía',
      paragraphs: [
        'El Plan Pro tiene un costo de $500 MXN por año. Ofrecemos una garantía de satisfacción de 15 días naturales contados a partir de la fecha y hora de contratación o renovación.',
        'Si dentro de ese periodo no estás satisfecho, te reembolsamos el 100% del monto pagado. Después de los 15 días, la suscripción anual es no reembolsable, pero puedes cancelar la renovación automática en cualquier momento.',
      ],
      bullets: [
        { text: 'Garantía: 15 días naturales desde la contratación o renovación.', highlight: true },
        { text: 'Monto reembolsable: 100% del pago realizado ($500 MXN).' },
        { text: 'Método de reembolso: mismo medio de pago utilizado en la compra.' },
        { text: 'Tiempo de procesamiento: 5 a 10 días hábiles según tu banco.' },
        { text: 'Después de los 15 días: no reembolsable, pero puedes cancelar la renovación.' },
        { text: 'Cancelación posterior: mantienes acceso hasta el final del periodo pagado.' },
      ],
      callout: {
        variant: 'info',
        title: 'Renovación anual',
        text: 'Te enviaremos un correo 30 días antes de la renovación para recordarte el cobro. Si no deseas renovar, puedes cancelar la renovación automática desde tu panel.',
      },
    },
    {
      id: 'como-solicitar',
      title: 'Cómo solicitar un reembolso',
      paragraphs: [
        'Solicitar un reembolso es un proceso sencillo. Sigue estos pasos para que podamos procesar tu solicitud de manera eficiente:',
      ],
      bullets: [
        { text: 'Envía un correo a reembolsos@ftpdigitalplus.com desde el email registrado.' },
        { text: 'Asunto: "Solicitud de reembolso — [Tu nombre] — [Plan]".' },
        { text: 'Incluye: nombre completo, correo de la cuenta, plan contratado y fecha de compra.' },
        { text: 'Opcionalmente, cuéntanos el motivo (nos ayuda a mejorar).' },
        { text: 'Recibirás confirmación de recepción en un plazo máximo de 24 horas hábiles.' },
      ],
      callout: {
        variant: 'info',
        title: 'Datos que facilitarán tu reembolso',
        text: 'Si tienes tu número de orden o comprobante de pago, inclúyelo en el correo. Esto acelera el proceso de verificación.',
      },
    },
    {
      id: 'proceso',
      title: 'Proceso de reembolso',
      paragraphs: [
        'Una vez recibida tu solicitud, seguimos un proceso claro y transparente para garantizar que recibas tu reembolso en tiempo y forma:',
      ],
      bullets: [
        { text: 'Recepción y verificación de la solicitud (1–2 días hábiles).' },
        { text: 'Validación de que la solicitud se realiza dentro del periodo de garantía.' },
        { text: 'Confirmación de la cuenta y el medio de pago utilizado.' },
        { text: 'Aprobación interna y procesamiento del reembolso (1–3 días hábiles).' },
        { text: 'Acreditamiento en tu cuenta bancaria o método de pago (3–7 días hábiles adicionales).' },
        { text: 'Correo de confirmación con el comprobante del reembolso.' },
      ],
      callout: {
        variant: 'success',
        title: 'Tiempo total estimado',
        text: 'Desde tu solicitud hasta que veas el dinero en tu cuenta, el proceso toma entre 5 y 12 días hábiles, dependiendo principalmente de la velocidad de tu banco.',
      },
    },
    {
      id: 'exclusiones',
      title: 'Exclusiones',
      paragraphs: [
        'Para mantener la transparencia y justicia con todos los usuarios, existen ciertas situaciones en las que no es posible procesar un reembolso:',
      ],
      bullets: [
        { text: 'Solicitudes fuera del periodo de garantía (7 días Básico, 15 días Pro).' },
        { text: 'Cuentas que hayan sido suspendidas por violación a los Términos y Condiciones.' },
        { text: 'Compras realizadas con métodos de pago en disputa o fraudulento.' },
        { text: 'Suscripciones Pro después de los 15 días de garantía (acceso mantenido hasta fin del periodo).' },
        { text: 'Servicios adicionales ya consumidos (ej. consultorías, personalizaciones premium).' },
        { text: 'Cambios de opinión sin causa atribuible a FTP Digital Plus.' },
      ],
      callout: {
        variant: 'warning',
        title: 'Casos especiales',
        text: 'Si consideras que tu caso merece una revisión especial (por ejemplo, fallas técnicas de nuestra parte que afectaron tu servicio), escríbenos a soporte@ftpdigitalplus.com y nuestro equipo lo evaluará personalmente.',
      },
    },
  ],
  relatedLinks: [
    { label: 'Términos y Condiciones', view: 'terms' },
    { label: 'Política de Privacidad', view: 'privacy' },
  ],
};

/* ================================================================== */
/*  Exported pages                                                     */
/* ================================================================== */

export function TermsPage() {
  return <LegalPageView config={TERMS_CONFIG} />;
}

export function PrivacyPage() {
  return <LegalPageView config={PRIVACY_CONFIG} />;
}

export function RefundsPage() {
  return <LegalPageView config={REFUNDS_CONFIG} />;
}
