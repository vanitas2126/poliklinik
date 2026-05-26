# Product Requirements Document (PRD) - Sistem Informasi Poliklinik

## 1. Pendahuluan
Dokumen ini merupakan *source of truth* untuk pengembangan **Sistem Informasi Poliklinik**. Dokumen ini menjelaskan arsitektur, peran (roles), alur kerja, status proyek saat ini, dan roadmap pengembangan untuk frontend dan backend. Dokumen ini wajib dibaca oleh AI sebagai pedoman sebelum mengeksekusi prompt selanjutnya agar solusi yang diberikan relevan dan terstruktur.

---

## 2. Aktor dan Peran (Roles)
Sistem ini menggunakan *role-based access control* (RBAC) dengan peran sebagai berikut:
- **Admin**: Bertugas mendaftarkan kunjungan pasien baru dan mengarahkan pasien ke Poli Umum.
- **Pasien**: Entitas utama yang diperiksa. (Data pasien disimpan dalam tabel `users` dengan role pasien, dikelola oleh Admin).
- **Dokter Umum**: Melakukan pemeriksaan awal (anamnesa, diagnosa awal, tindakan). Dapat merujuk pasien ke Lab, Radiologi, Spesialis, atau langsung menuliskan resep obat.
- **Petugas Lab**: Menerima rujukan lab, menginput data hasil pemeriksaan lab, dan mengunggah dokumen/file lampiran.
- **Petugas Radiologi**: Menerima rujukan radiologi, menginput data hasil radiologi, dan mengunggah dokumen/file lampiran.
- **Dokter Spesialis**: Menerima rujukan dari dokter umum, memberikan analisa rujukan, diagnosa akhir, tindakan akhir, dan menuliskan resep obat.
- **Apoteker**: Menerima daftar resep obat dari dokter, menyiapkan obat, dan menyelesaikan alur kunjungan pasien.

---

## 3. Alur Kerja Sistem (System Workflow)
1. **Pendaftaran (Admin)**: Admin membuat record `Kunjungan` untuk pasien dengan status default `poli_umum`.
2. **Pemeriksaan Awal (Dokter Umum)**: Dokter Umum memproses antrean kunjungan dengan membuat record `PemeriksaanUmum`.
   - Jika butuh rujukan: Dokter mengubah status kunjungan ke `lab`, `radiologi`, atau `spesialis`.
   - Jika tidak butuh rujukan: Dokter membuat `ResepObat` dan mengubah status kunjungan ke `apotek`.
3. **Pemeriksaan Lanjutan (Jika Dirujuk)**:
   - **Lab**: Petugas memproses `PemeriksaanLab` dan mengubah statusnya menjadi `selesai`.
   - **Radiologi**: Petugas memproses `PemeriksaanRadiologi` dan mengubah statusnya menjadi `selesai`.
   - **Spesialis**: Dokter Spesialis memproses `PemeriksaanSpesialis`, memberikan `ResepObat`, dan mengubah status kunjungan ke `apotek`.
4. **Pengambilan Obat (Apoteker)**: Apoteker memproses `ResepObat` dan mengubah status kunjungan menjadi `selesai`.

---

## 4. Status Proyek Saat Ini (Current State)

### Backend (Laravel 11.x)
- [x] Instalasi Laravel & Setup Database (MySQL/SQLite).
- [x] Pembuatan tabel & relasi (*Kunjungan, PemeriksaanUmum, PemeriksaanLab, PemeriksaanRadiologi, PemeriksaanSpesialis, ResepObat, User*).
- [x] Pembuatan Model Eloquent beserta fungsi relasinya.
- [ ] **Pending**: Instalasi API Laravel (`php artisan install:api`) dan konfigurasi Laravel Sanctum/JWT.
- [ ] **Pending**: Pembuatan endpoint API (`routes/api.php`).
- [ ] **Pending**: Pembuatan Controllers, Form Requests, API Resources, dan implementasi Role Middleware.

