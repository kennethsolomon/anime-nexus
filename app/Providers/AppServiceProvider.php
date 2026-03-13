<?php

declare(strict_types=1);

namespace App\Providers;

use App\Services\ConsumetService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

final class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(ConsumetService::class, function (): ConsumetService {
            /** @var string $url */
            $url = config('services.consumet.url');

            return new ConsumetService(baseUrl: $url);
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Model::shouldBeStrict(! app()->isProduction());

        Vite::prefetch(concurrency: 3);
    }
}
