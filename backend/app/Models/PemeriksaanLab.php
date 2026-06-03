<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PemeriksaanLab extends Model
{
    protected $fillable = [
        'kunjungan_id',
        'dokter_id',
        'jenis_pemeriksaan',
        'hasil_lab',
        'file_lampiran',
        'status',
    ];

    public function kunjungan()
    {
        return $this->belongsTo(Kunjungan::class, 'kunjungan_id');
    }

    public function dokter()
    {
        return $this->belongsTo(Dokter::class, 'dokter_id');
    }
}