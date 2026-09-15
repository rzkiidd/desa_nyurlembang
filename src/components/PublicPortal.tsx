import React, { useState, useEffect } from 'react';
import { PROFIL_DESA, INITIAL_BERITA, INITIAL_UMKM, DAFTAR_DUSUN } from '../data/mockData';
import {
  getStoredBannerSlides,
  getStoredPejabatDesa,
  getStoredPengaturanDesa,
  getStoredApbdes,
  getStoredJenisSurat,
  getStoredGaleriKegiatan,
  getStoredStatistikDesa,
  getStoredProdukHukum,
  lacakPermohonan,
  getStoredPermohonan
} from '../lib/supabaseClient';
import {
  BannerSlide,
  PejabatDesa,
  PengaturanDesa,
  TransparansiApbdes,
  JenisSurat,
  GaleriKegiatan,
  StatistikDesa,
  ProdukHukumDesa,
  PermohonanSurat
} from '../types';
import { GaleriKegiatanDesa } from './GaleriKegiatanDesa';
import { StatistikDanApbdesSlider } from './StatistikDanApbdesSlider';
import {
  FileText,
  Search,
  Users,
  MapPin,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  Phone,
  Clock,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Store,
  CheckCircle2,
  Award,
  BookOpen,
  Calendar,
  Sparkles,
  FileCheck,
  Download,
  FileDown,
  Camera,
  Landmark,
  Scale,
  Building,
  Check,
  Compass,
  Layers,
  HelpCircle,
  X
} from 'lucide-react';
import { BeritaDesa, PotensiUmkm } from '../types';

interface PublicPortalProps {
  onNavigate: (view: 'permohonan' | 'pelacakan' | 'arsip' | 'sql' | 'pemerintahan' | 'pengaduan' | 'profil_lengkap' | 'jdih') => void;
  activeSubSection?: string;
  onClearSubSection?: () => void;
  onSelectBerita?: (berita: BeritaDesa) => void;
  onSelectUmkm?: (umkm: PotensiUmkm) => void;
}

