<?php

declare(strict_types=1);

namespace App\Actions\Watchlist;

use App\Models\User;
use App\Models\Watchlist;

final class AddToWatchlist
{
    /**
     * @param  array{anime_id: string, anime_title: string, anime_image: string|null, status?: string}  $data
     */
    public function handle(User $user, array $data): Watchlist
    {
        return $user->watchlists()->updateOrCreate(
            ['anime_id' => $data['anime_id']],
            [
                'anime_title' => $data['anime_title'],
                'anime_image' => $data['anime_image'] ?? null,
                'status' => $data['status'] ?? 'plan_to_watch',
            ],
        );
    }
}
