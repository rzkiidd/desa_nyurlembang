import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { DAFTAR_DUSUN } from '../data/mockData';
import { KelolaBeritaDesa } from './admin/KelolaBeritaDesa';
import { KelolaUmkmDesa } from './admin/KelolaUmkmDesa';
import {
  Newspaper,
  Store,
  Plus,
  Lock,
  Calendar,
  User,
  ShieldAlert,
  Menu,
  X,
  MapPin,
  Phone,
  Clock,
  Sparkles,
  CheckCircle2,
  FileText,
  BookOpen,
  Globe,
  ChevronRight,
  LogOut
} from 'lucide-react';

interface KontributorDashboardProps {
  currentUser: UserProfile;
  onBackToPortal?: () => void;
  onSelectUser?: (user: UserProfile | null) => void;
}

export const KontributorDashboard: React.FC<KontributorDashboardProps> = ({
  currentUser,
  onBackToPortal,
  onSelectUser,
}) => {
  const [activeTab, setActiveTab] = useState<'berita' | 'umkm' | 'agenda' | 'akses_terlarang'>('berita');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Kunci scroll body saat sidebar mobile terbuka
  useEffect(() => {
    if (mobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileSidebarOpen]);

  // Agenda State
  const [agendaList, setAgendaList] = useState([
    {
      id: 'ag-1',
      nama: 'Gotong Royong Bersih Saluran Irigasi Dusun Tatar',
      tanggal: '15 Maret 2026',
      waktu: '07.30 WITA - Selesai',
      lokasi: 'Dusun Tatar',
      dusun: 'Tatar',
      pj: 'Kadus Tatar'
    },
    {
      id: 'ag-2',
      nama: 'Posyandu Balita & Lansia Rutin Dusun Nyurlembang Barat',
      tanggal: '18 Maret 2026',
      waktu: '08.30 - 12.00 WITA',
      lokasi: 'Pustu Nyurlembang Barat',
      dusun: 'Nyurlembang Barat',
      pj: 'Bidan Desa & Kader Posyandu'
    },
    {
      id: 'ag-3',
      nama: 'Pelatihan Kemasan Higienis Gula Aren Organik',
      tanggal: '22 Maret 2026',
      waktu: '09.00 - 14.00 WITA',
      lokasi: 'Aula Pertemuan Kantor Desa',
      dusun: 'Dusun Nyurlembang Daye',
      pj: 'Kelompok Tani Aren Bersatu'
    }
  ]);

  const navItems = [
    { id: 'berita', label: 'Tulis & Kelola Berita', icon: Newspaper, locked: false },
    { id: 'umkm', label: 'Produk UMKM 4 Dusun', icon: Store, locked: false },
    { id: 'agenda', label: 'Agenda Acara Desa', icon: Calendar, locked: false },
    { id: 'akses_terlarang', label: 'Layanan Surat & NIK (RLS)', icon: Lock, locked: true },
  ];

  const currentNavObj = navItems.find((n) => n.id === activeTab);
  const currentTabLabel = currentNavObj?.label || 'Tulis & Kelola Berita';

  return (
    <div className="min-h-screen bg-[#EEF2F6] flex flex-row relative">
      {/* MOBILE BACKDROP DENGAN Z-INDEX TERTINGGI & BLUR */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[999990] lg:hidden animate-in fade-in duration-200"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR KONTRIBUTOR DESA (DEEP NAVY #0D2A4A) */}
      <aside
        className={`w-72 max-w-[85vw] lg:w-64 shrink-0 bg-[#0D2A4A] text-white flex flex-col h-screen sticky top-0 border-r border-blue-950 z-[999999] transition-transform duration-300 ease-in-out ${
          mobileSidebarOpen
            ? 'fixed inset-y-0 left-0 translate-x-0 shadow-2xl overflow-y-auto'
            : '-translate-x-full lg:translate-x-0 fixed lg:sticky'
        }`}
      >
        {/* Logo & Header */}
        <div className="p-4 pb-3 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="Logo Desa Nyurlembang"
              className="w-9 h-9 object-contain drop-shadow-sm"
            />
            <div>
              <div className="text-xs font-extrabold tracking-wide text-white uppercase font-heading">
                DESA NYURLEMBANG
              </div>
              <div className="text-[10px] text-emerald-400 font-semibold">
                Kontributor Publik Warga
              </div>
            </div>
          </div>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg lg:hidden"
            aria-label="Tutup Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile Info Card */}
        <div className="px-4 py-3 border-b border-white/5 bg-white/5 space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-bold text-slate-200 truncate">
              {currentUser.nama_lengkap}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 pl-4 truncate">
            {currentUser.email}
          </div>
          <div className="text-[9px] font-mono text-[#03A9F4] pl-4 uppercase">
            Role: user_biasa (Kontributor)
          </div>
        </div>

        {/* Menu Navigasi Sidebar - Scroll Terpisah */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-1">
            Menu Kontributor
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  setMobileSidebarOpen(false);
                }}
                className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between group ${
                  isActive
                    ? item.locked
                      ? 'bg-rose-950/80 text-rose-200 border-r-4 border-rose-500'
                      : 'bg-[#1565C0] text-white shadow-md border-r-4 border-[#FFB300]'
                    : item.locked
                    ? 'text-slate-400 hover:bg-rose-950/30 hover:text-rose-300'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${
                    isActive ? (item.locked ? 'text-rose-400' : 'text-[#FFB300]') : 'text-slate-400'
                  }`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.locked && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 bg-rose-500/20 text-rose-300 rounded border border-rose-500/30">
                    Terkunci
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3.5 border-t border-white/10 text-[11px] text-slate-400 space-y-2 bg-[#0A223C]">
          {onBackToPortal && (
            <button
              onClick={onBackToPortal}
              className="w-full py-2 px-3 rounded-xl bg-[#2E7D32] hover:bg-[#256629] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-98"
            >
              <Globe className="w-3.5 h-3.5 text-[#FFB300]" />
              <span>Lihat Portal Publik</span>
            </button>
          )}
          <button
            onClick={() => {
              if (onSelectUser) onSelectUser(null);
              if (onBackToPortal) onBackToPortal();
            }}
            className="w-full py-1.5 px-3 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-rose-500/30"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar dari Kontributor</span>
          </button>
          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
            <span className="text-slate-300 font-semibold">Ruang Kontribusi</span>
            <span>Desa Mandiri</span>
          </div>
        </div>
      </aside>

      {/* AREA KANAN: TOP BAR ADMIN MANDIRI + WORKSPACE KONTEN */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-[#EEF2F6]">
        {/* TOP BAR ADMIN MANDIRI */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 px-4 sm:px-6 py-3 flex items-center justify-between shadow-xs">
          {/* Kiri: Hamburger Mobile + Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-[#0D2A4A] hover:bg-slate-100 transition-colors"
              aria-label="Buka Menu Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-slate-500 hidden sm:inline">Workspace Kontributor</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
              <span className="font-extrabold text-[#0D2A4A] font-heading">{currentTabLabel}</span>
            </div>
          </div>

          {/* Kanan: Profil Ringkas + Tombol [Lihat Portal Publik] + [Keluar] */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100/90 rounded-xl text-xs border border-slate-200/60">
              <div className="w-6 h-6 rounded-lg bg-emerald-700 text-white font-black flex items-center justify-center text-[10px]">
                {currentUser.nama_lengkap.slice(0, 2).toUpperCase()}
              </div>
              <div className="leading-tight">
                <div className="font-bold text-[#0D2A4A] text-[11px] truncate max-w-[130px]">
                  {currentUser.nama_lengkap}
                </div>
                <div className="text-[9px] text-emerald-600 font-semibold">Kontributor Warga</div>
              </div>
            </div>

            {onBackToPortal && (
              <button
                onClick={onBackToPortal}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#2E7D32] hover:bg-[#256629] text-white text-xs font-bold shadow-xs transition-all active:scale-95"
              >
                <Globe className="w-3.5 h-3.5 text-[#FFB300]" />
                <span className="hidden sm:inline">Lihat Portal</span>
                <span className="sm:hidden">Portal</span>
              </button>
            )}

            <button
              onClick={() => {
                if (onSelectUser) onSelectUser(null);
                if (onBackToPortal) onBackToPortal();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
              title="Keluar dari Akun Kontributor"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </header>

        {/* MAIN WORKSPACE CANVAS */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
        {/* TAB 1: KELOLA BERITA DENGAN RICHTEXTEDITOR */}
        {activeTab === 'berita' && (
          <div className="card-kedinasan p-6">
            <KelolaBeritaDesa currentUser={currentUser} />
          </div>
        )}

        {/* TAB 2: POTENSI UMKM 4 DUSUN (TERHUBUNG KE SUPABASE REALTIME & DATABASE) */}
        {activeTab === 'umkm' && (
          <KelolaUmkmDesa currentUser={currentUser} />
        )}

        {/* TAB 3: AGENDA ACARA DESA */}
        {activeTab === 'agenda' && (
          <div className="card-kedinasan p-6 space-y-6">
            <div className="pb-4 border-b border-slate-100">
              <h2 className="text-xl font-bold text-[#0D2A4A] font-heading flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#1565C0]" />
                <span>Kalender Agenda Kegiatan Warga</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Jadwal gotong royong, posyandu, dan pertemuan musyawarah dusun di Desa Nyurlembang.
              </p>
            </div>

            <div className="space-y-3">
              {agendaList.map((ag) => (
                <div
                  key={ag.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#1565C0] transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-[#1565C0] font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{ag.tanggal} • {ag.waktu}</span>
                    </div>
                    <h3 className="font-bold text-sm text-[#0D2A4A]">{ag.nama}</h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{ag.lokasi}</span>
                      </span>
                      <span>•</span>
                      <span>PJ: {ag.pj}</span>
                    </div>
                  </div>

                  <span className="px-3 py-1 bg-blue-50 text-[#1565C0] rounded-full text-xs font-bold self-start sm:self-center border border-blue-200">
                    {ag.dusun}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: DEMO BATAS RLS / AKSES DITOLAK UNTUK ROLE USER_BIASA */}
        {activeTab === 'akses_terlarang' && (
          <div className="card-kedinasan p-8 border border-rose-200">
            <div className="max-w-2xl mx-auto text-center space-y-4">
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                <Lock className="w-8 h-8" />
              </div>

              <h2 className="text-xl font-black text-[#0D2A4A] font-heading">
                Akses Ditolak: Fitur Khusus Staf Pelayanan Desa
              </h2>

              <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                Akun Anda memiliki izin peran <code className="bg-slate-100 px-2 py-0.5 rounded font-mono text-rose-700 font-bold">user_biasa</code>. 
                Sesuai undang-undang perlindungan data pribadi kependudukan dan kebijakan Supabase Row-Level Security (RLS), menu permohonan surat, verifikasi berkas KTP/KK pemohon, dan buku register desa hanya dapat dibuka oleh operator bersertifikasi <code className="bg-slate-100 px-2 py-0.5 rounded font-mono text-[#1565C0] font-bold">staff_desa</code>.
              </p>

              <div className="p-4 bg-slate-900 text-left rounded-xl font-mono text-xs text-emerald-400 space-y-1">
                <div className="text-slate-500">-- Supabase PostgreSQL RLS Policy Enforcement:</div>
                <div className="text-rose-400 font-bold">ERROR: 42501 permission denied for table public.permohonan_surat</div>
                <div className="text-slate-400">DETAIL: Policy "Staff desa full crud permohonan_surat" returned FALSE for auth.uid().</div>
                <div className="text-slate-400">Storage API: 403 Forbidden on bucket /dokumen-persyaratan/*</div>
              </div>

              <div className="text-xs text-slate-500">
                Untuk mengajukan surat mandiri sebagai warga, silakan gunakan menu publik "Ajukan Surat".
              </div>
            </div>
          </div>
        )}
        </main>
      </div>
    </div>
  );
};
