# Drama Content Support — Implementation Plan

## Goal

Add a content type switcher (Anime | Drama) to the nav bar. Each mode has its own home feed, search, detail, and watch pages. Shared watchlist and history with a `content_type` discriminator. Drama sources: FlixHQ (primary), Goku (fallback) via Consumet `/movies/` API.

## Constraints

- Follow existing conventions: strict types, final classes, Actions pattern
- All existing anime tests must still pass
- Reuse existing components (AnimeCard, EpisodeList, VideoPlayer) where possible
- Streaming is broken on drama providers — build UI anyway, will work when Consumet is updated

---

## Phase 1: Backend — ConsumetService Drama Methods

- [x] 1.1 Add drama provider constants and methods to `ConsumetService.php`: `searchDrama()`, `getDramaInfo()`, `getDramaStreamingLinks()`, `getDramaTrending()`
  - Drama providers: `['flixhq', 'goku']`
  - Endpoints under `/movies/{provider}/...`
  - `getDramaStreamingLinks()` passes `episodeId` + `mediaId` as query params
  - **Verify:** `php artisan tinker` — `app(ConsumetService::class)->searchDrama('vincenzo')` returns results

- [x] 1.2 Create Action classes in `app/Actions/Drama/`:
  - `GetDramaTrending.php` — calls `getDramaTrending()`, filters to TV Series only
  - `SearchDrama.php` — calls `searchDrama()`
  - `GetDramaDetail.php` — calls `getDramaInfo()`
  - `GetDramaStreamingLinks.php` — calls `getDramaStreamingLinks()`
  - **Verify:** `npx tsc --noEmit` still clean (PHP only)

## Phase 2: Database — Content Type Column

- [x] 2.1 Migration: add `content_type` string column to `watchlists` table (default: `'anime'`)
- [x] 2.2 Migration: add `content_type` string column to `watch_histories` table (default: `'anime'`)
  - **Verify:** `php artisan migrate` succeeds

- [x] 2.3 Update `Watchlist` model: add `content_type` to `$fillable`
- [x] 2.4 Update `WatchHistory` model: add `content_type` to `$fillable`
- [x] 2.5 Update `SaveProgressRequest`: add optional `content_type` rule (`sometimes|string|in:anime,drama`)
- [x] 2.6 Update `SaveWatchProgress` action: pass `content_type` through
- [x] 2.7 Update `WatchlistController@store`: accept and save `content_type`
  - **Verify:** `./vendor/bin/pest` — all existing tests pass

## Phase 3: Routes + Controllers

- [x] 3.1 Create `DramaController.php` with: `index`, `search`, `show`
  - Mirror `AnimeController` structure, call drama action classes
  - `index`: trending dramas
  - `search`: search by query
  - `show`: drama detail with episodes

- [x] 3.2 Create `DramaStreamController.php` with: `show`
  - Same pattern as `StreamController`, reuse proxy route
  - Pass `mediaId` alongside `episodeId` to Consumet

- [x] 3.3 Add drama routes to `web.php`:
  - `/drama` → `DramaController@index` (drama.home)
  - `/drama/search` → `DramaController@search` (drama.search)
  - `/drama/{id}` → `DramaController@show` (drama.show)
  - `/drama/{id}/watch` → `DramaStreamController@show` (drama.watch)
  - **Verify:** `php artisan route:list --name=drama` shows 4 routes

- [x] 3.4 Update `WatchlistController@index`: filter by optional `content_type` query param
- [x] 3.5 Update `HistoryController@index`: filter by optional `content_type` query param

## Phase 4: TypeScript Types

- [x] 4.1 Add to `resources/js/types/anime.d.ts`:
  - `DramaResult` — like `AnimeResult` + `seasons?: number`, `country?: string`
  - `DramaInfo` — like `AnimeInfo` + `casts?: string[]`, `country?: string`, `production?: string`
  - `DramaEpisode` — like `Episode` + `season: number`
  - `ContentType = 'anime' | 'drama'`
  - Add `content_type?: ContentType` to `WatchHistoryItem` and `WatchlistItem`
  - **Verify:** `npx tsc --noEmit` — clean

