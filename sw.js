const CACHE_NAME = 'bodhi-cache-v2'; // Bumped version
const urlsToCache = [
    '/',
    '/index.html',
    '/assets/css/style.css',
    '/js/app.js',
    '/js/gemini.js',
    '/js/prompts.js',
    '/js/ui.js',
    '/js/progress.js',
    '/assets/images/icon-192x192.png',
    '/assets/images/icon-512x512.png',
    'https://fonts.googleapis.com/css2?family=Nunito:wght@400;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/showdown/2.1.0/showdown.min.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.open(CACHE_NAME).then(cache => {
            return cache.match(event.request).then(response => {
                const fetchPromise = fetch(event.request).then(networkResponse => {
                    // If we get a valid response, update the cache
                    if (networkResponse && networkResponse.status === 200) {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                }).catch(err => {
                    // Fetch failed, probably offline
                    console.log('Fetch failed; returning offline page instead.', err);
                });

                // Return the cached response immediately if available, otherwise wait for the network
                return response || fetchPromise;
            });
        })
    );
});