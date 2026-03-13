<?php

declare(strict_types=1);

use App\Actions\Anime\GetTrending;
use Illuminate\Support\Facades\Http;

it('returns trending, popular, and recent data', function (): void {
    Http::fake([
        '*/anime/animekai/trending*' => Http::response(['results' => [['id' => 'spy']]], 200),
        '*/anime/animekai/popular*' => Http::response(['results' => [['id' => 'naruto']]], 200),
        '*/anime/animekai/recent-episodes*' => Http::response(['results' => [['id' => 'bleach']]], 200),
    ]);

    $action = app(GetTrending::class);
    $result = $action->handle();

    expect($result)->toHaveKeys(['trending', 'popular', 'recent'])
        ->and($result['trending']['results'][0]['id'])->toBe('spy')
        ->and($result['popular']['results'][0]['id'])->toBe('naruto')
        ->and($result['recent']['results'][0]['id'])->toBe('bleach');
});
