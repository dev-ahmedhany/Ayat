//building page
let inner = "";
let page = +window.location.hash.replace('#', '');
if (!(page > 0 && page <= 604))
    page = 1;
const newpage = page % 2 == 1 ? page + 1 : page;
const index = 302 - newpage / 2;

for (let i = 604; i > 0; i = i - 2) {
    const j = newpage == 604 ? -2 : 2;
    const classes = i == newpage + j ? " active" : "";
    inner += `
            <div class="carousel-item${classes}">
                <div class="d-flex flex-row-reverse justify-content-center ">
                    <img src="hafs/frame.jpg" class="img-page" data-src="hafs/${i}.png" alt="${i}">
                    <img src="hafs/frame.jpg" class="img-page" data-src="hafs/${i - 1}.png" alt="${i - 1}">
                </div>
            </div>`;
}
document.querySelector('.carousel-inner').innerHTML = inner;

const myCarousel = document.getElementById('myCarousel');
myCarousel.addEventListener('slide.bs.carousel', lazyload);
myCarousel.addEventListener('slide.bs.carousel', pageindex);
const carousel = new bootstrap.Carousel(myCarousel, { interval: 0 })

//lazy load
function lazyload(event) {
    event.relatedTarget.querySelectorAll('div > img').forEach(element => {
        if (element.dataset.src) {
            element.setAttribute('src', element.dataset.src);
            element.removeAttribute('data-src');
        }
    });
}

//pageindex
function pageindex(event) {
    let page = (302 - event.to) * 2;
    if (event.direction == 'right') {
        page--;
        if (+window.location.hash.replace('#', '') < page || page == 1) {
            window.history.pushState(event.to, "Page : " + page, "#" + page);
        }
    }
    else {
        if (+window.location.hash.replace('#', '') > page || page == 604) {
            window.history.pushState(event.to, "Page : " + page, "#" + page);
        }
    }
}
window.addEventListener("popstate", function (event) {
    if (event.state != null) {
        carousel.to(event.state);
    }
    else {
        let page = +window.location.hash.replace('#', '');
        if (page >= 0 && page <= 604) {
            if (page % 2 == 1)
                page++;
            const index = 302 - page / 2;
            carousel.to(index);
        }
    }
})
document.addEventListener('keyup', function (e) {
    //inverted
    if (e.key == "ArrowLeft") {
        carousel.prev();
    }
    else if (e.key == "ArrowRight") {
        carousel.next();
    }
});
//view size
document.getElementById("flexSwitchCheckDefault").addEventListener("change", () => {
    document.querySelectorAll('.img-page').forEach(element => {
        element.classList.toggle("img100vh");
    });

})

// middle click
document.querySelector('.carousel-inner').addEventListener('click', () => {
    //full screen on click
    let elem = document.documentElement;
    if (elem.requestFullScreen) {
        elem.requestFullScreen();
    } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullScreen) {
        elem.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
    } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
    }
    //show hide navBar
    document.getElementById('collapseNavBar').classList.toggle('show');
});



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

            //go to page
            carousel.to(index);
            window.history.replaceState(index, "Page : " + page, "#" + page);
        };
    })();

}
else {
    //go to page
    carousel.to(index);
    window.history.replaceState(index, "Page : " + page, "#" + page);
}