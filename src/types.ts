export type UserRole = 'staff_desa' | 'user_biasa';

export type StatusPermohonan =
  | 'Diajukan'
  | 'Diverifikasi & Dicetak'
  | 'Menunggu TTD Kades'
  | 'Siap Diambil'
  | 'Selesai'
  | 'Ditolak';

export interface UserProfile {
  id: string;
  email: string;
  username?: string;
  password?: string;
  nama_lengkap: string;
  role: UserRole;
  jabatan?: string;
  avatar_url?: string;
  status?: 'Aktif' | 'Nonaktif';
  created_at: string;
}

export interface SyaratItem {
  id: string;
  nama: string;
  izinkan_kamera: boolean;
}

export interface JenisSurat {
  id: string;
  kode: string;
  nama: string;
  kategori: string;
  deskripsi: string;
  persyaratan: string[];
  persyaratan_items?: SyaratItem[];
  estimasi_hari: number;
  template_blanko_url?: string;
  nama_file_blanko?: string;
  wajib_pas_foto?: boolean;
}

export interface RiwayatStatus {
  id: string;
  permohonan_id: string;
  status: StatusPermohonan;
  catatan: string;
  diubah_oleh: string; // misal: 'Sistem' atau 'Staf Pelayanan (Budi)'
  created_at: string;
}

export interface PermohonanSurat {
  id: string;
  kode_tiket: string; // contoh: NYR-202609-0012
  nomor_surat_resmi?: string; // contoh: 470/128/Des-NL/IX/2026
  nik: string;
  nama_pemohon: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: 'Laki-laki' | 'Perempuan';
  pekerjaan: string;
  agama: string;
  dusun: string; // Dusun Nyurlembang Timur, Barat, Lauq, dll
  alamat_lengkap: string;
  nomor_whatsapp: string;
  jenis_surat_id: string;
  jenis_surat_nama: string;
  keperluan: string;
  data_tambahan: Record<string, any>; // JSONB (nama usaha, penghasilan, nama almarhum dsb)
  berkas_ktp_url?: string; // Supabase private bucket path
  berkas_kk_url?: string; // Supabase private bucket path
  berkas_pas_foto_url?: string; // Supabase private bucket path / Data URL
  berkas_pendukung_url?: string;
  status: StatusPermohonan;
  catatan_revisi?: string;
  catatan_petugas?: string;
  dibuat_pada: string;
  diverifikasi_pada?: string;
  siap_diambil_pada?: string;
  diselesaikan_pada?: string;
  riwayat: RiwayatStatus[];
}

export interface BeritaDesa {
  id: string;
  judul: string;
  slug: string;
  ringkasan: string;
  konten: string;
  kategori: string;
  gambar_url: string;
  penulis: string;
  published_at: string;
  status: 'published' | 'draft';
}

export interface PotensiUmkm {
  id: string;
  nama_usaha: string;
  pemilik: string;
  kategori: 'Kuliner' | 'Agribisnis' | 'Kerajinan' | 'Jasa';
  dusun: string;
  deskripsi: string;
  harga_rentang: string;
  kontak_wa: string;
  foto_url: string;
}

export interface TransparansiApbdes {
  tahun: number;
  pendapatan: number;
  belanja: number;
  pembiayaan: number;
  rincian_belanja: {
    bidang: string;
    anggaran: number;
    persen: number;
  }[];
}

export interface PejabatDesa {
  id: string;
  nama: string;
  jabatan: string;
  nip?: string;
  foto_url: string;
  telepon?: string;
  tugas?: string;
  urutan: number;
}

export interface BannerSlide {
  id: string;
  gambar_url: string;
  judul: string;
  subjudul: string;
  keterangan?: string;
  aktif: boolean;
  urutan: number;
}

