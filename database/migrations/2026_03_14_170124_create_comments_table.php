<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('comments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('anime_id');
            $table->string('episode_id');
            $table->string('content_type')->default('anime');
            $table->text('body');
            $table->foreignId('parent_id')->nullable()->constrained('comments')->cascadeOnDelete();
            $table->timestamps();

            $table->index(['anime_id', 'episode_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('comments');
    }
};
