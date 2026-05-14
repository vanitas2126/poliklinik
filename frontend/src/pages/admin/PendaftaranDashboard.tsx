export default function PendaftaranDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Dashboard Pendaftaran (Admin)</h1>
      <div className="card">
        <p className="text-slate-600">Selamat datang di panel pendaftaran pasien. Di sini Anda dapat mendaftarkan pasien baru ke antrean poli umum.</p>
        <button className="btn-primary mt-4">Daftar Pasien Baru</button>
      </div>
    </div>
  );
}
