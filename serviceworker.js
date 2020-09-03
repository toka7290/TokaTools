var CACHE_NAME = 'TokaToolBox-20200904';
var urlsToCache = [
    '/TokaToolBox/',
    '/TokaToolBox/index.html',
    '/TokaToolBox/css/style.css',
    '/TokaToolBox/css/phone.css',
    '/TokaToolBox/icons/BlockGenerator.png',
    '/TokaToolBox/icons/error.png',
    '/TokaToolBox/icons/ItemGenerator.png',
    '/TokaToolBox/icons/ManifestGenelator.png',
    '/TokaToolBox/img/github.svg',
    '/TokaToolBox/img/home.svg',
    '/TokaToolBox/img/icon.svg',
    '/TokaToolBox/img/icon.webp',
    '/TokaToolBox/img/icon_256.png',
    '/TokaToolBox/img/icon_512.png',
    '/TokaToolBox/img/icon_2000.png',
    '/TokaToolBox/img/icon_apple-touch-icon.png',
    '/TokaToolBox/img/twitter.svg',
    '/TokaToolBox/js/main.js',
    '/TokaToolBox/lib/jquery-3.5.1.min.js'
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