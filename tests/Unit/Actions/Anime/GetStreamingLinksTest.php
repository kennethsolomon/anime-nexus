<?php

declare(strict_types=1);

use App\Actions\Anime\GetStreamingLinks;
use Illuminate\Support\Facades\Http;

it('fetches streaming links from consumet service', function (): void {
    Http::fake([
        '*/anime/animekai/watch*' => Http::response(['sources' => [['url' => 'https://example.com/stream.m3u8']]], 200),
    ]);

    $action = app(GetStreamingLinks::class);
    $result = $action->handle('naruto-ep-1');

    expect($result['sources'])->toHaveCount(1);
});

it('fetches fresh links when fresh flag is true', function (): void {
    Http::fake([
        '*/anime/animekai/watch*' => Http::response(['sources' => [['url' => 'https://example.com/fresh.m3u8']]], 200),
    ]);

    $action = app(GetStreamingLinks::class);
    $result = $action->handle('naruto-ep-1', 'animekai', true);

    expect($result['sources'])->toHaveCount(1);
});
