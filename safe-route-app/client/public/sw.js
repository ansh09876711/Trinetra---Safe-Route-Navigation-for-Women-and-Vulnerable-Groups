const CACHE_NAME = 'trinetra-map-cache-v1';
const MAP_TILE_DOMAINS = [
  'tile.openstreetmap.org',
  'basemaps.cartocdn.com',
  'google.com',
  'googleapis.com',
  'server.arcgisonline.com',
  'static.arcgis.com'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // NEVER intercept backend API calls (Port 5000)
  if (url.port === '5000' || url.hostname === 'localhost' && url.port === '5000') {
    return; // Let it fall through to the network
  }

  // Cache Map Tiles automatically as user pans the map
  if (MAP_TILE_DOMAINS.some(domain => url.hostname.includes(domain)) || url.pathname.endsWith('.png') || url.pathname.endsWith('.jpg')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          const fetchPromise = fetch(event.request).then((networkResponse) => {
            // Save newly fetched tiles to cache
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          }).catch(() => {
            // If network fails, try to return from cache
            return response;
          });
          return response || fetchPromise;
        });
      })
    );
    return;
  }

  // Regular App Assets (JS, CSS, HTML)
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// Listener to clear cache or get size if needed
self.addEventListener('message', (event) => {
  if (event.data === 'GET_CACHE_SIZE') {
    caches.open(CACHE_NAME).then(cache => {
      cache.keys().then(keys => {
        event.source.postMessage({ type: 'CACHE_SIZE', count: keys.length });
      });
    });
  }
});
