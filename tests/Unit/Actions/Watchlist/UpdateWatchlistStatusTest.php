<?php

declare(strict_types=1);

use App\Actions\Watchlist\UpdateWatchlistStatus;
use App\Models\User;
use App\Models\Watchlist;

it('updates watchlist status', function (): void {
    $user = User::factory()->create();
    $watchlist = Watchlist::create([
        'user_id' => $user->id,
        'anime_id' => 'naruto',
        'anime_title' => 'Naruto',
        'status' => 'watching',
    ]);

    $action = new UpdateWatchlistStatus;
    $result = $action->handle($watchlist, 'completed');

    expect($result->status)->toBe('completed');
    $this->assertDatabaseHas('watchlists', [
        'id' => $watchlist->id,
        'status' => 'completed',
    ]);
});
