<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pasien extends Model
{
    protected $table = 'pasien';
    protected $primaryKey = 'id_pasien';

    protected $fillable = [
        'nomor_rm',
        'nama_pasien',
        'nik',
        'jenis_kelamin',
        'tanggal_lahir',
        'alamat',
        'no_hp',
        'keluhan',
        'status_pasien',
    ];
}