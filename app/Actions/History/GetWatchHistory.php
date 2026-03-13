<?php

declare(strict_types=1);

namespace App\Actions\History;

use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

final class GetWatchHistory
{
    /**
     * @return Collection<int, \App\Models\WatchHistory>
     */
    public function handle(User $user, int $limit = 20): Collection
    {
        return $user->watchHistories()
            ->orderByDesc('watched_at')
            ->limit($limit)
            ->get();
    }
}
