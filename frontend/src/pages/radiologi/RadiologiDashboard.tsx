import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, ScanLine, ArrowRight, CheckCircle, X } from 'lucide-react';
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

export default function RadiologiDashboard() {
  const [antrean, setAntrean] = useState<Kunjungan[]>([]);
  const [petugas, setPetugas] = useState<Dokter[]>([]);
  const [selectedKunjungan, setSelectedKunjungan] =
    useState<Kunjungan | null>(null);

  const [formData, setFormData] = useState({
    dokter_id: '',
    pemeriksaan: [] as string[],
    keterangan: '',
    status: 'selesai',
  });

  const [loading, setLoading] = useState(false);

  const grupPemeriksaan = [
    {
      title: 'X-RAY',
      items: ['Thorax AP/PA', 'Thorax AP dan Lateral', 'BNO', 'BNO 3 Posisi'],
    },
    {
      title: 'USG',
      items: ['USG Abdomen', 'USG Thyroid', 'USG Mamae', 'USG Testis'],
    },
    {
      title: 'CT SCAN',
      items: ['CT Scan Kepala', 'CT Scan Thorax', 'CT Scan Leher'],
    },
    {
      title: 'MRI KONTRAS',
      items: [
        'MRI Fistulografy',
        'MRI Kepala',
        'MRI Abdomen',
        'MRI Pelvis',
        'MRI Vetebra Cervical',
        'MRI Vetebra Thoracal',
        'MRI Lumbosakral',
      ],
    },
    {
      title: 'MRI NON KONTRAS',
      items: [
        'MRI Kepala',
        'MRI Abdomen',
        'MRI Pelvis',
        'MRI Vetebra Cervical',
        'MRI Vetebra Thoracal',
        'MRI Lumbosakral',
      ],
    },
  ];

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
        kRes.data.filter((k: Kunjungan) => k.status_saat_ini === 'radiologi')
      );

      setPetugas(
        dRes.data.filter(
          (d: Dokter) => d.spesialis.toLowerCase() === 'radiologi'
        )
      );
    } catch (error) {
      console.error('Failed to fetch data', error);
    }
  };

  const handlePeriksa = (kunjungan: Kunjungan) => {
    setSelectedKunjungan(kunjungan);

    setFormData({
      dokter_id: petugas.length > 0 ? petugas[0].id.toString() : '',
      pemeriksaan: [],
      keterangan: '',
      status: 'selesai',
    });
  };

  const togglePemeriksaan = (nama: string) => {
    setFormData((prev) => ({
      ...prev,
      pemeriksaan: prev.pemeriksaan.includes(nama)
        ? prev.pemeriksaan.filter((item) => item !== nama)
        : [...prev.pemeriksaan, nama],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedKunjungan) return;

    setLoading(true);

    try {
      const hasilRadiologi = `
Pemeriksaan:
${formData.pemeriksaan.length > 0 ? formData.pemeriksaan.join(', ') : '-'}

Keterangan:
${formData.keterangan || '-'}
`;

      await api.post('/pemeriksaan-radiologis', {
        kunjungan_id: selectedKunjungan.id,
        id_pasien: selectedKunjungan.id_pasien,
        dokter_id: formData.dokter_id,
        jenis_pemeriksaan: formData.pemeriksaan.join(', ') || '-',
        hasil_radiologi: hasilRadiologi,
        status: 'selesai',
      });

      setSelectedKunjungan(null);
      fetchData();
    } catch (error) {
      console.error('Failed to submit hasil', error);
      alert('Gagal menyimpan hasil radiologi.');
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
        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
          Radiologi
        </h1>
        <p className="text-slate-500 mt-1">
          Pemeriksaan citra medis dan penginputan hasil radiologi pasien
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <Activity className="text-orange-500" size={20} />
              Antrean Radiologi
            </h2>

            <span className="bg-orange-100 text-orange-800 text-xs font-bold px-3 py-1 rounded-full">
              {antrean.length} Pasien
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {antrean.length === 0 ? (
              <div className="text-center text-slate-500 py-10">
                Tidak ada antrean di Radiologi.
              </div>
            ) : (
              antrean.map((k) => (
                <div
                  key={k.id}
                  onClick={() => handlePeriksa(k)}
                  className="p-4 rounded-xl border border-slate-100 hover:border-orange-300 hover:bg-orange-50 cursor-pointer transition-all flex justify-between items-center group"
                >
                  <div>
                    <p className="font-semibold text-slate-800 group-hover:text-orange-700">
                      {k.pasien?.nama_pasien || 'Pasien Tidak Ditemukan'}
                    </p>
                    <p className="text-xs text-slate-500">
                      Antrean #{k.id}
                    </p>
                  </div>

                  <ArrowRight
                    size={18}
                    className="text-slate-300 group-hover:text-orange-500"
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
                    <ScanLine className="text-orange-500" />
                    Hasil Radiologi
                  </h2>

                  <p className="text-slate-500 text-sm mt-1">
                    Pasien:{' '}
                    <span className="font-semibold text-slate-700">
                      {selectedKunjungan.pasien?.nama_pasien ||
                        'Pasien Tidak Ditemukan'}
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Petugas Radiologi
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
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                  >
                    <option value="">Pilih Petugas</option>
                    {petugas.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nama_dokter}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Pemeriksaan Radiologi
                  </label>

                  <div className="border border-slate-200 rounded-xl p-4 bg-white grid grid-cols-1 md:grid-cols-3 gap-6">
                    {grupPemeriksaan.map((group) => (
                      <div key={group.title}>
                        <h3 className="font-bold text-slate-800 mb-2">
                          {group.title}
                        </h3>

                        <div className="space-y-2">
                          {group.items.map((item) => (
                            <label
                              key={`${group.title}-${item}`}
                              className="flex items-center gap-2 text-sm text-slate-700"
                            >
                              <input
                                type="checkbox"
                                checked={formData.pemeriksaan.includes(item)}
                                onChange={() => togglePemeriksaan(item)}
                                className="w-4 h-4 accent-orange-500"
                              />
                              {item}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Keterangan
                  </label>

                  <textarea
                    rows={4}
                    value={formData.keterangan}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        keterangan: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="Tambahkan catatan atau hasil bacaan radiologi..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-medium shadow-lg shadow-orange-500/30 transition-all disabled:opacity-70 flex justify-center items-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      Simpan Hasil & Kembalikan ke Poli Umum
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          ) : (
            <div className="h-[600px] flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-2xl border border-slate-100 border-dashed">
              <ScanLine size={64} className="mb-4 text-slate-300" />
              <p>Pilih pasien dari antrean untuk memasukkan hasil radiologi</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}