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

## UX Fixes Required

1. **Home:** Continue Watching needs anime title + poster (needs backend: add anime_title/anime_image to watch_histories)
2. **Anime Detail:** Add prominent "Watch EP 1" / "Resume EP X" CTA; collapse watchlist into dropdown
3. **Watch:** Previous/Next show destination ep number; add link back to detail page
4. **Watchlist:** Full dark theme; larger posters; styled select; empty state CTA
5. **History:** Show anime title + poster (needs backend migration); progress bars; dark theme
6. **Auth pages:** Full dark treatment, brand instead of Laravel logo
7. **Profile:** Dark cards, dark inputs, dark modal

## Backend Changes Required

- Migration: add `anime_title` (string) and `anime_image` (string, nullable) to `watch_histories`
- Update WatchHistory model fillable + SaveProgressRequest rules
- Update HistoryController/SaveWatchProgress to accept new fields
- Update Watch.tsx to send anime_title/anime_image with progress saves

## Open Questions

- None
