const STATIC_CACHE_NAME = "static-cache-v1.2";
const INMUTABLE_CACHE_NAME = "inmutable-cache-v1.2";
const DYNAMIC_CACHE_NAME = "dynamic-cache-v1.2";

self.addEventListener("install", function (event) {
  console.log("SW Registrado");

  const respCache = caches.open(STATIC_CACHE_NAME).then((cache) => {
    return cache.addAll([
      "/",
      "/index.html",
      "/css/style.css",
      "/js/app.js",
      "/perros.html",
      "/images/perro1.jpg",
    ]);
  });

  const respCacheInmutable = caches.open(INMUTABLE_CACHE_NAME).then((cache) => {
    return cache.addAll([
      "https://reqres.in/api/users",
      "https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css",
      "https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.min.js",
      "https://unpkg.com/sweetalert/dist/sweetalert.min.js",
    ]);
  });

  event.waitUntil(Promise.all[(respCache, respCacheInmutable)]);
});

self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener("activate", function (event) {
  console.log("this event triggers when the service worker activates");
});

const cleanCache = (cacheName, maxSize) => {
  caches.open(cacheName).then(async (cache) => {
    const items = await cache.keys();
    console.log(items.length);
    if (items.length >= maxSize) {
      cache.delete(items[0]).then(() => {
        cleanCache(cacheName, maxSize);
      });
    }
  });
};

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cacheResponse) => {
      if (cacheResponse) {
        fetch(event.request).then((networkResponse) => {
          return caches.open(currentCache).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
        return cacheResponse;
      } else {
        return fetch(event.request).then((networkResponse) => {
          return caches.open(currentCache).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      }
    })
  );
});
