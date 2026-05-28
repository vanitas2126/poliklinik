<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['user_id', 'nama_dokter', 'spesialis'])]
class Dokter extends Model
{
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function pemeriksaanUmums()
    {
        return $this->hasMany(PemeriksaanUmum::class, 'dokter_id');
    }

    public function pemeriksaanLabs()
    {
        return $this->hasMany(PemeriksaanLab::class, 'dokter_id');
    }

    public function pemeriksaanRadiologis()
    {
        return $this->hasMany(PemeriksaanRadiologi::class, 'dokter_id');
    }

    public function pemeriksaanSpesialis()
    {
        return $this->hasMany(PemeriksaanSpesialis::class, 'dokter_id');
    }
}
