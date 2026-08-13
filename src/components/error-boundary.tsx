'use client';

import React, { Component, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, AlertTriangle, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * ErrorBoundary — Captura errores de renderizado y muestra una pantalla
 * de recuperación amigable en lugar de una pantalla en blanco.
 *
 * Especialmente útil para el problema de "pantalla en blanco después de login"
 * que puede ocurrir cuando el estado persistido en localStorage está corrupto
 * o es incompatible con la versión actual del código.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Error capturado:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    // Limpiar localStorage y recargar
    try {
      localStorage.removeItem('ftp-digital-plus-store');
      localStorage.removeItem('ftp-digital-plus-store-v2');
      localStorage.removeItem('ftp-onboarding-completed');
      localStorage.removeItem('ftp-tour-completed');
      localStorage.removeItem('ftp-card-shared');
      localStorage.removeItem('ftp-feedback-dismissed');
    } catch (e) {
      console.error('Error limpiando localStorage:', e);
    }
    window.location.reload();
  };

  handleGoHome = () => {
    try {
      localStorage.removeItem('ftp-digital-plus-store');
      localStorage.removeItem('ftp-digital-plus-store-v2');
    } catch (e) {
      // ignore
    }
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 to-amber-50 p-4">
          <Card className="max-w-md w-full border-emerald-200 shadow-xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                <AlertTriangle className="h-8 w-8 text-amber-600" />
              </div>
              <CardTitle className="text-2xl text-slate-800">
                Algo salió mal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-sm text-muted-foreground">
                Ocurrió un error al cargar la aplicación. Esto puede deberse a
 datos almacenados de una sesión anterior. Intenta recargar la página o
 limpiar los datos.
              </p>

              {this.state.error && (
                <details className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
                  <summary className="cursor-pointer font-medium text-slate-600">
                    Ver detalles del error
                  </summary>
                  <pre className="mt-2 whitespace-pre-wrap break-words text-slate-500">
                    {this.state.error.message}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  onClick={this.handleReset}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Recargar y limpiar datos
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex-1"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Ir al inicio
                </Button>
              </div>

              <p className="text-center text-xs text-muted-foreground">
                Si el problema persiste, contacta a soporte en
                soporte@ftpdigitalplus.com
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
