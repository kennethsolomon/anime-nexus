<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class AddToWatchlistRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'anime_id' => ['required', 'string', 'max:255'],
            'anime_title' => ['required', 'string', 'max:255'],
            'anime_image' => ['nullable', 'url', 'max:2048'],
            'status' => ['sometimes', 'string', 'in:watching,plan_to_watch,completed,dropped'],
        ];
    }
}
