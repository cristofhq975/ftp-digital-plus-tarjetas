# FTP Digital Plus - Tarjetas de Presentación Digitales

## Estado del Proyecto: En Desarrollo

### Descripción
Demo de plataforma web para crear tarjetas de presentación digitales con 3 planes (Gratis, Básico, Pro), inspirada en los manuales de TD Pro y adaptada para FTP Digital Plus.

### Decisiones de Diseño
- **Paleta**: Esmeralda (#059669) + Oro (#f59e0b) - identidad FTP Digital Plus
- **Idioma**: 100% Español
- **Datos**: In-memory (Zustand + localStorage persist)
- **Auth**: Usuarios demo pre-creados (demo@gratis.com, demo@basico.com, demo@pro.com / demo123)
- **Routing**: SPA basado en estado (única ruta `/`)

### Planes
- **Gratis ($0)**: 1 tarjeta, solo imagen descargable con QR (vence 7 días), marca de agua FTP, WhatsApp
- **Básico ($199)**: 2 tarjetas, imagen + web, QR permanente, sin marca de agua, todas las funciones excepto enlaces personalizados
- **Pro ($500/año)**: 5 tarjetas, imagen + web, QR permanente, todas las funciones + enlaces personalizados + analítica avanzada

### Usuarios Demo
- demo@gratis.com / demo123 — Plan Gratis
- demo@basico.com / demo123 — Plan Básico
- demo@pro.com / demo123 — Plan Pro

---
Task ID: 1
Agent: Main (Z.ai Code)
Task: Fundación del proyecto - branding, tipos, store, utilidades

Work Log:
- Analizados 2 PDFs (Manual Panel Principal + Manual Edición) y 2 imágenes (planes básico y pro)
- Extraídas 24 funciones del manual de edición y 8 secciones del panel principal
- Instaladas dependencias: qrcode, qrcode.react, html2canvas
- Creado logo FTP Digital Plus (SVG) con gradiente esmeralda + oro
- Configurada paleta esmeralda + oro en globals.css (oklch)
- Actualizado layout.tsx con metadatos en español
- Creados tipos TypeScript completos (BusinessCard, User, Plan, etc.)
- Creada configuración de planes con features detalladas (PLANS, TEMPLATES, FONTS, COLOR_PRESETS, EDITOR_SECTIONS)
- Creadas utilidades (card-utils.ts): QR expiration, WhatsApp URL, formatos, validación
- Creado store Zustand con persistencia localStorage, 3 usuarios demo, 5 tarjetas demo
- Creada utilidad de generación de imagen de tarjeta con marca de agua (card-image.ts)
- Creado componente FTPLogo y DynamicIcon

Stage Summary:
- Fundación completa lista para construir UI
- Store con datos demo funcionando (5 tarjetas, 3 usuarios, mensajes, citas)
- 24 secciones de editor definidas en EDITOR_SECTIONS
- 5 plantillas de tarjeta: moderno, clásico, minimalista, elegante, dinámica
- Sistema de QR con vencimiento de 7 días para plan gratis
- Sistema de marca de agua para plan gratis

---
Task ID: 3-b
Agent: Subagent (Dashboard Builder)
Task: Crear componente Dashboard (Panel Principal) - `/src/components/sections/dashboard.tsx`

Work Log:
- Leído worklog previo: Task 1 (fundación) y Task 3-a (landing/pricing) — archivo store.ts, plans.ts, types.ts, ftp-logo, dynamic-icon, card-preview revisados.
- Verificada estructura de UI components: no existe barrel `@/components/ui/index.ts`, se importan desde archivos individuales (button, card, badge, switch, dialog, input, label, separator, progress, tabs, avatar, tooltip, sheet).
- Creado `/src/components/sections/dashboard.tsx` (~1000+ líneas) con `'use client'` y arquitectura modular:

  **Layout principal:**
  - Sidebar desktop fijo (w-64 lg:w-72) + Sheet drawer para móvil con hamburger
  - Top mobile bar con logo, notificaciones y botón menú
  - Main content area con AnimatePresence para transiciones entre secciones
  - Footer sticky al fondo con `mt-auto`

  **Sidebar (SidebarContent):**
  - FTPLogo arriba, info del usuario (avatar con iniciales, nombre, email)
  - Badge de plan con icono (Crown/Zap/Sparkles) y colores por plan
  - Contador "X de MAX tarjetas usadas"
  - Nav usando DASHBOARD_SECTIONS + DynamicIcon
  - Indicador de mensajes sin leer (badge con contador)
  - Botón "Cerrar Sesión" al pie con toast de confirmación

  **Tablero (default):**
  - Header de bienvenida con gradiente esmeralda, saludo "Hola, [userName] 👋" con animación wave, badge de plan
  - Aviso de límite alcanzado con CTA "Mejorar Plan" si aplica
  - 4 stat cards: Total tarjetas, Visitas, Escaneos QR, Mensajes sin leer — con gradientes esmeralda/orange/rose
  - Lista de tarjetas con CardItem: avatar con iniciales+gradiente del color de la tarjeta, nombre, enlace (ftpdigitalplus.com/t/...), badge Activa/Inactiva, stats visitas/QR, switch toggle, botones Editar/Ver/Copiar/Eliminar
  - Botón "Crear Nueva Tarjeta" que abre Dialog (linkName + cardName, validación de unicidad y límite)
  - PlanInfoCard con progreso de uso, info tiles y CTA upgrade (solo si no es Pro)

  **Otras secciones:**
  - **Messages**: Tabs (Todos/Sin leer/Leídos), lista de mensajes con avatar, badge "Nuevo", info contacto, botones Marcar leído/Responder (WhatsApp o mailto)/Copiar correo
  - **Appointments**: 3 summary tiles (pendientes/confirmadas/canceladas), lista con bloque de fecha vertical gradiente esmeralda, badges de estado
  - **Orders**: Empty state "Próximamente: Gestión de pedidos de productos" con CTA "Notificarme"
  - **Virtual-funds**: 6 diseños de tarjetas NFC (horizontales y verticales) con gradientes CSS basados en colores de la tarjeta del usuario, hover con botón descargar
  - **Affiliations**: Validación de plan (solo Básico/Pro), 3 beneficios, código de afiliado, enlace de referido con copiar, botones compartir (WhatsApp/Facebook/Email), guía "Cómo funciona"
  - **Storage**: Progress bar con cálculo dinámico (fotos de perfil, portada, galería, servicios, productos), lista scrollable con max-h-96, warning si >80%
  - **Settings**: Tabs Pagos/General. Pagos: toggles PayPal/Stripe/Transferencia + form datos bancarios. General: notificaciones email/SMS/2FA + info cuenta

  **Detalles técnicos:**
  - `useState` para activeSection, mobileOpen, createOpen
  - framer-motion: AnimatePresence para secciones y listas, staggered animations en stat cards y items
  - sonner toast en cada acción (copiar, eliminar, crear, marcar leído, guardar settings)
  - shadcn/ui: Button, Card family, Badge, Switch, Dialog, Input, Label, Separator, Progress, Tabs, Avatar, Tooltip, Sheet
  - Colores 100% esmeralda+oro (gradientes from-emerald-500 to-emerald-700, from-amber-500 to-orange-600)
  - Responsive: sidebar oculto en móvil (Sheet), grids 2-col → 4-col, hidden sm:inline para textos
  - cn() utility para clases condicionales
  - Helper components: SectionHeader, EmptyState, SummaryTile, InfoTile, PaymentMethodRow, SettingToggle, ShareButton, AlertDialogWrap
  - Limpieza de lint: reemplazado `window.location.href =` por `window.open()` para cumplir regla react-hooks/immutability

Stage Summary:
- Dashboard completo y production-ready con 8 secciones funcionales
- 0 errores de lint en dashboard.tsx (errores restantes son de landing-page.tsx y pricing-page.tsx del Task 3-a)
- Dev server compila sin errores
- Integración completa con store Zustand (currentUser, cards, messages, appointments, navigate, selectCard, createCard, deleteCard, toggleCardActive, logout, markMessageRead)
- Listo para ser montado desde app/page.tsx cuando el usuario navega a view='dashboard'

---
Task ID: 3-d
Agent: Z.ai Code (section builder)
Task: Vista pública de tarjeta (public-card.tsx) + página QR Expirado (qr-expired.tsx)

Work Log:
- Leído worklog.md, store.ts, types.ts, plans.ts, card-preview.tsx, card-image.ts, card-utils.ts, ftp-logo.tsx, button/card/dialog/select para entender convenciones y APIs.
- Creada carpeta `src/components/sections/`.
- Creado `src/components/sections/public-card.tsx`:
  - `PublicCardSection` (export): usa `useSelectedCard()`, registra vista en mount con `useEffect([card?.id])`, resuelve plan del dueño vía `users`.
  - `CardNotFound`: vista "Tarjeta no encontrada" con botón al inicio.
  - `PasswordGate`: si `card.passwordProtected`, pide contraseña y la compara con `card.cardPassword`.
  - `PublicCardLayout`: shell `min-h-screen flex flex-col` con gradiente esmeralda→ámbar, header con logo FTP (si `!card.hideBrand`), footer sticky con copyright.
  - `FloatingBanner`: popup dismissible animado (framer-motion) cuando `card.banner.enabled`.
  - `FreePlanView`: renderiza `<CardPreview>` (muestra FreeCardPreview con marca de agua + QR) + badges de estado + botón "Descargar Tarjeta" prominente con estado de carga + hint de upgrade.
  - `PaidPlanView`: renderiza `<CardPreview>` (tarjeta web completa) + toolbar de acciones (Descargar imagen, WhatsApp, Copiar) + fila secundaria de share (Facebook, Twitter/X) + `ContactFormCard` + `AppointmentBookingCard` (si card.team.length > 0).
  - `ContactFormCard`: formulario Nombre/Email/Phone/Mensaje, valida, llama `addMessage(card.id, {...})`, toast de éxito.
  - `AppointmentBookingCard`: preview de equipo + botón "Agendar cita" que abre `Dialog` con Select de miembro, fecha, hora, nombre, email; llama `addAppointment({ teamMemberId, clientName, clientEmail, date, time, status: 'pending' })`.
  - `useCardDownload` hook + `HiddenQrCanvas`: QR canvas oculto fuera de pantalla para generar data URL; llama `generateCardImage` + `downloadDataUrl` con toasts de éxito/error.
  - CTA inferior "¿Eres el dueño? Inicia sesión" → `navigate('login')`.
- Creado `src/components/sections/qr-expired.tsx`:
  - `QrExpiredSection`: gradiente rojo→ámbar→rosa con blobs decorativos.
  - Card central con visual de "QR roto" (grid 3×3 de cuadros rojos + grieta roja), badge de advertencia `AlertTriangle` con animación spring, chip flotante "7 días".
  - Headline "QR Expirado" con gradiente rojo→rosa→ámbar.
  - Mensaje explicando que los QR del plan gratuito vencen a los 7 días.
  - Card de info esmeralda explicando por qué expira y cómo mejorar.
  - CTA principal "Renueva en ftpdigitalplus.com" → `navigate('landing')`.
  - CTA secundario "¿Eres el dueño? Inicia sesión" → `navigate('login')`.
  - Footer sticky con logo FTP + copyright.
- Verificado: `npx eslint` sobre ambos archivos → 0 errores, 0 warnings. Dev server compila limpio.
- Escrito registro en `/home/z/my-project/agent-ctx/3-d-public-card-qr-expired.md`.

Stage Summary:
- Vista pública de tarjeta completa: soporta plan Gratis (solo imagen descargable con marca de agua) y planes Básico/Pro (tarjeta web + formulario de contacto + agendamiento de citas + banner flotante + compartir + descarga de imagen + protección por contraseña).
- Página QR Expirado con diseño pulido, animaciones framer-motion y CTAs hacia landing/login.
- Ambos componentes usan shadcn/ui, lucide-react, sonner, framer-motion, paleta esmeralda+oro, 100% español, responsive mobile-first, footer sticky.
- Listos para integrarse en el router SPA cuando `currentView === 'public-card'` o `currentView === 'qr-expired'`.

---
Task ID: 3-c
Agent: Subagent C (Card Editor)
Task: Crear componente Card Editor con las 24 secciones de edición

Work Log:
- Leído worklog.md y revisado tipos, store, planes y card-preview existentes
- Detectado que `formatPhone` era referenciado en card-preview.tsx pero no exportado desde card-utils.ts → se agregó la función `formatPhone` a card-utils.ts para habilitar el preview en plan gratis
- Creado `/home/z/my-project/src/components/sections/card-editor.tsx` (2635 líneas) con:
  - Layout responsivo de 3 columnas: sidebar (secciones) | centro (formulario) | preview en vivo
  - Sidebar con 24 secciones (EDITOR_SECTIONS), icono DynamicIcon, indicador de candado para restringidas, botón "Volver al Panel" arriba y "Ver Vista Previa" abajo
  - En móvil: sidebar se convierte en Sheet, preview se convierte en Dialog
  - Componente `SectionEditor` switch que enruta a la sección correcta
  - Componente `RestrictedNotice` para secciones no disponibles en plan gratis (con botón "Mejorar a Básico")
  - Helper `ImageUpload` (carga a base64, preview, eliminar, validación 5MB)
  - Helper `ColorField` (color picker + input hex)
  - Helper `CrudDialog` (formulario estándar para CRUD)
  - Helper `EmptyState` (estado vacío genérico)
  - Helper `SectionHeader` (encabezado con icono, título, descripción)
- Las 24 secciones implementadas:
  1. detalles: linkName (con slug automático), cardName, description (300 char), logo/coverPhoto/profilePhoto
  2. plantillas: grid 5 plantillas con preview visual, plan gratis solo moderno+minimalista
  3. dinamica: toggle template dinamica, animaciones (float/pulse/shine), dirección degradado
  4. horario: 7 días con switch abierto/cerrado, hora inicio/fin
  5. qr: radio group estilo (cuadrado/redondo/puntos), color pickers, logo central, botón generar, info expiración 7 días plan gratis
  6. servicios: CRUD con dialog (nombre, url, descripción, foto)
  7. productos: CRUD con dialog (nombre, precio, moneda MXN/USD/EUR, descripción, imagen, url)
  8. instagram: input URL perfil + preview
  9. galeria: upload múltiple imágenes/videos, caption por item, badge video
  10. blog: CRUD (título, descripción, imagen, fecha)
  11. testimonios: CRUD (nombre, rating 1-5 estrellas, texto, foto)
  12. marcos: CRUD (título, URL) para iframes
  13. equipo: CRUD (nombre, rol, bio, duración cita, precio, isPaid toggle, foto)
  14. sociales: 8 inputs (facebook, instagram, twitter, linkedin, youtube, tiktok, whatsapp, telegram) con color de marca
  15. bandera: toggle enabled, título, texto, imageUrl, linkUrl + preview
  16. fuentes: 8 familias tipográficas, slider tamaño 12-24px, 8 presets color, 4 color pickers (primario/secundario/fondo/texto)
  17. avanzado: warning + textarea customCSS + customJS
  18. motores (SEO): seoTitle (60), seoDescription (160), seoKeywords + preview Google
  19. privacidad: textarea grande para política
  20. terminos: textarea grande para términos
  21. secciones: toggle 10 secciones activables, hideBrand, passwordProtected + cardPassword
  22. whatsapp: input número con código país, botón "Enviar código" (genera 6 dígitos y muestra en toast), input verificación, "Verificar" marca whatsappVerified=true, mensaje predeterminado, badge verificado
  23. fondos: preview horizontal y vertical con branding, descarga SVG con perfil, nombre, link
  24. pagos: 4 métodos (PayPal, Stripe, Bank Transfer, Cash) con toggles e inputs (demo solo)
- Plan gratis: solo disponibles detalles, plantillas (limitadas), dinamica, horario, qr, whatsapp; el resto muestra RestrictedNotice
- Validaciones: nombre obligatorio en CRUDs, archivo solo imagen, tamaño máximo
- Feedback con sonner toast en todas las acciones
- Estilo 100% español, paleta esmeralda + oro, sin azul/índigo
- Limpieza de imports no usados (useMemo, PLANS, DialogTrigger, Tooltip, Tabs, etc.)
- Lint: pasa sin errores. Dev log: compila correctamente.

Stage Summary:
- CardEditor.tsx completo y funcional con las 24 secciones del manual
- Layout responsivo (desktop: 3 columnas, móvil: sheet + dialog)
- CRUDs completos para servicios, productos, galería, blog, testimonios, marcos, equipo
- Sistema de restricciones por plan funcionando (plan gratis limitado)
- Preview en vivo con CardPreview que se actualiza en tiempo real
- Verificación de WhatsApp funcional (código demo en toast)
- Descarga de fondos NFC como SVG con branding de la tarjeta
- Listo para integrarse con el dashboard/router SPA

---
Task ID: 3-a
Agent: Sections Builder (Z.ai Code)
Task: Crear 3 componentes de sección (landing, pricing, login) para FTP Digital Plus

Work Log:
- Leí worklog.md (Task 1) y verifiqué store, types, plans, ftp-logo antes de empezar
- Creé `/home/z/my-project/agent-ctx/` y `src/components/sections/` directories
- Creado `src/components/sections/landing-page.tsx` (~1000 líneas):
  - SiteHeader sticky con backdrop-blur, nav scroll-suave, menú móvil animado
  - Hero con gradiente esmeralda, blobs decorativos, mockup flotante de tarjeta digital con QR simulado en CSS + badges animados de stats (vistas +342, escaneos 156)
  - Features grid (6 tarjetas: NFC/QR, Portafolio, Catálogo, Citas, Estadísticas, Plantillas) con gradientes alternados emerald/amber y hover lift
  - HowItWorks (3 pasos numerados con conector gradient y badges dorados)
  - Stats (4 métricas: 1000+, 50k+, 24, 99.9%) sobre gradiente esmeralda
  - PricingPreview (3 cards desde PLANS/PLAN_ORDER, plan básico destacado con ring + badge "Más popular")
  - Testimonials (3 con estrellas doradas y avatares con iniciales)
  - FinalCTA (card grande con gradiente, patrón de puntos, doble CTA)
  - SiteFooter 4 columnas con redes, producto, empresa, contacto
- Creado `src/components/sections/pricing-page.tsx` (~640 líneas):
  - PricingHeader simplificado
  - PricingHero gradiente esmeralda
  - PlanCards (3 planes con precio, periodo, descripción, maxCards, storage, 7 features preview, botón "Elegir Plan" → login)
  - ComparisonTable (32 features × 3 planes con ✓/✗, columna básico resaltada, header sticky, scrollbar custom `.ftp-comparison-scroll`)
  - FAQ (Accordion con 5 preguntas: cambio de plan, expiración QR gratis, múltiples tarjetas, costos ocultos, cancelación)
  - FinalCTA + SiteFooter
- Creado `src/components/sections/login-page.tsx` (~510 líneas):
  - Split layout: BrandPanel (izquierda, gradiente esmeralda, FTPLogo dark, tagline, 3 beneficios, stats) + FormPanel (derecha)
  - LoginForm con email/password, toggle Eye/EyeOff, loading spinner, error message, llama `useAppStore(s => s.login)` (auto-navega a dashboard si success)
  - Divider + Registration buttons ("Registrarse con correo", "Continuar con Google") → toast.info('Próximamente disponible')
  - DemoAccounts: 3 cuentas (demo@gratis.com, demo@basico.com, demo@pro.com / demo123) con badges de plan, descripción, botón "Usar esta cuenta" (auto-fill + login + toast success)
  - Reassurance row (sin tarjeta / cancela / español)
  - LoginFooter compacto con `mt-auto` para sticky-bottom
- Lint issue encontrado: `react-hooks/rules-of-hooks` flaggeó `useFadeUp` llamada dentro de `.map()` callbacks. Fix: refactorizada a `fadeUpProps(delay)` — función pura sin hooks. Renombradas todas las llamadas en landing y pricing.
- Lint issue encontrado: `<style>` block con selectores escapados mal formados en pricing. Fix: clase custom `.ftp-comparison-scroll` con scrollbar webkit + Firefox.
- Lint: pasa sin errores después de los fixes.
- Dev server: compila correctamente, HTTP 200 en `/`.

Stage Summary:
- 3 componentes de sección listos y exportados: `LandingPage`, `PricingPage`, `LoginPage`
- Paleta esmeralda + oro consistente en las 3 páginas (cero azul/índigo)
- 100% español (México)
- Animaciones framer-motion (fade-up + slide en scroll, float en mockup, badges flotantes)
- Responsive mobile-first (menús hamburguesa, grids colapsables, BrandPanel oculto <lg)
- Sticky footer garantizado con `min-h-screen flex flex-col` + `mt-auto`/`flex-1`
- Login flow integrado con store existente (auto-navegación a dashboard)
- Demo accounts funcionales con quick-login
- Lint limpio, dev server compila sin errores
- Próximo agente: wire-up de las 3 exportaciones en `src/app/page.tsx` usando `useAppStore(s => s.currentView)` para renderizar la vista activa

---
Task ID: 10
Agent: Main (Z.ai Code)
Task: Integración final, corrección de bugs y verificación con agent-browser

Work Log:
- Integrados todos los componentes en src/app/page.tsx con routing basado en estado
- Corregido nombre de exportación: PublicCardSection y QrExpiredSection (no PublicCard/QrExpired)
- Corregido import de formatDate: estaba en @/lib/card-utils, no @/lib/utils
- Corregido error de Zustand "getSnapshot should be cached" en useCurrentUserCards usando useShallow
- Verificado con agent-browser:
  * Landing page: carga correctamente con hero, features, planes, testimonios
  * Login: 3 cuentas demo funcionan (demo@gratis.com, demo@basico.com, demo@pro.com)
  * Dashboard: muestra tarjetas del usuario, estadísticas, navegación del panel
  * Editor: las 24 secciones del manual funcionan (Detalles, Plantillas, QR, Servicios, etc.)
  * Vista previa en vivo del editor: se actualiza en tiempo real
  * Tarjeta pública: muestra tarjeta completa con QR, servicios, productos, testimonios
  * Página de precios: tabla de comparación con 3 planes y todas las funciones
- ESLint pasa sin errores
- Servidor dev corre en puerto 3000 (compilación ~10s en primera request)

Stage Summary:
- Aplicación completa y funcional verificada end-to-end
- 3 planes con diferenciación clara (Gratis: 1 tarjeta + QR vence 7 días + marca de agua; Básico: 2 tarjetas + web; Pro: 5 tarjetas + todo)
- 24 secciones de editor implementadas según manual
- Datos demo en memoria (Zustand + localStorage persist)
- Identidad visual FTP Digital Plus (esmeralda + oro)
- Listo para demostración
