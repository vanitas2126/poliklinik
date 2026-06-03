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
     Schema::create('invoices', function (Blueprint $table) {
    $table->id();
    $table->foreignId('kunjungan_id')->constrained('kunjungans')->onDelete('cascade');
    $table->string('jenis_layanan');
    $table->integer('total_biaya');
    $table->string('status')->default('belum_dibayar');
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
