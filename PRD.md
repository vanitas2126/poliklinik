# Product Requirements Document (PRD) - Sistem Informasi Poliklinik

## 1. Ringkasan Produk

Sistem Informasi Poliklinik adalah aplikasi web untuk mengelola alur layanan pasien dari pendaftaran, pemeriksaan dokter umum, rujukan penunjang/spesialis, resep obat, sampai penyelesaian layanan di apotek.

Produk terdiri dari:

- **Backend**: Laravel API untuk mengelola data user, dokter, kunjungan, pemeriksaan, rujukan, dan resep.
- **Frontend**: React + TypeScript untuk dashboard per role.
- **Database**: database relasional melalui migration Laravel.

## 2. Tujuan Produk

1. Memusatkan data kunjungan pasien dalam satu sistem.
2. Mempercepat pendaftaran pasien dan pembentukan antrean poli umum.
3. Membantu dokter umum mencatat pemeriksaan awal dan menentukan rujukan.
4. Mendukung proses rujukan ke lab, radiologi, atau dokter spesialis.
5. Menghubungkan hasil pemeriksaan lanjutan kembali ke dokter umum.
6. Mengelola resep sampai kunjungan selesai di apotek.
7. Menjadi fondasi rekam medis sederhana berbasis role.

## 3. Target User

| User | Kebutuhan |
| --- | --- |
| Admin | Mendaftarkan pasien/kunjungan dan mengelola data dokter. |
| Pasien | Menjadi entitas penerima layanan. Saat ini belum memiliki dashboard mandiri. |
| Dokter Umum | Melihat antrean poli umum, mencatat pemeriksaan awal, menentukan rujukan/resep. |
| Petugas Lab | Melihat rujukan lab, menginput hasil lab, dan melampirkan file hasil. |
| Petugas Radiologi | Melihat rujukan radiologi, menginput hasil radiologi, dan melampirkan file hasil. |
| Dokter Spesialis | Melihat rujukan spesialis, memberi analisa, diagnosa akhir, dan tindakan akhir. |
| Apoteker | Melihat resep, menyiapkan obat, dan menyelesaikan kunjungan. |

## 4. Scope Produk

### 4.1 Dalam Scope

- Login dan session/token authentication.
- Role-based access control.
- Pendaftaran pasien dan kunjungan.
- Master data dokter.
- Pemeriksaan dokter umum.
- Rujukan lab, radiologi, dan spesialis.
- Input hasil lab/radiologi termasuk lampiran.
- Pemeriksaan dokter spesialis.
- Resep obat.
- Penyelesaian resep dan kunjungan di apotek.

### 4.2 Di Luar Scope Saat Ini

- Integrasi BPJS/asuransi.
- Kasir dan pembayaran.
- Inventori obat lengkap.
- Jadwal praktik dokter.
- Rekam medis historis tingkat lanjut.
- Notifikasi WhatsApp/SMS/email.
- Dashboard analitik manajemen.

## 5. Status Perkembangan Proyek

### 5.1 Stack Aktual

- Backend: PHP `^8.3`, Laravel Framework `^13.8`, Laravel Sanctum `^4.0`, PHPUnit.
- Frontend: React `^19.2`, TypeScript, Vite `^8`, Tailwind CSS `^4`, Axios, React Router `^7`, Framer Motion, Lucide React, Zustand.
- API frontend saat ini mengarah ke `http://localhost:8000/api`.

### 5.2 Backend yang Sudah Ada

Model utama:

- `User`
- `Dokter`
- `Kunjungan`
- `PemeriksaanUmum`
- `PemeriksaanLab`
- `PemeriksaanRadiologi`
- `PemeriksaanSpesialis`
- `ResepObat`

Controller utama:

- `DokterController`
- `KunjunganController`
- `PemeriksaanUmumController`
- `PemeriksaanLabController`
- `PemeriksaanRadiologiController`
- `PemeriksaanSpesialisController`
- `ResepObatController`

Route API utama:

- `GET|POST /api/dokters`
- `GET|POST /api/kunjungans`
- `PATCH /api/kunjungans/{id}/status`
- `GET|POST /api/pemeriksaan-umums`
- `GET|POST /api/pemeriksaan-labs`
- `GET|POST /api/pemeriksaan-radiologis`
- `GET|POST /api/pemeriksaan-spesialis`
- `GET|POST /api/resep-obats`

### 5.3 Frontend yang Sudah Ada

Halaman:

- Login.
- Dashboard admin pendaftaran.
- Dashboard admin master dokter.
- Dashboard dokter umum.
- Dashboard lab.
- Dashboard radiologi.
- Dashboard dokter spesialis.
- Dashboard apotek.

Integrasi yang sudah berjalan sebagian:

- Pendaftaran kunjungan terhubung ke API.
- Master dokter terhubung ke API.
- Dokter umum sudah mulai memakai data kunjungan/dokter dan submit pemeriksaan umum.

### 5.4 Gap Utama

1. Login masih simulasi; belum ada endpoint login/logout yang dipakai frontend.
2. Sanctum sudah tersedia, tetapi token auth belum diterapkan penuh.
3. Role guard frontend dan middleware backend belum aktif.
4. Dashboard lab, radiologi, spesialis, dan apotek masih perlu integrasi API penuh.
5. Upload lampiran lab/radiologi belum berjalan.
6. `ResepObatController` belum sinkron dengan migration/model `resep_obats`.
7. Beberapa endpoint dari `apiResource` terbuka walaupun method controller belum lengkap.
8. Belum ada pagination, filter, audit log, dan automated test untuk alur bisnis.
9. Pendaftaran pasien masih membuat password default `password`, belum aman untuk produksi.

