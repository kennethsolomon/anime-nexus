<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class Watchlist extends Model
{
    /** @var list<string> */
    protected $fillable = [
        'user_id',
        'anime_id',
        'anime_title',
        'anime_image',
        'status',
        'content_type',
    ];

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
