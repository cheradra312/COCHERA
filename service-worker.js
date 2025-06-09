// Importar los scripts de Firebase
importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-messaging-compat.js');

// **IMPORTANTE**: Pega aquí tu configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBt0xUQ7Y03L3vlTPUps7ayQIR6ZTKwOVg",
    authDomain: "monteagudo-10283.firebaseapp.com",
    projectId: "monteagudo-10283",
    storageBucket: "monteagudo-10283.appspot.com",
    messagingSenderId: "1057163945614",
    appId: "1:1057163945614:web:731abb879ff9fc1f9e8bdf",
    measurementId: "G-4JX5TVCPH0"
};

// Inicializar la app de Firebase en el Service Worker
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Manejador para notificaciones en segundo plano
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: './icon-192x192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});


const CACHE_NAME = 'cargas-calculator-cache-v4';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-192x192.png',
  './icon-512x512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

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

self.addEventListener('fetch', event => {
  if (event.request.url.includes('firestore.googleapis.com')) {
    return event.respondWith(fetch(event.request));
  }
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
