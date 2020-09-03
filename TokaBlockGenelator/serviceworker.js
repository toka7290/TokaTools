var CACHE_NAME = 'TokaBlockGenelator-20200904';
var urlsToCache = [
    '/TokaTools/TokaBlockGenelator/',
    '/TokaTools/TokaBlockGenelator/index.html',
    '/TokaTools/TokaBlockGenelator/css/style.css',
    '/TokaTools/TokaBlockGenelator/css/phone.css',
    '/TokaTools/TokaBlockGenelator/css/color.css',
    '/TokaTools/TokaBlockGenelator/css/prism.css',
    '/TokaTools/TokaBlockGenelator/img/chevron-up.svg',
    '/TokaTools/TokaBlockGenelator/img/close.svg',
    '/TokaTools/TokaBlockGenelator/img/error.svg',
    '/TokaTools/TokaBlockGenelator/img/github.svg',
    '/TokaTools/TokaBlockGenelator/img/help.svg',
    '/TokaTools/TokaBlockGenelator/img/homepage.svg',
    '/TokaTools/TokaBlockGenelator/img/icon.webp',
    '/TokaTools/TokaBlockGenelator/img/icon_256.png',
    '/TokaTools/TokaBlockGenelator/img/icon_512.png',
    '/TokaTools/TokaBlockGenelator/img/icon_2000.png',
    '/TokaTools/TokaBlockGenelator/img/icon_apple-touch-icon.png',
    '/TokaTools/TokaBlockGenelator/img/import.svg',
    '/TokaTools/TokaBlockGenelator/img/more.svg',
    '/TokaTools/TokaBlockGenelator/img/share.svg',
    '/TokaTools/TokaBlockGenelator/img/twitter.svg',
    '/TokaTools/TokaBlockGenelator/img/warning.svg',
    '/TokaTools/TokaBlockGenelator/js/main.js',
    '/TokaTools/TokaBlockGenelator/json/webapp.webmanifest',
    '/TokaTools/TokaBlockGenelator/lib/prism.js',
    '/TokaTools/TokaBlockGenelator/lib/jquery-3.5.1.min.js'
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