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
        Schema::create('pemeriksaan_radiologis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kunjungan_id')->constrained('kunjungans')->onDelete('cascade');
            $table->foreignId('dokter_id')->nullable()->constrained('dokters')->onDelete('set null');
            $table->string('jenis_pemeriksaan');
            $table->text('hasil_radiologi')->nullable();
            $table->string('file_lampiran')->nullable();
            $table->enum('status', ['menunggu', 'selesai'])->default('menunggu');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pemeriksaan_radiologis');
    }
};
