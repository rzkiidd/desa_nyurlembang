import React, { useState, useEffect } from 'react';
import { TransparansiApbdes, StatistikDesa, ProgramIntervensi } from '../types';
import {
  Coins,
  Users,
  Calendar,
  GraduationCap,
  Briefcase,
  MapPin,
  HeartHandshake,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Building2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Layers,
  ArrowUpRight,
  PieChart,
  ExternalLink
} from 'lucide-react';

interface StatistikDanApbdesSliderProps {
  apbdes: TransparansiApbdes;
  statistik: StatistikDesa;
}

// Helper format angka aman anti-crash
const formatAngka = (val: number | string | undefined | null): string => {
  if (val === undefined || val === null || isNaN(Number(val))) return '0';
  return Number(val).toLocaleString('id-ID');
};

// Hook Count Up Sederhana & Mulus
const useCountUp = (target: number | undefined | null, duration: number = 800) => {
  const safeTarget = typeof target === 'number' && !isNaN(target) ? target : (Number(target) || 0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOutQuad = 1 - (1 - progress) * (1 - progress);
      setCount(Math.floor(easeOutQuad * safeTarget));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setCount(safeTarget);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [safeTarget, duration]);

  return typeof count === 'number' && !isNaN(count) ? count : 0;
};

export const StatistikDanApbdesSlider: React.FC<StatistikDanApbdesSliderProps> = ({
  apbdes,
  statistik,
}) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [subTabPendidikan, setSubTabPendidikan] = useState<'pendidikan' | 'pekerjaan'>('pendidikan');

  // Count up values dengan fallback aman
  const countedPendapatan = useCountUp(apbdes?.pendapatan);
  const countedBelanja = useCountUp(apbdes?.belanja);
  const countedJiwa = useCountUp(statistik?.total_penduduk);

  const slides = [
    {
      id: 'apbdes',
      title: 'Transparansi APBDes 2026',
      icon: Coins,
      shortLabel: 'APBDes 2026',
    },
    {
      id: 'demografi',
      title: 'Demografi Kependudukan (Laki vs Perempuan & KK)',
      icon: Users,
      shortLabel: 'Laki vs Perempuan',
    },
    {
      id: 'usia',
      title: 'Piramida Usia & Tanggal Lahir',
      icon: Calendar,
      shortLabel: 'Kelompok Usia',
    },
    {
      id: 'pendidikan_pekerjaan',
      title: 'Pendidikan & Mata Pencaharian Warga',
      icon: GraduationCap,
      shortLabel: 'Pendidikan & Profesi',
    },
    {
      id: 'wilayah_dusun',
      title: 'Wilayah 4 Dusun, RT & RW',
      icon: MapPin,
      shortLabel: '4 Dusun & RT/RW',
    },
    {
      id: 'intervensi',
      title: 'Program Intervensi Desa & Bantuan Sosial',
      icon: HeartHandshake,
      shortLabel: 'Program Intervensi',
    },
  ];

  const handlePrev = () => {
    setActiveSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const totalJiwa = statistik?.total_penduduk || 1;
  const persenLaki = (((statistik?.penduduk_laki || 0) / totalJiwa) * 100).toFixed(1);
  const persenPerempuan = (((statistik?.penduduk_perempuan || 0) / totalJiwa) * 100).toFixed(1);

  // Perhitungan rasio Donut APBDes
  const totalAnggaran = (apbdes?.pendapatan || 0) + (apbdes?.belanja || 0) || 1;
  const ratioPendapatan = ((apbdes?.pendapatan || 0) / totalAnggaran) * 100;
  const ratioBelanja = ((apbdes?.belanja || 0) / totalAnggaran) * 100;

  return (
    <section id="section-apbdes-statistik" className="max-w-7xl mx-auto px-4 lg:px-8 space-y-6">
      {/* Header Section dengan Navigasi Tab Geser */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-[#1565C0] text-xs font-bold rounded-full mb-2 border border-blue-200">
            <BarChart3 className="w-3.5 h-3.5 text-[#1565C0]" />
            <span>Transparansi Data, Keuangan & Demografi Terpadu</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#0D2A4A] font-heading">
            Data Statistik & Transparansi APBDes {apbdes.tahun}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Pemerintah Desa Nyurlembang, Lombok Barat.
          </p>
        </div>

        {/* Kontrol Geser Kiri / Kanan */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition-colors shadow-xs flex items-center justify-center cursor-pointer"
            title="Slide Sebelumnya"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold font-mono">
            {activeSlide + 1} / {slides.length}
          </div>
          <button
            onClick={handleNext}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition-colors shadow-xs flex items-center justify-center cursor-pointer"
            title="Slide Selanjutnya"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Quick Jump Buttons / Scrollable Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {slides.map((s, idx) => {
          const Icon = s.icon;
          const isActive = activeSlide === idx;
          return (
            <button
              key={s.id}
              onClick={() => setActiveSlide(idx)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-[#0D2A4A] text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#FFB300]' : 'text-slate-400'}`} />
              <span>{s.shortLabel}</span>
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          SLIDER CARD CONTAINER DENGAN BACKGROUND NAVY MEWAH & AKSEN EMAS
      ========================================================================= */}
      <div className="bg-[#0D2A4A] text-white rounded-3xl p-6 md:p-10 border border-blue-900/60 shadow-2xl relative overflow-hidden transition-all duration-300">
        {/* Dekorasi Grid Halus */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#1565C0]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#2E7D32]/10 rounded-full blur-3xl pointer-events-none" />

        {/* -----------------------------------------------------------------------
            SLIDE 1: TRANSPARANSI APBDES 2026 (DONUT CHART & MULTI PROGRESS BAR)
        ------------------------------------------------------------------------ */}
        {activeSlide === 0 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-250">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-blue-900/60 pb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FFB300] mb-1">
                  <Coins className="w-4 h-4 text-[#FFB300]" />
                  <span>Akuntabilitas Pengelolaan Keuangan Desa (SPBE)</span>
                </div>
                <h3 className="text-2xl font-bold font-heading text-white">
                  Transparansi Anggaran Pendapatan & Belanja Desa (APBDes) {apbdes.tahun}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Pemerintah Desa Nyurlembang, Lombok Barat.
                </p>
              </div>

              {/* Ringkasan Angka dengan Animated Count-Up */}
              <div className="flex flex-wrap gap-3">
                <div className="bg-blue-950/80 p-3.5 rounded-2xl border border-blue-800/60 text-right">
                  <div className="text-[10px] text-slate-300 uppercase font-semibold">Total Pendapatan</div>
                  <div className="text-base sm:text-lg font-bold text-emerald-400 font-mono">
                    Rp {formatAngka(countedPendapatan)}
                  </div>
                </div>
                <div className="bg-blue-950/80 p-3.5 rounded-2xl border border-blue-800/60 text-right">
                  <div className="text-[10px] text-slate-300 uppercase font-semibold">Total Belanja</div>
                  <div className="text-base sm:text-lg font-bold text-[#FFB300] font-mono">
                    Rp {formatAngka(countedBelanja)}
                  </div>
                </div>
                <div className="bg-blue-950/80 p-3.5 rounded-2xl border border-blue-800/60 text-right">
                  <div className="text-[10px] text-slate-300 uppercase font-semibold">Pembiayaan Neto</div>
                  <div className="text-base sm:text-lg font-bold text-[#03A9F4] font-mono">
                    Rp {formatAngka(apbdes?.pembiayaan)}
                  </div>
                </div>
              </div>
            </div>

            {/* Donut Visual & Rincian Belanja 5 Bidang */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              {/* Donut Chart SVG Visual */}
              <div className="bg-blue-950/60 p-6 rounded-2xl border border-blue-900/60 flex flex-col items-center justify-center text-center space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-[#FFB300] flex items-center gap-1.5">
                  <PieChart className="w-4 h-4" />
                  <span>Rasio Realisasi APBDes</span>
                </div>

                <div className="relative w-44 h-44 flex items-center justify-center">
                  <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                    {/* Lingkaran Dasar */}
                    <path
                      className="text-blue-950"
                      strokeWidth="3.8"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    {/* Stroke Pendapatan (Emerald) */}
                    <path
                      className="text-[#2E7D32]"
                      strokeDasharray={`${ratioPendapatan}, 100`}
                      strokeWidth="4"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    {/* Stroke Belanja (Gold) */}
                    <path
                      className="text-[#FFB300]"
                      strokeDasharray={`${ratioBelanja * 0.95}, 100`}
                      strokeDashoffset={`-${ratioPendapatan}`}
                      strokeWidth="4"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Tahun Anggaran</span>
                    <span className="text-xl font-extrabold text-white font-mono">{apbdes.tahun}</span>
                    <span className="text-[10px] text-emerald-400 font-semibold">Surplus Seimbang</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#2E7D32]" />
                    <span className="text-slate-300">Pendapatan</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#FFB300]" />
                    <span className="text-slate-300">Belanja</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar 5 Bidang */}
              <div className="lg:col-span-2 space-y-3">
                <div className="flex items-center justify-between pb-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Alokasi Penggunaan Belanja Desa Per Bidang Kegiatan:
                  </h4>
                  <span className="text-[11px] text-[#03A9F4] font-medium">Perdes APBDes {apbdes.tahun}</span>
                </div>

                <div className="space-y-2.5">
                  {apbdes.rincian_belanja.map((bidang, bIdx) => (
                    <div key={bIdx} className="bg-blue-950/60 p-3.5 rounded-2xl border border-blue-900/60 space-y-1.5">
                      <div className="flex justify-between items-start text-xs font-semibold">
                        <span className="text-slate-200">{bidang.bidang}</span>
                        <span className="text-[#03A9F4] font-mono font-bold">{bidang.persen}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-blue-950 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            bIdx === 0
                              ? 'bg-gradient-to-r from-[#1565C0] to-[#03A9F4]'
                              : bIdx === 1
                              ? 'bg-gradient-to-r from-[#2E7D32] to-emerald-400'
                              : bIdx === 2
                              ? 'bg-gradient-to-r from-[#FFB300] to-amber-300'
                              : 'bg-gradient-to-r from-cyan-600 to-cyan-400'
                          }`}
                          style={{ width: `${bidang.persen}%` }}
                        />
                      </div>
                      <div className="text-xs font-mono font-bold text-white flex justify-between">
                        <span className="text-[10px] text-slate-400 font-sans">Realisasi Anggaran:</span>
                        <span>Rp {formatAngka(bidang?.anggaran)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -----------------------------------------------------------------------
            SLIDE 2: DEMOGRAFI (LAKI VS PEREMPUAN DENGAN BAR 50:50)
        ------------------------------------------------------------------------ */}
        {activeSlide === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-250">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-blue-900/60 pb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#03A9F4] mb-1">
                  <Users className="w-4 h-4 text-[#03A9F4]" />
                  <span>Struktur Demografi & Kependudukan Nyurlembang</span>
                </div>
                <h3 className="text-2xl font-bold font-heading text-white">
                  Komposisi Penduduk Laki-Laki vs Perempuan & Kepala Keluarga
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Data agregat kependudukan berbasis Kartu Keluarga (KK) dan NIK resmi Desa Nyurlembang.
                </p>
              </div>

              <div className="bg-blue-950/80 px-4 py-3 rounded-2xl border border-blue-800/60 text-right">
                <div className="text-[10px] text-slate-300 uppercase font-semibold">Total Penduduk</div>
                <div className="text-2xl font-extrabold text-[#FFB300] font-mono">
                  {formatAngka(countedJiwa)} <span className="text-xs text-slate-300 font-sans">Jiwa</span>
                </div>
              </div>
            </div>

            {/* Kartu Rasio Gender Terpisah & Horizontal 50:50 Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-blue-950/60 p-5 rounded-2xl border border-blue-800 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-300 uppercase">Laki-Laki</div>
                  <div className="text-2xl font-black text-[#03A9F4] font-mono">
                    {formatAngka(statistik?.penduduk_laki)} Jiwa
                  </div>
                  <div className="text-[11px] text-slate-400 font-semibold">Persentase: {persenLaki}%</div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#1565C0]/20 text-[#03A9F4] flex items-center justify-center font-bold text-lg border border-[#1565C0]/40">
                  L
                </div>
              </div>

              <div className="bg-blue-950/60 p-5 rounded-2xl border border-emerald-800 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-300 uppercase">Perempuan</div>
                  <div className="text-2xl font-black text-emerald-400 font-mono">
                    {formatAngka(statistik?.penduduk_perempuan)} Jiwa
                  </div>
                  <div className="text-[11px] text-slate-400 font-semibold">Persentase: {persenPerempuan}%</div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold text-lg border border-emerald-800/60">
                  P
                </div>
              </div>
            </div>

            {/* Horizontal 50:50 Bar */}
            <div className="bg-blue-950/50 p-6 rounded-2xl border border-blue-900/70 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-[#03A9F4]">Pria: {persenLaki}%</span>
                <span className="text-slate-400">Rasio Keseimbangan Gender (50:50)</span>
                <span className="text-emerald-400">Wanita: {persenPerempuan}%</span>
              </div>

              <div className="w-full h-5 bg-blue-950 rounded-full overflow-hidden flex p-0.5 border border-blue-800/60">
                <div
                  className="h-full bg-gradient-to-r from-[#1565C0] to-[#03A9F4] rounded-l-full flex items-center justify-end pr-2 text-[10px] font-bold text-white transition-all duration-500"
                  style={{ width: `${persenLaki}%` }}
                >
                  {persenLaki}%
                </div>
                <div
                  className="h-full bg-gradient-to-r from-[#2E7D32] to-emerald-400 rounded-r-full flex items-center pl-2 text-[10px] font-bold text-white transition-all duration-500"
                  style={{ width: `${persenPerempuan}%` }}
                >
                  {persenPerempuan}%
                </div>
              </div>
            </div>

            {/* Metrik Tambahan */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-blue-950/60 p-4 rounded-2xl border border-blue-900/60">
                <div className="text-[10px] text-slate-300 uppercase font-semibold">Kepala Keluarga</div>
                <div className="text-xl font-bold text-white font-mono mt-1">
                  {formatAngka(statistik?.jumlah_kk)} KK
                </div>
              </div>
              <div className="bg-blue-950/60 p-4 rounded-2xl border border-blue-900/60">
                <div className="text-[10px] text-slate-300 uppercase font-semibold">Rata-rata Jiwa/KK</div>
                <div className="text-xl font-bold text-white font-mono mt-1">
                  {((statistik?.total_penduduk || 0) / (statistik?.jumlah_kk || 1)).toFixed(1)} Jiwa
                </div>
              </div>
              <div className="bg-blue-950/60 p-4 rounded-2xl border border-blue-900/60">
                <div className="text-[10px] text-slate-300 uppercase font-semibold">Jumlah Wilayah</div>
                <div className="text-xl font-bold text-white font-mono mt-1">4 Dusun</div>
              </div>
              <div className="bg-blue-950/60 p-4 rounded-2xl border border-blue-900/60">
                <div className="text-[10px] text-slate-300 uppercase font-semibold">Rukun Tetangga</div>
                <div className="text-xl font-bold text-white font-mono mt-1">{statistik?.jumlah_rt || 24} RT</div>
              </div>
            </div>
          </div>
        )}

        {/* -----------------------------------------------------------------------
            SLIDE 3: PIRAMIDA USIA & PILL BAR HORIZONTAL DENGAN BADGE PUNCAK DEMOGRAFI
        ------------------------------------------------------------------------ */}
        {activeSlide === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-250">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-blue-900/60 pb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FFB300] mb-1">
                  <Calendar className="w-4 h-4 text-[#FFB300]" />
                  <span>Kategori Berdasarkan Tanggal Lahir & Rentang Usia</span>
                </div>
                <h3 className="text-2xl font-bold font-heading text-white">
                  Piramida Penduduk Menurut Tanggal Lahir & Kelompok Umur
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Klasifikasi demografi untuk penentuan sasaran posyandu, pendidikan, dan ketenagakerjaan.
                </p>
              </div>

              <div className="bg-blue-950/80 px-4 py-2.5 rounded-2xl border border-emerald-800/80">
                <span className="text-xs text-emerald-400 font-bold">59.6% Usia Produktif</span>
              </div>
            </div>

            {/* Pill Bar Horizontal */}
            <div className="space-y-4">
              {(statistik?.kelompok_usia || []).map((item, uIdx) => {
                const isPuncak = item?.kategori?.toLowerCase()?.includes('produktif');
                return (
                  <div key={uIdx} className="bg-blue-950/60 p-4 rounded-2xl border border-blue-900/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm">{item.kategori}</h4>
                        <span className="text-[11px] text-slate-300 font-mono">({item.rentang})</span>
                        {isPuncak && (
                          <span className="px-2.5 py-0.5 bg-[#FFB300] text-[#0D2A4A] text-[10px] font-extrabold rounded-full animate-pulse">
                            Puncak Demografi
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-mono font-bold text-white">
                          {formatAngka(item?.jumlah)} Jiwa
                        </span>
                        <span className="px-2.5 py-1 bg-blue-900/90 text-[#03A9F4] text-xs font-bold rounded-lg font-mono">
                          {item?.persen ?? 0}%
                        </span>
                      </div>
                    </div>

                    {/* Pill Bar */}
                    <div className="w-full h-3 bg-blue-950 rounded-full overflow-hidden p-0.5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isPuncak
                            ? 'bg-gradient-to-r from-[#FFB300] to-amber-300'
                            : 'bg-gradient-to-r from-[#1565C0] to-[#03A9F4]'
                        }`}
                        style={{ width: `${item.persen * 1.5}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* -----------------------------------------------------------------------
            SLIDE 4: PENDIDIKAN & PROFESI (DENGAN TOGGLE SWITCH SUB-TAB)
        ------------------------------------------------------------------------ */}
        {activeSlide === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-250">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-blue-900/60 pb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#03A9F4] mb-1">
                  <GraduationCap className="w-4 h-4 text-[#03A9F4]" />
                  <span>Kualitas SDM & Ragam Profesi Warga</span>
                </div>
                <h3 className="text-2xl font-bold font-heading text-white">
                  Statistik Tingkat Pendidikan & Mata Pencaharian Warga
                </h3>
              </div>

              {/* Sub-Tab Toggle Switch */}
              <div className="inline-flex p-1 bg-blue-950 rounded-2xl border border-blue-800">
                <button
                  onClick={() => setSubTabPendidikan('pendidikan')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    subTabPendidikan === 'pendidikan'
                      ? 'bg-[#1565C0] text-white shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Jenjang Pendidikan
                </button>
                <button
                  onClick={() => setSubTabPendidikan('pekerjaan')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    subTabPendidikan === 'pekerjaan'
                      ? 'bg-[#2E7D32] text-white shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Profesi Dominan Warga
                </button>
              </div>
            </div>

            {subTabPendidikan === 'pendidikan' ? (
              <div className="space-y-3">
                <div className="text-xs font-bold text-[#03A9F4] uppercase tracking-wider mb-2">
                  Sebaran Jenjang Pendidikan Formal Penduduk:
                </div>
                {(statistik?.pendidikan || []).map((p, pIdx) => (
                  <div key={pIdx} className="bg-blue-950/60 p-4 rounded-2xl border border-blue-900/60 space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-200 font-semibold">
                      <span>{p.tingkat}</span>
                      <span className="font-mono text-white font-bold">
                        {formatAngka(p?.jumlah)} Jiwa ({p?.persen ?? 0}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-blue-950 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#1565C0] to-[#03A9F4] rounded-full transition-all duration-500"
                        style={{ width: `${(p?.persen ?? 0) * 2.5}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                  Sebaran Sektor Mata Pencaharian & Profesi (Petani Aren, Pengrajin, Wiraswasta, ASN):
                </div>
                {(statistik?.pekerjaan || []).map((j, jIdx) => (
                  <div key={jIdx} className="bg-blue-950/60 p-4 rounded-2xl border border-blue-900/60 space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-200 font-semibold">
                      <span>{j.jenis}</span>
                      <span className="font-mono text-white font-bold">
                        {formatAngka(j?.jumlah)} Jiwa ({j?.persen ?? 0}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-blue-950 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#2E7D32] to-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${(j?.persen ?? 0) * 2.5}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* -----------------------------------------------------------------------
            SLIDE 5: WILAYAH 4 DUSUN (GRID KARTU INTERAKTIF)
        ------------------------------------------------------------------------ */}
        {activeSlide === 4 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-250">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-blue-900/60 pb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FFB300] mb-1">
                  <MapPin className="w-4 h-4 text-[#FFB300]" />
                  <span>Kewilayahan 4 Dusun Desa Nyurlembang</span>
                </div>
                <h3 className="text-2xl font-bold font-heading text-white">
                  Data Administrasi 4 Dusun, Rukun Tetangga (RT) & Rukun Warga (RW)
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-blue-950/80 px-3.5 py-2 rounded-xl border border-blue-800/60 text-center">
                  <div className="text-[10px] text-slate-300 uppercase">Luas Wilayah</div>
                  <div className="text-sm font-bold text-white font-mono">{statistik?.luas_wilayah_ha || 382.5} Ha</div>
                </div>
                <div className="bg-blue-950/80 px-3.5 py-2 rounded-xl border border-blue-800/60 text-center">
                  <div className="text-[10px] text-slate-300 uppercase">Total RT / RW</div>
                  <div className="text-sm font-bold text-white font-mono">24 RT / 4 RW</div>
                </div>
              </div>
            </div>

            {/* Grid 4 Kartu Dusun */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
              {(statistik?.dusun_detail || []).map((ds, dIdx) => (
                <div
                  key={dIdx}
                  className="bg-blue-950/60 p-5 rounded-2xl border border-blue-900/60 hover:border-[#03A9F4] transition-all space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">{ds.nama}</h4>
                      <p className="text-[11px] text-slate-300 mt-0.5">Kadus: <strong>{ds.kepala_dusun}</strong></p>
                    </div>
                    <span className="px-2 py-0.5 bg-blue-900/80 text-[#FFB300] text-[10px] font-bold rounded">
                      {ds.jumlah_rt} RT
                    </span>
                  </div>

                  <div className="pt-2 border-t border-blue-900/60 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400">Jumlah KK</div>
                      <div className="font-mono font-bold text-white">{formatAngka(ds?.jumlah_kk)} KK</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">Jumlah Jiwa</div>
                      <div className="font-mono font-bold text-emerald-400">{formatAngka(ds?.jumlah_jiwa)} Jiwa</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* -----------------------------------------------------------------------
            SLIDE 6: PROGRAM INTERVENSI
        ------------------------------------------------------------------------ */}
        {activeSlide === 5 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-250">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-blue-900/60 pb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FFB300] mb-1">
                  <HeartHandshake className="w-4 h-4 text-[#FFB300]" />
                  <span>Program Intervensi Pemerintah Desa & Bantuan Terarah</span>
                </div>
                <h3 className="text-2xl font-bold font-heading text-white">
                  Intervensi Penanganan Stunting, Bantuan Sosial & Pemberdayaan Warga
                </h3>
              </div>

              <div className="bg-blue-950/80 px-4 py-2.5 rounded-2xl border border-blue-800/60 text-right">
                <div className="text-[10px] text-slate-300 uppercase font-semibold">Total Intervensi Aktif</div>
                <div className="text-xl font-bold text-white font-mono">
                  {(statistik?.intervensi || []).length} Program Prioritas
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(statistik?.intervensi || []).map((itv) => (
                <div
                  key={itv.id}
                  className="bg-blue-950/60 p-5 rounded-2xl border border-blue-900/60 space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2.5 py-0.5 bg-blue-900/90 text-[#03A9F4] text-[10px] font-bold rounded">
                        {itv.kategori}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 text-[10px] font-bold rounded ${
                          itv.status === 'Terealisasi'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : itv.status === 'Berjalan'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-blue-950 text-blue-300 border border-blue-800'
                        }`}
                      >
                        {itv.status} ({itv.realisasi}%)
                      </span>
                    </div>

                    <h4 className="font-bold text-white text-base leading-snug">{itv.nama_program}</h4>
                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{itv.keterangan}</p>

                    <div className="mt-3 p-3 bg-blue-950/80 rounded-xl border border-blue-900/50 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Target Sasaran:</span>
                        <span className="text-slate-200 font-semibold">{itv.target_sasaran}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Fokus Wilayah:</span>
                        <span className="text-[#FFB300] font-semibold">{itv.dusun_fokus}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Alokasi Anggaran:</span>
                        <span className="font-mono font-bold text-emerald-400">
                          Rp {formatAngka(itv?.anggaran)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          CARD: EMBED GOOGLE LOOKER STUDIO APBDES DESA NYURLEMBANG (RESPONSIF MOBILE & DESKTOP)
          Tepat di Bawah Card Akuntabilitas Pengelolaan Keuangan Desa (SPBE)
      ========================================================================= */}
      {activeSlide === 0 && (
        <div className="mt-6 bg-white rounded-3xl p-4 sm:p-6 md:p-8 border border-slate-200/90 shadow-lg space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-[#1565C0] text-xs font-bold rounded-full mb-1.5">
                <PieChart className="w-3.5 h-3.5 text-[#1565C0]" />
                <span>Dashboard Interaktif Looker Studio</span>
              </div>
              <h3 className="text-lg sm:text-2xl font-bold text-[#0D2A4A] font-heading">
                Akuntabilitas & Visualisasi Realisasi APBDes (Looker Studio)
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Laporan interaktif real-time data anggaran, realisasi belanja, pendapatan desa, dan pembiayaan Pemerintah Desa Nyurlembang.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="https://datastudio.google.com/embed/reporting/6f4eb04c-67fe-4e09-a077-32460cee7514/page/p_80vhp52mkd"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-[#1565C0] text-xs font-bold rounded-xl transition-colors border border-blue-200 shrink-0 shadow-xs cursor-pointer active:scale-95"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Buka Layar Penuh</span>
              </a>
            </div>
          </div>

          {/* Iframe Looker Studio Container Responsif Mobile Friendly */}
          <div className="w-full overflow-hidden rounded-2xl bg-white border border-slate-200/90 shadow-xs relative">
            {/* Mobile View Notification */}
            <div className="sm:hidden flex items-center justify-between px-3 py-2 bg-blue-50/70 border-b border-blue-100 text-[11px] text-slate-600">
              <span className="font-medium">📱 Tampilan Layar Responsif</span>
              <a
                href="https://datastudio.google.com/embed/reporting/6f4eb04c-67fe-4e09-a077-32460cee7514/page/p_80vhp52mkd"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-[#1565C0] hover:underline inline-flex items-center gap-1"
              >
                <span>Buka Fullscreen</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

            <div className="w-full relative h-[380px] sm:h-[480px] md:h-[560px] lg:h-[620px] overflow-hidden">
              <iframe
                title="Dashboard Pelaporan APBDes Looker Studio Desa Nyurlembang"
                width="100%"
                height="100%"
                src="https://datastudio.google.com/embed/reporting/6f4eb04c-67fe-4e09-a077-32460cee7514/page/p_80vhp52mkd"
                frameBorder="0"
                style={{
                  border: 0,
                  width: '100%',
                  height: '100%',
                  display: 'block'
                }}
                allowFullScreen
                loading="lazy"
                sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                className="w-full h-full block"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Sumber Data: Siskeudes & Google Looker Studio Pemerintah Desa Nyurlembang</span>
            </div>
            <span className="font-mono text-emerald-700 font-semibold text-[11px] bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
              Terverifikasi SPBE Lombok Barat
            </span>
          </div>
        </div>
      )}
    </section>
  );
};
