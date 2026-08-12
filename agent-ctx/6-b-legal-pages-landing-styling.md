# Task 6-b — Legal Pages + Landing Page Styling

- **Task ID:** 6-b
- **Agent:** Subagent (Legal Pages + Landing Polish)
- **Scope:** Crear 3 páginas legales (Términos, Privacidad, Reembolsos) y mejorar el styling de la landing page

## Archivos modificados

1. `src/lib/types.ts` — añadidos `'terms'`, `'privacy'`, `'refunds'` a `ViewType`.
2. `src/components/sections/legal-pages.tsx` — **nuevo** (~870 líneas). Exporta `TermsPage`, `PrivacyPage`, `RefundsPage`.
3. `src/app/page.tsx` — añadidos 3 cases para enrutar las vistas legales.
4. `src/components/sections/landing-page.tsx` — mejoras de styling (Hero, Features, Testimonials, Comparison, Footer, Live Demo).

## Detalle de implementación

### Páginas legales (`legal-pages.tsx`)

- **Arquitectura:** 1 archivo, 3 exportaciones + helper compartido `LegalPageView`.
- **`LegalPageConfig`** type con: `title`, `shortTitle`, `icon`, `lastUpdated`, `intro`, `sections[]`, `relatedLinks[]`.
- **`LegalSection`** type con: `id`, `title`, `paragraphs[]`, `bullets[]` (con `highlight?`), `callout` (info/warning/success).
- **Componentes compartidos:**
  - `LegalHeader`: sticky, botón "Volver al inicio", FTPLogo, badge con título corto e ícono.
  - `LegalHero`: sección gradiente esmeralda + ámbar, badge "Documento legal", título en gradiente ámbar, fecha última actualización, intro.
  - `TableOfContents`: sidebar sticky desktop (lg+), `IntersectionObserver` resalta sección activa, scroll-mt-24 para offset, custom-scrollbar.
  - `SectionBlock`: numeración 01-10, ícono en círculo gradiente, headings, párrafos, bullets con checkmark, callouts con 3 variantes.
  - `ContactCTA`: "¿Dudas sobre {título}?" con 3 cards (email legal, teléfono, "Empezar ahora").
  - `RelatedLinks`: card esmeralda con botones a documentos relacionados.
  - `LegalFooter`: footer sticky con quick-links a Términos/Privacidad/Reembolsos/Inicio.
- **Términos (10 secciones):** Aceptación, Descripción, Planes y precios (menciona Gratis $0, Básico $199, Pro $500/año), Obligaciones, Propiedad intelectual, Limitación de responsabilidad, Modificaciones, Cancelación y reembolsos (link a refunds), Privacidad (link a privacy), Jurisdicción (México, CDMX).
- **Privacidad (9 secciones):** Información recopilada (nombre, email, teléfono, datos de tarjeta), Cómo usamos, Compartir, Cookies, Seguridad, Derechos ARCO, Retención, Cambios, Contacto (LFPDPPP, INAI).
- **Reembolsos (6 secciones):** Plan Gratuito, Plan Básico ($199, 7 días garantía), Plan Pro ($500/año, 15 días garantía), Cómo solicitar, Proceso, Exclusiones.

### Landing page (`landing-page.tsx`)

**Imports:** añadidos `useState`, `useEffect`, `useCallback`, `AnimatePresence`, `Input`, `toast` (sonner), y 14 nuevos íconos lucide.

**Datos nuevos:**
- `ADDITIONAL_FEATURES`: 6 features extra (WhatsApp, Equipo y Citas, Testimonios, SEO, Afiliados, Personalización).
- `TRUSTED_COMPANIES`: 4 empresas mock con iniciales.
- `COMPARISON_ROWS`: 6 filas de comparativa (Precio, QR incluido, Actualizable, Estadísticas, Múltiples funciones, Sin costos ocultos).
- `TESTIMONIALS`: ampliado de 3 a 5 con campo `company`.

**Hero:**
- Overlay `animate-gradient` (6s ease infinite, gradient-shift keyframes ya en globals.css).
- 5 elementos decorativos flotantes con framer-motion (formas y dots con y/rotate/opacity animations, distintos delays).
- "Trusted by" row con 4 empresas como pills de iniciales + nombre.
- Scroll indicator bottom con "Explora más" + ChevronDown animado (bounce).
- Click en scroll indicator → scroll suave a #caracteristicas.

