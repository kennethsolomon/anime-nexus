<?php

declare(strict_types=1);

namespace App\Actions\Anime;

use App\Services\ConsumetService;

final readonly class GetTrending
{
    public function __construct(
        private ConsumetService $consumet,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function handle(int $page = 1, int $perPage = 20): array
    {
        return [
            'trending' => $this->consumet->getTrending($page, $perPage),
            'popular' => $this->consumet->getPopular($page, $perPage),
            'recent' => $this->consumet->getRecentEpisodes($page, $perPage),
        ];
    }
}
