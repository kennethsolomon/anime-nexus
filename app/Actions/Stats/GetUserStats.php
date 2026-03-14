<?php

declare(strict_types=1);

namespace App\Actions\Stats;

use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

final class GetUserStats
{
    /**
     * @return array<string, mixed>
     */
    public function handle(User $user): array
    {
        return Cache::remember(
            "user_stats:{$user->id}",
            300, // 5 minutes
            fn (): array => $this->compute($user),
        );
    }

    /**
     * @return array<string, mixed>
     */
    private function compute(User $user): array
    {
        // Single aggregate query for basic stats
        $aggregates = DB::table('watch_histories')
            ->where('user_id', $user->id)
            ->selectRaw('COUNT(CASE WHEN completed = 1 THEN 1 END) as total_episodes')
            ->selectRaw('COALESCE(SUM(progress_seconds), 0) as total_seconds')
            ->selectRaw('COUNT(DISTINCT anime_id) as unique_anime')
            ->selectRaw('COUNT(DISTINCT CASE WHEN completed = 1 THEN anime_id END) as completed_anime')
            ->selectRaw('COUNT(DISTINCT CASE WHEN content_type = \'anime\' THEN anime_id END) as anime_count')
            ->selectRaw('COUNT(DISTINCT CASE WHEN content_type = \'drama\' THEN anime_id END) as drama_count')
            ->first();

        $totalEpisodes = (int) ($aggregates?->total_episodes ?? 0);
        $totalSeconds = (int) ($aggregates?->total_seconds ?? 0);
        $uniqueAnime = (int) ($aggregates?->unique_anime ?? 0);
        $completedAnime = (int) ($aggregates?->completed_anime ?? 0);
        $animeCount = (int) ($aggregates?->anime_count ?? 0);
        $dramaCount = (int) ($aggregates?->drama_count ?? 0);

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
        $activityDays = DB::table('watch_histories')
            ->where('user_id', $user->id)
            ->selectRaw('DATE(watched_at) as day')
            ->distinct()
            ->orderByDesc('day')
            ->pluck('day')
            ->toArray();

        if (count($activityDays) > 0) {
            $today = now()->format('Y-m-d');
            $yesterday = now()->subDay()->format('Y-m-d');

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
