import React, { useState } from 'react';
import { PengaduanWargaItem } from '../types';
import { supabase, getStoredPengaduan, saveStoredPengaduan } from '../lib/supabaseClient';
import {
  AlertCircle,
  CheckCircle2,
  Send,
  ArrowLeft,
  FileText,
  MapPin,
  Camera,
  ShieldCheck,
  Phone,
  HelpCircle,
  ExternalLink,
  Loader2
} from 'lucide-react';

interface FormPengaduanWargaProps {
  onBack: () => void;
}

export const FormPengaduanWarga: React.FC<FormPengaduanWargaProps> = ({ onBack }) => {
  const [nama, setNama] = useState('');
  const [nik, setNik] = useState('');
  const [telepon, setTelepon] = useState('');
  const [dusun, setDusun] = useState('Dusun Nyurlembang Daye');
  const [kategori, setKategori] = useState('Infrastruktur & Jalan');
  const [judul, setJudul] = useState('');
  const [isiLaporan, setIsiLaporan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTiket, setSubmittedTiket] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !nik.trim() || !judul.trim() || !isiLaporan.trim()) {
      alert('Mohon lengkapi data formulir pengaduan!');
      return;
    }

    setIsSubmitting(true);
    const kodeTiket = `ADU-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const baru: PengaduanWargaItem = {
      id: `aduan-${Date.now()}`,
      nomor_tiket: kodeTiket,
      nama: nama.trim(),
      nik: nik.trim(),
      telepon: telepon.trim(),
      dusun,
      kategori,
      judul: judul.trim(),
      isi_laporan: isiLaporan.trim(),
      tanggal: new Date().toISOString(),
      status: 'Menunggu Tanggapan',
    };

    // 1. Simpan ke database Supabase
    if (supabase) {
      try {
        const { error } = await supabase.from('pengaduan_warga').insert([
          {
            nomor_tiket: kodeTiket,
            nama: baru.nama,
            nik: baru.nik,
            telepon: baru.telepon,
            dusun: baru.dusun,
            kategori: baru.kategori,
            judul: baru.judul,
            isi_laporan: baru.isi_laporan,
            status: baru.status,
            tanggal: baru.tanggal,
          },
        ]);
        if (error) {
          console.warn('Supabase pengaduan insert warning:', error.message);
        }
      } catch (err) {
        console.warn('Supabase network issue:', err);
      }
    }

    // 2. Simpan ke local storage sebagai cadangan
    const allAduan = getStoredPengaduan();
    saveStoredPengaduan([baru, ...allAduan]);

    setIsSubmitting(false);
    setSubmittedTiket(kodeTiket);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-[#0D2A4A] rounded-xl text-xs font-bold border border-slate-200 transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4 text-[#1565C0]" />
          <span>Kembali ke Beranda Portal</span>
        </button>

        <a
          href="https://www.lapor.go.id/instansi/pemerintah-kabupaten-lombok-barat"
          target="_blank"
          rel="noreferrer"
          className="text-xs font-bold text-[#1565C0] hover:underline flex items-center gap-1"
        >
          <span>SP4N LAPOR! Lobar</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {submittedTiket ? (
        <div className="card-kedinasan p-8 bg-white text-center space-y-5 animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-[#0D2A4A] font-heading">
              Pengaduan Berhasil Terkirim!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              Laporan pengaduan Anda telah tercatat pada Meja Kerja Pelayanan Staf Desa Nyurlembang dan segera ditindaklanjuti.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl max-w-sm mx-auto space-y-1">
            <div className="text-[11px] uppercase font-bold text-slate-400">Nomor Registrasi Aduan:</div>
            <div className="text-xl font-black font-mono text-[#1565C0]">{submittedTiket}</div>
            <div className="text-[10px] text-slate-500">Simpan nomor tiket ini untuk pengecekan status</div>
          </div>

          <div className="pt-4 flex justify-center gap-3">
            <button
              onClick={() => {
                setSubmittedTiket(null);
                setJudul('');
                setIsiLaporan('');
              }}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              Buat Pengaduan Lain
            </button>
            <button
              onClick={onBack}
              className="px-5 py-2.5 bg-[#1565C0] hover:bg-[#0D2A4A] text-white rounded-xl text-xs font-bold transition-colors"
            >
              Selesai & Ke Beranda
            </button>
          </div>
        </div>
      ) : (
        <div className="card-kedinasan p-6 sm:p-8 bg-white space-y-6">
          <div className="space-y-2 pb-4 border-b border-slate-100">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 text-xs font-bold rounded-full border border-amber-200">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Kanal Aspirasi & Pengaduan Warga</span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#0D2A4A] font-heading">
              Layanan Pengaduan Masyarakat
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Sampaikan aspirasi, keluhan fasilitas umum, atau saran pelayanan kantor desa demi perbaikan pelayanan bersama.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0D2A4A] mb-1">
                  Nama Lengkap Pelapor *
                </label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Sesuai KTP"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#1565C0] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0D2A4A] mb-1">
                  NIK (KTP) *
                </label>
                <input
                  type="text"
                  value={nik}
                  onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                  maxLength={16}
                  placeholder="16 digit NIK"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#1565C0] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0D2A4A] mb-1">
                  Nomor WhatsApp Aktif *
                </label>
                <input
                  type="tel"
                  value={telepon}
                  onChange={(e) => setTelepon(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#1565C0] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0D2A4A] mb-1">
                  Wilayah Dusun Terkait *
                </label>
                <select
                  value={dusun}
                  onChange={(e) => setDusun(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#1565C0] focus:outline-none"
                >
                  <option value="Dusun Nyurlembang Daye">Dusun Nyurlembang Daye</option>
                  <option value="Dusun Nyurlembang Barat">Dusun Nyurlembang Barat</option>
                  <option value="Dusun Telaga Ngembeng (Telage Ngembeng)">Dusun Telaga Ngembeng (Telage Ngembeng)</option>
                  <option value="Dusun Tatar">Dusun Tatar</option>
                  <option value="Seluruh Wilayah Desa">Seluruh Wilayah Desa</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0D2A4A] mb-1">
                Kategori Laporan *
              </label>
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#1565C0] focus:outline-none"
              >
                <option value="Infrastruktur & Jalan">Infrastruktur, Jalan & Saluran Air</option>
                <option value="Pelayanan Administrasi">Pelayanan Administrasi & Staf Desa</option>
                <option value="Kebersihan & Lingkungan">Kebersihan, Sampah & Lingkungan Hidup</option>
                <option value="Bantuan Sosial & Kesejahteraan">Bantuan Sosial (PKH, BLT, Beras)</option>
                <option value="Keamanan & Ketertiban">Keamanan & Ketertiban Lingkungan</option>
                <option value="Lainnya">Aspirasi & Masukan Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0D2A4A] mb-1">
                Judul Laporan Singkat *
              </label>
              <input
                type="text"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                placeholder="Contoh: Lampu Penerangan Jalan Dusun Kebon Baru Padam"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#1565C0] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0D2A4A] mb-1">
                Uraian Lengkap Pengaduan *
              </label>
              <textarea
                rows={4}
                value={isiLaporan}
                onChange={(e) => setIsiLaporan(e.target.value)}
                placeholder="Jelaskan secara rinci lokasi kejadian, waktu, dan kronologi atau harapan penanganan oleh pemerintah desa..."
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#1565C0] focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#1565C0] hover:bg-[#0D2A4A] text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mengirim ke Sistem Desa...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Kirimkan Pengaduan Warga</span>
                  </>
                )}
              </button>
            </div>

            <div className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5 pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Data pribadi Anda dilindungi sesuai standar kerahasiaan pelayanan SPBE.</span>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
