<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Add last_notified_episode column to watchlists
        Schema::table('watchlists', function (Blueprint $table): void {
            $table->unsignedInteger('last_notified_episode')->nullable()->after('content_type');
        });

        // 2. Delete duplicate episode_notifications (keep newest per user+anime)
        $duplicates = DB::table('episode_notifications')
            ->select('user_id', 'anime_id')
            ->groupBy('user_id', 'anime_id')
            ->havingRaw('COUNT(*) > 1')
            ->get();

        foreach ($duplicates as $dup) {
            $keepId = DB::table('episode_notifications')
                ->where('user_id', $dup->user_id)
                ->where('anime_id', $dup->anime_id)
                ->orderByDesc('created_at')
                ->value('id');

            DB::table('episode_notifications')
                ->where('user_id', $dup->user_id)
                ->where('anime_id', $dup->anime_id)
                ->where('id', '!=', $keepId)
                ->delete();
        }

        // 3. Backfill last_notified_episode from existing notifications
        // For each watchlist item that has a notification, set last_notified_episode
        // to the total episodes that were known when the notification was created.
        // Since we don't store the exact episode count, we use the max episode_number
        // from watch_histories + 1 as a reasonable approximation (they were notified
        // because totalEpisodes > maxWatched).
        DB::table('watchlists')
            ->whereIn('anime_id', function ($query): void {
                $query->select('anime_id')
                    ->from('episode_notifications')
                    ->distinct();
            })
            ->whereIn('user_id', function ($query): void {
                $query->select('user_id')
                    ->from('episode_notifications')
                    ->distinct();
            })
            ->update([
                'last_notified_episode' => DB::raw('(
                    SELECT COALESCE(MAX(wh.episode_number), 0) + 1
                    FROM watch_histories wh
                    WHERE wh.user_id = watchlists.user_id
                    AND wh.anime_id = watchlists.anime_id
                )'),
            ]);
    }

    public function down(): void
    {
        Schema::table('watchlists', function (Blueprint $table): void {
            $table->dropColumn('last_notified_episode');
        });
    }
};
