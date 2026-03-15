<?php

declare(strict_types=1);

use App\Actions\Stats\GetUserStats;
use App\Models\User;
use App\Models\WatchHistory;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

beforeEach(function (): void {
    Carbon::setTestNow('2026-03-15 12:00:00');
});

it('returns zero stats for user with no history', function (): void {
    $user = User::factory()->create();
    $action = new GetUserStats;

    $stats = $action->handle($user);

    expect($stats)
        ->totalEpisodes->toBe(0)
        ->totalSeconds->toBe(0)
        ->completionRate->toBe(0.0)
        ->currentStreak->toBe(0)
        ->mostWatched->toBe([])
        ->animeCount->toBe(0)
        ->dramaCount->toBe(0);
});

it('computes correct stats with watch history data', function (): void {
    $user = User::factory()->create();

    WatchHistory::forceCreate([
        'user_id' => $user->id,
        'anime_id' => 'naruto',
        'anime_title' => 'Naruto',
        'episode_id' => 'naruto-ep-1',
        'episode_number' => 1,
        'progress_seconds' => 1200,
        'completed' => true,
        'content_type' => 'anime',
        'watched_at' => now(),
    ]);

    // Second anime with no completed episodes — gives 50% completion (1/2 unique anime completed)
    WatchHistory::forceCreate([
        'user_id' => $user->id,
        'anime_id' => 'one-piece',
        'anime_title' => 'One Piece',
        'episode_id' => 'op-ep-1',
        'episode_number' => 1,
        'progress_seconds' => 600,
        'completed' => false,
        'content_type' => 'anime',
        'watched_at' => now(),
    ]);

    $stats = (new GetUserStats)->handle($user);

    expect($stats)
        ->totalEpisodes->toBe(1)
        ->totalSeconds->toBe(1800)
        ->completionRate->toBe(50.0)
        ->animeCount->toBe(2)
        ->dramaCount->toBe(0);
});

it('computes streak of 1 when last activity is today', function (): void {
    $user = User::factory()->create();

    WatchHistory::forceCreate([
        'user_id' => $user->id,
        'anime_id' => 'naruto',
        'anime_title' => 'Naruto',
        'episode_id' => 'naruto-ep-1',
        'episode_number' => 1,
        'progress_seconds' => 300,
        'completed' => false,
        'content_type' => 'anime',
        'watched_at' => now(),
    ]);

    $stats = (new GetUserStats)->handle($user);

    expect($stats['currentStreak'])->toBe(1);
});

it('computes streak of 1 when last activity was yesterday', function (): void {
    $user = User::factory()->create();

    WatchHistory::forceCreate([
        'user_id' => $user->id,
        'anime_id' => 'naruto',
        'anime_title' => 'Naruto',
        'episode_id' => 'naruto-ep-1',
        'episode_number' => 1,
        'progress_seconds' => 300,
        'completed' => false,
        'content_type' => 'anime',
        'watched_at' => now()->subDay(),
    ]);

    $stats = (new GetUserStats)->handle($user);

    expect($stats['currentStreak'])->toBe(1);
});

it('returns zero streak when last activity was 2+ days ago', function (): void {
    $user = User::factory()->create();

    WatchHistory::forceCreate([
        'user_id' => $user->id,
        'anime_id' => 'naruto',
        'anime_title' => 'Naruto',
        'episode_id' => 'naruto-ep-1',
        'episode_number' => 1,
        'progress_seconds' => 300,
        'completed' => false,
        'content_type' => 'anime',
        'watched_at' => now()->subDays(3),
    ]);

    $stats = (new GetUserStats)->handle($user);

    expect($stats['currentStreak'])->toBe(0);
});

it('computes multi-day streak for 3 consecutive days', function (): void {
    $user = User::factory()->create();

    foreach (range(0, 2) as $daysAgo) {
        WatchHistory::forceCreate([
            'user_id' => $user->id,
            'anime_id' => 'naruto',
            'anime_title' => 'Naruto',
            'episode_id' => "naruto-ep-{$daysAgo}",
            'episode_number' => $daysAgo + 1,
            'progress_seconds' => 300,
            'completed' => false,
            'content_type' => 'anime',
            'watched_at' => now()->subDays($daysAgo),
        ]);
    }

    $stats = (new GetUserStats)->handle($user);

    expect($stats['currentStreak'])->toBe(3);
});

