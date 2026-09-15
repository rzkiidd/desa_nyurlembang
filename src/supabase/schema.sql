-- ============================================================================
-- SKEMA BASIS DATA SUPABASE LENGKAP (POSTGRESQL DDL, RLS, STORAGE & SEED DATA)
-- SISTEM INFORMASI DESA (SID) & LAYANAN SURAT MANDIRI DIGITAL
-- PEMERINTAH DESA NYURLEMBANG, KECAMATAN NARMADA, KABUPATEN LOMBOK BARAT, NTB
-- 
-- Target Host: https://aaofjuqivtvdubmdjdhp.supabase.co
-- Dapat langsung disalin & dieksekusi di: Supabase Dashboard > SQL Editor > New Query > Run
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('staff_desa', 'user_biasa');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.status_permohonan AS ENUM (
    'Diajukan',
    'Diverifikasi & Dicetak',
    'Menunggu TTD Kades',
    'Siap Diambil',
    'Selesai',
    'Ditolak'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.kategori_produk_hukum AS ENUM (
    'Peraturan Desa (Perdes)',
    'Peraturan Kepala Desa (Perkades)',
    'Keputusan Kepala Desa',
    'Maklumat Pelayanan',
    'Surat Edaran Desa'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. SEQUENCES UNTUK NOMOR TIKET DAN REGISTER RESMI
CREATE SEQUENCE IF NOT EXISTS public.seq_tiket_permohonan START 1;
CREATE SEQUENCE IF NOT EXISTS public.seq_nomor_surat_keluar START 1;
CREATE SEQUENCE IF NOT EXISTS public.seq_tiket_pengaduan START 1;

-- ============================================================================
-- 4. TABEL USER MANAGEMENT & PROFILES DESA
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  email TEXT NOT NULL UNIQUE,
  username TEXT UNIQUE,
  password TEXT,
  nama_lengkap TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'staff_desa',
  jabatan TEXT,
  avatar_url TEXT,
  status TEXT NOT NULL DEFAULT 'Aktif',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 5. TABEL PENGATURAN UMUM DESA & KOP SURAT DINAS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.pengaturan_desa (
  id INT PRIMARY KEY DEFAULT 1,
  nama_desa TEXT NOT NULL DEFAULT 'Nyurlembang',
  kecamatan TEXT NOT NULL DEFAULT 'Narmada',
  kabupaten TEXT NOT NULL DEFAULT 'Lombok Barat',
  provinsi TEXT NOT NULL DEFAULT 'Nusa Tenggara Barat',
  telepon_kppid TEXT DEFAULT '0819-0712-3456',
  email_desa TEXT DEFAULT 'pemdes@nyurlembang.desa.id',
  alamat_kantor TEXT DEFAULT 'Jl. Raya Wisata Nyurlembang, Kec. Narmada, Kab. Lombok Barat, NTB',
  kode_pos TEXT DEFAULT '83371',
  jam_pelayanan TEXT DEFAULT 'Senin - Jumat, 08.00 - 15.30 WITA',
  sambutan_kades_nama TEXT DEFAULT 'H. MUHAMMAD RIDWAN, S.Pd.I',
  sambutan_kades_teks TEXT,
  sambutan_kades_foto TEXT,
  sosial_media JSONB DEFAULT '{"youtube": "https://youtube.com/@desanyurlembang", "instagram": "https://instagram.com/desanyurlembang", "tiktok": "https://tiktok.com/@desanyurlembang", "facebook": "https://facebook.com/desanyurlembang"}'::jsonb,
  google_maps_embed TEXT,
  
  -- Konfigurasi Kop Surat & Naskah Dinas Resmi
  kop_logo_url TEXT DEFAULT '/logo.png',
  kop_logo_kiri_url TEXT DEFAULT '/logo.png',
  kop_logo_kanan_url TEXT DEFAULT '',
  nomor_surat_mulai INT DEFAULT 1,
  kop_baris1 TEXT DEFAULT 'PEMERINTAH KABUPATEN LOMBOK BARAT',
  kop_baris2 TEXT DEFAULT 'KECAMATAN NARMADA',
  kop_baris3 TEXT DEFAULT 'KANTOR KEPALA DESA NYURLEMBANG',
  format_nomor_surat TEXT DEFAULT '470/[REG]/Des-NL/[BULAN_ROMAWI]/[TAHUN]',
  pejabat_penandatangan_nama TEXT DEFAULT 'H. MUHAMMAD RIDWAN, S.Pd.I',
  pejabat_penandatangan_nipd TEXT DEFAULT '19750812 200801 1 004',
  pejabat_penandatangan_jabatan TEXT DEFAULT 'Kepala Desa Nyurlembang',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 6. TABEL MASTER JENIS SURAT & PERSYARATAN
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.jenis_surat (
  id TEXT PRIMARY KEY,
  kode TEXT NOT NULL UNIQUE,
  nama TEXT NOT NULL,
  kategori TEXT NOT NULL DEFAULT 'Keterangan',
  deskripsi TEXT NOT NULL,
  persyaratan JSONB NOT NULL DEFAULT '[]'::jsonb,
  persyaratan_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  estimasi_hari INT NOT NULL DEFAULT 1,
  template_blanko_url TEXT,
  nama_file_blanko TEXT,
  wajib_pas_foto BOOLEAN DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  urutan INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 7. TABEL PERMOHONAN SURAT WARGA (PELAYANAN MANDIRI)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.permohonan_surat (
  id TEXT PRIMARY KEY DEFAULT ('perm-' || extract(epoch from now())::bigint || '-' || substr(md5(random()::text), 1, 6)),
  kode_tiket TEXT NOT NULL UNIQUE,
  nomor_surat_resmi TEXT,
  
  -- Identitas Pemohon
  nik TEXT NOT NULL,
  nama_pemohon TEXT NOT NULL,
  tempat_lahir TEXT NOT NULL,
  tanggal_lahir TEXT NOT NULL,
  jenis_kelamin TEXT NOT NULL,
  pekerjaan TEXT NOT NULL,
  agama TEXT NOT NULL DEFAULT 'Islam',
  dusun TEXT NOT NULL,
  alamat_lengkap TEXT NOT NULL,
  nomor_whatsapp TEXT NOT NULL,
  
  -- Rincian Surat
  jenis_surat_id TEXT NOT NULL,
  jenis_surat_nama TEXT NOT NULL,
  keperluan TEXT NOT NULL,
  data_tambahan JSONB DEFAULT '{}'::jsonb,
  
  -- Berkas Dokumen Pendukung
  berkas_ktp_url TEXT,
  berkas_kk_url TEXT,
  berkas_pas_foto_url TEXT,
  berkas_pendukung_url TEXT,
  
  -- Status Pemrosesan
  status TEXT NOT NULL DEFAULT 'Diajukan',
  catatan_revisi TEXT,
  catatan_petugas TEXT,
  
  -- Waktu & Audit Trail
  dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  diverifikasi_pada TIMESTAMPTZ,
  siap_diambil_pada TIMESTAMPTZ,
  diselesaikan_pada TIMESTAMPTZ,
  surat_selesai_url TEXT,
  riwayat JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_permohonan_nik_tiket ON public.permohonan_surat (nik, kode_tiket);
CREATE INDEX IF NOT EXISTS idx_permohonan_status ON public.permohonan_surat (status);
CREATE INDEX IF NOT EXISTS idx_permohonan_created ON public.permohonan_surat (dibuat_pada DESC);

-- ============================================================================
-- 8. TABEL LOG AUDIT RIWAYAT STATUS SURAT
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.riwayat_status_surat (
  id TEXT PRIMARY KEY DEFAULT ('rw-' || extract(epoch from now())::bigint || '-' || substr(md5(random()::text), 1, 4)),
  permohonan_id TEXT NOT NULL REFERENCES public.permohonan_surat(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  catatan TEXT,
  diubah_oleh TEXT DEFAULT 'Staf Pelayanan',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 9. TABEL APARATUR PEMERINTAH DESA & BPD
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.pejabat_desa (
  id TEXT PRIMARY KEY,
  nama TEXT NOT NULL,
  jabatan TEXT NOT NULL,
  nip TEXT,
  foto_url TEXT NOT NULL,
  telepon TEXT,
  tugas TEXT,
  urutan INT NOT NULL DEFAULT 0,
  status_aktif BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 10. TABEL BANNER SLIDER HERO BEROTASI
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.banner_slides (
  id TEXT PRIMARY KEY,
  gambar_url TEXT NOT NULL,
  judul TEXT NOT NULL,
  subjudul TEXT NOT NULL,
  keterangan TEXT,
  aktif BOOLEAN NOT NULL DEFAULT true,
  urutan INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 11. TABEL BERITA, KATEGORI & ARTIKEL PUBLIKASI
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.berita_desa (
  id TEXT PRIMARY KEY,
  judul TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  ringkasan TEXT NOT NULL,
  konten TEXT NOT NULL,
  kategori TEXT NOT NULL DEFAULT 'Pemerintahan',
  gambar_url TEXT NOT NULL,
  penulis TEXT NOT NULL DEFAULT 'Redaksi SID Nyurlembang',
  published_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'published',
  dilihat INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 12. TABEL KOMENTAR & TANGGAPAN WARGA PADA BERITA
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.komentar_berita (
  id TEXT PRIMARY KEY DEFAULT ('kom-' || extract(epoch from now())::bigint || '-' || substr(md5(random()::text), 1, 4)),
  berita_id TEXT NOT NULL,
  berita_judul TEXT,
  nama TEXT NOT NULL,
  dusun TEXT NOT NULL,
  pesan TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'menunggu_moderasi',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 13. TABEL PENGADUAN & ASPIRASI MASYARAKAT
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.pengaduan_warga (
  id TEXT PRIMARY KEY DEFAULT ('pgd-' || extract(epoch from now())::bigint || '-' || substr(md5(random()::text), 1, 4)),
  nomor_tiket TEXT NOT NULL UNIQUE,
  nama TEXT NOT NULL,
  nik TEXT NOT NULL,
  telepon TEXT NOT NULL,
  dusun TEXT NOT NULL,
  kategori TEXT NOT NULL,
  judul TEXT NOT NULL,
  isi_laporan TEXT NOT NULL,
  foto_url TEXT,
  rahasia BOOLEAN DEFAULT false,
  tanggal TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'Menunggu Tanggapan',
  tanggapan_petugas TEXT,
  ditanggapi_oleh TEXT,
  ditanggapi_pada TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 14. TABEL PRODUK HUKUM & PERATURAN DESA (JDIH DESA)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.produk_hukum (
  id TEXT PRIMARY KEY DEFAULT ('ph-' || extract(epoch from now())::bigint || '-' || substr(md5(random()::text), 1, 4)),
  judul TEXT NOT NULL,
  nomor TEXT NOT NULL,
  tahun INT NOT NULL,
  kategori TEXT NOT NULL,
  tanggal_penetapan TEXT NOT NULL,
  keterangan TEXT,
  file_url TEXT,
  nama_file TEXT,
  ukuran_file TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 15. TABEL GALERI DOKUMENTASI KEGIATAN DESA
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.galeri_kegiatan (
  id TEXT PRIMARY KEY,
  nama_kegiatan TEXT NOT NULL,
  tanggal TEXT NOT NULL,
  lokasi TEXT NOT NULL,
  kategori TEXT NOT NULL,
  deskripsi TEXT NOT NULL,
  foto_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 16. TABEL POTENSI UMKM 6 DUSUN
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.potensi_umkm (
  id TEXT PRIMARY KEY,
  nama_usaha TEXT NOT NULL,
  pemilik TEXT NOT NULL,
  kategori TEXT NOT NULL,
  dusun TEXT NOT NULL,
  deskripsi TEXT NOT NULL,
  harga_rentang TEXT,
  kontak_wa TEXT NOT NULL,
  foto_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 17. TABEL TRANSPARANSI APBDES 2026 & KEUANGAN
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.transparansi_apbdes (
  id TEXT PRIMARY KEY DEFAULT 'apbdes-2026',
  tahun INT NOT NULL UNIQUE DEFAULT 2026,
  pendapatan BIGINT NOT NULL DEFAULT 1680000000,
  belanja BIGINT NOT NULL DEFAULT 1650000000,
  pembiayaan BIGINT NOT NULL DEFAULT 30000000,
  rincian_belanja JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 18. TABEL STATISTIK KEPENDUDUKAN & INTERVENSI STUNTING
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.statistik_desa (
  id TEXT PRIMARY KEY DEFAULT 'stat-utama',
  total_penduduk INT NOT NULL DEFAULT 4852,
  penduduk_laki INT NOT NULL DEFAULT 2410,
  penduduk_perempuan INT NOT NULL DEFAULT 2442,
  jumlah_kk INT NOT NULL DEFAULT 1435,
  jumlah_dusun INT NOT NULL DEFAULT 6,
  jumlah_rt INT NOT NULL DEFAULT 18,
  jumlah_rw INT NOT NULL DEFAULT 6,
  luas_wilayah_ha NUMERIC NOT NULL DEFAULT 342.5,
  kelompok_usia JSONB DEFAULT '[]'::jsonb,
  pendidikan JSONB DEFAULT '[]'::jsonb,
  pekerjaan JSONB DEFAULT '[]'::jsonb,
  dusun_detail JSONB DEFAULT '[]'::jsonb,
  intervensi JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 19. FUNCTIONS OTOMASI NOMOR TIKET & NOMOR SURAT RESMI
-- ============================================================================

-- Function Konversi Bulan ke Angka Romawi
CREATE OR REPLACE FUNCTION public.fn_to_roman_month(m INT)
RETURNS TEXT AS $$
BEGIN
  RETURN CASE m
    WHEN 1 THEN 'I' WHEN 2 THEN 'II' WHEN 3 THEN 'III' WHEN 4 THEN 'IV'
    WHEN 5 THEN 'V' WHEN 6 THEN 'VI' WHEN 7 THEN 'VII' WHEN 8 THEN 'VIII'
    WHEN 9 THEN 'IX' WHEN 10 THEN 'X' WHEN 11 THEN 'XI' WHEN 12 THEN 'XII'
    ELSE 'I'
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger Auto-Generate Kode Tiket Permohonan Surat (Format: NYR-YYYYMM-XXXX)
CREATE OR REPLACE FUNCTION public.fn_auto_kode_tiket()
RETURNS TRIGGER AS $$
DECLARE
  v_seq INT;
  v_period TEXT;
BEGIN
  IF NEW.kode_tiket IS NULL OR NEW.kode_tiket = '' THEN
    v_seq := nextval('public.seq_tiket_permohonan');
    v_period := TO_CHAR(NOW(), 'YYYYMM');
    NEW.kode_tiket := 'NYR-' || v_period || '-' || LPAD(v_seq::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auto_kode_tiket ON public.permohonan_surat;
CREATE TRIGGER trg_auto_kode_tiket
  BEFORE INSERT ON public.permohonan_surat
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_auto_kode_tiket();

-- Trigger Auto-Generate Nomor Tiket Pengaduan (Format: PGD-YYYYMM-XXXX)
CREATE OR REPLACE FUNCTION public.fn_auto_tiket_pengaduan()
RETURNS TRIGGER AS $$
DECLARE
  v_seq INT;
  v_period TEXT;
BEGIN
  IF NEW.nomor_tiket IS NULL OR NEW.nomor_tiket = '' THEN
    v_seq := nextval('public.seq_tiket_pengaduan');
    v_period := TO_CHAR(NOW(), 'YYYYMM');
    NEW.nomor_tiket := 'PGD-' || v_period || '-' || LPAD(v_seq::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auto_tiket_pengaduan ON public.pengaduan_warga;
CREATE TRIGGER trg_auto_tiket_pengaduan
  BEFORE INSERT ON public.pengaduan_warga
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_auto_tiket_pengaduan();

-- ============================================================================
-- 20. ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pengaturan_desa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jenis_surat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permohonan_surat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.riwayat_status_surat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pejabat_desa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banner_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.berita_desa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.komentar_berita ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pengaduan_warga ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produk_hukum ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.galeri_kegiatan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.potensi_umkm ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transparansi_apbdes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.statistik_desa ENABLE ROW LEVEL SECURITY;

-- Helper Function Policy: Drop existing if recreate
DO $$ 
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Allow public read on %I" ON public.%I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "Allow all for authenticated on %I" ON public.%I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "Allow anon insert on %I" ON public.%I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "Allow anon update on %I" ON public.%I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "Allow full access for anon on %I" ON public.%I', t, t);
  END LOOP;
END $$;

-- Policy Publik: Boleh membaca seluruh data portal dan status surat
CREATE POLICY "Allow public read on profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow public read on pengaturan_desa" ON public.pengaturan_desa FOR SELECT USING (true);
CREATE POLICY "Allow public read on jenis_surat" ON public.jenis_surat FOR SELECT USING (true);
CREATE POLICY "Allow public read on permohonan_surat" ON public.permohonan_surat FOR SELECT USING (true);
CREATE POLICY "Allow public read on riwayat_status_surat" ON public.riwayat_status_surat FOR SELECT USING (true);
CREATE POLICY "Allow public read on pejabat_desa" ON public.pejabat_desa FOR SELECT USING (true);
CREATE POLICY "Allow public read on banner_slides" ON public.banner_slides FOR SELECT USING (true);
CREATE POLICY "Allow public read on berita_desa" ON public.berita_desa FOR SELECT USING (true);
CREATE POLICY "Allow public read on komentar_berita" ON public.komentar_berita FOR SELECT USING (true);
CREATE POLICY "Allow public read on pengaduan_warga" ON public.pengaduan_warga FOR SELECT USING (true);
CREATE POLICY "Allow public read on produk_hukum" ON public.produk_hukum FOR SELECT USING (true);
CREATE POLICY "Allow public read on galeri_kegiatan" ON public.galeri_kegiatan FOR SELECT USING (true);
CREATE POLICY "Allow public read on potensi_umkm" ON public.potensi_umkm FOR SELECT USING (true);
CREATE POLICY "Allow public read on transparansi_apbdes" ON public.transparansi_apbdes FOR SELECT USING (true);
CREATE POLICY "Allow public read on statistik_desa" ON public.statistik_desa FOR SELECT USING (true);

-- Policy Anon / Publik untuk Layanan Mandiri Warga:
-- Boleh mengajukan permohonan surat baru tanpa registrasi akun
CREATE POLICY "Allow anon insert on permohonan_surat" ON public.permohonan_surat FOR INSERT WITH CHECK (true);
-- Boleh menyampaikan pengaduan & aspirasi masyarakat
CREATE POLICY "Allow anon insert on pengaduan_warga" ON public.pengaduan_warga FOR INSERT WITH CHECK (true);
-- Boleh mengirimkan komentar warga pada artikel berita
CREATE POLICY "Allow anon insert on komentar_berita" ON public.komentar_berita FOR INSERT WITH CHECK (true);

-- Policy Pengelolaan Penuh (CRUD) untuk Staf & Pengelola Desa (Anon / Authenticated)
-- Memberikan hak akses penuh bagi antarmuka dasbor admin untuk memperbarui status dan konten
CREATE POLICY "Allow full access for anon on profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for anon on pengaturan_desa" ON public.pengaturan_desa FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for anon on jenis_surat" ON public.jenis_surat FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for anon on permohonan_surat" ON public.permohonan_surat FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for anon on riwayat_status_surat" ON public.riwayat_status_surat FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for anon on pejabat_desa" ON public.pejabat_desa FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for anon on banner_slides" ON public.banner_slides FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for anon on berita_desa" ON public.berita_desa FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for anon on komentar_berita" ON public.komentar_berita FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for anon on pengaduan_warga" ON public.pengaduan_warga FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for anon on produk_hukum" ON public.produk_hukum FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for anon on galeri_kegiatan" ON public.galeri_kegiatan FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for anon on potensi_umkm" ON public.potensi_umkm FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for anon on transparansi_apbdes" ON public.transparansi_apbdes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for anon on statistik_desa" ON public.statistik_desa FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- 21. STORAGE BUCKETS (ASET GAMBAR, SURAT & BERKAS PERSYARATAN)
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('public-media', 'public-media', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('dokumen-persyaratan', 'dokumen-persyaratan', true)
ON CONFLICT (id) DO NOTHING;

-- Policy Storage Objects
DROP POLICY IF EXISTS "Public media read all" ON storage.objects;
CREATE POLICY "Public media read all" ON storage.objects FOR SELECT USING (bucket_id IN ('public-media', 'dokumen-persyaratan'));

DROP POLICY IF EXISTS "Public media insert all" ON storage.objects;
CREATE POLICY "Public media insert all" ON storage.objects FOR INSERT WITH CHECK (bucket_id IN ('public-media', 'dokumen-persyaratan'));

DROP POLICY IF EXISTS "Public media update all" ON storage.objects;
CREATE POLICY "Public media update all" ON storage.objects FOR UPDATE USING (bucket_id IN ('public-media', 'dokumen-persyaratan'));

DROP POLICY IF EXISTS "Public media delete all" ON storage.objects;
CREATE POLICY "Public media delete all" ON storage.objects FOR DELETE USING (bucket_id IN ('public-media', 'dokumen-persyaratan'));

-- ============================================================================
-- 22. DATA SEED AWAL LENGKAP (MASTER DATA DESA NYURLEMBANG)
-- ============================================================================

-- A. SEED AKUN PENGGUNA (STAF DESA & KONTRIBUTOR)
INSERT INTO public.profiles (id, email, username, password, nama_lengkap, role, jabatan, avatar_url, status)
VALUES 
  ('usr-001', 'kades@nyurlembang.desa.id', 'kades', 'kades123', 'H. MUHAMMAD RIDWAN, S.Pd.I', 'staff_desa', 'Kepala Desa Nyurlembang', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&fit=crop&q=80', 'Aktif'),
  ('usr-002', 'admin@nyurlembang.desa.id', 'staff', 'admin123', 'Budi Santoso, S.AP', 'staff_desa', 'Kepala Seksi Pelayanan', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&fit=crop&q=80', 'Aktif'),
  ('usr-003', 'kontributor@nyurlembang.desa.id', 'kontributor', 'kontributor123', 'Ahmad Zaini, S.Kom', 'user_biasa', 'Kontributor Berita & Redaksi SID', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&fit=crop&q=80', 'Aktif')
ON CONFLICT (id) DO UPDATE SET
  nama_lengkap = EXCLUDED.nama_lengkap,
  role = EXCLUDED.role,
  jabatan = EXCLUDED.jabatan;

-- B. SEED PENGATURAN DESA & KOP SURAT
INSERT INTO public.pengaturan_desa (
  id, nama_desa, kecamatan, kabupaten, provinsi, 
  kop_baris1, kop_baris2, kop_baris3, format_nomor_surat, nomor_surat_mulai,
  pejabat_penandatangan_nama, pejabat_penandatangan_nipd, pejabat_penandatangan_jabatan
) VALUES (
  1, 'Nyurlembang', 'Narmada', 'Lombok Barat', 'Nusa Tenggara Barat',
  'PEMERINTAH KABUPATEN LOMBOK BARAT', 'KECAMATAN NARMADA', 'KANTOR KEPALA DESA NYURLEMBANG',
  '470/[REG]/Des-NL/[BULAN_ROMAWI]/[TAHUN]', 1,
  'H. MUHAMMAD RIDWAN, S.Pd.I', '19750812 200801 1 004', 'Kepala Desa Nyurlembang'
) ON CONFLICT (id) DO NOTHING;

-- C. SEED 6 JENIS SURAT LAYANAN MANDIRI
INSERT INTO public.jenis_surat (id, kode, nama, kategori, deskripsi, persyaratan, estimasi_hari, wajib_pas_foto, urutan)
VALUES
  ('surat-1', 'SKU', 'Surat Keterangan Usaha (SKU)', 'Usaha & Ekonomi', 'Surat keterangan resmi yang menyatakan bahwa pemohon benar-benar memiliki kegiatan usaha aktif di wilayah Desa Nyurlembang untuk keperluan pengajuan kredit perbankan, KUR, atau izin usaha.', '["KTP Elektronik (e-KTP) Asli", "Kartu Keluarga (KK) Asli", "Foto Tempat / Kegiatan Usaha", "Surat Pengantar dari Kepala Dusun setempat"]'::jsonb, 1, false, 1),
  ('surat-2', 'SKTM', 'Surat Keterangan Tidak Mampu (SKTM)', 'Sosial & Bantuan', 'Surat bukti bagi warga kurang mampu untuk keperluan beasiswa pendidikan, keringanan biaya rumah sakit (BPJS PBI), dan pengajuan bantuan sosial program pemerintah.', '["KTP Elektronik (e-KTP) Asli", "Kartu Keluarga (KK) Asli", "Surat Pengantar RT / Kepala Dusun", "Foto Rumah Tampak Depan", "Surat Pernyataan Penghasilan bermaterai"]'::jsonb, 1, false, 2),
  ('surat-3', 'SKCK', 'Surat Pengantar SKCK', 'Ketertiban & Kepolisian', 'Surat rekomendasi berkelakuan baik dari Pemerintah Desa sebagai syarat penerbitan Surat Keterangan Catatan Kepolisian (SKCK) di Polsek Narmada atau Polres Lombok Barat.', '["KTP Elektronik (e-KTP) Asli", "Kartu Keluarga (KK) Asli", "Akta Kelahiran / Ijazah Terakhir", "Pas Foto Berwarna Terbaru ukuran 4x6 (Latar Merah)"]'::jsonb, 1, true, 3),
  ('surat-4', 'DOMISILI', 'Surat Keterangan Domisili Warga / Lembaga', 'Kependudukan', 'Surat keterangan tempat tinggal resmi bagi warga perantau, pendatang, organisasi masyarakat, yayasan, atau badan usaha di Desa Nyurlembang.', '["KTP Elektronik (e-KTP) Asli", "Kartu Keluarga (KK) Asli", "Surat Pengantar Kepala Dusun", "Bukti Kepemilikan Rumah / Perjanjian Sewa"]'::jsonb, 1, false, 4),
  ('surat-5', 'SK_KEMATIAN', 'Surat Keterangan Kematian', 'Kependudukan', 'Surat keterangan resmi kematian warga untuk pengurusan santunan duka, akta kematian di Disdukcapil, klaim asuransi / Taspen, serta pembagian waris.', '["KTP Elektronik (e-KTP) Almarhum / Almarhumah", "Kartu Keluarga (KK) Asli", "Surat Keterangan Medis Dokter / Bidan Desa", "KTP Elektronik Pelapor / Ahli Waris"]'::jsonb, 1, false, 5),
  ('surat-6', 'SK_BELUM_NIKAH', 'Surat Keterangan Belum Menikah', 'Perkawinan & Hukum', 'Surat keterangan status lajang / belum pernah melangsungkan pernikahan untuk persyaratan pendaftaran calon pengantin ke KUA, melamar pekerjaan, atau TNI/Polri.', '["KTP Elektronik (e-KTP) Pemohon", "Kartu Keluarga (KK) Asli", "Surat Pengantar Kepala Dusun", "Surat Pernyataan Belum Pernah Menikah bermaterai Rp10.000", "Pas Foto 3x4 (2 Lembar)"]'::jsonb, 1, true, 6)
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  persyaratan = EXCLUDED.persyaratan;

-- D. SEED APARATUR PEMERINTAH DESA NYURLEMBANG
INSERT INTO public.pejabat_desa (id, nama, jabatan, nip, foto_url, telepon, tugas, urutan, status_aktif)
VALUES
  ('pj-1', 'H. MUHAMMAD RIDWAN, S.Pd.I', 'Kepala Desa', '19750812 200801 1 004', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&fit=crop&q=80', '0812-3456-7890', 'Memimpin penyelenggaraan pemerintahan, pembangunan, dan kemasyarakatan Desa Nyurlembang.', 1, true),
  ('pj-2', 'LALU AGUS SUPRIADI, S.Sos', 'Sekretaris Desa', '19820415 201001 1 012', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&fit=crop&q=80', '0813-4567-8901', 'Membantu Kepala Desa dalam mengkoordinasikan administrasi, keuangan, dan tata naskah dinas.', 2, true),
  ('pj-3', 'BAIQ NURUL HIDAYATI, S.E', 'Kaur Keuangan (Bendahara)', '19890920 201402 2 003', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&fit=crop&q=80', '0814-5678-9012', 'Mengelola penatausahaan keuangan, APBDes, dan pelaporan pertanggungjawaban kas desa.', 3, true),
  ('pj-4', 'M. ZAENUDDIN, S.T', 'Kasi Kesejahteraan & Pembangunan', '19850611 201201 1 008', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&fit=crop&q=80', '0815-6789-0123', 'Melaksanakan program pembangunan infrastruktur fisik, sanitasi, dan pemberdayaan masyarakat.', 4, true),
  ('pj-5', 'SITI AISYAH, S.Pd', 'Kasi Pelayanan Umum', '19920105 201801 2 005', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&fit=crop&q=80', '0816-7890-1234', 'Mengkoordinasikan pelayanan administrasi persuratan, kependudukan, dan bantuan sosial warga.', 5, true),
  ('pj-6', 'H. SUDIRMAN', 'Kepala Dusun Nyurlembang Lauq', '-', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&fit=crop&q=80', '0817-8901-2345', 'Membantu pelaksanaan tugas Kepala Desa di wilayah Dusun Nyurlembang Lauq.', 6, true)
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  jabatan = EXCLUDED.jabatan;

-- E. SEED PRODUK HUKUM & REGULASI DESA
INSERT INTO public.produk_hukum (id, judul, nomor, tahun, kategori, tanggal_penetapan, keterangan, file_url, nama_file, ukuran_file)
VALUES
  ('ph-1', 'Peraturan Desa Nyurlembang tentang Anggaran Pendapatan dan Belanja Desa (APBDes) Tahun Anggaran 2026', 'Nomor 04 Tahun 2025', 2025, 'Peraturan Desa (Perdes)', '2025-12-28', 'Menetapkan rincian pendapatan, belanja, dan pembiayaan pembangunan desa tahun anggaran 2026.', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'Perdes_04_2025_APBDes_2026.pdf', '1.4 MB'),
  ('ph-2', 'Maklumat Standar Pelayanan Publik dan Administrasi Persuratan Mandiri Desa Nyurlembang', 'Maklumat No. 01/MP/2026', 2026, 'Maklumat Pelayanan', '2026-01-05', 'Komitmen Pemdes Nyurlembang dalam memberikan layanan persuratan ramah, transparan, cepat, dan bebas pungli.', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'Maklumat_Pelayanan_2026.pdf', '420 KB'),
  ('ph-3', 'Keputusan Kepala Desa tentang Pembentukan Tim Percepatan Penurunan Stunting (TPPS) Terintegrasi', 'SK No. 12 Tahun 2026', 2026, 'Keputusan Kepala Desa', '2026-01-15', 'Penetapan susunan tim lintas sektor penanganan stunting dan gizi balita pada 4 dusun Desa Nyurlembang.', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'SK_TPPS_Stunting_2026.pdf', '890 KB')
ON CONFLICT (id) DO NOTHING;

-- F. SEED BERITA AWAL DESA
INSERT INTO public.berita_desa (id, judul, slug, ringkasan, konten, kategori, gambar_url, penulis, status, dilihat)
VALUES
  ('berita-1', 'Penyaluran BLT Dana Desa Tahap I Tahun 2026 untuk 65 KPM di Kantor Desa Nyurlembang', 'penyaluran-blt-dana-desa-tahap-1-2026', 'Pemerintah Desa Nyurlembang menyalurkan Bantuan Langsung Tunai (BLT) Dana Desa Triwulan I kepada 65 Keluarga Penerima Manfaat.', '<p>Penyaluran dipimpin langsung oleh Kepala Desa Nyurlembang bersama BPD dan Babinsa untuk memastikan bantuan tepat sasaran bagi keluarga lansia dan prasejahtera.</p>', 'Pemerintahan', 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&fit=crop&q=80', 'Redaksi SID Nyurlembang', 'published', 248),
  ('berita-2', 'Posyandu Terintegrasi dan Pencanangan Gerakan Cegah Stunting di Dusun Nyurlembang Lauq', 'posyandu-terintegrasi-cegah-stunting-2026', 'Kader Posyandu bersama Bidan Desa menggelar penimbangan serentak serta pemberian makanan tambahan (PMT) kaya protein bagi 54 balita.', '<p>Kegiatan rutin bulanan ini berhasil meningkatkan partisipasi ibu hamil dan balita hingga 96 persen di Posyandu Melati Dusun Nyurlembang Lauq.</p>', 'Kesehatan', 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800&fit=crop&q=80', 'Redaksi SID Nyurlembang', 'published', 185)
ON CONFLICT (id) DO NOTHING;

-- G. SEED BANNER SLIDES
INSERT INTO public.banner_slides (id, gambar_url, judul, subjudul, keterangan, aktif, urutan)
VALUES
  ('bn-1', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&fit=crop&q=80', 'Pelayanan Surat Mandiri Online 24 Jam', 'Pemerintah Desa Nyurlembang, Kecamatan Narmada, Kabupaten Lombok Barat', 'Urus berkas administrasi desa dari rumah dengan mudah, transparan, dan cepat', true, 1),
  ('bn-2', 'https://images.unsplash.com/photo-1533240332313-0db49b459ad6?w=1600&fit=crop&q=80', 'Mewujudkan Desa Nyurlembang Maju & Religius', 'Gotong Royong Membangun Infrastruktur & Kesejahteraan 4 Dusun', 'Transparansi APBDes dan akuntabilitas pelayanan untuk seluruh lapisan masyarakat', true, 2)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- AKHIR SKEMA BASIS DATA SUPABASE SID DESA NYURLEMBANG
-- ============================================================================
