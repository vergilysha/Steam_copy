# Steam Copy Backend API

## Overview
This backend provides a Service Worker-based API for searching games, finding download sources, and retrieving popular games lists.

## API Endpoints

### 1. GET /api/games
Returns a list of popular games with details from Steam.

**Response:**
```json
[
  {
    "id": 730,
    "name": "Counter-Strike 2",
    "description": "For over two decades, Counter-Strike has offered an elite competitive experience...",
    "image": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/730/header.jpg?t=1749053861",
    "genres": ["Action", "Free To Play"],
    "developers": ["Valve"],
    "publishers": ["Valve"],
    "release_date": "Aug 21, 2012",
    "store_url": "https://store.steampowered.com/app/730"
  }
]
```

**Example:**
```bash
curl http://localhost:port/backend/api/games
```

### 2. POST /api.html
Handles game search and download source queries.

**Request Body:**
```json
{
  "action": "search|download",
  "query": "game name"
}
```

#### Action: search
Searches for a game on Steam and returns detailed information.

**Example:**
```bash
curl -X POST http://localhost:port/backend/api.html \
  -H "Content-Type: application/json" \
  -d '{"action": "search", "query": "Counter-Strike 2"}'
```

**Response:**
```json
{
  "id": 730,
  "name": "Counter-Strike 2",
  "image": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/730/header.jpg",
  "screenshots": ["..."],
  "description": "...",
  "price": "Free to Play",
  "current_price": "Free to Play",
  "discount": 0,
  "sale_price": null,
  "genres": ["Action", "Free To Play"],
  "developers": ["Valve"],
  "publishers": ["Valve"],
  "metacritic": null,
  "platforms": { "windows": true, "mac": false, "linux": false },
  "release_date": "Aug 21, 2012",
  "store_url": "https://store.steampowered.com/app/730"
}
```

#### Action: download
Searches for download sources (FitGirl, DODI, Xatab, OnlineFix) for a game.

**Example:**
```bash
curl -X POST http://localhost:port/backend/api.html \
  -H "Content-Type: application/json" \
  -d '{"action": "download", "query": "Counter-Strike 2"}'
```

**Response:**
```json
{
  "query": "Counter-Strike 2",
  "total": 5,
  "results": [
    {
      "source": "FitGirl",
      "title": "Game Title",
      "fileSize": "15.5 GB",
      "uploadDate": "2024-01-15",
      "magnets": ["magnet:?xt=..."]
    }
  ]
}
```

## Data Files

### popular-games.json
Contains a curated list of 49 popular games fetched from Steam API. Updated via the `fetch-games.js` script.

**Fields:**
- `id`: Steam App ID
- `name`: Game name
- `description`: Short description from Steam
- `image`: Header image URL
- `genres`: Array of genre names
- `developers`: Array of developer names
- `publishers`: Array of publisher names
- `release_date`: Release date string
- `store_url`: Steam store URL

## Scripts

### fetch-games.js
Script to fetch game data from Steam API for a list of popular games.

**Usage:**
```bash
cd backend
node fetch-games.js
```

This script:
1. Fetches data for 50 popular games from Steam Charts
2. Uses the Steam Store API to get detailed information
3. Saves the results to `games/popular-games.json`
4. Includes rate limiting (1 second delay between requests)

## Service Worker

The API is implemented as a Service Worker (`api-sw.js`) that intercepts fetch requests and handles API calls.

**Features:**
- CORS proxy support for Steam API calls
- Game similarity matching for search
- Caching of download sources
- JSON response format with proper headers

## Error Responses

All endpoints return error responses in the following format:

```json
{
  "error": "Error message"
}
```

Common HTTP status codes:
- `200`: Success
- `400`: Bad request (missing parameters)
- `404`: Not found (game not found)
- `500`: Internal server error
