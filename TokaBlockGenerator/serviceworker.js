const CACHE_VERSION = "20210407";
const CACHE_NAME = `${registration.scope}!${CACHE_VERSION}`;

var urlsToCache = [
  ".",
  "css/style.min.css",
  "css/phone.min.css",
  "css/color.min.css",
  "css/prism.min.css",
  "img/close.svg",
  "img/error.svg",
  "img/github.svg",
  "img/help.svg",
  "img/homepage.svg",
  "img/icon.webp",
  "img/icon_256.png",
  "img/icon_512.png",
  "img/icon_2000.png",
  "img/icon_apple-touch-icon.png",
  "img/import.svg",
  "img/more.svg",
  "img/share.svg",
  "img/twitter.svg",
  "img/warning.svg",
  "js/main.min.js",
  "json/format.json",
  "json/webapp.webmanifest",
  "lib/prism.js",
  "lib/jquery-3.6.0.min.js",
];

// インストール処理
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // 指定されたファイルをキャッシュに追加する
      return cache.addAll(urlsToCache);
    })
  );
});

// アクティブ時
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return cacheNames.filter((cacheName) => {
          // このスコープに所属していて且つCACHE_NAMEではないキャッシュを探す
          return cacheName.startsWith(`${registration.scope}!`) && cacheName !== CACHE_NAME;
        });
      })
      .then((cachesToDelete) => {
        return Promise.all(
          cachesToDelete.map((cacheName) => {
            // いらないキャッシュを削除する
            return caches.delete(cacheName);
          })
        );
      })
  );
});

// リソースフェッチ時のキャッシュロード処理
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // キャッシュ内に該当レスポンスがあれば、それを返す
      if (response) {
        return response;
      }

      // 重要：リクエストを clone する。リクエストは Stream なので
      // 一度しか処理できない。ここではキャッシュ用、fetch 用と2回
      // 必要なので、リクエストは clone しないといけない
      let fetchRequest = event.request.clone();

      return fetch(fetchRequest).then((response) => {
        if (!response || response.status !== 200 || response.type !== "basic") {
          // キャッシュする必要のないタイプのレスポンスならそのまま返す
          return response;
        }

        // 重要：レスポンスを clone する。レスポンスは Stream で
        // ブラウザ用とキャッシュ用の2回必要。なので clone して
        // 2つの Stream があるようにする
        let responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
});
