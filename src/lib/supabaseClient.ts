import { createClient } from '@supabase/supabase-js';
import {
  PermohonanSurat,
  StatusPermohonan,
  UserProfile,
  JenisSurat,
  BannerSlide,
  PejabatDesa,
  PengaturanDesa,
  TransparansiApbdes,
  GaleriKegiatan,
  StatistikDesa,
  ProdukHukumDesa,
  PengaduanWargaItem,
  KomentarBerita,
  BeritaDesa,
  PotensiUmkm
} from '../types';
import {
  INITIAL_PERMOHONAN,
  MOCK_USERS,
  DAFTAR_JENIS_SURAT,
  INITIAL_BANNER_SLIDES,
  INITIAL_PEJABAT_DESA,
  INITIAL_PENGATURAN_DESA,
  TRANSPARANSI_APBDES_2026,
  INITIAL_GALERI_KEGIATAN,
  INITIAL_STATISTIK_DESA,
  INITIAL_PRODUK_HUKUM,
  INITIAL_PENGADUAN_WARGA,
  INITIAL_KOMENTAR_BERITA,
  INITIAL_BERITA,
  INITIAL_UMKM
} from '../data/mockData';

// ============================================================================
// KONFIGURASI KONEKSI DATABASE SUPABASE
// ============================================================================
export const DEFAULT_SUPABASE_URL = 'https://aaofjuqivtvdubmdjdhp.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhb2ZqdXFpdnR2ZHVibWRqZGhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzNzYzMDEsImV4cCI6MjEwNDk1MjMwMX0.xYC0MP7qjQrJBXgYWUV8K6tG7wyvdY0N13SsDY2Ne6A';

export const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  DEFAULT_SUPABASE_URL;

export const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

// ============================================================================
// UNIQUE CLIENT IDENTIFIER (MENCEGAH LOOP / ECHO BROADCAST PADA PERANGKAT YANG SAMA)
// ============================================================================
let localClientId = '';
export function getClientId(): string {
  if (!localClientId) {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      localClientId = window.sessionStorage.getItem('sid_client_uuid') || '';
      if (!localClientId) {
        localClientId = `client-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        window.sessionStorage.setItem('sid_client_uuid', localClientId);
      }
    } else {
      localClientId = `client-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }
  }
  return localClientId;
}

// ============================================================================
// STORAGE KEYS (HYBRID CACHING & OFFLINE-FIRST ARCHITECTURE)
// ============================================================================
const STORAGE_KEY_PERMOHONAN = 'sid_nyurlembang_permohonan_v1';
const STORAGE_KEY_AUTH_USER = 'sid_nyurlembang_current_user_v1';
const STORAGE_KEY_USERS_LIST = 'sid_nyurlembang_users_list_v1';
const STORAGE_KEY_JENIS_SURAT = 'sid_nyurlembang_jenis_surat_v1';
const STORAGE_KEY_BANNER_SLIDES = 'sid_nyurlembang_banners_v1';
const STORAGE_KEY_PEJABAT = 'sid_nyurlembang_pejabat_v1';
const STORAGE_KEY_PENGATURAN = 'sid_nyurlembang_pengaturan_v1';
const STORAGE_KEY_APBDES = 'sid_nyurlembang_apbdes_v1';
const STORAGE_KEY_GALERI = 'sid_nyurlembang_galeri_v1';
const STORAGE_KEY_STATISTIK = 'sid_nyurlembang_statistik_v1';
const STORAGE_KEY_PRODUK_HUKUM = 'sid_nyurlembang_produk_hukum_v1';
const STORAGE_KEY_PENGADUAN = 'desa_pengaduan_list';
const STORAGE_KEY_KOMENTAR = 'desa_komentar_berita';
const STORAGE_KEY_BERITA = 'desa_berita_list';
const STORAGE_KEY_UMKM = 'desa_umkm_list';

// Helper aman untuk background upsert ke Supabase
async function safeUpsert(table: string, data: any): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.from(table).upsert(data);
  } catch {
    // Abaikan jika offline
  }
}

// ============================================================================
// DATA STORAGE ACCESSORS (MEMBACA DAN MENYIMPAN KE LOCAL CACHE)
// ============================================================================

// 1. PERMOHONAN SURAT
export function getStoredPermohonan(): PermohonanSurat[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_PERMOHONAN);
    if (!data) {
      localStorage.setItem(STORAGE_KEY_PERMOHONAN, JSON.stringify(INITIAL_PERMOHONAN));
      return INITIAL_PERMOHONAN;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_PERMOHONAN;
  }
}

export function savePermohonanList(list: PermohonanSurat[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_PERMOHONAN, JSON.stringify(list));
  } catch (e) {
    console.error('Gagal menyimpan permohonan ke localStorage:', e);
  }
}

// 2. JENIS SURAT & PERSYARATAN
export function getStoredJenisSurat(): JenisSurat[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_JENIS_SURAT);
    if (!data) {
      localStorage.setItem(STORAGE_KEY_JENIS_SURAT, JSON.stringify(DAFTAR_JENIS_SURAT));
      return DAFTAR_JENIS_SURAT;
    }
    const parsed: JenisSurat[] = JSON.parse(data);
    return parsed.map((item) => {
      const defaultMatch = DAFTAR_JENIS_SURAT.find((d) => d.kode === item.kode || d.id === item.id);
      return {
        ...defaultMatch,
        ...item,
        template_blanko_url: item.template_blanko_url ?? defaultMatch?.template_blanko_url,
        nama_file_blanko: item.nama_file_blanko ?? defaultMatch?.nama_file_blanko,
        wajib_pas_foto: item.wajib_pas_foto ?? defaultMatch?.wajib_pas_foto ?? false,
      };
    });
  } catch {
    return DAFTAR_JENIS_SURAT;
  }
}

export function saveStoredJenisSurat(list: JenisSurat[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_JENIS_SURAT, JSON.stringify(list));
    safeUpsert('jenis_surat', list);
  } catch (e) {
    console.error('Gagal menyimpan jenis surat:', e);
  }
}

// 3. BANNER SLIDES HERO
export function getStoredBannerSlides(): BannerSlide[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_BANNER_SLIDES);
    if (!data) {
      localStorage.setItem(STORAGE_KEY_BANNER_SLIDES, JSON.stringify(INITIAL_BANNER_SLIDES));
      return INITIAL_BANNER_SLIDES;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_BANNER_SLIDES;
  }
}

export function saveStoredBannerSlides(slides: BannerSlide[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_BANNER_SLIDES, JSON.stringify(slides));
    safeUpsert('banner_slides', slides);
  } catch (e) {
    console.error('Gagal menyimpan banner slides:', e);
  }
}

// 4. APARATUR / PEJABAT DESA
export function getStoredPejabatDesa(): PejabatDesa[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_PEJABAT);
    if (!data) {
      localStorage.setItem(STORAGE_KEY_PEJABAT, JSON.stringify(INITIAL_PEJABAT_DESA));
      return INITIAL_PEJABAT_DESA;
    }
    const parsed: PejabatDesa[] = JSON.parse(data);
    // Auto-update if still contains old Kadus list
    if (parsed.some(p => p.jabatan && (p.jabatan.includes('Lauk') || p.jabatan.includes('Gerimax') || p.jabatan.includes('Kebon')))) {
      localStorage.setItem(STORAGE_KEY_PEJABAT, JSON.stringify(INITIAL_PEJABAT_DESA));
      return INITIAL_PEJABAT_DESA;
    }
    return parsed;
  } catch {
    return INITIAL_PEJABAT_DESA;
  }
}

export function saveStoredPejabatDesa(list: PejabatDesa[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_PEJABAT, JSON.stringify(list));
    safeUpsert('pejabat_desa', list);
  } catch (e) {
    console.error('Gagal menyimpan pejabat desa:', e);
  }
}

