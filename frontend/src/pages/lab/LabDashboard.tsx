import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, FlaskConical, ArrowRight, CheckCircle, X } from 'lucide-react';
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

export default function LabDashboard() {
  const [antrean, setAntrean] = useState<Kunjungan[]>([]);
  const [petugas, setPetugas] = useState<Dokter[]>([]);
  const [selectedKunjungan, setSelectedKunjungan] = useState<Kunjungan | null>(null);
  const [formData, setFormData] = useState({
    dokter_id: '',
    jenis_pemeriksaan: '',
    hasil_lab: '',
    status: 'selesai',
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
      setAntrean(kRes.data.filter((k: Kunjungan) => k.status_saat_ini === 'lab'));
      setPetugas(dRes.data.filter((d: Dokter) => d.spesialis.toLowerCase() === 'laboratorium'));
    } catch (error) {
      console.error('Failed to fetch data', error);
    }
  };

  const handlePeriksa = (kunjungan: Kunjungan) => {
    setSelectedKunjungan(kunjungan);
    setFormData({
      dokter_id: petugas.length > 0 ? petugas[0].id.toString() : '',
      jenis_pemeriksaan: '',
      hasil_lab: '',
      status: 'selesai',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKunjungan) return;
    
    setLoading(true);
    try {
      await api.post('/pemeriksaan-labs', {
        kunjungan_id: selectedKunjungan.id,
        ...formData
      });
      setSelectedKunjungan(null);
      fetchData();
    } catch (error) {
      console.error('Failed to submit hasil lab', error);
      alert('Gagal menyimpan hasil laboratorium.');
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
                    <p className="font-semibold text-slate-800 group-hover:text-purple-700">{k.pasien.name}</p>
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
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <FlaskConical className="text-purple-500" /> Hasil Pemeriksaan Lab
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">Pasien: <span className="font-semibold text-slate-700">{selectedKunjungan.pasien.name}</span></p>
                </div>
                <button onClick={() => setSelectedKunjungan(null)} className="text-slate-400 hover:text-red-500"><X size={24} /></button>
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Jenis Pemeriksaan Lab</label>
                  <input type="text" required value={formData.jenis_pemeriksaan} onChange={e => setFormData({...formData, jenis_pemeriksaan: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Misal: Darah Lengkap, Urine Rutin..." />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Hasil Pemeriksaan</label>
                  <textarea required rows={4} value={formData.hasil_lab} onChange={e => setFormData({...formData, hasil_lab: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Catat hasil pemeriksaan secara detail..." />
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
