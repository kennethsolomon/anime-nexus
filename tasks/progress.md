# Progress Log

## 2026-03-13 — Batch 1: Steps 1.1, 1.2, 1.3

### 1.1 — Consumet config
- Added `consumet.url` to `config/services.php`
- `.env` edit blocked by hook — user must add `CONSUMET_API_URL=http://localhost:3000` manually

### 1.2 — ConsumetService
- Created `app/Services/ConsumetService.php`
  - Methods: search, getAnimeInfo, getStreamingLinks, getTrending, getPopular, getRecentEpisodes, getByGenre, getFreshStreamingLinks
  - Caching: metadata 24h, episodes 6h, streaming 30min
  - Provider fallback: hianime → gogoanime
  - Stale cache fallback on connection failure
- Registered as singleton in `AppServiceProvider`

### 1.3 — Migrations
- Created `watchlists` table: user_id (FK), anime_id, anime_title, anime_image, status, unique(user_id, anime_id)
- Created `watch_histories` table: user_id (FK), anime_id, episode_id, episode_number, progress_seconds, completed, watched_at, unique(user_id, anime_id, episode_id)
- Migrations ran successfully

## 2026-03-13 — Batch 2: Steps 1.4, 1.5, 2.1

### 1.4 — Eloquent models
- Created `app/Models/Watchlist.php` — final, fillable, BelongsTo user
- Created `app/Models/WatchHistory.php` — final, fillable, casts (immutable_datetime, integer, boolean), BelongsTo user
- Added `watchlists()` and `watchHistories()` HasMany relationships to User model
- Changed User `email_verified_at` cast to `immutable_datetime`

### 1.5 — Verify schema
- `php artisan migrate:status` — all 5 migrations ran successfully

### 2.1 — Actions
- Created 9 actions across 3 domains:
  - `Actions/Anime/`: SearchAnime, GetAnimeDetail, GetStreamingLinks, GetTrending
  - `Actions/Watchlist/`: AddToWatchlist, UpdateWatchlistStatus, RemoveFromWatchlist
  - `Actions/History/`: SaveWatchProgress, GetWatchHistory
- All files pass `php -l` syntax check

## 2026-03-13 — Batch 3: Steps 2.2, 3.1, 3.2

### 2.2 — Form Requests
- Created `AddToWatchlistRequest` — validates anime_id, anime_title, anime_image, status
- Created `UpdateWatchlistRequest` — validates status, authorizes owner
- Created `SaveProgressRequest` — validates anime_id, episode_id, episode_number, progress_seconds, completed

### 3.1 — Controllers
- Created `AnimeController` — index, search, genre, show (thin, delegates to Actions)
- Created `StreamController` — show (fetches streaming links + anime detail + progress)
- Created `WatchlistController` — index, store, update, destroy
- Created `HistoryController` — index, store (store returns JSON for AJAX progress saves)

### 3.2 — Routes
- Replaced default routes in `routes/web.php`
- Public: /, /search, /genre/{genre}, /anime/{id}, /anime/{id}/watch/{episodeId}
- Auth: /watchlist (CRUD), /history (index + store), /profile (Breeze)
- `php artisan route:list` — 29 routes registered, all correct

## 2026-03-13 — Batch 4: Steps 3.3, 4.1, 4.2

### 3.3 — Route verification
- Already verified in batch 3, marked done

### 4.1 — Install ArtPlayer
- Had to upgrade `@types/node` from 18 to 22 to satisfy vite peer dep
- `npm install artplayer hls.js` — success

### 4.2 — Shared components
- Created `AnimeCard.tsx` — image, title, rating badge, type badge, episode count
- Created `EpisodeList.tsx` — scrollable list with active/watched indicators
- Created `VideoPlayer.tsx` — ArtPlayer wrapper with HLS via hls.js, progress interval (30s), startAt seek, onEnded callback
- Fixed TS error: removed `title` from ArtPlayer options (not in type definition)
- `npx tsc --noEmit` — clean

## 2026-03-13 — Batch 5: Steps 4.3, 4.4

