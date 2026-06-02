document.addEventListener('DOMContentLoaded', () => {
  const gamesContainer = document.querySelector('.games_rows');
  const filterToggle = document.querySelector('.games_filter');
  const filterPanel = document.querySelector('.games-filter-panel');
  const searchInput = document.querySelector('#gamesSearchInput');
  const genreSelect = document.querySelector('#gamesGenreSelect');
  const resetButton = document.querySelector('#gamesFilterReset');
  if (!gamesContainer) return;
  wireStaticGameLinks();

  // Dictionary to translate common Steam genres into natural Ukrainian
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

  // Review options with their respective CSS classes
  const reviewsOptions = [
    { text: "Надзвичайно позитивні", class: "r-blue" },
    { text: "Дуже позитивні", class: "r-green" },
    { text: "Переважно позитивні", class: "r-yellow" }
  ];

  let allGames = [];

  function translateGenres(genres) {
    if (!genres || !genres.length) return "Гра";
    if (genres.length > 5) {
      return genres.slice(0, 5).map(g => genreTranslations[g] || g).join(", ") + "..";
    }
    return genres.map(g => genreTranslations[g] || g).join(", ");
  }

  function getReviewForGame(game) {
    const index = game.id % reviewsOptions.length;
    return reviewsOptions[index];
  }

  function renderGames(games) {
    gamesContainer.innerHTML = '';

    if (!games.length) {
      gamesContainer.innerHTML = `
        <div class="games-filter-panel__empty">
          <p>За вашим фільтром ігор не знайдено.</p>
          <p>Спробуйте іншу назву або жанр.</p>
        </div>
      `;
      return;
    }

    games.forEach(game => {
      const review = getReviewForGame(game);
      const gameRow = document.createElement('div');
      gameRow.className = 'games_row';
      gameRow.setAttribute('role', 'link');
      gameRow.tabIndex = 0;
      gameRow.style.opacity = '0';
      gameRow.style.transition = 'opacity 0.3s ease-in-out';

      gameRow.innerHTML = `
        <img src="${game.image || 'img/cs2 2.png'}" alt="${game.name}" class="games_row-img" onerror="this.src='img/cs2 2.png'">
        <div class="games_texts">
          <p class="games_row-title">${game.name}</p>
          <p class="games_types">${translateGenres(game.genres)}</p>
          <p class="games_reviews ${review.class}">${review.text}</p>
        </div>
        <div class="games_price">
          <div class="games_discount">
            <p>-90%</p>
          </div>
          <p class="games_old-price">670 грн</p>
          <p class="games_new-price">67 грн</p>
        </div>
      `;

      gamesContainer.appendChild(gameRow);
      gameRow.addEventListener('click', () => {
        window.location.href = getGamePageUrl(game.name);
      });
      gameRow.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          window.location.href = getGamePageUrl(game.name);
        }
      });

      setTimeout(() => {
        gameRow.style.opacity = '1';
      }, 50);
    });
  }

  function populateGenres(games) {
    if (!genreSelect) return;

    const uniqueGenres = [...new Set(
      games.flatMap(game => game.genres || [])
    )].sort((a, b) => (genreTranslations[a] || a).localeCompare(genreTranslations[b] || b, 'uk'));

    genreSelect.innerHTML = `
      <option value="">Усі жанри</option>
      ${uniqueGenres.map(genre => `<option value="${genre}">${genreTranslations[genre] || genre}</option>`).join('')}
    `;
  }

  function applyFilters() {
    const searchValue = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const selectedGenre = genreSelect ? genreSelect.value : '';

    const filteredGames = allGames.filter(game => {
      const translatedGenres = (game.genres || []).map(genre => genreTranslations[genre] || genre);
      const matchesSearch = !searchValue
        || game.name.toLowerCase().includes(searchValue)
        || translatedGenres.some(genre => genre.toLowerCase().includes(searchValue));
      const matchesGenre = !selectedGenre || (game.genres || []).includes(selectedGenre);

      return matchesSearch && matchesGenre;
    });

    renderGames(filteredGames);
  }

  // Fetch real games from the backend popular-games.json
  async function loadGames() {
    try {
      const gamesData = await loadPopularGames();

      if (!gamesData || gamesData.length === 0) {
        throw new Error('No games found in popular-games.json');
      }

      allGames = gamesData;
      populateGenres(allGames);
      applyFilters();

    } catch (error) {
      console.error('Failed to load games:', error);
      // In case of error, show a beautiful error state and keep the static ones as fallback
      gamesContainer.innerHTML = `
        <div style="color: #c7d5e0; text-align: center; padding: 40px; font-size: 16px; width: 100%;">
          <p>Не вдалося завантажити ігри з бекенду.</p>
          <p style="font-size: 12px; color: #8F98A0; margin-top: 8px;">Переконайтеся, що проект запущено на локальному сервері.</p>
        </div>
      `;
    }
  }

  if (filterToggle && filterPanel) {
    filterToggle.addEventListener('click', () => {
      const isHidden = filterPanel.hasAttribute('hidden');
      filterPanel.toggleAttribute('hidden');
      filterToggle.setAttribute('aria-expanded', String(isHidden));
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  if (genreSelect) {
    genreSelect.addEventListener('change', applyFilters);
  }

  if (resetButton) {
    resetButton.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (genreSelect) genreSelect.value = '';
      applyFilters();
    });
  }

  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q');
  if (initialQuery && searchInput) {
    searchInput.value = initialQuery;
    if (filterPanel) {
      filterPanel.removeAttribute('hidden');
    }
    if (filterToggle) {
      filterToggle.setAttribute('aria-expanded', 'true');
    }
  }

  loadGames();
});
