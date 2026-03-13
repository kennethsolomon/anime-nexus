<?php

declare(strict_types=1);

use App\Http\Controllers\AnimeController;
use App\Http\Controllers\HistoryController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StreamController;
use App\Http\Controllers\WatchlistController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::get('/', [AnimeController::class, 'index'])->name('home');
Route::get('/search', [AnimeController::class, 'search'])->name('anime.search');
Route::get('/genre/{genre}', [AnimeController::class, 'genre'])->name('anime.genre');
Route::get('/anime/{id}', [AnimeController::class, 'show'])->name('anime.show');
Route::get('/anime/{id}/watch', [StreamController::class, 'show'])->name('anime.watch');
Route::get('/stream/proxy', [StreamController::class, 'proxy'])->name('stream.proxy');

// Authenticated routes
Route::middleware('auth')->group(function () {
    // Watchlist
    Route::get('/watchlist', [WatchlistController::class, 'index'])->name('watchlist.index');
    Route::post('/watchlist', [WatchlistController::class, 'store'])->name('watchlist.store');
    Route::patch('/watchlist/{watchlist}', [WatchlistController::class, 'update'])->name('watchlist.update');
    Route::delete('/watchlist/{watchlist}', [WatchlistController::class, 'destroy'])->name('watchlist.destroy');

    // Watch history
    Route::get('/history', [HistoryController::class, 'index'])->name('history.index');
    Route::post('/history', [HistoryController::class, 'store'])->name('history.store');

    // Profile (Breeze)
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
