<?php

namespace App\Http\Controllers;

use App\Models\Antrian;
use App\Models\Kunjungan;
use App\Models\PemeriksaanUmum;
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

        $pemeriksaan = PemeriksaanUmum::updateOrCreate(
            ['kunjungan_id' => $validated['kunjungan_id']],
            $validated
        );

        $kunjungan = Kunjungan::findOrFail($validated['kunjungan_id']);

        $statusBaru = $this->tentukanStatusBaru(
            $kunjungan->status_saat_ini,
            $validated['rujukan']
        );

        $kunjungan->update([
            'status_saat_ini' => $statusBaru,
        ]);

        if ($validated['rujukan'] !== 'none') {
            $tujuanPoli = match ($validated['rujukan']) {
                'lab' => 'Laboratorium',
                'radiologi' => 'Radiologi',
                'spesialis' => 'Poli Spesialis',
                default => 'Poli Umum',
            };

            // ======================================================
// PRAKTIKUM LAN
// ======================================================
//
// Jika sudah terhubung ke server Registrasi,
// ganti Antrian::create() dengan API:
//
// Http::post('http://IP_REGISTRASI:8000/api/antrian', [
//     'id_pasien' => $kunjungan->id_pasien,
//     'tujuan_poli' => $tujuanPoli,
//     'status_antrian' => 'menunggu',
// ]);
//
// Contoh:
// Http::post('http://192.168.1.10:8000/api/antrian', [...]);
//
// ======================================================

            Antrian::create([
                'id_pasien' => $kunjungan->id_pasien,
                'nomor_antrian' => 'A' . str_pad(Antrian::count() + 1, 3, '0', STR_PAD_LEFT),
                'tujuan_poli' => $tujuanPoli,
                'status_antrian' => 'menunggu',
            ]);

            // HARI H PRAKTIKUM LAN:
            // Kalau sudah pakai API Registrasi, ganti Antrian::create di atas dengan:
            //
            // Http::post('http://IP_REGISTRASI:8000/api/antrian', [
            //     'id_pasien' => $kunjungan->id_pasien,
            //     'tujuan_poli' => $tujuanPoli,
            //     'status_antrian' => 'menunggu',
            // ]);
        }

        return response()->json(
            $pemeriksaan->load(['kunjungan', 'dokter']),
            201
        );
    }

    public function show($id)
    {
        $data = PemeriksaanUmum::with(['kunjungan.pasien', 'dokter'])
            ->findOrFail($id);

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
            $kunjungan = Kunjungan::findOrFail($pemeriksaan->kunjungan_id);

            $statusBaru = $this->tentukanStatusBaru(
                $kunjungan->status_saat_ini,
                $validated['rujukan']
            );

            $kunjungan->update([
                'status_saat_ini' => $statusBaru,
            ]);
        }

        return response()->json(
            $pemeriksaan->load(['kunjungan', 'dokter'])
        );
    }

    private function tentukanStatusBaru(string $statusSaatIni, string $rujukan): string
    {
        if ($rujukan === 'none') {
            return 'apotek';
        }

        if ($rujukan === 'lab') {
            return 'lab';
        }

        if ($rujukan === 'radiologi') {
            return 'radiologi';
        }

        if ($rujukan === 'spesialis') {
            return 'spesialis';
        }

        return $statusSaatIni;
    }
}