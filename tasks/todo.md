# Anime Nexus — Full UX Overhaul

## Goal

Implement 16 features across 5 batches to bring Anime Nexus from MVP to production quality. All features must be mobile-first (375px minimum viewport). Each task goes through the full workflow cycle independently.

## Constraints

- Mobile-first: design for 375px, scale up with breakpoints
- Follow existing conventions: strict types, final classes, Actions pattern, dark theme palette
- All existing tests (68) must continue to pass
- No new npm dependencies unless absolutely necessary (prefer Tailwind/native solutions)
- Each feature = 1 branch, 1 workflow cycle, 1 PR

---

## Batch 1: Foundation / Infrastructure

### Task 1: Toast Notifications
- [x] 1.1 Create `ToastContext.tsx` — React context with `addToast(message, type)` method
  - Types: `success`, `error`, `info`
  - State: array of `{ id, message, type, timestamp }`
  - Auto-dismiss after 3s, manual dismiss on click
- [x] 1.2 Create `ToastContainer.tsx` — renders toast stack
  - Desktop: bottom-right, stacked upward
  - Mobile (< 640px): bottom-center, full-width with padding
  - Slide-in animation (translate-y), fade-out on dismiss
  - Max 3 visible at once (oldest auto-dismissed)
- [x] 1.3 Create `Toast.tsx` — individual toast component
  - Icon per type (checkmark/x/info), message text, close button
  - Colors: success=green, error=red, info=accent (cyan)
  - Touch: swipe-right to dismiss on mobile
- [x] 1.4 Wrap app root in `ToastProvider` (in `app.tsx` or layout)
- [x] 1.5 Add `useToast()` hook — returns `{ success, error, info }` shorthand methods
- [x] 1.6 Wire toasts into existing actions:
  - Watchlist: add/update/remove → success toast
  - Progress save: completed episode → success toast
  - API errors: → error toast
  - Test on mobile (375px) and desktop
- [x] 1.7 Tests: unit test for ToastContext (add, auto-dismiss, max limit)
- **Verify:** `npx tsc --noEmit` clean, `npm run build` success, `./vendor/bin/pest` all pass

### Task 2: Skeleton Loading States
- [x] 2.1 Create `SkeletonCard.tsx` — matches AnimeCard dimensions (aspect-[3/4] image + text)
  - Pulse animation (`animate-pulse bg-surface`)
  - Responsive: same grid breakpoints as AnimeCard
- [x] 2.2 Create `SkeletonDetail.tsx` — matches AnimeDetail/DramaDetail layout
  - Poster placeholder + text lines + badge placeholders + episode list skeleton
  - Mobile: stacked, Desktop: side-by-side
- [x] 2.3 Create `SkeletonPlayer.tsx` — matches VideoPlayer + episode sidebar
  - 16:9 aspect ratio placeholder + episode list skeleton
- [x] 2.4 Create `SkeletonGrid.tsx` — renders N SkeletonCards in grid layout
  - Props: `count` (default 12), matches home/search grid breakpoints
- [x] 2.5 Integrate into pages with Inertia deferred props or loading states:
  - Home.tsx, DramaHome.tsx → SkeletonGrid while trending loads
  - AnimeDetail.tsx, DramaDetail.tsx → SkeletonDetail
  - Search.tsx, DramaSearch.tsx → SkeletonGrid
  - Watch.tsx, DramaWatch.tsx → SkeletonPlayer
- [x] 2.6 Test at 375px — skeletons must not overflow or misalign
- **Verify:** `npx tsc --noEmit` clean, `npm run build` success, visual check at 375px

