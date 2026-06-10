import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Calendar, Activity, X } from 'lucide-react';
import api from '../../api';
import axios from 'axios';

interface Pasien {
  id_pasien: number;
  nomor_rm: string;
  nama_pasien: string;
  nik: string;
  jenis_kelamin: string;
  tanggal_lahir: string;
  alamat: string;
  no_hp: string;
}
interface Kunjungan {
  id: number;
  id_pasien: number;
  tanggal_kunjungan: string;
  status_saat_ini: string;
  pasien: Pasien;
}
export default function PendaftaranDashboard() {
  const [kunjungans, setKunjungans] = useState<Kunjungan[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

const [formData, setFormData] = useState({
  nomor_rm: '',
  nama_pasien: '',
  nik: '',
  jenis_kelamin: '',
  tanggal_lahir: '',
  alamat: '',
  no_hp: '',
  keluhan: '',
  nomor_antrian: '',
  tanggal_kunjungan: new Date().toISOString().split('T')[0],
});

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchKunjungans();
  }, []);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    await api.post('/kunjungans', formData);

    setIsModalOpen(false);

    setFormData({
      nomor_rm: '',
      nama_pasien: '',
      nik: '',
      jenis_kelamin: '',
      tanggal_lahir: '',
      alamat: '',
      no_hp: '',
      keluhan: '',
      nomor_antrian: '',
      tanggal_kunjungan: new Date().toISOString().split('T')[0],
    });

    fetchKunjungans();
  } catch (error: any) {
    console.error(error.response?.data || error);
    alert(error.response?.data?.message || 'Gagal mendaftarkan pasien.');
  } finally {
    setLoading(false);
  }
};

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      poli_umum: 'bg-blue-100 text-blue-800 border-blue-200',
      lab: 'bg-purple-100 text-purple-800 border-purple-200',
      radiologi: 'bg-orange-100 text-orange-800 border-orange-200',
      spesialis: 'bg-pink-100 text-pink-800 border-pink-200',
      poli_umum_review: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      apotek: 'bg-teal-100 text-teal-800 border-teal-200',
      selesai: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    };

    return colors[status] || 'bg-slate-100 text-slate-800 border-slate-200';
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'poli_umum':
        return 'Poli Umum';
      case 'poli_umum_review':
        return 'Menunggu Review Dokter';
      case 'lab':
        return 'Laboratorium';
      case 'radiologi':
        return 'Radiologi';
      case 'spesialis':
        return 'Poli Spesialis';
      case 'apotek':
        return 'Apotek';
      case 'selesai':
        return 'Selesai';
      default:
        return status;
    }
  };

const filteredKunjungans = kunjungans.filter((item) =>
  item.pasien?.nama_pasien?.toLowerCase().includes(search.toLowerCase())
);

// ===== UNTUK HARI H PRAKTIKUM =====
//
// const pasienRes = await axios.get(
//   'http://192.168.1.10:8000/api/pasien'
// );
//
// const antrianRes = await axios.get(
//   'http://192.168.1.10:8000/api/antrian'
// );
//
// console.log(pasienRes.data);
// console.log(antrianRes.data);
//
// ================================

// const fetchKunjungans = async () => {
//   try {

//     // REGISTRASI
//     const pasienRes = await axios.get(
//       'http://192.168.1.10:8000/api/pasien'
//     );

//     const antrianRes = await axios.get(
//       'http://192.168.1.10:8000/api/antrian'
//     );

//     console.log(pasienRes.data);
//     console.log(antrianRes.data);

