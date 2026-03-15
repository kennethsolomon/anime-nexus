<?php

declare(strict_types=1);

use App\Services\ConsumetService;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

beforeEach(function (): void {
    Cache::flush();
});

// --- search ---

test('search returns results from first successful provider', function (): void {
    Http::fake([
        '*/anime/animekai/*' => Http::response(['results' => [['id' => '1', 'title' => 'Naruto']]]),
    ]);

    $service = new ConsumetService('http://localhost:3000');
    $result = $service->search('naruto');

    expect($result['results'])->toHaveCount(1)
        ->and($result['results'][0]['title'])->toBe('Naruto');
});

// --- getAnimeInfo ---

test('getAnimeInfo returns anime detail', function (): void {
    Http::fake([
        '*/anime/animekai/info*' => Http::response(['id' => 'naruto', 'title' => 'Naruto']),
    ]);

    $service = new ConsumetService('http://localhost:3000');
    $result = $service->getAnimeInfo('naruto');

    expect($result['title'])->toBe('Naruto');
});

// --- getStreamingLinks ---

test('getStreamingLinks returns streaming data', function (): void {
    Http::fake([
        '*/anime/animekai/watch/*' => Http::response(['sources' => [['url' => 'https://example.com/stream.m3u8']]]),
    ]);

    $service = new ConsumetService('http://localhost:3000');
    $result = $service->getStreamingLinks('episode-1');

    expect($result['sources'])->toHaveCount(1);
});

// --- getTrending ---

test('getTrending returns trending anime', function (): void {
    Http::fake([
        '*/anime/animekai/trending*' => Http::response(['results' => [['id' => '1']]]),
    ]);

    $service = new ConsumetService('http://localhost:3000');
    $result = $service->getTrending();

    expect($result['results'])->toHaveCount(1);
});

// --- getPopular ---

test('getPopular returns popular anime', function (): void {
    Http::fake([
        '*/anime/animekai/popular*' => Http::response(['results' => [['id' => '1']]]),
    ]);

    $service = new ConsumetService('http://localhost:3000');
    $result = $service->getPopular();

    expect($result['results'])->toHaveCount(1);
});

// --- getRecentEpisodes ---

test('getRecentEpisodes returns recent episodes', function (): void {
    Http::fake([
        '*/anime/animekai/recent-episodes*' => Http::response(['results' => [['id' => '1']]]),
    ]);

    $service = new ConsumetService('http://localhost:3000');
    $result = $service->getRecentEpisodes();

    expect($result['results'])->toHaveCount(1);
});

// --- getByGenre ---

test('getByGenre returns anime by genre', function (): void {
    Http::fake([
        '*/anime/animekai/genre*' => Http::response(['results' => [['id' => '1']]]),
    ]);

    $service = new ConsumetService('http://localhost:3000');
    $result = $service->getByGenre('action');

    expect($result['results'])->toHaveCount(1);
});

// --- searchDrama ---

test('searchDrama returns results from first successful drama provider', function (): void {
    Http::fake([
        '*/movies/flixhq/*' => Http::response(['results' => [['id' => 'd1', 'title' => 'Crash Landing']]]),
    ]);

    $service = new ConsumetService('http://localhost:3000');
    $result = $service->searchDrama('crash landing');

    expect($result['results'])->toHaveCount(1);
});

// --- getDramaInfo ---

test('getDramaInfo returns drama detail', function (): void {
    Http::fake([
        '*/movies/flixhq/info*' => Http::response(['id' => 'drama-1', 'title' => 'My Drama']),
    ]);

    $service = new ConsumetService('http://localhost:3000');
    $result = $service->getDramaInfo('drama-1');

    expect($result['title'])->toBe('My Drama');
});

// --- getDramaStreamingLinks ---

test('getDramaStreamingLinks returns streaming data', function (): void {
    Http::fake([
        '*/movies/flixhq/watch*' => Http::response(['sources' => [['url' => 'https://example.com/drama.m3u8']]]),
    ]);

    $service = new ConsumetService('http://localhost:3000');
    $result = $service->getDramaStreamingLinks('ep-1', 'media-1');

    expect($result['sources'])->toHaveCount(1);
});

// --- getDramaTrending ---

