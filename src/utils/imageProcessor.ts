/**
 * Utility Pemrosesan Citra Dokumen Kependudukan (Client-Side Canvas)
 * - Auto Compress (Max dimension 1600px, target size 200 KB - 500 KB)
 * - Blur Detection (Laplacian Edge Variance, threshold < 80)
 * - Framing & Aspect Ratio Check
 */

export interface ImageProcessResult {
  file: File;
  dataUrl: string;
  fileName: string;
  sizeKb: number;
  originalSizeKb: number;
  width: number;
  height: number;
  aspectRatio: number;
  laplacianVariance: number;
  isBlurry: boolean;
  framingWarning?: string;
  isPdf?: boolean;
}

/**
 * Menghitung variansi kontras Laplacian dari ImageData grayscale
 * Kernel Laplacian:
 * [ 0,  1,  0 ]
 * [ 1, -4,  1 ]
 * [ 0,  1,  0 ]
 */
function calculateLaplacianVariance(imageData: ImageData): number {
  const { data, width, height } = imageData;
  
  // Konversi ke array 1D grayscale untuk performa tinggi
  const gray = new Float32Array(width * height);
  for (let i = 0, j = 0; i < data.length; i += 4, j++) {
    // Luminance ITU-R BT.601
    gray[j] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }

  // Hitung respon Laplacian untuk piksel non-tepi
  let sum = 0;
  let sumSq = 0;
  let count = 0;

  for (let y = 1; y < height - 1; y++) {
    const row = y * width;
    const rowAbove = (y - 1) * width;
    const rowBelow = (y + 1) * width;

    for (let x = 1; x < width - 1; x++) {
      const lap =
        gray[rowAbove + x] +
        gray[row + x - 1] +
        gray[row + x + 1] +
        gray[rowBelow + x] -
        4 * gray[row + x];

      sum += lap;
      sumSq += lap * lap;
      count++;
    }
  }

  if (count === 0) return 100; // default safe

  const mean = sum / count;
  const variance = sumSq / count - mean * mean;
  return Math.round(Math.max(0, variance) * 10) / 10;
}

/**
 * Memproses citra berkas dokumen dengan kompresi dan deteksi ketajaman
 */
