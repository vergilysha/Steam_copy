
document.addEventListener('DOMContentLoaded', function () {
    var mainImageElement;
    var thumbButtonElements;
    var dotElements;
    var prevButtonElement;
    var nextButtonElement;
    var slideImageSources;
    var currentIndex;

    mainImageElement = document.querySelector('.about-gallery__main-img');
    thumbButtonElements = document.querySelectorAll('.about-gallery__thumb');
    dotElements = document.querySelectorAll('.about-gallery__dot');
    prevButtonElement = document.querySelector('.about-gallery__nav--prev');
    nextButtonElement = document.querySelector('.about-gallery__nav--next');

    if (!mainImageElement) {
        return;
    }

    slideImageSources = [];
    currentIndex = 0;

    (function collectSourcesAndBindThumbs() {
        var i;
        for (i = 0; i < thumbButtonElements.length; i = i + 1) {
            var thumbButton;
            var imgElement;
            var imgSrc;

            thumbButton = thumbButtonElements[i];
            imgElement = thumbButton.querySelector('img');

            imgSrc = '';
            if (imgElement) {
                imgSrc = imgElement.getAttribute('src');
            }

            slideImageSources.push(imgSrc);

            (function bindThumbClick(index) {
                thumbButton.addEventListener('click', function () {
                    setActiveSlide(index);
                });
            })(i);
        }
    })();

    (function bindDots() {
        var j;
        for (j = 0; j < dotElements.length; j = j + 1) {
            (function bindDotClick(index) {
                var dot;
                dot = dotElements[index];
                dot.addEventListener('click', function () {
                    setActiveSlide(index);
                });
            })(j);
        }
    })();

    if (prevButtonElement) {
        prevButtonElement.addEventListener('click', function () {
            goPrevious();
        });
    }

    if (nextButtonElement) {
        nextButtonElement.addEventListener('click', function () {
            goNext();
        });
    }

    function setActiveSlide(index) {
        var safeIndex;
        var newSource;

        safeIndex = index;

        if (slideImageSources.length === 0) {
            return;
        }

        if (safeIndex < 0) {
            safeIndex = slideImageSources.length - 1;
        }

        if (safeIndex >= slideImageSources.length) {
            safeIndex = 0;
        }

        newSource = slideImageSources[safeIndex];
        if (newSource && newSource.length > 0) {
            mainImageElement.setAttribute('src', newSource);
        }

        currentIndex = safeIndex;

        updateThumbActiveState();
        updateDotActiveState();
    }

    function updateThumbActiveState() {
        var i;
        for (i = 0; i < thumbButtonElements.length; i = i + 1) {
            var button;
            button = thumbButtonElements[i];

            if (i === currentIndex) {
                button.classList.add('is-active');
            } else {
                button.classList.remove('is-active');
            }
        }
    }

    function updateDotActiveState() {
        var i;
        for (i = 0; i < dotElements.length; i = i + 1) {
            var dot;
            dot = dotElements[i];

            if (i === currentIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        }
    }

    function goPrevious() {
        setActiveSlide(currentIndex - 1);
    }

    function goNext() {
        setActiveSlide(currentIndex + 1);
    }

    (function initIndexFromMarkup() {
        var i;
        for (i = 0; i < thumbButtonElements.length; i = i + 1) {
            if (thumbButtonElements[i].classList.contains('is-active')) {
                currentIndex = i;
                break;
            }
        }

        setActiveSlide(currentIndex);
    })();
});
