<?php

declare(strict_types=1);

use App\Actions\History\SaveWatchProgress;
use App\Models\User;
use Illuminate\Support\Carbon;

beforeEach(function (): void {
    Carbon::setTestNow('2026-03-15 12:00:00');
});

it('saves anime_title when provided', function (): void {
    $user = User::factory()->create();
    $action = new SaveWatchProgress;

    $history = $action->handle($user, [
        'anime_id' => 'naruto',
        'episode_id' => 'naruto-ep-1',
        'episode_number' => 1,
        'progress_seconds' => 300,
        'anime_title' => 'Naruto Shippuden',
    ]);

    expect($history->anime_title)->toBe('Naruto Shippuden');

    $this->assertDatabaseHas('watch_histories', [
        'user_id' => $user->id,
        'anime_id' => 'naruto',
        'anime_title' => 'Naruto Shippuden',
    ]);
});

it('saves anime_image when provided', function (): void {
    $user = User::factory()->create();
    $action = new SaveWatchProgress;

    $history = $action->handle($user, [
        'anime_id' => 'naruto',
        'episode_id' => 'naruto-ep-1',
        'episode_number' => 1,
        'progress_seconds' => 300,
        'anime_image' => 'https://example.com/naruto.jpg',
    ]);

    expect($history->anime_image)->toBe('https://example.com/naruto.jpg');

    $this->assertDatabaseHas('watch_histories', [
        'user_id' => $user->id,
        'anime_id' => 'naruto',
        'anime_image' => 'https://example.com/naruto.jpg',
    ]);
});

it('saves content_type when provided', function (): void {
    $user = User::factory()->create();
    $action = new SaveWatchProgress;

    $history = $action->handle($user, [
        'anime_id' => 'squid-game',
        'episode_id' => 'sg-ep-1',
        'episode_number' => 1,
        'progress_seconds' => 300,
        'content_type' => 'drama',
    ]);

    expect($history->content_type)->toBe('drama');

    $this->assertDatabaseHas('watch_histories', [
        'user_id' => $user->id,
        'anime_id' => 'squid-game',
        'content_type' => 'drama',
    ]);
});

it('does not set optional fields when not provided', function (): void {
    $user = User::factory()->create();
    $action = new SaveWatchProgress;

    $history = $action->handle($user, [
        'anime_id' => 'naruto',
        'episode_id' => 'naruto-ep-1',
        'episode_number' => 1,
        'progress_seconds' => 300,
    ]);

    expect($history->anime_title)->toBeNull()
        ->and($history->anime_image)->toBeNull();

    $this->assertDatabaseHas('watch_histories', [
        'user_id' => $user->id,
        'anime_id' => 'naruto',
        'anime_title' => null,
        'anime_image' => null,
    ]);
});

it('saves all optional fields at once', function (): void {
    $user = User::factory()->create();
    $action = new SaveWatchProgress;

    $history = $action->handle($user, [
        'anime_id' => 'one-piece',
        'episode_id' => 'op-ep-1',
        'episode_number' => 1,
        'progress_seconds' => 900,
        'completed' => true,
        'anime_title' => 'One Piece',
        'anime_image' => 'https://example.com/one-piece.jpg',
        'content_type' => 'anime',
    ]);

    expect($history)
        ->anime_title->toBe('One Piece')
        ->anime_image->toBe('https://example.com/one-piece.jpg')
        ->content_type->toBe('anime')
        ->completed->toBeTrue();

    $this->assertDatabaseHas('watch_histories', [
        'user_id' => $user->id,
        'anime_id' => 'one-piece',
        'anime_title' => 'One Piece',
        'anime_image' => 'https://example.com/one-piece.jpg',
        'content_type' => 'anime',
        'completed' => true,
    ]);
});
