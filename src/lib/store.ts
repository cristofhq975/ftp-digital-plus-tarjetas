import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import { User, BusinessCard, ViewType, ContactMessage, Appointment, PlanType, Schedule, SocialLinks, SupportTicket, SupportTicketResponse } from './types';
import { PLANS } from './plans';
import { generateId, generateQrExpiration } from './card-utils';

// Tipos de notificación del Centro de Notificaciones (Task 11-a)
export type NotificationType =
  | 'message'
  | 'appointment'
  | 'qr_scan'
  | 'view_milestone'
  | 'plan'
  | 'system'
  | 'card_created'
  | 'card_updated'
  | 'limit_warning'
  | 'payment';

export type NotificationPriority = 'low' | 'medium' | 'high';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  actionLabel?: string;
  actionView?: ViewType;
  cardId?: string;
  priority: NotificationPriority;
}

// Datos demo iniciales
const DEFAULT_SCHEDULE: Schedule = {
  monday: { open: true, start: '09:00', end: '18:00' },
  tuesday: { open: true, start: '09:00', end: '18:00' },
  wednesday: { open: true, start: '09:00', end: '18:00' },
  thursday: { open: true, start: '09:00', end: '18:00' },
  friday: { open: true, start: '09:00', end: '18:00' },
  saturday: { open: true, start: '10:00', end: '14:00' },
  sunday: { open: false, start: '00:00', end: '00:00' },
};

const DEFAULT_SOCIAL: SocialLinks = {
  facebook: '',
  instagram: '',
  twitter: '',
  linkedin: '',
  youtube: '',
  tiktok: '',
  whatsapp: '',
  telegram: '',
};

function createDefaultCard(userId: string, plan: PlanType, linkName: string, cardName: string): BusinessCard {
  return {
    id: generateId(),
    userId,
    linkName,
    cardName,
    description: '',
    logo: '',
    coverPhoto: '',
    profilePhoto: '',
    template: 'moderno',
    primaryColor: '#059669',
    secondaryColor: '#10b981',
    backgroundColor: '#ffffff',
    textColor: '#0f172a',
    fontFamily: 'poppins',
    fontSize: 16,
    customCSS: '',
    customJS: '',
    qrStyle: 'cuadrado',
    qrColor: '#059669',
    qrBgColor: '#ffffff',
    qrLogo: '',
    qrGeneratedAt: null,
    qrExpiresAt: null,
    whatsappNumber: '',
    whatsappVerified: false,
    whatsappMessage: 'Hola, te comparto mi tarjeta de presentación digital.',
    schedule: { ...DEFAULT_SCHEDULE },
    services: [],
    products: [],
    gallery: [],
    blog: [],
    testimonials: [],
    team: [],
    socialLinks: { ...DEFAULT_SOCIAL },
    instagramEmbed: '',
    floatingFrames: [],
    banner: { enabled: false, title: '', text: '', imageUrl: '', linkUrl: '' },
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    privacyPolicy: '',
    terms: '',
    activeSections: [
      'detalles', 'servicios', 'productos', 'galeria', 'blog',
      'testimonios', 'equipo', 'sociales', 'qr', 'horario'
    ],
    hideBrand: false,
    passwordProtected: false,
    cardPassword: '',
    views: 0,
    qrScans: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
    affiliateCode: '',
    affiliateClicks: 0,
  };
}

// Usuarios demo
const DEMO_USERS: User[] = [
  {
    id: 'user-gratis',
    email: 'demo@gratis.com',
    password: 'demo123',
    name: 'Usuario Demo Gratis',
    plan: 'gratis',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-basico',
    email: 'demo@basico.com',
    password: 'demo123',
    name: 'Usuario Demo Básico',
    plan: 'basico',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-pro',
    email: 'demo@pro.com',
    password: 'demo123',
    name: 'Usuario Demo Pro',
    plan: 'pro',
    createdAt: new Date().toISOString(),
  },
];

