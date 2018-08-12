const CacheName = 'restaurant';

//  assets to cache on install
// cache each restaurant detail page as well
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CacheName)
      .then(cache => {
        return cache.addAll([
          '/index.html',
          // '/restaurant.html',
          '/css/styles.css',
          '/js/dbhelper.js',
          '/js/register_sw.js',
          '/js/main.js',
          '/js/restaurant_info.js',
          // '/data/restaurants.json',
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

// Call Activate Event
self.addEventListener('activate', event=> {
  console.log('Service Worker: Activated');
  // Remove unwanted caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== cacheName) {
            console.log('Service Worker: Clearing Old Cache');
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Call Fetch Event
self.addEventListener('fetch', event => {
  console.log('Service Worker: Fetching');
  event.respondWith(
    fetch(event.request)
      .then(res => {
        // Make copy/clone of response
        const resClone = res.clone();
        // Open cahce
        caches.open(cacheName).then(cache => {
          // Add response to cache
          cache.put(event.request, resClone);
        });
        return res;
      })
      .catch(err => caches.match(event.request).then(res => res))
  );
});