export async function processDocumentImage(
  file: File,
  type: 'ktp' | 'kk' | 'pas_foto' | 'general' = 'general'
): Promise<ImageProcessResult> {
  const originalSizeKb = Math.round(file.size / 1024);

  // Jika berupa berkas PDF, lewati pemrosesan canvas
  if (file.type === 'application/pdf') {
    return {
      file,
      dataUrl: '',
      fileName: file.name,
      sizeKb: originalSizeKb,
      originalSizeKb,
      width: 0,
      height: 0,
      aspectRatio: 1,
      laplacianVariance: 150,
      isBlurry: false,
      isPdf: true,
    };
  }

  // Load image ke memory
  const imageBitmap = await new Promise<HTMLImageElement>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Gagal memuat format berkas gambar.'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Gagal membaca berkas.'));
    reader.readAsDataURL(file);
  });

  const origWidth = imageBitmap.naturalWidth || imageBitmap.width;
  const origHeight = imageBitmap.naturalHeight || imageBitmap.height;
  const aspectRatio = Math.round((origWidth / origHeight) * 100) / 100;

  // 1. Framing & Aspect Ratio Check
  let framingWarning: string | undefined;
  if (type === 'pas_foto') {
    if (aspectRatio > 1.0) {
      framingWarning = 'Pas foto berorientasi mendatar (landscape). Standar pas foto resmi adalah tegak/portrait (3x4 atau 4x6).';
    } else if (aspectRatio < 0.5) {
      framingWarning = 'Pas foto terlalu ramping atau terpotong ekstrem.';
    }
  } else if (type === 'ktp') {
    if (aspectRatio < 0.8) {
      framingWarning = 'KTP umumnya berbentuk horizontal (landscape). Pastikan seluruh fisik kartu KTP tidak terpotong atau terbalik.';
    } else if (aspectRatio > 2.2) {
      framingWarning = 'Proporsi foto KTP terlalu melebar / terpotong ekstrem.';
    }
  } else if (type === 'kk') {
    if (aspectRatio < 0.4 || aspectRatio > 2.5) {
      framingWarning = 'Proporsi foto Kartu Keluarga (KK) terdeteksi tidak standar atau terpotong.';
    }
  }

  // 2. Tentukan Dimensi Kompresi (Maksimal 1600px sisi terpanjang)
  const maxDim = 1600;
  let targetWidth = origWidth;
  let targetHeight = origHeight;

  if (targetWidth > maxDim || targetHeight > maxDim) {
    if (targetWidth > targetHeight) {
      targetHeight = Math.round((targetHeight * maxDim) / targetWidth);
      targetWidth = maxDim;
    } else {
      targetWidth = Math.round((targetWidth * maxDim) / targetHeight);
      targetHeight = maxDim;
    }
  }

  // 3. Render ke Canvas Kompresi
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    throw new Error('Canvas context 2D tidak didukung pada browser ini.');
  }

  // Background putih jika PNG transparan
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, targetWidth, targetHeight);
  ctx.drawImage(imageBitmap, 0, 0, targetWidth, targetHeight);

  // 4. Deteksi Blur dengan Laplacian Edge Variance
  // Kita buat sample canvas berukuran optimal ~300px agar deteksi cepat & akurat
  const sampleCanvas = document.createElement('canvas');
  const sampleWidth = Math.min(320, targetWidth);
  const sampleHeight = Math.round((targetHeight * sampleWidth) / targetWidth);
  sampleCanvas.width = sampleWidth;
  sampleCanvas.height = sampleHeight;
  const sampleCtx = sampleCanvas.getContext('2d', { willReadFrequently: true });

  let laplacianVariance = 120;
  if (sampleCtx) {
    sampleCtx.drawImage(canvas, 0, 0, sampleWidth, sampleHeight);
    const sampleData = sampleCtx.getImageData(0, 0, sampleWidth, sampleHeight);
    laplacianVariance = calculateLaplacianVariance(sampleData);
  }

  const isBlurry = laplacianVariance < 80;

  // 5. Sesuaikan Kualitas JPEG agar Berada di Rentang 200 KB - 500 KB
  let quality = 0.88;
  let blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', quality)
  );

  let currentSizeKb = blob ? Math.round(blob.size / 1024) : originalSizeKb;

  // Jika terlalu besar (> 500 KB), kurangi kualitas secara bertahap
  const qualitySteps = [0.8, 0.72, 0.65, 0.55, 0.45];
  let stepIdx = 0;
  while (currentSizeKb > 500 && stepIdx < qualitySteps.length) {
    quality = qualitySteps[stepIdx];
    blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', quality)
    );
    if (blob) {
      currentSizeKb = Math.round(blob.size / 1024);
    }
    stepIdx++;
  }

  // Jika ukuran terlalu kecil (< 200 KB) dan gambar aslinya besar, kita gunakan kualitas 0.92
  if (currentSizeKb < 200 && quality < 0.9) {
    const higherQualityBlob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.92)
    );
    if (higherQualityBlob) {
      blob = higherQualityBlob;
      currentSizeKb = Math.round(blob.size / 1024);
    }
  }

  const finalBlob = blob || file;
  const finalSizeKb = Math.round(finalBlob.size / 1024);
  const finalFileName = file.name.replace(/\.[^/.]+$/, '') + '.jpg';
  const processedFile = new File([finalBlob], finalFileName, { type: 'image/jpeg' });
  const dataUrl = canvas.toDataURL('image/jpeg', quality);

  return {
    file: processedFile,
    dataUrl,
    fileName: finalFileName,
    sizeKb: finalSizeKb,
    originalSizeKb,
    width: targetWidth,
    height: targetHeight,
    aspectRatio,
    laplacianVariance,
    isBlurry,
    framingWarning,
    isPdf: false,
  };
}
