<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\History\GetWatchHistory;
use App\Actions\History\SaveWatchProgress;
use App\Http\Requests\SaveProgressRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class HistoryController extends Controller
{
    public function index(Request $request, GetWatchHistory $action): Response
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        $contentType = $request->string('content_type', 'anime')->toString();
        if (! in_array($contentType, ['anime', 'drama'], true)) {
            $contentType = 'anime';
        }

        $history = $action->handle($user)
            ->where('content_type', $contentType)
            ->values();

        return Inertia::render('History', [
            'history' => $history,
            'currentContentType' => $contentType,
        ]);
    }

    public function store(SaveProgressRequest $request, SaveWatchProgress $action): RedirectResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        /** @var array{anime_id: string, episode_id: string, episode_number: int, progress_seconds: int, completed?: bool} $validated */
        $validated = $request->validated();

        $action->handle($user, $validated);

        return back();
    }
}
