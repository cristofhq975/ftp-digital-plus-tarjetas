'use client';

import { motion } from 'framer-motion';
import {
  AlertTriangle, Clock, RefreshCw, LogIn, Home, QrCode, X,
} from 'lucide-react';

import { useAppStore } from '@/lib/store';
import { FTPLogo } from '@/components/ftp-logo';
import { Button } from '@/components/ui/button';

export function QrExpiredSection() {
  const navigate = useAppStore(s => s.navigate);

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-red-50 via-amber-50 to-rose-100">
      {/* Decorative background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-red-200/40 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 h-[28rem] w-[28rem] rounded-full bg-amber-200/40 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-rose-200/30 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-4 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-center">
          <FTPLogo variant="icon" className="h-9 w-9" />
          <span className="ml-2 text-sm font-bold tracking-tight">
            <span className="text-emerald-700">FTP Digital</span>{' '}
            <span className="bg-gradient-to-r from-amber-500 to-amber-400 bg-clip-text text-transparent">Plus</span>
          </span>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          <div className="rounded-3xl border border-amber-100 bg-white/80 p-6 shadow-2xl shadow-rose-200/40 backdrop-blur-md sm:p-8">
            {/* Broken QR visual */}
            <div className="relative mx-auto mb-6 h-28 w-28">
              <motion.div
                initial={{ rotate: -8, opacity: 0 }}
                animate={{ rotate: -8, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="relative grid h-24 w-24 grid-cols-3 grid-rows-3 gap-1 rounded-lg border-2 border-red-200 bg-white p-2 shadow-md">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-sm bg-red-300/70"
                      style={{ opacity: 0.3 + (i % 3) * 0.2 }}
                    />
                  ))}
                  {/* Crack overlay */}
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="h-0.5 w-full -rotate-12 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                  </div>
                </div>
              </motion.div>

              {/* Warning badge */}
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.4 }}
                className="absolute -right-2 -top-2 flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-red-500 to-rose-600 shadow-lg"
              >
                <AlertTriangle className="h-6 w-6 text-white" />
              </motion.div>

              {/* Floating clock chip */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="absolute -bottom-3 -left-3 flex items-center gap-1 rounded-full border border-amber-200 bg-white px-2.5 py-1 text-[10px] font-bold text-amber-700 shadow-md"
              >
                <Clock className="h-3 w-3" />
                7 días
              </motion.div>
            </div>

            {/* Headline */}
            <div className="text-center">
              <motion.h1
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent sm:text-4xl"
              >
                QR Expirado
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base"
              >
                Este código QR ha expirado. Los códigos QR del{' '}
                <span className="font-semibold text-foreground">plan gratuito</span> vencen después de{' '}
                <span className="font-semibold text-amber-700">7 días</span>.
              </motion.p>
            </div>

            {/* Info card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
                  <RefreshCw className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-emerald-900">¿Por qué expira el QR?</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-emerald-800/80">
                    El plan gratuito genera códigos QR temporales. Mejora a un plan de pago para obtener
                    <span className="font-semibold"> QR permanente</span> y desbloquear todas las funciones.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-6 space-y-3"
            >
              <Button
                onClick={() => navigate('landing')}
                size="lg"
                className="w-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-700"
              >
                <RefreshCw className="h-5 w-5" />
                Renueva en ftpdigitalplus.com
              </Button>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">o</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <button
                onClick={() => navigate('login')}
                className="flex w-full items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <LogIn className="h-4 w-4" />
                ¿Eres el dueño de esta tarjeta? Inicia sesión
              </button>
            </motion.div>
          </div>

          {/* Plan hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground"
          >
            <QrCode className="h-3.5 w-3.5" />
            <span>
              Plan <span className="font-semibold text-emerald-700">Básico</span> y{' '}
              <span className="font-semibold text-amber-600">Pro</span> incluyen QR permanente
            </span>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer (sticky to bottom) */}
      <footer className="relative z-10 mt-auto border-t border-amber-100/60 bg-white/60 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-2 px-4 py-5 sm:flex-row sm:justify-between">
          <FTPLogo className="h-8 w-auto" />
          <p className="text-center text-xs text-muted-foreground sm:text-right">
            © {new Date().getFullYear()} FTP Digital Plus · Tarjetas de Presentación Digitales
          </p>
        </div>
      </footer>
    </div>
  );
}
