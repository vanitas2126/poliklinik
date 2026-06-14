import { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, Pill } from 'lucide-react';

const APOTEK_API = 'http://192.168.0.101:5000/api';

export default function RiwayatObatPasienDashboard() {
  const [dataObat, setDataObat] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchObat();
  }, []);

  const fetchObat = async () => {
    try {
      const res = await axios.get(`${APOTEK_API}/resep-obats`);
      setDataObat(res.data);
    } catch (error) {
      console.error('Gagal mengambil data obat dari Apotek', error);
    }
  };

  const filteredData = dataObat.filter((item) =>
    [
      item.nama_pasien,
      item.nomor_rm,
      item.kunjungan_id,
      item.catatan_resep,
      item.status,
    ]
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-emerald-600">
          Riwayat Obat Pasien
        </h1>
        <p className="text-slate-500 mt-1">
          Data resep dan status obat dari Apotek
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
        <Search className="text-slate-400" size={20} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama pasien, nomor RM, resep, atau status..."
          className="w-full outline-none text-slate-700"
        />
      </div>

      <div className="grid gap-5">
        {filteredData.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-500 border border-slate-100">
            Tidak ada riwayat obat pasien.
          </div>
        ) : (
          filteredData.map((item, index) => (
            <div
              key={item.id || index}
              className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6"
            >
              <div className="flex justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="font-bold text-xl text-slate-800 flex items-center gap-2">
                    <Pill className="text-emerald-600" size={22} />
                    {item.nama_pasien || 'Nama pasien tidak ada'}
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    No RM: {item.nomor_rm || '-'} | Kunjungan ID:{' '}
                    {item.kunjungan_id || item.id_kunjungan || '-'}
                  </p>
                </div>

                <span
                  className={`h-fit px-4 py-2 rounded-full text-sm font-semibold ${
                    item.status === 'selesai'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {item.status === 'selesai'
                    ? 'Obat Selesai'
                    : 'Menunggu Apotek'}
                </span>
              </div>

              <div className="mt-4 bg-slate-50 rounded-xl p-4">
                <p className="text-sm text-slate-500 mb-1">Catatan Resep</p>
                <pre className="whitespace-pre-wrap text-sm font-semibold text-slate-800">
                  {item.catatan_resep || item.resep || '-'}
                </pre>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}