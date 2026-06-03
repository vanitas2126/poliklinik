<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('antrian', function (Blueprint $table) {
            $table->id('id_antrian');
            $table->unsignedBigInteger('id_pasien');
            $table->string('nomor_antrian')->nullable();
            $table->string('tujuan_poli')->default('Umum');
            $table->string('status_antrian')->default('menunggu');
            $table->timestamps();

            $table->foreign('id_pasien')
                ->references('id_pasien')
                ->on('pasien')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('antrian');
    }
};