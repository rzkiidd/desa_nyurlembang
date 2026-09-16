import React, { useState, useRef, useEffect } from 'react';
import { BeritaDesa, UserProfile, KomentarBerita } from '../../types';
import { useRealtimeSync } from '../../lib/useRealtimeSync';
import {
  getStoredKomentar,
  saveStoredKomentar,
  dbFetchBerita,
  dbInsertBerita,
  dbUpdateBerita,
  dbDeleteBerita,
  dbFetchKomentar,
  dbUpdateKomentarStatus,
  dbDeleteKomentar,
} from '../../lib/supabaseClient';
import { RichTextEditor } from '../RichTextEditor';
import {
  Newspaper,
  Plus,
  Edit2,
  Trash2,
  Search,
  Calendar,
  User,
  Tag,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles,
  X,
  Upload,
  Image as ImageIcon,
  AlertTriangle,
  LayoutList,
  LayoutGrid,
  MessageSquare,
  Check,
  Ban,
  MapPin
} from 'lucide-react';

interface KelolaBeritaDesaProps {
  currentUser: UserProfile;
}

export const KelolaBeritaDesa: React.FC<KelolaBeritaDesaProps> = ({ currentUser }) => {
  const [activeSubTab, setActiveSubTab] = useState<'berita' | 'komentar'>('berita');
  const [komentarList, setKomentarList] = useState<KomentarBerita[]>([]);
  const [komentarFilter, setKomentarFilter] = useState<'all' | 'Menunggu' | 'Disetujui' | 'Ditolak'>('all');

  const [beritaList, setBeritaList] = useState<BeritaDesa[]>([]);
  const [loadingBerita, setLoadingBerita] = useState(true);

  const loadData = async () => {
    const [freshBerita, freshKomentar] = await Promise.allSettled([
      dbFetchBerita(),
      dbFetchKomentar(),
    ]);
    if (freshBerita.status === 'fulfilled') {
      setBeritaList(freshBerita.value);
    }
    if (freshKomentar.status === 'fulfilled') {
      setKomentarList(freshKomentar.value);
    }
    setLoadingBerita(false);
  };

  useEffect(() => {
    setKomentarList(getStoredKomentar());
    loadData();
  }, []);

  useRealtimeSync(['berita_desa', 'komentar_berita'], (evt) => {
    loadData();
    if (evt.source === 'remote') {
      showToast(
        evt.table === 'berita_desa'
          ? '⚡ Artikel berita diperbarui dari komputer lain!'
          : '⚡ Tanggapan/komentar warga diperbarui dari komputer lain!'
      );
    }
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterKategori, setFilterKategori] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [judul, setJudul] = useState('');
  const [ringkasan, setRingkasan] = useState('');
  const [konten, setKonten] = useState('');
  const [kategori, setKategori] = useState('Pembangunan Desa');
  const [gambarUrl, setGambarUrl] = useState('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80');

  // Confirmation modal state
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; title: string } | null>(null);

  const [notification, setNotification] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const saveList = (list: BeritaDesa[]) => {
    setBeritaList(list);
    localStorage.setItem('desa_berita_list', JSON.stringify(list));
  };

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setJudul('');
    setRingkasan('');
    setKonten('');
    setKategori('Pembangunan Desa');
    setGambarUrl('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80');
    setShowModal(true);
  };

  // HANDLER MODERASI TANGGAPAN & KOMENTAR WARGA
  const handleUpdateKomentarStatus = async (id: string, newStatus: 'Disetujui' | 'Ditolak') => {
    const updated = komentarList.map((k) => (k.id === id ? { ...k, status: newStatus } : k));
    setKomentarList(updated);
    await dbUpdateKomentarStatus(id, newStatus);
    showToast(`Status tanggapan diubah menjadi "${newStatus}" di semua komputer`);
  };

  const handleDeleteKomentar = async (id: string) => {
    const updated = komentarList.filter((k) => k.id !== id);
    setKomentarList(updated);
    await dbDeleteKomentar(id);
    showToast('Tanggapan warga berhasil dihapus dari semua komputer.');
  };

  const handleOpenEdit = (b: BeritaDesa) => {
    setEditingId(b.id);
    setJudul(b.judul);
    setRingkasan(b.ringkasan);
    setKonten(b.konten || b.ringkasan);
    setKategori(b.kategori);
    setGambarUrl(b.gambar_url);
    setShowModal(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih berkas gambar valid (JPG, PNG, WEBP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setGambarUrl(event.target.result);
        showToast('Foto berita berhasil dimuat!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    const targetId = confirmDelete.id;
    const updated = beritaList.filter((b) => b.id !== targetId);
    saveList(updated);
    setConfirmDelete(null);
    const res = await dbDeleteBerita(targetId);
    if (!res.success) {
      showToast(`Peringatan: ${res.error || 'Gagal menghapus di server'}`);
    } else {
      showToast('Artikel berita berhasil dihapus permanen dari database');
      await loadData();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul.trim() || !ringkasan.trim()) {
      alert('Judul dan ringkasan wajib diisi!');
      return;
    }

    if (editingId) {
      const existing = beritaList.find((b) => b.id === editingId);
      const updatedItem: BeritaDesa = {
        ...(existing || { id: editingId, status: 'published', published_at: new Date().toISOString() }),
        id: editingId,
        judul,
        slug: judul.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        ringkasan,
        konten: konten || ringkasan,
        kategori,
        gambar_url: gambarUrl,
        penulis: existing?.penulis || currentUser.nama_lengkap,
      };
      const res = await dbUpdateBerita(updatedItem);
      if (!res.success) {
        showToast(`Gagal: ${res.error || 'Gagal memperbarui di server'}`);
      } else {
        showToast('Artikel berita berhasil diperbarui di database server');
        await loadData();
      }
    } else {
      const baru: BeritaDesa = {
        id: `news-${Date.now()}`,
        judul,
        slug: judul.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        ringkasan,
        konten: konten || ringkasan,
        kategori,
        gambar_url: gambarUrl,
        penulis: currentUser.nama_lengkap,
        published_at: new Date().toISOString(),
        status: 'published',
      };
      const res = await dbInsertBerita(baru);
      if (!res.success) {
        showToast(`Gagal: ${res.error || 'Gagal menyimpan di server'}`);
      } else {
        showToast('Artikel berita baru berhasil diterbitkan ke database server');
        await loadData();
      }
    }

    setShowModal(false);
  };

  const filtered = beritaList.filter((b) => {
    const matchSearch =
      b.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.ringkasan.toLowerCase().includes(searchTerm.toLowerCase());
    const matchKategori = filterKategori === 'all' || b.kategori === filterKategori;
    return matchSearch && matchKategori;
  });

  return (
    <div className="space-y-6">
      {notification && (
        <div className="p-4 bg-[#0D2A4A] text-white rounded-2xl shadow-lg border border-blue-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#FFB300]" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-[#0D2A4A] font-heading flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-[#1565C0]" />
            <span>Kelola Berita & Publikasi Desa</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Publikasikan warta pembangunan, kegiatan kemasyarakatan, dan pengumuman resmi desa.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-[#2E7D32] hover:bg-[#256629] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[#FFB300]" />
          <span>Tulis Berita Baru</span>
        </button>
      </div>

      {/* Tab Navigasi Sub-Modul: Daftar Berita vs Tanggapan & Komentar Warga */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveSubTab('berita')}
          className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'berita'
              ? 'bg-[#1565C0] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Newspaper className="w-4 h-4" />
          <span>Daftar Artikel Berita ({beritaList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('komentar')}
          className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'komentar'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Tanggapan & Komentar Warga</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${activeSubTab === 'komentar' ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-700'}`}>
            {komentarList.length}
          </span>
        </button>
      </div>

      {activeSubTab === 'berita' ? (
        <>
          {/* Search & Filter Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Cari judul berita atau isi ringkasan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#1565C0] outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filterKategori}
                onChange={(e) => setFilterKategori(e.target.value)}
                className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#1565C0] outline-none"
              >
                <option value="all">Semua Kategori Berita</option>
                <option value="Pembangunan Desa">Pembangunan Desa</option>
                <option value="Pemerintahan Desa">Pemerintahan Desa</option>
                <option value="Kesehatan Masyarakat">Kesehatan Masyarakat</option>
                <option value="Ekonomi & Pertanian">Ekonomi & Pertanian</option>
                <option value="Kesenian & Budaya">Kesenian & Budaya</option>
              </select>

              {/* Toggle View Mode */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                    viewMode === 'list'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Tampilan List / Tabel"
                >
                  <LayoutList className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Tampilan Grid Kartu"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

      {/* Tampilan List / Tabel Berita */}
      {viewMode === 'list' ? (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="p-4 w-12 text-center">No</th>
                  <th className="p-4 min-w-[200px]">Thumbnail</th>
                  <th className="p-4 min-w-[320px]">Judul & Ringkasan</th>
                  <th className="p-4 min-w-[170px]">Kategori & Penulis</th>
                  <th className="p-4 min-w-[130px]">Tanggal Terbit</th>
                  <th className="p-4 text-center min-w-[120px]">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((b, idx) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 text-center font-mono text-slate-400 font-medium">
                      {idx + 1}
                    </td>
                    <td className="p-4">
                      <div className="w-32 h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-2xs relative shrink-0">
                        <img src={b.gambar_url} alt={b.judul} className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/75 text-white text-[9px] font-bold rounded">
                          {b.kategori}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <h4 className="font-bold text-slate-900 text-sm font-heading leading-snug">
                        {b.judul}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {b.ringkasan}
                      </p>
                    </td>
                    <td className="p-4">
                      <span className="inline-block px-2.5 py-1 bg-blue-50 text-[#1565C0] font-semibold rounded-lg text-[11px] mb-1">
                        {b.kategori}
                      </span>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>{b.penulis}</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-slate-600 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {new Date(b.published_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(b)}
                          className="p-1.5 bg-blue-50 hover:bg-blue-100 text-[#1565C0] rounded-lg text-xs font-semibold"
                          title="Edit Berita"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete({ id: b.id, title: b.judul })}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs"
                          title="Hapus Berita"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      Tidak ada berita yang sesuai dengan filter pencarian.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid Daftar Berita */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-[#1565C0] transition-all overflow-hidden flex flex-col justify-between"
            >
              <div className="h-44 relative bg-slate-100 overflow-hidden">
                <img src={b.gambar_url} alt={b.judul} className="w-full h-full object-cover" />
                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-[#0D2A4A]/90 text-white text-[10px] font-bold rounded">
                  {b.kategori}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-2 mb-1">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {new Date(b.published_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <span>•</span>
                    <span>{b.penulis}</span>
                  </div>
                  <h3 className="font-bold text-sm text-[#0D2A4A] leading-snug line-clamp-2">
                    {b.judul}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                    {b.ringkasan}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(b)}
                    className="px-3 py-1.5 bg-blue-50 text-[#1565C0] hover:bg-blue-100 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfirmDelete({ id: b.id, title: b.judul })}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Hapus Berita"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
        </>
      ) : (
        /* =========================================================================
           SUB-TAB 2: MODERASI TANGGAPAN & KOMENTAR WARGA (DITERIMA DARI DETAIL BERITA)
        ========================================================================= */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-[#0D2A4A] flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-600" />
                <span>Moderasi Tanggapan & Aspirasi Warga pada Berita</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Semua tanggapan yang dikirimkan warga melalui portal berita desa terkumpul di sini dan dapat diverifikasi staf.
              </p>
            </div>

            {/* Filter Status Komentar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {(['all', 'Menunggu', 'Disetujui', 'Ditolak'] as const).map((st) => {
                const count =
                  st === 'all'
                    ? komentarList.length
                    : komentarList.filter((k) => k.status === st).length;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setKomentarFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      komentarFilter === st
                        ? 'bg-[#0D2A4A] text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {st === 'all' ? 'Semua' : st} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Daftar Komentar Card */}
          {komentarList
            .filter((k) => komentarFilter === 'all' || k.status === komentarFilter)
            .length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-semibold">
                {komentarFilter === 'all'
                  ? 'Belum ada tanggapan atau komentar warga yang masuk.'
                  : `Tidak ada tanggapan dengan status "${komentarFilter}".`}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {komentarList
                .filter((k) => komentarFilter === 'all' || k.status === komentarFilter)
                .map((k) => {
                  const relatedBerita = beritaList.find((b) => b.id === k.berita_id);
                  return (
                    <div
                      key={k.id}
                      className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-[#1565C0] font-bold text-xs flex items-center justify-center shrink-0">
                            {k.nama.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{k.nama}</span>
                              {k.dusun && (
                                <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-medium flex items-center gap-1">
                                  <MapPin className="w-2.5 h-2.5" />
                                  <span>{k.dusun}</span>
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Calendar className="w-2.5 h-2.5" />
                              <span>
                                {new Date(k.created_at || (k as any).tanggal || Date.now()).toLocaleString('id-ID', {
                                  dateStyle: 'medium',
                                  timeStyle: 'short',
                                })}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              k.status === 'disetujui' || (k.status as string) === 'Disetujui'
                                ? 'bg-emerald-100 text-emerald-800'
                                : (k.status as string) === 'Ditolak'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            ● {k.status === 'disetujui' || (k.status as string) === 'Disetujui'
                              ? 'Tayang di Website'
                              : (k.status as string) === 'Ditolak'
                              ? 'Ditolak'
                              : 'Menunggu Moderasi'}
                          </span>
                        </div>
                      </div>

                      {/* Berita Terkait */}
                      <div className="px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2 text-xs">
                        <Tag className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="text-slate-500 font-semibold text-[11px]">Artikel Berita:</span>
                        <span className="font-bold text-[#0D2A4A] truncate">
                          {k.berita_judul || relatedBerita?.judul || 'Artikel Terkait'}
                        </span>
                      </div>

                      {/* Isi Komentar */}
                      <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                        "{k.pesan || (k as any).komentar}"
                      </p>

                      {/* Tombol Aksi Moderasi */}
                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                        {k.status !== 'Disetujui' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateKomentarStatus(k.id, 'Disetujui')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Setujui & Tayangkan</span>
                          </button>
                        )}
                        {k.status !== 'Ditolak' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateKomentarStatus(k.id, 'Ditolak')}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Ban className="w-3.5 h-3.5 text-slate-500" />
                            <span>Tolak</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteKomentar(k.id)}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Hapus komentar warga permanen"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* MODAL TULIS / EDIT BERITA DENGAN RICHTEXTEDITOR */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header Terkunci (Sticky) */}
            <div className="p-5 pb-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-[#1565C0]" />
                <h3 className="font-heading font-bold text-base text-[#0D2A4A]">
                  {editingId ? 'Sunting Artikel Berita' : 'Tulis Artikel Berita Baru'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                aria-label="Tutup Dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form & Scrollable Body */}
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Judul Artikel Berita <span className="text-[#B71C1C]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={judul}
                    onChange={(e) => setJudul(e.target.value)}
                    placeholder="Contoh: Musyawarah Perencanaan Pembangunan Dusun Nyurlembang 2026"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#1565C0] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kategori Berita <span className="text-[#B71C1C]">*</span>
                  </label>
                  <select
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-[#1565C0] outline-none"
                  >
                    <option value="Pembangunan Desa">Pembangunan Desa</option>
                    <option value="Pemerintahan Desa">Pemerintahan Desa</option>
                    <option value="Kesehatan Masyarakat">Kesehatan Masyarakat</option>
                    <option value="Ekonomi & Pertanian">Ekonomi & Pertanian</option>
                    <option value="Kesenian & Budaya">Kesenian & Budaya</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ringkasan Singkat (Lead / Excerpt) <span className="text-[#B71C1C]">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={ringkasan}
                  onChange={(e) => setRingkasan(e.target.value)}
                  placeholder="Ringkasan 1-2 kalimat pengantar berita untuk ditampilkan di kartu depan..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-[#1565C0] outline-none"
                />
              </div>

              {/* UPLOAD FOTO SAMPUL BERITA */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#1565C0]" />
                    <span>Foto Utama / Sampul Berita</span>
                  </label>
                  <span className="text-[11px] text-slate-500">Unggah berkas foto atau pilih gambar</span>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="w-24 h-20 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 shrink-0 relative">
                    <img src={gambarUrl} alt="Pratinjau Foto" className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 space-y-2 w-full">
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-2 bg-[#1565C0] hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Unggah Foto dari Komputer / HP</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setGambarUrl('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80')}
                        className="px-2.5 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                      >
                        Foto Dokumentasi Desa
                      </button>
                    </div>

                    <input
                      type="url"
                      value={gambarUrl}
                      onChange={(e) => setGambarUrl(e.target.value)}
                      placeholder="Atau tautan URL foto gambar..."
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-700 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* KOMPONEN RICH TEXT EDITOR DENGAN FORMATTING & PRATINJAU LANGSUNG */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Isi Berita Lengkap & Naskah (Rich Text Editor)</span>
                  <span className="text-[11px] text-[#1565C0] font-normal">Mendukung Heading, Kutipan & Gambar</span>
                </label>
                <RichTextEditor
                  value={konten}
                  onChange={setKonten}
                  placeholder="Ketik rincian berita kegiatan desa secara detail di sini..."
                  coverImageUrl={gambarUrl}
                  onCoverImageChange={setGambarUrl}
                  title={judul}
                  category={kategori}
                  author={currentUser.nama_lengkap}
                />
              </div>

              </div>

              {/* Footer Terkunci (Sticky) */}
              <div className="p-4 px-6 border-t border-slate-200 flex items-center justify-end gap-3 bg-slate-50 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#2E7D32] hover:bg-[#256629] text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  {editingId ? 'Simpan Perubahan' : 'Terbitkan Artikel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS BERITA (YA / TIDAK) */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150 space-y-4">
            <div className="flex items-center gap-3 text-rose-600 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm font-heading">Konfirmasi Hapus Berita</h3>
                <p className="text-xs text-slate-500">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus artikel berita <strong>"{confirmDelete.title}"</strong>?
            </p>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Tidak, Batalkan
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                Ya, Hapus Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
 
