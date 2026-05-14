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
        Schema::create('pemeriksaan_umums', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kunjungan_id')->constrained('kunjungans')->onDelete('cascade');
            $table->foreignId('dokter_id')->constrained('users')->onDelete('cascade');
            $table->text('pemeriksaan_awal')->nullable();
            $table->enum('kategori_penyakit', ['ringan', 'berat'])->nullable();
            $table->text('diagnosa_awal')->nullable();
            $table->text('tindakan')->nullable();
            $table->enum('rujukan', ['none', 'lab', 'radiologi', 'spesialis'])->default('none');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pemeriksaan_umums');
    }
};
