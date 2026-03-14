<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('favorites', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('anime_id');
            $table->string('anime_title');
            $table->string('anime_image')->nullable();
            $table->string('content_type')->default('anime');
            $table->timestamp('created_at')->useCurrent();

            $table->unique(['user_id', 'anime_id', 'content_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('favorites');
    }
};
