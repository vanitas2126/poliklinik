import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, User, Briefcase, Mail, Key, Pencil, Trash2 } from 'lucide-react';
import api from '../../api';
import axios from 'axios';
const DOKTER_API = 'http://192.168.0.101:8000/api/dokters';

interface Dokter {
  id: number;
  nama_dokter: string;
  spesialis: string;
  user?: {
    email: string;
  };
}

export default function MasterDokter() {
  const [dokters, setDokters] = useState<Dokter[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDokter, setEditingDokter] = useState<Dokter | null>(null);
  const [jenisSpesialis, setJenisSpesialis] = useState('');
  const [detailSpesialis, setDetailSpesialis] = useState('');

  const [formData, setFormData] = useState({
    nama_dokter: '',
    spesialis: '',
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDokters();
  }, []);

const fetchDokters = async () => {
  try {

    // ===== LOCAL DATABASE =====
    const response = await api.get('/dokters');
    setDokters(response.data);

    // ===== API DOKTER (HARI H) =====
    // const response = await axios.get(`${DOKTER_API}/dokters`);
    // setDokters(response.data);

  } catch (error) {
    console.error('Failed to fetch dokters', error);
  }
};

  const resetForm = () => {
    setFormData({
      nama_dokter: '',
      spesialis: '',
      email: '',
      password: '',
    });
    setJenisSpesialis('');
    setDetailSpesialis('');
    setEditingDokter(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (dokter: Dokter) => {
    setEditingDokter(dokter);

    const spesialisLower = dokter.spesialis.toLowerCase();

    if (['umum'].includes(spesialisLower)) {
      setJenisSpesialis(spesialisLower);
      setDetailSpesialis('');
    } else {
      setJenisSpesialis('spesialis');
      setDetailSpesialis(dokter.spesialis.replace(/^spesialis\s*/i, ''));
    }

    setFormData({
      nama_dokter: dokter.nama_dokter,
      spesialis: dokter.spesialis,
      email: dokter.user?.email || '',
      password: '',
    });

    setIsModalOpen(true);
  };

  const getFinalSpesialis = () => {
    if (jenisSpesialis === 'spesialis') {
      return detailSpesialis.trim()
        ? `Spesialis ${detailSpesialis.trim()}`
        : '';
    }

    return jenisSpesialis;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalSpesialis = getFinalSpesialis();

    if (!finalSpesialis) {
      alert('Spesialisasi wajib dipilih.');
      return;
    }

    setLoading(true);

    try {
      const payload: any = {
        nama_dokter: formData.nama_dokter,
        spesialis: finalSpesialis,
        email: formData.email,
      };

      if (!editingDokter || formData.password.trim()) {
        payload.password = formData.password;
      }

      if (editingDokter) {
        await api.put(`/dokters/${editingDokter.id}`, payload);
      } else {
        await api.post('/dokters', payload);
      }

      setIsModalOpen(false);
      resetForm();
      fetchDokters();
    } catch (error: any) {
      console.error('Failed to submit', error.response?.data || error);
      alert(error.response?.data?.message || 'Gagal menyimpan dokter.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Yakin ingin menghapus dokter ini?')) {
      try {
        await api.delete(`/dokters/${id}`);
        fetchDokters();
      } catch (error) {
        console.error('Failed to delete', error);
        alert('Gagal menghapus dokter.');
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Master Data Dokter
          </h1>
          <p className="text-slate-500 mt-1">
            Kelola data dokter dan spesialisasi
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus size={20} />
          Tambah Dokter
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dokters.map((dokter, i) => (
          <motion.div
            key={dokter.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-500 ease-out" />

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-bold text-xl shadow-sm">
                  {dokter.nama_dokter.replace('Dr. ', '').charAt(0)}
                </div>

                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditModal(dokter)}
                    className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center hover:bg-blue-100"
                    title="Edit"
                  >
                    <Pencil size={15} />
                  </button>

                  <button
                    onClick={() => handleDelete(dokter.id)}
                    className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100"
                    title="Hapus"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-bold text-slate-800 mb-1">
                {dokter.nama_dokter}
              </h3>

              <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold mb-4 border border-blue-100">
                {dokter.spesialis}
              </span>

              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <Mail size={16} />
                {dokter.user?.email || '-'}
              </div>
            </div>
          </motion.div>
        ))}

        {dokters.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-100 border-dashed">
            Belum ada data dokter.
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h2 className="text-xl font-bold text-slate-800">
                  {editingDokter ? 'Edit Data Dokter' : 'Tambah Dokter Baru'}
                </h2>

                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nama Dokter
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="text"
                      required
                      value={formData.nama_dokter}
                      onChange={(e) =>
                        setFormData({ ...formData, nama_dokter: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="Dr. Nama"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Jenis Dokter / Petugas
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <select
                      required
                      value={jenisSpesialis}
                      onChange={(e) => {
                        setJenisSpesialis(e.target.value);
                        if (e.target.value !== 'spesialis') {
                          setDetailSpesialis('');
                        }
                      }}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    >
                      <option value="">Pilih jenis</option>
                      <option value="umum">Umum</option>
                      <option value="spesialis">Spesialis</option>
                    </select>
                  </div>
                </div>

                {jenisSpesialis === 'spesialis' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Detail Spesialis
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <input
                        type="text"
                        required
                        value={detailSpesialis}
                        onChange={(e) => setDetailSpesialis(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="Contoh: Penyakit Dalam, Kulit, Anak"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email (Untuk Login)
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="dokter@klinik.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Password {editingDokter ? '(Kosongkan jika tidak diubah)' : ''}
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="password"
                      required={!editingDokter}
                      minLength={6}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder={
                        editingDokter
                          ? 'Kosongkan jika tidak diubah'
                          : 'Minimal 6 karakter'
                      }
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      resetForm();
                    }}
                    className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl font-medium transition-colors"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 transition-all disabled:opacity-70 flex justify-center items-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : editingDokter ? (
                      'Update Data'
                    ) : (
                      'Simpan Data'
                    )}
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