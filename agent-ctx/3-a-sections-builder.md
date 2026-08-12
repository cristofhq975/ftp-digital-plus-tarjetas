# Task 3-a — Landing, Pricing & Login Sections

**Agent:** Sections Builder (Z.ai Code)
**Task ID:** 3-a
**Task:** Crear 3 componentes de sección: landing-page.tsx, pricing-page.tsx, login-page.tsx

## Contexto previo leído
- `worklog.md` (Task 1 — fundación del proyecto)
- `src/lib/store.ts` (Zustand store con `navigate`, `login`)
- `src/lib/types.ts` (`ViewType`, `User`, `PlanType`)
- `src/lib/plans.ts` (`PLANS`, `PLAN_ORDER`, features por plan)
- `src/components/ftp-logo.tsx` (`<FTPLogo variant="full" | "icon" />`)

## Archivos creados

### 1. `src/components/sections/landing-page.tsx` (~1000 líneas)
Componente `LandingPage` con:
- **SiteHeader**: sticky con backdrop-blur, FTPLogo, nav (Inicio, Planes, Características, Contacto) con scroll suave, botón "Iniciar Sesión" (gradiente esmeralda), menú móvil con animación.
- **Hero**: gradiente esmeralda con blobs decorativos, headline con highlight dorado, CTAs ("Crear mi Tarjeta Gratis" → login, "Ver Planes" → pricing), badges de confianza, y mockup flotante de tarjeta digital con QR simulado en CSS + badges animados de estadísticas.
- **Features**: grid de 6 tarjetas con iconos (QrCode, Briefcase, ShoppingBag, CalendarDays, BarChart3, LayoutTemplate), gradientes alternados emerald/amber, hover lift.
- **HowItWorks**: 3 pasos numerados con conector gradient y badges dorados.
- **Stats**: 4 estadísticas (1000+, 50k+, 24, 99.9%) sobre gradiente esmeralda.
- **PricingPreview**: 3 cards de planes desde PLANS/PLAN_ORDER, plan "basico" destacado con ring esmeralda y badge dorado "Más popular", CTAs navegan a pricing.
- **Testimonials**: 3 testimonios con estrellas doradas y avatares con iniciales.
- **FinalCTA**: card grande con gradiente, patrón de puntos, doble CTA.
- **SiteFooter**: 4 columnas (brand+social, producto, empresa, contacto), copyright "FTP Digital Plus — Agencia de Diseño Web y Marketing Digital".

### 2. `src/components/sections/pricing-page.tsx` (~640 líneas)
Componente `PricingPage` con:
- **PricingHeader**: header simplificado (logo, Inicio, Iniciar Sesión).
- **PricingHero**: hero gradiente esmeralda con badges de confianza.
- **PlanCards**: 3 cards de planes (Gratis/Básico/Pro) con precio, periodo, descripción, maxCards, storage, 7 features preview, botón "Elegir Plan" → login. Plan básico destacado.
- **ComparisonTable**: tabla completa con las 32 features de cada plan, badges ✓/✗ (emerald/slate), columna del plan básico resaltada, header sticky, scroll vertical con scrollbar custom (clase `.ftp-comparison-scroll`).
- **FAQ**: Accordion con 5 preguntas (cambio de plan, expiración QR gratis, múltiples tarjetas, costos ocultos, cancelación).
- **FinalCTA + SiteFooter**: igual al landing.

### 3. `src/components/sections/login-page.tsx` (~510 líneas)
Componente `LoginPage` con split layout:
- **BrandPanel** (izquierda, oculto en mobile): gradiente esmeralda con blobs decorativos y patrón de puntos, FTPLogo theme="dark", tagline con highlight dorado, 3 beneficios (Configura en minutos / QR y NFC / Datos seguros), footer con stats (1000+, 50k+, 24).
- **FormPanel** (derecha): 
  - Top bar mobile con logo icon + botón Inicio.
  - Link "← Volver al inicio" → landing.
  - **LoginForm**: email (con icono Mail), password (con Lock + toggle Eye/EyeOff), botón "Iniciar Sesión" con loading spinner, error message, llama a `useAppStore(s => s.login)` — si true, store auto-navega a dashboard.
  - Divider "o continúa con".
  - **Registration**: "Registrarse con correo" y "Continuar con Google" → `toast.info('Próximamente disponible', ...)`.
  - **DemoAccounts**: 3 cuentas demo con badges de plan, descripción y botón "Usar esta cuenta" que auto-fill + login + toast de bienvenida.
  - Reassurance row (sin tarjeta / cancela / español).
- **LoginFooter**: footer compacto con `mt-auto` (sticky al bottom), copyright, redes.

## Decisiones técnicas

1. **Hook vs función helper para animaciones**: Originalmente creé `useFadeUp(delay)` que llamaba `useReducedMotion()`. ESLint flaggeó `react-hooks/rules-of-hooks` cuando se llamaba dentro de `.map()` callbacks. Lo refactoricé a `fadeUpProps(delay)` — función pura que retorna props de framer-motion (sin hooks). Mantiene las animaciones de entrada fade-up + slide.

2. **Colores**: 100% esmeralda (#059669 / emerald-600/700) + oro (#f59e0b / amber-400/500). Cero azul/índigo. Gradientes `from-emerald-700 via-emerald-600 to-emerald-800` para secciones hero/CTA, `from-amber-400 to-amber-500` para CTAs destacados y badges.

3. **Sticky footer**: Todos los componentes usan `min-h-screen flex flex-col` en el wrapper raíz y `mt-auto` (landing/pricing vía `flex-1` en main, login explícito en footer).

4. **Responsive mobile-first**: Headers con menú hamburguesa, grids que colapsan (lg:grid-cols-3 → sm:grid-cols-2 → grid-cols-1), BrandPanel oculto en `<lg`, top bar móvil en login.

5. **Navegación**: Todas las navegaciones usan `useAppStore(s => s.navigate)` con valores `'landing'`, `'pricing'`, `'login'`. Botones de plan navegan a login. Botón "Volver al inicio" navega a landing.

6. **Login flow**: `login(email, password)` retorna boolean. Si true, store setea `currentUser` y `currentView: 'dashboard'` automáticamente. Loading state con spinner y delay simulado (250-350ms) para feedback UX. Toast `success` en quick-login de cuentas demo.

7. **Demo accounts**: Las 3 cuentas (demo@gratis.com, demo@basico.com, demo@pro.com / demo123) se configuran en un array `DEMO_ACCOUNTS` con metadata (plan, label, descripción, badge color). El componente `DemoAccountRow` es independiente y maneja su propio loading state.

8. **Toast**: Importado de `sonner` directamente (`import { toast } from 'sonner'`). Toaster ya configurado en `layout.tsx` con `position="top-right" richColors`.

## Lint status
`bun run lint` — pasa sin errores. Las únicas reglas que requirieron ajuste fueron `react-hooks/rules-of-hooks` (resueltas convirtiendo `useFadeUp` → `fadeUpProps`).

## Dev server
Compilación exitosa, HTTP 200 en `/`. Sin warnings ni errores de TypeScript.

## Exportaciones disponibles para el siguiente agente
- `LandingPage` from `@/components/sections/landing-page`
- `PricingPage` from `@/components/sections/pricing-page`
- `LoginPage` from `@/components/sections/login-page`

El siguiente agente debe wire-up estas 3 exportaciones en `src/app/page.tsx` usando `useAppStore(s => s.currentView)` para renderizar la vista correspondiente.
