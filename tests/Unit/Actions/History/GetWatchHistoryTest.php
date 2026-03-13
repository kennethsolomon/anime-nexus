<?php

declare(strict_types=1);

use App\Actions\History\GetWatchHistory;
use App\Models\User;
use App\Models\WatchHistory;

it('returns watch history ordered by watched_at desc', function (): void {
    $user = User::factory()->create();

    WatchHistory::create([
        'user_id' => $user->id,
        'anime_id' => 'naruto',
        'episode_id' => 'naruto-ep-1',
        'episode_number' => 1,
        'progress_seconds' => 300,
        'watched_at' => now()->subHour(),
    ]);

    WatchHistory::create([
        'user_id' => $user->id,
        'anime_id' => 'bleach',
        'episode_id' => 'bleach-ep-1',
        'episode_number' => 1,
        'progress_seconds' => 600,
        'watched_at' => now(),
    ]);

    $action = new GetWatchHistory;
    $history = $action->handle($user);

    expect($history)->toHaveCount(2)
        ->and($history->first()->anime_id)->toBe('bleach');
});

it('respects the limit parameter', function (): void {
    $user = User::factory()->create();

    for ($i = 1; $i <= 5; $i++) {
        WatchHistory::create([
            'user_id' => $user->id,
            'anime_id' => "anime-{$i}",
            'episode_id' => "anime-{$i}-ep-1",
            'episode_number' => 1,
            'progress_seconds' => 100,
            'watched_at' => now()->subMinutes($i),
        ]);
    }

    $action = new GetWatchHistory;

    expect($action->handle($user, 3))->toHaveCount(3);
});
