const CACHE_NAME = 'aethr-v1'
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/worlds',
  '/manifest.json',
]

// Install - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

// Activate - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Fetch - network first, cache fallback for pages
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET, API routes, and external resources
  if (request.method !== 'GET') return
  if (url.pathname.startsWith('/api/')) return
  if (!url.origin.includes(self.location.origin)) return

  event.respondWith(
    fetch(request)
      .then(response => {
        // Cache successful page responses
        if (response.ok && request.destination === 'document') {
          const clone = response.clone()
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone))
        }
        return response
      })
      .catch(() => caches.match(request).then(cached => cached || caches.match('/')))
  )
})

// Push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return
  const data = event.data.json()

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: { url: data.link || '/dashboard' },
      vibrate: [100, 50, 100],
    })
  )
})

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      const url = event.notification.data?.url || '/dashboard'
      for (const client of clientList) {
        if ('focus' in client) { client.focus(); client.navigate(url); return }
      }
      clients.openWindow(url)
    })
  )
})
