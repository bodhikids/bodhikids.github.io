const CACHE_NAME = 'bodhi-cache-v1';
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

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});