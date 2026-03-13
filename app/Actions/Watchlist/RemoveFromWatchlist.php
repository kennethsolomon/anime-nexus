<?php

declare(strict_types=1);

namespace App\Actions\Watchlist;

use App\Models\Watchlist;

final class RemoveFromWatchlist
{
    public function handle(Watchlist $watchlist): void
    {
        $watchlist->delete();
    }
}