## 6. Fitur Produk

### 6.1 Autentikasi dan Role

- User login dengan email dan password.
- Sistem mengembalikan token dan data user.
- User diarahkan ke dashboard sesuai role.
- API dan halaman dibatasi sesuai role.

Status: **belum selesai**.

### 6.2 Pendaftaran Kunjungan

- Admin menginput nama pasien, email, dan tanggal kunjungan.
- Sistem membuat user pasien.
- Sistem membuat kunjungan dengan status awal `poli_umum`.
- Kunjungan tampil pada antrean.

Status: **sudah ada untuk alur dasar**.

### 6.3 Master Dokter

- Admin menambah dokter dengan nama, spesialis, email, dan password.
- Sistem membuat user dokter/petugas sesuai spesialis.
- Admin dapat melihat, mengubah, dan menghapus dokter.

Status: **sudah ada untuk operasi dasar**.

### 6.4 Pemeriksaan Dokter Umum

- Dokter umum melihat kunjungan status `poli_umum`.
- Dokter mencatat pemeriksaan awal, kategori penyakit, diagnosa awal, tindakan, dan rujukan.
- Jika rujukan `lab`, status kunjungan menjadi `lab`.
- Jika rujukan `radiologi`, status kunjungan menjadi `radiologi`.
- Jika rujukan `spesialis`, status kunjungan menjadi `spesialis`.
- Jika rujukan `none`, status kunjungan menjadi `apotek`.

Status: **sudah ada untuk alur dasar**.

### 6.5 Pemeriksaan Lab

- Petugas lab melihat kunjungan status `lab`.
- Petugas menginput jenis pemeriksaan, hasil lab, status, dan lampiran.
- Jika selesai, status kunjungan kembali ke `poli_umum`.

Status: **backend sebagian ada, frontend/upload belum selesai**.

### 6.6 Pemeriksaan Radiologi

- Petugas radiologi melihat kunjungan status `radiologi`.
- Petugas menginput jenis pemeriksaan, hasil radiologi, status, dan lampiran.
- Jika selesai, status kunjungan kembali ke `poli_umum`.

Status: **backend sebagian ada, frontend/upload belum selesai**.

### 6.7 Pemeriksaan Dokter Spesialis

- Dokter spesialis melihat kunjungan status `spesialis`.
- Dokter menginput analisa hasil rujukan, diagnosa akhir, dan tindakan akhir.
- Setelah selesai, status kunjungan menjadi `apotek`.

Status: **backend sebagian ada, frontend belum selesai**.

### 6.8 Resep dan Apotek

- Dokter umum atau dokter spesialis membuat resep.
- Apoteker melihat daftar resep.
- Apoteker menandai resep selesai.
- Sistem mengubah status kunjungan menjadi `selesai`.

Status: **belum stabil; perlu sinkronisasi backend dan frontend**.

## 7. Flow Produk

### 7.1 Flow Tanpa Rujukan

1. Admin mendaftarkan pasien.
2. Sistem membuat kunjungan status `poli_umum`.
3. Dokter umum melakukan pemeriksaan.
4. Dokter memilih rujukan `none`.
5. Sistem mengubah status ke `apotek`.
6. Dokter membuat resep.
7. Apoteker menyelesaikan resep.
8. Sistem mengubah status kunjungan menjadi `selesai`.

### 7.2 Flow Dengan Lab

1. Dokter umum memilih rujukan `lab`.
2. Sistem mengubah status ke `lab`.
3. Petugas lab menginput hasil.
4. Jika selesai, sistem mengubah status kembali ke `poli_umum`.
5. Dokter umum meninjau hasil dan menentukan tindak lanjut.

### 7.3 Flow Dengan Radiologi

1. Dokter umum memilih rujukan `radiologi`.
2. Sistem mengubah status ke `radiologi`.
3. Petugas radiologi menginput hasil.
4. Jika selesai, sistem mengubah status kembali ke `poli_umum`.
5. Dokter umum meninjau hasil dan menentukan tindak lanjut.

### 7.4 Flow Dengan Spesialis

1. Dokter umum memilih rujukan `spesialis`.
2. Sistem mengubah status ke `spesialis`.
3. Dokter spesialis menginput analisa, diagnosa akhir, dan tindakan akhir.
4. Sistem mengubah status ke `apotek`.
5. Apoteker menyelesaikan resep.
6. Kunjungan menjadi `selesai`.

## 8. Roadmap Prioritas

### Prioritas 1 - Stabilkan Fondasi

- Implementasi login/logout Sanctum.
- Terapkan middleware auth dan role.
- Sinkronkan modul resep dengan database.
- Batasi route resource hanya ke method yang tersedia atau lengkapi method controller.

### Prioritas 2 - Lengkapi Alur Klinis

- Integrasi dashboard lab, radiologi, spesialis, dan apotek.
- Tambahkan pembuatan resep dari dokter umum/spesialis.
- Tambahkan upload lampiran lab/radiologi.
- Tambahkan detail kunjungan lengkap.

### Prioritas 3 - Kesiapan Operasional

- Tambahkan filter, pencarian, dan pagination.
- Tambahkan audit log perubahan status.
- Tambahkan test backend untuk alur kunjungan.
- Perbaiki proses pembuatan akun/password pasien.

## 9. Success Metrics

- Admin dapat membuat kunjungan baru tanpa error.
- Dokter umum dapat memproses antrean sampai rujukan/apotek.
- Lab/radiologi/spesialis dapat memproses pasien sesuai status.
- Apotek dapat menyelesaikan resep dan kunjungan.
- User tidak dapat mengakses modul di luar role-nya.
- Status kunjungan selalu konsisten dengan tahap layanan.
