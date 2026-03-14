<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Http;

it('rejects empty url', function (): void {
    $this->get(route('stream.proxy', ['url' => '']))
        ->assertStatus(400);
});

it('rejects disallowed domains', function (): void {
    $this->get(route('stream.proxy', ['url' => 'https://evil.com/steal']))
        ->assertStatus(403);
});

it('rejects private ip addresses', function (): void {
    $this->get(route('stream.proxy', ['url' => 'http://127.0.0.1:6379/']))
        ->assertStatus(403);
});

it('rejects non-http schemes', function (): void {
    $this->get(route('stream.proxy', ['url' => 'ftp://gogoanime.example.com/file']))
        ->assertStatus(403);
});

it('proxies allowed streaming urls', function (): void {
    Http::fake([
        'https://example.gogoanime.com/*' => Http::response('video-data', 200, ['Content-Type' => 'video/mp4']),
    ]);

    $this->get(route('stream.proxy', ['url' => 'https://example.gogoanime.com/video.mp4']))
        ->assertOk()
        ->assertHeader('Content-Type', 'video/mp4');
});

it('rewrites m3u8 manifest urls through proxy', function (): void {
    $manifest = "#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=800000\nsegment001.ts\nsegment002.ts";

    Http::fake([
        'https://cdn.vidstreaming.example.com/*' => Http::response($manifest, 200, ['Content-Type' => 'application/vnd.apple.mpegurl']),
    ]);

    $response = $this->get(route('stream.proxy', [
        'url' => 'https://cdn.vidstreaming.example.com/master.m3u8',
        'referer' => 'https://vidstreaming.example.com',
    ]));

    $response->assertOk();
    $response->assertHeader('Content-Type', 'application/vnd.apple.mpegurl');

    $body = $response->getContent();
    expect($body)->toContain('stream/proxy');
    expect($body)->not->toContain("\nsegment001.ts\n");
});
