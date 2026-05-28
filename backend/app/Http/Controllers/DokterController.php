<?php

namespace App\Http\Controllers;

use App\Models\Dokter;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class DokterController extends Controller
{
    public function index()
    {
        $dokters = Dokter::with('user')->get();
        return response()->json($dokters);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_dokter' => 'required|string|max:255',
            'spesialis' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
        ]);

        DB::beginTransaction();
        try {
            $role = 'dokter_umum';
            $spesialisLower = strtolower($validated['spesialis']);
            if (str_contains($spesialisLower, 'lab')) {
                $role = 'petugas_lab';
            } elseif (str_contains($spesialisLower, 'radiologi')) {
                $role = 'petugas_radiologi';
            } elseif ($spesialisLower !== 'umum') {
                $role = 'dokter_spesialis';
            }

            $user = User::create([
                'name' => $validated['nama_dokter'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => $role,
            ]);

            $dokter = Dokter::create([
                'user_id' => $user->id,
                'nama_dokter' => $validated['nama_dokter'],
                'spesialis' => $validated['spesialis'],
            ]);

            DB::commit();
            return response()->json($dokter->load('user'), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to create dokter: ' . $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        $dokter = Dokter::with('user')->findOrFail($id);
        return response()->json($dokter);
    }

    public function update(Request $request, $id)
    {
        $dokter = Dokter::findOrFail($id);
        
        $validated = $request->validate([
            'nama_dokter' => 'sometimes|required|string|max:255',
            'spesialis' => 'sometimes|required|string|max:255',
        ]);

        $dokter->update($validated);

        if ($dokter->user) {
            $dokter->user->update([
                'name' => $request->nama_dokter ?? $dokter->user->name
            ]);
        }

        return response()->json($dokter->load('user'));
    }

    public function destroy($id)
    {
        $dokter = Dokter::findOrFail($id);
        if ($dokter->user) {
            $dokter->user->delete();
        }
        $dokter->delete();
        return response()->json(['message' => 'Dokter deleted successfully']);
    }
}
