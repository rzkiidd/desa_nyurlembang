import React, { useState, useEffect } from 'react';
import { getStoredPengaturanDesa } from '../lib/supabaseClient';
import {
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  Clock,
  Youtube,
  Instagram,
  Facebook,
  ExternalLink,
  Map
} from 'lucide-react';

export const Footer: React.FC = () => {
  const [pengaturan, setPengaturan] = useState(getStoredPengaturanDesa());

  useEffect(() => {
    const handleUpdate = () => {
      setPengaturan(getStoredPengaturanDesa());
    };
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('pengaturan_desa_updated', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('pengaturan_desa_updated', handleUpdate);
    };
  }, []);

  const mapEmbedUrl = pengaturan.google_maps_embed && !pengaturan.google_maps_embed.includes('116.2085')
    ? pengaturan.google_maps_embed
    : 'https://maps.google.com/maps?q=-8.58922199365014,116.19106227542514&hl=id&z=15&output=embed';

  return (
    <footer className="bg-[#0D2A4A] text-slate-300 pt-8 pb-6 border-t border-blue-900/60 no-print font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* GRID UTAMA COMPACT (3 KOLOM) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-6 border-b border-blue-900/40">
          {/* Kolom 1 (4 cols): Identitas Resmi Desa & Integritas Dokumen */}
          <div className="md:col-span-4 space-y-3">
            <div className="flex items-center gap-2.5">
              <img
                src="/logo.png"
                alt="Logo Desa Nyurlembang"
                className="w-8 h-8 object-contain"
              />
              <div>
                <h4 className="font-heading font-black text-white text-xs tracking-tight uppercase">
                  PEMERINTAH DESA NYURLEMBANG
                </h4>
                <p className="text-[10px] text-slate-400">Kec. Narmada • Kab. Lombok Barat, NTB</p>
              </div>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              Portal Layanan Mandiri & Sistem Informasi Desa (SID) terintegrasi SPBE. Bebas pungutan liar dan transparan.
            </p>

            <div className="p-2.5 bg-blue-950/60 rounded-xl border border-blue-900/70 text-[10px] text-slate-300 space-y-1">
              <span className="font-bold text-white block">Integritas Dokumen Dinas:</span>
              <span>Dokumen resmi diterbitkan dengan nomor register desa, tanda tangan basah Kepala Desa, dan cap stempel sah.</span>
            </div>
          </div>

          {/* Kolom 2 (4 cols): Loket, Jam Kerja & Sosial Media Tergabung (Icon Saja) */}
          <div className="md:col-span-4 space-y-3 text-xs">
            <h4 className="font-heading font-bold text-white uppercase tracking-wider text-xs flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#03A9F4]" />
              <span>Loket & Jam Kerja</span>
            </h4>

            <div className="space-y-1.5 text-[11px] text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#03A9F4] shrink-0 mt-0.5" />
                <span className="line-clamp-2">{pengaturan.alamat_kantor}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#FFB300] shrink-0" />
                <span>{pengaturan.email_desa}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#2E7D32] shrink-0" />
                <span>Hotline KPPID: <strong className="text-white font-mono">{pengaturan.telepon_kppid}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#03A9F4] shrink-0" />
                <span>{pengaturan.jam_pelayanan}</span>
              </div>
            </div>

            {/* Gabungan Media Sosial Resmi - Cukup Icon Saja */}
            <div className="pt-2 border-t border-blue-900/50">
              <div className="text-[10px] text-slate-400 font-semibold mb-2">Media Sosial Resmi:</div>
              <div className="flex items-center gap-2">
                {/* YouTube */}
                <a
                  href={pengaturan.sosial_media.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-lg bg-red-950/60 hover:bg-red-600 text-red-400 hover:text-white border border-red-800/60 flex items-center justify-center transition-all shadow-xs"
                  title="YouTube Resmi Desa Nyurlembang"
                >
                  <Youtube className="w-4 h-4" />
                </a>

                {/* Instagram */}
                <a
                  href={pengaturan.sosial_media.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-lg bg-pink-950/60 hover:bg-pink-600 text-pink-400 hover:text-white border border-pink-800/60 flex items-center justify-center transition-all shadow-xs"
                  title="Instagram @pemdesnyurlembang"
                >
                  <Instagram className="w-4 h-4" />
                </a>

                {/* TikTok */}
                <a
                  href={pengaturan.sosial_media.tiktok}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-black text-slate-300 hover:text-white border border-slate-700 flex items-center justify-center font-black text-[11px] transition-all shadow-xs"
                  title="TikTok @desanyurlembang"
                >
                  Tk
                </a>

                {/* Facebook */}
                <a
                  href={pengaturan.sosial_media.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-lg bg-blue-950/60 hover:bg-[#1565C0] text-[#03A9F4] hover:text-white border border-blue-800 flex items-center justify-center transition-all shadow-xs"
                  title="Facebook Pemerintah Desa Nyurlembang"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Kolom 3 (4 cols): Peta Lokasi Geografis Ringkas */}
          <div className="md:col-span-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[#03A9F4] font-bold text-xs">
                <Map className="w-3.5 h-3.5" />
                <span>Peta Wilayah Desa</span>
              </div>
              <a
                href="https://maps.google.com/?q=-8.58922199365014,116.19106227542514(Kantor+Desa+Nyurlembang)"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-slate-400 hover:text-[#03A9F4] flex items-center gap-1 transition-colors"
              >
                <span>Buka Google Maps</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

            <div className="w-full h-32 rounded-xl overflow-hidden border border-blue-900/60 shadow-sm bg-slate-900 relative group">
              <iframe
                title="Peta Lokasi Desa Nyurlembang"
                src={mapEmbedUrl}
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <a
                href="https://maps.google.com/?q=-8.58922199365014,116.19106227542514(Desa+Nyurlembang)"
                target="_blank"
                rel="noreferrer"
                className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-md bg-black/75 hover:bg-[#1565C0] text-[10px] text-white flex items-center gap-1 backdrop-blur-xs transition-colors"
              >
                <span>Peta Nyurlembang</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            <p className="text-[10px] text-slate-400">
              Kec. Narmada, Lombok Barat • Luas 312 Ha (4 Dusun).
            </p>
          </div>
        </div>

        {/* BAGIAN BAWAH: HAK CIPTA LEBIH RINGKAS */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-400">
          <div>
            © {new Date().getFullYear()} Pemerintah Desa Nyurlembang, Lombok Barat. Hak Cipta Dilindungi.
          </div>
          <div className="flex items-center gap-2">
            <span>Sistem Informasi Desa (SID) SPBE</span>
            <span>•</span>
            <span className="text-[#03A9F4]">Terverifikasi Disdukcapil & PMD</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
