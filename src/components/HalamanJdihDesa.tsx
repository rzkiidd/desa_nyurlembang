import React, { useState, useEffect } from 'react';
import { ProdukHukumDesa, KategoriProdukHukum } from '../types';
import { supabase, getStoredProdukHukum } from '../lib/supabaseClient';
import {
  Scale,
  Search,
  FileText,
  Download,
  Calendar,
  Tag,
  ArrowLeft,
  Filter,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  Info
} from 'lucide-react';

interface HalamanJdihDesaProps {
  onBack: () => void;
}

const KATEGORI_TABS: (KategoriProdukHukum | 'Semua')[] = [
  'Semua',
  'Peraturan Desa (Perdes)',
  'Peraturan Kepala Desa (Perkades)',
  'Keputusan Kepala Desa',
  'Maklumat Pelayanan',
  'Surat Edaran Desa',
];

export const HalamanJdihDesa: React.FC<HalamanJdihDesaProps> = ({ onBack }) => {
  const [list, setList] = useState<ProdukHukumDesa[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKategori, setSelectedKategori] = useState<string>('Semua');
  const [selectedTahun, setSelectedTahun] = useState<string>('all');

  useEffect(() => {
    fetchProdukHukum();
  }, []);

  const fetchProdukHukum = async () => {
    setLoading(true);
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('produk_hukum')
          .select('*')
          .order('tahun', { ascending: false });

        if (!error && data && data.length > 0) {
          setList(data as ProdukHukumDesa[]);
          setLoading(false);
          return;
        }
      }
      // Fallback
      setList(getStoredProdukHukum());
    } catch (err) {
      console.warn('Gagal memuat produk hukum dari Supabase:', err);
      setList(getStoredProdukHukum());
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (item: ProdukHukumDesa) => {
    if (item.file_url) {
      const a = document.createElement('a');
      a.href = item.file_url;
      a.download = item.nama_file || `${item.nomor.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      const content = `DOKUMEN PRODUK HUKUM DESA NYURLEMBANG\n\nNomor: ${item.nomor}\nJudul: ${item.judul}\nKategori: ${item.kategori}\nTahun: ${item.tahun}\nTanggal Penetapan: ${item.tanggal_penetapan}\nKeterangan: ${item.keterangan || '-'}\n\nPemerintah Desa Nyurlembang, Kecamatan Narmada, Kabupaten Lombok Barat.`;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${item.nomor.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // Extract available years
  const availableYears = Array.from(new Set(list.map((i) => i.tahun))).sort((a, b) => Number(b) - Number(a));

  const filtered = list.filter((item) => {
    const matchSearch =
      item.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nomor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.keterangan || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchKategori = selectedKategori === 'Semua' || item.kategori === selectedKategori;
    const matchTahun = selectedTahun === 'all' || item.tahun.toString() === selectedTahun;
    return matchSearch && matchKategori && matchTahun;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-300">
      {/* Tombol Navigasi Kembali */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-[#0D2A4A] rounded-xl text-xs font-bold border border-slate-200 transition-colors shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#1565C0]" />
          <span>Kembali ke Beranda Portal</span>
        </button>

        <span className="text-xs text-slate-500 font-medium">
          JDIH Resmi • Jaringan Dokumentasi & Informasi Hukum
        </span>
      </div>

      {/* Header JDIH Desa */}
      <div className="bg-gradient-to-br from-[#0D2A4A] to-[#1565C0] text-white p-6 sm:p-8 rounded-3xl shadow-md space-y-4">
        <div className="space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-[#FFB300]">
            <Scale className="w-3.5 h-3.5" />
            <span>Dokumentasi Regulasi & Produk Hukum Desa</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading tracking-tight">
            JDIH Desa Nyurlembang
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            Pusat penyebarluasan naskah hukum resmi, Peraturan Desa (Perdes), Peraturan Kepala Desa (Perkades), dan Keputusan Kepala Desa guna menjamin kepastian hukum, transparansi tata kelola, dan keterbukaan informasi publik (KIP).
          </p>
        </div>

        {/* Statistik Regulasi */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-center">
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
            <span className="text-xl font-extrabold text-[#FFB300] block">{list.length}</span>
            <span className="text-[11px] text-slate-200">Total Regulasi</span>
          </div>
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
            <span className="text-xl font-extrabold text-white block">
              {list.filter((i) => i.kategori === 'Peraturan Desa (Perdes)').length}
            </span>
            <span className="text-[11px] text-slate-200">Peraturan Desa</span>
          </div>
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
            <span className="text-xl font-extrabold text-white block">
              {list.filter((i) => i.kategori === 'Peraturan Kepala Desa (Perkades)').length}
            </span>
            <span className="text-[11px] text-slate-200">Perkades</span>
          </div>
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
            <span className="text-xl font-extrabold text-emerald-300 block">100%</span>
            <span className="text-[11px] text-slate-200">Akses Publik</span>
          </div>
        </div>
      </div>

      {/* Filter & Pencarian */}
      <div className="card-kedinasan p-5 bg-white space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nomor peraturan, judul, atau kata kunci..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:border-[#1565C0] outline-hidden"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedTahun}
              onChange={(e) => setSelectedTahun(e.target.value)}
              className="px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 outline-hidden"
            >
              <option value="all">Semua Tahun</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr.toString()}>Tahun {yr}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tab Kategori */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {KATEGORI_TABS.map((kat) => (
            <button
              key={kat}
              onClick={() => setSelectedKategori(kat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedKategori === kat
                  ? 'bg-[#1565C0] text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {kat}
            </button>
          ))}
        </div>
      </div>

      {/* Daftar Produk Hukum */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">
          Sedang memuat data JDIH dari database Desa Nyurlembang...
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-kedinasan p-12 text-center bg-white space-y-3">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">Tidak ada produk hukum yang sesuai kriteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Silakan coba kata kunci lain atau pilih kategori "Semua" untuk melihat seluruh arsip regulasi desa.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="card-kedinasan p-5 bg-white space-y-3 hover:border-[#1565C0] transition-colors flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-blue-50 text-[#1565C0] border border-blue-200">
                    {item.kategori}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500">
                    Tahun {item.tahun}
                  </span>
                </div>

                <h3 className="text-sm font-extrabold text-[#0D2A4A] leading-snug">
                  {item.judul}
                </h3>

                <div className="text-xs font-mono text-slate-500">
                  Nomor: <strong className="text-slate-800">{item.nomor}</strong>
                </div>

                {item.keterangan && (
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {item.keterangan}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Ditetapkan: {item.tanggal_penetapan}</span>
                </div>

                <button
                  onClick={() => handleDownload(item)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1565C0] hover:bg-[#0D2A4A] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh PDF</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