test('getDramaTrending returns trending dramas', function (): void {
    Http::fake([
        '*/movies/flixhq/trending*' => Http::response(['results' => [['id' => 'd1']]]),
    ]);

    $service = new ConsumetService('http://localhost:3000');
    $result = $service->getDramaTrending();

    expect($result['results'])->toHaveCount(1);
});

// --- findTmdbId ---

test('findTmdbId returns id matching type', function (): void {
    Http::fake([
        '*/meta/tmdb/*' => Http::response([
            'results' => [
                ['id' => 100, 'type' => 'Movie', 'releaseDate' => '2020-01-01'],
                ['id' => 200, 'type' => 'TV Series', 'releaseDate' => '2021-05-15'],
            ],
        ]),
    ]);

    $service = new ConsumetService('http://localhost:3000');
    $result = $service->findTmdbId('My Show', 'TV Series');

    expect($result)->toBe(200);
});

test('findTmdbId with release year match returns matching item id', function (): void {
    Http::fake([
        '*/meta/tmdb/*' => Http::response([
            'results' => [
                ['id' => 100, 'type' => 'TV Series', 'releaseDate' => '2019-03-10'],
                ['id' => 200, 'type' => 'TV Series', 'releaseDate' => '2021-07-22'],
                ['id' => 300, 'type' => 'TV Series', 'releaseDate' => '2023-01-05'],
            ],
        ]),
    ]);

    $service = new ConsumetService('http://localhost:3000');
    $result = $service->findTmdbId('My Show', 'TV Series', '2021');

    expect($result)->toBe(200);
});

test('findTmdbId with no matching year falls back to first candidate', function (): void {
    Http::fake([
        '*/meta/tmdb/*' => Http::response([
            'results' => [
                ['id' => 100, 'type' => 'TV Series', 'releaseDate' => '2019-03-10'],
                ['id' => 200, 'type' => 'TV Series', 'releaseDate' => '2021-07-22'],
            ],
        ]),
    ]);

    $service = new ConsumetService('http://localhost:3000');
    $result = $service->findTmdbId('My Show', 'TV Series', '2025');

    expect($result)->toBe(100);
});

test('findTmdbId with no candidates returns null', function (): void {
    Http::fake([
        '*/meta/tmdb/*' => Http::response([
            'results' => [
                ['id' => 100, 'type' => 'Movie', 'releaseDate' => '2020-01-01'],
            ],
        ]),
    ]);

    $service = new ConsumetService('http://localhost:3000');
    $result = $service->findTmdbId('My Show', 'TV Series');

    expect($result)->toBeNull();
});

test('findTmdbId with no results returns null', function (): void {
    Http::fake([
        '*/meta/tmdb/*' => Http::response(['results' => []]),
    ]);

    $service = new ConsumetService('http://localhost:3000');
    $result = $service->findTmdbId('Nonexistent Show');

    expect($result)->toBeNull();
});

test('findTmdbId with missing results key returns null', function (): void {
    Http::fake([
        '*/meta/tmdb/*' => Http::response(['something' => 'else']),
    ]);

    $service = new ConsumetService('http://localhost:3000');
    $result = $service->findTmdbId('Nonexistent');

    expect($result)->toBeNull();
});

test('findTmdbId with string id returns int', function (): void {
    Http::fake([
        '*/meta/tmdb/*' => Http::response([
            'results' => [
                ['id' => '999', 'type' => 'TV Series', 'releaseDate' => '2022-01-01'],
            ],
        ]),
    ]);

    $service = new ConsumetService('http://localhost:3000');
    $result = $service->findTmdbId('Show', 'TV Series');

    expect($result)->toBe(999);
});

test('findTmdbId year match with string id returns int', function (): void {
    Http::fake([
        '*/meta/tmdb/*' => Http::response([
            'results' => [
                ['id' => '555', 'type' => 'TV Series', 'releaseDate' => '2022-06-01'],
            ],
        ]),
    ]);

    $service = new ConsumetService('http://localhost:3000');
    $result = $service->findTmdbId('Show', 'TV Series', '2022');

    expect($result)->toBe(555);
});

// --- getFreshStreamingLinks ---

test('getFreshStreamingLinks clears cache before fetching', function (): void {
    Http::fake([
        '*/anime/animekai/watch/*' => Http::response(['sources' => [['url' => 'https://example.com/fresh.m3u8']]]),
    ]);

    $service = new ConsumetService('http://localhost:3000');

    // Prime the cache with stale data
    Cache::put('consumet:stream:animekai:ep-1', ['sources' => [['url' => 'https://example.com/stale.m3u8']]], 3600);

    $result = $service->getFreshStreamingLinks('ep-1');

    expect($result['sources'][0]['url'])->toBe('https://example.com/fresh.m3u8');
});

