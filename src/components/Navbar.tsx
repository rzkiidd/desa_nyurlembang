import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { UserProfile } from '../types';
import { MOCK_USERS } from '../data/mockData';
import { getStoredPengaturanDesa, getStoredUsers, authenticateUser } from '../lib/supabaseClient';
import {
  Phone,
  Mail,
  Globe,
  ShieldCheck,
  ChevronDown,
  Menu,
  X,
  User,
  Building2,
  FileText,
  Search,
  LayoutDashboard,
  Database,
  ExternalLink,
  Sparkles,
  ChevronRight,
  Landmark,
  FileCheck2,
  PieChart,
  Camera,
  Layers,
  MapPin,
  Clock,
  AlertCircle,
  MessageSquare,
  Eye,
  EyeOff,
  LogIn,
  KeyRound
} from 'lucide-react';

interface NavbarProps {
  currentView: 'portal' | 'permohonan' | 'pelacakan' | 'dashboard' | 'sql' | 'cetak' | 'pemerintahan' | 'pengaduan' | 'detail_berita' | 'detail_umkm' | 'struktur_organisasi' | 'profil_lengkap' | 'jdih';
  onNavigate: (view: 'portal' | 'permohonan' | 'pelacakan' | 'dashboard' | 'sql' | 'pemerintahan' | 'pengaduan' | 'detail_berita' | 'detail_umkm' | 'struktur_organisasi' | 'profil_lengkap' | 'jdih', subSection?: string) => void;
  currentUser: UserProfile | null;
  onSelectUser: (user: UserProfile | null) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  currentUser,
  onSelectUser,
}) => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileAccordion, setMobileAccordion] = useState<string | null>(null);
  const [pengaturan, setPengaturan] = useState(getStoredPengaturanDesa());

  // State Modal Login (Terbuka saat double-click logo/tulisan desa)
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [detectedRole, setDetectedRole] = useState<'staff_desa' | 'user_biasa' | null>(null);
  const [detectedUserName, setDetectedUserName] = useState<string>('');

  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPengaturan(getStoredPengaturanDesa());
  }, []);

  // Otomatis deteksi peran (Staf Desa vs Kontributor) saat mengetik username
  useEffect(() => {
    const term = loginUsername.trim().toLowerCase();
    if (!term) {
      setDetectedRole(null);
      setDetectedUserName('');
      return;
    }

    const allUsers = getStoredUsers();
    const matched = allUsers.find(
      (u) =>
        u.username?.toLowerCase() === term ||
        u.email.toLowerCase() === term
    );

    if (matched) {
      setDetectedRole(matched.role);
      setDetectedUserName(matched.nama_lengkap);
    } else {
      if (term.includes('staff') || term.includes('admin') || term.includes('sekdes') || term.includes('kades')) {
        setDetectedRole('staff_desa');
        setDetectedUserName('Staf Desa');
      } else if (term.includes('kontrib') || term.includes('penulis') || term.includes('jurnalis')) {
        setDetectedRole('user_biasa');
        setDetectedUserName('Kontributor Berita');
      } else {
        setDetectedRole(null);
        setDetectedUserName('');
      }
    }
  }, [loginUsername]);

  // Kunci scroll body saat drawer mobile terbuka untuk mencegah layout slip
  useEffect(() => {
    if (mobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileDrawerOpen]);

  // Listener Escape key dan Window Resize untuk menutup drawer mobile dengan aman
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileDrawerOpen(false);
        setActiveDropdown(null);
      }
    };
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileDrawerOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Tutup floating popover saat klik di luar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubMenuClick = (action: () => void) => {
    action();
    setActiveDropdown(null);
    setMobileDrawerOpen(false);
  };

  const toggleDropdown = (name: string) => {
    setActiveDropdown((prev) => (prev === name ? null : name));
  };

  return (
    <header className={`sticky top-0 bg-white/95 backdrop-blur-md shadow-xs border-b border-slate-200/80 no-print font-sans transition-all ${mobileDrawerOpen ? 'z-[999999]' : 'z-40'}`} ref={navRef}>
      {/* 1. TOP BAR KEDINASAN RESMI */}
      <div className="bg-[#0D2A4A] text-slate-100 text-xs py-2 border-b border-blue-950">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[11px] sm:text-xs">
            <span className="flex items-center gap-1.5 font-semibold text-[#FFB300]">
              <Phone className="w-3.5 h-3.5 text-[#FFB300]" />
              <span>081805554899 ( KPPID )</span>
            </span>
            <span className="text-slate-500 hidden sm:inline">|</span>
            <a
              href="mailto:desanyurlembang.id@gmail.com"
              className="flex items-center gap-1.5 text-slate-200 hover:text-white transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-[#03A9F4]" />
              <span>desanyurlembang.id@gmail.com</span>
            </a>
          </div>

          <div className="flex items-center gap-2">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-900/60 hover:bg-blue-800 text-slate-200 hover:text-white text-[11px] font-semibold border border-blue-700/50 transition-colors shadow-xs cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{currentUser.role === 'staff_desa' ? 'Panel Staf' : 'Panel Kontributor'}</span>
                </button>
                <button
                  onClick={() => onSelectUser(null)}
                  className="text-[11px] text-rose-300 hover:text-rose-100 font-semibold px-2 py-0.5 rounded-md hover:bg-rose-950/40 transition-colors cursor-pointer"
                  title="Keluar dari sesi"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <button
                onClick={() => setLoginModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-900/60 hover:bg-blue-800 text-slate-200 hover:text-white text-[11px] font-semibold border border-blue-700/50 transition-colors shadow-xs cursor-pointer"
                title="Masuk ke Sistem Administrasi Desa"
              >
                <LogIn className="w-3 h-3 text-[#FFB300]" />
                <span>Masuk Aparatur</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. HEADER CONTAINER (LOGO & NAVIGASI FLOATING DROPDOWN) */}
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-3">
        <div className="flex items-center justify-between">
          {/* Logo & Identitas Desa (Klik 2x untuk membuka Login Staf/Kontributor) */}
          <div
            onClick={() => onNavigate('portal')}
            onDoubleClick={(e) => {
              e.stopPropagation();
              setLoginModalOpen(true);
              setLoginError(null);
            }}
            title="Klik 2x logo atau tulisan untuk Login Staf Desa / Kontributor"
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <img
              src="/logo.png"
              alt="Logo Desa Nyurlembang"
              className="w-11 h-11 object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
              onDoubleClick={(e) => {
                e.stopPropagation();
                setLoginModalOpen(true);
                setLoginError(null);
              }}
            />
            <div>
              <h1
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setLoginModalOpen(true);
                  setLoginError(null);
                }}
                className="font-heading font-black text-[#0D2A4A] text-base sm:text-lg tracking-tight leading-none uppercase"
              >
                DESA NYURLEMBANG
              </h1>
            </div>
          </div>

          {/* Desktop Navigation Menu (Floating Popover Dropdowns) */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold">
            {/* 1. Beranda */}
            <button
              onClick={() => onNavigate('portal')}
              className={`px-3 py-2 rounded-xl transition-all cursor-pointer ${
                currentView === 'portal'
                  ? 'bg-blue-50 text-[#1565C0] font-bold'
                  : 'text-[#0D2A4A] hover:text-[#1565C0] hover:bg-slate-100/60'
              }`}
            >
              Beranda
            </button>

            {/* 2. Profil Desa Dropdown */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('profil')}
                className={`px-3 py-2 rounded-xl flex items-center gap-1 transition-all cursor-pointer ${
                  currentView === 'profil_lengkap' || activeDropdown === 'profil'
                    ? 'bg-blue-50 text-[#1565C0] font-bold shadow-xs'
                    : 'text-[#0D2A4A] hover:text-[#1565C0] hover:bg-slate-100/60'
                }`}
              >
                <span>Profil Desa</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === 'profil' ? 'rotate-180 text-[#1565C0]' : 'text-slate-400'}`} />
              </button>

              {activeDropdown === 'profil' && (
                <div className="absolute left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <button
                    onClick={() => handleSubMenuClick(() => onNavigate('profil_lengkap', 'tentang'))}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-blue-50 text-slate-700 hover:text-[#1565C0] transition-colors cursor-pointer"
                  >
                    Tentang Kami
                  </button>
                  <button
                    onClick={() => handleSubMenuClick(() => onNavigate('profil_lengkap', 'visi-misi'))}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-blue-50 text-slate-700 hover:text-[#1565C0] transition-colors cursor-pointer"
                  >
                    Visi & Misi
                  </button>
                  <button
                    onClick={() => handleSubMenuClick(() => onNavigate('profil_lengkap', 'sejarah'))}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-blue-50 text-slate-700 hover:text-[#1565C0] transition-colors cursor-pointer"
                  >
                    Sejarah Desa
                  </button>
                  <button
                    onClick={() => handleSubMenuClick(() => onNavigate('profil_lengkap', 'geografis'))}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-blue-50 text-slate-700 hover:text-[#1565C0] transition-colors cursor-pointer"
                  >
                    Geografis Wilayah
                  </button>
                  <button
                    onClick={() => handleSubMenuClick(() => onNavigate('profil_lengkap', 'dusun'))}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-blue-50 text-[#1565C0] font-semibold transition-colors cursor-pointer"
                  >
                    Demografi & 4 Dusun
                  </button>
                </div>
              )}
            </div>

            {/* 3. Pemerintahan (Bisa Diklik Langsung atau Dropdown Menuju Halaman Pemerintahan) */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('pemerintahan')}
                className={`px-3 py-2 rounded-xl flex items-center gap-1 transition-all cursor-pointer ${
                  currentView === 'pemerintahan' || activeDropdown === 'pemerintahan'
                    ? 'bg-blue-50 text-[#1565C0] font-bold shadow-xs'
                    : 'text-[#0D2A4A] hover:text-[#1565C0] hover:bg-slate-100/60'
                }`}
              >
                <span>Pemerintahan</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === 'pemerintahan' ? 'rotate-180 text-[#1565C0]' : 'text-slate-400'}`} />
              </button>

              {activeDropdown === 'pemerintahan' && (
                <div className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <button
                    onClick={() => handleSubMenuClick(() => onNavigate('struktur_organisasi'))}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-blue-50 text-[#1565C0] font-bold flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#1565C0]" />
                      <span>Struktur Organisasi (SOTK)</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-[#1565C0]" />
                  </button>
                  <div className="border-t border-slate-100 my-1" />
                  <button
                    onClick={() => handleSubMenuClick(() => onNavigate('pemerintahan'))}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 font-semibold transition-colors cursor-pointer text-xs"
                  >
                    Halaman Pemerintahan & Lembaga
                  </button>
                  <button
                    onClick={() => handleSubMenuClick(() => onNavigate('portal', 'aparatur'))}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer text-xs"
                  >
                    Aparatur & Perangkat Desa
                  </button>
                  <button
                    onClick={() => handleSubMenuClick(() => onNavigate('pemerintahan'))}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer text-xs"
                  >
                    BPD & Lembaga Kemasyarakatan
                  </button>
                </div>
              )}
            </div>

            {/* 4. Pengaduan (Tanpa logo/ikon sesuai arahan) */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('pengaduan')}
                className={`px-3 py-2 rounded-xl flex items-center gap-1 transition-all cursor-pointer ${
                  currentView === 'pengaduan' || activeDropdown === 'pengaduan'
                    ? 'bg-amber-50 text-amber-900 font-bold shadow-xs'
                    : 'text-[#0D2A4A] hover:text-amber-800 hover:bg-slate-100/60'
                }`}
              >
                <span>Pengaduan</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === 'pengaduan' ? 'rotate-180 text-amber-700' : 'text-slate-400'}`} />
              </button>

              {activeDropdown === 'pengaduan' && (
                <div className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <button
                    onClick={() => handleSubMenuClick(() => onNavigate('pengaduan'))}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-amber-50 text-amber-900 font-bold flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-amber-600" />
                      <span>Formulir Pengaduan Warga</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-amber-700" />
                  </button>

                  <button
                    onClick={() => handleSubMenuClick(() => onNavigate('pelacakan'))}
                    className="w-full text-left px-3.5 py-2 rounded-xl hover:bg-slate-50 text-slate-700 font-medium flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-slate-500" />
                      <span>Lacak Status Tiket</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <div className="border-t border-slate-100 my-1" />

                  <a
                    href="https://www.lapor.go.id/instansi/pemerintah-kabupaten-lombok-barat"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full text-left px-3.5 py-2 rounded-xl hover:bg-slate-50 text-slate-600 hover:text-slate-900 flex items-center justify-between text-xs transition-colors"
                  >
                    <span>SP4N LAPOR! Lobar</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                </div>
              )}
            </div>

            {/* 5. Informasi Dropdown */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('informasi')}
                className={`px-3 py-2 rounded-xl flex items-center gap-1 transition-all cursor-pointer ${
                  activeDropdown === 'informasi'
                    ? 'bg-blue-50 text-[#1565C0] font-bold shadow-xs'
                    : 'text-[#0D2A4A] hover:text-[#1565C0] hover:bg-slate-100/60'
                }`}
              >
                <span>Informasi</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === 'informasi' ? 'rotate-180 text-[#1565C0]' : 'text-slate-400'}`} />
              </button>

              {activeDropdown === 'informasi' && (
                <div className="absolute left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <button
                    onClick={() => handleSubMenuClick(() => onNavigate('portal', 'berita'))}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-blue-50 text-slate-700 hover:text-[#1565C0] transition-colors cursor-pointer"
                  >
                    Kabar & Berita Desa
                  </button>
                  <button
                    onClick={() => handleSubMenuClick(() => onNavigate('portal', 'umkm'))}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-blue-50 text-slate-700 hover:text-[#1565C0] transition-colors cursor-pointer"
                  >
                    Potensi & UMKM 4 Dusun
                  </button>
                  <button
                    onClick={() => handleSubMenuClick(() => onNavigate('portal', 'galeri'))}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-blue-50 text-slate-700 hover:text-[#1565C0] transition-colors cursor-pointer"
                  >
                    Galeri Dokumentasi Foto
                  </button>
                  <button
                    onClick={() => handleSubMenuClick(() => onNavigate('portal', 'apbdes'))}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-blue-50 text-[#1565C0] font-bold transition-colors cursor-pointer"
                  >
                    Transparansi APBDes 2026
                  </button>
                  <div className="border-t border-slate-100 my-1" />
                  <button
                    onClick={() => handleSubMenuClick(() => onNavigate('jdih'))}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-purple-50 text-purple-900 font-bold transition-colors cursor-pointer"
                  >
                    Produk Hukum Desa (JDIH)
                  </button>
                </div>
              )}
            </div>

            {/* 6. Tombol Buat Surat Mandiri */}
            <button
              onClick={() => onNavigate('permohonan')}
              className="ml-2 px-4 py-2 bg-[#2E7D32] hover:bg-[#256629] text-white font-bold rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-[#FFB300]" />
              <span>Buat Surat</span>
            </button>

            {/* 7. Dashboard Button (Jika Sedang Login Staf / Kontributor) */}
            {currentUser && (
              <button
                onClick={() => onNavigate('dashboard')}
                className={`ml-1 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 font-bold cursor-pointer ${
                  currentView === 'dashboard'
                    ? 'bg-[#0D2A4A] text-white shadow-xs'
                    : 'bg-slate-100 text-[#0D2A4A] hover:bg-slate-200'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-[#03A9F4]" />
                <span>Dashboard</span>
              </button>
            )}
          </nav>

          {/* Mobile Hamburger Button */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => onNavigate('permohonan')}
              className="px-3 py-1.5 rounded-xl bg-[#2E7D32] text-white text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 transition-transform"
            >
              <FileText className="w-3 h-3 text-[#FFB300]" />
              <span>Surat</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileDrawerOpen((prev) => !prev)}
              className="p-2 rounded-xl text-[#0D2A4A] hover:bg-slate-100 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
              aria-label={mobileDrawerOpen ? 'Tutup Menu Navigasi' : 'Buka Menu Navigasi'}
              aria-expanded={mobileDrawerOpen}
            >
              {mobileDrawerOpen ? (
                <X className="w-6 h-6 text-[#1565C0]" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 3. MOBILE SLIDE-OVER DRAWER (ELEGAN, ISOLASI TINGGI Z-INDEX, TIDAK BENTROK) */}
      {typeof document !== 'undefined' &&
        createPortal(
          <div className="lg:hidden">
            {/* 1. Backdrop Gelap Penutup Layar Penuh */}
            {mobileDrawerOpen && (
              <div
                className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[99990]"
                onClick={() => setMobileDrawerOpen(false)}
                aria-hidden="true"
              />
            )}

            {/* 2. Panel Drawer Menu Seluler */}
            <aside
              className={`fixed inset-y-0 right-0 w-[85%] max-w-sm h-full bg-white shadow-2xl z-[99999] flex flex-col overflow-y-auto transform transition-transform duration-300 ease-in-out ${
                mobileDrawerOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
              }`}
              aria-label="Menu Navigasi Seluler"
            >
              {/* Drawer Header */}
              <div className="sticky top-0 p-4 bg-[#0D2A4A] text-white flex items-center justify-between border-b border-blue-950 z-10 shrink-0">
                <div className="flex items-center gap-2.5">
                  <img
                    src="/logo.png"
                    alt="Logo Desa Nyurlembang"
                    className="w-8 h-8 object-contain"
                  />
                  <div>
                    <div className="font-heading font-black text-sm uppercase leading-tight">Desa Nyurlembang</div>
                    <div className="text-[10px] text-slate-300">Sistem Informasi SPBE</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white hover:bg-blue-900/60 rounded-lg cursor-pointer transition-colors active:scale-95"
                  aria-label="Tutup Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Navigation List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
              {/* Beranda Utama Desa */}
              <button
                type="button"
                onClick={() => handleSubMenuClick(() => onNavigate('portal'))}
                className={`w-full p-3 font-bold rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                  currentView === 'portal'
                    ? 'bg-blue-50 text-[#1565C0] border border-blue-200'
                    : 'bg-slate-50 text-[#0D2A4A] hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#1565C0]" />
                  <span>Beranda Utama Desa</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* Tombol Buat Surat Mandiri */}
              <button
                onClick={() => handleSubMenuClick(() => onNavigate('permohonan'))}
                className="w-full p-3 bg-[#2E7D32] text-white font-bold rounded-xl flex items-center justify-between shadow-xs cursor-pointer active:scale-98 transition-transform"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#FFB300]" />
                  <span>Buat Surat Mandiri</span>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-200" />
              </button>

              {/* Struktur Organisasi (SOTK) */}
              <button
                onClick={() => handleSubMenuClick(() => onNavigate('struktur_organisasi'))}
                className={`w-full p-3 font-bold rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                  currentView === 'struktur_organisasi'
                    ? 'bg-blue-100 text-[#1565C0] border-blue-300'
                    : 'bg-blue-50 text-[#1565C0] border-blue-200 hover:bg-blue-100/70'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#1565C0]" />
                  <span>Struktur Organisasi (SOTK)</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#1565C0]" />
              </button>

              {/* Menu Pemerintahan Desa */}
              <button
                onClick={() => handleSubMenuClick(() => onNavigate('pemerintahan'))}
                className="w-full p-3 bg-slate-50 text-slate-800 font-bold rounded-xl border border-slate-200 hover:bg-slate-100 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-[#1565C0]" />
                  <span>Halaman Pemerintahan & Lembaga</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* Menu Pengaduan Warga (Tanpa logo/ikon sesuai arahan) */}
              <button
                onClick={() => handleSubMenuClick(() => onNavigate('pengaduan'))}
                className="w-full p-3 bg-amber-50 text-amber-900 font-bold rounded-xl border border-amber-200 flex items-center justify-between cursor-pointer"
              >
                <span>Layanan Pengaduan Warga</span>
                <ChevronRight className="w-4 h-4 text-amber-700" />
              </button>

              {/* Lacak Tiket */}
              <button
                onClick={() => handleSubMenuClick(() => onNavigate('pelacakan'))}
                className="w-full p-3 bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-[#FFB300]" />
                  <span>Lacak Status Tiket Surat</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* Accordion 1: Profil Desa */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setMobileAccordion(mobileAccordion === 'profil' ? null : 'profil')}
                  className="w-full p-3 bg-slate-50 font-bold text-[#0D2A4A] flex items-center justify-between cursor-pointer"
                >
                  <span>Profil Desa</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${mobileAccordion === 'profil' ? 'rotate-180 text-[#1565C0]' : 'text-slate-400'}`} />
                </button>
                {mobileAccordion === 'profil' && (
                  <div className="p-2 space-y-1 bg-white border-t border-slate-100">
                    <button
                      onClick={() => handleSubMenuClick(() => onNavigate('profil_lengkap', 'tentang'))}
                      className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer"
                    >
                      Tentang Kami
                    </button>
                    <button
                      onClick={() => handleSubMenuClick(() => onNavigate('profil_lengkap', 'visi-misi'))}
                      className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer"
                    >
                      Visi & Misi
                    </button>
                    <button
                      onClick={() => handleSubMenuClick(() => onNavigate('profil_lengkap', 'sejarah'))}
                      className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer"
                    >
                      Sejarah Desa
                    </button>
                    <button
                      onClick={() => handleSubMenuClick(() => onNavigate('profil_lengkap', 'geografis'))}
                      className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer"
                    >
                      Geografis Wilayah
                    </button>
                    <button
                      onClick={() => handleSubMenuClick(() => onNavigate('profil_lengkap', 'dusun'))}
                      className="w-full text-left px-3 py-2 text-[#1565C0] font-semibold hover:bg-blue-50 rounded-lg cursor-pointer"
                    >
                      Demografi & 4 Dusun
                    </button>
                  </div>
                )}
              </div>

              {/* Accordion 2: Informasi & Publikasi */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setMobileAccordion(mobileAccordion === 'informasi' ? null : 'informasi')}
                  className="w-full p-3 bg-slate-50 font-bold text-[#0D2A4A] flex items-center justify-between cursor-pointer"
                >
                  <span>Informasi & Publikasi</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${mobileAccordion === 'informasi' ? 'rotate-180 text-[#1565C0]' : 'text-slate-400'}`} />
                </button>
                {mobileAccordion === 'informasi' && (
                  <div className="p-2 space-y-1 bg-white border-t border-slate-100">
                    <button
                      onClick={() => handleSubMenuClick(() => onNavigate('portal', 'berita'))}
                      className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer"
                    >
                      Kabar & Berita Desa
                    </button>
                    <button
                      onClick={() => handleSubMenuClick(() => onNavigate('portal', 'umkm'))}
                      className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer"
                    >
                      Potensi & UMKM 4 Dusun
                    </button>
                    <button
                      onClick={() => handleSubMenuClick(() => onNavigate('portal', 'galeri'))}
                      className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer"
                    >
                      Galeri Dokumentasi Foto
                    </button>
                  </div>
                )}
              </div>

              {/* Direct links */}
              <button
                onClick={() => handleSubMenuClick(() => onNavigate('portal', 'apbdes'))}
                className="w-full text-left p-3 rounded-xl border border-slate-200 font-bold text-[#0D2A4A] hover:bg-slate-50 cursor-pointer"
              >
                Transparansi APBDes 2026
              </button>

              <button
                onClick={() => handleSubMenuClick(() => onNavigate('jdih'))}
                className="w-full text-left p-3 rounded-xl border border-purple-200 bg-purple-50/50 font-bold text-purple-950 hover:bg-purple-100/60 cursor-pointer flex items-center justify-between"
              >
                <span>Produk Hukum Desa (JDIH)</span>
                <ChevronRight className="w-4 h-4 text-purple-700" />
              </button>

              {currentUser && (
                <button
                  onClick={() => handleSubMenuClick(() => onNavigate('dashboard'))}
                  className="w-full text-left p-3 rounded-xl bg-[#0D2A4A] text-white font-bold flex items-center gap-2 cursor-pointer"
                >
                  <LayoutDashboard className="w-4 h-4 text-[#03A9F4]" />
                  <span>
                    {currentUser.role === 'staff_desa' ? 'Buka Dashboard Staf' : 'Buka Dashboard Kontributor'}
                  </span>
                </button>
              )}

              {/* Kontak Darurat Box */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-2 mt-4">
                <div className="text-[11px] font-bold text-[#0D2A4A] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#1565C0]" />
                  <span>Loket & Jam Layanan</span>
                </div>
                <div className="text-[11px] text-slate-600">
                  Senin - Jumat: 08.00 - 15.30 WITA
                </div>
                <div className="text-[11px] text-[#1565C0] font-mono font-bold">
                  Hotline: 081805554899 (KPPID)
                </div>
              </div>
            </div>
          </aside>
        </div>,
        document.body
      )}

      {/* 4. MODAL LOGIN STAF DESA & KONTRIBUTOR (MUNCUL SAAT KLIK 2X LOGO/TULISAN DESA) */}
      {loginModalOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setLoginModalOpen(false)}
          >
            <div
              className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Modal */}
              <div className="p-6 bg-gradient-to-r from-[#0D2A4A] to-[#1565C0] text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xs p-2 flex items-center justify-center border border-white/20 shrink-0">
                    <img src="/logo.png" alt="Logo Desa" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h3 className="font-heading font-black text-base text-white tracking-tight uppercase">
                      Masuk Sistem Desa
                    </h3>
                    <p className="text-xs text-blue-100">
                      Login Staf Desa & Kontributor Berita
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setLoginModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Body */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!loginUsername.trim() || !loginPassword.trim()) {
                    setLoginError('Silakan masukkan username dan password.');
                    return;
                  }
                  const user = authenticateUser(loginUsername, loginPassword);
                  if (user) {
                    onSelectUser(user);
                    onNavigate('dashboard');
                    setLoginModalOpen(false);
                    setLoginUsername('');
                    setLoginPassword('');
                    setLoginError(null);
                  } else {
                    setLoginError('Username atau kata sandi tidak cocok. Silakan periksa kembali!');
                  }
                }}
                className="p-6 space-y-4"
              >
                {/* Auto Detection Role Banner */}
                <div
                  className={`p-3.5 rounded-2xl border transition-all ${
                    detectedRole === 'staff_desa'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : detectedRole === 'user_biasa'
                      ? 'bg-blue-50 border-blue-300 text-[#1565C0]'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-bold">
                    {detectedRole === 'staff_desa' ? (
                      <>
                        <ShieldCheck className="w-4 h-4 text-[#2E7D32]" />
                        <span>Terdeteksi: Staf Desa (Admin SPBE)</span>
                      </>
                    ) : detectedRole === 'user_biasa' ? (
                      <>
                        <FileCheck2 className="w-4 h-4 text-[#1565C0]" />
                        <span>Terdeteksi: Kontributor Berita Desa</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4 text-slate-400" />
                        <span>Deteksi Peran Otomatis</span>
                      </>
                    )}
                  </div>
                  <p className="text-[11px] mt-1 opacity-90">
                    {detectedRole === 'staff_desa'
                      ? `Selamat datang ${detectedUserName || 'Staf Desa'}! Anda akan diarahkan ke Dashboard Verifikasi Surat, Buku Register, dan Manajemen Desa.`
                      : detectedRole === 'user_biasa'
                      ? `Selamat datang ${detectedUserName || 'Kontributor'}! Anda akan diarahkan ke Dashboard Penulisan & Publikasi Berita Desa.`
                      : 'Masukkan username atau password. Sistem akan langsung mengenali hak akses Anda secara otomatis.'}
                  </p>
                </div>

                {/* Error Message */}
                {loginError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{loginError}</span>
                  </div>
                )}

                {/* Input Username */}
                <div>
                  <label className="block text-xs font-bold text-[#0D2A4A] mb-1">
                    Username atau Email Akun
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={loginUsername}
                      onChange={(e) => {
                        setLoginUsername(e.target.value);
                        setLoginError(null);
                      }}
                      placeholder="Contoh: staff / kontributor"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#1565C0] focus:ring-2 focus:ring-blue-100 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Input Password */}
                <div>
                  <label className="block text-xs font-bold text-[#0D2A4A] mb-1">
                    Kata Sandi (Password)
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => {
                        setLoginPassword(e.target.value);
                        setLoginError(null);
                      }}
                      placeholder="Masukkan kata sandi..."
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#1565C0] focus:ring-2 focus:ring-blue-100 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Quick Auto-Fill Demo Chips */}
                <div className="pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Kredensial Cepat (Klik untuk Isi):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setLoginUsername('staff');
                        setLoginPassword('staff123');
                        setLoginError(null);
                      }}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <ShieldCheck className="w-3 h-3 text-[#2E7D32]" />
                      <span>Staf Desa (staff)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLoginUsername('kontributor');
                        setLoginPassword('kontributor123');
                        setLoginError(null);
                      }}
                      className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-[#1565C0] border border-blue-200 rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <FileCheck2 className="w-3 h-3 text-[#1565C0]" />
                      <span>Kontributor (kontributor)</span>
                    </button>
                  </div>
                </div>

                {/* Tombol Aksi */}
                <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setLoginModalOpen(false)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#1565C0] hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-95"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Masuk ke Sistem</span>
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </header>
  );
};
