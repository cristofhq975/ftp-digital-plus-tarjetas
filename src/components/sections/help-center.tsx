'use client';

import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, BookOpen, HelpCircle, LifeBuoy, CheckCircle, Clock, ChevronRight,
  MessageCircle, Video, FileText, ArrowLeft, ArrowRight, Sparkles,
  Smartphone, QrCode, Share2, BarChart3, Plus, LucideIcon,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Card, CardHeader, CardContent, CardTitle, CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from '@/components/ui/accordion';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { FTPLogo } from '@/components/ftp-logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';

// ============================ DATOS ============================
type FAQCategory = 'Cuenta' | 'Facturación' | 'Técnico' | 'Tarjetas';

interface FAQItem {
  id: string;
  category: FAQCategory;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'Cuenta',
    question: '¿Cómo puedo registrarme en FTP Digital Plus?',
    answer:
      'Para registrarte, haz clic en el botón "Crear Cuenta" ubicado en la esquina superior derecha de la página principal. Completa el formulario con tu nombre, correo electrónico y una contraseña. Te asignaremos automáticamente el plan Gratis para que puedas crear tu primera tarjeta digital. Si deseas más funciones, puedes actualizar a los planes Básico o Pro en cualquier momento desde tu panel.',
  },
  {
    id: 'faq-2',
    category: 'Cuenta',
    question: '¿Puedo cambiar mi plan más adelante?',
    answer:
      'Sí, puedes actualizar o cambiar tu plan en cualquier momento desde el panel de control en la sección "Ajustes / Pagos" o desde la página de "Ver Planes". Al actualizar, se aplican los nuevos límites y funciones de inmediato. Si pasas de un plan de pago a uno inferior, las tarjetas que excedan el nuevo límite se desactivarán pero no se eliminarán; podrás reactivarlas si vuelves a subir de plan.',
  },
  {
    id: 'faq-3',
    category: 'Cuenta',
    question: '¿Cómo recupero mi contraseña si la olvido?',
    answer:
      'En la pantalla de inicio de sesión haz clic en el enlace "¿Olvidaste tu contraseña?". Ingresa tu correo electrónico y te enviaremos un enlace de recuperación válido por 1 hora. Por seguridad, el enlace solo puede usarse una vez. Si no recibes el correo en pocos minutos, revisa tu carpeta de spam o contacto a soporte@ftpdigitalplus.com.',
  },
  {
    id: 'faq-4',
    category: 'Facturación',
    question: '¿Qué métodos de pago aceptan?',
    answer:
      'Aceptamos tarjetas de crédito y débito Visa, Mastercard y American Express, así como transferencias bancarias SPEI (para usuarios en México) y PayPal. Todos los pagos se procesan a través de pasarelas cifradas con estándar PCI-DSS. Las facturas se generan automáticamente y puedes descargarlas desde la sección "Ajustes / Pagos" de tu panel.',
  },
  {
    id: 'faq-5',
    category: 'Facturación',
    question: '¿Puedo obtener un reembolso?',
    answer:
      'Sí. Ofrecemos una garantía de satisfacción de 14 días. Si no estás conforme con tu plan Básico o Pro, solicita el reembolso dentro de los primeros 14 días posteriores a la compra y te devolveremos el 100% del monto. El reembolso se aplica al método de pago original en un plazo de 5 a 10 días hábiles. Consulta nuestra política completa en la sección de Términos y Condiciones.',
  },
  {
    id: 'faq-6',
    category: 'Facturación',
    question: '¿La suscripción del Plan Pro se renueva automáticamente?',
    answer:
      'Sí, el plan Pro es una suscripción anual que se renueva automáticamente al finalizar cada ciclo de 12 meses. Te enviaremos un correo de aviso 7 días antes del cargo. Si deseas cancelar la renovación automática, puedes hacerlo desde "Ajustes / Pagos" en tu panel. Al cancelar, mantienes acceso a las funciones Pro hasta que termine el ciclo facturado.',
  },
  {
    id: 'faq-7',
    category: 'Técnico',
    question: 'Mi código QR no funciona, ¿qué hago?',
    answer:
      'Si tu QR no escanea correctamente: 1) Verifica que el QR no esté dañado o pixelado al imprimirlo (recomendamos descargar la imagen en alta resolución). 2) Asegúrate de que el color del QR tenga buen contraste con el fondo (QR oscuro sobre fondo claro funciona mejor). 3) Si tienes plan Gratis, recuerda que el QR expira cada 7 días; regenéralo desde el editor. 4) Prueba escanear con otra aplicación de cámara. Si el problema continúa, contacta a soporte.',
  },
  {
    id: 'faq-8',
    category: 'Técnico',
    question: '¿La plataforma funciona en móviles y tablets?',
    answer:
      'Sí, FTP Digital Plus es 100% responsivo. Tanto el panel de administración como las tarjetas digitales públicas se adaptan a cualquier dispositivo: smartphones, tablets y computadoras. Las tarjetas digitales están optimizadas para carga rápida en conexiones móviles (3G o superior) y los códigos QR funcionan con cualquier cámara de smartphone moderna.',
  },
  {
    id: 'faq-9',
    category: 'Tarjetas',
    question: '¿Cuántas tarjetas digitales puedo crear?',
    answer:
      'Depende de tu plan: el plan Gratis incluye 1 tarjeta digital, el plan Básico permite hasta 2 tarjetas y el plan Pro hasta 5 tarjetas. Cada tarjeta puede tener su propio enlace personalizado (solo en plan Pro), plantilla, colores, servicios, productos, galería y configuraciones independientes. Puedes gestionar todas tus tarjetas desde el "Tablero" en tu panel.',
  },
  {
    id: 'faq-10',
    category: 'Tarjetas',
    question: '¿Puedo personalizar el diseño de mi tarjeta?',
    answer:
      '¡Por supuesto! Dispones de 5 plantillas profesionales (Moderno, Clásico, Minimalista, Elegante y Dinámica), 8 paletas de colores predefinidas, 8 tipografías premium, y en los planes Básico y Pro puedes personalizar los colores manualmente, agregar CSS y JavaScript personalizado, y configurar todos los elementos visuales. Entra al editor de la tarjeta y explora las 24 secciones de personalización disponibles.',
  },
];

