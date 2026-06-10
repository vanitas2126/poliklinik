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
     Schema::create('riwayats', function (Blueprint $table) {
    $table->id();
    $table->foreignId('kunjungan_id')->constrained('kunjungans')->onDelete('cascade');
    $table->integer('biaya_umum')->default(0);
    $table->integer('biaya_lab')->default(0);
    $table->integer('biaya_radiologi')->default(0);
    $table->integer('biaya_spesialis')->default(0);
    $table->integer('total_biaya');
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('riwayats');
    }
};
