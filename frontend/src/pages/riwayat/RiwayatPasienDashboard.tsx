import { useEffect, useState } from 'react';
import api from '../../api';
import { User, Stethoscope, Search, Download } from 'lucide-react';

export default function RiwayatPasienDashboard() {
  const [riwayat, setRiwayat] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchRiwayat();
  }, []);

  const fetchRiwayat = async () => {
    try {
      const [umumRes, spesialisRes, labRes, radiologiRes] = await Promise.all([
        api.get('/pemeriksaan-umums'),
        api.get('/pemeriksaan-spesialis'),
        api.get('/pemeriksaan-labs'),
        api.get('/pemeriksaan-radiologis'),
      ]);

      const getLab = (kunjunganId: number) =>
        labRes.data.find((lab: any) => lab.kunjungan_id === kunjunganId);

      const getRadiologi = (kunjunganId: number) =>
        radiologiRes.data.find((rad: any) => rad.kunjungan_id === kunjunganId);

      const umum = umumRes.data
        .filter((item: any) =>
          ['apotek', 'selesai'].includes(item.kunjungan?.status_saat_ini)
        )
        .map((item: any) => {
          const lab = getLab(item.kunjungan_id);
          const radiologi = getRadiologi(item.kunjungan_id);

          return {
            ...item,
            sumber: 'Poli Umum',
            hasil_lab: lab?.hasil_lab || null,
            jenis_lab: lab?.jenis_pemeriksaan || null,
            hasil_radiologi: radiologi?.hasil_radiologi || null,
            jenis_radiologi: radiologi?.jenis_pemeriksaan || null,
          };
        });

      const spesialis = spesialisRes.data
        .filter((item: any) =>
          ['apotek', 'selesai'].includes(item.kunjungan?.status_saat_ini)
        )
        .map((item: any) => {
          const lab = getLab(item.kunjungan_id);
          const radiologi = getRadiologi(item.kunjungan_id);

          return {
            ...item,
            sumber: 'Poli Spesialis',
            hasil_lab: lab?.hasil_lab || null,
            jenis_lab: lab?.jenis_pemeriksaan || null,
            hasil_radiologi: radiologi?.hasil_radiologi || null,
            jenis_radiologi: radiologi?.jenis_pemeriksaan || null,
          };
        });

      setRiwayat([...umum, ...spesialis]);
    } catch (error) {
      console.error('Gagal mengambil riwayat pasien', error);
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
      item.hasil_lab,
      item.hasil_radiologi,
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
    item.hasil_lab
      ? `
        <h2 class="section-title">Hasil Laboratorium</h2>

        <div class="card">
          <div class="label">Jenis Pemeriksaan</div>
          <div class="value">${item.jenis_lab || 'Darah Lengkap'}</div>
        </div>

        <div class="card">
          <div class="label">Hasil Lab</div>
          <pre>${item.hasil_lab}</pre>
        </div>
      `
      : ''
  }

  ${
    item.hasil_radiologi
      ? `
        <h2 class="section-title">Hasil Radiologi</h2>

        <div class="card">
          <div class="label">Jenis Pemeriksaan</div>
          <div class="value">${item.jenis_radiologi || '-'}</div>
        </div>

        <div class="card">
          <div class="label">Hasil Radiologi</div>
          <pre>${item.hasil_radiologi}</pre>
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
          Riwayat hanya menampilkan Poli Umum dan Poli Spesialis. Hasil Lab dan Radiologi muncul di dalamnya jika ada.
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

                    {item.hasil_lab && (
                      <div className="md:col-span-2 bg-blue-50 rounded-xl border border-blue-100 p-4">
                        <p className="font-semibold text-blue-700 mb-2">
                          Hasil Laboratorium
                        </p>
                        <pre className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">
                          {item.hasil_lab}
                        </pre>
                      </div>
                    )}

                    {item.hasil_radiologi && (
                      <div className="md:col-span-2 bg-orange-50 rounded-xl border border-orange-100 p-4">
                        <p className="font-semibold text-orange-700 mb-2">
                          Hasil Radiologi
                        </p>
                        <pre className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">
                          {item.hasil_radiologi}
                        </pre>
                      </div>
                    )}
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

                    {item.hasil_lab && (
                      <div className="md:col-span-3 bg-blue-50 rounded-xl border border-blue-100 p-4">
                        <p className="font-semibold text-blue-700 mb-2">
                          Hasil Laboratorium
                        </p>
                        <pre className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">
                          {item.hasil_lab}
                        </pre>
                      </div>
                    )}

                    {item.hasil_radiologi && (
                      <div className="md:col-span-3 bg-orange-50 rounded-xl border border-orange-100 p-4">
                        <p className="font-semibold text-orange-700 mb-2">
                          Hasil Radiologi
                        </p>
                        <pre className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">
                          {item.hasil_radiologi}
                        </pre>
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