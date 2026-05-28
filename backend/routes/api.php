<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\KunjunganController;
use App\Http\Controllers\DokterController;
use App\Http\Controllers\PemeriksaanUmumController;
use App\Http\Controllers\PemeriksaanLabController;
use App\Http\Controllers\PemeriksaanRadiologiController;
use App\Http\Controllers\PemeriksaanSpesialisController;
use App\Http\Controllers\ResepObatController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Resource Routes for API
Route::apiResource('dokters', DokterController::class);
Route::apiResource('kunjungans', KunjunganController::class);
Route::patch('kunjungans/{id}/status', [KunjunganController::class, 'updateStatus']);

Route::apiResource('pemeriksaan-umums', PemeriksaanUmumController::class);
Route::apiResource('pemeriksaan-labs', PemeriksaanLabController::class);
Route::apiResource('pemeriksaan-radiologis', PemeriksaanRadiologiController::class);
Route::apiResource('pemeriksaan-spesialis', PemeriksaanSpesialisController::class);
Route::apiResource('resep-obats', ResepObatController::class);
