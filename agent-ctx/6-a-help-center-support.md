# Task 6-a: Help Center & Support System Builder

## Task
Crear Centro de Ayuda (FAQ + Guías) y Sistema de Tickets de Soporte para FTP Digital Plus.

## Files Modified/Created
- `src/lib/types.ts` — Añadidos 'help' y 'support' a ViewType + tipos SupportTicket
- `src/lib/store.ts` — Añadido supportTickets state, addTicket/addTicketResponse actions, partialize
- `src/lib/plans.ts` — Añadido entry 'help' a DASHBOARD_SECTIONS
- `src/components/sections/help-center.tsx` — Creado (~640 líneas)
- `src/components/sections/support-page.tsx` — Creado (~640 líneas)
- `src/app/page.tsx` — Añadidos cases 'help' y 'support'
- `src/components/sections/dashboard.tsx` — Añadido caso 'help' a handleNavigate + botón Soporte en sidebar footer

## Implementation Highlights

### Help Center
- Hero con gradiente esmeralda y search bar que filtra FAQ en tiempo real (con contador de resultados)
- 4 Quick Action cards: Guías y Tutoriales, Preguntas Frecuentes, Contactar Soporte, Estado del Servicio (con animación ping teal "Operativo")
- 6 Guide cards en grid que abren Dialog con guía paso a paso (timeline dashed con numeración emerald)
- 3 Resource buttons (Video tutoriales, PDF, Tips WhatsApp) con toasts informativos
- 10 FAQ items en 4 categorías (Cuenta 3, Facturación 3, Técnico 2, Tarjetas 2) con badges coloreados y count
- CTA final gradiente emerald con botón oro "Contactar Soporte"
- Footer sticky con mt-auto

### Support Page
- Header sticky con botón Volver, icono Headphones + título "Soporte Técnico", ThemeToggle, botón outline "Centro de Ayuda"
- Hero con título "¿Cómo podemos ayudarte?"
- Layout 2-col en desktop (lg:grid-cols-12): form+info izquierda (7), tickets derecha sticky (5)
- Formulario: Asunto (max 100 con contador), Categoría (Select 5 opciones), Prioridad (RadioGroup 3 con dots teal/amber/rose), Mensaje (min 20/max 1000 con contador), Adjuntar (mock toast Pro), Submit con loading spinner
- Tickets list con Collapsible por ticket: badges (status/category/priority), asunto, preview, fecha relativa, count respuestas. Al expandir: mensaje original + respuestas con avatares (Soporte con Headphones en círculo emerald, Usuario con iniciales en círculo slate)
- Empty state: "No tienes tickets abiertos" con CheckCircle emerald
- Sidebar info: 3 métodos (Correo, WhatsApp, Horario) + 3 SLA + tip Pro
- **Auto-response simulation**: useEffect observa newTicketId, setTimeout(2000) llama addTicketResponse con mensaje automático + actualiza status a 'en_progreso' + toast success
- Login required screen si no hay currentUser

### Store
- 2 tickets demo pre-creados:
  - ticket-demo-1 (user-pro): "No puedo personalizar el código QR" - técnico, media, resuelto, 3 respuestas
  - ticket-demo-2 (user-basico): "Consulta sobre upgrade a plan Pro" - facturación, baja, en_progreso, 1 respuesta
- `addTicket: (ticket) => string` — genera id, status='abierto', createdAt, responses=[], prepende
- `addTicketResponse: (ticketId, response, status?) => void` — appenda respuesta y actualiza status opcional
- `supportTickets` persistido en localStorage via partialize

## Verification
- ESLint: 0 errores, 0 warnings después de limpiar imports no usados
- TypeScript: 0 errores en archivos del proyecto
- agent-browser verificación end-to-end:
  - Help Center renderiza con todas las secciones
  - Support page con form, info sidebar, tickets list (1 demo ticket user-pro visible)
  - Form submission: ticket aparece en lista con status "En Progreso" y "1 respuesta" tras 2 segundos
  - Expansión del ticket muestra mensaje original + respuesta de "Soporte FTP Digital Plus"
  - Screenshot full-page guardado en /tmp/help-center-verification.png

## Status
✅ Production-ready. Listo para demostración.
