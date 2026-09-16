import React, { useEffect } from 'react';
import { BeritaDesa } from '../types';
import { applySeoMetadata, toAbsoluteUrl, DEFAULT_FALLBACK_IMAGE } from '../utils/seo';

interface DynamicHeadProps {
  berita?: BeritaDesa | null;
  title?: string;
  description?: string;
  imageUrl?: string;
  type?: 'website' | 'article';
}

/**
 * Komponen DynamicHead untuk memanipulasi meta tags di sisi client (CSR)
 * Memastikan og:title, og:description, og:image (absolut), og:image:width (1200), og:image:height (630),
 * twitter:card, dan twitter:image selalu terisi dengan fallback gambar default logo desa.
 */
export const DynamicHead: React.FC<DynamicHeadProps> = ({
  berita,
  title,
  description,
  imageUrl,
  type = 'website',
}) => {
  useEffect(() => {
    if (berita) {
      const cleanup = applySeoMetadata({
        title: berita.judul,
        description: berita.ringkasan || berita.judul,
        imageUrl: toAbsoluteUrl(berita.gambar_url || DEFAULT_FALLBACK_IMAGE),
        type: 'article',
        author: berita.penulis,
        publishedTime: berita.published_at,
      });
      return cleanup;
    } else {
      const cleanup = applySeoMetadata({
        title,
        description,
        imageUrl: toAbsoluteUrl(imageUrl || DEFAULT_FALLBACK_IMAGE),
        type: type as 'website' | 'article',
      });
      return cleanup;
    }
  }, [berita, title, description, imageUrl, type]);

  return null;
};
