// Service worker: hanya menyimpan "kerangka" aplikasi (halaman pembungkus + ikon).
// Data tabungan TIDAK disimpan offline; semua request ke Google Apps Script langsung ke jaringan.
const VERSI = 'tabungan-santri-v2';
const KERANGKA = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSI).then(function (c) { return c.addAll(KERANGKA); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== VERSI; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return; // Google Apps Script dll: langsung ke jaringan

  // Halaman: jaringan dulu (agar update cepat), cadangan dari cache saat offline
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).catch(function () { return caches.match('index.html'); }));
    return;
  }
  // Aset statis: cache dulu
  e.respondWith(caches.match(req).then(function (hit) { return hit || fetch(req); }));
});
