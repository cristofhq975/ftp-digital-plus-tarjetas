/* ========================================================================
   Service Worker — FTP Digital Plus
   Estrategias:
     - Precache de recursos críticos (app shell) en install
     - Network-first para navegación (HTML) con fallback a cache / offline
     - Cache-first para assets estáticos (JS, CSS, fuentes, imágenes, íconos)
     - Stale-while-revalidate para fuentes de Google y otros third-party
   Idioma: español (mensajes y página offline)
   ======================================================================== */

const SW_VERSION = 'ftp-digital-plus-v1.0.0';
const APP_SHELL_CACHE = `${SW_VERSION}-app-shell`;
const RUNTIME_CACHE = `${SW_VERSION}-runtime`;
const IMAGE_CACHE = `${SW_VERSION}-images`;

// Recursos críticos a precachear (app shell mínimo)
const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/ftp-icon.svg',
  '/ftp-logo.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/offline.html',
];

// Página offline fallback (construida dinámicamente si falta offline.html)
const OFFLINE_FALLBACK = '/offline.html';

// ---------------------------------------------------------------- install
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(APP_SHELL_CACHE);
      // Intentamos precachear; si algún recurso falla no rompemos la instalación
      await Promise.allSettled(
        PRECACHE_URLS.map(async (url) => {
          try {
            const res = await fetch(url, { cache: 'reload' });
            if (res && res.ok) {
              await cache.put(url, res.clone());
            }
          } catch (_) {
            /* ignora fallos individuales */
          }
        })
      );
      // Garantiza la página offline
      await ensureOfflinePage(cache);
      await self.skipWaiting();
    })()
  );
});

// ---------------------------------------------------------------- activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => !key.startsWith(SW_VERSION))
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

// ---------------------------------------------------------------- fetch
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Solo gestionamos GET; ignoramos peticiones no http(s) (chrome-extension, etc.)
  if (request.method !== 'GET' || !request.url.startsWith('http')) {
    return;
  }

  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;

  // ---- Navegación (HTML): network-first con fallback offline ----
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
    return;
  }

  // ---- Imágenes (mismo origen o externas): cache-first ----
  if (request.destination === 'image') {
    event.respondWith(handleImage(request));
    return;
  }

  // ---- Assets estáticos del mismo origen: cache-first ----
  if (
    sameOrigin &&
    (request.destination === 'style' ||
      request.destination === 'script' ||
      request.destination === 'font' ||
      request.destination === 'manifest')
  ) {
    event.respondWith(handleStaticAsset(request));
    return;
  }

  // ---- Recursos de terceros (fuentes Google, etc.): stale-while-revalidate ----
  if (!sameOrigin) {
    event.respondWith(handleStaleWhileRevalidate(request));
    return;
  }

  // ---- Por defecto: network con fallback a cache ----
  event.respondWith(handleDefault(request));
});

// -------------------------------------------------- handlers
async function handleNavigation(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    const appShell = await caches.match('/');
    if (appShell) return appShell;
    return (await caches.match(OFFLINE_FALLBACK)) || buildOfflineResponse();
  }
}

async function handleImage(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cached = await cache.match(request);
  if (cached) {
    // refresca en segundo plano
    fetch(request)
      .then((res) => {
        if (res && res.ok) cache.put(request, res.clone());
      })
      .catch(() => {});
    return cached;
  }
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (_) {
    // sin imagen: devolvemos un SVG placeholder esmeralda
    return buildPlaceholderImage();
  }
}

async function handleStaticAsset(request) {
  const cache = await caches.open(APP_SHELL_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (_) {
    const runtime = await caches.open(RUNTIME_CACHE);
    return (await runtime.match(request)) || Response.error();
  }
}

async function handleStaleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse && networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => cached);
  return cached || fetchPromise;
}

