const CACHE_NAME = "Eco Hub-v4";
const ASSETS = [
  "/",
  "/index.html",
  "/about.html",
  "/konten.html",
  "/kegiatan.html",
  "/artikel.html",
  "/css/main.css",
  "/css/components.css",
  "/css/pages/home.css",
  "/css/pages/about.css",
  "/css/pages/mobility.css",
  "/css/pages/kegiatan.css",
  "/css/pages/konten.css",
  "/js/main.js",
  "/js/aqi.js",
  "/js/carbon.js",
  "/js/konten.js",
  "/js/mobility.js",
  "/js/kegiatan.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)),
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => response || fetch(event.request)),
  );
});

