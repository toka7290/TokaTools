var CACHE_NAME = 'toka-20200903';
var urlsToCache = [
    '/TokaItemGenelator/',
    '/TokaItemGenelator/index.html',
    '/TokaItemGenelator/css/style.css',
    '/TokaItemGenelator/css/phone.css',
    '/TokaItemGenelator/css/color.css',
    '/TokaItemGenelator/css/prism.css',
    '/TokaItemGenelator/img/chevron-up.svg',
    '/TokaItemGenelator/img/close.svg',
    '/TokaItemGenelator/img/error.svg',
    '/TokaItemGenelator/img/github.svg',
    '/TokaItemGenelator/img/help.svg',
    '/TokaItemGenelator/img/homepage.svg',
    '/TokaItemGenelator/img/icon.webp',
    '/TokaItemGenelator/img/icon_256.png',
    '/TokaItemGenelator/img/icon_512.png',
    '/TokaItemGenelator/img/icon_2000.png',
    '/TokaItemGenelator/img/icon_apple-touch-icon.png',
    '/TokaItemGenelator/img/import.svg',
    '/TokaItemGenelator/img/more.svg',
    "/TokaItemGenelator/img/share.svg",
    '/TokaItemGenelator/img/twitter.svg',
    '/TokaItemGenelator/img/warning.svg',
    '/TokaItemGenelator/js/main.js',
    '/TokaItemGenelator/json/webapp.webmanifest',
    '/TokaItemGenelator/lib/prism.js',
    '/TokaItemGenelator/lib/jquery-3.5.1.min.js'
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