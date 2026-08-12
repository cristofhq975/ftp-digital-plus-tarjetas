# Task 5-a — Analytics Page Builder

**Agent:** Subagent (Analytics Builder)
**Task ID:** 5-a
**Task:** Crear `src/components/sections/analytics-page.tsx` — página de Analítica y Estadísticas con control de acceso por plan, 4 stat cards, 4 gráficas (Line, Bar, Pie, Area), tabla de top performing cards, métricas de engagement, distribución geográfica, breakdown por dispositivo y export a PDF (demo toast).

## Work Log

### Contexto revisado
- Leído `/home/z/my-project/worklog.md` (Tasks 1, 3-a, 3-b, 3-c, 3-d, 10).
- Revisados:
  - `src/lib/store.ts` — `useAppStore`, `useCurrentUserCards`, `currentUser`, `cards`, `messages`, `appointments`, `navigate`.
  - `src/lib/types.ts` — `BusinessCard`, `User`, `ContactMessage`, `Appointment`, `PlanType`, `ViewType`.
  - `src/lib/utils.ts` — `cn()`.
  - `src/components/ui/chart.tsx` — `ChartContainer`, `ChartTooltip`, `ChartTooltipContent`, `ChartLegend`, `ChartLegendContent`.
  - `src/components/ui/{card,button,badge,tabs,table,progress,separator,select}.tsx` — APIs shadcn disponibles.
  - `src/components/ui/chart.tsx` (componentes recharts envueltos).
  - `src/components/sections/dashboard.tsx` (patrones de estilo del proyecto: gradientes emerald+gold, fadeUp, footer sticky, colores por plan).
  - `src/components/ftp-logo.tsx` — `FTPLogo` con `variant="icon"`.
  - `package.json` — verificado `recharts ^2.15.4`, `framer-motion ^12.23.2`, `sonner ^2.0.6`, `lucide-react ^0.525.0` instalados.

### Implementación

**Archivo:** `/home/z/my-project/src/components/sections/analytics-page.tsx` (~720 líneas)

- `'use client'` directive.
- Imports: `useState`, `useMemo` (react), `motion` (framer-motion), 10 componentes de `recharts` (`LineChart`, `Line`, `BarChart`, `Bar`, `PieChart`, `Pie`, `AreaChart`, `Area`, `XAxis`, `YAxis`, `CartesianGrid`, `Cell`, `ResponsiveContainer`, `Tooltip`, `Legend`), 15 iconos de `lucide-react`, `toast` de `sonner`, 7 componentes de `@/components/ui`, `FTPLogo`, hooks del store, `cn`.

#### Paleta de colores
- `COLORS.emerald = #059669`, `emeraldLight = #10b981`, `gold = #f59e0b`, `goldLight = #fbbf24` (esmeralda + oro).
- `PIE_COLORS = [emerald, gold, cyan (#0891b2), rose (#be123c)]` — para pie chart de interacciones.
- `DONUT_COLORS = [emerald, gold, cyan]` — para donut de dispositivos.
- Estilos compartidos `TOOLTIP_STYLE` y `TOOLTIP_LABEL_STYLE` (tarjeta blanca con sombra suave).

#### Helper `generateTimeSeriesData(days: number)`
- Genera array de `{ date: string, views: number, scans: number }` para los últimos N días.
- Determinístico por día (usa `Math.floor(date.getTime() / 86400000)` como seed con `Math.sin`/`Math.cos`).
- Escala los valores según el rango (más días = valores mayores para mantener realismo).

#### Sub-componentes
- `Footer` — sticky con `mt-auto`, logo FTP + copyright + tag "Plan Básico / Pro".
- `UpgradeScreen` — pantalla para plan gratis: card con gradiente emerald header, ícono Lock, mensaje "La analítica avanzada está disponible en los planes Básico y Pro", grid de 6 features preview, botón "Mejorar Plan" → `navigate('pricing')`.
- `StatCard` — card con título, valor grande, ícono en chip de color, badge de tendencia (verde/rose) con `%`.
- `EngagementCard` — card compacta para métricas mock.

#### Componente principal `AnalyticsPage`
- **Hooks arriba** (todos antes de cualquier early return):
  - `useAppStore` para `currentUser`, `navigate`, `messages`, `appointments`.
  - `useCurrentUserCards()` para cards del usuario.
  - `useState('30')` para `range`.
  - `useMemo` para `timeSeries`, `cumulativeData` (reduce inmutable), `totalViews`, `totalScans`, `trends`, `cardsBarData`, `interactionData`, `topCards`, `engagement`, `geoData`, `deviceData`.

- **Control de acceso:**
  - Si `!currentUser` → card "Debes iniciar sesión" + botón a login.
  - Si `plan === 'gratis'` → `<UpgradeScreen>`.
  - Si `plan === 'basico' | 'pro'` → render completo.

- **Header sticky** (`sticky top-0 z-30 border-b bg-white/85 backdrop-blur-md`):
  - Botón "Volver" → `navigate('dashboard')`.
  - Título "Analítica y Estadísticas" + Badge de plan (emerald) + subtítulo con rango seleccionado.
  - Tabs para rango: 7 días / 30 días / 90 días / Todo (este último usa 90 días en demo).
  - Botón "Exportar reporte" → `toast.success('Reporte exportado', { description: 'Tu reporte en PDF se ha generado correctamente (demo).', icon: Download })`.

