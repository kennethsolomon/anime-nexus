<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

final readonly class ConsumetService
{
    private const array PROVIDERS = ['animekai', 'hianime', 'gogoanime'];

    private const int CACHE_METADATA = 86400;    // 24 hours

    private const int CACHE_EPISODES = 21600;    // 6 hours

    private const int CACHE_STREAMING = 1800;    // 30 minutes

    public function __construct(
        private string $baseUrl,
    ) {}

    /**
     * Search anime by query string.
     *
     * @return array<string, mixed>
     */
    public function search(string $query, int $page = 1): array
    {
        $cacheKey = "consumet:search:{$query}:{$page}";

        return $this->cached($cacheKey, self::CACHE_METADATA, fn (): array => $this->requestWithFallback(
            fn (string $provider): array => $this->get("/anime/{$provider}/{$query}", ['page' => $page]),
        ));
    }

    /**
     * Get anime detail/info by ID.
     *
     * @return array<string, mixed>
     */
    public function getAnimeInfo(string $animeId, string $provider = 'animekai'): array
    {
        $cacheKey = "consumet:info:{$provider}:{$animeId}";

        return $this->cached($cacheKey, self::CACHE_METADATA, fn (): array => $this->get("/anime/{$provider}/info", ['id' => $animeId]));
    }

    /**
     * Get streaming links for an episode.
     *
     * @return array<string, mixed>
     */
    public function getStreamingLinks(string $episodeId, string $provider = 'animekai'): array
    {
        $cacheKey = "consumet:stream:{$provider}:{$episodeId}";
        $encodedId = urlencode($episodeId);

        return $this->cached($cacheKey, self::CACHE_STREAMING, fn (): array => $this->get("/anime/{$provider}/watch/{$encodedId}"));
    }

    /**
     * Get trending anime.
     *
     * @return array<string, mixed>
     */
    public function getTrending(int $page = 1, int $perPage = 20): array
    {
        $cacheKey = "consumet:trending:{$page}:{$perPage}";

        return $this->cached($cacheKey, self::CACHE_METADATA, fn (): array => $this->get('/anime/animekai/trending', ['page' => $page, 'perPage' => $perPage]));
    }

    /**
     * Get popular anime.
     *
     * @return array<string, mixed>
     */
    public function getPopular(int $page = 1, int $perPage = 20): array
    {
        $cacheKey = "consumet:popular:{$page}:{$perPage}";

        return $this->cached($cacheKey, self::CACHE_METADATA, fn (): array => $this->get('/anime/animekai/popular', ['page' => $page, 'perPage' => $perPage]));
    }

    /**
     * Get recent episodes.
     *
     * @return array<string, mixed>
     */
    public function getRecentEpisodes(int $page = 1, int $perPage = 20): array
    {
        $cacheKey = "consumet:recent:{$page}:{$perPage}";

        return $this->cached($cacheKey, self::CACHE_EPISODES, fn (): array => $this->get('/anime/animekai/recent-episodes', ['page' => $page, 'perPage' => $perPage]));
    }

    /**
     * Get anime by genre.
     *
     * @return array<string, mixed>
     */
    public function getByGenre(string $genre, int $page = 1): array
    {
        $cacheKey = "consumet:genre:{$genre}:{$page}";

        return $this->cached($cacheKey, self::CACHE_METADATA, fn (): array => $this->get('/anime/animekai/genre', ['genre' => $genre, 'page' => $page]));
    }

    /**
     * Get fresh streaming links bypassing cache (for retry).
     *
     * @return array<string, mixed>
     */
    public function getFreshStreamingLinks(string $episodeId, string $provider = 'animekai'): array
    {
        $cacheKey = "consumet:stream:{$provider}:{$episodeId}";
        Cache::forget($cacheKey);

        return $this->getStreamingLinks($episodeId, $provider);
    }

    /**
     * Make a GET request to the Consumet API.
     *
     * @param  array<string, mixed>  $params
     * @return array<string, mixed>
     */
    private function get(string $path, array $params = []): array
    {
        $response = Http::baseUrl($this->baseUrl)
            ->timeout(15)
            ->retry(2, 500, throw: false)
            ->get($path, $params);

        if ($response->failed()) {
            return ['error' => true, 'message' => 'Failed to fetch data from source'];
        }

        /** @var array<string, mixed> $data */
        $data = $response->json() ?? [];

        return $data;
    }

    /**
     * Try request across providers, return first success.
     *
     * @param  callable(string): array<string, mixed>  $callback
     * @return array<string, mixed>
     */
    private function requestWithFallback(callable $callback): array
    {
        foreach (self::PROVIDERS as $provider) {
            try {
                $result = $callback($provider);

                if (! isset($result['error'])) {
                    return $result;
                }
            } catch (ConnectionException $e) {
                Log::warning("Consumet provider {$provider} failed: {$e->getMessage()}");

                continue;
            }
        }

        return ['error' => true, 'message' => 'All anime sources are currently unavailable'];
    }

    /**
     * Cache wrapper with stale fallback.
     *
     * @param  \Closure(): array<string, mixed>  $callback
     * @return array<string, mixed>
     */
    private function cached(string $key, int $ttl, \Closure $callback): array
    {
        /** @var array<string, mixed>|null $cached */
        $cached = Cache::get($key);

        try {
            /** @var array<string, mixed> $result */
            $result = Cache::remember($key, $ttl, $callback);

            return $result;
        } catch (ConnectionException) {
            if ($cached !== null) {
                Log::info("Serving stale cache for {$key}");

                return $cached;
            }

            return ['error' => true, 'message' => 'Source unavailable and no cached data'];
        }
    }
}
