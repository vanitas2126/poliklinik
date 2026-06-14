<?php

namespace App\Http\Controllers;

use App\Models\Riwayat;
use Illuminate\Http\Request;

class RiwayatController extends Controller
{
    public function index()
    {
        return response()->json(
            Riwayat::with('kunjungan.pasien')
                ->latest()
                ->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kunjungan_id' => 'required|exists:kunjungans,id',
            'biaya_umum' => 'nullable|integer',
            'biaya_lab' => 'nullable|integer',
            'biaya_radiologi' => 'nullable|integer',
            'biaya_spesialis' => 'nullable|integer',
            'total_biaya' => 'required|integer'
        ]);

        $riwayat = Riwayat::create([
            'kunjungan_id' => $validated['kunjungan_id'],
            'biaya_umum' => $validated['biaya_umum'] ?? 0,
            'biaya_lab' => $validated['biaya_lab'] ?? 0,
            'biaya_radiologi' => $validated['biaya_radiologi'] ?? 0,
            'biaya_spesialis' => $validated['biaya_spesialis'] ?? 0,
            'total_biaya' => $validated['total_biaya']
        ]);

        return response()->json(
            $riwayat->load('kunjungan.pasien'),
            201
        );
    }
}   