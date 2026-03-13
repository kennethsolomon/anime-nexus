<?php

declare(strict_types=1);

namespace App\Actions\Anime;

use App\Services\ConsumetService;

final readonly class GetAnimeDetail
{
    public function __construct(
        private ConsumetService $consumet,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function handle(string $animeId, string $provider = 'animekai'): array
    {
        return $this->consumet->getAnimeInfo($animeId, $provider);
    }
}
