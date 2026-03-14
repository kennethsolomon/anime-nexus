<?php

declare(strict_types=1);

use App\Models\Review;
use App\Models\User;

it('requires authentication to submit a review', function (): void {
    $this->post(route('reviews.store'), [
        'anime_id' => 'test-anime',
        'rating' => 5,
    ])->assertRedirect(route('login'));
});

it('submits a review', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('reviews.store'), [
            'anime_id' => 'test-anime',
            'content_type' => 'anime',
            'rating' => 4,
            'body' => 'Great anime!',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('reviews', [
        'user_id' => $user->id,
        'anime_id' => 'test-anime',
        'content_type' => 'anime',
        'rating' => 4,
        'body' => 'Great anime!',
    ]);
});

it('updates an existing review', function (): void {
    $user = User::factory()->create();

    Review::create([
        'user_id' => $user->id,
        'anime_id' => 'test-anime',
        'content_type' => 'anime',
        'rating' => 3,
        'body' => 'Okay',
    ]);

    $this->actingAs($user)
        ->post(route('reviews.store'), [
            'anime_id' => 'test-anime',
            'content_type' => 'anime',
            'rating' => 5,
            'body' => 'Updated: amazing!',
        ])
        ->assertRedirect();

    $this->assertDatabaseCount('reviews', 1);
    $this->assertDatabaseHas('reviews', [
        'user_id' => $user->id,
        'rating' => 5,
        'body' => 'Updated: amazing!',
    ]);
});

it('validates rating is required and between 1-5', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('reviews.store'), [
            'anime_id' => 'test-anime',
            'rating' => 0,
        ])
        ->assertSessionHasErrors('rating');

    $this->actingAs($user)
        ->post(route('reviews.store'), [
            'anime_id' => 'test-anime',
            'rating' => 6,
        ])
        ->assertSessionHasErrors('rating');
});

it('deletes own review', function (): void {
    $user = User::factory()->create();

    $review = Review::create([
        'user_id' => $user->id,
        'anime_id' => 'test-anime',
        'content_type' => 'anime',
        'rating' => 4,
    ]);

    $this->actingAs($user)
        ->delete(route('reviews.destroy', ['review' => $review->id]))
        ->assertRedirect();

    $this->assertDatabaseMissing('reviews', ['id' => $review->id]);
});

it('prevents deleting another users review', function (): void {
    $user = User::factory()->create();
    $other = User::factory()->create();

    $review = Review::create([
        'user_id' => $other->id,
        'anime_id' => 'test-anime',
        'content_type' => 'anime',
        'rating' => 4,
    ]);

    $this->actingAs($user)
        ->delete(route('reviews.destroy', ['review' => $review->id]))
        ->assertStatus(403);

    $this->assertDatabaseHas('reviews', ['id' => $review->id]);
});
