<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Review;
use App\Models\User;

final class ReviewPolicy
{
    public function delete(User $user, Review $review): bool
    {
        return $user->id === $review->user_id;
    }
}
