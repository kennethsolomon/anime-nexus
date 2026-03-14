<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class EpisodeNotification extends Model
{
    public $timestamps = false;

    protected $table = 'episode_notifications';

    /** @var list<string> */
    protected $fillable = [
        'user_id',
        'anime_id',
        'anime_title',
        'anime_image',
        'content_type',
        'message',
        'read',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'read' => 'boolean',
        ];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
