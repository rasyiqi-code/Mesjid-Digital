import { useState, useEffect, useCallback } from 'react';
import { 
  getSyncQueue, 
  removeFromSyncQueue, 
  addCashTransactionDirectly, 
  addInventoryTransactionDirectly
} from '../utils/storage';
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
  
  // Jumlah antrean saat ini
  const [queueCount, setQueueCount] = useState<number>(0);
  
  // Antrean transaksi yang sedang disinkronkan
  const [activeQueue, setActiveQueue] = useState<SyncQueueItem[]>([]);

  // Daftar notifikasi melayang (toast)
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Mengubah jumlah antrean secara periodik atau saat dipanggil
  const updateQueueCount = useCallback(() => {
    const queue = getSyncQueue();
    setQueueCount(queue.length);
    setActiveQueue(queue);
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
    const queue = getSyncQueue();
    if (queue.length === 0 || isSyncing) return;

    setIsSyncing(true);
    showToast(`Memulai sinkronisasi ${queue.length} data tertunda...`, 'info');

    // Beri jeda 1.5 detik agar animasi visual sinkronisasi terlihat premium
    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      // Proses setiap data dalam antrean secara berurutan
      // Pada aplikasi nyata, di sini kita mengirimkan POST request ke backend server API.
      // Di sini kita mensimulasikan penyimpanan ke data utama lokal sebagai server mockup.
      for (const item of queue) {
        if (item.type === 'cash') {
          addCashTransactionDirectly(item.data as CashTransaction);
        } else if (item.type === 'inventory') {
          addInventoryTransactionDirectly(item.data as InventoryTransaction);
        }
        // Hapus dari antrean lokal
        removeFromSyncQueue(item.id);
      }

      updateQueueCount();
      setIsSyncing(false);
      showToast('Sinkronisasi selesai! Semua data tersimpan ke server.', 'success');

      // Efek kembang api selebrasi keberhasilan sinkronisasi
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#10B981', '#34D399', '#F59E0B', '#10B981'],
      });

      // Panggil callback agar halaman memperbarui datanya
      if (onDataUpdated) {
        onDataUpdated();
      }
    } catch (error) {
      console.error('Sinkronisasi gagal:', error);
      setIsSyncing(false);
      showToast('Gagal menyinkronkan beberapa data. Akan dicoba lagi nanti.', 'error');
    }
  }, [isSyncing, updateQueueCount, showToast, onDataUpdated]);

  // Listener untuk status internet bawaan browser
  useEffect(() => {
    const handleOnline = () => {
      setIsBrowserOnline(true);
      showToast('Koneksi internet terdeteksi.', 'info');
    };
    const handleOffline = () => {
      setIsBrowserOnline(false);
      showToast('Koneksi internet terputus.', 'error');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Hitung antrean di awal
    updateQueueCount();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showToast, updateQueueCount]);

  // Menjalankan sinkronisasi secara otomatis saat status koneksi pulih menjadi Online
  useEffect(() => {
    if (isOnline && queueCount > 0 && !isSyncing) {
      performSync();
    }
  }, [isOnline, queueCount, isSyncing, performSync]);

  // Fungsi toggle simulasi offline oleh pengguna
  const toggleConnectionSim = useCallback(() => {
    const nextSimState = !isSimulatedOffline;
    setIsSimulatedOffline(nextSimState);
    localStorage.setItem('mesjid_digital_simulated_offline', String(nextSimState));
    
    if (nextSimState) {
      showToast('Mode offline disimulasikan. Transaksi akan masuk antrean lokal.', 'info');
    } else {
      showToast('Mode simulasi offline dimatikan.', 'info');
      // Update browser online state to make sure
      setIsBrowserOnline(navigator.onLine);
    }
  }, [isSimulatedOffline, showToast]);

  return {
    isOnline,
    isSyncing,
    queueCount,
    activeQueue,
    isSimulatedOffline,
    toasts,
    removeToast,
    toggleConnectionSim,
    updateQueueCount,
    showToast,
    triggerSync: performSync
  };
};
