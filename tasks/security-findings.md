# Security Audit — 2026-03-15

**Scope:** All files changed in UX overhaul (feat/ux-overhaul branch, merged)
**Stack:** Laravel 12 / Inertia + React (TypeScript) / PHP 8.4 / SQLite
**Files audited:** 67

## Critical (must fix before deploy)

- **[app/Http/Controllers/StreamController.php:82-98]** Open SSRF via proxy endpoint
  **Standard:** OWASP A10 — SSRF (CWE-918)
  **Risk:** `GET /stream/proxy` accepts arbitrary `url` parameter and fetches it server-side with no allowlist. Attackers can scan internal networks, exfiltrate cloud metadata, port-scan. `Access-Control-Allow-Origin: *` makes it exploitable from any origin.
  **Recommendation:** Validate URL against allowlist of known streaming CDN domains. Deny private/internal IP ranges (RFC 1918, loopback, link-local). Consider requiring authentication.

## High

None.

## Medium (should fix)

- **[routes/web.php]** No rate limiting on write endpoints
  **Standard:** OWASP A04 — Insecure Design (CWE-770)
  **Risk:** `POST /comments`, `POST /reviews`, `POST /favorites`, `POST /history`, `POST /watchlist`, and `GET /stream/proxy` have no throttle middleware. Spam flooding and DoS amplification possible.
  **Recommendation:** Apply `throttle` middleware to all write routes and the proxy route.

- **[app/Http/Controllers/CommentController.php:58, ReviewController.php:33]** Inline authorization instead of Policies
  **Standard:** OWASP A01 — Broken Access Control (CWE-863)
  **Risk:** Ownership checks use inline `$user_id !== $user->id` instead of Policies, violating project conventions. Fragile and easy to forget on new endpoints.
  **Recommendation:** Create `CommentPolicy` and `ReviewPolicy` classes. Use `$this->authorize('delete', $comment)`.

## Low / Informational

- **[app/Http/Controllers/CommentController.php:34, FavoriteController.php:41]** Inline `$request->validate()` instead of Form Request classes
  **Recommendation:** Create `StoreCommentRequest` and `ToggleFavoriteRequest` Form Requests per project conventions.

- **[app/Actions/Review/SubmitReview.php:25]** Review body not sanitized with `strip_tags()` (comments are sanitized, reviews are not)
  **Recommendation:** Apply `strip_tags()` to review body for defense in depth.

- **[app/Http/Controllers/CommentController.php:14-27]** Comments index requires auth but returns all users' comments — design inconsistency
  **Recommendation:** Decide if comments are public (move route outside auth) or private.

- **[app/Http/Requests/StoreReviewRequest.php:12]** `authorize()` returns `true` unconditionally
  **Recommendation:** Add meaningful authorization or document that auth middleware is sufficient.

- **[app/Http/Controllers/NotificationController.php:34-41]** Raw `int $id` instead of route model binding
  **Recommendation:** Use `EpisodeNotification $notification` route model binding with policy.

- **[public/sw.js:28-52]** Service worker caches pages without auth awareness — could serve stale authenticated content offline
  **Recommendation:** Exclude authenticated routes from cache fallback or clear cache on logout.

## Passed Checks

- SQL Injection: All queries use Eloquent/query builder with parameterized bindings
- XSS: React auto-escapes, `dangerouslySetInnerHTML` uses DOMPurify, comments use `strip_tags()`
- CSRF: Laravel/Inertia handles automatically via `X-XSRF-TOKEN`
- Mass Assignment: All models use explicit `$fillable` arrays
- Sensitive Data: User model has `$hidden` for password/token
- Database Schema: Proper FK constraints, unique constraints, unsigned types
- Secrets Exposure: No hardcoded keys or credentials found
- Authentication Middleware: All write routes behind `auth` middleware

## Summary

| Severity | Count |
|----------|-------|
| Critical | 1 |
| High     | 0 |
| Medium   | 2 |
| Low      | 6 |
| **Total** | **9** |
