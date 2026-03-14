# CheckNewEpisodes — Notification Trigger

## Goal

Wire the notification system so it actually creates notifications when new episodes are available for anime/drama in a user's "Watching" list. Trigger: queued job dispatched on first authenticated page load per session.

## Constraints

- Follow existing conventions: strict types, final classes, Actions pattern
- All existing tests (82) must continue to pass
- No page load blocking — check runs in background queue
- Limit API calls: max 10 watchlist items per check, use Consumet cache (24h)
- Dedup: no duplicate notifications for the same anime

---

## Plan

### Step 1: Create the Job
- [x] 1.1 Create `app/Jobs/CheckNewEpisodes.php`
  - Accepts `User` model
  - Fetches user's "Watching" watchlist items (limit 10, ordered by `updated_at` desc)
  - For each item: call `ConsumetService::getAnimeInfo()` to get `totalEpisodes`
  - Compare against `MAX(episode_number)` from `watch_histories` for that `anime_id`
  - If `totalEpisodes > maxWatchedEpisode` AND no existing unread notification for this anime: create `EpisodeNotification`
  - Handle drama content type too (use `getDramaInfo()` for drama items)
  - Wrap in try/catch — job failure should not crash, just log warning
  - **Verify:** `php artisan tinker` — manually dispatch job for a test user

### Step 2: Create the Middleware
- [x] 2.1 Create `app/Http/Middleware/CheckNewEpisodesMiddleware.php`
  - Only runs for authenticated users
  - Checks `session('notifications_checked')`
  - If not set: dispatch `CheckNewEpisodes` job, set session flag
  - If set: pass through (no-op)
- [x] 2.2 Register middleware in `bootstrap/app.php` for the web middleware group
  - **Verify:** `php artisan route:list` — middleware shows up on auth routes

### Step 3: Tests
- [x] 3.1 Feature test for `CheckNewEpisodes` job (Http::fake)
  - Mock `ConsumetService` to return known `totalEpisodes`
  - Create watchlist + watch_history fixtures
  - Assert notification created when new episodes exist
  - Assert no notification when episodes are up to date
  - Assert no duplicate notification when unread notification already exists
- [x] 3.2 Feature test for middleware
  - Assert session flag is set after first authenticated request
  - Assert job is dispatched on first request
  - Assert job is NOT dispatched on second request (same session)
  - **Verify:** `./vendor/bin/pest` — all tests pass

### Step 4: Verification
- [x] 4.1 `npx tsc --noEmit` — clean
- [x] 4.2 `npm run build` — success
- [x] 4.3 `vendor/bin/pint --test` — clean
- [x] 4.4 `./vendor/bin/pest` — 90 tests, 351 assertions, all pass

---

## Verification Commands

| Command | Expected |
|---------|----------|
| `./vendor/bin/pest` | All tests pass (82+ with new tests) |
| `vendor/bin/pint --test` | Clean |
| `npx tsc --noEmit` | No errors |

## Acceptance Criteria

1. When a user opens the app (first page load of session), a background job checks their "Watching" list
2. If any anime has more episodes than the user has watched, a notification appears in the bell
3. No duplicate notifications for the same anime
4. Job doesn't block page load (queued)
5. Check doesn't repeat within the same session
6. Works for both anime and drama content types
7. All existing tests still pass

## Risks / Unknowns

- **Consumet API response format:** `totalEpisodes` field may be `null` or `0` for some anime — must handle gracefully
- **Queue driver:** Default is `database` queue — jobs will run synchronously unless a queue worker is running. For dev, this is fine (runs inline). For production, need `php artisan queue:work`
- **Drama episode counts:** Drama info may not have `totalEpisodes` — may need to count episodes array length instead
