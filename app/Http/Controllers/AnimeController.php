<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\Anime\GetAnimeDetail;
use App\Actions\Anime\GetTrending;
use App\Actions\Anime\SearchAnime;
use App\Actions\History\GetWatchHistory;
use App\Services\ConsumetService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class AnimeController extends Controller
{
    public function index(Request $request, GetTrending $action, GetWatchHistory $historyAction): Response
    {
        $data = $action->handle();

        $continueWatching = [];
        if ($request->user()) {
            /** @var \App\Models\User $user */
            $user = $request->user();
            $continueWatching = $historyAction->handle($user, 10)
                ->where('completed', false)
                ->values()
                ->toArray();
        }

        return Inertia::render('Home', [
            'trending' => $data['trending'],
            'popular' => $data['popular'],
            'recent' => $data['recent'],
            'continueWatching' => $continueWatching,
        ]);
    }

    public function search(Request $request, SearchAnime $action): Response
    {
        $query = $request->string('q')->toString();
        $page = $request->integer('page', 1);

        return Inertia::render('Search', [
            'results' => $query !== '' ? $action->handle($query, $page) : [],
            'query' => $query,
            'page' => $page,
        ]);
    }

    public function genre(string $genre, Request $request, ConsumetService $consumet): Response
    {
        $page = $request->integer('page', 1);

        return Inertia::render('Search', [
            'results' => $consumet->getByGenre($genre, $page),
            'query' => $genre,
            'page' => $page,
            'isGenre' => true,
        ]);
    }

    public function show(string $id, Request $request, GetAnimeDetail $action): Response
    {
        $anime = $action->handle($id);

        $watchlistEntry = null;
        if ($request->user()) {
            /** @var \App\Models\User $user */
            $user = $request->user();
            $watchlistEntry = $user->watchlists()->where('anime_id', $id)->first();
        }

        return Inertia::render('AnimeDetail', [
            'anime' => $anime,
            'watchlistEntry' => $watchlistEntry,
        ]);
    }
}
