'use client';

/**
 * SkipLink — Enlace "Saltar al contenido principal" que aparece al recibir
 * foco con Tab. Mejora la navegación por teclado para usuarios de lectores
 * de pantalla y usuarios que no pueden usar el ratón.
 *
 * El estilo visual (posición fija, animación de deslizamiento) está definido
 * por la clase `.skip-link` en `globals.css`.
 */
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="skip-link"
      // El div #main-content tiene tabIndex={-1}, así que recibe foco programático.
    >
      Saltar al contenido principal
    </a>
  );
}
