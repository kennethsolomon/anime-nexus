<?php

declare(strict_types=1);

use App\Actions\Watchlist\AddToWatchlist;
use App\Models\User;

it('creates a new watchlist entry', function (): void {
    $user = User::factory()->create();
    $action = new AddToWatchlist;

    $watchlist = $action->handle($user, [
        'anime_id' => 'spy-x-family',
        'anime_title' => 'Spy x Family',
        'anime_image' => 'https://example.com/spy.jpg',
        'status' => 'watching',
    ]);

    expect($watchlist->anime_id)->toBe('spy-x-family')
        ->and($watchlist->status)->toBe('watching');

    $this->assertDatabaseHas('watchlists', [
        'user_id' => $user->id,
        'anime_id' => 'spy-x-family',
    ]);
});

it('updates existing watchlist entry for same anime', function (): void {
    $user = User::factory()->create();
    $action = new AddToWatchlist;

    $action->handle($user, [
        'anime_id' => 'naruto',
        'anime_title' => 'Naruto',
        'anime_image' => null,
        'status' => 'watching',
    ]);

    $action->handle($user, [
        'anime_id' => 'naruto',
        'anime_title' => 'Naruto Shippuden',
        'anime_image' => 'https://example.com/naruto.jpg',
        'status' => 'completed',
    ]);

    $this->assertDatabaseCount('watchlists', 1);
    $this->assertDatabaseHas('watchlists', [
        'anime_title' => 'Naruto Shippuden',
        'status' => 'completed',
    ]);
});

it('defaults status to plan_to_watch', function (): void {
    $user = User::factory()->create();
    $action = new AddToWatchlist;

    $watchlist = $action->handle($user, [
        'anime_id' => 'bleach',
        'anime_title' => 'Bleach',
        'anime_image' => null,
    ]);

    expect($watchlist->status)->toBe('plan_to_watch');
});
