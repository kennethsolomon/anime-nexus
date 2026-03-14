<?php

declare(strict_types=1);

use App\Jobs\CheckNewEpisodes;
use App\Models\EpisodeNotification;
use App\Models\User;
use App\Models\WatchHistory;
use App\Models\Watchlist;
use App\Services\ConsumetService;
use Illuminate\Support\Facades\Http;

beforeEach(function (): void {
    cache()->flush();
});

it('creates notification when new episodes exist', function (): void {
    Http::fake([
        '*/anime/animekai/info*' => Http::response(['totalEpisodes' => 10, 'episodes' => []]),
    ]);

    $user = User::factory()->create();

    Watchlist::create([
        'user_id' => $user->id,
        'anime_id' => 'naruto',
        'anime_title' => 'Naruto',
        'status' => 'watching',
        'content_type' => 'anime',
    ]);

    WatchHistory::create([
        'user_id' => $user->id,
        'anime_id' => 'naruto',
        'episode_id' => 'ep-5',
        'episode_number' => 5,
        'progress_seconds' => 100,
        'watched_at' => now(),
    ]);

    $consumet = app(ConsumetService::class);
    (new CheckNewEpisodes($user->id))->handle($consumet);

    $this->assertDatabaseHas('episode_notifications', [
        'user_id' => $user->id,
        'anime_id' => 'naruto',
        'message' => '5 new episodes available!',
    ]);
});

it('does not create notification when episodes are up to date', function (): void {
    Http::fake([
        '*/anime/animekai/info*' => Http::response(['totalEpisodes' => 10, 'episodes' => []]),
    ]);

    $user = User::factory()->create();

    Watchlist::create([
        'user_id' => $user->id,
        'anime_id' => 'naruto',
        'anime_title' => 'Naruto',
        'status' => 'watching',
        'content_type' => 'anime',
    ]);

    WatchHistory::create([
        'user_id' => $user->id,
        'anime_id' => 'naruto',
        'episode_id' => 'ep-10',
        'episode_number' => 10,
        'progress_seconds' => 100,
        'watched_at' => now(),
    ]);

    $consumet = app(ConsumetService::class);
    (new CheckNewEpisodes($user->id))->handle($consumet);

    $this->assertDatabaseMissing('episode_notifications', [
        'user_id' => $user->id,
        'anime_id' => 'naruto',
    ]);
});

it('does not create duplicate notification', function (): void {
    Http::fake([
        '*/anime/animekai/info*' => Http::response(['totalEpisodes' => 10, 'episodes' => []]),
    ]);

    $user = User::factory()->create();

    Watchlist::create([
        'user_id' => $user->id,
        'anime_id' => 'naruto',
        'anime_title' => 'Naruto',
        'status' => 'watching',
        'content_type' => 'anime',
    ]);

    WatchHistory::create([
        'user_id' => $user->id,
        'anime_id' => 'naruto',
        'episode_id' => 'ep-5',
        'episode_number' => 5,
        'progress_seconds' => 100,
        'watched_at' => now(),
    ]);

    EpisodeNotification::create([
        'user_id' => $user->id,
        'anime_id' => 'naruto',
        'anime_title' => 'Naruto',
        'content_type' => 'anime',
        'message' => 'New episode available!',
        'read' => false,
    ]);

    $consumet = app(ConsumetService::class);
    (new CheckNewEpisodes($user->id))->handle($consumet);

    expect(EpisodeNotification::where('user_id', $user->id)->count())->toBe(1);
});

it('creates notification for single new episode', function (): void {
    Http::fake([
        '*/anime/animekai/info*' => Http::response(['totalEpisodes' => 10, 'episodes' => []]),
    ]);

    $user = User::factory()->create();

    Watchlist::create([
        'user_id' => $user->id,
        'anime_id' => 'naruto',
        'anime_title' => 'Naruto',
        'status' => 'watching',
        'content_type' => 'anime',
    ]);

    WatchHistory::create([
        'user_id' => $user->id,
        'anime_id' => 'naruto',
        'episode_id' => 'ep-9',
        'episode_number' => 9,
        'progress_seconds' => 100,
        'watched_at' => now(),
    ]);

    $consumet = app(ConsumetService::class);
    (new CheckNewEpisodes($user->id))->handle($consumet);

    $this->assertDatabaseHas('episode_notifications', [
        'user_id' => $user->id,
        'message' => 'New episode available!',
    ]);
});

it('skips items not in watching status', function (): void {
    Http::fake();

    $user = User::factory()->create();

    Watchlist::create([
        'user_id' => $user->id,
        'anime_id' => 'naruto',
        'anime_title' => 'Naruto',
        'status' => 'completed',
        'content_type' => 'anime',
    ]);

    $consumet = app(ConsumetService::class);
    (new CheckNewEpisodes($user->id))->handle($consumet);

    $this->assertDatabaseMissing('episode_notifications', [
        'user_id' => $user->id,
    ]);

    Http::assertNothingSent();
});
