const CACHE_NAME = 'cargas-calculator-cache-v2'; // Versión actualizada para forzar la actualización
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
  // Los scripts externos como Tailwind y Firebase se cachearán dinámicamente.
];

// Evento 'install': se ejecuta cuando el service worker se instala.
// Cachea los archivos principales de la aplicación para que funcione sin conexión.
self.addEventListener('install', event => {
  console.log('Service Worker: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Cacheando archivos principales de la app.');
        return cache.addAll(urlsToCache);
      })
  );
});

// Evento 'activate': se ejecuta cuando el service worker se activa.
// Se encarga de limpiar las cachés antiguas para liberar espacio.
self.addEventListener('activate', event => {
  console.log('Service Worker: Activando...');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Eliminando caché antigua', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Evento 'fetch': se interceptan todas las peticiones de red.
// Estrategia: "Network Falling Back to Cache".
// 1. Intenta obtener la respuesta de la red.
// 2. Si tiene éxito, la guarda en caché para futuras visitas sin conexión.
// 3. Si la red falla, intenta servir el recurso desde la caché.
self.addEventListener('fetch', event => {
  // Solo se cachean las peticiones GET.
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Si la respuesta de la red es válida, la clonamos y guardamos en caché.
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
        }
        return response;
      })
      .catch(() => {
        // Si la red falla, buscamos en la caché.
        return caches.match(event.request)
          .then(response => {
            if (response) {
              return response; // Devolvemos la respuesta desde la caché.
            }
            // Opcional: podrías devolver una página de "sin conexión" genérica aquí.
          });
      })
  );
});
