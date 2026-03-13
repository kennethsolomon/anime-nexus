<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\Watchlist;
use Illuminate\Foundation\Http\FormRequest;

final class UpdateWatchlistRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Watchlist|null $watchlist */
        $watchlist = $this->route('watchlist');

        return $watchlist !== null && $this->user()?->id === $watchlist->user_id;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'status' => ['required', 'string', 'in:watching,plan_to_watch,completed,dropped'],
        ];
    }
}
