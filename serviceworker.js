// 廃止対象
var CACHE_NAME = "TokaTools-202003##";
var urlsToCache = [
  "/TokaTools/",
  "/TokaTools/index.html",
  "/TokaTools/css/style.min.css",
  "/TokaTools/css/phone.min.css",
  "/TokaTools/icons/BlockGenerator.svg",
  "/TokaTools/icons/error.svg",
  "/TokaTools/icons/ItemGenerator.svg",
  "/TokaTools/icons/ManifestGenerator.svg",
  "/TokaTools/img/icon.svg",
  "/TokaTools/img/icon.webp",
  "/TokaTools/img/icon_2000.png",
  "/TokaTools/img/icon_apple-touch-icon.png",
  "/TokaTools/js/main.min.js",
  "/TokaTools/lib/jquery-3.5.1.min.js",
];
var oldCacheKeys = ["TokaTools-20201119", "TokaTools-20200917", "pwa-caches", "TokaTools-20200904"];

// インストール処理
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async function (cache) {
      return cache.addAll(urlsToCache);
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
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((response) => {
        return (
          response ||
          fetch(event.request).then((responseCache) => {
            if (event.request.method != "POST") cache.put(event.request, responseCache.clone());
            return responseCache;
          })
        );
      });
    })
  );
});
