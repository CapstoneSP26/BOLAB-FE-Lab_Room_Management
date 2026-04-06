/* eslint-disable no-undef */

const CACHE_NAME = 'bolab-v1';
const RUNTIME_CACHE = 'bolab-runtime-v1';
const API_CACHE = 'bolab-api-v1';

// Files to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE && cacheName !== RUNTIME_CACHE) {
            console.log('[ServiceWorker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // API calls - Network first with cache fallback
  if (url.pathname.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.status === 200) {
            const cache = caches.open(API_CACHE);
            cache.then((c) => c.put(request, response.clone()));
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache on network error
          return caches.match(request).then((cached) => {
            return cached || new Response('Offline - API unavailable', { status: 503 });
          });
        })
    );
    return;
  }

  // Face-api models - Cache once
  if (url.pathname.includes('/models/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          return cached;
        }
        return fetch(request).then((response) => {
          if (response.status === 200) {
            const cache = caches.open(CACHE_NAME);
            cache.then((c) => c.put(request, response.clone()));
          }
          return response;
        });
      })
    );
    return;
  }

  // Static assets - Cache first
  if (
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.woff')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          return cached;
        }
        return fetch(request)
          .then((response) => {
            const cache = caches.open(RUNTIME_CACHE);
            cache.then((c) => {
              if (response.clone) {
                c.put(request, response.clone());
              }
            });
            return response;
          })
          .catch(() => {
            return new Response('Offline - Resource unavailable', { status: 503 });
          });
      })
    );
    return;
  }

  // HTML documents - Network first
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const cache = caches.open(RUNTIME_CACHE);
          cache.then((c) => c.put(request, response.clone()));
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            return cached || new Response('Offline - Page unavailable', { status: 503 });
          });
        })
    );
    return;
  }

  // Default - Network first
  event.respondWith(
    fetch(request)
      .then((response) => response)
      .catch(() => {
        return caches.match(request).then((cached) => {
          return cached || new Response('Offline - Request failed', { status: 503 });
        });
      })
  );
});

// Handle push notifications
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/pwa-192x192.png',
      badge: '/pwa-badge-72x72.png',
      tag: data.tag || 'notification',
      requireInteraction: data.requireInteraction || false,
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if the app is already open
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window if not already open
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

console.log('[ServiceWorker] Loaded');
