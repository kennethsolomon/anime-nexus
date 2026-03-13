# Watch Anime

Personal anime streaming website built with Laravel 12, React 19, Inertia.js, and TypeScript. Uses the Consumet API for anime content.

## Prerequisites

- PHP 8.4+
- Composer
- Node.js 22+
- Docker (for Consumet API)

## Setup

```bash
# Install dependencies
composer install
npm install

# Environment
cp .env.example .env
php artisan key:generate
```

Add to your `.env`:

```
CONSUMET_API_URL=http://localhost:3000
```

```bash
# Database
php artisan migrate

# Start Consumet API
docker compose up -d

# Start dev server
npm run dev
# In another terminal:
php artisan serve
```

Visit `http://localhost:8000`.

## Stack

- **Backend:** Laravel 12, PHP 8.4
- **Frontend:** React 19, TypeScript, Tailwind CSS
- **Bridge:** Inertia.js
- **Player:** ArtPlayer + hls.js
- **Content:** Consumet API (self-hosted via Docker)
- **Database:** SQLite
- **Testing:** Pest, PHPStan (level 9), Pint, Rector

## Development

```bash
# Lint
vendor/bin/pint
vendor/bin/phpstan analyse --memory-limit=512M
vendor/bin/rector --dry-run

# Tests
./vendor/bin/pest
```

## Features

- Browse trending, popular, and recently updated anime
- Search anime by title or genre
- Stream episodes with HLS video player
- Track watch progress (auto-saves every 30s, resumes on reload)
- Manage watchlist (watching, plan to watch, completed, dropped)
- User authentication (register, login, logout)

## License

MIT
