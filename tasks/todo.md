# Watch Anime — Implementation Plan

## Goal

Build a personal anime streaming website using Laravel 12 + React + Inertia that proxies the Consumet API for browsing, searching, and streaming anime with watchlist and watch history features.

## Constraints (from findings.md)

- Laravel as thin proxy — all Consumet calls go through `ConsumetService`
- Actions pattern — business logic in `app/Actions/`, thin controllers
- Form Requests for all validation
- Strict models, `final` classes, `declare(strict_types=1)`
- SQLite database, Laravel file cache
- ArtPlayer for video, self-hosted Consumet API (Docker)

## Plan

### Phase 1: Backend Foundation

- [x] **1.1** Add `CONSUMET_API_URL` to `.env` and `config/services.php`
- [x] **1.2** Create `app/Services/ConsumetService.php` — wraps all Consumet HTTP calls with caching (`Cache::remember`) and provider fallback logic
- [x] **1.3** Create database migrations:
  - `watchlists` table: id, user_id (FK), anime_id (string), anime_title, anime_image, status (enum: watching/plan_to_watch/completed/dropped), timestamps
  - `watch_histories` table: id, user_id (FK), anime_id (string), episode_id (string), episode_number (int), progress_seconds (int), completed (bool), watched_at (datetime), timestamps
- [x] **1.4** Create Eloquent models: `Watchlist`, `WatchHistory` (strict, casts, relationships, fillable)
- [x] **1.5** Run migrations, verify schema

### Phase 2: Actions & Form Requests

- [x] **2.1** Create Actions:
  - `Actions/Anime/SearchAnime.php` — calls ConsumetService search
  - `Actions/Anime/GetAnimeDetail.php` — calls ConsumetService info
  - `Actions/Anime/GetStreamingLinks.php` — calls ConsumetService streaming
  - `Actions/Anime/GetTrending.php` — calls ConsumetService trending/popular
  - `Actions/Watchlist/AddToWatchlist.php`
  - `Actions/Watchlist/UpdateWatchlistStatus.php`
  - `Actions/Watchlist/RemoveFromWatchlist.php`
  - `Actions/History/SaveWatchProgress.php`
  - `Actions/History/GetWatchHistory.php`
- [x] **2.2** Create Form Requests:
  - `AddToWatchlistRequest`
  - `UpdateWatchlistRequest`
  - `SaveProgressRequest`

### Phase 3: Controllers & Routes

- [x] **3.1** Create controllers (thin, call actions only):
  - `AnimeController` — index (home), search, genre, show (detail)
  - `StreamController` — show (watch page)
  - `WatchlistController` — index, store, update, destroy
  - `HistoryController` — index, store
- [x] **3.2** Define routes in `routes/web.php`:
  - Public: `GET /`, `GET /search`, `GET /genre/{genre}`, `GET /anime/{id}`, `GET /anime/{id}/watch/{episodeId}`
  - Auth: `GET /watchlist`, `POST /watchlist`, `PATCH /watchlist/{id}`, `DELETE /watchlist/{id}`, `GET /history`, `POST /history`
- [x] **3.3** Verify routes with `php artisan route:list`

### Phase 4: React Pages & Components

- [x] **4.1** Install ArtPlayer: `npm install artplayer hls.js`
- [x] **4.2** Create shared components:
  - `AnimeCard.tsx` — image, title, rating badge
  - `EpisodeList.tsx` — scrollable list with watched indicators
  - `VideoPlayer.tsx` — ArtPlayer wrapper with HLS + progress events
- [x] **4.3** Create page components:
  - `pages/Home.tsx` — trending, popular, recently updated grids
  - `pages/Search.tsx` — search results grid with pagination
  - `pages/AnimeDetail.tsx` — cover, synopsis, rating, genres, episode list
  - `pages/Watch.tsx` — video player, episode nav, auto-save progress
  - `pages/Watchlist.tsx` — tabbed list (watching/plan to watch/completed/dropped)
  - `pages/History.tsx` — continue watching, sorted by last watched
- [x] **4.4** Create TypeScript types for Consumet API responses and page props

### Phase 5: Integration & Polish

- [x] **5.1** Wire up progress auto-save: player sends `POST /history` every 30s
- [x] **5.2** Wire up resume: on Watch page load, seek to `progress_seconds` if history exists
- [x] **5.3** Add error states for Consumet failures (loading, error, retry button)
- [x] **5.4** Add watchlist toggle button on AnimeDetail page
- [x] **5.5** Add "Continue Watching" section to Home page (authenticated users)

### Phase 6: Quality & Testing

- [x] **6.1** Run `/laravel-lint` — Pint + PHPStan + Rector must pass clean
- [x] **6.2** Write Pest feature tests:
  - ConsumetService (with Http::fake)
  - AnimeController routes
  - WatchlistController CRUD
  - HistoryController progress saving
- [x] **6.3** Write Pest unit tests for all Actions
- [x] **6.4** Run `/laravel-test` — all tests pass (62 tests, 211 assertions)
- [x] **6.5** Run `/security-check` — fixed: removed Model::unguard(), added url validation to anime_image, added status whitelist in WatchlistController

### Phase 7: Consumet Setup

- [x] **7.1** Add `docker-compose.yml` with Consumet API service
- [x] **7.2** Document setup in README
- [x] **7.3** End-to-end smoke test: browse → search → detail → stream (all 200)

## Verification Commands

```bash
# Schema
php artisan migrate:status

# Routes
php artisan route:list --except-vendor

# Lint
vendor/bin/pint --dirty
vendor/bin/phpstan analyse --memory-limit=512M
vendor/bin/rector --dry-run

# Tests
./vendor/bin/pest --coverage --compact

# App
php artisan serve
# Visit http://localhost:8000
```

## Acceptance Criteria

1. Home page loads with anime grids (trending, popular, recent)
2. Search returns results from Consumet
3. Anime detail page shows synopsis, episodes, rating
4. Video player streams episodes via HLS
5. Watchlist CRUD works (add, update status, remove)
6. Watch progress saves and resumes on reload
7. Auth works (register, login, logout)
8. All lint checks pass clean
9. All tests pass
10. Consumet runs via Docker alongside the app

## Risks / Unknowns

- **Consumet provider stability** — providers (Gogoanime, HiAnime) can break if upstream sites change. Mitigated by provider fallback in ConsumetService.
- **HLS streaming compatibility** — some Consumet providers may return non-HLS formats. VideoPlayer should handle both HLS and direct MP4.
- **Consumet API response shapes** — exact JSON structures need to be verified by running a local instance. Plan step 1.2 includes exploring the API first.
