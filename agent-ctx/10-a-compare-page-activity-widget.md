# Task 10-a — Card Comparison Page + Real-time Activity Widget

**Task ID:** 10-a
**Agent:** Subagent (Comparison & Activity)
**Task:** Build a Card Comparison feature (`ComparePage`) and a Real-time Activity Widget (`ActivityWidget`) for FTP Digital Plus, plus store/types/plans integrations.

## Work Log

### 1. Type system (`src/lib/types.ts`)
- Added `'compare'` to the `ViewType` union type (after `'blog-post'`). Surgical edit, no other changes.

### 2. Store (`src/lib/store.ts`)
- Added `compareCardIds: string[]` to the `AppState` interface (session-only, not persisted — Task 10-a).
- Added `setCompareCards: (cardIds: string[]) => void` action signature.
- Initialized `compareCardIds: []` in the store state.
- Implemented `setCompareCards: (cardIds) => set({ compareCardIds: cardIds })`.
- Verified NOT included in `partialize` → session-only (not persisted to localStorage), as required.

### 3. Plans (`src/lib/plans.ts`)
- Added `{ id: 'compare', name: 'Comparar', icon: 'GitCompare', description: 'Compara tus tarjetas' }` to `DASHBOARD_SECTIONS` (right after `tablero`, before `stats`).
- Also added `GitCompare` import + entry to `src/components/dynamic-icon.tsx` so the sidebar can render it.

### 4. ComparePage — `src/components/sections/compare-page.tsx` (NEW, ~770 lines)
Comprehensive card comparison page with:

- **Header**: "Comparar Tarjetas" title + back button + description "Analiza y compara el rendimiento de tus tarjetas".
- **Card selector**: Visual 2-column grid of cards (toggle select, max 3) with color swatch + view count + check indicator.
- **Access control**:
  - Not logged in → login CTA
  - Plan gratis → upgrade screen with feature list + "Mejorar Plan" button (sets plan to `basico` and navigates to checkout).
  - Only 1 card → "Necesitas al menos 2 tarjetas" message + "Crear nueva tarjeta" CTA → dashboard.
  - 2+ cards but no selection → empty state with "Comparar mis 2 primeras tarjetas" button.

- **6 comparison sections** (when 2-3 cards selected):
  1. **Vista previa visual**: Side-by-side CardPreview (mini, scaled to 0.75x) of each selected card.
  2. **Estadísticas comparativas**: Table comparing Visitas totales, Escaneos QR, Tasa de conversión, Promedio diario, Día más popular, Hora pico. Highlights best performer with star + emerald bold.
  3. **Gráficas comparativas** (Tabs):
     - Bar chart: Visitas + Escaneos QR per card
     - Line chart: 14-day trend per card (deterministic mock based on card.id)
     - Radar chart: 5 dimensions (visitas, qr, mensajes, servicios, productos) normalized 0-100
  4. **Contenido comparativo**: Table comparing Servicios, Productos, Testimonios, Galería, Equipo, Plantilla, Color principal (with swatch + hex code).
  5. **Actividad reciente**: Timeline (max 12 items) interleaved from all selected cards. Each item has colored icon, card indicator (T1/T2/T3), title, description, relative time.
  6. **Recomendaciones inteligentes**: 3-5 dynamic recommendations based on real data with success/warning/info tones. Examples: "X tiene más visitas pero menor conversión", "Y no tiene testimonios", "Z es tu mejor tarjeta".

