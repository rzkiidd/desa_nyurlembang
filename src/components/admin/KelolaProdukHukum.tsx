import React, { useState, useEffect, useRef } from 'react';
import { ProdukHukumDesa, KategoriProdukHukum } from '../../types';
import { useRealtimeSync } from '../../lib/useRealtimeSync';
import {
  dbFetchProdukHukum,
  dbInsertProdukHukum,
  dbUpdateProdukHukum,
  dbDeleteProdukHukum
} from '../../lib/supabaseClient';
import {
  Scale,
  Plus,
  Search,
  FileText,
  Download,
  Edit2,
  Trash2,
  X,
  Upload,
  Calendar,
  Tag,
  AlertTriangle,
  CheckCircle2,
  FileCheck
} from 'lucide-react';

const KATEGORI_OPTIONS: KategoriProdukHukum[] = [
  'Peraturan Desa (Perdes)',
  'Peraturan Kepala Desa (Perkades)',
  'Keputusan Kepala Desa',
  'Maklumat Pelayanan',
  'Surat Edaran Desa',
];

export const KelolaProdukHukum: React.FC = () => {
  const [list, setList] = useState<ProdukHukumDesa[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKategori, setFilterKategori] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ProdukHukumDesa | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ProdukHukumDesa | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form State
  const [judul, setJudul] = useState('');
  const [nomor, setNomor] = useState('');
  const [tahun, setTahun] = useState<number>(new Date().getFullYear());
  const [kategori, setKategori] = useState<KategoriProdukHukum>('Peraturan Desa (Perdes)');
  const [tanggalPenetapan, setTanggalPenetapan] = useState(new Date().toISOString().split('T')[0]);
  const [keterangan, setKeterangan] = useState('');
  const [namaFile, setNamaFile] = useState<string | undefined>(undefined);
  const [ukuranFile, setUkuranFile] = useState<string | undefined>(undefined);
  const [fileUrl, setFileUrl] = useState<string | undefined>(undefined);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = () => {
    dbFetchProdukHukum().then((data) => setList(data));
  };

  useEffect(() => {
    loadData();
  }, []);

  useRealtimeSync('produk_hukum', (evt) => {
    loadData();
    if (evt.source === 'remote') {
      showToast('⚡ Produk hukum (JDIH) diperbarui langsung dari komputer lain!');
    }
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setJudul('');
    setNomor('');
    setTahun(new Date().getFullYear());
    setKategori('Peraturan Desa (Perdes)');
    setTanggalPenetapan(new Date().toISOString().split('T')[0]);
    setKeterangan('');
    setNamaFile(undefined);
    setUkuranFile(undefined);
    setFileUrl(undefined);
    setShowModal(true);
  };

  const handleOpenEdit = (item: ProdukHukumDesa) => {
    setEditingItem(item);
    setJudul(item.judul);
    setNomor(item.nomor);
    setTahun(item.tahun);
    setKategori(item.kategori);
    setTanggalPenetapan(item.tanggal_penetapan || new Date().toISOString().split('T')[0]);
    setKeterangan(item.keterangan || '');
    setNamaFile(item.nama_file);
    setUkuranFile(item.ukuran_file);
    setFileUrl(item.file_url);
    setShowModal(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeKb = Math.round(file.size / 1024);
    const sizeStr = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;

    const reader = new FileReader();
    reader.onload = (ev) => {
      setFileUrl(ev.target?.result as string);
      setNamaFile(file.name);
      setUkuranFile(sizeStr);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul.trim() || !nomor.trim()) {
      alert('Judul dan Nomor Peraturan wajib diisi!');
      return;
    }

    if (editingItem) {
      const itemToUpdate: ProdukHukumDesa = {
        ...editingItem,
        judul: judul.trim(),
        nomor: nomor.trim(),
        tahun: Number(tahun) || new Date().getFullYear(),
        kategori,
        tanggal_penetapan: tanggalPenetapan,
        keterangan: keterangan.trim(),
        file_url: fileUrl,
        nama_file: namaFile,
        ukuran_file: ukuranFile,
      };
      await dbUpdateProdukHukum(itemToUpdate);
      const fresh = await dbFetchProdukHukum();
      setList(fresh);
      showToast('Produk Hukum Desa berhasil diperbarui ke Supabase.');
    } else {
      const baru: ProdukHukumDesa = {
        id: `hkm-${Date.now()}`,
        judul: judul.trim(),
        nomor: nomor.trim(),
        tahun: Number(tahun) || new Date().getFullYear(),
        kategori,
        tanggal_penetapan: tanggalPenetapan,
        keterangan: keterangan.trim(),
        file_url: fileUrl,
        nama_file: namaFile || `Perdes_${nomor.replace(/[^a-zA-Z0-9]/g, '_')}_${tahun}.pdf`,
        ukuran_file: ukuranFile || '1.2 MB',
        created_at: new Date().toISOString(),
      };
      await dbInsertProdukHukum(baru);
      const fresh = await dbFetchProdukHukum();
      setList(fresh);
      showToast('Produk Hukum Desa baru berhasil disimpan ke database Supabase.');
    }

    setShowModal(false);
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    await dbDeleteProdukHukum(confirmDelete.id);
    const fresh = await dbFetchProdukHukum();
    setList(fresh);
    setConfirmDelete(null);
    showToast('Produk Hukum berhasil dihapus dari database Supabase.');
  };

  const filteredList = list.filter((item) => {
    const matchSearch =
      item.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nomor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.keterangan && item.keterangan.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchKategori = filterKategori === 'all' || item.kategori === filterKategori;
    return matchSearch && matchKategori;
  });

  return (
    <div className="space-y-6">
      {toastMsg && (
        <div className="p-4 bg-[#0D2A4A] text-white rounded-2xl shadow-lg border border-blue-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#FFB300]" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header & Tombol Tambah */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-[#0D2A4A] font-heading flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#1565C0]" />
            <span>Kelola Produk Hukum & Peraturan Desa</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dokumentasi resmi Peraturan Desa (Perdes), Perkades, dan Keputusan Kepala Desa Nyurlembang.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-[#2E7D32] hover:bg-[#256629] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#FFB300]" />
          <span>Tambah Dokumen Hukum Baru</span>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cari judul, nomor SK, atau kata kunci..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#1565C0] outline-none"
          />
        </div>

        <div>
          <select
            value={filterKategori}
            onChange={(e) => setFilterKategori(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#1565C0] outline-none"
          >
            <option value="all">Semua Kategori Regulasi ({list.length})</option>
            {KATEGORI_OPTIONS.map((k) => (
              <option key={k} value={k}>
                {k} ({list.filter((i) => i.kategori === k).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabel Dokumen Produk Hukum */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
              <tr>
                <th className="p-3.5">Nomor & Kategori</th>
                <th className="p-3.5">Judul Peraturan Desa</th>
                <th className="p-3.5">Tanggal Penetapan</th>
                <th className="p-3.5">Berkas PDF/Dokumen</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    Tidak ada produk hukum yang sesuai pencarian atau filter.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 align-top">
                      <div className="font-mono font-bold text-slate-900">
                        No. {item.nomor} Th {item.tahun}
                      </div>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-[#1565C0] border border-blue-100">
                        {item.kategori}
                      </span>
                    </td>
                    <td className="p-3.5 align-top max-w-md">
                      <div className="font-bold text-slate-900 leading-snug text-xs sm:text-sm">
                        {item.judul}
                      </div>
                      {item.keterangan && (
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {item.keterangan}
                        </p>
                      )}
                    </td>
                    <td className="p-3.5 align-top whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {new Date(item.tanggal_penetapan).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="p-3.5 align-top whitespace-nowrap">
                      {item.file_url ? (
                        <a
                          href={item.file_url}
                          download={item.nama_file || `Peraturan_Desa_${item.nomor}.pdf`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          <Download className="w-3 h-3" />
                          <span>Unduh PDF</span>
                          {item.ukuran_file && (
                            <span className="text-[9px] text-emerald-600 font-mono">
                              ({item.ukuran_file})
                            </span>
                          )}
                        </a>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Tanpa Berkas</span>
                      )}
                    </td>
                    <td className="p-3.5 align-top text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="px-2.5 py-1 bg-blue-50 text-[#1565C0] hover:bg-blue-100 rounded-lg font-semibold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                          title="Edit produk hukum"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(item)}
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus produk hukum"
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

      {/* MODAL FORM TAMBAH / EDIT PRODUK HUKUM */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-[#1565C0]" />
                <h3 className="font-heading font-bold text-base text-[#0D2A4A]">
                  {editingItem ? 'Sunting Produk Hukum Desa' : 'Tambah Produk Hukum & Regulasi Desa'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Kategori Peraturan / Dokumen Hukum *
                </label>
                <select
                  required
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value as KategoriProdukHukum)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-[#1565C0] outline-none"
                >
                  {KATEGORI_OPTIONS.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Nomor Peraturan *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 04"
                    value={nomor}
                    onChange={(e) => setNomor(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-[#1565C0] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Tahun Pengundangan *</label>
                  <input
                    type="number"
                    required
                    min={2000}
                    max={2030}
                    value={tahun}
                    onChange={(e) => setTahun(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-[#1565C0] outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Judul Lengkap Naskah Regulasi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Peraturan Desa tentang Anggaran Pendapatan dan Belanja Desa Tahun 2026"
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-[#1565C0] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Tanggal Penetapan *</label>
                <input
                  type="date"
                  required
                  value={tanggalPenetapan}
                  onChange={(e) => setTanggalPenetapan(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-[#1565C0] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Uraian / Ringkasan Pokok Isi Peraturan
                </label>
                <textarea
                  rows={3}
                  placeholder="Ringkasan atau penjelasan singkat materi muatan produk hukum..."
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-[#1565C0] outline-none"
                />
              </div>

              {/* Upload Berkas Dokumen PDF */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    <span>Lampiran Berkas PDF Resmi</span>
                  </div>
                  <span className="text-[10px] text-slate-400">PDF, DOC, DOCX</span>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {namaFile ? (
                  <div className="flex items-center justify-between p-2.5 bg-white border border-emerald-200 rounded-xl">
                    <div className="truncate mr-2">
                      <div className="font-semibold text-slate-800 truncate">{namaFile}</div>
                      <div className="text-[10px] text-emerald-700 font-mono font-bold">
                        {ukuranFile || 'Tersimpan'}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFileUrl(undefined);
                        setNamaFile(undefined);
                        setUkuranFile(undefined);
                      }}
                      className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer"
                      title="Hapus berkas"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2 px-3 bg-white hover:bg-slate-100 border border-dashed border-slate-300 text-slate-700 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Upload className="w-4 h-4 text-[#1565C0]" />
                    <span>Unggah Berkas Lembaran Desa (PDF)</span>
                  </button>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2E7D32] hover:bg-[#256629] text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  {editingItem ? 'Simpan Perubahan' : 'Terbitkan Dokumen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600 pb-2 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Hapus Produk Hukum?</h3>
                <p className="text-[11px] text-slate-500">Tindakan ini permanen</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus <strong>"{confirmDelete.judul}"</strong> (Nomor {confirmDelete.nomor} Tahun {confirmDelete.tahun})?
            </p>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs cursor-pointer text-xs"
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