// Tarjetas demo iniciales
function createDemoCards(): BusinessCard[] {
  const cards: BusinessCard[] = [];

  // Tarjeta del usuario gratis
  const freeCard = createDefaultCard('user-gratis', 'gratis', 'juan-perez', 'Juan Pérez');
  freeCard.description = 'Diseñador gráfico independiente. Especialista en branding e identidad visual para pequeñas empresas.';
  freeCard.profilePhoto = '';
  freeCard.whatsappNumber = '525512345678';
  freeCard.whatsappVerified = true;
  freeCard.whatsappMessage = '¡Hola! Me contacto desde tu tarjeta digital. Me gustaría más información.';
  const freeQr = generateQrExpiration();
  freeCard.qrGeneratedAt = freeQr.generatedAt;
  freeCard.qrExpiresAt = freeQr.expiresAt;
  freeCard.views = 142;
  freeCard.qrScans = 38;
  cards.push(freeCard);

  // Tarjetas del usuario básico
  const basicCard1 = createDefaultCard('user-basico', 'basico', 'consultorio-medico', 'Dra. María González');
  basicCard1.description = 'Médico cirujano especialista en medicina interna. Cédula profesional 1234567. Atención con cita previa.';
  basicCard1.whatsappNumber = '525587654321';
  basicCard1.whatsappVerified = true;
  basicCard1.primaryColor = '#0891b2';
  basicCard1.secondaryColor = '#06b6d4';
  basicCard1.template = 'elegante';
  basicCard1.fontFamily = 'lora';
  basicCard1.services = [
    { id: generateId(), name: 'Consulta General', url: '', description: 'Consulta de medicina interna general. Duración 45 min.', photo: '' },
    { id: generateId(), name: 'Consulta de Seguimiento', url: '', description: 'Revisión de tratamiento y evolución. Duración 30 min.', photo: '' },
  ];
  basicCard1.testimonials = [
    { id: generateId(), name: 'Carlos Ramírez', text: 'Excelente atención, muy profesional y empática. Recomendada al 100%.', photo: '', rating: 5 },
    { id: generateId(), name: 'Ana Torres', text: 'La Dra. González explica todo con claridad. Me sentí muy bien atendida.', photo: '', rating: 5 },
  ];
  basicCard1.team = [
    { id: generateId(), name: 'Dra. María González', role: 'Médico Internista', photo: '', bio: '10 años de experiencia', appointmentDuration: 45, appointmentPrice: 800, isPaid: true },
  ];
  basicCard1.socialLinks = {
    ...DEFAULT_SOCIAL,
    facebook: 'https://facebook.com/dra-gonzalez',
    instagram: 'https://instagram.com/dra-gonzalez',
    linkedin: 'https://linkedin.com/in/dra-gonzalez',
  };
  basicCard1.schedule = {
    monday: { open: true, start: '09:00', end: '15:00' },
    tuesday: { open: true, start: '09:00', end: '15:00' },
    wednesday: { open: true, start: '09:00', end: '15:00' },
    thursday: { open: true, start: '09:00', end: '15:00' },
    friday: { open: true, start: '09:00', end: '14:00' },
    saturday: { open: false, start: '00:00', end: '00:00' },
    sunday: { open: false, start: '00:00', end: '00:00' },
  };
  basicCard1.qrGeneratedAt = new Date().toISOString();
  basicCard1.qrExpiresAt = null; // No expira en plan basico
  basicCard1.views = 342;
  basicCard1.qrScans = 156;
  cards.push(basicCard1);

  const basicCard2 = createDefaultCard('user-basico', 'basico', 'boutique-rosa', 'Boutique Rosa');
  basicCard2.description = 'Boutique de moda femenina. Las últimas tendencias en ropa, accesorios y calzado.';
  basicCard2.whatsappNumber = '525511223344';
  basicCard2.whatsappVerified = true;
  basicCard2.primaryColor = '#be123c';
  basicCard2.secondaryColor = '#f43f5e';
  basicCard2.template = 'moderno';
  basicCard2.products = [
    { id: generateId(), name: 'Vestido Floral Verano', price: 599, currency: 'MXN', description: 'Vestido floral de manga corta, 100% algodón', image: '', url: '' },
    { id: generateId(), name: 'Bolso de Cuero Artesanal', price: 1299, currency: 'MXN', description: 'Bolso hecho a mano en piel genuina', image: '', url: '' },
  ];
  basicCard2.gallery = [];
  basicCard2.socialLinks = {
    ...DEFAULT_SOCIAL,
    instagram: 'https://instagram.com/boutique-rosa',
    facebook: 'https://facebook.com/boutique-rosa',
  };
  basicCard2.qrGeneratedAt = new Date().toISOString();
  basicCard2.views = 528;
  basicCard2.qrScans = 234;
  cards.push(basicCard2);

  // Tarjetas del usuario pro
  const proCard1 = createDefaultCard('user-pro', 'pro', 'restaurante-sabor', 'Restaurante El Sabor');
  proCard1.description = 'El auténtico sabor de la cocina mexicana. Tradición, sabor y calidad en cada platillo.';
  proCard1.whatsappNumber = '525599887766';
  proCard1.whatsappVerified = true;
  proCard1.primaryColor = '#ea580c';
  proCard1.secondaryColor = '#fb923c';
  proCard1.template = 'dinamica';
  proCard1.services = [
    { id: generateId(), name: 'Reservación de Mesa', url: '', description: 'Reserva tu mesa para una experiencia única', photo: '' },
    { id: generateId(), name: 'Evento Privado', url: '', description: 'Organizamos tu evento especial', photo: '' },
    { id: generateId(), name: 'Servicio a Domicilio', url: 'https://ubereats.com', description: 'Pide tus favoritos a domicilio', photo: '' },
  ];
  proCard1.products = [
    { id: generateId(), name: 'Tacos al Pastor (orden)', price: 120, currency: 'MXN', description: '5 tacos de pastor con piña, cilantro y cebolla', image: '', url: '' },
    { id: generateId(), name: 'Mole Poblano', price: 185, currency: 'MXN', description: 'Tradicional mole poblano con pollo y arroz', image: '', url: '' },
    { id: generateId(), name: 'Guacamole con Totopos', price: 95, currency: 'MXN', description: 'Guacamole fresco preparado al momento', image: '', url: '' },
  ];
  proCard1.testimonials = [
    { id: generateId(), name: 'Pedro Martínez', text: 'El mejor restaurante de comida mexicana de la zona. Los tacos son increíbles.', photo: '', rating: 5 },
    { id: generateId(), name: 'Laura Sánchez', text: 'Ambiente familiar y delicioso. Volveré sin duda.', photo: '', rating: 5 },
    { id: generateId(), name: 'Miguel Ángel', text: 'El mole es espectacular, como el de mi abuela.', photo: '', rating: 5 },
  ];
  proCard1.team = [
    { id: generateId(), name: 'Chef Roberto', role: 'Chef Ejecutivo', photo: '', bio: '20 años de experiencia en cocina mexicana', appointmentDuration: 60, appointmentPrice: 0, isPaid: false },
    { id: generateId(), name: 'Carmen Díaz', role: 'Gerente', photo: '', bio: 'Atención al cliente de excelencia', appointmentDuration: 30, appointmentPrice: 0, isPaid: false },
  ];
  proCard1.socialLinks = {
    facebook: 'https://facebook.com/restaurante-sabor',
    instagram: 'https://instagram.com/restaurante-sabor',
    tiktok: 'https://tiktok.com/@restaurante-sabor',
    youtube: '',
    twitter: '',
    linkedin: '',
    whatsapp: '525599887766',
    telegram: '',
  };
  proCard1.banner = {
    enabled: true,
    title: '¡Promoción Especial!',
    text: '2x1 en tacos al pastor todos los martes. ¡No te lo pierdas!',
    imageUrl: '',
    linkUrl: '',
  };
  proCard1.hideBrand = true;
  proCard1.seoTitle = 'Restaurante El Sabor - Auténtica Comida Mexicana';
  proCard1.seoDescription = 'El mejor restaurante de comida mexicana. Tacos, mole, guacamole y más. Reserva tu mesa.';
  proCard1.seoKeywords = 'restaurante mexicano, comida mexicana, tacos, mole, reservación';
  proCard1.qrGeneratedAt = new Date().toISOString();
  proCard1.views = 1247;
  proCard1.qrScans = 489;
  proCard1.affiliateCode = 'SABOR2024';
  proCard1.affiliateClicks = 34;
  cards.push(proCard1);

  const proCard2 = createDefaultCard('user-pro', 'pro', 'tech-solutions', 'Tech Solutions MX');
  proCard2.description = 'Agencia de desarrollo de software y marketing digital. Soluciones tecnológicas a tu medida.';
  proCard2.whatsappNumber = '525544332211';
  proCard2.whatsappVerified = true;
  proCard2.primaryColor = '#7c3aed';
  proCard2.secondaryColor = '#a78bfa';
  proCard2.template = 'moderno';
  proCard2.services = [
    { id: generateId(), name: 'Desarrollo Web', url: '', description: 'Sitios web modernos con Next.js y React', photo: '' },
    { id: generateId(), name: 'Apps Móviles', url: '', description: 'Aplicaciones iOS y Android nativas', photo: '' },
    { id: generateId(), name: 'Marketing Digital', url: '', description: 'SEO, SEM y redes sociales', photo: '' },
    { id: generateId(), name: 'Consultoría TI', url: '', description: 'Asesoría tecnológica para empresas', photo: '' },
  ];
  proCard2.blog = [
    { id: generateId(), title: '5 tendencias de desarrollo web en 2024', description: 'Descubre las tecnologías que dominarán este año.', image: '', date: new Date().toISOString() },
    { id: generateId(), title: 'Cómo optimizar tu SEO local', description: 'Guía completa para aparecer en Google Maps.', image: '', date: new Date().toISOString() },
  ];
  proCard2.testimonials = [
    { id: generateId(), name: 'Empresa ABC', text: 'Tech Solutions transformó nuestra presencia digital. Resultados excepcionales.', photo: '', rating: 5 },
    { id: generateId(), name: 'Startup XYZ', text: 'Profesionales, rápidos y creativos. Los recomendamos totalmente.', photo: '', rating: 5 },
  ];
  proCard2.socialLinks = {
    ...DEFAULT_SOCIAL,
    linkedin: 'https://linkedin.com/company/tech-solutions-mx',
    facebook: 'https://facebook.com/techsolutionsmx',
    instagram: 'https://instagram.com/techsolutionsmx',
    twitter: 'https://twitter.com/techsolutionsmx',
  };
  proCard2.qrGeneratedAt = new Date().toISOString();
  proCard2.views = 892;
  proCard2.qrScans = 312;
  cards.push(proCard2);

  return cards;
}

