<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\Drama\GetDramaDetail;
use App\Actions\Drama\GetDramaTrending;
use App\Actions\Drama\SearchDrama;
use App\Actions\History\GetWatchHistory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class DramaController extends Controller
{
    public function index(Request $request, GetDramaTrending $action, GetWatchHistory $historyAction): Response
    {
        $trending = $action->handle();

        $continueWatching = [];
        if ($request->user()) {
            /** @var \App\Models\User $user */
            $user = $request->user();
            $continueWatching = $historyAction->handle($user, 10)
                ->where('completed', false)
                ->where('content_type', 'drama')
                ->values()
                ->toArray();
        }

        return Inertia::render('DramaHome', [
            'trending' => $trending,
            'continueWatching' => $continueWatching,
        ]);
    }

    public function search(Request $request, SearchDrama $action): Response
    {
        $query = $request->string('q')->toString();
        $page = $request->integer('page', 1);

        return Inertia::render('DramaSearch', [
            'results' => $query !== '' ? $action->handle($query, $page) : [],
            'query' => $query,
            'page' => $page,
        ]);
    }

    public function show(string $id, Request $request, GetDramaDetail $action): Response
    {
        $drama = $action->handle($id);

        $watchlistEntry = null;
        if ($request->user()) {
            /** @var \App\Models\User $user */
            $user = $request->user();
            $watchlistEntry = $user->watchlists()->where('anime_id', $id)->first();
        }

        return Inertia::render('DramaDetail', [
            'drama' => $drama,
            'watchlistEntry' => $watchlistEntry,
        ]);
    }
}