it('breaks streak on a gap day', function (): void {
    $user = User::factory()->create();

    // Today and yesterday
    WatchHistory::forceCreate([
        'user_id' => $user->id,
        'anime_id' => 'naruto',
        'anime_title' => 'Naruto',
        'episode_id' => 'naruto-ep-1',
        'episode_number' => 1,
        'progress_seconds' => 300,
        'completed' => false,
        'content_type' => 'anime',
        'watched_at' => now(),
    ]);

    WatchHistory::forceCreate([
        'user_id' => $user->id,
        'anime_id' => 'naruto',
        'anime_title' => 'Naruto',
        'episode_id' => 'naruto-ep-2',
        'episode_number' => 2,
        'progress_seconds' => 300,
        'completed' => false,
        'content_type' => 'anime',
        'watched_at' => now()->subDay(),
    ]);

    // Skip day 2, activity on day 3
    WatchHistory::forceCreate([
        'user_id' => $user->id,
        'anime_id' => 'naruto',
        'anime_title' => 'Naruto',
        'episode_id' => 'naruto-ep-3',
        'episode_number' => 3,
        'progress_seconds' => 300,
        'completed' => false,
        'content_type' => 'anime',
        'watched_at' => now()->subDays(3),
    ]);

    $stats = (new GetUserStats)->handle($user);

    expect($stats['currentStreak'])->toBe(2);
});

it('uses cache on second call', function (): void {
    $user = User::factory()->create();
    $action = new GetUserStats;

    // First call populates cache and queries DB
    $first = $action->handle($user);

    // Second call should return cached result without recomputing
    $queryCount = 0;
    DB::listen(function () use (&$queryCount): void {
        $queryCount++;
    });

    $second = $action->handle($user);

    expect($second)->toBe($first)
        ->and($queryCount)->toBe(0);
});

it('returns top 5 most watched by episode count', function (): void {
    $user = User::factory()->create();

    // Create 6 anime with decreasing episode counts
    foreach (range(1, 6) as $animeIndex) {
        $episodeCount = 7 - $animeIndex; // 6, 5, 4, 3, 2, 1
        foreach (range(1, $episodeCount) as $ep) {
            WatchHistory::forceCreate([
                'user_id' => $user->id,
                'anime_id' => "anime-{$animeIndex}",
                'anime_title' => "Anime {$animeIndex}",
                'episode_id' => "anime-{$animeIndex}-ep-{$ep}",
                'episode_number' => $ep,
                'progress_seconds' => 300,
                'completed' => true,
                'content_type' => 'anime',
                'watched_at' => now(),
            ]);
        }
    }

    $stats = (new GetUserStats)->handle($user);

    expect($stats['mostWatched'])
        ->toHaveCount(5)
        ->and($stats['mostWatched'][0]['episode_count'])->toBe(6)
        ->and($stats['mostWatched'][0]['anime_id'])->toBe('anime-1')
        ->and($stats['mostWatched'][4]['episode_count'])->toBe(2);
});

it('separates anime and drama counts', function (): void {
    $user = User::factory()->create();

    WatchHistory::forceCreate([
        'user_id' => $user->id,
        'anime_id' => 'naruto',
        'anime_title' => 'Naruto',
        'episode_id' => 'naruto-ep-1',
        'episode_number' => 1,
        'progress_seconds' => 300,
        'completed' => false,
        'content_type' => 'anime',
        'watched_at' => now(),
    ]);

    WatchHistory::forceCreate([
        'user_id' => $user->id,
        'anime_id' => 'one-piece',
        'anime_title' => 'One Piece',
        'episode_id' => 'op-ep-1',
        'episode_number' => 1,
        'progress_seconds' => 300,
        'completed' => false,
        'content_type' => 'anime',
        'watched_at' => now(),
    ]);

    WatchHistory::forceCreate([
        'user_id' => $user->id,
        'anime_id' => 'squid-game',
        'anime_title' => 'Squid Game',
        'episode_id' => 'sg-ep-1',
        'episode_number' => 1,
        'progress_seconds' => 300,
        'completed' => false,
        'content_type' => 'drama',
        'watched_at' => now(),
    ]);

    $stats = (new GetUserStats)->handle($user);

    expect($stats)
        ->animeCount->toBe(2)
        ->dramaCount->toBe(1);
});
