import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Stethoscope, ArrowRight, CheckCircle, X } from 'lucide-react';
import api from '../../api';
import axios from 'axios';


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

export default function DokterUmumDashboard() {
  const [antrean, setAntrean] = useState<Kunjungan[]>([]);
  const [dokters, setDokters] = useState<Dokter[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [isResepOpen, setIsResepOpen] = useState(false);
  const [resepList, setResepList] = useState([
    
  {
    obat: 'Paracetamol 500mg',
    dosis: '3x sehari',
    aturan: 'Sesudah makan',
    lama: '3 hari',
    jumlah: '10 tablet',
  },
]);
  const [selectedKunjungan, setSelectedKunjungan] = useState<Kunjungan | null>(null);
  const [confirmSpesialisOpen, setConfirmSpesialisOpen] = useState(false);

  const [formData, setFormData] = useState({
    dokter_id: '',
    pemeriksaan_awal: '',
    kategori_penyakit: 'ringan',
    diagnosa_awal: '',
    tindakan: '',
    rujukan: 'none',
  });

  const REGISTRASI_API = 'http://192.168.0.101:3001/api/antrian';

useEffect(() => {
  fetchData();
}, []);

const fetchData = async () => {
  try {
    const [kRes, dRes] = await Promise.all([
      api.get('/kunjungans'),
      api.get('/dokters'),
    ]);

    console.log('DATA LOCAL:', kRes.data);


//     ===== HARI H PAKAI API REGISTRASI =====
    // const antrianRes = await axios.get(`${REGISTRASI_API}/antrian`);
    // console.log('DATA REGISTRASI:', antrianRes.data);
    // setAntrean(antrianRes.data);
//     ======================================

        setAntrean(
  kRes.data.filter((k: Kunjungan) =>
    ['poli_umum', 'poli_umum_review'].includes(k.status_saat_ini)
  )
);

    setDokters(
      dRes.data.filter(
        (d: Dokter) => d.spesialis.toLowerCase() === 'umum'
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
   

    try {
await api.post('/pemeriksaan-umums', {
  kunjungan_id: selectedKunjungan.id,
  id_pasien: selectedKunjungan.id_pasien,
  ...formData,
  pemeriksaan_awal: selectedKunjungan.pasien?.keluhan || '-',
});
let pesan = 'Pemeriksaan berhasil disimpan.';

if (formData.rujukan === 'lab') {
  pesan = 'Pasien berhasil dirujuk ke Laboratorium.';
} else if (formData.rujukan === 'radiologi') {
  pesan = 'Pasien berhasil dirujuk ke Radiologi.';
} else if (formData.rujukan === 'spesialis') {
  pesan = 'Pasien berhasil dirujuk ke Poli Spesialis.';
}

setSuccessMessage(pesan);

setTimeout(() => {
  setSuccessMessage('');
}, 2500); 

setSelectedKunjungan(null);
fetchData();

    } catch (error) {
      console.error('Failed to submit pemeriksaan', error);
      alert('Gagal menyimpan hasil pemeriksaan.');
    } finally { 
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
if (resepList.length === 0) {
  alert('Minimal harus ada 1 obat.');
  return;
}

  try {
    await api.post('/pemeriksaan-umums', {
      kunjungan_id: selectedKunjungan.id,
      dokter_id: formData.dokter_id,
      pemeriksaan_awal: selectedKunjungan.pasien?.keluhan || '-',
      kategori_penyakit: formData.kategori_penyakit,
      diagnosa_awal: formData.diagnosa_awal,
      tindakan: formData.tindakan,
      rujukan: 'none',
    });

await api.post('/resep-obats', {
  kunjungan_id: selectedKunjungan.id,
  sumber_resep: 'poli_umum',
  catatan_resep: resepFinal,
  status: 'menunggu',
});

    setIsResepOpen(false);
    setSelectedKunjungan(null);
    setSuccessMessage('Resep berhasil dikirim ke apotek. Catatan Diagnosa berhasil dibuat.');

    fetchData();

    setTimeout(() => {
      setSuccessMessage('');
    }, 2500);
  } catch (error: any) {
    console.error(error.response?.data || error);
    alert(error.response?.data?.message || 'Gagal mengirim resep obat.');
  }
};

const handleSimpanRiwayat = async () => {
  if (!selectedKunjungan) return;

  try {
    await api.post('/riwayats', {
      kunjungan_id: selectedKunjungan.id,
      biaya_umum: 50000,
      biaya_lab: 0,
      biaya_radiologi: 0,
      biaya_spesialis: 0,
      total_biaya: 50000,
    });

    setSuccessMessage('Catatan diagnosa berhasil disimpan.');

    fetchData();

    setTimeout(() => {
      setSuccessMessage('');
    }, 2500);
  } catch (error: any) {
    console.error(error.response?.data || error);
    alert(error.response?.data?.message || 'Gagal menyimpan riwayat.');
  }
};

const handleRujukSpesialis = async () => {
  if (!selectedKunjungan) return;

  try {
    setFormData({
      ...formData,
      kategori_penyakit: 'berat',
      rujukan: 'spesialis',
    });

    await api.patch(`/kunjungans/${selectedKunjungan.id}/status`, {
      status_saat_ini: 'spesialis',
    });

    setConfirmSpesialisOpen(false);
    setSelectedKunjungan(null);
    setSuccessMessage('Pasien berhasil dirujuk ke Poli Spesialis.');

    fetchData();

    setTimeout(() => {
      setSuccessMessage('');
    }, 2500);
  } catch (error: any) {
    console.error(error.response?.data || error);
    alert('Gagal merujuk pasien ke Poli Spesialis.');
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
        <p className="text-slate-500 mt-1">
          Antrean pemeriksaan dan diagnosa awal pasien
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <Activity className="text-teal-500" size={20} />
              Antrean Saat Ini
            </h2>
            <span className="bg-teal-100 text-teal-800 text-xs font-bold px-3 py-1 rounded-full">
              {antrean.length} Pasien
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {antrean.length === 0 ? (
              <div className="text-center text-slate-500 py-10">
                Tidak ada antrean di Poli Umum.
              </div>
            ) : (
              antrean.map((k) => (
                <div
                  key={k.id}
                  className="p-4 rounded-xl border border-slate-100 hover:border-teal-300 hover:bg-teal-50 cursor-pointer transition-all flex justify-between items-center group"
                  onClick={() => handlePeriksa(k)}
                >
                  <div>
                    <p className="font-semibold text-slate-800 group-hover:text-teal-700">
                      {k.pasien?.nama_pasien || 'Pasien Tidak Ditemukan'}
                    </p>
                    <p className="text-xs text-slate-500">
                      Antrean #{k.id}
                    </p>
                  </div>
                  <ArrowRight
                    size={18}
                    className="text-slate-300 group-hover:text-teal-500"
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
                    <Stethoscope className="text-teal-500" />
                    Form Pemeriksaan
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Dokter Pemeriksa
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
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                    >
                      <option value="">Pilih Dokter</option>
                      {dokters.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.nama_dokter}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Kategori Penyakit
                    </label>
                    <select
                      value={formData.kategori_penyakit}
                        onChange={(e) => {
                          const value = e.target.value;

                          if (value === 'berat') {
                            setConfirmSpesialisOpen(true);
                            return;
                          }

                          setFormData({
                            ...formData,
                            kategori_penyakit: value,
                            rujukan: 'none',
                          });
                        }}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                    >
                      <option value="ringan">Ringan</option>
                      <option value="berat">Berat</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Diagnosa Awal
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={formData.diagnosa_awal}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        diagnosa_awal: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                    placeholder="Diagnosa..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tindakan
                  </label>
                  <input
                    type="text"
                    value={formData.tindakan}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tindakan: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                    placeholder="Tindakan yang diberikan..."
                  />
                </div>

                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <h3 className="font-semibold text-emerald-800 mb-2">
                    Pasien Ringan / Resep Obat
                  </h3>

                  <p className="text-sm text-slate-600 mb-4">
                    Jika pasien termasuk ringan, dokter dapat menyimpan diagnosa atau membuat resep obat.
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setIsResepOpen(true)}
                      className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium"
                    >
                      Buat Resep Obat
                    </button>

                    <button
                      type="button"
                      onClick={handleSimpanRiwayat}
                      className="py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium"
                    >
                      Simpan Diagnosa
                    </button>
                  </div>
                </div>
                {/* <div className="p-4 bg-teal-50/50 rounded-xl border border-teal-100">
                  <label className="block text-sm font-semibold text-teal-800 mb-3 flex items-center gap-2">
                    <FileText size={16} />
                    Rujukan Selanjutnya
                  </label>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {rujukanOptions.map((r) => (
                      <label
                        key={r.id}
                        className={`flex items-center justify-center p-3 rounded-xl border cursor-pointer transition-all ${
                          formData.rujukan === r.id
                            ? 'border-teal-500 bg-teal-50 text-teal-700 ring-2 ring-teal-200'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-teal-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="rujukan"
                          value={r.id}
                          checked={formData.rujukan === r.id}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              rujukan: e.target.value,
                            })
                          }
                          className="hidden"
                        />
                        <span className="font-medium text-sm">
                          {r.label}
                        </span>
                      </label>
                    ))}
                  </div>
                // </div> */}

                {/* <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium shadow-lg shadow-teal-500/30 transition-all disabled:opacity-70 flex justify-center items-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      Simpan & Proses Kunjungan
                    </>
                  )}
                </button> */}
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
{isResepOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
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
        className="w-full px-4 py-3 border border-slate-200 rounded-xl"
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
        className="w-full px-4 py-3 border border-slate-200 rounded-xl"
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
        className="w-full px-4 py-3 border border-slate-200 rounded-xl"
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
        className="w-full px-4 py-3 border border-slate-200 rounded-xl"
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
        className="w-full px-4 py-3 border border-slate-200 rounded-xl"
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
    className="w-full py-3 bg-emerald-100 text-emerald-700 rounded-xl font-medium"
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
          className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium"
        >
          Kirim ke Apotek
        </button>
      </div>
    </div>
  </div>
)}

{successMessage && (
  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30">
    <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md">
      <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
        <CheckCircle className="text-emerald-600" size={40} />
      </div>

      <h2 className="text-2xl font-bold text-emerald-600 mb-2">
        Berhasil
      </h2>

      <p className="text-slate-700">
        {successMessage}
      </p>
    </div>
  </div>
)}
{confirmSpesialisOpen && (
  <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40">
    <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
      <div className="mx-auto mb-5 w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
        <Stethoscope className="text-blue-600" size={38} />
      </div>

      <h2 className="text-2xl font-bold text-slate-800 mb-3">
        Rujuk ke Poli Spesialis?
      </h2>

      <p className="text-slate-600 mb-6">
        Pasien kategori berat akan dipindahkan ke antrean dokter spesialis.
      </p>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => {
            setConfirmSpesialisOpen(false);
            setFormData({
              ...formData,
              kategori_penyakit: 'ringan',
              rujukan: 'none',
            });
          }}
          className="py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
        >
          Batal
        </button>

        <button
          type="button"
          onClick={handleRujukSpesialis}
          className="py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
        >
          Iya, Rujuk
        </button>
      </div>
    </div>
  </div>
)}


    </motion.div>
  );
}