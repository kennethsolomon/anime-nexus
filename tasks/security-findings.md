# Security Audit — 2026-03-15

**Scope:** Changed files on branch `fix/duplicate-episode-notifications`
**Stack:** Laravel 12 / Inertia + React (TypeScript) / PHP 8.4 / SQLite
**Files audited:** 7 (excluding tests, package files)

## Critical (must fix before deploy)

None.

## High (fix before production)

None.

## Medium (should fix)

None.

## Low / Informational

None.

## Passed Checks

- **OWASP A01 Broken Access Control:**
  - `NotificationController::destroy` (line 57): Uses `$this->authorize('delete', $episodeNotification)` — policy enforces user ownership before deletion.
  - `NotificationController::destroyAll` (line 69): Scoped to `$request->user()->id` — cannot delete other users' notifications.
  - `EpisodeNotificationPolicy::delete` (line 17-19): Strict `$user->id === $notification->user_id` check.
  - All new routes under `auth` middleware group (web.php:62-63).
  - Route model binding on `{episodeNotification}` prevents IDOR — combined with policy check.

- **OWASP A03 Injection (SQL/XSS):**
  - Migration (line 23): Uses `havingRaw('COUNT(*) > 1')` — no user input, hardcoded SQL fragment. Safe.
  - Migration (line 58): `DB::raw()` subquery uses column references only (`watchlists.user_id`, `watchlists.anime_id`). No user input interpolated. Safe.
  - `CheckNewEpisodes` job: All database writes use Eloquent `create()` with `$fillable` guard. No raw SQL with user input.
  - Frontend `NotificationBell.tsx`: Uses React JSX auto-escaping. Notification content (title, message) rendered as text nodes, not `dangerouslySetInnerHTML`. Safe.

- **OWASP A04 Insecure Design:**
  - `destroyAll` endpoint has no confirmation dialog — acceptable for notifications (low-value data, easily regenerated).
  - All notification routes rate-limited at 60 req/min via middleware group (`throttle:60,1`).

- **OWASP A05 Security Misconfiguration:**
  - No new secrets or env vars introduced.
  - `last_notified_episode` column is nullable with no default — safe additive schema change.

- **Race Condition Prevention:**
  - `CheckNewEpisodes::checkItem` (lines 82-109): DB transaction with `lockForUpdate()` on watchlist row prevents concurrent job runs from creating duplicate notifications. This directly fixes the reported bug.
  - Lock scope is minimal (single row) — low deadlock risk.

- **Data Integrity:**
  - Migration dedup logic (lines 26-38): Keeps newest notification per user+anime pair, deletes older duplicates. Correct ordering by `created_at DESC`.
  - Backfill query (lines 46-64): Read-only from `watch_histories`, write to `watchlists`. No data loss risk.

- **Frontend Security:**
  - `handleDismiss` uses `e.stopPropagation()` — prevents unintended navigation on dismiss click.
  - `router.delete()` calls include CSRF token automatically via Inertia.
  - No client-side secrets or API keys introduced.

## Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High     | 0 |
| Medium   | 0 |
| Low      | 0 |
| **Total** | **0** |
