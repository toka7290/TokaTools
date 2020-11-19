var CACHE_NAME = 'TokaItemGenerator-20201119';
var urlsToCache = [
    '/TokaTools/TokaItemGenerator/',
    '/TokaTools/TokaItemGenerator/index.html',
    '/TokaTools/TokaItemGenerator/css/style.css',
    '/TokaTools/TokaItemGenerator/css/phone.css',
    '/TokaTools/TokaItemGenerator/css/color.css',
    '/TokaTools/TokaItemGenerator/css/prism.css',
    '/TokaTools/TokaItemGenerator/img/chevron-up.svg',
    '/TokaTools/TokaItemGenerator/img/close.svg',
    '/TokaTools/TokaItemGenerator/img/error.svg',
    '/TokaTools/TokaItemGenerator/img/github.svg',
    '/TokaTools/TokaItemGenerator/img/help.svg',
    '/TokaTools/TokaItemGenerator/img/homepage.svg',
    '/TokaTools/TokaItemGenerator/img/icon.webp',
    '/TokaTools/TokaItemGenerator/img/icon_256.png',
    '/TokaTools/TokaItemGenerator/img/icon_512.png',
    '/TokaTools/TokaItemGenerator/img/icon_2000.png',
    '/TokaTools/TokaItemGenerator/img/icon_apple-touch-icon.png',
    '/TokaTools/TokaItemGenerator/img/import.svg',
    '/TokaTools/TokaItemGenerator/img/more.svg',
    "/TokaTools/TokaItemGenerator/img/share.svg",
    '/TokaTools/TokaItemGenerator/img/twitter.svg',
    '/TokaTools/TokaItemGenerator/img/warning.svg',
    '/TokaTools/TokaItemGenerator/js/main.js',
    '/TokaTools/TokaItemGenerator/json/webapp.webmanifest',
    '/TokaTools/TokaItemGenerator/lib/prism.js',
    '/TokaTools/TokaItemGenerator/lib/jquery-3.5.1.min.js'
];
var oldCacheKeys = [
  'TokaItemGenerator-20200904',
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
        caches.keys().then(function (oldCaches) {
          oldCaches
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
    caches.match(event.request).then(function(resp) {
      // respレスポンスで見つかったキャッシュもしくはリクエスト
      return resp || fetch(event.request).then(function(response) {
          let responseClone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, responseClone);
          });
          return response;
      });
    }).catch(function() {
      console.error('Fetch failed:', error);
      throw error;
    })
  );
});