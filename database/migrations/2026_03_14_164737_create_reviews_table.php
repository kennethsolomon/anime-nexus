<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('anime_id');
            $table->string('content_type')->default('anime');
            $table->unsignedTinyInteger('rating');
            $table->text('body')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'anime_id', 'content_type']);
            $table->index(['anime_id', 'content_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
