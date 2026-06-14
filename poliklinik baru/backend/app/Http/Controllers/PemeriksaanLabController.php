<?php

namespace App\Http\Controllers;

use App\Models\PemeriksaanLab;
use App\Models\Kunjungan;
use Illuminate\Http\Request;

class PemeriksaanLabController extends Controller
{
    public function index()
    {
        $data = PemeriksaanLab::with(['kunjungan.pasien', 'dokter'])->get();

        return response()->json($data);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kunjungan_id' => 'required|exists:kunjungans,id',
            'dokter_id' => 'required|exists:dokters,id',
            'jenis_pemeriksaan' => 'nullable|string',
            'hasil_lab' => 'nullable|string',
            'status' => 'required|in:menunggu,selesai',
        ]);

        $validated['jenis_pemeriksaan'] =
            $validated['jenis_pemeriksaan'] ?? 'Darah Lengkap';

        $pemeriksaan = PemeriksaanLab::create($validated);

        if ($validated['status'] === 'selesai') {
            $kunjungan = Kunjungan::findOrFail($validated['kunjungan_id']);

            $kunjungan->update([
                'status_saat_ini' => 'poli_umum_review',
            ]);
        }

        return response()->json(
            $pemeriksaan->load(['kunjungan', 'dokter']),
            201
        );
    }

    public function update(Request $request, $id)
    {
        $pemeriksaan = PemeriksaanLab::findOrFail($id);

        $validated = $request->validate([
            'jenis_pemeriksaan' => 'nullable|string',
            'hasil_lab' => 'required|string',
            'status' => 'required|in:menunggu,selesai',
        ]);

        $validated['jenis_pemeriksaan'] =
            $validated['jenis_pemeriksaan'] ?? 'Darah Lengkap';

        $pemeriksaan->update($validated);

        if ($validated['status'] === 'selesai') {
            $kunjungan = Kunjungan::findOrFail($pemeriksaan->kunjungan_id);

            $kunjungan->update([
                'status_saat_ini' => 'poli_umum_review',
            ]);
        }

        return response()->json(
            $pemeriksaan->load(['kunjungan', 'dokter'])
        );
    }
}