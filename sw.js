const CacheName = 'version 1.0.0';

//  listing assets to cache on install
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CacheName)
      .then(cache => {
        return cache.addAll([
          '/index.html',
          'favicon.ico'
          // '/restaurant.html',
          '/css/styles.css',
          '/js/dbhelper.js',
          '/register.js',
          '/js/main.js',
          '/js/restaurant_info.js',
          '/restaurant.html?id=1',
          '/restaurant.html?id=2',
          '/restaurant.html?id=3',
          '/restaurant.html?id=4',
          '/restaurant.html?id=5',
          '/restaurant.html?id=6',
          '/restaurant.html?id=7',
          '/restaurant.html?id=8',
          '/restaurant.html?id=9',
          '/restaurant.html?id=10',
          '/img/off.png'
        ]).catch(error => {
          console.log('Caches open failed: ' + error);
        });
      })
  );
});

// Activating  Event
self.addEventListener('activate', event=> {
  console.log('Service Worker: Activated');
  // Remove unwanted caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CacheName) {
            console.log('Service Worker: Clearing Old Cache');
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

//  Fetching  Event
self.addEventListener('fetch', event => {
  console.log('Service Worker: Fetching');
  event.respondWith(
    fetch(event.request)
      .then(res => {
        // Make copy of response
        const resClone = res.clone();
        // Open cache
        caches.open(CacheName).then(cache => {
          // Add response to cache
          cache.put(event.request, resClone);
        });
        return res;
      })
      .catch(err => caches.match(event.request).then(res => res))
  );
});
