# Security Audit — 2026-03-15

**Scope:** Changed files on branch `fix/navigation-and-proxy-bugs`
**Stack:** Laravel 12 / Inertia + React (TypeScript) / PHP 8.4 / SQLite
**Files audited:** 19

## Critical (must fix before deploy)

None.

## High (fix before production)

None.

## Medium (should fix)

None.

## Low / Informational

None.

## Passed Checks

- **OWASP A01 Broken Access Control:** StreamController proxy is public by design (required for HLS playback). Auth-gated routes properly use `auth` middleware. WatchlistController enforces user ownership at `destroy()` (line 77). Policies and Form Request `authorize()` methods gate all write operations.
- **OWASP A03 Injection (SQL/XSS/Command):** No raw SQL — all queries use Eloquent with parameterized bindings. ConsumetService properly `urlencode()`s user input in URL paths (lines 62, 183). Watch.tsx uses React's auto-escaping — no `dangerouslySetInnerHTML`. No `eval()`, `exec()`, or shell commands.
- **OWASP A04 Insecure Design:** Proxy rate-limited at 120 req/min (`throttle:120,1`). Auth endpoints rate-limited at 60 req/min. Login rate-limited at 5 attempts (LoginRequest `ensureIsNotRateLimited`). ConsumetService retries capped at 2 with 500ms delay.
- **OWASP A05 Security Misconfiguration:** Config uses `env()` exclusively for secrets (config/services.php). No hardcoded credentials in any changed file. CSRF tokens properly included in frontend fetch requests (Watch.tsx:79-85).
- **OWASP A10 SSRF:** StreamController implements multi-layer SSRF protection: scheme allowlist (HTTP/HTTPS only), DNS resolution with private/reserved IP blocking via `FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE`, redundant 127.x/::1 check, and DNS pinning via `CURLOPT_RESOLVE` to prevent rebinding. Empty and unparseable URLs rejected.
- **Data Protection:** No PII logged. Error messages are generic ("Failed to fetch data from source"). Passwords use Laravel's `hashed` cast. User model hides `password` and `remember_token`.
- **Error Handling:** ConsumetService gracefully degrades with stale cache fallback on ConnectionException. CheckNewEpisodes job wraps each item in try/catch. Proxy returns upstream error codes without leaking internal details.
- **Test Coverage:** 99.8% code coverage (217 tests, 856 assertions). Tests cover SSRF blocking, auth enforcement, rate limiting, input validation, model relationships, and all controller paths.
- **Secrets in Tests:** All test passwords are standard fixtures (`'password'`, `'wrong-password'`). No real credentials.

## Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High     | 0 |
| Medium   | 0 |
| Low      | 0 |
| **Total** | **0** |
