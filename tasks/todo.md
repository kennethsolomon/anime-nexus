# Anime Nexus — UI Redesign Plan

## Goal

Restyle the entire app from Breeze defaults to a dark "Celestial Fire" theme derived from the Anime Nexus logo. Fix UX issues across all pages. Rename app to "Anime Nexus".

## Constraints

- No new npm dependencies except DOMPurify (for HTML description rendering)
- All existing Pest tests must still pass after changes
- Follow existing conventions: strict types, final classes, Actions pattern
- Tailwind custom colors via config (no raw hex scattered in components)

## Plan

### Phase 1: Foundation (config, fonts, colors, branding)

- [ ] **1.1** Copy logo to `public/images/anime-nexus-logo.png`
- [ ] **1.2** Update `.env` `APP_NAME` to "Anime Nexus"
- [ ] **1.3** Update `app.blade.php`: replace Figtree font with Lexend + DM Sans + JetBrains Mono from Google Fonts
- [ ] **1.4** Update `tailwind.config.js`: add custom color palette (base, surface, input, accent, secondary, etc.) and font families (lexend, dm-sans, jetbrains-mono)
- [ ] **1.5** Update `resources/css/app.css` if needed: set base body colors
- [ ] **1.6** Verify: `npm run build` succeeds, fonts load in browser

### Phase 2: Breeze Shared Components (dark theme)

- [ ] **2.1** Update `TextInput.tsx`: dark bg, dark border, cyan focus ring
- [ ] **2.2** Update `InputLabel.tsx`: light text for dark bg
- [ ] **2.3** Update `PrimaryButton.tsx`: amber bg, dark text
- [ ] **2.4** Update `SecondaryButton.tsx`: dark surface bg, muted border
- [ ] **2.5** Update `DangerButton.tsx`: fix focus ring from indigo to red
- [ ] **2.6** Update `Checkbox.tsx`: cyan accent instead of indigo
- [ ] **2.7** Update `Modal.tsx`: dark panel bg, darker overlay
- [ ] **2.8** Update `Dropdown.tsx`: dark content bg, dark hover, dark link text
- [ ] **2.9** Update `NavLink.tsx` and `ResponsiveNavLink.tsx`: dark theme colors
- [ ] **2.10** Verify: `npx tsc --noEmit` passes

### Phase 3: Layouts (full redesign)

- [ ] **3.1** Create `ApplicationLogo.tsx` replacement: render the Anime Nexus logo image (`/images/anime-nexus-logo.png`) + "Anime" (cyan) + "Nexus" (amber) text side by side
- [ ] **3.2** Redesign `AuthenticatedLayout.tsx`: dark nav bar (bg surface), logo image + brand text, centered search input, icon nav links (Watchlist bookmark, History clock), user dropdown with initials avatar, remove `header` prop, dark mobile menu
- [ ] **3.3** Redesign `GuestLayout.tsx`: dark full-page bg (`#0D1117`), Anime Nexus logo image displayed prominently above the form card, dark card (surface bg, subtle border, rounded-xl)
- [ ] **3.4** Verify: log in/out, check both layouts render correctly

### Phase 4: Backend (watch history enrichment)

- [ ] **4.1** Create migration: add `anime_title` (string, nullable) and `anime_image` (string, nullable) to `watch_histories` table
- [ ] **4.2** Update `WatchHistory` model: add to `$fillable`
- [ ] **4.3** Update `SaveProgressRequest`: add `anime_title` (sometimes, string) and `anime_image` (sometimes, string, url) rules
- [ ] **4.4** Update `SaveWatchProgress` action: accept and save new fields
- [ ] **4.5** Update `Watch.tsx`: send `anime_title` and `anime_image` in progress POST and onEnded POST
- [ ] **4.6** Run migration, verify: `php artisan migrate:status`
- [ ] **4.7** Run tests: `./vendor/bin/pest` — all pass

### Phase 5: Home Page

- [ ] **5.1** Restyle `Home.tsx`: remove inline search bar (moved to nav), dark bg, use Tailwind custom colors, section headers with "See All" links
- [ ] **5.2** Update Continue Watching section: show anime title (not slug), poster thumbnail, visual progress bar
- [ ] **5.3** Add guest nav bar inline (matching auth nav style: same dark bar with logo + search + login/register)
- [ ] **5.4** Verify: page renders for guest and auth users

### Phase 6: Anime Card & Episode List

- [ ] **6.1** Restyle `AnimeCard.tsx`: dark surface bg, cyan type badge, amber rating badge, hover lift + shadow, font updates
- [ ] **6.2** Restyle `EpisodeList.tsx`: dark surface bg, cyan active indicator, dark borders, mono episode numbers
- [ ] **6.3** Verify: cards and list render on Home and AnimeDetail pages

### Phase 7: Anime Detail Page

