var CACHE_NAME = "TokaBlockGenerator-20201119";
var urlsToCache = [
  "/TokaTools/TokaBlockGenerator/",
  "/TokaTools/TokaBlockGenerator/index.html",
  "/TokaTools/TokaBlockGenerator/css/style.css",
  "/TokaTools/TokaBlockGenerator/css/phone.css",
  "/TokaTools/TokaBlockGenerator/css/color.css",
  "/TokaTools/TokaBlockGenerator/css/prism.css",
  "/TokaTools/TokaBlockGenerator/img/chevron-up.svg",
  "/TokaTools/TokaBlockGenerator/img/close.svg",
  "/TokaTools/TokaBlockGenerator/img/error.svg",
  "/TokaTools/TokaBlockGenerator/img/github.svg",
  "/TokaTools/TokaBlockGenerator/img/help.svg",
  "/TokaTools/TokaBlockGenerator/img/homepage.svg",
  "/TokaTools/TokaBlockGenerator/img/icon.webp",
  "/TokaTools/TokaBlockGenerator/img/icon_256.png",
  "/TokaTools/TokaBlockGenerator/img/icon_512.png",
  "/TokaTools/TokaBlockGenerator/img/icon_2000.png",
  "/TokaTools/TokaBlockGenerator/img/icon_apple-touch-icon.png",
  "/TokaTools/TokaBlockGenerator/img/import.svg",
  "/TokaTools/TokaBlockGenerator/img/more.svg",
  "/TokaTools/TokaBlockGenerator/img/share.svg",
  "/TokaTools/TokaBlockGenerator/img/twitter.svg",
  "/TokaTools/TokaBlockGenerator/img/warning.svg",
  "/TokaTools/TokaBlockGenerator/js/main.js",
  "/TokaTools/TokaBlockGenerator/json/webapp.webmanifest",
  "/TokaTools/TokaBlockGenerator/lib/prism.js",
  "/TokaTools/TokaBlockGenerator/lib/jquery-3.6.0.min.js",
];
var oldCacheKeys = ["TokaBlockGenerator-20200904", "pwa-caches"];

// インストール処理
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async function (cache) {
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
    caches
      .match(event.request)
      .then(function (resp) {
        // respレスポンスで見つかったキャッシュもしくはリクエスト
        return (
          resp ||
          fetch(event.request).then(function (response) {
            let responseClone = response.clone();
            caches.open(CACHE_NAME).then(function (cache) {
              cache.put(event.request, responseClone);
            });
            return response;
          })
        );
      })
      .catch(function () {
        console.error("Fetch failed:", error);
        throw error;
      })
  );
});
