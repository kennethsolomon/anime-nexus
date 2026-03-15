<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\EpisodeNotification;
use App\Models\User;

final class EpisodeNotificationPolicy
{
    public function update(User $user, EpisodeNotification $notification): bool
    {
        return $user->id === $notification->user_id;
    }

    public function delete(User $user, EpisodeNotification $notification): bool
    {
        return $user->id === $notification->user_id;
    }
}
