<?php

declare(strict_types=1);

namespace App\Actions\Drama;

use App\Services\ConsumetService;

final readonly class GetDramaDetail
{
    public function __construct(
        private ConsumetService $consumet,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function handle(string $dramaId, string $provider = 'flixhq'): array
    {
        return $this->consumet->getDramaInfo($dramaId, $provider);
    }
}
