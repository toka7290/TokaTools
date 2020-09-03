var CACHE_NAME = 'TokaTools-20200904';
var urlsToCache = [
    '/TokaTools/',
    '/TokaTools/index.html',
    '/TokaTools/css/style.css',
    '/TokaTools/css/phone.css',
    '/TokaTools/icons/BlockGenerator.png',
    '/TokaTools/icons/error.png',
    '/TokaTools/icons/ItemGenerator.png',
    '/TokaTools/icons/ManifestGenelator.png',
    '/TokaTools/img/github.svg',
    '/TokaTools/img/home.svg',
    '/TokaTools/img/icon.svg',
    '/TokaTools/img/icon.webp',
    '/TokaTools/img/icon_256.png',
    '/TokaTools/img/icon_512.png',
    '/TokaTools/img/icon_2000.png',
    '/TokaTools/img/icon_apple-touch-icon.png',
    '/TokaTools/img/twitter.svg',
    '/TokaTools/js/main.js',
    '/TokaTools/lib/jquery-3.5.1.min.js'
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