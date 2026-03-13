<?php

declare(strict_types=1);

use App\Actions\Watchlist\RemoveFromWatchlist;
use App\Models\User;
use App\Models\Watchlist;

it('deletes the watchlist entry', function (): void {
    $user = User::factory()->create();
    $watchlist = Watchlist::create([
        'user_id' => $user->id,
        'anime_id' => 'naruto',
        'anime_title' => 'Naruto',
        'status' => 'watching',
    ]);

    $action = new RemoveFromWatchlist;
    $action->handle($watchlist);

    $this->assertDatabaseMissing('watchlists', [
        'id' => $watchlist->id,
    ]);
});
