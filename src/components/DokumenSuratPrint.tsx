import React, { useState } from 'react';
import { PermohonanSurat } from '../types';
import { PROFIL_DESA } from '../data/mockData';
import { getStoredPengaturanDesa } from '../lib/supabaseClient';
import { downloadSuratAsRealPdf } from '../utils/documentDownload';
import { Printer, Download, ArrowLeft, CheckCircle, RefreshCw } from 'lucide-react';

interface DokumenSuratPrintProps {
  permohonan: PermohonanSurat;
  onBack: () => void;
}

export const DokumenSuratPrint: React.FC<DokumenSuratPrintProps> = ({ permohonan, onBack }) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const pengaturan = getStoredPengaturanDesa();

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      await downloadSuratAsRealPdf(permohonan);
    } catch (err) {
      console.error('Gagal generate PDF:', err);
      alert('Terjadi kesalahan saat membuat berkas PDF. Silakan coba Cetak Fisik.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Format tanggal Indonesia
  const formatDateIndo = (dateStr?: string) => {
    if (!dateStr) return '10 September 2026';
    const d = new Date(dateStr);
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const getLetterTitle = (jenisKode: string) => {
    switch (jenisKode) {
      case 'SKU':
        return 'SURAT KETERANGAN USAHA';
      case 'SKTM':
        return 'SURAT KETERANGAN TIDAK MAMPU';
      case 'PENGANTAR_SKCK':
        return 'SURAT PENGANTAR CATATAN KEPOLISIAN';
      case 'DOMISILI':
        return 'SURAT KETERANGAN DOMISILI';
      case 'SK_KEMATIAN':
        return 'SURAT KETERANGAN KEMATIAN';
      case 'SK_BELUM_NIKAH':
        return 'SURAT KETERANGAN BELUM PERNAH MENIKAH';
      default:
        return 'SURAT KETERANGAN';
    }
  };

  const nomorSurat = permohonan.nomor_surat_resmi || '470/...../Des-NL/IX/2026';

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-6 px-4">
      {/* Top action bar - Hidden during actual print */}
      <div className="max-w-4xl mx-auto mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4 no-print">
        <button
          onClick={onBack}
          id="btn-back-from-print"
          className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900 font-medium px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Dashboard</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs text-slate-700">Kode Tiket:</div>
            <div className="text-sm font-semibold font-mono text-[#0D2A4A]">{permohonan.kode_tiket}</div>
          </div>

          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            id="btn-download-pdf-doc"
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {isGeneratingPdf ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-[#1565C0]" />
                <span>Menyiapkan PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-[#1565C0]" />
                <span>Unduh Berkas PDF</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            id="btn-trigger-print-doc"
            className="inline-flex items-center gap-2 px-5 py-2 bg-[#2E7D32] hover:bg-[#256629] text-white font-bold text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Fisik (Print F4/A4)</span>
          </button>
        </div>
      </div>

      {/* Sheet simulation container with A4/F4 official margins */}
      <div className="max-w-4xl mx-auto bg-white p-10 md:p-14 shadow-lg border border-slate-300 rounded-sm print-container">
        <div id="printable-naskah-dinas" className="text-slate-900 leading-relaxed text-[11.5pt] font-kedinasan bg-white">
          {/* KOP SURAT RESMI PEMERINTAH DESA NYURLEMBANG */}
          <div className="kop-header border-b-4 border-double border-slate-900 pb-3 mb-6 relative">
            {/* Logo Kiri Lambang Daerah / Garuda */}
            <div className="absolute left-1 top-0 w-20 h-20 flex items-center justify-center">
              <img
                src={pengaturan.kop_logo_kiri_url || pengaturan.kop_logo_url || '/logo.png'}
                alt="Logo Kiri Kop Naskah Dinas"
                className="w-18 h-18 object-contain"
                crossOrigin="anonymous"
              />
            </div>

            {/* Logo Kanan Instansi / Desa (Opsional) */}
            {pengaturan.kop_logo_kanan_url && (
              <div className="absolute right-1 top-0 w-20 h-20 flex items-center justify-center">
                <img
                  src={pengaturan.kop_logo_kanan_url}
                  alt="Logo Kanan Kop Naskah Dinas"
                  className="w-18 h-18 object-contain"
                  crossOrigin="anonymous"
                />
              </div>
            )}

            <div className={`text-center ${pengaturan.kop_logo_kanan_url ? 'px-20' : 'pl-20 pr-4'}`}>
              <h3 className="text-base md:text-lg font-bold tracking-wider uppercase m-0 leading-tight">
                {pengaturan.kop_baris1 || 'Pemerintah Kabupaten Lombok Barat'}
              </h3>
              <h2 className="text-lg md:text-xl font-extrabold tracking-wider uppercase m-0 leading-tight">
                {pengaturan.kop_baris2 || 'Kecamatan Narmada'}
              </h2>
              <h1 className="text-xl md:text-2xl font-black tracking-widest uppercase my-1 text-slate-950">
                {pengaturan.kop_baris3 || 'Pemerintah Desa Nyurlembang'}
              </h1>
              <p className="text-xs font-sans italic text-slate-700 m-0 leading-tight">
                {pengaturan.alamat_kantor || PROFIL_DESA.alamat_kantor}, Kode Pos {pengaturan.kode_pos || PROFIL_DESA.kode_pos}
              </p>
              <p className="text-[11px] font-sans text-slate-600 m-0">
                Layanan KPPID: {pengaturan.telepon_kppid || PROFIL_DESA.telepon} • Email: {pengaturan.email_desa || PROFIL_DESA.email}
              </p>
            </div>
          </div>

          {/* JUDUL SURAT & NOMOR REGISTER */}
          <div className="text-center my-6">
            <h2 className="text-base font-bold underline tracking-wide uppercase m-0">
              {getLetterTitle(permohonan.jenis_surat_id.replace('js-', '').toUpperCase())}
            </h2>
            <p className="text-sm font-mono mt-1 text-slate-800">
              Nomor: {nomorSurat}
            </p>
          </div>

          {/* KALIMAT PEMBUKA / KONSIDERANS */}
          <p className="text-justify indent-8 mb-4">
            Yang bertanda tangan di bawah ini Kepala Desa Nyurlembang, Kecamatan Narmada, Kabupaten Lombok Barat, Provinsi Nusa Tenggara Barat, menerangkan dengan sebenarnya bahwa:
          </p>

          {/* DATA DIRI PEMOHON */}
          <table className="w-full my-4 border-collapse text-left text-sm md:text-[11.5pt]">
            <tbody>
              <tr>
                <td className="w-48 py-1 font-medium">Nama Lengkap</td>
                <td className="w-4 py-1">:</td>
                <td className="py-1 font-bold uppercase">{permohonan.nama_pemohon}</td>
              </tr>
              <tr>
                <td className="py-1 font-medium">Nomor Induk Kependudukan (NIK)</td>
                <td className="py-1">:</td>
                <td className="py-1 font-mono font-bold tracking-wider">{permohonan.nik}</td>
              </tr>
              <tr>
                <td className="py-1 font-medium">Tempat / Tanggal Lahir</td>
                <td className="py-1">:</td>
                <td className="py-1">{permohonan.tempat_lahir}, {formatDateIndo(permohonan.tanggal_lahir)}</td>
              </tr>
              <tr>
                <td className="py-1 font-medium">Jenis Kelamin</td>
                <td className="py-1">:</td>
                <td className="py-1">{permohonan.jenis_kelamin}</td>
              </tr>
              <tr>
                <td className="py-1 font-medium">Agama</td>
                <td className="py-1">:</td>
                <td className="py-1">{permohonan.agama}</td>
              </tr>
              <tr>
                <td className="py-1 font-medium">Pekerjaan</td>
                <td className="py-1">:</td>
                <td className="py-1">{permohonan.pekerjaan}</td>
              </tr>
              <tr>
                <td className="py-1 font-medium">Dusun</td>
                <td className="py-1">:</td>
                <td className="py-1 font-medium">{permohonan.dusun}</td>
              </tr>
              <tr>
                <td className="py-1 font-medium">Alamat Tempat Tinggal</td>
                <td className="py-1">:</td>
                <td className="py-1">{permohonan.alamat_lengkap}</td>
              </tr>
            </tbody>
          </table>

          {/* KONTEN DETAIL SESUAI JENIS SURAT */}
          <div className="my-5 text-justify space-y-3">
            {permohonan.jenis_surat_id.includes('sku') && (
              <>
                <p>
                  Bahwa nama tersebut di atas adalah benar-benar warga penduduk kami yang berdomisili di Desa Nyurlembang, dan sepanjang pengamatan kami yang bersangkutan benar memiliki dan mengelola bidang usaha yang aktif, yaitu:
                </p>
                <div className="pl-6 border-l-2 border-slate-300 py-1 space-y-1 font-sans text-sm">
                  <div><strong>Nama Usaha:</strong> {permohonan.data_tambahan?.nama_usaha || 'Kios Usaha Mandiri'}</div>
                  <div><strong>Bidang Usaha:</strong> {permohonan.data_tambahan?.bidang_usaha || 'Perdagangan Umum & Jasa'}</div>
                  <div><strong>Alamat Lokasi Usaha:</strong> {permohonan.data_tambahan?.alamat_usaha || permohonan.alamat_lengkap}</div>
                  {permohonan.data_tambahan?.lama_usaha_tahun && (
                    <div><strong>Lama Berjalan:</strong> {permohonan.data_tambahan.lama_usaha_tahun} Tahun</div>
                  )}
                </div>
              </>
            )}

            {permohonan.jenis_surat_id.includes('sktm') && (
              <>
                <p>
                  Bahwa nama tersebut di atas adalah benar-benar penduduk Desa Nyurlembang yang berdasarkan catatan data sosial kemasyarakatan kami tergolong dalam <strong>Keluarga Prasejahtera / Tidak Mampu</strong>.
                </p>
                {permohonan.data_tambahan?.nama_anak && (
                  <p className="text-sm font-sans bg-slate-50 p-2 rounded border border-slate-200">
                    Surat keterangan ini diajukan untuk kepentingan: <strong>{permohonan.data_tambahan.nama_anak}</strong> pada instansi: <strong>{permohonan.data_tambahan.instansi_tujuan || 'Perguruan Tinggi / Sekolah'}</strong>.
                  </p>
                )}
              </>
            )}

            {permohonan.jenis_surat_id.includes('domisili') && (
              <p>
                Bahwa nama tersebut di atas adalah benar-benar penduduk yang bertempat tinggal dan berdomisili tetap di wilayah {permohonan.dusun}, Desa Nyurlembang, Kecamatan Narmada, Kabupaten Lombok Barat sejak {permohonan.data_tambahan?.tinggal_sejak || 'beberapa tahun terakhir'} hingga saat surat ini dikeluarkan.
              </p>
            )}

            {permohonan.jenis_surat_id.includes('skck') && (
              <p>
                Bahwa nama tersebut di atas adalah benar-benar penduduk Desa Nyurlembang yang menurut sepengetahuan kami selama bertempat tinggal di desa ini memiliki kelakuan baik, tidak pernah terlibat tindak pidana, serta tidak sedang dalam proses perkara hukum apapun.
              </p>
            )}

            {/* Keperluan Surat */}
            <p className="mt-2">
              Surat keterangan ini diberikan atas permohonan yang bersangkutan untuk dipergunakan sebagai: <strong className="underline">{permohonan.keperluan}</strong>.
            </p>

            <p className="indent-8">
              Demikian surat keterangan ini kami buat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya oleh pihak yang berkepentingan.
            </p>
          </div>

          {/* BLOK TANDA TANGAN BASAH KEPALA DESA & STEMPEL */}
          <div className="mt-10 pt-4 flex justify-between items-end">
            {/* Kolom QR Code Verifikasi Register Arsip */}
            <div className="text-left w-52 font-sans text-xs">
              <div className="p-2 border border-slate-300 rounded bg-slate-50 flex items-center gap-3">
                <div className="w-14 h-14 bg-white border border-slate-400 p-1 flex items-center justify-center">
                  {/* Grid simulated QR code */}
                  <div className="grid grid-cols-4 gap-0.5 w-full h-full">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div
                        key={i}
                        className={`${(i % 2 === 0 || i === 5 || i === 10) ? 'bg-slate-900' : 'bg-white'}`}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <div className="font-bold text-[10px] text-slate-800 leading-tight">REGISTER ARSIP DESA</div>
                  <div className="font-mono text-[9px] text-slate-700">{permohonan.kode_tiket}</div>
                  <div className="text-[8px] text-slate-700 mt-0.5">Validasi Fisik Pemdes Nyurlembang</div>
                </div>
              </div>
            </div>

            {/* Kolom Tanda Tangan Basah Kepala Desa */}
            <div className="text-center w-72">
              <p className="m-0">
                Nyurlembang, {formatDateIndo(permohonan.diverifikasi_pada || permohonan.dibuat_pada)}
              </p>
              <p className="font-bold m-0 uppercase tracking-wide">
                Kepala Desa Nyurlembang
              </p>

              {/* Area Tanda Tangan Basah & Stempel Cap */}
              <div className="h-28 relative flex items-center justify-center my-1">
                {/* Lingkaran stempel desa */}
                <div className="absolute left-6 w-24 h-24 rounded-full border-2 border-dashed border-indigo-300 flex flex-col items-center justify-center text-center p-1 rotate-[-12deg] opacity-70 pointer-events-none">
                  <span className="text-[7px] text-indigo-700 uppercase font-sans font-bold leading-none">Pemerintah Desa</span>
                  <span className="text-[6px] text-indigo-700 uppercase font-sans leading-none my-0.5">★ Nyurlembang ★</span>
                  <span className="text-[7px] text-indigo-700 uppercase font-sans font-bold leading-none">Kec. Narmada</span>
                </div>

                {/* Indikator Non-TTE (TTD Basah) */}
                <div className="text-[10px] font-sans text-slate-700 italic border-b border-dashed border-slate-300 pb-1">
                  (Ruang Tanda Tangan Basah & Stempel Cap)
                </div>
              </div>

              <p className="font-bold text-base underline uppercase tracking-wide m-0">
                {PROFIL_DESA.kepala_desa}
              </p>
              <p className="text-xs text-slate-600 font-sans m-0">
                NIPD. 19750812 200801 1 004
              </p>
            </div>
          </div>

          {/* Catatan Kaki Alur Non-TTE */}
          <div className="mt-8 pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] font-sans text-slate-700">
            <div>
              Dokumen resmi fisik divalidasi dengan tanda tangan basah & stempel Kepala Desa Nyurlembang.
            </div>
            <div>
              Dicetak via SID Nyurlembang pada: {formatDateIndo()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