// Mensajes demo
const DEMO_MESSAGES: ContactMessage[] = [
  {
    id: generateId(), cardId: '', name: 'Patricia López', email: 'patricia@email.com',
    phone: '5512345678', message: 'Hola, me interesa agendar una cita. ¿Tienen disponibilidad esta semana?',
    date: new Date(Date.now() - 86400000).toISOString(), read: false,
  },
  {
    id: generateId(), cardId: '', name: 'Roberto Cruz', email: 'roberto@email.com',
    phone: '5587654321', message: 'Excelente servicio, me gustaría más información sobre sus paquetes.',
    date: new Date(Date.now() - 172800000).toISOString(), read: true,
  },
  {
    id: generateId(), cardId: '', name: 'Sofía Medina', email: 'sofia@email.com',
    phone: '5511223344', message: '¿Tienen promociones para nuevos clientes?',
    date: new Date(Date.now() - 259200000).toISOString(), read: false,
  },
];

const DEMO_APPOINTMENTS: Appointment[] = [
  {
    id: generateId(), teamMemberId: '', clientName: 'Jorge Ruiz', clientEmail: 'jorge@email.com',
    date: new Date(Date.now() + 86400000).toISOString(), time: '10:00', status: 'confirmed',
  },
  {
    id: generateId(), teamMemberId: '', clientName: 'Diana Flores', clientEmail: 'diana@email.com',
    date: new Date(Date.now() + 172800000).toISOString(), time: '15:30', status: 'pending',
  },
];

