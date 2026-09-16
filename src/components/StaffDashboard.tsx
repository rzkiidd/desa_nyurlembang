import React, { useState, useEffect, useRef } from 'react';
import { PermohonanSurat, StatusPermohonan, UserProfile, JenisSurat, PejabatDesa, BannerSlide, PengaturanDesa, SyaratItem } from '../types';
import { useRealtimeSync } from '../lib/useRealtimeSync';
import { RealtimeStatusBadge } from './RealtimeStatusBadge';
import {
  getStoredPermohonan,
  savePermohonanList,
  updateStatusSurat,
  dbFetchPermohonan,
  dbDeletePermohonan,
  getStoredJenisSurat,
  saveStoredJenisSurat,
  dbFetchJenisSurat,
  dbSaveJenisSurat,
  dbDeleteJenisSurat,
  getStoredPejabatDesa,
  saveStoredPejabatDesa,
  dbFetchPejabatDesa,
  dbSavePejabatDesa,
  dbDeletePejabatDesa,
  getStoredBannerSlides,
  saveStoredBannerSlides,
  dbFetchBannerSlides,
  dbSaveBannerSlide,
  dbDeleteBannerSlide,
  getStoredPengaturanDesa,
  saveStoredPengaturanDesa,
  dbFetchPengaturanDesa,
  dbSavePengaturanDesa,
  getStoredPengaduan
} from '../lib/supabaseClient';
import {
  FileText,
  Search,
  Filter,
  Eye,
  Printer,
  CheckCircle2,
  Clock,
  PenTool,
  PackageCheck,
  XCircle,
  ShieldAlert,
  ArrowUpDown,
  BookOpen,
  User,
  Calendar,
  Phone,
  FileCheck,
  AlertTriangle,
  ExternalLink,
  Plus,
  Trash2,
  Edit2,
  Image as ImageIcon,
  Save,
  Users,
  Settings,
  Sliders,
  Check,
  X,
  Camera,
  BarChart3,
  HeartHandshake,
  Menu,
  Newspaper,
  LayoutDashboard,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  Globe,
  Upload,
  Download,
  FileDown,
  Stamp,
  RefreshCw,
  Scale,
  MessageSquare,
  UserPlus,
  LogOut,
  MessageCircle
} from 'lucide-react';
import { KelolaGaleriKegiatan } from './admin/KelolaGaleriKegiatan';
import { KelolaStatistikDesa } from './admin/KelolaStatistikDesa';
import { KelolaBeritaDesa } from './admin/KelolaBeritaDesa';
import { KelolaProdukHukum } from './admin/KelolaProdukHukum';
import { KelolaManajemenUser } from './admin/KelolaManajemenUser';
import { KelolaPengaduanWarga } from './admin/KelolaPengaduanWarga';
import { downloadSuratAsRealPdf } from '../utils/documentDownload';
import { getWhatsAppNotificationUrl } from '../utils/whatsappNotification';

interface StaffDashboardProps {
  currentUser: UserProfile;
  onSelectPrint: (permohonan: PermohonanSurat) => void;
  onBackToPortal?: () => void;
  onSelectUser?: (user: UserProfile | null) => void;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({
  currentUser,
  onSelectPrint,
  onBackToPortal,
  onSelectUser,
}) => {
  const [activeTab, setActiveTab] = useState<
    | 'antrean'
    | 'buku_register'
    | 'kelola_surat'
    | 'kelola_pejabat'
    | 'kelola_banner'
    | 'kelola_berita'
    | 'kelola_kontak'
    | 'kelola_galeri'
    | 'kelola_statistik'
    | 'pengaturan_kop'
    | 'produk_hukum'
    | 'kelola_pengaduan'
    | 'manajemen_user'
  >('antrean');

  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [pengaturanAccordionOpen, setPengaturanAccordionOpen] = useState(false);

  useEffect(() => {
    if (pengaturanSubMenuItems.some((sub) => sub.id === activeTab)) {
      setPengaturanAccordionOpen(true);
    }
  }, [activeTab]);

  // Kunci scroll body ketika sidebar mobile terbuka
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

  // 1. Antrean Permohonan State
  const [permohonanList, setPermohonanList] = useState<PermohonanSurat[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPermohonan, setSelectedPermohonan] = useState<PermohonanSurat | null>(null);
  const [newStatus, setNewStatus] = useState<StatusPermohonan>('Diverifikasi & Dicetak');
  const [catatanPetugas, setCatatanPetugas] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [previewBerkas, setPreviewBerkas] = useState<{ title: string; url: string; nik: string } | null>(null);

  // 2. CMS State
  const [jenisSuratList, setJenisSuratList] = useState<JenisSurat[]>([]);
  const [pejabatList, setPejabatList] = useState<PejabatDesa[]>([]);
  const [bannerList, setBannerList] = useState<BannerSlide[]>([]);
  const [pengaturan, setPengaturan] = useState<PengaturanDesa>(getStoredPengaturanDesa());
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Edit Modal States
  const [editingSurat, setEditingSurat] = useState<JenisSurat | null>(null);
  const [newSyaratInput, setNewSyaratInput] = useState('');
  const [newSyaratIzinkanKamera, setNewSyaratIzinkanKamera] = useState(true);
  const [isGeneratingPdfId, setIsGeneratingPdfId] = useState<string | null>(null);
  const [editingPejabat, setEditingPejabat] = useState<PejabatDesa | null>(null);
  const [editingBanner, setEditingBanner] = useState<BannerSlide | null>(null);

  // Logo input refs
  const logoKiriInputRef = useRef<HTMLInputElement>(null);
  const logoKananInputRef = useRef<HTMLInputElement>(null);

  // Modal Konfirmasi Hapus (Ya / Tidak)
  const [confirmDelete, setConfirmDelete] = useState<{
    type: 'surat' | 'pejabat' | 'banner' | 'register';
    id: string;
    nama: string;
  } | null>(null);

  const loadAllData = async () => {
    // 1. Tampilkan data dari cache lokal secara instan
    setPermohonanList(getStoredPermohonan());
    setJenisSuratList(getStoredJenisSurat());
    setPejabatList(getStoredPejabatDesa());
    setBannerList(getStoredBannerSlides());
    setPengaturan(getStoredPengaturanDesa());

    // 2. Ambil data terbaru langsung dari database Supabase (agar sinkron antar-komputer)
    try {
      const [freshPermohonan, freshJenis, freshPejabat, freshBanner, freshPengaturan] = await Promise.allSettled([
        dbFetchPermohonan(),
        dbFetchJenisSurat(),
        dbFetchPejabatDesa(),
        dbFetchBannerSlides(),
        dbFetchPengaturanDesa(),
      ]);

      if (freshPermohonan.status === 'fulfilled' && freshPermohonan.value) {
        setPermohonanList(freshPermohonan.value);
      }
      if (freshJenis.status === 'fulfilled' && freshJenis.value) {
        setJenisSuratList(freshJenis.value);
      }
      if (freshPejabat.status === 'fulfilled' && freshPejabat.value) {
        setPejabatList(freshPejabat.value);
      }
      if (freshBanner.status === 'fulfilled' && freshBanner.value) {
        setBannerList(freshBanner.value);
      }
      if (freshPengaturan.status === 'fulfilled' && freshPengaturan.value) {
        setPengaturan(freshPengaturan.value);
      }
    } catch {
      // Abaikan jika offline
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Sinkronisasi Realtime: Perubahan di Komputer A langsung tercermin di Komputer B, C, D
  useRealtimeSync(
    ['permohonan_surat', 'jenis_surat', 'pejabat_desa', 'banner_slides', 'pengaturan_desa', 'transparansi_apbdes'],
    (event) => {
      loadAllData();
      if (event.source === 'remote') {
        showNotification(`⚡ Data ${event.table.replace('_', ' ')} diperbarui langsung dari komputer lain!`);
      }
    }
  );

  const showNotification = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleViewSignedUrl = (title: string, url: string, nik: string) => {
    setPreviewBerkas({ title, url, nik });
  };

  // Status Surat Handlers
  const handleUpdateStatus = async () => {
    if (!selectedPermohonan) return;
    setIsUpdating(true);
    try {
      await updateStatusSurat(
        selectedPermohonan.id,
        newStatus,
        catatanPetugas,
        currentUser.nama_lengkap || 'Staf Pelayanan'
      );
      loadAllData();
      setSelectedPermohonan(null);
      setCatatanPetugas('');
      showNotification('Status permohonan berhasil diperbarui!');
    } catch (e: any) {
      alert('Gagal mengupdate status: ' + e?.message);
    } finally {
      setIsUpdating(false);
    }
  };

  // Unduh PDF Murni dengan jsPDF & html2canvas
  const handleDownloadPdfReal = async (p: PermohonanSurat) => {
    try {
      setIsGeneratingPdfId(p.id);
      await downloadSuratAsRealPdf(p);
      showNotification(`Berkas PDF resmi untuk ${p.nama_pemohon} berhasil diunduh!`);
    } catch (err) {
      console.error('Gagal generate PDF:', err);
      alert('Terjadi kendala saat merender PDF. Silakan gunakan tombol Cetak Langsung.');
    } finally {
      setIsGeneratingPdfId(null);
    }
  };

  // JENIS SURAT & PERSYARATAN CRUD
  const handleSaveSurat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSurat) return;

    // Pastikan persyaratan_items konsisten
    const currentItems: SyaratItem[] =
      editingSurat.persyaratan_items && editingSurat.persyaratan_items.length > 0
        ? editingSurat.persyaratan_items
        : editingSurat.persyaratan.map((s, idx) => ({
            id: `syarat-${idx}`,
            nama: s,
            izinkan_kamera: true,
          }));

    const finalSurat: JenisSurat = {
      ...editingSurat,
      persyaratan: currentItems.map((item) => item.nama),
      persyaratan_items: currentItems,
    };

    const exists = jenisSuratList.some((s) => s.id === finalSurat.id);
    const targetSurat = exists ? finalSurat : { ...finalSurat, id: `js-${Date.now()}` };
    const updated = exists
      ? jenisSuratList.map((s) => (s.id === finalSurat.id ? targetSurat : s))
      : [...jenisSuratList, targetSurat];

    setJenisSuratList(updated);
    setEditingSurat(null);
    setNewSyaratInput('');
    setNewSyaratIzinkanKamera(true);
    showNotification('Menyimpan jenis surat ke database...');
    await dbSaveJenisSurat(targetSurat);
    showNotification('Jenis Surat & Persyaratan dinamis berhasil disimpan!');
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;

    const targetId = confirmDelete.id;
    const targetType = confirmDelete.type;
    setConfirmDelete(null);

    if (targetType === 'surat') {
      const updated = jenisSuratList.filter((s) => s.id !== targetId);
      setJenisSuratList(updated);
      await dbDeleteJenisSurat(targetId);
      showNotification('Jenis surat berhasil dihapus dari semua komputer.');
    } else if (targetType === 'pejabat') {
      const updated = pejabatList.filter((p) => p.id !== targetId);
      setPejabatList(updated);
      await dbDeletePejabatDesa(targetId);
      showNotification('Aparatur desa berhasil dihapus dari semua komputer.');
    } else if (targetType === 'banner') {
      const updated = bannerList.filter((b) => b.id !== targetId);
      setBannerList(updated);
      await dbDeleteBannerSlide(targetId);
      showNotification('Slide banner berhasil dihapus dari semua komputer.');
    } else if (targetType === 'register') {
      const updated = permohonanList.filter((p) => p.id !== targetId);
      setPermohonanList(updated);
      await dbDeletePermohonan(targetId);
      showNotification('Data register naskah dinas keluar berhasil dihapus dari buku register.');
    }
  };

  const handlePejabatPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Pilih berkas foto yang valid (JPG, PNG, WEBP)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === 'string' && editingPejabat) {
        setEditingPejabat({ ...editingPejabat, foto_url: ev.target.result });
        showNotification('Foto aparatur berhasil dimuat dari perangkat!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBannerPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Pilih berkas gambar banner yang valid (JPG, PNG, WEBP)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === 'string' && editingBanner) {
        setEditingBanner({ ...editingBanner, gambar_url: ev.target.result });
        showNotification('Gambar banner berhasil dimuat dari perangkat!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleTemplateBlankoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingSurat) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === 'string') {
        setEditingSurat({
          ...editingSurat,
          template_blanko_url: ev.target.result,
          nama_file_blanko: file.name,
        });
        showNotification(`File blanko "${file.name}" berhasil diunggah!`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddSyaratTag = () => {
    if (!newSyaratInput.trim() || !editingSurat) return;

    const currentItems: SyaratItem[] =
      editingSurat.persyaratan_items && editingSurat.persyaratan_items.length > 0
        ? [...editingSurat.persyaratan_items]
        : editingSurat.persyaratan.map((s, idx) => ({
            id: `syarat-${idx}`,
            nama: s,
            izinkan_kamera: true,
          }));

    const newItem: SyaratItem = {
      id: `syarat-${Date.now()}`,
      nama: newSyaratInput.trim(),
      izinkan_kamera: newSyaratIzinkanKamera,
    };

    const updatedItems = [...currentItems, newItem];
    setEditingSurat({
      ...editingSurat,
      persyaratan: updatedItems.map((item) => item.nama),
      persyaratan_items: updatedItems,
    });
    setNewSyaratInput('');
    setNewSyaratIzinkanKamera(true);
  };

  const handleToggleCameraSyarat = (idx: number) => {
    if (!editingSurat) return;
    const currentItems: SyaratItem[] =
      editingSurat.persyaratan_items && editingSurat.persyaratan_items.length > 0
        ? [...editingSurat.persyaratan_items]
        : editingSurat.persyaratan.map((s, i) => ({
            id: `syarat-${i}`,
            nama: s,
            izinkan_kamera: true,
          }));

    if (currentItems[idx]) {
      currentItems[idx] = {
        ...currentItems[idx],
        izinkan_kamera: !currentItems[idx].izinkan_kamera,
      };
      setEditingSurat({
        ...editingSurat,
        persyaratan: currentItems.map((item) => item.nama),
        persyaratan_items: currentItems,
      });
    }
  };

  const handleRemoveSyaratTag = (idx: number) => {
    if (!editingSurat) return;
    const currentItems: SyaratItem[] =
      editingSurat.persyaratan_items && editingSurat.persyaratan_items.length > 0
        ? [...editingSurat.persyaratan_items]
        : editingSurat.persyaratan.map((s, i) => ({
            id: `syarat-${i}`,
            nama: s,
            izinkan_kamera: true,
          }));

    const updatedItems = currentItems.filter((_, i) => i !== idx);
    setEditingSurat({
      ...editingSurat,
      persyaratan: updatedItems.map((item) => item.nama),
      persyaratan_items: updatedItems,
    });
  };

  // PEJABAT DESA CRUD
  const handleSavePejabat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPejabat) return;

    let targetPejabat = editingPejabat;
    const exists = pejabatList.some((p) => p.id === editingPejabat.id);
    if (!exists) {
      targetPejabat = { ...editingPejabat, id: `pj-${Date.now()}` };
    }

    const updated = exists
      ? pejabatList.map((p) => (p.id === editingPejabat.id ? targetPejabat : p))
      : [...pejabatList, targetPejabat];

    setPejabatList(updated);
    setEditingPejabat(null);
    showNotification('Menyimpan aparatur desa ke database...');
    await dbSavePejabatDesa(targetPejabat);
    showNotification('Data Pejabat Desa & Foto berhasil disimpan ke semua komputer!');
  };

  const handleDeletePejabat = (id: string) => {
    const item = pejabatList.find((p) => p.id === id);
    setConfirmDelete({
      type: 'pejabat',
      id,
      nama: item ? `${item.nama} (${item.jabatan})` : 'Aparatur Desa',
    });
  };

  // BANNER CAROUSEL SLIDES CRUD
  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner) return;

    let targetBanner = editingBanner;
    const exists = bannerList.some((b) => b.id === editingBanner.id);
    if (!exists) {
      targetBanner = { ...editingBanner, id: `slide-${Date.now()}` };
    }

    const updated = exists
      ? bannerList.map((b) => (b.id === editingBanner.id ? targetBanner : b))
      : [...bannerList, targetBanner];

    setBannerList(updated);
    setEditingBanner(null);
    showNotification('Menyimpan slide banner ke database...');
    await dbSaveBannerSlide(targetBanner);
    showNotification('Banner slide hero berhasil disimpan ke semua komputer!');
  };

