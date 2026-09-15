import React, { useState } from 'react';
import {
  ArrowLeft,
  Building2,
  Compass,
  History,
  Target,
  Users,
  MapPin,
  Trees,
  CheckCircle2,
  Sparkles,
  Phone,
  Mail,
  Clock,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Award
} from 'lucide-react';
import { PROFIL_DESA } from '../data/mockData';
import { getStoredStatistikDesa } from '../lib/supabaseClient';

interface HalamanProfilDesaProps {
  onBack: () => void;
  defaultTab?: string;
}

export const HalamanProfilDesa: React.FC<HalamanProfilDesaProps> = ({ onBack, defaultTab = 'tentang' }) => {
  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  const statistik = getStoredStatistikDesa();

  const tabs = [
    { id: 'tentang', label: 'Tentang Desa', icon: Building2 },
    { id: 'visi-misi', label: 'Visi & Misi', icon: Target },
    { id: 'sejarah', label: 'Sejarah Desa', icon: History },
    { id: 'geografis', label: 'Letak Geografis', icon: Compass },
    { id: 'dusun', label: 'Wilayah 4 Dusun', icon: Users },
    { id: 'budaya', label: 'Kearifan Lokal "Besiru"', icon: Trees },
  ];

  const dusunList = [
    {
      nama: 'Dusun Nyurlembang Daye',
      kk: 365,
      jiwa: 1240,
      karakteristik: 'Kawasan pemukiman utara dengan tradisi adat Sasak yang asri, sentra penderes nira aren, dan fasilitas layanan kemasyarakatan.',
      kepala_dusun: 'M. Rusdi',
    },
    {
      nama: 'Dusun Nyurlembang Barat',
      kk: 382,
      jiwa: 1310,
      karakteristik: 'Kawasan pusat kegiatan ekonomi warga, sentra UMKM keripik dan kuliner, serta akses transportasi penghubung antar-wilayah.',
      kepala_dusun: 'H. Sudirman',
    },
    {
      nama: 'Dusun Telaga Ngembeng (Telage Ngembeng)',
      kk: 345,
      jiwa: 1180,
      karakteristik: 'Kawasan dengan potensi mata air alami, perkebunan aren pegunungan, kerajinan anyaman ketak, dan budidaya perikanan air tawar.',
      kepala_dusun: 'Suparman',
    },
    {
      nama: 'Dusun Tatar',
      kk: 328,
      jiwa: 1120,
      karakteristik: 'Kawasan lahan pertanian padi organik, budidaya madu trigona klanceng, serta perkebunan hortikultura dan manggis.',
      kepala_dusun: 'Lalu Karyadi',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Tombol Navigasi Kembali */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-[#0D2A4A] rounded-xl text-xs font-bold border border-slate-200 transition-colors shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#1565C0]" />
          <span>Kembali ke Beranda Portal</span>
        </button>

        <span className="text-xs text-slate-500 font-medium">
          Profil Resmi • Pemerintah Desa Nyurlembang
        </span>
      </div>

      {/* Hero Banner Profil Desa */}
      <div className="relative rounded-3xl overflow-hidden bg-[#0A192F] text-white shadow-2xl min-h-[260px] flex flex-col justify-end p-6 sm:p-10 border border-blue-900/60">
        <div className="absolute inset-0 z-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1600&fit=crop&q=80"
            alt="Alam Desa Nyurlembang"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A192F] via-[#0A192F]/90 to-[#0A192F]/70 z-1"></div>

        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#1565C0] rounded-full text-xs font-bold text-white w-fit border border-blue-300/30 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Kecamatan Narmada, Kabupaten Lombok Barat, NTB</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black font-heading tracking-tight text-white drop-shadow-sm">
            Profil Lengkap Desa Nyurlembang
          </h1>

          <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-normal">
            Mengenal lebih dekat bentang alam subur, kekayaan kearifan lokal, sejarah pembentukan wilayah, serta dedikasi transformasi digital pelayanan publik untuk kemakmuran seluruh masyarakat.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-semibold">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 border border-white/20 text-white backdrop-blur-xs">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
              <span>342,5 Hektar Luas Wilayah</span>
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 border border-white/20 text-white backdrop-blur-xs">
              <Users className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{Number(statistik?.total_penduduk || 4850).toLocaleString('id-ID')} Jiwa Penduduk (4 Dusun)</span>
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-900/60 border border-blue-400/40 text-blue-100 backdrop-blur-xs font-bold">
              <Award className="w-4 h-4 text-sky-400 shrink-0" />
              <span>Desa Digital Mandiri SPBE</span>
            </span>
          </div>
        </div>
      </div>

      {/* Navigasi Tab Horizontal */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#1565C0] text-white shadow-sm'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#FFB300]' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* KONTEN TAB */}
      <div className="space-y-8">
        {/* TAB 1: TENTANG DESA */}
        {activeTab === 'tentang' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 card-kedinasan p-6 sm:p-8 bg-white space-y-5">
                <h2 className="text-xl font-bold text-[#0D2A4A] font-heading">
                  Sekilas Desa Nyurlembang
                </h2>
                <div className="prose prose-slate text-xs sm:text-sm text-slate-700 leading-relaxed space-y-4">
                  <p>
                    <strong>Desa Nyurlembang</strong> merupakan salah satu desa yang terletak di kawasan agraris subur Kecamatan Narmada, Kabupaten Lombok Barat, Provinsi Nusa Tenggara Barat. Berada di jalur perlintasan strategis dan lereng barat daya Gunung Rinjani, desa ini diberkahi limpahan mata air pegunungan yang jernih, tanah vulkanik yang gembur, serta panorama alam pedesaan yang menyejukkan.
                  </p>
                  <p>
                    Sebagai desa agraris dan sentra komoditas pohon aren alami di Pulau Lombok, mayoritas masyarakat Nyurlembang berprofesi sebagai petani, pengolah gula aren organik, pekebun kopi lereng gunung, serta perajin UMKM lokal. Nilai-nilai gotong royong Sasak <em>"Besiru"</em> senantiasa hidup dan mewarnai setiap aspek perikehidupan warga.
                  </p>
                  <p>
                    Kini, Pemerintah Desa Nyurlembang bertransformasi ke era pelayanan publik modern melalui penerapan <strong>Sistem Pemerintahan Berbasis Elektronik (SPBE)</strong>. Warga desa dapat mengurus dokumen administrasi kependudukan dan surat dinas secara mandiri, melacak proses verifikasi secara real-time, serta memantau transparansi pengelolaan keuangan APBDes tanpa dipungut biaya apa pun.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-center">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-xl font-extrabold text-[#1565C0] block">342,5</span>
                    <span className="text-[11px] text-slate-500 font-bold uppercase">Luas Wilayah (Ha)</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-xl font-extrabold text-[#1565C0] block">4</span>
                    <span className="text-[11px] text-slate-500 font-bold uppercase">Wilayah Dusun</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-xl font-extrabold text-[#1565C0] block">
                      {Number(statistik?.total_penduduk || 4850).toLocaleString('id-ID')}
                    </span>
                    <span className="text-[11px] text-slate-500 font-bold uppercase">Jiwa Penduduk</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-xl font-extrabold text-[#1565C0] block">
                      {Number(statistik?.jumlah_kk || 1420).toLocaleString('id-ID')}
                    </span>
                    <span className="text-[11px] text-slate-500 font-bold uppercase">Kepala Keluarga</span>
                  </div>
                </div>
              </div>

              {/* Card Ringkasan Kantor & Pimpinan */}
              <div className="space-y-6">
                <div className="card-kedinasan p-6 bg-white space-y-4">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&fit=crop&q=80"
                      alt="Kepala Desa Nyurlembang"
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-[#1565C0] shadow-sm"
                    />
                    <div>
                      <span className="text-[11px] uppercase font-bold text-slate-400">Kepala Desa:</span>
                      <h3 className="text-sm font-extrabold text-[#0D2A4A] leading-tight">
                        H. MUHAMMAD RIDWAN, S.Pd.I
                      </h3>
                      <span className="text-[11px] text-emerald-600 font-bold">Periode Aktif 2021 - 2027</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 italic bg-blue-50/50 p-3 rounded-xl border border-blue-100 leading-relaxed">
                    "Kemajuan Desa Nyurlembang dibangun di atas fondasi kejujuran aparatur, kebersamaan warga, dan keterbukaan akses pelayanan digital tanpa sekat."
                  </p>
                </div>

                <div className="card-kedinasan p-6 bg-white space-y-3">
                  <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                    Kontak & Sekretariat Desa
                  </h3>
                  <div className="space-y-2.5 text-xs text-slate-700">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-[#1565C0] shrink-0 mt-0.5" />
                      <span>Jalan Raya Suranadi - Narmada Km. 2, Desa Nyurlembang, Kec. Narmada, Kab. Lombok Barat, NTB 83371</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-[#1565C0] shrink-0" />
                      <span>081805554899 (KPPID Desa)</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Mail className="w-4 h-4 text-[#1565C0] shrink-0" />
                      <span>desanyurlembang.id@gmail.com</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-[#1565C0] shrink-0" />
                      <span>Senin - Jumat: 08.00 - 15.30 WITA</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: VISI & MISI */}
        {activeTab === 'visi-misi' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="card-kedinasan p-8 bg-gradient-to-br from-[#0D2A4A] to-[#1565C0] text-white space-y-4">
              <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-[#FFB300] uppercase tracking-wider">
                Visi Pembangunan Desa
              </span>
              <blockquote className="text-lg sm:text-2xl font-extrabold font-heading leading-snug">
                "{PROFIL_DESA.visi}"
              </blockquote>
              <p className="text-xs text-slate-200 max-w-2xl leading-relaxed">
                Menjadi arah panduan strategis seluruh rencana pembangunan jangka menengah desa (RPJMDes) dalam mewujudkan kemakmuran masyarakat yang adil, makmur, dan berakhlak mulia.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#0D2A4A] font-heading">
                4 Pilar Misi Pembangunan Desa Nyurlembang
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PROFIL_DESA.misi.map((misiText, idx) => (
                  <div key={idx} className="card-kedinasan p-6 bg-white space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1565C0] font-black text-base flex items-center justify-center border border-blue-200">
                      0{idx + 1}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                      {misiText}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SEJARAH DESA */}
        {activeTab === 'sejarah' && (
          <div className="card-kedinasan p-6 sm:p-8 bg-white space-y-6 animate-in fade-in">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-[#0D2A4A] font-heading">
                Sejarah Singkat Desa Nyurlembang
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Kilas balik penamaan, masa perintisan para tetua adat, hingga terbentuknya desa definitif.
              </p>
            </div>

            <div className="prose prose-slate text-xs sm:text-sm text-slate-700 leading-relaxed space-y-4">
              <p>
                Asal-usul nama <strong>Nyurlembang</strong> berakar dari dialek bahasa Sasak kuno. Kata <strong>"Nyur"</strong> berarti pohon kelapa, sedangkan <strong>"Lembang"</strong> mengacu pada dataran lembah subur yang diapit aliran mata air dan perbukitan hijau. Pada masa awal permukiman, wilayah ini terkenal dengan rimbunnya pohon kelapa dan pohon aren (enau) yang menjulang di sepanjang lembah aliran air alami Narmada.
              </p>
              <p>
                Sebelum berdiri sebagai desa definitif yang mandiri, kawasan Nyurlembang merupakan bagian dari kesatuan wilayah adat yang berpusat di wilayah Narmada. Seiring dengan pertumbuhan jumlah penduduk, perluasan areal pertanian terasering, serta kebutuhan mendekatkan rentang kendali pelayanan administrasi kepada masyarakat, para tokoh agama (Tuan Guru), tokoh adat (Pemangku Adat), dan tetua kampung bermusyawarah untuk mengusulkan pemekaran wilayah.
              </p>
              <p>
                Melalui perjuangan panjang dan restu dari Pemerintah Kabupaten Lombok Barat, Desa Nyurlembang resmi dikukuhkan sebagai desa otonom definitif. Wilayah desa terbagi ke dalam <strong>4 dusun</strong> yang masing-masing dipimpin oleh Kepala Dusun (Kadus), saling bersinergi menjaga kerukunan antarwarga dan melestarikan kekayaan alam pegunungan hingga generasi modern saat ini.
              </p>
            </div>
          </div>
        )}

        {/* TAB 4: GEOGRAFIS & PETA */}
        {activeTab === 'geografis' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card-kedinasan p-6 sm:p-8 bg-white space-y-5">
                <h2 className="text-xl font-bold text-[#0D2A4A] font-heading">
                  Letak Astronomis & Batas Wilayah
                </h2>

                <div className="space-y-3 text-xs text-slate-700">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-900 block mb-1">Sebelah Utara:</span>
                    <span>Berbatasan dengan wilayah Desa Suranadi (Kecamatan Narmada)</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-900 block mb-1">Sebelah Selatan:</span>
                    <span>Berbatasan dengan wilayah Desa Selat (Kecamatan Narmada)</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-900 block mb-1">Sebelah Timur:</span>
                    <span>Berbatasan dengan Koridor Kawasan Hutan Lindung Sesaot</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-900 block mb-1">Sebelah Barat:</span>
                    <span>Berbatasan dengan wilayah Desa Golong (Kecamatan Narmada)</span>
                  </div>
                </div>

                <div className="pt-2 text-xs text-slate-600 leading-relaxed">
                  Secara topografi, Desa Nyurlembang berada pada ketinggian rata-rata <strong>150 hingga 350 meter di atas permukaan laut (mdpl)</strong> dengan kemiringan landai hingga bergelombang. Iklim tropis basah dengan curah hujan teratur menjadikan debit sumber mata air alami tetap terjaga sepanjang tahun.
                </div>
              </div>

              {/* Embed Google Maps */}
              <div className="card-kedinasan p-4 bg-white space-y-3 flex flex-col">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                    Peta Satelit Lokasi Kantor Desa
                  </h3>
                  <a
                    href="https://maps.google.com/?q=-8.58922199365014,116.19106227542514(Desa+Nyurlembang)"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold text-[#1565C0] hover:underline"
                  >
                    Buka di Google Maps
                  </a>
                </div>
                <div className="w-full flex-1 min-h-[300px] rounded-2xl overflow-hidden border border-slate-200 relative">
                  <iframe
                    title="Peta Desa Nyurlembang"
                    src="https://maps.google.com/maps?q=-8.58922199365014,116.19106227542514&hl=id&z=15&output=embed"
                    className="w-full h-full min-h-[320px] border-0"
                    allowFullScreen={false}
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: WILAYAH 4 DUSUN */}
        {activeTab === 'dusun' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-xl font-bold text-[#0D2A4A] font-heading">
                Pembagian 4 Wilayah Dusun Desa Nyurlembang
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Karakteristik geografis, potensi unggulan, serta data kependudukan per dusun.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {dusunList.map((item, idx) => (
                <div key={idx} className="card-kedinasan p-6 bg-white space-y-4 hover:border-[#1565C0] transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase text-[#1565C0] bg-blue-50 px-2.5 py-1 rounded-lg">
                      Dusun 0{idx + 1}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">
                      Kadus: {item.kepala_dusun}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-[#0D2A4A]">
                    {item.nama}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed min-h-[50px]">
                    {item.karakteristik}
                  </p>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>{item.kk} Kepala Keluarga</span>
                    <span className="text-[#1565C0]">{item.jiwa} Jiwa</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: BUDAYA BESIRU */}
        {activeTab === 'budaya' && (
          <div className="card-kedinasan p-6 sm:p-8 bg-white space-y-6 animate-in fade-in">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-[#0D2A4A] font-heading">
                Nilai Luhur Kearifan Lokal "Besiru"
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Tradisi gotong royong tanpa pamrih yang menjadi modal sosial utama masyarakat Sasak Nyurlembang.
              </p>
            </div>

            <div className="prose prose-slate text-xs sm:text-sm text-slate-700 leading-relaxed space-y-4">
              <p>
                <strong>"Besiru"</strong> merupakan tradisi tolong-menolong timbal balik yang telah diwariskan turun-temurun di kalangan masyarakat suku Sasak, khususnya di Desa Nyurlembang. Konsep ini bukan sekadar gotong royong biasa, melainkan ikatan solidaritas moral yang mengikat antarkeluarga dan antardusun.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6 not-prose">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <Trees className="w-5 h-5 text-emerald-600" />
                  <h4 className="text-xs font-bold text-slate-900">Besiru Pertanian</h4>
                  <p className="text-[11px] text-slate-600">
                    Saling bantu menggarap sawah, menanam padi (lowong), hingga masa panen tanpa upah tunai secara bergiliran.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <Building2 className="w-5 h-5 text-[#1565C0]" />
                  <h4 className="text-xs font-bold text-slate-900">Besiru Pembangunan</h4>
                  <p className="text-[11px] text-slate-600">
                    Warga bahu-membahu mendirikan rumah tetangga, merawat saluran irigasi tersier, dan memperbaiki jalan dusun.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <Users className="w-5 h-5 text-amber-600" />
                  <h4 className="text-xs font-bold text-slate-900">Besiru Hajatan / Begawe</h4>
                  <p className="text-[11px] text-slate-600">
                    Membantu persiapan perkawinan, syukuran adat, hingga musibah duka dengan sukarela membawa bahan pangan.
                  </p>
                </div>
              </div>
              <p>
                Dalam konteks pembangunan desa modern, semangat <em>Besiru</em> ini diintegrasikan dengan musyawarah perencanaan pembangunan desa (Musrenbangdes) sehingga setiap alokasi Dana Desa (DD) dan Alokasi Dana Desa (ADD) benar-benar mencerminkan kebutuhan riil warga dari bawah ke atas (bottom-up planning).
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
