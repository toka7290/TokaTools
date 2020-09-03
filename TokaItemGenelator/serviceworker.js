var CACHE_NAME = 'TokaItemGenelator-20200904';
var urlsToCache = [
    '/TokaTools/TokaItemGenelator/',
    '/TokaTools/TokaItemGenelator/index.html',
    '/TokaTools/TokaItemGenelator/css/style.css',
    '/TokaTools/TokaItemGenelator/css/phone.css',
    '/TokaTools/TokaItemGenelator/css/color.css',
    '/TokaTools/TokaItemGenelator/css/prism.css',
    '/TokaTools/TokaItemGenelator/img/chevron-up.svg',
    '/TokaTools/TokaItemGenelator/img/close.svg',
    '/TokaTools/TokaItemGenelator/img/error.svg',
    '/TokaTools/TokaItemGenelator/img/github.svg',
    '/TokaTools/TokaItemGenelator/img/help.svg',
    '/TokaTools/TokaItemGenelator/img/homepage.svg',
    '/TokaTools/TokaItemGenelator/img/icon.webp',
    '/TokaTools/TokaItemGenelator/img/icon_256.png',
    '/TokaTools/TokaItemGenelator/img/icon_512.png',
    '/TokaTools/TokaItemGenelator/img/icon_2000.png',
    '/TokaTools/TokaItemGenelator/img/icon_apple-touch-icon.png',
    '/TokaTools/TokaItemGenelator/img/import.svg',
    '/TokaTools/TokaItemGenelator/img/more.svg',
    "/TokaTools/TokaItemGenelator/img/share.svg",
    '/TokaTools/TokaItemGenelator/img/twitter.svg',
    '/TokaTools/TokaItemGenelator/img/warning.svg',
    '/TokaTools/TokaItemGenelator/js/main.js',
    '/TokaTools/TokaItemGenelator/json/webapp.webmanifest',
    '/TokaTools/TokaItemGenelator/lib/prism.js',
    '/TokaTools/TokaItemGenelator/lib/jquery-3.5.1.min.js'
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