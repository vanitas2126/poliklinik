<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['kunjungan_id', 'dokter_id', 'jenis_pemeriksaan', 'hasil_lab', 'file_lampiran', 'status'])]
class PemeriksaanLab extends Model
{
    public function kunjungan()
    {
        return $this->belongsTo(Kunjungan::class, 'kunjungan_id');
    }

    public function dokter()
    {
        return $this->belongsTo(Dokter::class, 'dokter_id');
    }
}