// Notificaciones demo del Centro de Notificaciones (Task 11-a)
function isoMinutesAgo(min: number) {
  return new Date(Date.now() - min * 60 * 1000).toISOString();
}

const DEMO_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    type: 'message',
    title: 'Nuevo mensaje de Patricia López',
    description: 'Hola, me interesa agendar una cita. ¿Tienen disponibilidad esta semana?',
    timestamp: isoMinutesAgo(8),
    read: false,
    actionLabel: 'Ver mensaje',
    actionView: 'dashboard',
    priority: 'high',
  },
  {
    id: 'notif-2',
    type: 'qr_scan',
    title: 'Tu QR fue escaneado',
    description: 'Tu código QR fue escaneado hace unos minutos desde un dispositivo móvil en CDMX.',
    timestamp: isoMinutesAgo(45),
    read: false,
    actionLabel: 'Ver estadísticas',
    actionView: 'stats',
    priority: 'medium',
  },
  {
    id: 'notif-3',
    type: 'view_milestone',
    title: '¡Felicidades! Superaste las 1000 vistas',
    description: 'Tu tarjeta "Restaurante El Sabor" alcanzó 1247 visitas totales. ¡Sigue compartiendo!',
    timestamp: isoMinutesAgo(180),
    read: false,
    actionLabel: 'Ver analítica',
    actionView: 'stats',
    priority: 'medium',
  },
  {
    id: 'notif-4',
    type: 'appointment',
    title: 'Nueva cita agendada',
    description: 'Jorge Ruiz agendó una cita para mañana a las 10:00 AM con la Dra. María González.',
    timestamp: isoMinutesAgo(320),
    read: true,
    actionLabel: 'Ver citas',
    actionView: 'dashboard',
    priority: 'high',
  },
  {
    id: 'notif-5',
    type: 'limit_warning',
    title: 'Has alcanzado el límite de tu plan',
    description: 'Tu plan Básico permite 2 tarjetas. Mejora a Pro para crear hasta 5 tarjetas y desbloquear más funciones.',
    timestamp: isoMinutesAgo(720),
    read: false,
    actionLabel: 'Mejorar plan',
    actionView: 'pricing',
    priority: 'high',
  },
  {
    id: 'notif-6',
    type: 'payment',
    title: 'Pago procesado correctamente',
    description: 'Tu pago de $199 MXN por el plan Básico fue procesado con éxito. ¡Gracias por tu confianza!',
    timestamp: isoMinutesAgo(1440),
    read: true,
    actionLabel: 'Ver facturación',
    actionView: 'settings',
    priority: 'low',
  },
  {
    id: 'notif-7',
    type: 'card_updated',
    title: 'Tarjeta actualizada',
    description: 'Actualizaste los servicios y productos de tu tarjeta "Boutique Rosa". Los cambios ya están visibles.',
    timestamp: isoMinutesAgo(2880),
    read: true,
    actionLabel: 'Editar tarjeta',
    actionView: 'dashboard',
    priority: 'low',
  },
  {
    id: 'notif-8',
    type: 'system',
    title: 'Nueva función disponible',
    description: 'Ahora puedes comparar el rendimiento de tus tarjetas lado a lado. Descubre qué tarjeta funciona mejor.',
    timestamp: isoMinutesAgo(4320),
    read: false,
    actionLabel: 'Probar comparador',
    actionView: 'compare',
    priority: 'medium',
  },
];

