<?php

declare(strict_types=1);

namespace App\Actions\History;

use App\Models\User;
use App\Models\WatchHistory;
use Illuminate\Support\Facades\Cache;

final class SaveWatchProgress
{
    /**
     * @param  array{anime_id: string, anime_title?: string, anime_image?: string, episode_id: string, episode_number: int, progress_seconds: int, completed?: bool, content_type?: string}  $data
     */
    public function handle(User $user, array $data): WatchHistory
    {
        $attributes = [
            'episode_number' => $data['episode_number'],
            'progress_seconds' => $data['progress_seconds'],
            'completed' => $data['completed'] ?? false,
            'watched_at' => now(),
        ];

        if (isset($data['anime_title'])) {
            $attributes['anime_title'] = $data['anime_title'];
        }

        if (isset($data['anime_image'])) {
            $attributes['anime_image'] = $data['anime_image'];
        }

        if (isset($data['content_type'])) {
            $attributes['content_type'] = $data['content_type'];
        }

        $history = $user->watchHistories()->updateOrCreate(
            [
                'anime_id' => $data['anime_id'],
                'episode_id' => $data['episode_id'],
            ],
            $attributes,
        );

        Cache::forget("user_stats:{$user->id}");

        return $history;
    }
}
