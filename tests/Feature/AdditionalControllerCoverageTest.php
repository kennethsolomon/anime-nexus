<?php

declare(strict_types=1);

use App\Models\Favorite;
use App\Models\Review;
use App\Models\User;
use App\Models\WatchHistory;
use App\Models\Watchlist;
use Illuminate\Support\Facades\Http;

/*
|--------------------------------------------------------------------------
| AnimeController::show — authenticated user coverage
|--------------------------------------------------------------------------
*/

it('shows watchlist entry, user review, and favorite status for authenticated user on anime detail', function (): void {
    Http::fake([
        '*/anime/animekai/info*' => Http::response([
            'id' => 'naruto',
            'title' => 'Naruto',
            'image' => 'https://example.com/naruto.jpg',
            'episodes' => [],
        ], 200),
    ]);

    $user = User::factory()->create();

    Watchlist::create([
        'user_id' => $user->id,
        'anime_id' => 'naruto',
        'anime_title' => 'Naruto',
        'status' => 'watching',
        'content_type' => 'anime',
    ]);

    Review::create([
        'user_id' => $user->id,
        'anime_id' => 'naruto',
        'content_type' => 'anime',
        'rating' => 9,
        'body' => 'Great anime',
    ]);

    Favorite::create([
        'user_id' => $user->id,
        'anime_id' => 'naruto',
        'anime_title' => 'Naruto',
        'content_type' => 'anime',
    ]);

    $this->actingAs($user)
        ->get(route('anime.show', ['id' => 'naruto']))
        ->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('AnimeDetail')
            ->has('anime')
            ->has('watchlistEntry')
            ->where('isFavorited', true)
            ->has('userReview')
            ->has('reviews', 1)
        );
});

it('includes recommendations from API response on anime detail', function (): void {
    Http::fake([
        '*/anime/animekai/info*' => Http::response([
            'id' => 'naruto',
            'title' => 'Naruto',
            'image' => 'https://example.com/naruto.jpg',
            'episodes' => [],
            'recommendations' => [
                ['id' => 'bleach', 'title' => 'Bleach'],
            ],
        ], 200),
    ]);

    $this->get(route('anime.show', ['id' => 'naruto']))
        ->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('AnimeDetail')
            ->has('recommendations', 1)
        );
});

/*
|--------------------------------------------------------------------------
| DramaController — authenticated user coverage
|--------------------------------------------------------------------------
*/

it('shows continue watching for authenticated user on drama home', function (): void {
    Http::fake([
        '*/movies/flixhq/trending*' => Http::response(['results' => [
            ['id' => 'tv/watch-vincenzo-67955', 'title' => 'Vincenzo', 'image' => 'https://example.com/vincenzo.jpg', 'type' => 'TV Series'],
        ]], 200),
    ]);

    $user = User::factory()->create();

    WatchHistory::create([
        'user_id' => $user->id,
        'anime_id' => 'tv/watch-vincenzo-67955',
        'anime_title' => 'Vincenzo',
        'episode_id' => 'ep-1',
        'episode_number' => 1,
        'progress_seconds' => 300,
        'completed' => false,
        'content_type' => 'drama',
        'watched_at' => now(),
    ]);

    $this->actingAs($user)
        ->get(route('drama.home'))
        ->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('DramaHome')
            ->has('trending')
            ->has('continueWatching', 1)
        );
});

it('shows reviews and favorite status for authenticated user on drama detail', function (): void {
    Http::fake([
        '*/movies/flixhq/info*' => Http::response([
            'id' => 'tv/watch-vincenzo-67955',
            'title' => 'Vincenzo',
            'image' => 'https://example.com/vincenzo.jpg',
            'episodes' => [],
        ], 200),
        '*/meta/tmdb/*' => Http::response(['results' => []], 200),
    ]);

    $user = User::factory()->create();

    Review::create([
        'user_id' => $user->id,
        'anime_id' => 'tv/watch-vincenzo-67955',
        'content_type' => 'drama',
        'rating' => 8,
        'body' => 'Great drama',
    ]);

    Favorite::create([
        'user_id' => $user->id,
        'anime_id' => 'tv/watch-vincenzo-67955',
        'anime_title' => 'Vincenzo',
        'content_type' => 'drama',
    ]);

    $this->actingAs($user)
        ->get(route('drama.show', ['id' => 'tv/watch-vincenzo-67955']))
        ->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('DramaDetail')
            ->has('drama')
            ->where('isFavorited', true)
            ->has('userReview')
            ->has('reviews', 1)
        );
});

/*
|--------------------------------------------------------------------------
| FavoriteController — invalid content_type defaults to 'anime'
|--------------------------------------------------------------------------
*/

it('defaults to anime when favorites content_type is invalid', function (): void {
    $user = User::factory()->create();

    Favorite::create([
        'user_id' => $user->id,
        'anime_id' => 'anime-1',
        'anime_title' => 'Anime 1',
        'content_type' => 'anime',
    ]);

    $this->actingAs($user)
        ->get(route('favorites.index', ['content_type' => 'invalid']))
        ->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('Favorites')
            ->where('currentContentType', 'anime')
            ->has('favorites', 1)
        );
});

/*
|--------------------------------------------------------------------------
| HistoryController — invalid content_type defaults to 'anime'
|--------------------------------------------------------------------------
*/

it('defaults to anime when history content_type is invalid', function (): void {
    $user = User::factory()->create();

    WatchHistory::create([
        'user_id' => $user->id,
        'anime_id' => 'naruto',
        'anime_title' => 'Naruto',
        'episode_id' => 'ep-1',
        'episode_number' => 1,
        'progress_seconds' => 300,
        'completed' => false,
        'content_type' => 'anime',
        'watched_at' => now(),
    ]);

    $this->actingAs($user)
        ->get(route('history.index', ['content_type' => 'invalid']))
        ->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('History')
            ->where('currentContentType', 'anime')
            ->has('history', 1)
        );
});

/*
|--------------------------------------------------------------------------
| WatchlistController — invalid status and content_type defaults
|--------------------------------------------------------------------------
*/

it('defaults to all when watchlist status is invalid', function (): void {
    $user = User::factory()->create();

    Watchlist::create([
        'user_id' => $user->id,
        'anime_id' => 'naruto',
        'anime_title' => 'Naruto',
        'status' => 'watching',
        'content_type' => 'anime',
    ]);

    $this->actingAs($user)
        ->get(route('watchlist.index', ['status' => 'invalid']))
        ->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('Watchlist')
            ->where('currentStatus', 'all')
            ->has('watchlist', 1)
        );
});

it('defaults to anime when watchlist content_type is invalid', function (): void {
    $user = User::factory()->create();

    Watchlist::create([
        'user_id' => $user->id,
        'anime_id' => 'naruto',
        'anime_title' => 'Naruto',
        'status' => 'watching',
        'content_type' => 'anime',
    ]);

    $this->actingAs($user)
        ->get(route('watchlist.index', ['content_type' => 'invalid']))
        ->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('Watchlist')
            ->where('currentContentType', 'anime')
            ->has('watchlist', 1)
        );
});
