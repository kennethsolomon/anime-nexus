<?php

declare(strict_types=1);

use App\Models\Favorite;
use App\Models\User;

it('requires authentication for favorites', function (): void {
    $this->get(route('favorites.index'))->assertRedirect(route('login'));
    $this->post(route('favorites.toggle'))->assertRedirect(route('login'));
});

it('displays favorites page', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('favorites.index'))
        ->assertStatus(200)
        ->assertInertia(fn ($page) => $page->component('Favorites'));
});

it('toggles favorite on', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('favorites.toggle'), [
            'anime_id' => 'test-anime',
            'anime_title' => 'Test Anime',
            'anime_image' => 'https://example.com/image.jpg',
            'content_type' => 'anime',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('favorites', [
        'user_id' => $user->id,
        'anime_id' => 'test-anime',
    ]);
});

it('toggles favorite off', function (): void {
    $user = User::factory()->create();

    Favorite::create([
        'user_id' => $user->id,
        'anime_id' => 'test-anime',
        'anime_title' => 'Test Anime',
        'content_type' => 'anime',
    ]);

    $this->actingAs($user)
        ->post(route('favorites.toggle'), [
            'anime_id' => 'test-anime',
            'anime_title' => 'Test Anime',
            'content_type' => 'anime',
        ])
        ->assertRedirect();

    $this->assertDatabaseMissing('favorites', [
        'user_id' => $user->id,
        'anime_id' => 'test-anime',
    ]);
});

it('filters favorites by content type', function (): void {
    $user = User::factory()->create();

    Favorite::create([
        'user_id' => $user->id,
        'anime_id' => 'anime-1',
        'anime_title' => 'Anime 1',
        'content_type' => 'anime',
    ]);

    Favorite::create([
        'user_id' => $user->id,
        'anime_id' => 'drama-1',
        'anime_title' => 'Drama 1',
        'content_type' => 'drama',
    ]);

    $this->actingAs($user)
        ->get(route('favorites.index', ['content_type' => 'drama']))
        ->assertInertia(fn ($page) => $page
            ->component('Favorites')
            ->has('favorites', 1)
            ->where('currentContentType', 'drama')
        );
});