### 4.4 — TypeScript types
- Created `resources/js/types/anime.d.ts` with interfaces:
  AnimeResult, AnimeSearchResponse, Episode, AnimeInfo, StreamingSource, StreamingResponse, WatchlistItem, WatchHistoryItem

### 4.3 — Page components
- Created 6 pages:
  - `Home.tsx` — trending/popular/recent grids, search bar, guest/auth layout
  - `Search.tsx` — search results with pagination, supports genre browsing
  - `AnimeDetail.tsx` — cover, synopsis, rating, genres, episode list, watchlist buttons
  - `Watch.tsx` — video player, episode nav (prev/next), auto-save progress, auto-play next
  - `Watchlist.tsx` — tabbed by status, status change dropdown, remove button
  - `History.tsx` — continue watching list with progress/completed indicators
- `npx tsc --noEmit` — clean, zero errors

## 2026-03-13 — Batch 6: Steps 5.1–5.5

### 5.1, 5.2, 5.3 — Already implemented
- Auto-save, resume, and error states were built into Watch.tsx and AnimeDetail.tsx in batch 5

### 5.4 — Watchlist toggle on AnimeDetail
- Updated AnimeController::show to pass `watchlistEntry` prop
- Updated AnimeDetail.tsx: shows current status, highlights active button, adds Remove button
- Watchlist buttons use `updateOrCreate` so they toggle correctly

### 5.5 — Continue Watching on Home
- Updated AnimeController::index to pass `continueWatching` (incomplete history, limit 10)
- Updated Home.tsx: shows "Continue Watching" section above trending for authenticated users
- `npx tsc --noEmit` — clean

## 2026-03-13 — Batch 7: Steps 6.1–6.4

### 6.1 — Lint
- Pint: pass (all files formatted)
- PHPStan: 0 errors (level 9)
- Rector: clean on dry-run

### 6.2 — Feature tests
- Created `tests/Feature/AnimeControllerTest.php` (5 tests with Http::fake)
- Created `tests/Feature/WatchlistControllerTest.php` (7 tests: auth, display, add, update, remove, prevent other user, filter)
- Created `tests/Feature/HistoryControllerTest.php` (9 tests: auth, display, save, update, completed, validation dataset)
- Fixed parse error: extra closing bracket in Http::fake array
- Fixed Vite manifest error: added `withoutVite()` to global `beforeEach` in `tests/Pest.php`
- Fixed Breeze auth tests: replaced `route('dashboard')` with `route('home')` in 6 auth controllers and 3 test files

### 6.3 — Unit tests for Actions
- Created 9 unit test files in `tests/Unit/Actions/`
- Anime Actions use Http::fake (ConsumetService is `final readonly`, can't be Mockery-mocked)
- DB Actions (Watchlist, History) use RefreshDatabase via Pest config
- Added second `pest()` binding in Pest.php for `Unit/Actions` with RefreshDatabase

### 6.4 — Full test suite
- 62 tests, 211 assertions — all pass
- Lint re-verified: Pint pass, PHPStan 0 errors

### 6.5 — Security check
- Removed `Model::unguard()` from AppServiceProvider (high severity — bypassed all mass assignment protection)
- Added `url` validation rule to `anime_image` in AddToWatchlistRequest
- Added status whitelist in WatchlistController::index (rejects invalid status values)
- Fixed Breeze auth controllers: replaced `route('dashboard')` with `route('home')` in 6 controllers + 3 test files
- All 62 tests pass after fixes

## 2026-03-13 — Batch 8: Steps 7.1, 7.2

### 7.1 — Docker Compose
- Created `docker-compose.yml` with Consumet API service (riimuru/consumet-api)

### 7.2 — README
- Replaced default Laravel README with project-specific setup docs

### 7.3 — Smoke test
- Consumet API responds on localhost:3000 (search, info endpoints confirmed)
- Trending endpoint returns empty (known Consumet issue — app handles gracefully)
- Built frontend: `npm run build` — success, all assets compiled
- Routes tested: `/` (200), `/search?q=naruto` (200), `/anime/one-piece-100` (200), `/genre/action` (200)
- All phases complete