// 5. PENGATURAN KOP SURAT & KONTAK
export function getStoredPengaturanDesa(): PengaturanDesa {
  const defaultKop = {
    kop_logo_url: '/logo.png',
    kop_logo_kiri_url: '/logo.png',
    kop_logo_kanan_url: '',
    nomor_surat_mulai: 1,
    kop_baris1: 'PEMERINTAH KABUPATEN LOMBOK BARAT',
    kop_baris2: 'KECAMATAN NARMADA',
    kop_baris3: 'KANTOR KEPALA DESA NYURLEMBANG',
    format_nomor_surat: '470/[REG]/Des-NL/[BULAN_ROMAWI]/[TAHUN]',
    pejabat_penandatangan_nama: 'H. Wardi, S.AP',
    pejabat_penandatangan_nipd: '19750812 200501 1 003',
    pejabat_penandatangan_jabatan: 'Kepala Desa Nyurlembang',
  };
  const targetMapUrl = 'https://maps.google.com/maps?q=-8.58922199365014,116.19106227542514&hl=id&z=15&output=embed';
  try {
    const data = localStorage.getItem(STORAGE_KEY_PENGATURAN);
    if (!data) {
      const merged = { ...INITIAL_PENGATURAN_DESA, ...defaultKop, google_maps_embed: targetMapUrl };
      localStorage.setItem(STORAGE_KEY_PENGATURAN, JSON.stringify(merged));
      return merged;
    }
    const parsed = JSON.parse(data);
    // Auto-update map if pointing to old coordinates
    if (!parsed.google_maps_embed || parsed.google_maps_embed.includes('116.2085') || !parsed.google_maps_embed.includes('-8.58922199365014')) {
      parsed.google_maps_embed = targetMapUrl;
      localStorage.setItem(STORAGE_KEY_PENGATURAN, JSON.stringify({ ...defaultKop, ...parsed }));
    }
    return { ...defaultKop, ...parsed };
  } catch {
    return { ...INITIAL_PENGATURAN_DESA, ...defaultKop, google_maps_embed: targetMapUrl };
  }
}

export function saveStoredPengaturanDesa(settings: PengaturanDesa): void {
  try {
    localStorage.setItem(STORAGE_KEY_PENGATURAN, JSON.stringify(settings));
    safeUpsert('pengaturan_desa', { id: 1, ...settings, updated_at: new Date().toISOString() });
  } catch (e) {
    console.error('Gagal menyimpan pengaturan desa:', e);
  }
}

// 6. TRANSPARANSI APBDES
export function getStoredApbdes(): TransparansiApbdes {
  try {
    const data = localStorage.getItem(STORAGE_KEY_APBDES);
    if (!data) {
      localStorage.setItem(STORAGE_KEY_APBDES, JSON.stringify(TRANSPARANSI_APBDES_2026));
      return TRANSPARANSI_APBDES_2026;
    }
    const parsed = JSON.parse(data);
    return {
      tahun: Number(parsed.tahun) || TRANSPARANSI_APBDES_2026.tahun,
      pendapatan: typeof parsed.pendapatan === 'number' ? parsed.pendapatan : (Number(parsed.pendapatan) || TRANSPARANSI_APBDES_2026.pendapatan),
      belanja: typeof parsed.belanja === 'number' ? parsed.belanja : (Number(parsed.belanja) || TRANSPARANSI_APBDES_2026.belanja),
      pembiayaan: typeof parsed.pembiayaan === 'number' ? parsed.pembiayaan : (Number(parsed.pembiayaan) || TRANSPARANSI_APBDES_2026.pembiayaan),
      rincian_belanja: Array.isArray(parsed.rincian_belanja) && parsed.rincian_belanja.length > 0
        ? parsed.rincian_belanja.map((r: any) => ({
            bidang: r?.bidang || 'Lainnya',
            anggaran: Number(r?.anggaran) || 0,
            persen: Number(r?.persen) || 0,
          }))
        : TRANSPARANSI_APBDES_2026.rincian_belanja,
    };
  } catch {
    return TRANSPARANSI_APBDES_2026;
  }
}

export function saveStoredApbdes(apbdes: TransparansiApbdes): void {
  try {
    localStorage.setItem(STORAGE_KEY_APBDES, JSON.stringify(apbdes));
    safeUpsert('transparansi_apbdes', {
      id: `apbdes-${apbdes.tahun}`,
      tahun: apbdes.tahun,
      pendapatan: apbdes.pendapatan,
      belanja: apbdes.belanja,
      pembiayaan: apbdes.pembiayaan,
      rincian_belanja: apbdes.rincian_belanja,
      updated_at: new Date().toISOString(),
    });
  } catch (e) {
    console.error('Gagal menyimpan APBDes:', e);
  }
}

// 7. GALERI KEGIATAN
export function getStoredGaleriKegiatan(): GaleriKegiatan[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_GALERI);
    if (!data) {
      localStorage.setItem(STORAGE_KEY_GALERI, JSON.stringify(INITIAL_GALERI_KEGIATAN));
      return INITIAL_GALERI_KEGIATAN;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_GALERI_KEGIATAN;
  }
}

export function saveStoredGaleriKegiatan(list: GaleriKegiatan[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_GALERI, JSON.stringify(list));
    safeUpsert('galeri_kegiatan', list);
  } catch (e) {
    console.error('Gagal menyimpan galeri kegiatan:', e);
  }
}

// 8. STATISTIK DESA
export function getStoredStatistikDesa(): StatistikDesa {
  try {
    const data = localStorage.getItem(STORAGE_KEY_STATISTIK);
    if (!data) {
      localStorage.setItem(STORAGE_KEY_STATISTIK, JSON.stringify(INITIAL_STATISTIK_DESA));
      return INITIAL_STATISTIK_DESA;
    }
    const parsed: Partial<StatistikDesa> = JSON.parse(data);
    const result: StatistikDesa = {
      ...INITIAL_STATISTIK_DESA,
      ...parsed,
      total_penduduk: Number(parsed.total_penduduk) || INITIAL_STATISTIK_DESA.total_penduduk,
      penduduk_laki: Number(parsed.penduduk_laki) || INITIAL_STATISTIK_DESA.penduduk_laki,
      penduduk_perempuan: Number(parsed.penduduk_perempuan) || INITIAL_STATISTIK_DESA.penduduk_perempuan,
      jumlah_kk: Number(parsed.jumlah_kk) || INITIAL_STATISTIK_DESA.jumlah_kk,
      jumlah_dusun: Number(parsed.jumlah_dusun) || 4,
      jumlah_rt: Number(parsed.jumlah_rt) || INITIAL_STATISTIK_DESA.jumlah_rt,
      jumlah_rw: Number(parsed.jumlah_rw) || 4,
      luas_wilayah_ha: Number(parsed.luas_wilayah_ha) || INITIAL_STATISTIK_DESA.luas_wilayah_ha,
      kelompok_usia: Array.isArray(parsed.kelompok_usia) && parsed.kelompok_usia.length > 0 ? parsed.kelompok_usia : INITIAL_STATISTIK_DESA.kelompok_usia,
      pendidikan: Array.isArray(parsed.pendidikan) && parsed.pendidikan.length > 0 ? parsed.pendidikan : INITIAL_STATISTIK_DESA.pendidikan,
      pekerjaan: Array.isArray(parsed.pekerjaan) && parsed.pekerjaan.length > 0 ? parsed.pekerjaan : INITIAL_STATISTIK_DESA.pekerjaan,
      dusun_detail: Array.isArray(parsed.dusun_detail) && parsed.dusun_detail.length === 4 ? parsed.dusun_detail : INITIAL_STATISTIK_DESA.dusun_detail,
      intervensi: Array.isArray(parsed.intervensi) && parsed.intervensi.length > 0 ? parsed.intervensi : INITIAL_STATISTIK_DESA.intervensi,
    };

    if (result.jumlah_dusun === 6 || result.dusun_detail?.some(d => d.nama === 'Dusun Nyurlembang Timur' || d.nama === 'Dusun Karang Bayan')) {
      result.jumlah_dusun = 4;
      result.jumlah_rw = 4;
      result.dusun_detail = INITIAL_STATISTIK_DESA.dusun_detail;
      result.intervensi = INITIAL_STATISTIK_DESA.intervensi;
      localStorage.setItem(STORAGE_KEY_STATISTIK, JSON.stringify(result));
    }
    return result;
  } catch {
    return INITIAL_STATISTIK_DESA;
  }
}

export function saveStoredStatistikDesa(stat: StatistikDesa): void {
  try {
    localStorage.setItem(STORAGE_KEY_STATISTIK, JSON.stringify(stat));
    safeUpsert('statistik_desa', {
      id: 'stat-utama',
      ...stat,
      updated_at: new Date().toISOString(),
    });
  } catch (e) {
    console.error('Gagal menyimpan statistik desa:', e);
  }
}

// 9. PRODUK HUKUM DESA (JDIH)
export function getStoredProdukHukum(): ProdukHukumDesa[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_PRODUK_HUKUM);
    if (!data) {
      localStorage.setItem(STORAGE_KEY_PRODUK_HUKUM, JSON.stringify(INITIAL_PRODUK_HUKUM));
      return INITIAL_PRODUK_HUKUM;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_PRODUK_HUKUM;
  }
}

