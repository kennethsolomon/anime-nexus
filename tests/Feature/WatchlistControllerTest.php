<?php

declare(strict_types=1);

use App\Models\User;
use App\Models\Watchlist;

it('requires authentication for watchlist', function (): void {
    $this->get(route('watchlist.index'))->assertRedirect(route('login'));
});

it('displays the watchlist page', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('watchlist.index'))
        ->assertStatus(200)
        ->assertInertia(fn ($page) => $page->component('Watchlist'));
});

it('adds anime to watchlist', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('watchlist.store'), [
            'anime_id' => 'spy-x-family',
            'anime_title' => 'Spy x Family',
            'anime_image' => 'https://example.com/spy.jpg',
            'status' => 'watching',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('watchlists', [
        'user_id' => $user->id,
        'anime_id' => 'spy-x-family',
        'status' => 'watching',
    ]);
});

it('updates watchlist status', function (): void {
    $user = User::factory()->create();
    $watchlist = Watchlist::create([
        'user_id' => $user->id,
        'anime_id' => 'naruto',
        'anime_title' => 'Naruto',
        'status' => 'watching',
    ]);

    $this->actingAs($user)
        ->patch(route('watchlist.update', $watchlist), [
            'status' => 'completed',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('watchlists', [
        'id' => $watchlist->id,
        'status' => 'completed',
    ]);
});

it('removes anime from watchlist', function (): void {
    $user = User::factory()->create();
    $watchlist = Watchlist::create([
        'user_id' => $user->id,
        'anime_id' => 'naruto',
        'anime_title' => 'Naruto',
        'status' => 'watching',
    ]);

    $this->actingAs($user)
        ->delete(route('watchlist.destroy', $watchlist))
        ->assertRedirect();

    $this->assertDatabaseMissing('watchlists', [
        'id' => $watchlist->id,
    ]);
});

it('prevents deleting another users watchlist entry', function (): void {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $watchlist = Watchlist::create([
        'user_id' => $owner->id,
        'anime_id' => 'naruto',
        'anime_title' => 'Naruto',
        'status' => 'watching',
    ]);

    $this->actingAs($other)
        ->delete(route('watchlist.destroy', $watchlist))
        ->assertForbidden();
});

it('filters watchlist by status', function (): void {
    $user = User::factory()->create();
    Watchlist::create([
        'user_id' => $user->id,
        'anime_id' => 'naruto',
        'anime_title' => 'Naruto',
        'status' => 'watching',
    ]);
    Watchlist::create([
        'user_id' => $user->id,
        'anime_id' => 'bleach',
        'anime_title' => 'Bleach',
        'status' => 'completed',
    ]);

    $this->actingAs($user)
        ->get(route('watchlist.index', ['status' => 'watching']))
        ->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('Watchlist')
            ->where('currentStatus', 'watching')
            ->has('watchlist', 1)
        );
});
