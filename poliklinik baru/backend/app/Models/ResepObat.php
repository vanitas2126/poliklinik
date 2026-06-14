<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ResepObat extends Model
{
    protected $fillable = [
        'kunjungan_id',
        'sumber_resep',
        'catatan_resep',
        'status',
    ];

    protected $casts = [
        'detail_obat' => 'array',
    ];

    public function kunjungan()
    {
        return $this->belongsTo(Kunjungan::class);
    }
}
