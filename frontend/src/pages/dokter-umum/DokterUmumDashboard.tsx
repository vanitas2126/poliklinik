import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Stethoscope, ArrowRight, CheckCircle, FileText, X } from 'lucide-react';
import api from '../../api';

interface Pasien {
  id: number;
  name: string;
}

interface Kunjungan {
  id: number;
  pasien_id: number;
  tanggal_kunjungan: string;
  status_saat_ini: string;
  pasien: Pasien;
}

interface Dokter {
  id: number;
  nama_dokter: string;
  spesialis: string;
}

export default function DokterUmumDashboard() {
  const [antrean, setAntrean] = useState<Kunjungan[]>([]);
  const [dokters, setDokters] = useState<Dokter[]>([]);
  const [selectedKunjungan, setSelectedKunjungan] = useState<Kunjungan | null>(null);
  const [formData, setFormData] = useState({
    dokter_id: '',
    pemeriksaan_awal: '',
    kategori_penyakit: 'ringan',
    diagnosa_awal: '',
    tindakan: '',
    rujukan: 'none',
  });
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
      setAntrean(kRes.data.filter((k: Kunjungan) => k.status_saat_ini === 'poli_umum'));
      setDokters(dRes.data.filter((d: Dokter) => d.spesialis.toLowerCase() === 'umum'));
    } catch (error) {
      console.error('Failed to fetch data', error);
    }
  };

  const handlePeriksa = (kunjungan: Kunjungan) => {
    setSelectedKunjungan(kunjungan);
    setFormData({
      dokter_id: dokters.length > 0 ? dokters[0].id.toString() : '',
      pemeriksaan_awal: '',
      kategori_penyakit: 'ringan',
      diagnosa_awal: '',
      tindakan: '',
      rujukan: 'none',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKunjungan) return;
    
    setLoading(true);
    try {
      await api.post('/pemeriksaan-umums', {
        kunjungan_id: selectedKunjungan.id,
        ...formData
      });
      setSelectedKunjungan(null);
      fetchData();
    } catch (error) {
      console.error('Failed to submit pemeriksaan', error);
      alert('Gagal menyimpan hasil pemeriksaan.');
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
        <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
          Poli Umum
        </h1>
        <p className="text-slate-500 mt-1">Antrean pemeriksaan dan diagnosa awal pasien</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Antrean List */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <Activity className="text-teal-500" size={20} /> Antrean Saat Ini
            </h2>
            <span className="bg-teal-100 text-teal-800 text-xs font-bold px-3 py-1 rounded-full">{antrean.length} Pasien</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {antrean.length === 0 ? (
              <div className="text-center text-slate-500 py-10">Tidak ada antrean di Poli Umum.</div>
            ) : (
              antrean.map(k => (
                <div 
                  key={k.id} 
                  className="p-4 rounded-xl border border-slate-100 hover:border-teal-300 hover:bg-teal-50 cursor-pointer transition-all flex justify-between items-center group"
                  onClick={() => handlePeriksa(k)}
                >
                  <div>
                    <p className="font-semibold text-slate-800 group-hover:text-teal-700">{k.pasien.name}</p>
                    <p className="text-xs text-slate-500">Antrean #{k.id}</p>
                  </div>
                  <ArrowRight size={18} className="text-slate-300 group-hover:text-teal-500" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Form Pemeriksaan */}
        <div className="lg:col-span-2">
          {selectedKunjungan ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6"
            >
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Stethoscope className="text-teal-500" /> Form Pemeriksaan
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">Pasien: <span className="font-semibold text-slate-700">{selectedKunjungan.pasien.name}</span></p>
                </div>
                <button onClick={() => setSelectedKunjungan(null)} className="text-slate-400 hover:text-red-500"><X size={24} /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Dokter Pemeriksa</label>
                    <select 
                      required
                      value={formData.dokter_id}
                      onChange={e => setFormData({...formData, dokter_id: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                    >
                      <option value="">Pilih Dokter</option>
                      {dokters.map(d => <option key={d.id} value={d.id}>{d.nama_dokter}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Kategori Penyakit</label>
                    <select 
                      value={formData.kategori_penyakit}
                      onChange={e => setFormData({...formData, kategori_penyakit: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                    >
                      <option value="ringan">Ringan</option>
                      <option value="berat">Berat</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Keluhan / Pemeriksaan Awal</label>
                  <textarea 
                    required rows={3}
                    value={formData.pemeriksaan_awal}
                    onChange={e => setFormData({...formData, pemeriksaan_awal: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                    placeholder="Catat keluhan pasien..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Diagnosa Awal</label>
                  <textarea 
                    required rows={2}
                    value={formData.diagnosa_awal}
                    onChange={e => setFormData({...formData, diagnosa_awal: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                    placeholder="Diagnosa..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tindakan</label>
                  <input 
                    type="text"
                    value={formData.tindakan}
                    onChange={e => setFormData({...formData, tindakan: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                    placeholder="Tindakan yang diberikan..."
                  />
                </div>

                <div className="p-4 bg-teal-50/50 rounded-xl border border-teal-100">
                  <label className="block text-sm font-semibold text-teal-800 mb-3 flex items-center gap-2">
                    <FileText size={16} /> Rujukan Selanjutnya
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { id: 'none', label: 'Langsung Apotek' },
                      { id: 'lab', label: 'Laboratorium' },
                      { id: 'radiologi', label: 'Radiologi' },
                      { id: 'spesialis', label: 'Poli Spesialis' },
                    ].map(r => (
                      <label key={r.id} className={`flex items-center justify-center p-3 rounded-xl border cursor-pointer transition-all ${formData.rujukan === r.id ? 'border-teal-500 bg-teal-50 text-teal-700 ring-2 ring-teal-200' : 'border-slate-200 bg-white text-slate-600 hover:border-teal-300'}`}>
                        <input 
                          type="radio" 
                          name="rujukan" 
                          value={r.id} 
                          checked={formData.rujukan === r.id}
                          onChange={e => setFormData({...formData, rujukan: e.target.value})}
                          className="hidden"
                        />
                        <span className="font-medium text-sm">{r.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium shadow-lg shadow-teal-500/30 transition-all disabled:opacity-70 flex justify-center items-center gap-2"
                >
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><CheckCircle size={20} /> Simpan & Proses Kunjungan</>}
                </button>
              </form>
            </motion.div>
          ) : (
            <div className="h-[600px] flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-2xl border border-slate-100 border-dashed">
              <Stethoscope size={64} className="mb-4 text-slate-300" />
              <p>Pilih pasien dari antrean untuk mulai pemeriksaan</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