interface GuideItem {
  id: string;
  title: string;
  description: string;
  readTime: number; // minutos
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  steps: { title: string; description: string }[];
}

const GUIDES: GuideItem[] = [
  {
    id: 'guide-1',
    title: 'Cómo crear tu primera tarjeta',
    description: 'Aprende a crear y configurar tu primera tarjeta digital en menos de 5 minutos.',
    readTime: 5,
    icon: Plus,
    iconBg: 'bg-emerald-100 dark:bg-emerald-950/40',
    iconColor: 'text-emerald-700 dark:text-emerald-400',
    steps: [
      { title: 'Inicia sesión en tu cuenta', description: 'Accede a tu panel con tu correo y contraseña. Si no tienes cuenta, regístrate gratis en segundos.' },
      { title: 'Haz clic en "Nueva Tarjeta"', description: 'Desde el Tablero, pulsa el botón verde "Nueva Tarjeta" en la esquina superior derecha.' },
      { title: 'Define el nombre y enlace', description: 'Asigna un nombre a tu tarjeta (ej. "Consultorio Médico") y un enlace único (ej. /t/consultorio-medico).' },
      { title: 'Personaliza los detalles básicos', description: 'Agrega tu foto de perfil, descripción, logo y portada en la sección "Detalles Básicos" del editor.' },
      { title: 'Guarda y comparte', description: 'Pulsa "Guardar cambios" y obtén tu código QR y enlace para compartir tu tarjeta.' },
    ],
  },
  {
    id: 'guide-2',
    title: 'Personalizar tu código QR',
    description: 'Cambia colores, forma y estilo de tu código QR para que combine con tu marca.',
    readTime: 3,
    icon: QrCode,
    iconBg: 'bg-amber-100 dark:bg-amber-950/40',
    iconColor: 'text-amber-700 dark:text-amber-400',
    steps: [
      { title: 'Abre el editor de tu tarjeta', description: 'Desde el Tablero, haz clic en "Editar" en la tarjeta que deseas modificar.' },
      { title: 'Ve a la sección "Personalizar QR"', description: 'En el menú lateral izquierdo del editor, busca el ícono QR y haz clic.' },
      { title: 'Elige la forma del QR', description: 'Selecciona entre Cuadrado, Redondo o Puntos. Cada estilo da un look distinto a tu QR.' },
      { title: 'Personaliza los colores', description: 'Cambia el color del QR y el color de fondo. Asegúrate de mantener buen contraste.' },
      { title: 'Agrega un logo al centro (opcional)', description: 'En los planes Básico y Pro puedes incrustar tu logo en el centro del QR.' },
      { title: 'Genera y descarga', description: 'Pulsa "Generar QR" y luego "Descargar" para obtener la imagen en alta resolución.' },
    ],
  },
  {
    id: 'guide-3',
    title: 'Configurar WhatsApp',
    description: 'Conecta tu número de WhatsApp para que los clientes te contacten con un clic.',
    readTime: 4,
    icon: MessageCircle,
    iconBg: 'bg-emerald-100 dark:bg-emerald-950/40',
    iconColor: 'text-emerald-700 dark:text-emerald-400',
    steps: [
      { title: 'Abre la sección WhatsApp', description: 'En el editor de tu tarjeta, ve a "Configuración WhatsApp" en el menú lateral.' },
      { title: 'Ingresa tu número', description: 'Escribe tu número de WhatsApp con código de país (ej. 52 para México). Sin signos ni espacios.' },
      { title: 'Verifica el número', description: 'Pulsa "Verificar número" para confirmar que el WhatsApp está activo. Recibirás un mensaje de prueba.' },
      { title: 'Personaliza el mensaje', description: 'Escribe el mensaje que verán tus clientes al hacer clic en el botón de WhatsApp.' },
      { title: 'Guarda los cambios', description: 'Pulsa "Guardar" y prueba el botón en la vista previa de tu tarjeta digital.' },
    ],
  },
  {
    id: 'guide-4',
    title: 'Agregar productos y servicios',
    description: 'Crea tu catálogo de productos y servicios disponibles en tu tarjeta digital.',
    readTime: 6,
    icon: BookOpen,
    iconBg: 'bg-amber-100 dark:bg-amber-950/40',
    iconColor: 'text-amber-700 dark:text-amber-400',
    steps: [
      { title: 'Ve a la sección "Servicios"', description: 'En el editor, abre la pestaña "Servicios" del menú lateral.' },
      { title: 'Pulsa "Agregar Servicio"', description: 'Completa el nombre, descripción, foto y URL externa (opcional) del servicio.' },
      { title: 'Repite para cada servicio', description: 'Puedes agregar tantos servicios como necesites. Se mostrarán en una cuadrícula elegante.' },
      { title: 'Pasa a la sección "Productos"', description: 'Cambia a la pestaña "Productos" del menú lateral.' },
      { title: 'Agrega productos con precio', description: 'Incluye nombre, precio, moneda, descripción, imagen y enlace de compra.' },
      { title: 'Guarda y visualiza', description: 'Guarda los cambios y previsualiza tu tarjeta para ver cómo lucen los catálogos.' },
    ],
  },
  {
    id: 'guide-5',
    title: 'Compartir tu tarjeta',
    description: 'Difunde tu tarjeta digital por QR, enlace, redes sociales y más.',
    readTime: 2,
    icon: Share2,
    iconBg: 'bg-emerald-100 dark:bg-emerald-950/40',
    iconColor: 'text-emerald-700 dark:text-emerald-400',
    steps: [
      { title: 'Abre tu tarjeta pública', description: 'Desde el Tablero, haz clic en "Ver" en tu tarjeta. Se abrirá la vista pública.' },
      { title: 'Pulsa el botón "Compartir"', description: 'Aparece un menú con todas las opciones de compartir disponibles.' },
      { title: 'Copia el enlace', description: 'Copia el enlace único de tu tarjeta para enviarlo por correo, WhatsApp o SMS.' },
      { title: 'Descarga el QR', description: 'Descarga la imagen del QR en alta resolución para imprimir en tarjetas físicas.' },
      { title: 'Comparte en redes sociales', description: 'Publica directamente en Facebook, Instagram, LinkedIn o Twitter con un clic.' },
    ],
  },
  {
    id: 'guide-6',
    title: 'Analíticas y estadísticas',
    description: 'Conoce cuántas visitas y escaneos recibe tu tarjeta digital.',
    readTime: 7,
    icon: BarChart3,
    iconBg: 'bg-amber-100 dark:bg-amber-950/40',
    iconColor: 'text-amber-700 dark:text-amber-400',
    steps: [
      { title: 'Ve a la sección "Analítica"', description: 'Desde el panel principal, haz clic en "Analítica" en el menú lateral.' },
      { title: 'Revisa las métricas generales', description: 'Visualiza visitas totales, escaneos QR, mensajes recibidos y citas agendadas.' },
      { title: 'Explora las gráficas', description: 'Filtra por rango de tiempo (7, 30, 90 días) y analiza tendencias de crecimiento.' },
      { title: 'Compara tus tarjetas', description: 'Si tienes varias, compara su rendimiento en la tabla de "Tarjetas con mejor rendimiento".' },
      { title: 'Analiza dispositivos y geografía', description: 'Conoce qué dispositivos usan tus visitantes y desde qué ciudades te visitan.' },
      { title: 'Exporta el reporte', description: 'Pulsa "Exportar" para descargar un PDF con todas las estadísticas (planes Básico y Pro).' },
    ],
  },
];

