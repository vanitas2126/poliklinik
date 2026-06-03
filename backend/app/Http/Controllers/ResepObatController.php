<?php

namespace App\Http\Controllers;

use App\Models\ResepObat;
use App\Models\Kunjungan;
use Illuminate\Http\Request;

class ResepObatController extends Controller
{
    public function index()
    {
        return response()->json(
            ResepObat::with('kunjungan.pasien')
                ->latest()
                ->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kunjungan_id' => 'required|exists:kunjungans,id',
            'sumber_resep' => 'required|string',
            'catatan_resep' => 'required|string',
            'status' => 'nullable|in:menunggu,diproses,selesai',
        ]);

        $resep = ResepObat::create([
            'kunjungan_id' => $validated['kunjungan_id'],
            'sumber_resep' => $validated['sumber_resep'],
            'catatan_resep' => $validated['catatan_resep'],
            'status' => $validated['status'] ?? 'menunggu',
        ]);

        Kunjungan::where('id', $validated['kunjungan_id'])->update([
            'status_saat_ini' => 'apotek'
        ]);

        return response()->json($resep->load('kunjungan.pasien'), 201);
    }

    public function update(Request $request, $id)
    {
        $resep = ResepObat::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:menunggu,diproses,selesai',
        ]);

        $resep->update([
            'status' => $validated['status']
        ]);

        if ($validated['status'] === 'selesai') {
            Kunjungan::where('id', $resep->kunjungan_id)->update([
                'status_saat_ini' => 'selesai'
            ]);
        }

        return response()->json($resep->load('kunjungan.pasien'));
    }
}