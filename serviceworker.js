var CACHE_NAME = 'pwa-caches';
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
    '/TokaBlockGenelator/img/twitter.svg',
    '/TokaBlockGenelator/img/warning.svg',
    '/TokaBlockGenelator/js/main.js',
    '/TokaBlockGenelator/json/webapp.webmanifest',
    '/TokaBlockGenelator/lib/prism.js',
    '/TokaBlockGenelator/lib/jquery-3.5.1.min.js'
];

// インストール処理
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then(function(cache) {
                return cache.addAll(urlsToCache);
            })
    );
});

// リソースフェッチ時のキャッシュロード処理
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches
            .match(event.request)
            .then(function(response) {
                return response ? response : fetch(event.request);
            })
    );
});