**Features:**
- Cards usan `.card-hover` class (definida en globals.css: translateY(-4px) + shadow emerald).
- Badge numerado mono-font (01, 02, 03...) en cada card, con color slate-100 que cambia a emerald-100 en hover.
- Glow effect: blob gradiente del accent color en esquina superior derecha, opacidad 0 → 20% en hover (transition-opacity duration-500).
- "Ver más funciones" button revela 6 features adicionales con AnimatePresence (height + opacity animation).
- Cada feature adicional con staggered fade-in (delay idx*0.05).
- Button cambia a "Ver menos funciones" cuando expanded.

**Testimonials:**
- Carrusel con autoplay (5s), pausa en hover (onMouseEnter/Leave settea isPaused).
- AnimatePresence mode="wait" para transición suave entre testimonials (y:12→0).
- Stars rating en ámbar (fill-amber-400).
- 5 dots indicadores (activo = w-6 bg-emerald-600, inactivo = w-2 bg-slate-300).
- Botones anterior/siguiente con ChevronLeft/Right.
- Strip inferior con 5 botones de empresa (iniciales + nombre), click salta al testimonio.

**Comparison (nueva sección, antes de Pricing):**
- Mobile: stacked cards (1 card por fila con grid 3-col dentro).
- Desktop (lg+): tabla 4-col (Característica | FTP | Otras | Papel).
- Columna FTP destacada con gradiente esmeralda en header + bg-emerald-50/40 en cada celda + CheckCircle2 ícono + texto emerald-800.
- Badge "RECOMENDADO" en ámbar flotando sobre header FTP.
- Header fijo, filas alternadas con bg-slate-50/40.

**Footer:**
- Grid 12-col (Brand+social 4 / Producto 2 / Legal 2 / Newsletter 4).
- 5 social icons (Facebook, Instagram, LinkedIn, Twitter, WhatsApp) con hover brand-colored (cada uno con su color de marca: FB #1877F2, IG gradiente, LinkedIn #0A66C2, Twitter black, WhatsApp #25D366) + lift effect (-translate-y-0.5 + shadow).
- Sección "Legal" con 3 botones (Términos, Privacidad, Reembolsos) con íconos FileText/Shield/RefreshCw, navegan a las vistas legales.
- Sección "Mantente al día" con formulario newsletter (Input email + Button "Suscribirme" con Send icon), validación y toast sonner (error/success).
- Footer bottom quick-links: Términos · Privacidad · Reembolsos como botones.

**Live Demo floating button (nueva, bottom-right):**
- Fixed position, bottom-6 right-6, z-40.
- Aparece después de scroll > 400px (useEffect scroll listener).
- Gradiente emerald (from-emerald-600 to-emerald-500), shadow-lg emerald-500/40.
- Pulse animation: 2 spans absolutos con `animate-ping` (emerald-400 opacity-30) y `animate-pulse` (emerald-300 opacity-20).
- Sparkles icon en círculo white/20 + "Ver Demo" + ArrowRight.
- Hover: scale-105, ArrowRight translate-x-0.5.
- AnimatePresence para entrada/salida (scale + y animation).
- Click → navigate('login').

## Lint y verificación

- `npx eslint` sobre los 4 archivos modificados: **EXIT=0** (0 errores, 0 warnings).
- Errores pre-existentes en `dashboard.tsx` (Upload no definido, set-state-in-effect) son del Task 3-b/5-b, fuera de scope.
- Dev server compila sin errores (`GET / 200`, ✓ Compiled).
- agent-browser verificado end-to-end:
  - Landing page renderiza con todas las mejoras (hero, scroll indicator, ver más funciones, comparison, testimonials carrusel, footer con newsletter + 5 social + legal links).
  - Live Demo button aparece tras scroll.
  - Click en "Ver más funciones" → revela 6 features adicionales + cambia a "Ver menos funciones".
  - Click en "Testimonio siguiente" 4x → rota a Laura Sánchez (5º testimonial).
  - Click en "Términos y Condiciones" del footer → navega a TermsPage con 10 secciones, TOC sidebar, contact CTA, related links.
  - Click en "Política de Privacidad" related → navega a PrivacyPage con 9 secciones.
  - Click en "Política de Reembolsos" related → navega a RefundsPage con 6 secciones.
  - Sin errores en browser console.

## Stage Summary

- 3 páginas legales production-ready con arquitectura escalable (1 archivo, config-driven, helper compartido).
- Landing page pulida con 7 mejoras: hero animado, trusted-by, scroll indicator, features expandable con glow, testimonials carrusel autoplay, comparison table, footer con newsletter + social brand-colors + legal links, Live Demo floating button.
- 100% español, paleta esmeralda + oro, responsive mobile-first, framer-motion animations, sonner toasts, sticky footer garantizado (mt-auto via flex min-h-screen flex-col).
- Lint limpio en todos mis archivos. Dev server estable. Sin errores de runtime ni consola.
