import React, { useState, useEffect } from 'react';
import {
  StatistikDesa,
  ProgramIntervensi,
  TransparansiApbdes,
  KelompokUsia,
  StatistikPendidikan,
  StatistikPekerjaan,
  DetailDusunStatistik
} from '../../types';
import { useRealtimeSync } from '../../lib/useRealtimeSync';
import {
  getStoredStatistikDesa,
  saveStoredStatistikDesa,
  getStoredApbdes,
  saveStoredApbdes,
  dbFetchStatistikDesa,
  dbSaveStatistikDesa,
  dbFetchApbdes,
  dbSaveApbdes,
} from '../../lib/supabaseClient';
import {
  BarChart3,
  Users,
  HeartHandshake,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  CheckCircle2,
  Coins,
  MapPin,
  TrendingUp,
  AlertCircle,
  Calendar,
  GraduationCap,
  Briefcase,
  Layers,
  PieChart,
  RotateCcw
} from 'lucide-react';

const formatAngka = (val: number | undefined | null): string => {
  if (val === undefined || val === null || isNaN(Number(val))) return '0';
  return Number(val).toLocaleString('id-ID');
};

export const KelolaStatistikDesa: React.FC = () => {
  const [statistik, setStatistik] = useState<StatistikDesa>(() => getStoredStatistikDesa());
  const [apbdes, setApbdes] = useState<TransparansiApbdes>(() => getStoredApbdes());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sub-Tab Navigasi Pengeditan
  const [activeTab, setActiveTab] = useState<
    'apbdes' | 'usia' | 'pendidikan' | 'pekerjaan' | 'demografi' | 'intervensi'
  >('apbdes');

  // Form State untuk Intervensi (Tambah / Edit)
  const [editingIntervensi, setEditingIntervensi] = useState<ProgramIntervensi | null>(null);
  const [isAddingIntervensi, setIsAddingIntervensi] = useState(false);
  const [intervensiForm, setIntervensiForm] = useState<Omit<ProgramIntervensi, 'id'>>({
    nama_program: '',
    kategori: 'Stunting & Gizi',
    target_sasaran: '',
    anggaran: 0,
    status: 'Berjalan',
    realisasi: 0,
    keterangan: '',
    dusun_fokus: 'Semua Dusun',
  });

  // State untuk Tambah Baris Baru
  const [newBidangBelanja, setNewBidangBelanja] = useState({ bidang: '', anggaran: 0 });
  const [showAddBidang, setShowAddBidang] = useState(false);

  const [newKelompokUsia, setNewKelompokUsia] = useState({ kategori: '', rentang: '', jumlah: 0 });
  const [showAddUsia, setShowAddUsia] = useState(false);

  const [newPendidikan, setNewPendidikan] = useState({ tingkat: '', jumlah: 0 });
  const [showAddPendidikan, setShowAddPendidikan] = useState(false);

  const [newPekerjaan, setNewPekerjaan] = useState({ jenis: '', jumlah: 0 });
  const [showAddPekerjaan, setShowAddPekerjaan] = useState(false);

  const loadData = async () => {
    const [freshStat, freshApbdes] = await Promise.allSettled([
      dbFetchStatistikDesa(),
      dbFetchApbdes(),
    ]);
    if (freshStat.status === 'fulfilled' && freshStat.value) {
      setStatistik(freshStat.value);
    }
    if (freshApbdes.status === 'fulfilled' && freshApbdes.value) {
      setApbdes(freshApbdes.value);
    }
  };

  useEffect(() => {
    setStatistik(getStoredStatistikDesa());
    setApbdes(getStoredApbdes());
    loadData();
  }, []);

  useRealtimeSync(['statistik_desa', 'transparansi_apbdes'], (evt) => {
    loadData();
    if (evt.source === 'remote') {
      showToast(
        evt.table === 'transparansi_apbdes'
          ? '⚡ Data Transparansi APBDes diperbarui dari komputer lain!'
          : '⚡ Data Statistik Desa diperbarui dari komputer lain!'
      );
    }
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const persistStatistik = async (newStat: StatistikDesa) => {
    setStatistik(newStat);
    saveStoredStatistikDesa(newStat);
    await dbSaveStatistikDesa(newStat);
  };

  const persistApbdes = async (newApbdes: TransparansiApbdes) => {
    setApbdes(newApbdes);
    saveStoredApbdes(newApbdes);
    await dbSaveApbdes(newApbdes);
  };

  // ==========================================
  // 1. HANDLER APBDES 2026
  // ==========================================
  const handleSaveApbdes = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated: TransparansiApbdes = {
      ...apbdes,
      tahun: Number(apbdes.tahun) || 2026,
      pendapatan: Number(apbdes.pendapatan) || 0,
      belanja: Number(apbdes.belanja) || 0,
      pembiayaan: Number(apbdes.pembiayaan) || 0,
      rincian_belanja: apbdes.rincian_belanja.map((item) => {
        const belanjaTotal = Number(apbdes.belanja) || 1;
        const computedPersen = Number(((item.anggaran / belanjaTotal) * 100).toFixed(1));
        return {
          ...item,
          anggaran: Number(item.anggaran),
          persen: computedPersen,
        };
      }),
    };
    await persistApbdes(updated);
    showToast('Data Transparansi APBDes berhasil disimpan ke semua komputer!');
  };

  const handleAddBidangBelanja = async () => {
    if (!newBidangBelanja.bidang.trim() || newBidangBelanja.anggaran <= 0) {
      alert('Mohon isi nama bidang dan anggaran dengan benar!');
      return;
    }
    const belanjaTotal = Number(apbdes.belanja) || 1;
    const computedPersen = Number(((newBidangBelanja.anggaran / belanjaTotal) * 100).toFixed(1));
    const updatedRincian = [
      ...apbdes.rincian_belanja,
      {
        bidang: newBidangBelanja.bidang.trim(),
        anggaran: Number(newBidangBelanja.anggaran),
        persen: computedPersen,
      },
    ];
    const updatedApbdes = { ...apbdes, rincian_belanja: updatedRincian };
    await persistApbdes(updatedApbdes);
    setNewBidangBelanja({ bidang: '', anggaran: 0 });
    setShowAddBidang(false);
    showToast('Bidang belanja baru berhasil ditambahkan ke semua komputer!');
  };

  const handleDeleteBidangBelanja = async (index: number) => {
    if (!window.confirm('Hapus bidang belanja ini?')) return;
    const updatedRincian = apbdes.rincian_belanja.filter((_, idx) => idx !== index);
    const updatedApbdes = { ...apbdes, rincian_belanja: updatedRincian };
    await persistApbdes(updatedApbdes);
    showToast('Bidang belanja dihapus dari semua komputer.');
  };

  // ==========================================
  // 2. HANDLER KELOMPOK USIA
  // ==========================================
  const handleSaveKelompokUsia = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalJiwa = statistik.total_penduduk || 1;
    const recalculated = statistik.kelompok_usia.map((item) => ({
      ...item,
      jumlah: Number(item.jumlah),
      persen: Number(((Number(item.jumlah) / totalJiwa) * 100).toFixed(1)),
    }));
    const updatedStat = { ...statistik, kelompok_usia: recalculated };
    await persistStatistik(updatedStat);
    showToast('Data statistik kelompok usia berhasil disimpan ke semua komputer!');
  };

  const handleAddKelompokUsia = async () => {
    if (!newKelompokUsia.kategori.trim() || newKelompokUsia.jumlah <= 0) {
      alert('Mohon lengkapi nama kategori dan jumlah jiwa!');
      return;
    }
    const totalJiwa = statistik.total_penduduk || 1;
    const newItem: KelompokUsia = {
      kategori: newKelompokUsia.kategori.trim(),
      rentang: newKelompokUsia.rentang.trim() || 'Semua Rentang',
      jumlah: Number(newKelompokUsia.jumlah),
      persen: Number(((Number(newKelompokUsia.jumlah) / totalJiwa) * 100).toFixed(1)),
    };
    const updatedList = [...statistik.kelompok_usia, newItem];
    const updatedStat = { ...statistik, kelompok_usia: updatedList };
    await persistStatistik(updatedStat);
    setNewKelompokUsia({ kategori: '', rentang: '', jumlah: 0 });
    setShowAddUsia(false);
    showToast('Kelompok usia baru berhasil ditambahkan!');
  };

  const handleDeleteKelompokUsia = async (index: number) => {
    if (!window.confirm('Hapus kategori kelompok usia ini?')) return;
    const updatedList = statistik.kelompok_usia.filter((_, idx) => idx !== index);
    const updatedStat = { ...statistik, kelompok_usia: updatedList };
    await persistStatistik(updatedStat);
    showToast('Kategori kelompok usia dihapus.');
  };

  // ==========================================
  // 3. HANDLER PENDIDIKAN
  // ==========================================
  const handleSavePendidikan = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalJiwa = statistik.total_penduduk || 1;
    const recalculated = statistik.pendidikan.map((item) => ({
      ...item,
      jumlah: Number(item.jumlah),
      persen: Number(((Number(item.jumlah) / totalJiwa) * 100).toFixed(1)),
    }));
    const updatedStat = { ...statistik, pendidikan: recalculated };
    await persistStatistik(updatedStat);
    showToast('Data tingkat pendidikan warga berhasil disimpan ke semua komputer!');
  };

  const handleAddPendidikan = async () => {
    if (!newPendidikan.tingkat.trim() || newPendidikan.jumlah <= 0) {
      alert('Mohon isi tingkat pendidikan dan jumlah jiwa!');
      return;
    }
    const totalJiwa = statistik.total_penduduk || 1;
    const newItem: StatistikPendidikan = {
      tingkat: newPendidikan.tingkat.trim(),
      jumlah: Number(newPendidikan.jumlah),
      persen: Number(((Number(newPendidikan.jumlah) / totalJiwa) * 100).toFixed(1)),
    };
    const updatedList = [...statistik.pendidikan, newItem];
    const updatedStat = { ...statistik, pendidikan: updatedList };
    await persistStatistik(updatedStat);
    setNewPendidikan({ tingkat: '', jumlah: 0 });
    setShowAddPendidikan(false);
    showToast('Tingkat pendidikan baru berhasil ditambahkan!');
  };

  const handleDeletePendidikan = async (index: number) => {
    if (!window.confirm('Hapus tingkat pendidikan ini?')) return;
    const updatedList = statistik.pendidikan.filter((_, idx) => idx !== index);
    const updatedStat = { ...statistik, pendidikan: updatedList };
    await persistStatistik(updatedStat);
    showToast('Tingkat pendidikan dihapus.');
  };

  // ==========================================
  // 4. HANDLER PROFESI / PEKERJAAN
  // ==========================================
  const handleSavePekerjaan = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalJiwa = statistik.total_penduduk || 1;
    const recalculated = statistik.pekerjaan.map((item) => ({
      ...item,
      jumlah: Number(item.jumlah),
      persen: Number(((Number(item.jumlah) / totalJiwa) * 100).toFixed(1)),
    }));
    const updatedStat = { ...statistik, pekerjaan: recalculated };
    await persistStatistik(updatedStat);
    showToast('Data mata pencaharian / profesi warga berhasil disimpan ke semua komputer!');
  };

  const handleAddPekerjaan = async () => {
    if (!newPekerjaan.jenis.trim() || newPekerjaan.jumlah <= 0) {
      alert('Mohon isi jenis pekerjaan dan jumlah jiwa!');
      return;
    }
    const totalJiwa = statistik.total_penduduk || 1;
    const newItem: StatistikPekerjaan = {
      jenis: newPekerjaan.jenis.trim(),
      jumlah: Number(newPekerjaan.jumlah),
      persen: Number(((Number(newPekerjaan.jumlah) / totalJiwa) * 100).toFixed(1)),
    };
    const updatedList = [...statistik.pekerjaan, newItem];
    const updatedStat = { ...statistik, pekerjaan: updatedList };
    await persistStatistik(updatedStat);
    setNewPekerjaan({ jenis: '', jumlah: 0 });
    setShowAddPekerjaan(false);
    showToast('Profesi baru berhasil ditambahkan!');
  };

  const handleDeletePekerjaan = async (index: number) => {
    if (!window.confirm('Hapus jenis profesi ini?')) return;
    const updatedList = statistik.pekerjaan.filter((_, idx) => idx !== index);
    const updatedStat = { ...statistik, pekerjaan: updatedList };
    await persistStatistik(updatedStat);
    showToast('Profesi warga dihapus.');
  };

  // ==========================================
  // 5. HANDLER DEMOGRAFI & 6 DUSUN
  // ==========================================
  const handleSaveDemografi = async (e: React.FormEvent) => {
    e.preventDefault();
    const calculatedTotal = Number(statistik.penduduk_laki) + Number(statistik.penduduk_perempuan);
    const updated: StatistikDesa = {
      ...statistik,
      total_penduduk: calculatedTotal > 0 ? calculatedTotal : Number(statistik.total_penduduk),
      penduduk_laki: Number(statistik.penduduk_laki),
      penduduk_perempuan: Number(statistik.penduduk_perempuan),
      jumlah_kk: Number(statistik.jumlah_kk),
      jumlah_rt: Number(statistik.jumlah_rt),
      jumlah_rw: Number(statistik.jumlah_rw),
      jumlah_dusun: Number(statistik.jumlah_dusun),
      luas_wilayah_ha: Number(statistik.luas_wilayah_ha),
    };
    await persistStatistik(updated);
    showToast('Data demografi & wilayah 4 dusun berhasil disimpan ke semua komputer!');
  };

  // ==========================================
  // 6. HANDLER INTERVENSI DESA
  // ==========================================
  const handleStartAddIntervensi = () => {
    setEditingIntervensi(null);
    setIntervensiForm({
      nama_program: '',
      kategori: 'Stunting & Gizi',
      target_sasaran: '50 Balita & Ibu Hamil',
      anggaran: 45000000,
      status: 'Berjalan',
      realisasi: 50,
      keterangan: 'Pemberian Makanan Tambahan (PMT) lokal dan suplemen mikronutrien di posyandu.',
      dusun_fokus: 'Dusun Nyurlembang Daye & Barat',
    });
    setIsAddingIntervensi(true);
  };

  const handleStartEditIntervensi = (item: ProgramIntervensi) => {
    setIsAddingIntervensi(false);
    setEditingIntervensi(item);
    setIntervensiForm({
      nama_program: item.nama_program,
      kategori: item.kategori,
      target_sasaran: item.target_sasaran,
      anggaran: item.anggaran,
      status: item.status,
      realisasi: item.realisasi,
      keterangan: item.keterangan,
      dusun_fokus: item.dusun_fokus,
    });
  };

  const handleSaveIntervensi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!intervensiForm.nama_program.trim()) {
      alert('Nama program intervensi wajib diisi!');
      return;
    }

    let updatedIntervensiList = [...statistik.intervensi];

    if (isAddingIntervensi) {
      const newItem: ProgramIntervensi = {
        id: `itv-${Date.now()}`,
        ...intervensiForm,
        anggaran: Number(intervensiForm.anggaran),
        realisasi: Number(intervensiForm.realisasi),
      };
      updatedIntervensiList = [newItem, ...updatedIntervensiList];
      setIsAddingIntervensi(false);
      showToast('Program intervensi baru berhasil ditambahkan!');
    } else if (editingIntervensi) {
      updatedIntervensiList = updatedIntervensiList.map((item) =>
        item.id === editingIntervensi.id
          ? {
              ...item,
              ...intervensiForm,
              anggaran: Number(intervensiForm.anggaran),
              realisasi: Number(intervensiForm.realisasi),
            }
          : item
      );
      setEditingIntervensi(null);
      showToast('Program intervensi berhasil diperbarui!');
    }

    const updatedStatistik: StatistikDesa = {
      ...statistik,
      intervensi: updatedIntervensiList,
    };
    await persistStatistik(updatedStatistik);
  };

  const handleDeleteIntervensi = async (id: string, nama: string) => {
    if (!window.confirm(`Yakin ingin menghapus program intervensi "${nama}"?`)) return;
    const updatedIntervensiList = statistik.intervensi.filter((item) => item.id !== id);
    const updatedStatistik: StatistikDesa = {
      ...statistik,
      intervensi: updatedIntervensiList,
    };
    await persistStatistik(updatedStatistik);
    showToast('Program intervensi berhasil dihapus.');
  };

  // Navigasi Sub-Tab
  const tabs = [
    { id: 'apbdes', label: 'Transparansi APBDes 2026', icon: Coins },
    { id: 'usia', label: 'Piramida Kelompok Usia', icon: Calendar },
    { id: 'pendidikan', label: 'Tingkat Pendidikan', icon: GraduationCap },
    { id: 'pekerjaan', label: 'Mata Pencaharian & Profesi', icon: Briefcase },
    { id: 'demografi', label: 'Demografi & 4 Dusun', icon: MapPin },
    { id: 'intervensi', label: 'Program Intervensi & Bansos', icon: HeartHandshake },
  ];

  const totalBelanjaRincian = apbdes.rincian_belanja.reduce((acc, curr) => acc + Number(curr.anggaran), 0);
  const surplusDefisit = apbdes.pendapatan - apbdes.belanja;

  return (
    <div className="space-y-6">
      {/* Header Utama Pengelolaan */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-[#1565C0] text-xs font-bold rounded-full mb-1.5 border border-blue-200">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Panel Pengelolaan Terpadu</span>
          </div>
          <h2 className="text-xl font-black text-[#0D2A4A] font-heading tracking-tight">
            Data Statistik & Transparansi APBDes {apbdes.tahun}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pemerintah Desa Nyurlembang, Kecamatan Narmada, Kabupaten Lombok Barat
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-emerald-50 text-[#2E7D32] border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Sinkronisasi Otomatis Portal</span>
          </div>
        </div>
      </div>

      {/* Toast Notifikasi */}
      {toastMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-md animate-in fade-in zoom-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigasi Tab Kategori Pengeditan */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#0D2A4A] text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#FFB300]' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          TAB 1: TRANSPARANSI APBDES 2026
      ========================================================================= */}
      {activeTab === 'apbdes' && (
        <div className="space-y-6">
          {/* Ringkasan Real-time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Total Pendapatan Desa
              </span>
              <div className="text-xl font-black text-[#1565C0] font-mono">
                Rp {formatAngka(apbdes?.pendapatan)}
              </div>
              <span className="text-[10px] text-slate-400">Termasuk DDS, ADD, BHP & PADes</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Total Belanja Desa
              </span>
              <div className="text-xl font-black text-amber-700 font-mono">
                Rp {formatAngka(apbdes?.belanja)}
              </div>
              <span className="text-[10px] text-slate-400">
                Alokasi 5 bidang kegiatan pemerintahan & pembangunan
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Surplus / (Defisit) Netto
              </span>
              <div
                className={`text-xl font-black font-mono ${
                  surplusDefisit >= 0 ? 'text-[#2E7D32]' : 'text-red-600'
                }`}
              >
                {surplusDefisit >= 0 ? '+' : ''}Rp {formatAngka(surplusDefisit)}
              </div>
              <span className="text-[10px] text-slate-400">
                Pembiayaan: Rp {formatAngka(apbdes?.pembiayaan)}
              </span>
            </div>
          </div>

          <form onSubmit={handleSaveApbdes} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-[#0D2A4A] font-heading flex items-center gap-2">
                  <Coins className="w-5 h-5 text-amber-500" />
                  <span>Transparansi APBDes Tahun Anggaran {apbdes.tahun}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Perubahan angka nominal di form ini akan langsung diperbarui pada grafik donut & slider APBDes di portal publik warga.
                </p>
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#2E7D32] hover:bg-[#256629] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan APBDes</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Tahun Anggaran
                </label>
                <input
                  type="number"
                  value={apbdes.tahun}
                  onChange={(e) => setApbdes({ ...apbdes, tahun: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#1565C0] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Total Pendapatan (Rp)
                </label>
                <input
                  type="number"
                  value={apbdes.pendapatan}
                  onChange={(e) => setApbdes({ ...apbdes, pendapatan: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-[#1565C0] focus:bg-white focus:ring-2 focus:ring-[#1565C0] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Total Belanja (Rp)
                </label>
                <input
                  type="number"
                  value={apbdes.belanja}
                  onChange={(e) => setApbdes({ ...apbdes, belanja: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-amber-800 focus:bg-white focus:ring-2 focus:ring-[#1565C0] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Pembiayaan Netto (Rp)
                </label>
                <input
                  type="number"
                  value={apbdes.pembiayaan}
                  onChange={(e) => setApbdes({ ...apbdes, pembiayaan: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#1565C0] outline-none"
                  required
                />
              </div>
            </div>

            {/* Rincian Bidang Belanja APBDes */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-[#0D2A4A]">Rincian Alokasi Bidang Belanja</h4>
                  <p className="text-xs text-slate-500">
                    Total alokasi rincian: <strong className="font-mono text-slate-800">Rp {formatAngka(totalBelanjaRincian)}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddBidang(true)}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#1565C0] rounded-xl text-xs font-bold flex items-center gap-1 border border-blue-200 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Bidang Belanja</span>
                </button>
              </div>

              {/* Form Tambah Bidang Baru Inline */}
              {showAddBidang && (
                <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-3 animate-in fade-in">
                  <div className="text-xs font-bold text-[#1565C0]">Tambah Alokasi Bidang Belanja Baru</div>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-7">
                      <input
                        type="text"
                        placeholder="Nama Bidang (misal: Bidang Ketahanan Pangan Desa)"
                        value={newBidangBelanja.bidang}
                        onChange={(e) => setNewBidangBelanja({ ...newBidangBelanja, bidang: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <input
                        type="number"
                        placeholder="Nominal Anggaran (Rp)"
                        value={newBidangBelanja.anggaran || ''}
                        onChange={(e) => setNewBidangBelanja({ ...newBidangBelanja, anggaran: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                      />
                    </div>
                    <div className="sm:col-span-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleAddBidangBelanja}
                        className="w-full py-2 bg-[#1565C0] hover:bg-blue-800 text-white rounded-lg text-xs font-bold cursor-pointer"
                      >
                        Tambah
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddBidang(false)}
                        className="p-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-600 rounded-lg text-xs cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* List Bidang Belanja */}
              <div className="space-y-2.5">
                {apbdes.rincian_belanja.map((item, idx) => {
                  const belanjaTotal = Number(apbdes.belanja) || 1;
                  const currentPercent = ((item.anggaran / belanjaTotal) * 100).toFixed(1);
                  return (
                    <div
                      key={idx}
                      className="p-3.5 bg-slate-50 hover:bg-white rounded-xl border border-slate-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-blue-100 text-[#1565C0] font-bold text-[10px] flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <input
                            type="text"
                            value={item.bidang}
                            onChange={(e) => {
                              const updated = [...apbdes.rincian_belanja];
                              updated[idx].bidang = e.target.value;
                              setApbdes({ ...apbdes, rincian_belanja: updated });
                            }}
                            className="w-full bg-transparent font-bold text-xs text-slate-800 border-b border-transparent hover:border-slate-300 focus:border-[#1565C0] outline-none px-1"
                          />
                        </div>

                        {/* Progress Bar Persentase */}
                        <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                          <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#1565C0] to-[#03A9F4]"
                              style={{ width: `${Math.min(Number(currentPercent), 100)}%` }}
                            />
                          </div>
                          <span className="font-bold text-[#1565C0] text-[11px] w-12 text-right">
                            {currentPercent}%
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-slate-400 font-mono">Rp</span>
                          <input
                            type="number"
                            value={item.anggaran}
                            onChange={(e) => {
                              const updated = [...apbdes.rincian_belanja];
                              const newAngg = Number(e.target.value);
                              const belanjaTot = Number(apbdes.belanja) || 1;
                              updated[idx].anggaran = newAngg;
                              updated[idx].persen = Number(((newAngg / belanjaTot) * 100).toFixed(1));
                              setApbdes({ ...apbdes, rincian_belanja: updated });
                            }}
                            className="w-36 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800 focus:ring-1 focus:ring-[#1565C0] outline-none"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteBidangBelanja(idx)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Bidang"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#1565C0] hover:bg-[#0D2A4A] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan APBDes 2026</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================================
          TAB 2: PIRAMIDA KELOMPOK USIA
      ========================================================================= */}
      {activeTab === 'usia' && (
        <form onSubmit={handleSaveKelompokUsia} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-[#0D2A4A] font-heading flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#1565C0]" />
                <span>Piramida Kelompok Usia & Tanggal Lahir Penduduk</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Data kelompok umur penduduk Desa Nyurlembang dengan persentase otomatis terhadap total penduduk ({formatAngka(statistik?.total_penduduk)} jiwa).
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAddUsia(true)}
                className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-[#1565C0] rounded-xl text-xs font-bold flex items-center gap-1 border border-blue-200 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Rentang Usia</span>
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#2E7D32] hover:bg-[#256629] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Data Usia</span>
              </button>
            </div>
          </div>

          {/* Form Tambah Usia Inline */}
          {showAddUsia && (
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-3 animate-in fade-in">
              <div className="text-xs font-bold text-[#1565C0]">Tambah Kategori Kelompok Usia Baru</div>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-5">
                  <input
                    type="text"
                    placeholder="Nama Kategori (misal: Usia Emas 60-70 Thn)"
                    value={newKelompokUsia.kategori}
                    onChange={(e) => setNewKelompokUsia({ ...newKelompokUsia, kategori: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div className="sm:col-span-4">
                  <input
                    type="text"
                    placeholder="Rentang Tahun Lahir (misal: Lahir 1954 - 1964)"
                    value={newKelompokUsia.rentang}
                    onChange={(e) => setNewKelompokUsia({ ...newKelompokUsia, rentang: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div className="sm:col-span-2">
                  <input
                    type="number"
                    placeholder="Jumlah Jiwa"
                    value={newKelompokUsia.jumlah || ''}
                    onChange={(e) => setNewKelompokUsia({ ...newKelompokUsia, jumlah: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div className="sm:col-span-1 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleAddKelompokUsia}
                    className="p-2 bg-[#1565C0] hover:bg-blue-800 text-white rounded-lg text-xs font-bold cursor-pointer"
                    title="Simpan Baris"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddUsia(false)}
                    className="p-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-600 rounded-lg text-xs cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* List Kelompok Usia */}
          <div className="space-y-3">
            {statistik.kelompok_usia.map((item, idx) => {
              const totalJiwa = statistik.total_penduduk || 1;
              const currentPercent = ((item.jumlah / totalJiwa) * 100).toFixed(1);
              return (
                <div
                  key={idx}
                  className="p-4 bg-slate-50 hover:bg-white rounded-xl border border-slate-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex-1 space-y-1.5">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <input
                        type="text"
                        value={item.kategori}
                        onChange={(e) => {
                          const updated = [...statistik.kelompok_usia];
                          updated[idx].kategori = e.target.value;
                          setStatistik({ ...statistik, kelompok_usia: updated });
                        }}
                        className="bg-transparent font-bold text-xs text-[#0D2A4A] border-b border-transparent hover:border-slate-300 focus:border-[#1565C0] outline-none px-1 flex-1"
                      />
                      <input
                        type="text"
                        value={item.rentang}
                        onChange={(e) => {
                          const updated = [...statistik.kelompok_usia];
                          updated[idx].rentang = e.target.value;
                          setStatistik({ ...statistik, kelompok_usia: updated });
                        }}
                        className="bg-transparent text-xs text-slate-500 border-b border-transparent hover:border-slate-300 focus:border-[#1565C0] outline-none px-1 sm:w-56"
                      />
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <div className="flex-1 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
                          style={{ width: `${Math.min(Number(currentPercent), 100)}%` }}
                        />
                      </div>
                      <span className="font-bold text-[#1565C0] text-xs w-12 text-right">
                        {currentPercent}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        value={item.jumlah}
                        onChange={(e) => {
                          const updated = [...statistik.kelompok_usia];
                          const newJml = Number(e.target.value);
                          updated[idx].jumlah = newJml;
                          updated[idx].persen = Number(((newJml / totalJiwa) * 100).toFixed(1));
                          setStatistik({ ...statistik, kelompok_usia: updated });
                        }}
                        className="w-28 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800 focus:ring-1 focus:ring-[#1565C0] outline-none"
                      />
                      <span className="text-xs text-slate-500">Jiwa</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteKelompokUsia(idx)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Hapus Kategori"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#1565C0] hover:bg-[#0D2A4A] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan Kelompok Usia</span>
            </button>
          </div>
        </form>
      )}

      {/* =========================================================================
          TAB 3: TINGKAT PENDIDIKAN
      ========================================================================= */}
      {activeTab === 'pendidikan' && (
        <form onSubmit={handleSavePendidikan} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-[#0D2A4A] font-heading flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#2E7D32]" />
                <span>Statistik Jenjang Pendidikan Terakhir Warga</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Data tingkat pendidikan penduduk Desa Nyurlembang untuk perencanaan beasiswa dan program pelatihan.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAddPendidikan(true)}
                className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-[#2E7D32] rounded-xl text-xs font-bold flex items-center gap-1 border border-emerald-200 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Tingkat Pendidikan</span>
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#2E7D32] hover:bg-[#256629] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Pendidikan</span>
              </button>
            </div>
          </div>

          {/* Form Tambah Pendidikan Inline */}
          {showAddPendidikan && (
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-3 animate-in fade-in">
              <div className="text-xs font-bold text-[#2E7D32]">Tambah Tingkat Pendidikan Baru</div>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-8">
                  <input
                    type="text"
                    placeholder="Nama Tingkat (misal: Pondok Pesantren / Keagamaan)"
                    value={newPendidikan.tingkat}
                    onChange={(e) => setNewPendidikan({ ...newPendidikan, tingkat: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div className="sm:col-span-3">
                  <input
                    type="number"
                    placeholder="Jumlah Jiwa"
                    value={newPendidikan.jumlah || ''}
                    onChange={(e) => setNewPendidikan({ ...newPendidikan, jumlah: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div className="sm:col-span-1 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleAddPendidikan}
                    className="p-2 bg-[#2E7D32] hover:bg-emerald-800 text-white rounded-lg text-xs font-bold cursor-pointer"
                    title="Tambah"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddPendidikan(false)}
                    className="p-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-600 rounded-lg text-xs cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* List Pendidikan */}
          <div className="space-y-3">
            {statistik.pendidikan.map((item, idx) => {
              const totalJiwa = statistik.total_penduduk || 1;
              const currentPercent = ((item.jumlah / totalJiwa) * 100).toFixed(1);
              return (
                <div
                  key={idx}
                  className="p-4 bg-slate-50 hover:bg-white rounded-xl border border-slate-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      value={item.tingkat}
                      onChange={(e) => {
                        const updated = [...statistik.pendidikan];
                        updated[idx].tingkat = e.target.value;
                        setStatistik({ ...statistik, pendidikan: updated });
                      }}
                      className="bg-transparent font-bold text-xs text-[#0D2A4A] border-b border-transparent hover:border-slate-300 focus:border-emerald-600 outline-none px-1 w-full"
                    />

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <div className="flex-1 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-600"
                          style={{ width: `${Math.min(Number(currentPercent), 100)}%` }}
                        />
                      </div>
                      <span className="font-bold text-[#2E7D32] text-xs w-12 text-right">
                        {currentPercent}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        value={item.jumlah}
                        onChange={(e) => {
                          const updated = [...statistik.pendidikan];
                          const newJml = Number(e.target.value);
                          updated[idx].jumlah = newJml;
                          updated[idx].persen = Number(((newJml / totalJiwa) * 100).toFixed(1));
                          setStatistik({ ...statistik, pendidikan: updated });
                        }}
                        className="w-28 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800 focus:ring-1 focus:ring-emerald-600 outline-none"
                      />
                      <span className="text-xs text-slate-500">Jiwa</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeletePendidikan(idx)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Hapus Tingkat Pendidikan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#2E7D32] hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan Pendidikan</span>
            </button>
          </div>
        </form>
      )}

      {/* =========================================================================
          TAB 4: MATA PENCAHARIAN & PROFESI
      ========================================================================= */}
      {activeTab === 'pekerjaan' && (
        <form onSubmit={handleSavePekerjaan} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-[#0D2A4A] font-heading flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-amber-600" />
                <span>Mata Pencaharian & Komposisi Profesi Warga</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pemetaan sektor ekonomi warga (petani & penderes nira aren, UMKM, swasta, ASN, dsb) di 4 dusun.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAddPekerjaan(true)}
                className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-bold flex items-center gap-1 border border-amber-200 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Profesi Baru</span>
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#2E7D32] hover:bg-[#256629] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Profesi</span>
              </button>
            </div>
          </div>

          {/* Form Tambah Profesi Inline */}
          {showAddPekerjaan && (
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3 animate-in fade-in">
              <div className="text-xs font-bold text-amber-800">Tambah Jenis Profesi Baru</div>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-8">
                  <input
                    type="text"
                    placeholder="Nama Profesi (misal: Pengrajin Anyaman Bambu & Rotan)"
                    value={newPekerjaan.jenis}
                    onChange={(e) => setNewPekerjaan({ ...newPekerjaan, jenis: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div className="sm:col-span-3">
                  <input
                    type="number"
                    placeholder="Jumlah Jiwa"
                    value={newPekerjaan.jumlah || ''}
                    onChange={(e) => setNewPekerjaan({ ...newPekerjaan, jumlah: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div className="sm:col-span-1 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleAddPekerjaan}
                    className="p-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                    title="Tambah"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddPekerjaan(false)}
                    className="p-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-600 rounded-lg text-xs cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* List Pekerjaan */}
          <div className="space-y-3">
            {statistik.pekerjaan.map((item, idx) => {
              const totalJiwa = statistik.total_penduduk || 1;
              const currentPercent = ((item.jumlah / totalJiwa) * 100).toFixed(1);
              return (
                <div
                  key={idx}
                  className="p-4 bg-slate-50 hover:bg-white rounded-xl border border-slate-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      value={item.jenis}
                      onChange={(e) => {
                        const updated = [...statistik.pekerjaan];
                        updated[idx].jenis = e.target.value;
                        setStatistik({ ...statistik, pekerjaan: updated });
                      }}
                      className="bg-transparent font-bold text-xs text-[#0D2A4A] border-b border-transparent hover:border-slate-300 focus:border-amber-600 outline-none px-1 w-full"
                    />

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <div className="flex-1 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-orange-600"
                          style={{ width: `${Math.min(Number(currentPercent), 100)}%` }}
                        />
                      </div>
                      <span className="font-bold text-amber-800 text-xs w-12 text-right">
                        {currentPercent}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        value={item.jumlah}
                        onChange={(e) => {
                          const updated = [...statistik.pekerjaan];
                          const newJml = Number(e.target.value);
                          updated[idx].jumlah = newJml;
                          updated[idx].persen = Number(((newJml / totalJiwa) * 100).toFixed(1));
                          setStatistik({ ...statistik, pekerjaan: updated });
                        }}
                        className="w-28 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800 focus:ring-1 focus:ring-amber-600 outline-none"
                      />
                      <span className="text-xs text-slate-500">Jiwa</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeletePekerjaan(idx)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Hapus Profesi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#1565C0] hover:bg-[#0D2A4A] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan Profesi</span>
            </button>
          </div>
        </form>
      )}

      {/* =========================================================================
          TAB 5: DEMOGRAFI POKOK & 6 WILAYAH DUSUN
      ========================================================================= */}
      {activeTab === 'demografi' && (
        <div className="space-y-6">
          <form onSubmit={handleSaveDemografi} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-[#0D2A4A] font-heading flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#1565C0]" />
                  <span>Data Pokok Kependudukan & Wilayah 4 Dusun</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Rekapitulasi total penduduk, rasio gender laki-laki vs perempuan, jumlah KK, dan luas wilayah administratif.
                </p>
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#2E7D32] hover:bg-[#256629] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Demografi & Dusun</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Penduduk Laki-Laki (Jiwa)
                </label>
                <input
                  type="number"
                  value={statistik.penduduk_laki}
                  onChange={(e) => {
                    const l = Number(e.target.value);
                    setStatistik({
                      ...statistik,
                      penduduk_laki: l,
                      total_penduduk: l + Number(statistik.penduduk_perempuan),
                    });
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-blue-700 focus:bg-white focus:ring-2 focus:ring-[#1565C0] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Penduduk Perempuan (Jiwa)
                </label>
                <input
                  type="number"
                  value={statistik.penduduk_perempuan}
                  onChange={(e) => {
                    const p = Number(e.target.value);
                    setStatistik({
                      ...statistik,
                      penduduk_perempuan: p,
                      total_penduduk: Number(statistik.penduduk_laki) + p,
                    });
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-rose-700 focus:bg-white focus:ring-2 focus:ring-[#1565C0] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Total Penduduk (Auto L+P)
                </label>
                <input
                  type="number"
                  value={statistik.total_penduduk}
                  readOnly
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-[#0D2A4A] cursor-not-allowed outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Jumlah Kepala Keluarga (KK)
                </label>
                <input
                  type="number"
                  value={statistik.jumlah_kk}
                  onChange={(e) => setStatistik({ ...statistik, jumlah_kk: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#1565C0] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Jumlah Dusun
                </label>
                <input
                  type="number"
                  value={statistik.jumlah_dusun}
                  onChange={(e) => setStatistik({ ...statistik, jumlah_dusun: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#1565C0] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Jumlah Rukun Tetangga (RT)
                </label>
                <input
                  type="number"
                  value={statistik.jumlah_rt}
                  onChange={(e) => setStatistik({ ...statistik, jumlah_rt: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#1565C0] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Jumlah Rukun Warga (RW)
                </label>
                <input
                  type="number"
                  value={statistik.jumlah_rw}
                  onChange={(e) => setStatistik({ ...statistik, jumlah_rw: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#1565C0] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Luas Wilayah (Hektar / Ha)
                </label>
                <input
                  type="number"
                  value={statistik.luas_wilayah_ha}
                  onChange={(e) => setStatistik({ ...statistik, luas_wilayah_ha: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#1565C0] outline-none"
                  required
                />
              </div>
            </div>

            {/* Rincian 4 Dusun Desa Nyurlembang */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <h4 className="text-sm font-bold text-[#0D2A4A] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Persebaran Statistik 4 Dusun Administratif</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {statistik.dusun_detail.map((dusun, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0D2A4A]">Dusun {idx + 1}: {dusun.nama}</span>
                      <span className="px-2 py-0.5 bg-blue-100 text-[#1565C0] text-[10px] font-bold rounded">
                        {dusun.jumlah_rt} RT / {dusun.jumlah_rw} RW
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">Kepala Dusun</label>
                        <input
                          type="text"
                          value={dusun.kepala_dusun}
                          onChange={(e) => {
                            const updated = [...statistik.dusun_detail];
                            updated[idx].kepala_dusun = e.target.value;
                            setStatistik({ ...statistik, dusun_detail: updated });
                          }}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">Jumlah Jiwa</label>
                        <input
                          type="number"
                          value={dusun.jumlah_jiwa}
                          onChange={(e) => {
                            const updated = [...statistik.dusun_detail];
                            updated[idx].jumlah_jiwa = Number(e.target.value);
                            setStatistik({ ...statistik, dusun_detail: updated });
                          }}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">Jumlah KK</label>
                        <input
                          type="number"
                          value={dusun.jumlah_kk}
                          onChange={(e) => {
                            const updated = [...statistik.dusun_detail];
                            updated[idx].jumlah_kk = Number(e.target.value);
                            setStatistik({ ...statistik, dusun_detail: updated });
                          }}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">RT / RW</label>
                        <div className="flex gap-1">
                          <input
                            type="number"
                            value={dusun.jumlah_rt}
                            onChange={(e) => {
                              const updated = [...statistik.dusun_detail];
                              updated[idx].jumlah_rt = Number(e.target.value);
                              setStatistik({ ...statistik, dusun_detail: updated });
                            }}
                            placeholder="RT"
                            className="w-1/2 px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                          />
                          <input
                            type="number"
                            value={dusun.jumlah_rw}
                            onChange={(e) => {
                              const updated = [...statistik.dusun_detail];
                              updated[idx].jumlah_rw = Number(e.target.value);
                              setStatistik({ ...statistik, dusun_detail: updated });
                            }}
                            placeholder="RW"
                            className="w-1/2 px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#2E7D32] hover:bg-[#256629] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan Demografi & Dusun</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================================
          TAB 6: PROGRAM INTERVENSI & BANSOS DESA
      ========================================================================= */}
      {activeTab === 'intervensi' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-[#0D2A4A] font-heading flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-rose-600" />
                <span>Program Intervensi Desa & Bantuan Sosial</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pengelolaan program intervensi spesifik stunting, BLT Dana Desa, renovasi RTLH, dan bantuan kelompok usaha nira aren.
              </p>
            </div>
            <button
              onClick={handleStartAddIntervensi}
              className="px-4 py-2.5 bg-[#1565C0] hover:bg-[#0D2A4A] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Program Intervensi</span>
            </button>
          </div>

          {/* Form Modal / Inline Tambah & Edit Intervensi */}
          {(isAddingIntervensi || editingIntervensi) && (
            <form
              onSubmit={handleSaveIntervensi}
              className="p-5 bg-blue-50/50 rounded-2xl border border-blue-200 space-y-4 animate-in fade-in"
            >
              <div className="flex items-center justify-between border-b border-blue-200/60 pb-2">
                <span className="text-xs font-bold text-[#0D2A4A] flex items-center gap-1.5">
                  <Edit2 className="w-3.5 h-3.5 text-[#1565C0]" />
                  {isAddingIntervensi ? 'Form Tambah Program Intervensi Baru' : `Edit Program: ${editingIntervensi?.nama_program}`}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingIntervensi(false);
                    setEditingIntervensi(null);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Program Intervensi *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Pemberian Makanan Tambahan (PMT) Balita Stunting"
                    value={intervensiForm.nama_program}
                    onChange={(e) => setIntervensiForm({ ...intervensiForm, nama_program: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#1565C0] outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kategori Program
                  </label>
                  <select
                    value={intervensiForm.kategori}
                    onChange={(e) => setIntervensiForm({ ...intervensiForm, kategori: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#1565C0] outline-none bg-white"
                  >
                    <option value="Kesehatan Balita">Kesehatan Balita & Gizi</option>
                    <option value="Bantuan Langsung Tunai">Bantuan Langsung Tunai (BLT)</option>
                    <option value="Pemberdayaan Ekonomi">Pemberdayaan Ekonomi / UMKM</option>
                    <option value="Infrastruktur Dasar">Infrastruktur Dasar / RTLH</option>
                    <option value="Pendidikan & Beasiswa">Pendidikan & Beasiswa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Target Sasaran Warga *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 42 Balita & 15 Ibu Hamil Kurang Gizi"
                    value={intervensiForm.target_sasaran}
                    onChange={(e) => setIntervensiForm({ ...intervensiForm, target_sasaran: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#1565C0] outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Alokasi Anggaran (Rp) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="Contoh: 38000000"
                    value={intervensiForm.anggaran || ''}
                    onChange={(e) => setIntervensiForm({ ...intervensiForm, anggaran: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-[#1565C0] outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Dusun Fokus / Sasaran
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Dusun Nyurlembang Daye & Barat"
                    value={intervensiForm.dusun_fokus}
                    onChange={(e) => setIntervensiForm({ ...intervensiForm, dusun_fokus: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#1565C0] outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Status Pelaksanaan
                  </label>
                  <select
                    value={intervensiForm.status}
                    onChange={(e) => setIntervensiForm({ ...intervensiForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#1565C0] outline-none bg-white"
                  >
                    <option value="Berjalan">Berjalan (Sedang Dilaksanakan)</option>
                    <option value="Terealisasi">Terealisasi (100% Selesai)</option>
                    <option value="Direncanakan">Direncanakan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Realisasi Kegiatan (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={intervensiForm.realisasi}
                    onChange={(e) => setIntervensiForm({ ...intervensiForm, realisasi: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#1565C0] outline-none bg-white"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Keterangan / Mekanisme Program
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Jelaskan mekanisme intervensi, jadwal pelaksanaan, pendampingan kader posyandu..."
                    value={intervensiForm.keterangan}
                    onChange={(e) => setIntervensiForm({ ...intervensiForm, keterangan: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#1565C0] outline-none bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-blue-200/60">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingIntervensi(false);
                    setEditingIntervensi(null);
                  }}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-colors border border-slate-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1565C0] hover:bg-[#0D2A4A] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Program Intervensi</span>
                </button>
              </div>
            </form>
          )}

          {/* Tabel / Kartu Daftar Intervensi */}
          <div className="space-y-3">
            {statistik.intervensi.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-slate-50 hover:bg-white rounded-2xl border border-slate-200 hover:border-[#1565C0] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 bg-blue-100 text-[#1565C0] text-[10px] font-bold rounded">
                      {item.kategori}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                        item.status === 'Terealisasi'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'Berjalan'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-200 text-slate-800'
                      }`}
                    >
                      {item.status} ({item.realisasi}%)
                    </span>
                    <span className="text-xs text-slate-500">• Fokus: <strong>{item.dusun_fokus}</strong></span>
                  </div>

                  <h4 className="font-bold text-[#0D2A4A] text-sm">{item.nama_program}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{item.keterangan}</p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                    <span>Sasaran: <strong>{item.target_sasaran}</strong></span>
                    <span>Anggaran: <strong className="font-mono text-emerald-700">Rp {formatAngka(item?.anggaran)}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => handleStartEditIntervensi(item)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors border border-blue-100 cursor-pointer"
                    title="Edit Program"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteIntervensi(item.id, item.nama_program)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors border border-red-100 cursor-pointer"
                    title="Hapus Program"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
