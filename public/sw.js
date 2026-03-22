// Service Worker for push notifications
const CACHE_NAME = 'fixr-v1'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/dashboard',
        '/manifest.json',
        '/icon-192x192.png',
        '/icon-512x512.png',
      ])
    })
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

self.addEventListener('push', (event) => {
  const options = {
    body: 'Fixr notification',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/checkmark.png',
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/xmark.png',
      },
    ],
  }

  if (event.data) {
    const data = event.data.json()
    options.body = data.body || 'Fixr notification'
    options.data = { ...options.data, ...data }
  }

  event.waitUntil(
    self.registration.showNotification('Fixr', options)
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'explore') {
    // Open the app to specific URL if provided
    const urlToOpen = event.notification.data?.url || '/dashboard'
    
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        // If a window is already open, focus it
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus()
          }
        }
        
        // Otherwise, open a new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      })
    )
  }
})

self.addEventListener('notificationclose', (event) => {
  // Track notification dismissal if needed
  console.log('Notification closed', event)
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request)
    })
  )
})
