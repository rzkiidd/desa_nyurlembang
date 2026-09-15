import { PermohonanSurat } from '../types';

/**
 * Format nomor telepon Indonesia ke format internasional WhatsApp (628xxx)
 */
export function formatNomorWhatsApp(phone: string): string {
  let clean = (phone || '').replace(/\D/g, '');
  if (clean.startsWith('0')) {
    clean = '62' + clean.slice(1);
  } else if (clean.startsWith('8')) {
    clean = '62' + clean;
  } else if (!clean.startsWith('62') && clean.length > 0) {
    clean = '62' + clean;
  }
  return clean;
}

/**
 * Menghasilkan pesan teks notifikasi status surat lengkap untuk dikirim ke WhatsApp pemohon
 */
export function generateWhatsAppStatusMessage(
  permohonan: PermohonanSurat,
  customCatatan?: string
): string {
  const catatan = (customCatatan !== undefined ? customCatatan : permohonan.catatan_petugas) || '';
  const formattedDate = permohonan.dibuat_pada
    ? new Date(permohonan.dibuat_pada).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '-';

  let statusEmoticon = '📋';
  let instruksiTambahan = '';

  switch (permohonan.status) {
    case 'Diajukan':
      statusEmoticon = '⏳';
      instruksiTambahan = 'Permohonan Anda telah kami terima dan masuk antrean verifikasi petugas desa.';
      break;
    case 'Diverifikasi & Dicetak':
      statusEmoticon = '🖨️';
      instruksiTambahan = 'Berkas Anda telah lolos verifikasi berkas dan sedang dalam tahap penomoran & pencetakan resmi.';
      break;
    case 'Siap Diambil':
      statusEmoticon = '🎉';
      instruksiTambahan =
        'Surat Anda telah selesai dicetak & ditandatangani! Silakan datang ke Loket Pelayanan Kantor Desa Nyurlembang dengan membawa KTP dan KK asli pada jam kerja (Senin - Jumat, 08.00 - 15.30 WITA).';
      break;
    case 'Selesai':
      statusEmoticon = '✅';
      instruksiTambahan =
        'Surat telah diserahterimakan kepada pemohon. Terima kasih telah menggunakan layanan administrasi mandiri Desa Nyurlembang.';
      break;
    case 'Ditolak':
      statusEmoticon = '⚠️';
      instruksiTambahan =
        'Mohon maaf, permohonan surat belum dapat diproses karena berkas belum lengkap atau data belum sesuai. Silakan lengkapi kembali sesuai catatan petugas.';
      break;
    default:
      statusEmoticon = '📌';
      instruksiTambahan = 'Status permohonan surat Anda telah diperbarui.';
  }

  return `*PEMBERITAHUAN STATUS PELAYANAN SURAT DESA NYURLEMBANG*
Kecamatan Narmada, Kabupaten Lombok Barat, NTB

Yth. Bpk/Ibu *${permohonan.nama_pemohon}*,
Berikut adalah informasi pembaruan status pelayanan pengajuan surat administrasi Anda:

👤 *DATA DIRI PEMOHON:*
• Nama Lengkap: *${permohonan.nama_pemohon}*
• NIK KTP: ${permohonan.nik}
• Wilayah: ${permohonan.dusun}
• No. WhatsApp: ${permohonan.nomor_whatsapp}

📄 *PELAYANAN YANG DIAJUKAN:*
• Jenis Surat: *${permohonan.jenis_surat_nama}*
• No. Tiket: *${permohonan.kode_tiket}*
• Keperluan: ${permohonan.keperluan || '-'}
• Tanggal Diajukan: ${formattedDate}

${statusEmoticon} *STATUS TIKET SAAT INI:*
👉 *${permohonan.status.toUpperCase()}* 👈

📌 *KETERANGAN & TINDAK LANJUT:*
${instruksiTambahan}
${catatan ? `\n💬 *Catatan Khusus Petugas Desa:*\n"${catatan}"\n` : ''}
🏛️ *INFORMASI KANTOR DESA NYURLEMBANG:*
• Alamat: Jl. Raya Nyurlembang, Kec. Narmada, Kab. Lombok Barat, NTB
• Jam Pelayanan: Senin - Jumat, 08.00 - 15.30 WITA
• Layanan Mandiri 24 Jam: https://desa-nyurlembang.id

_Pesan ini dikirimkan secara otomatis dari Sistem Pelayanan Administrasi Digital Terpadu Desa Nyurlembang._`;
}

/**
 * Membuat tautan langsung ke WhatsApp Web / Aplikasi
 */
export function getWhatsAppNotificationUrl(
  permohonan: PermohonanSurat,
  customCatatan?: string
): string {
  const phone = formatNomorWhatsApp(permohonan.nomor_whatsapp);
  const message = generateWhatsAppStatusMessage(permohonan, customCatatan);
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
