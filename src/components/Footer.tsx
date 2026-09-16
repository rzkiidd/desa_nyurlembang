import React, { useState, useEffect } from 'react';
import { getStoredPengaturanDesa } from '../lib/supabaseClient';
import { useRealtimeSync } from '../lib/useRealtimeSync';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Youtube,
  Instagram,
  Facebook,
  ExternalLink,
  Map,
  ShieldCheck
} from 'lucide-react';

export const Footer: React.FC = () => {
  const [pengaturan, setPengaturan] = useState(getStoredPengaturanDesa());

  const refreshPengaturan = () => {
    setPengaturan(getStoredPengaturanDesa());
  };

  useEffect(() => {
    refreshPengaturan();
    window.addEventListener('storage', refreshPengaturan);
    window.addEventListener('pengaturan_desa_updated', refreshPengaturan);
    return () => {
      window.removeEventListener('storage', refreshPengaturan);
      window.removeEventListener('pengaturan_desa_updated', refreshPengaturan);
    };
  }, []);

  useRealtimeSync('pengaturan_desa', () => {
    refreshPengaturan();
  });

  const mapEmbedUrl = pengaturan.google_maps_embed && !pengaturan.google_maps_embed.includes('116.2085')
    ? pengaturan.google_maps_embed
    : 'https://maps.google.com/maps?q=-8.58922199365014,116.19106227542514&hl=id&z=15&output=embed';

  return (
    <footer className="bg-[#0D2A4A] text-slate-300 pt-8 pb-6 border-t border-blue-900/60 no-print font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* GRID UTAMA (3 KOLOM BERSIH & COMPACT) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-6 border-b border-blue-900/40">
          {/* Kolom 1: Identitas Resmi */}
          <div className="md:col-span-4 space-y-3">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Logo Desa Nyurlembang"
                className="w-9 h-9 object-contain shrink-0"
              />
              <div>
                <h4 className="font-heading font-black text-white text-xs tracking-tight uppercase">
                  PEMERINTAH DESA NYURLEMBANG
                </h4>
                <p className="text-[10px] text-slate-400">Kecamatan Narmada, Kabupaten Lombok Barat, NTB</p>
              </div>
            </div>

            <p className="text-xs text-slate-300/90 leading-relaxed">
              Portal Layanan Mandiri & Sistem Informasi Desa (SID) resmi. Menghadirkan pelayanan publik yang cepat, transparan, dan terintegrasi standar SPBE.
            </p>

            <div className="flex items-center gap-2 text-[11px] text-emerald-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Pelayanan Publik Terakreditasi & Bebas Pungli</span>
            </div>
          </div>

          {/* Kolom 2: Kontak, Loket & Media Sosial */}
          <div className="md:col-span-4 space-y-3 text-xs">
            <h4 className="font-heading font-bold text-white uppercase tracking-wider text-xs flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#03A9F4]" />
              <span>Kontak & Jam Pelayanan</span>
            </h4>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#03A9F4] shrink-0 mt-0.5" />
                <span className="leading-snug">{pengaturan.alamat_kantor}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#FFB300] shrink-0" />
                <a href={`mailto:${pengaturan.email_desa}`} className="hover:text-white transition-colors">
                  {pengaturan.email_desa}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Hotline: <strong className="text-white font-mono">{pengaturan.telepon_kppid}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#03A9F4] shrink-0" />
                <span>Jam Pelayanan: <span className="text-white font-semibold">{pengaturan.jam_pelayanan}</span></span>
              </div>
            </div>

            {/* Media Sosial Resmi */}
            <div className="pt-2 border-t border-blue-900/50 flex items-center gap-2">
              <span className="text-[11px] text-slate-400 mr-1">Sosial Media:</span>
              <a
                href={pengaturan.sosial_media.youtube}
                target="_blank"
                rel="noreferrer"
                className="w-7 h-7 rounded-lg bg-red-950/60 hover:bg-red-600 text-red-400 hover:text-white border border-red-800/60 flex items-center justify-center transition-all shadow-xs"
                title="YouTube Desa Nyurlembang"
              >
                <Youtube className="w-3.5 h-3.5" />
              </a>
              <a
                href={pengaturan.sosial_media.instagram}
                target="_blank"
                rel="noreferrer"
                className="w-7 h-7 rounded-lg bg-pink-950/60 hover:bg-pink-600 text-pink-400 hover:text-white border border-pink-800/60 flex items-center justify-center transition-all shadow-xs"
                title="Instagram @pemdesnyurlembang"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a
                href={pengaturan.sosial_media.tiktok}
                target="_blank"
                rel="noreferrer"
                className="w-7 h-7 rounded-lg bg-slate-900 hover:bg-black text-slate-300 hover:text-white border border-slate-700 flex items-center justify-center font-bold text-[10px] transition-all shadow-xs"
                title="TikTok @desanyurlembang"
              >
                Tk
              </a>
              <a
                href={pengaturan.sosial_media.facebook}
                target="_blank"
                rel="noreferrer"
                className="w-7 h-7 rounded-lg bg-blue-950/60 hover:bg-[#1565C0] text-[#03A9F4] hover:text-white border border-blue-800 flex items-center justify-center transition-all shadow-xs"
                title="Facebook Pemerintah Desa Nyurlembang"
              >
                <Facebook className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Kolom 3: Peta Lokasi Geografis Bersih */}
          <div className="md:col-span-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[#03A9F4] font-bold text-xs">
                <Map className="w-3.5 h-3.5" />
                <span>Peta Kantor Desa</span>
              </div>
              <a
                href="https://maps.google.com/?q=-8.58922199365014,116.19106227542514(Kantor+Desa+Nyurlembang)"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-slate-400 hover:text-[#03A9F4] flex items-center gap-1 transition-colors"
              >
                <span>Buka Rute Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="w-full h-32 rounded-xl overflow-hidden border border-blue-900/60 shadow-inner bg-slate-900">
              <iframe
                title="Peta Lokasi Kantor Desa Nyurlembang"
                src={mapEmbedUrl}
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <p className="text-[10px] text-slate-400">
              Titik Koordinat: -8.58922, 116.19106 • Wilayah 4 Dusun
            </p>
          </div>
        </div>

        {/* BAGIAN BAWAH: HAK CIPTA LEBIH RINGKAS */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
          <div>
            © {new Date().getFullYear()} Pemerintah Desa Nyurlembang, Kec. Narmada, Kab. Lombok Barat.
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <span>Sistem Informasi Desa (SID)</span>
            <span>•</span>
            <span className="text-[#03A9F4]">SPBE Terintegrasi</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
