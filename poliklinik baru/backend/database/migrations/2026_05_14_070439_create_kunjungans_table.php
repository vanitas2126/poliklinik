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
        Schema::create('kunjungans', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('id_pasien');
            $table->unsignedBigInteger('id_antrian')->nullable();

            $table->date('tanggal_kunjungan');

            $table->enum('status_saat_ini', [
                'poli_umum',
                'lab',
                'radiologi',
                'spesialis',
                'poli_umum_review',
                'apotek',
                'selesai',
            ])->default('poli_umum');

            $table->timestamps();

            $table->foreign('id_pasien')
                ->references('id_pasien')
                ->on('pasien')
                ->onDelete('cascade');

            $table->foreign('id_antrian')
                ->references('id_antrian')
                ->on('antrian')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kunjungans');
    }
};