<?php

declare(strict_types=1);

use App\Actions\Drama\GetDramaDetail;
use App\Actions\Drama\GetDramaTrending;
use App\Actions\Drama\SearchDrama;
use App\Services\ConsumetService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

beforeEach(function (): void {
    Cache::flush();
});

it('GetDramaTrending delegates to consumet service and filters TV Series', function (): void {
    Http::fake([
        '*/movies/flixhq/trending*' => Http::response([
            'results' => [
                ['id' => '1', 'title' => 'Drama One', 'type' => 'TV Series'],
                ['id' => '2', 'title' => 'Movie One', 'type' => 'Movie'],
                ['id' => '3', 'title' => 'Drama Two', 'type' => 'TV Series'],
            ],
        ]),
    ]);

    $consumet = new ConsumetService('http://localhost:3000');
    $action = new GetDramaTrending($consumet);
    $result = $action->handle(1);

    expect($result['results'])->toHaveCount(2)
        ->and($result['results'][0]['title'])->toBe('Drama One')
        ->and($result['results'][1]['title'])->toBe('Drama Two');
});

it('GetDramaTrending passes custom page number', function (): void {
    Http::fake([
        '*/movies/flixhq/trending*' => Http::response([
            'results' => [],
        ]),
    ]);

    $consumet = new ConsumetService('http://localhost:3000');
    $action = new GetDramaTrending($consumet);
    $result = $action->handle(3);

    expect($result['results'])->toBe([]);

    Http::assertSent(fn ($request): bool => str_contains((string) $request->url(), 'page=3'));
});

it('SearchDrama delegates to consumet service', function (): void {
    Http::fake([
        '*/movies/flixhq/vincenzo*' => Http::response([
            'results' => [
                ['id' => 'drama-1', 'title' => 'Vincenzo'],
            ],
        ]),
    ]);

    $consumet = new ConsumetService('http://localhost:3000');
    $action = new SearchDrama($consumet);
    $result = $action->handle('vincenzo', 1);

    expect($result['results'])->toHaveCount(1)
        ->and($result['results'][0]['title'])->toBe('Vincenzo');
});

it('SearchDrama passes custom page number', function (): void {
    Http::fake([
        '*/movies/flixhq/goblin*' => Http::response([
            'results' => [
                ['id' => 'drama-2', 'title' => 'Goblin'],
            ],
        ]),
    ]);

    $consumet = new ConsumetService('http://localhost:3000');
    $action = new SearchDrama($consumet);
    $result = $action->handle('goblin', 2);

    Http::assertSent(fn ($request): bool => str_contains((string) $request->url(), 'page=2'));
});

it('GetDramaDetail delegates to consumet service with default provider', function (): void {
    Http::fake([
        '*/movies/flixhq/info*' => Http::response([
            'id' => 'drama-456',
            'title' => 'Test Drama',
            'episodes' => [],
        ]),
    ]);

    $consumet = new ConsumetService('http://localhost:3000');
    $action = new GetDramaDetail($consumet);
    $result = $action->handle('drama-456');

    expect($result['id'])->toBe('drama-456')
        ->and($result['title'])->toBe('Test Drama');

    Http::assertSent(fn ($request): bool => str_contains((string) $request->url(), '/movies/flixhq/info'));
});

it('GetDramaDetail passes custom provider', function (): void {
    Http::fake([
        '*/movies/goku/info*' => Http::response([
            'id' => 'drama-789',
            'title' => 'Goku Drama',
        ]),
    ]);

    $consumet = new ConsumetService('http://localhost:3000');
    $action = new GetDramaDetail($consumet);
    $result = $action->handle('drama-789', 'goku');

    expect($result['id'])->toBe('drama-789');

    Http::assertSent(fn ($request): bool => str_contains((string) $request->url(), '/movies/goku/info'));
});
