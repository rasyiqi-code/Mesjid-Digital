import { useState, useEffect, useCallback } from 'react';
import { useOfflineSync } from './useOfflineSync';
import { useSettings } from './useSettings';
import { syncAllToSheets } from '../utils/sheetsApi';
import { 
  initDB,
  seedDBInitialData, 
  getDBCashBalance,
  getDBCashTransactions,
  getDBInventoryTransactions,
  getDBInventoryItems,
  getDBSyncQueue,
  addDBCashTransaction, 
  addDBInventoryTransaction,
  addDBSyncQueue,
  deleteDBCashTransaction,
  deleteDBInventoryTransaction,
  deleteDBSyncQueue,
  getDBPrograms,
  addDBProgram,
  deleteDBProgram
} from '../utils/db';
import type { 
  CashTransaction, 
  InventoryTransaction,
  SyncQueueItem,
  InventoryItem,
  MosqueProgram
} from '../utils/storage';

export const useMosqueData = () => {
  // State pemicu pembaruan UI lintas komponen
  const [updateTrigger, setUpdateTrigger] = useState<number>(0);

  // State data keuangan & logistik dari IndexedDB
  const [cashSummary, setCashSummary] = useState<{ totalIn: number; totalOut: number; balance: number }>({
    totalIn: 0,
    totalOut: 0,
    balance: 0
  });
  const [queueList, setQueueList] = useState<SyncQueueItem[]>([]);
  const [invItems, setInvItems] = useState<InventoryItem[]>([]);
  const [invHistory, setInvHistory] = useState<InventoryTransaction[]>([]);
  const [criticalItems, setCriticalItems] = useState<InventoryItem[]>([]);
  const [cashHistory, setCashHistory] = useState<CashTransaction[]>([]);
  const [programs, setPrograms] = useState<MosqueProgram[]>([]);
  const [activeModalImage, setActiveModalImage] = useState<string | null>(null);
  
  // Tab Routing & Sub-tab
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [barangSubTab, setBarangSubTab] = useState<'catat' | 'stok'>('catat');
  
  // State pencarian
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // State untuk meluncurkan drawer & modal
  const [isCashDrawerOpen, setIsCashDrawerOpen] = useState<boolean>(false);
  const [isInventoryDrawerOpen, setIsInventoryDrawerOpen] = useState<boolean>(false);
  const [isProgramFormOpen, setIsProgramFormOpen] = useState<boolean>(false);
  
  // State untuk melacak sinkronisasi otomatis di latar belakang
  const [isBackgroundSyncing, setIsBackgroundSyncing] = useState<boolean>(false);
  
  // State autentikasi mode admin
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return sessionStorage.getItem('mesjid_digital_is_admin') === 'true';
  });

  // State verifikasi pengunjung (tamu) berdasarkan nama masjid
  const [isGuestAuthenticated, setIsGuestAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('mesjid_digital_is_guest_authenticated') === 'true';
  });

  // Hook pengaturan aplikasi (nama masjid, DKM, dll) via localStorage
  const { settings, saveSettings, resetSettings, updateLastSynced } = useSettings();

  // Mengambil seluruh data asinkron dari IndexedDB secara terpusat
  const loadAllData = useCallback(async () => {
    try {
      const balanceData = await getDBCashBalance();
      const currentQueue = await getDBSyncQueue();
      const allItems = await getDBInventoryItems();
      const allTx = await getDBInventoryTransactions();
      const allCash = await getDBCashTransactions();
      const allPrograms = await getDBPrograms();

      setCashSummary(balanceData);
      setQueueList(currentQueue);
      setInvItems(allItems);
      setInvHistory(allTx);
      setCashHistory(allCash);
      setPrograms(allPrograms);

      // Barang dengan stok di bawah threshold kritis (dari pengaturan)
      const storedSettings = JSON.parse(localStorage.getItem('mesjid_digital_settings') ?? '{}');
      const threshold = storedSettings.criticalStockThreshold ?? 10;
      setCriticalItems(allItems.filter(item => item.stock < threshold));
    } catch (err) {
      console.error('Gagal memuat data dari IndexedDB:', err);
    }
  }, []);

  // Inisialisasi Database IndexedDB & Seeding Data Awal
  useEffect(() => {
    const startup = async () => {
      try {
        await initDB();
        await seedDBInitialData();
        await loadAllData();
      } catch (err) {
        console.error('Proses inisialisasi aplikasi gagal:', err);
      }
    };
    startup();
  }, [loadAllData]);

  // Pantau updateTrigger untuk me-reload data dari DB
  useEffect(() => {
    loadAllData();
  }, [updateTrigger, loadAllData]);

  const handleDataUpdated = useCallback(() => {
    setUpdateTrigger((prev) => prev + 1);
  }, []);

  // Hubungkan hook sinkronisasi offline-online
  const {
    isOnline,
    isSyncing,
    syncProgressMsg,
    queueCount,
    isSimulatedOffline,
    toasts,
    removeToast,
    toggleConnectionSim,
    showToast,
    triggerSync
  } = useOfflineSync(handleDataUpdated);

  // Handler login admin secara lokal
  const handleLoginAdmin = (password: string): boolean => {
    if (password === settings.adminPassword) {
      setIsAdmin(true);
      sessionStorage.setItem('mesjid_digital_is_admin', 'true');
      showToast('Verifikasi sukses. Anda masuk sebagai Admin.', 'success');
      return true;
    }
    return false;
  };

  // Handler akses pengunjung (tamu) berdasarkan nama masjid
  const handleGuestAccess = (enteredName: string): boolean => {
    const isMatch = enteredName.trim().toLowerCase() === settings.mosqueName.trim().toLowerCase();
    if (isMatch) {
      setIsGuestAuthenticated(true);
      sessionStorage.setItem('mesjid_digital_is_guest_authenticated', 'true');
      showToast('Akses masuk disetujui. Anda masuk dalam Mode Lihat-Saja.', 'success');
      return true;
    }
    return false;
  };

  // Handler reset kata sandi admin dengan token Google Apps Script sebagai pembuktian kepemilikan
  const handleResetAdminPassword = (token: string): { ok: boolean; message: string } => {
    if (!settings.appsScriptToken) {
      return {
        ok: false,
        message: 'Integrasi Google Sheets belum dikonfigurasi pada aplikasi ini. Kata sandi default Anda masih "admin123".'
      };
    }

    if (token === settings.appsScriptToken) {
      saveSettings({
        ...settings,
        adminPassword: 'admin123'
      });
      return {
        ok: true,
        message: 'Verifikasi kepemilikan sukses! Kata sandi admin Anda telah direset kembali menjadi: "admin123". Silakan login menggunakan sandi tersebut dan ubah kembali kata sandi Anda demi keamanan.'
      };
    }

    return {
      ok: false,
      message: 'Token Keamanan Google Apps Script tidak cocok! Silakan periksa kembali token yang tertera pada editor script Google Drive Anda.'
    };
  };

  // Handler logout admin
  const handleLogoutAdmin = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('mesjid_digital_is_admin');
    if (activeTab === 'pengaturan') {
      setActiveTab('dashboard');
    }
    showToast('Anda telah keluar dari Mode Admin.', 'info');
  };

  // Handler logout pengunjung (tamu)
  const handleLogoutGuest = () => {
    setIsGuestAuthenticated(false);
    sessionStorage.removeItem('mesjid_digital_is_guest_authenticated');
    setActiveTab('dashboard');
    showToast('Anda telah keluar dari sesi kunjungan.', 'info');
  };

  // Handler penyimpanan Kas Baru asinkron ke IndexedDB
  const handleSaveCash = async (data: Omit<CashTransaction, 'id' | 'date'>) => {
    const today = new Date().toISOString().split('T')[0];
    const newTx: CashTransaction = {
      ...data,
      id: `cash_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      date: today,
    };

    try {
      if (isOnline) {
        await addDBCashTransaction(newTx);
        showToast('Transaksi Kas berhasil disimpan ke server.', 'success');
      } else {
        await addDBSyncQueue('cash', newTx);
        showToast('Offline: Transaksi Kas disimpan sementara di lokal.', 'info');
      }
      handleDataUpdated();
    } catch (err) {
      console.error(err);
      showToast('Gagal menyimpan transaksi kas.', 'error');
    }
  };

  // Handler penyimpanan Barang Baru asinkron ke IndexedDB
  const handleSaveInventory = async (data: Omit<InventoryTransaction, 'id' | 'date'>) => {
    const today = new Date().toISOString().split('T')[0];
    const newTx: InventoryTransaction = {
      ...data,
      id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      date: today,
    };

    try {
      if (isOnline) {
        await addDBInventoryTransaction(newTx);
        showToast('Mutasi Barang berhasil disimpan ke server.', 'success');
      } else {
        await addDBSyncQueue('inventory', newTx);
        showToast('Offline: Mutasi Barang disimpan sementara di lokal.', 'info');
      }
      handleDataUpdated();
    } catch (err) {
      console.error(err);
      showToast('Gagal menyimpan transaksi barang.', 'error');
    }
  };

  // Handler penghapusan transaksi kas
  const handleDeleteCash = async (id: string) => {
    try {
      const queueItem = queueList.find((item) => item.type === 'cash' && (item.data as CashTransaction).id === id);
      if (queueItem) {
        await deleteDBSyncQueue(queueItem.id);
        showToast('Transaksi kas pending berhasil dibatalkan dari antrean.', 'success');
      } else {
        await deleteDBCashTransaction(id);
        showToast('Transaksi kas berhasil dihapus.', 'success');
      }
      handleDataUpdated();
    } catch (err) {
      console.error(err);
      showToast('Gagal menghapus transaksi kas.', 'error');
    }
  };

  // Handler penghapusan transaksi mutasi barang
  const handleDeleteInventory = async (id: string) => {
    try {
      const queueItem = queueList.find((item) => item.type === 'inventory' && (item.data as InventoryTransaction).id === id);
      if (queueItem) {
        await deleteDBSyncQueue(queueItem.id);
        showToast('Mutasi barang pending berhasil dibatalkan dari antrean.', 'success');
      } else {
        await deleteDBInventoryTransaction(id);
        showToast('Mutasi barang berhasil dihapus.', 'success');
      }
      handleDataUpdated();
    } catch (err) {
      console.error(err);
      showToast('Gagal menghapus transaksi barang.', 'error');
    }
  };

  // Handler tambah program kegiatan masjid
  const handleAddProgram = async (program: MosqueProgram) => {
    try {
      await addDBProgram(program);
      handleDataUpdated();
    } catch (err) {
      console.error(err);
      showToast('Gagal menambahkan program kegiatan.', 'error');
    }
  };

  // Handler hapus program kegiatan masjid
  const handleDeleteProgram = async (id: string) => {
    try {
      await deleteDBProgram(id);
      showToast('Program kegiatan berhasil dihapus.', 'success');
      handleDataUpdated();
    } catch (err) {
      console.error(err);
      showToast('Gagal menghapus program kegiatan.', 'error');
    }
  };

  // Handler sinkronisasi manual seluruh data ke Google Sheets
  const handleSyncToSheets = useCallback(async () => {
    if (!settings.appsScriptUrl || !settings.appsScriptToken) {
      showToast('Konfigurasi URL dan Token Google Apps Script terlebih dahulu di Pengaturan.', 'error');
      return;
    }
    showToast('Memulai sinkronisasi ke Google Sheets...', 'info');
    const result = await syncAllToSheets(
      { url: settings.appsScriptUrl, token: settings.appsScriptToken },
      { kas: cashHistory, barang: invHistory, program: programs }
    );
    if (result.ok) {
      const count = result.counts;
      updateLastSynced(Date.now());
      showToast(
        `Sinkronisasi selesai! Kas: ${count?.kas ?? 0}, Barang: ${count?.barang ?? 0}, Program: ${count?.program ?? 0} baris.`,
        'success'
      );
    } else {
      showToast(`Sinkronisasi gagal: ${result.error ?? 'Tidak diketahui'}`, 'error');
    }
  }, [settings.appsScriptUrl, settings.appsScriptToken, cashHistory, invHistory, programs, showToast, updateLastSynced]);

  // Fungsi sinkronisasi otomatis latar belakang ke Google Sheets (tanpa toast popup)
  const performBackgroundSync = useCallback(async () => {
    if (!settings.appsScriptUrl || !settings.appsScriptToken || !settings.isAutoSyncEnabled) return;
    if (isBackgroundSyncing) return;

    setIsBackgroundSyncing(true);
    try {
      const result = await syncAllToSheets(
        { url: settings.appsScriptUrl, token: settings.appsScriptToken },
        { kas: cashHistory, barang: invHistory, program: programs }
      );
      if (result.ok) {
        updateLastSynced(Date.now());
        console.log('Auto-Sinkronisasi latar belakang ke Google Sheets berhasil.');
      } else {
        console.warn('Auto-Sinkronisasi latar belakang gagal:', result.error);
      }
    } catch (err) {
      console.error('Error saat Auto-Sinkronisasi latar belakang:', err);
    } finally {
      setIsBackgroundSyncing(false);
    }
  }, [settings.appsScriptUrl, settings.appsScriptToken, settings.isAutoSyncEnabled, cashHistory, invHistory, programs, updateLastSynced, isBackgroundSyncing]);

  // Effect untuk menjalankan Auto-Sinkronisasi ke Google Sheets secara otomatis setelah ada update data
  useEffect(() => {
    if (!settings.isAutoSyncEnabled || !isOnline || !settings.appsScriptUrl || !settings.appsScriptToken) {
      return;
    }

    // Hindari eksekusi saat pertama kali komponen dirender
    if (updateTrigger === 0) return;

    // Debounce sinkronisasi selama 5.5 detik setelah perubahan terakhir
    const handler = setTimeout(() => {
      performBackgroundSync();
    }, 5500);

    return () => {
      clearTimeout(handler);
    };
  }, [updateTrigger, isOnline, settings.isAutoSyncEnabled, settings.appsScriptUrl, settings.appsScriptToken, performBackgroundSync]);

  // Filter inventaris berdasarkan nama barang pencarian
  const filteredInvItems = invItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    // States
    activeTab,
    setActiveTab,
    barangSubTab,
    setBarangSubTab,
    searchTerm,
    setSearchTerm,
    isCashDrawerOpen,
    setIsCashDrawerOpen,
    isInventoryDrawerOpen,
    setIsInventoryDrawerOpen,
    isProgramFormOpen,
    setIsProgramFormOpen,
    activeModalImage,
    setActiveModalImage,
    isAdmin,
    isGuestAuthenticated,
    isOnline,
    isSyncing: isSyncing || isBackgroundSyncing,
    syncProgressMsg: syncProgressMsg || (isBackgroundSyncing ? 'Auto Syncing...' : undefined),
    queueCount,
    isSimulatedOffline,
    toasts,
    removeToast,
    cashSummary,
    queueList,
    invItems,
    invHistory,
    criticalItems,
    cashHistory,
    programs,
    filteredInvItems,
    settings,
    isBackgroundSyncing,

    // Handlers
    handleLoginAdmin,
    handleGuestAccess,
    handleResetAdminPassword,
    handleLogoutAdmin,
    handleLogoutGuest,
    handleSaveCash,
    handleSaveInventory,
    handleDeleteCash,
    handleDeleteInventory,
    handleAddProgram,
    handleDeleteProgram,
    handleSyncToSheets,
    triggerSync,
    toggleConnectionSim,
    showToast,
    saveSettings,
    resetSettings
  };
};
