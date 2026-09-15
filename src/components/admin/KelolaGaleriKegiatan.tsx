import React, { useState, useEffect, useRef } from 'react';
import { GaleriKegiatan } from '../../types';
import { useRealtimeSync } from '../../lib/useRealtimeSync';
import {
  getStoredGaleriKegiatan,
  saveStoredGaleriKegiatan,
  dbFetchGaleri,
  dbInsertGaleri,
  dbUpdateGaleri,
  dbDeleteGaleri
} from '../../lib/supabaseClient';
import {
  Camera,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Calendar,
  MapPin,
  Tag,
  CheckCircle2,
  ExternalLink,
  Image as ImageIcon,
  Upload,
  AlertTriangle,
  LayoutList,
  LayoutGrid
} from 'lucide-react';

export const KelolaGaleriKegiatan: React.FC = () => {
  const [galeriList, setGaleriList] = useState<GaleriKegiatan[]>([]);
  const [editingItem, setEditingItem] = useState<GaleriKegiatan | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Modal konfirmasi hapus (Ya / Tidak)
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; nama: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State untuk Tambah / Edit Foto
  const [formData, setFormData] = useState<Omit<GaleriKegiatan, 'id'>>({
    nama_kegiatan: '',
    tanggal: new Date().toISOString().split('T')[0],
    lokasi: 'Desa Nyurlembang',
    kategori: 'Pembangunan',
    deskripsi: '',
    foto_url: '',
  });

  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const data = await dbFetchGaleri();
    setGaleriList(data);
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    loadData();
  }, []);

  useRealtimeSync('galeri_kegiatan', (evt) => {
    loadData();
    if (evt.source === 'remote') {
      showToast('⚡ Galeri kegiatan diperbarui langsung dari komputer lain!');
    }
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleStartAdd = () => {
    setEditingItem(null);
    setFormData({
      nama_kegiatan: '',
      tanggal: new Date().toISOString().split('T')[0],
      lokasi: 'Desa Nyurlembang, Narmada',
      kategori: 'Pemberdayaan',
      deskripsi: '',
      foto_url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80',
    });
    setIsAdding(true);
  };

  const handleStartEdit = (item: GaleriKegiatan) => {
    setIsAdding(false);
    setEditingItem(item);
    setFormData({
      nama_kegiatan: item.nama_kegiatan,
      tanggal: item.tanggal,
      lokasi: item.lokasi,
      kategori: item.kategori,
      deskripsi: item.deskripsi,
      foto_url: item.foto_url,
    });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingItem(null);
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
        setFormData((prev) => ({ ...prev, foto_url: event.target?.result as string }));
        showToast('Foto berhasil dimuat dari perangkat!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama_kegiatan.trim() || !formData.foto_url.trim()) {
      alert('Nama kegiatan dan foto kegiatan wajib diisi!');
      return;
    }

    if (isAdding) {
      const newItem: GaleriKegiatan = {
        id: `galeri-${Date.now()}`,
        ...formData,
      };
      const updated = [newItem, ...galeriList];
      setGaleriList(updated);
      saveStoredGaleriKegiatan(updated);
      setIsAdding(false);
      await dbInsertGaleri(newItem);
      showToast('Foto kegiatan baru berhasil ditambahkan ke database!');
    } else if (editingItem) {
      const updatedItem = { ...editingItem, ...formData };
      const updated = galeriList.map((item) =>
        item.id === editingItem.id ? updatedItem : item
      );
      setGaleriList(updated);
      saveStoredGaleriKegiatan(updated);
      setEditingItem(null);
      await dbUpdateGaleri(updatedItem);
      showToast('Data foto kegiatan berhasil diperbarui di database!');
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    const targetId = confirmDelete.id;
    const updated = galeriList.filter((item) => item.id !== targetId);
    setGaleriList(updated);
    saveStoredGaleriKegiatan(updated);
    setConfirmDelete(null);
    await dbDeleteGaleri(targetId);
    showToast('Foto kegiatan berhasil dihapus dari database.');
  };

  // Preset foto cepat untuk mempermudah admin
  const presetImages = [
    { label: 'Gotong Royong & Kerja Bakti', url: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&auto=format&fit=crop&q=80' },
    { label: 'Posyandu & Balita Sehat', url: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800&auto=format&fit=crop&q=80' },
    { label: 'Pemberdayaan Gula Aren', url: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&auto=format&fit=crop&q=80' },
    { label: 'Musyawarah Dusun (Musdus)', url: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&auto=format&fit=crop&q=80' },
    { label: 'Pelayanan Kantor Desa', url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80' },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notifikasi */}
      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Pengelola Galeri */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-[#0D2A4A] flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#1565C0]" />
            <span>Kelola Galeri Foto Kegiatan Desa Nyurlembang</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dokumentasi foto kegiatan lapangan ini langsung tervisualisasi di Beranda Desa.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          {/* Switch View List vs Grid */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-[#1565C0] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>Tampilan List</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-[#1565C0] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>
          </div>

          {!isAdding && !editingItem && (
            <button
              onClick={handleStartAdd}
              className="px-4 py-2 bg-[#2E7D32] hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Foto Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* Form Tambah / Edit Foto */}
      {(isAdding || editingItem) && (
        <form
          onSubmit={handleSave}
          className="bg-white p-6 rounded-2xl border-2 border-[#1565C0] shadow-md space-y-4 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-[#0D2A4A] text-sm flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#1565C0]" />
              <span>{isAdding ? 'Tambah Foto Kegiatan Baru' : 'Edit Data Foto Kegiatan'}</span>
            </h3>
            <button
              type="button"
              onClick={handleCancel}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Kegiatan *</label>
              <input
                type="text"
                required
                value={formData.nama_kegiatan}
                onChange={(e) => setFormData({ ...formData, nama_kegiatan: e.target.value })}
                placeholder="Contoh: Kerja Bakti Pembersihan Saluran Dusun Tatar"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#1565C0]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kategori Kegiatan *</label>
              <select
                value={formData.kategori}
                onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#1565C0]"
              >
                <option value="Pembangunan">Pembangunan Fisik & Infrastruktur</option>
                <option value="Pemberdayaan">Pemberdayaan Warga & UMKM</option>
                <option value="Kesehatan">Kesehatan & Posyandu</option>
                <option value="Sosial Budaya">Sosial Budaya & Keagamaan</option>
                <option value="Pemerintahan">Pemerintahan & Pelayanan</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tanggal Pelaksanaan *</label>
              <input
                type="date"
                required
                value={formData.tanggal}
                onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#1565C0]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Lokasi Kegiatan *</label>
              <input
                type="text"
                required
                value={formData.lokasi}
                onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                placeholder="Contoh: Dusun Nyurlembang Lauk, Desa Nyurlembang"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#1565C0]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1 text-xs">Deskripsi Ringkas Kegiatan</label>
            <textarea
              rows={2}
              value={formData.deskripsi}
              onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
              placeholder="Jelaskan ringkasan jalannya kegiatan lapangan..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none text-xs focus:ring-2 focus:ring-[#1565C0]"
            />
          </div>

          {/* Upload Foto / URL */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="block font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-[#1565C0]" />
                <span>Foto Kegiatan (Unggah Berkas atau URL) *</span>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {formData.foto_url && (
                <img
                  src={formData.foto_url}
                  alt="Preview"
                  className="w-24 h-16 object-cover rounded-xl border border-slate-300 shrink-0"
                />
              )}

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
                    className="px-3.5 py-1.5 bg-[#1565C0] hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Unggah Foto dari Perangkat</span>
                  </button>
                </div>

                <input
                  type="url"
                  value={formData.foto_url}
                  onChange={(e) => setFormData({ ...formData, foto_url: e.target.value })}
                  placeholder="Atau tautan URL foto gambar..."
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-700 outline-none"
                />
              </div>
            </div>

            {/* Tombol Preset Foto Demo */}
            <div>
              <span className="text-[11px] text-slate-500 block mb-1.5">Atau pilih foto dokumentasi cepat:</span>
              <div className="flex flex-wrap gap-1.5">
                {presetImages.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData({ ...formData, foto_url: p.url })}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] text-slate-700 font-medium transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#2E7D32] hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Foto Kegiatan</span>
            </button>
          </div>
        </form>
      )}

      {/* TAMPILAN LIST VIEW (DEFAULT) */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Foto Kegiatan</th>
                  <th className="p-3.5">Nama Kegiatan & Deskripsi</th>
                  <th className="p-3.5">Kategori</th>
                  <th className="p-3.5">Tanggal & Lokasi</th>
                  <th className="p-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {galeriList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      Belum ada dokumentasi foto kegiatan.
                    </td>
                  </tr>
                ) : (
                  galeriList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 w-28">
                        <div className="w-20 h-14 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                          <img
                            src={item.foto_url}
                            alt={item.nama_kegiatan}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="p-3.5 max-w-sm">
                        <div className="font-bold text-slate-900 text-xs sm:text-sm">
                          {item.nama_kegiatan}
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {item.deskripsi || '-'}
                        </p>
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="px-2.5 py-1 bg-blue-50 text-[#1565C0] font-bold text-[10px] rounded-md">
                          {item.kategori}
                        </span>
                      </td>
                      <td className="p-3.5 whitespace-nowrap text-slate-600">
                        <div className="flex items-center gap-1 text-[11px]">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{item.tanggal}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                          <MapPin className="w-2.5 h-2.5 text-slate-400" />
                          <span>{item.lokasi}</span>
                        </div>
                      </td>
                      <td className="p-3.5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(item)}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-[#1565C0] rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDelete({ id: item.id, nama: item.nama_kegiatan })}
                            className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Foto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAMPILAN GRID VIEW (OPSIONAL) */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {galeriList.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-[#1565C0] transition-all flex flex-col justify-between"
            >
              <div className="relative h-44 bg-slate-100">
                <img
                  src={item.foto_url}
                  alt={item.nama_kegiatan}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-[#0D2A4A]/80 text-white text-[10px] font-bold rounded">
                  {item.kategori}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#FFB300]" />
                      <span>{item.tanggal}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-[#03A9F4]" />
                      <span className="truncate">{item.lokasi}</span>
                    </span>
                  </div>

                  <h4 className="font-bold text-[#0D2A4A] text-sm leading-snug line-clamp-2">
                    {item.nama_kegiatan}
                  </h4>

                  <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                    {item.deskripsi}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleStartEdit(item)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => setConfirmDelete({ id: item.id, nama: item.nama_kegiatan })}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS GALERI (YA / TIDAK) */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150 space-y-4">
            <div className="flex items-center gap-3 text-rose-600 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm font-heading">Konfirmasi Hapus Dokumentasi</h3>
                <p className="text-xs text-slate-500">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus foto kegiatan <strong>"{confirmDelete.nama}"</strong>?
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
