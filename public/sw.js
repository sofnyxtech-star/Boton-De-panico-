// Service Worker — Aguilas del Sol Central de Monitoreo
const CACHE_NAME = 'ads-central-v3';
const ASSETS_TO_CACHE = [
  '/',
  '/login',
  '/manifest.json',
  '/logo-ads.png',
  '/favicon.png',
];

// Install
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

// Mensaje desde el cliente para activar nuevo SW inmediatamente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((names) =>
        Promise.all(
          names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
        )
      ),
      self.clients.claim(),
    ])
  );
});

// Fetch — network first para HTML, cache first para assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // No cachear API calls ni Supabase
  if (url.pathname.startsWith('/api/') || url.hostname.includes('supabase')) {
    return;
  }

  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request).then((r) => r || caches.match('/')))
    );
  } else {
    event.respondWith(
      caches.match(request).then((cached) => {
        return (
          cached ||
          fetch(request).then((response) => {
            if (response.ok && response.type === 'basic') {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return response;
          })
        );
      })
    );
  }
});

// Push notification recibida
self.addEventListener('push', (event) => {
  let data = {
    title: 'Nueva Alerta',
    body: 'Se ha recibido una alerta de panico',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    tag: 'alert',
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
    } catch {
      data.body = event.data.text() || data.body;
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icons/icon-192.png',
    badge: data.badge || '/icons/icon-72.png',
    tag: data.tag || 'alert',
    requireInteraction: true,
    vibrate: [200, 100, 200, 100, 200],
    data: {
      url: data.url || '/',
      alertId: data.alertId,
      timestamp: Date.now(),
    },
    actions: [
      { action: 'view', title: 'Ver alerta' },
      { action: 'dismiss', title: 'Descartar' },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Click en notificacion
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});

// Push subscription cambiada (renovacion automatica)
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    self.registration.pushManager
      .subscribe({ userVisibleOnly: true })
      .then((subscription) => {
        return fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription),
        });
      })
  );
});
