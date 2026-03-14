<?php

declare(strict_types=1);

namespace App\Actions\Stats;

use App\Models\User;
use Illuminate\Support\Facades\DB;

final class GetUserStats
{
    /**
     * @return array<string, mixed>
     */
    public function handle(User $user): array
    {
        $histories = $user->watchHistories();

        $totalEpisodes = (int) $histories->where('completed', true)->count();
        $totalSeconds = (int) $histories->sum('progress_seconds');

        $uniqueAnime = (int) $histories->distinct('anime_id')->count('anime_id');
        $completedAnime = (int) $histories->clone()
            ->select('anime_id')
            ->where('completed', true)
            ->distinct()
            ->count('anime_id');

        $completionRate = $uniqueAnime > 0 ? round(($completedAnime / $uniqueAnime) * 100, 1) : 0;

        // Most watched (top 5 by episode count)
        /** @var array<int, array{anime_id: string, anime_title: string, anime_image: string|null, episode_count: int}> $mostWatched */
        $mostWatched = DB::table('watch_histories')
            ->where('user_id', $user->id)
            ->select('anime_id', 'anime_title', 'anime_image', DB::raw('COUNT(*) as episode_count'))
            ->groupBy('anime_id', 'anime_title', 'anime_image')
            ->orderByDesc('episode_count')
            ->limit(5)
            ->get()
            ->map(fn (object $row): array => [
                'anime_id' => (string) $row->anime_id,
                'anime_title' => (string) ($row->anime_title ?? $row->anime_id),
                'anime_image' => $row->anime_image !== null ? (string) $row->anime_image : null,
                'episode_count' => (int) $row->episode_count,
            ])
            ->toArray();

        // Current streak (consecutive days with activity)
        $streak = 0;
        $activityDays = $user->watchHistories()
            ->select(DB::raw('DATE(watched_at) as day'))
            ->distinct()
            ->orderByDesc('day')
            ->pluck('day')
            ->toArray();

        if (count($activityDays) > 0) {
            $today = now()->format('Y-m-d');
            $yesterday = now()->subDay()->format('Y-m-d');

            // Streak starts from today or yesterday
            if ($activityDays[0] === $today || $activityDays[0] === $yesterday) {
                $streak = 1;
                $counter = count($activityDays);
                for ($i = 1; $i < $counter; $i++) {
                    $expected = now()->subDays($i + ($activityDays[0] === $yesterday ? 1 : 0))->format('Y-m-d');
                    if ($activityDays[$i] === $expected) {
                        $streak++;
                    } else {
                        break;
                    }
                }
            }
        }

        $animeCount = (int) $user->watchHistories()->where('content_type', 'anime')->distinct('anime_id')->count('anime_id');
        $dramaCount = (int) $user->watchHistories()->where('content_type', 'drama')->distinct('anime_id')->count('anime_id');

        return [
            'totalEpisodes' => $totalEpisodes,
            'totalSeconds' => $totalSeconds,
            'completionRate' => (float) $completionRate,
            'currentStreak' => $streak,
            'mostWatched' => $mostWatched,
            'animeCount' => $animeCount,
            'dramaCount' => $dramaCount,
        ];
    }
}
