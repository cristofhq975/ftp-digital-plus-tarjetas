// Casos de éxito para FTP Digital Plus — Task 11-a
// Datos demo de clientes reales que transformaron su presencia digital.

export interface CaseResult {
  metric: string;
  value: string;
  improvement: string;
}

export interface CaseTestimonial {
  quote: string;
  author: string;
  role: string;
  avatar: string; // iniciales para el avatar con gradiente
}

export interface CaseStudy {
  id: string;
  slug: string;
  clientName: string;
  clientType: string;
  industry: 'restaurantes' | 'salud' | 'retail' | 'servicios' | 'legal' | 'bienestar';
  plan: 'basico' | 'pro';
  challenge: string;
  solution: string;
  results: CaseResult[];
  testimonial: CaseTestimonial;
  duration: string;
  image: string; // clase de gradiente Tailwind
  featured: boolean;
  tags: string[];
  createdAt: string; // ISO para ordenar por "recientes"
}

export const INDUSTRY_LABELS: Record<CaseStudy['industry'], string> = {
  restaurantes: 'Restaurantes',
  salud: 'Salud',
  retail: 'Retail',
  servicios: 'Servicios',
  legal: 'Legal',
  bienestar: 'Bienestar',
};

export const SUCCESS_CASES: CaseStudy[] = [
  {
    id: 'case-1',
    slug: 'restaurante-el-sabor',
    clientName: 'Restaurante El Sabor',
    clientType: 'Restaurante',
    industry: 'restaurantes',
    plan: 'pro',
    challenge:
      'El Restaurante El Sabor dependía casi exclusivamente del boca a boca y de un sitio web desactualizado. Las reservaciones se perdían por llamadas no atendidas y los clientes no tenían forma sencilla de ver el menú o agendar una mesa.',
    solution:
      'Implementamos una tarjeta digital Pro con menú interactivo, sistema de reservaciones en línea, galería de platillos y código QR permanente en cada mesa. Integraron WhatsApp Business para responder dudas en tiempo real y publicaron promociones semanales con el banner flotante.',
    results: [
      { metric: 'Reservaciones online', value: '45%', improvement: '+45% en 3 meses' },
      { metric: 'Escaneos QR', value: '489/mes', improvement: '+312% vs. tarjeta física' },
      { metric: 'Tiempo de respuesta', value: '2 min', improvement: '-87% tiempo promedio' },
      { metric: 'Clientes recurrentes', value: '68%', improvement: '+22% retención' },
    ],
    testimonial: {
      quote:
        'Desde que implementamos la tarjeta digital de FTP, las reservaciones se dispararon. Los clientes escanean el QR de la mesa y agendan en segundos. Es la mejor inversión que hemos hecho este año.',
      author: 'Chef Roberto Martínez',
      role: 'Chef Ejecutivo',
      avatar: 'RM',
    },
    duration: '3 meses',
    image: 'from-orange-500 via-amber-500 to-emerald-500',
    featured: true,
    tags: ['Restaurante', 'QR en mesa', 'Reservaciones', 'Menú digital'],
    createdAt: '2024-09-15T10:00:00.000Z',
  },
  {
    id: 'case-2',
    slug: 'dra-maria-gonzalez',
    clientName: 'Dra. María González',
    clientType: 'Consultorio médico',
    industry: 'salud',
    plan: 'basico',
    challenge:
      'La Dra. González gestionaba sus citas por teléfono y libreta. Los pacientes olvidaban sus citas, los no-shows llegaban al 25% y dedicaba horas diarias a confirmar recordatorios manualmente.',
    solution:
      'Desplegamos una tarjeta digital Básica con sistema de citas en línea, equipo multidisciplinario, recordatorios automáticos por WhatsApp y testimonials de pacientes satisfechos. Los pacientes agendan en menos de 1 minuto desde su celular.',
    results: [
      { metric: 'Reducción de no-shows', value: '-30%', improvement: '30% menos ausencias' },
      { metric: 'Citas online', value: '85%', improvement: '85% se agendan solas' },
      { metric: 'Pacientes nuevos', value: '+38%', improvement: '+38% en 4 meses' },
      { metric: 'Horas ahorradas/sem', value: '12h', improvement: '12 horas/semana liberadas' },
    ],
    testimonial: {
      quote:
        'Ahora los pacientes agendan solos desde su celular y reciben recordatorios automáticos. Los no-shows bajaron drásticamente y por fin tengo tiempo para atender a más personas. Una herramienta esencial para mi consultorio.',
      author: 'Dra. María González',
      role: 'Médico Internista',
      avatar: 'MG',
    },
    duration: '4 meses',
    image: 'from-cyan-500 via-emerald-500 to-emerald-600',
    featured: true,
    tags: ['Salud', 'Citas online', 'Recordatorios WhatsApp', 'Equipo médico'],
    createdAt: '2024-08-20T10:00:00.000Z',
  },
  {
    id: 'case-3',
    slug: 'boutique-rosa',
    clientName: 'Boutique Rosa',
    clientType: 'Tienda de moda',
    industry: 'retail',
    plan: 'pro',
    challenge:
      'Boutique Rosa vendía únicamente en tienda física. Su catálogo no estaba en línea y perdían ventas frente a competidores con presencia digital. Las clientas pedían fotos por WhatsApp, generando saturación y respuestas lentas.',
    solution:
      'Implementamos una tarjeta digital Pro con catálogo completo de productos, precios en MXN, galería de looks, integración con Instagram y botón directo de WhatsApp por producto. Cada prenda ahora se vende en 3 clics.',
    results: [
      { metric: 'Ventas online', value: '+60%', improvement: '+60% en 6 meses' },
      { metric: 'Ticket promedio', value: '+18%', improvement: '+18% por compra' },
      { metric: 'Seguidores Instagram', value: '+5400', improvement: '+42% en la cuenta' },
      { metric: 'Conversión QR', value: '34%', improvement: '34% escanea → compra' },
    ],
    testimonial: {
      quote:
        'Nuestras clientas aman poder ver todo el catálogo desde su celular y comprar por WhatsApp. Las ventas online se duplicaron y ahora atendemos clientes de toda la ciudad, no solo del barrio.',
      author: 'Rosa Méndez',
      role: 'Propietaria',
      avatar: 'RM',
    },
    duration: '6 meses',
    image: 'from-rose-500 via-pink-500 to-amber-500',
    featured: true,
    tags: ['Retail', 'Moda', 'Catálogo', 'Instagram'],
    createdAt: '2024-07-10T10:00:00.000Z',
  },
  {
    id: 'case-4',
    slug: 'tech-solutions-mx',
    clientName: 'Tech Solutions MX',
    clientType: 'Agencia digital',
    industry: 'servicios',
    plan: 'pro',
    challenge:
      'Tech Solutions MX era una agencia sin página web propia. Captaban leads por referidos pero no tenían un canal profesional para mostrar su portafolio. Los clientes potenciales dudaban de su profesionalismo al no tener un sitio donde validar su trabajo.',
    solution:
      'Desplegamos una tarjeta digital Pro con portafolio de proyectos, blog técnico de tendencias, equipo con perfiles LinkedIn, testimonios de empresas y SEO optimizado. Cada servicio tiene su landing con llamada a acción clara.',
    results: [
      { metric: 'Leads cualificados', value: '+80%', improvement: '+80% en 5 meses' },
      { metric: 'Tiempo de cierre', value: '-40%', improvement: '-40% ciclo de venta' },
      { metric: 'Tráfico orgánico', value: '+3x', improvement: 'Triplicó en Google' },
      { metric: 'Proyectos cerrados', value: '+22', improvement: '+22 nuevos proyectos' },
    ],
    testimonial: {
      quote:
        'La tarjeta digital de FTP nos dio la presencia profesional que nos faltaba. Ahora los leads llegan solos por Google y nuestro portafolio se vende solo. Es la mejor decisión que tomamos como agencia.',
      author: 'Ing. Carlos Vega',
      role: 'Director General',
      avatar: 'CV',
    },
    duration: '5 meses',
    image: 'from-violet-500 via-emerald-500 to-emerald-600',
    featured: false,
    tags: ['Servicios', 'Agencia', 'Portafolio', 'SEO', 'B2B'],
    createdAt: '2024-06-05T10:00:00.000Z',
  },
  {
    id: 'case-5',
    slug: 'chef-roberto-catering',
    clientName: 'Chef Roberto Catering',
    clientType: 'Catering',
    industry: 'restaurantes',
    plan: 'pro',
    challenge:
      'El Chef Roberto llevaba años haciendo catering por referidos. Sin embargo, no tenía forma de mostrar su menú completo, presupuestar eventos y coordinar reservas. Cada cliente potencial requería varias llamadas y correos.',
    solution:
      'Implementamos una tarjeta digital Pro con menú de catering por categorías, sistema de citas para catas, galería de eventos pasados, equipo de cocineros y formulario de presupuesto personalizado. Cada evento se cotiza en minutos.',
    results: [
      { metric: 'Eventos por mes', value: '+35%', improvement: '+35% en 4 meses' },
      { metric: 'Cotizaciones', value: '+72%', improvement: '+72% solicitudes' },
      { metric: 'Ticket promedio', value: '+25%', improvement: '+25% por evento' },
      { metric: 'Tiempo de cotización', value: '-65%', improvement: '-65% vs. manual' },
    ],
    testimonial: {
      quote:
        'Antes cotizaba cada evento a mano y tardaba días. Ahora los clientes ven mi menú, agenda una cata y cierran solos. Los eventos se dispararon y mi marca por fin se ve profesional.',
      author: 'Chef Roberto Luna',
      role: 'Chef y Fundador',
      avatar: 'RL',
    },
    duration: '4 meses',
    image: 'from-amber-500 via-orange-500 to-rose-500',
    featured: false,
    tags: ['Catering', 'Eventos', 'Cotizaciones', 'Menú digital'],
    createdAt: '2024-05-18T10:00:00.000Z',
  },
  {
    id: 'case-6',
    slug: 'estudio-juridico-lopez',
    clientName: 'Estudio Jurídico López',
    clientType: 'Abogados',
    industry: 'legal',
    plan: 'basico',
    challenge:
      'El Estudio Jurídico López dependía de directorios telefónicos y referidos. Los clientes no podían validar la experiencia del despacho y la conversación inicial solía perderse por falta de un canal profesional de contacto.',
    solution:
      'Desplegamos una tarjeta digital Básica con perfiles de cada abogado, áreas de práctica, blog de asesoría legal gratuita, formulario de consulta y protección por contraseña para clientes VIP. Cada consulta queda registrada y gestionada.',
    results: [
      { metric: 'Consultas online', value: '+50%', improvement: '+50% en 4 meses' },
      { metric: 'Casos cerrados', value: '+28%', improvement: '+28% nuevos casos' },
      { metric: 'Clientes referidos', value: '+45%', improvement: '+45% satisfacción' },
      { metric: 'Llamadas perdidas', value: '-90%', improvement: '-90% llamadas' },
    ],
    testimonial: {
      quote:
        'Nuestro despacho por fin tiene una presencia digital seria. Los clientes llegan mejor informados, leen nuestro blog y agendan consultas sin llamar. Profesionalismo total, algo fundamental en el sector legal.',
      author: 'Lic. Eduardo López',
      role: 'Socio Fundador',
      avatar: 'EL',
    },
    duration: '4 meses',
    image: 'from-emerald-600 via-emerald-500 to-amber-500',
    featured: false,
    tags: ['Legal', 'Abogados', 'Consultas', 'Blog jurídico'],
    createdAt: '2024-04-22T10:00:00.000Z',
  },
  {
    id: 'case-7',
    slug: 'spa-relax',
    clientName: 'Spa Relax',
    clientType: 'Bienestar',
    industry: 'bienestar',
    plan: 'pro',
    challenge:
      'Spa Relax gestionaba reservas por teléfono y una agenda en papel. Los clientes se frustraban al no poder reservar fuera de horario comercial y el personal perdía horas confirmando citas por llamada.',
    solution:
      'Implementamos una tarjeta digital Pro con sistema de reservas 24/7, equipo de terapeutas con perfiles, galería de tratamientos, promociones semanales y reconfirmación automática por WhatsApp. Cada cliente reserva cuando quiere.',
    results: [
      { metric: 'Reservas online', value: '+70%', improvement: '+70% en 5 meses' },
      { metric: 'Ocupación', value: '92%', improvement: '+34 puntos' },
      { metric: 'Cancelaciones', value: '-45%', improvement: '-45% cancelaciones' },
      { metric: 'NPS satisfacción', value: '4.8/5', improvement: '+0.6 puntos' },
    ],
    testimonial: {
      quote:
        'Las clientas aman poder reservar a cualquier hora desde su celular. Nuestra ocupación subió al 92% y por fin tenemos un sistema que no depende del teléfono. Una transformación total para el spa.',
      author: 'Mariana Torres',
      role: 'Gerente',
      avatar: 'MT',
    },
    duration: '5 meses',
    image: 'from-teal-500 via-emerald-500 to-emerald-600',
    featured: false,
    tags: ['Bienestar', 'Spa', 'Reservas 24/7', 'WhatsApp'],
    createdAt: '2024-03-30T10:00:00.000Z',
  },
  {
    id: 'case-8',
    slug: 'automecanica-express',
    clientName: 'AutoMecánica Express',
    clientType: 'Servicios automotrices',
    industry: 'servicios',
    plan: 'basico',
    challenge:
      'AutoMecánica Express era un taller local sin presencia digital. Los clientes no sabían qué servicios ofrecían ni podían agendar una cita sin llamar. Las promociones de cambio de aceite y mantenimiento se perdían por falta de canal.',
    solution:
      'Desplegamos una tarjeta digital Básica con catálogo de servicios, precios transparentes, sistema de citas, galería de trabajos realizados y botón directo de WhatsApp para cotizaciones rápidas. QR permanente en la recepción.',
    results: [
      { metric: 'Clientes nuevos', value: '+40%', improvement: '+40% en 6 meses' },
      { metric: 'Citas agendadas', value: '+62%', improvement: '+62% online' },
      { metric: 'Ticket promedio', value: '+15%', improvement: '+15% por servicio' },
      { metric: 'Reseñas 5 estrellas', value: '+87', improvement: '+87 reseñas' },
    ],
    testimonial: {
      quote:
        'Nunca imaginé que un taller mecánico necesitara presencia digital. Ahora los clientes ven nuestros servicios, leen reseñas y agendan sin llamar. Los clientes nuevos aumentaron un 40% en 6 meses.',
      author: 'Mec. Juan Hernández',
      role: 'Propietario',
      avatar: 'JH',
    },
    duration: '6 meses',
    image: 'from-amber-500 via-amber-600 to-emerald-600',
    featured: false,
    tags: ['Servicios', 'Automotriz', 'Citas', 'Catálogo'],
    createdAt: '2024-02-14T10:00:00.000Z',
  },
];

// Selectores utilitarios
export function getFeaturedCases(limit = 3): CaseStudy[] {
  const featured = SUCCESS_CASES.filter(c => c.featured);
  if (featured.length >= limit) return featured.slice(0, limit);
  // Rellenar con casos no destacados si no hay suficientes featured
  const fillers = SUCCESS_CASES.filter(c => !c.featured);
  return [...featured, ...fillers].slice(0, limit);
}

export function getCaseBySlug(slug: string): CaseStudy | undefined {
  return SUCCESS_CASES.find(c => c.slug === slug);
}

export function getIndustryCases(industry: CaseStudy['industry'] | 'todos'): CaseStudy[] {
  if (industry === 'todos') return SUCCESS_CASES;
  return SUCCESS_CASES.filter(c => c.industry === industry);
}