const FAQ_CATEGORIES: FAQCategory[] = ['Cuenta', 'Facturación', 'Técnico', 'Tarjetas'];

const CATEGORY_COLORS: Record<FAQCategory, string> = {
  'Cuenta': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
  'Facturación': 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
  'Técnico': 'bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400',
  'Tarjetas': 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400',
};

// ============================ HELPERS ============================
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: 'easeOut' as const },
});

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
          Centro de Ayuda · <span className="font-medium text-emerald-700 dark:text-emerald-400">Soporte 24/7</span>
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
        <button
          onClick={() => navigate(currentUser ? 'dashboard' : 'landing')}
          className="flex items-center gap-2 rounded-md px-2 py-1 text-sm font-medium text-slate-600 transition hover:text-emerald-700 dark:text-slate-300 dark:hover:text-emerald-400"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Volver</span>
        </button>

        <div className="flex items-center gap-2">
          <FTPLogo variant="icon" className="h-7 w-7" />
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">FTP Digital Plus</span>
        </div>

        <div className="flex items-center gap-1">
          <ThemeToggle className="text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-300 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400" />
          <Button
            size="sm"
            className="hidden bg-emerald-600 hover:bg-emerald-700 sm:inline-flex"
            onClick={() => navigate('support')}
          >
            <LifeBuoy className="mr-1.5 h-4 w-4" />
            Contactar Soporte
          </Button>
        </div>
      </div>
    </header>
  );
}

