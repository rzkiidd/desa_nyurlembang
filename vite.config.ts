import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

// LINT.IfChange(aistudio_media_plugin)
function aistudioMediaPlugin(): Plugin {
  return {
    name: 'vite-plugin-aistudio-media',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.startsWith('/assets/aistudio/')) {
          const rawPath = req.url.split('?')[0].split('#')[0];
          try {
            const decodedPath = decodeURIComponent(rawPath);
            const relativePath = decodedPath.replace(/^\//, '');
            const aistudioDir = path.resolve(
              __dirname,
              'public',
              'assets',
              'aistudio',
            );
            const filePath = path.resolve(__dirname, 'public', relativePath);
            if (
              filePath.startsWith(aistudioDir + path.sep) &&
              fs.existsSync(filePath) &&
              fs.statSync(filePath).isFile()
            ) {
              const ext = path.extname(filePath).toLowerCase();
              const mimeMap: Record<string, string> = {
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.png': 'image/png',
                '.gif': 'image/gif',
                '.webp': 'image/webp',
                '.svg': 'image/svg+xml',
                '.bmp': 'image/bmp',
                '.ico': 'image/x-icon',
                '.mp4': 'video/mp4',
                '.webm': 'video/webm',
                '.ogv': 'video/ogg',
                '.mp3': 'audio/mpeg',
                '.wav': 'audio/wav',
                '.ogg': 'audio/ogg',
                '.pdf': 'application/pdf',
              };
              res.setHeader(
                'Content-Type',
                mimeMap[ext] || 'application/octet-stream',
              );
              res.setHeader('Cache-Control', 'no-cache');
              fs.createReadStream(filePath).pipe(res);
              return;
            }
          } catch {
            // Fall through if URI decoding or file access fails
          }
        }
        next();
      });
    },
  };
}
// LINT.ThenChange(//depot/google3/java/com/google/alkali/boq/makersuite/applet_dev_service/templates/initializers/react_theme/vite.config.ts:aistudio_media_plugin)

// Plugin untuk injeksi Meta Tags Open Graph & Twitter Card secara dinamis dari Server (SSR / Crawler support)
function dynamicSocialMetaPlugin(): Plugin {
  return {
    name: 'vite-plugin-dynamic-social-meta',
    transformIndexHtml(html, ctx) {
      const rawUrl = ctx.originalUrl || (ctx as { path?: string; url?: string }).url || '';
      const match = rawUrl.match(/[?&]berita=([^&#]+)/);
      if (!match) return html;

      const beritaId = decodeURIComponent(match[1]);

      // Data lookup katalog berita utama
      const newsMap: Record<
        string,
        { judul: string; ringkasan: string; gambar_url: string; penulis: string }
      > = {
        'news-1': {
          judul: 'Penyaluran BLT Dana Desa Tahap 3 Berlangsung Tertib di Aula Kantor Desa Nyurlembang',
          ringkasan: 'Sebanyak 65 Keluarga Penerima Manfaat (KPM) di Desa Nyurlembang menerima bantuan langsung tunai dengan nominal Rp 300.000 per bulan.',
          gambar_url: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=1200&auto=format&fit=crop&q=80',
          penulis: 'Lalu Agus Prasetya',
        },
        'news-2': {
          judul: 'Pemdes Nyurlembang Gelar Pelatihan Kemasan Higienis & P-IRT untuk Pelaku UMKM Gula Aren',
          ringkasan: 'Mendorong daya saing produk lokal khas Narmada tembus ritel modern di Lombok Barat dan Mataram melalui sertifikasi standar BPOM dan kemasan kedap udara.',
          gambar_url: 'https://images.unsplash.com/photo-1556742049-0a67e5572293?w=1200&auto=format&fit=crop&q=80',
          penulis: 'Baiq Rohani, S.Sos',
        },
        'news-3': {
          judul: 'Aksi Gotong Royong Saluran Subak Nyurlembang Siapkan Ketahanan Pangan Musim Tanam',
          ringkasan: 'Warga tani 4 dusun bersama Babinsa dan perangkat desa membersihkan sedimentasi saluran primer pengairan sawah sepanjang 1,8 kilometer.',
          gambar_url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&auto=format&fit=crop&q=80',
          penulis: 'Lalu Agus Prasetya',
        },
      };

      const found = newsMap[beritaId];
      if (!found) return html;

      const targetTitle = `${found.judul} - Desa Nyurlembang`;
      const targetDesc = found.ringkasan;
      const targetImage = found.gambar_url;

      let modified = html;
      modified = modified.replace(/<title>.*?<\/title>/i, `<title>${targetTitle}</title>`);
      modified = modified.replace(/<meta property="og:title" content=".*?" \/>/i, `<meta property="og:title" content="${targetTitle}" />`);
      modified = modified.replace(/<meta property="og:description" content=".*?" \/>/i, `<meta property="og:description" content="${targetDesc}" />`);
      modified = modified.replace(/<meta property="og:type" content=".*?" \/>/i, `<meta property="og:type" content="article" />`);
      modified = modified.replace(/<meta property="og:image" content=".*?" \/>/i, `<meta property="og:image" content="${targetImage}" />`);
      modified = modified.replace(/<meta property="og:image:secure_url" content=".*?" \/>/i, `<meta property="og:image:secure_url" content="${targetImage}" />`);
      modified = modified.replace(/<meta name="twitter:title" content=".*?" \/>/i, `<meta name="twitter:title" content="${targetTitle}" />`);
      modified = modified.replace(/<meta name="twitter:description" content=".*?" \/>/i, `<meta name="twitter:description" content="${targetDesc}" />`);
      modified = modified.replace(/<meta name="twitter:image" content=".*?" \/>/i, `<meta name="twitter:image" content="${targetImage}" />`);

      return modified;
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), aistudioMediaPlugin(), dynamicSocialMetaPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
