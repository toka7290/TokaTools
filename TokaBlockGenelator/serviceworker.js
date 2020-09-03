var CACHE_NAME = 'toka-20200903';
var urlsToCache = [
    '/TokaBlockGenelator/',
    '/TokaBlockGenelator/index.html',
    '/TokaBlockGenelator/css/style.css',
    '/TokaBlockGenelator/css/phone.css',
    '/TokaBlockGenelator/css/color.css',
    '/TokaBlockGenelator/css/prism.css',
    '/TokaBlockGenelator/img/chevron-up.svg',
    '/TokaBlockGenelator/img/close.svg',
    '/TokaBlockGenelator/img/error.svg',
    '/TokaBlockGenelator/img/github.svg',
    '/TokaBlockGenelator/img/help.svg',
    '/TokaBlockGenelator/img/homepage.svg',
    '/TokaBlockGenelator/img/icon.webp',
    '/TokaBlockGenelator/img/icon_256.png',
    '/TokaBlockGenelator/img/icon_512.png',
    '/TokaBlockGenelator/img/icon_2000.png',
    '/TokaBlockGenelator/img/icon_apple-touch-icon.png',
    '/TokaBlockGenelator/img/import.svg',
    '/TokaBlockGenelator/img/more.svg',
    '/TokaBlockGenelator/img/share.svg',
    '/TokaBlockGenelator/img/twitter.svg',
    '/TokaBlockGenelator/img/warning.svg',
    '/TokaBlockGenelator/js/main.js',
    '/TokaBlockGenelator/json/webapp.webmanifest',
    '/TokaBlockGenelator/lib/prism.js',
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