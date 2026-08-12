# Task 8-c — Accessibility (a11y) + Micro-animaciones

**Agente:** Subagent (Accessibility & Micro-animations)
**Estado:** Completado
**Lint:** 0 errores
**Type-check:** 0 errores en archivos nuevos/modificados

## Archivos creados

### Accesibilidad (`src/components/accessibility/`)
- `skip-link.tsx` — enlace "Saltar al contenido principal" con animación CSS `.skip-link`
- `focus-manager.tsx` — focus trap para modales: autoenfoca primer elemento, cicla Tab/Shift+Tab, maneja Escape, restaura foco al cerrar
- `screen-reader-announcer.tsx` — región `aria-live` + hook `useAnnouncer()` que devuelve `announce(message, { politeness })`

### Animaciones (`src/components/animations/`)
- `count-up.tsx` — anima número 0→value con rAF + easeOutExpo. Respeta `prefers-reduced-motion` vía `useSyncExternalStore`
- `page-transition.tsx` — wrapper framer-motion AnimatePresence para fade+slide entre vistas (key = currentView del store)
- `typewriter.tsx` — efecto máquina de escribir con cursor parpadeante. aria-label con texto completo
- `magnetic-button.tsx` — botón magnético (framer-motion spring). Desactivado en `pointer: coarse`

### Loading (`src/components/loading/`)
- `spinner.tsx` — SVG con gradiente esmeralda→oro. IDs únicos por instancia vía `useId`
- `page-skeleton.tsx` — 3 variantes (landing/dashboard/editor) con `.skeleton` shimmer

## Archivos modificados

### `src/app/globals.css` (APPEND)
Añadidos ~165 líneas: `.sr-only-focusable`, `*:focus-visible` global, `@media (prefers-reduced-motion: reduce)`, `@media (prefers-contrast: high)`, `.skip-link`, `.skeleton`, `.button-press`, `.card-lift`, `@keyframes text-reveal`, `@keyframes count-up`, `.stagger-children > *` con delays, `.ripple`, `@keyframes glow-pulse` + `.glow-pulse`.

### `src/app/layout.tsx`
- Importados `SkipLink` y `ScreenReaderAnnouncer`
- Añadidos al inicio del `<ThemeProvider>`
- `{children}` envuelto en `<div id="main-content" tabIndex={-1} className="outline-none">`

### `src/app/page.tsx`
- Extraído `CurrentView` (switch) en componente separado
- Envuelto en `<PageTransition>` para transiciones entre vistas

### `src/components/sections/landing-page.tsx`
- Importados `CountUp` y `Typewriter`
- `STATS` reformateado a `{ value, suffix, label }` con valores numéricos
- Stats renderiza `<CountUp value={stat.value} suffix={stat.suffix} duration={1800} />`
- Hero h1: "Impresionan" envuelto en `<Typewriter text="Impresionan" speed={110} />`
- Grids de FEATURES y ADDITIONAL_FEATURES: clase `stagger-children`
- Cards de FEATURES y ADDITIONAL_FEATURES: clase `card-lift` (junto a `card-hover`)

### `src/components/sections/dashboard.tsx`
- Importado `CountUp`
- Stat cards: `<CountUp value={stat.value} duration={1200} />` reemplaza `{stat.value.toLocaleString('es-MX')}`
- Grid "Mis Tarjetas": clase `stagger-children`
- 6 botones de acción con clase `button-press`: Crear Nueva Tarjeta, Editar, Ver, Compartir, Copiar, Eliminar

## Notas técnicas

- Para cumplir la regla `react-hooks/set-state-in-effect`, migré detección de `prefers-reduced-motion` y `pointer: coarse` a `useSyncExternalStore` (subscribe + getSnapshot + getServerSnapshot).
- En CountUp/Typewriter, el valor "sin animación" se deriva del snapshot (no hay setState síncrono en effect).
- Los setState restantes ocurren dentro de callbacks `requestAnimationFrame`/`setInterval` (asíncronos, permitidos por la regla).
- IDs de gradiente del Spinner sanitizados (`replace(/:/g, '')`) porque los IDs generados por `useId` pueden contener dos puntos que rompen referencias `url(#id)` en SVG.
- PageTransition usa `mode="wait"` para evitar solapamiento entre salida y entrada.
- FocusManager diseñado para modales personalizados; los Dialog de shadcn/ui ya tienen su propio manejo vía Radix UI.
