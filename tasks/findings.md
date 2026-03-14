# Anime Nexus — Design Findings

## Problem Statement

Restyle the entire app (formerly "Watch Anime", now "Anime Nexus") from default Breeze light theme to a cohesive dark anime theme based on the logo's color palette. Fix UX issues across all pages.

## Branding

- **App name:** Anime Nexus
- **Logo:** `/public/images/anime-nexus-logo.png` (mascot with blue hair, orange fire swirl, celestial background)
- **Tagline:** "Your Hub for Japanese Animation"

## Color Palette (derived from logo)

| Role | Hex | Tailwind Name |
|---|---|---|
| Deep background | `#0D1117` | `base` |
| Elevated surface | `#161B22` | `surface` |
| Input/card surface | `#1C2333` | `input` |
| Border | `#2A3040` | `subtle` (border) |
| Muted border | `#3D4450` | `muted` (border) |
| Primary accent (cyan) | `#5DADE2` | `accent` |
| Primary hover | `#7EC8E3` | `accent-hover` |
| Secondary accent (amber) | `#E8A317` | `secondary` |
| Secondary hover | `#F0B840` | `secondary-hover` |
| Warm highlight | `#E86A33` | `warm` |
| Text primary | `#E6EDF3` | `primary` (text) |
| Text secondary | `#8B949E` | `secondary` (text) |
| Text muted | `#565E68` | `muted` (text) |
| Danger | `#DA3633` | `danger` |
| Success | `#2EA043` | `success` |

## Color Philosophy

- **Cyan (`#5DADE2`)** = Navigation, info, focus, links, active states
- **Amber (`#E8A317`)** = Actions, CTAs, watch buttons, ratings
- **Red (`#DA3633`)** = Danger/destructive only

## Typography

- Display/Brand: `Lexend` (600, 700)
- Body: `DM Sans` (400, 500, 600)
- Mono (numbers): `JetBrains Mono` (500, 700)
- Load via Google Fonts in `app.blade.php`

## Key Decisions

1. All Breeze components updated to dark theme (TextInput, PrimaryButton, etc.)
2. AuthenticatedLayout fully redesigned — modern dark nav with logo, search, icon nav
3. Remove AuthenticatedLayout `header` prop — titles go inline
4. GuestLayout dark themed
5. Unified nav pattern for guest/auth
6. ArtPlayer theme color: `#5DADE2`
7. Brand: "Anime" in cyan + "Nexus" in amber, Lexend 700

---

## Feature: Drama Content Support (Content Type Switcher)

### Problem Statement

App is primarily for anime but user also wants to watch K-dramas, C-dramas, and J-dramas. Need a mode switcher that changes the entire browsing context between Anime and Drama.

### Approach: Content Type Switcher (Approach A)

A global toggle in the nav bar that switches between "Anime" and "Drama" modes. Each mode has its own home feed, search, and providers. Shared watchlist and history.

### API Discovery (Consumet @ localhost:3000)

**Working providers for dramas:**

| Feature | FlixHQ (`/movies/flixhq/`) | Goku (`/movies/goku/`) |
|---------|---------------------------|----------------------|
| Search | Yes | Yes |
| Info (detail + episodes) | Yes | Yes |
| Trending | Yes | Yes |
| Servers list | Yes | Yes |
| **Streaming (watch)** | **Broken** | **Broken** |

- DramaCool returns empty results — not usable
- ViewAsian, MyFlixer, FMovies — not available on this instance
- **Streaming is broken** on all drama providers. Building UI anyway so it's ready when Consumet is updated.

### API Endpoint Differences

| | Anime (`/anime/`) | Drama (`/movies/`) |
|--|-------------------|-------------------|
| Search | `/anime/{provider}/{query}` | `/movies/{provider}/{query}` |
| Info | `/anime/{provider}/info?id={id}` | `/movies/{provider}/info?id={id}` |
| Trending | `/anime/{provider}/trending` | `/movies/{provider}/trending` |
| Watch | `/anime/{provider}/watch/{episodeId}` | `/movies/{provider}/watch?episodeId={X}&mediaId={Y}` |
| Episode ID format | `slug$ep=1$token=xxx` | Numeric (`1167571`) |
| Has `season` field | No | Yes (1, 2, ...) |
| Has `country` field | No | Yes ("South Korea") |
| Has `casts` field | No | Yes (array) |
| Has `intro`/`outro` | Yes | No |
| Watch requires `mediaId` | No | **Yes** |

