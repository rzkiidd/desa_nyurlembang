import React, { useState, useEffect } from 'react';
import {
  Database,
  Code2,
  ShieldCheck,
  Copy,
  Check,
  FileTerminal,
  Layers,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  BookOpen,
  Download,
  ListOrdered,
  FolderOpen
} from 'lucide-react';
import {
  testSupabaseConnection,
  SupabaseConnectionStatus,
  supabaseUrl
} from '../lib/supabaseClient';

interface SqlSchemaViewerProps {
  sqlContent: string;
  middlewareContent: string;
}

export const SqlSchemaViewer: React.FC<SqlSchemaViewerProps> = ({ sqlContent, middlewareContent }) => {
  const [activeTab, setActiveTab] = useState<'sql' | 'tutorial' | 'kebutuhan' | 'middleware' | 'arsitektur'>('sql');
  const [copied, setCopied] = useState(false);
  const [testingConn, setTestingConn] = useState(false);
  const [connStatus, setConnStatus] = useState<SupabaseConnectionStatus | null>(null);

  useEffect(() => {
    // Run initial connection test on mount
    handleTestConnection();
  }, []);

  const handleTestConnection = async () => {
    setTestingConn(true);
    try {
      const res = await testSupabaseConnection();
      setConnStatus(res);
    } catch {
      setConnStatus({
        ok: false,
        url: supabaseUrl,
        latencyMs: 0,
        message: 'Tidak dapat tersambung ke host Supabase.',
        tablesFound: [],
        tablesMissing: [],
      });
    } finally {
      setTestingConn(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadSql = () => {
    const blob = new Blob([sqlContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schema_sid_desa_nyurlembang.sql';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const tablesChecklist = [
    { name: 'profiles', desc: 'Akun staf desa, kontributor berita, jabatan, dan kredensial', rows: '3 Data Awal' },
    { name: 'pengaturan_desa', desc: 'Konfigurasi kop surat dinas resmi, nomor register awal, kontak, alamat, logo', rows: '1 Baris' },
    { name: 'jenis_surat', desc: 'Master jenis blanko & persyaratan surat permohonan mandiri', rows: '6 Jenis Surat' },
    { name: 'permohonan_surat', desc: 'Arsip permohonan surat warga, NIK, kode tiket, status, dan nomor register resmi', rows: 'Real-time' },
    { name: 'riwayat_status_surat', desc: 'Audit trail kronologis pelacakan riwayat pergerakan naskah surat', rows: 'Log Audit' },
    { name: 'pejabat_desa', desc: 'Data aparatur pemerintahan desa, foto, NIP/NIPD, dan susunan jabatan', rows: '6 Aparatur' },
    { name: 'banner_slides', desc: 'Banner gambar slider berotasi pada beranda portal desa', rows: '2 Banner' },
    { name: 'berita_desa', desc: 'Publikasi artikel, kabar desa, dokumentasi, dan transparansi kegiatan', rows: '2 Berita' },
    { name: 'komentar_berita', desc: 'Tanggapan dan komentar pembaca berita warga dengan sistem moderasi', rows: 'Moderasi' },
    { name: 'pengaduan_warga', desc: 'Layanan aspirasi & keluhan masyarakat lengkap dengan nomor tiket PGD dan jawaban staf', rows: 'Interaktif' },
    { name: 'produk_hukum', desc: 'JDIH Desa: Perdes, Perkades, Keputusan Kades, Maklumat, dan Surat Edaran', rows: '3 Regulasi' },
    { name: 'galeri_kegiatan', desc: 'Album dokumentasi foto kegiatan sosial, pembangunan, dan keagamaan', rows: 'Dokumentasi' },
    { name: 'potensi_umkm', desc: 'Katalog etalase produk UMKM unggulan 4 dusun Desa Nyurlembang', rows: '4 Dusun' },
    { name: 'transparansi_apbdes', desc: 'Struktur APBDes 2026: Total Pendapatan, Belanja, dan Pembiayaan', rows: 'APBDes 2026' },
    { name: 'statistik_desa', desc: 'Statistik demografi kependudukan, demografi usia, pendidikan, dan intervensi stunting', rows: 'Demografi' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header Info & Connection Status Banner */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-full border border-emerald-200">
            <Database className="w-3.5 h-3.5" />
            <span>Koneksi Supabase PostgreSQL Live Database</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTestConnection}
              disabled={testingConn}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testingConn ? 'animate-spin text-blue-600' : ''}`} />
              <span>{testingConn ? 'Menguji...' : 'Tes Ping Koneksi'}</span>
            </button>

            <a
              href="https://supabase.com/dashboard/project/aaofjuqivtvdubmdjdhp"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-[#1E293B] hover:bg-[#0F172A] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            >
              <span>Buka Supabase Dashboard</span>
              <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
            </a>
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-heading">
          Arsitektur Basis Data & Dokumentasi SQL Supabase
        </h1>
        <p className="text-xs md:text-sm text-slate-600 mt-1">
          Sistem Informasi Desa (SID) & Layanan Surat Mandiri Desa Nyurlembang terhubung langsung ke Supabase PostgreSQL.
        </p>

        {/* Live Status Card */}
        <div className="mt-4 p-4 rounded-2xl border bg-white shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  connStatus?.ok
                    ? connStatus.tablesFound.length > 0
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                    : 'bg-rose-100 text-rose-700'
                }`}
              >
                {connStatus?.ok ? (
                  connStatus.tablesFound.length > 0 ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">Host Database:</span>
                  <code className="text-xs bg-slate-100 px-2 py-0.5 rounded text-blue-700 font-mono">
                    https://aaofjuqivtvdubmdjdhp.supabase.co
                  </code>
                  {connStatus && (
                    <span className="text-[11px] font-mono text-slate-400">
                      ({connStatus.latencyMs} ms)
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  {connStatus
                    ? connStatus.message
                    : 'Sedang memeriksa status koneksi ke instance Supabase...'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  connStatus?.ok
                    ? connStatus.tablesFound.length > 0
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    connStatus?.ok
                      ? connStatus.tablesFound.length > 0
                        ? 'bg-emerald-500'
                        : 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                />
                {connStatus?.ok
                  ? connStatus.tablesFound.length > 0
                    ? 'Tersambung & Siap Pakai'
                    : 'Host Aktif (Perlu Eksekusi SQL)'
                  : 'Host Offline / Gagal'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('sql')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'sql'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Database className="w-4 h-4 text-emerald-400" />
            <span>1. File SQL Lengkap (DDL & RLS)</span>
          </button>

          <button
            onClick={() => setActiveTab('tutorial')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'tutorial'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span>2. Panduan & Tutorial Eksekusi</span>
          </button>

          <button
            onClick={() => setActiveTab('kebutuhan')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'kebutuhan'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ListOrdered className="w-4 h-4 text-purple-400" />
            <span>3. Struktur 14 Tabel & Storage</span>
          </button>

          <button
            onClick={() => setActiveTab('middleware')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'middleware'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Code2 className="w-4 h-4 text-cyan-400" />
            <span>4. SSR Middleware</span>
          </button>

          <button
            onClick={() => setActiveTab('arsitektur')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'arsitektur'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4 text-amber-400" />
            <span>5. Matriks Hak Akses (RBAC)</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'sql' && (
            <button
              onClick={handleDownloadSql}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-300 cursor-pointer"
              title="Unduh File .sql"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>Unduh .sql</span>
            </button>
          )}

          {(activeTab === 'sql' || activeTab === 'middleware') && (
            <button
              onClick={() => handleCopy(activeTab === 'sql' ? sqlContent : middlewareContent)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
            >
              {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Tersalin ke Clipboard!' : 'Salin Seluruh Kode'}</span>
            </button>
          )}
        </div>
      </div>

      {/* =========================================================================
          TAB 1: FILE SQL LENGKAP
      ========================================================================= */}
      {activeTab === 'sql' && (
        <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
          <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-2">
              <FileTerminal className="w-4 h-4 text-emerald-400" />
              <span>/src/supabase/schema.sql (Production PostgreSQL DDL + RLS + Seed Data)</span>
            </span>
            <span className="text-[11px] text-emerald-400 font-semibold">PostgreSQL 15+ / Supabase</span>
          </div>
          <pre className="p-6 text-xs font-mono text-slate-200 overflow-x-auto max-h-[620px] leading-relaxed select-all">
            {sqlContent}
          </pre>
        </div>
      )}

      {/* =========================================================================
          TAB 2: TUTORIAL & PANDUAN EKSEKUSI SUPABASE
      ========================================================================= */}
      {activeTab === 'tutorial' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-heading flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span>Panduan Eksekusi SQL di Supabase (Langkah demi Langkah)</span>
            </h2>
            <p className="text-xs md:text-sm text-slate-600 mt-1">
              Ikuti langkah sederhana ini untuk membuat seluruh tabel, pemicu nomor tiket otomatis, izin RLS, dan data awal di project Supabase Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl border border-blue-100 bg-blue-50/50 flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold text-sm flex items-center justify-center mb-3">
                  1
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Buka SQL Editor Supabase</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Buka dashboard Supabase project Anda di{' '}
                  <code className="text-blue-700 bg-blue-100 px-1 py-0.5 rounded font-mono">
                    https://supabase.com/dashboard/project/aaofjuqivtvdubmdjdhp
                  </code>{' '}
                  lalu klik menu <strong>SQL Editor</strong> di sidebar sebelah kiri.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-emerald-100 bg-emerald-50/50 flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-bold text-sm flex items-center justify-center mb-3">
                  2
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Salin & Tempel Kode SQL</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Tekan tombol <strong>"Salin Seluruh Kode"</strong> di tab 1, lalu klik <strong>New Query</strong> di Supabase SQL Editor dan tempelkan (Paste) seluruh teks SQL ke dalamnya.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-purple-100 bg-purple-50/50 flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white font-bold text-sm flex items-center justify-center mb-3">
                  3
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Klik Tombol "Run"</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Tekan tombol hijau <strong>Run</strong> (atau shortcut <code>Ctrl + Enter</code>). Dalam waktu 2–3 detik, seluruh 14 tabel, triggers, policies, dan seed data desa akan otomatis terbuat!
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-amber-600" />
              <span>Langkah Tambahan: Konfigurasi Storage Buckets</span>
            </h3>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2 leading-relaxed">
              <p>
                Skrip SQL telah otomatis menambahkan baris pembuatan dua bucket penyimpanan di tabel <code>storage.buckets</code>:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2 font-medium">
                <li>
                  <code className="text-blue-700 bg-blue-50 px-1 py-0.5 rounded font-mono">public-media</code>:{' '}
                  Untuk aset gambar publik (foto banner desa, foto berita, foto aparatur, berkas regulasi PDF, logo).
                </li>
                <li>
                  <code className="text-blue-700 bg-blue-50 px-1 py-0.5 rounded font-mono">dokumen-persyaratan</code>:{' '}
                  Untuk lampiran berkas KTP, KK, dan bukti foto pengaduan warga.
                </li>
              </ul>
              <p className="text-slate-500 pt-1">
                Jika di dashboard Supabase &gt; Storage bucket belum muncul secara visual, Anda dapat menekan tombol <strong>New Bucket</strong> lalu buat bucket dengan nama persis <code>public-media</code> dan <code>dokumen-persyaratan</code> serta centang pilihan <em>Public Bucket</em>.
              </p>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h3 className="font-bold text-slate-900 text-sm mb-2">Akun Awal Staf Desa & Kontributor untuk Pengujian</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Peran (Role)</th>
                    <th className="p-3">Username / Email</th>
                    <th className="p-3">Kata Sandi</th>
                    <th className="p-3">Nama & Jabatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="p-3 font-semibold text-emerald-700">Staf Pelayanan</td>
                    <td className="p-3 font-mono">staff / admin@nyurlembang.desa.id</td>
                    <td className="p-3 font-mono">admin123</td>
                    <td className="p-3">Budi Santoso, S.AP (Kasi Pelayanan)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-emerald-700">Kepala Desa</td>
                    <td className="p-3 font-mono">kades / kades@nyurlembang.desa.id</td>
                    <td className="p-3 font-mono">kades123</td>
                    <td className="p-3">H. MUHAMMAD RIDWAN, S.Pd.I</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-blue-700">Kontributor Berita</td>
                    <td className="p-3 font-mono">kontributor / kontributor@nyurlembang.desa.id</td>
                    <td className="p-3 font-mono">kontributor123</td>
                    <td className="p-3">Ahmad Zaini, S.Kom (Redaksi SID)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: STRUKTUR KEBUTUHAN 14 TABEL & STORAGE
      ========================================================================= */}
      {activeTab === 'kebutuhan' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-heading flex items-center gap-2">
              <ListOrdered className="w-5 h-5 text-purple-600" />
              <span>Daftar Lengkap 14 Tabel & Entitas Database SID Nyurlembang</span>
            </h2>
            <p className="text-xs md:text-sm text-slate-600 mt-1">
              Seluruh kebutuhan data aplikasi telah dipetakan secara terstruktur ke dalam relasi PostgreSQL Supabase.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 text-slate-800 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">No</th>
                  <th className="p-3">Nama Tabel</th>
                  <th className="p-3">Deskripsi Fungsi & Modul</th>
                  <th className="p-3">Data Awal (Seed)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {tablesChecklist.map((item, idx) => (
                  <tr key={item.name} className="hover:bg-slate-50/80">
                    <td className="p-3 text-slate-400 font-mono">{idx + 1}</td>
                    <td className="p-3 font-mono font-bold text-blue-700">
                      public.{item.name}
                    </td>
                    <td className="p-3 text-slate-600">{item.desc}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[11px] font-semibold">
                        {item.rows}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: NEXT.JS SSR MIDDLEWARE
      ========================================================================= */}
      {activeTab === 'middleware' && (
        <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
          <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-2">
              <FileTerminal className="w-4 h-4 text-blue-400" />
              <span>/middleware.ts (Next.js App Router + @supabase/ssr)</span>
            </span>
            <span className="text-[11px] text-blue-400 font-semibold">SSR Route Guards</span>
          </div>
          <pre className="p-6 text-xs font-mono text-slate-200 overflow-x-auto max-h-[620px] leading-relaxed select-all">
            {middlewareContent}
          </pre>
        </div>
      )}

      {/* =========================================================================
          TAB 5: MATRIKS HAK AKSES (RBAC)
      ========================================================================= */}
      {activeTab === 'arsitektur' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-6">
          <h2 className="text-xl font-bold text-slate-900 font-heading">
            Matriks Hak Akses (RBAC) & Keamanan Row-Level Security (RLS)
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 text-slate-900 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Entitas / Modul Sistem</th>
                  <th className="p-3">Publik / Warga (Anon)</th>
                  <th className="p-3">Kontributor (user_biasa)</th>
                  <th className="p-3">Staf Desa (staff_desa)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-3 font-semibold">Portal Berita & Kabar Desa</td>
                  <td className="p-3 text-emerald-700 font-medium">Read Only (Published)</td>
                  <td className="p-3 text-emerald-700 font-bold">Full CRUD (Tulis & Edit)</td>
                  <td className="p-3 text-emerald-700 font-bold">Full CRUD</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Etalase Potensi UMKM & Galeri</td>
                  <td className="p-3 text-emerald-700 font-medium">Read Only</td>
                  <td className="p-3 text-emerald-700 font-bold">Full CRUD</td>
                  <td className="p-3 text-emerald-700 font-bold">Full CRUD</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Form Layanan Surat Mandiri</td>
                  <td className="p-3 text-emerald-700 font-bold">INSERT (Submit Permohonan)</td>
                  <td className="p-3 text-slate-400">Tidak Relevan</td>
                  <td className="p-3 text-slate-400">Tidak Relevan</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Pengaduan Warga & Aspirasi</td>
                  <td className="p-3 text-emerald-700 font-bold">INSERT (Kirim Pengaduan)</td>
                  <td className="p-3 text-slate-400">-</td>
                  <td className="p-3 text-emerald-700 font-bold">Full CRUD (Beri Tanggapan)</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Produk Hukum & Perdes (JDIH)</td>
                  <td className="p-3 text-emerald-700 font-medium">Read & Download PDF</td>
                  <td className="p-3 text-slate-400">Read Only</td>
                  <td className="p-3 text-emerald-700 font-bold">Full CRUD (Unggah Perdes)</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Verifikasi & Penomoran Register</td>
                  <td className="p-3 text-slate-400">Lacak Status via NIK & Tiket</td>
                  <td className="p-3 text-rose-600 font-bold">Akses Dilarang</td>
                  <td className="p-3 text-emerald-700 font-bold">Full (Verifikasi, Nomor, Cetak)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 leading-relaxed">
            <strong>Keamanan Berlapis (Defense in Depth):</strong> Seluruh data pemohon surat dilindungi oleh aturan RLS PostgreSQL. Warga publik hanya dapat melacak dokumen mereka sendiri dengan memasukkan pasangan NIK dan Kode Tiket yang valid, mencegah potensi kebocoran data kependudukan.
          </div>
        </div>
      )}
    </div>
  );
};
