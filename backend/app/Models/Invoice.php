<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    protected $fillable = [
    'kunjungan_id',
    'jenis_layanan',
    'total_biaya',
    'status',
];

public function kunjungan()
{
    return $this->belongsTo(Kunjungan::class);
}
}