### Task 3: Quality Selector in Player
- [x] 3.1 Parse `sources` array in VideoPlayer — extract quality labels (360p, 720p, 1080p, default)
- [x] 3.2 Add quality selector to ArtPlayer settings panel (use ArtPlayer's `setting` plugin)
  - List available qualities with radio-style selection
  - Default: highest available or user preference from localStorage
- [x] 3.3 Persist selected quality preference in `localStorage('preferred-quality')`
- [x] 3.4 On quality switch: switch HLS source without restarting playback position
- [x] 3.5 Mobile: quality selector accessible via ArtPlayer's mobile settings gear icon
- **Verify:** `npx tsc --noEmit` clean, `npm run build` success, manual test with multi-quality stream

### Task 4: Keyboard Shortcuts in Player
- [x] 4.1 Add keyboard event listener in VideoPlayer component (only when player is focused/active)
  - Space / K = play/pause
  - Left arrow = seek -5s
  - Right arrow = seek +5s
  - Up arrow = volume +10%
  - Down arrow = volume -10%
  - F = toggle fullscreen
  - M = toggle mute
  - `>` = increase playback rate
  - `<` = decrease playback rate
- [x] 4.2 Create `ShortcutOverlay.tsx` — shows shortcut cheat sheet on `?` key press
  - Semi-transparent overlay with shortcut list
  - Press `?` again or Escape to dismiss
  - Desktop only — hide on touch devices
- [x] 4.3 Prevent default browser behavior for handled keys (Space scrolling, etc.)
- [x] 4.4 Do NOT register shortcuts when an input/textarea is focused
- **Verify:** `npx tsc --noEmit` clean, `npm run build` success, manual keyboard test

---

## Batch 2: Home & Discovery

### Task 5: Hero Banner
- [x] 5.1 Create `HeroBanner.tsx` — full-width carousel component
  - Data source: top 5 from trending (already available as props on Home/DramaHome)
  - Each slide: backdrop/cover image (full-width, 60vh max on desktop, 40vh on mobile), gradient overlay
  - Content: title (Lexend 700), 2-line synopsis, genre pills (max 3), "Watch Now" CTA (amber)
  - Navigation: dot indicators (bottom center), left/right arrows (desktop only)
- [x] 5.2 Auto-rotate every 6s, pause on hover (desktop) or touch (mobile)
- [x] 5.3 Mobile: swipe left/right to navigate (touch events)
- [x] 5.4 Integrate into Home.tsx (above trending grid) and DramaHome.tsx
- [x] 5.5 Fallback: if no cover image, use poster image with blur + scale background
- [x] 5.6 Ensure no layout shift — fixed height container
- **Verify:** `npx tsc --noEmit` clean, `npm run build` success, visual test at 375px and 1440px

### Task 6: Advanced Search & Filters
- [x] 6.1 Create `SearchFilters.tsx` — filter bar component
  - Genre chips: multi-select toggle pills (Action, Romance, Comedy, Fantasy, etc.)
  - Type filter: TV, Movie, ONA, OVA, Special (single-select or multi-select)
  - Status filter: Airing, Completed, Upcoming (single-select)
  - Mobile: collapsed behind filter icon button, expands as slide-down panel
  - Desktop: horizontal bar below search input
- [x] 6.2 Update `AnimeController@search` — accept optional `genre`, `type`, `status` query params
  - Pass filters through to ConsumetService (if Consumet supports) or filter client-side
- [x] 6.3 Update `DramaController@search` — same filter support
- [x] 6.4 Update Search.tsx and DramaSearch.tsx — integrate SearchFilters, pass filters as query params
- [x] 6.5 URL state: filters persisted in URL query string (shareable filtered searches)
- [x] 6.6 "Clear filters" button when any filter is active
- [x] 6.7 Tests: feature test for search with filter params
- **Verify:** `npx tsc --noEmit` clean, `npm run build` success, `./vendor/bin/pest` all pass

### Task 7: Load More Pagination
- [x] 7.1 Create `LoadMoreButton.tsx` — "Load More" button with loading spinner
  - Shows count: "Showing X of Y results" (if total available from API)
  - Disabled + spinner while loading
  - Full-width on mobile, centered on desktop
- [x] 7.2 Update Home.tsx — trending/popular/recent sections get "Load More" instead of showing all at once
  - Initial: show first page, append on click
- [x] 7.3 Update Search.tsx / DramaSearch.tsx — replace prev/next with "Load More"
  - Append results to existing list, don't replace
  - Track `currentPage` and `hasNextPage` from API response
- [x] 7.4 Update DramaHome.tsx — same pattern
- [x] 7.5 Preserve scroll position on load more (no jump to top)
- [x] 7.6 Mobile: button has 48px min touch target
- **Verify:** `npx tsc --noEmit` clean, `npm run build` success, test pagination flow

---

## Batch 3: User Engagement

### Task 8: Ratings & Reviews
- [x] 8.1 Migration: create `reviews` table
  - `id`, `user_id` (FK), `anime_id` (string), `content_type` (string, default 'anime'), `rating` (tinyint 1-5), `body` (text, nullable), `created_at`, `updated_at`
  - Unique constraint: `(user_id, anime_id, content_type)`
- [x] 8.2 Create `Review` model — fillable, belongs to User, casts
- [x] 8.3 Create `app/Actions/Review/` — `SubmitReview`
- [x] 8.4 Create `ReviewController` — store, destroy
- [x] 8.5 Create `StoreReviewRequest` — validation (rating required 1-5, body optional max 1000 chars)
- [x] 8.6 Add routes: `POST /reviews`, `DELETE /reviews/{review}` (auth)
- [x] 8.7 Create `StarRating.tsx` — interactive 1-5 star component (click to rate)
  - Amber filled stars, outline for empty
  - Touch-friendly: 44px star targets on mobile
- [x] 8.8 Create `ReviewSection.tsx` — star rating input + text area + submit, list of reviews below
  - Shows average rating + count at top, user avatar initials, time ago
  - Auth only for submitting, visible to all
  - Mobile: full-width cards, single column
- [x] 8.9 Integrate into AnimeDetail.tsx and DramaDetail.tsx (below episodes)
- [x] 8.10 Pass reviews + user's existing review as Inertia props from controller
- [x] 8.11 Toast on submit/delete
- [x] 8.12 Tests: feature tests for review CRUD, authorization (can't delete others' reviews)
- **Verify:** `php artisan migrate` success, `npx tsc --noEmit` clean, `./vendor/bin/pest` all pass

### Task 9: Favorites / Quick Access
- [x] 9.1 Migration: create `favorites` table
  - `id`, `user_id` (FK), `anime_id` (string), `anime_title` (string), `anime_image` (string, nullable), `content_type` (string, default 'anime'), `created_at`
  - Unique constraint: `(user_id, anime_id, content_type)`
- [x] 9.2 Create `Favorite` model — fillable, belongs to User
- [x] 9.3 Create `FavoriteController` — toggle (POST), index with content type filter
- [x] 9.4 Add routes: `POST /favorites` (toggle), `GET /favorites` (list) — auth
- [x] 9.5 Create `FavoriteButton.tsx` — heart icon, filled when favorited, outline when not
  - Toggle on click with optimistic update
  - Toast: "Added to Favorites" / "Removed from Favorites"
  - 44px touch target on mobile
- [x] 9.6 Add FavoriteButton to AnimeDetail.tsx and DramaDetail.tsx (next to watchlist dropdown)
- [x] 9.7 Create Favorites page (`/favorites`) — grid of favorited items with content type tabs
- [x] 9.8 Pass `isFavorited` boolean as Inertia prop on detail pages
- [x] 9.9 Add Favorites link to AuthenticatedLayout nav (heart icon + mobile menu)
- [x] 9.10 Tests: feature tests for toggle, list, authorization
- **Verify:** `php artisan migrate` success, `npx tsc --noEmit` clean, `./vendor/bin/pest` all pass

### Task 10: Dashboard / Stats Page
- [x] 10.1 Create `app/Actions/Stats/GetUserStats.php` — aggregates from watch_histories
- [x] 10.2 Create `DashboardController@index` — calls GetUserStats, renders Dashboard page
- [x] 10.3 Add route: `GET /dashboard` (auth)
- [x] 10.4 Create `Dashboard.tsx` page with StatCard component inline
  - Stat cards: episodes watched, watch time, completion rate, current streak
  - Content breakdown: anime vs drama bar chart (pure Tailwind)
  - Most watched: top 5 with poster, title, episode count bars
  - Mobile: 2-col stat cards, single-column charts
- [x] 10.5 Add Dashboard link to nav (chart icon) + mobile menu
- [x] 10.6 Tests: feature test for dashboard route
- **Verify:** `npx tsc --noEmit` clean, `npm run build` success, `./vendor/bin/pest` all pass

---

## Batch 4: Social & Discovery

### Task 11: Recommendations
- [x] 11.1 Use Consumet API `recommendations`/`relations` from info response if available
- [x] 11.2 Create `RecommendationSection.tsx` — horizontal scroll row (10 items max)
  - Native swipe on mobile, scroll on desktop
  - Hides if no items
- [x] 11.3 Integrate into AnimeDetail.tsx (pass recommendations from controller)
- [x] 11.4 Updated AnimeController to pass recommendations from API response
- **Verify:** `npx tsc --noEmit` clean, `npm run build` success

### Task 12: Episode Comments
- [x] 12.1 Migration: create `comments` table (user_id, anime_id, episode_id, content_type, body, parent_id)
- [x] 12.2 Create `Comment` model with replies() self-referencing relation
- [x] 12.3 Create `CommentController` — index (JSON), store, destroy with auth
- [x] 12.4 Add routes: GET/POST /comments, DELETE /comments/{comment} (auth)
- [x] 12.5 Create `CommentSection.tsx` — collapsible, comment input, threaded replies (1 level)
  - Fetches comments via JSON API, 44px touch targets, XSS sanitized (strip_tags)
- [x] 12.6 Integrate into Watch.tsx and DramaWatch.tsx
- [x] 12.7 Toast on post/delete
- **Verify:** `php artisan migrate` success, `npx tsc --noEmit` clean, `./vendor/bin/pest` all pass

### Task 13: Share Links
- [x] 13.1 Create `ShareButton.tsx` — share icon button
  - Native share API on mobile, clipboard fallback on desktop
  - Toast: "Link copied to clipboard"
  - 44px touch target
- [x] 13.2 Add ShareButton to AnimeDetail.tsx and DramaDetail.tsx (next to favorite)
  - Available for both auth and guest users
- **Verify:** `npx tsc --noEmit` clean, `npm run build` success

---

## Batch 5: Polish

### Task 14: New Episode Notifications
- [x] 14.1 Migration: `create_notifications_table` → `episode_notifications` table
- [x] 14.2 Create `EpisodeNotification` model
- [x] 14.3 Create `NotificationController` — index (JSON), markRead, markAllRead
- [x] 14.4 Add routes: GET /notifications, PATCH /notifications/{id}/read, POST /notifications/read-all
- [x] 14.5 Create `NotificationBell.tsx` — bell icon with unread badge, dropdown, mark as read on click
- [x] 14.6 Add bell to AuthenticatedLayout nav
- **Verify:** `php artisan migrate` success, `npx tsc --noEmit` clean, `./vendor/bin/pest` all pass

### Task 15: PWA / Installable
- [x] 15.1 Create `public/manifest.json` — app name, icons, theme color, standalone display
- [x] 15.2 Add manifest link + meta tags + apple-touch-icon to `app.blade.php`
- [x] 15.3 Create `public/sw.js` — cache-first for build assets, network-first for pages
- [x] 15.4 Register service worker in `app.blade.php`
- **Verify:** Lighthouse PWA audit passes, `npm run build` success

### Task 16: Dark/Light Theme Toggle
- [x] 16.1 Refactored color palette to CSS custom properties in `app.css`
  - Dark: `--color-base: #0D1117`, etc.
  - Light: `.light` class overrides all themed colors
- [x] 16.2 Updated `tailwind.config.js` to reference CSS variables
- [x] 16.3 Created `ThemeToggle.tsx` — sun/moon icon, localStorage persistence, prefers-color-scheme
- [x] 16.4 Added ThemeToggle to AuthenticatedLayout nav
- [x] 16.5 Added flash-prevention script to `app.blade.php` (applies theme before first paint)
- [x] 16.6 150ms transition on background-color and color for smooth switching
- **Verify:** `npx tsc --noEmit` clean, `npm run build` success, visual test both themes

---

## Verification Commands

| Command | Expected |
|---------|----------|
| `npx tsc --noEmit` | No errors |
| `npm run build` | Success |
| `./vendor/bin/pest` | All tests pass (68+ as features add tests) |
| `vendor/bin/pint --dirty` | Clean |
| `vendor/bin/phpstan analyse` | No new errors |
| `vendor/bin/rector --dry-run` | No suggestions |

## Acceptance Criteria

1. All 16 features implemented and passing tests
2. Every feature works at 375px mobile viewport — no overflow, no tiny touch targets
3. Toast notifications provide feedback for all user actions
4. Skeleton states shown during all page loads
5. Video player has quality selector and keyboard shortcuts
6. Hero banner carousel on home pages with swipe support
7. Search has filterable genre/type/status chips
8. "Load More" replaces prev/next pagination
9. Users can rate, review, and favorite anime/drama
10. Dashboard shows user watching stats
11. Recommendations appear on home and detail pages
12. Episode comments with 1-level threading
13. Share button with native share API + OG tags
14. Notification bell for new episodes
15. App installable as PWA
16. Dark/light theme toggle with persistence
17. All existing functionality unchanged (regression-free)

## Risks / Unknowns

- **Consumet API limits**: genre/type/status filters may not be supported by all providers — may need client-side filtering fallback
- **Genre tracking for stats**: watch_histories doesn't store genre info — may need to add a `genres` column or look up from cached anime detail
- **Recommendations**: depends on Consumet API having a relations/recommendations field — needs exploration step
- **PWA service worker**: aggressive caching could serve stale content — use network-first for dynamic data
- **CSS variable refactor**: Tailwind v4 may handle dark mode differently — investigate before implementing theme toggle
- **Comment moderation**: no admin panel — for now, users can only delete their own comments
