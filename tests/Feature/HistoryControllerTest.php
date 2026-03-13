<?php

declare(strict_types=1);

use App\Models\User;

it('requires authentication for history', function (): void {
    $this->get(route('history.index'))->assertRedirect(route('login'));
    $this->post(route('history.store'))->assertRedirect(route('login'));
});

it('displays the history page', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('history.index'))
        ->assertStatus(200)
        ->assertInertia(fn ($page) => $page->component('History'));
});

it('saves watch progress', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('history.store'), [
            'anime_id' => 'naruto',
            'episode_id' => 'naruto-ep-1',
            'episode_number' => 1,
            'progress_seconds' => 300,
            'completed' => false,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('watch_histories', [
        'user_id' => $user->id,
        'anime_id' => 'naruto',
        'episode_id' => 'naruto-ep-1',
        'progress_seconds' => 300,
        'completed' => false,
    ]);
});

it('updates existing watch progress', function (): void {
    $user = User::factory()->create();

    // First save
    $this->actingAs($user)->post(route('history.store'), [
        'anime_id' => 'naruto',
        'episode_id' => 'naruto-ep-1',
        'episode_number' => 1,
        'progress_seconds' => 300,
    ]);

    // Second save (update)
    $this->actingAs($user)->post(route('history.store'), [
        'anime_id' => 'naruto',
        'episode_id' => 'naruto-ep-1',
        'episode_number' => 1,
        'progress_seconds' => 600,
    ]);

    $this->assertDatabaseCount('watch_histories', 1);
    $this->assertDatabaseHas('watch_histories', [
        'progress_seconds' => 600,
    ]);
});

it('marks episode as completed', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('history.store'), [
            'anime_id' => 'naruto',
            'episode_id' => 'naruto-ep-1',
            'episode_number' => 1,
            'progress_seconds' => 0,
            'completed' => true,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('watch_histories', [
        'completed' => true,
    ]);
});

it('validates required fields', function (string $field): void {
    $user = User::factory()->create();

    $data = [
        'anime_id' => 'naruto',
        'episode_id' => 'naruto-ep-1',
        'episode_number' => 1,
        'progress_seconds' => 300,
    ];

    unset($data[$field]);

    $this->actingAs($user)
        ->postJson(route('history.store'), $data)
        ->assertJsonValidationErrors($field);
})->with(['anime_id', 'episode_id', 'episode_number', 'progress_seconds']);
