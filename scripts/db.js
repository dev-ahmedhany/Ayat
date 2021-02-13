//indexedDB
if (window.location.protocol == "https:") {
    (async () => {
        'use strict'

        if (!('indexedDB' in window)) {
            // In the following line, you should include the prefixes of implementations you want to test.
            window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
            // DON'T use "var indexedDB = ..." if you're not in a function.
            // Moreover, you may need references to some window.IDB* objects:
            window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction || { READ_WRITE: "readwrite" }; // This line should only be needed if it is needed to support the object's constants for older browsers
            window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
            // (Mozilla has never prefixed these objects, so we don't need window.mozIDB*)
            if (!window.indexedDB) {
                console.warn('IndexedDB not supported')
                return;
            }
        }

        //...IndexedDB code
        const dbName = 'ayat'
        const storeName = 'pages'
        const version = 1 //versions start at 1

        const request = indexedDB.open(dbName, version);

        // This event is only implemented in recent browsers
        request.onupgradeneeded = function (event) {
            // Save the IDBDatabase interface
            const db = event.target.result;

            // Create an objectStore for this database
            const objectStore = db.createObjectStore(storeName);
        };

        request.onsuccess = function (event) {
            const db = event.target.result;

            //lazy load
            let lazyloadandsave = async (event) => {
                event.relatedTarget.querySelectorAll('div > img').forEach(async (element) => {
                    if (element.dataset.src) {

                        const key = element.dataset.src;

                        const request = db.transaction(storeName).objectStore(storeName).get(key);
                        request.onerror = function (error) {
                            // Handle errors!
                            console.error(error);
                            document.getElementById('myCarousel').removeEventListener('slide.bs.carousel', lazyloadandsave);
                            document.getElementById('myCarousel').addEventListener('slide.bs.carousel', lazyload);
                            lazyload(event);
                        };
                        request.onsuccess = function (event) {
                            // Do something with the request.result!
                            if (request.result) {
                                element.setAttribute('src', URL.createObjectURL(request.result));

                            }
                            else {
                                // Create XHR
                                let xhr = new XMLHttpRequest(), blob;

                                xhr.open("GET", key, true);
                                // Set the responseType to blob
                                xhr.responseType = "blob";

                                xhr.addEventListener("load", async () => {
                                    if (xhr.status === 200) {

                                        // File as response
                                        blob = xhr.response;
                                        element.setAttribute('src', URL.createObjectURL(blob));

                                        // Put the received blob into IndexedDB
                                        const tx = db.transaction(storeName, 'readwrite')
                                        const store = await tx.objectStore(storeName)

                                        const value = await store.put(blob, key)
                                        await tx.done;
                                    }
                                }, false);
                                // Send XHR
                                xhr.send();
                            }
                            element.removeAttribute('data-src');
                        };
                    }
                });
            }
            document.getElementById('myCarousel').removeEventListener('slide.bs.carousel', lazyload);
            document.getElementById('myCarousel').addEventListener('slide.bs.carousel', lazyloadandsave);
        };
    })();

}
