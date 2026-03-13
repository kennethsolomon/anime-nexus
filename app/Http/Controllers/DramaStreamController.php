<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\Drama\GetDramaDetail;
use App\Actions\Drama\GetDramaStreamingLinks;
use App\Models\WatchHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

final class DramaStreamController extends Controller
{
    public function show(
        string $id,
        Request $request,
        GetDramaStreamingLinks $streamingAction,
        GetDramaDetail $detailAction,
    ): Response {
        $episodeId = $request->string('episodeId')->toString();
        $mediaId = $request->string('mediaId')->toString();
        $drama = $detailAction->handle($id);
        $streaming = $streamingAction->handle($episodeId, $mediaId);

        // Rewrite source and subtitle URLs to go through our proxy
        $referer = $streaming['headers']['Referer'] ?? '';

        if (! empty($streaming['sources'])) {
            $streaming['sources'] = array_map(function (array $source) use ($referer): array {
                $source['url'] = route('stream.proxy', [
                    'url' => $source['url'],
                    'referer' => $referer,
                ]);

                return $source;
            }, $streaming['sources']);
        }

        if (! empty($streaming['subtitles'])) {
            $streaming['subtitles'] = array_map(function (array $sub) use ($referer): array {
                if (! empty($sub['url'])) {
                    $sub['url'] = route('stream.proxy', [
                        'url' => $sub['url'],
                        'referer' => $referer,
                    ]);
                }

                return $sub;
            }, $streaming['subtitles']);
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
            'streaming' => $streaming,
            'episodeId' => $episodeId,
            'mediaId' => $mediaId,
            'progress' => $progress instanceof WatchHistory ? $progress->progress_seconds : 0,
        ]);
    }
}