// Tickets de soporte demo
const DEMO_SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: 'ticket-demo-1',
    userId: 'user-pro',
    subject: 'No puedo personalizar el código QR',
    category: 'tecnico',
    priority: 'media',
    message: 'Hola, intento cambiar el color del código QR en mi tarjeta pero al guardar los cambios no se aplican. Ya intenté refrescar la página.',
    status: 'resuelto',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    responses: [
      {
        author: 'Soporte FTP Digital Plus',
        message: 'Hola, gracias por contactarnos. Hemos revisado tu cuenta y detectamos un problema de caché. Por favor, intenta limpiar la caché de tu navegador y vuelve a guardar los cambios. Si el problema persiste, avísanos.',
        date: new Date(Date.now() - 170000000).toISOString(),
      },
      {
        author: 'Usuario',
        message: '¡Muchas gracias! Limpié la caché y ya funciona perfectamente. Pueden cerrar el ticket.',
        date: new Date(Date.now() - 168000000).toISOString(),
      },
      {
        author: 'Soporte FTP Digital Plus',
        message: 'Perfecto, marcamos tu ticket como resuelto. Quedamos atentos por si necesitas algo más. ¡Que tengas un excelente día!',
        date: new Date(Date.now() - 167000000).toISOString(),
      },
    ],
  },
  {
    id: 'ticket-demo-2',
    userId: 'user-basico',
    subject: 'Consulta sobre upgrade a plan Pro',
    category: 'facturacion',
    priority: 'baja',
    message: 'Buenos días, estoy considerando cambiar al plan Pro. ¿Pueden informarme si el pago es anual únicamente o si tienen opción de pago mensual?',
    status: 'en_progreso',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    responses: [
      {
        author: 'Soporte FTP Digital Plus',
        message: 'Hola, gracias por tu interés en el plan Pro. Actualmente el plan Pro tiene un costo anual de $500 MXN, lo que equivale a aproximadamente $41.66 MXN al mes. No contamos con opción de pago mensual por separado, pero el pago anual te representa un ahorro considerable. ¿Te gustaría que procedamos con la actualización?',
        date: new Date(Date.now() - 82000000).toISOString(),
      },
    ],
  },
];

