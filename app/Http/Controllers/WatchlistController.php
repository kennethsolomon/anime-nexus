<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\Watchlist\AddToWatchlist;
use App\Actions\Watchlist\RemoveFromWatchlist;
use App\Actions\Watchlist\UpdateWatchlistStatus;
use App\Http\Requests\AddToWatchlistRequest;
use App\Http\Requests\UpdateWatchlistRequest;
use App\Models\Watchlist;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class WatchlistController extends Controller
{
    public function index(Request $request): Response
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        $allowedStatuses = ['all', 'watching', 'plan_to_watch', 'completed', 'dropped'];
        $status = $request->string('status', 'all')->toString();

        if (! in_array($status, $allowedStatuses, true)) {
            $status = 'all';
        }

        $contentType = $request->string('content_type', 'anime')->toString();
        if (! in_array($contentType, ['anime', 'drama'], true)) {
            $contentType = 'anime';
        }

        $query = $user->watchlists()->where('content_type', $contentType)->orderByDesc('updated_at');

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        return Inertia::render('Watchlist', [
            'watchlist' => $query->get(),
            'currentStatus' => $status,
            'currentContentType' => $contentType,
        ]);
    }

    public function store(AddToWatchlistRequest $request, AddToWatchlist $action): RedirectResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        /** @var array{anime_id: string, anime_title: string, anime_image: string|null, status?: string, content_type?: string} $validated */
        $validated = $request->validated();

        $action->handle($user, $validated);

        return back();
    }

    public function update(
        UpdateWatchlistRequest $request,
        Watchlist $watchlist,
        UpdateWatchlistStatus $action,
    ): RedirectResponse {
        /** @var string $status */
        $status = $request->validated('status');
        $action->handle($watchlist, $status);

        return back();
    }

    public function destroy(Request $request, Watchlist $watchlist, RemoveFromWatchlist $action): RedirectResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        if ($watchlist->user_id !== $user->id) {
            abort(403);
        }

        $action->handle($watchlist);

        return back();
    }
}
