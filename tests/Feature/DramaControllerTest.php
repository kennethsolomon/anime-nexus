<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Http;

beforeEach(function (): void {
    Http::fake([
        '*/movies/flixhq/trending*' => Http::response(['results' => [
            ['id' => 'tv/watch-vincenzo-67955', 'title' => 'Vincenzo', 'image' => 'https://example.com/vincenzo.jpg', 'type' => 'TV Series'],
            ['id' => 'movie/watch-parasite-12345', 'title' => 'Parasite', 'image' => 'https://example.com/parasite.jpg', 'type' => 'Movie'],
        ]], 200),
        '*/movies/flixhq/info*' => Http::response([
            'id' => 'tv/watch-vincenzo-67955',
            'title' => 'Vincenzo',
            'image' => 'https://example.com/vincenzo.jpg',
            'episodes' => [
                ['id' => '1167571', 'title' => 'Episode 1', 'number' => 1, 'season' => 1],
            ],
        ], 200),
        '*/meta/tmdb/*' => Http::response(['results' => [
            ['id' => 117376, 'title' => 'Vincenzo', 'type' => 'TV Series'],
        ]], 200),
        '*/movies/flixhq/*' => Http::response(['results' => [
            ['id' => 'tv/watch-vincenzo-67955', 'title' => 'Vincenzo', 'image' => 'https://example.com/vincenzo.jpg'],
        ]], 200),
    ]);
});

it('renders drama home page', function (): void {
    $response = $this->get(route('drama.home'));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('DramaHome')
        ->has('trending')
    );
});

it('renders drama search results', function (): void {
    $response = $this->get(route('drama.search', ['q' => 'vincenzo']));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('DramaSearch')
        ->has('query')
        ->has('results')
    );
});

it('renders drama search page without query', function (): void {
    $response = $this->get(route('drama.search'));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page->component('DramaSearch'));
});

it('renders drama detail page', function (): void {
    $response = $this->get(route('drama.show', ['id' => 'tv/watch-vincenzo-67955']));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('DramaDetail')
        ->has('drama')
    );
});

it('renders drama watch page', function (): void {
    $response = $this->get(route('drama.watch', [
        'id' => 'tv/watch-vincenzo-67955',
        'episodeId' => '1167571',
        'mediaId' => 'tv/watch-vincenzo-67955',
    ]));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('DramaWatch')
        ->has('drama')
        ->has('streaming')
    );
});

it('filters trending to tv series only', function (): void {
    $response = $this->get(route('drama.home'));

    $response->assertInertia(function ($page) {
        $trending = $page->toArray()['props']['trending'];
        foreach ($trending['results'] as $item) {
            expect($item['type'])->toBe('TV Series');
        }
    });
});
