# Task 3-d — Public Card View + QR Expired Page

- **Task ID:** 3-d
- **Agent:** Z.ai Code (section builder)
- **Task:** Build the public-facing Card view (`public-card.tsx`) and the `qr-expired.tsx` page for the FTP Digital Plus app.

## What was created

### 1. `src/components/sections/public-card.tsx`
Public-facing view of a business card (what visitors see when opening a card link).

**Key behaviors implemented:**
- Uses `useSelectedCard()` to find the card. If `null`, renders a polished **"Tarjeta no encontrada"** screen with a button to go home (`navigate('landing')`).
- **Records a view** on mount via `useEffect` with `[card?.id]` dependency calling `recordCardView(card.id)` once.
- Resolves the card owner's plan from `users` (via `card.userId`) to decide free vs. paid rendering.
- **Plan Gratis:** Renders `<CardPreview>` (which internally shows `FreeCardPreview` — image-style card with watermark + QR) and adds a prominent emerald **"Descargar Tarjeta"** button with loading state. Shows status badges (Plan Gratis, "Expira en Xd", or "QR Expirado" if applicable). Includes an upgrade hint card.
- **Paid plans (Básico / Pro):** Renders the full `<CardPreview>` web card plus:
  - **Floating banner** — dismissible, animated (framer-motion) popup at top when `card.banner.enabled` (with title, text, optional link, X close button).
  - **Action toolbar** — Download image (emerald, with spinner), WhatsApp share (green), Copy link.
  - **Secondary share row** — Facebook + Twitter/X share buttons (outline, emerald on hover — no blue/indigo in our UI chrome).
  - **Contact form** — Name / Email / Phone / Message, validated, calls `addMessage(card.id, {...})` and shows a success toast. Uses the card's `primaryColor` for the submit button.
  - **Appointment booking** — Card with team preview chips + "Agendar cita" button that opens a `Dialog` with member `Select`, date, time, name, email. On submit calls `addAppointment({ teamMemberId, clientName, clientEmail, date, time, status: 'pending' })`. Shows duration/price info from the selected `TeamMember`.
  - **Password protection** — `PasswordGate` component: if `card.passwordProtected`, shows a centered password card first; compares against `card.cardPassword`; on success reveals the card with a toast.
- **Download image:** `useCardDownload` hook holds a `qrRef` pointing to a hidden off-screen `<QRCodeCanvas>` (positioned absolute at `-9999px`, opacity 0). On download it queries the canvas, calls `toDataURL('image/png')`, passes it to `generateCardImage(card, userPlan, qrDataUrl)`, then `downloadDataUrl(...)`. Handles loading + error toasts.
- **Layout shell** (`PublicCardLayout`): `min-h-screen flex flex-col` with an emerald-to-amber gradient background, decorative blurred blobs, sticky header (small FTP logo if `!card.hideBrand`, with home button), centered `max-w-[500px]` main column, and a `mt-auto` footer with copyright + "Hecho con ♥ en México".
- **Owner CTA** at the bottom: "¿Eres el dueño de esta tarjeta? Inicia sesión" → `navigate('login')`.

### 2. `src/components/sections/qr-expired.tsx`
Page shown when someone scans an expired QR code.

- `min-h-screen flex flex-col` wrapper with a red → amber → rose gradient background and blurred decorative blobs.
- Centered white/translucent card (`max-w-md`) containing:
  - **Broken QR visual**: a 3×3 grid of faded red squares with a red "crack" line through it, a red/rose gradient warning badge (`AlertTriangle`) bouncing in via spring animation, and a floating "7 días" clock chip.
  - **Headline** "QR Expirado" with red→rose→amber gradient text.
  - **Message**: "Este código QR ha expirado. Los códigos QR del plan gratuito vencen después de 7 días."
  - **Info card** (emerald) explaining why free-plan QRs expire and how upgrading unlocks permanent QR.
  - **Primary CTA**: "Renueva en ftpdigitalplus.com" button → `navigate('landing')`.
  - **Secondary CTA**: "¿Eres el dueño de esta tarjeta? Inicia sesión" → `navigate('login')`.
  - **Plan hint**: small text mentioning Básico and Pro include permanent QR.
- Footer (sticky to bottom via `mt-auto`) with the FTP Digital Plus logo and copyright.

## Technical notes
- Both files are `'use client'`.
- Used shadcn/ui: `Button`, `Card`, `CardContent`, `CardHeader`, `CardTitle`, `CardDescription`, `Input`, `Label`, `Textarea`, `Badge`, `Dialog` (+`DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`), `Select` (+`SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue`).
- Used lucide-react: `Download`, `Share2`, `Copy`, `Calendar`, `Clock`, `AlertTriangle`, `MessageCircle`, `Lock`, `X`, `Check`, `Home`, `Facebook`, `Twitter`, `Send`, `ChevronRight`, `Sparkles`, `Mail`, `User`, `Phone`, `ExternalLink`, `Heart`, `RefreshCw`, `LogIn`, `QrCode`.
- Used `sonner` for toasts, `framer-motion` (`motion` + `AnimatePresence`) for entrance/exit animations, `cn()` from `@/lib/utils`, `QRCodeCanvas` from `qrcode.react`, `generateCardImage` / `downloadDataUrl` from `@/lib/card-image`, and the store helpers `useSelectedCard`, `useAppStore`.
- 100% Spanish copy. Emerald + Gold palette strictly used for the surrounding UI chrome (the card itself keeps its user-chosen `primaryColor` so demo cards like Tech Solutions retain their identity).
- Mobile-first responsive layout. Sticky footer via `min-h-screen flex flex-col` + `mt-auto`.

## Lint / build status
- `npx eslint src/components/sections/public-card.tsx src/components/sections/qr-expired.tsx` → **0 errors, 0 warnings**.
- Dev server compiles both files cleanly (see `dev.log`).
- Note: 6 pre-existing lint errors exist in `landing-page.tsx` and `pricing-page.tsx` (from other agents' work) — outside the scope of this task.
