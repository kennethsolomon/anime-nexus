<?php

declare(strict_types=1);

namespace App\Actions\Drama;

use App\Services\ConsumetService;

final readonly class SearchDrama
{
    public function __construct(
        private ConsumetService $consumet,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function handle(string $query, int $page = 1): array
    {
        return $this->consumet->searchDrama($query, $page);
    }
}