- [ ] **7.1** Restyle `AnimeDetail.tsx`: dark bg, blurred cover hero, dark badges, cyan genre pills
- [ ] **7.2** Add prominent "Watch EP 1" / "Resume EP X" primary CTA (amber button)
- [ ] **7.3** Replace multi-button watchlist with single dropdown button (shows current status, dropdown reveals options + remove)
- [ ] **7.4** Render HTML descriptions properly (install DOMPurify: `npm install dompurify @types/dompurify`, use `dangerouslySetInnerHTML` with sanitization)
- [ ] **7.5** Add guest nav bar (same as Home)
- [ ] **7.6** Verify: page renders for guest and auth, watchlist dropdown works

### Phase 8: Watch Page

- [ ] **8.1** Restyle `Watch.tsx`: dark bg, use custom colors
- [ ] **8.2** Update VideoPlayer theme to `#5DADE2` (cyan)
- [ ] **8.3** Update Previous/Next buttons: show destination episode number, amber for Next, ghost for Previous
- [ ] **8.4** Add anime title link below player (links back to detail page)
- [ ] **8.5** Add guest nav bar (same as Home)
- [ ] **8.6** Verify: video plays, episode navigation works

### Phase 9: Search Page

- [ ] **9.1** Restyle `Search.tsx`: dark bg, dark search input (if not using nav search), dark pagination buttons
- [ ] **9.2** Add guest nav bar
- [ ] **9.3** Verify: search and genre pages render correctly

### Phase 10: Watchlist Page

- [ ] **10.1** Restyle `Watchlist.tsx`: dark cards (surface bg, subtle borders), dark status tabs (cyan active, input bg inactive), larger poster images
- [ ] **10.2** Style select dropdown dark (bg input, border subtle, text primary)
- [ ] **10.3** Update empty state: add CTA link to browse anime
- [ ] **10.4** Remove `header` prop usage (inline title)
- [ ] **10.5** Verify: page renders, status filter works, CRUD works

### Phase 11: History Page

- [ ] **11.1** Restyle `History.tsx`: dark cards, show anime title + poster image (from enriched data), progress bars, cyan/amber accents
- [ ] **11.2** Update empty state: add CTA link
- [ ] **11.3** Remove `header` prop usage (inline title)
- [ ] **11.4** Verify: page renders, links work

### Phase 12: Auth & Profile Pages

- [ ] **12.1** Restyle `Login.tsx`: dark theme (inherits from GuestLayout which shows the logo above the card), cross-link to Register at bottom, full-width amber submit button, dark "Remember me" text, "Forgot password?" link in cyan
- [ ] **12.2** Restyle `Register.tsx`: same dark treatment with logo via GuestLayout, cross-link to Login at bottom
- [ ] **12.3** Restyle `Profile/Edit.tsx`: dark cards (surface bg), remove `header` prop, inline title
- [ ] **12.4** Restyle `Profile/Partials/*.tsx` (3 files): dark headings, dark description text
- [ ] **12.5** Restyle remaining auth pages (ForgotPassword, ResetPassword, ConfirmPassword, VerifyEmail): dark theme via GuestLayout
- [ ] **12.6** Verify: login/register/profile all render dark, forms submit correctly

### Phase 13: Final Verification

- [ ] **13.1** Run `npx tsc --noEmit` — zero errors
- [ ] **13.2** Run `npm run build` — builds successfully
- [ ] **13.3** Run `./vendor/bin/pest` — all tests pass
- [ ] **13.4** Run `vendor/bin/pint --dirty` — clean
- [ ] **13.5** Run `vendor/bin/phpstan analyse --memory-limit=512M` — 0 errors
- [ ] **13.6** Visual smoke test: navigate all pages (home, search, detail, watch, watchlist, history, login, register, profile) — all consistently dark themed

## Verification Commands

```bash
# TypeScript
npx tsc --noEmit

# Build
npm run build

# Tests
./vendor/bin/pest

# Lint
vendor/bin/pint --dirty
vendor/bin/phpstan analyse --memory-limit=512M

# Migration
php artisan migrate:status
```

## Acceptance Criteria

1. All pages use the Anime Nexus dark theme — no white/light Breeze remnants
2. Logo displayed in nav bar, app name is "Anime Nexus"
3. Color palette matches logo: cyan primary accent, amber secondary/CTA, navy backgrounds
4. Fonts: Lexend headings, DM Sans body, JetBrains Mono for numbers
5. All Breeze components (inputs, buttons, modals, dropdowns) are dark-themed
6. Continue Watching and History show anime title + poster (not raw anime_id)
7. Anime Detail has prominent "Watch" CTA and dropdown watchlist control
8. Watch page Previous/Next show episode numbers
9. All existing tests still pass
10. TypeScript compiles clean
11. Vite builds clean

## Risks / Unknowns

- **Auth tests may break** if test assertions check for specific CSS classes or text like "Dashboard" — may need to update test expectations
- **DOMPurify bundle size** — small risk, library is ~14KB minified, acceptable
- **Profile partials** have hardcoded gray-900/gray-600 text colors from Breeze — need to update all 3 files