async function handleDefault(request) {
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(RUNTIME_CACHE);
    if (networkResponse && networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (_) {
    const cache = await caches.open(RUNTIME_CACHE);
    return (await cache.match(request)) || Response.error();
  }
}

// -------------------------------------------------- helpers
async function ensureOfflinePage(cache) {
  // Si offline.html fue precacheado, no hacemos nada
  if (await cache.match(OFFLINE_FALLBACK)) return;
  // Generamos una página offline estática con la identidad FTP
  const html = buildOfflineHTML();
  const response = new Response(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
  await cache.put(OFFLINE_FALLBACK, response.clone());
}

function buildOfflineResponse() {
  return new Response(buildOfflineHTML(), {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

function buildOfflineHTML() {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/>
<title>Sin conexión — FTP Digital Plus</title>
<meta name="theme-color" content="#059669"/>
<link rel="icon" href="/ftp-icon.svg"/>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{
    font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
    background:linear-gradient(135deg,#ecfdf5 0%,#ffffff 60%,#fef3c7 100%);
    color:#064e3b;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1.5rem;
  }
  .card{
    max-width:480px;width:100%;background:#fff;border-radius:24px;padding:2.5rem 2rem;
    box-shadow:0 20px 50px -20px rgba(5,150,105,0.35);text-align:center;border:1px solid #d1fae5;
  }
  .badge{
    width:84px;height:84px;border-radius:24px;margin:0 auto 1.25rem;
    background:linear-gradient(135deg,#059669,#10b981);
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 10px 24px -8px rgba(5,150,105,0.6);
  }
  .badge svg{width:46px;height:46px}
  h1{font-size:1.5rem;font-weight:800;color:#064e3b;margin-bottom:.5rem}
  p{font-size:.95rem;line-height:1.55;color:#065f46;opacity:.9;margin-bottom:1.25rem}
  .dot{display:inline-block;width:10px;height:10px;border-radius:50%;background:#f59e0b;margin-right:8px;vertical-align:middle;animation:pulse 1.6s infinite ease-in-out}
  @keyframes pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.4);opacity:.5}}
  .btn{
    display:inline-block;margin-top:.5rem;padding:.85rem 1.5rem;border-radius:12px;
    background:linear-gradient(135deg,#059669,#10b981);color:#fff;font-weight:600;
    text-decoration:none;border:none;cursor:pointer;font-size:.95rem;
  }
  .btn:hover{filter:brightness(1.05)}
  .hint{margin-top:1.25rem;font-size:.8rem;color:#6b7280}
</style>
</head>
<body>
  <main class="card" role="main">
    <div class="badge" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 12a9 9 0 1 1 18 0" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M3 12a9 9 0 0 0 18 0" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-dasharray="4 4" opacity=".4"/>
        <circle cx="12" cy="12" r="2.2" fill="#fbbf24"/>
      </svg>
    </div>
    <h1><span class="dot" aria-hidden="true"></span>Sin conexión</h1>
    <p>No pudimos cargar FTP Digital Plus porque estás sin internet. Tus tarjetas creadas anteriormente seguirán disponibles cuando recuperes la conexión.</p>
    <button class="btn" onclick="location.reload()">Reintentar ahora</button>
    <p class="hint">FTP Digital Plus · Tarjetas de Presentación Digitales</p>
  </main>
  <script>
    // Reintenta automáticamente cuando vuelve la conexión
    window.addEventListener('online', () => location.reload());
  </script>
</body>
</html>`;
}

function buildPlaceholderImage() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ecfdf5"/>
        <stop offset="100%" stop-color="#d1fae5"/>
      </linearGradient>
    </defs>
    <rect width="400" height="300" fill="url(#g)"/>
    <g fill="#10b981" opacity="0.85">
      <circle cx="200" cy="125" r="34"/>
      <rect x="120" y="180" width="160" height="14" rx="7"/>
      <rect x="150" y="208" width="100" height="10" rx="5" opacity=".7"/>
    </g>
    <text x="200" y="260" font-family="Arial,sans-serif" font-size="14" fill="#059669" text-anchor="middle" opacity=".8">FTP Digital Plus</text>
  </svg>`;
  return new Response(svg, {
    status: 200,
    headers: { 'Content-Type': 'image/svg+xml; charset=utf-8', 'Cache-Control': 'no-cache' },
  });
}

// -------------------------------------------------- mensajes
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data === 'GET_VERSION') {
    event.source.postMessage({ type: 'SW_VERSION', version: SW_VERSION });
  }
});
