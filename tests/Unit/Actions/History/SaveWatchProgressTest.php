<?php

declare(strict_types=1);

use App\Actions\History\SaveWatchProgress;
use App\Models\User;

it('creates watch history entry', function (): void {
    $user = User::factory()->create();
    $action = new SaveWatchProgress;

    $history = $action->handle($user, [
        'anime_id' => 'naruto',
        'episode_id' => 'naruto-ep-1',
        'episode_number' => 1,
        'progress_seconds' => 300,
    ]);

    expect($history->anime_id)->toBe('naruto')
        ->and($history->episode_number)->toBe(1)
        ->and($history->progress_seconds)->toBe(300)
        ->and($history->completed)->toBeFalse();

    $this->assertDatabaseHas('watch_histories', [
        'user_id' => $user->id,
        'episode_id' => 'naruto-ep-1',
    ]);
});

it('updates existing entry for same anime and episode', function (): void {
    $user = User::factory()->create();
    $action = new SaveWatchProgress;

    $action->handle($user, [
        'anime_id' => 'naruto',
        'episode_id' => 'naruto-ep-1',
        'episode_number' => 1,
        'progress_seconds' => 300,
    ]);

    $action->handle($user, [
        'anime_id' => 'naruto',
        'episode_id' => 'naruto-ep-1',
        'episode_number' => 1,
        'progress_seconds' => 600,
        'completed' => true,
    ]);

    $this->assertDatabaseCount('watch_histories', 1);
    $this->assertDatabaseHas('watch_histories', [
        'progress_seconds' => 600,
        'completed' => true,
    ]);
});
