<?php

declare(strict_types=1);

namespace App\Actions\Drama;

use App\Services\ConsumetService;

final readonly class GetDramaTrending
{
    public function __construct(
        private ConsumetService $consumet,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function handle(int $page = 1): array
    {
        $result = $this->consumet->getDramaTrending($page);

        if (isset($result['results']) && is_array($result['results'])) {
            $result['results'] = array_values(array_filter(
                $result['results'],
                fn (array $item): bool => ($item['type'] ?? '') === 'TV Series',
            ));
        }

        return $result;
    }
}
