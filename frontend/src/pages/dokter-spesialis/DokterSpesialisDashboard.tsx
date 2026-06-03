import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Stethoscope, ArrowRight, CheckCircle, X } from 'lucide-react';
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

interface PemeriksaanLab {
  id: number;
  kunjungan_id: number;
  status: string;
  hasil_lab?: string;
}

interface PemeriksaanRadiologi {
  id: number;
  kunjungan_id: number;
  status: string;
  hasil_radiologi?: string;
}

export default function DokterSpesialisDashboard() {
  const [antrean, setAntrean] = useState<Kunjungan[]>([]);
  const [dokters, setDokters] = useState<Dokter[]>([]);
  const [labs, setLabs] = useState<PemeriksaanLab[]>([]);
  const [radiologis, setRadiologis] = useState<PemeriksaanRadiologi[]>([]);
  const [selectedKunjungan, setSelectedKunjungan] = useState<Kunjungan | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isResepOpen, setIsResepOpen] = useState(false);

  const [formData, setFormData] = useState({
    dokter_id: '',
    analisa_hasil_rujukan: '',
    diagnosa_akhir: '',
    tindakan_akhir: '',
  });

  const [resepList, setResepList] = useState([
    {
      obat: 'Paracetamol 500mg',
      dosis: '3x sehari',
      aturan: 'Sesudah makan',
      lama: '3 hari',
      jumlah: '10 tablet',
    },
  ]);

  const hasilLab = selectedKunjungan
    ? labs.find(
        (lab) =>
          lab.kunjungan_id === selectedKunjungan.id &&
          lab.status === 'selesai'
      )
    : null;

  const hasilRadiologi = selectedKunjungan
    ? radiologis.find(
        (radiologi) =>
          radiologi.kunjungan_id === selectedKunjungan.id &&
          radiologi.status === 'selesai'
      )
    : null;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [kRes, dRes, labRes, radRes] = await Promise.all([
        api.get('/kunjungans'),
        api.get('/dokters'),
        api.get('/pemeriksaan-labs'),
        api.get('/pemeriksaan-radiologis'),
      ]);

      setAntrean(
        kRes.data.filter(
          (k: Kunjungan) => k.status_saat_ini === 'spesialis'
        )
      );

      setDokters(
        dRes.data.filter(
          (d: Dokter) =>
            !['umum', 'laboratorium', 'radiologi'].includes(
              d.spesialis.toLowerCase()
            )
        )
      );

      setLabs(labRes.data);
      setRadiologis(radRes.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
    }
  };

  const handlePeriksa = (kunjungan: Kunjungan) => {
    setSelectedKunjungan(kunjungan);
    setFormData({
      dokter_id: dokters.length > 0 ? dokters[0].id.toString() : '',
      analisa_hasil_rujukan: '',
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

      setSuccessMessage('Pemeriksaan spesialis berhasil disimpan.');

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

  const handleKirimResep = async () => {
    if (!selectedKunjungan) return;

    const resepFinal = resepList
      .map(
        (r, index) =>
          `${index + 1}. ${r.obat} | ${r.dosis} | ${r.aturan} | ${r.lama} | ${r.jumlah}`
      )
      .join('\n');

    try {
      await api.post('/resep-obats', {
        kunjungan_id: selectedKunjungan.id,
        sumber_resep: 'spesialis',
        catatan_resep: resepFinal,
        status: 'menunggu',
      });

      setIsResepOpen(false);
      setSelectedKunjungan(null);
      setSuccessMessage('Resep spesialis berhasil dikirim ke apotek.');

      fetchData();

      setTimeout(() => {
        setSuccessMessage('');
      }, 2500);
    } catch (error: any) {
      console.error(error.response?.data || error);
      alert(error.response?.data?.message || 'Gagal mengirim resep.');
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
                    <p className="text-xs text-slate-500">
                      Antrean #{k.id}
                    </p>
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

              <div>
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

                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 space-y-4">
                    <h3 className="font-semibold text-blue-800">
                      Hasil Pemeriksaan Penunjang
                    </h3>

                    <div className="bg-white rounded-xl border border-blue-100 p-4">
                      <p className="font-semibold text-slate-700 mb-2">
                        Hasil Lab
                      </p>

                      <pre className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">
                        {hasilLab?.hasil_lab || 'Belum ada hasil laboratorium'}
                      </pre>
                    </div>

                    <div className="bg-white rounded-xl border border-blue-100 p-4">
                      <p className="font-semibold text-slate-700 mb-2">
                        Hasil Radiologi
                      </p>

                      <pre className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">
                        {hasilRadiologi?.hasil_radiologi || 'Belum ada hasil radiologi'}
                      </pre>
                    </div>
                  </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Analisa Rujukan
                  </label>
                  <textarea
                    rows={2}
                    value={formData.analisa_hasil_rujukan}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        analisa_hasil_rujukan: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
                    placeholder="Analisa dari hasil poli umum / lab / radiologi..."
                  />
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
                    placeholder="Masukkan diagnosa akhir yang akurat..."
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

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="py-4 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-medium disabled:opacity-70 flex justify-center items-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle size={20} />
                        Simpan Pemeriksaan
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsResepOpen(true)}
                    className="py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium"
                  >
                    Buat Resep Obat
                  </button>
                </div>
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

      {isResepOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Buat Resep Obat
            </h2>

            <p className="text-sm text-slate-500 mb-4">
              Isi resep obat pasien, lalu kirim ke apotek.
            </p>

            <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">
              {resepList.map((item, index) => (
                <div
                  key={index}
                  className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-slate-700">
                      Obat {index + 1}
                    </h3>

                    {resepList.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setResepList(resepList.filter((_, i) => i !== index))
                        }
                        className="text-red-500 text-sm font-medium"
                      >
                        Hapus
                      </button>
                    )}
                  </div>

                  <select
                    value={item.obat}
                    onChange={(e) => {
                      const data = [...resepList];
                      data[index].obat = e.target.value;
                      setResepList(data);
                    }}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option>Paracetamol 500mg</option>
                    <option>Amoxicillin 500mg</option>
                    <option>Ibuprofen 400mg</option>
                    <option>CTM 4mg</option>
                    <option>Vitamin C 500mg</option>
                    <option>Antasida DOEN</option>
                    <option>OBH Sirup</option>
                  </select>

                  <select
                    value={item.dosis}
                    onChange={(e) => {
                      const data = [...resepList];
                      data[index].dosis = e.target.value;
                      setResepList(data);
                    }}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option>1x sehari</option>
                    <option>2x sehari</option>
                    <option>3x sehari</option>
                    <option>4x sehari</option>
                  </select>

                  <select
                    value={item.aturan}
                    onChange={(e) => {
                      const data = [...resepList];
                      data[index].aturan = e.target.value;
                      setResepList(data);
                    }}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option>Sebelum makan</option>
                    <option>Sesudah makan</option>
                    <option>Saat makan</option>
                    <option>Sebelum tidur</option>
                  </select>

                  <select
                    value={item.lama}
                    onChange={(e) => {
                      const data = [...resepList];
                      data[index].lama = e.target.value;
                      setResepList(data);
                    }}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option>3 hari</option>
                    <option>5 hari</option>
                    <option>7 hari</option>
                    <option>14 hari</option>
                  </select>

                  <select
                    value={item.jumlah}
                    onChange={(e) => {
                      const data = [...resepList];
                      data[index].jumlah = e.target.value;
                      setResepList(data);
                    }}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option>6 tablet</option>
                    <option>10 tablet</option>
                    <option>15 tablet</option>
                    <option>21 tablet</option>
                    <option>1 botol</option>
                    <option>2 strip</option>
                  </select>
                </div>
              ))}

              <button
                type="button"
                onClick={() =>
                  setResepList([
                    ...resepList,
                    {
                      obat: 'Paracetamol 500mg',
                      dosis: '3x sehari',
                      aturan: 'Sesudah makan',
                      lama: '3 hari',
                      jumlah: '10 tablet',
                    },
                  ])
                }
                className="w-full py-3 bg-pink-100 text-pink-700 rounded-xl font-medium"
              >
                + Tambah Obat
              </button>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                type="button"
                onClick={() => setIsResepOpen(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleKirimResep}
                className="flex-1 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-medium"
              >
                Kirim ke Apotek
              </button>
            </div>
          </div>
        </div>
      )}

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