<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable([
    'id_pasien',
    'id_antrian',
    'tanggal_kunjungan',
    'status_saat_ini',
])]
class Kunjungan extends Model
{
    public function pasien()
    {
        return $this->belongsTo(Pasien::class, 'id_pasien', 'id_pasien');
    }

    public function antrian()
    {
        return $this->belongsTo(Antrian::class, 'id_antrian', 'id_antrian');
    }

    public function pemeriksaanUmum()
    {
        return $this->hasOne(PemeriksaanUmum::class, 'kunjungan_id');
    }

    public function pemeriksaanLab()
    {
        return $this->hasOne(PemeriksaanLab::class, 'kunjungan_id');
    }

    public function pemeriksaanRadiologi()
    {
        return $this->hasOne(PemeriksaanRadiologi::class, 'kunjungan_id');
    }

    public function pemeriksaanSpesialis()
    {
        return $this->hasOne(PemeriksaanSpesialis::class, 'kunjungan_id');
    }

    public function resepObat()
    {
        return $this->hasOne(ResepObat::class, 'kunjungan_id');
    }
}