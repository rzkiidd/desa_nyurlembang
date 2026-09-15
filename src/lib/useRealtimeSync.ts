import { useEffect, useState, useRef } from 'react';
import { supabase } from './supabaseClient';

export interface RealtimeChangeEvent {
  table: string;
  action: 'insert' | 'update' | 'delete' | 'upsert' | 'sync';
  data?: any;
  id?: string;
  source: 'local' | 'remote';
  timestamp: number;
}

/**
 * Hook untuk mendengarkan perubahan CRUD real-time antar-komputer (Komputer A -> B, C, D)
 * Menggunakan Supabase Realtime WebSocket Broadcast + PostgreSQL Replication + Storage Fallback
 */
export function useRealtimeSync(
  tables: string | string[],
  onUpdate: (event: RealtimeChangeEvent) => void,
  debounceMs: number = 200
) {
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [syncCount, setSyncCount] = useState<number>(0);
  const onUpdateRef = useRef(onUpdate);
  const debounceTimerRef = useRef<any>(null);

  // Selalu simpan referensi callback terbaru
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    const tableList = Array.isArray(tables) ? tables : [tables];

    const triggerUpdate = (ev: RealtimeChangeEvent) => {
      setLastSyncTime(new Date());
      setSyncCount((prev) => prev + 1);

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        onUpdateRef.current(ev);
      }, debounceMs);
    };

    // 1. Dengarkan event real-time global aplikasi
    const handleRealtimeChange = (e: Event) => {
      const customEvent = e as CustomEvent<RealtimeChangeEvent>;
      const detail = customEvent.detail;
      if (!detail) return;

      if (tableList.includes('*') || tableList.includes(detail.table)) {
        triggerUpdate(detail);
      }
    };

    // 2. Dengarkan event antar-tab pada komputer yang sama
    const handleStorageChange = (e: StorageEvent) => {
      if (!e.key) return;
      // Cek apakah key localStorage yang berubah terkait dengan modul yang didengarkan
      const matched = tableList.some((t) => e.key?.includes(t) || e.key?.includes('desa_') || e.key?.includes('sid_'));
      if (matched) {
        triggerUpdate({
          table: e.key,
          action: 'sync',
          source: 'local',
          timestamp: Date.now(),
        });
      }
    };

    // 3. Sinkronisasi otomatis saat jendela kembali aktif (Window Focus)
    const handleWindowFocus = () => {
      triggerUpdate({
        table: tableList[0] || 'all',
        action: 'sync',
        source: 'remote',
        timestamp: Date.now(),
      });
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('desa_realtime_change', handleRealtimeChange);
      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('focus', handleWindowFocus);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('desa_realtime_change', handleRealtimeChange);
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('focus', handleWindowFocus);
      }
    };
  }, [JSON.stringify(tables), debounceMs]);

  return { lastSyncTime, syncCount };
}
