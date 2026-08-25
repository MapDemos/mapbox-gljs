/*const CACHE_NAME = 'mapbox-tiles-v1';
const TILE_URL_PATTERN = 'https://map-api.mapxus.co.jp/maps/v1/tiles/indoor/';

self.addEventListener('install', (event) => {
    // Perform install steps
    self.skipWaiting(); // Activate worker immediately
});

self.addEventListener('activate', (event) => {
    // Clean up old caches if necessary
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
    const requestUrl = event.request.url;

    // Only cache tile requests
    if (requestUrl.startsWith(TILE_URL_PATTERN)) {
        event.respondWith(
            caches.open(CACHE_NAME).then(async (cache) => {
                const cachedResponse = await cache.match(event.request);
                const maxAge = 3600 * 1000; // 1 hour in milliseconds

                // If a cached response exists, check its age
                if (cachedResponse) {
                    const cacheTimestamp = cachedResponse.headers.get('sw-cache-timestamp');
                    // If the cache is fresh, return it
                    if (cacheTimestamp && (Date.now() - cacheTimestamp < maxAge)) {
                        return cachedResponse;
                    }
                }

                // Otherwise, fetch from the network
                const networkResponse = await fetch(event.request);

                // Check if we received a valid response
                if (networkResponse && networkResponse.status === 200) {
                    // Send a message to the client to increment the counter
                    self.clients.matchAll().then(clients => {
                        clients.forEach(client => {
                            client.postMessage({ type: 'TILE_FETCHED_FROM_NETWORK' });
                        });
                    });

                    // Create a new response with a timestamp header
                    const responseToCache = networkResponse.clone();
                    const headers = new Headers(responseToCache.headers);
                    headers.set('sw-cache-timestamp', Date.now());

                    const body = await responseToCache.blob();
                    const responseWithHeader = new Response(body, {
                        status: responseToCache.status,
                        statusText: responseToCache.statusText,
                        headers: headers
                    });

                    // Store the new response in the cache
                    cache.put(event.request, responseWithHeader);
                }

                return networkResponse;
            })
        );
    } else {
        // For non-tile requests, just fetch from the network
        event.respondWith(fetch(event.request));
    }
});
*/