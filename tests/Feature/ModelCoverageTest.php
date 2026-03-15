<?php

declare(strict_types=1);

use App\Models\EpisodeNotification;
use App\Models\Favorite;
use App\Models\Review;
use App\Models\User;
use App\Models\WatchHistory;

it('casts EpisodeNotification read attribute to boolean', function (): void {
    $user = User::factory()->create();

    $notification = EpisodeNotification::create([
        'user_id' => $user->id,
        'anime_id' => 'test-anime',
        'anime_title' => 'Test Anime',
        'content_type' => 'anime',
        'message' => 'New episode!',
        'read' => 1,
    ]);

    $notification->refresh();

    expect($notification->read)->toBeTrue()->and($notification->read)->toBeBool();
});

it('casts Review rating attribute to integer', function (): void {
    $user = User::factory()->create();

    $review = Review::create([
        'user_id' => $user->id,
        'anime_id' => 'test-anime',
        'content_type' => 'anime',
        'rating' => '8',
        'body' => 'Great anime!',
    ]);

    $review->refresh();

    expect($review->rating)->toBe(8)->and($review->rating)->toBeInt();
});

it('returns HasMany relationship for User favorites', function (): void {
    $user = User::factory()->create();

    Favorite::create([
        'user_id' => $user->id,
        'anime_id' => 'fav-anime',
        'anime_title' => 'Favorite Anime',
        'anime_image' => 'https://example.com/image.jpg',
        'content_type' => 'anime',
    ]);

    $favorites = $user->favorites;

    expect($favorites)->toHaveCount(1)
        ->and($favorites->first()->anime_id)->toBe('fav-anime')
        ->and($user->favorites())->toBeInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class);
});

it('accesses EpisodeNotification user relationship', function (): void {
    $user = User::factory()->create();

    $notification = EpisodeNotification::create([
        'user_id' => $user->id,
        'anime_id' => 'test-anime-rel',
        'anime_title' => 'Test Anime',
        'content_type' => 'anime',
        'message' => 'New episode!',
    ]);

    $notificationUser = $notification->user;
    expect($notificationUser->id)->toBe($user->id);
});

it('accesses User reviews relationship', function (): void {
    $user = User::factory()->create();

    Review::create([
        'user_id' => $user->id,
        'anime_id' => 'test-anime-rev',
        'content_type' => 'anime',
        'rating' => 9,
        'body' => 'Great!',
    ]);

    $reviews = $user->reviews;
    expect($reviews)->toHaveCount(1)
        ->and($reviews->first()->anime_id)->toBe('test-anime-rev');
});

it('accesses WatchHistory user relationship', function (): void {
    $user = User::factory()->create();

    $history = WatchHistory::create([
        'user_id' => $user->id,
        'anime_id' => 'test-anime-hist',
        'episode_id' => 'ep-rel-1',
        'episode_number' => 1,
        'progress_seconds' => 100,
        'watched_at' => '2026-03-15 10:00:00',
    ]);

    $historyUser = $history->user;
    expect($historyUser->id)->toBe($user->id);
});

it('casts WatchHistory attributes correctly', function (): void {
    $user = User::factory()->create();

    $history = WatchHistory::create([
        'user_id' => $user->id,
        'anime_id' => 'test-anime',
        'episode_id' => 'ep-1',
        'episode_number' => '3',
        'progress_seconds' => '120',
        'completed' => 1,
        'watched_at' => '2026-03-15 10:00:00',
    ]);

    $history->refresh();

    expect($history->episode_number)->toBe(3)->and($history->episode_number)->toBeInt()
        ->and($history->progress_seconds)->toBe(120)->and($history->progress_seconds)->toBeInt()
        ->and($history->completed)->toBeTrue()->and($history->completed)->toBeBool()
        ->and($history->watched_at)->toBeInstanceOf(\Carbon\CarbonImmutable::class);
});