  const handleDeleteBanner = (id: string) => {
    const item = bannerList.find((b) => b.id === id);
    setConfirmDelete({
      type: 'banner',
      id,
      nama: item ? item.judul : 'Slide Banner',
    });
  };

  const handleDeleteSurat = (id: string) => {
    const item = jenisSuratList.find((s) => s.id === id);
    setConfirmDelete({
      type: 'surat',
      id,
      nama: item ? item.nama : 'Jenis Surat',
    });
  };

  const handleDeleteRegister = (p: PermohonanSurat) => {
    setConfirmDelete({
      type: 'register',
      id: p.id,
      nama: `Nomor: ${p.nomor_surat_resmi} (${p.nama_pemohon} - ${p.jenis_surat_nama})`,
    });
  };

  // LOGO KOP UPLOAD HANDLERS
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, position: 'kiri' | 'kanan') => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Pilih berkas gambar logo yang valid (PNG, JPG, SVG, WEBP)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (position === 'kiri') {
        setPengaturan((prev) => ({
          ...prev,
          kop_logo_kiri_url: dataUrl,
          kop_logo_url: dataUrl,
        }));
      } else {
        setPengaturan((prev) => ({
          ...prev,
          kop_logo_kanan_url: dataUrl,
        }));
      }
      showNotification(`Logo ${position} berhasil diunggah! Klik "Simpan Pengaturan Kop" untuk menyimpan.`);
    };
    reader.readAsDataURL(file);
  };

  const handleResetLogoKiri = () => {
    setPengaturan((prev) => ({
      ...prev,
      kop_logo_kiri_url: '/logo.png',
      kop_logo_url: '/logo.png',
    }));
    showNotification('Logo kiri dikembalikan ke logo default (/logo.png).');
  };

  const handleRemoveLogoKanan = () => {
    setPengaturan((prev) => ({
      ...prev,
      kop_logo_kanan_url: '',
    }));
    showNotification('Logo kanan berhasil dihapus dari kop.');
  };

  // PENGATURAN DESA & KONTAK KPPID
  const handleSavePengaturan = async (e: React.FormEvent) => {
    e.preventDefault();
    await dbSavePengaturanDesa(pengaturan);
    showNotification('Pengaturan Kontak & Profil Desa berhasil diperbarui ke semua komputer!');
  };

  // PENGATURAN KOP & TEMPLATE NASKAH DINAS
  const handleSavePengaturanKop = async (e: React.FormEvent) => {
    e.preventDefault();
    await dbSavePengaturanDesa(pengaturan);
    showNotification('Pengaturan Kop & Template Naskah Dinas berhasil disimpan ke semua komputer!');
  };

  // Filter Permohonan
  const filteredList = permohonanList.filter((item) => {
    const matchStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchSearch =
      item.nama_pemohon.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nik.includes(searchTerm) ||
      item.kode_tiket.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.nomor_surat_resmi && item.nomor_surat_resmi.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchStatus && matchSearch;
  });

  const pengaduanMenungguCount = getStoredPengaduan().filter((p) => p.status === 'Menunggu Tanggapan').length;

  const primaryMenuItems = [
    { id: 'antrean', label: 'Antrean Surat', icon: Clock, count: permohonanList.filter((p) => p.status === 'Diajukan').length },
    { id: 'buku_register', label: 'Buku Register Surat', icon: BookOpen },
    { id: 'kelola_surat', label: 'Master Layanan & Syarat', icon: FileCheck },
    { id: 'kelola_pengaduan', label: 'Pengaduan Warga', icon: MessageSquare, count: pengaduanMenungguCount },
    { id: 'kelola_berita', label: 'Berita & Publikasi', icon: Newspaper },
    { id: 'kelola_galeri', label: 'Galeri Foto Kegiatan', icon: Camera },
    { id: 'kelola_statistik', label: 'Statistik & APBDes 2026', icon: BarChart3 },
  ];

  const pengaturanSubMenuItems = [
    { id: 'kelola_kontak', label: '1. Profil Desa & Kontak KPPID', icon: Settings },
    { id: 'kelola_pejabat', label: '2. Aparatur Desa & Foto Pejabat', icon: Users },
    { id: 'kelola_banner', label: '3. Banner Rotasi Hero', icon: ImageIcon },
    { id: 'pengaturan_kop', label: '4. Pengaturan Kop & Template Naskah', icon: Stamp },
    { id: 'produk_hukum', label: '5. Produk Hukum Desa (JDIH)', icon: Scale },
    { id: 'manajemen_user', label: '6. Manajemen User (Staf & Kontributor)', icon: UserPlus },
  ];

  const allMenuItems = [...primaryMenuItems, ...pengaturanSubMenuItems];
  const currentTabObj = allMenuItems.find((m) => m.id === activeTab);
  const currentTabLabel = currentTabObj?.label || 'Antrean Surat';

  return (
    <div className="min-h-screen bg-[#EEF2F6] flex flex-row relative">
      {/* Toast Notification Floating di Bawah (Aman dari Top Header & Navbar Mobile) */}
      {feedbackMsg && (
        <div className="fixed bottom-5 right-4 left-4 sm:left-auto sm:right-6 sm:max-w-md z-[999999] p-3.5 sm:p-4 bg-[#0D2A4A]/95 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-blue-800/80 flex items-center justify-between gap-3 text-xs font-bold animate-in fade-in slide-in-from-bottom-5">
          <div className="flex items-center gap-2.5 min-w-0">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0" />
            <span className="leading-snug truncate">{feedbackMsg}</span>
          </div>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="p-1 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white shrink-0 cursor-pointer"
            aria-label="Tutup notifikasi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* MOBILE BACKDROP DENGAN Z-INDEX TERTINGGI & BLUR */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[999990] lg:hidden animate-in fade-in duration-200"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR ADMIN RESMI DESA NYURLEMBANG (DEEP NAVY #0D2A4A) */}
      <aside
        className={`bg-[#0D2A4A] text-white flex flex-col h-screen transition-all duration-300 ease-in-out ${
          mobileSidebarOpen
            ? 'fixed inset-y-0 left-0 w-72 max-w-[85vw] translate-x-0 shadow-2xl overflow-y-auto z-[999999]'
            : 'fixed inset-y-0 left-0 w-72 -translate-x-full pointer-events-none z-[999999]'
        } ${
          desktopSidebarOpen
            ? 'lg:pointer-events-auto lg:translate-x-0 lg:static lg:sticky lg:top-0 lg:w-64 lg:shrink-0 lg:border-r lg:border-blue-950'
            : 'lg:hidden'
        }`}
      >
        {/* Logo Resmi & Subtitle */}
        <div className="p-4 pb-3 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="Logo Resmi Desa Nyurlembang"
              className="w-9 h-9 object-contain drop-shadow-sm shrink-0"
            />
            <div>
              <div className="text-xs font-extrabold tracking-wide text-white uppercase font-heading">
                DESA NYURLEMBANG
              </div>
              <div className="text-[10px] text-[#03A9F4] font-semibold">
                Meja Kerja Staf Administrasi
              </div>
            </div>
          </div>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg lg:hidden cursor-pointer"
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
            {currentUser.jabatan || 'Staf Pelayanan Terpadu'}
          </div>
          <div className="text-[9px] font-mono text-[#FFB300] pl-4 uppercase">
            Role: staff_desa (Akses Penuh)
          </div>
        </div>

        {/* Menu Navigasi Sidebar - Scroll Terpisah */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-1">
            Menu Utama
          </div>
          {primaryMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  setMobileSidebarOpen(false);
                }}
                className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between group cursor-pointer ${
                  isActive
                    ? 'bg-[#1565C0] text-white shadow-md border-r-4 border-[#FFB300]'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#FFB300]' : 'text-slate-400 group-hover:text-white'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span className="px-2 py-0.5 bg-[#B71C1C] text-white text-[10px] font-black rounded-full shadow-xs">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}

          {/* AKORDEON SUB-MENU: PENGATURAN DESA */}
          <div className="pt-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-1">
              Konfigurasi Sistem
            </div>
            <button
              type="button"
              onClick={() => setPengaturanAccordionOpen(!pengaturanAccordionOpen)}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between group cursor-pointer ${
                pengaturanSubMenuItems.some((sub) => sub.id === activeTab)
                  ? 'bg-white/10 text-white border-l-4 border-[#FFB300]'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sliders className="w-4 h-4 text-[#FFB300]" />
                <span>Pengaturan Desa</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                  pengaturanAccordionOpen ? 'rotate-180 text-white' : ''
                }`}
              />
            </button>

            {pengaturanAccordionOpen && (
              <div className="mt-1 pl-2 pr-1 space-y-1 animate-in fade-in duration-150">
                {pengaturanSubMenuItems.map((sub) => {
                  const SubIcon = sub.icon;
                  const isSubActive = activeTab === sub.id;
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(sub.id as any);
                        setMobileSidebarOpen(false);
                      }}
                      className={`w-full px-2.5 py-2 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-2 text-left cursor-pointer ${
                        isSubActive
                          ? 'bg-[#1565C0] text-white shadow-xs font-bold'
                          : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <SubIcon className={`w-3.5 h-3.5 shrink-0 ${isSubActive ? 'text-[#FFB300]' : 'text-slate-400'}`} />
                      <span className="truncate">{sub.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
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
            <span>Keluar dari Admin</span>
          </button>
          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2E7D32]" />
              SID Nyurlembang v2.6
            </span>
            <span>Lombok Barat</span>
          </div>
        </div>
      </aside>

      {/* AREA KANAN: TOP BAR ADMIN MANDIRI + WORKSPACE KONTEN */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-[#EEF2F6]">
        {/* TOP BAR ADMIN MANDIRI */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 px-4 sm:px-6 py-3 flex items-center justify-between shadow-xs">
          {/* Kiri: Toggle Menu Sidebar (Mobile & Desktop) + Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setMobileSidebarOpen((prev) => !prev);
                } else {
                  setDesktopSidebarOpen((prev) => !prev);
                }
              }}
              className="p-2 rounded-xl text-[#0D2A4A] hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200"
              title={desktopSidebarOpen ? 'Sembunyikan Sidebar (Layar Terbuka Lebar)' : 'Tampilkan Sidebar (Perkecil Layar)'}
              aria-label="Toggle Menu Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-slate-500 hidden sm:inline">Admin Desa</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
              <span className="font-extrabold text-[#0D2A4A] font-heading">{currentTabLabel}</span>
            </div>
          </div>

          {/* Kanan: Realtime Status + Profil Ringkas + Tombol [Lihat Portal Publik] + [Keluar] */}
          <div className="flex items-center gap-2 sm:gap-3">
            <RealtimeStatusBadge />

            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100/90 rounded-xl text-xs border border-slate-200/60">
              <div className="w-6 h-6 rounded-lg bg-[#1565C0] text-white font-black flex items-center justify-center text-[10px]">
                {currentUser.nama_lengkap.slice(0, 2).toUpperCase()}
              </div>
              <div className="leading-tight">
                <div className="font-bold text-[#0D2A4A] text-[11px] truncate max-w-[130px]">
                  {currentUser.nama_lengkap}
                </div>
                <div className="text-[9px] text-[#2E7D32] font-semibold">Staf Desa (Online)</div>
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
              title="Keluar dari Akun Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </header>

        {/* MAIN WORKSPACE CANVAS */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">

      {/* =========================================================================
          TAB 1: ANTREAN PERMOHONAN SURAT WARGA
      ========================================================================= */}
      {activeTab === 'antrean' && (
        <div className="space-y-6">
          {/* Quick Filter Status Bar - Kompak 2 Kolom di Mobile */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
            {[
              { label: 'Semua Status', val: 'all', count: permohonanList.length, color: 'border-slate-300 bg-white' },
              { label: 'Diajukan', val: 'Diajukan', count: permohonanList.filter((p) => p.status === 'Diajukan').length, color: 'border-amber-400 text-amber-900 bg-amber-50/50' },
              { label: 'Diverifikasi & Cetak', val: 'Diverifikasi & Dicetak', count: permohonanList.filter((p) => p.status === 'Diverifikasi & Dicetak').length, color: 'border-blue-400 text-[#1565C0] bg-blue-50/50' },
              { label: 'Siap Diambil', val: 'Siap Diambil', count: permohonanList.filter((p) => p.status === 'Siap Diambil').length, color: 'border-emerald-400 text-[#2E7D32] bg-emerald-50/50' },
              { label: 'Selesai', val: 'Selesai', count: permohonanList.filter((p) => p.status === 'Selesai').length, color: 'border-slate-400 text-slate-700 bg-slate-50' },
            ].map((f) => (
              <button
                key={f.val}
                onClick={() => setFilterStatus(f.val)}
                className={`p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border text-left transition-all ${f.color} ${
                  f.val === 'Selesai' ? 'col-span-2 sm:col-span-1' : ''
                } ${
                  filterStatus === f.val ? 'ring-2 ring-[#1565C0] shadow-xs' : 'opacity-85 hover:opacity-100'
                }`}
              >
                <div className="text-[10px] sm:text-[11px] font-semibold text-slate-500 truncate">{f.label}</div>
                <div className="text-base sm:text-xl font-bold font-heading mt-0.5 sm:mt-1">{f.count}</div>
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari berdasarkan Nama Pemohon, NIK, Kode Tiket (NYR-...), atau Nomor Register Surat..."
              className="w-full text-xs md:text-sm bg-transparent focus:outline-none"
            />
          </div>

          {/* Table Antrean */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                  <tr>
                    <th className="p-3.5">Kode Tiket</th>
                    <th className="p-3.5">Pemohon & NIK</th>
                    <th className="p-3.5">Jenis Surat</th>
                    <th className="p-3.5">Dusun</th>
                    <th className="p-3.5">Nomor Register</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredList.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-slate-900">{p.kode_tiket}</td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-900">{p.nama_pemohon}</div>
                        <div className="text-[11px] text-slate-400 font-mono">NIK: {p.nik}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="font-semibold text-slate-800">{p.jenis_surat_nama}</span>
                      </td>
                      <td className="p-3.5 text-slate-600">{p.dusun}</td>
                      <td className="p-3.5 font-mono text-[11px] text-emerald-800 font-semibold">
                        {p.nomor_surat_resmi || <span className="text-slate-400 italic">Belum dibuat</span>}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            p.status === 'Diajukan'
                              ? 'bg-amber-100 text-amber-800'
                              : p.status === 'Diverifikasi & Dicetak'
                              ? 'bg-blue-100 text-blue-800'
                              : p.status === 'Siap Diambil'
                              ? 'bg-emerald-100 text-emerald-800'
                              : p.status === 'Selesai'
                              ? 'bg-slate-100 text-slate-700'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                        {p.nomor_whatsapp && (
                          <a
                            href={getWhatsAppNotificationUrl(p)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1 shadow-xs transition-colors"
                            title={`Kirim pemberitahuan status tiket ke WhatsApp ${p.nomor_whatsapp}`}
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Kirim WA</span>
                          </a>
                        )}
                        <button
                          onClick={() => {
                            setSelectedPermohonan(p);
                            setNewStatus(p.status);
                            setCatatanPetugas(p.catatan_petugas || '');
                          }}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold"
                        >
                          Detail & Status
                        </button>
                        <button
                          onClick={() => onSelectPrint(p)}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Cetak</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredList.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        Tidak ada permohonan yang sesuai dengan filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: BUKU REGISTER SURAT KELUAR RESMI
      ========================================================================= */}
      {activeTab === 'buku_register' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-heading">
                Buku Register Penomoran Surat Keluar Desa Nyurlembang
              </h3>
              <p className="text-xs text-slate-500">
                Register resmi naskah dinas keluar sesuai format Tata Naskah Dinas Permendagri.
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-slate-100 px-3 py-1 rounded-lg">
              Total Teregister: {permohonanList.filter((p) => p.nomor_surat_resmi).length} Dokumen
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
                <tr>
                  <th className="p-3">No. Register Surat</th>
                  <th className="p-3">Tanggal Register</th>
                  <th className="p-3">Perihal / Jenis Naskah</th>
                  <th className="p-3">Nama Pemohon (NIK)</th>
                  <th className="p-3">Keperluan</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {permohonanList
                  .filter((p) => p.nomor_surat_resmi)
                  .map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-emerald-800">{p.nomor_surat_resmi}</td>
                      <td className="p-3 text-slate-500">
                        {p.diverifikasi_pada
                          ? new Date(p.diverifikasi_pada).toLocaleDateString('id-ID')
                          : '-'}
                      </td>
                      <td className="p-3 font-semibold text-slate-900">{p.jenis_surat_nama}</td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-900">{p.nama_pemohon}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{p.nik}</div>
                      </td>
                      <td className="p-3 text-slate-600 max-w-xs truncate">{p.keperluan}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {p.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleDownloadPdfReal(p)}
                            disabled={isGeneratingPdfId === p.id}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded font-semibold text-[11px] flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                            title="Download berkas PDF asli F4"
                          >
                            {isGeneratingPdfId === p.id ? (
                              <RefreshCw className="w-3 h-3 animate-spin text-blue-700" />
                            ) : (
                              <Download className="w-3 h-3" />
                            )}
                            <span>{isGeneratingPdfId === p.id ? 'Membuat...' : 'PDF'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onSelectPrint(p)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Printer className="w-3 h-3" />
                            <span>Cetak</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteRegister(p)}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded font-semibold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                            title="Hapus data register surat keluar"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: KELOLA JENIS SURAT & PERSYARATAN (LANGKAH 2 FORMULIR)
      ========================================================================= */}
      {activeTab === 'kelola_surat' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  Daftar Jenis Naskah Dinas & Persyaratan Berkas
                </h3>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold font-mono">
                  {jenisSuratList.length} Layanan
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Kelola master naskah dinas mandiri, estimasi pengerjaan, dan berkas persyaratan yang ditagih ke warga.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingSurat({
                  id: '',
                  kode: '',
                  nama: '',
                  deskripsi: '',
                  persyaratan: ['Foto KTP Pemohon', 'Kartu Keluarga (KK)'],
                  kategori: 'Administrasi Kependudukan',
                  estimasi_hari: 1,
                });
                setNewSyaratInput('');
              }}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 self-start sm:self-auto shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Jenis Surat</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="p-4 w-12 text-center">No</th>
                    <th className="p-4 min-w-[240px]">Kode & Nama Surat</th>
                    <th className="p-4 min-w-[170px]">Kategori & Estimasi</th>
                    <th className="p-4 min-w-[320px]">Persyaratan Berkas Warga</th>
                    <th className="p-4 text-center min-w-[130px]">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {jenisSuratList.map((js, idx) => (
                    <tr key={js.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 text-center font-mono text-slate-400 font-medium">{idx + 1}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono text-[10px] font-bold rounded">
                            {js.kode}
                          </span>
                        </div>
                        <div className="font-bold text-slate-900 text-sm font-heading">{js.nama}</div>
                        {js.deskripsi && (
                          <div className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{js.deskripsi}</div>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-700 font-medium rounded-lg text-[11px] mb-1">
                          {js.kategori}
                        </span>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-emerald-600" />
                          <span>{js.estimasi_hari} Hari Pengerjaan</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1.5 max-w-md">
                          {js.persyaratan.map((syarat, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-md text-[10px] text-slate-700 font-medium"
                            >
                              ✓ {syarat}
                            </span>
                          ))}
                          {js.template_blanko_url && (
                            <span className="px-2 py-0.5 bg-blue-50 border border-blue-200 rounded-md text-[10px] text-blue-700 font-bold flex items-center gap-1">
                              <FileDown className="w-3 h-3 text-blue-600" />
                              <span>Blanko: {js.nama_file_blanko || 'Tersedia'}</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setEditingSurat(js);
                              setNewSyaratInput('');
                            }}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs"
                            title="Edit Surat"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSurat(js.id)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs"
                            title="Hapus Jenis Surat"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {jenisSuratList.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        Belum ada jenis surat yang dikonfigurasi.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: KELOLA PEJABAT DESA & FOTO (LIST VIEW)
      ========================================================================= */}
      {activeTab === 'kelola_pejabat' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  Daftar Aparatur & Pejabat Desa Nyurlembang
                </h3>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold font-mono">
                  {pejabatList.length} Aparatur
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Daftar susunan organisasi aparatur desa, jabatan, tugas pokok, kontak dan foto profil yang tampil di portal publik.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingPejabat({
                  id: '',
                  nama: '',
                  jabatan: '',
                  nip: '',
                  foto_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80',
                  telepon: '',
                  tugas: '',
                  urutan: pejabatList.length + 1,
                });
              }}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 self-start sm:self-auto shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Aparatur</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="p-4 w-12 text-center">Urutan</th>
                    <th className="p-4 min-w-[260px]">Aparatur Desa</th>
                    <th className="p-4 min-w-[240px]">Jabatan & Tugas Pokok</th>
                    <th className="p-4 min-w-[140px]">Kontak / WA</th>
                    <th className="p-4 text-center min-w-[120px]">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pejabatList.map((pj) => (
                    <tr key={pj.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 text-center font-mono text-slate-500 font-bold">
                        <span className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-xs">
                          {pj.urutan}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={pj.foto_url}
                            alt={pj.nama}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 bg-slate-100 shrink-0 shadow-2xs"
                          />
                          <div>
                            <div className="font-bold text-slate-900 text-sm font-heading">{pj.nama}</div>
                            {pj.nip ? (
                              <div className="text-[11px] text-slate-400 font-mono">NIP: {pj.nip}</div>
                            ) : (
                              <div className="text-[11px] text-slate-400 italic">Non-PNS / Perangkat Desa</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mb-1">
                          {pj.jabatan}
                        </span>
                        {pj.tugas && (
                          <div className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">{pj.tugas}</div>
                        )}
                      </td>
                      <td className="p-4 font-mono text-slate-600">
                        {pj.telepon ? (
                          <span className="text-[11px] bg-slate-50 px-2 py-1 rounded border border-slate-200 inline-block">
                            {pj.telepon}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">-</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setEditingPejabat(pj)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs"
                            title="Edit Pejabat"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeletePejabat(pj.id)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs"
                            title="Hapus Pejabat"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {pejabatList.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        Belum ada data aparatur desa.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: KELOLA BANNER HERO SLIDER (LIST VIEW)
      ========================================================================= */}
      {activeTab === 'kelola_banner' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  Daftar Slide Banner Hero Beranda
                </h3>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold font-mono">
                  {bannerList.length} Slide
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Kelola banner gambar latar resolusi tinggi yang berotasi otomatis di hero portal desa.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingBanner({
                  id: '',
                  gambar_url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1600&auto=format&fit=crop&q=80',
                  judul: 'Pesona Alam Nyurlembang',
                  subjudul: 'Kecamatan Narmada, Kabupaten Lombok Barat',
                  keterangan: 'Kawasan Wisata & Pertanian',
                  aktif: true,
                  urutan: bannerList.length + 1,
                });
              }}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 self-start sm:self-auto shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Slide Banner</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="p-4 w-12 text-center">Urutan</th>
                    <th className="p-4 min-w-[200px]">Pratinjau Banner</th>
                    <th className="p-4 min-w-[280px]">Judul & Subjudul</th>
                    <th className="p-4 min-w-[130px]">Status Rotasi</th>
                    <th className="p-4 text-center min-w-[120px]">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bannerList.map((b, idx) => (
                    <tr key={b.id || idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 text-center font-mono text-slate-500 font-bold">
                        <span className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-xs">
                          {idx + 1}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="w-36 h-20 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-2xs relative">
                          <img src={b.gambar_url} alt={b.judul} className="w-full h-full object-cover" />
                          <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 text-white text-[9px] font-mono rounded">
                            #{idx + 1}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900 text-sm font-heading">{b.judul}</div>
                        <div className="text-[11px] text-slate-600 mt-1 line-clamp-2">{b.subjudul}</div>
                        {b.keterangan && (
                          <div className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded inline-block mt-1">
                            {b.keterangan}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        {b.aktif ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                            Aktif Tampil
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full font-medium text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            Dinonaktifkan
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setEditingBanner(b)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs"
                            title="Edit Banner"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteBanner(b.id)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs"
                            title="Hapus Banner"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {bannerList.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        Belum ada slide banner hero.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 6: KELOLA KONTAK, KPPID & MEDIA SOSIAL DESA
      ========================================================================= */}
      {activeTab === 'kelola_kontak' && (
        <form onSubmit={handleSavePengaturan} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-heading">
              Pengaturan Kontak KPPID, Sambutan Kades & Media Sosial
            </h3>
            <p className="text-xs text-slate-500">
              Data yang diubah di sini akan otomatis sinkron pada Sub-Header, Footer, dan Beranda Portal.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Telepon / Hotline KPPID (Tampil di Sub-Header & Footer) *
              </label>
              <input
                type="text"
                value={pengaturan.telepon_kppid}
                onChange={(e) => setPengaturan({ ...pengaturan, telepon_kppid: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Email Resmi Desa *
              </label>
              <input
                type="email"
                value={pengaturan.email_desa}
                onChange={(e) => setPengaturan({ ...pengaturan, email_desa: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Alamat Lengkap Kantor Desa
              </label>
              <input
                type="text"
                value={pengaturan.alamat_kantor}
                onChange={(e) => setPengaturan({ ...pengaturan, alamat_kantor: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Jam Pelayanan Kantor
              </label>
              <input
                type="text"
                value={pengaturan.jam_pelayanan}
                onChange={(e) => setPengaturan({ ...pengaturan, jam_pelayanan: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Nama Kepala Desa (Sambutan)
              </label>
              <input
                type="text"
                value={pengaturan.sambutan_kades_nama}
                onChange={(e) => setPengaturan({ ...pengaturan, sambutan_kades_nama: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Foto Kepala Desa URL
              </label>
              <input
                type="text"
                value={pengaturan.sambutan_kades_foto}
                onChange={(e) => setPengaturan({ ...pengaturan, sambutan_kades_foto: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Teks Sambutan Kepala Desa
              </label>
              <textarea
                rows={3}
                value={pengaturan.sambutan_kades_teks}
                onChange={(e) => setPengaturan({ ...pengaturan, sambutan_kades_teks: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs leading-relaxed"
              />
            </div>

            <div className="sm:col-span-2 border-t border-slate-200 pt-4">
              <h4 className="text-xs font-bold uppercase text-slate-700 mb-3">Tautan Akun Media Sosial Resmi (Footer)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">URL YouTube Resmi</label>
                  <input
                    type="text"
                    value={pengaturan.sosial_media.youtube}
                    onChange={(e) =>
                      setPengaturan({
                        ...pengaturan,
                        sosial_media: { ...pengaturan.sosial_media, youtube: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">URL Instagram Resmi</label>
                  <input
                    type="text"
                    value={pengaturan.sosial_media.instagram}
                    onChange={(e) =>
                      setPengaturan({
                        ...pengaturan,
                        sosial_media: { ...pengaturan.sosial_media, instagram: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">URL TikTok Resmi</label>
                  <input
                    type="text"
                    value={pengaturan.sosial_media.tiktok}
                    onChange={(e) =>
                      setPengaturan({
                        ...pengaturan,
                        sosial_media: { ...pengaturan.sosial_media, tiktok: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">URL Facebook Resmi</label>
                  <input
                    type="text"
                    value={pengaturan.sosial_media.facebook}
                    onChange={(e) =>
                      setPengaturan({
                        ...pengaturan,
                        sosial_media: { ...pengaturan.sosial_media, facebook: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Google Maps Embed URL (Peta Wilayah Desa di Footer)
              </label>
              <input
                type="text"
                value={pengaturan.google_maps_embed}
                onChange={(e) => setPengaturan({ ...pengaturan, google_maps_embed: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan Kontak & Profil</span>
            </button>
          </div>
        </form>
      )}

      {/* =========================================================================
          TAB 7: KELOLA GALERI FOTO KEGIATAN DESA
      ========================================================================= */}
      {activeTab === 'kelola_galeri' && <KelolaGaleriKegiatan />}

      {/* =========================================================================
          TAB 8: KELOLA STATISTIK KEPENDUDUKAN & PROGRAM INTERVENSI DESA
      ========================================================================= */}
      {activeTab === 'kelola_statistik' && <KelolaStatistikDesa />}

      {/* =========================================================================
          TAB 9: PENGATURAN KOP & TEMPLATE NASKAH DINAS RESMI
      ========================================================================= */}
      {activeTab === 'pengaturan_kop' && (
        <form
          onSubmit={handleSavePengaturanKop}
          className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6"
        >
          {/* Hidden File Inputs for Logo Kiri & Logo Kanan */}
          <input
            ref={logoKiriInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleLogoUpload(e, 'kiri')}
            className="hidden"
          />
          <input
            ref={logoKananInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleLogoUpload(e, 'kanan')}
            className="hidden"
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-heading flex items-center gap-2">
                <Stamp className="w-5 h-5 text-[#1565C0]" />
                <span>Pengaturan Kop & Template Naskah Dinas Resmi</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Konfigurasi logo kiri & kanan, standar kop naskah dinas, nomor surat awal, pejabat penandatangan, dan format register sesuai Permendagri.
              </p>
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#2E7D32] hover:bg-[#256629] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Pengaturan Kop</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Form Kolom Kiri */}
            <div className="lg:col-span-7 space-y-5">
              {/* Bagian 1: Pengaturan Logo Kop Surat (Kiri & Kanan) */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="font-bold text-xs text-[#0D2A4A] flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#1565C0]" />
                  <span>Logo Kop Naskah Dinas Resmi (Logo Kiri & Kanan)</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Sesuai standar Permendagri, logo kiri umumnya Lambang Daerah / Garuda, sedangkan logo kanan adalah Lambang Resmi Desa / BPD (opsional).
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Logo Kiri */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2.5 flex flex-col justify-between">
                    <div>
                      <div className="text-[11px] font-bold text-slate-800 flex items-center justify-between">
                        <span>Logo Kiri (Pemda / Garuda) *</span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded font-semibold">Wajib</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Posisi kiri atas kop surat</div>
                    </div>

                    <div className="flex items-center gap-3 py-1">
                      <div className="w-14 h-14 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                        <img
                          src={pengaturan.kop_logo_kiri_url || pengaturan.kop_logo_url || '/logo.png'}
                          alt="Logo Kiri"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="text-[10px] text-slate-600 truncate">
                        <div className="font-mono truncate">
                          {pengaturan.kop_logo_kiri_url?.startsWith('data:') ? 'Custom Logo Diunggah' : '/logo.png'}
                        </div>
                        <div className="text-slate-400">Format: PNG, JPG, SVG</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => logoKiriInputRef.current?.click()}
                        className="flex-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Unggah Logo Kiri</span>
                      </button>
                      {(pengaturan.kop_logo_kiri_url && pengaturan.kop_logo_kiri_url !== '/logo.png') && (
                        <button
                          type="button"
                          onClick={handleResetLogoKiri}
                          className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer"
                          title="Kembalikan ke default"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Logo Kanan */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2.5 flex flex-col justify-between">
                    <div>
                      <div className="text-[11px] font-bold text-slate-800 flex items-center justify-between">
                        <span>Logo Kanan (Desa / Lembaga)</span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-semibold">Opsional</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Posisi kanan atas kop surat</div>
                    </div>

                    <div className="flex items-center gap-3 py-1">
                      <div className="w-14 h-14 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                        {pengaturan.kop_logo_kanan_url ? (
                          <img
                            src={pengaturan.kop_logo_kanan_url}
                            alt="Logo Kanan"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="text-[9px] text-slate-400 text-center italic">
                            Tanpa Logo
                          </div>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-600 truncate">
                        <div className="font-mono truncate">
                          {pengaturan.kop_logo_kanan_url ? 'Custom Logo Diunggah' : '(Kosong)'}
                        </div>
                        <div className="text-slate-400">Format: PNG, JPG, SVG</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => logoKananInputRef.current?.click()}
                        className="flex-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{pengaturan.kop_logo_kanan_url ? 'Ganti Logo Kanan' : 'Unggah Logo Kanan'}</span>
                      </button>
                      {pengaturan.kop_logo_kanan_url && (
                        <button
                          type="button"
                          onClick={handleRemoveLogoKanan}
                          className="px-2 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer"
                          title="Hapus logo kanan"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bagian 2: Teks Kop Surat */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="font-bold text-xs text-[#0D2A4A] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#1565C0]" />
                  <span>Struktur Teks Kop Naskah Dinas</span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Baris Kop 1 (Nama Pemerintah Kabupaten) *
                  </label>
                  <input
                    type="text"
                    required
                    value={pengaturan.kop_baris1 || 'PEMERINTAH KABUPATEN LOMBOK BARAT'}
                    onChange={(e) => setPengaturan({ ...pengaturan, kop_baris1: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:border-[#1565C0]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Baris Kop 2 (Nama Kecamatan) *
                  </label>
                  <input
                    type="text"
                    required
                    value={pengaturan.kop_baris2 || 'KECAMATAN NARMADA'}
                    onChange={(e) => setPengaturan({ ...pengaturan, kop_baris2: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:border-[#1565C0]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Baris Kop 3 (Nama Instansi / Kantor Desa) *
                  </label>
                  <input
                    type="text"
                    required
                    value={pengaturan.kop_baris3 || 'KANTOR KEPALA DESA NYURLEMBANG'}
                    onChange={(e) => setPengaturan({ ...pengaturan, kop_baris3: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-[#0D2A4A] focus:outline-hidden focus:border-[#1565C0]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Alamat Kantor Resmi
                    </label>
                    <input
                      type="text"
                      value={pengaturan.alamat_kantor}
                      onChange={(e) => setPengaturan({ ...pengaturan, alamat_kantor: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Kode Pos
                    </label>
                    <input
                      type="text"
                      value={pengaturan.kode_pos}
                      onChange={(e) => setPengaturan({ ...pengaturan, kode_pos: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Kontak Telepon / WhatsApp KPPID
                    </label>
                    <input
                      type="text"
                      value={pengaturan.telepon_kppid}
                      onChange={(e) => setPengaturan({ ...pengaturan, telepon_kppid: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Email Resmi Desa
                    </label>
                    <input
                      type="email"
                      value={pengaturan.email_desa}
                      onChange={(e) => setPengaturan({ ...pengaturan, email_desa: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Bagian 3: Pejabat Penandatangan, Penomoran Awal & Pola Format */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="font-bold text-xs text-[#0D2A4A] flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-[#2E7D32]" />
                  <span>Pejabat Penandatangan, Nomor Awal & Format Register</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Nama Lengkap & Gelar Pejabat Penandatangan *
                    </label>
                    <input
                      type="text"
                      required
                      value={pengaturan.pejabat_penandatangan_nama || 'H. MUHAMMAD RIDWAN, S.Pd.I'}
                      onChange={(e) => setPengaturan({ ...pengaturan, pejabat_penandatangan_nama: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Jabatan Resmi Penandatangan *
                    </label>
                    <input
                      type="text"
                      required
                      value={pengaturan.pejabat_penandatangan_jabatan || 'Kepala Desa Nyurlembang'}
                      onChange={(e) => setPengaturan({ ...pengaturan, pejabat_penandatangan_jabatan: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      NIPD / NIP Pejabat
                    </label>
                    <input
                      type="text"
                      value={pengaturan.pejabat_penandatangan_nipd || '19750812 200801 1 004'}
                      onChange={(e) => setPengaturan({ ...pengaturan, pejabat_penandatangan_nipd: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Nomor Surat Dimulai Dari (Nomor Awal Register) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={pengaturan.nomor_surat_mulai || 1}
                      onChange={(e) =>
                        setPengaturan({
                          ...pengaturan,
                          nomor_surat_mulai: Math.max(1, parseInt(e.target.value, 10) || 1),
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-[#1565C0] focus:outline-hidden"
                      placeholder="Contoh: 1 atau 50"
                    />
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Nomor urut registrasi surat keluar akan dimulai dari angka ini (misal: 1 menjadi 001).
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Pola Format Nomor Register Surat Keluar
                  </label>
                  <input
                    type="text"
                    value={pengaturan.format_nomor_surat || '470/[REG]/Des-NL/[BULAN_ROMAWI]/[TAHUN]'}
                    onChange={(e) => setPengaturan({ ...pengaturan, format_nomor_surat: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:outline-hidden"
                  />
                  <div className="text-[10px] text-slate-500 mt-1">
                    Variabel otomatis: <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-slate-800">[REG]</code> (nomor urut 3 digit), <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-slate-800">[BULAN_ROMAWI]</code>, <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-slate-800">[TAHUN]</code>
                  </div>
                </div>
              </div>
            </div>

            {/* Kolom Kanan: Pratinjau Langsung (Live Preview) Kop Naskah Dinas */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-700 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-[#1565C0]" />
                  <span>Pratinjau Kop Naskah Dinas Resmi</span>
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono">
                  Standar F4 / Folio
                </span>
              </div>

              <div className="p-5 bg-white rounded-2xl border-2 border-slate-300 shadow-sm text-center relative overflow-hidden">
                <div className="relative border-b-2 border-black pb-3 mb-4">
                  {/* Logo Kiri */}
                  <img
                    src={pengaturan.kop_logo_kiri_url || pengaturan.kop_logo_url || '/logo.png'}
                    alt="Logo Kiri Daerah"
                    className="absolute left-1 top-0 w-12 h-12 object-contain"
                  />

                  {/* Logo Kanan (Jika ada) */}
                  {pengaturan.kop_logo_kanan_url && (
                    <img
                      src={pengaturan.kop_logo_kanan_url}
                      alt="Logo Kanan Desa"
                      className="absolute right-1 top-0 w-12 h-12 object-contain"
                    />
                  )}

                  <div className={`text-center text-black ${pengaturan.kop_logo_kanan_url ? 'px-14' : 'pl-14 pr-2'}`}>
                    <p className="text-[10px] font-bold uppercase tracking-wider leading-tight">
                      {pengaturan.kop_baris1 || 'PEMERINTAH KABUPATEN LOMBOK BARAT'}
                    </p>
                    <p className="text-[11px] font-bold uppercase tracking-wider leading-tight">
                      {pengaturan.kop_baris2 || 'KECAMATAN NARMADA'}
                    </p>
                    <p className="text-xs font-black uppercase tracking-widest leading-tight mt-0.5">
                      {pengaturan.kop_baris3 || 'KANTOR KEPALA DESA NYURLEMBANG'}
                    </p>
                    <p className="text-[8px] italic text-slate-700 mt-1 leading-tight">
                      {pengaturan.alamat_kantor}, Kode Pos {pengaturan.kode_pos}
                    </p>
                    <p className="text-[8px] italic text-slate-700 leading-tight">
                      Layanan KPPID: {pengaturan.telepon_kppid} • Email: {pengaturan.email_desa}
                    </p>
                  </div>
                </div>

                <div className="py-2 text-center">
                  <div className="text-[11px] font-bold underline uppercase tracking-wide text-black">
                    SURAT KETERANGAN RESMI DESA
                  </div>
                  <div className="text-[10px] text-slate-700 font-mono mt-0.5">
                    Nomor: {(pengaturan.format_nomor_surat || '470/[REG]/Des-NL/[BULAN_ROMAWI]/[TAHUN]')
                      .replace('[REG]', (pengaturan.nomor_surat_mulai || 1).toString().padStart(3, '0'))
                      .replace('[BULAN_ROMAWI]', ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'][new Date().getMonth()])
                      .replace('[TAHUN]', new Date().getFullYear().toString())}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-dashed border-slate-200 text-left text-[9px] text-slate-500 space-y-1">
                  <div className="font-semibold text-slate-700">Tanda Tangan Elektronik & Basah:</div>
                  <div className="flex justify-end pt-2">
                    <div className="text-center min-w-[140px]">
                      <div>Nyurlembang, {new Date().toLocaleDateString('id-ID')}</div>
                      <div className="font-semibold text-slate-800">
                        {pengaturan.pejabat_penandatangan_jabatan || 'Kepala Desa Nyurlembang'}
                      </div>
                      <div className="h-10 flex items-center justify-center text-slate-400 italic text-[8px]">
                        ( Tanda Tangan & Cap Stempel )
                      </div>
                      <div className="font-bold text-slate-900 underline">
                        {pengaturan.pejabat_penandatangan_nama || 'H. MUHAMMAD RIDWAN, S.Pd.I'}
                      </div>
                      <div className="text-[8px] font-mono text-slate-600">
                        NIPD: {pengaturan.pejabat_penandatangan_nipd || '19750812 200801 1 004'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0 mt-0.5" />
                <span>
                  Pengaturan logo dan nomor register ini terhubung langsung ke template cetak naskah dinas resmi, ekspor PDF murni (F4/Folio), dan buku register.
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#2E7D32] hover:bg-[#256629] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Pengaturan Kop & Template Naskah</span>
            </button>
          </div>
        </form>
      )}

      {/* =========================================================================
          MODAL DETAIL & UPDATE STATUS PERMOHONAN
      ========================================================================= */}
      {selectedPermohonan && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150 overflow-hidden">
            {/* Header Terkunci (Sticky) */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-white shrink-0">
              <div>
                <h3 className="font-bold text-slate-900 text-base font-heading">
                  Verifikasi Permohonan Surat
                </h3>
                <div className="text-xs font-mono font-bold text-emerald-700 mt-0.5">
                  Tiket: {selectedPermohonan.kode_tiket}
                </div>
              </div>
              <button
                onClick={() => setSelectedPermohonan(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                aria-label="Tutup Dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <div className="text-slate-400">Nama Pemohon:</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{selectedPermohonan.nama_pemohon}</div>
                </div>
                <div>
                  <div className="text-slate-400">NIK KTP:</div>
                  <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">{selectedPermohonan.nik}</div>
                </div>
                <div>
                  <div className="text-slate-400">Jenis Surat:</div>
                  <div className="font-bold text-emerald-800 mt-0.5">{selectedPermohonan.jenis_surat_nama}</div>
                </div>
                <div>
                  <div className="text-slate-400">Wilayah Dusun:</div>
                  <div className="font-semibold text-slate-800 mt-0.5">{selectedPermohonan.dusun}</div>
                </div>
                <div>
                  <div className="text-slate-400">Nomor WhatsApp Pemohon:</div>
                  <div className="font-mono font-bold text-emerald-700 text-sm mt-0.5 flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{selectedPermohonan.nomor_whatsapp || '-'}</span>
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="text-slate-400">Keperluan / Tujuan:</div>
                  <div className="font-medium text-slate-900 mt-0.5">{selectedPermohonan.keperluan}</div>
                </div>
              </div>

              {/* Berkas KTP & KK */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-800">Berkas Lampiran Persyaratan:</div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() =>
                      handleViewSignedUrl(
                        'Foto KTP Pemohon',
                        selectedPermohonan.berkas_ktp_url || 'ktp.jpg',
                        selectedPermohonan.nik
                      )
                    }
                    className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                    <span>Lihat Foto KTP (Signed URL)</span>
                  </button>
                  <button
                    onClick={() =>
                      handleViewSignedUrl(
                        'Foto Kartu Keluarga',
                        selectedPermohonan.berkas_kk_url || 'kk.jpg',
                        selectedPermohonan.nik
                      )
                    }
                    className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Lihat Foto KK (Signed URL)</span>
                  </button>
                  {selectedPermohonan.berkas_pas_foto_url && (
                    <button
                      onClick={() =>
                        handleViewSignedUrl(
                          'Pas Foto Resmi Pemohon',
                          selectedPermohonan.berkas_pas_foto_url!,
                          selectedPermohonan.nik
                        )
                      }
                      className="px-3 py-1.5 bg-amber-50 border border-amber-300 hover:bg-amber-100 rounded-lg font-semibold text-amber-800 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5 text-amber-600" />
                      <span>Lihat Pas Foto (3x4/4x6)</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Form Update Status */}
              <div className="space-y-3 pt-2">
                <label className="block font-bold text-slate-800">
                  Ubah Status Tahapan:
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as StatusPermohonan)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs"
                >
                  <option value="Diajukan">Diajukan</option>
                  <option value="Diverifikasi & Dicetak">Diverifikasi & Dicetak (Generate Nomor Surat)</option>
                  <option value="Siap Diambil">Siap Diambil (Warga Mengambil di Loket)</option>
                  <option value="Selesai">Selesai (Sudah Diambil Pemohon)</option>
                  <option value="Ditolak">Ditolak (Berkas Tidak Lengkap)</option>
                </select>

                <label className="block font-bold text-slate-800">
                  Catatan untuk Pemohon:
                </label>
                <textarea
                  rows={2}
                  value={catatanPetugas}
                  onChange={(e) => setCatatanPetugas(e.target.value)}
                  placeholder="Contoh: Dokumen telah diverifikasi dan siap diambil di loket pelayanan kantor desa."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>
            </div>

            {/* Footer Terkunci (Sticky) */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadPdfReal(selectedPermohonan)}
                  disabled={isGeneratingPdfId === selectedPermohonan.id}
                  className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  title="Unduh naskah dinas resmi dalam format PDF asli F4"
                >
                  {isGeneratingPdfId === selectedPermohonan.id ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>{isGeneratingPdfId === selectedPermohonan.id ? 'Membuat PDF...' : 'Download PDF'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSelectPrint(selectedPermohonan)}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  title="Cetak langsung dengan layout naskah dinas Permendagri"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Langsung / Print</span>
                </button>
                {selectedPermohonan.nomor_whatsapp && (
                  <a
                    href={getWhatsAppNotificationUrl(
                      { ...selectedPermohonan, status: newStatus },
                      catatanPetugas
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    title="Kirim pemberitahuan status terbaru langsung ke WhatsApp pemohon"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Kirim Notifikasi WA</span>
                  </a>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPermohonan(null)}
                  className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleUpdateStatus}
                  disabled={isUpdating}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold disabled:opacity-50 shadow-xs cursor-pointer"
                >
                  {isUpdating ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL FORM EDIT JENIS SURAT & PERSYARATAN (STICKY HEADER & FOOTER)
      ========================================================================= */}
      {editingSurat && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveSurat}
            className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150 max-h-[90vh] flex flex-col overflow-hidden"
          >
            {/* Header Terkunci (Sticky) */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-white shrink-0">
              <div>
                <h3 className="font-bold text-slate-900 text-base font-heading">
                  {editingSurat.id ? 'Edit Jenis Surat & Persyaratan' : 'Tambah Jenis Surat Baru'}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Sesuaikan informasi master naskah dinas, formulir blanko, dan berkas warga
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingSurat(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body Scrollable Vertikal */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs custom-scrollbar">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Kode Singkat (e.g. SKU, SKTM)</label>
                  <input
                    type="text"
                    required
                    value={editingSurat.kode}
                    onChange={(e) => setEditingSurat({ ...editingSurat, kode: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Estimasi Hari Kerja</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={editingSurat.estimasi_hari}
                    onChange={(e) => setEditingSurat({ ...editingSurat, estimasi_hari: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nama Lengkap Naskah Dinas</label>
                <input
                  type="text"
                  required
                  value={editingSurat.nama}
                  onChange={(e) => setEditingSurat({ ...editingSurat, nama: e.target.value })}
                  placeholder="Contoh: Surat Keterangan Kematian (SKK)"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Kategori Pelayanan</label>
                <input
                  type="text"
                  required
                  value={editingSurat.kategori}
                  onChange={(e) => setEditingSurat({ ...editingSurat, kategori: e.target.value })}
                  placeholder="Contoh: Kependudukan / Ekonomi & Usaha"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Deskripsi & Peruntukan</label>
                <textarea
                  rows={2}
                  value={editingSurat.deskripsi}
                  onChange={(e) => setEditingSurat({ ...editingSurat, deskripsi: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              {/* UPLOAD BLANKO / TEMPLATE DOKUMEN */}
              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-blue-950 font-bold text-xs flex items-center gap-1.5">
                      <FileDown className="w-4 h-4 text-blue-700" />
                      <span>Upload File Blanko / Template Dokumen</span>
                    </label>
                    <p className="text-[11px] text-blue-700 mt-0.5">
                      File format PDF/DOC/DOCX yang dapat diunduh pemohon sebelum mengisi formulir
                    </p>
                  </div>
                </div>

                {editingSurat.template_blanko_url ? (
                  <div className="p-3 bg-white border border-blue-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2 truncate">
                      <FileCheck className="w-4 h-4 text-blue-600 shrink-0" />
                      <div className="truncate">
                        <div className="font-bold text-slate-800 text-xs truncate">
                          {editingSurat.nama_file_blanko || 'template_dokumen.docx'}
                        </div>
                        <div className="text-[10px] text-emerald-700 font-semibold">
                          ✓ File template siap diunduh oleh warga pemohon
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <a
                        href={editingSurat.template_blanko_url}
                        download={editingSurat.nama_file_blanko || `${editingSurat.kode}-template.docx`}
                        className="px-2.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold flex items-center gap-1"
                        title="Unduh untuk cek"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Cek</span>
                      </a>
                      <button
                        type="button"
                        onClick={() =>
                          setEditingSurat({
                            ...editingSurat,
                            template_blanko_url: undefined,
                            nama_file_blanko: undefined,
                          })
                        }
                        className="px-2 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-semibold"
                        title="Hapus template"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <label className="flex-1 px-4 py-2.5 bg-white border border-dashed border-blue-300 hover:border-blue-500 rounded-xl text-xs font-semibold text-blue-800 flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs">
                      <Upload className="w-4 h-4 text-blue-600" />
                      <span>Pilih File Blanko dari Perangkat (PDF/DOCX)</span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,image/*"
                        onChange={handleTemplateBlankoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* KELOLA PERSYARATAN BERKAS & TOGGLE KAMERA HP */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-800 font-bold">
                    Daftar Berkas Persyaratan & Opsi Kamera HP:
                  </label>
                  <span className="text-[10px] text-slate-500">
                    Warga dapat foto langsung via kamera HP jika diaktifkan
                  </span>
                </div>

                <div className="space-y-2 bg-white p-3 rounded-xl border border-slate-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSyaratInput}
                      onChange={(e) => setNewSyaratInput(e.target.value)}
                      placeholder="Contoh: Surat Pengantar RT / Kadus"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden text-xs"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSyaratTag();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddSyaratTag}
                      className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold shrink-0 cursor-pointer text-xs"
                    >
                      Tambah Syarat
                    </button>
                  </div>

                  <label className="flex items-center gap-2 text-[11px] text-slate-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={newSyaratIzinkanKamera}
                      onChange={(e) => setNewSyaratIzinkanKamera(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                    />
                    <Camera className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Izinkan warga memotret langsung dengan Kamera HP</span>
                  </label>
                </div>

                {/* List Syarat yang Ditagih */}
                <div className="space-y-2 pt-1">
                  {(editingSurat.persyaratan_items && editingSurat.persyaratan_items.length > 0
                    ? editingSurat.persyaratan_items
                    : editingSurat.persyaratan.map((s, idx) => ({
                        id: `syarat-${idx}`,
                        nama: s,
                        izinkan_kamera: true,
                      }))
                  ).map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl text-xs hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        <span className="text-emerald-700 font-bold">✓</span>
                        <span className="text-slate-800 font-medium truncate">{item.nama}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Toggle Tombol Kamera */}
                        <button
                          type="button"
                          onClick={() => handleToggleCameraSyarat(idx)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                            item.izinkan_kamera
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                          title={
                            item.izinkan_kamera
                              ? 'Kamera aktif: warga bisa ambil foto HP langsung'
                              : 'Kamera nonaktif: warga hanya bisa upload berkas biasa'
                          }
                        >
                          <Camera className="w-3 h-3" />
                          <span>{item.izinkan_kamera ? 'Kamera HP: Aktif' : 'Kamera: Nonaktif'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemoveSyaratTag(idx)}
                          className="text-rose-600 hover:text-rose-800 p-1 rounded-md hover:bg-rose-50 cursor-pointer"
                          title="Hapus syarat ini"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Terkunci (Sticky) */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingSurat(null)}
                className="px-4 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                Simpan Jenis Surat
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================================
          MODAL FORM EDIT PEJABAT DESA & FOTO
      ========================================================================= */}
      {editingPejabat && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSavePejabat}
            className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150 overflow-hidden"
          >
            {/* Header Terkunci (Sticky) */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-white shrink-0">
              <h3 className="font-bold text-slate-900 text-base font-heading">
                {editingPejabat.id ? 'Edit Aparatur Desa' : 'Tambah Aparatur Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingPejabat(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                aria-label="Tutup Dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nama Lengkap & Gelar *</label>
                <input
                  type="text"
                  required
                  value={editingPejabat.nama}
                  onChange={(e) => setEditingPejabat({ ...editingPejabat, nama: e.target.value })}
                  placeholder="Contoh: H. Wardi, S.AP"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Jabatan Kedinasan *</label>
                <div className="space-y-1.5">
                  <select
                    value={[
                      'Kepala Desa',
                      'Sekretaris Desa',
                      'Kepala Seksi Pemerintahan',
                      'Kepala Seksi Kesejahteraan',
                      'Kepala Seksi Pelayanan',
                      'Kepala Urusan Tata Usaha & Umum',
                      'Kepala Urusan Keuangan',
                      'Kepala Urusan Perencanaan',
                      'Kepala Dusun Nyurlembang Daye',
                      'Kepala Dusun Nyurlembang Barat',
                      'Kepala Dusun Telaga Ngembeng (Telage Ngembeng)',
                      'Kepala Dusun Tatar'
                    ].includes(editingPejabat.jabatan) ? editingPejabat.jabatan : 'custom'}
                    onChange={(e) => {
                      if (e.target.value !== 'custom') {
                        setEditingPejabat({ ...editingPejabat, jabatan: e.target.value });
                      }
                    }}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="" disabled>-- Pilih Jabatan Standar SOTK --</option>
                    <option value="Kepala Desa">Kepala Desa</option>
                    <option value="Sekretaris Desa">Sekretaris Desa</option>
                    <option value="Kepala Seksi Pemerintahan">Kepala Seksi Pemerintahan (Kasi)</option>
                    <option value="Kepala Seksi Kesejahteraan">Kepala Seksi Kesejahteraan (Kasi)</option>
                    <option value="Kepala Seksi Pelayanan">Kepala Seksi Pelayanan (Kasi)</option>
                    <option value="Kepala Urusan Tata Usaha & Umum">Kepala Urusan Tata Usaha & Umum (Kaur)</option>
                    <option value="Kepala Urusan Keuangan">Kepala Urusan Keuangan (Kaur)</option>
                    <option value="Kepala Urusan Perencanaan">Kepala Urusan Perencanaan (Kaur)</option>
                    <option value="Kepala Dusun Nyurlembang Daye">Kepala Dusun Nyurlembang Daye</option>
                    <option value="Kepala Dusun Nyurlembang Barat">Kepala Dusun Nyurlembang Barat</option>
                    <option value="Kepala Dusun Telaga Ngembeng (Telage Ngembeng)">Kepala Dusun Telaga Ngembeng (Telage Ngembeng)</option>
                    <option value="Kepala Dusun Tatar">Kepala Dusun Tatar</option>
                    <option value="custom">-- Pilihan Kustom / Ketik Manual di Bawah --</option>
                  </select>
                  <input
                    type="text"
                    required
                    value={editingPejabat.jabatan}
                    onChange={(e) => setEditingPejabat({ ...editingPejabat, jabatan: e.target.value })}
                    placeholder="Ketik atau sesuaikan nama jabatan..."
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nomor Urutan Tampil</label>
                <input
                  type="number"
                  min={1}
                  value={editingPejabat.urutan}
                  onChange={(e) => setEditingPejabat({ ...editingPejabat, urutan: Number(e.target.value) })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">NIP / NIPD</label>
                  <input
                    type="text"
                    value={editingPejabat.nip || ''}
                    onChange={(e) => setEditingPejabat({ ...editingPejabat, nip: e.target.value })}
                    placeholder="19800101 201001 1 001"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Nomor Telepon / WA</label>
                  <input
                    type="text"
                    value={editingPejabat.telepon || ''}
                    onChange={(e) => setEditingPejabat({ ...editingPejabat, telepon: e.target.value })}
                    placeholder="0819..."
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Foto Pejabat / Aparatur *</label>
                <div className="flex items-center gap-2 mb-2">
                  <label className="flex items-center gap-2 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-200 cursor-pointer font-semibold text-xs transition-colors">
                    <Upload className="w-4 h-4 text-emerald-700" />
                    <span>Unggah Foto dari Perangkat</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePejabatPhotoUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[11px] text-slate-400 font-medium">atau tempel URL</span>
                </div>
                <input
                  type="text"
                  required
                  value={editingPejabat.foto_url}
                  onChange={(e) => setEditingPejabat({ ...editingPejabat, foto_url: e.target.value })}
                  placeholder="https://... atau data foto terunggah"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-[11px]"
                />
                {editingPejabat.foto_url && (
                  <div className="mt-2 flex items-center gap-3">
                    <img
                      src={editingPejabat.foto_url}
                      alt="Preview"
                      className="w-14 h-14 rounded-xl object-cover border border-slate-200 shadow-xs"
                    />
                    <span className="text-[11px] text-emerald-700 font-medium">✓ Foto siap digunakan</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Uraian Tugas Pokok</label>
                <textarea
                  rows={2}
                  value={editingPejabat.tugas || ''}
                  onChange={(e) => setEditingPejabat({ ...editingPejabat, tugas: e.target.value })}
                  placeholder="Menyelenggarakan urusan pemerintahan..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            {/* Footer Terkunci (Sticky) */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingPejabat(null)}
                className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs"
              >
                Simpan Pejabat
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================================
          MODAL FORM EDIT BANNER SLIDE HERO
      ========================================================================= */}
      {editingBanner && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveBanner}
            className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150 overflow-hidden"
          >
            {/* Header Terkunci (Sticky) */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-white shrink-0">
              <h3 className="font-bold text-slate-900 text-base font-heading">
                {editingBanner.id ? 'Edit Slide Banner' : 'Tambah Slide Banner'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingBanner(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                aria-label="Tutup Dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Gambar Banner Latar (Resolusi Tinggi) *</label>
                <div className="flex items-center gap-2 mb-2">
                  <label className="flex items-center gap-2 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-200 cursor-pointer font-semibold text-xs transition-colors">
                    <Upload className="w-4 h-4 text-emerald-700" />
                    <span>Unggah Gambar Banner</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerPhotoUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[11px] text-slate-400 font-medium">atau tempel URL</span>
                </div>
                <input
                  type="text"
                  required
                  value={editingBanner.gambar_url}
                  onChange={(e) => setEditingBanner({ ...editingBanner, gambar_url: e.target.value })}
                  placeholder="https://... atau data gambar terunggah"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-[11px]"
                />
                {editingBanner.gambar_url && (
                  <div className="mt-2 h-28 rounded-xl overflow-hidden border border-slate-200 shadow-xs">
                    <img src={editingBanner.gambar_url} alt="Pratinjau Banner" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Judul / Sorotan Potensi *</label>
                <input
                  type="text"
                  required
                  value={editingBanner.judul}
                  onChange={(e) => setEditingBanner({ ...editingBanner, judul: e.target.value })}
                  placeholder="Contoh: Pesona Alam Asri & Pertanian Subur"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Subjudul / Keterangan Singkat *</label>
                <textarea
                  rows={2}
                  required
                  value={editingBanner.subjudul}
                  onChange={(e) => setEditingBanner({ ...editingBanner, subjudul: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="chk-aktif-banner"
                  checked={editingBanner.aktif}
                  onChange={(e) => setEditingBanner({ ...editingBanner, aktif: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 cursor-pointer"
                />
                <label htmlFor="chk-aktif-banner" className="font-semibold text-slate-700 cursor-pointer">
                  Aktifkan slide banner ini dalam rotasi otomatis
                </label>
              </div>
            </div>

            {/* Footer Terkunci (Sticky) */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingBanner(null)}
                className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs"
              >
                Simpan Banner
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================================
          TAB: KELOLA BERITA & KONTEN PUBLIK DENGAN RICHTEXTEDITOR
      ========================================================================= */}
      {activeTab === 'kelola_berita' && (
        <div className="card-kedinasan p-6">
          <KelolaBeritaDesa currentUser={currentUser} />
        </div>
      )}

      {/* =========================================================================
          TAB: KELOLA PRODUK HUKUM & PERATURAN DESA (JDIH)
      ========================================================================= */}
      {activeTab === 'produk_hukum' && (
        <div className="card-kedinasan p-6">
          <KelolaProdukHukum />
        </div>
      )}

      {/* =========================================================================
          TAB: KELOLA PENGADUAN & ASPIRASI WARGA
      ========================================================================= */}
      {activeTab === 'kelola_pengaduan' && (
        <div className="card-kedinasan p-3 sm:p-6 max-w-full overflow-hidden">
          <KelolaPengaduanWarga currentUser={currentUser} />
        </div>
      )}

      {/* =========================================================================
          TAB: MANAJEMEN USER (STAF DESA & KONTRIBUTOR)
      ========================================================================= */}
      {activeTab === 'manajemen_user' && (
        <div className="card-kedinasan p-6">
          <KelolaManajemenUser currentUser={currentUser} />
        </div>
      )}

      {/* =========================================================================
          MODAL SIGNED URL PREVIEW BERKAS KTP / KK
      ========================================================================= */}
      {previewBerkas && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm font-heading">
                  {previewBerkas.title}
                </h3>
                <div className="text-[11px] text-slate-400 font-mono">
                  NIK: {previewBerkas.nik}
                </div>
              </div>
              <button
                onClick={() => setPreviewBerkas(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="h-56 bg-slate-100 rounded-2xl border border-slate-200 flex flex-col items-center justify-center p-4 text-center">
              <ShieldAlert className="w-10 h-10 text-emerald-600 mb-2" />
              <div className="text-xs font-bold text-slate-900">
                Dokumen Tersimpan di Supabase Storage
              </div>
              <div className="text-[11px] text-slate-500 mt-1 max-w-xs truncate">
                {previewBerkas.url}
              </div>
              <span className="mt-3 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">
                ✓ Akses RLS Valid (Role: staff_desa)
              </span>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setPreviewBerkas(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL KONFIRMASI HAPUS (YA / TIDAK) SERAGAM UNTUK CRUD
      ========================================================================= */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-bold text-slate-900 text-base font-heading">
                Konfirmasi Hapus Data
              </h3>
              <p className="text-xs text-slate-600">
                Apakah Anda yakin ingin menghapus{' '}
                <span className="font-bold text-slate-800">"{confirmDelete.nama}"</span>?
              </p>
              <p className="text-[11px] text-rose-500 font-medium">
                Tindakan ini permanen dan data yang dihapus tidak dapat dipulihkan.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                Tidak, Batalkan
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
              >
                Ya, Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}
        </main>
      </div>
    </div>
  );
};
