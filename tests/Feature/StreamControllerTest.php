<?php

declare(strict_types=1);

use App\Models\User;
use App\Models\WatchHistory;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

beforeEach(function (): void {
    Cache::flush();
});

it('renders watch page with streaming sources rewritten through proxy', function (): void {
    Http::fake([
        '*/anime/animekai/info*' => Http::response([
            'id' => 'naruto',
            'title' => 'Naruto',
            'image' => 'https://example.com/naruto.jpg',
            'episodes' => [
                ['id' => 'ep-1', 'title' => 'Episode 1', 'number' => 1],
            ],
        ], 200),
        '*/anime/animekai/watch/*' => Http::response([
            'headers' => ['Referer' => 'https://animekai.example.com'],
            'sources' => [
                ['url' => 'https://cdn.example.com/stream.m3u8', 'quality' => 'default', 'isM3U8' => true],
                ['url' => 'https://cdn.example.com/backup.m3u8', 'quality' => 'backup', 'isM3U8' => true],
            ],
            'subtitles' => [
                ['url' => 'https://cdn.example.com/subs-en.vtt', 'lang' => 'English'],
            ],
        ], 200),
    ]);

    $response = $this->get(route('anime.watch', ['id' => 'naruto', 'episodeId' => 'ep-1']));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Watch')
        ->has('anime')
        ->has('streaming')
        ->has('episodeId')
        ->where('episodeId', 'ep-1')
        ->where('progress', 0)
    );

    $props = $response->original->getData()['page']['props'];
    foreach ($props['streaming']['sources'] as $source) {
        expect($source['url'])->toContain('stream/proxy');
    }
});

it('renders watch page with subtitles rewritten through proxy', function (): void {
    Http::fake([
        '*/anime/animekai/info*' => Http::response([
            'id' => 'bleach',
            'title' => 'Bleach',
            'image' => 'https://example.com/bleach.jpg',
            'episodes' => [],
        ], 200),
        '*/anime/animekai/watch/*' => Http::response([
            'headers' => ['Referer' => 'https://animekai.example.com'],
            'sources' => [],
            'subtitles' => [
                ['url' => 'https://cdn.example.com/subs-en.vtt', 'lang' => 'English'],
                ['url' => 'https://cdn.example.com/subs-es.vtt', 'lang' => 'Spanish'],
            ],
        ], 200),
    ]);

    $response = $this->get(route('anime.watch', ['id' => 'bleach', 'episodeId' => 'ep-2']));

    $response->assertOk();

    $props = $response->original->getData()['page']['props'];
    foreach ($props['streaming']['subtitles'] as $subtitle) {
        expect($subtitle['url'])->toContain('stream/proxy');
    }
});

it('shows progress for authenticated user with existing watch history', function (): void {
    Http::fake([
        '*/anime/animekai/info*' => Http::response([
            'id' => 'one-piece',
            'title' => 'One Piece',
            'image' => 'https://example.com/op.jpg',
            'episodes' => [],
        ], 200),
        '*/anime/animekai/watch/*' => Http::response([
            'headers' => [],
            'sources' => [],
            'subtitles' => [],
        ], 200),
    ]);

    $user = User::factory()->create();
    WatchHistory::create([
        'user_id' => $user->id,
        'anime_id' => 'one-piece',
        'anime_title' => 'One Piece',
        'anime_image' => 'https://example.com/op.jpg',
        'episode_id' => 'ep-10',
        'episode_number' => 10,
        'progress_seconds' => 300,
        'completed' => false,
        'content_type' => 'anime',
        'watched_at' => now(),
    ]);

    $response = $this->actingAs($user)
        ->get(route('anime.watch', ['id' => 'one-piece', 'episodeId' => 'ep-10']));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Watch')
        ->where('progress', 300)
    );
});

it('shows zero progress for authenticated user without watch history', function (): void {
    Http::fake([
        '*/anime/animekai/info*' => Http::response([
            'id' => 'aot',
            'title' => 'Attack on Titan',
            'image' => 'https://example.com/aot.jpg',
            'episodes' => [],
        ], 200),
        '*/anime/animekai/watch/*' => Http::response([
            'headers' => [],
            'sources' => [],
            'subtitles' => [],
        ], 200),
    ]);

    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->get(route('anime.watch', ['id' => 'aot', 'episodeId' => 'ep-1']));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Watch')
        ->where('progress', 0)
    );
});

it('shows zero progress for guest user', function (): void {
    Http::fake([
        '*/anime/animekai/info*' => Http::response([
            'id' => 'dbz',
            'title' => 'Dragon Ball Z',
            'image' => 'https://example.com/dbz.jpg',
            'episodes' => [],
        ], 200),
        '*/anime/animekai/watch/*' => Http::response([
            'headers' => [],
            'sources' => [],
            'subtitles' => [],
        ], 200),
    ]);

    $response = $this->get(route('anime.watch', ['id' => 'dbz', 'episodeId' => 'ep-1']));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Watch')
        ->where('progress', 0)
    );
});

