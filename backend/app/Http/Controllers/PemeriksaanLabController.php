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
            'jenis_pemeriksaan' => 'required|string',
            'hasil_lab' => 'nullable|string',
            'status' => 'required|in:menunggu,selesai',
        ]);

        $pemeriksaan = PemeriksaanLab::create($validated);

        if ($validated['status'] === 'selesai') {
            Kunjungan::where('id', $validated['kunjungan_id'])->update(['status_saat_ini' => 'poli_umum']); // Kembali ke poli umum setelah lab
        }

        return response()->json($pemeriksaan->load(['kunjungan', 'dokter']), 201);
    }

    public function update(Request $request, $id)
    {
        $pemeriksaan = PemeriksaanLab::findOrFail($id);
        
        $validated = $request->validate([
            'hasil_lab' => 'required|string',
            'status' => 'required|in:menunggu,selesai',
        ]);

        $pemeriksaan->update($validated);

        if ($validated['status'] === 'selesai') {
            Kunjungan::where('id', $pemeriksaan->kunjungan_id)->update(['status_saat_ini' => 'poli_umum']); // Kembali ke poli umum
        }

        return response()->json($pemeriksaan->load(['kunjungan', 'dokter']));
    }
}