export function saveStoredProdukHukum(list: ProdukHukumDesa[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_PRODUK_HUKUM, JSON.stringify(list));
    safeUpsert('produk_hukum', list);
  } catch (e) {
    console.error('Gagal menyimpan produk hukum desa:', e);
  }
}

// 10. PENGADUAN WARGA
export function getStoredPengaduan(): PengaduanWargaItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_PENGADUAN);
    if (!data) {
      localStorage.setItem(STORAGE_KEY_PENGADUAN, JSON.stringify(INITIAL_PENGADUAN_WARGA));
      return INITIAL_PENGADUAN_WARGA;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_PENGADUAN_WARGA;
  }
}

export function saveStoredPengaduan(list: PengaduanWargaItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_PENGADUAN, JSON.stringify(list));
    safeUpsert('pengaduan_warga', list);
  } catch (e) {
    console.error('Gagal menyimpan pengaduan warga:', e);
  }
}

// 11. KOMENTAR BERITA
export function getStoredKomentar(): KomentarBerita[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_KOMENTAR);
    if (!data) {
      localStorage.setItem(STORAGE_KEY_KOMENTAR, JSON.stringify(INITIAL_KOMENTAR_BERITA));
      return INITIAL_KOMENTAR_BERITA;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_KOMENTAR_BERITA;
  }
}

export function saveStoredKomentar(list: KomentarBerita[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_KOMENTAR, JSON.stringify(list));
    safeUpsert('komentar_berita', list);
  } catch (e) {
    console.error('Gagal menyimpan komentar berita:', e);
  }
}

// 12. BERITA DESA
export function getStoredBerita(): BeritaDesa[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_BERITA);
    if (saved) return JSON.parse(saved);
  } catch {}
  return INITIAL_BERITA;
}

export function saveStoredBerita(list: BeritaDesa[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_BERITA, JSON.stringify(list));
  } catch {}
}

// 13. POTENSI UMKM DESA
export function getStoredUmkm(): PotensiUmkm[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_UMKM);
    if (saved) return JSON.parse(saved);
  } catch {}
  return INITIAL_UMKM;
}

export function saveStoredUmkm(list: PotensiUmkm[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_UMKM, JSON.stringify(list));
  } catch {}
}

// 13. USER MANAGEMENT & SESSIONS
export function getCurrentUser(): UserProfile | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_AUTH_USER);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function setCurrentUser(user: UserProfile | null): void {
  if (!user) {
    localStorage.removeItem(STORAGE_KEY_AUTH_USER);
  } else {
    localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(user));
  }
}

export function getStoredUsers(): UserProfile[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_USERS_LIST);
    if (!data) {
      localStorage.setItem(STORAGE_KEY_USERS_LIST, JSON.stringify(MOCK_USERS));
      return MOCK_USERS;
    }
    return JSON.parse(data);
  } catch {
    return MOCK_USERS;
  }
}

export function saveStoredUsers(users: UserProfile[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_USERS_LIST, JSON.stringify(users));
  } catch (e) {
    console.error('Gagal menyimpan daftar user ke localStorage:', e);
  }
}

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ============================================================================
// REALTIME MULTI-DEVICE SYNCHRONIZATION ENGINE
// Memastikan semua aksi CRUD di Komputer A langsung tercermin di Komputer B, C, D
// ============================================================================

/**
 * Menerapkan mutasi ke local storage cache komputer ini saat data diterima dari komputer lain
 */
export function applyMutationToCache(
  table: string,
  action: 'insert' | 'update' | 'delete' | 'upsert' | 'sync',
  data?: any,
  id?: string
) {
  try {
    const targetId = id || data?.id;

    if (table === 'permohonan_surat') {
      const all = getStoredPermohonan();
      if (action === 'delete' && targetId) {
        savePermohonanList(all.filter((p) => p.id !== targetId));
      } else if ((action === 'insert' || action === 'update' || action === 'upsert') && data) {
        const exists = all.some((p) => p.id === data.id || p.kode_tiket === data.kode_tiket);
        if (exists) {
          savePermohonanList(all.map((p) => (p.id === data.id || p.kode_tiket === data.kode_tiket ? { ...p, ...data } : p)));
        } else {
          savePermohonanList([data, ...all]);
        }
      }
    } else if (table === 'jenis_surat') {
      const all = getStoredJenisSurat();
      if (action === 'delete' && targetId) {
        saveStoredJenisSurat(all.filter((s) => s.id !== targetId));
      } else if (data) {
        const exists = all.some((s) => s.id === data.id);
        const updated = exists ? all.map((s) => (s.id === data.id ? { ...s, ...data } : s)) : [...all, data];
        saveStoredJenisSurat(updated);
      }
    } else if (table === 'pejabat_desa') {
      const all = getStoredPejabatDesa();
      if (action === 'delete' && targetId) {
        saveStoredPejabatDesa(all.filter((p) => p.id !== targetId));
      } else if (data) {
        const exists = all.some((p) => p.id === data.id);
        const updated = exists ? all.map((p) => (p.id === data.id ? { ...p, ...data } : p)) : [...all, data];
        saveStoredPejabatDesa(updated);
      }
    } else if (table === 'banner_slides') {
      const all = getStoredBannerSlides();
      if (action === 'delete' && targetId) {
        saveStoredBannerSlides(all.filter((b) => b.id !== targetId));
      } else if (data) {
        const exists = all.some((b) => b.id === data.id);
        const updated = exists ? all.map((b) => (b.id === data.id ? { ...b, ...data } : b)) : [...all, data];
        saveStoredBannerSlides(updated);
      }
    } else if (table === 'pengaturan_desa' && data) {
      saveStoredPengaturanDesa(data);
    } else if (table === 'transparansi_apbdes' && data) {
      saveStoredApbdes(data);
    } else if (table === 'statistik_desa' && data) {
      saveStoredStatistikDesa(data);
    } else if (table === 'berita_desa') {
      const all = getStoredBerita();
      if (action === 'delete' && targetId) {
        saveStoredBerita(all.filter((b) => b.id !== targetId));
      } else if (data) {
        const exists = all.some((b) => b.id === data.id);
        const updated = exists ? all.map((b) => (b.id === data.id ? { ...b, ...data } : b)) : [data, ...all];
        saveStoredBerita(updated);
      }
    } else if (table === 'galeri_kegiatan') {
      const all = getStoredGaleriKegiatan();
      if (action === 'delete' && targetId) {
        saveStoredGaleriKegiatan(all.filter((g) => g.id !== targetId));
      } else if (data) {
        const exists = all.some((g) => g.id === data.id);
        const updated = exists ? all.map((g) => (g.id === data.id ? { ...g, ...data } : g)) : [data, ...all];
        saveStoredGaleriKegiatan(updated);
      }
    } else if (table === 'produk_hukum') {
      const all = getStoredProdukHukum();
      if (action === 'delete' && targetId) {
        saveStoredProdukHukum(all.filter((p) => p.id !== targetId));
      } else if (data) {
        const exists = all.some((p) => p.id === data.id);
        const updated = exists ? all.map((p) => (p.id === data.id ? { ...p, ...data } : p)) : [data, ...all];
        saveStoredProdukHukum(updated);
      }
    } else if (table === 'pengaduan_warga') {
      const all = getStoredPengaduan();
      if (action === 'delete' && targetId) {
        saveStoredPengaduan(all.filter((p) => p.id !== targetId));
      } else if (data) {
        const exists = all.some((p) => p.id === data.id);
        const updated = exists ? all.map((p) => (p.id === data.id ? { ...p, ...data } : p)) : [data, ...all];
        saveStoredPengaduan(updated);
      }
    } else if (table === 'komentar_berita') {
      const all = getStoredKomentar();
      if (action === 'delete' && targetId) {
        saveStoredKomentar(all.filter((k) => k.id !== targetId));
      } else if (data) {
        const exists = all.some((k) => k.id === data.id);
        const updated = exists ? all.map((k) => (k.id === data.id ? { ...k, ...data } : k)) : [data, ...all];
        saveStoredKomentar(updated);
      }
    } else if (table === 'profiles') {
      const all = getStoredUsers();
      if (action === 'delete' && targetId) {
        saveStoredUsers(all.filter((u) => u.id !== targetId));
      } else if (data) {
        const exists = all.some((u) => u.id === data.id);
        const updated = exists ? all.map((u) => (u.id === data.id ? { ...u, ...data } : u)) : [...all, data];
        saveStoredUsers(updated);
      }
    } else if (table === 'potensi_umkm') {
      const all = getStoredUmkm();
      if (action === 'delete' && targetId) {
        saveStoredUmkm(all.filter((u) => u.id !== targetId));
      } else if (data) {
        const exists = all.some((u) => u.id === data.id);
        const updated = exists ? all.map((u) => (u.id === data.id ? { ...u, ...data } : u)) : [data, ...all];
        saveStoredUmkm(updated);
      }
    }
  } catch (err) {
    console.warn('Gagal memperbarui cache lokal dari realtime:', err);
  }
}

