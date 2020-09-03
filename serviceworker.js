var CACHE_NAME = 'toka-20200903';
var urlsToCache = [
    '/TokaBlockGenelator/',
    '/TokaBlockGenelator/index.html',
    '/TokaBlockGenelator/css/style.css',
    '/TokaBlockGenelator/css/phone.css',
    '/TokaBlockGenelator/icons/BlockGenerator.png',
    '/TokaBlockGenelator/icons/error.png',
    '/TokaBlockGenelator/icons/ItemGenerator.png',
    '/TokaBlockGenelator/icons/ManifestGenelator.png',
    '/TokaBlockGenelator/img/github.svg',
    '/TokaBlockGenelator/img/home.svg',
    '/TokaBlockGenelator/img/icon.svg',
    '/TokaBlockGenelator/img/icon.webp',
    '/TokaBlockGenelator/img/icon_256.png',
    '/TokaBlockGenelator/img/icon_512.png',
    '/TokaBlockGenelator/img/icon_2000.png',
    '/TokaBlockGenelator/img/icon_apple-touch-icon.png',
    '/TokaBlockGenelator/img/twitter.svg',
    '/TokaBlockGenelator/js/main.js',
    '/TokaBlockGenelator/lib/jquery-3.5.1.min.js'
];
var oldCacheKeys = [
    'pwa-caches'
];

// インストール処理
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(async function(cache) {
            skipWaiting();
            cache.addAll(urlsToCache);
        })
    );
});

// アクティブ時
self.addEventListener("activate", function (event) {
    event.waitUntil(
      (function () {
        caches.keys().then(function (oldCacheKeys) {
          oldCacheKeys
            .filter(function (key) {
                return key !== CACHE_NAME;
            })
            .map(function (key) {
                return caches.delete(key);
            });
        });
        clients.claim();
      })()
    );
});

// リソースフェッチ時のキャッシュロード処理
self.addEventListener("fetch", function (event) {
    event.respondWith(
        caches.match(event.request).then(function (response) {
            if (response) return response;
            var fetchRequest = event.request.clone();
            return fetch(fetchRequest).then(function (response) {
                if (!response || response.status !== 200 || response.type !== "basic") {
                    return response;
                }
                var responseToCache = response.clone();
                caches.open(CACHE_NAME).then(function (cache) {
                    cache.put(event.request, responseToCache);
                });
                return response;
            });
        })
    );
});