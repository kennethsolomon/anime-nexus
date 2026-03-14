<?php

declare(strict_types=1);

use App\Models\User;

it('requires authentication for dashboard', function (): void {
    $this->get(route('dashboard'))->assertRedirect(route('login'));
});

it('displays dashboard with stats', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('Dashboard')
            ->has('stats')
            ->where('stats.totalEpisodes', 0)
            ->where('stats.totalSeconds', 0)
        );
});