### Frontend (React 19, Vite, Tailwind CSS 4, Zustand)
- [x] Scaffolding project React dengan Vite.
- [x] Konfigurasi Tailwind CSS dan instalasi dependensi utama (`axios`, `framer-motion`, `lucide-react`, `react-router-dom`, `zustand`).
- [x] Struktur folder berdasarkan role (`src/pages/admin`, `apotek`, `dokter-spesialis`, dll).
- [x] Pembuatan halaman statis `Login.tsx`.
- [ ] **Pending**: Setup Axios interceptor untuk menyisipkan token Auth.
- [ ] **Pending**: Pembuatan state management Zustand untuk Auth dan Data Antrean.
- [ ] **Pending**: Pembuatan sistem Protected Routes berdasarkan Role user.
- [ ] **Pending**: Pembuatan antarmuka dashboard dinamis untuk masing-masing role.

---

## 5. Ide dan Solusi Pengembangan (Development Guidelines)

Bagian ini adalah panduan teknis bagi AI dan Developer terkait bagaimana fitur harus dikembangkan.

### A. Panduan Pengembangan Backend
1. **Autentikasi & Keamanan**:
   - Implementasikan autentikasi menggunakan **Laravel Sanctum**. Login via endpoint `/api/login` mengembalikan `token`, `user details`, dan `role`.
   - Lindungi rute API menggunakan middleware `auth:sanctum`.
   - Buat middleware khusus (misal: `RoleMiddleware`) untuk membatasi akses endpoint berdasarkan role pengguna (misal hanya `dokter_umum` yang bisa POST ke `/api/pemeriksaan-umum`).
2. **Integritas Data (Database Transactions)**:
   - Saat mengubah status perjalanan pasien (misal dari poli umum ke lab), proses ini melibatkan `UPDATE kunjungans` dan `INSERT pemeriksaan_labs`. Selalu gunakan `DB::transaction()` untuk mencegah data parsial tersimpan bila terjadi error.
3. **Format Response**:
   - Selalu kembalikan response API dalam bentuk standar, contoh:
     ```json
     {
       "success": true,
       "message": "Data berhasil disimpan",
       "data": { ... }
     }
     ```
4. **Manajemen File**:
   - Gunakan fitur Laravel Storage (`Storage::disk('public')`) untuk menangani unggahan `file_lampiran` dari Lab dan Radiologi. Buat symlink menggunakan `php artisan storage:link`.

### B. Panduan Pengembangan Frontend
1. **API Integration & State**:
   - Gunakan **Axios** untuk seluruh HTTP requests. Buat file `api.ts` yang memuat konfigurasi dasar (baseURL) dan *interceptors* untuk menyisipkan Bearer token otomatis.
   - Gunakan **Zustand** secara modular (misal: `useAuthStore` untuk otentikasi, `useKunjunganStore` untuk manajemen antrean).
2. **Role-Based Routing**:
   - Susun `react-router-dom` dengan komponen `<ProtectedRoute allowedRoles={['admin']} />`. Jika user dengan role yang salah mencoba masuk, arahkan ke halaman `Unauthorized` atau kembalikan ke dashboard role mereka.
3. **UI/UX & Desain Modern**:
   - Gunakan estetika desain yang premium dan modern (misal: komponen dengan efek glassmorphism, rounded corners, dan harmonisasi warna pastel/vibrant).
   - Wajib gunakan **Framer Motion** untuk memberikan transisi mulus saat berpindah halaman atau membuka modal.
   - Jangan gunakan desain yang terlalu kaku atau "generic admin template". Berikan sentuhan animasi mikro (hover states, click ripples) agar sistem terasa interaktif.
4. **Realtime UX**:
   - Karena alur bersifat antrean (pasien pindah dari satu divisi ke divisi lain), pertimbangkan penggunaan polling (SWR / React Query) atau integrasikan WebSockets (Pusher/Laravel Reverb) agar daftar pasien otomatis diperbarui tanpa perlu user merefresh browser.

---

**[INSTRUKSI UNTUK AI]**
Setiap kali diminta untuk mengembangkan fitur pada proyek ini, AI **HARUS**:
1. Merujuk pada struktur *database* yang tertulis di PRD ini.
2. Mengikuti standar *tech-stack* (Laravel 11, React 19, Tailwind 4, Zustand).
3. Memberikan *code snippet* yang mementingkan UI/UX terbaik di bagian frontend (jangan asal buat div tanpa styling).
4. Menyediakan *backend code* yang aman (menggunakan FormRequest, Transaction, dan Response yang rapi).
