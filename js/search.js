document.addEventListener('DOMContentLoaded', () => {
  const searchForms = document.querySelectorAll('.steam-search');
  if (!searchForms.length) return;

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

  function getGamesPageUrl(query) {
    const basePath = 'game.html';
    return query
      ? `${basePath}?name=${encodeURIComponent(query)}`
      : basePath;
  }

  function translateGenres(genres) {
    if (!genres || !genres.length) return [];
    return genres.map((genre) => genreTranslations[genre] || genre);
  }

  function buildSearchItem(game) {
    const translatedGenres = translateGenres(game.genres);
    const firstGenre = translatedGenres[0] || 'Гра';

    return `
      <a class="steam-search-item" href="${getGamesPageUrl(game.name)}" role="option" data-game-name="${game.name}">
        <div class="steam-search-item__thumb" aria-hidden="true">
          <img class="steam-search-item__img" src="${game.image || 'img/cs2 2.png'}" alt="${game.name}" onerror="this.src='img/cs2 2.png'">
        </div>
        <div class="steam-search-item__name">${game.name}</div>
        <div class="steam-search-item__meta">
          <span class="steam-search-item__discount">-90%</span>
          <span class="steam-search-item__genre">${firstGenre}</span>
          <span class="steam-search-item__price">67 грн</span>
        </div>
      </a>
    `;
  }

  function buildEmptyState(query) {
    return `
      <div class="steam-search-item steam-search-item--empty" role="status">
        <div class="steam-search-item__name">Нічого не знайдено</div>
        <div class="steam-search-item__meta">
          <span class="steam-search-item__hint">Спробуйте іншу назву для "${query}"</span>
        </div>
      </div>
    `;
  }

  async function fetchGames() {
    return loadPopularGames();
  }

  function setupSearch(forms, games) {
    const defaultGames = games.slice(0, 3);

    forms.forEach((form) => {
      const input = form.querySelector('.steam-search__input');
      const popup = form.querySelector('.steam-search__popup');
      const title = form.querySelector('.steam-search__popup-title');
      if (!input || !popup || !title) return;

      function renderResults(query) {
        const normalizedQuery = query.trim().toLowerCase();
        const results = normalizedQuery
          ? games.filter((game) => {
              const translatedGenres = translateGenres(game.genres);
              return game.name.toLowerCase().includes(normalizedQuery)
                || translatedGenres.some((genre) => genre.toLowerCase().includes(normalizedQuery));
            }).slice(0, 3)
          : defaultGames;

        title.textContent = normalizedQuery ? 'Результати пошуку' : 'Популярні пошукові запити';
        popup.querySelectorAll('.steam-search-item').forEach((item) => item.remove());
        popup.insertAdjacentHTML(
          'beforeend',
          results.length
            ? results.map(buildSearchItem).join('')
            : buildEmptyState(query.trim())
        );
      }

      renderResults('');

      input.addEventListener('input', () => {
        renderResults(input.value);
      });

      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const query = input.value.trim();
        window.location.href = getGamesPageUrl(query);
      });
    });
  }

  fetchGames()
    .then((games) => setupSearch(searchForms, games || []))
    .catch((error) => {
      console.error('Failed to load header search games:', error);
    });
});
