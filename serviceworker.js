// 1. Versioning: Change this string every time you update your app!
const staticDevCoffee = "web-harmonium-v3";

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
      );
    })
  );
});

self.addEventListener("fetch", fetchEvent => {
  fetchEvent.respondWith(
    fetch(fetchEvent.request)
      .then(networkResponse => {
        const responseClone = networkResponse.clone();
        caches.open(staticDevCoffee).then(cache => {
          cache.put(fetchEvent.request, responseClone);
        });
        return networkResponse;
      })
      .catch(() => caches.match(fetchEvent.request))
  );
});