interface AppState {
  // Auth
  currentUser: User | null;
  users: User[];
  // Navigation
  currentView: ViewType;
  selectedCardId: string | null;
  selectedEditorSection: string;
  selectedPlanForCheckout: PlanType | null;
  // Data
  cards: BusinessCard[];
  messages: ContactMessage[];
  appointments: Appointment[];
  // Favorites (Task 6-c)
  favoriteCardIds: string[];
  // Support tickets (Task 6-a)
  supportTickets: SupportTicket[];
  // Tour (Task 8-b) — session-only, not persisted
  tourActive: boolean;
  // Blog (Task 9-a) — session-only, not persisted
  selectedBlogPost: string | null;
  // Compare cards (Task 10-a) — session-only, not persisted
  compareCardIds: string[];
  // Notifications (Task 11-a) — persisted
  notifications: AppNotification[];
  // Actions
  login: (email: string, password: string) => boolean;
  logout: () => void;
  navigate: (view: ViewType) => void;
  selectCard: (cardId: string | null) => void;
  setEditorSection: (section: string) => void;
  setSelectedPlanForCheckout: (plan: PlanType | null) => void;
  createCard: (linkName: string, cardName: string) => string | null;
  updateCard: (cardId: string, updates: Partial<BusinessCard>) => void;
  deleteCard: (cardId: string) => void;
  toggleCardActive: (cardId: string) => void;
  generateQr: (cardId: string) => void;
  recordCardView: (cardId: string) => void;
  recordQrScan: (cardId: string) => void;
  addMessage: (cardId: string, message: Omit<ContactMessage, 'id' | 'cardId' | 'date' | 'read'>) => void;
  markMessageRead: (messageId: string) => void;
  addAppointment: (appt: Omit<Appointment, 'id'>) => void;
  upgradePlan: (plan: PlanType) => void;
  updateUser: (updates: Partial<User>) => void;
  toggleFavorite: (cardId: string) => void;
  addTicket: (ticket: Omit<SupportTicket, 'id' | 'status' | 'createdAt' | 'responses'>) => string;
  addTicketResponse: (ticketId: string, response: SupportTicketResponse, status?: SupportTicket['status']) => void;
  setTourActive: (active: boolean) => void;
  setSelectedBlogPost: (postId: string | null) => void;
  setCompareCards: (cardIds: string[]) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
  addNotification: (notification: Omit<AppNotification, 'id'>) => void;
  // Importación de tarjetas (Task 12-b)
  importCard: (card: BusinessCard) => string | null;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: DEMO_USERS,
      currentView: 'landing',
      selectedCardId: null,
      selectedEditorSection: 'detalles',
      selectedPlanForCheckout: null,
      cards: createDemoCards(),
      messages: DEMO_MESSAGES,
      appointments: DEMO_APPOINTMENTS,
      favoriteCardIds: [],
      supportTickets: DEMO_SUPPORT_TICKETS,
      tourActive: false,
      selectedBlogPost: null,
      compareCardIds: [],
      notifications: DEMO_NOTIFICATIONS,

