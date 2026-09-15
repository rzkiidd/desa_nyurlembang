/**
 * Logika Middleware Proteksi Rute Next.js App Router + Supabase SSR
 * Memanfaatkan @supabase/ssr untuk sinkronisasi cookie session dan pengecekan Role di tabel `profiles`.
 * 
 * Lokasi file produksi: /middleware.ts (Root Next.js project)
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: '', ...options });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({ name, value: '', ...options });
      },
    },
  });

  // 1. Dapatkan user session dari Supabase Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Rute Publik (Warga) - Selalu diizinkan
  const isPublicRoute =
    pathname === '/' ||
    pathname.startsWith('/layanan-mandiri') ||
    pathname.startsWith('/lacak') ||
    pathname.startsWith('/berita') ||
    pathname.startsWith('/potensi-umkm') ||
    pathname.startsWith('/profil-desa') ||
    pathname.startsWith('/login');

  // Jika belum login dan mencoba mengakses rute internal /admin/*
  if (!user && pathname.startsWith('/admin')) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Jika sudah login, verifikasi Role pengguna dari tabel `public.profiles`
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, nama_lengkap')
      .eq('id', user.id)
      .single();

    const userRole = profile?.role; // 'staff_desa' | 'user_biasa'

    // Rute yang WAJIB memiliki hak akses Staf Desa
    const isStaffOnlyRoute =
      pathname.startsWith('/admin/layanan-surat') ||
      pathname.startsWith('/admin/cetak') ||
      pathname.startsWith('/admin/arsip') ||
      pathname.startsWith('/admin/pengguna');

    // ATURAN 1: Proteksi Hak Akses Surat
    // Jika User Biasa (Kontributor) mencoba mengakses modul surat -> Redirect paksa ke /admin/konten
    if (userRole === 'user_biasa' && isStaffOnlyRoute) {
      return NextResponse.redirect(new URL('/admin/konten?error=unauthorized_access', request.url));
    }

    // ATURAN 2: Jika user sudah login dan berada di halaman /login, arahkan ke dashboard yang sesuai
    if (pathname === '/login') {
      if (userRole === 'staff_desa') {
        return NextResponse.redirect(new URL('/admin/layanan-surat', request.url));
      } else {
        return NextResponse.redirect(new URL('/admin/konten', request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder assets
     */
    '/((?!_next/static|_next/image|favicon.ico|assets|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
