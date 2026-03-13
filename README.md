# Anime Nexus

Personal anime and drama streaming app built with Laravel 12, React 19, Inertia.js, and TypeScript. Browse, search, and stream anime and drama content with watch progress tracking and personal watchlists.

## Prerequisites

- PHP 8.4+
- Composer
- Node.js 22+
- Docker (for Consumet API)
- [Laravel Herd](https://herd.laravel.com/) (recommended) or `php artisan serve`

## Setup

```bash
# Install dependencies
composer install
npm install

# Environment
cp .env.example .env
php artisan key:generate
```

Add to your `.env`:

```
CONSUMET_API_URL=http://localhost:3000
```

```bash
# Database
php artisan migrate

# Start Consumet API
docker compose up -d

# Start dev server
npm run dev
```

Visit `http://localhost:8000` (or your Herd domain).

## Stack

| Layer       | Technology                                  |
|-------------|---------------------------------------------|
| Backend     | Laravel 12, PHP 8.4, SQLite                 |
| Frontend    | React 19, TypeScript, Tailwind CSS          |
| Bridge      | Inertia.js v2                               |
| Video       | ArtPlayer + hls.js (anime), iframe embeds (drama) |
| Content API | Consumet API (self-hosted via Docker)        |
| Auth        | Laravel Breeze + Sanctum                    |
| Testing     | Pest, PHPStan (level 9), Pint, Rector       |

## Features

### Anime
- Browse trending, popular, and recently updated anime
- Search anime by title
- Filter by genre
- Stream episodes with HLS video player (ArtPlayer)
- Intro/outro skip buttons
- Auto-advances to next episode on completion

### Drama
- Browse trending dramas (TV series from FlixHQ/Goku providers)
- Search dramas by title
- Drama detail pages with season selector and episode list
- Stream episodes via embedded player (vidsrc.cc with TMDB ID mapping)
- Movie and TV series support

### Shared
- Content type switcher (Anime | Drama) in navigation
- Watch progress tracking (auto-saves every 30s, resumes on reload)
- Watchlist management (watching, plan to watch, completed, dropped)
- Watch history with continue watching section on home pages
- User authentication (register, login, profile management)
- Dark theme UI

## Architecture

### Backend

```
app/
├── Actions/              # Business logic (one class per operation)
│   ├── Anime/            # GetTrending, SearchAnime, GetAnimeDetail, GetStreamingLinks
│   ├── Drama/            # GetDramaTrending, SearchDrama, GetDramaDetail, GetDramaStreamingLinks
│   ├── History/          # GetWatchHistory, SaveWatchProgress
│   └── Watchlist/        # AddToWatchlist, UpdateWatchlistStatus, RemoveFromWatchlist
├── Http/Controllers/
│   ├── AnimeController   # Home, search, genre, detail pages
│   ├── StreamController  # Anime video streaming + HLS proxy
│   ├── DramaController   # Drama home, search, detail pages
│   ├── DramaStreamController  # Drama video streaming (TMDB embed)
│   ├── WatchlistController    # CRUD for watchlist items
│   └── HistoryController      # Watch progress tracking
├── Models/
│   ├── User              # Auth + relationships to watchlists/history
│   ├── Watchlist         # Anime/drama watchlist entries
│   └── WatchHistory      # Episode progress tracking
└── Services/
    └── ConsumetService   # Consumet API client with caching + provider fallback
```

### Frontend

```
resources/js/
├── Pages/
│   ├── Home.tsx          # Anime homepage (trending, popular, recent)
│   ├── Search.tsx        # Anime search results
│   ├── AnimeDetail.tsx   # Anime detail with episodes
│   ├── Watch.tsx         # Anime video player page
│   ├── DramaHome.tsx     # Drama homepage (trending)
│   ├── DramaSearch.tsx   # Drama search results
│   ├── DramaDetail.tsx   # Drama detail with season selector
│   ├── DramaWatch.tsx    # Drama video player page (iframe embed)
│   ├── Watchlist.tsx     # User's watchlist (filterable by content type + status)
│   └── History.tsx       # Watch history (filterable by content type)
├── Components/
│   ├── VideoPlayer.tsx       # ArtPlayer wrapper with HLS, subtitles, intro/outro skip
│   ├── AnimeCard.tsx         # Card component for anime/drama items
│   ├── EpisodeList.tsx       # Scrollable episode list sidebar
│   ├── ContentTypeSwitcher.tsx  # Anime | Drama toggle
│   └── ApplicationLogo.tsx   # App logo
└── Layouts/
    └── AuthenticatedLayout.tsx  # Nav, search, user menu
```

### Routes

| Method | Path | Controller | Name |
|--------|------|------------|------|
| GET | `/` | AnimeController@index | home |
| GET | `/search` | AnimeController@search | anime.search |
| GET | `/genre/{genre}` | AnimeController@genre | anime.genre |
| GET | `/anime/{id}` | AnimeController@show | anime.show |
| GET | `/anime/{id}/watch` | StreamController@show | anime.watch |
| GET | `/stream/proxy` | StreamController@proxy | stream.proxy |
| GET | `/drama` | DramaController@index | drama.home |
| GET | `/drama/search` | DramaController@search | drama.search |
| GET | `/drama/{id}` | DramaController@show | drama.show |
| GET | `/drama/{id}/watch` | DramaStreamController@show | drama.watch |
| GET | `/watchlist` | WatchlistController@index | watchlist.index |
| POST | `/watchlist` | WatchlistController@store | watchlist.store |
| PATCH | `/watchlist/{watchlist}` | WatchlistController@update | watchlist.update |
| DELETE | `/watchlist/{watchlist}` | WatchlistController@destroy | watchlist.destroy |
| GET | `/history` | HistoryController@index | history.index |
| POST | `/history` | HistoryController@store | history.store |

### Content API (Consumet)

The app uses a self-hosted [Consumet API](https://github.com/consumet/api.consumet.org) as the content source.

**Anime providers** (with automatic fallback): `animekai`, `hianime`, `gogoanime`
- Direct HLS streaming via ArtPlayer
- Stream URLs proxied through `/stream/proxy` for CORS handling

**Drama providers**: `flixhq`, `goku`
- Streaming endpoints are currently broken (Cloudflare blocking)
- Fallback: iframe embed via [vidsrc.cc](https://vidsrc.cc) using TMDB IDs
- TMDB ID lookup via Consumet's `/meta/tmdb/{title}` endpoint with release year matching

**Caching strategy** (database-backed):
| Data | TTL |
|------|-----|
| Metadata (search, info, trending) | 24 hours |
| Episode lists | 6 hours |
| Streaming links | 30 minutes |

Stale cache is served as fallback when the API is unavailable.

### Video Playback

**Anime:** ArtPlayer with hls.js for direct HLS streaming. Supports subtitles, intro/outro skip markers, and quality selection.

**Drama:** Iframe embed player (vidsrc.cc). The app maps drama titles to TMDB IDs via Consumet's meta API, then constructs embed URLs:
- TV: `https://vidsrc.cc/v2/embed/tv/{tmdbId}/{season}/{episode}`
- Movie: `https://vidsrc.cc/v2/embed/movie/{tmdbId}`

### Database

SQLite with three main tables beyond Laravel defaults:

- **watchlists** — user_id, anime_id, anime_title, anime_image, status, content_type
- **watch_histories** — user_id, anime_id, anime_title, anime_image, episode_id, episode_number, progress_seconds, completed, content_type, watched_at

Both tables support `content_type` (`anime` | `drama`) for filtering.

## Development

```bash
# Format PHP
vendor/bin/pint

# Static analysis
vendor/bin/phpstan analyse --memory-limit=512M

# Refactoring suggestions
vendor/bin/rector --dry-run

# Run tests (68 tests, 276 assertions)
./vendor/bin/pest

# TypeScript check
npx tsc --noEmit

# Build frontend
npm run build
```

## Known Limitations

- **Drama streaming providers broken**: FlixHQ and Goku streaming endpoints return 500/530 errors due to Cloudflare blocking in consumet.ts v1.8.8. Iframe embeds are used as a workaround.
- **Embed player ads**: vidsrc.cc (and all free embed providers) include ads. A browser ad blocker like uBlock Origin is recommended.
- **Drama IDs contain slashes**: IDs like `tv/watch-vincenzo-67955` require special route handling (`{id}` with `where('id', '.*')`).

## License

MIT
