<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['pasien_id', 'tanggal_kunjungan', 'status_saat_ini'])]
class Kunjungan extends Model
{
    public function pasien()
    {
        return $this->belongsTo(User::class, 'pasien_id');
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
