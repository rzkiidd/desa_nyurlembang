import React, { useState, useEffect } from 'react';
import { PengaduanWargaItem } from '../types';
import { supabase } from '../lib/supabaseClient';
import {
  MessageSquare,
  Send,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  User,
  Phone,
  MapPin,
  Tag,
  Search,
  Copy,
  Check,
  FileText,
  Camera,
  ExternalLink,
  HelpCircle,
  Sparkles
} from 'lucide-react';

interface HalamanPengaduanWargaProps {
  onBack: () => void;
}

const KATEGORI_PENGADUAN = [
  'Infrastruktur & Jalan',
  'Pelayanan Administrasi Kantor Desa',
  'Bantuan Sosial & BLT Dana Desa',
  'Kebersihan Lingkungan & Sampah',
  'Penerangan Jalan & Fasilitas Umum',
  'Ketertiban & Keamanan Warga',
  'Kesehatan & Posyandu',
  'Lainnya / Aspirasi Umum',
];

const DAFTAR_DUSUN_OPTIONS = [
  'Dusun Nyurlembang Daye',
  'Dusun Nyurlembang Barat',
  'Dusun Telaga Ngembeng (Telage Ngembeng)',
  'Dusun Tatar',
];

export const HalamanPengaduanWarga: React.FC<HalamanPengaduanWargaProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'form' | 'lacak'>('form');

  // Form State
  const [nama, setNama] = useState('');
  const [nik, setNik] = useState('');
  const [telepon, setTelepon] = useState('');
  const [dusun, setDusun] = useState(DAFTAR_DUSUN_OPTIONS[0]);
  const [kategori, setKategori] = useState(KATEGORI_PENGADUAN[0]);
  const [judul, setJudul] = useState('');
  const [isiLaporan, setIsiLaporan] = useState('');
  const [rahasia, setRahasia] = useState(false);
  const [fotoUrl, setFotoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedTiket, setSubmittedTiket] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Tracking State
  const [lacakNik, setLacakNik] = useState('');
  const [lacakTiket, setLacakTiket] = useState('');
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingResult, setTrackingResult] = useState<PengaduanWargaItem | null>(null);
  const [trackingSearched, setTrackingSearched] = useState(false);

  const handleCopyTiket = (kode: string) => {
    navigator.clipboard.writeText(kode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!nama.trim() || !nik.trim() || !telepon.trim() || !judul.trim() || !isiLaporan.trim()) {
      setErrorMessage('Mohon lengkapi seluruh kolom wajib bertanda bintang (*)');
      return;
    }

    if (nik.trim().length !== 16) {
      setErrorMessage('Nomor Induk Kependudukan (NIK) harus berjumlah 16 digit angka');
      return;
    }

    setSubmitting(true);

    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const randomPart = Math.floor(1000 + Math.random() * 9000);
      const generatedTiket = `PGD-${year}${month}-${randomPart}`;
      const newId = `pgd-${Date.now()}`;

      const payload = {
        id: newId,
        nomor_tiket: generatedTiket,
        nama: rahasia ? 'Warga Nyurlembang (Identitas Disamarkan)' : nama.trim(),
        nik: nik.trim(),
        telepon: telepon.trim(),
        dusun,
        kategori,
        judul: judul.trim(),
        isi_laporan: isiLaporan.trim(),
        foto_url: fotoUrl.trim() || null,
        rahasia,
        tanggal: now.toISOString(),
        status: 'Menunggu Tanggapan',
      };

      if (supabase) {
        const { error } = await supabase.from('pengaduan_warga').insert([payload]);
        if (error) {
          console.error('Supabase insert pengaduan error:', error);
          throw new Error(error.message);
        }
      }

      setSubmittedTiket(generatedTiket);
      // Reset form
      setJudul('');
      setIsiLaporan('');
      setFotoUrl('');
    } catch (err: any) {
      console.error('Gagal mengirim pengaduan:', err);
      setErrorMessage(`Gagal mengirim pengaduan ke database: ${err?.message || 'Terjadi gangguan jaringan'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLacak = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lacakTiket.trim()) return;

    setTrackingLoading(true);
    setTrackingSearched(true);
    setTrackingResult(null);

    try {
      if (supabase) {
        let query = supabase
          .from('pengaduan_warga')
          .select('*')
          .ilike('nomor_tiket', lacakTiket.trim());

        if (lacakNik.trim()) {
          query = query.eq('nik', lacakNik.trim());
        }

        const { data, error } = await query.maybeSingle();
        if (!error && data) {
          setTrackingResult(data as PengaduanWargaItem);
        }
      }
    } catch (err) {
      console.error('Gagal melacak pengaduan:', err);
    } finally {
      setTrackingLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-300">
      {/* Tombol Navigasi Kembali */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-[#0D2A4A] rounded-xl text-xs font-bold border border-slate-200 transition-colors shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#1565C0]" />
          <span>Kembali ke Beranda Portal</span>
        </button>

        <a
          href="https://www.lapor.go.id"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1565C0] hover:underline"
        >
          <span>Terintegrasi dengan SP4N-LAPOR!</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Header Halaman Pengaduan */}
      <div className="bg-gradient-to-br from-[#0D2A4A] to-[#1565C0] text-white p-6 sm:p-8 rounded-3xl shadow-md relative overflow-hidden">
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-[#FFB300]">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Layanan Aspirasi & Pengaduan Warga</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading tracking-tight">
            Pengaduan & Suara Warga Nyurlembang
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            Sampaikan saran, permohonan informasi, kendala fasilitas umum, atau laporan pelayanan publik secara langsung kepada Pemerintah Desa Nyurlembang dengan jaminan kerahasiaan dan respons cepat.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="relative z-10 mt-6 flex gap-2 p-1.5 bg-black/20 backdrop-blur-md rounded-2xl w-fit border border-white/10 text-xs font-bold">
          <button
            onClick={() => setActiveTab('form')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'form'
                ? 'bg-white text-[#0D2A4A] shadow-md'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            Formulir Buat Pengaduan
          </button>
          <button
            onClick={() => setActiveTab('lacak')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'lacak'
                ? 'bg-white text-[#0D2A4A] shadow-md'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            Cek Status & Jawaban Staf
          </button>
        </div>
      </div>

      {/* TAB 1: FORMULIR PENGADUAN */}
      {activeTab === 'form' && (
        <div className="space-y-6">
          {submittedTiket ? (
            <div className="card-kedinasan p-8 bg-white text-center space-y-5 animate-in zoom-in-95 border-emerald-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold text-[#0D2A4A] font-heading">
                  Pengaduan Berhasil Dikirim ke Database Desa!
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                  Laporan Anda telah tercatat langsung di Meja Kerja Pelayanan Staf Desa Nyurlembang dan akan segera ditindaklanjuti.
                </p>
              </div>

              <div className="p-5 bg-blue-50/70 border border-blue-200 rounded-2xl max-w-md mx-auto space-y-2 text-left">
                <div className="text-[11px] uppercase font-bold text-slate-500">Nomor Registrasi Tiket Pengaduan:</div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-2xl font-black font-mono text-[#1565C0] tracking-wide">
                    {submittedTiket}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyTiket(submittedTiket)}
                    className="p-2 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 text-[#1565C0] text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 pt-1">
                  Gunakan nomor tiket di atas pada tab <strong>"Cek Status & Jawaban Staf"</strong> untuk memantau tanggapan resmi staf desa.
                </p>
              </div>

              <div className="pt-4 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setLacakTiket(submittedTiket);
                    setLacakNik(nik);
                    setSubmittedTiket(null);
                    setActiveTab('lacak');
                  }}
                  className="px-5 py-2.5 bg-[#1565C0] hover:bg-[#0D2A4A] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  Pantau Status Pengaduan Sekarang →
                </button>
                <button
                  type="button"
                  onClick={() => setSubmittedTiket(null)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Kirim Pengaduan Baru
                </button>
              </div>
            </div>
          ) : (
            <div className="card-kedinasan p-6 sm:p-8 bg-white space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold text-[#0D2A4A] font-heading">
                  Formulir Laporan / Aspirasi Masyarakat
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Harap mengisi data diri dengan benar agar tim pelayanan desa dapat menghubungi Anda kembali terkait klarifikasi laporan.
                </p>
              </div>

              {errorMessage && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-xs text-red-800 animate-in fade-in">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Terjadi Kesalahan: </span>
                    <span>{errorMessage}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* 1. Identitas Pelapor */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nama Lengkap Pelapor <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={nama}
                        onChange={(e) => setNama(e.target.value)}
                        placeholder="Contoh: Ahmad Baihaqi"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0] outline-hidden font-medium"
                      />
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nomor Induk Kependudukan (NIK) 16 Digit <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={16}
                      value={nik}
                      onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                      placeholder="Contoh: 5201011504920001"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0] outline-hidden font-mono font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nomor Telepon / WhatsApp Aktif <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        value={telepon}
                        onChange={(e) => setTelepon(e.target.value)}
                        placeholder="Contoh: 081907123456"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0] outline-hidden font-medium"
                      />
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Asal Dusun <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={dusun}
                        onChange={(e) => setDusun(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0] outline-hidden font-medium appearance-none"
                      >
                        {DAFTAR_DUSUN_OPTIONS.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                  </div>
                </div>

                {/* 2. Rincian Laporan */}
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Kategori Pengaduan <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={kategori}
                        onChange={(e) => setKategori(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0] outline-hidden font-medium appearance-none"
                      >
                        {KATEGORI_PENGADUAN.map((k) => (
                          <option key={k} value={k}>{k}</option>
                        ))}
                      </select>
                      <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Judul Laporan / Pokok Pengaduan <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={judul}
                      onChange={(e) => setJudul(e.target.value)}
                      placeholder="Contoh: Lampu Penerangan Jalan Rusak di Dusun Tatar"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0] outline-hidden font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Uraian Lengkap Laporan / Keluhan <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={isiLaporan}
                      onChange={(e) => setIsiLaporan(e.target.value)}
                      placeholder="Jelaskan secara rinci lokasi kejadian, kronologi, serta dampak yang dialami masyarakat..."
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0] outline-hidden font-medium leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tautan Foto Bukti / Dokumen Pendukung (Opsional)
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        value={fotoUrl}
                        onChange={(e) => setFotoUrl(e.target.value)}
                        placeholder="Contoh: https://images.unsplash.com/... atau URL dokumen"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0] outline-hidden font-medium"
                      />
                      <Camera className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                  </div>

                  {/* Opsi Rahasia / Anonim */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="rahasia"
                      checked={rahasia}
                      onChange={(e) => setRahasia(e.target.checked)}
                      className="mt-1 rounded text-[#1565C0] focus:ring-[#1565C0] cursor-pointer"
                    />
                    <label htmlFor="rahasia" className="text-xs text-slate-700 cursor-pointer">
                      <span className="font-bold block text-slate-900">
                        Rahasiakan Identitas Saya (Laporan Anonim / Confidential)
                      </span>
                      <span className="text-slate-500 text-[11px] block mt-0.5">
                        Nama Anda akan disamarkan pada tampilan publik dan hanya staf verifikator desa yang dapat menghubungi untuk verifikasi tindak lanjut.
                      </span>
                    </label>
                  </div>
                </div>

                {/* Tombol Kirim */}
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Data tersimpan aman di Database Resmi SID Supabase Desa Nyurlembang</span>
                  </span>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto px-6 py-3 bg-[#1565C0] hover:bg-[#0D2A4A] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{submitting ? 'Mengirimkan Laporan...' : 'Kirim Pengaduan Sekarang'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LACAK STATUS & TANGGAPAN PETUGAS */}
      {activeTab === 'lacak' && (
        <div className="space-y-6">
          <div className="card-kedinasan p-6 sm:p-8 bg-white space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-[#0D2A4A] font-heading">
                Lacak Status & Jawaban Pengaduan
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Masukkan nomor tiket pengaduan yang Anda terima untuk melihat riwayat tindak lanjut oleh perangkat desa.
              </p>
            </div>

            <form onSubmit={handleLacak} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  required
                  value={lacakTiket}
                  onChange={(e) => setLacakTiket(e.target.value)}
                  placeholder="Masukkan Nomor Tiket (misal: PGD-202609-1234)"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold focus:bg-white focus:border-[#1565C0] outline-hidden uppercase"
                />
              </div>

              <div className="w-full sm:w-64">
                <input
                  type="text"
                  maxLength={16}
                  value={lacakNik}
                  onChange={(e) => setLacakNik(e.target.value.replace(/\D/g, ''))}
                  placeholder="NIK Pelapor (Opsional)"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:bg-white focus:border-[#1565C0] outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={trackingLoading}
                className="px-6 py-2.5 bg-[#1565C0] hover:bg-[#0D2A4A] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Search className="w-4 h-4" />
                <span>{trackingLoading ? 'Mencari...' : 'Cek Status'}</span>
              </button>
            </form>

            {/* Hasil Pencarian */}
            {trackingLoading && (
              <div className="p-8 text-center text-slate-400 text-xs">
                Sedang memuat data dari database Desa Nyurlembang...
              </div>
            )}

            {!trackingLoading && trackingSearched && !trackingResult && (
              <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl space-y-2">
                <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-700">Laporan Tidak Ditemukan</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Periksa kembali nomor tiket <strong>{lacakTiket}</strong>. Pastikan tidak ada kesalahan ketik atau gunakan NIK yang sesuai saat mengajukan.
                </p>
              </div>
            )}

            {!trackingLoading && trackingResult && (
              <div className="p-6 bg-slate-50/80 border border-slate-200 rounded-2xl space-y-5 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-slate-400 uppercase">
                      Nomor Tiket:
                    </span>
                    <h3 className="text-xl font-black font-mono text-[#1565C0]">
                      {trackingResult.nomor_tiket}
                    </h3>
                  </div>

                  <span
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 self-start sm:self-auto ${
                      trackingResult.status === 'Selesai'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : trackingResult.status === 'Sedang Diproses'
                        ? 'bg-blue-100 text-[#1565C0] border border-blue-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>{trackingResult.status}</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Judul Laporan:</span>
                    <span className="font-bold text-slate-900 text-sm">{trackingResult.judul}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Kategori & Dusun:</span>
                    <span className="font-semibold text-slate-800">
                      {trackingResult.kategori} • {trackingResult.dusun}
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 block text-[11px]">Uraian Pengaduan Warga:</span>
                    <p className="text-slate-700 mt-1 p-3 bg-white border border-slate-200 rounded-xl leading-relaxed whitespace-pre-wrap">
                      {trackingResult.isi_laporan}
                    </p>
                  </div>
                </div>

                {/* Tanggapan Resmi Staf */}
                <div className="p-4 bg-white border border-blue-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#1565C0]">
                      <Sparkles className="w-4 h-4 text-[#FFB300]" />
                      <span>Tanggapan Resmi Pemerintah Desa Nyurlembang</span>
                    </div>
                    {trackingResult.ditanggapi_pada && (
                      <span className="text-[10px] text-slate-400">
                        {new Date(trackingResult.ditanggapi_pada).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    )}
                  </div>

                  {trackingResult.tanggapan_petugas ? (
                    <div className="space-y-1 text-xs text-slate-800 pt-1">
                      <p className="leading-relaxed bg-blue-50/40 p-3 rounded-xl border border-blue-100">
                        {trackingResult.tanggapan_petugas}
                      </p>
                      <div className="text-[11px] text-slate-500 pt-1">
                        Ditindaklanjuti oleh: <strong>{trackingResult.ditanggapi_oleh || 'Staf Pelayanan Desa'}</strong>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic pt-1">
                      Laporan pengaduan ini sedang dalam antrean penelaahan oleh tim pelayanan desa. Mohon cek kembali secara berkala.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
