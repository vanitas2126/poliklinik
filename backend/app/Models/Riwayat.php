<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Riwayat extends Model
{
    protected $table = 'riwayats';

    protected $fillable = [
        'kunjungan_id',
        'biaya_umum',
        'biaya_lab',
        'biaya_radiologi',
        'biaya_spesialis',
        'total_biaya'
    ];

    public function kunjungan()
    {
        return $this->belongsTo(Kunjungan::class);
    }
}