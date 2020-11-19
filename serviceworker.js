var CACHE_NAME = 'TokaTools-20201119';
var urlsToCache = [
    '/TokaTools/',
    '/TokaTools/index.html',
    '/TokaTools/css/style.css',
    '/TokaTools/css/phone.css',
    '/TokaTools/icons/BlockGenerator.png',
    '/TokaTools/icons/error.png',
    '/TokaTools/icons/ItemGenerator.png',
    '/TokaTools/icons/ManifestGenerator.png',
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
    'TokaTools-20200917',
    'pwa-caches',
    'TokaTools-20200904'
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