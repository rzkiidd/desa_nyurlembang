import React, { useState, useRef } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link,
  Image as ImageIcon,
  Eye,
  Edit3,
  Columns,
  Undo,
  Redo,
  Upload,
  Calendar,
  User,
  Tag
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  coverImageUrl?: string;
  onCoverImageChange?: (url: string) => void;
  title?: string;
  category?: string;
  author?: string;
  publishedDate?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Ketik isi berita kedinasan di sini...',
  coverImageUrl,
  onCoverImageChange,
  title,
  category = 'Pemerintahan Desa',
  author = 'Staf Publikasi Desa',
  publishedDate = 'Hari ini',
}) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'split'>('split');
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [inputImageUrl, setInputImageUrl] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Helper untuk menyisipkan format di posisi kursor
  const insertFormatting = (prefix: string, suffix: string = '', defaultText: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const selectedText = text.substring(start, end) || defaultText;
    const replacement = `${prefix}${selectedText}${suffix}`;

    const newContent = text.substring(0, start) + replacement + text.substring(end);
    onChange(newContent);

    // Kembalikan fokus dan kursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      );
    }, 10);
  };

  const handleHeading = (level: 1 | 2 | 3) => {
    const hashes = '#'.repeat(level);
    insertFormatting(`\n${hashes} `, '\n', `Judul Tingkat ${level}`);
  };

  const handleList = (ordered: boolean) => {
    if (ordered) {
      insertFormatting('\n1. ', '\n2. \n', 'Poin urutan pertama');
    } else {
      insertFormatting('\n- ', '\n- \n', 'Poin daftar kegiatan');
    }
  };

  const handleBlockquote = () => {
    insertFormatting('\n> "', '" — Kutipan Resmi Kepala Desa\n', 'Pemerintah Desa Nyurlembang berkomitmen memberikan pelayanan terbaik bagi masyarakat.');
  };

  const handleInsertLink = () => {
    if (!linkUrl) return;
    const textToInsert = linkText || linkUrl;
    insertFormatting(`[${textToInsert}](${linkUrl})`);
    setLinkUrl('');
    setLinkText('');
    setShowLinkModal(false);
  };

  const handleInsertImage = () => {
    if (!inputImageUrl) return;
    insertFormatting(`\n![Foto Kegiatan](${inputImageUrl})\n`);
    if (onCoverImageChange && !coverImageUrl) {
      onCoverImageChange(inputImageUrl);
    }
    setInputImageUrl('');
    setShowImageModal(false);
  };

  // Parser sederhana untuk Live Preview
  const parseInline = (text: string) => {
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*.*?\*\*|\*.*?\*|\[.*?\]\(.*?\))/g;
    let lastIndex = 0;
    let match;
    let key = 0;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      const token = match[0];
      if (token.startsWith('**') && token.endsWith('**')) {
        parts.push(<strong key={key++} className="font-bold text-[#0D2A4A]">{token.slice(2, -2)}</strong>);
      } else if (token.startsWith('*') && token.endsWith('*')) {
        parts.push(<em key={key++} className="italic text-slate-700">{token.slice(1, -1)}</em>);
      } else if (token.startsWith('[') && token.includes('](')) {
        const linkMatch = token.match(/\[(.*?)\]\((.*?)\)/);
        if (linkMatch) {
          parts.push(
            <a
              key={key++}
              href={linkMatch[2]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1565C0] underline hover:text-blue-800 font-medium"
            >
              {linkMatch[1]}
            </a>
          );
        } else {
          parts.push(token);
        }
      } else {
        parts.push(token);
      }
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  const renderFormattedPreview = (rawContent: string) => {
    if (!rawContent.trim()) {
      return (
        <div className="text-slate-400 italic text-sm text-center py-12">
          Belum ada teks yang ditulis. Gunakan editor di sebelah kiri untuk mulai menulis berita.
        </div>
      );
    }

    const lines = rawContent.split('\n');
    return (
      <div className="space-y-3.5 text-slate-800 leading-relaxed text-sm">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-2" />;

          // H1
          if (trimmed.startsWith('# ')) {
            return (
              <h1 key={idx} className="text-2xl font-black text-[#0D2A4A] font-heading mt-4 pb-1 border-b border-slate-200">
                {parseInline(trimmed.replace('# ', ''))}
              </h1>
            );
          }
          // H2
          if (trimmed.startsWith('## ')) {
            return (
              <h2 key={idx} className="text-xl font-extrabold text-[#1565C0] font-heading mt-3">
                {parseInline(trimmed.replace('## ', ''))}
              </h2>
            );
          }
          // H3
          if (trimmed.startsWith('### ')) {
            return (
              <h3 key={idx} className="text-base font-bold text-[#0D2A4A] font-heading mt-2">
                {parseInline(trimmed.replace('### ', ''))}
              </h3>
            );
          }
          // Blockquote
          if (trimmed.startsWith('>')) {
            return (
              <blockquote
                key={idx}
                className="pl-4 py-2 my-2 border-l-4 border-[#1565C0] bg-blue-50/50 rounded-r-xl text-slate-700 italic font-serif"
              >
                {parseInline(trimmed.replace(/^>\s*/, ''))}
              </blockquote>
            );
          }
          // Unordered list
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            return (
              <div key={idx} className="flex items-start gap-2 ml-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1565C0] mt-2 shrink-0" />
                <span>{parseInline(trimmed.substring(2))}</span>
              </div>
            );
          }
          // Ordered list
          if (/^\d+\.\s/.test(trimmed)) {
            const num = trimmed.match(/^\d+\./)?.[0] || '1.';
            const text = trimmed.replace(/^\d+\.\s*/, '');
            return (
              <div key={idx} className="flex items-start gap-2 ml-3">
                <span className="font-bold text-[#1565C0] text-xs mt-0.5 shrink-0">{num}</span>
                <span>{parseInline(text)}</span>
              </div>
            );
          }
          // Image embed
          if (trimmed.startsWith('![') && trimmed.includes('](')) {
            const match = trimmed.match(/\((.*?)\)/);
            if (match && match[1]) {
              return (
                <div key={idx} className="my-3">
                  <img
                    src={match[1]}
                    alt="Dokumentasi Berita"
                    className="w-full max-h-80 object-cover rounded-xl border border-slate-200 shadow-sm"
                  />
                  <p className="text-[11px] text-slate-400 text-center mt-1">Dokumentasi Kegiatan Desa Nyurlembang</p>
                </div>
              );
            }
          }

          // Format Inline: Paragraph
          return (
            <p key={idx} className="text-slate-700 leading-relaxed">
              {parseInline(line)}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="border border-slate-300 rounded-2xl bg-white shadow-xs overflow-hidden flex flex-col">
      {/* 1. TOP TOOLBAR DENGAN FORMATTING & VIEW SWITCHER */}
      <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 flex flex-wrap items-center justify-between gap-2 select-none">
        {/* Formatting Buttons */}
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => insertFormatting('**', '**', 'teks tebal')}
            title="Tebal (Ctrl+B)"
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('*', '*', 'teks miring')}
            title="Miring (Ctrl+I)"
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('<u>', '</u>', 'teks bergaris bawah')}
            title="Garis Bawah"
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <Underline className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('~~', '~~', 'teks coret')}
            title="Coret"
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <Strikethrough className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-300 mx-1" />

          {/* Headings */}
          <button
            type="button"
            onClick={() => handleHeading(1)}
            title="Heading 1 (Judul Utama)"
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition-colors text-xs font-bold font-mono"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleHeading(2)}
            title="Heading 2 (Sub-Judul)"
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition-colors text-xs font-bold font-mono"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleHeading(3)}
            title="Heading 3 (Bagian Kecil)"
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition-colors text-xs font-bold font-mono"
          >
            <Heading3 className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-300 mx-1" />

          {/* Lists & Quotes */}
          <button
            type="button"
            onClick={() => handleList(false)}
            title="Daftar Poin (Bullet List)"
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleList(true)}
            title="Daftar Bernomor (Numbered List)"
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleBlockquote}
            title="Kutipan Resmi Naskah (Blockquote)"
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <Quote className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-300 mx-1" />

          {/* Insert Media & Links */}
          <button
            type="button"
            onClick={() => setShowLinkModal(true)}
            title="Sisipkan Tautan Web / URL"
            className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-700 transition-colors"
          >
            <Link className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setShowImageModal(true)}
            title="Sisipkan Gambar Kegiatan"
            className="p-1.5 rounded-lg hover:bg-emerald-100 text-emerald-700 transition-colors"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
        </div>

        {/* View Mode Toggle Tabs */}
        <div className="flex items-center bg-slate-200/80 p-0.5 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('editor')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
              activeTab === 'editor'
                ? 'bg-white text-[#1565C0] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Editor Tulis</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('split')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
              activeTab === 'split'
                ? 'bg-white text-[#1565C0] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Berdampingan</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
              activeTab === 'preview'
                ? 'bg-white text-[#1565C0] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Pratinjau Live</span>
          </button>
        </div>
      </div>

      {/* 2. COVER IMAGE UPLOAD / URL BAR (Opsional) */}
      {onCoverImageChange && (
        <div className="bg-slate-50/70 border-b border-slate-200 px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-600 font-semibold">
            <Upload className="w-4 h-4 text-[#1565C0]" />
            <span>URL Gambar Sampul Utama:</span>
          </div>
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <input
              type="text"
              value={coverImageUrl || ''}
              onChange={(e) => onCoverImageChange(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-1 bg-white border border-slate-300 rounded-lg text-xs font-mono"
            />
            {coverImageUrl && (
              <img
                src={coverImageUrl}
                alt="Thumbnail"
                className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
              />
            )}
          </div>
        </div>
      )}

      {/* 3. EDITOR / PREVIEW AREA */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 min-h-[320px]">
        {/* TULIS TEXTAREA */}
        {(activeTab === 'editor' || activeTab === 'split') && (
          <div className={`p-4 flex flex-col ${activeTab === 'editor' ? 'col-span-full' : ''}`}>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Editor Naskah Berita
            </div>
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              rows={12}
              className="w-full flex-1 p-3 bg-transparent border-0 focus:ring-0 focus:outline-none text-sm text-slate-900 leading-relaxed font-sans resize-y"
            />
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>{value.length} Karakter</span>
              <span>Mendukung Markdown & Format Cepat</span>
            </div>
          </div>
        )}

        {/* LIVE PREVIEW TAB */}
        {(activeTab === 'preview' || activeTab === 'split') && (
          <div className={`p-5 bg-slate-50/40 overflow-y-auto max-h-[480px] ${activeTab === 'preview' ? 'col-span-full' : ''}`}>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#1565C0] mb-3 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              <span>Pratinjau Artikel di Beranda Portal</span>
            </div>

            {/* Simulated Article Header */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              {coverImageUrl && (
                <img
                  src={coverImageUrl}
                  alt="Cover"
                  className="w-full h-48 object-cover rounded-xl border border-slate-100"
                />
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-blue-100 text-[#1565C0] text-[11px] font-bold rounded-full">
                    {category}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {publishedDate}
                  </span>
                </div>

                <h2 className="text-lg font-black text-[#0D2A4A] font-heading leading-snug">
                  {title || 'Judul Artikel Berita Desa Nyurlembang'}
                </h2>

                <div className="text-xs text-slate-500 flex items-center gap-1.5 pt-1 border-t border-slate-100">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Ditulis oleh: <strong className="text-slate-700">{author}</strong></span>
                </div>
              </div>

              {/* Formatted Content */}
              <div className="pt-2 border-t border-slate-100">
                {renderFormattedPreview(value)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL INSERT LINK */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in duration-150">
            <h3 className="font-bold text-sm text-[#0D2A4A] flex items-center gap-2">
              <Link className="w-4 h-4 text-[#1565C0]" />
              <span>Sisipkan Tautan Web</span>
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Teks Tautan</label>
                <input
                  type="text"
                  placeholder="Contoh: Baca SK Kepala Desa"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">URL / Link Target *</label>
                <input
                  type="url"
                  placeholder="https://desanyurlembang.id/..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none font-mono"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleInsertLink}
                className="px-4 py-1.5 bg-[#1565C0] text-white rounded-xl text-xs font-bold"
              >
                Sisipkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL INSERT IMAGE */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in duration-150">
            <h3 className="font-bold text-sm text-[#0D2A4A] flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#2E7D32]" />
              <span>Sisipkan Gambar Dokumentasi</span>
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">URL Gambar (Foto Unsplash/Cloud) *</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={inputImageUrl}
                  onChange={(e) => setInputImageUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none font-mono"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleInsertImage}
                className="px-4 py-1.5 bg-[#2E7D32] text-white rounded-xl text-xs font-bold"
              >
                Sisipkan Gambar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
