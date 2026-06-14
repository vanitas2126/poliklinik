<?php

namespace App\Http\Controllers;

use App\Models\PemeriksaanSpesialis;
use App\Models\Kunjungan;
use Illuminate\Http\Request;

class PemeriksaanSpesialisController extends Controller
{
    public function index()
    {
        $data = PemeriksaanSpesialis::with(['kunjungan.pasien', 'dokter'])->get();
        return response()->json($data);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kunjungan_id' => 'required|exists:kunjungans,id',
            'dokter_id' => 'required|exists:dokters,id',
            'analisa_hasil_rujukan' => 'nullable|string',
            'diagnosa_akhir' => 'required|string',
            'tindakan_akhir' => 'nullable|string',
        ]);

        $pemeriksaan = PemeriksaanSpesialis::create($validated);

        // Setelah dari spesialis, biasanya ke apotek atau selesai
        Kunjungan::where('id', $validated['kunjungan_id'])->update(['status_saat_ini' => 'apotek']);

        return response()->json($pemeriksaan->load(['kunjungan', 'dokter']), 201);
    }

    public function update(Request $request, $id)
    {
        $pemeriksaan = PemeriksaanSpesialis::findOrFail($id);
        
        $validated = $request->validate([
            'analisa_hasil_rujukan' => 'nullable|string',
            'diagnosa_akhir' => 'required|string',
            'tindakan_akhir' => 'nullable|string',
        ]);

        $pemeriksaan->update($validated);

        return response()->json($pemeriksaan->load(['kunjungan', 'dokter']));
    }
}
