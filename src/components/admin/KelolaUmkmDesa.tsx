import React, { useState, useEffect, useMemo } from 'react';
import { PotensiUmkm, UserProfile } from '../../types';
import {
  dbFetchUmkm,
  dbInsertUmkm,
  dbUpdateUmkm,
  dbDeleteUmkm,
  getStoredUmkm,
} from '../../lib/supabaseClient';
import { useRealtimeSync } from '../../lib/useRealtimeSync';
import { DAFTAR_DUSUN } from '../../data/mockData';
import {
  Store,
  Plus,
  Search,
  Edit2,
  Trash2,
  Phone,
  MapPin,
  Tag,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  Upload,
  ExternalLink,
  LayoutGrid,
  List,
  Sparkles,
  ShoppingBag,
  DollarSign,
  User,
  Image as ImageIcon
} from 'lucide-react';

interface KelolaUmkmDesaProps {
  currentUser: UserProfile;
}

const KATEGORI_UMKM = [
  'Kuliner & Hasil Tani',
  'Agribisnis & Perkebunan',
  'Kerajinan Tangan',
  'Jasa & Perdagangan',
];

const PRESET_FOTO = [
  {
    label: 'Gula Aren',
    url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Kopi Robusta',
    url: 'https://images.unsplash.com/photo-1559525839-8f81ae1027c1?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Keripik Gurih',
    url: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Madu Hutan',
    url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Kerajinan Bambu',
    url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&auto=format&fit=crop&q=80',
  },
];

