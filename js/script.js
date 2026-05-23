const games = [
      {
        img: 'img/cyber.jpg',
        title: 'Cyberpunk 2077',
        rating: 'Very Positive (98,231 reviews)',
        discount: '-36%',
        priceOld: '$89.99',
        price: '$49.99'
      },
      {
        img: 'img/rdr2.jpg',
        title: 'Red Dead Redemption 2',
        rating: 'Overwhelmingly Positive (450,123 reviews)',
        discount: null,
        priceOld: null,
        price: '$59.99'
      },
      {
        img: 'img/elden.jpg',
        title: 'Elden Ring',
        rating: 'Overwhelmingly Positive (812,000 reviews)',
        discount: '-33%',
        priceOld: '$89.99',
        price: '$59.99'
      },
      {
        img: 'img/baldur.jpg',
        title: "Baldur's Gate 3",
        rating: 'Overwhelmingly Positive (300,500 reviews)',
        discount: null,
        priceOld: null,
        price: '$59.99'
      },
      {
        img: 'img/gtav.jpg',
        title: 'GTA V',
        rating: 'Very Positive (1,200,000 reviews)',
        discount: '-50%',
        priceOld: '$89.99',
        price: '$29.99'
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

    dots.forEach((d, i) => {
      d.addEventListener('click', () => {
        goTo(i);
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

    // --- "Топ продажів" Dynamic Loader ---
    document.addEventListener('DOMContentLoaded', () => {
      const bestSellContainer = document.querySelector('.best-sell .games_rows');
      if (!bestSellContainer) return;

      const genreTranslations = {
        "Action": "Екшн",
        "Free To Play": "Безкоштовно",
        "Strategy": "Стратегія",
        "Adventure": "Пригоди",
        "Massively Multiplayer": "Мультиплеєр",
        "Indie": "Інді",
        "Casual": "Казуальна гра",
        "Simulation": "Симулятор",
        "RPG": "Рольова гра (RPG)",
        "Sports": "Спорт",
        "Racing": "Перегони",
        "Early Access": "Дочасний доступ",
        "Utilities": "Інструменти",
        "Animation & Modeling": "Анімація та моделювання",
        "Design & Illustration": "Дизайн та ілюстрація",
        "Photo Editing": "Редагування фотографій",
        "Software Training": "Навчальне ПЗ"
      };

      const reviewsOptions = [
        { text: "Надзвичайно позитивні", class: "r-blue" },
        { text: "Дуже позитивні", class: "r-green" },
        { text: "Переважно позитивні", class: "r-yellow" }
      ];

      function translateGenres(genres) {
        if (!genres || !genres.length) return "Гра";
        if (genres.length > 5) {
          return genres.slice(0, 5).map(g => genreTranslations[g] || g).join(", ") + "..";
        }
        return genres.map(g => genreTranslations[g] || g).join(", ");
      }

      async function loadBestSellers() {
        try {
          let response;
          try {
            response = await fetch('backend/games/popular-games.json');
          } catch (e) {
            response = await fetch('./backend/games/popular-games.json');
          }

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const gamesData = await response.json();
          if (!gamesData || gamesData.length === 0) {
            throw new Error('No games found');
          }

          // Take the first 7 games
          const top7Games = gamesData.slice(0, 7);

          // Clear the static placeholder
          bestSellContainer.innerHTML = '';

          top7Games.forEach(game => {
            const randomReview = reviewsOptions[Math.floor(Math.random() * reviewsOptions.length)];
            const gameRow = document.createElement('div');
            gameRow.className = 'games_row';
            gameRow.style.opacity = '0';
            gameRow.style.transition = 'opacity 0.3s ease-in-out';

            gameRow.innerHTML = `
              <img src="${game.image || 'img/cs2 2.png'}" alt="${game.name}" class="games_row-img" onerror="this.src='img/cs2 2.png'">
              <div class="games_texts">
                <p class="games_row-title">${game.name}</p>
                <p class="games_types">${translateGenres(game.genres)}</p>
                <p class="games_reviews ${randomReview.class}">${randomReview.text}</p>
              </div>
              <div class="games_price">
                <div class="games_discount">
                  <p>-90%</p>
                </div>
                <p class="games_old-price">670 грн</p>
                <p class="games_new-price">67 грн</p>
              </div>
            `;

            bestSellContainer.appendChild(gameRow);

            setTimeout(() => {
              gameRow.style.opacity = '1';
            }, 50);
          });

        } catch (error) {
          console.error('Failed to load best sellers:', error);
        }
      }

      loadBestSellers();
    });