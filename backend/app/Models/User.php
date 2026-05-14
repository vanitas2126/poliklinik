<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password', 'role'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function kunjungans()
    {
        return $this->hasMany(Kunjungan::class, 'pasien_id');
    }

    public function pemeriksaanUmums()
    {
        return $this->hasMany(PemeriksaanUmum::class, 'dokter_id');
    }

    public function pemeriksaanLabs()
    {
        return $this->hasMany(PemeriksaanLab::class, 'petugas_id');
    }

    public function pemeriksaanRadiologis()
    {
        return $this->hasMany(PemeriksaanRadiologi::class, 'petugas_id');
    }

    public function pemeriksaanSpesialis()
    {
        return $this->hasMany(PemeriksaanSpesialis::class, 'dokter_spesialis_id');
    }
}
