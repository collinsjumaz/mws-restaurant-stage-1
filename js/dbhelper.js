/**
 * Common database helper functions.
 */
const port = 1337;
class DBHelper {
    static get DATABASE_URL() {
        // const port = 1337; // Change this to your server port
        return `http://localhost:${port}/restaurants`;
    }
    static get REVIEWS_URL() {
        return `http://localhost:${port}/reviews`;
    }
    static openDatabase() {
        if (!window.navigator.serviceWorker) {
            console.error(
                "This browser does not support Service Worker/IDB, please upgrade to the latest version of any major browser to enjoy offline mode"
            );
            return Promise.resolve();
        }

        let indexDb = idb.open("restReviewDbase", 1, upgradeDb => {
            const restaurantStore = upgradeDb.createObjectStore(
                "restaurantDBase",
                {
                    keypath: "id"
                }
            );
            const reviewStore = upgradeDb.createObjectStore("reviewsDBase", {
                keypath: "id"
            });
            restaurantStore.createIndex("by-id", "id");
            reviewStore.createIndex("by-id", "id");
        });
        return indexDb;
    }
    static getRestaurantFromServer() {
        return fetch(DBHelper.DATABASE_URL)
            .then(response => {
                return response.json();
            })
            .then(restaurants => {
                DBHelper.saveRestaurantDataToIdb(restaurants);
                return restaurants;
            });
    }

    static fetchRestaurantReviews() {
        return fetch(DBHelper.REVIEWS_URL)
            .then(response => {
                return response.json();
            })
            .then(reviews => {
                DBHelper.saveReviewsToIdb(reviews);
                return reviews;
            });
    };

    static saveRestaurantDataToIdb(restautantsData) {
        return DBHelper.openDatabase().then(database => {
            if (!database) return;
            const tx = database.transaction("restaurantDBase", "readwrite");
            const store = tx.objectStore("restaurantDBase");
            restautantsData.forEach(restaurant => {
                store.put(restaurant, restaurant.id);
            });
            return tx.complete;
        });
    }

    static saveReviewsToIdb(reviews) {
        return DBHelper.openDatabase().then(database => {
            if (!database) return;
            const tx = database.transaction("reviewsDBase", "readwrite");
            const store = tx.objectStore("reviewsDBase");
            reviews.forEach(review => {
                store.put(review, review.id);
            });
            return tx.complete;
        });
    }

    static fetchStoredRestaurants() {
        return DBHelper.openDatabase().then(database => {
            if (!database) return;
            let store = database
                .transaction("restaurantDBase")
                .objectStore("restaurantDBase");

            return store.getAll();
        });
    }

    /**
     * Fetch all restaurants.
     */
    static fetchRestaurants(callback) {
        return DBHelper.fetchStoredRestaurants()
            .then(restaurants => {
                if (!restaurants.length) {
                    return DBHelper.getRestaurantFromServer();
                }
                return Promise.resolve(restaurants);
            })
            .then(restaurants => {
                callback(null, restaurants);
            })
            .catch(err => {
                callback(err, null);
            });
    }

