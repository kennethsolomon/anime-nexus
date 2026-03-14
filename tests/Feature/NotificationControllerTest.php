<?php

declare(strict_types=1);

use App\Models\EpisodeNotification;
use App\Models\User;

it('requires authentication for notifications', function (): void {
    $this->getJson(route('notifications.index'))->assertUnauthorized();
});

it('lists notifications with unread count', function (): void {
    $user = User::factory()->create();

    EpisodeNotification::create([
        'user_id' => $user->id,
        'anime_id' => 'naruto',
        'anime_title' => 'Naruto',
        'content_type' => 'anime',
        'message' => 'New episode available!',
        'read' => false,
    ]);

    EpisodeNotification::create([
        'user_id' => $user->id,
        'anime_id' => 'bleach',
        'anime_title' => 'Bleach',
        'content_type' => 'anime',
        'message' => '3 new episodes available!',
        'read' => true,
    ]);

    $this->actingAs($user)
        ->getJson(route('notifications.index'))
        ->assertOk()
        ->assertJsonPath('unreadCount', 1)
        ->assertJsonCount(2, 'notifications');
});

it('marks a notification as read', function (): void {
    $user = User::factory()->create();

    $notif = EpisodeNotification::create([
        'user_id' => $user->id,
        'anime_id' => 'naruto',
        'anime_title' => 'Naruto',
        'content_type' => 'anime',
        'message' => 'New episode!',
        'read' => false,
    ]);

    $this->actingAs($user)
        ->patch(route('notifications.read', ['episodeNotification' => $notif->id]))
        ->assertRedirect();

    $this->assertDatabaseHas('episode_notifications', [
        'id' => $notif->id,
        'read' => true,
    ]);
});

it('prevents marking another users notification as read', function (): void {
    $user = User::factory()->create();
    $other = User::factory()->create();

    $notif = EpisodeNotification::create([
        'user_id' => $other->id,
        'anime_id' => 'naruto',
        'anime_title' => 'Naruto',
        'content_type' => 'anime',
        'message' => 'New episode!',
        'read' => false,
    ]);

    $this->actingAs($user)
        ->patch(route('notifications.read', ['episodeNotification' => $notif->id]))
        ->assertStatus(403);
});

it('marks all notifications as read', function (): void {
    $user = User::factory()->create();

    EpisodeNotification::create([
        'user_id' => $user->id,
        'anime_id' => 'naruto',
        'anime_title' => 'Naruto',
        'content_type' => 'anime',
        'message' => 'New!',
        'read' => false,
    ]);

    EpisodeNotification::create([
        'user_id' => $user->id,
        'anime_id' => 'bleach',
        'anime_title' => 'Bleach',
        'content_type' => 'anime',
        'message' => 'New!',
        'read' => false,
    ]);

    $this->actingAs($user)
        ->post(route('notifications.readAll'))
        ->assertRedirect();

    expect(EpisodeNotification::where('user_id', $user->id)->where('read', false)->count())->toBe(0);
});