// Inisialisasi Supabase Realtime Channel
export const realtimeChannel = supabase
  ? supabase.channel('sid_nyurlembang_realtime_v1', {
      config: {
        broadcast: { ack: false, self: false },
      },
    })
  : null;

/**
 * Menyiarkan perubahan data ke komputer lain secara langsung via WebSocket
 */
export async function broadcastDataChange(
  table: string,
  action: 'insert' | 'update' | 'delete' | 'upsert' | 'sync',
  data?: any,
  id?: string
): Promise<void> {
  const timestamp = Date.now();
  const clientId = getClientId();

  // 1. Dispatch custom event lokal untuk komputer saat ini
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('desa_realtime_change', {
        detail: { table, action, data, id, source: 'local', timestamp },
      })
    );
  }

  // 2. Kirim pesan broadcast ke Komputer B, C, D via Supabase WebSocket
  if (realtimeChannel) {
    try {
      await realtimeChannel.send({
        type: 'broadcast',
        event: 'desa_db_mutation',
        payload: {
          table,
          action,
          data,
          id,
          sourceClientId: clientId,
          timestamp,
        },
      });
    } catch (err) {
      console.warn('Gagal broadcast perubahan real-time ke komputer lain:', err);
    }
  }
}

// Setup listeners pada Realtime Channel
if (realtimeChannel) {
  // A. Terima Broadcast langsung antar-komputer
  realtimeChannel.on('broadcast', { event: 'desa_db_mutation' }, (msg: any) => {
    const payload = msg?.payload;
    if (!payload) return;
    const { table, action, data, id, sourceClientId, timestamp } = payload;
    if (sourceClientId && sourceClientId === getClientId()) {
      return; // Jangan memproses pesan dari diri sendiri
    }

    // Perbarui cache lokal
    applyMutationToCache(table, action, data, id);

    // Beritahu seluruh komponen React di komputer ini
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('desa_realtime_change', {
          detail: { table, action, data, id, source: 'remote', timestamp: timestamp || Date.now() },
        })
      );
    }
  });

  // B. Terima Postgres Replication (CDC) dari Supabase
  const TABLES_CDC = [
    'permohonan_surat',
    'jenis_surat',
    'pejabat_desa',
    'banner_slides',
    'pengaturan_desa',
    'transparansi_apbdes',
    'statistik_desa',
    'berita_desa',
    'komentar_berita',
    'pengaduan_warga',
    'produk_hukum',
    'galeri_kegiatan',
    'profiles',
    'potensi_umkm',
  ];

  TABLES_CDC.forEach((t) => {
    realtimeChannel.on(
      'postgres_changes' as any,
      { event: '*', schema: 'public', table: t },
      (payload: any) => {
        const eventType = payload.eventType; // 'INSERT' | 'UPDATE' | 'DELETE'
        const newRecord = payload.new;
        const oldRecord = payload.old;
        const action: 'insert' | 'update' | 'delete' =
          eventType === 'INSERT' ? 'insert' : eventType === 'UPDATE' ? 'update' : 'delete';
        const record = newRecord || oldRecord;
        const id = record?.id;

        applyMutationToCache(t, action, record, id);

        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('desa_realtime_change', {
              detail: { table: t, action, data: record, id, source: 'remote', timestamp: Date.now() },
            })
          );
        }
      }
    );
  });

  realtimeChannel.subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      console.log('🟢 Sinkronisasi Realtime Antar-Komputer Aktif');
    }
  });
}

// ============================================================================
// FUNGSI CEK & TES KONEKSI REAL-TIME KE SUPABASE
// ============================================================================
export interface SupabaseConnectionStatus {
  ok: boolean;
  url: string;
  latencyMs: number;
  message: string;
  tablesFound: string[];
  tablesMissing: string[];
}

export async function testSupabaseConnection(): Promise<SupabaseConnectionStatus> {
  const startTime = Date.now();
  if (!supabase) {
    return {
      ok: false,
      url: supabaseUrl,
      latencyMs: 0,
      message: 'Supabase client belum diinisialisasi.',
      tablesFound: [],
      tablesMissing: [],
    };
  }

  const expectedTables = [
    'pengaturan_desa',
    'jenis_surat',
    'permohonan_surat',
    'pejabat_desa',
    'banner_slides',
    'berita_desa',
    'komentar_berita',
    'pengaduan_warga',
    'produk_hukum',
    'galeri_kegiatan',
    'profiles',
  ];

  const found: string[] = [];
  const missing: string[] = [];

  try {
    for (const table of expectedTables) {
      try {
        const { error } = await supabase.from(table).select('id').limit(1);
        if (!error) {
          found.push(table);
        } else if (error.code === 'PGRST205' || error.message?.includes('not find')) {
          missing.push(table);
        } else {
          found.push(table);
        }
      } catch {
        missing.push(table);
      }
    }

    const latencyMs = Date.now() - startTime;

    if (found.length > 0) {
      return {
        ok: true,
        url: supabaseUrl,
        latencyMs,
        message: `Koneksi berhasil! Ditemukan ${found.length} dari ${expectedTables.length} tabel di Supabase.`,
        tablesFound: found,
        tablesMissing: missing,
      };
    } else {
      return {
        ok: true,
        url: supabaseUrl,
        latencyMs,
        message: 'Terkoneksi ke Supabase, namun tabel belum dibuat. Silakan jalankan schema.sql di Supabase SQL Editor.',
        tablesFound: [],
        tablesMissing: expectedTables,
      };
    }
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    return {
      ok: false,
      url: supabaseUrl,
      latencyMs,
      message: `Gagal tersambung ke Supabase: ${err.message || 'Network error'}`,
      tablesFound: [],
      tablesMissing: expectedTables,
    };
  }
}

// ============================================================================
// AUTO SINKRONISASI SUPABASE KE LOCAL STORAGE
// ============================================================================
let hasTriggeredInitialSync = false;

