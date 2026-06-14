<?php

namespace App\Http\Controllers;

use App\Models\Antrian;
use App\Models\Kunjungan;
use App\Models\Pasien;
use Illuminate\Http\Request;

class KunjunganController extends Controller
{
    public function index()
    {
        $kunjungans = Kunjungan::with(['pasien', 'antrian'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($kunjungans);
    }

    public function store(Request $request)
    {
        if ($request->filled('id_pasien')) {
            $validated = $request->validate([
                'id_pasien' => 'required|integer',
                'id_antrian' => 'nullable|integer',
                'tanggal_kunjungan' => 'required|date',
            ]);

            $kunjungan = Kunjungan::create([
                'id_pasien' => $validated['id_pasien'],
                'id_antrian' => $validated['id_antrian'] ?? null,
                'tanggal_kunjungan' => $validated['tanggal_kunjungan'],
                'status_saat_ini' => 'poli_umum',
            ]);

            return response()->json($kunjungan->load(['pasien', 'antrian']), 201);
        }

        $validated = $request->validate([
            'nomor_rm' => 'nullable|string',
            'nama_pasien' => 'required|string',
            'nik' => 'nullable|string',
            'jenis_kelamin' => 'nullable|string',
            'tanggal_lahir' => 'nullable|date',
            'alamat' => 'nullable|string',
            'no_hp' => 'nullable|string',
            'keluhan' => 'nullable|string',
            'nomor_antrian' => 'nullable|string',
            'tanggal_kunjungan' => 'required|date',
        ]);

        $pasien = Pasien::create([
            'nomor_rm' => $validated['nomor_rm'] ?? null,
            'nama_pasien' => $validated['nama_pasien'],
            'nik' => $validated['nik'] ?? null,
            'jenis_kelamin' => $validated['jenis_kelamin'] ?? null,
            'tanggal_lahir' => $validated['tanggal_lahir'] ?? null,
            'alamat' => $validated['alamat'] ?? null,
            'no_hp' => $validated['no_hp'] ?? null,
            'keluhan' => $validated['keluhan'] ?? null,
            'status_pasien' => 'baru',
        ]);

        $antrian = Antrian::create([
            'id_pasien' => $pasien->id_pasien,
            'nomor_antrian' => $validated['nomor_antrian'] ?? null,
            'tujuan_poli' => 'Umum',
            'status_antrian' => 'menunggu',
        ]);

        $kunjungan = Kunjungan::create([
            'id_pasien' => $pasien->id_pasien,
            'id_antrian' => $antrian->id_antrian,
            'tanggal_kunjungan' => $validated['tanggal_kunjungan'],
            'status_saat_ini' => 'poli_umum',
        ]);

        return response()->json($kunjungan->load(['pasien', 'antrian']), 201);
    }

    public function updateStatus(Request $request, $id)
    {
        $kunjungan = Kunjungan::findOrFail($id);

        $validated = $request->validate([
            'status_saat_ini' => 'required|in:poli_umum,lab,radiologi,spesialis,poli_umum_review,apotek,selesai',
        ]);

        $kunjungan->update([
            'status_saat_ini' => $validated['status_saat_ini'],
        ]);

        return response()->json($kunjungan->load(['pasien', 'antrian']));
    }
}