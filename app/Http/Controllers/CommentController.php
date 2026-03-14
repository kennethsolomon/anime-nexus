<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreCommentRequest;
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

    public function store(StoreCommentRequest $request): RedirectResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        /** @var array{anime_id: string, episode_id: string, content_type?: string, body: string, parent_id?: int|null} $validated */
        $validated = $request->validated();
        $validated['body'] = strip_tags($validated['body']);

        Comment::create([
            'user_id' => $user->id,
            ...$validated,
        ]);

        return back();
    }

    public function destroy(Request $request, Comment $comment): RedirectResponse
    {
        $this->authorize('delete', $comment);

        $comment->delete();

        return back();
    }
}