// --- get (private, tested through public methods) ---

test('get returns error on failed HTTP response', function (): void {
    Http::fake([
        '*/anime/animekai/info*' => Http::response('Server Error', 500),
    ]);

    $service = new ConsumetService('http://localhost:3000');
    $result = $service->getAnimeInfo('naruto');

    expect($result)->toHaveKey('error', true)
        ->and($result)->toHaveKey('message', 'Failed to fetch data from source');
});

test('get handles null json response', function (): void {
    Http::fake([
        '*/anime/animekai/info*' => Http::response('', 200),
    ]);

    $service = new ConsumetService('http://localhost:3000');
    $result = $service->getAnimeInfo('naruto');

    expect($result)->toBe([]);
});

// --- requestWithFallback ---

test('requestWithFallback falls back to next provider on error response', function (): void {
    Http::fake([
        '*/anime/animekai/trending*' => Http::response('Error', 500),
        '*/anime/hianime/trending*' => Http::response(['results' => [['id' => '2']]]),
    ]);

    $service = new ConsumetService('http://localhost:3000');
    $result = $service->getTrending();

    expect($result['results'])->toHaveCount(1)
        ->and($result['results'][0]['id'])->toBe('2');
});

test('requestWithFallback skips providers with empty results and returns last empty result', function (): void {
    Http::fake([
        '*/anime/animekai/*' => Http::response(['results' => []]),
        '*/anime/hianime/*' => Http::response(['results' => []]),
        '*/anime/gogoanime/*' => Http::response(['results' => []]),
    ]);

    $service = new ConsumetService('http://localhost:3000');
    $result = $service->search('obscure-anime');

    expect($result)->toHaveKey('results')
        ->and($result['results'])->toBe([]);
});

test('requestWithFallback skips empty results and returns from later provider', function (): void {
    Http::fake([
        '*/anime/animekai/*' => Http::response(['results' => []]),
        '*/anime/hianime/*' => Http::response(['results' => [['id' => '99', 'title' => 'Found It']]]),
    ]);

    $service = new ConsumetService('http://localhost:3000');
    $result = $service->search('rare-anime');

    expect($result['results'])->toHaveCount(1)
        ->and($result['results'][0]['title'])->toBe('Found It');
});

test('requestWithFallback handles ConnectionException and tries next provider', function (): void {
    Log::shouldReceive('warning')
        ->once()
        ->withArgs(fn (string $msg): bool => str_contains($msg, 'animekai'));

    Http::fake([
        '*/anime/animekai/trending*' => Http::response(fn () => throw new ConnectionException('Connection refused')),
        '*/anime/hianime/trending*' => Http::response(['results' => [['id' => '1']]]),
    ]);

    $service = new ConsumetService('http://localhost:3000');
    $result = $service->getTrending();

    expect($result['results'])->toHaveCount(1);
});

test('requestWithFallback returns error when all providers throw ConnectionException', function (): void {
    Log::shouldReceive('warning')->times(3);

    Http::fake([
        '*/anime/animekai/*' => Http::response(fn () => throw new ConnectionException('fail')),
        '*/anime/hianime/*' => Http::response(fn () => throw new ConnectionException('fail')),
        '*/anime/gogoanime/*' => Http::response(fn () => throw new ConnectionException('fail')),
    ]);

    $service = new ConsumetService('http://localhost:3000');
    $result = $service->search('anything');

    expect($result)->toHaveKey('error', true)
        ->and($result['message'])->toBe('All anime sources are currently unavailable');
});

test('requestWithFallback returns error when all providers return errors', function (): void {
    Http::fake([
        '*/anime/animekai/*' => Http::response('Error', 500),
        '*/anime/hianime/*' => Http::response('Error', 500),
        '*/anime/gogoanime/*' => Http::response('Error', 500),
    ]);

    $service = new ConsumetService('http://localhost:3000');
    $result = $service->search('anything');

    expect($result)->toHaveKey('error', true)
        ->and($result['message'])->toBe('All anime sources are currently unavailable');
});

// --- requestWithDramaFallback ---

