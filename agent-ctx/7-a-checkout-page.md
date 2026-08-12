# Task 7-a — Checkout / Payment Page

- **Task ID:** 7-a
- **Agent:** Checkout Page Builder (Z.ai Code)
- **Task:** Build a complete Checkout/Payment page (mock Stripe-like flow) for FTP Digital Plus, wire it into the SPA router, and update all "Elegir Plan" / "Mejorar Plan" CTAs to feed the new checkout flow.

---

## Work Log

### 1. Types (`src/lib/types.ts`)
- Added `'checkout'` to the `ViewType` union (placed right after `'pricing'`).

### 2. Store (`src/lib/store.ts`)
- Added `selectedPlanForCheckout: PlanType | null` to `AppState` (init `null`).
- Added action `setSelectedPlanForCheckout: (plan: PlanType | null) => void`.
- Implemented the setter (`set({ selectedPlanForCheckout: plan })`).
- Added `selectedPlanForCheckout` to the `partialize` block so it survives reloads.

### 3. CheckoutPage component (`src/components/sections/checkout-page.tsx`)
- `'use client'`, Spanish 100%, Emerald + Gold palette (no blue/indigo — brand badges recolored to slate/amber/emerald; PayPal icon container recolored to emerald gradient).
- **Layout:** two-column split (60/40 via `lg:grid-cols-5`) on desktop, stacked on mobile (form first, then sticky summary).
- **Header:** sticky, FTPLogo + ThemeToggle + "Volver".
- **Step indicator:** 1. Plan ▸ 2. Pago ▸ 3. Confirmación (animated active/done states).
- **Plan selection screen** (shown when `selectedPlanForCheckout` is `null`): cards for `basico` and `pro` only, click → `setSelectedPlanForCheckout` + toast.
- **Payment form** (left column):
  - Payment method **Tabs**: Tarjeta / PayPal / Transferencia.
  - **Tarjeta** form via `react-hook-form` + `zod` (`cardSchema`): card number with live 4-group formatting (max 16 digits), brand auto-detect (Visa/Mastercard/Amex) shown as a badge, expiry auto-slash `MM/YY` with validity check, CVC numeric max 4, name on card, email pre-filled from `currentUser.email`, "Guardar tarjeta" checkbox. Controlled inputs sync to RHF via `setValue(..., { shouldValidate: true })`.
  - **PayPal** form: redirect message, PayPal-branded icon container, email field with zod validation.
  - **Transferencia** form: SPEI instructions, copyable bank details (Banco, CLABE, Titular, Referencia) with toast feedback, holder name input, "Subir comprobante" mock button (toast).
  - Security badges row: SSL 256-bit, PCI DSS, Pago seguro.
  - Terms checkbox (links to legal pages — navigates back to pricing for now).
  - Pay button: `Pagar $XXX.00 MXN` — disabled until form valid + terms accepted; shows `Loader2` spinner + "Procesando pago..." during mock 2s processing; toast loading/success flow.
- **Order summary** (right column, `lg:sticky lg:top-24`):
  - Plan name + badge.
  - Price breakdown: Subtotal, Descuento (if promo), IVA 16%, Total — all formatted `es-MX` currency.
  - Promo code input + "Aplicar" button: `FTP10` = 10%, `BIENVENIDA` = 20% (invalid → error toast; valid → success toast + removable chip).
  - Plan features list (first 12 included, scrollable `max-h-56`).
  - "Tu plan se activará inmediatamente después del pago" note.
  - "Garantía de devolución 7/15 días" badge.
- **Success screen** (after mock payment): framer-motion spring checkmark animation, "¡Pago completado!", plan details card (plan, precio, tarjetas, almacenamiento) + "Siguientes pasos" list, two CTAs: "Ir a mi panel" → `navigate('dashboard')`, "Crear mi primera tarjeta" → `navigate('editor')`. Calls `upgradePlan(pickedPlan)` on success. Clears `selectedPlanForCheckout` on navigation away.
- **Footer:** sticky to bottom (`mt-auto`), security note + copyright.
- Framer Motion `AnimatePresence mode="wait"` for transitions between selection / payment / success states.

### 4. Router (`src/app/page.tsx`)
- Imported `CheckoutPage` and added `case 'checkout': return <CheckoutPage />;`.

### 5. Pricing page (`src/components/sections/pricing-page.tsx`)
- `PlanCards.handleChoose` now takes `planId`:
  - `gratis` → `navigate('login')` (register flow, no checkout).
  - paid plans → `setSelectedPlanForCheckout(planId)` + `navigate('checkout')` if logged in, else `navigate('login')`.
- Button `onClick={() => handleChoose(planId)}`.

### 6. Dashboard (`src/components/sections/dashboard.tsx`)
- `TableroSection`: added `setSelectedPlanForCheckout` from store; `handleUpgrade` now suggests next tier (`gratis→basico`, else `pro`), sets it, and `navigate('checkout')`. Used by the limit-reached banner and `PlanInfoCard`.
- `AffiliationsSection`: added local `setSelectedPlanForCheckout` + `handleUpgrade` (same next-tier logic); the empty-state "Mejorar Plan" button now calls `handleUpgrade` instead of `navigate('pricing')`.

### 7. Landing page (`src/components/sections/landing-page.tsx`)
- Imported `PlanType` type.
- `PricingPreview`: added `currentUser` + `setSelectedPlanForCheckout` selectors and a `handleChoose(planId)` mirroring the pricing-page logic.
- Per-plan CTA button label changed from "Ver detalles" → "Elegir Plan", wired to `handleChoose(planId)`.
- "Comparar todos los planes" link still routes to the full pricing page.

### 8. Verification
- `bun run lint` → 0 errors, 0 warnings (3 pre-existing warnings in `share-modal.tsx` are unrelated and not touched).
- Dev server (`dev.log`) compiles cleanly, no runtime errors, `GET / 200`.

---

## Stage Summary

The FTP Digital Plus app now has a fully functional, production-feel checkout/payment experience accessible from the pricing page, the landing pricing preview, and the dashboard's "Mejorar Plan" CTAs. The flow is:

1. User clicks **Elegir Plan** / **Mejorar Plan** → `selectedPlanForCheckout` is set in the Zustand store (persisted) and the SPA navigates to the new `checkout` view (or to `login` first if not authenticated; `gratis` plan still routes to login/register directly).
2. If no plan is pre-selected, the checkout page shows a **plan selection** screen (basico/pro).
3. The **payment layout** presents a validated card form (with brand detection + live formatting), PayPal redirect mock, or SPEI transferencia mock, alongside a sticky **order summary** with promo codes (`FTP10` 10%, `BIENVENIDA` 20%), IVA 16%, feature list, activation note, and 7/15-day money-back guarantee.
4. On submit, a 2s mock processing → success animation → `upgradePlan` is invoked, plan details + next steps are shown, and the user can jump to the dashboard or the card editor.

All edits are surgical and non-breaking: existing routes, store API, and component contracts are preserved; only additive changes were made to `ViewType`, `AppState`, and the CTA handlers. Colors stay within the Emerald (#059669) + Gold (#f59e0b) palette, the footer is sticky to the bottom, and the design is fully responsive.
