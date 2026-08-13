# Task 14-a — Keyboard Shortcuts Overlay + Integrations Page

**Agente:** Subagent (Z.ai Code)
**Task ID:** 14-a
**Componentes afectados:**
- `src/lib/types.ts` (ViewType += 'integrations')
- `src/lib/plans.ts` (DASHBOARD_SECTIONS += integrations)
- `src/lib/integrations-data.ts` (nuevo)
- `src/components/dynamic-icon.tsx` (+Plug, +Keyboard)
- `src/components/keyboard-shortcuts-overlay.tsx` (nuevo)
- `src/components/sections/integrations-page.tsx` (nuevo)
- `src/components/sections/dashboard.tsx` (+handleNavigate branch + `?` button)
- `src/app/page.tsx` (+case 'integrations')
- `src/app/layout.tsx` (+KeyboardShortcutsOverlay at root)

## Decisiones de diseño

### Overlay de atajos de teclado
- **Única instancia global** montada en `layout.tsx` (no se duplica en el dashboard para evitar dos listener de `?` compitiendo).
- **Botón visible `?`** añadido al header del sidebar del dashboard (junto a ThemeToggle), implementa `KeyboardShortcutsButton` que dispatcha el custom event `ftp:open-keyboard-shortcuts`.
- Limpieza de búsqueda al cerrar: uso de `handleSetOpen(next)` wrapper en lugar de `useEffect` con setState (cumple la regla `react-hooks/set-state-in-effect`).
- 5 categorías: Navegación, Acciones, Editor, Vista, Tour.
- 25 atajos en total con iconos personalizados para ⌘, ⇧, ⇥, ⌫, ESC.
- Búsqueda en español + inglés (campo `search`).

### Integraciones
- 12 integraciones cubriendo 7 categorías: WhatsApp Business, Stripe, PayPal, Google Calendar, Google Analytics, Meta Pixel, Instagram, Mailchimp, Zapier, Slack, Mercado Pago, Hotjar.
- Estados: 8 disponibles (Disponible/esmeralda), 3 próximamente (Próximamente/ámbar), 1 premium (Premium/oro con Crown).
- 4 marcadas como populares: WhatsApp, Stripe, Meta Pixel, Mercado Pago (badge Popular con Sparkles).
- Setup Dialog con pasos numerados animados (stagger) y nota de seguridad ShieldCheck.
- Conectar deshabilitado para `coming_soon`/`premium`, con estado visual diferenciado.
- CTA final "Solicitar integración" → toast + navigate('support').
- Cada integración mantiene su color de marca en el ícono (gradient background con su hex).

## Estructura del overlay
- Header con gradiente esmeralda→ámbar + buscador autoFocus
- Tabs horizontales por categoría (Todas, Navegación, Acciones, Editor, Vista, Tour) + badge de resultados
- Body con scroll custom + grid de 2 columnas de atajos
- Footer con CTA "¿Necesitas más ayuda?" → navigate('help')

## Lint
- `bun run lint` → 0 errores, 0 warnings.
- Dev server compila limpio.

## Notas para futuros agentes
- Para abrir el overlay desde cualquier botón custom: `window.dispatchEvent(new CustomEvent('ftp:open-keyboard-shortcuts'))` o usar `<KeyboardShortcutsButton />` ya exportado.
- El evento está exportado como `OPEN_KEYBOARD_SHORTCUTS_EVENT`.
- Si se agregan nuevas integraciones: mantener `setupSteps` (mín. 4), `features` (mín. 3) y `color` (hex) para consistencia visual.
