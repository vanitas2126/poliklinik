import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Stethoscope, ArrowRight, CheckCircle, X } from 'lucide-react';
import api from '../../api';

interface Pasien {
  id_pasien: number;
  nomor_rm?: string;
  nama_pasien: string;
  no_hp?: string;
  keluhan?: string;
}

interface Kunjungan {
  id: number;
  id_pasien: number;
  tanggal_kunjungan: string;
  status_saat_ini: string;
  pasien: Pasien | null;
}

interface Dokter {
  id: number;
  nama_dokter: string;
  spesialis: string;
}

export default function DokterSpesialisDashboard() {
  const [antrean, setAntrean] = useState<Kunjungan[]>([]);
  const [dokters, setDokters] = useState<Dokter[]>([]);
  const [selectedKunjungan, setSelectedKunjungan] = useState<Kunjungan | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    dokter_id: '',
    diagnosa_akhir: '',
    tindakan_akhir: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [kRes, dRes] = await Promise.all([
        api.get('/kunjungans'),
        api.get('/dokters'),
      ]);

      setAntrean(
        kRes.data.filter(
          (k: Kunjungan) => k.status_saat_ini === 'spesialis'
        )
      );

      setDokters(
        dRes.data.filter(
          (d: Dokter) => d.spesialis.toLowerCase() !== 'umum'
        )
      );
    } catch (error) {
      console.error('Failed to fetch data', error);
    }
  };

  const handlePeriksa = (kunjungan: Kunjungan) => {
    setSelectedKunjungan(kunjungan);
    setFormData({
      dokter_id: dokters.length > 0 ? dokters[0].id.toString() : '',
      diagnosa_akhir: '',
      tindakan_akhir: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedKunjungan) return;

    setLoading(true);

    try {
      await api.post('/pemeriksaan-spesialis', {
        kunjungan_id: selectedKunjungan.id,
        ...formData,
      });

      await api.post('/riwayats', {
        kunjungan_id: selectedKunjungan.id,
        biaya_umum: 50000,
        biaya_lab: 0,
        biaya_radiologi: 0,
        biaya_spesialis: 120000,
        total_biaya: 170000,
      });

      await api.patch(`/kunjungans/${selectedKunjungan.id}/status`, {
        status_saat_ini: 'selesai',
      });

      setSelectedKunjungan(null);
      setSuccessMessage('Pemeriksaan spesialis berhasil disimpan ke riwayat.');

      fetchData();

      setTimeout(() => {
        setSuccessMessage('');
      }, 2500);
    } catch (error: any) {
      console.error(error.response?.data || error);
      alert(error.response?.data?.message || 'Gagal menyimpan hasil spesialis.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
          Poli Spesialis
        </h1>
        <p className="text-slate-500 mt-1">
          Pemeriksaan dan diagnosa lanjutan oleh dokter spesialis
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <Activity className="text-pink-500" size={20} />
              Antrean Spesialis
            </h2>
            <span className="bg-pink-100 text-pink-800 text-xs font-bold px-3 py-1 rounded-full">
              {antrean.length} Pasien
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {antrean.length === 0 ? (
              <div className="text-center text-slate-500 py-10">
                Tidak ada antrean di Poli Spesialis.
              </div>
            ) : (
              antrean.map((k) => (
                <div
                  key={k.id}
                  onClick={() => handlePeriksa(k)}
                  className="p-4 rounded-xl border border-slate-100 hover:border-pink-300 hover:bg-pink-50 cursor-pointer transition-all flex justify-between items-center group"
                >
                  <div>
                    <p className="font-semibold text-slate-800 group-hover:text-pink-700">
                      {k.pasien?.nama_pasien || 'Pasien Tidak Ditemukan'}
                    </p>
                    <p className="text-xs text-slate-500">Antrean #{k.id}</p>
                  </div>
                  <ArrowRight
                    size={18}
                    className="text-slate-300 group-hover:text-pink-500"
                  />
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedKunjungan ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6"
            >
              <div className="relative mb-6 pb-4 border-b border-slate-100">
                <button
                  onClick={() => setSelectedKunjungan(null)}
                  className="absolute top-0 right-0 text-slate-400 hover:text-red-500"
                >
                  <X size={28} />
                </button>

                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Stethoscope className="text-pink-500" />
                  Pemeriksaan Spesialis
                </h2>

                <p className="text-slate-500 text-sm mt-1">
                  Pasien:{' '}
                  <span className="font-semibold text-slate-700">
                    {selectedKunjungan.pasien?.nama_pasien || 'Pasien Tidak Ditemukan'}
                  </span>
                </p>

                <div className="mt-3 w-fit bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                  <p className="text-sm">
                    <span className="font-semibold">No RM:</span>{' '}
                    {selectedKunjungan.pasien?.nomor_rm || '-'}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">No HP:</span>{' '}
                    {selectedKunjungan.pasien?.no_hp || '-'}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Keluhan Awal:</span>{' '}
                    {selectedKunjungan.pasien?.keluhan || '-'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Dokter Spesialis
                  </label>
                  <select
                    required
                    value={formData.dokter_id}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dokter_id: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
                  >
                    <option value="">Pilih Dokter</option>
                    {dokters.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nama_dokter} ({d.spesialis})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Diagnosa Akhir
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.diagnosa_akhir}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        diagnosa_akhir: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
                    placeholder="Masukkan diagnosa akhir..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tindakan Akhir
                  </label>
                  <input
                    type="text"
                    value={formData.tindakan_akhir}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tindakan_akhir: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
                    placeholder="Tindakan yang diberikan..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-medium disabled:opacity-70 flex justify-center items-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      Simpan ke Riwayat
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          ) : (
            <div className="h-[600px] flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-2xl border border-slate-100 border-dashed">
              <Stethoscope size={64} className="mb-4 text-slate-300" />
              <p>Pilih pasien dari antrean spesialis</p>
            </div>
          )}
        </div>
      </div>

      {successMessage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-3xl shadow-2xl p-10 text-center max-w-lg w-full mx-4">
            <div className="mx-auto mb-5 w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="text-emerald-600" size={50} />
            </div>

            <h2 className="text-4xl font-bold text-emerald-600 mb-4">
              Berhasil
            </h2>

            <p className="text-slate-700 text-lg leading-relaxed">
              {successMessage}
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}