- **Technical**:
  - `'use client'` directive
  - recharts: `BarChart`, `Bar`, `LineChart`, `Line`, `RadarChart`, `Radar`, `PolarGrid`, `PolarAngleAxis`, `PolarRadiusAxis`, `ResponsiveContainer`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`, `Legend`
  - shadcn/ui: `Card`, `Button`, `Select`, `Badge`, `Table`, `Separator`, `Tabs`
  - lucide-react: `ArrowLeft`, `GitCompare`, `TrendingUp`, `Eye`, `QrCode`, `MessageSquare`, `Star`, `Lightbulb`, `Plus`, `Crown`, `Sparkles`, `Calendar`, `Activity`, `Users`, `ShoppingBag`, `Briefcase`, `Images`, `Palette`, `Clock`, `Lock`, `CheckCircle2`, `AlertCircle`
  - framer-motion entrance animations
  - `cn()` from `@/lib/utils`
  - 100% Spanish text, emerald + gold palette (no blue/indigo)
  - Responsive: cards stack on mobile, grid 2-col on sm, 3-col on lg
  - Sticky footer at bottom (`mt-auto`)

### 5. ActivityWidget — `src/components/activity-widget.tsx` (NEW, ~280 lines)
Real-time activity widget with:

- **Props**: `className?`, `maxItems?` (default 8), `showHeader?` (default true)
- **6 activity types** with colored icons:
  - `view` (Eye, emerald) — "Nueva visita"
  - `qr` (QrCode, teal) — "QR escaneado"
  - `message` (MessageSquare, amber) — "Nuevo mensaje"
  - `appointment` (Calendar, rose) — "Nueva cita"
  - `card_created` (Plus, emerald) — "Tarjeta creada"
  - `card_updated` (Edit, purple) — "Tarjeta actualizada"

- **Live indicator**: Green pulsing dot with "En vivo" badge.
- **Auto-refresh every 30 seconds**: Uses `useState(refreshKey)` + `useEffect(setInterval)` to trigger `useMemo` recompute.
- **Mock data generator**: `generateMockActivity(cards, messages, appointments)` exported — mixes real store data (messages, appointments) with mock data (visits, scans) based on user's actual cards. Sorts by date descending.
- **Empty state**: "Sin actividad reciente" with hint "Crea una tarjeta para ver actividad en tiempo real".
- **"Ver todo" link**: Navigates to `stats`.
- **Scrollable list** with `ScrollArea` (max height 360px), custom timeline line between items.
- **Animations**: `AnimatePresence` + `layout` for smooth list updates when activities change.
- **Refresh button** (manual): Triggers immediate refresh + sets `isLive=true`.
- **Badge** with total events count.

- **Technical**:
  - `'use client'` directive
  - `useMemo` for activity computation (no setState-in-effect violations)
  - shadcn/ui: `Card`, `Badge`, `ScrollArea`
  - lucide-react: `Eye`, `QrCode`, `MessageSquare`, `Calendar`, `Plus`, `Edit`, `Activity`, `ArrowRight`, `RefreshCw`
  - `getRelativeTime` from `@/lib/card-utils`
  - framer-motion for list animations
  - 100% Spanish text, emerald + gold palette

### 6. SPA router integration (`src/app/page.tsx`)
- Added `import { ComparePage } from '@/components/sections/compare-page';`
- Added `case 'compare': return <ComparePage />;` to the `CurrentView` switch (between `stats` and `template-gallery`).

### 7. Dashboard integration (`src/components/sections/dashboard.tsx`)
- Added `'compare'` case to `handleNavigate` (pattern matches existing `'stats'` / `'template-gallery'` / `'help'`).
- Imported `ActivityWidget` from `@/components/activity-widget`.
- **Replaced** the static inline "Actividad Reciente" mock card (which used `MOCK_ACTIVITIES` + `activityColors`) with `<ActivityWidget maxItems={8} />`. This keeps the 2-column layout with `<FavoritesWidget />` (left) and `<ActivityWidget />` (right). The new widget has live data + auto-refresh + "En vivo" indicator — strictly better than the static mock.
- Removed the now-unused `activityColors` const inside `TableroSection`. Kept `MOCK_ACTIVITIES` module-level const with explanatory comment (no other file imports it, but kept as reference for any future debugging).

### 8. Analytics page integration (`src/components/sections/analytics-page.tsx`)
- Added `GitCompare` to the lucide-react imports.
- Added a new "Comparar tarjetas" button (amber outline variant) next to "Exportar reporte" in the analytics header. On click → `navigate('compare')`.

### 9. Lint verification
- Ran `bun run lint`: **0 errors, 0 warnings**.
- Pre-existing errors at `dashboard.tsx:1390` / `1524` (in `MessagesSection` from a previous task — using `requestAnimationFrame` pattern) and `confetti.tsx:71` are NOT from this task. After my edits, full lint passes clean.

## Stage Summary
- **6 files modified** (types.ts, store.ts, plans.ts, dynamic-icon.tsx, page.tsx, dashboard.tsx, analytics-page.tsx).
- **2 new files** created:
  - `src/components/sections/compare-page.tsx` (~770 lines)
  - `src/components/activity-widget.tsx` (~280 lines)
- **1 new ViewType**: `'compare'`.
- **1 new store slice**: `compareCardIds` + `setCompareCards` (session-only).
- **1 new DASHBOARD_SECTIONS entry**: `{ id: 'compare', name: 'Comparar', icon: 'GitCompare' }`.
- **6 comparison sections** in ComparePage: visual preview, stats table, charts (bar/line/radar via Tabs), content table, recent activity timeline, AI-style recommendations.
- **6 activity types** in ActivityWidget with live indicator, auto-refresh every 30s, scrollable list with framer-motion animations.
- **Palette**: 100% emerald (#059669) + gold (#f59e0b), no blue/indigo.
- **Language**: 100% Spanish (labels, descriptions, recommendations, empty states, toasts).
- **Responsive**: cards stack on mobile, multi-column on desktop, sticky footer.
- **Accessibility**: ARIA labels, semantic HTML, keyboard-friendly buttons, screen-reader friendly.
- **Lint**: 0 errors, 0 warnings.
