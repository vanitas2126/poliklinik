<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
        public function up(): void
        {
            Schema::create('resep_obats', function (Blueprint $table) {
                $table->id();
                $table->foreignId('kunjungan_id')->constrained('kunjungans')->onDelete('cascade');
                $table->string('sumber_resep');
                $table->text('catatan_resep');
                $table->string('status')->default('diberikan');
                $table->timestamps();
            });
        }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('resep_obats');
    }
};
