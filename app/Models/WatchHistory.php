<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class WatchHistory extends Model
{
    /** @var list<string> */
    protected $fillable = [
        'user_id',
        'anime_id',
        'anime_title',
        'anime_image',
        'episode_id',
        'episode_number',
        'progress_seconds',
        'completed',
        'content_type',
        'watched_at',
    ];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'episode_number' => 'integer',
            'progress_seconds' => 'integer',
            'completed' => 'boolean',
            'watched_at' => 'immutable_datetime',
        ];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
