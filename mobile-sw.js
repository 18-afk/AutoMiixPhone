// AutoMix MX — Service Worker
const CACHE = 'automix-v1';
const ASSETS = [
  '/AutoMiixPhone/Index.html',
  '/AutoMiixPhone/mobile-manifest.json',
  '/AutoMiixPhone/icon-192.png',
  '/AutoMiixPhone/icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => {
      // addAll puede fallar si algún asset no existe — usamos add individual
      return Promise.allSettled(ASSETS.map(a => c.add(a)));
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  if(e.request.url.startsWith('blob:')) return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if(cached) return cached;
      return fetch(e.request).then(res => {
        if(res.ok) {
          caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        }
        return res;
      }).catch(() => cached);
    })
  );
});