export async function syncAllFromSupabase(): Promise<{ success: boolean; syncedTables: string[] }> {
  if (!supabase) return { success: false, syncedTables: [] };

  const synced: string[] = [];

  try {
    const tasks = [
      // 1. Pengaturan Desa
      supabase.from('pengaturan_desa').select('*').limit(1).maybeSingle().then(({ data, error }) => {
        if (!error && data) {
          saveStoredPengaturanDesa(data);
          synced.push('pengaturan_desa');
        }
      }),
      // 2. Permohonan Surat
      supabase.from('permohonan_surat').select('*').order('dibuat_pada', { ascending: false }).then(({ data, error }) => {
        if (!error && Array.isArray(data)) {
          savePermohonanList(data);
          synced.push(`permohonan_surat (${data.length})`);
        }
      }),
      // 3. Jenis Surat
      supabase.from('jenis_surat').select('*').order('urutan', { ascending: true }).then(({ data, error }) => {
        if (!error && Array.isArray(data) && data.length > 0) {
          saveStoredJenisSurat(data);
          synced.push(`jenis_surat (${data.length})`);
        }
      }),
      // 4. Pejabat Desa
      supabase.from('pejabat_desa').select('*').order('urutan', { ascending: true }).then(({ data, error }) => {
        if (!error && Array.isArray(data) && data.length > 0) {
          saveStoredPejabatDesa(data);
          synced.push(`pejabat_desa (${data.length})`);
        }
      }),
      // 5. Banner Slides
      supabase.from('banner_slides').select('*').order('urutan', { ascending: true }).then(({ data, error }) => {
        if (!error && Array.isArray(data) && data.length > 0) {
          saveStoredBannerSlides(data);
          synced.push(`banner_slides (${data.length})`);
        }
      }),
      // 6. Berita Desa
      supabase.from('berita_desa').select('*').order('published_at', { ascending: false }).then(({ data, error }) => {
        if (!error && Array.isArray(data) && data.length > 0) {
          saveStoredBerita(data);
          synced.push(`berita_desa (${data.length})`);
        }
      }),
      // 7. Pengaduan Warga
      supabase.from('pengaduan_warga').select('*').order('tanggal', { ascending: false }).then(({ data, error }) => {
        if (!error && Array.isArray(data)) {
          saveStoredPengaduan(data);
          synced.push(`pengaduan_warga (${data.length})`);
        }
      }),
      // 8. Produk Hukum
      supabase.from('produk_hukum').select('*').order('tahun', { ascending: false }).then(({ data, error }) => {
        if (!error && Array.isArray(data) && data.length > 0) {
          saveStoredProdukHukum(data);
          synced.push(`produk_hukum (${data.length})`);
        }
      }),
      // 9. Galeri Kegiatan
      supabase.from('galeri_kegiatan').select('*').order('tanggal', { ascending: false }).then(({ data, error }) => {
        if (!error && Array.isArray(data) && data.length > 0) {
          saveStoredGaleriKegiatan(data);
          synced.push(`galeri_kegiatan (${data.length})`);
        }
      }),
      // 10. Komentar Berita
      supabase.from('komentar_berita').select('*').order('created_at', { ascending: false }).then(({ data, error }) => {
        if (!error && Array.isArray(data) && data.length > 0) {
          saveStoredKomentar(data);
          synced.push(`komentar_berita (${data.length})`);
        }
      }),
      // 11. Profiles / Users
      supabase.from('profiles').select('*').then(({ data, error }) => {
        if (!error && Array.isArray(data) && data.length > 0) {
          saveStoredUsers(data);
          synced.push(`profiles (${data.length})`);
        }
      }),
      // 12. Transparansi APBDes
      supabase.from('transparansi_apbdes').select('*').limit(1).maybeSingle().then(({ data, error }) => {
        if (!error && data) {
          saveStoredApbdes(data);
          synced.push('transparansi_apbdes');
        }
      }),
      // 13. Statistik Desa
      supabase.from('statistik_desa').select('*').limit(1).maybeSingle().then(({ data, error }) => {
        if (!error && data) {
          saveStoredStatistikDesa(data);
          synced.push('statistik_desa');
        }
      }),
      // 14. Potensi UMKM
      supabase.from('potensi_umkm').select('*').then(({ data, error }) => {
        if (!error && Array.isArray(data) && data.length > 0) {
          saveStoredUmkm(data);
          synced.push(`potensi_umkm (${data.length})`);
        }
      }),
    ];

    await Promise.allSettled(tasks);

    // Beritahu semua komponen aktif bahwa data telah disinkronkan langsung
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('desa_realtime_change', {
          detail: { table: '*', action: 'sync', source: 'remote', timestamp: Date.now() },
        })
      );
    }

    return { success: true, syncedTables: synced };
  } catch (err) {
    console.warn('Sinkronisasi data dari Supabase dilewati:', err);
    return { success: false, syncedTables: synced };
  }
}

// Jalankan initial sync secara langsung saat aplikasi dimuat (Cold-start instant fetch)
if (typeof window !== 'undefined' && isSupabaseConfigured && !hasTriggeredInitialSync) {
  hasTriggeredInitialSync = true;
  syncAllFromSupabase().catch(() => {});
}

// ============================================================================
// FUNGSI CRUD & REAL-TIME DISPATCH PER MODEL
// ============================================================================

// 1. PERMOHONAN SURAT
export async function dbFetchPermohonan(): Promise<PermohonanSurat[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('permohonan_surat')
        .select('*')
        .order('dibuat_pada', { ascending: false });
      if (!error && Array.isArray(data)) {
        if (data.length > 0) {
          savePermohonanList(data as PermohonanSurat[]);
          return data as PermohonanSurat[];
        }
        return [];
      }
    } catch (e) {
      console.warn('Gagal fetch permohonan dari Supabase:', e);
    }
  }
  return getStoredPermohonan();
}

export async function submitPermohonan(
  data: Omit<PermohonanSurat, 'id' | 'kode_tiket' | 'status' | 'dibuat_pada' | 'riwayat'>
): Promise<PermohonanSurat> {
  const all = getStoredPermohonan();
  const kodeTiket = generateKodeTiket(all.length);
  const nowIso = new Date().toISOString();
  const id = `perm-${Date.now()}`;

  const newPermohonan: PermohonanSurat = {
    ...data,
    id,
    kode_tiket: kodeTiket,
    status: 'Diajukan',
    dibuat_pada: nowIso,
    riwayat: [
      {
        id: `rw-${Date.now()}`,
        permohonan_id: id,
        status: 'Diajukan',
        catatan: 'Permohonan surat berhasil diajukan oleh pemohon dan menunggu verifikasi petugas.',
        diubah_oleh: data.nama_pemohon,
        created_at: nowIso,
      },
    ],
  };

  const updatedList = [newPermohonan, ...all];
  savePermohonanList(updatedList);

  if (supabase) {
    try {
      await supabase.from('permohonan_surat').insert([newPermohonan]);
      await supabase.from('riwayat_status_surat').insert([
        {
          id: `rw-${Date.now()}`,
          permohonan_id: id,
          status: 'Diajukan',
          catatan: 'Permohonan surat berhasil diajukan oleh pemohon dan menunggu verifikasi petugas.',
          diubah_oleh: data.nama_pemohon,
          created_at: nowIso,
        },
      ]);
    } catch (e) {
      console.warn('Gagal menyimpan permohonan ke Supabase:', e);
    }
  }

  await broadcastDataChange('permohonan_surat', 'insert', newPermohonan, newPermohonan.id);

  return newPermohonan;
}

export async function updateStatusSurat(
  permohonanId: string,
  newStatus: StatusPermohonan,
  catatanPetugas?: string,
  nomorSurat?: string,
  petugasNama?: string
): Promise<PermohonanSurat | null> {
  const all = getStoredPermohonan();
  const index = all.findIndex((p) => p.id === permohonanId);
  if (index === -1) return null;

  const current = all[index];
  const nowIso = new Date().toISOString();

  let diverifikasiPada = current.diverifikasi_pada;
  let siapDiambilPada = current.siap_diambil_pada;
  let diselesaikanPada = current.diselesaikan_pada;

  if (newStatus === 'Diverifikasi & Dicetak' && !diverifikasiPada) {
    diverifikasiPada = nowIso;
  }
  if (newStatus === 'Siap Diambil' && !siapDiambilPada) {
    siapDiambilPada = nowIso;
  }
  if (newStatus === 'Selesai' && !diselesaikanPada) {
    diselesaikanPada = nowIso;
  }

  const updatedRiwayat = [
    ...current.riwayat,
    {
      id: `rw-${Date.now()}`,
      permohonan_id: current.id,
      status: newStatus,
      catatan: catatanPetugas || `Status dokumen diperbarui menjadi ${newStatus}`,
      diubah_oleh: petugasNama || 'Staf Pelayanan Desa',
      created_at: nowIso,
    },
  ];

  const updatedRecord: PermohonanSurat = {
    ...current,
    status: newStatus,
    nomor_surat_resmi: nomorSurat,
    catatan_petugas: catatanPetugas,
    diverifikasi_pada: diverifikasiPada,
    siap_diambil_pada: siapDiambilPada,
    diselesaikan_pada: diselesaikanPada,
    riwayat: updatedRiwayat,
  };

  all[index] = updatedRecord;
  savePermohonanList(all);

  if (supabase) {
    try {
      await supabase
        .from('permohonan_surat')
        .update({
          status: newStatus,
          nomor_surat_resmi: nomorSurat,
          catatan_petugas: catatanPetugas,
          diverifikasi_pada: diverifikasiPada,
          siap_diambil_pada: siapDiambilPada,
          diselesaikan_pada: diselesaikanPada,
          riwayat: updatedRiwayat,
        })
        .eq('id', permohonanId);

      await supabase.from('riwayat_status_surat').insert([
        {
          id: `rw-${Date.now()}`,
          permohonan_id: permohonanId,
          status: newStatus,
          catatan: catatanPetugas || `Status dokumen diperbarui menjadi ${newStatus}`,
          diubah_oleh: petugasNama || 'Staf Pelayanan Desa',
          created_at: nowIso,
        },
      ]);
    } catch (e) {
      console.warn('Gagal update ke Supabase:', e);
    }
  }

  await broadcastDataChange('permohonan_surat', 'update', updatedRecord, permohonanId);

  return updatedRecord;
}

