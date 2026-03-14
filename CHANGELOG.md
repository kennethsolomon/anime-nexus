# Changelog

All notable changes to Anime Nexus will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- **Toast notifications** — global feedback for watchlist, progress, and error actions with swipe-to-dismiss on mobile
- **Skeleton loading states** — pulse placeholders for cards, detail pages, and player during page transitions
- **Video quality selector** — HLS level switching via hls.js with localStorage persistence
- **Keyboard shortcuts** — space/arrows/F/M for player control, `?` for shortcut overlay
- **Hero banner** — full-width carousel on home pages with blurred poster backdrop, auto-rotate, swipe
- **Search filters** — type filter chips (TV/Movie/ONA/OVA) and genre navigation, collapsible on mobile
- **Load More pagination** — replaces prev/next with accumulated results, preserves scroll position
- **Ratings & reviews** — 1-5 star rating + text reviews on detail pages with average display
- **Favorites** — heart icon with optimistic toggle, dedicated Favorites page with content type tabs
- **Stats dashboard** — episodes watched, watch time, completion rate, streak, most watched
- **Recommendations** — horizontal scroll section using Consumet API relations data
- **Episode comments** — threaded comments (1-level) on watch pages, XSS sanitized
- **Share links** — native share API on mobile, clipboard fallback on desktop
- **Notification bell** — unread count badge with dropdown in nav
- **New episode detection** — queued job checks "Watching" list for new episodes on first page load per session
- **PWA support** — web app manifest + service worker for installability
- **Dark/light theme toggle** — CSS custom properties with localStorage persistence
- **JS test infrastructure** — Vitest + React Testing Library (8 toast unit tests)

### Changed
- Refactored color palette to CSS custom properties for theme switching
- Updated tailwind.config.js to use CSS variable references
- Video player now properly destroys HLS instance on cleanup
- Consolidated dashboard stats queries (6+ queries to 2) with 5-minute user cache
- Search pagination uses stable dependency key to prevent redundant re-renders

### Security
- Stream proxy: URL allowlist + private IP blocking + DNS pinning via CURLOPT_RESOLVE
- Rate limiting: 120/min on proxy, 60/min on all authenticated routes
- Authorization policies for Comment, Review, and EpisodeNotification models
- Form Requests for all write endpoints (StoreComment, ToggleFavorite, StoreReview)
- XSS sanitization via strip_tags() on review and comment bodies
- Service worker excludes auth-gated routes from cache fallback
