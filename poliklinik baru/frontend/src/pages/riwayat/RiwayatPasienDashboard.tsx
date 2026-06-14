import { useEffect, useState } from 'react';
import api from '../../api';
import { User, Stethoscope, Search, Download, Pill, Plus, Trash2, Send, X } from 'lucide-react';

export default function RiwayatPasienDashboard() {
  const [riwayat, setRiwayat] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [openResepFormId, setOpenResepFormId] = useState<number | null>(null);
  const [resepList, setResepList] = useState<any[]>([]);

  useEffect(() => {
    fetchRiwayat();
  }, []);

const fetchRiwayat = async () => {
  try {
    const [riwayatRes, umumRes, spesialisRes, resepRes] =
      await Promise.all([
        api.get('/riwayats'),
        api.get('/pemeriksaan-umums'),
        api.get('/pemeriksaan-spesialis'),
        api.get('/resep-obats'),
      ]);

    const getUmum = (kunjunganId: number) =>
      umumRes.data.find(
        (item: any) => Number(item.kunjungan_id) === Number(kunjunganId)
      );

    const getSpesialis = (kunjunganId: number) =>
      spesialisRes.data.find(
        (item: any) => Number(item.kunjungan_id) === Number(kunjunganId)
      );

    const getResep = (kunjunganId: number) =>
      resepRes.data.find(
        (item: any) => Number(item.kunjungan_id) === Number(kunjunganId)
      );

    const dataRiwayat = riwayatRes.data.map((item: any) => {
      const kunjunganId = Number(item.kunjungan_id);

      const umum = getUmum(kunjunganId);
      const spesialis = getSpesialis(kunjunganId);
      const resep = getResep(kunjunganId);

      return {
        ...item,
        sumber: spesialis ? 'Poli Spesialis' : 'Poli Umum',
        kunjungan: item.kunjungan,

        pemeriksaan_awal: umum?.pemeriksaan_awal || '-',
        diagnosa_awal: umum?.diagnosa_awal || '-',
        tindakan: umum?.tindakan || '-',
        kategori_penyakit: umum?.kategori_penyakit || '-',

        analisa_hasil_rujukan: spesialis?.analisa_hasil_rujukan || '-',
        diagnosa_akhir: spesialis?.diagnosa_akhir || '-',
        tindakan_akhir: spesialis?.tindakan_akhir || '-',

        resep_obat: resep ? resep.catatan_resep : null,
        resep_status: resep ? resep.status : null,

        tagihan: item,
      };
    });

    setRiwayat(dataRiwayat);
  } catch (error) {
    console.error('Gagal mengambil riwayat pasien', error);
  }
};

  const handleOpenResepForm = (kunjunganId: number) => {
    setOpenResepFormId(kunjunganId);
    setResepList([
      {
        obat: 'Paracetamol 500mg',
        dosis: '3x sehari',
        aturan: 'Sesudah makan',
        lama: '3 hari',
        jumlah: '10 tablet',
      },
    ]);
  };

  const handleKirimResep = async (kunjunganId: number, sumber: string) => {
    if (resepList.length === 0) {
      alert('Minimal harus ada 1 obat.');
      return;
    }
    const resepFinal = resepList
      .map(
        (r, index) =>
          `${index + 1}. ${r.obat} | ${r.dosis} | ${r.aturan} | ${r.lama} | ${r.jumlah}`
      )
      .join('\n');

    try {
      await api.post('/resep-obats', {
        kunjungan_id: kunjunganId,
        sumber_resep: sumber === 'Poli Umum' ? 'poli_umum' : 'spesialis',
        catatan_resep: resepFinal,
        status: 'menunggu',
      });

      alert('Resep berhasil dikirim ke apotek.');
      setOpenResepFormId(null);
      fetchRiwayat();
    } catch (error: any) {
      console.error(error.response?.data || error);
      alert(error.response?.data?.message || 'Gagal mengirim resep obat.');
    }
  };

  const getPasien = (item: any) => item.kunjungan?.pasien || {};

  const filteredRiwayat = riwayat.filter((item) => {
    const pasien = getPasien(item);

    const text = [
      pasien.nomor_rm,
      pasien.nama_pasien,
      pasien.nik,
      pasien.jenis_kelamin,
      pasien.tanggal_lahir,
      pasien.alamat,
      pasien.no_hp,
      pasien.keluhan,
      item.pemeriksaan_awal,
      item.diagnosa_awal,
      item.tindakan,
      item.kategori_penyakit,
      item.analisa_hasil_rujukan,
      item.diagnosa_akhir,
      item.tindakan_akhir,
      item.resep_obat,
      item.sumber,
    ]
      .join(' ')
      .toLowerCase();

    return text.includes(search.toLowerCase());
  });

  const handleDownloadPDF = (item: any) => {
    const pasien = getPasien(item);
    const isUmum = item.sumber === 'Poli Umum';

    const content = `
<html>
<head>
  <title>Riwayat Pemeriksaan Pasien</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 40px;
      color: #1e293b;
      background: #ffffff;
    }

    .header {
      background: linear-gradient(135deg, ${isUmum ? '#0f766e, #10b981' : '#db2777, #fb7185'});
      color: white;
      padding: 25px;
      border-radius: 16px;
      margin-bottom: 25px;
    }

    .header h1 {
      margin: 0;
      font-size: 28px;
    }

    .header p {
      margin: 6px 0 0;
      font-size: 14px;
    }

    .section-title {
      margin: 24px 0 12px;
      font-size: 20px;
      color: #0f172a;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 8px;
    }

    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }

    .card {
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 18px;
      margin-bottom: 14px;
      background: #f8fafc;
    }

    .label {
      font-size: 13px;
      color: #64748b;
      margin-bottom: 6px;
    }

    .value {
      font-size: 16px;
      font-weight: bold;
      color: #0f172a;
      white-space: pre-wrap;
    }

    pre {
      white-space: pre-wrap;
      font-family: Arial, sans-serif;
      font-size: 15px;
      line-height: 1.6;
      margin: 0;
      color: #0f172a;
    }

    .footer {
      margin-top: 30px;
      padding-top: 15px;
      border-top: 1px solid #e2e8f0;
      font-size: 14px;
      color: #64748b;
    }
  </style>
</head>

<body>
  <div class="header">
    <h1>Riwayat Pemeriksaan Pasien</h1>
    <p>${item.sumber}</p>
  </div>

  <h2 class="section-title">Data Pasien</h2>

  <div class="grid">
    <div class="card">
      <div class="label">Nomor RM</div>
      <div class="value">${pasien.nomor_rm || '-'}</div>
    </div>

    <div class="card">
      <div class="label">Nama Pasien</div>
      <div class="value">${pasien.nama_pasien || '-'}</div>
    </div>

    <div class="card">
      <div class="label">NIK</div>
      <div class="value">${pasien.nik || '-'}</div>
    </div>

    <div class="card">
      <div class="label">Jenis Kelamin</div>
      <div class="value">${pasien.jenis_kelamin || '-'}</div>
    </div>

    <div class="card">
      <div class="label">Tanggal Lahir</div>
      <div class="value">${pasien.tanggal_lahir || '-'}</div>
    </div>

    <div class="card">
      <div class="label">No HP</div>
      <div class="value">${pasien.no_hp || '-'}</div>
    </div>
  </div>

  <div class="card">
    <div class="label">Alamat</div>
    <div class="value">${pasien.alamat || '-'}</div>
  </div>

  <div class="card">
    <div class="label">Keluhan Awal</div>
    <div class="value">${pasien.keluhan || '-'}</div>
  </div>

  <h2 class="section-title">${item.sumber}</h2>

  ${
    isUmum
      ? `
        <div class="grid">
          <div class="card">
            <div class="label">Pemeriksaan Awal</div>
            <div class="value">${item.pemeriksaan_awal || '-'}</div>
          </div>

          <div class="card">
            <div class="label">Diagnosa Awal</div>
            <div class="value">${item.diagnosa_awal || '-'}</div>
          </div>

          <div class="card">
            <div class="label">Tindakan</div>
            <div class="value">${item.tindakan || '-'}</div>
          </div>

          <div class="card">
            <div class="label">Kategori Penyakit</div>
            <div class="value">${item.kategori_penyakit || '-'}</div>
          </div>
        </div>
      `
      : `
        <div class="grid">
          <div class="card">
            <div class="label">Analisa Rujukan</div>
            <div class="value">${item.analisa_hasil_rujukan || '-'}</div>
          </div>

          <div class="card">
            <div class="label">Diagnosa Akhir</div>
            <div class="value">${item.diagnosa_akhir || '-'}</div>
          </div>

          <div class="card">
            <div class="label">Tindakan Akhir</div>
            <div class="value">${item.tindakan_akhir || '-'}</div>
          </div>
        </div>
      `
  }

  ${
    item.resep_obat
      ? `
        <h2 class="section-title">Resep Obat</h2>

        <div class="card">
          <div class="label">Status Resep</div>
          <div class="value">${item.resep_status || 'menunggu'}</div>
        </div>

        <div class="card">
          <div class="label">Catatan Resep</div>
          <pre>${item.resep_obat}</pre>
        </div>
      `
      : ''
  }
  ${
  item.tagihan
    ? `
      <h2 class="section-title">Riwayat Tagihan</h2>

      <div class="grid">
        <div class="card">
          <div class="label">Biaya Poli Umum</div>
          <div class="value">Rp ${Number(item.tagihan.biaya_umum || 0).toLocaleString('id-ID')}</div>
        </div>

        <div class="card">
          <div class="label">Biaya Poli Spesialis</div>
          <div class="value">Rp ${Number(item.tagihan.biaya_spesialis || 0).toLocaleString('id-ID')}</div>
        </div>
      </div>

      <div class="card">
        <div class="label">Total Biaya</div>
        <div class="value">Rp ${Number(item.tagihan.total_biaya || 0).toLocaleString('id-ID')}</div>
      </div>

    `
    : ''
}

  <div class="footer">
    Dokumen ini merupakan riwayat pemeriksaan pasien dari ${item.sumber}.
  </div>
</body>
</html>
`;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  };

  const getBadgeColor = (sumber: string) => {
    return sumber === 'Poli Umum'
      ? 'bg-teal-100 text-teal-700'
      : 'bg-pink-100 text-pink-700';
  };

  const getButtonColor = (sumber: string) => {
    return sumber === 'Poli Umum'
      ? 'bg-teal-600 hover:bg-teal-700'
      : 'bg-pink-600 hover:bg-pink-700';
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
          Riwayat Pemeriksaan Pasien
        </h1>
        <p className="text-slate-500 mt-1">
          Riwayat menampilkan Poli Umum dan Poli Spesialis serta resep obat pasien.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
        <Search className="text-slate-400" size={20} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama pasien, nomor RM, NIK, keluhan, hasil lab, hasil radiologi, diagnosa..."
          className="w-full outline-none text-slate-700"
        />
      </div>

      <div className="grid gap-5">
        {filteredRiwayat.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-500 border border-slate-100">
            Tidak ada riwayat pemeriksaan.
          </div>
        ) : (
          filteredRiwayat.map((item, index) => {
            const isUmum = item.sumber === 'Poli Umum';
            const pasien = getPasien(item);

            return (
              <div
                key={`${item.sumber}-${item.id}-${index}`}
                className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 hover:shadow-md transition-all"
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-5 pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="font-bold text-xl text-slate-800 flex items-center gap-2">
                      <User
                        size={22}
                        className={isUmum ? 'text-teal-600' : 'text-pink-600'}
                      />
                      {pasien.nama_pasien || 'Nama pasien tidak ada'}
                    </h2>

                    <p className="text-sm text-slate-500 mt-1">
                      No RM: {pasien.nomor_rm || '-'} | No HP:{' '}
                      {pasien.no_hp || '-'}
                    </p>

                    <p className="text-sm text-slate-500">
                      NIK: {pasien.nik || '-'} | JK:{' '}
                      {pasien.jenis_kelamin || '-'} | Tanggal Lahir:{' '}
                      {pasien.tanggal_lahir || '-'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-semibold ${getBadgeColor(
                        item.sumber
                      )}`}
                    >
                      {item.sumber}
                    </span>

                    <button
                      onClick={() => handleDownloadPDF(item)}
                      className={`px-4 py-2 text-white rounded-xl font-medium flex items-center gap-2 ${getButtonColor(
                        item.sumber
                      )}`}
                    >
                      <Download size={16} />
                      Download PDF
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-sm text-slate-500 mb-1">Alamat</p>
                    <p className="font-semibold text-slate-800">
                      {pasien.alamat || '-'}
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-sm text-slate-500 mb-1">
                      Keluhan Awal
                    </p>
                    <p className="font-semibold text-slate-800">
                      {pasien.keluhan || '-'}
                    </p>
                  </div>
                </div>

                {isUmum ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-sm text-slate-500 mb-1">
                        Pemeriksaan Awal
                      </p>
                      <p className="font-semibold text-slate-800">
                        {item.pemeriksaan_awal || '-'}
                      </p>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-sm text-slate-500 mb-1">
                        Diagnosa Awal
                      </p>
                      <p className="font-semibold text-slate-800">
                        {item.diagnosa_awal || '-'}
                      </p>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-sm text-slate-500 mb-1">Tindakan</p>
                      <p className="font-semibold text-slate-800">
                        {item.tindakan || '-'}
                      </p>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-sm text-slate-500 mb-1">
                        Kategori Penyakit
                      </p>
                      <p className="font-semibold text-slate-800 capitalize">
                        {item.kategori_penyakit || '-'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-sm text-slate-500 mb-1">
                        Analisa Rujukan
                      </p>
                      <p className="font-semibold text-slate-800">
                        {item.analisa_hasil_rujukan || '-'}
                      </p>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-sm text-slate-500 mb-1">
                        Diagnosa Akhir
                      </p>
                      <p className="font-semibold text-slate-800">
                        {item.diagnosa_akhir || '-'}
                      </p>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-sm text-slate-500 mb-1">
                        Tindakan Akhir
                      </p>
                      <p className="font-semibold text-slate-800">
                        {item.tindakan_akhir || '-'}
                      </p>
                    </div>
                  </div>
                )}
                {item.tagihan && (
  <div className="mt-4 bg-emerald-50 rounded-xl border border-emerald-100 p-4">
    <p className="font-semibold text-emerald-700 mb-3">
      Riwayat Tagihan
    </p>

    <div className="grid md:grid-cols-2 gap-3 text-sm">
      <div className="flex justify-between bg-white rounded-lg p-3">
        <span>Poli Umum</span>
        <span className="font-semibold">
          Rp {Number(item.tagihan.biaya_umum || 0).toLocaleString('id-ID')}
        </span>
      </div>

      <div className="flex justify-between bg-white rounded-lg p-3">
        <span>Poli Spesialis</span>
        <span className="font-semibold">
          Rp {Number(item.tagihan.biaya_spesialis || 0).toLocaleString('id-ID')}
        </span>
      </div>
    </div>

    <div className="mt-3 flex justify-between bg-emerald-600 text-white rounded-xl p-3 font-bold">
      <span>Total Biaya</span>
      <span>
        Rp {Number(item.tagihan.total_biaya || 0).toLocaleString('id-ID')}
      </span>
    </div>
  </div>
)}

                {item.resep_obat ? (
                  <div className="mt-4 bg-teal-50 rounded-xl border border-teal-100 p-4">
                    <div className="flex justify-between items-center mb-3">
                      <p className="font-semibold text-teal-700 flex items-center gap-2">
                        <Pill size={18} />
                        Resep Obat Pasien
                      </p>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                        item.resep_status === 'selesai' ? 'bg-emerald-100 text-emerald-800' :
                        item.resep_status === 'diproses' ? 'bg-amber-100 text-amber-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {item.resep_status || 'menunggu'}
                      </span>
                    </div>
                    <pre className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed bg-white border border-teal-100 rounded-lg p-3">
                      {item.resep_obat}
                    </pre>
                  </div>
                ) : (
                  <div className="mt-4">
                    {openResepFormId !== item.kunjungan_id ? (
                      <button
                        onClick={() => handleOpenResepForm(item.kunjungan_id)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium text-sm transition-all"
                      >
                        <Pill size={16} />
                        Beri Resep Obat
                      </button>
                    ) : (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                            <Pill className="text-emerald-600" size={18} />
                            Form Resep Obat Pasien
                          </h3>
                          <button
                            onClick={() => setOpenResepFormId(null)}
                            className="text-slate-400 hover:text-red-500"
                          >
                            <X size={20} />
                          </button>
                        </div>

                        <div className="space-y-3">
                          {resepList.map((med, medIndex) => (
                            <div key={medIndex} className="p-3 border border-slate-200 rounded-lg bg-white space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-semibold text-slate-600">Obat {medIndex + 1}</span>
                                {resepList.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => setResepList(resepList.filter((_, i) => i !== medIndex))}
                                    className="text-red-500 text-xs font-medium hover:underline flex items-center gap-1"
                                  >
                                    <Trash2 size={12} /> Hapus
                                  </button>
                                )}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                                <div>
                                  <label className="text-[10px] font-semibold text-slate-500 uppercase">Nama Obat</label>
                                  <select
                                    value={med.obat}
                                    onChange={(e) => {
                                      const newResep = [...resepList];
                                      newResep[medIndex].obat = e.target.value;
                                      setResepList(newResep);
                                    }}
                                    className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded-md"
                                  >
                                    <option>Paracetamol 500mg</option>
                                    <option>Amoxicillin 500mg</option>
                                    <option>Ibuprofen 400mg</option>
                                    <option>CTM 4mg</option>
                                    <option>Vitamin C 500mg</option>
                                    <option>Antasida DOEN</option>
                                    <option>OBH Sirup</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="text-[10px] font-semibold text-slate-500 uppercase">Dosis</label>
                                  <select
                                    value={med.dosis}
                                    onChange={(e) => {
                                      const newResep = [...resepList];
                                      newResep[medIndex].dosis = e.target.value;
                                      setResepList(newResep);
                                    }}
                                    className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded-md"
                                  >
                                    <option>1x sehari</option>
                                    <option>2x sehari</option>
                                    <option>3x sehari</option>
                                    <option>4x sehari</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="text-[10px] font-semibold text-slate-500 uppercase">Aturan</label>
                                  <select
                                    value={med.aturan}
                                    onChange={(e) => {
                                      const newResep = [...resepList];
                                      newResep[medIndex].aturan = e.target.value;
                                      setResepList(newResep);
                                    }}
                                    className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded-md"
                                  >
                                    <option>Sebelum makan</option>
                                    <option>Sesudah makan</option>
                                    <option>Saat makan</option>
                                    <option>Sebelum tidur</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="text-[10px] font-semibold text-slate-500 uppercase">Lama</label>
                                  <select
                                    value={med.lama}
                                    onChange={(e) => {
                                      const newResep = [...resepList];
                                      newResep[medIndex].lama = e.target.value;
                                      setResepList(newResep);
                                    }}
                                    className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded-md"
                                  >
                                    <option>3 hari</option>
                                    <option>5 hari</option>
                                    <option>7 hari</option>
                                    <option>14 hari</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="text-[10px] font-semibold text-slate-500 uppercase">Jumlah</label>
                                  <select
                                    value={med.jumlah}
                                    onChange={(e) => {
                                      const newResep = [...resepList];
                                      newResep[medIndex].jumlah = e.target.value;
                                      setResepList(newResep);
                                    }}
                                    className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded-md"
                                  >
                                    <option>6 tablet</option>
                                    <option>10 tablet</option>
                                    <option>15 tablet</option>
                                    <option>21 tablet</option>
                                    <option>1 botol</option>
                                    <option>2 strip</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={() => setResepList([...resepList, {
                              obat: 'Paracetamol 500mg',
                              dosis: '3x sehari',
                              aturan: 'Sesudah makan',
                              lama: '3 hari',
                              jumlah: '10 tablet',
                            }])}
                            className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg border border-dashed border-emerald-300 transition-all flex justify-center items-center gap-1"
                          >
                            <Plus size={14} /> Tambah Obat
                          </button>
                        </div>

                        <div className="flex gap-2 justify-end pt-2 border-t border-slate-200">
                          <button
                            onClick={() => setOpenResepFormId(null)}
                            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold"
                          >
                            Batal
                          </button>
                          <button
                            onClick={() => handleKirimResep(item.kunjungan_id, item.sumber)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                          >
                            <Send size={12} /> Kirim ke Apotek
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                  <Stethoscope size={16} />
                  Pemeriksaan {item.sumber}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}