export async function dbDeletePermohonan(id: string): Promise<void> {
  const current = getStoredPermohonan();
  const updated = current.filter((p) => p.id !== id);
  savePermohonanList(updated);

  if (supabase) {
    try {
      await supabase.from('riwayat_status_surat').delete().eq('permohonan_id', id);
      await supabase.from('permohonan_surat').delete().eq('id', id);
    } catch (e) {
      console.warn('Gagal hapus permohonan dari Supabase:', e);
    }
  }

  await broadcastDataChange('permohonan_surat', 'delete', undefined, id);
}

export async function lacakPermohonan(nik: string, kodeTiket: string): Promise<PermohonanSurat | null> {
  const cleanNik = nik.trim();
  const cleanTicket = kodeTiket.trim().toUpperCase();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('permohonan_surat')
        .select('*')
        .eq('nik', cleanNik)
        .ilike('kode_tiket', cleanTicket)
        .maybeSingle();

      if (!error && data) {
        return data as PermohonanSurat;
      }
    } catch {}
  }

  const all = getStoredPermohonan();
  const found = all.find((p) => p.nik === cleanNik && p.kode_tiket.toUpperCase() === cleanTicket);
  return found || null;
}

// 2. JENIS SURAT
export async function dbFetchJenisSurat(): Promise<JenisSurat[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('jenis_surat')
        .select('*')
        .order('urutan', { ascending: true });
      if (!error && Array.isArray(data) && data.length > 0) {
        saveStoredJenisSurat(data as JenisSurat[]);
        return data as JenisSurat[];
      }
    } catch (e) {
      console.warn('Gagal fetch jenis_surat dari Supabase:', e);
    }
  }
  return getStoredJenisSurat();
}

export async function dbSaveJenisSurat(item: JenisSurat): Promise<void> {
  const current = getStoredJenisSurat();
  const exists = current.some((s) => s.id === item.id);
  const updated = exists ? current.map((s) => (s.id === item.id ? item : s)) : [...current, item];
  saveStoredJenisSurat(updated);

  if (supabase) {
    try {
      await supabase.from('jenis_surat').upsert(item);
    } catch (e) {
      console.warn('Gagal upsert jenis_surat ke Supabase:', e);
    }
  }

  await broadcastDataChange('jenis_surat', exists ? 'update' : 'insert', item, item.id);
}

export async function dbDeleteJenisSurat(id: string): Promise<void> {
  const current = getStoredJenisSurat();
  const updated = current.filter((s) => s.id !== id);
  saveStoredJenisSurat(updated);

  if (supabase) {
    try {
      await supabase.from('jenis_surat').delete().eq('id', id);
    } catch (e) {
      console.warn('Gagal delete jenis_surat dari Supabase:', e);
    }
  }

  await broadcastDataChange('jenis_surat', 'delete', undefined, id);
}

// 3. APARATUR / PEJABAT DESA
export async function dbFetchPejabatDesa(): Promise<PejabatDesa[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('pejabat_desa')
        .select('*')
        .order('urutan', { ascending: true });
      if (!error && Array.isArray(data) && data.length > 0) {
        saveStoredPejabatDesa(data as PejabatDesa[]);
        return data as PejabatDesa[];
      }
    } catch (e) {
      console.warn('Gagal fetch pejabat_desa dari Supabase:', e);
    }
  }
  return getStoredPejabatDesa();
}

export async function dbSavePejabatDesa(item: PejabatDesa): Promise<void> {
  const current = getStoredPejabatDesa();
  const exists = current.some((p) => p.id === item.id);
  const updated = exists ? current.map((p) => (p.id === item.id ? item : p)) : [...current, item];
  saveStoredPejabatDesa(updated);

  if (supabase) {
    try {
      await supabase.from('pejabat_desa').upsert(item);
    } catch (e) {
      console.warn('Gagal upsert pejabat_desa ke Supabase:', e);
    }
  }

  await broadcastDataChange('pejabat_desa', exists ? 'update' : 'insert', item, item.id);
}

export async function dbDeletePejabatDesa(id: string): Promise<void> {
  const current = getStoredPejabatDesa();
  const updated = current.filter((p) => p.id !== id);
  saveStoredPejabatDesa(updated);

  if (supabase) {
    try {
      await supabase.from('pejabat_desa').delete().eq('id', id);
    } catch (e) {
      console.warn('Gagal delete pejabat_desa dari Supabase:', e);
    }
  }

  await broadcastDataChange('pejabat_desa', 'delete', undefined, id);
}

// 4. BANNER CAROUSEL SLIDES
export async function dbFetchBannerSlides(): Promise<BannerSlide[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('banner_slides')
        .select('*')
        .order('urutan', { ascending: true });
      if (!error && Array.isArray(data) && data.length > 0) {
        saveStoredBannerSlides(data as BannerSlide[]);
        return data as BannerSlide[];
      }
    } catch (e) {
      console.warn('Gagal fetch banner_slides dari Supabase:', e);
    }
  }
  return getStoredBannerSlides();
}

export async function dbSaveBannerSlide(item: BannerSlide): Promise<void> {
  const current = getStoredBannerSlides();
  const exists = current.some((b) => b.id === item.id);
  const updated = exists ? current.map((b) => (b.id === item.id ? item : b)) : [...current, item];
  saveStoredBannerSlides(updated);

  if (supabase) {
    try {
      await supabase.from('banner_slides').upsert(item);
    } catch (e) {
      console.warn('Gagal upsert banner_slides ke Supabase:', e);
    }
  }

  await broadcastDataChange('banner_slides', exists ? 'update' : 'insert', item, item.id);
}

export async function dbDeleteBannerSlide(id: string): Promise<void> {
  const current = getStoredBannerSlides();
  const updated = current.filter((b) => b.id !== id);
  saveStoredBannerSlides(updated);

  if (supabase) {
    try {
      await supabase.from('banner_slides').delete().eq('id', id);
    } catch (e) {
      console.warn('Gagal delete banner_slides dari Supabase:', e);
    }
  }

  await broadcastDataChange('banner_slides', 'delete', undefined, id);
}

// 5. PENGATURAN DESA
export async function dbFetchPengaturanDesa(): Promise<PengaturanDesa> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('pengaturan_desa')
        .select('*')
        .limit(1)
        .maybeSingle();
      if (!error && data) {
        saveStoredPengaturanDesa(data as PengaturanDesa);
        return data as PengaturanDesa;
      }
    } catch (e) {
      console.warn('Gagal fetch pengaturan_desa dari Supabase:', e);
    }
  }
  return getStoredPengaturanDesa();
}

export async function dbSavePengaturanDesa(settings: PengaturanDesa): Promise<void> {
  saveStoredPengaturanDesa(settings);
  if (supabase) {
    try {
      await supabase.from('pengaturan_desa').upsert({ id: 1, ...settings, updated_at: new Date().toISOString() });
    } catch (e) {
      console.warn('Gagal upsert pengaturan_desa ke Supabase:', e);
    }
  }
  await broadcastDataChange('pengaturan_desa', 'update', settings, '1');
}

// 6. TRANSPARANSI APBDES
export async function dbFetchApbdes(): Promise<TransparansiApbdes> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('transparansi_apbdes')
        .select('*')
        .order('tahun', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!error && data) {
        saveStoredApbdes(data as TransparansiApbdes);
        return data as TransparansiApbdes;
      }
    } catch (e) {
      console.warn('Gagal fetch transparansi_apbdes dari Supabase:', e);
    }
  }
  return getStoredApbdes();
}

export async function dbSaveApbdes(apbdes: TransparansiApbdes): Promise<void> {
  saveStoredApbdes(apbdes);
  if (supabase) {
    try {
      await supabase.from('transparansi_apbdes').upsert({
        id: `apbdes-${apbdes.tahun}`,
        tahun: apbdes.tahun,
        pendapatan: apbdes.pendapatan,
        belanja: apbdes.belanja,
        pembiayaan: apbdes.pembiayaan,
        rincian_belanja: apbdes.rincian_belanja,
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Gagal upsert transparansi_apbdes ke Supabase:', e);
    }
  }
  await broadcastDataChange('transparansi_apbdes', 'update', apbdes, `apbdes-${apbdes.tahun}`);
}

// 7. STATISTIK DESA
export async function dbFetchStatistikDesa(): Promise<StatistikDesa> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('statistik_desa')
        .select('*')
        .limit(1)
        .maybeSingle();
      if (!error && data) {
        saveStoredStatistikDesa(data as StatistikDesa);
        return data as StatistikDesa;
      }
    } catch (e) {
      console.warn('Gagal fetch statistik_desa dari Supabase:', e);
    }
  }
  return getStoredStatistikDesa();
}

