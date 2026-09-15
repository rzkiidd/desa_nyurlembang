import React, { useState, useEffect } from 'react';
import { PejabatDesa } from '../types';
import { getStoredPejabatDesa } from '../lib/supabaseClient';
import { INITIAL_PEJABAT_DESA } from '../data/mockData';
import {
  Users,
  ShieldCheck,
  ArrowLeft,
  Building,
  CheckCircle2,
  Phone,
  Landmark,
  Share2,
  Printer,
  Sparkles,
  Info
} from 'lucide-react';

interface StrukturOrganisasiViewProps {
  onBack: () => void;
  onNavigate?: (view: 'permohonan' | 'pelacakan' | 'pemerintahan') => void;
}

export const StrukturOrganisasiView: React.FC<StrukturOrganisasiViewProps> = ({
  onBack,
  onNavigate,
}) => {
  const [pejabatList, setPejabatList] = useState<PejabatDesa[]>([]);

  useEffect(() => {
    const data = getStoredPejabatDesa();
    setPejabatList(data.length > 0 ? data : INITIAL_PEJABAT_DESA);

    const handleStorageChange = () => {
      setPejabatList(getStoredPejabatDesa());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Helper matching function
  const findPejabat = (keywords: string[]): PejabatDesa => {
    for (const kw of keywords) {
      const found = pejabatList.find((p) =>
        p.jabatan.toLowerCase().includes(kw.toLowerCase())
      );
      if (found) return found;
    }
    // Fallback search in initial list
    for (const kw of keywords) {
      const fallback = INITIAL_PEJABAT_DESA.find((p) =>
        p.jabatan.toLowerCase().includes(kw.toLowerCase())
      );
      if (fallback) return fallback;
    }
    return {
      id: 'default',
      nama: 'Nama Aparatur',
      jabatan: keywords[0],
      foto_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80',
      nip: 'NIP/NIPD: -',
      urutan: 99,
    };
  };

  const kades = findPejabat(['Kepala Desa', 'Kades']);
  const bpd = findPejabat(['Ketua BPD', 'BPD']);
  const sekdes = findPejabat(['Sekretaris Desa', 'Sekdes']);

  // Pelaksana Teknis (Kiri - Kuning)
  const kasiPem = findPejabat(['Kasi Pemerintahan', 'Pemerintahan']);
  const kasiEkbang = findPejabat(['Kasi Ekbang', 'Pembangunan', 'Ekonomi & Pembangunan']);
  const kasiKessos = findPejabat(['Kasi Kessos', 'Kesejahteraan Sosial', 'Pelayanan']);

  // Pelaksana Administrasi (Kanan - Kuning)
  const kaurKeu = findPejabat(['Kaur Keuangan', 'Bendahara']);
  const kaurUmum = findPejabat(['Kaur Umum', 'Perencanaan', 'Tata Usaha']);

  // Pelaksana Kewilayahan (Bawah - Biru Laut)
  const kadusDaye = findPejabat(['Kadus Nyurlembang Daye', 'Nyurlembang Daye']);
  const kadusBarat = findPejabat(['Kadus Nyurlembang Barat', 'Nyurlembang Barat']);
  const kadusTelaga = findPejabat(['Kadus Telaga Ngembeng', 'Telaga Ngembeng']);
  const kadusTatar = findPejabat(['Kadus Tatar', 'Tatar']);

  // Sub-component untuk Card Pejabat dalam Diagram
  const PejabatCard = ({
    pejabat,
    customTitle,
    headerColor, // 'red' | 'yellow' | 'blue'
    className = '',
  }: {
    pejabat: PejabatDesa;
    customTitle?: string;
    headerColor: 'red' | 'yellow' | 'blue';
    className?: string;
  }) => {
    const title = customTitle || pejabat.jabatan;

    const headerClass =
      headerColor === 'red'
        ? 'bg-[#B71C1C] text-white'
        : headerColor === 'yellow'
        ? 'bg-[#FFB300] text-slate-950 font-black'
        : 'bg-[#03A9F4] text-white';

    const borderClass =
      headerColor === 'red'
        ? 'border-red-300 shadow-md ring-2 ring-red-100'
        : headerColor === 'yellow'
        ? 'border-amber-300 shadow-md'
        : 'border-blue-300 shadow-sm';

    return (
      <div
        className={`bg-white rounded-xl border ${borderClass} overflow-hidden flex flex-col transition-all hover:scale-[1.02] hover:shadow-lg duration-200 ${className}`}
      >
        {/* Header Jabatan */}
        <div className={`px-2.5 py-1.5 text-center text-xs font-black uppercase tracking-wider ${headerClass} truncate`}>
          {title}
        </div>

        {/* Isi Card: Foto & Nama */}
        <div className="p-3 flex flex-col items-center text-center space-y-2 flex-1 justify-between bg-gradient-to-b from-slate-50/50 to-white">
          <div className="relative">
            <img
              src={pejabat.foto_url || '/logo.png'}
              alt={pejabat.nama}
              className="w-16 h-20 sm:w-18 sm:h-22 object-cover object-top rounded-lg border border-slate-300 shadow-2xs"
              onError={(e) => {
                // Fallback image jika broken
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80';
              }}
            />
            <div className="absolute -bottom-1 -right-1 bg-white p-0.5 rounded-full shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
          </div>

          <div className="space-y-0.5 w-full">
            <h4 className="font-bold text-xs sm:text-sm text-[#0D2A4A] line-clamp-1 leading-snug">
              {pejabat.nama}
            </h4>
            <div className="text-[10px] sm:text-[11px] font-mono text-slate-500 truncate">
              {pejabat.nip || 'NIPD: -'}
            </div>
          </div>

          {pejabat.telepon && (
            <div className="w-full pt-1 border-t border-slate-100 flex items-center justify-center gap-1 text-[10px] text-slate-500">
              <Phone className="w-3 h-3 text-[#1565C0]" />
              <span className="font-mono">{pejabat.telepon}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#EEF2F6] py-8 px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-300">
      {/* Top Header & Breadcrumb */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#0D2A4A] rounded-xl text-xs font-bold transition-all shadow-2xs mb-3 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#1565C0]" />
            <span>Kembali ke Halaman Sebelumnya</span>
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-[#1565C0] text-xs font-bold rounded-full border border-blue-200 ml-2">
            <Landmark className="w-3.5 h-3.5" />
            <span>Susunan Organisasi & Tata Kerja (SOTK)</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[#0D2A4A] font-heading mt-2">
            Bagan Struktur Organisasi Pemerintah Desa Nyurlembang
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Sistem hierarki kepemimpinan, staf pelaksana teknis, administrasi kewilayahan berdasarkan Permendagri No. 84 Tahun 2015. Data tersinkronisasi otomatis dengan Dashboard Admin Desa.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Cetak Bagan</span>
          </button>
        </div>
      </div>

      {/* Legend & Petunjuk Warna */}
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-white/80 backdrop-blur-xs rounded-xl border border-slate-200 text-xs">
        <div className="flex items-center gap-2 text-slate-700 font-bold">
          <Info className="w-4 h-4 text-[#1565C0]" />
          <span>Keterangan Warna Kedinasan:</span>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-[#B71C1C]" />
            <span className="text-slate-700">Pimpinan Utama (Kades & Sekdes)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-[#FFB300]" />
            <span className="text-slate-700">Pelaksana Teknis & Urusan (Kasi & Kaur)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-[#03A9F4]" />
            <span className="text-slate-700">Pelaksana Kewilayahan (Kepala Dusun)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0 border-t-2 border-dashed border-slate-500" />
            <span className="text-slate-700">Garis Koordinasi / Kemitraan (BPD)</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          DIAGRAM POHON ORGANISASI (STANDAR SOTK KEDINASAN DESA)
         ========================================================================= */}
      <div className="max-w-7xl mx-auto bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm overflow-x-auto">
        <div className="min-w-[760px] space-y-8 flex flex-col items-center">

          {/* LEVEL 1: PUCUK PIMPINAN (BPD KIRI - KADES TENGAH) */}
          <div className="w-full relative flex items-center justify-center">
            {/* Box BPD (Kiri) */}
            <div className="absolute left-6 sm:left-16 top-1/2 -translate-y-1/2 w-48 sm:w-56">
              <PejabatCard
                pejabat={bpd}
                customTitle="BADAN PERMUSYAWARATAN DESA (BPD)"
                headerColor="red"
              />
            </div>

            {/* Garis Horizontal Putus-putus Kemitraan BPD <---> Kades */}
            <div className="absolute left-[240px] sm:left-[270px] right-1/2 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-slate-500 flex items-center justify-center">
              <span className="bg-white px-2 py-0.5 text-[9px] font-bold text-slate-500 uppercase tracking-tight rounded-md border border-slate-300 shadow-2xs">
                Mitra Kerja
              </span>
            </div>

            {/* Box KEPALA DESA (Tengah) */}
            <div className="w-56 sm:w-64 z-10">
              <PejabatCard
                pejabat={kades}
                customTitle="KEPALA DESA NYURLEMBANG"
                headerColor="red"
                className="ring-4 ring-red-100"
              />
            </div>
          </div>

          {/* Garis Vertikal Komando: Kades -> Sekdes */}
          <div className="flex flex-col items-center">
            <div className="w-0.5 h-8 bg-slate-800" />
            <div className="w-2.5 h-2.5 rotate-45 border-b-2 border-r-2 border-slate-800 -mt-1" />
          </div>

          {/* LEVEL 2: SEKRETARIS DESA (Pusat Administrasi di Bawah Komando Kades) */}
          <div className="w-56 sm:w-64">
            <PejabatCard
              pejabat={sekdes}
              customTitle="SEKRETARIS DESA"
              headerColor="red"
            />
          </div>

          {/* Garis Cabang Pembagi: Dari Sekdes Membagi ke Kiri (Teknis) dan Kanan (Administrasi) */}
          <div className="w-full flex flex-col items-center">
            {/* Garis vertikal pendek dari Sekdes */}
            <div className="w-0.5 h-6 bg-slate-800" />
            {/* Garis horizontal bentang lebar */}
            <div className="w-[85%] border-t-2 border-slate-800 relative">
              {/* Turunan ke Kiri (Pelaksana Teknis) */}
              <div className="absolute left-[20%] -top-0 w-0.5 h-6 bg-slate-800" />
              {/* Turunan ke Kanan (Pelaksana Urusan) */}
              <div className="absolute right-[20%] -top-0 w-0.5 h-6 bg-slate-800" />
            </div>
          </div>

          {/* LEVEL 3: LAPIS PELAKSANA TEKNIS (KIRI) & LAPIS PELAKSANA ADMINISTRASI (KANAN) */}
          <div className="w-full grid grid-cols-12 gap-6 items-start">
            {/* KOLOM KIRI: LAPIS PELAKSANA TEKNIS (KASI) - 3 KOTAK */}
            <div className="col-span-7 bg-amber-50/60 p-4 rounded-2xl border border-amber-200">
              <div className="text-center mb-3">
                <span className="px-3 py-1 bg-amber-200/80 text-amber-950 font-black text-xs uppercase tracking-wider rounded-full">
                  Pelaksana Teknis (Kasi)
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <PejabatCard
                  pejabat={kasiPem}
                  customTitle="KASI PEMERINTAHAN"
                  headerColor="yellow"
                />
                <PejabatCard
                  pejabat={kasiEkbang}
                  customTitle="KASI EKBANG (PEMBANGUNAN)"
                  headerColor="yellow"
                />
                <PejabatCard
                  pejabat={kasiKessos}
                  customTitle="KASI KESSOS (KESEJAHTERAAN)"
                  headerColor="yellow"
                />
              </div>
            </div>

            {/* KOLOM KANAN: LAPIS PELAKSANA URUSAN (KAUR) - 2 KOTAK */}
            <div className="col-span-5 bg-amber-50/60 p-4 rounded-2xl border border-amber-200">
              <div className="text-center mb-3">
                <span className="px-3 py-1 bg-amber-200/80 text-amber-950 font-black text-xs uppercase tracking-wider rounded-full">
                  Pelaksana Kewilayahan / TU (Kaur)
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <PejabatCard
                  pejabat={kaurKeu}
                  customTitle="KAUR KEUANGAN"
                  headerColor="yellow"
                />
                <PejabatCard
                  pejabat={kaurUmum}
                  customTitle="KAUR UMUM & PERENCANAAN"
                  headerColor="yellow"
                />
              </div>
            </div>
          </div>

          {/* Garis Vertikal Penurunan ke Unsur Kewilayahan */}
          <div className="w-full flex flex-col items-center pt-2">
            <div className="w-0.5 h-6 bg-slate-800" />
            <div className="w-[90%] border-t-2 border-slate-800 relative">
              <div className="absolute left-1/2 -top-2.5 -translate-x-1/2 bg-white px-3 py-0.5 border border-slate-400 text-[10px] font-extrabold uppercase tracking-wider text-slate-700 rounded-full">
                Unsur Kewilayahan
              </div>
            </div>
            <div className="w-0.5 h-6 bg-slate-800" />
          </div>

          {/* LEVEL 4: LAPIS KEWILAYAHAN (4 KEPALA DUSUN - BIRU LAUT) */}
          <div className="w-full bg-blue-50/60 p-5 rounded-2xl border border-blue-200 space-y-4">
            <div className="text-center">
              <span className="px-4 py-1 bg-[#1565C0] text-white font-black text-xs uppercase tracking-widest rounded-full shadow-xs">
                Pelaksana Kewilayahan: 4 Kepala Dusun (Kadus)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <PejabatCard
                pejabat={kadusDaye}
                customTitle="KADUS NYURLEMBANG DAYE"
                headerColor="blue"
              />
              <PejabatCard
                pejabat={kadusBarat}
                customTitle="KADUS NYURLEMBANG BARAT"
                headerColor="blue"
              />
              <PejabatCard
                pejabat={kadusTelaga}
                customTitle="KADUS TELAGA NGEMBENG"
                headerColor="blue"
              />
              <PejabatCard
                pejabat={kadusTatar}
                customTitle="KADUS TATAR"
                headerColor="blue"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Catatan Legalitas & Regulasi */}
      <div className="max-w-7xl mx-auto bg-slate-100 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#1565C0] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-[#0D2A4A]">Dasar Hukum Penyelenggaraan Pemerintahan Desa:</div>
          <p className="leading-relaxed">
            Struktur Organisasi dan Tata Kerja (SOTK) Pemerintah Desa Nyurlembang ditetapkan berdasarkan Undang-Undang Republik Indonesia Nomor 6 Tahun 2014 tentang Desa, Peraturan Menteri Dalam Negeri Nomor 84 Tahun 2015 tentang Susunan Organisasi dan Tata Kerja Pemerintah Desa, serta Peraturan Desa Nyurlembang yang berlaku.
          </p>
        </div>
      </div>
    </div>
  );
};
