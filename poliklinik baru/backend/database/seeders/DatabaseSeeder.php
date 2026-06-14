<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Dokter;
use App\Models\Kunjungan;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $password = Hash::make('password');

        // Admin
        User::create([
            'name' => 'Administrator',
            'email' => 'admin@klinik.com',
            'password' => $password,
            'role' => 'admin',
        ]);

        // Dokter Umum
        $userDokterUmum = User::create([
            'name' => 'Dr. Budi (Umum)',
            'email' => 'budi@klinik.com',
            'password' => $password,
            'role' => 'dokter_umum',
        ]);
        $dokterUmum = Dokter::create([
            'user_id' => $userDokterUmum->id,
            'nama_dokter' => 'Dr. Budi',
            'spesialis' => 'Umum',
        ]);

        // Dokter Spesialis Kulit
        $userDokterSpesialis = User::create([
            'name' => 'Dr. Siti (Spesialis Kulit)',
            'email' => 'siti@klinik.com',
            'password' => $password,
            'role' => 'dokter_spesialis',
        ]);
        $dokterSpesialis = Dokter::create([
            'user_id' => $userDokterSpesialis->id,
            'nama_dokter' => 'Dr. Siti',
            'spesialis' => 'Kulit',
        ]);

        // Petugas Lab
        $userLab = User::create([
            'name' => 'Andi (Lab)',
            'email' => 'lab@klinik.com',
            'password' => $password,
            'role' => 'petugas_lab',
        ]);
        Dokter::create([
            'user_id' => $userLab->id,
            'nama_dokter' => 'Andi',
            'spesialis' => 'Laboratorium',
        ]);

        // Petugas Radiologi
        $userRad = User::create([
            'name' => 'Rina (Radiologi)',
            'email' => 'rad@klinik.com',
            'password' => $password,
            'role' => 'petugas_radiologi',
        ]);
        Dokter::create([
            'user_id' => $userRad->id,
            'nama_dokter' => 'Rina',
            'spesialis' => 'Radiologi',
        ]);

        // Apoteker
        User::create([
            'name' => 'Eka (Apoteker)',
            'email' => 'apotek@klinik.com',
            'password' => $password,
            'role' => 'apoteker',
        ]);

        // Pasien Dummy
        $pasien1 = User::create([
            'name' => 'Pasien Ahmad',
            'email' => 'ahmad@pasien.com',
            'password' => $password,
            'role' => 'pasien',
        ]);

        $pasien2 = User::create([
            'name' => 'Pasien Budianto',
            'email' => 'budianto@pasien.com',
            'password' => $password,
            'role' => 'pasien',
        ]);

        // Buat Kunjungan Dummy
        Kunjungan::create([
            'pasien_id' => $pasien1->id,
            'tanggal_kunjungan' => Carbon::now()->toDateString(),
            'status_saat_ini' => 'poli_umum',
        ]);

        Kunjungan::create([
            'pasien_id' => $pasien2->id,
            'tanggal_kunjungan' => Carbon::now()->toDateString(),
            'status_saat_ini' => 'poli_umum',
        ]);
    }
}
