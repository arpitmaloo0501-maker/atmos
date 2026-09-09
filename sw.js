const CACHE_NAME = 'atmos-citizen-v1';
const ASSETS = [
  '/citizen_report.html',
  'https://cdn-icons-png.flaticon.com/512/1163/1163624.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request).catch(() => caches.match('/citizen_report.html')))
  );
});
