<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['kunjungan_id', 'dokter_spesialis_id', 'analisa_hasil_rujukan', 'diagnosa_akhir', 'tindakan_akhir'])]
class PemeriksaanSpesialis extends Model
{
    public function kunjungan()
    {
        return $this->belongsTo(Kunjungan::class, 'kunjungan_id');
    }

    public function dokterSpesialis()
    {
        return $this->belongsTo(User::class, 'dokter_spesialis_id');
    }
}
