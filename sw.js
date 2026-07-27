// Динамическое имя кэша на основе даты последнего изменения файла или текущего дня
const CACHE_NAME = 'dose-calc-cache-v4'; // v3.0.12: имя обязательно меняется при каждом релизе,
// иначе activate-хук ниже не увидит "новую" версию и не пересоздаст кэш
const ASSETS = [
  './',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Установка: кэшируем только основные ресурсы
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting()) // Принудительная активация новой версии
  );
});

// Активация: очистка любого старого кэша, если имя CACHE_NAME когда-нибудь изменится
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    }).then(() => self.clients.claim()) // сразу берём под контроль уже открытые вкладки,
    // не дожидаясь перезагрузки страницы пользователем
  );
});

// Стратегия "Network First" (Сначала сеть, потом кэш)
// Это позволит при наличии интернета всегда скачивать свежий index.html 
// без изменения кода самого Service Worker.
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});