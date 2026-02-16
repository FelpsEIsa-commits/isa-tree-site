const CACHE_NAME = "felps-isa-v3";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./manifest.json",
  "./assets/nossa-foto.png",
  "./assets/fallback.svg",
  "./assets/chest-pain-i-love.mp3"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const asset of ASSETS){
        try{
          await cache.add(asset);
        }catch(e){
          // ignore failed precache asset
        }
      }
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((resp) => {
          // Avoid caching partial/range responses (common for audio/video streaming).
          if (resp.ok && resp.status === 200 && !event.request.headers.has("range")){
            const cloned = resp.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
          }
          return resp;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});
