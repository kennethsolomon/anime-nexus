<?php

declare(strict_types=1);

use App\Models\Favorite;
use App\Models\User;
use App\Models\Watchlist;

it('favorite belongs to user', function (): void {
    $user = User::factory()->create();

    $favorite = Favorite::create([
        'user_id' => $user->id,
        'anime_id' => 'test',
        'anime_title' => 'Test',
        'content_type' => 'anime',
    ]);

    expect($favorite->user->id)->toBe($user->id);
});

it('watchlist belongs to user', function (): void {
    $user = User::factory()->create();

    $watchlist = Watchlist::create([
        'user_id' => $user->id,
        'anime_id' => 'test',
        'anime_title' => 'Test',
        'status' => 'watching',
    ]);

    expect($watchlist->user->id)->toBe($user->id);
});
