const SOURCES = [
  { name: 'FitGirl', path: './games/fitgirl.json' },
  { name: 'DODI',    path: './games/dodi.json'    },
  { name: 'Xatab',   path: './games/xatab.json'   },
  { name: 'OnlineFix', path: './games/onlinefix.json' },
];

let gameCache = null;

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // GET endpoint for games list
  if ((url.pathname.endsWith('/api/games') || url.pathname.endsWith('backend/api/games')) && event.request.method === 'GET') {
    event.respondWith(getGames());
    return;
  }
  
  if (!url.pathname.endsWith('/api.html')) return;

  if (event.request.method === 'POST') {
    event.respondWith(handle(event.request));
  } else {
    event.respondWith(
      Promise.resolve(Response.redirect(new URL('./index.html', event.request.url).href, 302))
    );
  }
});

async function handle(req) {
  try {
    const body = await req.json();
    const { action, query } = body;
    if (!action || !query) return errRes('Missing action or query', 400);
    if (action === 'search')   return searchGame(query.trim());
    if (action === 'download') return downloadGame(query.trim());
    return errRes(`Unknown action "${action}". Use "search" or "download"`, 400);
  } catch (e) {
    return errRes(e.message || 'Internal error', 500);
  }
}

// ── API 3: Get Popular Games List ─────────────────────────────────────────────

async function getGames() {
  try {
    const r = await fetch('./games/popular-games.json');
    const games = await r.json();
    return okRes(games);
  } catch (e) {
    return errRes('Failed to load games list', 500);
  }
}

// ── API 1: Search ──────────────────────────────────────────────────────────

async function searchGame(query) {
  const searchData = await proxyJSON(
    `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(query)}&l=english&cc=US`
  );
  if (!searchData?.items?.length) return errRes(`No game found for: "${query}"`, 404);

  const best = bestMatch(query, searchData.items, i => i.name);

  const detailData = await proxyJSON(
    `https://store.steampowered.com/api/appdetails?appids=${best.id}&cc=US&l=english`
  );
  const app = detailData?.[best.id]?.data;
  if (!app) return errRes('Game details unavailable', 404);

  const p = app.price_overview;
  return okRes({
    id:           app.steam_appid,
    name:         app.name,
    image:        app.header_image,
    screenshots:  (app.screenshots || []).slice(0, 3).map(s => s.path_thumbnail),
    description:  app.short_description,
    price:        p ? p.initial_formatted : 'Free to Play',
    current_price: p ? p.final_formatted : 'Free to Play',
    discount:     p ? p.discount_percent : 0,
    sale_price:   (p && p.discount_percent > 0) ? p.final_formatted : null,
    genres:       (app.genres || []).map(g => g.description),
    developers:   app.developers || [],
    publishers:   app.publishers || [],
    metacritic:   app.metacritic?.score ?? null,
    platforms:    app.platforms || {},
    release_date: app.release_date?.date ?? null,
    store_url:    `https://store.steampowered.com/app/${app.steam_appid}`,
  });
}

// ── API 2: Download ────────────────────────────────────────────────────────

async function downloadGame(query) {
  if (!gameCache) gameCache = await loadGames();

  const results = [];
  for (const { name, downloads } of gameCache) {
    for (const game of downloads) {
      const score = similarity(query, game.title);
      if (score >= 0.25) {
        results.push({
          score,
          source:     name,
          title:      game.title,
          fileSize:   game.fileSize,
          uploadDate: game.uploadDate,
          magnets:    game.uris || [],
        });
      }
    }
  }

  results.sort((a, b) => b.score - a.score);
  const out = results.slice(0, 20).map(({ score, ...r }) => r);
  return okRes({ query, total: out.length, results: out });
}

async function loadGames() {
  return Promise.all(
    SOURCES.map(async ({ name, path }) => {
      try {
        const r = await fetch(path);
        const d = await r.json();
        return { name, downloads: d.downloads || [] };
      } catch {
        return { name, downloads: [] };
      }
    })
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────

async function proxyJSON(url) {
  const proxies = [
    async () => {
      const r = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
      const { contents } = await r.json();
      return JSON.parse(contents);
    },
    async () => {
      const r = await fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`);
      return r.json();
    },
  ];
  for (const proxy of proxies) {
    try { return await proxy(); } catch { /* try next */ }
  }
  throw new Error('CORS proxies unavailable');
}

function norm(s) {
  return s.toLowerCase()
    .replace(/[:\-–—]/g, ' ')
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function similarity(a, b) {
  const na = norm(a), nb = norm(b);
  if (na === nb) return 1;
  if (nb.includes(na)) return 0.9;
  if (na.includes(nb)) return 0.85;
  const aw = na.split(' ').filter(Boolean);
  const bw = nb.split(' ').filter(Boolean);
  const bSet = new Set(bw);
  let hits = 0;
  for (const w of aw) {
    if (bSet.has(w)) {
      hits++;
    } else if (bw.some(t => t.includes(w) || w.includes(t))) {
      hits += 0.5;
    }
  }
  return hits / Math.max(aw.length, bw.length, 1);
}

function bestMatch(query, items, fn) {
  let best = items[0], bestScore = -1;
  for (const item of items) {
    const s = similarity(query, fn(item));
    if (s > bestScore) { bestScore = s; best = item; }
  }
  return best;
}

function okRes(data) {
  return new Response(JSON.stringify(data, null, 2), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

function errRes(msg, status = 400) {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}
