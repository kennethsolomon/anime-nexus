<?php

declare(strict_types=1);

use App\Jobs\CheckNewEpisodes;
use App\Models\EpisodeNotification;
use App\Models\User;
use App\Models\WatchHistory;
use App\Models\Watchlist;
use App\Services\ConsumetService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

beforeEach(function (): void {
    cache()->flush();
});

it('returns early without error when user does not exist', function (): void {
    Http::fake();

    $consumet = app(ConsumetService::class);
    (new CheckNewEpisodes(99999))->handle($consumet);

    Http::assertNothingSent();
    $this->assertDatabaseCount('episode_notifications', 0);
});

it('logs warning and continues when checkItem throws an exception', function (): void {
    Log::spy();

    // First request: return something that causes a downstream error
    // Using Http::fake callback that throws RuntimeException - this will NOT be caught
    // by ConsumetService's ConnectionException handler, so it bubbles up to the job's try/catch
    $callCount = 0;
    Http::fake(function ($request) use (&$callCount) {
        $callCount++;
        if (str_contains($request->url(), 'id=broken-anime')) {
            throw new RuntimeException('API down');
        }

        return Http::response([
            'totalEpisodes' => 10,
            'episodes' => [],
        ]);
    });

    $user = User::factory()->create();

    Watchlist::create([
        'user_id' => $user->id,
        'anime_id' => 'broken-anime',
        'anime_title' => 'Broken Anime',
        'status' => 'watching',
        'content_type' => 'anime',
    ]);

    Watchlist::create([
        'user_id' => $user->id,
        'anime_id' => 'working-anime',
        'anime_title' => 'Working Anime',
        'status' => 'watching',
        'content_type' => 'anime',
    ]);

    WatchHistory::create([
        'user_id' => $user->id,
        'anime_id' => 'working-anime',
        'episode_id' => 'ep-5',
        'episode_number' => 5,
        'progress_seconds' => 100,
        'watched_at' => now(),
    ]);

    $consumet = app(ConsumetService::class);
    (new CheckNewEpisodes($user->id))->handle($consumet);

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $msg): bool => str_contains($msg, 'broken-anime'))
        ->once();

    $this->assertDatabaseHas('episode_notifications', [
        'user_id' => $user->id,
        'anime_id' => 'working-anime',
    ]);
});

it('calls getDramaInfo for drama content type items', function (): void {
    Http::fake([
        '*/movies/flixhq/info*' => Http::response([
            'totalEpisodes' => 8,
            'episodes' => [],
        ]),
    ]);

    $user = User::factory()->create();

    Watchlist::create([
        'user_id' => $user->id,
        'anime_id' => 'drama-123',
        'anime_title' => 'Test Drama',
        'status' => 'watching',
        'content_type' => 'drama',
    ]);

    WatchHistory::create([
        'user_id' => $user->id,
        'anime_id' => 'drama-123',
        'episode_id' => 'ep-3',
        'episode_number' => 3,
        'progress_seconds' => 200,
        'watched_at' => now(),
    ]);

    $consumet = app(ConsumetService::class);
    (new CheckNewEpisodes($user->id))->handle($consumet);

    Http::assertSent(fn ($request): bool => str_contains($request->url(), '/movies/flixhq/info'));

    $this->assertDatabaseHas('episode_notifications', [
        'user_id' => $user->id,
        'anime_id' => 'drama-123',
        'content_type' => 'drama',
        'message' => '5 new episodes available!',
    ]);
});

it('counts episodes from episodes array when totalEpisodes is not set', function (): void {
    Http::fake([
        '*/anime/animekai/info*' => Http::response([
            'episodes' => [
                ['id' => 'ep-1', 'number' => 1],
                ['id' => 'ep-2', 'number' => 2],
                ['id' => 'ep-3', 'number' => 3],
                ['id' => 'ep-4', 'number' => 4],
                ['id' => 'ep-5', 'number' => 5],
                ['id' => 'ep-6', 'number' => 6],
            ],
        ]),
    ]);

    $user = User::factory()->create();

    Watchlist::create([
        'user_id' => $user->id,
        'anime_id' => 'no-total-anime',
        'anime_title' => 'No Total Anime',
        'status' => 'watching',
        'content_type' => 'anime',
    ]);

    WatchHistory::create([
        'user_id' => $user->id,
        'anime_id' => 'no-total-anime',
        'episode_id' => 'ep-3',
        'episode_number' => 3,
        'progress_seconds' => 100,
        'watched_at' => now(),
    ]);

    $consumet = app(ConsumetService::class);
    (new CheckNewEpisodes($user->id))->handle($consumet);

    $this->assertDatabaseHas('episode_notifications', [
        'user_id' => $user->id,
        'anime_id' => 'no-total-anime',
        'message' => '3 new episodes available!',
    ]);
});

it('skips notification when totalEpisodes is zero', function (): void {
    Http::fake([
        '*/anime/animekai/info*' => Http::response([
            'totalEpisodes' => 0,
            'episodes' => [],
        ]),
    ]);

    $user = User::factory()->create();

    Watchlist::create([
        'user_id' => $user->id,
        'anime_id' => 'zero-eps',
        'anime_title' => 'Zero Episodes',
        'status' => 'watching',
        'content_type' => 'anime',
    ]);

    $consumet = app(ConsumetService::class);
    (new CheckNewEpisodes($user->id))->handle($consumet);

    $this->assertDatabaseMissing('episode_notifications', [
        'user_id' => $user->id,
        'anime_id' => 'zero-eps',
    ]);
});
