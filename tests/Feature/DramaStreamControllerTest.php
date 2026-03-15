<?php

declare(strict_types=1);

use App\Models\User;
use App\Models\WatchHistory;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

beforeEach(function (): void {
    Cache::flush();
});

it('renders drama watch page for tv show with tmdb embed url', function (): void {
    Http::fake([
        '*/movies/flixhq/info*' => Http::response([
            'id' => 'tv/watch-vincenzo-67955',
            'title' => 'Vincenzo',
            'type' => 'TV Series',
            'releaseDate' => '2021-02-20',
            'image' => 'https://example.com/vincenzo.jpg',
            'episodes' => [
                ['id' => '1167571', 'title' => 'Episode 1', 'number' => 1, 'season' => 1],
                ['id' => '1167572', 'title' => 'Episode 2', 'number' => 2, 'season' => 1],
            ],
        ], 200),
        '*/meta/tmdb/*' => Http::response(['results' => [
            ['id' => 117376, 'title' => 'Vincenzo', 'type' => 'TV Series', 'releaseDate' => '2021-02-20'],
        ]], 200),
    ]);

    $response = $this->get(route('drama.watch', [
        'id' => 'tv/watch-vincenzo-67955',
        'episodeId' => '1167571',
        'mediaId' => 'tv/watch-vincenzo-67955',
    ]));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('DramaWatch')
        ->has('drama')
        ->has('streaming')
        ->where('episodeId', '1167571')
        ->where('mediaId', 'tv/watch-vincenzo-67955')
        ->where('embedUrl', 'https://vidsrc.cc/v2/embed/tv/117376/1/1')
        ->where('progress', 0)
    );
});

it('renders drama watch page for movie with movie embed url', function (): void {
    Http::fake([
        '*/movies/flixhq/info*' => Http::response([
            'id' => 'movie/watch-parasite-12345',
            'title' => 'Parasite',
            'type' => 'Movie',
            'releaseDate' => '2019-05-30',
            'image' => 'https://example.com/parasite.jpg',
            'episodes' => [],
        ], 200),
        '*/meta/tmdb/*' => Http::response(['results' => [
            ['id' => 496243, 'title' => 'Parasite', 'type' => 'Movie', 'releaseDate' => '2019-05-30'],
        ]], 200),
    ]);

    $response = $this->get(route('drama.watch', [
        'id' => 'movie/watch-parasite-12345',
        'episodeId' => 'ep-1',
        'mediaId' => 'movie/watch-parasite-12345',
    ]));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('DramaWatch')
        ->where('embedUrl', 'https://vidsrc.cc/v2/embed/movie/496243')
    );
});

it('shows progress for authenticated user with watch history', function (): void {
    Http::fake([
        '*/movies/flixhq/info*' => Http::response([
            'id' => 'tv/watch-squid-game-11111',
            'title' => 'Squid Game',
            'type' => 'TV Series',
            'releaseDate' => '2021-09-17',
            'image' => 'https://example.com/sg.jpg',
            'episodes' => [
                ['id' => 'sg-ep-1', 'title' => 'Episode 1', 'number' => 1, 'season' => 1],
            ],
        ], 200),
        '*/meta/tmdb/*' => Http::response(['results' => [
            ['id' => 93405, 'title' => 'Squid Game', 'type' => 'TV Series', 'releaseDate' => '2021-09-17'],
        ]], 200),
    ]);

    $user = User::factory()->create();
    WatchHistory::create([
        'user_id' => $user->id,
        'anime_id' => 'tv/watch-squid-game-11111',
        'anime_title' => 'Squid Game',
        'anime_image' => 'https://example.com/sg.jpg',
        'episode_id' => 'sg-ep-1',
        'episode_number' => 1,
        'progress_seconds' => 450,
        'completed' => false,
        'content_type' => 'drama',
        'watched_at' => now(),
    ]);

    $response = $this->actingAs($user)
        ->get(route('drama.watch', [
            'id' => 'tv/watch-squid-game-11111',
            'episodeId' => 'sg-ep-1',
            'mediaId' => 'tv/watch-squid-game-11111',
        ]));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('DramaWatch')
        ->where('progress', 450)
    );
});

it('shows zero progress for guest user', function (): void {
    Http::fake([
        '*/movies/flixhq/info*' => Http::response([
            'id' => 'tv/watch-kingdom-22222',
            'title' => 'Kingdom',
            'type' => 'TV Series',
            'releaseDate' => '2019-01-25',
            'image' => 'https://example.com/kingdom.jpg',
            'episodes' => [
                ['id' => 'k-ep-1', 'title' => 'Episode 1', 'number' => 1, 'season' => 1],
            ],
        ], 200),
        '*/meta/tmdb/*' => Http::response(['results' => [
            ['id' => 84957, 'title' => 'Kingdom', 'type' => 'TV Series', 'releaseDate' => '2019-01-25'],
        ]], 200),
    ]);

    $response = $this->get(route('drama.watch', [
        'id' => 'tv/watch-kingdom-22222',
        'episodeId' => 'k-ep-1',
        'mediaId' => 'tv/watch-kingdom-22222',
    ]));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('DramaWatch')
        ->where('progress', 0)
    );
});

it('handles drama with no tmdb match', function (): void {
    Http::fake([
        '*/movies/flixhq/info*' => Http::response([
            'id' => 'tv/watch-unknown-99999',
            'title' => 'Unknown Drama',
            'type' => 'TV Series',
            'releaseDate' => '2023-01-01',
            'image' => 'https://example.com/unknown.jpg',
            'episodes' => [
                ['id' => 'u-ep-1', 'title' => 'Episode 1', 'number' => 1, 'season' => 1],
            ],
        ], 200),
        '*/meta/tmdb/*' => Http::response(['results' => []], 200),
    ]);

    $response = $this->get(route('drama.watch', [
        'id' => 'tv/watch-unknown-99999',
        'episodeId' => 'u-ep-1',
        'mediaId' => 'tv/watch-unknown-99999',
    ]));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('DramaWatch')
        ->where('embedUrl', null)
    );
});

it('handles movie prefix in id for type detection', function (): void {
    Http::fake([
        '*/movies/flixhq/info*' => Http::response([
            'id' => 'movie/watch-oldboy-54321',
            'title' => 'Oldboy',
            'releaseDate' => '2003-11-21',
            'image' => 'https://example.com/oldboy.jpg',
            'episodes' => [],
        ], 200),
        '*/meta/tmdb/*' => Http::response(['results' => [
            ['id' => 670, 'title' => 'Oldboy', 'type' => 'Movie', 'releaseDate' => '2003-11-21'],
        ]], 200),
    ]);

    $response = $this->get(route('drama.watch', [
        'id' => 'movie/watch-oldboy-54321',
        'episodeId' => 'o-ep-1',
        'mediaId' => 'movie/watch-oldboy-54321',
    ]));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('DramaWatch')
        ->where('embedUrl', 'https://vidsrc.cc/v2/embed/movie/670')
    );
});
