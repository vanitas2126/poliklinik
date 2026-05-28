import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Pill, ArrowRight, CheckCircle, X } from 'lucide-react';
import api from '../../api';

interface Pasien { id: number; name: string; }
interface Kunjungan { id: number; pasien_id: number; tanggal_kunjungan: string; status_saat_ini: string; pasien: Pasien; }

export default function ApotekDashboard() {
  const [antrean, setAntrean] = useState<Kunjungan[]>([]);
  const [selectedKunjungan, setSelectedKunjungan] = useState<Kunjungan | null>(null);
  const [formData, setFormData] = useState({ nama_obat: '', dosis: '', keterangan: '', status: 'diberikan' });
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const kRes = await api.get('/kunjungans');
      setAntrean(kRes.data.filter((k: Kunjungan) => k.status_saat_ini === 'apotek'));
    } catch (error) { console.error('Failed to fetch data', error); }
  };

  const handlePilih = (kunjungan: Kunjungan) => {
    setSelectedKunjungan(kunjungan);
    setFormData({ nama_obat: '', dosis: '', keterangan: '', status: 'diberikan' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKunjungan) return;
    setLoading(true);
    try {
      await api.post('/resep-obats', { kunjungan_id: selectedKunjungan.id, ...formData });
      setSelectedKunjungan(null);
      fetchData();
    } catch (error) {
      console.error('Failed to submit resep', error);
      alert('Gagal memproses resep obat.');
    } finally { setLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Apotek</h1>
        <p className="text-slate-500 mt-1">Penyerahan obat dan resep kepada pasien</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2"><Activity className="text-emerald-500" size={20} /> Antrean Apotek</h2>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">{antrean.length} Pasien</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {antrean.length === 0 ? <div className="text-center text-slate-500 py-10">Tidak ada antrean di Apotek.</div> : 
              antrean.map(k => (
                <div key={k.id} onClick={() => handlePilih(k)} className="p-4 rounded-xl border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50 cursor-pointer transition-all flex justify-between items-center group">
                  <div><p className="font-semibold text-slate-800 group-hover:text-emerald-700">{k.pasien.name}</p><p className="text-xs text-slate-500">Antrean #{k.id}</p></div>
                  <ArrowRight size={18} className="text-slate-300 group-hover:text-emerald-500" />
                </div>
              ))
            }
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedKunjungan ? (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Pill className="text-emerald-500" /> Pemberian Obat</h2>
                  <p className="text-slate-500 text-sm mt-1">Pasien: <span className="font-semibold text-slate-700">{selectedKunjungan.pasien.name}</span></p>
                </div>
                <button onClick={() => setSelectedKunjungan(null)} className="text-slate-400 hover:text-red-500"><X size={24} /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nama Obat</label>
                  <input type="text" required value={formData.nama_obat} onChange={e => setFormData({...formData, nama_obat: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Misal: Paracetamol, Amoxicillin..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Dosis / Aturan Pakai</label>
                  <input type="text" required value={formData.dosis} onChange={e => setFormData({...formData, dosis: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Misal: 3 x 1 Sesudah Makan" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan Tambahan</label>
                  <textarea rows={3} value={formData.keterangan} onChange={e => setFormData({...formData, keterangan: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Catatan untuk pasien (opsional)..." />
                </div>
                <button type="submit" disabled={loading} className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/30 transition-all disabled:opacity-70 flex justify-center items-center gap-2">
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><CheckCircle size={20} /> Serahkan Obat & Selesai</>}
                </button>
              </form>
            </motion.div>
          ) : (
            <div className="h-[600px] flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-2xl border border-slate-100 border-dashed">
              <Pill size={64} className="mb-4 text-slate-300" />
              <p>Pilih pasien dari antrean untuk memproses resep</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
