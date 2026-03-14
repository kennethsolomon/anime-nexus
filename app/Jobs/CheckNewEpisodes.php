<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\EpisodeNotification;
use App\Models\User;
use App\Models\Watchlist;
use App\Services\ConsumetService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

final class CheckNewEpisodes implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly int $userId,
    ) {}

    public function handle(ConsumetService $consumet): void
    {
        $user = User::find($this->userId);
        if (! $user) {
            return;
        }

        $watchingItems = $user->watchlists()
            ->where('status', 'watching')
            ->orderByDesc('updated_at')
            ->limit(10)
            ->get();

        foreach ($watchingItems as $item) {
            try {
                $this->checkItem($consumet, $user, $item);
            } catch (\Throwable $e) {
                Log::warning("CheckNewEpisodes: failed for anime {$item->anime_id}", [
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }

    private function checkItem(ConsumetService $consumet, User $user, Watchlist $item): void
    {
        // Fetch info from Consumet (uses 24h cache)
        $info = $item->content_type === 'drama'
            ? $consumet->getDramaInfo($item->anime_id)
            : $consumet->getAnimeInfo($item->anime_id);

        if (! empty($info['error'])) {
            return;
        }

        // Get total episodes — use totalEpisodes field or count episodes array
        $totalEpisodes = 0;
        if (isset($info['totalEpisodes']) && is_int($info['totalEpisodes'])) {
            $totalEpisodes = $info['totalEpisodes'];
        } elseif (isset($info['episodes']) && is_array($info['episodes'])) {
            $totalEpisodes = count($info['episodes']);
        }

        if ($totalEpisodes <= 0) {
            return;
        }

        // Get the max episode number the user has watched for this anime
        /** @var int $maxWatched */
        $maxWatched = $user->watchHistories()
            ->where('anime_id', $item->anime_id)
            ->max('episode_number') ?? 0;

        if ($totalEpisodes <= $maxWatched) {
            return;
        }

        // Check for existing unread notification (dedup)
        $exists = EpisodeNotification::where('user_id', $user->id)
            ->where('anime_id', $item->anime_id)
            ->where('read', false)
            ->exists();

        if ($exists) {
            return;
        }

        $newCount = $totalEpisodes - $maxWatched;

        EpisodeNotification::create([
            'user_id' => $user->id,
            'anime_id' => $item->anime_id,
            'anime_title' => $item->anime_title,
            'anime_image' => $item->anime_image,
            'content_type' => $item->content_type ?? 'anime',
            'message' => $newCount === 1
                ? 'New episode available!'
                : "{$newCount} new episodes available!",
        ]);
    }
}
