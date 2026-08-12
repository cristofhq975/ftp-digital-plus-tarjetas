# Task 8-b — Interactive Platform Tour

## Agent
Subagent (Interactive Platform Tour Builder)

## Task
Tour guiado interactivo de la plataforma FTP Digital Plus con spotlight overlay, 8 pasos, navegación entre vistas y múltiples puntos de activación.

## Archivos creados / modificados

### Creados
- `src/components/platform-tour.tsx` (~720 líneas) — `PlatformTour` + `TourInner` + `startPlatformTour` + `useTourCompleted`
- `src/components/tour-trigger.tsx` (~140 líneas) — `TourTrigger` botón flotante

### Modificados
- `src/lib/store.ts` — añadido `tourActive: boolean` (no persistido) + `setTourActive` action
- `src/app/layout.tsx` — montado `<PlatformTour />` y `<TourTrigger />` globalmente
- `src/components/sections/dashboard.tsx` — añadido botón "Ver Tour" (Compass) en welcome banner del Tablero
- `src/components/sections/help-center.tsx` — añadido banner "Tour Interactivo" featured en QuickActions + import Compass
- `src/components/onboarding-wizard.tsx` — añadido estado `startTourAfterFinish` + toggle en StepShare + activación post-finalización

## Diseño del tour (8 pasos)

| # | Título | Vista | Selector | Modalidad |
|---|--------|-------|----------|-----------|
| 1 | ¡Bienvenido a FTP Digital Plus! | — | — | Center modal |
| 2 | Crear Tarjeta | dashboard | `button:has-text("Crear Nueva Tarjeta")` | Spotlight |
| 3 | Editor de Tarjetas | editor | `aside.border-r nav` | Spotlight |
| 4 | Personalización | editor (section=plantillas) | `aside.border-r` | Spotlight |
| 5 | Vista Previa en Vivo | editor | `aside.border-l` | Spotlight |
| 6 | Galería de Plantillas | template-gallery | `h1` | Center modal |
| 7 | Analítica | stats | `h1` | Center modal |
| 8 | ¡Listo para empezar! | — | — | Center modal |

## Implementación técnica

### Spotlight overlay
- **Técnica**: `boxShadow: '0 0 0 9999px rgba(15,23,42,0.72), 0 0 0 2px rgba(245,158,11,0.9) inset'` en un `motion.div` con `pointer-events-none`
- **Animación**: framer-motion spring (stiffness 200, damping 26) animando `left/top/width/height`
- **Click-blocker**: `<div className="absolute inset-0" onClick={handleSkip} />` debajo del spotlight para bloquear clicks fuera del tooltip

### Pulse ring
- `motion.div` con `border-2 border-amber-400` que sigue al spotlight
- `motion.span` interno con animación `opacity: [0.6, 0, 0.6]` + `scale: [1, 1.08, 1]` en bucle 1.6s

### Búsqueda de elementos
- Soporta pseudo-selector `:has-text("...")` para buscar buttons/anchors por texto
- Soporta selectores CSS estándar
- Fallback a modal centrado si no se encuentra

### Navegación entre vistas
- Si `currentStepData.view !== currentView`, llama `navigate(view)` y espera 600ms
- `ensureCardSelected`: verifica tarjeta seleccionada antes de pasos del editor
- `setEditorSection`: cambia la sección activa del editor

### Recálculo
- `window.addEventListener('resize', handle)`
- `window.addEventListener('scroll', handle, true)` (capture phase)
- Reposiciona spotlight + tooltip

### Atajos de teclado
- ESC → cierra (sin completar)
- → → siguiente paso
- ← → anterior paso

## Puntos de activación del tour

1. **TourTrigger** (botón flotante bottom-right): visible si logueado + no completado + vista no oculta
2. **Dashboard** welcome banner: botón "Ver Tour" (amber)
3. **Help Center** QuickActions: banner featured "Tour Interactivo"
4. **Onboarding Wizard** StepShare: toggle "Ver tour de la plataforma" (default on) → activa tour al finalizar

## Estado global (store.ts)

```typescript
tourActive: boolean;  // session-only, no persistido
setTourActive: (active: boolean) => void;
```

`tourActive` NO está en `partialize` → se resetea al recargar la página.

## localStorage

- `ftp-tour-completed` = `'1'` se setea al finalizar el tour (no al saltar)
- TourTrigger lo lee vía `useSyncExternalStore` para ocultarse si ya completado

## Verificación

- `bun run lint` → EXIT=0
- `bunx tsc --noEmit` → 0 errores en `src/`
- Paleta 100% esmeralda + oro
- 100% español
- Sin regresiones
