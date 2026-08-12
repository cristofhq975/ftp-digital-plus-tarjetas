# Task 5-c — Template Gallery + Enhanced Styling

- **Task ID**: 5-c
- **Agent**: Subagent C (Template Gallery Builder)
- **Task**: Crear `src/components/sections/template-gallery.tsx` y ampliar `src/app/globals.css` con utilidades avanzadas de estilo.

## Work Log

### 1. Lectura de contexto previo
- Leído `worklog.md` (Tasks 1, 3-a, 3-b, 3-c, 3-d, 10) para entender el proyecto FTP Digital Plus.
- Revisados:
  - `src/lib/types.ts` (BusinessCard, Schedule, SocialLinks, etc.)
  - `src/lib/plans.ts` (TEMPLATES, COLOR_PRESETS, FONTS, PLANS)
  - `src/lib/store.ts` (useAppStore, navigate, currentUser)
  - `src/components/card-preview.tsx` (firma `CardPreview({ card, userPlan, previewMode? })`)
  - `src/app/globals.css` (utilities existentes: `.gradient-text`, `.gold-gradient`, `.emerald-gradient`, `.glass`, `.animate-float`, `.animate-shimmer`, `.custom-scrollbar`, `.no-scrollbar`)
  - `src/components/ui/{card,button,badge,dialog,select,tabs,input}.tsx` (exportaciones nombradas)
  - `src/lib/utils.ts` (`cn()`)
- Verificadas dependencias en `package.json`: `framer-motion ^12`, `lucide-react ^0.525`, `sonner ^2`, `clsx`, `tailwind-merge` — todas disponibles.

### 2. Actualización de `src/app/globals.css`
Se anexaron (sin sobrescribir nada previo) las siguientes utilidades solicitadas:
- `@keyframes gradient-shift` + `.animate-gradient`
- `@keyframes pulse-glow` + `.animate-pulse-glow`
- `@keyframes slide-in-right` + `.animate-slide-in-right`
- `@keyframes scale-in` + `.animate-scale-in`
- `@keyframes bounce-subtle` + `.animate-bounce-subtle`
- `.card-hover` (hover lift + sombra esmeralda)
- `.gradient-border` (borde con gradiente esmeralda→oro vía mask)
- `.mesh-gradient` (fondo con 4 radiales esmeralda/oro)
- `.glass-card` + `.dark .glass-card` (glassmorphism mejorado con dark mode)
- `.text-balance`
- `.shimmer-bg` (carga esqueleto)
- `.scroll-snap-x` + `.scroll-snap-start` (carruseles)
- `.premium-badge` (gradiente oro para badges Pro)
- `.focus-ring` (anillo de foco esmeralda accesible)

### 3. Creación de `src/components/sections/template-gallery.tsx`
Archivo de ~600 líneas con `'use client'`. Exporta `TemplateGallery` (named + default).

**Arquitectura:**
- **Constantes y tipos locales**:
  - `TEMPLATE_META: Record<TemplateId, TemplateMeta>` — metadatos por plantilla: categoría (profesionales/creativas/minimalistas/elegantes), plan requerido (all/basico/pro), rating, número de reseñas, bandera `isNew`, `isFeatured`, `popularity`, `highlights[]`.
  - `CATEGORIES` (5 categorías), `SORT_OPTIONS` (populares/nuevas/A-Z), `PLAN_BADGE` (config visual por plan).
  - `FONT_BY_TEMPLATE` y `PRESET_BY_TEMPLATE` — mapean cada plantilla a una fuente y un COLOR_PRESET distinto:
    - moderno → Esmeralda + Poppins
    - clasico → Oro + Roboto
    - minimalista → Grafito + Raleway
    - elegante → Corinto + Playfair Display
    - dinamica → Naranja + Montserrat

- **Factory `makeMockCard(template)`**: genera un `BusinessCard` consistente ("Estudio Creativo Aurora") con 2 servicios, 1 testimonio, redes sociales (FB/IG/LinkedIn), WhatsApp, QR, schedule completo — diferenciando solo template + colores + fuente según el caso. Permite comparar justamente cómo se ve el mismo contenido en cada plantilla.

- **Sub-componentes**:
  - `StarRating` — estrellas doradas + rating numérico + contador de reseñas, tamaños sm/md.
  - `PlanBadge` — badge visual según plan: "Todos los planes" (esmeralda), "Básico +" (ámbar), "Pro" (premium-badge oro con corona).
  - `MiniPreview` — wrapper `<button>` accesible con `<CardPreview>` escalado (scale 0.92, width 260px) dentro de contenedor fijo `h-[340px]` con fade inferior y overlay hover "Vista previa" que aparece con transición.
  - `TemplateCard` — Card con: badges superior-derecho (PlanBadge + "Nueva"), MiniPreview clickeable, nombre + descripción + highlights como chips esmeralda, StarRating, dos botones (Vista previa / Usar plantilla). Aplica `.card-hover` para elevación al hover.
  - `FeaturedTemplate` — Card destacada con layout 2-col: info a la izquierda (badge "Plantilla destacada", título con `.gradient-text`, descripción, PlanBadge + rating + contador, lista de highlights, dos CTAs), preview grande a la derecha dentro de `.gradient-border` con badges flotantes animados (`.animate-float` y `.animate-bounce-subtle`) mostrando rating y "Animado". Usa fondo gradiente esmeralda→ámbar con blobs decorativos.
  - `ComparisonSection` — grid de 3 plantillas (moderno, minimalista, dinamica) con mini-preview, nombre, badge plan, y tabla de comparación de 5 features (velocidad, personalización, animaciones, tipografía, ideal para). La del medio tiene `ring-2 ring-emerald-500/40` y badge "Recomendada".
  - `EmptyResults` — estado vacío cuando no hay coincidencias con CTA "Limpiar filtros".

