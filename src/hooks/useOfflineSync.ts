import { useState, useEffect, useCallback } from 'react';
import { 
  getDBSyncQueue, 
  deleteDBSyncQueue, 
  addDBCashTransaction, 
  addDBInventoryTransaction
} from '../utils/db';
import type { 
  CashTransaction, 
  InventoryTransaction, 
  SyncQueueItem 
} from '../utils/storage';
import confetti from 'canvas-confetti';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

export const useOfflineSync = (onDataUpdated?: () => void) => {
  // Status internet aktual browser
  const [isBrowserOnline, setIsBrowserOnline] = useState<boolean>(navigator.onLine);
  
  // Status simulasi offline (buatan)
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(() => {
    return localStorage.getItem('mesjid_digital_simulated_offline') === 'true';
  });

  // Status koneksi efektif aplikasi
  const isOnline = isBrowserOnline && !isSimulatedOffline;

  // Status sinkronisasi sedang berjalan
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  
  // Status progres teks sinkronisasi
  const [syncProgressMsg, setSyncProgressMsg] = useState<string>('');
  
  // Jumlah antrean saat ini
  const [queueCount, setQueueCount] = useState<number>(0);
  
  // Antrean transaksi yang sedang disinkronkan
  const [activeQueue, setActiveQueue] = useState<SyncQueueItem[]>([]);

  // Daftar notifikasi melayang (toast)
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Haptic feedback getar perangkat (jika didukung dan berjalan di mobile WebView/Android)
  const triggerVibration = useCallback((pattern: number | number[]) => {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        console.warn('Haptic feedback tidak didukung pada browser/perangkat ini:', e);
      }
    }
  }, []);

  // Mengubah jumlah antrean secara periodik atau saat dipanggil
  const updateQueueCount = useCallback(async () => {
    try {
      const queue = await getDBSyncQueue();
      setQueueCount(queue.length);
      setActiveQueue(queue);
    } catch (err) {
      console.error('Gagal mengambil antrean DB:', err);
    }
  }, []);

  // Menambahkan toast baru
  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Hapus toast otomatis setelah 4 detik
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  // Menghapus toast manual
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fungsi sinkronisasi antrean ke data utama
  const performSync = useCallback(async () => {
    try {
      const queue = await getDBSyncQueue();
      if (queue.length === 0 || isSyncing) return;

      setIsSyncing(true);
      triggerVibration([100, 50, 100]); // Getaran awal tanda mulai sinkronisasi
      showToast(`Memulai sinkronisasi ${queue.length} data tertunda...`, 'info');

      // Proses setiap data dalam antrean secara berurutan dengan jeda visual
      for (let i = 0; i < queue.length; i++) {
        const item = queue[i];
        setSyncProgressMsg(`Menyinkronkan data ${i + 1} dari ${queue.length}...`);
        
        // Beri jeda 800ms per baris agar animasi progres step-by-step terlihat memukau
        await new Promise((resolve) => setTimeout(resolve, 800));

        if (item.type === 'cash') {
          await addDBCashTransaction(item.data as CashTransaction);
        } else if (item.type === 'inventory') {
          await addDBInventoryTransaction(item.data as InventoryTransaction);
        }
        
        // Hapus dari antrean lokal IndexedDB setelah berhasil
        await deleteDBSyncQueue(item.id);
        
        // Getaran halus tiap berhasil mengirim satu item
        triggerVibration(40);
        
        // Trigger UI update secara bertahap
        if (onDataUpdated) {
          onDataUpdated();
        }
      }

      await updateQueueCount();
      setIsSyncing(false);
      setSyncProgressMsg('');
      
      // Getar panjang ganda tanda sukses besar
      triggerVibration([200, 100, 200]);
      showToast('Sinkronisasi selesai! Semua data tersimpan ke server.', 'success');

      // Efek kembang api selebrasi keberhasilan sinkronisasi
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.8 },
        colors: ['#10B981', '#34D399', '#F59E0B', '#3B82F6'],
      });

      if (onDataUpdated) {
        onDataUpdated();
      }
    } catch (error) {
      console.error('Sinkronisasi gagal:', error);
      setIsSyncing(false);
      setSyncProgressMsg('');
      triggerVibration([300, 100, 100]); // Getar peringatan error
      showToast('Gagal menyinkronkan beberapa data. Dicoba lagi nanti.', 'error');
    }
  }, [isSyncing, updateQueueCount, showToast, onDataUpdated, triggerVibration]);

  // Listener untuk status internet bawaan browser
  useEffect(() => {
    const handleOnline = () => {
      setIsBrowserOnline(true);
      showToast('Koneksi internet terdeteksi aktif.', 'info');
      triggerVibration(100);
    };
    const handleOffline = () => {
      setIsBrowserOnline(false);
      showToast('Koneksi internet terputus.', 'error');
      triggerVibration([150, 50, 150]);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Hitung antrean di awal secara asinkron
    const initQueue = async () => {
      await updateQueueCount();
    };
    initQueue();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showToast, updateQueueCount, triggerVibration]);

  // Menjalankan sinkronisasi secara otomatis saat status koneksi pulih menjadi Online
  useEffect(() => {
    if (isOnline && queueCount > 0 && !isSyncing) {
      const runSync = async () => {
        await performSync();
      };
      runSync();
    }
  }, [isOnline, queueCount, isSyncing, performSync]);

  // Fungsi toggle simulasi offline oleh pengguna
  const toggleConnectionSim = useCallback(() => {
    const nextSimState = !isSimulatedOffline;
    setIsSimulatedOffline(nextSimState);
    localStorage.setItem('mesjid_digital_simulated_offline', String(nextSimState));
    
    // Haptic getar tombol ditekan
    triggerVibration(50);
    
    if (nextSimState) {
      showToast('Mode offline disimulasikan. Transaksi masuk antrean lokal.', 'info');
    } else {
      showToast('Mode simulasi offline dimatikan.', 'info');
      setIsBrowserOnline(navigator.onLine);
    }
  }, [isSimulatedOffline, showToast, triggerVibration]);

  return {
    isOnline,
    isSyncing,
    syncProgressMsg,
    queueCount,
    activeQueue,
    isSimulatedOffline,
    toasts,
    removeToast,
    toggleVibration: () => triggerVibration(50),
    toggleConnectionSim,
    updateQueueCount,
    showToast,
    triggerSync: performSync
  };
};
