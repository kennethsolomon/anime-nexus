<?php

declare(strict_types=1);

use App\Http\Controllers\AnimeController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DramaController;
use App\Http\Controllers\DramaStreamController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\HistoryController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReviewController;
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

// Drama routes
Route::get('/drama', [DramaController::class, 'index'])->name('drama.home');
Route::get('/drama/search', [DramaController::class, 'search'])->name('drama.search');
Route::get('/drama/{id}/watch', [DramaStreamController::class, 'show'])->where('id', '.*')->name('drama.watch');
Route::get('/drama/{id}', [DramaController::class, 'show'])->where('id', '.*')->name('drama.show');

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

    // Reviews
    Route::post('/reviews', [ReviewController::class, 'store'])->name('reviews.store');
    Route::delete('/reviews/{review}', [ReviewController::class, 'destroy'])->name('reviews.destroy');

    // Favorites
    Route::get('/favorites', [FavoriteController::class, 'index'])->name('favorites.index');
    Route::post('/favorites', [FavoriteController::class, 'toggle'])->name('favorites.toggle');

    // Comments
    Route::get('/comments', [CommentController::class, 'index'])->name('comments.index');
    Route::post('/comments', [CommentController::class, 'store'])->name('comments.store');
    Route::delete('/comments/{comment}', [CommentController::class, 'destroy'])->name('comments.destroy');

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead'])->name('notifications.readAll');

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Profile (Breeze)
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
