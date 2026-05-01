const games = [
      {
        img: 'img/cyber.jpg',
        title: 'Cyberpunk 2077',
        rating: 'Дуже позитивні (98 231 відгуків)',
        discount: '-90%',
        priceOld: '670грн',
        price: '67 грн'
      },
      {
        img: 'img/rdr2.jpg',
        title: 'Red Dead Redemption 2',
        rating: 'Overwhelmingly Positive (450,123 reviews)',
        discount: '-90%',
        priceOld: '670грн',
        price: '67 грн'
      },
      {
        img: 'img/elden.jpg',
        title: 'Elden Ring',
        rating: 'Overwhelmingly Positive (812,000 reviews)',
        discount: '-90%',
        priceOld: '670грн',
        price: '67 грн'
      },
      {
        img: 'img/baldur.jpg',
        title: "Baldur's Gate 3",
        rating: 'Overwhelmingly Positive (300,500 reviews)',
        discount: null,
        priceOld: null,
        price: '670грн'
      },
      {
        img: 'img/gtav.jpg',
        title: 'GTA V',
        rating: 'Very Positive (1,200,000 reviews)',
        discount: '-90%',
        priceOld: '670грн',
        price: '67 грн'
      }
    ];

    let current = 0;
    let autoTimer = null;

    const heroImg = document.getElementById('hero-img');
    const heroTitle = document.getElementById('hero-title');
    const heroRating = document.getElementById('hero-rating');
    const heroDiscount = document.getElementById('hero-discount');
    const heroPriceOld = document.getElementById('hero-price-old');
    const heroPrice = document.getElementById('hero-price');
    const dots = document.querySelectorAll('.dot');
    const gameRows = document.querySelectorAll('.game-row');

    function goTo(index) {
      current = (index + games.length) % games.length;
      const g = games[current];

      // Update hero
      heroImg.style.opacity = '0';
      setTimeout(() => {
        heroImg.src = g.img;
        heroImg.alt = g.title;
        heroImg.style.opacity = '1';
      }, 150);

      heroTitle.textContent = g.title;
      heroRating.textContent = g.rating;

      if (g.discount) {
        heroDiscount.textContent = g.discount;
        heroDiscount.style.display = '';
        heroPriceOld.textContent = g.priceOld;
        heroPriceOld.style.display = '';
        heroPrice.classList.remove('no-disc');
      } else {
        heroDiscount.style.display = 'none';
        heroPriceOld.style.display = 'none';
        heroPrice.classList.add('no-disc');
      }
      heroPrice.textContent = g.price;

      // Update dots
      dots.forEach((d, i) => d.classList.toggle('active', i === current));

      // Update game rows
      gameRows.forEach((r, i) => r.classList.toggle('active', i === current));
    }

    function startAuto() {
      stopAuto();
      autoTimer = setInterval(() => goTo(current + 1), 5000);
    }

    function stopAuto() {
      if (autoTimer) clearInterval(autoTimer);
    }

    document.querySelector('.nav-prev').addEventListener('click', () => {
      goTo(current - 1);
      startAuto();
    });

    document.querySelector('.nav-next').addEventListener('click', () => {
      goTo(current + 1);
      startAuto();
    });

    dots.forEach(d => {
      d.addEventListener('click', () => {
        goTo(parseInt(d.dataset.index));
        startAuto();
      });
    });

    gameRows.forEach(r => {
      r.addEventListener('click', () => {
        goTo(parseInt(r.dataset.index));
        startAuto();
      });
    });

    // Init hero price for first slide
    goTo(0);
    startAuto();