function HeroSection({
  search, setSearch, resultCount,
}: {
  search: string;
  setSearch: (v: string) => void;
  resultCount: number;
}) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-800 px-4 py-14 sm:px-8 sm:py-20">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-amber-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-emerald-400/30 blur-3xl" />

      <div className="relative mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur"
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-300" />
          Estamos aquí para ayudarte
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl"
        >
          Centro de Ayuda
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mt-3 max-w-2xl text-sm text-emerald-50/90 sm:text-base"
        >
          Encuentra respuestas rápidas, guías paso a paso y contacta a nuestro equipo de soporte.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mx-auto mt-6 flex max-w-xl items-center gap-2 rounded-xl bg-white p-2 shadow-xl shadow-emerald-900/20"
        >
          <Search className="ml-2 h-5 w-5 shrink-0 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Busca preguntas, temas o problemas..."
            className="flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
            aria-label="Buscar en el centro de ayuda"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100"
              aria-label="Limpiar búsqueda"
            >
              Limpiar
            </button>
          )}
        </motion.div>

        {search && (
          <p className="mt-3 text-xs text-emerald-50/80">
            {resultCount > 0
              ? `${resultCount} resultado${resultCount === 1 ? '' : 's'} encontrado${resultCount === 1 ? '' : 's'}`
              : 'No se encontraron resultados. Intenta con otra palabra o contacta a soporte.'}
          </p>
        )}
      </div>
    </section>
  );
}

