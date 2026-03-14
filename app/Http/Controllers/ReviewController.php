<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\Review\SubmitReview;
use App\Http\Requests\StoreReviewRequest;
use App\Models\Review;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

final class ReviewController extends Controller
{
    public function store(StoreReviewRequest $request, SubmitReview $action): RedirectResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        /** @var array{anime_id: string, content_type?: string, rating: int, body?: string|null} $validated */
        $validated = $request->validated();

        $action->handle($user, $validated);

        return back();
    }

    public function destroy(Request $request, Review $review): RedirectResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        if ($review->user_id !== $user->id) {
            abort(403);
        }

        $review->delete();

        return back();
    }
}
