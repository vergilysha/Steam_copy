document.addEventListener('DOMContentLoaded', () => {
  const genreTranslations = {
    Action: 'Екшн',
    'Free To Play': 'Безкоштовно',
    Strategy: 'Стратегія',
    Adventure: 'Пригоди',
    'Massively Multiplayer': 'Мультиплеєр',
    Indie: 'Інді',
    Casual: 'Казуальна гра',
    Simulation: 'Симулятор',
    RPG: 'Рольова гра (RPG)',
    Sports: 'Спорт',
    Racing: 'Перегони',
    'Early Access': 'Дочасний доступ',
    Utilities: 'Інструменти',
    'Animation & Modeling': 'Анімація та моделювання',
    'Design & Illustration': 'Дизайн та ілюстрація',
    'Photo Editing': 'Редагування фотографій',
    'Software Training': 'Навчальне ПЗ',
  };

  const selectors = {
    mainImage: document.querySelector('.main-image'),
    thumbs: document.querySelector('.block-with-small-images'),
    dots: document.querySelector('.dots'),
    prev: document.querySelector('.prev-btn'),
    next: document.querySelector('.next-btn'),
    title: document.querySelector('[data-game-title]'),
    genres: document.querySelector('[data-game-genres]'),
    price: document.querySelector('[data-game-price]'),
    description: document.querySelector('[data-game-description]'),
    rating: document.querySelector('[data-game-rating]'),
    release: document.querySelector('[data-game-release]'),
    developers: document.querySelector('[data-game-developers]'),
    publishers: document.querySelector('[data-game-publishers]'),
    playTitle: document.querySelector('[data-game-play-title]'),
    actionPrice: document.querySelector('[data-game-action-price]'),
    downloadButton: document.querySelector('[data-download-button]'),
    downloadPanel: document.querySelector('[data-download-panel]'),
    downloadResults: document.querySelector('[data-download-results]'),
    downloadClose: document.querySelector('[data-download-close]'),
    primeSection: document.querySelector('[data-prime-section]'),
  };

  const params = new URLSearchParams(window.location.search);
  const requestedName = params.get('name') || params.get('q') || params.get('title') || 'Counter-Strike 2';
  let currentGame = null;
  let currentIndex = 0;
  let currentImages = [];

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatGenres(genres) {
    if (!genres || !genres.length) return 'Гра';
    return genres.map((genre) => genreTranslations[genre] || genre).join(', ');
  }

  function formatList(values, fallback) {
    return values && values.length ? values.join(', ') : fallback;
  }

  function setText(element, text) {
    if (element) element.textContent = text;
  }

  function setMainImage(index) {
    if (!selectors.mainImage || !currentImages.length) return;
    currentIndex = (index + currentImages.length) % currentImages.length;
    selectors.mainImage.style.opacity = '0.45';

    window.setTimeout(() => {
      selectors.mainImage.src = currentImages[currentIndex];
      selectors.mainImage.alt = currentGame?.name || requestedName;
      selectors.mainImage.style.opacity = '1';
    }, 120);

    document.querySelectorAll('.small-image').forEach((image, imageIndex) => {
      image.classList.toggle('active-thumb', imageIndex === currentIndex);
    });
    document.querySelectorAll('.dot').forEach((dot, dotIndex) => {
      dot.classList.toggle('active', dotIndex === currentIndex);
    });
  }

  function renderGallery(game) {
    const fallbackImage = 'img/cs2 2.png';
    const images = [
      game.image,
      ...(game.screenshots || []),
      game.image,
      game.image,
      game.image,
      game.image,
    ].filter(Boolean);

    currentImages = images.length ? images.slice(0, 5) : [fallbackImage];

    if (selectors.thumbs) {
      selectors.thumbs.innerHTML = currentImages
        .map((image, index) => `
          <img class="small-image${index === 0 ? ' active-thumb' : ''}" src="${escapeHtml(image)}" alt="${escapeHtml(game.name)}" data-gallery-index="${index}" onerror="this.src='${fallbackImage}'">
        `)
        .join('');
    }

    if (selectors.dots) {
      selectors.dots.innerHTML = currentImages
        .map((_, index) => `<div class="dot${index === 0 ? ' active' : ''}" data-gallery-index="${index}"></div>`)
        .join('');
    }

    setMainImage(0);
  }

  function renderGame(game) {
    currentGame = game;
    const priceText = game.price || game.current_price || 'Безкоштовно';
    const releaseText = game.release_date || 'Невідомо';
    const developers = formatList(game.developers, 'Невідомо');
    const publishers = formatList(game.publishers, 'Невідомо');
    const isCounterStrike = normalizeText(game.name).includes('counter strike 2');

    document.title = `Steam - ${game.name}`;
    setText(selectors.title, game.name);
    setText(selectors.genres, formatGenres(game.genres));
    setText(selectors.price, priceText);
    setText(selectors.description, game.description || 'Опис для цієї гри поки недоступний у базі.');
    setText(selectors.rating, 'Рейтинг: Надзвичайно позитивний');
    setText(selectors.release, `Дата релізу: ${releaseText}`);
    setText(selectors.developers, `Автор: ${developers}`);
    setText(selectors.publishers, `Видавець: ${publishers}`);
    setText(selectors.playTitle, `Грати в ${game.name}`);
    setText(selectors.actionPrice, priceText);
    if (selectors.primeSection) selectors.primeSection.hidden = !isCounterStrike;
    renderGallery(game);
  }

  function renderMissingState() {
    const fallbackGame = {
      name: requestedName,
      description: 'Гру не знайдено в backend-базі. Перевірте назву або відкрийте гру зі сторінки каталогу.',
      genres: [],
      developers: [],
      publishers: [],
      release_date: null,
      image: 'img/cs2 2.png',
    };
    renderGame(fallbackGame);
    if (selectors.downloadButton) selectors.downloadButton.disabled = true;
  }

  function renderDownloadState(message) {
    if (!selectors.downloadPanel || !selectors.downloadResults) return;
    selectors.downloadPanel.hidden = false;
    selectors.downloadResults.innerHTML = `<div class="download-panel__state">${escapeHtml(message)}</div>`;
  }

  function renderDownloads(data) {
    const results = data?.results || [];
    if (!results.length) {
      renderDownloadState('Для цієї гри способи завантаження не знайдені.');
      return;
    }

    selectors.downloadPanel.hidden = false;
    selectors.downloadResults.innerHTML = results.map((item, index) => {
      const magnets = item.magnets || [];
      const links = magnets.length
        ? magnets.map((magnet, magnetIndex) => `
            <a class="download-card__link" href="${escapeHtml(magnet)}">
              Magnet ${magnetIndex + 1}
            </a>
          `).join('')
        : '<span class="download-card__empty">Magnet-посилання відсутні</span>';

      return `
        <article class="download-card" style="--delay:${Math.min(index, 8) * 45}ms">
          <div class="download-card__top">
            <span class="download-card__source">${escapeHtml(item.source || 'Backend')}</span>
            <span class="download-card__size">${escapeHtml(item.fileSize || 'Розмір невідомий')}</span>
          </div>
          <h3 class="download-card__title">${escapeHtml(item.title || currentGame.name)}</h3>
          <div class="download-card__meta">
            <span>${escapeHtml(item.uploadDate || 'Дата невідома')}</span>
            <span>${magnets.length} magnet</span>
          </div>
          <div class="download-card__links">${links}</div>
        </article>
      `;
    }).join('');
  }

  selectors.thumbs?.addEventListener('click', (event) => {
    const target = event.target.closest('[data-gallery-index]');
    if (!target) return;
    setMainImage(Number(target.dataset.galleryIndex));
  });

  selectors.dots?.addEventListener('click', (event) => {
    const target = event.target.closest('[data-gallery-index]');
    if (!target) return;
    setMainImage(Number(target.dataset.galleryIndex));
  });

  selectors.prev?.addEventListener('click', () => setMainImage(currentIndex - 1));
  selectors.next?.addEventListener('click', () => setMainImage(currentIndex + 1));

  selectors.downloadClose?.addEventListener('click', () => {
    if (selectors.downloadPanel) selectors.downloadPanel.hidden = true;
  });

  selectors.downloadButton?.addEventListener('click', async () => {
    if (!currentGame) return;
    selectors.downloadButton.disabled = true;
    renderDownloadState('Backend обробляє джерела завантаження...');

    try {
      const downloads = await loadDownloadOptions(currentGame.name);
      renderDownloads(downloads);
    } catch (error) {
      renderDownloadState(`Не вдалося отримати способи завантаження: ${error.message}`);
    } finally {
      selectors.downloadButton.disabled = false;
    }
  });

  findGameByName(requestedName)
    .then((game) => {
      if (game) {
        renderGame(game);
      } else {
        renderMissingState();
      }
    })
    .catch(() => renderMissingState());
});
