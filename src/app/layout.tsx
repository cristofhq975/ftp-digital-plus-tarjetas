import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { CommandPalette } from "@/components/command-palette";
import { GlobalSearch } from "@/components/global-search";
import { PlatformTour } from "@/components/platform-tour";
import { TourTrigger } from "@/components/tour-trigger";
import { SkipLink } from "@/components/accessibility/skip-link";
import { ScreenReaderAnnouncer } from "@/components/accessibility/screen-reader-announcer";
import { RegisterSW } from "@/components/pwa/register-sw";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { OfflineIndicator } from "@/components/pwa/offline-indicator";
import { FeedbackBanner } from "@/components/feedback/feedback-banner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FTP Digital Plus — Tarjetas de Presentación Digitales",
  description:
    "Crea tarjetas de presentación digitales profesionales con FTP Digital Plus. Portafolio, menú, productos, QR y más. Planes gratis, básico y pro.",
  keywords: [
    "tarjetas digitales",
    "tarjetas de presentación",
    "NFC",
    "QR",
    "FTP Digital Plus",
    "marketing digital",
  ],
  authors: [{ name: "FTP Digital Plus" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FTP Digital Plus",
  },
  icons: {
    icon: [
      { url: "/ftp-icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/icon-180.png", sizes: "180x180" }],
    shortcut: "/ftp-icon.svg",
  },
  openGraph: {
    title: "FTP Digital Plus — Tarjetas de Presentación Digitales",
    description: "Crea tarjetas de presentación digitales profesionales",
    siteName: "FTP Digital Plus",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#059669",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <SkipLink />
          <ScreenReaderAnnouncer />
          <OfflineIndicator />
          {/* Contenido principal — enfocable vía SkipLink (tabIndex={-1}) */}
          <div id="main-content" tabIndex={-1} className="outline-none">
            {children}
          </div>
          <Toaster />
          <SonnerToaster position="top-right" richColors />
          <CommandPalette />
          <GlobalSearch />
          <PlatformTour />
          <TourTrigger />
          <InstallPrompt />
          <RegisterSW />
          <FeedbackBanner />
        </ThemeProvider>
      </body>
    </html>
  );
}