export const KelolaUmkmDesa: React.FC<KelolaUmkmDesaProps> = ({ currentUser }) => {
  const [umkmList, setUmkmList] = useState<PotensiUmkm[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterDusun, setFilterDusun] = useState<string>('all');
  const [filterKategori, setFilterKategori] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Form Modal State (Create & Edit)
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<PotensiUmkm | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  // Form Fields
  const [namaUsaha, setNamaUsaha] = useState<string>('');
  const [pemilik, setPemilik] = useState<string>('');
  const [kategori, setKategori] = useState<string>(KATEGORI_UMKM[0]);
  const [dusun, setDusun] = useState<string>(DAFTAR_DUSUN[0]);
  const [deskripsi, setDeskripsi] = useState<string>('');
  const [hargaRentang, setHargaRentang] = useState<string>('');
  const [kontakWa, setKontakWa] = useState<string>('');
  const [fotoUrl, setFotoUrl] = useState<string>(PRESET_FOTO[0].url);

  // Delete Confirmation
  const [confirmDelete, setConfirmDelete] = useState<PotensiUmkm | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  // Toast Notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Muat data langsung dari database
  const loadData = async () => {
    setLoading(true);
    try {
      // Baca dari storage/memory dulu agar cepat
      const cached = getStoredUmkm();
      if (cached && cached.length > 0) {
        setUmkmList(cached);
      }
      // Revalidasi ke Supabase database
      const remote = await dbFetchUmkm();
      setUmkmList(remote);
    } catch (err) {
      console.warn('Gagal memuat data UMKM:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Dengarkan event sinkronisasi real-time antar-perangkat
  useRealtimeSync(['potensi_umkm', '*'], (evt) => {
    if (evt.table === 'potensi_umkm') {
      if (evt.action === 'delete' && evt.id) {
        setUmkmList((prev) => prev.filter((u) => u.id !== evt.id));
      } else if (evt.action === 'update' && evt.data) {
        setUmkmList((prev) =>
          prev.map((u) => (u.id === evt.data.id ? { ...u, ...evt.data } : u))
        );
      } else if (evt.action === 'insert' && evt.data) {
        setUmkmList((prev) => [evt.data, ...prev.filter((u) => u.id !== evt.data.id)]);
      } else {
        loadData();
      }
    }
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setNamaUsaha('');
    setPemilik(currentUser.nama_lengkap || '');
    setKategori(KATEGORI_UMKM[0]);
    setDusun(DAFTAR_DUSUN[0]);
    setDeskripsi('');
    setHargaRentang('Rp 15.000 - Rp 50.000');
    setKontakWa('0819');
    setFotoUrl(PRESET_FOTO[0].url);
    setShowModal(true);
  };

  const handleOpenEdit = (item: PotensiUmkm) => {
    setEditingItem(item);
    setNamaUsaha(item.nama_usaha);
    setPemilik(item.pemilik);
    setKategori(item.kategori || KATEGORI_UMKM[0]);
    setDusun(item.dusun || DAFTAR_DUSUN[0]);
    setDeskripsi(item.deskripsi);
    setHargaRentang(item.harga_rentang || '');
    setKontakWa(item.kontak_wa);
    setFotoUrl(item.foto_url || PRESET_FOTO[0].url);
    setShowModal(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran berkas maksimal 2MB!');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFotoUrl(reader.result);
        showToast('Foto produk berhasil dimuat!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaUsaha.trim() || !pemilik.trim() || !kontakWa.trim() || !deskripsi.trim()) {
      alert('Nama Usaha, Pemilik, Kontak WhatsApp, dan Deskripsi wajib diisi!');
      return;
    }

    setSaving(true);
    try {
      if (editingItem) {
        // Operasi UPDATE ke Supabase dengan klausul WHERE id = editingItem.id yang valid
        const payload: PotensiUmkm = {
          ...editingItem,
          id: editingItem.id, // Pastikan ID target tidak berubah
          nama_usaha: namaUsaha.trim(),
          pemilik: pemilik.trim(),
          kategori,
          dusun,
          deskripsi: deskripsi.trim(),
          harga_rentang: hargaRentang.trim() || 'Rp 10.000 - Rp 50.000',
          kontak_wa: kontakWa.trim(),
          foto_url: fotoUrl,
        };

        const res = await dbUpdateUmkm(payload);
        if (!res.success) {
          showToast(`Gagal memperbarui: ${res.error || 'Terjadi kesalahan server'}`, 'error');
          return;
        }

        // Perbarui state lokal secara terverifikasi
        setUmkmList((prev) =>
          prev.map((u) => (u.id === editingItem.id ? res.data || payload : u))
        );
        showToast('Data UMKM berhasil diperbarui dan tersinkron ke database server!');
      } else {
        // Operasi INSERT ke Supabase
        const payload: PotensiUmkm = {
          id: `umkm-${Date.now()}`,
          nama_usaha: namaUsaha.trim(),
          pemilik: pemilik.trim(),
          kategori,
          dusun,
          deskripsi: deskripsi.trim(),
          harga_rentang: hargaRentang.trim() || 'Rp 10.000 - Rp 50.000',
          kontak_wa: kontakWa.trim(),
          foto_url: fotoUrl,
        };

        const res = await dbInsertUmkm(payload);
        if (!res.success) {
          showToast(`Gagal menyimpan: ${res.error || 'Terjadi kesalahan server'}`, 'error');
          return;
        }

        setUmkmList((prev) => [res.data || payload, ...prev]);
        showToast('Usaha UMKM baru berhasil diterbitkan ke database publik!');
      }

      setShowModal(false);
    } catch (err: any) {
      showToast(`Kesalahan: ${err?.message || 'Gagal menyimpan data'}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    const targetId = confirmDelete.id;

    try {
      const res = await dbDeleteUmkm(targetId);
      if (!res.success) {
        showToast(`Gagal menghapus: ${res.error || 'Gagal di server'}`, 'error');
      } else {
        setUmkmList((prev) => prev.filter((u) => u.id !== targetId));
        showToast('Produk UMKM berhasil dihapus permanen dari database!');
      }
    } catch (err: any) {
      showToast(`Kesalahan saat menghapus: ${err?.message}`, 'error');
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  };

  // Filtered List
  const filteredUmkm = useMemo(() => {
    return umkmList.filter((u) => {
      const matchSearch =
        u.nama_usaha.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.pemilik.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.dusun && u.dusun.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchDusun = filterDusun === 'all' || u.dusun === filterDusun;
      const matchKategori = filterKategori === 'all' || u.kategori === filterKategori;

      return matchSearch && matchDusun && matchKategori;
    });
  }, [umkmList, searchTerm, filterDusun, filterKategori]);

  // Statistik Ringkas
  const stats = useMemo(() => {
    return {
      total: umkmList.length,
      kuliner: umkmList.filter((u) => u.kategori?.includes('Kuliner')).length,
      agri: umkmList.filter((u) => u.kategori?.includes('Agri')).length,
      kerajinan: umkmList.filter((u) => u.kategori?.includes('Kerajinan')).length,
    };
  }, [umkmList]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-[999999] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-white font-medium transition-all transform animate-in slide-in-from-top-4 ${
            toast.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          )}
          <span className="text-sm">{toast.message}</span>
        </div>
      )}

      {/* Header Panel */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">
                Kelola Potensi UMKM Warga 4 Dusun
              </h1>
              <p className="text-xs md:text-sm text-slate-500">
                Data terhubung langsung ke Supabase Database & tersinkronisasi otomatis ke Frontend Publik.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            title="Muat Ulang Data dari Database"
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-[#0D2A4A] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0D2A4A] hover:bg-[#153D66] text-white text-sm font-semibold shadow-md shadow-blue-900/10 transition-all transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Usaha UMKM</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold uppercase text-slate-400">Total Terdaftar</div>
          <div className="text-2xl font-bold text-slate-800 mt-1">{stats.total}</div>
          <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
            <CheckCircle2 className="w-3 h-3" /> Siap Tampil Publik
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold uppercase text-slate-400">Kuliner & Olahan</div>
          <div className="text-2xl font-bold text-amber-700 mt-1">{stats.kuliner}</div>
          <div className="text-[11px] text-slate-500 mt-1">Makanan & Minuman</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold uppercase text-slate-400">Agribisnis / Kebun</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{stats.agri}</div>
          <div className="text-[11px] text-slate-500 mt-1">Aren, Kopi & Buah</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold uppercase text-slate-400">Kerajinan Tangan</div>
          <div className="text-2xl font-bold text-indigo-700 mt-1">{stats.kerajinan}</div>
          <div className="text-[11px] text-slate-500 mt-1">Anyaman & Kerajinan</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex-1 relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama usaha, pemilik, deskripsi, atau dusun..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Filter Dusun */}
          <select
            value={filterDusun}
            onChange={(e) => setFilterDusun(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 font-medium"
          >
            <option value="all">Semua Dusun</option>
            {DAFTAR_DUSUN.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Filter Kategori */}
          <select
            value={filterKategori}
            onChange={(e) => setFilterKategori(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 font-medium"
          >
            <option value="all">Semua Kategori</option>
            {KATEGORI_UMKM.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${
                viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Tampilan Grid Kartu"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 transition-colors ${
                viewMode === 'table' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Tampilan Tabel Rinci"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Konten Daftar UMKM */}
      {loading && umkmList.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-slate-200 text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Memuat data UMKM langsung dari Supabase Database...</p>
        </div>
      ) : filteredUmkm.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-slate-200 text-center">
          <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700">Tidak ada data UMKM yang cocok</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            {searchTerm || filterDusun !== 'all' || filterKategori !== 'all'
              ? 'Silakan sesuaikan kata kunci pencarian atau filter dusun/kategori.'
              : 'Belum ada usaha UMKM terdaftar di database. Silakan klik Tambah Usaha UMKM di atas.'}
          </p>
          {(searchTerm || filterDusun !== 'all' || filterKategori !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterDusun('all');
                setFilterKategori('all');
              }}
              className="mt-4 px-4 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              Reset Filter
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredUmkm.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group"
            >
              {/* Gambar Produk */}
              <div className="h-44 w-full relative bg-slate-100 overflow-hidden">
                <img
                  src={item.foto_url || PRESET_FOTO[0].url}
                  alt={item.nama_usaha}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = PRESET_FOTO[0].url;
                  }}
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/90 backdrop-blur-md text-[#0D2A4A] shadow-sm">
                    {item.kategori}
                  </span>
                </div>
                <div className="absolute top-3 right-3 flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 rounded-lg bg-white/90 backdrop-blur-md text-slate-700 hover:text-blue-600 hover:bg-white shadow-sm transition-all"
                    title="Edit Data UMKM"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setConfirmDelete(item)}
                    className="p-1.5 rounded-lg bg-white/90 backdrop-blur-md text-rose-600 hover:bg-rose-50 shadow-sm transition-all"
                    title="Hapus UMKM"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Detail Info */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>{item.dusun}</span>
                  </div>

                  <h3 className="font-bold text-slate-800 text-base mb-1 group-hover:text-blue-700 transition-colors line-clamp-1">
                    {item.nama_usaha}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-2">
                    <User className="w-3 h-3 text-slate-400" />
                    <span>Pemilik: <strong className="font-semibold text-slate-700">{item.pemilik}</strong></span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                    {item.deskripsi}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Harga</span>
                    <span className="font-bold text-emerald-700">{item.harga_rentang || 'Harga variatif'}</span>
                  </div>

                  <a
                    href={`https://wa.me/${item.kontak_wa.replace(/[^0-9]/g, '')}?text=Halo%20${encodeURIComponent(item.pemilik)},%20saya%20tertarik%20dengan%20produk%20${encodeURIComponent(item.nama_usaha)}%20di%20Katalog%20Desa%20Nyurlembang`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold transition-colors"
                  >
                    <Phone className="w-3 h-3" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="p-4">Usaha / Produk</th>
                <th className="p-4">Pemilik</th>
                <th className="p-4">Kategori & Dusun</th>
                <th className="p-4">Harga</th>
                <th className="p-4">Kontak WA</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUmkm.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.foto_url || PRESET_FOTO[0].url}
                        alt={item.nama_usaha}
                        className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = PRESET_FOTO[0].url;
                        }}
                      />
                      <div>
                        <div className="font-bold text-slate-800">{item.nama_usaha}</div>
                        <div className="text-xs text-slate-500 line-clamp-1 max-w-xs">{item.deskripsi}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-medium text-slate-800">{item.pemilik}</td>
                  <td className="p-4">
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 mb-1">
                      {item.kategori}
                    </span>
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {item.dusun}
                    </div>
                  </td>
                  <td className="p-4 font-semibold text-emerald-700">{item.harga_rentang || '-'}</td>
                  <td className="p-4">
                    <a
                      href={`https://wa.me/${item.kontak_wa.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                    >
                      <Phone className="w-3 h-3" />
                      {item.kontak_wa}
                    </a>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-blue-600 transition-colors"
                        title="Edit Data"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(item)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL FORM TAMBAH / EDIT UMKM */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999990] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-200 my-8">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Store className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-slate-800">
                  {editingItem ? 'Edit Informasi Usaha UMKM' : 'Tambah Usaha UMKM Baru'}
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Nama Usaha / Produk <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Gula Aren Bukit Nyurlembang"
                    value={namaUsaha}
                    onChange={(e) => setNamaUsaha(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Nama Pemilik / Pengelola <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Pak Jumadi"
                    value={pemilik}
                    onChange={(e) => setPemilik(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Kategori Bidang Usaha <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    {KATEGORI_UMKM.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Dusun Lokasi Usaha <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={dusun}
                    onChange={(e) => setDusun(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    {DAFTAR_DUSUN.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Rentang Harga Produk
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Rp 20.000 - Rp 50.000 / kg"
                    value={hargaRentang}
                    onChange={(e) => setHargaRentang(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Nomor WhatsApp Pemesanan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 081912889900"
                    value={kontakWa}
                    onChange={(e) => setKontakWa(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Deskripsi Singkat & Keunggulan Produk <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Jelaskan bahan baku, keunikan proses olahan, atau rasa khas produk..."
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Pengaturan Foto Produk */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                  Foto Produk UMKM
                </label>

                {/* Preview Foto */}
                <div className="flex items-center gap-4 mb-3">
                  <img
                    src={fotoUrl || PRESET_FOTO[0].url}
                    alt="Preview"
                    className="w-20 h-20 rounded-xl object-cover border border-slate-200 shadow-sm"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = PRESET_FOTO[0].url;
                    }}
                  />
                  <div className="flex-1 text-xs text-slate-500 space-y-1">
                    <p className="font-medium text-slate-700">Pilih salah satu preset foto siap pakai atau upload berkas lokal:</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {PRESET_FOTO.map((p) => (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => setFotoUrl(p.url)}
                          className={`px-2 py-1 rounded text-[11px] font-semibold border transition-colors ${
                            fotoUrl === p.url
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Atau Masukkan URL Gambar:</label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={fotoUrl}
                      onChange={(e) => setFotoUrl(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Unggah dari Komputer:</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-[#0D2A4A] hover:bg-[#153D66] rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {saving && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>{editingItem ? 'Simpan Pembaruan Database' : 'Terbitkan ke Katalog'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS UMKM */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999990] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-center font-bold text-slate-800 text-lg">
              Hapus Data UMKM Ini?
            </h3>

            <p className="text-center text-xs text-slate-500 mt-1 mb-4">
              Usaha <strong className="text-slate-700">{confirmDelete.nama_usaha}</strong> akan dihapus permanen dari database Supabase dan tidak akan muncul lagi di frontend publik.
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                disabled={deleting}
                className="flex-1 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex-1 py-2.5 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-2"
              >
                {deleting && <RefreshCw className="w-4 h-4 animate-spin" />}
                <span>Ya, Hapus Permanen</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
