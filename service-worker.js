/* ==========================
   SERVICE WORKER
   Offline caching for Weather App
========================== */

const CACHE_NAME = "weather-app-v1";
const urlsToCache = [
  "index.html",
  "style.css",
  "script.js",
  "manifest.json",
  "icons/weather-icon.png",
  "icons/weather-icon-512.png"
];

// Install: cache core files
self.addEventListener("install", event => {
  console.log("Service Worker: Installing...");
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Activate: clean old caches
self.addEventListener("activate", event => {
  console.log("Service Worker: Activated");
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if(key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
});

// Fetch: serve cached files if offline
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
