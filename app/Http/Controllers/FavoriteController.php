<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\ToggleFavoriteRequest;
use App\Models\Favorite;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class FavoriteController extends Controller
{
    public function index(Request $request): Response
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        $contentType = $request->string('content_type', 'anime')->toString();
        if (! in_array($contentType, ['anime', 'drama'], true)) {
            $contentType = 'anime';
        }

        $favorites = $user->favorites()
            ->where('content_type', $contentType)
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('Favorites', [
            'favorites' => $favorites,
            'currentContentType' => $contentType,
        ]);
    }

    public function toggle(ToggleFavoriteRequest $request): RedirectResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        $validated = $request->validated();

        $existing = $user->favorites()
            ->where('anime_id', $validated['anime_id'])
            ->where('content_type', $validated['content_type'] ?? 'anime')
            ->first();

        if ($existing) {
            $existing->delete();
        } else {
            Favorite::create([
                'user_id' => $user->id,
                'anime_id' => $validated['anime_id'],
                'anime_title' => $validated['anime_title'],
                'anime_image' => $validated['anime_image'] ?? null,
                'content_type' => $validated['content_type'] ?? 'anime',
            ]);
        }

        return back();
    }
}
