const CACHE_NAME = 'daeda-health-v1'
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Добавить другие статичные ресурсы по необходимости
]

// Установка Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...')
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching files')
        return cache.addAll(urlsToCache)
      })
      .then(() => {
        console.log('[SW] Installation complete')
        return self.skipWaiting()
      })
  )
})

// Активация Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...')
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('[SW] Activation complete')
        return self.clients.claim()
      })
  )
})

// Перехват сетевых запросов
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Стратегия кэширования: Network First для API, Cache First для статики
  if (url.pathname.startsWith('/api/')) {
    // Network First для API запросов
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Кэшируем успешные GET запросы
          if (request.method === 'GET' && response.status === 200) {
            const responseClone = response.clone()
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseClone)
              })
          }
          return response
        })
        .catch(() => {
          // Fallback к кэшу при отсутствии сети
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse
              }
              // Возврат базовой ошибки для API
              return new Response(
                JSON.stringify({ 
                  success: false, 
                  error: 'Нет соединения с сервером' 
                }),
                {
                  status: 503,
                  statusText: 'Service Unavailable',
                  headers: { 'Content-Type': 'application/json' }
                }
              )
            })
        })
    )
  } else {
    // Cache First для статических ресурсов
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse
          }
          
          return fetch(request)
            .then((response) => {
              // Кэшируем статические ресурсы
              if (response.status === 200) {
                const responseClone = response.clone()
                caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(request, responseClone)
                  })
              }
              return response
            })
            .catch(() => {
              // Fallback для HTML страниц
              if (request.destination === 'document') {
                return caches.match('/')
              }
              return new Response('Ресурс недоступен офлайн', {
                status: 503,
                statusText: 'Service Unavailable'
              })
            })
        })
    )
  }
})

// Обработка push уведомлений (для будущего использования)
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event)
  
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body || 'Новое уведомление от ДаЕда',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [200, 100, 200],
      data: data.data || {},
      actions: data.actions || [
        {
          action: 'open',
          title: 'Открыть приложение'
        },
        {
          action: 'close',
          title: 'Закрыть'
        }
      ]
    }

    event.waitUntil(
      self.registration.showNotification(
        data.title || 'ДаЕда',
        options
      )
    )
  }
})

// Обработка кликов по уведомлениям
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event)
  
  event.notification.close()

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

// Синхронизация в фоне (для будущего использования)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag)
  
  if (event.tag === 'sync-health-data') {
    event.waitUntil(
      // Здесь можно добавить логику синхронизации данных
      Promise.resolve()
    )
  }
})

// Обработка ошибок
self.addEventListener('error', (event) => {
  console.error('[SW] Error:', event.error)
})

self.addEventListener('unhandledrejection', (event) => {
  console.error('[SW] Unhandled promise rejection:', event.reason)
}) 