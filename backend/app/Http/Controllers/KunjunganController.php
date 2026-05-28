<?php

namespace App\Http\Controllers;

use App\Models\Kunjungan;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class KunjunganController extends Controller
{
    public function index()
    {
        $kunjungans = Kunjungan::with('pasien')->orderBy('created_at', 'desc')->get();
        return response()->json($kunjungans);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_pasien' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'tanggal_kunjungan' => 'required|date',
        ]);

        DB::beginTransaction();
        try {
            // Register Pasien as User if not exists (for simplicity creating new user per visit in this dummy)
            // Ideally we check if patient exists, but for now we create a new one as requested in UI
            $user = User::create([
                'name' => $validated['nama_pasien'],
                'email' => $validated['email'],
                'password' => Hash::make('password'),
                'role' => 'pasien',
            ]);

            $kunjungan = Kunjungan::create([
                'pasien_id' => $user->id,
                'tanggal_kunjungan' => $validated['tanggal_kunjungan'],
                'status_saat_ini' => 'poli_umum',
            ]);

            DB::commit();
            return response()->json($kunjungan->load('pasien'), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to create kunjungan: ' . $e->getMessage()], 500);
        }
    }

    public function updateStatus(Request $request, $id)
    {
        $kunjungan = Kunjungan::findOrFail($id);
        
        $validated = $request->validate([
            'status_saat_ini' => 'required|in:poli_umum,lab,radiologi,spesialis,apotek,selesai',
        ]);

        $kunjungan->update(['status_saat_ini' => $validated['status_saat_ini']]);

        return response()->json($kunjungan);
    }
}
