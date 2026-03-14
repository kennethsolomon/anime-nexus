<?php

declare(strict_types=1);

use App\Models\Comment;
use App\Models\User;

it('requires authentication for comments', function (): void {
    $this->post(route('comments.store'))->assertRedirect(route('login'));
    $this->get(route('comments.index'))->assertRedirect(route('login'));
});

it('lists comments for an episode', function (): void {
    $user = User::factory()->create();

    Comment::create([
        'user_id' => $user->id,
        'anime_id' => 'naruto',
        'episode_id' => 'ep-1',
        'content_type' => 'anime',
        'body' => 'Great episode!',
    ]);

    $this->actingAs($user)
        ->getJson(route('comments.index', ['anime_id' => 'naruto', 'episode_id' => 'ep-1']))
        ->assertOk()
        ->assertJsonCount(1);
});

it('stores a comment', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('comments.store'), [
            'anime_id' => 'naruto',
            'episode_id' => 'ep-1',
            'content_type' => 'anime',
            'body' => 'Awesome episode!',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('comments', [
        'user_id' => $user->id,
        'anime_id' => 'naruto',
        'body' => 'Awesome episode!',
    ]);
});

it('strips html tags from comment body', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('comments.store'), [
            'anime_id' => 'naruto',
            'episode_id' => 'ep-1',
            'body' => '<script>alert(1)</script>Nice!',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('comments', [
        'body' => 'alert(1)Nice!',
    ]);
});

it('stores a reply comment', function (): void {
    $user = User::factory()->create();

    $parent = Comment::create([
        'user_id' => $user->id,
        'anime_id' => 'naruto',
        'episode_id' => 'ep-1',
        'content_type' => 'anime',
        'body' => 'Parent comment',
    ]);

    $this->actingAs($user)
        ->post(route('comments.store'), [
            'anime_id' => 'naruto',
            'episode_id' => 'ep-1',
            'body' => 'Reply!',
            'parent_id' => $parent->id,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('comments', [
        'body' => 'Reply!',
        'parent_id' => $parent->id,
    ]);
});

it('deletes own comment', function (): void {
    $user = User::factory()->create();

    $comment = Comment::create([
        'user_id' => $user->id,
        'anime_id' => 'naruto',
        'episode_id' => 'ep-1',
        'content_type' => 'anime',
        'body' => 'To delete',
    ]);

    $this->actingAs($user)
        ->delete(route('comments.destroy', ['comment' => $comment->id]))
        ->assertRedirect();

    $this->assertDatabaseMissing('comments', ['id' => $comment->id]);
});

it('prevents deleting another users comment', function (): void {
    $user = User::factory()->create();
    $other = User::factory()->create();

    $comment = Comment::create([
        'user_id' => $other->id,
        'anime_id' => 'naruto',
        'episode_id' => 'ep-1',
        'content_type' => 'anime',
        'body' => 'Not yours',
    ]);

    $this->actingAs($user)
        ->delete(route('comments.destroy', ['comment' => $comment->id]))
        ->assertStatus(403);

    $this->assertDatabaseHas('comments', ['id' => $comment->id]);
});

it('validates required fields', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('comments.store'), [])
        ->assertSessionHasErrors(['anime_id', 'episode_id', 'body']);
});
