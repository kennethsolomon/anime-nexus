<?php

declare(strict_types=1);

use App\Actions\Anime\SearchAnime;
use Illuminate\Support\Facades\Http;

it('delegates search to consumet service', function (): void {
    Http::fake([
        '*/anime/animekai/naruto*' => Http::response(['results' => [['id' => 'naruto', 'title' => 'Naruto']]], 200),
    ]);

    $action = app(SearchAnime::class);
    $result = $action->handle('naruto');

    expect($result['results'])->toHaveCount(1)
        ->and($result['results'][0]['id'])->toBe('naruto');
});

it('passes page parameter', function (): void {
    Http::fake([
        '*/anime/animekai/bleach*' => Http::response(['results' => []], 200),
    ]);

    $action = app(SearchAnime::class);
    $result = $action->handle('bleach', 3);

    expect($result['results'])->toBeEmpty();

    Http::assertSent(fn ($request): bool => str_contains((string) $request->url(), 'page=3'));
});