- **4 stat cards** (grid `1 / sm:2 / lg:4`):
  1. Total de visitas — `Eye`, bg emerald-50, trend `+trends.views%`.
  2. Escaneos QR — `QrCode`, bg amber-50, trend `+trends.scans%`.
  3. Mensajes recibidos — `Mail`, bg cyan-50, trend (puede ser negativo).
  4. Citas agendadas — `Calendar`, bg rose-50, trend `+trends.appointments%`.
  - Cada una con `fadeUp(delay)` staggered.

- **Charts sección 1** (grid `lg:grid-cols-2`):
  1. **LineChart "Visitas y escaneos QR"**: dos líneas (emerald y gold), 280px altura, CartesianGrid suave, Tooltip personalizado, Legend con iconos circle, activeDot blanco.
  2. **AreaChart "Tendencia de crecimiento"**: área acumulada con gradiente emerald (`<linearGradient id="gradGrowth">`).

- **Charts sección 2** (grid `lg:grid-cols-2`):
  3. **BarChart "Visitas por tarjeta"**: dos barras por card (views emerald, scans gold), `radius={[6,6,0,0]}`, etiquetas X rotadas si >2 cards, tooltip con `fullName`.
  4. **PieChart "Distribución de interacciones"**: donut (`innerRadius={55} outerRadius={90}`) con 4 colores (emerald, gold, cyan, rose), Cell por entry.

- **Tabla "Tarjetas con mejor rendimiento"**:
  - Columnas: #, Tarjeta (con avatar de color del card), Visitas, Escaneos QR, Mensajes, Conversión (badge color por rango), Estado (Activa/Inactiva).
  - Conversión = `messages.filter(m => m.cardId === c.id).length / c.views * 100` con guard contra división por 0.
  - Ordenado por views desc, top 3 con badges dorado/plata/bronce.
  - Empty state si no hay tarjetas.

- **4 engagement cards** (grid `1 / sm:2 / lg:4`) — mock:
  1. Tiempo promedio (e.g. "2m 38s") — `Clock`.
  2. Tasa de rebote (e.g. "47%") — `TrendingDown`.
  3. Sección más clickeada ("Servicios", "28% de los clics") — `MousePointerClick`.
  4. Mejor día ("Miércoles", "27% del tráfico semanal") — `CalendarDays`.

- **Distribución geográfica + Dispositivos** (grid `lg:grid-cols-2`):
  - Geografía: lista de 5 ciudades con avatar numerado emerald, nombre, count, Progress bar + %.
  - Dispositivos: donut (`innerRadius={48} outerRadius={80}`) + lista lateral con iconos (`Smartphone`, `Monitor`, `Tablet`), color dot y %.

- **Resumen ejecutivo** (card gradiente emerald): card final con Sparkles, texto "Has recibido X visitas y Y escaneos QR en total" + botón secundario "Descargar reporte".

- **Footer sticky** (`mt-auto`) con logo, copyright y tag.

### Detalles técnicos
- Todos los hooks llamados antes de los early returns (cumple rules-of-hooks).
- `cumulativeData` usa `reduce` inmutable (sin reasignación de `acc`) — pasa `react-hooks/immutability`.
- `fadeUp(delay)` helper sin hooks (función pura con `transition: { ease: 'easeOut' as const }`).
- Responsive: grids `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`, header colapsa a vertical en móvil, tabs siempre visibles.
- Tipos: `React.ComponentType<{ className?: string }>` para iconos en props.
- `cn()` para clases condicionales (colores de badges, conversión, ranking).
- Todos los textos en español (México): `toLocaleString('es-MX')`, `toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit' })`.
- Sin colores azul/índigo (excepto cyan #0891b2, rose #be123c, purple #7c3aed reservados para chart data differentiation según spec).
- Sticky footer garantizado con `min-h-screen flex flex-col` + `mt-auto` en footer.

### Lint
- `npx eslint src/components/sections/analytics-page.tsx` → **0 errors, 0 warnings**.
- Errores remanentes en el proyecto (`theme-toggle.tsx`) son pre-existentes y no pertenecen a este task.

### Dev log
- Servidor corre en puerto 3000 sin errores de compilación.
- Componente listo para integrarse en `src/app/page.tsx` cuando el siguiente agente agregue el caso `'stats'` → `<AnalyticsPage />` (actualmente va a `<Dashboard />`).

## Stage Summary
- `AnalyticsPage` exportada desde `src/components/sections/analytics-page.tsx`.
- Cumple todos los requisitos del spec: control de acceso por plan, 4 stat cards con tendencia, 4 gráficas recharts (Line/Bar/Pie/Area) con colores emerald+gold, tabla de top performing cards, métricas de engagement mock, distribución geográfica mock, donut de dispositivos mock, export PDF con toast, footer sticky, responsive, animaciones framer-motion, 100% español.
- Lint limpio en el archivo. Listo para integración.