it('handles streaming response with no sources key', function (): void {
    Http::fake([
        '*/anime/animekai/info*' => Http::response([
            'id' => 'hxh',
            'title' => 'Hunter x Hunter',
            'image' => 'https://example.com/hxh.jpg',
            'episodes' => [],
        ], 200),
        '*/anime/animekai/watch/*' => Http::response([
            'headers' => ['Referer' => 'https://animekai.example.com'],
            'subtitles' => [
                ['url' => 'https://cdn.example.com/subs.vtt', 'lang' => 'English'],
            ],
        ], 200),
    ]);

    $response = $this->get(route('anime.watch', ['id' => 'hxh', 'episodeId' => 'ep-1']));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->component('Watch'));

    $props = $response->original->getData()['page']['props'];
    expect($props['streaming'])->not->toHaveKey('sources');
});

it('handles streaming response with no subtitles key', function (): void {
    Http::fake([
        '*/anime/animekai/info*' => Http::response([
            'id' => 'jjk',
            'title' => 'Jujutsu Kaisen',
            'image' => 'https://example.com/jjk.jpg',
            'episodes' => [],
        ], 200),
        '*/anime/animekai/watch/*' => Http::response([
            'headers' => ['Referer' => 'https://animekai.example.com'],
            'sources' => [
                ['url' => 'https://cdn.example.com/stream.m3u8', 'quality' => 'default'],
            ],
        ], 200),
    ]);

    $response = $this->get(route('anime.watch', ['id' => 'jjk', 'episodeId' => 'ep-1']));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->component('Watch'));

    $props = $response->original->getData()['page']['props'];
    expect($props['streaming'])->not->toHaveKey('subtitles');
});

it('handles non-array source items gracefully', function (): void {
    Http::fake([
        '*/anime/animekai/info*' => Http::response([
            'id' => 'deathnote',
            'title' => 'Death Note',
            'image' => 'https://example.com/dn.jpg',
            'episodes' => [],
        ], 200),
        '*/anime/animekai/watch/*' => Http::response([
            'headers' => ['Referer' => 'https://animekai.example.com'],
            'sources' => [
                'not-an-array',
                ['url' => 'https://cdn.example.com/stream.m3u8', 'quality' => 'default'],
            ],
            'subtitles' => [],
        ], 200),
    ]);

    $response = $this->get(route('anime.watch', ['id' => 'deathnote', 'episodeId' => 'ep-1']));

    $response->assertOk();

    $props = $response->original->getData()['page']['props'];
    $sources = array_values($props['streaming']['sources']);
    expect($sources[0])->toBe([]);
    expect($sources[1]['url'])->toContain('stream/proxy');
});

it('handles non-array subtitle items gracefully', function (): void {
    Http::fake([
        '*/anime/animekai/info*' => Http::response([
            'id' => 'fma',
            'title' => 'Fullmetal Alchemist',
            'image' => 'https://example.com/fma.jpg',
            'episodes' => [],
        ], 200),
        '*/anime/animekai/watch/*' => Http::response([
            'headers' => ['Referer' => 'https://animekai.example.com'],
            'sources' => [],
            'subtitles' => [
                'not-an-array',
                ['url' => 'https://cdn.example.com/subs.vtt', 'lang' => 'English'],
            ],
        ], 200),
    ]);

    $response = $this->get(route('anime.watch', ['id' => 'fma', 'episodeId' => 'ep-1']));

    $response->assertOk();

    $props = $response->original->getData()['page']['props'];
    $subtitles = array_values($props['streaming']['subtitles']);
    expect($subtitles[0])->toBe([]);
    expect($subtitles[1]['url'])->toContain('stream/proxy');
});

it('handles subtitles without url property', function (): void {
    Http::fake([
        '*/anime/animekai/info*' => Http::response([
            'id' => 'cowboybebop',
            'title' => 'Cowboy Bebop',
            'image' => 'https://example.com/cb.jpg',
            'episodes' => [],
        ], 200),
        '*/anime/animekai/watch/*' => Http::response([
            'headers' => ['Referer' => 'https://animekai.example.com'],
            'sources' => [],
            'subtitles' => [
                ['lang' => 'English'],
                ['url' => 'https://cdn.example.com/subs.vtt', 'lang' => 'Spanish'],
            ],
        ], 200),
    ]);

    $response = $this->get(route('anime.watch', ['id' => 'cowboybebop', 'episodeId' => 'ep-1']));

    $response->assertOk();

    $props = $response->original->getData()['page']['props'];
    $subtitles = array_values($props['streaming']['subtitles']);
    // Subtitle without url should keep its original shape (no url key added)
    expect($subtitles[0])->toBe(['lang' => 'English']);
    // Subtitle with url should be rewritten through proxy
    expect($subtitles[1]['url'])->toContain('stream/proxy');
});

/*
|--------------------------------------------------------------------------
| Proxy edge cases — lines 112, 137
|--------------------------------------------------------------------------
*/

it('returns upstream error status when proxied URL returns a failed response', function (): void {
    Http::fake([
        'https://cdn.streaming.example.com/*' => Http::response('Server Error', 502),
    ]);

    $response = $this->get(route('stream.proxy', [
        'url' => 'https://cdn.streaming.example.com/video.m3u8',
        'referer' => 'https://animekai.example.com',
    ]));

    $response->assertStatus(502);
});

it('rejects URL that cannot be parsed (no host)', function (): void {
    $response = $this->get(route('stream.proxy', [
        'url' => 'http://',
        'referer' => '',
    ]));

    $response->assertStatus(403);
});
