/**
 * Utilitas SEO & Open Graph Terstandarisasi
 * Mendukung Dynamic Meta Tags, URL Absolut, Fallback Thumbnail, dan Link Sharing Sosial Media
 */

import { BeritaDesa } from '../types';

export const DEFAULT_SITE_TITLE = 'Portal & Layanan Mandiri Desa Nyurlembang';
export const DEFAULT_SITE_DESCRIPTION =
  'Sistem Informasi Desa (SID) dan Layanan Administrasi Surat Mandiri Desa Nyurlembang, Kecamatan Narmada, Lombok Barat berbasis Supabase RBAC & Cetak Naskah Dinas.';
export const DEFAULT_SITE_URL = 'https://nyurlembang.desa.id';
export const DEFAULT_FALLBACK_IMAGE = '/logo.png';

/**
 * Mengubah path relatif (misal: /logo.png atau /images/berita.jpg) menjadi URL absolut (https://...)
 * Diperlukan karena bot WhatsApp, Facebook, dan Twitter menolak path relatif.
 */
export function toAbsoluteUrl(urlOrPath?: string): string {
  if (!urlOrPath) {
    if (typeof window !== 'undefined' && window.location.origin) {
      return `${window.location.origin}${DEFAULT_FALLBACK_IMAGE}`;
    }
    return `${DEFAULT_SITE_URL}${DEFAULT_FALLBACK_IMAGE}`;
  }

  // Jika sudah URL absolut (http/https), kembalikan langsung
  if (urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://')) {
    return urlOrPath;
  }

  // Jika di browser client
  if (typeof window !== 'undefined' && window.location.origin) {
    const origin = window.location.origin;
    const cleanPath = urlOrPath.startsWith('/') ? urlOrPath : `/${urlOrPath}`;
    return `${origin}${cleanPath}`;
  }

  // Fallback domain desa
  const cleanPath = urlOrPath.startsWith('/') ? urlOrPath : `/${urlOrPath}`;
  return `${DEFAULT_SITE_URL}${cleanPath}`;
}

export interface SeoMetadataOptions {
  title?: string;
  description?: string;
  imageUrl?: string;
  url?: string;
  type?: 'website' | 'article';
  author?: string;
  publishedTime?: string;
}

/**
 * Menyuntikkan atau memperbarui tag meta Open Graph dan Twitter Card secara dinamis di DOM (Client-side)
 */
export function applySeoMetadata(options: SeoMetadataOptions): () => void {
  if (typeof document === 'undefined') return () => {};

  const previousTitle = document.title;
  const targetTitle = options.title
    ? `${options.title} - Desa Nyurlembang`
    : DEFAULT_SITE_TITLE;
  const targetDesc = options.description || DEFAULT_SITE_DESCRIPTION;
  const targetImage = toAbsoluteUrl(options.imageUrl || DEFAULT_FALLBACK_IMAGE);
  const targetUrl = options.url || (typeof window !== 'undefined' ? window.location.href : DEFAULT_SITE_URL);
  const targetType = options.type || 'website';

  document.title = targetTitle;

  const setOrCreateMeta = (attrName: 'name' | 'property', attrValue: string, content: string) => {
    let el = document.querySelector(`meta[${attrName}="${attrValue}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attrName, attrValue);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  // Standard Meta
  setOrCreateMeta('name', 'description', targetDesc);

  // Open Graph
  setOrCreateMeta('property', 'og:title', targetTitle);
  setOrCreateMeta('property', 'og:description', targetDesc);
  setOrCreateMeta('property', 'og:image', targetImage);
  setOrCreateMeta('property', 'og:image:width', '1200');
  setOrCreateMeta('property', 'og:image:height', '630');
  setOrCreateMeta('property', 'og:image:alt', options.title || 'Desa Nyurlembang');
  setOrCreateMeta('property', 'og:url', targetUrl);
  setOrCreateMeta('property', 'og:type', targetType);
  setOrCreateMeta('property', 'og:site_name', 'Pemerintah Desa Nyurlembang');

  // Article Specific
  if (options.author) {
    setOrCreateMeta('property', 'article:author', options.author);
  }
  if (options.publishedTime) {
    setOrCreateMeta('property', 'article:published_time', options.publishedTime);
  }

  // Twitter / X Card
  setOrCreateMeta('name', 'twitter:card', 'summary_large_image');
  setOrCreateMeta('name', 'twitter:title', targetTitle);
  setOrCreateMeta('name', 'twitter:description', targetDesc);
  setOrCreateMeta('name', 'twitter:image', targetImage);

  // Return cleanup function to restore defaults
  return () => {
    document.title = previousTitle;
    setOrCreateMeta('name', 'description', DEFAULT_SITE_DESCRIPTION);
    setOrCreateMeta('property', 'og:title', DEFAULT_SITE_TITLE);
    setOrCreateMeta('property', 'og:description', DEFAULT_SITE_DESCRIPTION);
    setOrCreateMeta('property', 'og:image', toAbsoluteUrl(DEFAULT_FALLBACK_IMAGE));
    setOrCreateMeta('property', 'og:url', DEFAULT_SITE_URL);
    setOrCreateMeta('property', 'og:type', 'website');
    setOrCreateMeta('name', 'twitter:title', DEFAULT_SITE_TITLE);
    setOrCreateMeta('name', 'twitter:description', DEFAULT_SITE_DESCRIPTION);
    setOrCreateMeta('name', 'twitter:image', toAbsoluteUrl(DEFAULT_FALLBACK_IMAGE));
  };
}

/**
 * Menghasilkan tautan bagikan yang valid dan terformat lengkap untuk media sosial
 */
export function generateSocialShareLinks(berita: BeritaDesa) {
  const origin = typeof window !== 'undefined' ? window.location.origin : DEFAULT_SITE_URL;
  const articleUrl = `${origin}/?berita=${encodeURIComponent(berita.id)}`;
  const title = berita.judul;
  const shareText = `${title} - Kabar Desa Nyurlembang`;
  const absoluteImage = toAbsoluteUrl(berita.gambar_url || DEFAULT_FALLBACK_IMAGE);

  return {
    articleUrl,
    absoluteImage,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + '\n' + articleUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(articleUrl)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(articleUrl)}&text=${encodeURIComponent(shareText)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(articleUrl)}&media=${encodeURIComponent(absoluteImage)}&description=${encodeURIComponent(shareText)}`,
  };
}