      login: (email, password) => {
        const user = get().users.find(
          u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );
        if (user) {
          set({ currentUser: user, currentView: 'dashboard' });
          return true;
        }
        return false;
      },

      logout: () => {
        set({ currentUser: null, currentView: 'landing', selectedCardId: null });
      },

      navigate: (view) => set({ currentView: view }),

      selectCard: (cardId) => set({ selectedCardId: cardId }),

      setEditorSection: (section) => set({ selectedEditorSection: section }),

      setSelectedPlanForCheckout: (plan) => set({ selectedPlanForCheckout: plan }),

      createCard: (linkName, cardName) => {
        const user = get().currentUser;
        if (!user) return null;
        const userCards = get().cards.filter(c => c.userId === user.id);
        if (userCards.length >= PLANS[user.plan].maxCards) return null;
        const newCard = createDefaultCard(user.id, user.plan, linkName, cardName);
        set(state => ({ cards: [...state.cards, newCard], selectedCardId: newCard.id }));
        return newCard.id;
      },

      updateCard: (cardId, updates) => {
        set(state => ({
          cards: state.cards.map(c => c.id === cardId ? { ...c, ...updates } : c),
        }));
      },

      deleteCard: (cardId) => {
        set(state => ({ cards: state.cards.filter(c => c.id !== cardId) }));
      },

      toggleCardActive: (cardId) => {
        set(state => ({
          cards: state.cards.map(c =>
            c.id === cardId ? { ...c, isActive: !c.isActive } : c
          ),
        }));
      },

      generateQr: (cardId) => {
        const card = get().cards.find(c => c.id === cardId);
        if (!card) return;
        const user = get().users.find(u => u.id === card.userId);
        const plan = user?.plan || 'gratis';
        if (PLANS[plan].qrExpires) {
          const { generatedAt, expiresAt } = generateQrExpiration();
          get().updateCard(cardId, { qrGeneratedAt: generatedAt, qrExpiresAt: expiresAt });
        } else {
          get().updateCard(cardId, { qrGeneratedAt: new Date().toISOString(), qrExpiresAt: null });
        }
      },

      recordCardView: (cardId) => {
        set(state => ({
          cards: state.cards.map(c =>
            c.id === cardId ? { ...c, views: c.views + 1 } : c
          ),
        }));
      },

      recordQrScan: (cardId) => {
        set(state => ({
          cards: state.cards.map(c =>
            c.id === cardId ? { ...c, qrScans: c.qrScans + 1 } : c
          ),
        }));
      },

      addMessage: (cardId, message) => {
        const newMessage: ContactMessage = {
          ...message,
          id: generateId(),
          cardId,
          date: new Date().toISOString(),
          read: false,
        };
        set(state => ({ messages: [newMessage, ...state.messages] }));
      },

      markMessageRead: (messageId) => {
        set(state => ({
          messages: state.messages.map(m =>
            m.id === messageId ? { ...m, read: true } : m
          ),
        }));
      },

      addAppointment: (appt) => {
        set(state => ({
          appointments: [...state.appointments, { ...appt, id: generateId() }],
        }));
      },

      upgradePlan: (plan) => {
        const user = get().currentUser;
        if (!user) return;
        set(state => ({
          users: state.users.map(u =>
            u.id === user.id ? { ...u, plan } : u
          ),
          currentUser: { ...user, plan },
        }));
      },

      updateUser: (updates) => {
        const user = get().currentUser;
        if (!user) return;
        const updatedUser = { ...user, ...updates };
        set(state => ({
          users: state.users.map(u =>
            u.id === user.id ? { ...u, ...updates } : u
          ),
          currentUser: updatedUser,
        }));
      },

      toggleFavorite: (cardId) => {
        set(state => ({
          favoriteCardIds: state.favoriteCardIds.includes(cardId)
            ? state.favoriteCardIds.filter(id => id !== cardId)
            : [...state.favoriteCardIds, cardId],
        }));
      },