export interface PengaturanDesa {
  nama_desa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  telepon_kppid: string;
  email_desa: string;
  alamat_kantor: string;
  kode_pos: string;
  jam_pelayanan: string;
  sambutan_kades_nama: string;
  sambutan_kades_teks: string;
  sambutan_kades_foto: string;
  sosial_media: {
    youtube: string;
    instagram: string;
    tiktok: string;
    facebook: string;
  };
  google_maps_embed: string;
  // Pengaturan Kop Surat & Naskah Dinas Resmi
  kop_logo_url?: string;
  kop_logo_kiri_url?: string;
  kop_logo_kanan_url?: string;
  nomor_surat_mulai?: number;
  kop_baris1?: string;
  kop_baris2?: string;
  kop_baris3?: string;
  format_nomor_surat?: string;
  pejabat_penandatangan_nama?: string;
  pejabat_penandatangan_nipd?: string;
  pejabat_penandatangan_jabatan?: string;
}

export interface GaleriKegiatan {
  id: string;
  nama_kegiatan: string;
  tanggal: string; // YYYY-MM-DD
  lokasi: string; // Dusun / Tempat
  kategori: string; // Gotong Royong, Pelatihan, Penyaluran Bantuan, Kesehatan, dll
  deskripsi: string;
  foto_url: string;
}

export interface ProgramIntervensi {
  id: string;
  nama_program: string;
  kategori: string;
  target_sasaran: string; // misal: "45 Balita & Ibu Hamil Kurang Gizi"
  anggaran: number;
  realisasi: number; // Persentase (misal: 85) atau nominal
  status: 'Berjalan' | 'Terealisasi' | 'Direncanakan';
  keterangan: string;
  dusun_fokus: string;
}

export interface KelompokUsia {
  kategori: string;
  rentang: string;
  jumlah: number;
  persen: number;
}

export interface StatistikPendidikan {
  tingkat: string;
  jumlah: number;
  persen: number;
}

export interface StatistikPekerjaan {
  jenis: string;
  jumlah: number;
  persen: number;
}

export interface DetailDusunStatistik {
  nama: string;
  jumlah_kk: number;
  jumlah_jiwa: number;
  jumlah_rt: number;
  jumlah_rw: number;
  kepala_dusun: string;
}

export interface StatistikDesa {
  total_penduduk: number;
  penduduk_laki: number;
  penduduk_perempuan: number;
  jumlah_kk: number;
  jumlah_dusun: number;
  jumlah_rt: number;
  jumlah_rw: number;
  luas_wilayah_ha: number;
  kelompok_usia: KelompokUsia[];
  pendidikan: StatistikPendidikan[];
  pekerjaan: StatistikPekerjaan[];
  dusun_detail: DetailDusunStatistik[];
  intervensi: ProgramIntervensi[];
}

export type KategoriProdukHukum =
  | 'Peraturan Desa (Perdes)'
  | 'Peraturan Kepala Desa (Perkades)'
  | 'Keputusan Kepala Desa'
  | 'Maklumat Pelayanan'
  | 'Surat Edaran Desa';

export interface ProdukHukumDesa {
  id: string;
  judul: string;
  nomor: string;
  tahun: number;
  kategori: KategoriProdukHukum;
  tanggal_penetapan: string;
  keterangan?: string;
  file_url?: string;
  nama_file?: string;
  ukuran_file?: string;
  created_at: string;
}

export interface KomentarBerita {
  id: string;
  berita_id: string;
  berita_judul?: string;
  nama: string;
  dusun: string;
  pesan: string;
  created_at: string;
  status: 'menunggu_moderasi' | 'disetujui';
}

export interface PengaduanWargaItem {
  id: string;
  nomor_tiket: string;
  nama: string;
  nik: string;
  telepon: string;
  dusun: string;
  kategori: string;
  judul: string;
  isi_laporan: string;
  foto_url?: string;
  rahasia?: boolean;
  tanggal: string;
  status: 'Menunggu Tanggapan' | 'Sedang Diproses' | 'Selesai';
  tanggapan_petugas?: string;
  ditanggapi_oleh?: string;
  ditanggapi_pada?: string;
}


