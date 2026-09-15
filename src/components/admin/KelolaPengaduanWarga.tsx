import React, { useState, useEffect } from 'react';
import { PengaduanWargaItem, UserProfile } from '../../types';
import { useRealtimeSync } from '../../lib/useRealtimeSync';
import {
  dbFetchPengaduan,
  dbUpdatePengaduan,
  dbDeletePengaduan
} from '../../lib/supabaseClient';
import {
  MessageSquare,
  Search,
  CheckCircle2,
  Clock,
  Send,
  User,
  Phone,
  MapPin,
  Tag,
  AlertCircle,
  Eye,
  Trash2,
  X,
  ExternalLink
} from 'lucide-react';

interface KelolaPengaduanWargaProps {
  currentUser: UserProfile;
}

export const KelolaPengaduanWarga: React.FC<KelolaPengaduanWargaProps> = ({ currentUser }) => {
  const [list, setList] = useState<PengaduanWargaItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedPengaduan, setSelectedPengaduan] = useState<PengaduanWargaItem | null>(null);
  const [tanggapanText, setTanggapanText] = useState('');
  const [statusUbah, setStatusUbah] = useState<'Menunggu Tanggapan' | 'Sedang Diproses' | 'Selesai'>('Sedang Diproses');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const loadData = () => {
    dbFetchPengaduan().then((data) => setList(data));
  };

  useEffect(() => {
    loadData();
  }, []);

  useRealtimeSync('pengaduan_warga', (evt) => {
    loadData();
    if (evt.source === 'remote') {
      showToast('⚡ Data pengaduan warga diperbarui dari komputer lain!');
    }
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleOpenDetail = (item: PengaduanWargaItem) => {
    setSelectedPengaduan(item);
    setTanggapanText(item.tanggapan_petugas || '');
    setStatusUbah(item.status);
  };

  const handleSaveTanggapan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPengaduan) return;

    await dbUpdatePengaduan(
      selectedPengaduan.id,
      statusUbah,
      tanggapanText.trim(),
      currentUser.nama_lengkap
    );

    const fresh = await dbFetchPengaduan();
    setList(fresh);
    setSelectedPengaduan(null);
    showToast('Tanggapan dan status pengaduan warga berhasil diperbarui ke Supabase.');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus laporan pengaduan ini dari arsip desa?')) return;
    await dbDeletePengaduan(id);
    const fresh = await dbFetchPengaduan();
    setList(fresh);
    if (selectedPengaduan?.id === id) setSelectedPengaduan(null);
    showToast('Pengaduan berhasil dihapus dari database.');
  };

  const filtered = list.filter((item) => {
    const matchSearch =
      item.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nomor_tiket.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.isi_laporan.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {toastMsg && (
        <div className="p-4 bg-[#0D2A4A] text-white rounded-2xl shadow-lg border border-blue-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#FFB300]" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-[#0D2A4A] font-heading flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#1565C0]" />
            <span>Kelola Pengaduan & Aspirasi Warga</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Layanan pengaduan masyarakat desa Nyurlembang, keluhan fasilitas umum, dan tanggapan resmi staf.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-blue-50 text-[#1565C0] font-mono font-bold text-xs rounded-xl border border-blue-200">
            Total: {list.length} Laporan
          </span>
          <span className="px-3 py-1 bg-amber-50 text-amber-800 font-mono font-bold text-xs rounded-xl border border-amber-200">
            {list.filter((l) => l.status === 'Menunggu Tanggapan').length} Menunggu
          </span>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cari nomor tiket, nama pelapor, atau isi laporan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#1565C0] outline-none"
          />
        </div>

        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#1565C0] outline-none"
          >
            <option value="all">Semua Status Pengaduan</option>
            <option value="Menunggu Tanggapan">Menunggu Tanggapan</option>
            <option value="Sedang Diproses">Sedang Diproses</option>
            <option value="Selesai">Selesai</option>
          </select>
        </div>
      </div>

      {/* Daftar Pengaduan */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
            Tidak ada laporan pengaduan yang sesuai filter.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-blue-300 transition-all shadow-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-slate-100 font-mono text-[11px] font-bold text-slate-700 rounded-lg">
                    {item.nomor_tiket}
                  </span>
                  <span className="px-2 py-0.5 bg-blue-50 text-[#1565C0] text-[10px] font-bold rounded-md">
                    {item.kategori}
                  </span>
                  {item.rahasia && (
                    <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-bold rounded-md">
                      Anonim / Rahasia
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      item.status === 'Selesai'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.status === 'Sedang Diproses'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    ● {item.status}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(item.tanggal).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-sm text-[#0D2A4A]">{item.judul}</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">
                  {item.isi_laporan}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.rahasia ? 'Warga Nyurlembang (Disamarkan)' : item.nama}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.dusun}</span>
                  </span>
                  {item.telepon && (
                    <span className="flex items-center gap-1 font-mono">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.telepon}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenDetail(item)}
                    className="px-3 py-1.5 bg-blue-50 text-[#1565C0] hover:bg-blue-100 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Beri Tanggapan Staf</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Hapus pengaduan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL BERI TANGGAPAN & DETAIL PENGADUAN */}
      {selectedPengaduan && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#1565C0]" />
                <div>
                  <h3 className="font-heading font-bold text-base text-[#0D2A4A]">
                    Tanggapan Pengaduan: {selectedPengaduan.nomor_tiket}
                  </h3>
                  <div className="text-[11px] text-slate-500">{selectedPengaduan.judul}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPengaduan(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTanggapan} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              {/* Detail Pelapor */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-800 text-xs">Informasi Laporan Warga:</div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500">Nama: </span>
                    <strong className="text-slate-800">{selectedPengaduan.nama}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">NIK: </span>
                    <span className="font-mono text-slate-800">{selectedPengaduan.nik}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Dusun: </span>
                    <strong className="text-slate-800">{selectedPengaduan.dusun}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">No. WhatsApp: </span>
                    <span className="font-mono text-slate-800">{selectedPengaduan.telepon}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <div className="text-slate-500 text-[10px] mb-1 font-semibold">Isi Keluhan / Pengaduan:</div>
                  <p className="text-slate-800 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                    "{selectedPengaduan.isi_laporan}"
                  </p>
                </div>

                {selectedPengaduan.foto_url && (
                  <div className="pt-2 border-t border-slate-200">
                    <div className="text-slate-500 text-[10px] mb-1 font-semibold">Bukti Lampiran Foto:</div>
                    <img
                      src={selectedPengaduan.foto_url}
                      alt="Bukti Pengaduan"
                      className="max-h-48 rounded-xl object-cover border border-slate-200"
                    />
                  </div>
                )}
              </div>

              {/* Status Update */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">Status Penanganan *</label>
                <select
                  value={statusUbah}
                  onChange={(e) =>
                    setStatusUbah(
                      e.target.value as 'Menunggu Tanggapan' | 'Sedang Diproses' | 'Selesai'
                    )
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-[#1565C0] outline-none font-bold"
                >
                  <option value="Menunggu Tanggapan">Menunggu Tanggapan</option>
                  <option value="Sedang Diproses">Sedang Diproses (Petugas Turun ke Lapangan)</option>
                  <option value="Selesai">Selesai (Telah Ditindaklanjuti & Tuntas)</option>
                </select>
              </div>

              {/* Tanggapan Petugas */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Respon / Jawaban Resmi Staf Desa Nyurlembang *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tuliskan jawaban resmi penanganan, instruksi teknis, atau hasil pengecekan lapangan..."
                  value={tanggapanText}
                  onChange={(e) => setTanggapanText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-[#1565C0] outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Tanggapan ini akan dapat dilihat oleh pelapor saat mengecek status nomor tiket pengaduannya.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPengaduan(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2E7D32] hover:bg-[#256629] text-white font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Simpan Tanggapan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
