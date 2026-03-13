<?php

declare(strict_types=1);

namespace App\Actions\Drama;

use App\Services\ConsumetService;

final readonly class GetDramaStreamingLinks
{
    public function __construct(
        private ConsumetService $consumet,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function handle(string $episodeId, string $mediaId, string $provider = 'flixhq'): array
    {
        return $this->consumet->getDramaStreamingLinks($episodeId, $mediaId, $provider);
    }
}