- **Componente principal `TemplateGallery`**:
  - Layout: `flex min-h-screen flex-col bg-background mesh-gradient` para garantizar footer sticky.
  - **Header sticky** con botón "Volver al Panel" (navega a dashboard si logueado, a landing si no) y badge con contador de plantillas.
  - **Hero**: badge "Galería de Plantillas", título "Elige el diseño que define tu marca" con `.gradient-text`, descripción.
  - **FeaturedTemplate** (moderno) arriba.
  - **Filter bar**: `Tabs` con scroll horizontal (`no-scrollbar`) para categoría, `Input` con icono Search para búsqueda, `Select` para ordenar. Flexbox responsive (col→row en lg).
  - **Grid**: `motion.div` con `staggerChildren: 0.08` y variantes `gridContainer`/`gridItem` (spring). Grid `sm:grid-cols-2 lg:grid-cols-3`.
  - **ComparisonSection**.
  - **CTA final**: sección con gradiente esmeralda→emerald-800, blobs decorativos, "¿No encuentras lo que buscas? Personaliza tu tarjeta desde cero" con dos botones (Personalizar desde cero / Ver planes).
  - **Footer sticky** con `mt-auto`: logo FTP, copyright dinámico, botón "Inicio" a landing.
  - **Dialog de vista previa**: `max-h-[90vh] max-w-3xl`, header con gradiente esmeralda-50→amber-50 que muestra nombre + PlanBadge + StarRating, body con scroll custom (`.custom-scrollbar`) y `AnimatePresence mode="wait"` para transición entre plantillas, footer con highlights como chips + botones "Cerrar" / "Usar esta plantilla".

**Comportamiento de "Usar esta plantilla" (`handleUse`)**:
- Si usuario no logueado: `toast.info` con descripción y action "Iniciar sesión" → `navigate('login')`.
- Si logueado: `toast.success` con descripción y action "Ir al panel" → `navigate('dashboard')`.

**Filtrado y ordenamiento** (`useMemo`):
- Filtra por categoría y por query (busca en nombre, descripción y highlights).
- Ordena por: populares (mayor popularity primero), nuevas (isNew primero), A-Z (localeCompare es).
- `EmptyResults` si no hay coincidencias.

### 4. Estilo y UX
- **Idioma**: 100% español (México).
- **Paleta**: exclusivamente esmeralda (#059669 / oklch 0.55 0.15 160) + oro (#f59e0b / oklch 0.75 0.18 85). Cero azul/índigo en UI propia (los color presets de las plantillas demo sí incluyen púrpura/cian/etc. porque así está definido en `COLOR_PRESETS` del proyecto).
- **Responsive**: mobile-first. Header con texto "Volver" en móvil / "Volver al Panel" en sm+. Tabs con scroll horizontal en móvil. Grid 1→2→3 columnas. CTA flex-col→flex-row.
- **Accesibilidad**: 
  - `aria-label` en MiniPreview, búsqueda y Select de orden.
  - `.focus-ring` en MiniPreview para foco visible.
  - Estructura semántica: `header`, `main`, `section`, `footer`.
  - Botones con tamaño mínimo táctil (h-9/h-10).
- **Animaciones**: framer-motion stagger en grid, AnimatePresence en Dialog, `.animate-float` y `.animate-bounce-subtle` en badges del featured, `.card-hover` en todas las cards, transiciones suaves en hover de MiniPreview.
- **Feedback**: sonner toasts informativos con acciones, hover states en todos los botones, badges "Nueva" y "Destacada" para guiar al usuario.

### 5. Verificación
- `npx eslint src/components/sections/template-gallery.tsx` → **0 errores, 0 warnings**.
- `npx tsc --noEmit` → **0 errores** en template-gallery.tsx y globals.css (errores reportados son de otros archivos pre-existentes: onboarding-wizard.tsx, theme-toggle.tsx, dashboard.tsx, public-card.tsx, card-image.ts, examples/, skills/ — ninguno introducido por esta tarea).
- `git status` confirma: solo se modificaron `src/app/globals.css` (existente) y se creó `src/components/sections/template-gallery.tsx` (nuevo).

## Stage Summary
- `globals.css` ampliado con 14 nuevas utilidades de animación y estilo, todas alineadas con la paleta esmeralda+oro (oklch) y soporte dark mode donde aplica.
- `template-gallery.tsx` creado y production-ready: 5 plantillas con preview en vivo vía `CardPreview`, featured template con preview grande y badges animados, filtros por categoría/búsqueda/orden, comparativa lado a lado de 3 plantillas, CTA final, footer sticky, dialog de vista previa con scroll y transiciones.
- Listo para integrarse en el router SPA cuando `currentView === 'template-gallery'` (agregar `'template-gallery'` a `ViewType` en `src/lib/types.ts` y montar desde `src/app/page.tsx`).
- Lint y type-check limpios para los archivos de esta tarea.
