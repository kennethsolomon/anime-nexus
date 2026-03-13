<?php

declare(strict_types=1);

namespace App\Actions\Watchlist;

use App\Models\Watchlist;

final class UpdateWatchlistStatus
{
    public function handle(Watchlist $watchlist, string $status): Watchlist
    {
        $watchlist->update(['status' => $status]);

        return $watchlist;
    }
}
