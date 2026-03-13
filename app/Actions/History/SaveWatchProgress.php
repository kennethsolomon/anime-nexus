<?php

declare(strict_types=1);

namespace App\Actions\History;

use App\Models\User;
use App\Models\WatchHistory;

final class SaveWatchProgress
{
    /**
     * @param  array{anime_id: string, episode_id: string, episode_number: int, progress_seconds: int, completed?: bool}  $data
     */
    public function handle(User $user, array $data): WatchHistory
    {
        return $user->watchHistories()->updateOrCreate(
            [
                'anime_id' => $data['anime_id'],
                'episode_id' => $data['episode_id'],
            ],
            [
                'episode_number' => $data['episode_number'],
                'progress_seconds' => $data['progress_seconds'],
                'completed' => $data['completed'] ?? false,
                'watched_at' => now(),
            ],
        );
    }
}
