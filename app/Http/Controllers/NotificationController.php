<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\EpisodeNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

final class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        $notifications = EpisodeNotification::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->limit(20)
            ->get();

        $unreadCount = EpisodeNotification::where('user_id', $user->id)
            ->where('read', false)
            ->count();

        return response()->json([
            'notifications' => $notifications,
            'unreadCount' => $unreadCount,
        ]);
    }

    public function markRead(Request $request, EpisodeNotification $episodeNotification): RedirectResponse
    {
        $this->authorize('update', $episodeNotification);

        $episodeNotification->update(['read' => true]);

        return back();
    }

    public function markAllRead(Request $request): RedirectResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        EpisodeNotification::where('user_id', $user->id)
            ->where('read', false)
            ->update(['read' => true]);

        return back();
    }
}