function QuickActions({ onNavigateSupport }: { onNavigateSupport: () => void }) {
  const actions = [
    {
      title: 'Guías y Tutoriales',
      description: 'Aprende a usar todas las funciones',
      icon: BookOpen,
      iconBg: 'bg-emerald-100 dark:bg-emerald-950/40',
      iconColor: 'text-emerald-700 dark:text-emerald-400',
      target: 'guides',
      cta: 'Ver guías',
    },
    {
      title: 'Preguntas Frecuentes',
      description: 'Respuestas a las dudas más comunes',
      icon: HelpCircle,
      iconBg: 'bg-amber-100 dark:bg-amber-950/40',
      iconColor: 'text-amber-700 dark:text-amber-400',
      target: 'faq',
      cta: 'Ver FAQ',
    },
    {
      title: 'Contactar Soporte',
      description: 'Habla con nuestro equipo',
      icon: LifeBuoy,
      iconBg: 'bg-rose-100 dark:bg-rose-950/40',
      iconColor: 'text-rose-700 dark:text-rose-400',
      target: 'support',
      cta: 'Abrir ticket',
    },
    {
      title: 'Estado del Servicio',
      description: 'Sistemas operando con normalidad',
      icon: CheckCircle,
      iconBg: 'bg-teal-100 dark:bg-teal-950/40',
      iconColor: 'text-teal-700 dark:text-teal-400',
      target: 'status',
      cta: 'Ver estado',
      isStatus: true,
    },
  ];

  const handleAction = (action: typeof actions[number]) => {
    if (action.target === 'support') {
      onNavigateSupport();
      return;
    }
    if (action.target === 'status') {
      toast.success('Sistemas operativos', {
        description: 'Todos los servicios de FTP Digital Plus funcionan con normalidad.',
      });
      return;
    }
    const el = document.getElementById(action.target);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="mx-auto -mt-10 max-w-7xl px-4 sm:px-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {actions.map((action, i) => (
          <motion.button
            key={action.title}
            onClick={() => handleAction(action)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            whileHover={{ y: -4 }}
            className="group flex flex-col items-start gap-3 rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all hover:border-emerald-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-700"
          >
            <div className={cn('flex h-11 w-11 items-center justify-center rounded-lg', action.iconBg)}>
              <action.icon className={cn('h-5 w-5', action.iconColor)} />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{action.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{action.description}</p>
            </div>
            {action.isStatus && (
              <div className="flex items-center gap-1.5 rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-700 dark:bg-teal-950/40 dark:text-teal-400">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-500 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-teal-500" />
                </span>
                Operativo
              </div>
            )}
            <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              {action.cta}
              <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </span>
          </motion.button>
        ))}
      </div>
    </section>
  );
}

function GuideCard({ guide, onOpen }: { guide: GuideItem; onOpen: () => void }) {
  return (
    <motion.button
      onClick={onOpen}
      whileHover={{ y: -4 }}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="group flex h-full flex-col items-start gap-3 rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all hover:border-emerald-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-700"
    >
      <div className="flex w-full items-start justify-between">
        <div className={cn('flex h-11 w-11 items-center justify-center rounded-lg', guide.iconBg)}>
          <guide.icon className={cn('h-5 w-5', guide.iconColor)} />
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
          <Clock className="h-3 w-3" />
          {guide.readTime} min
        </span>
      </div>
      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">{guide.title}</h3>
      <p className="flex-1 text-sm text-muted-foreground">{guide.description}</p>
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
        Leer guía
        <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
      </span>
    </motion.button>
  );
}

