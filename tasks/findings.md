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
