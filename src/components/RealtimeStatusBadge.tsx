import React, { useState, useEffect } from 'react';
import { Wifi, RefreshCw, CheckCircle2 } from 'lucide-react';
import { isSupabaseConfigured, syncAllFromSupabase } from '../lib/supabaseClient';

interface RealtimeStatusBadgeProps {
  compact?: boolean;
}

export const RealtimeStatusBadge: React.FC<RealtimeStatusBadgeProps> = ({ compact = false }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncText, setLastSyncText] = useState('Baru saja');
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const handleRealtime = () => {
      setLastSyncText('Baru saja');
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('desa_realtime_change', handleRealtime);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('desa_realtime_change', handleRealtime);
      }
    };
  }, []);

  const handleManualSync = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSyncing(true);
    try {
      await syncAllFromSupabase();
      setLastSyncText('Baru saja disinkronkan');
    } catch {
      // Ignored
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isSupabaseConfigured) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[11px] font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
        <span>Mode Lokal</span>
      </span>
    );
  }

  if (compact) {
    return (
      <div className="relative inline-block">
        <button
          onClick={handleManualSync}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          title="Sinkronisasi Multi-Perangkat Realtime Aktif"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full text-[11px] font-semibold transition-colors cursor-pointer"
        >
          <span className="relative flex h-2 w-2">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Wifi className="w-3 h-3 text-emerald-600" />
          <span>Realtime Aktif</span>
          {isSyncing && <RefreshCw className="w-2.5 h-2.5 animate-spin ml-0.5 text-emerald-600" />}
        </button>

        {showTooltip && (
          <div className="absolute right-0 top-full mt-1.5 w-64 p-3 bg-slate-900 text-white text-xs rounded-xl shadow-xl z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-1.5 font-bold text-emerald-400 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Multi-Perangkat Tersinkronisasi</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Setiap kali Anda menambah, mengedit, atau menghapus data (CRUD) di Komputer A, perubahan otomatis muncul langsung di Komputer B, C, D tanpa perlu refresh.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative inline-flex items-center gap-1.5 bg-emerald-50/90 border border-emerald-200/80 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl shadow-2xs">
      <span className="relative flex h-2 w-2">
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>

      <span className="text-[11px] font-bold text-emerald-800 leading-tight hidden xs:inline">
        Live
      </span>

      <button
        onClick={handleManualSync}
        disabled={isSyncing}
        title={`Status: Realtime Terhubung (${lastSyncText}). Klik untuk sinkron ulang manual.`}
        className="p-1 hover:bg-emerald-200/60 text-emerald-700 rounded-lg transition-colors cursor-pointer"
        aria-label="Sinkronkan data"
      >
        <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
};
