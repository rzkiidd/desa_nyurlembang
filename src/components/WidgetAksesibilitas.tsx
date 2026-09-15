import React, { useState, useEffect } from 'react';
import {
  Volume2,
  ZoomIn,
  ZoomOut,
  Palette,
  Contrast,
  ImageOff,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Type,
  RotateCcw,
  X,
  Sliders,
  Move,
  Eye,
  Pause,
  Play,
  MousePointer,
  Space,
  Underline
} from 'lucide-react';

export type WidgetPosition = 'bottom_right' | 'bottom_left' | 'top_right' | 'top_left';

export const WidgetAksesibilitas: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<WidgetPosition>('bottom_left');
  const [textSizeLevel, setTextSizeLevel] = useState(0); // -2 to +4
  const [saturationLevel, setSaturationLevel] = useState(0); // 0 = normal, 1 = low, 2 = grayscale, 3 = high
  const [contrastMode, setContrastMode] = useState<'normal' | 'high' | 'invert' | 'light'>('normal');
  const [hideImages, setHideImages] = useState(false);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right' | 'justify' | 'default'>('default');
  const [dyslexicFont, setDyslexicFont] = useState(false);
  const [lineHeightLevel, setLineHeightLevel] = useState(0); // 0 = default, 1 = 1.6, 2 = 1.9, 3 = 2.2
  const [pauseAnimations, setPauseAnimations] = useState(false);
  const [bigCursor, setBigCursor] = useState(false);
  const [letterSpacingLevel, setLetterSpacingLevel] = useState(0); // 0 = default, 1 = +1px, 2 = +2px, 3 = +3px
  const [underlineLinks, setUnderlineLinks] = useState(false);
  const [activeProfile, setActiveProfile] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Shortcut keyboard CTRL + U untuk membuka menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Update DOM styles based on accessibility states
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    // 1. Text Size
    const fontScaleMap = [-2, -1, 0, 1, 2, 3, 4];
    const scales = ['85%', '92%', '100%', '108%', '118%', '128%', '140%'];
    const scaleIndex = fontScaleMap.indexOf(textSizeLevel);
    if (scaleIndex !== -1 && textSizeLevel !== 0) {
      root.style.fontSize = scales[scaleIndex];
    } else {
      root.style.fontSize = '';
    }

    // 2. Grayscale & Saturation & Contrast Filters
    let filters: string[] = [];
    if (saturationLevel === 1) filters.push('saturate(50%)');
    else if (saturationLevel === 2) filters.push('grayscale(100%)');
    else if (saturationLevel === 3) filters.push('saturate(200%)');

    if (contrastMode === 'high') {
      filters.push('contrast(160%) brightness(110%)');
    } else if (contrastMode === 'invert') {
      filters.push('invert(100%) hue-rotate(180deg)');
    } else if (contrastMode === 'light') {
      filters.push('brightness(115%) contrast(90%)');
    }

    if (filters.length > 0) {
      body.style.filter = filters.join(' ');
    } else {
      body.style.filter = '';
    }

    // 3. Hide Images
    const styleId = 'accessibility-hide-images-style';
    let styleEl = document.getElementById(styleId) as HTMLStyleElement;
    if (hideImages) {
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = styleId;
        document.head.appendChild(styleEl);
      }
      styleEl.innerHTML = 'img, video, iframe, svg:not(.svg-accessible-keep) { visibility: hidden !important; }';
    } else if (styleEl) {
      styleEl.remove();
    }

    // 4. Text Alignment
    if (textAlign !== 'default') {
      body.style.textAlign = textAlign;
    } else {
      body.style.textAlign = '';
    }

    // 5. Dyslexic Font
    if (dyslexicFont) {
      body.style.fontFamily = '"OpenDyslexic", "Comic Sans MS", "Comic Sans", "Trebuchet MS", sans-serif';
    } else {
      body.style.fontFamily = '';
    }

    // 6. Line Height
    const lineHeights = ['', '1.6', '1.9', '2.2'];
    body.style.lineHeight = lineHeights[lineHeightLevel] || '';

    // 7. Letter Spacing
    const spacings = ['', '1px', '2px', '3px'];
    body.style.letterSpacing = spacings[letterSpacingLevel] || '';

    // 8. Underline Links
    const linkStyleId = 'accessibility-underline-links-style';
    let linkStyleEl = document.getElementById(linkStyleId) as HTMLStyleElement;
    if (underlineLinks) {
      if (!linkStyleEl) {
        linkStyleEl = document.createElement('style');
        linkStyleEl.id = linkStyleId;
        document.head.appendChild(linkStyleEl);
      }
      linkStyleEl.innerHTML = 'a { text-decoration: underline !important; text-underline-offset: 4px !important; text-decoration-thickness: 2px !important; }';
    } else if (linkStyleEl) {
      linkStyleEl.remove();
    }

    // 9. Pause Animations
    const animStyleId = 'accessibility-pause-anim-style';
    let animStyleEl = document.getElementById(animStyleId) as HTMLStyleElement;
    if (pauseAnimations) {
      if (!animStyleEl) {
        animStyleEl = document.createElement('style');
        animStyleEl.id = animStyleId;
        document.head.appendChild(animStyleEl);
      }
      animStyleEl.innerHTML = '* { animation-play-state: paused !important; transition: none !important; }';
    } else if (animStyleEl) {
      animStyleEl.remove();
    }

    // 10. Big Cursor
    const cursorStyleId = 'accessibility-cursor-style';
    let cursorStyleEl = document.getElementById(cursorStyleId) as HTMLStyleElement;
    if (bigCursor) {
      if (!cursorStyleEl) {
        cursorStyleEl = document.createElement('style');
        cursorStyleEl.id = cursorStyleId;
        document.head.appendChild(cursorStyleEl);
      }
      cursorStyleEl.innerHTML = '* { cursor: crosshair !important; }';
    } else if (cursorStyleEl) {
      cursorStyleEl.remove();
    }
  }, [
    textSizeLevel,
    saturationLevel,
    contrastMode,
    hideImages,
    textAlign,
    dyslexicFont,
    lineHeightLevel,
    letterSpacingLevel,
    underlineLinks,
    pauseAnimations,
    bigCursor,
  ]);

  // Reset semua pengaturan
  const handleResetAll = () => {
    setTextSizeLevel(0);
    setSaturationLevel(0);
    setContrastMode('normal');
    setHideImages(false);
    setTextAlign('default');
    setDyslexicFont(false);
    setLineHeightLevel(0);
    setPauseAnimations(false);
    setBigCursor(false);
    setLetterSpacingLevel(0);
    setUnderlineLinks(false);
    setActiveProfile(null);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Text-To-Speech
  const handleToggleVoice = () => {
    if (!('speechSynthesis' in window)) {
      alert('Browser Anda belum mendukung Web Speech API Text-to-Speech.');
      return;
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const textToRead = document.body.innerText.slice(0, 500); // baca ringkasan halaman
      const utterance = new SpeechSynthesisUtterance(
        `Selamat datang di Portal Resmi Desa Nyurlembang. ` + textToRead
      );
      utterance.lang = 'id-ID';
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  // Profile presets
  const handleSelectProfile = (name: string) => {
    if (activeProfile === name) {
      handleResetAll();
      return;
    }
    handleResetAll();
    setActiveProfile(name);

    if (name === 'disleksia') {
      setDyslexicFont(true);
      setTextSizeLevel(1);
      setLineHeightLevel(2);
      setLetterSpacingLevel(1);
    } else if (name === 'gangguan_penglihatan') {
      setTextSizeLevel(3);
      setContrastMode('high');
      setUnderlineLinks(true);
      setLineHeightLevel(1);
    } else if (name === 'buta_warna') {
      setContrastMode('high');
      setSaturationLevel(3);
      setUnderlineLinks(true);
    } else if (name === 'epilepsi') {
      setPauseAnimations(true);
      setSaturationLevel(1);
    } else if (name === 'adhd') {
      setPauseAnimations(true);
      setBigCursor(true);
      setTextAlign('left');
    }
  };

  // Posisi widget CSS class
  const positionClasses = {
    bottom_right: 'bottom-4 right-4',
    bottom_left: 'bottom-4 left-4',
    top_right: 'top-20 right-4',
    top_left: 'top-20 left-4',
  };

  return (
    <div className="no-print">
      {/* Tombol Melayang Utama (Floating Trigger - Z-Index disesuaikan z-30 agar tidak bentrok dengan burger drawer) */}
      <button
        id="btn-trigger-aksesibilitas"
        onClick={() => setIsOpen(true)}
        aria-label="Buka Menu Aksesibilitas"
        className={`fixed ${positionClasses[position]} z-30 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#1565C0] hover:bg-[#0D2A4A] text-white flex items-center justify-center shadow-2xl border-2 border-[#FFB300] hover:scale-105 transition-all duration-300 group cursor-pointer`}
        title="Menu Aksesibilitas (CTRL+U)"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="26"
          height="26"
          className="fill-current text-[#FFB300] group-hover:rotate-12 transition-transform"
        >
          <path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z" />
        </svg>
      </button>

      {/* Modal Popup Aksesibilitas */}
      {isOpen && (
        <div className="fixed inset-0 z-[9995] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="accessibility-title"
          >
            {/* Header Dialog */}
            <div className="bg-[#0D2A4A] text-white px-5 py-4 flex items-center justify-between border-b border-blue-900">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#1565C0] flex items-center justify-center text-[#FFB300] font-black">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h2 id="accessibility-title" className="font-heading font-black text-sm text-white leading-tight">
                    Menu Aksesibilitas Desa
                  </h2>
                  <span className="text-[10px] text-slate-300">Tekan CTRL + U kapan saja</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 flex items-center justify-center transition-colors"
                aria-label="Tutup Menu Aksesibilitas"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-5 text-xs text-slate-700">
              {/* Profil Disabilitas Cepat */}
              <div>
                <div className="text-[11px] font-bold text-[#0D2A4A] uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Profil Kebutuhan Cepat</span>
                  {activeProfile && (
                    <span className="text-[10px] text-[#1565C0] font-normal">Aktif: {activeProfile}</span>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'disleksia', label: 'Disleksia' },
                    { id: 'gangguan_penglihatan', label: 'Penglihatan Rendah' },
                    { id: 'buta_warna', label: 'Buta Warna' },
                    { id: 'epilepsi', label: 'Aman Epilepsi' },
                    { id: 'adhd', label: 'Fokus ADHD' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleSelectProfile(p.id)}
                      className={`p-2 rounded-xl text-left font-bold transition-all flex items-center justify-between border ${
                        activeProfile === p.id
                          ? 'bg-[#1565C0] text-white border-[#0D2A4A] shadow-xs'
                          : 'bg-slate-50 hover:bg-blue-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span className="text-[11px]">{p.label}</span>
                      <span className={`w-2 h-2 rounded-full ${activeProfile === p.id ? 'bg-[#FFB300]' : 'bg-slate-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid Aksi Aksesibilitas Utama */}
              <div>
                <div className="text-[11px] font-bold text-[#0D2A4A] uppercase tracking-wider mb-2">
                  Alat & Penyesuaian Konten
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {/* 1. Moda Suara */}
                  <button
                    onClick={handleToggleVoice}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                      isSpeaking
                        ? 'bg-emerald-50 text-[#2E7D32] border-emerald-400 font-bold'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <Volume2 className={`w-5 h-5 ${isSpeaking ? 'text-[#2E7D32] animate-bounce' : 'text-[#1565C0]'}`} />
                    <span className="font-bold text-[11px]">Moda Suara</span>
                    <span className="text-[9px] text-slate-400">{isSpeaking ? 'Sedang Membaca' : 'Dengarkan Halaman'}</span>
                  </button>

                  {/* 2. Perbesar Teks */}
                  <button
                    onClick={() => setTextSizeLevel((prev) => Math.min(prev + 1, 4))}
                    className="p-3 rounded-2xl border bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 flex flex-col items-center justify-center gap-1.5 transition-all text-center"
                  >
                    <ZoomIn className="w-5 h-5 text-[#1565C0]" />
                    <span className="font-bold text-[11px]">Perbesar Teks</span>
                    <span className="text-[9px] font-mono text-slate-500">Skala: {textSizeLevel > 0 ? `+${textSizeLevel}` : textSizeLevel}</span>
                  </button>

                  {/* 3. Perkecil Teks */}
                  <button
                    onClick={() => setTextSizeLevel((prev) => Math.max(prev - 1, -2))}
                    className="p-3 rounded-2xl border bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 flex flex-col items-center justify-center gap-1.5 transition-all text-center"
                  >
                    <ZoomOut className="w-5 h-5 text-[#1565C0]" />
                    <span className="font-bold text-[11px]">Perkecil Teks</span>
                    <span className="text-[9px] font-mono text-slate-500">Normal: 0</span>
                  </button>

                  {/* 4. Kejenuhan / Grayscale */}
                  <button
                    onClick={() => setSaturationLevel((prev) => (prev + 1) % 4)}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                      saturationLevel !== 0
                        ? 'bg-blue-50 text-[#1565C0] border-blue-400 font-bold'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <Palette className="w-5 h-5 text-[#1565C0]" />
                    <span className="font-bold text-[11px]">Kejenuhan Warna</span>
                    <span className="text-[9px] text-slate-500">
                      {saturationLevel === 0 ? 'Normal' : saturationLevel === 1 ? 'Rendah' : saturationLevel === 2 ? 'Grayscale' : 'Kontras Warna'}
                    </span>
                  </button>

                  {/* 5. Kontras+ */}
                  <button
                    onClick={() => {
                      const modes: ('normal' | 'high' | 'invert' | 'light')[] = ['normal', 'high', 'invert', 'light'];
                      const next = modes[(modes.indexOf(contrastMode) + 1) % modes.length];
                      setContrastMode(next);
                    }}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                      contrastMode !== 'normal'
                        ? 'bg-blue-50 text-[#1565C0] border-blue-400 font-bold'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <Contrast className="w-5 h-5 text-[#1565C0]" />
                    <span className="font-bold text-[11px]">Kontras Tampilan</span>
                    <span className="text-[9px] text-slate-500 capitalize">{contrastMode}</span>
                  </button>

                  {/* 6. Sembunyikan Gambar */}
                  <button
                    onClick={() => setHideImages(!hideImages)}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                      hideImages
                        ? 'bg-amber-50 text-amber-800 border-amber-400 font-bold'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <ImageOff className="w-5 h-5 text-amber-600" />
                    <span className="font-bold text-[11px]">Sembunyikan Foto</span>
                    <span className="text-[9px] text-slate-500">{hideImages ? 'Aktif' : 'Nonaktif'}</span>
                  </button>

                  {/* 7. Rata Tulisan */}
                  <button
                    onClick={() => {
                      const aligns: ('default' | 'left' | 'center' | 'right' | 'justify')[] = ['default', 'left', 'center', 'right', 'justify'];
                      const next = aligns[(aligns.indexOf(textAlign) + 1) % aligns.length];
                      setTextAlign(next);
                    }}
                    className="p-3 rounded-2xl border bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 flex flex-col items-center justify-center gap-1.5 transition-all text-center"
                  >
                    {textAlign === 'center' ? (
                      <AlignCenter className="w-5 h-5 text-[#1565C0]" />
                    ) : textAlign === 'right' ? (
                      <AlignRight className="w-5 h-5 text-[#1565C0]" />
                    ) : textAlign === 'justify' ? (
                      <AlignJustify className="w-5 h-5 text-[#1565C0]" />
                    ) : (
                      <AlignLeft className="w-5 h-5 text-[#1565C0]" />
                    )}
                    <span className="font-bold text-[11px]">Rata Tulisan</span>
                    <span className="text-[9px] text-slate-500 capitalize">{textAlign}</span>
                  </button>

                  {/* 8. Ramah Disleksia */}
                  <button
                    onClick={() => setDyslexicFont(!dyslexicFont)}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                      dyslexicFont
                        ? 'bg-blue-50 text-[#1565C0] border-blue-400 font-bold'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <Type className="w-5 h-5 text-[#1565C0]" />
                    <span className="font-bold text-[11px]">Ramah Disleksia</span>
                    <span className="text-[9px] text-slate-500">{dyslexicFont ? 'Font Khusus' : 'Biasa'}</span>
                  </button>

                  {/* 9. Tinggi Garis */}
                  <button
                    onClick={() => setLineHeightLevel((prev) => (prev + 1) % 4)}
                    className="p-3 rounded-2xl border bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 flex flex-col items-center justify-center gap-1.5 transition-all text-center"
                  >
                    <div className="w-5 h-5 flex flex-col justify-center items-center gap-0.5 text-[#1565C0]">
                      <div className="w-4 h-0.5 bg-current" />
                      <div className="w-3 h-0.5 bg-current" />
                      <div className="w-4 h-0.5 bg-current" />
                    </div>
                    <span className="font-bold text-[11px]">Tinggi Garis</span>
                    <span className="text-[9px] text-slate-500">Tingkat {lineHeightLevel}</span>
                  </button>

                  {/* 10. Jeda Animasi */}
                  <button
                    onClick={() => setPauseAnimations(!pauseAnimations)}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                      pauseAnimations
                        ? 'bg-rose-50 text-rose-700 border-rose-300 font-bold'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {pauseAnimations ? <Play className="w-5 h-5 text-rose-600" /> : <Pause className="w-5 h-5 text-[#1565C0]" />}
                    <span className="font-bold text-[11px]">Animasi Gerak</span>
                    <span className="text-[9px] text-slate-500">{pauseAnimations ? 'Dijeda' : 'Normal'}</span>
                  </button>

                  {/* 11. Kursor Penunjuk */}
                  <button
                    onClick={() => setBigCursor(!bigCursor)}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                      bigCursor
                        ? 'bg-blue-50 text-[#1565C0] border-blue-400 font-bold'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <MousePointer className="w-5 h-5 text-[#1565C0]" />
                    <span className="font-bold text-[11px]">Kursor Penunjuk</span>
                    <span className="text-[9px] text-slate-500">{bigCursor ? 'Aktif' : 'Biasa'}</span>
                  </button>

                  {/* 12. Garis Bawahi Tautan */}
                  <button
                    onClick={() => setUnderlineLinks(!underlineLinks)}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                      underlineLinks
                        ? 'bg-blue-50 text-[#1565C0] border-blue-400 font-bold'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <Underline className="w-5 h-5 text-[#1565C0]" />
                    <span className="font-bold text-[11px]">Tautan Bergaris</span>
                    <span className="text-[9px] text-slate-500">{underlineLinks ? 'Aktif' : 'Biasa'}</span>
                  </button>
                </div>
              </div>

              {/* Posisi Widget Melayang */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="text-[11px] font-bold text-[#0D2A4A] flex items-center gap-1.5">
                  <Move className="w-3.5 h-3.5 text-[#1565C0]" />
                  <span>Pindahkan Posisi Tombol Widget</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold">
                  {[
                    { id: 'bottom_left', label: 'Bawah Kiri' },
                    { id: 'bottom_right', label: 'Bawah Kanan' },
                    { id: 'top_left', label: 'Atas Kiri' },
                    { id: 'top_right', label: 'Atas Kanan' },
                  ].map((pos) => (
                    <button
                      key={pos.id}
                      onClick={() => setPosition(pos.id as WidgetPosition)}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        position === pos.id
                          ? 'bg-[#1565C0] text-white border-[#0D2A4A] font-bold'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Reset Button */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={handleResetAll}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Atur Ulang Semua</span>
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#0D2A4A] hover:bg-[#1565C0] text-white font-bold text-xs shadow-xs transition-colors"
              >
                Terapkan & Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
