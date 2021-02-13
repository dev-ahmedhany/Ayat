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



carousel.to(index);
console.log("index : ", index);
window.history.replaceState(index, "Page : " + page, "#" + page);

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
    if (e.which == 39) {
        carousel.next();
    }
    else if (e.which == 37) {
        carousel.prev();
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