export const PublicPortal: React.FC<PublicPortalProps> = ({
  onNavigate,
  activeSubSection,
  onClearSubSection,
  onSelectBerita,
  onSelectUmkm,
}) => {
  // Data State dari Supabase / LocalStorage (Bisa Dikelola di Admin)
  const [banners, setBanners] = useState<BannerSlide[]>([]);
  const [pejabatList, setPejabatList] = useState<PejabatDesa[]>([]);
  const [pengaturan, setPengaturan] = useState<PengaturanDesa>(getStoredPengaturanDesa());
  const [apbdes, setApbdes] = useState<TransparansiApbdes>(getStoredApbdes());
  const [jenisSuratList, setJenisSuratList] = useState<JenisSurat[]>([]);
  const [galeriList, setGaleriList] = useState<GaleriKegiatan[]>([]);
  const [statistik, setStatistik] = useState<StatistikDesa>(getStoredStatistikDesa());
  const [produkHukumList, setProdukHukumList] = useState<ProdukHukumDesa[]>([]);
  const [showAllUmkmModal, setShowAllUmkmModal] = useState(false);
  const [umkmSearch, setUmkmSearch] = useState('');
  const [umkmCategoryFilter, setUmkmCategoryFilter] = useState('Semua');

  // Modal Lihat Syarat Surat
  const [syaratModalSurat, setSyaratModalSurat] = useState<JenisSurat | null>(null);

  // Carousel Hero State
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Quick tracking input in Hero card
  const [quickNik, setQuickNik] = useState('');
  const [quickKode, setQuickKode] = useState('');
  const [quickResult, setQuickResult] = useState<PermohonanSurat | null>(null);
  const [quickError, setQuickError] = useState<string | null>(null);
  const [quickLoading, setQuickLoading] = useState(false);

  // Pejabat Carousel Index for sidebar widget
  const [pejabatIndex, setPejabatIndex] = useState(0);

  // Load data on mount
  useEffect(() => {
    setBanners(getStoredBannerSlides().filter((b) => b.aktif));
    setPejabatList(getStoredPejabatDesa().sort((a, b) => a.urutan - b.urutan));
    setPengaturan(getStoredPengaturanDesa());
    setApbdes(getStoredApbdes());
    setJenisSuratList(getStoredJenisSurat());
    setGaleriList(getStoredGaleriKegiatan());
    setStatistik(getStoredStatistikDesa());
    setProdukHukumList(getStoredProdukHukum());
  }, []);

  // Handle activeSubSection from Navbar dropdowns
  useEffect(() => {
    if (!activeSubSection) return;

    // Profil sub-sections dialihkan ke halaman profil lengkap
    if (['tentang-kami', 'visi-misi', 'sejarah', 'geografis', 'demografi', 'tentang', 'dusun'].includes(activeSubSection)) {
      onNavigate('profil_lengkap', activeSubSection);
    } else if (activeSubSection === 'produkhukum' || activeSubSection === 'jdih') {
      onNavigate('jdih');
    } else if (activeSubSection === 'aparatur' || activeSubSection === 'pejabat') {
      const el = document.getElementById('aparatur');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (activeSubSection === 'berita') {
      const el = document.getElementById('berita');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (activeSubSection === 'umkm') {
      const el = document.getElementById('umkm');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (activeSubSection === 'galeri') {
      const el = document.getElementById('galeri');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (activeSubSection === 'apbdes') {
      const el = document.getElementById('apbdes');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeSubSection, onNavigate]);

  // Rotasi slide hero setiap 5 detik
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const activeBanner = banners[currentSlideIndex] || {
    gambar_url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1600&auto=format&fit=crop&q=80',
    judul: 'Pesona Alam Asri & Pertanian Subur Desa Nyurlembang',
    subjudul: 'Kecamatan Narmada, Kabupaten Lombok Barat, NTB',
  };

  const handleQuickTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuickError(null);
    const cleanNik = quickNik.trim();
    const cleanKode = quickKode.trim().toUpperCase();

    if (!cleanNik && !cleanKode) {
      setQuickError('Silakan masukkan NIK atau Kode Tiket surat Anda.');
      return;
    }

    setQuickLoading(true);
    try {
      let found: PermohonanSurat | null = null;
      if (cleanNik && cleanKode) {
        found = await lacakPermohonan(cleanNik, cleanKode);
      }
      
      if (!found) {
        const all = getStoredPermohonan();
        found = all.find((p) => {
          if (cleanNik && cleanKode) {
            return p.nik === cleanNik && p.kode_tiket.toUpperCase() === cleanKode;
          }
          if (cleanKode) {
            return p.kode_tiket.toUpperCase() === cleanKode;
          }
          if (cleanNik) {
            return p.nik === cleanNik;
          }
          return false;
        }) || null;
      }

      if (found) {
        setQuickResult(found);
        setQuickError(null);
      } else {
        setQuickResult(null);
        setQuickError('Data permohonan tidak ditemukan. Pastikan NIK atau Kode Tiket sudah sesuai.');
      }
    } catch (err: any) {
      setQuickError('Gagal memeriksa status: ' + (err?.message || 'Error'));
    } finally {
      setQuickLoading(false);
    }
  };

  // Featured and Side articles for magazine layout
  const featuredNews = INITIAL_BERITA[0];
  const sideNews = INITIAL_BERITA.slice(1, 3);

  return (
    <div className="space-y-10 pb-16 bg-[#EEF2F6]">
      {/* =========================================================================
          1. HERO SECTION MODERN (FULL-WIDTH BLEED DENGAN OVERLAY GRADASI & SLIDER)
         ========================================================================= */}
      <section className="relative z-0 overflow-hidden bg-[#0D2A4A] text-white shadow-xl min-h-[540px] flex flex-col justify-between border-b border-blue-900/50">
        {/* Carousel Background Slides */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {banners.map((b, idx) => {
            const isActive = idx === currentSlideIndex;
            return (
              <div
                key={b.id || idx}
                className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                  isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              >
                <img
                  src={b.gambar_url}
                  alt={b.judul}
                  className="w-full h-full object-cover object-center scale-105 transition-transform duration-7000 ease-out"
                />
              </div>
            );
          })}

          {/* Overlay Gradasi Resmi Kedinasan: Deep Navy (#0D2A4A/90) ke Ocean Blue (#1565C0/75) */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0D2A4A]/95 via-[#0D2A4A]/85 to-[#1565C0]/70 backdrop-blur-[0.5px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D2A4A] via-transparent to-[#0D2A4A]/40" />
        </div>

        {/* Konten Depan Hero (Grid 2 Kolom: Kiri Tulisan & Tombol, Kanan Card Cek Cepat) */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-8 w-full flex-1 flex flex-col justify-center">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Kolom Kiri: Tipografi Kedinasan & Tombol Aksi */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-[#03A9F4] border border-white/20">
                <span className="w-2 h-2 rounded-full bg-[#03A9F4] animate-pulse" />
                <span>Sistem Informasi Desa (SID) • Pemerintah Kabupaten Lombok Barat</span>
              </div>

              <div className="space-y-1.5">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight font-heading text-white drop-shadow-md">
                  PEMERINTAH DESA NYURLEMBANG
                </h1>
                <p className="text-sm sm:text-lg text-slate-200 font-semibold tracking-wide">
                  KECAMATAN NARMADA • KABUPATEN LOMBOK BARAT
                </p>
              </div>

              <p className="text-xs sm:text-sm text-slate-200/90 leading-relaxed max-w-xl">
                Layanan administrasi kependudukan digital, transparansi publik APBDes, dan pemberdayaan potensi ekonomi 4 dusun Desa Nyurlembang secara terbuka, cepat, dan bebas perantara.
              </p>

              {/* Tombol Aksi Utama Warga */}
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => onNavigate('permohonan')}
                  id="hero-btn-ajukan-surat"
                  className="px-5 py-3 bg-[#2E7D32] hover:bg-[#256629] text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 hover:scale-[1.02]"
                >
                  <FileText className="w-4 h-4" />
                  <span>Ajukan Surat Mandiri</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onNavigate('pelacakan')}
                  id="hero-btn-lacak-surat"
                  className="px-5 py-3 bg-[#FFB300] hover:bg-[#ffa000] text-[#0D2A4A] text-xs sm:text-sm font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 hover:scale-[1.02]"
                >
                  <Search className="w-4 h-4 text-[#0D2A4A]" />
                  <span>Lacak Status Tiket</span>
                </button>
              </div>

              {/* Sorotan Slide Caption */}
              <div className="pt-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/30 border border-white/10 text-xs text-slate-300">
                  <Sparkles className="w-3.5 h-3.5 text-[#FFB300]" />
                  <span className="font-semibold text-white">{activeBanner.judul}</span>
                  <span className="text-slate-400 hidden sm:inline">• {activeBanner.subjudul}</span>
                </div>
              </div>
            </div>

            {/* Kolom Kanan: Card Cek Cepat Tiket Surat */}
            <div className="lg:col-span-5">
              <div className="bg-[#0A192F]/90 backdrop-blur-md rounded-2xl border border-blue-400/30 p-5 sm:p-6 shadow-2xl text-white">
                <div className="flex items-center justify-between pb-3 border-b border-white/15 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#FFB300] text-[#0D2A4A] flex items-center justify-center font-bold">
                      <Search className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-sm text-white">Cek Cepat Tiket Surat</h3>
                      <p className="text-[11px] text-slate-300">Pantau proses pengajuan surat Anda</p>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-bold border border-emerald-400/30">
                    Langsung
                  </span>
                </div>

                {/* HASIL LANGSUNG STATUS SURAT JIKA SUDAH DICEK */}
                {quickResult ? (
                  <div className="space-y-3.5 text-xs animate-in fade-in">
                    <div className="p-3 bg-white/10 rounded-xl border border-white/15 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-slate-300 font-semibold">{quickResult.kode_tiket}</span>
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            quickResult.status === 'Siap Diambil'
                              ? 'bg-emerald-500 text-white shadow-xs'
                              : quickResult.status === 'Diverifikasi & Dicetak'
                              ? 'bg-sky-500 text-white'
                              : quickResult.status === 'Diajukan'
                              ? 'bg-amber-400 text-slate-900'
                              : quickResult.status === 'Selesai'
                              ? 'bg-slate-200 text-slate-900'
                              : 'bg-rose-500 text-white'
                          }`}
                        >
                          {quickResult.status}
                        </span>
                      </div>

                      <div className="border-t border-white/10 pt-2 space-y-1">
                        <div className="font-bold text-sm text-white">{quickResult.nama_pemohon}</div>
                        <div className="text-amber-300 font-semibold text-xs">{quickResult.jenis_surat_nama}</div>
                        <div className="text-slate-300 text-[11px] flex items-center gap-1.5 pt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{quickResult.dusun}</span>
                        </div>
                      </div>

                      {quickResult.catatan_petugas && (
                        <div className="p-2 bg-black/30 rounded-lg text-[11px] text-amber-200 border border-amber-400/20 mt-1">
                          <span className="font-bold">Catatan Petugas: </span>
                          <span>{quickResult.catatan_petugas}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => onNavigate('pelacakan')}
                        className="flex-1 py-2 bg-[#1565C0] hover:bg-[#0d47a1] text-white font-bold rounded-xl text-center shadow-xs transition-colors cursor-pointer"
                      >
                        Lihat Pelacakan Lengkap
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setQuickResult(null);
                          setQuickError(null);
                        }}
                        className="px-3 py-2 bg-white/15 hover:bg-white/25 text-white font-bold rounded-xl transition-colors cursor-pointer"
                        title="Cek tiket lain"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                ) : (
                  /* FORM INPUT PENGECEKAN */
                  <form onSubmit={handleQuickTrack} className="space-y-3 text-xs">
                    {quickError && (
                      <div className="p-2.5 bg-rose-500/20 border border-rose-400/40 rounded-xl text-rose-200 text-[11px] leading-tight">
                        {quickError}
                      </div>
                    )}

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-200 mb-1">
                        Nomor Induk Kependudukan (NIK)
                      </label>
                      <input
                        type="text"
                        value={quickNik}
                        onChange={(e) => setQuickNik(e.target.value.replace(/\D/g, ''))}
                        maxLength={16}
                        placeholder="16 Digit NIK KTP Anda"
                        className="w-full px-3 py-2 bg-white/95 border border-white/30 rounded-xl text-slate-900 placeholder-slate-400 font-mono text-xs focus:ring-2 focus:ring-[#03A9F4] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-200 mb-1">
                        Kode Tiket Surat
                      </label>
                      <input
                        type="text"
                        value={quickKode}
                        onChange={(e) => setQuickKode(e.target.value.toUpperCase())}
                        placeholder="Contoh: NYUR-20260309-8812"
                        className="w-full px-3 py-2 bg-white/95 border border-white/30 rounded-xl text-slate-900 placeholder-slate-400 font-mono text-xs focus:ring-2 focus:ring-[#03A9F4] focus:outline-none uppercase"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={quickLoading}
                      className="w-full py-2.5 bg-[#1565C0] hover:bg-[#0d47a1] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-50"
                    >
                      <span>{quickLoading ? 'Memeriksa Status...' : 'Cek Status Sekarang'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <div className="pt-2 text-[10px] text-slate-300 flex items-center justify-between">
                      <span>Lupa kode tiket? Periksa WhatsApp Anda</span>
                      <button
                        type="button"
                        onClick={() => onNavigate('pelacakan')}
                        className="text-[#FFB300] hover:underline font-semibold cursor-pointer"
                      >
                        Bantuan
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Statistical Ribbon di Bawah Hero */}
        <div className="relative z-10 bg-[#0A1F36]/95 backdrop-blur-md border-t border-white/10 py-3.5 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-left divide-y md:divide-y-0 md:divide-x divide-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-[#03A9F4] flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Wilayah Dusun</div>
                <div className="text-base font-bold text-white font-heading">4 Dusun Warga</div>
              </div>
            </div>

            <div className="flex items-center gap-3 md:pl-4 pt-2 md:pt-0">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Populasi Penduduk</div>
                <div className="text-base font-bold text-white font-heading">
                  {Number(statistik?.total_penduduk || 4850).toLocaleString('id-ID')} Jiwa
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 md:pl-4 pt-2 md:pt-0">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-[#FFB300] flex items-center justify-center shrink-0">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Kepala Keluarga (KK)</div>
                <div className="text-base font-bold text-white font-heading">
                  {Number(statistik?.jumlah_kk || 1420).toLocaleString('id-ID')} KK
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 md:pl-4 pt-2 md:pt-0">
              <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-[#03A9F4] flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Jam Pelayanan Kantor</div>
                <div className="text-xs sm:text-sm font-semibold text-slate-200">08.00 - 15.30 WITA</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. TATA LETAK DUA KOLOM ASIMETRIS (GRID 8:4 / ~65% : ~35%)
         ========================================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* =====================================================================
              KOLOM KIRI UTAMA (~65% / 8 Kolom Desktop)
             ===================================================================== */}
          <main className="lg:col-span-8 space-y-10">
            {/* SECTION 2: KABAR & BERITA DESA (GAYA MAGAZINE) */}
            <section id="berita" className="card-kedinasan p-6 sm:p-7 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-50 text-[#1565C0] text-[11px] font-bold rounded-full mb-1">
                    <BookOpen className="w-3.5 h-3.5 text-[#1565C0]" />
                    <span>Warta Desa</span>
                  </div>
                  <h2 className="text-xl font-bold text-[#0D2A4A] font-heading">
                    Kabar & Dokumentasi Desa Nyurlembang
                  </h2>
                </div>
                <span className="text-xs text-slate-400 hidden sm:inline">Pembaruan Resmi</span>
              </div>

              {/* Magazine Layout: 1 Berita Utama (Kiri/Besar) + 2 Berita Pendamping (Kanan) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                {/* Berita Utama (Kiri, 7 Kolom) */}
                {featuredNews && (
                  <article
                    onClick={() => onSelectBerita && onSelectBerita(featuredNews)}
                    className="md:col-span-7 bg-slate-50/50 rounded-xl overflow-hidden border border-slate-200/80 flex flex-col justify-between hover:border-[#1565C0] transition-all cursor-pointer group hover:shadow-md"
                  >
                    <div className="relative h-48 sm:h-56 bg-slate-100 overflow-hidden">
                      <img
                        src={featuredNews.gambar_url}
                        alt={featuredNews.judul}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-3 left-3 px-2.5 py-1 bg-[#0D2A4A]/90 text-white text-[10px] font-bold rounded-md">
                        {featuredNews.kategori}
                      </span>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mb-1.5">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {new Date(featuredNews.published_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </span>
                          <span>•</span>
                          <span>{featuredNews.penulis}</span>
                        </div>
                        <h3 className="font-heading font-bold text-[#0D2A4A] text-base leading-snug group-hover:text-[#1565C0] transition-colors">
                          {featuredNews.judul}
                        </h3>
                        <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                          {featuredNews.ringkasan}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs font-bold text-[#1565C0]">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onSelectBerita) onSelectBerita(featuredNews);
                          }}
                          className="flex items-center gap-1.5 hover:underline cursor-pointer"
                        >
                          <span>Baca Selengkapnya</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </article>
                )}

                {/* Berita Pendamping (Kanan, 5 Kolom) */}
                <div className="md:col-span-5 space-y-4">
                  {sideNews.map((news) => (
                    <article
                      key={news.id}
                      onClick={() => onSelectBerita && onSelectBerita(news)}
                      className="p-4 rounded-xl bg-slate-50/50 border border-slate-200/80 hover:border-[#1565C0] transition-all flex flex-col justify-between cursor-pointer group hover:shadow-xs"
                    >
                      <div className="flex gap-3">
                        <img
                          src={news.gambar_url}
                          alt={news.judul}
                          className="w-20 h-20 rounded-lg object-cover shrink-0 border border-slate-200 group-hover:opacity-90"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-bold text-[#1565C0] uppercase">
                            {news.kategori}
                          </span>
                          <h4 className="font-bold text-xs text-[#0D2A4A] leading-snug line-clamp-2 mt-0.5 group-hover:text-[#1565C0] transition-colors">
                            {news.judul}
                          </h4>
                          <span className="text-[10px] text-slate-400 block mt-1">
                            {new Date(news.published_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short'
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-100 flex justify-end">
                        <span className="text-[11px] font-semibold text-[#1565C0] flex items-center gap-1">
                          <span>Baca Berita</span>
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </article>
                  ))}

                  <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-200 text-xs">
                    <div className="font-bold text-[#0D2A4A] mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#1565C0]" />
                      <span>Ingin Menulis Informasi Warga?</span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      Kontributor publik dapat mengirimkan warta kegiatan dusun melalui Dashboard Kontributor.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 3: ETALASE PRODUK UMKM 4 DUSUN */}
            <section id="umkm" className="card-kedinasan p-6 sm:p-7 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 text-[#2E7D32] text-[11px] font-bold rounded-full mb-1">
                    <Store className="w-3.5 h-3.5 text-[#2E7D32]" />
                    <span>Ekonomi Mandiri</span>
                  </div>
                  <h2 className="text-xl font-bold text-[#0D2A4A] font-heading">
                    Potensi UMKM Warga 4 Dusun
                  </h2>
                </div>
                <span className="text-xs text-slate-400 hidden sm:inline">Dukung Produk Lokal</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {INITIAL_UMKM.slice(0, 3).map((u) => (
                  <div
                    key={u.id}
                    onClick={() => onSelectUmkm && onSelectUmkm(u)}
                    className="bg-slate-50/40 rounded-xl border border-slate-200/80 p-3.5 flex flex-col justify-between hover:border-[#2E7D32] hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div>
                      {/* Foto & Logo UMKM */}
                      <div className="h-36 rounded-lg overflow-hidden mb-2.5 bg-slate-100 relative">
                        <img
                          src={u.foto_url}
                          alt={u.nama_usaha}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-md shadow-xs">
                          <Store className="w-3 h-3 text-[#2E7D32]" />
                          <span className="text-[10px] font-bold text-slate-800">Logo UMKM</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-[#2E7D32] rounded">
                          {u.kategori}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5" />
                          <span>{u.dusun}</span>
                        </span>
                      </div>
                      <h4 className="font-bold text-xs sm:text-sm text-[#0D2A4A] mt-1.5 leading-snug group-hover:text-[#2E7D32] transition-colors">
                        {u.nama_usaha}
                      </h4>
                      <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                        {u.deskripsi}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between">
                      <div className="text-xs font-mono font-bold text-[#2E7D32]">{u.harga_rentang}</div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSelectUmkm) onSelectUmkm(u);
                        }}
                        className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors shadow-xs cursor-pointer"
                      >
                        <span>Lihat Produk</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tombol Lihat Selengkapnya */}
              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowAllUmkmModal(true)}
                  className="w-full sm:w-auto px-6 py-2.5 bg-white hover:bg-emerald-50 text-[#2E7D32] border border-[#2E7D32]/40 hover:border-[#2E7D32] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer group"
                >
                  <Store className="w-4 h-4 text-[#2E7D32]" />
                  <span>Lihat Selengkapnya ({INITIAL_UMKM.length} Potensi UMKM Warga 4 Dusun)</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </section>

            {/* SECTION 4: GALERI DOKUMENTASI FOTO KEGIATAN */}
            <div id="galeri">
              <GaleriKegiatanDesa galeriList={galeriList} />
            </div>

            {/* SECTION 5: TRANSPARANSI APBDES & STATISTIK SLIDER */}
            <div id="apbdes">
              <StatistikDanApbdesSlider apbdes={apbdes} statistik={statistik} />
            </div>
          </main>

          {/* =====================================================================
              KOLOM KANAN / STICKY SIDEBAR (~35% / 4 Kolom Desktop)
             ===================================================================== */}
          <aside className="lg:col-span-4 space-y-5 lg:sticky lg:top-24">
            {/* WIDGET 1: PIMPINAN WILAYAH (Hanya Foto, Nama, dan Jabatan) */}
            <div className="card-kedinasan p-5 space-y-3.5 shadow-sm">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                <Award className="w-4 h-4 text-[#1565C0]" />
                <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-[#1565C0]">
                  Pimpinan Wilayah
                </h3>
              </div>

              <div className="flex items-center gap-3.5">
                <img
                  src={pengaturan.sambutan_kades_foto || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80"}
                  alt="H. Wardi, S.AP"
                  className="w-16 h-20 sm:w-20 sm:h-24 rounded-xl object-cover border-2 border-[#1565C0] shadow-sm shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="font-heading font-black text-sm sm:text-base text-[#0D2A4A] leading-snug truncate">
                    H. Wardi, S.AP
                  </h4>
                  <div className="text-xs font-semibold text-[#1565C0] mt-0.5">
                    Kepala Desa Nyurlembang
                  </div>
                </div>
              </div>
            </div>

            {/* WIDGET 2: PERANGKAT DESA (Hanya Foto, Nama, dan Jabatan) */}
            <div id="aparatur" className="card-kedinasan p-5 space-y-3.5 shadow-sm">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#1565C0]" />
                  <h3 className="font-bold text-xs sm:text-sm text-[#0D2A4A] font-heading">Perangkat Desa</h3>
                </div>
                <span className="text-[11px] font-bold text-[#1565C0] font-mono">
                  {pejabatIndex + 1} / {pejabatList.length}
                </span>
              </div>

              {pejabatList.length > 0 && (
                <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={pejabatList[pejabatIndex].foto_url}
                      alt={pejabatList[pejabatIndex].nama}
                      className="w-14 h-18 sm:w-16 sm:h-20 rounded-xl object-cover border border-slate-200 shrink-0 shadow-xs"
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-xs sm:text-sm text-[#0D2A4A] leading-snug">
                        {pejabatList[pejabatIndex].nama}
                      </div>
                      <div className="text-xs font-semibold text-[#1565C0] mt-0.5">
                        {pejabatList[pejabatIndex].jabatan}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                    <button
                      type="button"
                      onClick={() => setPejabatIndex((prev) => (prev === 0 ? pejabatList.length - 1 : prev - 1))}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 text-[11px] font-semibold cursor-pointer transition-colors"
                    >
                      &larr; Sebelumnya
                    </button>
                    <button
                      type="button"
                      onClick={() => setPejabatIndex((prev) => (prev + 1) % pejabatList.length)}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 text-[11px] font-semibold cursor-pointer transition-colors"
                    >
                      Selanjutnya &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* WIDGET 3: LOKET & JAM KERJA RESMI */}
            <div className="card-kedinasan p-5 space-y-3">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 text-[#0D2A4A] font-bold text-sm">
                <Clock className="w-4 h-4 text-[#1565C0]" />
                <span>Loket Layanan Kependudukan</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Senin - Kamis:</span>
                  <span className="font-bold text-[#0D2A4A]">08.00 - 15.30 WITA</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Jumat:</span>
                  <span className="font-bold text-[#0D2A4A]">08.00 - 11.30 WITA</span>
                </div>
                <div className="flex justify-between py-1 text-rose-600">
                  <span>Sabtu, Minggu & Hari Libur:</span>
                  <span className="font-bold">Tutup</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-[11px] text-amber-900 space-y-1">
                <span className="font-bold block">Pelayanan Online 24 Jam:</span>
                <span>Warga dapat mengajukan permohonan surat kapan saja melalui formulir mandiri.</span>
              </div>
            </div>

            {/* WIDGET 4: TAUTAN INTEGRASI KABUPATEN LOMBOK BARAT */}
            <div className="card-kedinasan p-5 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Integrasi SPBE Kabupaten
              </div>
              <div className="space-y-2 text-xs font-semibold">
                <a
                  href="https://lombokbaratkab.go.id"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-[#1565C0] flex items-center justify-between border border-slate-200/80 transition-colors"
                >
                  <span>Portal Pemkab Lombok Barat</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>
                <a
                  href="https://www.lapor.go.id/instansi/pemerintah-kabupaten-lombok-barat"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-[#1565C0] flex items-center justify-between border border-slate-200/80 transition-colors"
                >
                  <span>SP4N LAPOR! Pengaduan Warga</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* MODAL LIHAT SYARAT DOKUMEN LAYANAN SURAT */}
      {syaratModalSurat && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="px-2 py-0.5 bg-blue-100 text-[#1565C0] text-[10px] font-mono font-bold rounded">
                  {syaratModalSurat.kode}
                </span>
                <h3 className="font-heading font-bold text-sm text-[#0D2A4A] mt-1 leading-snug">
                  {syaratModalSurat.nama}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSyaratModalSurat(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700">Persyaratan Berkas Dokumen:</div>
              <ul className="space-y-1.5 text-xs text-slate-600 pl-4 list-disc">
                {syaratModalSurat.persyaratan.map((syarat, idx) => (
                  <li key={idx} className="font-medium leading-relaxed">
                    {syarat}
                  </li>
                ))}
              </ul>
              <div className="mt-3 p-2.5 bg-blue-50/80 border border-blue-200 rounded-lg text-[11px] text-[#1565C0] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>Estimasi pengerjaan: <strong>{syaratModalSurat.estimasi_hari} hari kerja</strong></span>
              </div>

              {syaratModalSurat.template_blanko_url && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                  <div className="text-xs font-bold text-[#0D2A4A] flex items-center gap-1.5">
                    <FileDown className="w-4 h-4 text-[#1565C0]" />
                    <span>Unduh File Blanko Formulir:</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Warga dapat mengunduh formulir kosong ini terlebih dahulu untuk diisi secara fisik bila diperlukan.
                  </p>
                  <a
                    href={syaratModalSurat.template_blanko_url}
                    download={syaratModalSurat.nama_file_blanko || `Blanko_${syaratModalSurat.kode}.pdf`}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#1565C0] hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh Blanko Formulir ({syaratModalSurat.nama_file_blanko || 'PDF/DOCX'})</span>
                  </a>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSyaratModalSurat(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  setSyaratModalSurat(null);
                  onNavigate('permohonan');
                }}
                className="px-5 py-2 bg-[#1565C0] hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs"
              >
                Ajukan Surat Ini &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DAFTAR LENGKAP POTENSI UMKM 4 DUSUN */}
      {showAllUmkmModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => setShowAllUmkmModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl border border-slate-200 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#2E7D32] flex items-center justify-center font-bold">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#0D2A4A] font-heading">
                    Katalog Lengkap Potensi UMKM 4 Dusun
                  </h3>
                  <p className="text-xs text-slate-500">
                    Produk olahan lokal, kuliner khas, kerajinan, dan komoditas unggulan Desa Nyurlembang
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAllUmkmModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter & Pencarian */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={umkmSearch}
                  onChange={(e) => setUmkmSearch(e.target.value)}
                  placeholder="Cari nama usaha, produk, atau pemilik..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#2E7D32] focus:outline-none"
                />
              </div>
              <select
                value={umkmCategoryFilter}
                onChange={(e) => setUmkmCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#2E7D32] focus:outline-none text-slate-700"
              >
                <option value="Semua">Semua Kategori</option>
                <option value="Kuliner & Olahan">Kuliner & Olahan</option>
                <option value="Kerajinan & Kriya">Kerajinan & Kriya</option>
                <option value="Pertanian & Hasil Bumi">Pertanian & Hasil Bumi</option>
                <option value="Jasa & Perdagangan">Jasa & Perdagangan</option>
              </select>
            </div>

            {/* Grid Semua UMKM */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[55vh] overflow-y-auto pr-1">
              {INITIAL_UMKM.filter((u) => {
                const matchSearch =
                  u.nama_usaha.toLowerCase().includes(umkmSearch.toLowerCase()) ||
                  u.pemilik.toLowerCase().includes(umkmSearch.toLowerCase()) ||
                  u.deskripsi.toLowerCase().includes(umkmSearch.toLowerCase()) ||
                  u.dusun.toLowerCase().includes(umkmSearch.toLowerCase());
                const matchCat =
                  umkmCategoryFilter === 'Semua' || u.kategori === umkmCategoryFilter;
                return matchSearch && matchCat;
              }).map((u) => (
                <div
                  key={u.id}
                  onClick={() => {
                    setShowAllUmkmModal(false);
                    if (onSelectUmkm) onSelectUmkm(u);
                  }}
                  className="bg-slate-50/50 rounded-xl border border-slate-200 p-3 flex flex-col justify-between hover:border-[#2E7D32] hover:shadow-md transition-all cursor-pointer group"
                >
                  <div>
                    <div className="h-32 rounded-lg overflow-hidden mb-2 bg-slate-100 relative">
                      <img
                        src={u.foto_url}
                        alt={u.nama_usaha}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-[#2E7D32] rounded">
                        {u.kategori}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5" />
                        <span>{u.dusun}</span>
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-[#0D2A4A] mt-1 line-clamp-1 group-hover:text-[#2E7D32]">
                      {u.nama_usaha}
                    </h4>
                    <p className="text-[10px] text-slate-500">Oleh: {u.pemilik}</p>
                    <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                      {u.deskripsi}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#2E7D32]">{u.harga_rentang}</span>
                    <span className="text-[10px] text-[#2E7D32] font-bold flex items-center gap-1 group-hover:underline">
                      Detail <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>Menampilkan potensi ekonomi warga Desa Nyurlembang</span>
              <button
                type="button"
                onClick={() => setShowAllUmkmModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
              >
                Tutup Katalog
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
