<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Jobs\CheckNewEpisodes;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class CheckNewEpisodesMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && ! $request->session()->has('notifications_checked')) {
            CheckNewEpisodes::dispatch($user->id);
            $request->session()->put('notifications_checked', true);
        }

        return $next($request);
    }
}
