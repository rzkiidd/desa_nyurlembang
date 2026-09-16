import React, { useState, useEffect } from 'react';
import { BeritaDesa, KomentarBerita } from '../types';
import { getStoredKomentar, saveStoredKomentar } from '../lib/supabaseClient';
import {
  applySeoMetadata,
  generateSocialShareLinks,
  toAbsoluteUrl,
  DEFAULT_FALLBACK_IMAGE
} from '../utils/seo';
import {
  ArrowLeft,
  Calendar,
  User,
  Tag,
  Share2,
  MessageSquare,
  Send,
  CheckCircle2,
  ThumbsUp,
  Clock,
  Eye,
  Bookmark,
  Building2,
  Check,
  Copy,
  ExternalLink
} from 'lucide-react';

interface DetailBeritaProps {
  berita: BeritaDesa;
  onBack: () => void;
}

export const DetailBerita: React.FC<DetailBeritaProps> = ({ berita, onBack }) => {
  const [komentarList, setKomentarList] = useState<KomentarBerita[]>(() => {
    const all = getStoredKomentar();
    return all.filter((k) => k.berita_id === berita.id);
  });

  const [namaKomen, setNamaKomen] = useState('');
  const [dusunKomen, setDusunKomen] = useState('Dusun Nyurlembang Daye');
  const [pesanKomen, setPesanKomen] = useState('');
  const [notifKomen, setNotifKomen] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Injeksi Meta Tags Dinamis (Open Graph, Twitter Card, Absolute Image, 1200x630, Fallback Gambar)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const cleanupSeo = applySeoMetadata({
      title: berita.judul,
      description: berita.ringkasan || berita.judul,
      imageUrl: toAbsoluteUrl(berita.gambar_url || DEFAULT_FALLBACK_IMAGE),
      type: 'article',
      author: berita.penulis,
      publishedTime: berita.published_at,
    });

    return () => {
      cleanupSeo();
    };
  }, [berita]);

  const shareLinks = generateSocialShareLinks(berita);

  const handleShareSosmed = (platform: 'wa' | 'fb' | 'x' | 'telegram' | 'linkedin' | 'pinterest') => {
    switch (platform) {
      case 'wa':
        window.open(shareLinks.whatsapp, '_blank');
        break;
      case 'fb':
        window.open(shareLinks.facebook, '_blank');
        break;
      case 'x':
        window.open(shareLinks.twitter, '_blank');
        break;
      case 'telegram':
        window.open(shareLinks.telegram, '_blank');
        break;
      case 'linkedin':
        window.open(shareLinks.linkedin, '_blank');
        break;
      case 'pinterest':
        window.open(shareLinks.pinterest, '_blank');
        break;
    }
  };

  const handleCopyLink = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareLinks.articleUrl);
      } else {
        const input = document.createElement('input');
        input.value = shareLinks.articleUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleKirimKomentar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaKomen.trim() || !pesanKomen.trim()) {
      alert('Nama dan isi komentar wajib diisi!');
      return;
    }

    const baru: KomentarBerita = {
      id: `kom-${Date.now()}`,
      berita_id: berita.id,
      berita_judul: berita.judul,
      nama: namaKomen.trim(),
      dusun: dusunKomen,
      pesan: pesanKomen.trim(),
      created_at: new Date().toISOString(),
      status: 'disetujui',
    };

    const allKomentar = getStoredKomentar();
    const updated = [baru, ...allKomentar];
    saveStoredKomentar(updated);

    setKomentarList([baru, ...komentarList]);
    setNamaKomen('');
    setPesanKomen('');
    setNotifKomen('Komentar Anda berhasil dikirim dan tersimpan di sistem administrasi desa!');
    setTimeout(() => setNotifKomen(null), 4000);
  };

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 space-y-8 animate-in fade-in duration-300">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Tombol Kembali & Menu Berbagi ke Semua Sosmed */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-[#0D2A4A] rounded-xl text-xs font-bold border border-slate-200 transition-colors shadow-xs self-start cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#1565C0]" />
            <span>Kembali ke Kabar Desa</span>
          </button>

          {/* Bagikan ke Semua Sosial Media dengan Pratinjau Thumbnail Otomatis */}
          <div className="flex flex-wrap items-center gap-2 bg-white px-3.5 py-2 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] text-slate-500 font-bold flex items-center gap-1 mr-1">
              <Share2 className="w-3.5 h-3.5 text-[#1565C0]" />
              <span>Bagikan:</span>
            </span>

            {/* WhatsApp */}
            <button
              type="button"
              onClick={() => handleShareSosmed('wa')}
              className="px-2.5 py-1.5 bg-[#25D366]/10 hover:bg-[#25D366] text-[#25D366] hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              title="Bagikan ke WhatsApp (Tampil Thumbnail & Ringkasan)"
            >
              <span>WhatsApp</span>
            </button>

            {/* Facebook */}
            <button
              type="button"
              onClick={() => handleShareSosmed('fb')}
              className="px-2.5 py-1.5 bg-[#1877F2]/10 hover:bg-[#1877F2] text-[#1877F2] hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              title="Bagikan ke Facebook"
            >
              <span>Facebook</span>
            </button>

            {/* X (Twitter) */}
            <button
              type="button"
              onClick={() => handleShareSosmed('x')}
              className="px-2.5 py-1.5 bg-slate-900/10 hover:bg-black text-slate-800 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              title="Bagikan ke X / Twitter"
            >
              <span>X</span>
            </button>

            {/* Telegram */}
            <button
              type="button"
              onClick={() => handleShareSosmed('telegram')}
              className="px-2.5 py-1.5 bg-[#229ED9]/10 hover:bg-[#229ED9] text-[#229ED9] hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              title="Bagikan ke Telegram"
            >
              <span>Telegram</span>
            </button>

            {/* LinkedIn */}
            <button
              type="button"
              onClick={() => handleShareSosmed('linkedin')}
              className="px-2.5 py-1.5 bg-[#0A66C2]/10 hover:bg-[#0A66C2] text-[#0A66C2] hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              title="Bagikan ke LinkedIn"
            >
              <span>LinkedIn</span>
            </button>

            {/* Pinterest */}
            <button
              type="button"
              onClick={() => handleShareSosmed('pinterest')}
              className="px-2.5 py-1.5 bg-[#BD081C]/10 hover:bg-[#BD081C] text-[#BD081C] hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              title="Bagikan ke Pinterest"
            >
              <span>Pinterest</span>
            </button>

            {/* Salin Tautan Berita */}
            <button
              type="button"
              onClick={handleCopyLink}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border ${
                copiedLink
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
              title="Salin Tautan Artikel"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Artikel Utama */}
        <article className="card-kedinasan p-6 sm:p-8 md:p-10 space-y-6 bg-white shadow-sm">
          {/* Kategori & Metadata Header */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-[#1565C0] text-xs font-bold rounded-full border border-blue-200">
              <Tag className="w-3.5 h-3.5 text-[#1565C0]" />
              <span>{berita.kategori}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0D2A4A] font-heading leading-tight">
              {berita.judul}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 border-b border-slate-100 pb-4">
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-[#1565C0]" />
                <span>
                  {new Date(berita.published_at).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </span>

              <span className="flex items-center gap-1.5 font-medium">
                <User className="w-3.5 h-3.5 text-[#2E7D32]" />
                <span>Penulis: {berita.penulis}</span>
              </span>

              <span className="flex items-center gap-1.5 font-medium">
                <Eye className="w-3.5 h-3.5 text-[#FFB300]" />
                <span>Dilihat 342 kali</span>
              </span>
            </div>
          </div>

          {/* Gambar Utama (Aspect ratio terlindungi & fluid) */}
          <div className="rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 relative aspect-video w-full">
            <img
              src={berita.gambar_url || toAbsoluteUrl(DEFAULT_FALLBACK_IMAGE)}
              alt={berita.judul}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Ringkasan Berita */}
          <div className="p-4 sm:p-5 bg-blue-50/60 rounded-2xl border-l-4 border-[#1565C0] text-sm sm:text-base text-[#0D2A4A] font-medium leading-relaxed italic">
            "{berita.ringkasan}"
          </div>

          {/* Konten Lengkap Berita */}
          <div className="text-slate-800 text-sm sm:text-base leading-relaxed space-y-4 whitespace-pre-line font-sans">
            {berita.konten || berita.ringkasan}
          </div>

          {/* Kotak Info Verifikasi Resmi */}
          <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#1565C0] shrink-0" />
              <span>Dokumentasi Resmi Publikasi Pemerintah Desa Nyurlembang, Lombok Barat.</span>
            </div>
            <span className="font-mono text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
              Terverifikasi Redaksi
            </span>
          </div>
        </article>

        {/* Bagian Komentar & Tanggapan Warga */}
        <section className="card-kedinasan p-6 sm:p-8 space-y-6 bg-white shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#1565C0]" />
              <h3 className="font-heading font-bold text-lg text-[#0D2A4A]">
                Tanggapan & Komentar Warga ({komentarList.length})
              </h3>
            </div>
            <span className="text-xs text-slate-500">Masuk langsung ke Meja Staf</span>
          </div>

          {notifKomen && (
            <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{notifKomen}</span>
            </div>
          )}

          {/* Formulir Komentar */}
          <form onSubmit={handleKirimKomentar} className="space-y-4 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
            <div className="font-bold text-xs text-[#0D2A4A]">Tulis Komentar atau Pertanyaan:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Nama Lengkap Warga
                </label>
                <input
                  type="text"
                  value={namaKomen}
                  onChange={(e) => setNamaKomen(e.target.value)}
                  placeholder="Contoh: Nurul Hidayat"
                  required
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-[#1565C0] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Asal Dusun
                </label>
                <select
                  value={dusunKomen}
                  onChange={(e) => setDusunKomen(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-[#1565C0] focus:outline-none"
                >
                  <option value="Dusun Nyurlembang Daye">Dusun Nyurlembang Daye</option>
                  <option value="Dusun Nyurlembang Barat">Dusun Nyurlembang Barat</option>
                  <option value="Dusun Telaga Ngembeng (Telage Ngembeng)">Dusun Telaga Ngembeng (Telage Ngembeng)</option>
                  <option value="Dusun Tatar">Dusun Tatar</option>
                  <option value="Warga Luar Desa">Warga Luar Desa / Tamu</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Isi Tanggapan
              </label>
              <textarea
                rows={3}
                value={pesanKomen}
                onChange={(e) => setPesanKomen(e.target.value)}
                placeholder="Sampaikan komentar, apresiasi, atau masukan yang membangun untuk kemajuan desa..."
                required
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-[#1565C0] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-[#1565C0] hover:bg-[#0D2A4A] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Kirim Tanggapan</span>
            </button>
          </form>

          {/* Daftar Komentar */}
          <div className="space-y-3 pt-2">
            {komentarList.map((k) => (
              <div
                key={k.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#1565C0] text-white flex items-center justify-center font-bold text-[10px]">
                      {k.nama.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-[#0D2A4A]">{k.nama}</div>
                      <div className="text-[10px] text-[#2E7D32] font-semibold">{k.dusun}</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(k.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <p className="text-xs text-slate-700 pl-9 leading-relaxed">{k.pesan}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
