<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\Stats\GetUserStats;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class DashboardController extends Controller
{
    public function index(Request $request, GetUserStats $action): Response
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        return Inertia::render('Dashboard', [
            'stats' => $action->handle($user),
        ]);
    }
}