      addTicket: (ticket) => {
        const newTicket: SupportTicket = {
          ...ticket,
          id: generateId(),
          status: 'abierto',
          createdAt: new Date().toISOString(),
          responses: [],
        };
        set(state => ({ supportTickets: [newTicket, ...state.supportTickets] }));
        return newTicket.id;
      },

      addTicketResponse: (ticketId, response, status) => {
        set(state => ({
          supportTickets: state.supportTickets.map(t =>
            t.id === ticketId
              ? {
                  ...t,
                  status: status ?? t.status,
                  responses: [...t.responses, response],
                }
              : t
          ),
        }));
      },

      setTourActive: (active) => set({ tourActive: active }),

      setSelectedBlogPost: (postId) => set({ selectedBlogPost: postId }),

      setCompareCards: (cardIds) => set({ compareCardIds: cardIds }),

      markNotificationRead: (id) => {
        set(state => ({
          notifications: state.notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
          ),
        }));
      },

      markAllNotificationsRead: () => {
        set(state => ({
          notifications: state.notifications.map(n => ({ ...n, read: true })),
        }));
      },

      deleteNotification: (id) => {
        set(state => ({
          notifications: state.notifications.filter(n => n.id !== id),
        }));
      },

      addNotification: (notification) => {
        const newNotification: AppNotification = {
          ...notification,
          id: generateId(),
        };
        set(state => ({ notifications: [newNotification, ...state.notifications] }));
      },

      // Importa una tarjeta desde un archivo JSON externo. Genera un nuevo ID,
      // la asocia al usuario actual, y verifica que el plan permita más tarjetas.
      // Devuelve el nuevo ID o `null` si el límite fue alcanzado.
      importCard: (card) => {
        const user = get().currentUser;
        if (!user) return null;
        const userCards = get().cards.filter(c => c.userId === user.id);
        if (userCards.length >= PLANS[user.plan].maxCards) {
          return null;
        }
        // Generar un nuevo ID único y sanitizar el linkName para evitar duplicados.
        const newId = generateId();
        let newLinkName = (card.linkName || '').trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
        if (newLinkName.length < 3) newLinkName = `import-${newId.substring(0, 6)}`;
        // Evitar colisión de linkName con tarjetas existentes
        const existingLinkNames = new Set(get().cards.map(c => c.linkName));
        let attempt = 0;
        let finalLinkName = newLinkName;
        while (existingLinkNames.has(finalLinkName) && attempt < 50) {
          attempt++;
          finalLinkName = `${newLinkName}-${attempt}`;
        }
        const importedCard: BusinessCard = {
          ...card,
          id: newId,
          userId: user.id,
          linkName: finalLinkName,
          // Resetear stats al importar (la tarjeta "nace" en la cuenta actual)
          views: 0,
          qrScans: 0,
          affiliateClicks: 0,
          createdAt: new Date().toISOString(),
          // Regenerar QR si el plan lo permite (no copiar QR de otra cuenta)
          qrGeneratedAt: null,
          qrExpiresAt: null,
        };
        set(state => ({
          cards: [...state.cards, importedCard],
          selectedCardId: importedCard.id,
        }));
        return importedCard.id;
      },
    }),
    {
      name: 'ftp-digital-plus-store',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return window.localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({
        currentUser: state.currentUser,
        users: state.users,
        cards: state.cards,
        messages: state.messages,
        appointments: state.appointments,
        favoriteCardIds: state.favoriteCardIds,
        supportTickets: state.supportTickets,
        selectedPlanForCheckout: state.selectedPlanForCheckout,
        notifications: state.notifications,
      }),
    }
  )
);

// Selectores helper
export function useCurrentUserCards() {
  return useAppStore(useShallow(state => {
    if (!state.currentUser) return [] as BusinessCard[];
    return state.cards.filter(c => c.userId === state.currentUser!.id);
  }));
}

export function useSelectedCard() {
  return useAppStore(state => {
    if (!state.selectedCardId) return null;
    return state.cards.find(c => c.id === state.selectedCardId) || null;
  });
}
