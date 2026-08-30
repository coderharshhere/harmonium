// 1. Versioning: Change this string every time you update your app!
const staticDevCoffee = "web-harmonium-v6";

const assets = [
  "/",
  "/webharmonium.html",
  "/harmonium-kannan-orig.wav"
];

self.addEventListener("install", installEvent => {
  // 2. Immediate Takeover: Forces this new worker to become active right away
  self.skipWaiting();

  installEvent.waitUntil(
    caches.open(staticDevCoffee).then(cache => {
      return cache.addAll(assets);
    })
  );
});

// Clean up old caches when the new version activates
self.addEventListener("activate", activateEvent => {
  activateEvent.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== staticDevCoffee)
            .map(key => caches.delete(key))
      ).then(() => self.clients.claim());
    })
  );
});

self.addEventListener("fetch", fetchEvent => {
  if (fetchEvent.request.method !== "GET") {
    return;
  }

  fetchEvent.respondWith(
    fetch(fetchEvent.request)
      .then(networkResponse => {
        if (!networkResponse.ok || networkResponse.type !== "basic") {
          return networkResponse;
        }
        const responseClone = networkResponse.clone();
        return caches.open(staticDevCoffee).then(cache => {
          return cache.put(fetchEvent.request, responseClone).then(() => networkResponse);
        });
      })
      .catch(() => caches.match(fetchEvent.request).then(cachedResponse => {
        return cachedResponse || Response.error();
      }))
  );
});
