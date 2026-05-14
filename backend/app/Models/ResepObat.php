<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ResepObat extends Model
{
    protected $fillable = [
        'kunjungan_id',
        'obat_id',
        'dosis',
        'aturan_pakai',
        'jumlah',
    ];

    public function kunjungan()
    {
        return $this->belongsTo(Kunjungan::class);
    }

    public function obat()
    {
        return $this->belongsTo(Obat::class);
    }
}
