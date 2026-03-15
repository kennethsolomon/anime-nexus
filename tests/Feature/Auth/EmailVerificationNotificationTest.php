<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Support\Facades\Notification;

test('requires authentication', function (): void {
    $this->post(route('verification.send'))
        ->assertRedirect(route('login'));
});

test('redirects verified users to home', function (): void {
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->post(route('verification.send'));

    $response->assertRedirect(route('home', absolute: false));
});

test('sends verification notification to unverified users', function (): void {
    Notification::fake();

    $user = User::factory()->unverified()->create();

    $response = $this->actingAs($user)
        ->post(route('verification.send'));

    Notification::assertSentTo($user, VerifyEmail::class);
    $response->assertSessionHas('status', 'verification-link-sent');
});

/*
|--------------------------------------------------------------------------
| VerifyEmailController — already verified redirect (line 20)
|--------------------------------------------------------------------------
*/

test('already verified user is redirected when visiting verification URL', function (): void {
    $user = User::factory()->create(); // verified by default

    $verificationUrl = Illuminate\Support\Facades\URL::temporarySignedRoute(
        'verification.verify',
        now()->addMinutes(60),
        ['id' => $user->id, 'hash' => sha1((string) $user->email)]
    );

    $response = $this->actingAs($user)->get($verificationUrl);

    $response->assertRedirect(route('home', absolute: false).'?verified=1');
});

/*
|--------------------------------------------------------------------------
| EmailVerificationPromptController — unverified user sees verify page (line 21)
|--------------------------------------------------------------------------
*/

test('verified user visiting verify-email prompt is redirected to home', function (): void {
    $user = User::factory()->create(); // verified by default

    $response = $this->actingAs($user)->get('/verify-email');

    $response->assertRedirect(route('home', absolute: false));
});

test('unverified user sees verification prompt page', function (): void {
    $user = User::factory()->unverified()->create();

    $response = $this->actingAs($user)
        ->withSession(['status' => 'verification-link-sent'])
        ->get('/verify-email');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('Auth/VerifyEmail')
        ->where('status', 'verification-link-sent')
    );
});

/*
|--------------------------------------------------------------------------
| NewPasswordController — invalid token (lines 67-69)
|--------------------------------------------------------------------------
*/

test('password reset fails with invalid token', function (): void {
    $user = User::factory()->create();

    $response = $this->post('/reset-password', [
        'token' => 'invalid-token',
        'email' => $user->email,
        'password' => 'new-password',
        'password_confirmation' => 'new-password',
    ]);

    $response->assertSessionHasErrors('email');
});

/*
|--------------------------------------------------------------------------
| PasswordResetLinkController — non-existent email (lines 49-51)
|--------------------------------------------------------------------------
*/

test('password reset link fails for non-existent email', function (): void {
    $response = $this->post('/forgot-password', [
        'email' => 'nonexistent@example.com',
    ]);

    $response->assertSessionHasErrors('email');
});
