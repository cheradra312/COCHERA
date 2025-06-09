const CACHE_NAME = 'cargas-calculator-cache-v3';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-192x192.png',
  './icon-512x512.png'
];

// Instalar el Service Worker y cachear los archivos principales
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierta');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activar el Service Worker y limpiar cachés antiguas
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Interceptar peticiones y servir desde caché (estrategia Cache First)
self.addEventListener('fetch', event => {
  // Para las peticiones a Firebase, ir siempre a la red.
  if (event.request.url.includes('firestore.googleapis.com')) {
    return event.respondWith(fetch(event.request));
  }

  // Para todo lo demás, intentar servir desde la caché primero.
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Si se encuentra en caché, devolverlo.
        if (response) {
          return response;
        }
        // Si no, hacer la petición a la red.
        return fetch(event.request);
      })
  );
});
