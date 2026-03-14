<?php

declare(strict_types=1);

use App\Actions\Drama\GetDramaStreamingLinks;
use App\Services\ConsumetService;
use Illuminate\Support\Facades\Http;

it('fetches drama streaming links from consumet service', function (): void {
    cache()->flush();

    Http::fake([
        '*/movies/flixhq/watch*' => Http::response([
            'sources' => [['url' => 'https://example.com/stream.mp4', 'quality' => '720p', 'isM3U8' => false]],
            'subtitles' => [],
        ]),
    ]);

    $consumet = app(ConsumetService::class);
    $action = new GetDramaStreamingLinks($consumet);

    $result = $action->handle('12345', 'tv/watch-drama-123');

    expect($result)->toHaveKey('sources');
    expect($result['sources'])->toBeArray();
});
