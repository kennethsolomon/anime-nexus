# Security Audit — 2026-03-15 (Re-scan after fixes)

**Scope:** Full project scan (post-fix verification)
**Stack:** Laravel 12 / Inertia + React (TypeScript) / PHP 8.4 / SQLite
**Files audited:** 67

## Critical (must fix before deploy)

None.

## High (fix before production)

None.

## Medium (should fix)

None.

## Low / Informational

None.

## Prior Findings — All Resolved

| # | Prior Finding | Resolution |
|---|---------------|------------|
| 1 | SSRF via open proxy (Critical) | `isAllowedProxyUrl()` validates URL scheme, blocks private/loopback IPs, enforces streaming CDN domain allowlist |
| 2 | No rate limiting (Medium) | `throttle:120,1` on proxy route, `throttle:60,1` on all authenticated routes |
| 3 | Inline authorization (Medium) | `CommentPolicy`, `ReviewPolicy`, `EpisodeNotificationPolicy` created; `AuthorizesRequests` trait added to base Controller |
| 4 | Inline validation (Low) | `StoreCommentRequest` and `ToggleFavoriteRequest` Form Request classes created |
| 5 | Review body unsanitized (Low) | `strip_tags()` applied in `SubmitReview::handle()` |
| 6 | Comments auth inconsistency (Low) | Kept behind auth — comments are user-generated content, auth required is intentional |
| 7 | StoreReviewRequest authorize() (Low) | Auth middleware provides sufficient authorization for review creation |
| 8 | Raw int ID for notifications (Low) | Route model binding with `EpisodeNotification $episodeNotification` + `EpisodeNotificationPolicy` |
| 9 | SW caches auth pages (Low) | `AUTH_PATHS` array excludes auth-gated routes from service worker cache fallback |

## Passed Checks

- **OWASP A01 Broken Access Control:** All delete/update operations use Policies via `$this->authorize()`. Route model binding prevents IDOR. All write routes behind `auth` middleware.
- **OWASP A02 Cryptographic Failures:** Passwords hashed via Laravel's `hashed` cast. No plaintext secrets in code.
- **OWASP A03 Injection:** All DB queries use Eloquent/query builder (parameterized). React auto-escapes JSX text. `dangerouslySetInnerHTML` uses DOMPurify. Comment and review bodies sanitized with `strip_tags()`.
- **OWASP A04 Insecure Design:** Rate limiting on proxy (120/min) and all auth routes (60/min). Form Request validation on all write endpoints.
- **OWASP A05 Security Misconfiguration:** No verbose errors exposed. `.env` in `.gitignore`. Debug mode controlled by env.
- **OWASP A06 Vulnerable Components:** Lock files committed. No `*` version ranges.
- **OWASP A07 Auth Failures:** Laravel Breeze handles auth with bcrypt hashing and CSRF protection.
- **OWASP A08 Data Integrity Failures:** CSRF tokens via Inertia's `X-XSRF-TOKEN` cookie.
- **OWASP A09 Logging Failures:** ConsumetService logs API failures via `Log::warning()`.
- **OWASP A10 SSRF:** Proxy endpoint validates URLs against streaming CDN allowlist and blocks private/reserved/loopback IPs.
- **Mass Assignment:** All models use explicit `$fillable` arrays.
- **Sensitive Data:** User model has `$hidden` for password/remember_token.
- **Database Schema:** FK constraints with cascadeOnDelete, unique constraints, unsigned types.
- **Service Worker:** Auth-gated paths excluded from cache fallback.

## Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High     | 0 |
| Medium   | 0 |
| Low      | 0 |
| **Total** | **0** |
