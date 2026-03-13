<?php

declare(strict_types=1);

namespace App\Actions\Anime;

use App\Services\ConsumetService;

final readonly class GetStreamingLinks
{
    public function __construct(
        private ConsumetService $consumet,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function handle(string $episodeId, string $provider = 'animekai', bool $fresh = false): array
    {
        if ($fresh) {
            return $this->consumet->getFreshStreamingLinks($episodeId, $provider);
        }

        return $this->consumet->getStreamingLinks($episodeId, $provider);
    }
}