test('requestWithDramaFallback tries next provider on error', function (): void {
    Http::fake([
        '*/movies/flixhq/trending*' => Http::response('Error', 500),
        '*/movies/goku/trending*' => Http::response(['results' => [['id' => 'd1']]]),
    ]);

    $service = new ConsumetService('http://localhost:3000');
    $result = $service->getDramaTrending();

    expect($result['results'])->toHaveCount(1);
});

test('requestWithDramaFallback handles ConnectionException and tries next provider', function (): void {
    Log::shouldReceive('warning')
        ->once()
        ->withArgs(fn (string $msg): bool => str_contains($msg, 'flixhq'));

    Http::fake([
        '*/movies/flixhq/*' => Http::response(fn () => throw new ConnectionException('Connection refused')),
        '*/movies/goku/*' => Http::response(['results' => [['id' => 'd1', 'title' => 'Drama']]]),
    ]);

    $service = new ConsumetService('http://localhost:3000');
    $result = $service->searchDrama('drama');

    expect($result['results'])->toHaveCount(1)
        ->and($result['results'][0]['title'])->toBe('Drama');
});

test('requestWithDramaFallback returns error when all drama providers throw ConnectionException', function (): void {
    Log::shouldReceive('warning')->times(2);

    Http::fake([
        '*/movies/flixhq/*' => Http::response(fn () => throw new ConnectionException('fail')),
        '*/movies/goku/*' => Http::response(fn () => throw new ConnectionException('fail')),
    ]);

    $service = new ConsumetService('http://localhost:3000');
    $result = $service->searchDrama('anything');

    expect($result)->toHaveKey('error', true)
        ->and($result['message'])->toBe('All drama sources are currently unavailable');
});

test('requestWithDramaFallback returns error when all drama providers return errors', function (): void {
    Http::fake([
        '*/movies/flixhq/*' => Http::response('Error', 500),
        '*/movies/goku/*' => Http::response('Error', 500),
    ]);

    $service = new ConsumetService('http://localhost:3000');
    $result = $service->searchDrama('anything');

    expect($result)->toHaveKey('error', true)
        ->and($result['message'])->toBe('All drama sources are currently unavailable');
});

// --- cached (stale fallback) ---

test('cached serves stale cache when ConnectionException is thrown', function (): void {
    $staleData = ['results' => [['id' => 'stale-1', 'title' => 'Stale Data']]];
    $cacheKey = 'consumet:info:animekai:stale-anime';

    // Mock Cache: get() returns stale data, remember() throws ConnectionException
    Cache::shouldReceive('get')
        ->with($cacheKey)
        ->once()
        ->andReturn($staleData);

    Cache::shouldReceive('remember')
        ->with($cacheKey, 86400, \Mockery::type(\Closure::class))
        ->once()
        ->andThrow(new ConnectionException('Connection refused'));

    Log::shouldReceive('info')
        ->once()
        ->withArgs(fn (string $msg): bool => str_contains($msg, 'Serving stale cache'));

    $service = new ConsumetService('http://localhost:3000');
    $result = $service->getAnimeInfo('stale-anime');

    expect($result)->toBe($staleData);
});

test('cached returns error when no stale cache and ConnectionException is thrown', function (): void {
    $cacheKey = 'consumet:info:animekai:nonexistent-anime';

    // Mock Cache: get() returns null (no stale data), remember() throws ConnectionException
    Cache::shouldReceive('get')
        ->with($cacheKey)
        ->once()
        ->andReturnNull();

    Cache::shouldReceive('remember')
        ->with($cacheKey, 86400, \Mockery::type(\Closure::class))
        ->once()
        ->andThrow(new ConnectionException('Connection refused'));

    $service = new ConsumetService('http://localhost:3000');
    $result = $service->getAnimeInfo('nonexistent-anime');

    expect($result)->toHaveKey('error', true)
        ->and($result['message'])->toBe('Source unavailable and no cached data');
});

// --- caching behavior ---

test('cached data is returned on second call without HTTP request', function (): void {
    Http::fake([
        '*/anime/animekai/info*' => Http::response(['id' => 'naruto', 'title' => 'Naruto']),
    ]);

    $service = new ConsumetService('http://localhost:3000');

    $first = $service->getAnimeInfo('naruto');
    $second = $service->getAnimeInfo('naruto');

    expect($first)->toBe($second);
    Http::assertSentCount(1);
});
