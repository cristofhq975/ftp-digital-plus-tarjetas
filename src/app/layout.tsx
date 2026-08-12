import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { CommandPalette } from "@/components/command-palette";

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
  description: "Crea tarjetas de presentación digitales profesionales con FTP Digital Plus. Portafolio, menú, productos, QR y más. Planes gratis, básico y pro.",
  keywords: ["tarjetas digitales", "tarjetas de presentación", "NFC", "QR", "FTP Digital Plus", "marketing digital"],
  authors: [{ name: "FTP Digital Plus" }],
  icons: {
    icon: "/ftp-icon.svg",
  },
  openGraph: {
    title: "FTP Digital Plus — Tarjetas de Presentación Digitales",
    description: "Crea tarjetas de presentación digitales profesionales",
    siteName: "FTP Digital Plus",
    type: "website",
  },
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
          {children}
          <Toaster />
          <SonnerToaster position="top-right" richColors />
          <CommandPalette />
        </ThemeProvider>
      </body>
    </html>
  );
}
