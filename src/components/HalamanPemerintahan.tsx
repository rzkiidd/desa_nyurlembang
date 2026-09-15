import React from 'react';
import { getStoredPejabatDesa } from '../lib/supabaseClient';
import {
  Users,
  ShieldCheck,
  Building,
  Award,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Landmark
} from 'lucide-react';

interface HalamanPemerintahanProps {
  onBack: () => void;
}

export const HalamanPemerintahan: React.FC<HalamanPemerintahanProps> = ({ onBack }) => {
  const pejabatList = getStoredPejabatDesa().sort((a, b) => a.urutan - b.urutan);

  const bpdMembers = [
    { nama: 'Lalu Ahmad Zaini, S.Pd', jabatan: 'Ketua BPD Nyurlembang', dusun: 'Nyurlembang Daye' },
    { nama: 'H. Suardi, S.Sos', jabatan: 'Wakil Ketua BPD', dusun: 'Nyurlembang Barat' },
    { nama: 'Nurhasanah, S.Pd.I', jabatan: 'Sekretaris BPD', dusun: 'Telaga Ngembeng' },
    { nama: 'Ahmad Suparlan', jabatan: 'Anggota Bidang Pembangunan', dusun: 'Tatar' },
    { nama: 'Baiq Ratna Dewi', jabatan: 'Anggota Pemberdayaan Perempuan', dusun: 'Nyurlembang Daye' },
  ];

  const kepalaDusun = [
    { dusun: 'Dusun Nyurlembang Daye', nama: 'M. Rusdi', kontak: '081907123401' },
    { dusun: 'Dusun Nyurlembang Barat', nama: 'H. Sudirman', kontak: '081907123402' },
    { dusun: 'Dusun Telaga Ngembeng (Telage Ngembeng)', nama: 'Suparman', kontak: '081907123403' },
    { dusun: 'Dusun Tatar', nama: 'Lalu Karyadi', kontak: '081907123404' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-[#0D2A4A] rounded-xl text-xs font-bold border border-slate-200 transition-colors shadow-xs mb-3"
          >
            <ArrowLeft className="w-4 h-4 text-[#1565C0]" />
            <span>Kembali ke Beranda Portal</span>
          </button>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-[#1565C0] text-xs font-bold rounded-full border border-blue-200 block sm:inline-block">
            <Landmark className="w-3.5 h-3.5" />
            <span>Tata Kelola Pemerintahan Desa</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0D2A4A] font-heading mt-2">
            Pemerintahan Desa Nyurlembang
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Susunan organisasi, badan permusyawaratan, aparatur pamong desa, dan kepala kewilayahan 4 dusun.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-3 bg-white rounded-2xl border border-slate-200 text-center shadow-xs">
            <div className="text-xs font-mono font-bold text-[#1565C0]">Periode Kerja</div>
            <div className="text-sm font-extrabold text-[#0D2A4A]">2021 - 2027</div>
          </div>
        </div>
      </div>

      {/* Pimpinan Utama Wilayah (Kepala Desa) */}
      <div className="card-kedinasan p-6 sm:p-8 bg-white space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#1565C0] flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#1565C0] tracking-wider">Kepala Pemerintahan</span>
            <h2 className="text-lg font-bold text-[#0D2A4A] font-heading">Kepala Desa Nyurlembang</h2>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80"
            alt="H. Wardi, S.AP"
            className="w-32 h-40 rounded-2xl object-cover border-2 border-[#1565C0] shadow-md shrink-0"
          />
          <div className="space-y-3 text-center sm:text-left flex-1">
            <div>
              <h3 className="text-xl font-bold text-[#0D2A4A] font-heading">H. Wardi, S.AP</h3>
              <div className="text-xs font-bold text-[#1565C0]">Kepala Desa Nyurlembang</div>
              <div className="text-[11px] font-mono text-slate-400 mt-0.5">NIPD: 52.01.07.2001</div>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              Memimpin penyelenggaraan pemerintahan desa, pembinaan kemasyarakatan, pembangunan infrastruktur pertanian dan pemukiman, serta pemberdayaan ekonomi warga 4 dusun secara transparan dan berintegritas.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Pelayanan Terbuka & Akuntabel</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#1565C0]" />
                <span>SPBE Desa Terintegrasi</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Aparatur & Perangkat Desa (Sekretariat & Pelaksana Teknis) */}
      <div className="card-kedinasan p-6 sm:p-8 bg-white space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Users className="w-5 h-5 text-[#1565C0]" />
            <h2 className="text-lg font-bold text-[#0D2A4A] font-heading">
              Perangkat & Aparatur Pemerintahan Desa
            </h2>
          </div>
          <span className="text-xs font-bold text-slate-400">{pejabatList.length} Aparatur</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {pejabatList.map((p) => (
            <div
              key={p.id}
              className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-[#1565C0] transition-all flex items-center gap-3.5 shadow-2xs"
            >
              <img
                src={p.foto_url}
                alt={p.nama}
                className="w-14 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
              />
              <div className="min-w-0">
                <h4 className="font-bold text-xs text-[#0D2A4A] truncate">{p.nama}</h4>
                <div className="text-[11px] font-semibold text-[#1565C0] truncate">{p.jabatan}</div>
                {p.nip && <div className="text-[10px] font-mono text-slate-400 truncate">NIP: {p.nip}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Badan Permusyawaratan Desa (BPD) & Kepala Kewilayahan (Kadus 4 Dusun) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Badan Permusyawaratan Desa (BPD) */}
        <div className="card-kedinasan p-6 bg-white space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building className="w-5 h-5 text-[#1565C0]" />
            <div>
              <h3 className="font-bold text-base text-[#0D2A4A] font-heading">
                Badan Permusyawaratan Desa (BPD)
              </h3>
              <p className="text-[11px] text-slate-500">Lembaga legislasi dan pengawasan aspirasi warga</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {bpdMembers.map((bpd, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-[#0D2A4A]">{bpd.nama}</div>
                  <div className="text-[11px] text-[#1565C0] font-semibold">{bpd.jabatan}</div>
                </div>
                <span className="text-[10px] text-slate-500 font-medium px-2 py-0.5 bg-white rounded border border-slate-200">
                  {bpd.dusun}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Kepala Wilayah (Kadus 4 Dusun) */}
        <div className="card-kedinasan p-6 bg-white space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <MapPin className="w-5 h-5 text-[#2E7D32]" />
            <div>
              <h3 className="font-bold text-base text-[#0D2A4A] font-heading">
                Kepala Kewilayahan (Kadus) 4 Dusun
              </h3>
              <p className="text-[11px] text-slate-500">Pamong terdepan pelayanan warga di tingkat dusun</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {kepalaDusun.map((k, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-[#0D2A4A]">{k.dusun}</div>
                  <div className="text-[11px] text-[#2E7D32] font-semibold">Kadus: {k.nama}</div>
                </div>
                <a
                  href={`https://wa.me/62${k.kontak.replace(/^0/, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-[#2E7D32] rounded-lg text-[10px] font-bold flex items-center gap-1 border border-emerald-200 transition-colors"
                >
                  <Phone className="w-3 h-3" />
                  <span>Kontak</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