//   } catch (error) {
//     console.error(error);
//   }
// };
const fetchKunjungans = async () => {
  try {
    const pasienRes = await axios.get(
      'http://192.168.0.101:3001/api/pasien'
    );

    const antrianRes = await axios.get(
      'http://192.168.0.101:3001/api/antrian'
    );

    console.log('Pasien:', pasienRes.data);
    console.log('Antrian:', antrianRes.data);

  } catch (error) {
    console.error(error);
  }
};
  // const fetchKunjungans = async () => {
  //   try {
  //     const response = await api.get('/kunjungans'); 
  //     // axios.get(`${REGISTRASI_API}/antrian`)
  //     setKunjungans(response.data);
  //   } catch (error) {
  //     console.error('Failed to fetch kunjungans', error);
  //   }
  // };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Dashboard Pendaftaran
          </h1>
          <p className="text-slate-500 mt-1">
            Kelola antrean dan pendaftaran pasien baru
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus size={20} />
          Daftar Pasien Baru
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label: 'Total Antrean Hari Ini',
            value: kunjungans.filter(
              (k) =>
                k.tanggal_kunjungan ===
                new Date().toISOString().split('T')[0]
            ).length,
            icon: Activity,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
          },
          {
            label: 'Selesai Diperiksa',
            value: kunjungans.filter((k) => k.status_saat_ini === 'selesai')
              .length,
            icon: Search,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
          },
          {
            label: 'Menunggu Apotek',
            value: kunjungans.filter((k) => k.status_saat_ini === 'apotek')
              .length,
            icon: Plus,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>

              <div>
                <p className="text-slate-500 text-sm font-medium">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold text-slate-800">
                  {stat.value}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Daftar Kunjungan Pasien
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Cari dan lihat status kunjungan pasien
            </p>
          </div>

          <input
            type="text"
            placeholder="Cari nama pasien..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-80 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Nama Pasien</th>
                <th className="px-6 py-4">No Hp</th>
                <th className="px-6 py-4">Tanggal Kunjungan</th>
                <th className="px-6 py-4">Status Saat Ini</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredKunjungans.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    Belum ada data kunjungan
                  </td>
                </tr>
              ) : (
                filteredKunjungans.map((k) => (
                  <tr
                    key={k.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      #{k.id}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                          {k.pasien?.nama_pasien?.charAt(0) || '-'}
                        </div>

                        <span className="font-semibold text-slate-800">
                          {k.pasien?.nama_pasien || '-'}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-slate-500">
                      {k.pasien?.no_hp || '-'}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar size={16} />
                        {k.tanggal_kunjungan}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                          k.status_saat_ini
                        )}`}
                      >
                        {getStatusLabel(k.status_saat_ini)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
    className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h2 className="text-xl font-bold text-slate-800">
                  Daftar Pasien Baru
                </h2>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">

<div>
  <label className="block text-sm font-medium text-slate-700 mb-1">
    Nomor RM
  </label>

  <input
    type="text"
    value={formData.nomor_rm}
    onChange={(e) =>
      setFormData({
        ...formData,
        nomor_rm: e.target.value,
      })
    }
    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
  />
</div>

<div>
  <label className="block text-sm font-medium text-slate-700 mb-1">
    Nama Pasien
  </label>

  <input
    type="text"
    required
    value={formData.nama_pasien}
    onChange={(e) =>
      setFormData({
        ...formData,
        nama_pasien: e.target.value,
      })
    }
    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
  />
</div>

<div>
  <label className="block text-sm font-medium text-slate-700 mb-1">
    NIK
  </label>

  <input
    type="text"
    value={formData.nik}
    onChange={(e) =>
      setFormData({
        ...formData,
        nik: e.target.value,
      })
    }
    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
  />
</div>

<div>
  <label className="block text-sm font-medium text-slate-700 mb-1">
    Jenis Kelamin
  </label>

  <select
    value={formData.jenis_kelamin}
    onChange={(e) =>
      setFormData({
        ...formData,
        jenis_kelamin: e.target.value,
      })
    }
    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
  >
    <option value="">Pilih</option>
    <option value="L">Laki-Laki</option>
    <option value="P">Perempuan</option>
  </select>
</div>
<div>
  <label className="block text-sm font-medium text-slate-700 mb-1">
    Tanggal Lahir
  </label>

  <input
    type="date"
    value={formData.tanggal_lahir}
    onChange={(e) =>
      setFormData({
        ...formData,
        tanggal_lahir: e.target.value,
      })
    }
    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
  />
</div>
<div>
  <label className="block text-sm font-medium text-slate-700 mb-1">
    Alamat
  </label>

  <textarea
    value={formData.alamat}
    onChange={(e) =>
      setFormData({
        ...formData,
        alamat: e.target.value,
      })
    }
    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
  />
</div>
<div>
  <label className="block text-sm font-medium text-slate-700 mb-1">
    No HP
  </label>

  <input
    type="text"
    value={formData.no_hp}
    onChange={(e) =>
      setFormData({
        ...formData,
        no_hp: e.target.value,
      })
    }
    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
  />
</div>
<div>
  <label className="block text-sm font-medium text-slate-700 mb-1">
    Keluhan
  </label>

  <textarea
    value={formData.keluhan}
    onChange={(e) =>
      setFormData({
        ...formData,
        keluhan: e.target.value,
      })
    }
    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
  />
</div>
<div>
  <label className="block text-sm font-medium text-slate-700 mb-1">
    Tanggal Kunjungan
  </label>

  <input
    type="date"
    required
    value={formData.tanggal_kunjungan}
    onChange={(e) =>
      setFormData({
        ...formData,
        tanggal_kunjungan: e.target.value,
      })
    }
    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
  />
</div>
<div className="pt-4 flex gap-3">
  <button
    type="button"
    onClick={() => setIsModalOpen(false)}
    className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl font-medium"
  >
    Batal
  </button>

  <button
    type="submit"
    disabled={loading}
    className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium"
  >
    Simpan Pendaftaran
  </button>
</div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}