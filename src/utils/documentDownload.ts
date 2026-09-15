import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { PermohonanSurat } from '../types';
import { PROFIL_DESA } from '../data/mockData';
import { getStoredPengaturanDesa } from '../lib/supabaseClient';

export function formatDateIndo(dateStr?: string): string {
  if (!dateStr) {
    return new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function generateOfficialSuratBody(permohonan: PermohonanSurat): string {
  const pengaturan = getStoredPengaturanDesa();
  const nomorSurat = permohonan.nomor_surat_resmi || `470/.../Des-NL/.../${new Date().getFullYear()}`;
  const tanggalSurat = formatDateIndo(permohonan.diverifikasi_pada || permohonan.dibuat_pada);
  const namaKades = pengaturan.pejabat_penandatangan_nama || PROFIL_DESA.kepala_desa;
  const nipdKades = pengaturan.pejabat_penandatangan_nipd || '19750812 200801 1 004';
  const jabatanKades = pengaturan.pejabat_penandatangan_jabatan || 'KEPALA DESA NYURLEMBANG';

  return `
    <div style="font-family: 'Bookman Old Style', 'Merriweather', 'Noto Serif', Georgia, serif; font-size: 11.5pt; line-height: 1.5; color: #000;">
      <!-- KOP SURAT RESMI -->
      <div style="position: relative; text-align: center; border-bottom: 3px double #000; padding-bottom: 8px; margin-bottom: 20px;">
        <img src="${pengaturan.kop_logo_kiri_url || pengaturan.kop_logo_url || '/logo.png'}" style="position: absolute; left: 4px; top: 2px; width: 72px; height: 72px; object-fit: contain;" alt="Logo Kiri" />
        ${pengaturan.kop_logo_kanan_url ? `<img src="${pengaturan.kop_logo_kanan_url}" style="position: absolute; right: 4px; top: 2px; width: 72px; height: 72px; object-fit: contain;" alt="Logo Kanan" />` : ''}
        <div style="padding: 0 ${pengaturan.kop_logo_kanan_url ? '76px' : '10px 0 76px'};">
          <p style="font-size: 13pt; font-weight: bold; text-transform: uppercase; margin: 0; letter-spacing: 0.5px;">${pengaturan.kop_baris1 || 'PEMERINTAH KABUPATEN LOMBOK BARAT'}</p>
          <p style="font-size: 14pt; font-weight: bold; text-transform: uppercase; margin: 0; letter-spacing: 0.5px;">${pengaturan.kop_baris2 || 'KECAMATAN NARMADA'}</p>
          <p style="font-size: 16pt; font-weight: 900; text-transform: uppercase; margin: 2px 0; letter-spacing: 1px;">${pengaturan.kop_baris3 || 'KANTOR KEPALA DESA NYURLEMBANG'}</p>
          <p style="font-size: 8.5pt; font-style: italic; margin: 2px 0 0 0;">${pengaturan.alamat_kantor || PROFIL_DESA.alamat_kantor}, Kode Pos ${pengaturan.kode_pos || PROFIL_DESA.kode_pos}</p>
          <p style="font-size: 8.5pt; font-style: italic; margin: 1px 0 0 0;">Layanan KPPID: ${pengaturan.telepon_kppid || PROFIL_DESA.telepon} • Email: ${pengaturan.email_desa || PROFIL_DESA.email}</p>
        </div>
      </div>

      <!-- JUDUL & NOMOR REGISTER -->
      <div style="text-align: center; margin: 18px 0 14px 0;">
        <div style="font-size: 13pt; font-weight: bold; text-transform: uppercase; text-decoration: underline; margin: 0 0 4px 0;">
          ${permohonan.jenis_surat_nama}
        </div>
        <div style="font-size: 11pt; margin: 0;">
          Nomor: ${nomorSurat}
        </div>
      </div>

      <!-- ISI NASKAH DINAS -->
      <div style="font-size: 11.5pt; text-align: justify; margin: 14px 0;">
        <p style="margin: 0 0 10px 0; text-indent: 30px;">
          Yang bertanda tangan di bawah ini, Kepala Desa Nyurlembang, Kecamatan Narmada, Kabupaten Lombok Barat, dengan ini menerangkan dengan sebenarnya bahwa:
        </p>

        <table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
          <tr>
            <td style="width: 28%; padding: 3px 4px; vertical-align: top;">Nama Lengkap</td>
            <td style="width: 3%; padding: 3px 4px; vertical-align: top;">:</td>
            <td style="padding: 3px 4px; vertical-align: top; font-weight: bold; text-transform: uppercase;">${permohonan.nama_pemohon}</td>
          </tr>
          <tr>
            <td style="padding: 3px 4px; vertical-align: top;">NIK (KTP)</td>
            <td style="padding: 3px 4px; vertical-align: top;">:</td>
            <td style="padding: 3px 4px; vertical-align: top; font-family: monospace;">${permohonan.nik}</td>
          </tr>
          <tr>
            <td style="padding: 3px 4px; vertical-align: top;">Tempat / Tgl. Lahir</td>
            <td style="padding: 3px 4px; vertical-align: top;">:</td>
            <td style="padding: 3px 4px; vertical-align: top;">${permohonan.tempat_lahir}, ${formatDateIndo(permohonan.tanggal_lahir)}</td>
          </tr>
          <tr>
            <td style="padding: 3px 4px; vertical-align: top;">Jenis Kelamin</td>
            <td style="padding: 3px 4px; vertical-align: top;">:</td>
            <td style="padding: 3px 4px; vertical-align: top;">${permohonan.jenis_kelamin}</td>
          </tr>
          <tr>
            <td style="padding: 3px 4px; vertical-align: top;">Agama</td>
            <td style="padding: 3px 4px; vertical-align: top;">:</td>
            <td style="padding: 3px 4px; vertical-align: top;">${permohonan.agama}</td>
          </tr>
          <tr>
            <td style="padding: 3px 4px; vertical-align: top;">Pekerjaan</td>
            <td style="padding: 3px 4px; vertical-align: top;">:</td>
            <td style="padding: 3px 4px; vertical-align: top;">${permohonan.pekerjaan}</td>
          </tr>
          <tr>
            <td style="padding: 3px 4px; vertical-align: top;">Wilayah Dusun</td>
            <td style="padding: 3px 4px; vertical-align: top;">:</td>
            <td style="padding: 3px 4px; vertical-align: top;">${permohonan.dusun}, Desa Nyurlembang</td>
          </tr>
          <tr>
            <td style="padding: 3px 4px; vertical-align: top;">Alamat Lengkap</td>
            <td style="padding: 3px 4px; vertical-align: top;">:</td>
            <td style="padding: 3px 4px; vertical-align: top;">${permohonan.alamat_lengkap}</td>
          </tr>
        </table>

        <p style="margin: 10px 0; text-indent: 30px;">
          Bahwa nama tersebut di atas adalah benar-benar warga penduduk bertempat tinggal di wilayah Desa Nyurlembang, Kecamatan Narmada, Kabupaten Lombok Barat.
        </p>

        <p style="margin: 10px 0; text-indent: 30px;">
          Surat keterangan ini diberikan dan dikeluarkan kepada yang bersangkutan untuk keperluan: <strong>${permohonan.keperluan}</strong>.
        </p>

        <p style="margin: 10px 0; text-indent: 30px;">
          Demikian surat keterangan ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya oleh yang berkepentingan.
        </p>
      </div>

      <!-- TANDA TANGAN & STEMPEL RESMI -->
      <div style="width: 50%; float: right; text-align: center; margin-top: 25px; page-break-inside: avoid;">
        <p style="margin: 0; font-size: 11pt;">Nyurlembang, ${tanggalSurat}</p>
        <p style="margin: 2px 0 0 0; font-weight: bold; text-transform: uppercase; font-size: 11pt;">${jabatanKades}</p>
        <div style="height: 75px; position: relative; display: flex; align-items: center; justify-content: center;">
          <div style="border: 2px dashed #999; border-radius: 50%; width: 70px; height: 70px; opacity: 0.6; display: flex; align-items: center; justify-content: center; font-size: 8pt; text-align: center; font-family: sans-serif;">
            (Cap Stempel Resmi)
          </div>
        </div>
        <p style="margin: 0; font-weight: bold; text-decoration: underline; text-transform: uppercase; font-size: 11pt;">${namaKades}</p>
        <p style="margin: 0; font-size: 9pt; font-family: sans-serif; color: #444;">NIPD. ${nipdKades}</p>
      </div>
      <div style="clear: both;"></div>

      <!-- FOOTER LEGALITAS -->
      <div style="margin-top: 35px; font-size: 8.5pt; color: #555; border-top: 1px dashed #ccc; padding-top: 6px; font-family: sans-serif;">
        Kode Tiket: ${permohonan.kode_tiket} • Register: ${nomorSurat} • Diterbitkan secara sah melalui Sistem Informasi Pelayanan Mandiri Desa Nyurlembang
      </div>
    </div>
  `;
}

export function generateOfficialSuratHtml(permohonan: PermohonanSurat): string {
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>Naskah_Dinas_${permohonan.kode_tiket}</title>
  <link href="https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet">
  <style>
    @page { size: 210mm 330mm; margin: 1.5cm 2cm 2cm 2cm; }
    body {
      font-family: 'Bookman Old Style', 'Merriweather', 'Noto Serif', Georgia, serif;
      font-size: 12pt;
      line-height: 1.5;
      color: #000;
      margin: 0;
      padding: 24px;
      background: #fff;
    }
  </style>
</head>
<body>
  ${generateOfficialSuratBody(permohonan)}
</body>
</html>`;
}

export async function downloadSuratAsRealPdf(
  permohonan: PermohonanSurat,
  customFilename?: string
): Promise<void> {
  const existingEl = document.getElementById('printable-naskah-dinas');
  let targetEl: HTMLElement;
  let tempContainer: HTMLElement | null = null;

  if (existingEl) {
    targetEl = existingEl;
  } else {
    tempContainer = document.createElement('div');
    tempContainer.style.position = 'fixed';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.width = '794px'; // standard width for ~210mm at 96 DPI
    tempContainer.style.background = '#ffffff';
    tempContainer.style.color = '#000000';
    tempContainer.style.padding = '36px 40px';
    tempContainer.innerHTML = generateOfficialSuratBody(permohonan);
    document.body.appendChild(tempContainer);
    targetEl = tempContainer;
  }

  try {
    // Wait for images inside target to load with timeout safeguard
    const images = Array.from(targetEl.querySelectorAll('img'));
    await Promise.all(
      images.map((img) => {
        img.crossOrigin = 'anonymous';
        if (img.complete && img.naturalHeight !== 0) return Promise.resolve(true);
        return new Promise((resolve) => {
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          setTimeout(() => resolve(false), 1500);
        });
      })
    );

    const canvas = await html2canvas(targetEl, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    // Ukuran F4 / Folio Standar Kedinasan Indonesia: 210mm x 330mm
    const pdf = new jsPDF('p', 'mm', [210, 330]);
    const pdfWidth = 210;
    const pageHeight = 330;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 5) {
      position = heightLeft - imgHeight;
      pdf.addPage([210, 330], 'p');
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const baseName =
      customFilename ||
      `Surat_Resmi_${(permohonan.nomor_surat_resmi || permohonan.kode_tiket).replace(/[\/\\]/g, '_')}`;
    const filename = baseName.endsWith('.pdf') ? baseName : `${baseName}.pdf`;

    pdf.save(filename);
  } finally {
    if (tempContainer && tempContainer.parentNode) {
      tempContainer.parentNode.removeChild(tempContainer);
    }
  }
}

// Keep downloadSuratAsPdfHtml for backward compatibility, but make it download real PDF
export async function downloadSuratAsPdfHtml(permohonan: PermohonanSurat): Promise<void> {
  await downloadSuratAsRealPdf(permohonan);
}