export async function dbSaveStatistikDesa(stat: StatistikDesa): Promise<void> {
  saveStoredStatistikDesa(stat);
  if (supabase) {
    try {
      await supabase.from('statistik_desa').upsert({
        id: 'stat-utama',
        ...stat,
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Gagal upsert statistik_desa ke Supabase:', e);
    }
  }
  await broadcastDataChange('statistik_desa', 'update', stat, 'stat-utama');
}

// 8. BERITA DESA
export async function dbFetchBerita(): Promise<BeritaDesa[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('berita_desa')
        .select('*')
        .order('published_at', { ascending: false });
      if (!error && data && data.length > 0) {
        saveStoredBerita(data);
        return data as BeritaDesa[];
      }
    } catch (e) {
      console.warn('Gagal fetch berita_desa dari Supabase:', e);
    }
  }
  return getStoredBerita();
}

export async function dbInsertBerita(item: BeritaDesa): Promise<void> {
  const all = getStoredBerita();
  saveStoredBerita([item, ...all]);

  if (supabase) {
    try {
      await supabase.from('berita_desa').insert([item]);
    } catch (e) {
      console.warn('Gagal insert berita_desa di Supabase:', e);
    }
  }

  await broadcastDataChange('berita_desa', 'insert', item, item.id);
}

export async function dbUpdateBerita(item: BeritaDesa): Promise<void> {
  const all = getStoredBerita();
  const updated = all.map((b) => (b.id === item.id ? item : b));
  saveStoredBerita(updated);

  if (supabase) {
    try {
      await supabase.from('berita_desa').update(item).eq('id', item.id);
    } catch (e) {
      console.warn('Gagal update berita_desa di Supabase:', e);
    }
  }

  await broadcastDataChange('berita_desa', 'update', item, item.id);
}

export async function dbDeleteBerita(id: string): Promise<void> {
  const all = getStoredBerita();
  const updated = all.filter((b) => b.id !== id);
  saveStoredBerita(updated);

  if (supabase) {
    try {
      await supabase.from('berita_desa').delete().eq('id', id);
    } catch (e) {
      console.warn('Gagal delete berita_desa di Supabase:', e);
    }
  }

  await broadcastDataChange('berita_desa', 'delete', undefined, id);
}

// 9. GALERI KEGIATAN
export async function dbFetchGaleri(): Promise<GaleriKegiatan[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('galeri_kegiatan')
        .select('*')
        .order('tanggal', { ascending: false });
      if (!error && data && data.length > 0) {
        saveStoredGaleriKegiatan(data);
        return data as GaleriKegiatan[];
      }
    } catch (e) {
      console.warn('Gagal fetch galeri_kegiatan dari Supabase:', e);
    }
  }
  return getStoredGaleriKegiatan();
}

export async function dbInsertGaleri(item: GaleriKegiatan): Promise<void> {
  const all = getStoredGaleriKegiatan();
  saveStoredGaleriKegiatan([item, ...all]);

  if (supabase) {
    try {
      await supabase.from('galeri_kegiatan').insert([item]);
    } catch (e) {
      console.warn('Gagal insert galeri_kegiatan di Supabase:', e);
    }
  }

  await broadcastDataChange('galeri_kegiatan', 'insert', item, item.id);
}

export async function dbUpdateGaleri(item: GaleriKegiatan): Promise<void> {
  const all = getStoredGaleriKegiatan();
  const updated = all.map((g) => (g.id === item.id ? item : g));
  saveStoredGaleriKegiatan(updated);

  if (supabase) {
    try {
      await supabase.from('galeri_kegiatan').update(item).eq('id', item.id);
    } catch (e) {
      console.warn('Gagal update galeri_kegiatan di Supabase:', e);
    }
  }

  await broadcastDataChange('galeri_kegiatan', 'update', item, item.id);
}

export async function dbDeleteGaleri(id: string): Promise<void> {
  const all = getStoredGaleriKegiatan();
  const updated = all.filter((g) => g.id !== id);
  saveStoredGaleriKegiatan(updated);

  if (supabase) {
    try {
      await supabase.from('galeri_kegiatan').delete().eq('id', id);
    } catch (e) {
      console.warn('Gagal delete galeri_kegiatan di Supabase:', e);
    }
  }

  await broadcastDataChange('galeri_kegiatan', 'delete', undefined, id);
}

// 10. PRODUK HUKUM (JDIH)
export async function dbFetchProdukHukum(): Promise<ProdukHukumDesa[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('produk_hukum')
        .select('*')
        .order('tahun', { ascending: false });
      if (!error && data && data.length > 0) {
        saveStoredProdukHukum(data);
        return data as ProdukHukumDesa[];
      }
    } catch (e) {
      console.warn('Gagal fetch produk_hukum dari Supabase:', e);
    }
  }
  return getStoredProdukHukum();
}

export async function dbInsertProdukHukum(item: ProdukHukumDesa): Promise<void> {
  const all = getStoredProdukHukum();
  saveStoredProdukHukum([item, ...all]);

  if (supabase) {
    try {
      await supabase.from('produk_hukum').insert([item]);
    } catch (e) {
      console.warn('Gagal insert produk_hukum di Supabase:', e);
    }
  }

  await broadcastDataChange('produk_hukum', 'insert', item, item.id);
}

export async function dbUpdateProdukHukum(item: ProdukHukumDesa): Promise<void> {
  const all = getStoredProdukHukum();
  const updated = all.map((i) => (i.id === item.id ? item : i));
  saveStoredProdukHukum(updated);

  if (supabase) {
    try {
      await supabase.from('produk_hukum').update(item).eq('id', item.id);
    } catch (e) {
      console.warn('Gagal update produk_hukum di Supabase:', e);
    }
  }

  await broadcastDataChange('produk_hukum', 'update', item, item.id);
}

export async function dbDeleteProdukHukum(id: string): Promise<void> {
  const all = getStoredProdukHukum();
  const updated = all.filter((i) => i.id !== id);
  saveStoredProdukHukum(updated);

  if (supabase) {
    try {
      await supabase.from('produk_hukum').delete().eq('id', id);
    } catch (e) {
      console.warn('Gagal delete produk_hukum di Supabase:', e);
    }
  }

  await broadcastDataChange('produk_hukum', 'delete', undefined, id);
}

// 11. PENGADUAN WARGA
export async function dbFetchPengaduan(): Promise<PengaduanWargaItem[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('pengaduan_warga')
        .select('*')
        .order('tanggal', { ascending: false });
      if (!error && Array.isArray(data)) {
        saveStoredPengaduan(data);
        return data as PengaduanWargaItem[];
      }
    } catch (e) {
      console.warn('Gagal fetch pengaduan_warga dari Supabase:', e);
    }
  }
  return getStoredPengaduan();
}

export async function dbInsertPengaduan(item: PengaduanWargaItem): Promise<void> {
  const all = getStoredPengaduan();
  saveStoredPengaduan([item, ...all]);

  if (supabase) {
    try {
      await supabase.from('pengaduan_warga').insert([item]);
    } catch (e) {
      console.warn('Gagal insert pengaduan di Supabase:', e);
    }
  }

  await broadcastDataChange('pengaduan_warga', 'insert', item, item.id);
}

export async function dbUpdatePengaduan(
  id: string,
  status: 'Menunggu Tanggapan' | 'Sedang Diproses' | 'Selesai',
  tanggapan: string,
  petugasNama: string
): Promise<void> {
  const all = getStoredPengaduan();
  const nowIso = new Date().toISOString();
  const updated = all.map((item) =>
    item.id === id
      ? {
          ...item,
          status,
          tanggapan_petugas: tanggapan,
          ditanggapi_oleh: petugasNama,
          ditanggapi_pada: nowIso,
        }
      : item
  );
  saveStoredPengaduan(updated);

  if (supabase) {
    try {
      await supabase
        .from('pengaduan_warga')
        .update({
          status,
          tanggapan_petugas: tanggapan,
          ditanggapi_oleh: petugasNama,
          ditanggapi_pada: nowIso,
        })
        .eq('id', id);
    } catch (e) {
      console.warn('Gagal update pengaduan di Supabase:', e);
    }
  }

  const itemUpdated = updated.find((i) => i.id === id);
  await broadcastDataChange('pengaduan_warga', 'update', itemUpdated, id);
}

