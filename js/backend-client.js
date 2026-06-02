const BACKEND_BASES = [
  './backend',
  'backend',
  '/backend',
];

const DOWNLOAD_SOURCES = [
  { name: 'FitGirl', path: 'games/fitgirl.json' },
  { name: 'DODI', path: 'games/dodi.json' },
  { name: 'Xatab', path: 'games/xatab.json' },
  { name: 'OnlineFix', path: 'games/onlinefix.json' },
];

async function fetchJson(url) {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

async function fetchFirstJson(paths) {
  let lastError = null;
  for (const path of paths) {
    try {
      return await fetchJson(path);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error('Unable to load data');
}

async function loadPopularGames() {
  return fetchFirstJson([
    ...BACKEND_BASES.map((base) => `${base}/api/games`),
    ...BACKEND_BASES.map((base) => `${base}/games/popular-games.json`),
  ]);
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[:\-–—]/g, ' ')
    .replace(/[^a-z0-9а-яіїєґё ]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function getSimilarity(a, b) {
  const left = normalizeText(a);
  const right = normalizeText(b);
  if (!left || !right) return 0;
  if (left === right) return 1;
  if (right.includes(left)) return 0.9;
  if (left.includes(right)) return 0.85;

  const leftWords = left.split(' ').filter(Boolean);
  const rightWords = right.split(' ').filter(Boolean);
  const rightSet = new Set(rightWords);
  let hits = 0;

  for (const word of leftWords) {
    if (rightSet.has(word)) {
      hits += 1;
    } else if (rightWords.some((candidate) => candidate.includes(word) || word.includes(candidate))) {
      hits += 0.5;
    }
  }

  return hits / Math.max(leftWords.length, rightWords.length, 1);
}

function getGamePageUrl(gameName) {
  return `game.html?name=${encodeURIComponent(gameName || '')}`;
}

function openGamePage(gameName) {
  if (!gameName) return;
  window.location.href = getGamePageUrl(gameName);
}

function wireGameLink(element, gameName) {
  if (!element || !gameName) return;

  if (element.tagName === 'A') {
    element.href = getGamePageUrl(gameName);
    return;
  }

  element.setAttribute('role', 'link');
  element.tabIndex = 0;
  element.addEventListener('click', () => openGamePage(gameName));
  element.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openGamePage(gameName);
    }
  });
}

function wireStaticGameLinks(root = document) {
  root.querySelectorAll('.steam-search-item').forEach((item) => {
    const name = item.querySelector('.steam-search-item__name')?.textContent?.trim();
    wireGameLink(item, name);
  });

  root.querySelectorAll('.special-card').forEach((card) => {
    const name = card.querySelector('.special-card__name')?.textContent?.trim();
    wireGameLink(card, name);
  });

  root.querySelectorAll('.games_row').forEach((row) => {
    const name = row.querySelector('.games_row-title')?.textContent?.trim();
    wireGameLink(row, name);
  });
}

async function findGameByName(gameName) {
  const games = await loadPopularGames();
  let bestGame = null;
  let bestScore = 0;

  for (const game of games || []) {
    const score = getSimilarity(gameName, game.name);
    if (score > bestScore) {
      bestGame = game;
      bestScore = score;
    }
  }

  return bestScore >= 0.25 ? bestGame : null;
}

async function callBackendAction(action, query) {
  const payload = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, query }),
  };

  let lastError = null;
  for (const base of BACKEND_BASES) {
    try {
      const response = await fetch(`${base}/api.html`, payload);
      const contentType = response.headers.get('Content-Type') || '';
      if (!response.ok || !contentType.includes('application/json')) {
        throw new Error(`Backend action failed: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error('Backend action unavailable');
}

async function loadDownloadOptions(query) {
  try {
    return await callBackendAction('download', query);
  } catch {
    const sourceData = await Promise.all(
      DOWNLOAD_SOURCES.map(async ({ name, path }) => {
        const downloads = await fetchFirstJson(BACKEND_BASES.map((base) => `${base}/${path}`))
          .then((data) => data.downloads || [])
          .catch(() => []);
        return { name, downloads };
      })
    );

    const results = [];
    for (const { name, downloads } of sourceData) {
      for (const download of downloads) {
        const score = getSimilarity(query, download.title);
        if (score >= 0.25) {
          results.push({
            score,
            source: name,
            title: download.title,
            fileSize: download.fileSize,
            uploadDate: download.uploadDate,
            magnets: download.uris || [],
          });
        }
      }
    }

    results.sort((a, b) => b.score - a.score);
    return {
      query,
      total: results.length,
      results: results.map(({ score, ...result }) => result),
    };
  }
}
