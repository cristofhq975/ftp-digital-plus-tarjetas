// Catálogo de integraciones disponibles en FTP Digital Plus

export interface Integration {
  id: string;
  name: string;
  description: string;
  category:
    | 'pago'
    | 'comunicacion'
    | 'calendario'
    | 'analytics'
    | 'social'
    | 'productividad'
    | 'marketing';
  icon: string; // emoji o nombre de icono lucide
  color: string; // color de marca (hex o clase tailwind)
  status: 'available' | 'coming_soon' | 'premium';
  features: string[];
  setupSteps: string[];
  docsUrl?: string;
  popular?: boolean;
}

export interface IntegrationCategory {
  id: Integration['category'] | 'todas';
  label: string;
  color: string;
}

export const INTEGRATION_CATEGORIES: IntegrationCategory[] = [
  { id: 'todas', label: 'Todos', color: 'emerald' },
  { id: 'pago', label: 'Pagos', color: 'emerald' },
  { id: 'comunicacion', label: 'Comunicación', color: 'cyan' },
  { id: 'calendario', label: 'Calendario', color: 'amber' },
  { id: 'analytics', label: 'Analytics', color: 'violet' },
  { id: 'social', label: 'Social', color: 'rose' },
  { id: 'marketing', label: 'Marketing', color: 'emerald' },
  { id: 'productividad', label: 'Productividad', color: 'amber' },
];