## Phase 5: Nav Switcher

- [x] 5.1 Create `ContentTypeSwitcher.tsx` — pill toggle: Anime | Drama
  - Active: `bg-accent text-base rounded-lg`, inactive: `text-theme-secondary`
  - Reads mode from current URL (path starts with `/drama` = drama mode)
  - Click navigates to `/` (anime) or `/drama` (drama)

- [x] 5.2 Add switcher to `AuthenticatedLayout.tsx` (between logo and search)
- [x] 5.3 Add switcher to all `GuestNav` instances (Home.tsx, Watch.tsx, AnimeDetail.tsx, Search.tsx)
  - **Verify:** `npm run build` — success

## Phase 6: Drama Pages

- [x] 6.1 Create `DramaHome.tsx` — trending dramas grid, continue watching (drama), GuestNav with switcher
- [x] 6.2 Create `DramaDetail.tsx` — drama info with casts, country, season selector dropdown, episode list filtered by season, "Watch EP 1" CTA, watchlist dropdown
- [x] 6.3 Create `DramaWatch.tsx` — VideoPlayer, episode nav, progress saving with `content_type: 'drama'`, no intro/outro skip
- [x] 6.4 Create `DramaSearch.tsx` — search results grid, GuestNav with switcher
  - **Verify:** `npx tsc --noEmit` — clean, `npm run build` — success

## Phase 7: Update Existing Pages

- [x] 7.1 Update `Watchlist.tsx`: add Anime | Drama content type tabs above the status tabs
- [x] 7.2 Update `History.tsx`: add Anime | Drama content type tabs
- [x] 7.3 Update `Watch.tsx`: pass `content_type: 'anime'` with progress/completed saves
- [x] 7.4 Update `AnimeDetail.tsx`: pass `content_type: 'anime'` with watchlist saves
  - **Verify:** `npm run build` — success

## Phase 8: Tests

- [x] 8.1 Update existing watchlist/history tests to account for new `content_type` column
- [x] 8.2 Add feature test for `DramaController` (index, search, show) — mock ConsumetService responses
- [x] 8.3 Add feature test for `DramaStreamController@show`
  - **Verify:** `./vendor/bin/pest` — all tests pass

## Phase 9: Final Verification

- [x] 9.1 `npx tsc --noEmit` — clean
- [x] 9.2 `npm run build` — success
- [x] 9.3 `./vendor/bin/pest` — all tests pass (68 tests, 276 assertions)
- [x] 9.4 `vendor/bin/pint` — auto-fix formatting
- [x] 9.5 Visual smoke test: `/drama` home, search, detail page, watch page

---

## Verification Commands

| Command | Expected |
|---------|----------|
| `php artisan migrate` | Success |
| `php artisan route:list --name=drama` | 4 drama routes |
| `npx tsc --noEmit` | No errors |
| `npm run build` | Success |
| `./vendor/bin/pest` | All tests pass |

## Acceptance Criteria

1. Nav bar shows Anime / Drama pill switcher on all pages
2. `/drama` shows trending dramas from FlixHQ
3. `/drama/search?q=vincenzo` returns drama results
4. `/drama/{id}` shows drama detail with seasons, casts, season selector, episode list
5. `/drama/{id}/watch` loads the player (streaming may fail — expected)
6. Watchlist and History pages have content type tabs
7. Progress saves include `content_type` field
8. All existing anime functionality unchanged
9. All tests pass

## Risks / Unknowns

- **Streaming broken**: FlixHQ/Goku watch endpoints return errors. UI will be ready but playback won't work until Consumet is updated.
- **FlixHQ trending includes movies**: Filter to TV Series only in `GetDramaTrending` action.
- **Season handling**: FlixHQ episodes have a `season` field — group/filter in DramaDetail.
- **`id` format difference**: Drama IDs contain slashes (`tv/watch-vincenzo-67955`) — may need URL encoding in routes.
