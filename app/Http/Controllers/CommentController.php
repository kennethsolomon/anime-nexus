<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Comment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

final class CommentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $animeId = $request->string('anime_id')->toString();
        $episodeId = $request->string('episode_id')->toString();

        $comments = Comment::where('anime_id', $animeId)
            ->where('episode_id', $episodeId)
            ->whereNull('parent_id')
            ->with(['user:id,name', 'replies.user:id,name'])
            ->orderByDesc('created_at')
            ->get();

        return response()->json($comments);
    }

    public function store(Request $request): RedirectResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        $validated = $request->validate([
            'anime_id' => ['required', 'string', 'max:255'],
            'episode_id' => ['required', 'string', 'max:255'],
            'content_type' => ['sometimes', 'string', 'in:anime,drama'],
            'body' => ['required', 'string', 'max:2000'],
            'parent_id' => ['nullable', 'integer', 'exists:comments,id'],
        ]);

        // Strip HTML tags for XSS prevention
        $validated['body'] = strip_tags($validated['body']);

        Comment::create([
            'user_id' => $user->id,
            ...$validated,
        ]);

        return back();
    }

    public function destroy(Request $request, Comment $comment): RedirectResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        if ($comment->user_id !== $user->id) {
            abort(403);
        }

        $comment->delete();

        return back();
    }
}
