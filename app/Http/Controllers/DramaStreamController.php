<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\Drama\GetDramaDetail;
use App\Models\WatchHistory;
use App\Services\ConsumetService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

final class DramaStreamController extends Controller
{
    public function show(
        string $id,
        Request $request,
        GetDramaDetail $detailAction,
        ConsumetService $consumet,
    ): Response {
        $episodeId = $request->string('episodeId')->toString();
        $mediaId = $request->string('mediaId')->toString();
        $drama = $detailAction->handle($id);

        // Build embed URL via TMDB — skip Consumet streaming (all providers return 500)
        $embedUrl = null;
        $isMovie = ($drama['type'] ?? '') === 'Movie' || str_starts_with($id, 'movie/');
        $tmdbType = $isMovie ? 'Movie' : 'TV Series';
        $releaseYear = substr((string) ($drama['releaseDate'] ?? ''), 0, 4) ?: null;
        $tmdbId = $consumet->findTmdbId($drama['title'] ?? '', $tmdbType, $releaseYear);

        if ($tmdbId && $isMovie) {
            $embedUrl = "https://vidsrc.cc/v2/embed/movie/{$tmdbId}";
        } elseif ($tmdbId) {
            $currentEpisode = collect($drama['episodes'] ?? [])->firstWhere('id', $episodeId);
            $season = $currentEpisode['season'] ?? 1;
            $episode = $currentEpisode['number'] ?? 1;
            $embedUrl = "https://vidsrc.cc/v2/embed/tv/{$tmdbId}/{$season}/{$episode}";
        }

        $progress = null;
        if (Auth::check()) {
            /** @var \App\Models\User $user */
            $user = Auth::user();
            $progress = $user->watchHistories()
                ->where('anime_id', $id)
                ->where('episode_id', $episodeId)
                ->first();
        }

        return Inertia::render('DramaWatch', [
            'drama' => $drama,
            'streaming' => ['sources' => [], 'subtitles' => []],
            'episodeId' => $episodeId,
            'mediaId' => $mediaId,
            'embedUrl' => $embedUrl,
            'progress' => $progress instanceof WatchHistory ? $progress->progress_seconds : 0,
        ]);
    }
}
