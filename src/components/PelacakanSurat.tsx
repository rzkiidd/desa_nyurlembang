import React, { useState } from 'react';
import { PermohonanSurat, StatusPermohonan } from '../types';
import { lacakPermohonan } from '../lib/supabaseClient';
import { 
  Search, 
  Clock, 
  FileCheck2, 
  PenTool, 
  PackageCheck, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  MapPin,
  Calendar,
  User,
  FileText,
  Building,
  Info
} from 'lucide-react';

interface PelacakanSuratProps {
  onGoToPermohonan?: () => void;
  initialNik?: string;
  initialKodeTiket?: string;
  onViewPrint?: (permohonan: PermohonanSurat) => void;
}

export const PelacakanSurat: React.FC<PelacakanSuratProps> = ({
  onGoToPermohonan,
  initialNik,
  initialKodeTiket,
  onViewPrint,
}) => {
  const [nik, setNik] = useState(initialNik || '');
  const [kodeTiket, setKodeTiket] = useState(initialKodeTiket || '');
  const [loading, setLoading] = useState(false);
  const [hasil, setHasil] = useState<PermohonanSurat | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  React.useEffect(() => {
    if (initialNik && initialKodeTiket) {
      setNik(initialNik);
      setKodeTiket(initialKodeTiket);
      lacakPermohonan(initialNik, initialKodeTiket).then((res) => {
        if (res) {
          setHasil(res);
          setHasSearched(true);
        }
      });
    }
  }, [initialNik, initialKodeTiket]);


  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!nik.trim() || !kodeTiket.trim()) {
      setError('Mohon masukkan Nomor Induk Kependudukan (NIK) dan Kode Tiket Anda.');
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const res = await lacakPermohonan(nik, kodeTiket);
      if (res) {
        setHasil(res);
      } else {
        setHasil(null);
        setError('Data permohonan tidak ditemukan. Pastikan 16 digit NIK dan Kode Tiket (Contoh: NYR-202609-0012) sudah sesuai.');
      }
    } catch (err: any) {
      setError('Terjadi kesalahan saat menghubungi database: ' + (err?.message || 'Error'));
    } finally {
      setLoading(false);
    }
  };

  const setSampleTicket = (sampleNik: string, sampleTicket: string) => {
    setNik(sampleNik);
    setKodeTiket(sampleTicket);
    setError(null);
  };

  // Tahapan Alur Non-TTE (TTD Basah Kades)
  const STEPS: { status: StatusPermohonan; label: string; desc: string; icon: React.ComponentType<{ className?: string }> }[] = [
    {
      status: 'Diajukan',
      label: 'Permohonan Diajukan',
      desc: 'Berkas dan data diri telah berhasil disubmit oleh warga melalui formulir mandiri.',
      icon: Clock,
    },
    {
      status: 'Diverifikasi & Dicetak',
      label: 'Diverifikasi & Naskah Dicetak',
      desc: 'Staf Pelayanan memvalidasi keabsahan data KTP/KK, menerbitkan nomor surat resmi, dan mencetak lembar fisik naskah dinas.',
      icon: FileCheck2,
    },
    {
      status: 'Menunggu TTD Kades',
      label: 'Menunggu TTD Basah Kades',
      desc: 'Lembar fisik surat dibawa ke meja Kepala Desa Nyurlembang untuk penandatanganan basah dan pembubuhan stempel resmi desa.',
      icon: PenTool,
    },
    {
      status: 'Siap Diambil',
      label: 'Surat Siap Diambil di Loket',
      desc: 'Surat fisik resmi telah selesai dicap & ditandatangani. Warga dapat mengambilnya di Kantor Desa.',
      icon: PackageCheck,
    },
    {
      status: 'Selesai',
      label: 'Selesai & Diserahkan',
      desc: 'Surat resmi telah diterima langsung oleh pemohon di loket pelayanan.',
      icon: CheckCircle2,
    },
  ];

  const getStepStatusIndex = (currentStatus: StatusPermohonan) => {
    switch (currentStatus) {
      case 'Diajukan':
        return 0;
      case 'Diverifikasi & Dicetak':
        return 1;
      case 'Menunggu TTD Kades':
        return 2;
      case 'Siap Diambil':
        return 3;
      case 'Selesai':
        return 4;
      case 'Ditolak':
        return -1;
      default:
        return 0;
    }
  };

  const currentIndex = hasil ? getStepStatusIndex(hasil.status) : 0;
  const isDitolak = hasil?.status === 'Ditolak';

  // Format tanggal Indonesia
  const formatDate = (isoStr?: string) => {
    if (!isoStr) return '-';
    const d = new Date(isoStr);
    return d.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }) + ' WITA';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header section */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-50 text-[#1565C0] text-xs font-bold rounded-full mb-3 border border-blue-200">
          <FileCheck2 className="w-3.5 h-3.5 text-[#1565C0]" />
          <span>Sistem Informasi Desa (SID) Nyurlembang</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#0D2A4A] tracking-tight font-heading">
          Pelacakan Status Surat Mandiri
        </h1>
        <p className="mt-2 text-sm text-slate-600 max-w-xl mx-auto">
          Pantau progres permohonan naskah dinas Anda secara transparan dan real-time layaknya resi kurir digital.
        </p>
      </div>

      {/* Form Pencarian */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 mb-8">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="input-nik" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Nomor Induk Kependudukan (NIK)
              </label>
              <div className="relative">
                <input
                  id="input-nik"
                  type="text"
                  maxLength={16}
                  placeholder="Contoh: 5201011504920001"
                  value={nik}
                  onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#1565C0] focus:border-[#1565C0] transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="input-tiket" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Kode Tiket Permohonan
              </label>
              <div className="relative">
                <input
                  id="input-tiket"
                  type="text"
                  placeholder="Contoh: NYR-202609-0012"
                  value={kodeTiket}
                  onChange={(e) => setKodeTiket(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 font-mono text-sm uppercase focus:outline-none focus:ring-2 focus:ring-[#1565C0] focus:border-[#1565C0] transition-all"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-[#B71C1C] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-[#B71C1C] shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="text-xs text-slate-500">
              *Hanya pemohon dengan NIK yang sesuai yang dapat mengakses status ini.
            </div>

            <button
              type="submit"
              id="btn-cari-status-surat"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 bg-[#FFB300] hover:bg-[#ffa000] text-[#0D2A4A] text-sm font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Search className="w-4 h-4 text-[#0D2A4A]" />
              <span>{loading ? 'Mencari Data...' : 'Lacak Sekarang'}</span>
            </button>
          </div>
        </form>

        {/* Quick sample chips for instant testing in preview */}
        <div className="mt-6 pt-4 border-t border-slate-100">
          <div className="text-xs text-slate-500 mb-2 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Klik contoh tiket demo di bawah untuk menguji pelacakan instan:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setSampleTicket('5201011504920001', 'NYR-202609-0012');
              }}
              className="text-xs font-mono px-2.5 py-1 bg-emerald-50 text-[#2E7D32] rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-200 font-semibold"
            >
              NYR-202609-0012 (Siap Diambil)
            </button>
            <button
              type="button"
              onClick={() => {
                setSampleTicket('5201015607950002', 'NYR-202609-0013');
              }}
              className="text-xs font-mono px-2.5 py-1 bg-amber-50 text-amber-800 rounded-lg hover:bg-amber-100 transition-colors border border-amber-200 font-semibold"
            >
              NYR-202609-0013 (Menunggu TTD Kades)
            </button>
            <button
              type="button"
              onClick={() => {
                setSampleTicket('5201016809010004', 'NYR-202609-0015');
              }}
              className="text-xs font-mono px-2.5 py-1 bg-blue-50 text-[#1565C0] rounded-lg hover:bg-blue-100 transition-colors border border-blue-200 font-semibold"
            >
              NYR-202609-0015 (Baru Diajukan)
            </button>
          </div>
        </div>
      </div>

      {/* HASIL PELACAKAN (VERTICAL STEPPER TIMELINE) */}
      {hasil && (
        <div className="space-y-6">
          {/* Card Ringkasan Permohonan */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="text-xs font-mono text-slate-500 uppercase">Kode Tiket Registrasi</div>
                <div className="text-xl font-bold font-mono text-[#0D2A4A]">{hasil.kode_tiket}</div>
                {hasil.nomor_surat_resmi && (
                  <div className="text-xs text-[#2E7D32] font-mono font-semibold mt-0.5">
                    Nomor Resmi: {hasil.nomor_surat_resmi}
                  </div>
                )}
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold ${
                    hasil.status === 'Siap Diambil' || hasil.status === 'Selesai'
                      ? 'bg-green-50 text-[#2E7D32] ring-1 ring-green-600/20'
                      : hasil.status === 'Menunggu TTD Kades'
                      ? 'bg-amber-50 text-amber-800 ring-1 ring-amber-500/20'
                      : hasil.status === 'Ditolak'
                      ? 'bg-red-50 text-[#B71C1C] ring-1 ring-red-500/20'
                      : 'bg-blue-50 text-[#1565C0] ring-1 ring-blue-500/20'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
                  <span>{hasil.status}</span>
                </span>
              </div>
            </div>

            {/* Grid Informasi Pemohon */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4 text-xs text-slate-600">
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-slate-500">Nama Pemohon</div>
                  <div className="font-semibold text-slate-800 text-sm">{hasil.nama_pemohon}</div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-slate-500">Jenis Surat</div>
                  <div className="font-semibold text-slate-800 text-sm">{hasil.jenis_surat_nama}</div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-slate-500">Dusun Asal</div>
                  <div className="font-semibold text-slate-800 text-sm">{hasil.dusun}</div>
                </div>
              </div>

              <div className="flex items-start gap-2 sm:col-span-2 md:col-span-3">
                <Building className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-slate-500">Keperluan</div>
                  <div className="font-medium text-slate-800">{hasil.keperluan}</div>
                </div>
              </div>
            </div>

            {/* Instruksi Pengambilan Jika Siap Diambil */}
            {hasil.status === 'Siap Diambil' && (
              <div className="mt-5 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-3">
                <PackageCheck className="w-5 h-5 text-[#2E7D32] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-sm text-[#2E7D32] mb-1">
                    Surat Fisik Resmi Siap Diambil di Kantor Desa!
                  </div>
                  <p className="text-slate-800 leading-relaxed">
                    Silakan datang ke <strong>Loket Pelayanan Desa Nyurlembang</strong> pada jam kerja (Senin–Jumat, 08.00–15.30 WITA) dengan membawa:
                    <br />
                    1. Menunjukkan bukti tangkapan layar (screenshot) Kode Tiket: <strong>{hasil.kode_tiket}</strong>
                    <br />
                    2. Membawa <strong>KTP Elektronik Asli</strong> pemohon untuk verifikasi penerimaan fisik.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* VERTICAL STEPPER TIMELINE (Pola Mental Resi Kurir Digital) */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
            <h2 className="text-base font-bold text-[#0D2A4A] mb-6 flex items-center gap-2 font-heading">
              <Clock className="w-4 h-4 text-[#1565C0]" />
              <span>Jejak Riwayat Proses Verifikasi Non-TTE</span>
            </h2>

            {isDitolak ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-[#B71C1C] text-sm">
                <XCircle className="w-5 h-5 text-[#B71C1C] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Permohonan Ditolak / Memerlukan Perbaikan</div>
                  <div className="text-xs text-red-700 mt-1">
                    Catatan Verifikator: {hasil.catatan_revisi || 'Berkas KTP/KK kurang jelas atau persyaratan tidak lengkap.'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative pl-6 md:pl-8 space-y-8 before:absolute before:left-3 md:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {STEPS.map((step, idx) => {
                  const isCompleted = currentIndex >= idx;
                  const isCurrent = currentIndex === idx;
                  const StepIcon = step.icon;

                  // Cari riwayat yang cocok untuk timestamp
                  const matchedLog = hasil.riwayat?.find((r) => r.status === step.status);

                  return (
                    <div key={step.status} className="relative group">
                      {/* Indikator Titik */}
                      <div
                        className={`absolute -left-6 md:-left-8 top-0 w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-all ${
                          isCurrent
                            ? 'bg-[#1565C0] text-white ring-4 ring-blue-100 shadow-sm'
                            : isCompleted
                            ? 'bg-[#2E7D32] text-white'
                            : 'bg-slate-100 text-slate-400 border border-slate-300'
                        }`}
                      >
                        {isCompleted && !isCurrent ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <StepIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        )}
                      </div>

                      {/* Content Stepper */}
                      <div className="pl-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <h3
                            className={`text-sm font-bold ${
                              isCurrent
                                ? 'text-[#1565C0] font-heading'
                                : isCompleted
                                ? 'text-[#0D2A4A]'
                                : 'text-slate-400'
                            }`}
                          >
                            {step.label}
                          </h3>

                          {matchedLog && (
                            <span className="text-[11px] font-mono text-slate-500">
                              {formatDate(matchedLog.created_at)}
                            </span>
                          )}
                        </div>

                        <p
                          className={`text-xs mt-1 leading-relaxed ${
                            isCompleted ? 'text-slate-600' : 'text-slate-400'
                          }`}
                        >
                          {matchedLog?.catatan || step.desc}
                        </p>

                        {matchedLog?.diubah_oleh && (
                          <div className="mt-1 text-[11px] text-slate-500 font-medium">
                            Diproses oleh: <span className="text-slate-700">{matchedLog.diubah_oleh}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Belum ada pencarian - Petunjuk panduan */}
      {!hasil && !hasSearched && (
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8 text-center text-slate-600">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm border border-slate-200 mb-3 text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-slate-800 text-sm">Belum Ada Permohonan yang Dilacak</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Silakan masukkan NIK 16 digit dan Kode Tiket yang Anda peroleh saat selesai mengisi formulir layanan mandiri.
          </p>
          {onGoToPermohonan && (
            <button
              onClick={onGoToPermohonan}
              className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#1565C0] hover:text-[#0D2A4A] underline"
            >
              Belum punya tiket? Buat permohonan surat baru di sini &rarr;
            </button>
          )}
        </div>
      )}
    </div>
  );
};