    /**
     * Fetch a restaurant by its ID.
     */
    static fetchRestaurantById(id, callback) {
        // fetch all restaurants with proper error handling.
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                const restaurant = restaurants.find(r => r.id == id);
                if (restaurant) {
                    // Got the restaurant
                    callback(null, restaurant);
                } else {
                    // Restaurant does not exist in the database
                    callback("Restaurant does not exist", null);
                }
            }
        });
    }

    /**
     * Fetch restaurants by a cuisine type with proper error handling.
     */
    static fetchRestaurantByCuisine(cuisine, callback) {
        // Fetch all restaurants  with proper error handling
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Filter restaurants to have only given cuisine type
                const results = restaurants.filter(
                    r => r.cuisine_type == cuisine
                );
                callback(null, results);
            }
        });
    }

    /**
     * Fetch restaurants by a neighborhood with proper error handling.
     */
    static fetchRestaurantByNeighborhood(neighborhood, callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Filter restaurants to have only given neighborhood
                const results = restaurants.filter(
                    r => r.neighborhood == neighborhood
                );
                callback(null, results);
            }
        });
    }

    /**
     * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
     */
    static fetchRestaurantByCuisineAndNeighborhood(
        cuisine,
        neighborhood,
        callback
    ) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                let results = restaurants;
                if (cuisine != "all") {
                    // filter by cuisine
                    results = results.filter(r => r.cuisine_type == cuisine);
                }
                if (neighborhood != "all") {
                    // filter by neighborhood
                    results = results.filter(
                        r => r.neighborhood == neighborhood
                    );
                }
                callback(null, results);
            }
        });
    }

    /**
     * Fetch all neighborhoods with proper error handling.
     */
    static fetchNeighborhoods(callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Get all neighborhoods from all restaurants
                const neighborhoods = restaurants.map(
                    (v, i) => restaurants[i].neighborhood
                );
                // Remove duplicates from neighborhoods
                const uniqueNeighborhoods = neighborhoods.filter(
                    (v, i) => neighborhoods.indexOf(v) == i
                );
                callback(null, uniqueNeighborhoods);
            }
        });
    }

    /**
     * Fetch all cuisines with proper error handling.
     */
    static fetchCuisines(callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Get all cuisines from all restaurants
                const cuisines = restaurants.map(
                    (v, i) => restaurants[i].cuisine_type
                );
                // Remove duplicates from cuisines
                const uniqueCuisines = cuisines.filter(
                    (v, i) => cuisines.indexOf(v) == i
                );
                callback(null, uniqueCuisines);
            }
        });
    }

    /**
     * Restaurant page URL.
     */
    static urlForRestaurant(restaurant) {
        return `./restaurant.html?id=${restaurant.id}`;
    }

    /**
     * Restaurant image URL.
     */
    static imageUrlForRestaurant(restaurant) {
        return `/img/${restaurant.photograph || restaurant.id}.webp`;
    }

    /**
     * Map marker for a restaurant.
     */
    static mapMarkerForRestaurant(restaurant, map) {
        // https://leafletjs.com/reference-1.3.0.html#marker
        const marker = new L.marker(
            [restaurant.latlng.lat, restaurant.latlng.lng],
            {
                title: restaurant.name,
                alt: restaurant.name,
                url: DBHelper.urlForRestaurant(restaurant)
            }
        );
        marker.addTo(newMap);
        return marker;
    }

        /**
     * Fetch all reviews for a restaurant
     */
    static fetchRestaurantReviews(restaurant, callback) {
        DBHelper.dbPromise.then(db => {
            if (!db) return;
            // 1. Check if there are reviews in the IDB
            const tx = db.transaction('reviewsDBase');
            const store = tx.objectStore('reviewsDBase');
            store.getAll().then(results => {
                if (results && results.length > 0) {
                    // Continue with reviews from IDB
                    callback(null, results);
                } else {
                    // 2. If there are no reviews in the IDB, fetch reviews from the network
                    fetch(`${DBHelper.DATABASE_URL}/reviews/?restaurant_id=${restaurant.id}`)
                    .then(response => {
                        return response.json();
                    })
                    .then(reviews => {
                        this.dbPromise.then(db => {
                            if (!db) return;
                            // 3. Put fetched reviews into IDB
                            const tx = db.transaction('reviewsDBase', 'readwrite');
                            const store = tx.objectStore('reviewsDBase');
                            reviews.forEach(review => {
                                store.put(review);
                            })
                        });
                        // Continue with reviews from network
                        callback(null, reviews);
                    })
                    .catch(error => {
                        // Unable to fetch reviews from network
                        callback(error, null);
                    })
                }
            })
        });
    }
    /* static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  } */
};