function GuideDialog({ guide, open, onOpenChange }: {
  guide: GuideItem | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  if (!guide) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={cn('flex h-11 w-11 items-center justify-center rounded-lg', guide.iconBg)}>
              <guide.icon className={cn('h-5 w-5', guide.iconColor)} />
            </div>
            <div>
              <DialogTitle className="text-xl">{guide.title}</DialogTitle>
              <DialogDescription className="mt-0.5 flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" />
                {guide.readTime} min de lectura · {guide.steps.length} pasos
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto pr-1">
          <ol className="relative space-y-5 border-l border-dashed border-emerald-200 pl-6 dark:border-emerald-800">
            {guide.steps.map((step, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
                className="relative"
              >
                <span className="absolute -left-[1.6rem] flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white ring-4 ring-white dark:ring-slate-950">
                  {i + 1}
                </span>
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{step.title}</h4>
                <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
              </motion.li>
            ))}
          </ol>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-lg bg-emerald-50 p-3 dark:bg-emerald-950/30">
          <p className="text-xs text-emerald-800 dark:text-emerald-300">
            <CheckCircle className="mr-1 inline h-3.5 w-3.5" />
            ¿Necesitas más ayuda? Nuestro equipo está disponible 24/7.
          </p>
          <Button
            size="sm"
            className="shrink-0 bg-emerald-600 hover:bg-emerald-700"
            onClick={() => {
              onOpenChange(false);
              useAppStore.getState().navigate('support');
            }}
          >
            Contactar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function GuidesSection({ onOpenGuide }: { onOpenGuide: (g: GuideItem) => void }) {
  return (
    <section id="guides" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-12 sm:px-8 sm:py-16">
      <div className="mb-8 flex flex-col items-start gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
            <BookOpen className="h-3 w-3" />
            Tutoriales
          </div>
          <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100 sm:text-3xl">
            Guías paso a paso
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Aprende a aprovechar al máximo todas las funciones de FTP Digital Plus.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GUIDES.map((g) => (
          <GuideCard key={g.id} guide={g} onOpen={() => onOpenGuide(g)} />
        ))}
      </div>
    </section>
  );
}

function FAQSection({ items }: { items: FAQItem[] }) {
  const grouped = useMemo(() => {
    return FAQ_CATEGORIES.map((cat) => ({
      category: cat,
      items: items.filter((it) => it.category === cat),
    })).filter((g) => g.items.length > 0);
  }, [items]);

  return (
    <section id="faq" className="scroll-mt-20 bg-gradient-to-b from-white to-emerald-50/40 px-4 py-12 dark:from-slate-950 dark:to-emerald-950/10 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
            <HelpCircle className="h-3 w-3" />
            FAQ
          </div>
          <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100 sm:text-3xl">
            Preguntas Frecuentes
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Las respuestas a las preguntas que más nos hacen nuestros usuarios.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
            <HelpCircle className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300">
              No encontramos preguntas que coincidan con tu búsqueda.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Intenta con otras palabras o contacta a soporte.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {grouped.map((group) => (
              <div key={group.category}>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  <span className={cn('rounded-md px-2 py-0.5', CATEGORY_COLORS[group.category])}>
                    {group.category}
                  </span>
                  <span className="text-xs font-normal text-muted-foreground">
                    ({group.items.length})
                  </span>
                </h3>
                <Card className="overflow-hidden border-slate-200 dark:border-slate-800">
                  <Accordion type="single" collapsible className="px-4">
                    {group.items.map((item) => (
                      <AccordionItem key={item.id} value={item.id} className="border-slate-100 dark:border-slate-800">
                        <AccordionTrigger className="text-left text-sm font-semibold text-slate-800 hover:text-emerald-700 hover:no-underline dark:text-slate-200 dark:hover:text-emerald-400">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ContactCTA({ onNavigateSupport }: { onNavigateSupport: () => void }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-8 sm:py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-800 p-8 shadow-xl sm:p-12"
      >
        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-emerald-400/30 blur-3xl" />

        <div className="relative flex flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur">
              <MessageCircle className="h-3.5 w-3.5" />
              ¿Necesitas más ayuda?
            </div>
            <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
              ¿No encontraste lo que buscas?
            </h2>
            <p className="mt-2 text-sm text-emerald-50/90 sm:text-base">
              Nuestro equipo de soporte está listo para ayudarte. Crea un ticket y te responderemos en menos de 24 horas.
            </p>
          </div>
          <Button
            size="lg"
            onClick={onNavigateSupport}
            className="shrink-0 bg-amber-500 text-white shadow-lg shadow-amber-900/20 hover:bg-amber-600"
          >
            <LifeBuoy className="mr-2 h-5 w-5" />
            Contactar Soporte
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    </section>
  );
}

function ResourcesSection() {
  const resources = [
    {
      title: 'Video Tutoriales',
      description: 'Aprende viendo nuestros videos paso a paso en YouTube.',
      icon: Video,
      iconBg: 'bg-rose-100 dark:bg-rose-950/40',
      iconColor: 'text-rose-700 dark:text-rose-400',
      action: () => toast.info('Próximamente', { description: 'Nuestros video tutoriales estarán disponibles muy pronto.' }),
    },
    {
      title: 'Documentación PDF',
      description: 'Descarga los manuales completos en formato PDF.',
      icon: FileText,
      iconBg: 'bg-amber-100 dark:bg-amber-950/40',
      iconColor: 'text-amber-700 dark:text-amber-400',
      action: () => toast.success('Descargando...', { description: 'El manual PDF comenzará a descargar en breve.' }),
    },
    {
      title: 'Tips de WhatsApp',
      description: 'Aprovecha al máximo la integración con WhatsApp Business.',
      icon: Smartphone,
      iconBg: 'bg-emerald-100 dark:bg-emerald-950/40',
      iconColor: 'text-emerald-700 dark:text-emerald-400',
      action: () => toast.info('Abriendo guía', { description: 'Revisa nuestra guía de WhatsApp en el Centro de Ayuda.' }),
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {resources.map((r, i) => (
          <motion.button
            key={r.title}
            onClick={r.action}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            whileHover={{ y: -3 }}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all hover:border-emerald-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-700"
          >
            <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', r.iconBg)}>
              <r.icon className={cn('h-5 w-5', r.iconColor)} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{r.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{r.description}</p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
          </motion.button>
        ))}
      </div>
    </section>
  );
}

// ============================ MAIN ============================
export function HelpCenter() {
  const navigate = useAppStore(s => s.navigate);
  const [search, setSearch] = useState('');
  const [selectedGuide, setSelectedGuide] = useState<GuideItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const guidesRef = useRef<HTMLDivElement>(null);

  const filteredFAQ = useMemo(() => {
    if (!search.trim()) return FAQ_ITEMS;
    const q = search.toLowerCase();
    return FAQ_ITEMS.filter((it) =>
      it.question.toLowerCase().includes(q) ||
      it.answer.toLowerCase().includes(q) ||
      it.category.toLowerCase().includes(q)
    );
  }, [search]);

  const handleOpenGuide = (g: GuideItem) => {
    setSelectedGuide(g);
    setDialogOpen(true);
  };

  const handleNavigateSupport = () => {
    navigate('support');
    toast.info('Te llevamos a soporte', {
      description: 'Crea un ticket y te responderemos en menos de 24 horas.',
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-white via-emerald-50/30 to-white dark:from-slate-950 dark:via-emerald-950/10 dark:to-slate-950">
      <HeaderBar />

      <main className="flex-1">
        <HeroSection
          search={search}
          setSearch={setSearch}
          resultCount={filteredFAQ.length}
        />

        <QuickActions onNavigateSupport={handleNavigateSupport} />

        <div ref={guidesRef}>
          <GuidesSection onOpenGuide={handleOpenGuide} />
        </div>

        <ResourcesSection />

        <FAQSection items={filteredFAQ} />

        <ContactCTA onNavigateSupport={handleNavigateSupport} />
      </main>

      <Footer />

      <GuideDialog
        guide={selectedGuide}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}

export default HelpCenter;