export const INTEGRATIONS: Integration[] = [
  {
    id: 'whatsapp-business',
    name: 'WhatsApp Business',
    description:
      'Verifica tu número, envía mensajes automáticos y conecta con clientes al instante.',
    category: 'comunicacion',
    icon: '💬',
    color: '#25D366',
    status: 'available',
    popular: true,
    features: [
      'Verificación de número de WhatsApp',
      'Mensajes automáticos de bienvenida',
      'Botón flotante en tu tarjeta digital',
      'Estadísticas de mensajes recibidos',
    ],
    setupSteps: [
      'Ingresa tu número de WhatsApp con código de país',
      'Solicita el código de verificación por SMS',
      'Escribe el código de 6 dígitos recibido',
      'Personaliza el mensaje automático que verán tus clientes',
      'Verifica la conexión enviando un mensaje de prueba',
    ],
    docsUrl: 'https://faq.whatsapp.com/business',
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description:
      'Acepta pagos con tarjeta de crédito y débito de forma segura en tu tarjeta digital.',
    category: 'pago',
    icon: '💳',
    color: '#635BFF',
    status: 'available',
    popular: true,
    features: [
      'Pagos con Visa, Mastercard y Amex',
      'Cobros en múltiples monedas',
      'Facturación automática',
      'Panel de control de transacciones',
    ],
    setupSteps: [
      'Crea una cuenta en Stripe o inicia sesión',
      'Copia tus claves API (publicable y secreta)',
      'Pega las claves en el panel de FTP Digital Plus',
      'Configura las monedas aceptadas',
      'Activa el webhook para recibir notificaciones de pago',
    ],
    docsUrl: 'https://stripe.com/docs',
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description:
      'Método de pago alternativo ampliamente aceptado en todo el mundo.',
    category: 'pago',
    icon: '🅿️',
    color: '#003087',
    status: 'available',
    features: [
      'Pagos con cuenta PayPal o tarjeta',
      'Reembolsos simplificados',
      'Protección al comprador y vendedor',
      'Sin comisión de instalación',
    ],
    setupSteps: [
      'Inicia sesión en PayPal Business',
      'Ve a Herramientas → API',
      'Copia tu Client ID y Secret',
      'Pégalos en la configuración de pagos',
      'Activa PayPal como método disponible en tu tarjeta',
    ],
    docsUrl: 'https://developer.paypal.com',
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description:
      'Sincroniza las citas agendadas desde tu tarjeta digital con tu calendario de Google.',
    category: 'calendario',
    icon: '📅',
    color: '#4285F4',
    status: 'available',
    features: [
      'Sincronización bidireccional de citas',
      'Confirmaciones y recordatorios automáticos',
      'Bloqueo de horarios no disponibles',
      'Notificaciones por correo',
    ],
    setupSteps: [
      'Autoriza el acceso a tu cuenta de Google',
      'Selecciona el calendario principal donde se crearán las citas',
      'Configura la duración por defecto de las reuniones',
      'Define tu horario de disponibilidad',
      'Activa la sincronización y prueba con una cita demo',
    ],
    docsUrl: 'https://developers.google.com/calendar',
  },
  {
    id: 'google-analytics',
    name: 'Google Analytics',
    description:
      'Rastrea el comportamiento de los visitantes en tu tarjeta digital.',
    category: 'analytics',
    icon: '📊',
    color: '#E37400',
    status: 'available',
    features: [
      'Seguimiento de páginas vistas y visitantes únicos',
      'Fuentes de tráfico',
      'Tiempo promedio en la tarjeta',
      'Eventos personalizados (clics, escaneos QR)',
    ],
    setupSteps: [
      'Crea una propiedad en Google Analytics 4',
      'Copia tu Measurement ID (G-XXXXXX)',
      'Pégalo en la sección de analítica de FTP Digital Plus',
      'Verifica que los eventos se registren en tiempo real',
      'Define eventos personalizados si es necesario',
    ],
    docsUrl: 'https://analytics.google.com',
  },
  {
    id: 'meta-pixel',
    name: 'Meta Pixel',
    description:
      'Rastrea conversiones de tus anuncios en Facebook e Instagram.',
    category: 'marketing',
    icon: '🎯',
    color: '#0866FF',
    status: 'available',
    popular: true,
    features: [
      'Seguimiento de conversiones en Meta Ads',
      'Públicos personalizados y similares',
      'Optimización de campañas automáticas',
      'Retargeting de visitantes',
    ],
    setupSteps: [
      'Ve al Administrador de Eventos de Meta',
      'Crea un Pixel nuevo o usa uno existente',
      'Copia el ID del Pixel (15 dígitos)',
      'Pégalo en la configuración de marketing',
      'Verifica la conexión con el evento PageView',
    ],
    docsUrl: 'https://www.facebook.com/business/help',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    description:
      'Incrusta tu feed de Instagram directamente en tu tarjeta digital.',
    category: 'social',
    icon: '📸',
    color: '#E4405F',
    status: 'available',
    features: [
      'Feed de fotos en vivo',
      'Reels incrustados',
      'Enlace directo a tu perfil',
      'Hashtags clicables',
    ],
    setupSteps: [
      'Copia la URL de tu perfil de Instagram',
      'Pégala en la sección de redes sociales del editor',
      'Selecciona el número de publicaciones a mostrar (6/9/12)',
      'Elige entre feed cuadrado o carrusel',
      'Verifica que se carguen tus últimas publicaciones',
    ],
    docsUrl: 'https://help.instagram.com',
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    description:
      'Captura correos de visitantes y crea campañas de email marketing.',
    category: 'marketing',
    icon: '📧',
    color: '#FFE01B',
    status: 'coming_soon',
    features: [
      'Formularios de suscripción integrados',
      'Sincronización automática de contactos',
      'Plantillas de email profesionales',
      'Segmentación por intereses',
    ],
    setupSteps: [
      'Conecta tu cuenta de Mailchimp',
      'Selecciona la audiencia predeterminada',
      'Personaliza el formulario de suscripción',
      'Configura el email de bienvenida',
      'Activa la captura de leads en tu tarjeta',
    ],
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description:
      'Automatiza flujos de trabajo conectando FTP Digital Plus con miles de apps.',
    category: 'productividad',
    icon: '⚡',
    color: '#FF4F00',
    status: 'coming_soon',
    features: [
      'Conexión con más de 5,000 apps',
      'Disparadores personalizados (nuevo mensaje, cita, venta)',
      'Acciones condicionales',
      'Sincronización en tiempo real',
    ],
    setupSteps: [
      'Crea una cuenta en Zapier',
      'Busca "FTP Digital Plus" en la biblioteca de apps',
      'Selecciona el disparador que necesites',
      'Configura la acción en la app destino',
      'Prueba el Zap y actívalo',
    ],
    docsUrl: 'https://zapier.com/apps',
  },
  {
    id: 'slack',
    name: 'Slack',
    description:
      'Recibe notificaciones de tu tarjeta digital en tiempo real en tus canales de Slack.',
    category: 'comunicacion',
    icon: '💼',
    color: '#4A154B',
    status: 'coming_soon',
    features: [
      'Notificación de nuevos mensajes',
      'Alertas de citas agendadas',
      'Resumen diario de actividad',
      'Menciones a miembros del equipo',
    ],
    setupSteps: [
      'Crea un Webhook entrante en tu workspace de Slack',
      'Copia la URL del Webhook',
      'Pégala en la configuración de notificaciones',
      'Selecciona qué eventos quieres recibir',
      'Prueba enviando una notificación de muestra',
    ],
    docsUrl: 'https://api.slack.com/messaging/webhooks',
  },
  {
    id: 'mercado-pago',
    name: 'Mercado Pago',
    description:
      'Acepta pagos en línea para clientes en toda América Latina.',
    category: 'pago',
    icon: '🪙',
    color: '#00B1EA',
    status: 'available',
    popular: true,
    features: [
      'Pagos con tarjeta y transferencia',
      'Pago en efectivo en puntos de pago',
      'Mensualidades sin interés',
      'Integración con Mercado Libre',
    ],
    setupSteps: [
      'Inicia sesión en tu cuenta de Mercado Pago',
      'Ve a Tu Negocio → Configuración',
      'Copia tus credenciales (Access Token y Public Key)',
      'Pégalas en la sección de pagos de FTP Digital Plus',
      'Activa los métodos de pago disponibles',
    ],
    docsUrl: 'https://www.mercadopago.com.mx/developers/es',
  },
  {
    id: 'hotjar',
    name: 'Hotjar',
    description:
      'Mapas de calor y grabaciones de sesiones para entender el comportamiento de tus visitantes.',
    category: 'analytics',
    icon: '🔥',
    color: '#FD3A5C',
    status: 'premium',
    features: [
      'Mapas de calor de clics y movimiento',
      'Grabaciones de sesiones reales',
      'Encuestas y formularios de feedback',
      'Embudos de conversión',
    ],
    setupSteps: [
      'Crea una cuenta premium en Hotjar',
      'Agrega tu dominio de tarjeta digital',
      'Copia el código de tracking (Hotjar Tracking Code)',
      'Pégalo en la sección de analítica avanzada',
      'Verifica la conexión en el panel de Hotjar',
    ],
    docsUrl: 'https://help.hotjar.com',
  },
];
