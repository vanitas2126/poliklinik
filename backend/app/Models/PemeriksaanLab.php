<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['kunjungan_id', 'petugas_id', 'jenis_pemeriksaan', 'hasil_lab', 'file_lampiran', 'status'])]
class PemeriksaanLab extends Model
{
    public function kunjungan()
    {
        return $this->belongsTo(Kunjungan::class, 'kunjungan_id');
    }

    public function petugas()
    {
        return $this->belongsTo(User::class, 'petugas_id');
    }
}
