<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class SaveProgressRequest extends FormRequest
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
            'anime_title' => ['sometimes', 'string', 'max:255'],
            'anime_image' => ['sometimes', 'string', 'url', 'max:2048'],
            'episode_id' => ['required', 'string', 'max:255'],
            'episode_number' => ['required', 'integer', 'min:1'],
            'progress_seconds' => ['required', 'integer', 'min:0'],
            'completed' => ['sometimes', 'boolean'],
            'content_type' => ['sometimes', 'string', 'in:anime,drama'],
        ];
    }
}