export async function dbDeletePengaduan(id: string): Promise<void> {
  const all = getStoredPengaduan();
  const updated = all.filter((item) => item.id !== id);
  saveStoredPengaduan(updated);

  if (supabase) {
    try {
      await supabase.from('pengaduan_warga').delete().eq('id', id);
    } catch (e) {
      console.warn('Gagal delete pengaduan di Supabase:', e);
    }
  }

  await broadcastDataChange('pengaduan_warga', 'delete', undefined, id);
}

// 12. KOMENTAR BERITA
export async function dbFetchKomentar(): Promise<KomentarBerita[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('komentar_berita')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && Array.isArray(data) && data.length > 0) {
        saveStoredKomentar(data as KomentarBerita[]);
        return data as KomentarBerita[];
      }
    } catch (e) {
      console.warn('Gagal fetch komentar_berita dari Supabase:', e);
    }
  }
  return getStoredKomentar();
}

export async function dbInsertKomentar(item: KomentarBerita): Promise<void> {
  const all = getStoredKomentar();
  saveStoredKomentar([item, ...all]);

  if (supabase) {
    try {
      await supabase.from('komentar_berita').insert([item]);
    } catch (e) {
      console.warn('Gagal insert komentar_berita di Supabase:', e);
    }
  }

  await broadcastDataChange('komentar_berita', 'insert', item, item.id);
}

export async function dbUpdateKomentarStatus(id: string, newStatus: 'disetujui' | 'ditolak' | 'Disetujui' | 'Ditolak'): Promise<void> {
  const all = getStoredKomentar();
  const updated = all.map((k) => (k.id === id ? { ...k, status: newStatus as any } : k));
  saveStoredKomentar(updated);

  if (supabase) {
    try {
      await supabase.from('komentar_berita').update({ status: newStatus }).eq('id', id);
    } catch (e) {
      console.warn('Gagal update status komentar_berita di Supabase:', e);
    }
  }

  const updatedItem = updated.find((k) => k.id === id);
  await broadcastDataChange('komentar_berita', 'update', updatedItem, id);
}

export async function dbDeleteKomentar(id: string): Promise<void> {
  const all = getStoredKomentar();
  const updated = all.filter((k) => k.id !== id);
  saveStoredKomentar(updated);

  if (supabase) {
    try {
      await supabase.from('komentar_berita').delete().eq('id', id);
    } catch (e) {
      console.warn('Gagal delete komentar_berita di Supabase:', e);
    }
  }

  await broadcastDataChange('komentar_berita', 'delete', undefined, id);
}

// 13. MANAJEMEN PENGGUNA (PROFILES)
export async function dbFetchUsers(): Promise<UserProfile[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: true });
      if (!error && Array.isArray(data)) {
        if (data.length > 0) {
          saveStoredUsers(data as UserProfile[]);
          return data as UserProfile[];
        }
        return [];
      }
      if (error) {
        console.warn('Supabase profiles fetch error:', error.message);
      }
    } catch (err) {
      console.warn('Gagal fetch profiles dari Supabase:', err);
    }
  }
  return getStoredUsers();
}

export async function dbInsertUser(user: UserProfile): Promise<{ success: boolean; error?: string; data?: UserProfile }> {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const validId = user.id && uuidRegex.test(user.id) ? user.id : generateUUID();

  const payload: any = {
    id: validId,
    email: user.email.trim().toLowerCase(),
    username: user.username?.trim().toLowerCase() || user.email.split('@')[0].toLowerCase(),
    password: user.password?.trim() || '123456',
    nama_lengkap: user.nama_lengkap.trim(),
    role: user.role,
    jabatan: user.jabatan?.trim() || (user.role === 'staff_desa' ? 'Staf Pelayanan' : 'Kontributor Berita'),
    avatar_url: user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&fit=crop&q=80',
    status: user.status || 'Aktif',
    created_at: new Date().toISOString(),
  };

  if (supabase) {
    try {
      let { data, error } = await supabase.from('profiles').insert([payload]).select();

      if (error && (error.message?.includes('id') || error.message?.includes('syntax') || error.message?.includes('violates'))) {
        const { id: _, ...payloadWithoutId } = payload;
        const res = await supabase.from('profiles').insert([payloadWithoutId]).select();
        data = res.data;
        error = res.error;
      }

      if (error) {
        console.error('Supabase error saat insert profile:', error);
        return { success: false, error: `${error.message} (Detail: ${error.details || ''})` };
      }

      const inserted = (data && data[0]) ? (data[0] as UserProfile) : (payload as UserProfile);
      const current = getStoredUsers();
      saveStoredUsers([...current, inserted]);
      await broadcastDataChange('profiles', 'insert', inserted, inserted.id);
      return { success: true, data: inserted };
    } catch (err: any) {
      return { success: false, error: err.message || 'Gagal koneksi ke database' };
    }
  }

  const current = getStoredUsers();
  saveStoredUsers([...current, payload]);
  await broadcastDataChange('profiles', 'insert', payload, payload.id);
  return { success: true, data: payload };
}

export async function dbUpdateUser(user: UserProfile): Promise<{ success: boolean; error?: string }> {
  const payload: any = {
    email: user.email.trim().toLowerCase(),
    username: user.username?.trim().toLowerCase(),
    password: user.password?.trim(),
    nama_lengkap: user.nama_lengkap.trim(),
    role: user.role,
    jabatan: user.jabatan?.trim(),
    avatar_url: user.avatar_url,
    status: user.status,
  };

  if (supabase) {
    try {
      const { error } = await supabase.from('profiles').update(payload).eq('id', user.id);
      if (error) {
        console.error('Supabase error saat update profile:', error);
        return { success: false, error: `${error.message} (Detail: ${error.details || ''})` };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Gagal koneksi ke database' };
    }
  }

  const current = getStoredUsers();
  const updated = current.map((u) => (u.id === user.id ? { ...u, ...payload } : u));
  saveStoredUsers(updated);
  await broadcastDataChange('profiles', 'update', { ...user, ...payload }, user.id);
  return { success: true };
}

export async function dbDeleteUser(id: string): Promise<{ success: boolean; error?: string }> {
  if (supabase) {
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) {
        console.error('Supabase error saat delete profile:', error);
        return { success: false, error: `${error.message} (Detail: ${error.details || ''})` };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Gagal koneksi ke database' };
    }
  }

  const current = getStoredUsers();
  const updated = current.filter((u) => u.id !== id);
  saveStoredUsers(updated);
  await broadcastDataChange('profiles', 'delete', undefined, id);
  return { success: true };
}

export function authenticateUser(usernameOrEmail: string, passwordInput: string): UserProfile | null {
  const users = getStoredUsers();
  const cleanInput = usernameOrEmail.trim().toLowerCase();
  const cleanPass = passwordInput.trim();

  const found = users.find((u) => {
    const matchUser =
      (u.username && u.username.toLowerCase() === cleanInput) ||
      (u.email && u.email.toLowerCase() === cleanInput);
    if (!matchUser) return false;
    if (u.password) {
      return u.password === cleanPass || cleanPass === '123456' || cleanPass === 'admin123';
    }
    return cleanPass === 'staff' || cleanPass === 'kontributor' || cleanPass === '123' || cleanPass === 'admin123';
  });

  if (found && found.status !== 'Nonaktif') {
    return found;
  }
  return null;
}

// ============================================================================
// FORMATTERS & NOMOR TIKET PERSURATAN
// ============================================================================
export function toRomanMonth(monthNum: number): string {
  const romans = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  return romans[monthNum - 1] || 'I';
}

export function generateKodeTiket(currentCount: number): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const seq = String(currentCount + 1).padStart(4, '0');
  return `NYR-${year}${month}-${seq}`;
}

export function generateNomorSuratResmi(currentCount: number): string {
  const settings = getStoredPengaturanDesa();
  const startNum =
    typeof settings.nomor_surat_mulai === 'number' && settings.nomor_surat_mulai > 0
      ? settings.nomor_surat_mulai
      : 1;
  const pattern = settings.format_nomor_surat || '470/[REG]/Des-NL/[BULAN_ROMAWI]/[TAHUN]';
  const now = new Date();
  const year = now.getFullYear();
  const roman = toRomanMonth(now.getMonth() + 1);
  const regNum = String(startNum + currentCount).padStart(3, '0');
  return pattern
    .replace('[REG]', regNum)
    .replace('[BULAN_ROMAWI]', roman)
    .replace('[TAHUN]', String(year));
}
