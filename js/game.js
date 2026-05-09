const mainImg = document.querySelector('.main-image');
        const thumbs = document.querySelectorAll('.block-with-small-images img');
        const dots = document.querySelectorAll('.dot');
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');

        let currentIndex = 0;

        function updateSlider(index) {
            currentIndex = index;
            mainImg.style.opacity = '0.4';
            setTimeout(() => {
                mainImg.src = thumbs[currentIndex].src;
                mainImg.style.opacity = '1';
            }, 150);

            thumbs.forEach(img => img.classList.remove('active-thumb'));
            thumbs[currentIndex].classList.add('active-thumb');

            dots.forEach(dot => dot.classList.remove('active'));
            dots[currentIndex].classList.add('active');
        }

        thumbs.forEach((thumb, i) => {
            thumb.addEventListener('click', () => updateSlider(i));
        });

        dots.forEach((dot, i) => {
            dot.addEventListener('click', () => updateSlider(i));
        });

        prevBtn.addEventListener('click', () => {
            let i = (currentIndex - 1 + thumbs.length) % thumbs.length;
            updateSlider(i);
        });

        nextBtn.addEventListener('click', () => {
            let i = (currentIndex + 1) % thumbs.length;
            updateSlider(i);
        });