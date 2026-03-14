<?php

declare(strict_types=1);

namespace App\Actions\Review;

use App\Models\Review;
use App\Models\User;

final class SubmitReview
{
    /**
     * @param  array{anime_id: string, content_type?: string, rating: int, body?: string|null}  $data
     */
    public function handle(User $user, array $data): Review
    {
        return Review::updateOrCreate(
            [
                'user_id' => $user->id,
                'anime_id' => $data['anime_id'],
                'content_type' => $data['content_type'] ?? 'anime',
            ],
            [
                'rating' => $data['rating'],
                'body' => isset($data['body']) ? strip_tags((string) $data['body']) : null,
            ],
        );
    }
}
