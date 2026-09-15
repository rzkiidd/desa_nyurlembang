import React, { useEffect } from 'react';
import { PotensiUmkm } from '../types';
import {
  ArrowLeft,
  Store,
  Phone,
  MapPin,
  Tag,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Share2,
  Building
} from 'lucide-react';

interface DetailUmkmProps {
  umkm: PotensiUmkm;
  onBack: () => void;
}

export const DetailUmkm: React.FC<DetailUmkmProps> = ({ umkm, onBack }) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Produk dummy terkurasi sesuai UMKM
  const produkVarian = [
    {
      id: 'p-1',
      nama: `${umkm.nama_usaha} - Kemasan Reguler`,
      harga: umkm.harga_rentang.split('-')[0]?.trim() || 'Rp 25.000',
      deskripsi: 'Diproduksi higienis dengan bahan baku pilihan dari perkebunan dan alam Desa Nyurlembang.',
      badge: 'Terlaris'
    },
    {
      id: 'p-2',
      nama: `${umkm.nama_usaha} - Paket Spesial Oleh-Oleh`,
      harga: umkm.harga_rentang.split('-')[1]?.trim() || 'Rp 75.000',
      deskripsi: 'Kemasan eksklusif kedap udara, cocok sebagai buah tangan khas Desa Nyurlembang, Lombok Barat.',
      badge: 'Paket Hemat'
    },
    {
      id: 'p-3',
      nama: `${umkm.nama_usaha} - Pesanan Curah / Grosir`,
      harga: 'Hubungi Penjual',
      deskripsi: 'Menerima pesanan dalam jumlah besar untuk hajatan, restoran, atau reseller.',
      badge: 'Grosir'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Tombol Navigasi Kembali */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-[#0D2A4A] rounded-xl text-xs font-bold border border-slate-200 transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4 text-[#1565C0]" />
          <span>Kembali ke Etalase UMKM</span>
        </button>

        <a
          href={`https://wa.me/62${umkm.kontak_wa.replace(/^0/, '')}?text=${encodeURIComponent(
            `Halo ${umkm.pemilik} (${umkm.nama_usaha}), saya tertarik dengan produk Anda di Portal Desa Nyurlembang.`
          )}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#2E7D32] hover:bg-[#256629] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
        >
          <Phone className="w-4 h-4 text-[#FFB300]" />
          <span>Pesan via WhatsApp</span>
        </a>
      </div>

      {/* Profil Banner UMKM */}
      <div className="card-kedinasan p-6 sm:p-8 bg-white space-y-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Logo / Foto UMKM */}
          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-md bg-slate-100 shrink-0 relative group">
            <img
              src={umkm.foto_url}
              alt={umkm.nama_usaha}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute bottom-1 right-1 bg-emerald-600 text-white p-1 rounded-lg">
              <Store className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-emerald-50 text-[#2E7D32] text-xs font-bold rounded-full border border-emerald-200">
                Kategori {umkm.kategori}
              </span>
              <span className="px-3 py-1 bg-blue-50 text-[#1565C0] text-xs font-bold rounded-full border border-blue-200 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{umkm.dusun}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0D2A4A] font-heading">
              {umkm.nama_usaha}
            </h1>

            <div className="text-xs text-slate-600 flex flex-wrap items-center gap-4 pt-1">
              <span>Pemilik Usaha: <strong className="text-slate-900">{umkm.pemilik}</strong></span>
              <span>•</span>
              <span>Kisaran Harga: <strong className="text-[#2E7D32] font-mono">{umkm.harga_rentang}</strong></span>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pt-2">
              {umkm.deskripsi}
            </p>
          </div>
        </div>

        {/* Jaminan Produk Warga */}
        <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-900">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Usaha Mikro Kecil & Menengah Terdata & Dibina oleh Pemerintah Desa Nyurlembang.</span>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 bg-white px-3 py-1 rounded-xl border border-emerald-300">
            100% Produk Lokal
          </span>
        </div>
      </div>

      {/* Katalog Produk & Varian */}
      <div className="card-kedinasan p-6 sm:p-8 bg-white space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#2E7D32]" />
            <h2 className="text-lg font-bold text-[#0D2A4A] font-heading">
              Daftar Produk & Varian Usaha
            </h2>
          </div>
          <span className="text-xs text-slate-500">Pesan Langsung ke Pemilik</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {produkVarian.map((prod) => (
            <div
              key={prod.id}
              className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-[#2E7D32] transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <span className="inline-block px-2.5 py-0.5 bg-emerald-100 text-[#2E7D32] text-[10px] font-bold rounded-md">
                  {prod.badge}
                </span>
                <h3 className="font-bold text-sm text-[#0D2A4A] leading-snug">
                  {prod.nama}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {prod.deskripsi}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <span className="font-mono text-sm font-extrabold text-[#2E7D32]">
                  {prod.harga}
                </span>
                <a
                  href={`https://wa.me/62${umkm.kontak_wa.replace(/^0/, '')}?text=${encodeURIComponent(
                    `Halo ${umkm.pemilik}, saya ingin memesan: ${prod.nama} (${prod.harga})`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-[#2E7D32] hover:bg-[#256629] text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-[#FFB300]" />
                  <span>Pesan</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