### Key Decisions

1. **Content type state**: stored in URL path prefix and localStorage for persistence
2. **Nav switcher**: pill toggle or dropdown in the nav bar — Anime | Drama
3. **Shared components**: AnimeCard, EpisodeList, VideoPlayer are reusable for dramas (just different data shapes)
4. **New type definitions**: `DramaResult`, `DramaInfo` extending or paralleling anime types, with `season` and `casts` fields
5. **Backend**: New `DramaService` or extend `ConsumetService` with `/movies/` methods. Use FlixHQ as primary, Goku as fallback.
6. **Routes**: `/drama` (home), `/drama/search`, `/drama/{id}` (detail), `/drama/{id}/watch` (watch)
7. **Database**: Add `content_type` enum column (`anime`, `drama`) to `watchlists` and `watch_histories` tables (default: `anime`)
8. **Drama providers**: `['flixhq', 'goku']` with fallback pattern same as anime
9. **Seasons**: Drama detail page needs a season selector (anime doesn't have seasons)
10. **Watch endpoint**: Drama streaming needs both `episodeId` AND `mediaId` passed through

### Open Questions

- Streaming broken on all drama providers — will work once Consumet is updated
- May need to filter FlixHQ trending to show only TV Series (it returns movies too)

### Scope

- Nice-to-have feature, not blocking anime functionality
- Build full browse/discovery + watch UI, wire up API calls correctly
- Will just work once Consumet streaming is fixed

---

## Feature Roadmap: Full UX Overhaul (2026-03-15)

### Problem Statement

Anime Nexus is a functional MVP but lacks polish, discoverability, user engagement, and personalization features expected of a modern streaming app. The goal is to implement 16 features across 5 batches to bring it to production quality.

### Hard Constraint

**Mobile-first design.** Every feature must be fully usable on mobile (touch targets, responsive layouts, swipe-friendly). Test at 375px viewport minimum.

### Batch 1: Foundation / Infrastructure

These enable or enhance everything that follows.

| # | Feature | Description |
|---|---------|-------------|
| 1 | Toast Notifications | Global toast system for action feedback ("Added to Watchlist", "Progress Saved", errors). Stack from bottom-right on desktop, bottom-center on mobile. Auto-dismiss 3s. |
| 2 | Skeleton Loading States | Skeleton placeholders for cards, detail pages, player. Pulse animation. Matches card/layout dimensions. |
| 3 | Quality Selector in Player | Expose available quality sources (360p, 720p, 1080p) in ArtPlayer settings menu. Remember user preference in localStorage. |
| 4 | Keyboard Shortcuts in Player | Space=play/pause, Left/Right=seek 5s, Up/Down=volume, F=fullscreen, M=mute. Show shortcut overlay on "?" key. Mobile: no overlay needed (touch controls). |

### Batch 2: Home & Discovery

| # | Feature | Description |
|---|---------|-------------|
| 5 | Hero Banner | Full-width carousel on home page (anime + drama). Backdrop image, title, synopsis excerpt, genre pills, "Watch Now" CTA. Auto-rotate 6s. Swipeable on mobile. |
| 6 | Advanced Search & Filters | Filter bar below search: genre chips (multi-select), type (TV/Movie/ONA/OVA), status (Airing/Completed), year range. Collapsible on mobile (filter icon toggle). Applies to both anime and drama search. |
| 7 | Infinite Scroll / Load More | Replace prev/next pagination with "Load More" button (not infinite scroll — user controls when to load). Show count "Showing X of Y". Works on home grids + search results. |

### Batch 3: User Engagement

| # | Feature | Description |
|---|---------|-------------|
| 8 | Ratings & Reviews | 1-5 star rating + optional text review on detail pages. Requires auth. One review per user per anime/drama. Show average rating + review count. Reviews list below episodes. Migration: `reviews` table (user_id, anime_id, content_type, rating, body, created_at). |
| 9 | Favorites / Quick Access | Heart icon on cards + detail pages. Separate from watchlist. Shows in a "Favorites" section on home page (auth only). Migration: `favorites` table (user_id, anime_id, anime_title, anime_image, content_type). |
| 10 | Dashboard / Stats Page | New `/dashboard` route (auth). Stats: total episodes watched, total hours, genre breakdown (bar chart), completion rate, current streak, most watched. Uses existing watch_histories data. Mobile: single-column card stack. |

### Batch 4: Social & Discovery

| # | Feature | Description |
|---|---------|-------------|
| 11 | Recommendations | "Because you watched X" section on home/detail pages. Source: Consumet API relations/recommendations field if available, otherwise same-genre suggestions from user's watchlist. |
| 12 | Episode Comments | Per-episode comment thread on watch page. Simple: user + text + timestamp. Threaded replies (1 level deep). Migration: `comments` table (user_id, anime_id, episode_id, content_type, body, parent_id, created_at). Mobile: collapsible below player. |
| 13 | Share Links | Share button on detail + watch pages. Copies URL to clipboard (toast confirmation). Open Graph meta tags for rich previews when shared on social media. |

### Batch 5: Polish

| # | Feature | Description |
|---|---------|-------------|
| 14 | New Episode Notifications | Bell icon in nav with unread count. Check for new episodes on anime in user's "Watching" list by comparing episode count on Consumet vs last known count. Migration: `notifications` table. Polling or on-login check. |
| 15 | PWA / Installable | Web app manifest + service worker for offline shell. Cache static assets. "Add to Home Screen" prompt on mobile. App icon from logo. |
| 16 | Dark/Light Theme Toggle | Theme switcher in nav (sun/moon icon). Light theme color palette. Persist in localStorage. Respect `prefers-color-scheme` on first visit. CSS variables for easy theming. |

### Key Decisions

1. **Mobile-first**: All layouts designed for 375px first, scaled up with breakpoints
2. **Toast before features**: Every interactive feature depends on toast feedback
3. **"Load More" over infinite scroll**: More predictable, better for back-button behavior, simpler
4. **Ratings stored locally**: Not from Consumet — user-generated content in our DB
5. **Favorites separate from watchlist**: Different intent — "I love this" vs "I'm tracking this"
6. **Comments 1-level threading**: Keep simple, avoid deep nesting complexity
7. **PWA near last**: Nice-to-have polish, not blocking any other feature
8. **16 separate tasks**: Each feature goes through full workflow cycle independently

### Open Questions

- Hero banner: use Consumet trending data or curate manually? (Trending data = automatic)
- Stats dashboard: use a charting library (Chart.js/Recharts) or pure CSS/Tailwind bars?
- Notifications: real-time (WebSocket) or polling on page load? (Polling simpler, sufficient for MVP)
- Light theme: full redesign or just invert the dark palette? (CSS variables makes this mechanical)

---

## Feature: CheckNewEpisodes — Notification Trigger (2026-03-15)

### Problem Statement

The notification system (bell icon, dropdown, mark-as-read) is built but nothing populates the `episode_notifications` table. Users with anime in their "Watching" list should be notified when new episodes are available.

### Chosen Approach: Queued Check on First Page Load Per Session

**Trigger:** First authenticated page load of each session (not login-specific). Uses `session('notifications_checked')` flag to avoid repeat checks within the same session.

**Mechanism:**
1. Middleware checks `session('notifications_checked')` on authenticated requests
2. If not set, dispatches `CheckNewEpisodes` job to the queue
3. Sets session flag so it doesn't repeat
4. Job runs in background — no page load blocking

**Check Logic (in queued job):**
1. Get user's "Watching" watchlist items (limit 10, most recently updated)
2. For each item, fetch `totalEpisodes` from `ConsumetService::getAnimeInfo()` (uses 24h cache)
3. Compare against `MAX(episode_number)` from `watch_histories` for that anime
4. If `totalEpisodes > maxWatchedEpisode`, create an `EpisodeNotification`
5. Skip if a notification already exists for the same anime (avoid duplicates)

**Key Decisions:**
1. Limit to 10 most recently updated "Watching" items — covers likely candidates without API spam
2. Uses existing Consumet cache (24h) — no extra API calls if cache is warm
3. Queued to background — no page load impact
4. Dedup: won't create duplicate notifications for the same anime
5. Works for both anime and drama content types
