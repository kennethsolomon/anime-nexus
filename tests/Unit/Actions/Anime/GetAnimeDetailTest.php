<?php

declare(strict_types=1);

use App\Actions\Anime\GetAnimeDetail;
use Illuminate\Support\Facades\Http;

it('fetches anime info from consumet service', function (): void {
    Http::fake([
        '*/anime/animekai/info*' => Http::response(['id' => 'naruto', 'title' => 'Naruto', 'episodes' => []], 200),
    ]);

    $action = app(GetAnimeDetail::class);
    $result = $action->handle('naruto');

    expect($result['id'])->toBe('naruto')
        ->and($result['title'])->toBe('Naruto');
});

it('passes provider parameter', function (): void {
    Http::fake([
        '*/anime/gogoanime/info*' => Http::response(['id' => 'naruto'], 200),
    ]);

    $action = app(GetAnimeDetail::class);
    $action->handle('naruto', 'gogoanime');

    Http::assertSent(fn ($request): bool => str_contains((string) $request->url(), 'gogoanime'));
});
