# Task 13-b: Card Analytics Modal + Quick Stats + Health Indicator

**Agent:** Subagent (Z.ai Code)
**Task ID:** 13-b
**Date:** 2025

## Task
Mejoras de analítica en el panel: modal detallado por tarjeta, barra de stats rápidas e indicador de salud.

## Files Created
1. `src/components/card-health-indicator.tsx` (~250 líneas)
   - Export `CardHealthIndicator` + `calculateCardHealth`
   - Anillo SVG circular con color dinámico (rojo < 30, ámbar 30-70, esmeralda > 70)
   - Variantes: sm (48px), md (64px), lg (96px)
   - Tooltip con desglose de 10 criterios (10 pts cada uno)
   - Cálculo: foto perfil, descripción, WhatsApp, servicios, productos, testimonios, galería, redes sociales, horario, > 100 visitas

2. `src/components/quick-stats-bar.tsx` (~210 líneas)
   - Export `QuickStatsBar`
   - 6 mini-stats: Tarjetas activas, Visitas hoy, QR hoy, Mensajes sin leer, Citas próximas, Conversión promedio
   - Cada stat es clickeable → navega a sección correspondiente
   - AnimatedCounter para los números
   - Scroll horizontal en móvil, barra completa en desktop
   - Glassmorphism sutil con acentos esmeralda

3. `src/components/card-analytics-modal.tsx` (~620 líneas)
   - Export `CardAnalyticsModal`
   - Modal Dialog max-w-4xl, scrollable, con header gradiente basado en colores de tarjeta
   - 4 stats overview con AnimatedCounter + tendencia (+/- arrow)
   - 4 gráficas recharts: AreaChart (visitas/día 14d), BarChart (QR/día 14d), DonutChart (distribución), Horizontal BarChart (engagement por sección)
   - Tabla de contenido con barras relativas (Servicios, Productos, Testimonios, Galería, Blog, Equipo)
   - Top Performers (servicio + producto más vistos, día pico, hora pico)
   - Comparación vs promedio del usuario (+/- %)
   - Footer: "Ver analítica completa" → navigate('stats'); "Exportar datos" → CSV download + toast

## Files Modified
1. `src/components/sections/dashboard.tsx` (+50 líneas, surgical edits)
   - Added imports: `BarChart3` (lucide), `CardAnalyticsModal`, `QuickStatsBar`, `CardHealthIndicator`
   - Added state `analyticsCard` in `Dashboard`
   - Pass `onViewAnalytics` and `onNavigateSection` to `TableroSection`
   - Render `<CardAnalyticsModal />` at end of Dashboard
   - Added `<QuickStatsBar onNavigateSection={onNavigateSection} />` between welcome banner and stats cards
   - Pass `onViewAnalytics` to `CardItem`
   - `CardItem`:
     * Added `onViewAnalytics` prop
     * Changed inline stats grid from 3 → 4 cols (added Salud with `CardHealthIndicator size="sm"`)
     * Added "Ver analítica" icon button (BarChart3) in actions area with tooltip
   - Fixed pre-existing bug: `setActiveSection` was referenced in TableroSection's event listeners but wasn't in scope. Replaced with `onNavigateSection` prop.

2. `src/components/sections/analytics-page.tsx` (+30 líneas, surgical edits)
   - Added imports: `BarChart3` (lucide), `CardAnalyticsModal`, `BusinessCard` type
   - Added state `analyticsCard: BusinessCard | null`
   - Added new table column "Detalle" with "Ver detalle" button (BarChart3 icon) per card row
   - Render `<CardAnalyticsModal />` at end of component

## Quality Checks
- `bun run lint`: 0 errors, 0 warnings.
- `npx tsc --noEmit -p tsconfig.json`: 0 errors in src/ (solo errores preexistentes en skills/).
- Dev server: compila limpio, HTTP 200 en `/`.

## Tech Stack Used
- recharts (AreaChart, BarChart, PieChart, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer, CartesianGrid)
- shadcn/ui (Dialog, Table, Separator, Button, Badge, Tooltip)
- lucide-react (Eye, QrCode, MessageSquare, TrendingUp, TrendingDown, X, Download, ArrowRight, Clock, Star, BarChart3, Heart, AlertCircle, CheckCircle, Sparkles, etc.)
- framer-motion (motion.div para fade-up entrances)
- sonner (toast notifications)
- date-fns (differenceInCalendarDays, format with es locale)
- AnimatedCounter para animación de números
- useAppStore para datos (cards, messages, appointments, navigate, selectCard)

## Paleta
- 100% esmeralda (#059669) + oro (#f59e0b), cero azul/índigo
- Colores secundarios: cyan (#0891b2), violet (#7c3aed), rose (#be123c), slate (#64748b)

## Idioma
- 100% español (México) en labels, descripciones, toasts, tooltips, aria-labels

## Responsive
- Mobile-first: charts stack en grid-cols-1, expanden a lg:grid-cols-2
- QuickStatsBar: scroll horizontal en móvil, barra completa en desktop
- Tabla de top performing cards: overflow-x-auto
- Modal: max-h-[92vh] con overflow-y-auto

## Accesibilidad
- DialogTitle sr-only para screen readers
- aria-labels en todos los botones icon
- role="img" con aria-label en health indicator
- role="region" con aria-label en QuickStatsBar
- Tooltips descriptivos
- focus-visible rings en elementos interactivos
