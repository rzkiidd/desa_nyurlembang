import React, { useState } from 'react';
import { GaleriKegiatan } from '../types';
import { Camera, Calendar, MapPin, Tag, ZoomIn, X, ChevronRight, ChevronLeft, Sparkles, Filter } from 'lucide-react';

interface GaleriKegiatanDesaProps {
  galeriList: GaleriKegiatan[];
}

export const GaleriKegiatanDesa: React.FC<GaleriKegiatanDesaProps> = ({ galeriList }) => {
  const [selectedKategori, setSelectedKategori] = useState<string>('all');
  const [selectedPhoto, setSelectedPhoto] = useState<GaleriKegiatan | null>(null);

  // Kategori unik dari daftar galeri
  const categories = ['all', ...Array.from(new Set(galeriList.map((g) => g.kategori)))];

  const filtered = selectedKategori === 'all'
    ? galeriList
    : galeriList.filter((g) => g.kategori === selectedKategori);

  return (
    <section id="section-galeri-desa" className="max-w-7xl mx-auto px-4 lg:px-8">
      {/* Header Galeri */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-[#1565C0] text-xs font-bold rounded-full mb-2 border border-blue-200">
            <Camera className="w-3.5 h-3.5 text-[#1565C0]" />
            <span>Dokumentasi Visual & Kegiatan Lapangan</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#0D2A4A] font-heading">
            Galeri Foto Kegiatan Desa Nyurlembang
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Potret dinamika pembangunan, aksi gotong royong warga, pelayanan posyandu terpadu, dan pemberdayaan masyarakat di 4 Dusun Desa Nyurlembang.
          </p>
        </div>

        {/* Filter Kategori */}
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((kat) => (
            <button
              key={kat}
              onClick={() => setSelectedKategori(kat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedKategori === kat
                  ? 'bg-[#1565C0] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {kat === 'all' ? 'Semua Kegiatan' : kat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Foto Kegiatan */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
          Belum ada foto kegiatan dalam kategori ini.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg hover:border-[#1565C0] transition-all flex flex-col justify-between"
            >
              <div className="relative h-52 bg-slate-100 overflow-hidden">
                <img
                  src={item.foto_url}
                  alt={item.nama_kegiatan}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                {/* Badge Kategori */}
                <span className="absolute top-3 left-3 px-2.5 py-1 bg-[#0D2A4A]/85 backdrop-blur-xs text-white text-[10px] font-bold rounded-lg border border-white/20">
                  {item.kategori}
                </span>

                {/* Tombol Zoom Foto */}
                <button
                  onClick={() => setSelectedPhoto(item)}
                  className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white text-slate-900 rounded-lg backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                  title="Lihat Foto Lebih Besar"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>

                {/* Tanggal & Lokasi di atas gambar */}
                <div className="absolute bottom-3 left-3 right-3 text-white text-[11px] flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-medium drop-shadow-sm">
                    <Calendar className="w-3.5 h-3.5 text-[#FFB300]" />
                    <span>
                      {new Date(item.tanggal).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 font-medium drop-shadow-sm truncate max-w-[50%]">
                    <MapPin className="w-3.5 h-3.5 text-[#03A9F4] shrink-0" />
                    <span className="truncate">{item.lokasi}</span>
                  </div>
                </div>
              </div>

              {/* Konten Nama Kegiatan & Deskripsi */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-[#0D2A4A] text-base leading-snug group-hover:text-[#1565C0] transition-colors">
                    {item.nama_kegiatan}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-3">
                    {item.deskripsi}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-500">Desa Nyurlembang</span>
                  <button
                    onClick={() => setSelectedPhoto(item)}
                    className="text-xs font-bold text-[#1565C0] hover:text-[#0D2A4A] flex items-center gap-1"
                  >
                    <span>Detail Foto</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Detail Foto (Lightbox) */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="relative max-h-[55vh] sm:max-h-[60vh] bg-slate-900 overflow-hidden flex items-center justify-center">
              <img
                src={selectedPhoto.foto_url}
                alt={selectedPhoto.nama_kegiatan}
                className="max-h-[55vh] sm:max-h-[60vh] w-full object-contain"
              />
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-3 left-4 px-3 py-1 bg-black/70 backdrop-blur-xs text-white rounded-full text-xs font-semibold">
                {selectedPhoto.kategori}
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#1565C0]" />
                  <span>
                    {new Date(selectedPhoto.tanggal).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#2E7D32]" />
                  <span>{selectedPhoto.lokasi}</span>
                </div>
              </div>

              <h3 className="text-xl font-bold text-[#0D2A4A] font-heading">
                {selectedPhoto.nama_kegiatan}
              </h3>

              <p className="text-xs md:text-sm text-slate-700 leading-relaxed">
                {selectedPhoto.deskripsi}
              </p>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="px-5 py-2.5 bg-[#0D2A4A] hover:bg-[#1565C0] text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
