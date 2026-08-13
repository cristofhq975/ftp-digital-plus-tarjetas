import { PlanConfig, PlanType } from './types';

export const PLANS: Record<PlanType, PlanConfig> = {
  gratis: {
    id: 'gratis',
    name: 'Gratis',
    price: 0,
    period: 'para siempre',
    description: 'Perfecto para empezar. Crea tu primera tarjeta digital con QR.',
    maxCards: 1,
    storage: 50,
    hasWebCard: false,
    hasWatermark: true,
    qrExpires: true,
    qrExpirationDays: 7,
    highlight: false,
    features: [
      { name: '1 tarjeta virtual', included: true },
      { name: 'Foto de perfil', included: true },
      { name: 'Nombre y teléfono', included: true },
      { name: 'Descripción breve', included: true },
      { name: 'Código QR con vencimiento (7 días)', included: true },
      { name: 'QR redirige a WhatsApp', included: true },
      { name: 'Mensaje de WhatsApp personalizable', included: true },
      { name: 'Imagen descargable con marca de agua', included: true },
      { name: 'Verificación de número WhatsApp', included: true },
      { name: 'Tarjeta web compartible', included: false },
      { name: 'Servicios y productos', included: false },
      { name: 'Galería de imágenes', included: false },
      { name: 'Portafolio / Blog', included: false },
      { name: 'Testimonios', included: false },
      { name: 'Equipo y citas', included: false },
      { name: 'Enlaces sociales', included: false },
      { name: 'Feed de Instagram', included: false },
      { name: 'Marcos flotantes', included: false },
      { name: 'Tarjeta virtual dinámica', included: false },
      { name: 'Personalizar código QR', included: false },
      { name: 'Plantillas premium', included: false },
      { name: 'CSS y JS personalizado', included: false },
      { name: 'Fuentes personalizadas', included: false },
      { name: 'Ocultar marca FTP', included: false },
      { name: 'Analítica avanzada', included: false },
      { name: 'SEO optimizado', included: false },
      { name: 'Enlaces personalizados', included: false },
      { name: 'Sin marca de agua', included: false },
      { name: 'Protección de contraseña', included: false },
      { name: 'Afiliación', included: false },
      { name: 'Soporte prioritario', included: false },
    ],
  },
  basico: {
    id: 'basico',
    name: 'Básico',
    price: 199,
    period: 'pago único',
    description: 'Para profesionales que necesitan una presencia digital completa.',
    maxCards: 2,
    storage: 200,
    hasWebCard: true,
    hasWatermark: false,
    qrExpires: false,
    qrExpirationDays: 0,
    highlight: true,
    badge: 'Más popular',
    features: [
      { name: '2 tarjetas virtuales', included: true },
      { name: 'Foto de perfil', included: true },
      { name: 'Nombre y teléfono', included: true },
      { name: 'Descripción breve', included: true },
      { name: 'Código QR permanente (sin vencimiento)', included: true },
      { name: 'QR redirige a WhatsApp', included: true },
      { name: 'Mensaje de WhatsApp personalizable', included: true },
      { name: 'Imagen descargable sin marca de agua', included: true },
      { name: 'Verificación de número WhatsApp', included: true },
      { name: 'Tarjeta web compartible', included: true },
      { name: 'Servicios y productos', included: true },
      { name: 'Galería de imágenes', included: true },
      { name: 'Portafolio / Blog', included: true },
      { name: 'Testimonios', included: true },
      { name: 'Equipo y citas', included: true },
      { name: 'Enlaces sociales', included: true },
      { name: 'Feed de Instagram', included: true },
      { name: 'Marcos flotantes', included: true },
      { name: 'Tarjeta virtual dinámica', included: true },
      { name: 'Personalizar código QR', included: true },
      { name: 'Plantillas premium', included: true },
      { name: 'CSS y JS personalizado', included: true },
      { name: 'Fuentes personalizadas', included: true },
      { name: 'Ocultar marca FTP', included: true },
      { name: 'Analítica básica', included: true },
      { name: 'SEO optimizado', included: true },
      { name: 'Enlaces personalizados', included: false },
      { name: 'Sin marca de agua', included: true },
      { name: 'Protección de contraseña', included: true },
      { name: 'Afiliación', included: true },
      { name: 'Soporte por correo', included: true },
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 500,
    period: 'por año',
    description: 'Para empresas que necesitan el máximo potencial digital.',
    maxCards: 5,
    storage: 2000,
    hasWebCard: true,
    hasWatermark: false,
    qrExpires: false,
    qrExpirationDays: 0,
    highlight: false,
    badge: 'Máximo potencial',
    features: [
      { name: '5 tarjetas virtuales', included: true },
      { name: 'Foto de perfil', included: true },
      { name: 'Nombre y teléfono', included: true },
      { name: 'Descripción breve', included: true },
      { name: 'Código QR permanente (sin vencimiento)', included: true },
      { name: 'QR redirige a WhatsApp', included: true },
      { name: 'Mensaje de WhatsApp personalizable', included: true },
      { name: 'Imagen descargable sin marca de agua', included: true },
      { name: 'Verificación de número WhatsApp', included: true },
      { name: 'Tarjeta web compartible', included: true },
      { name: 'Servicios y productos', included: true },
      { name: 'Galería de imágenes ilimitada', included: true },
      { name: 'Portafolio / Blog avanzado', included: true },
      { name: 'Testimonios con calificación', included: true },
      { name: 'Equipo y citas con pagos', included: true },
      { name: 'Enlaces sociales ilimitados', included: true },
      { name: 'Feed de Instagram en vivo', included: true },
      { name: 'Marcos flotantes ilimitados', included: true },
      { name: 'Tarjeta virtual dinámica premium', included: true },
      { name: 'Personalizar código QR avanzado', included: true },
      { name: 'Plantillas premium exclusivas', included: true },
      { name: 'CSS y JS personalizado', included: true },
      { name: 'Fuentes personalizadas premium', included: true },
      { name: 'Ocultar marca FTP', included: true },
      { name: 'Analítica avanzada con gráficas', included: true },
      { name: 'SEO optimizado + meta tags', included: true },
      { name: 'Enlaces personalizados', included: true },
      { name: 'Sin marca de agua', included: true },
      { name: 'Protección de contraseña', included: true },
      { name: 'Programa de afiliación premium', included: true },
      { name: 'Soporte prioritario 24/7', included: true },
    ],
  },
};

export const PLAN_ORDER: PlanType[] = ['gratis', 'basico', 'pro'];

export const TEMPLATES = [
  { id: 'moderno', name: 'Moderno', description: 'Diseño limpio con gradientes', category: 'profesional', premium: false },
  { id: 'clasico', name: 'Clásico', description: 'Elegante atemporal', category: 'profesional', premium: false },
  { id: 'minimalista', name: 'Minimalista', description: 'Solo lo esencial', category: 'minimalista', premium: false },
  { id: 'elegante', name: 'Elegante', description: 'Tipografía serif sofisticada', category: 'creativo', premium: true },
  { id: 'dinamica', name: 'Dinámica', description: 'Animaciones y efectos visuales', category: 'creativo', premium: true },
  { id: 'corporativo', name: 'Corporativo', description: 'Profesional y formal para empresas', category: 'profesional', premium: true },
  { id: 'creativo', name: 'Creativo', description: 'Colores vibrantes y formas únicas', category: 'creativo', premium: true },
  { id: 'oscuro', name: 'Modo Oscuro', description: 'Tema oscuro elegante y moderno', category: 'minimalista', premium: true },
  { id: 'vintage', name: 'Vintage', description: 'Estilo retro con texturas clásicas', category: 'creativo', premium: true },
  { id: 'tech', name: 'Tech', description: 'Futurista con efectos neón', category: 'minimalista', premium: true },
] as const;

export type TemplateId = (typeof TEMPLATES)[number]['id'];
export type TemplateCategory = (typeof TEMPLATES)[number]['category'];

export const FONTS = [
  { id: 'poppins', name: 'Poppins', css: "'Poppins', sans-serif" },
  { id: 'inter', name: 'Inter', css: "'Inter', sans-serif" },
  { id: 'roboto', name: 'Roboto', css: "'Roboto', sans-serif" },
  { id: 'montserrat', name: 'Montserrat', css: "'Montserrat', sans-serif" },
  { id: 'playfair', name: 'Playfair Display', css: "'Playfair Display', serif" },
  { id: 'lora', name: 'Lora', css: "'Lora', serif" },
  { id: 'oswald', name: 'Oswald', css: "'Oswald', sans-serif" },
  { id: 'raleway', name: 'Raleway', css: "'Raleway', sans-serif" },
];

export type ColorPresetMood =
  | 'fresh'
  | 'warm'
  | 'bold'
  | 'calm'
  | 'dark'
  | 'bright'
  | 'soft'
  | 'elegant';

export type ColorPresetCategory =
  | 'profesional'
  | 'lujo'
  | 'creativo'
  | 'minimalista'
  | 'calido'
  | 'fresco';

export interface ColorPreset {
  name: string;
  primary: string;
  secondary: string;
  background: string;
  text: string;
  mood: ColorPresetMood;
  category: ColorPresetCategory;
  /** Descripción corta del degradado para tooltip/preview */
  gradient: string;
}

/**
 * 20 paletas curadas por mood/style.
 * Las primeras 8 conservan los colores originales para mantener compatibilidad
 * con cualquier código que use COLORS_PRESETS[0..7] (card-editor).
 */
export const COLOR_PRESETS: readonly ColorPreset[] = [
  // ─── Originales (preservados) ───────────────────────────────────
  {
    name: 'Esmeralda', primary: '#059669', secondary: '#10b981',
    background: '#ffffff', text: '#0f172a', mood: 'fresh', category: 'profesional',
    gradient: 'Bosque fresco esmeralda',
  },
  {
    name: 'Oro', primary: '#d97706', secondary: '#f59e0b',
    background: '#fffbeb', text: '#1c1917', mood: 'warm', category: 'lujo',
    gradient: 'Atardecer dorado',
  },
  {
    name: 'Corinto', primary: '#be123c', secondary: '#f43f5e',
    background: '#fff1f2', text: '#1c1917', mood: 'bold', category: 'creativo',
    gradient: 'Vino intenso',
  },
  {
    name: 'Cian', primary: '#0891b2', secondary: '#06b6d4',
    background: '#ecfeff', text: '#0f172a', mood: 'calm', category: 'fresco',
    gradient: 'Océano tropical',
  },
  {
    name: 'Naranja', primary: '#ea580c', secondary: '#fb923c',
    background: '#fff7ed', text: '#1c1917', mood: 'warm', category: 'calido',
    gradient: 'Crepúsculo naranja',
  },
  {
    name: 'Esmeralda Oscuro', primary: '#064e3b', secondary: '#047857',
    background: '#f0fdf4', text: '#0f172a', mood: 'elegant', category: 'lujo',
    gradient: 'Abismo esmeralda',
  },
  {
    name: 'Grafito', primary: '#1f2937', secondary: '#4b5563',
    background: '#f9fafb', text: '#111827', mood: 'dark', category: 'minimalista',
    gradient: 'Acero urbano',
  },
  {
    name: 'Púrpura', primary: '#7c3aed', secondary: '#a78bfa',
    background: '#faf5ff', text: '#1c1917', mood: 'bold', category: 'creativo',
    gradient: 'Noche púrpura',
  },
  // ─── Nuevas paletas (8 → 20) ────────────────────────────────────
  {
    name: 'Jade Real', primary: '#047857', secondary: '#34d399',
    background: '#ecfdf5', text: '#022c22', mood: 'elegant', category: 'lujo',
    gradient: 'Seda jade pulida',
  },
  {
    name: 'Bronce', primary: '#92400e', secondary: '#b45309',
    background: '#fffbeb', text: '#1c1917', mood: 'warm', category: 'lujo',
    gradient: 'Metal antiguo bruñido',
  },
  {
    name: 'Marfil', primary: '#a16207', secondary: '#ca8a04',
    background: '#fffdf7', text: '#1c1917', mood: 'soft', category: 'minimalista',
    gradient: 'Lino marfil',
  },
  {
    name: 'Menta', primary: '#10b981', secondary: '#6ee7b7',
    background: '#f0fdf4', text: '#064e3b', mood: 'fresh', category: 'fresco',
    gradient: 'Hierba matinal',
  },
  {
    name: 'Terracota', primary: '#c2410c', secondary: '#f97316',
    background: '#fdf4f0', text: '#431407', mood: 'warm', category: 'calido',
    gradient: 'Barro cocido',
  },
  {
    name: 'Mora', primary: '#6d28d9', secondary: '#8b5cf6',
    background: '#faf5ff', text: '#2e1065', mood: 'bold', category: 'creativo',
    gradient: 'Sombras de mora',
  },
  {
    name: 'Carbón', primary: '#0f172a', secondary: '#334155',
    background: '#f8fafc', text: '#0f172a', mood: 'dark', category: 'minimalista',
    gradient: 'Antracita sobria',
  },
  {
    name: 'Lima Pro', primary: '#65a30d', secondary: '#a3e635',
    background: '#f7fee7', text: '#1a2e05', mood: 'bright', category: 'fresco',
    gradient: 'Cítrico vivaz',
  },
  {
    name: 'Aqua', primary: '#0d9488', secondary: '#2dd4bf',
    background: '#f0fdfa', text: '#042f2e', mood: 'calm', category: 'fresco',
    gradient: 'Laguna serena',
  },
  {
    name: 'Rubí', primary: '#9f1239', secondary: '#fb7185',
    background: '#fff1f2', text: '#4c0519', mood: 'bold', category: 'lujo',
    gradient: 'Gema rubí',
  },
  {
    name: 'Esmeralda + Oro', primary: '#059669', secondary: '#f59e0b',
    background: '#ffffff', text: '#0f172a', mood: 'elegant', category: 'profesional',
    gradient: 'Identidad FTP Digital Plus',
  },
  {
    name: 'Miel', primary: '#b45309', secondary: '#fbbf24',
    background: '#fffbeb', text: '#451a03', mood: 'warm', category: 'calido',
    gradient: 'Miel dorada',
  },
  {
    name: 'Nieve', primary: '#475569', secondary: '#94a3b8',
    background: '#ffffff', text: '#0f172a', mood: 'soft', category: 'minimalista',
    gradient: 'Polar minimalista',
  },
];

export const THEME_CATEGORIES = [
  { id: 'profesional', name: 'Profesional', description: 'Colores serios y confiables' },
  { id: 'lujo',        name: 'Lujo',         description: 'Elegancia y sofisticación' },
  { id: 'creativo',    name: 'Creativo',     description: 'Vibrante y audaz' },
  { id: 'minimalista', name: 'Minimalista',  description: 'Limpio y simple' },
  { id: 'calido',      name: 'Cálido',       description: 'Acogedor y amigable' },
  { id: 'fresco',      name: 'Fresco',       description: 'Moderno y limpio' },
] as const;

export type ThemeCategory = (typeof THEME_CATEGORIES)[number]['id'];

// Las 24 secciones del manual de edición
export const EDITOR_SECTIONS = [
  { id: 'detalles', name: 'Detalles Básicos', icon: 'User', description: 'Nombre, descripción, logo y portada' },
  { id: 'plantillas', name: 'Plantillas', icon: 'Layout', description: 'Elegir diseño de la tarjeta' },
  { id: 'dinamica', name: 'Tarjeta Dinámica', icon: 'Sparkles', description: 'Apariencia dinámica de la tarjeta' },
  { id: 'horario', name: 'Horario de Atención', icon: 'Clock', description: 'Configurar horario de la empresa' },
  { id: 'qr', name: 'Personalizar QR', icon: 'QrCode', description: 'Forma y apariencia del código QR' },
  { id: 'servicios', name: 'Servicios', icon: 'Briefcase', description: 'Agregar servicios que ofreces' },
  { id: 'productos', name: 'Productos', icon: 'ShoppingBag', description: 'Catálogo de productos' },
  { id: 'instagram', name: 'Feed de Instagram', icon: 'Instagram', description: 'Incrustar feed de Instagram' },
  { id: 'galeria', name: 'Galería', icon: 'Images', description: 'Galería de imágenes y videos' },
  { id: 'blog', name: 'Blog', icon: 'FileText', description: 'Artículos y publicaciones' },
  { id: 'testimonios', name: 'Testimonios', icon: 'Quote', description: 'Opiniones de clientes' },
  { id: 'marcos', name: 'Marcos Flotantes', icon: 'Frame', description: 'Ventanas a webs externas' },
  { id: 'equipo', name: 'Equipo y Citas', icon: 'Users', description: 'Configurar equipo y citas' },
  { id: 'sociales', name: 'Enlaces Sociales', icon: 'Share2', description: 'Redes sociales' },
  { id: 'bandera', name: 'Bandera / Anuncio', icon: 'Flag', description: 'Ventana emergente publicitaria' },
  { id: 'fuentes', name: 'Fuentes', icon: 'Type', description: 'Cambiar fuente y tamaño' },
  { id: 'avanzado', name: 'Avanzado (CSS/JS)', icon: 'Code', description: 'Código personalizado' },
  { id: 'motores', name: 'Motores de Búsqueda (SEO)', icon: 'Search', description: 'SEO y meta tags' },
  { id: 'privacidad', name: 'Políticas de Privacidad', icon: 'Shield', description: 'Políticas de privacidad' },
  { id: 'terminos', name: 'Términos y Condiciones', icon: 'ScrollText', description: 'Términos legales' },
  { id: 'secciones', name: 'Administrar Secciones', icon: 'Settings', description: 'Activar/desactivar módulos' },
  { id: 'whatsapp', name: 'Configuración WhatsApp', icon: 'MessageCircle', description: 'Número y mensaje de WhatsApp' },
  { id: 'fondos', name: 'Fondos Virtuales NFC', icon: 'CreditCard', description: 'Imágenes para tarjetas NFC' },
  { id: 'pagos', name: 'Métodos de Pago', icon: 'CreditCard', description: 'Configurar métodos de pago' },
] as const;

// Secciones del panel principal (Manual 1)
export const DASHBOARD_SECTIONS = [
  { id: 'tablero', name: 'Tablero', icon: 'LayoutDashboard', description: 'Vista general de tus tarjetas' },
  { id: 'notifications', name: 'Notificaciones', icon: 'Bell', description: 'Centro de notificaciones' },
  { id: 'compare', name: 'Comparar', icon: 'GitCompare', description: 'Compara tus tarjetas' },
  { id: 'stats', name: 'Analítica', icon: 'Search', description: 'Estadísticas y métricas de tus tarjetas' },
  { id: 'template-gallery', name: 'Plantillas', icon: 'Layout', description: 'Galería de plantillas disponibles' },
  { id: 'themes', name: 'Temas', icon: 'Palette', description: 'Personaliza colores y paletas' },
  { id: 'messages', name: 'Consultas', icon: 'Mail', description: 'Mensajes del formulario de contacto' },
  { id: 'appointments', name: 'Equipo / Citas', icon: 'Calendar', description: 'Citas agendadas' },
  { id: 'orders', name: 'Pedidos', icon: 'Package', description: 'Solicitudes de productos' },
  { id: 'virtual-funds', name: 'Fondos Virtuales', icon: 'CreditCard', description: 'Imágenes para tarjetas NFC' },
  { id: 'affiliations', name: 'Afiliaciones', icon: 'Users', description: 'Programa de afiliados' },
  { id: 'storage', name: 'Almacenamiento', icon: 'Database', description: 'Capacidad de almacenamiento' },
  { id: 'settings', name: 'Ajustes / Pagos', icon: 'Settings', description: 'Métodos de pago y configuración' },
  { id: 'integrations', name: 'Integraciones', icon: 'Plug', description: 'Conecta tus herramientas' },
  { id: 'help', name: 'Ayuda', icon: 'LifeBuoy', description: 'Centro de ayuda y soporte' },
] as const;
