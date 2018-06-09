var CACHE_NAME = 'jdal-cache-v1';
var urls = [
  '/',
  '/index.css',
  '/index.js'
];

this.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urls);
      })
  );
});

this.addEventListener('fetch', function (event) {
    // it can be empty if you just want to get rid of that error
});