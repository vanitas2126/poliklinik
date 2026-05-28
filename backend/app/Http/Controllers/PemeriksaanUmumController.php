<?php

namespace App\Http\Controllers;

use App\Models\PemeriksaanUmum;
use App\Models\Kunjungan;
use Illuminate\Http\Request;

class PemeriksaanUmumController extends Controller
{
    public function index()
    {
        $data = PemeriksaanUmum::with(['kunjungan.pasien', 'dokter'])->get();
        return response()->json($data);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kunjungan_id' => 'required|exists:kunjungans,id',
            'dokter_id' => 'required|exists:dokters,id',
            'pemeriksaan_awal' => 'required|string',
            'kategori_penyakit' => 'nullable|in:ringan,berat',
            'diagnosa_awal' => 'required|string',
            'tindakan' => 'nullable|string',
            'rujukan' => 'required|in:none,lab,radiologi,spesialis',
        ]);

        $pemeriksaan = PemeriksaanUmum::create($validated);

        // Update kunjungan status based on rujukan
        $kunjungan = Kunjungan::find($validated['kunjungan_id']);
        if ($validated['rujukan'] !== 'none') {
            $kunjungan->update(['status_saat_ini' => $validated['rujukan']]);
        } else {
            // Jika tidak ada rujukan, lanjut ke apotek atau selesai
            $kunjungan->update(['status_saat_ini' => 'apotek']);
        }

        return response()->json($pemeriksaan->load(['kunjungan', 'dokter']), 201);
    }

    public function show($id)
    {
        $data = PemeriksaanUmum::with(['kunjungan.pasien', 'dokter'])->findOrFail($id);
        return response()->json($data);
    }

    public function update(Request $request, $id)
    {
        $pemeriksaan = PemeriksaanUmum::findOrFail($id);
        
        $validated = $request->validate([
            'pemeriksaan_awal' => 'sometimes|required|string',
            'kategori_penyakit' => 'nullable|in:ringan,berat',
            'diagnosa_awal' => 'sometimes|required|string',
            'tindakan' => 'nullable|string',
            'rujukan' => 'sometimes|required|in:none,lab,radiologi,spesialis',
        ]);

        $pemeriksaan->update($validated);

        if (isset($validated['rujukan'])) {
            $kunjungan = Kunjungan::find($pemeriksaan->kunjungan_id);
            if ($validated['rujukan'] !== 'none') {
                $kunjungan->update(['status_saat_ini' => $validated['rujukan']]);
            }
        }

        return response()->json($pemeriksaan->load(['kunjungan', 'dokter']));
    }
}
