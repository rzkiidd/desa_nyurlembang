import React, { useState, useEffect, useRef } from 'react';
import { DAFTAR_DUSUN } from '../data/mockData';
import { submitPermohonan, getStoredJenisSurat } from '../lib/supabaseClient';
import { PermohonanSurat, JenisSurat } from '../types';
import { processDocumentImage, ImageProcessResult } from '../utils/imageProcessor';
import {
  FileText,
  User,
  Upload,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Copy,
  Check,
  ShieldAlert,
  Camera,
  Search,
  ListChecks,
  HelpCircle,
  Clock,
  Send,
  FileDown,
  Download,
  AlertTriangle,
  RefreshCw,
  Phone,
  MessageCircle
} from 'lucide-react';

interface FormPermohonanSuratProps {
  onSuccessLacak: (nik: string, kodeTiket: string) => void;
}

interface UploadedDocState {
  file: File | null;
  name: string;
  dataUrl: string;
  sizeKb: number;
  originalSizeKb: number;
  dimensions?: { width: number; height: number };
  laplacianVariance?: number;
  isBlurry: boolean;
  framingWarning?: string;
  isProcessing: boolean;
}

export const FormPermohonanSurat: React.FC<FormPermohonanSuratProps> = ({ onSuccessLacak }) => {
  // Step 1: Detail Surat & Syarat
  // Step 2: Identitas Diri Pemohon
  // Step 3: Unggah Berkas Persyaratan
  // Step 4: Kode Tiket Berhasil
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dynamic Jenis Surat from Store (Dikelola di Admin)
  const [daftarSurat, setDaftarSurat] = useState<JenisSurat[]>([]);

  // Hasil setelah submit
  const [submittedData, setSubmittedData] = useState<PermohonanSurat | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1 (Detail Surat & Syarat)
    jenis_surat_id: '',
    keperluan: '',
    nama_usaha: '',
    bidang_usaha: '',
    alamat_usaha: '',
    nama_anak: '',
    instansi_tujuan: '',
    tinggal_sejak: '',

    // Step 2 (Identitas Diri Pemohon)
    nik: '',
    nama_pemohon: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    jenis_kelamin: 'Laki-laki' as 'Laki-laki' | 'Perempuan',
    agama: 'Islam',
    pekerjaan: '',
    dusun: DAFTAR_DUSUN[0],
    alamat_lengkap: '',
    nomor_whatsapp: '',

    // Step 3 (Berkas Persyaratan)
    berkas_ktp_name: '',
    berkas_kk_name: '',
  });

  // Client-Side Auto-Compress & Blur Detection State
  const [ktpDoc, setKtpDoc] = useState<UploadedDocState>({
    file: null,
    name: '',
    dataUrl: '',
    sizeKb: 0,
    originalSizeKb: 0,
    isBlurry: false,
    isProcessing: false,
  });

  const [kkDoc, setKkDoc] = useState<UploadedDocState>({
    file: null,
    name: '',
    dataUrl: '',
    sizeKb: 0,
    originalSizeKb: 0,
    isBlurry: false,
    isProcessing: false,
  });

  const [pasFotoDoc, setPasFotoDoc] = useState<UploadedDocState>({
    file: null,
    name: '',
    dataUrl: '',
    sizeKb: 0,
    originalSizeKb: 0,
    isBlurry: false,
    isProcessing: false,
  });

  const [tambahanDoc, setTambahanDoc] = useState<UploadedDocState>({
    file: null,
    name: '',
    dataUrl: '',
    sizeKb: 0,
    originalSizeKb: 0,
    isBlurry: false,
    isProcessing: false,
  });

  // File input refs (Pilih Berkas & Kamera HP)
  const ktpInputRef = useRef<HTMLInputElement>(null);
  const ktpCameraRef = useRef<HTMLInputElement>(null);
  const kkInputRef = useRef<HTMLInputElement>(null);
  const kkCameraRef = useRef<HTMLInputElement>(null);
  const pasFotoInputRef = useRef<HTMLInputElement>(null);
  const pasFotoCameraRef = useRef<HTMLInputElement>(null);
  const tambahanInputRef = useRef<HTMLInputElement>(null);
  const tambahanCameraRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const list = getStoredJenisSurat();
    setDaftarSurat(list);
    if (list.length > 0 && !formData.jenis_surat_id) {
      setFormData((prev) => ({ ...prev, jenis_surat_id: list[0].id }));
    }
  }, []);

  const selectedJenisSurat =
    daftarSurat.find((j) => j.id === formData.jenis_surat_id) || daftarSurat[0] || {
      id: 'js-1',
      kode: 'SKU',
      nama: 'Surat Keterangan Usaha (SKU)',
      deskripsi: 'Keterangan kepemilikan usaha aktif di wilayah Desa Nyurlembang.',
      persyaratan: ['KTP Pemohon', 'Kartu Keluarga (KK)', 'Foto Tempat/Aktivitas Usaha'],
      kategori: 'Ekonomi & Usaha',
      estimasi_hari: 1,
    };

  // Handler Pemrosesan Berkas Gambar (Auto-Compress + Laplacian Blur Detection)
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    docType: 'ktp' | 'kk' | 'pas_foto' | 'tambahan'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const setter =
      docType === 'ktp'
        ? setKtpDoc
        : docType === 'kk'
        ? setKkDoc
        : docType === 'pas_foto'
        ? setPasFotoDoc
        : setTambahanDoc;
    setter((prev) => ({ ...prev, isProcessing: true }));
    setError(null);

    try {
      const result = await processDocumentImage(file, docType === 'tambahan' ? 'ktp' : docType);
      setter({
        file: result.file,
        name: file.name,
        dataUrl: result.dataUrl,
        sizeKb: result.sizeKb,
        originalSizeKb: result.originalSizeKb,
        dimensions: { width: result.width, height: result.height },
        laplacianVariance: result.laplacianVariance,
        isBlurry: result.isBlurry,
        framingWarning: result.framingWarning,
        isProcessing: false,
      });

      if (docType === 'ktp') {
        setFormData((prev) => ({ ...prev, berkas_ktp_name: file.name }));
      } else if (docType === 'kk') {
        setFormData((prev) => ({ ...prev, berkas_kk_name: file.name }));
      }
    } catch (err: any) {
      setter((prev) => ({ ...prev, isProcessing: false }));
      setError('Gagal memproses berkas dokumen: ' + (err?.message || 'Format tidak didukung'));
    }
  };

  // Validasi Step 1: Detail Surat & Syarat
  const validateStep1 = () => {
    if (!formData.keperluan.trim()) {
      setError('Tujuan atau keperluan surat wajib dijelaskan secara ringkas.');
      return false;
    }
    if (selectedJenisSurat.kode === 'SKU' && !formData.nama_usaha.trim()) {
      setError('Nama usaha wajib diisi untuk Surat Keterangan Usaha.');
      return false;
    }
    setError(null);
    return true;
  };

  // Validasi Step 2: Identitas Diri
  const validateStep2 = () => {
    if (!formData.nik || formData.nik.length !== 16) {
      setError('NIK wajib 16 digit angka yang valid sesuai KTP Anda.');
      return false;
    }
    if (!formData.nama_pemohon.trim()) {
      setError('Nama lengkap wajib diisi sesuai KTP.');
      return false;
    }
    if (!formData.tempat_lahir.trim() || !formData.tanggal_lahir) {
      setError('Tempat dan tanggal lahir wajib diisi.');
      return false;
    }
    if (!formData.pekerjaan.trim()) {
      setError('Pekerjaan wajib diisi.');
      return false;
    }
    if (!formData.alamat_lengkap.trim()) {
      setError('Alamat lengkap tempat tinggal wajib diisi.');
      return false;
    }
    if (!formData.nomor_whatsapp || formData.nomor_whatsapp.replace(/\D/g, '').length < 10) {
      setError('Nomor WhatsApp aktif wajib diisi (minimal 10 digit) untuk menerima pemberitahuan status tiket surat.');
      return false;
    }
    setError(null);
    return true;
  };

  // Validasi Step 3: Berkas
  const validateStep3 = () => {
    if (!ktpDoc.name && !formData.berkas_ktp_name) {
      setError('Wajib mengunggah foto berkas KTP pemohon yang jelas.');
      return false;
    }
    if (!kkDoc.name && !formData.berkas_kk_name) {
      setError('Wajib mengunggah foto berkas Kartu Keluarga (KK) yang jelas.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep3()) return;

    setLoading(true);
    setError(null);

    try {
      // Data tambahan dinamis JSONB
      const dataTambahan: Record<string, any> = {};
      if (selectedJenisSurat.kode === 'SKU') {
        dataTambahan.nama_usaha = formData.nama_usaha;
        dataTambahan.bidang_usaha = formData.bidang_usaha || 'Perdagangan / Jasa';
        dataTambahan.alamat_usaha = formData.alamat_usaha || formData.alamat_lengkap;
      } else if (selectedJenisSurat.kode === 'SKTM') {
        dataTambahan.nama_anak = formData.nama_anak;
        dataTambahan.instansi_tujuan = formData.instansi_tujuan || 'Universitas / Sekolah';
      } else if (selectedJenisSurat.kode === 'DOMISILI') {
        dataTambahan.tinggal_sejak = formData.tinggal_sejak || 'Lebih dari 3 tahun';
      }

      const res = await submitPermohonan({
        nik: formData.nik,
        nama_pemohon: formData.nama_pemohon,
        tempat_lahir: formData.tempat_lahir,
        tanggal_lahir: formData.tanggal_lahir,
        jenis_kelamin: formData.jenis_kelamin,
        agama: formData.agama,
        pekerjaan: formData.pekerjaan,
        dusun: formData.dusun,
        alamat_lengkap: formData.alamat_lengkap,
        nomor_whatsapp: formData.nomor_whatsapp,
        jenis_surat_id: selectedJenisSurat.id,
        jenis_surat_nama: selectedJenisSurat.nama,
        keperluan: formData.keperluan,
        data_tambahan: dataTambahan,
        berkas_ktp_url: ktpDoc.dataUrl || `dokumen-persyaratan/ktp_${formData.nik}.jpg`,
        berkas_kk_url: kkDoc.dataUrl || `dokumen-persyaratan/kk_${formData.nik}.jpg`,
        berkas_pas_foto_url: pasFotoDoc.dataUrl || (pasFotoDoc.name ? `dokumen-persyaratan/pas_foto_${formData.nik}.jpg` : undefined),
        berkas_tambahan_url: tambahanDoc.dataUrl || (tambahanDoc.name ? `dokumen-persyaratan/lampiran_${formData.nik}.jpg` : undefined),
      } as any);

      setSubmittedData(res);
      setStep(4);
    } catch (err: any) {
      setError('Gagal mengirim permohonan: ' + (err?.message || 'Terjadi kesalahan sistem'));
    } finally {
      setLoading(false);
    }
  };

  const copyTicket = () => {
    if (!submittedData) return;
    navigator.clipboard.writeText(submittedData.kode_tiket);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Mock file picker handler for quick testing
  const handleSimulateUpload = (field: 'ktp' | 'kk' | 'pas_foto' | 'tambahan', defaultName: string) => {
    const setter =
      field === 'ktp'
        ? setKtpDoc
        : field === 'kk'
        ? setKkDoc
        : field === 'pas_foto'
        ? setPasFotoDoc
        : setTambahanDoc;
    setter({
      file: new File(['mock'], defaultName, { type: 'image/jpeg' }),
      name: defaultName,
      dataUrl: '',
      sizeKb: 320,
      originalSizeKb: 1450,
      dimensions: { width: 1600, height: 1067 },
      laplacianVariance: 145,
      isBlurry: false,
      isProcessing: false,
    });
    if (field === 'ktp') {
      setFormData((prev) => ({ ...prev, berkas_ktp_name: defaultName }));
    } else if (field === 'kk') {
      setFormData((prev) => ({ ...prev, berkas_kk_name: defaultName }));
    }
    setError(null);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-50 text-[#1565C0] text-xs font-bold rounded-full mb-3 border border-blue-200">
          <FileText className="w-3.5 h-3.5 text-[#1565C0]" />
          <span>Loket Layanan Mandiri Digital Non-TTE</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#0D2A4A] tracking-tight font-heading">
          Formulir Pengajuan Surat Administrasi Desa
        </h1>
        <p className="mt-2 text-sm text-slate-600 max-w-xl mx-auto">
          Warga Desa Nyurlembang dapat mengajukan naskah dinas mandiri kapan saja. Cepat, transparan, dan dapat dilacak langsung.
        </p>
      </div>

      {/* Stepper Progress Header: Detail Surat & Syarat -> Identitas Diri -> Unggah Berkas -> Kode Tiket */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative max-w-xl mx-auto">
          {/* Connecting Line */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-200 z-0">
            <div
              className="h-full bg-[#03A9F4] transition-all duration-300"
              style={{
                width:
                  step === 1 ? '0%' : step === 2 ? '33%' : step === 3 ? '66%' : '100%',
              }}
            />
          </div>

          {[
            { num: 1, title: 'Detail Surat & Syarat' },
            { num: 2, title: 'Identitas Diri' },
            { num: 3, title: 'Unggah Berkas' },
            { num: 4, title: 'Kode Tiket' },
          ].map((s) => {
            const isPassed = step > s.num;
            const isCurrent = step === s.num;
            return (
              <div key={s.num} className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isPassed
                      ? 'bg-[#2E7D32] text-white shadow-xs'
                      : isCurrent
                      ? 'bg-[#1565C0] text-white ring-4 ring-blue-100 shadow-xs'
                      : 'bg-white text-slate-400 border-2 border-slate-300'
                  }`}
                >
                  {isPassed ? <Check className="w-4 h-4" /> : s.num}
                </div>
                <span
                  className={`text-[11px] font-semibold mt-1.5 hidden sm:block ${
                    isCurrent ? 'text-[#0D2A4A]' : isPassed ? 'text-[#2E7D32]' : 'text-slate-400'
                  }`}
                >
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Form Container */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 md:p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-[#B71C1C] flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-[#B71C1C] shrink-0 mt-0.5" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* STEP 1: DETAIL SURAT & SYARAT (DIJADIKAN PERTAMA SESUAI INSTRUKSI) */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-base font-bold text-[#0D2A4A] font-heading">
                Langkah 1: Detail Surat & Persyaratan Berkas
              </h2>
              <p className="text-xs text-slate-500">
                Pilih jenis naskah dinas yang Anda butuhkan dan jelaskan keperluan pengajuan surat.
              </p>
            </div>

            {/* DAFTAR PILIHAN JENIS SURAT DARI STORE */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">
                Pilih Jenis Surat Administrasi <span className="text-[#B71C1C]">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {daftarSurat.map((surat) => {
                  const isSelected = formData.jenis_surat_id === surat.id;
                  return (
                    <div
                      key={surat.id}
                      onClick={() => setFormData({ ...formData, jenis_surat_id: surat.id })}
                      className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#1565C0] bg-blue-50/50 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-bold text-xs text-[#0D2A4A] leading-snug">
                          {surat.nama}
                        </div>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-mono text-[10px] font-bold rounded">
                          {surat.kode}
                        </span>
                      </div>
                      <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="text-[#1565C0] font-semibold">{surat.kategori}</span>
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{surat.estimasi_hari} hari kerja</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SYARAT DOKUMEN RESMI UNTUK SURAT TERPILIH */}
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#1565C0]">
                <ListChecks className="w-4 h-4 text-[#1565C0]" />
                <span>Dokumen Persyaratan yang Wajib Diunggah Pada Langkah 3:</span>
              </div>
              <ul className="text-xs text-slate-700 space-y-1.5 pl-1">
                {(selectedJenisSurat.persyaratan_items && selectedJenisSurat.persyaratan_items.length > 0
                  ? selectedJenisSurat.persyaratan_items
                  : selectedJenisSurat.persyaratan.map((syarat, idx) => ({
                      id: `syarat-${idx}`,
                      nama: syarat,
                      izinkan_kamera: true,
                    }))
                ).map((syaratItem, idx) => (
                  <li key={syaratItem.id || idx} className="flex items-center justify-between font-medium bg-white/80 p-2 rounded-lg border border-blue-100">
                    <span className="flex items-center gap-2">
                      <span className="text-[#2E7D32] font-bold">✓</span>
                      <span className="text-slate-800">{syaratItem.nama}</span>
                    </span>
                    {syaratItem.izinkan_kamera ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[10px] font-bold shrink-0">
                        <Camera className="w-3 h-3 text-[#2E7D32]" />
                        <span>Kamera HP Aktif</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-medium shrink-0">
                        <Upload className="w-3 h-3 text-slate-400" />
                        <span>Upload File</span>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* BLANKO DOKUMEN FISIK BILA TERSEDIA */}
            {selectedJenisSurat.template_blanko_url && (
              <div className="p-3.5 bg-blue-50/90 border border-blue-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-[#0D2A4A] flex items-center gap-1.5">
                    <FileDown className="w-4 h-4 text-[#1565C0]" />
                    <span>File Blanko Formulir Tersedia ({selectedJenisSurat.nama_file_blanko || 'PDF/DOCX'})</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    Warga dapat mengunduh formulir kosong ini untuk diisi atau ditandatangani secara fisik terlebih dahulu jika diperlukan.
                  </p>
                </div>
                <a
                  href={selectedJenisSurat.template_blanko_url}
                  download={selectedJenisSurat.nama_file_blanko || `Blanko_${selectedJenisSurat.kode}.pdf`}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#1565C0] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Blanko Formulir</span>
                </a>
              </div>
            )}

            {/* FIELD KEPERLUAN & KETERANGAN */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Tujuan / Keperluan Surat <span className="text-[#B71C1C]">*</span>
              </label>
              <textarea
                rows={3}
                value={formData.keperluan}
                onChange={(e) => setFormData({ ...formData, keperluan: e.target.value })}
                placeholder="Contoh: Pengajuan pinjaman KUR BRI, pendaftaran beasiswa anak, atau verifikasi data kependudukan"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-[#1565C0] focus:border-[#1565C0] focus:outline-none"
              />
            </div>

            {/* DYNAMIC ADDITIONAL FIELDS BERDASARKAN KODE SURAT */}
            {selectedJenisSurat.kode === 'SKU' && (
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
                <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-amber-700" />
                  <span>Rincian Informasi Usaha (Untuk Format Surat Keterangan Usaha)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                      Nama Usaha / Toko <span className="text-[#B71C1C]">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.nama_usaha}
                      onChange={(e) => setFormData({ ...formData, nama_usaha: e.target.value })}
                      placeholder="Contoh: Kios Sembako Barokah Nyurlembang"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-[#1565C0] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                      Bidang Usaha
                    </label>
                    <input
                      type="text"
                      value={formData.bidang_usaha}
                      onChange={(e) => setFormData({ ...formData, bidang_usaha: e.target.value })}
                      placeholder="Contoh: Perdagangan / Pengolahan Gula Aren"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-[#1565C0] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                      Alamat Lokasi Usaha
                    </label>
                    <input
                      type="text"
                      value={formData.alamat_usaha}
                      onChange={(e) => setFormData({ ...formData, alamat_usaha: e.target.value })}
                      placeholder="Contoh: Dusun Kebon Baru RT 01"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-[#1565C0] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedJenisSurat.kode === 'SKTM' && (
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
                <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-amber-700" />
                  <span>Rincian Khusus Surat Keterangan Tidak Mampu</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                      Nama Anggota Keluarga / Anak (Opsional)
                    </label>
                    <input
                      type="text"
                      value={formData.nama_anak}
                      onChange={(e) => setFormData({ ...formData, nama_anak: e.target.value })}
                      placeholder="Nama anak bila untuk keperluan beasiswa"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-[#1565C0] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                      Instansi Tujuan
                    </label>
                    <input
                      type="text"
                      value={formData.instansi_tujuan}
                      onChange={(e) => setFormData({ ...formData, instansi_tujuan: e.target.value })}
                      placeholder="Contoh: Rektorat Universitas Mataram / RSUD"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-[#1565C0] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={handleNext}
                id="btn-step1-next"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#2E7D32] hover:bg-[#256629] text-white text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <span>Lanjut: Identitas Diri</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: IDENTITAS PEMOHON (DIJADIKAN KEDUA SESUAI INSTRUKSI) */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-base font-bold text-[#0D2A4A] font-heading">
                Langkah 2: Identitas Diri Pemohon Sesuai KTP
              </h2>
              <p className="text-xs text-slate-500">
                Pastikan NIK dan data diri akurat untuk pencetakan naskah dinas resmi.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Nomor Induk Kependudukan (NIK) <span className="text-[#B71C1C]">*</span>
                </label>
                <input
                  type="text"
                  maxLength={16}
                  value={formData.nik}
                  onChange={(e) => setFormData({ ...formData, nik: e.target.value.replace(/\D/g, '') })}
                  placeholder="Masukkan 16 digit NIK KTP Anda"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-slate-900 focus:ring-2 focus:ring-[#1565C0] focus:border-[#1565C0] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Nama Lengkap Pemohon <span className="text-[#B71C1C]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nama_pemohon}
                  onChange={(e) => setFormData({ ...formData, nama_pemohon: e.target.value })}
                  placeholder="Nama sesuai KTP (tanpa singkatan)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-[#1565C0] focus:border-[#1565C0] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Tempat Lahir <span className="text-[#B71C1C]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.tempat_lahir}
                  onChange={(e) => setFormData({ ...formData, tempat_lahir: e.target.value })}
                  placeholder="Contoh: Lombok Barat / Narmada"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-[#1565C0] focus:border-[#1565C0] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Tanggal Lahir <span className="text-[#B71C1C]">*</span>
                </label>
                <input
                  type="date"
                  value={formData.tanggal_lahir}
                  onChange={(e) => setFormData({ ...formData, tanggal_lahir: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-[#1565C0] focus:border-[#1565C0] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Jenis Kelamin <span className="text-[#B71C1C]">*</span>
                </label>
                <select
                  value={formData.jenis_kelamin}
                  onChange={(e) => setFormData({ ...formData, jenis_kelamin: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-[#1565C0] focus:border-[#1565C0] focus:outline-none cursor-pointer"
                >
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Pekerjaan <span className="text-[#B71C1C]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.pekerjaan}
                  onChange={(e) => setFormData({ ...formData, pekerjaan: e.target.value })}
                  placeholder="Contoh: Petani / Wiraswasta / Karyawan"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-[#1565C0] focus:border-[#1565C0] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Dusun di Desa Nyurlembang <span className="text-[#B71C1C]">*</span>
                </label>
                <select
                  value={formData.dusun}
                  onChange={(e) => setFormData({ ...formData, dusun: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-[#1565C0] focus:border-[#1565C0] focus:outline-none cursor-pointer"
                >
                  {DAFTAR_DUSUN.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Nomor WhatsApp Aktif <span className="text-[#B71C1C]">*</span>
                  </label>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    <span>Wajib Aktif</span>
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-600">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={formData.nomor_whatsapp}
                    onChange={(e) => setFormData({ ...formData, nomor_whatsapp: e.target.value.replace(/\D/g, '') })}
                    placeholder="Contoh: 081912345678"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Notifikasi progres & kesiapan surat fisik akan dikirimkan langsung ke nomor WhatsApp ini.
                </p>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Alamat Lengkap (RT / Dusun) <span className="text-[#B71C1C]">*</span>
                </label>
                <textarea
                  rows={2}
                  value={formData.alamat_lengkap}
                  onChange={(e) => setFormData({ ...formData, alamat_lengkap: e.target.value })}
                  placeholder="Contoh: RT 02 Dusun Nyurlembang Barat, Desa Nyurlembang"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-[#1565C0] focus:border-[#1565C0] focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali: Detail Surat</span>
              </button>

              <button
                type="button"
                onClick={handleNext}
                id="btn-step2-next"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#2E7D32] hover:bg-[#256629] text-white text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <span>Lanjut: Unggah Berkas</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: UNGGAH BERKAS PERSYARATAN */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-base font-bold text-[#0D2A4A] font-heading">
                Langkah 3: Unggah Berkas Dokumen Persyaratan
              </h2>
              <p className="text-xs text-slate-500">
                Unggah foto KTP asli dan Kartu Keluarga (KK) yang terbaca jelas untuk verifikasi petugas desa.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
              {/* Berkas 1: KTP Pemohon */}
              <div className="p-4 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 flex flex-col items-center justify-between text-center space-y-3 relative">
                <input
                  ref={ktpInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileUpload(e, 'ktp')}
                  className="hidden"
                />
                <input
                  ref={ktpCameraRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => handleFileUpload(e, 'ktp')}
                  className="hidden"
                />
                
                <div className="w-full flex flex-col items-center space-y-1.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#1565C0] flex items-center justify-center shadow-xs">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-[#0D2A4A] flex items-center justify-center gap-1">
                      <span>Foto KTP Pemohon Asli</span>
                      <span className="text-[#B71C1C]">*</span>
                    </div>
                    <div className="text-[10px] text-slate-500">Maks 1600px • Auto-compress ≤ 500 KB</div>
                  </div>
                </div>

                {ktpDoc.isProcessing ? (
                  <div className="flex items-center gap-2 text-xs text-[#1565C0] font-semibold py-4">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Mengompresi & cek ketajaman...</span>
                  </div>
                ) : ktpDoc.name ? (
                  <div className="w-full space-y-2">
                    {ktpDoc.dataUrl && (
                      <div className="flex justify-center">
                        <img
                          src={ktpDoc.dataUrl}
                          alt="Preview KTP"
                          className="h-24 w-auto max-w-[180px] object-cover rounded-lg border border-slate-200 shadow-2xs"
                        />
                      </div>
                    )}
                    <div className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-[#2E7D32] rounded-lg text-xs font-semibold flex items-center justify-between gap-1">
                      <span className="truncate max-w-[120px] font-mono text-[11px]">{ktpDoc.name}</span>
                      <span className="text-[10px] bg-emerald-100 px-1.5 py-0.5 rounded font-mono font-bold">
                        {ktpDoc.sizeKb} KB
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Auto-compressed dari {ktpDoc.originalSizeKb} KB
                    </div>

                    {ktpDoc.isBlurry && (
                      <div className="w-full p-2 bg-red-50 border border-red-300 rounded-xl text-xs text-red-900 text-left flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                        <div className="text-[11px] leading-relaxed">
                          <strong>Foto KTP terdeteksi buram</strong> (Skor: {ktpDoc.laplacianVariance}/80). Pastikan tulisan dan NIK terbaca jelas.
                        </div>
                      </div>
                    )}

                    {ktpDoc.framingWarning && (
                      <div className="w-full p-2 bg-amber-50 border border-amber-300 rounded-xl text-[11px] text-amber-900 text-left flex items-start gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span>{ktpDoc.framingWarning}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => ktpInputRef.current?.click()}
                        className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-[11px] font-bold shadow-xs cursor-pointer"
                      >
                        Ganti File
                      </button>
                      <button
                        type="button"
                        onClick={() => ktpCameraRef.current?.click()}
                        className="px-2.5 py-1 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 text-emerald-800 rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        <Camera className="w-3 h-3 text-[#2E7D32]" />
                        <span>Foto Ulang HP</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full space-y-2 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => ktpInputRef.current?.click()}
                        className="w-full px-2.5 py-2 bg-white border border-slate-300 hover:border-[#1565C0] text-slate-700 hover:text-[#1565C0] rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5 text-slate-500" />
                        <span>Pilih Berkas / PDF</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => ktpCameraRef.current?.click()}
                        className="w-full px-2.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Foto Kamera HP</span>
                      </button>
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => handleSimulateUpload('ktp', `ktp_${formData.nik || 'warga'}.jpg`)}
                        className="text-[10px] text-slate-400 hover:text-slate-600 underline cursor-pointer"
                      >
                        Gunakan Berkas Contoh
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Berkas 2: Kartu Keluarga (KK) */}
              <div className="p-4 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 flex flex-col items-center justify-between text-center space-y-3 relative">
                <input
                  ref={kkInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileUpload(e, 'kk')}
                  className="hidden"
                />
                <input
                  ref={kkCameraRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => handleFileUpload(e, 'kk')}
                  className="hidden"
                />

                <div className="w-full flex flex-col items-center space-y-1.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#2E7D32] flex items-center justify-center shadow-xs">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-[#0D2A4A] flex items-center justify-center gap-1">
                      <span>Foto Kartu Keluarga (KK)</span>
                      <span className="text-[#B71C1C]">*</span>
                    </div>
                    <div className="text-[10px] text-slate-500">Maks 1600px • Auto-compress ≤ 500 KB</div>
                  </div>
                </div>

                {kkDoc.isProcessing ? (
                  <div className="flex items-center gap-2 text-xs text-[#2E7D32] font-semibold py-4">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Mengompresi & cek ketajaman...</span>
                  </div>
                ) : kkDoc.name ? (
                  <div className="w-full space-y-2">
                    {kkDoc.dataUrl && (
                      <div className="flex justify-center">
                        <img
                          src={kkDoc.dataUrl}
                          alt="Preview KK"
                          className="h-24 w-auto max-w-[180px] object-cover rounded-lg border border-slate-200 shadow-2xs"
                        />
                      </div>
                    )}
                    <div className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-[#2E7D32] rounded-lg text-xs font-semibold flex items-center justify-between gap-1">
                      <span className="truncate max-w-[120px] font-mono text-[11px]">{kkDoc.name}</span>
                      <span className="text-[10px] bg-emerald-100 px-1.5 py-0.5 rounded font-mono font-bold">
                        {kkDoc.sizeKb} KB
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Auto-compressed dari {kkDoc.originalSizeKb} KB
                    </div>

                    {kkDoc.isBlurry && (
                      <div className="w-full p-2 bg-red-50 border border-red-300 rounded-xl text-xs text-red-900 text-left flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                        <div className="text-[11px] leading-relaxed">
                          <strong>Foto KK terdeteksi buram</strong> (Skor: {kkDoc.laplacianVariance}/80). Pastikan nomor KK terbaca jelas.
                        </div>
                      </div>
                    )}

                    {kkDoc.framingWarning && (
                      <div className="w-full p-2 bg-amber-50 border border-amber-300 rounded-xl text-[11px] text-amber-900 text-left flex items-start gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span>{kkDoc.framingWarning}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => kkInputRef.current?.click()}
                        className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-[11px] font-bold shadow-xs cursor-pointer"
                      >
                        Ganti File
                      </button>
                      <button
                        type="button"
                        onClick={() => kkCameraRef.current?.click()}
                        className="px-2.5 py-1 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 text-emerald-800 rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        <Camera className="w-3 h-3 text-[#2E7D32]" />
                        <span>Foto Ulang HP</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full space-y-2 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => kkInputRef.current?.click()}
                        className="w-full px-2.5 py-2 bg-white border border-slate-300 hover:border-[#2E7D32] text-slate-700 hover:text-[#2E7D32] rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5 text-slate-500" />
                        <span>Pilih Berkas / PDF</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => kkCameraRef.current?.click()}
                        className="w-full px-2.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Foto Kamera HP</span>
                      </button>
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => handleSimulateUpload('kk', `kk_${formData.nik || 'warga'}.jpg`)}
                        className="text-[10px] text-slate-400 hover:text-slate-600 underline cursor-pointer"
                      >
                        Gunakan Berkas Contoh
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Berkas Tambahan: LAMPIRAN PENDUKUNG / SYARAT KHUSUS (Dinamis Berdasarkan Master Surat) */}
              {selectedJenisSurat.persyaratan && selectedJenisSurat.persyaratan.some((s) => {
                const low = s.toLowerCase();
                return !low.includes('ktp') && !low.includes('kk') && !low.includes('kartu keluarga') && !low.includes('pas foto');
              }) && (
                <div className="p-4 border-2 border-dashed border-blue-300 rounded-2xl bg-blue-50/40 flex flex-col items-center justify-between text-center space-y-3 relative">
                  <input
                    ref={tambahanInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload(e, 'tambahan')}
                    className="hidden"
                  />
                  <input
                    ref={tambahanCameraRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => handleFileUpload(e, 'tambahan')}
                    className="hidden"
                  />

                  <div className="w-full flex flex-col items-center space-y-1.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#1565C0] flex items-center justify-center shadow-xs">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-[#0D2A4A] flex items-center justify-center gap-1">
                        <span>Berkas Dokumen Pendukung</span>
                        <span className="text-slate-500 font-normal text-[10px]">(Opsional/Pelengkap)</span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {selectedJenisSurat.persyaratan
                          .filter((s) => {
                            const low = s.toLowerCase();
                            return !low.includes('ktp') && !low.includes('kk') && !low.includes('kartu keluarga') && !low.includes('pas foto');
                          })
                          .join(', ')}
                      </div>
                    </div>
                  </div>

                  {tambahanDoc.isProcessing ? (
                    <div className="flex items-center gap-2 text-xs text-[#1565C0] font-semibold py-4">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Mengompresi berkas pendukung...</span>
                    </div>
                  ) : tambahanDoc.name ? (
                    <div className="w-full space-y-2">
                      {tambahanDoc.dataUrl && (
                        <div className="flex justify-center">
                          <img
                            src={tambahanDoc.dataUrl}
                            alt="Preview Berkas Tambahan"
                            className="h-24 w-auto max-w-[180px] object-cover rounded-lg border border-slate-200 shadow-2xs"
                          />
                        </div>
                      )}
                      <div className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-[#2E7D32] rounded-lg text-xs font-semibold flex items-center justify-between gap-1">
                        <span className="truncate max-w-[120px] font-mono text-[11px]">{tambahanDoc.name}</span>
                        <span className="text-[10px] bg-emerald-100 px-1.5 py-0.5 rounded font-mono font-bold">
                          {tambahanDoc.sizeKb} KB
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Auto-compressed dari {tambahanDoc.originalSizeKb} KB
                      </div>

                      <div className="flex items-center justify-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => tambahanInputRef.current?.click()}
                          className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-[11px] font-bold shadow-xs cursor-pointer"
                        >
                          Ganti File
                        </button>
                        <button
                          type="button"
                          onClick={() => tambahanCameraRef.current?.click()}
                          className="px-2.5 py-1 bg-blue-50 border border-blue-300 hover:bg-blue-100 text-blue-800 rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <Camera className="w-3 h-3 text-[#1565C0]" />
                          <span>Foto Kamera HP</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full space-y-2 pt-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => tambahanInputRef.current?.click()}
                          className="w-full px-2.5 py-2 bg-white border border-slate-300 hover:border-[#1565C0] text-slate-700 hover:text-[#1565C0] rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5 text-slate-500" />
                          <span>Pilih Berkas / PDF</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => tambahanCameraRef.current?.click()}
                          className="w-full px-2.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Foto Kamera HP</span>
                        </button>
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => handleSimulateUpload('tambahan', `lampiran_${formData.nik || 'warga'}.jpg`)}
                          className="text-[10px] text-slate-400 hover:text-slate-600 underline cursor-pointer"
                        >
                          Gunakan Berkas Contoh
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Pernyataan Kebenaran */}
            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-slate-700 space-y-1.5">
              <div className="font-bold text-[#0D2A4A] flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-[#1565C0]" />
                <span>Pernyataan Keabsahan Data Pemohon:</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-600">
                Dengan menekan tombol Buat Surat, saya menyatakan bahwa seluruh identitas dan berkas yang dilampirkan adalah benar dan sah menurut hukum yang berlaku di Desa Nyurlembang.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali: Identitas Diri</span>
              </button>

              {/* Tombol Buat Surat dengan LOGO SURAT (FileText) Sesuai Instruksi */}
              <button
                type="submit"
                disabled={loading}
                id="btn-buat-surat-submit"
                className="inline-flex items-center gap-2 px-7 py-3 bg-[#2E7D32] hover:bg-[#256629] text-white text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <FileText className="w-4 h-4 text-[#FFB300]" />
                <span>{loading ? 'Memproses Berkas...' : 'Buat Surat Sekarang'}</span>
              </button>
            </div>
          </form>
        )}

        {/* STEP 4: SELESAI & KODE TIKET PELACAKAN */}
        {step === 4 && submittedData && (
          <div className="text-center py-6 space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#2E7D32] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#0D2A4A] font-heading">
                Permohonan Surat Berhasil Terkirim!
              </h2>
              <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                Berkas Anda telah masuk ke Meja Kerja Administrasi Desa Nyurlembang. Simpan kode tiket berikut untuk melacak perkembangan naskah dinas.
              </p>
            </div>

            {/* Kotak Kode Tiket */}
            <div className="p-5 bg-blue-50/70 border-2 border-dashed border-[#1565C0] rounded-2xl max-w-md mx-auto space-y-2">
              <div className="text-xs uppercase font-bold text-slate-500">Nomor Registrasi / Kode Tiket Anda</div>
              <div className="text-2xl sm:text-3xl font-mono font-black text-[#1565C0] tracking-wider">
                {submittedData.kode_tiket}
              </div>
              <button
                type="button"
                onClick={copyTicket}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-1.5 bg-white border border-blue-300 hover:bg-blue-50 text-[#1565C0] rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#2E7D32]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin ke Clipboard' : 'Salin Kode Tiket'}</span>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => onSuccessLacak(submittedData.nik, submittedData.kode_tiket)}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#1565C0] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Search className="w-4 h-4 text-[#FFB300]" />
                <span>Lacak Status Surat Sekarang</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setSubmittedData(null);
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Ajukan Surat Lainnya
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
