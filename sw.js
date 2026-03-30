const CACHE_NAME = "Eco-Hub-v3";
const ASSETS = [
  "/",
  "/index.html",
  "/about.html",
  "/konten.html",
  "/lapor.html",
  "/kontak.html",
  "/artikel.html",
  "/css/main.css",
  "/css/components.css",
  "/css/pages/home.css",
  "/css/pages/about.css",
  "/css/pages/mobility.css",
  "/css/pages/lapor.css",
  "/css/pages/kontak.css",
  "/css/pages/konten.css",
  "/css/gamification.css",
  "/js/main.js",
  "/js/aqi.js",
  "/js/carbon.js",
  "/js/konten.js",
  "/js/mobility.js",
  "/js/lapor.js",
  "/js/gamification.js",
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
