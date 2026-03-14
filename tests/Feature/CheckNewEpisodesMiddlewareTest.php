<?php

declare(strict_types=1);

use App\Jobs\CheckNewEpisodes;
use App\Models\User;
use Illuminate\Support\Facades\Queue;

it('dispatches job on first authenticated request', function (): void {
    Queue::fake();
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('home'));

    Queue::assertPushed(CheckNewEpisodes::class);
});

it('does not dispatch job on second request in same session', function (): void {
    Queue::fake();
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('home'));

    Queue::assertPushed(CheckNewEpisodes::class);

    // Clear the queue fake to track new dispatches
    Queue::fake();

    $this->actingAs($user)
        ->get(route('home'));

    Queue::assertNotPushed(CheckNewEpisodes::class);
});

it('does not dispatch job for guest users', function (): void {
    Queue::fake();

    $this->get(route('home'));

    Queue::assertNotPushed(CheckNewEpisodes::class);
});
