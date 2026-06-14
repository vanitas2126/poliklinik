import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, FlaskConical, ArrowRight, CheckCircle, X } from 'lucide-react';
import api from '../../api';

interface Pasien {
  id_pasien: number;
  nomor_rm?: string;
  nama_pasien: string;
  nik?: string;
  jenis_kelamin?: string;
  tanggal_lahir?: string;
  alamat?: string;
  no_hp?: string;
  keluhan?: string;
}

interface Kunjungan {
  id: number;
  id_pasien: number;
  id_antrian?: number;
  tanggal_kunjungan: string;
  status_saat_ini: string;
  pasien: Pasien | null;
}
interface Dokter {
  id: number;
  nama_dokter: string;
  spesialis: string;
}

export default function LabDashboard() {
  const [antrean, setAntrean] = useState<Kunjungan[]>([]);
  const [petugas, setPetugas] = useState<Dokter[]>([]);
  const [selectedKunjungan, setSelectedKunjungan] = useState<Kunjungan | null>(null);
const [formData, setFormData] = useState({
  dokter_id: '',
  hb: '',
  leukosit: '',
  trombosit: '',
  hematokrit: '',
  widal: 'Negatif',
  keterangan: '',
});
const handlePeriksa = (kunjungan: Kunjungan) => {
  setSelectedKunjungan(kunjungan);

setFormData({
  dokter_id: petugas.length > 0 ? petugas[0].id.toString() : '',
  hb: '',
  leukosit: '',
  trombosit: '',
  hematokrit: '',
  widal: 'Negatif',
  keterangan: '',
});
};
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [kRes, dRes] = await Promise.all([
        api.get('/kunjungans'),
        api.get('/dokters')
      ]);
      setAntrean(kRes.data.filter((k: Kunjungan) => k.status_saat_ini === 'lab'));
      setPetugas(dRes.data.filter((d: Dokter) => d.spesialis.toLowerCase() === 'laboratorium'));
    } catch (error) {
      console.error('Failed to fetch data', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKunjungan) return;
    
    setLoading(true);
try {
const hasilLab = `Hemoglobin (Hb): ${formData.hb || '-'} | Normal: 12 - 15 g/dL
Leukosit: ${formData.leukosit || '-'} | Normal: 4.000 - 11.000
Trombosit: ${formData.trombosit || '-'} | Normal: 150.000 - 450.000
Hematokrit: ${formData.hematokrit || '-'} | Normal: 40 - 54 %
Widal Test: ${formData.widal || '-'} | Normal: Negatif

Keterangan:
${formData.keterangan || '-'}`;
  await api.post('/pemeriksaan-labs', {
    kunjungan_id: selectedKunjungan.id,
    id_pasien: selectedKunjungan.id_pasien,
    dokter_id: formData.dokter_id,
    hasil_lab: hasilLab,
    status: 'selesai',
  });
      setSelectedKunjungan(null);
      fetchData();
    } catch (error: any) {
  console.error(error);

  alert(
    error?.response?.data?.message ||
    JSON.stringify(error?.response?.data) ||
    'Gagal menyimpan hasil laboratorium.'
  );
} finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
          Laboratorium
        </h1>
        <p className="text-slate-500 mt-1">Pemeriksaan sampel dan penginputan hasil laboratorium pasien</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <Activity className="text-purple-500" size={20} /> Antrean Lab
            </h2>
            <span className="bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1 rounded-full">{antrean.length} Pasien</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {antrean.length === 0 ? (
              <div className="text-center text-slate-500 py-10">Tidak ada antrean di Laboratorium.</div>
            ) : (
              antrean.map(k => (
                <div 
                  key={k.id} 
                  className="p-4 rounded-xl border border-slate-100 hover:border-purple-300 hover:bg-purple-50 cursor-pointer transition-all flex justify-between items-center group"
                  onClick={() => handlePeriksa(k)}
                >
                  <div>
                    <p className="font-semibold text-slate-800 group-hover:text-purple-700">{k.pasien?.nama_pasien || 'Pasien Tidak Ditemukan'}</p>
                    <p className="text-xs text-slate-500">Antrean #{k.id}</p>
                  </div>
                  <ArrowRight size={18} className="text-slate-300 group-hover:text-purple-500" />
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
                className="relative bg-white rounded-2xl border border-slate-100 shadow-sm p-6"
              >
              <div className="relative mb-6 pb-4 border-b border-slate-100">
                <button
                  onClick={() => setSelectedKunjungan(null)}
                  className="absolute top-0 right-0 text-slate-400 hover:text-red-500"
                >
                  <X size={28} />
                </button>

                <div>
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <FlaskConical className="text-purple-500" />
                    Hasil Pemeriksaan Lab
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
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Petugas Pemeriksa</label>
                  <select required value={formData.dokter_id} onChange={e => setFormData({...formData, dokter_id: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none">
                    <option value="">Pilih Petugas</option>
                    {petugas.map(p => <option key={p.id} value={p.id}>{p.nama_dokter}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Hasil Pemeriksaan</label>
                    <div className="overflow-x-auto border rounded-xl">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-100">
                          <tr>
                            <th className="p-3 text-left">Parameter</th>
                            <th className="p-3 text-left">Hasil Pasien</th>
                            <th className="p-3 text-left">Nilai Normal</th>
                          </tr>
                        </thead>

                        <tbody>
                          <tr>
                            <td className="p-3">Hemoglobin (Hb)</td>
                            <td className="p-3">
                              <input
                                type="text"
                                value={formData.hb}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    hb: e.target.value,
                                  })
                                }
                                className="input input-bordered w-full"
                              />
                            </td>
                            <td className="p-3">12 - 15 g/dL</td>
                          </tr>

                          <tr>
                            <td className="p-3">Leukosit</td>
                            <td className="p-3">
                              <input
                                type="text"
                                value={formData.leukosit}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    leukosit: e.target.value,
                                  })
                                }
                                className="input input-bordered w-full"
                              />
                            </td>
                            <td className="p-3">4.000 - 11.000</td>
                          </tr>

                          <tr>
                            <td className="p-3">Trombosit</td>
                            <td className="p-3">
                              <input
                                type="text"
                                value={formData.trombosit}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    trombosit: e.target.value,
                                  })
                                }
                                className="input input-bordered w-full"
                              />
                            </td>
                            <td className="p-3">150.000 - 450.000</td>
                          </tr>

                          <tr>
                            <td className="p-3">Hematokrit</td>
                            <td className="p-3">
                              <input
                                type="text"
                                value={formData.hematokrit}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    hematokrit: e.target.value,
                                  })
                                }
                                className="input input-bordered w-full"
                              />
                            </td>
                            <td className="p-3">40 - 54 %</td>
                          </tr>

                          <tr>
                            <td className="p-3">Widal Test</td>
                            <td className="p-3">
                              <select
                                value={formData.widal}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    widal: e.target.value,
                                  })
                                }
                                className="select select-bordered w-full"
                              >
                                <option>Negatif</option>
                                <option>Positif</option>
                              </select>
                            </td>
                            <td className="p-3">Negatif</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Keterangan
                    </label>

                    <textarea
                      rows={3}
                      value={formData.keterangan}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          keterangan: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                      placeholder="Tambahkan keterangan hasil pemeriksaan..."
                    />
                  </div>
                <button type="submit" disabled={loading} className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium shadow-lg shadow-purple-500/30 transition-all disabled:opacity-70 flex justify-center items-center gap-2">
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><CheckCircle size={20} /> Simpan Hasil & Kembalikan ke Poli Umum</>}
                </button>
              </form>
            </motion.div>
          ) : (
            <div className="h-[600px] flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-2xl border border-slate-100 border-dashed">
              <FlaskConical size={64} className="mb-4 text-slate-300" />
              <p>Pilih pasien dari antrean untuk memasukkan hasil lab</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
