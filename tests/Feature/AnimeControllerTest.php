<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Http;

beforeEach(function (): void {
    Http::fake([
        '*/anime/animekai/trending*' => Http::response(['results' => [['id' => 'spy-x-family', 'title' => 'Spy x Family', 'image' => 'https://example.com/spy.jpg']]], 200),
        '*/anime/animekai/popular*' => Http::response(['results' => []], 200),
        '*/anime/animekai/recent-episodes*' => Http::response(['results' => []], 200),
        '*/anime/animekai/info*' => Http::response(['id' => 'naruto', 'title' => 'Naruto', 'image' => 'https://example.com/naruto.jpg', 'episodes' => []], 200),
        '*/anime/animekai/genre*' => Http::response(['results' => []], 200),
        '*/anime/animekai/*' => Http::response(['results' => [['id' => 'naruto', 'title' => 'Naruto', 'image' => 'https://example.com/naruto.jpg']]], 200),
    ]);
});

it('renders the home page', function (): void {
    $response = $this->get(route('home'));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page->component('Home'));
});

it('renders search results', function (): void {
    $response = $this->get(route('anime.search', ['q' => 'naruto']));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('Search')
        ->has('query')
        ->has('results')
    );
});

it('renders search page without query', function (): void {
    $response = $this->get(route('anime.search'));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page->component('Search'));
});

it('renders genre page', function (): void {
    $response = $this->get(route('anime.genre', ['genre' => 'action']));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('Search')
        ->where('isGenre', true)
    );
});

it('renders anime detail page', function (): void {
    $response = $this->get(route('anime.show', ['id' => 'naruto']));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('AnimeDetail')
        ->has('anime')
    );
});
