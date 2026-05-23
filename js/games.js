document.addEventListener('DOMContentLoaded', () => {
  const gamesContainer = document.querySelector('.games_rows');
  if (!gamesContainer) return;

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

  function translateGenres(genres) {
    if (!genres || !genres.length) return "Гра";
    if (genres.length > 5) {
      return genres.slice(0, 5).map(g => genreTranslations[g] || g).join(", ") + "..";
    }
    return genres.map(g => genreTranslations[g] || g).join(", ");
  }

  // Fetch real games from the backend popular-games.json
  async function loadGames() {
    try {
      // First try standard path, fallback to absolute if needed
      let response;
      try {
        response = await fetch('backend/games/popular-games.json');
      } catch (e) {
        response = await fetch('./backend/games/popular-games.json');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const gamesData = await response.ok ? await response.json() : [];

      if (!gamesData || gamesData.length === 0) {
        throw new Error('No games found in popular-games.json');
      }

      // Clear static skeleton/placeholder rows
      gamesContainer.innerHTML = '';

      // Generate HTML for each game
      gamesData.forEach(game => {
        // Random review selection
        const randomReview = reviewsOptions[Math.floor(Math.random() * reviewsOptions.length)];
        
        // Build the game row element
        const gameRow = document.createElement('div');
        gameRow.className = 'games_row';
        gameRow.style.opacity = '0';
        gameRow.style.transition = 'opacity 0.3s ease-in-out';
        
        // If developer or store URL exists, we can make it clickable or rich
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

        gamesContainer.appendChild(gameRow);
        
        // Trigger smooth fade-in
        setTimeout(() => {
          gameRow.style.opacity = '1';
        }, 50);
      });

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

  loadGames();
});
