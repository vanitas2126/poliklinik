<?php

namespace App\Http\Controllers;

use App\Models\ResepObat;
use App\Models\Kunjungan;
use Illuminate\Http\Request;

class ResepObatController extends Controller
{
    public function index()
    {
        $data = ResepObat::with(['kunjungan.pasien', 'kunjungan.pemeriksaanUmums.dokter', 'kunjungan.pemeriksaanSpesialis.dokter'])->get();
        return response()->json($data);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kunjungan_id' => 'required|exists:kunjungans,id',
            'nama_obat' => 'required|string',
            'dosis' => 'required|string',
            'keterangan' => 'nullable|string',
            'status' => 'required|in:menunggu,diberikan',
        ]);

        $resep = ResepObat::create($validated);

        if ($validated['status'] === 'diberikan') {
            Kunjungan::where('id', $validated['kunjungan_id'])->update(['status_saat_ini' => 'selesai']);
        }

        return response()->json($resep->load('kunjungan'), 201);
    }

    public function update(Request $request, $id)
    {
        $resep = ResepObat::findOrFail($id);
        
        $validated = $request->validate([
            'status' => 'required|in:menunggu,diberikan',
        ]);

        $resep->update($validated);

        if ($validated['status'] === 'diberikan') {
            Kunjungan::where('id', $resep->kunjungan_id)->update(['status_saat_ini' => 'selesai']);
        }

        return response()->json($resep->load('kunjungan'));
    }
}
