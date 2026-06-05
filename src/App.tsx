import { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { CashTransactionForm } from './components/CashTransactionForm';
import { InventoryForm } from './components/InventoryForm';
import { ReportGenerator } from './components/ReportGenerator';
import { useOfflineSync } from './hooks/useOfflineSync';
import { useSettings } from './hooks/useSettings';
import { syncAllToSheets } from './utils/sheetsApi';
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
} from './utils/db';
import type { 
  CashTransaction, 
  InventoryTransaction,
  SyncQueueItem,
  InventoryItem,
  MosqueProgram
} from './utils/storage';
import { 
  LayoutDashboard, 
  PlusCircle, 
  FileText, 
  FolderOpen, 
  Info, 
  CheckCircle2, 
  AlertCircle, 
  X,
  Search,
  PackageCheck,
  CalendarCheck,
} from 'lucide-react';
import { CashHistory } from './components/CashHistory';
import { ImageModal } from './components/ImageModal';
import { InventoryHistory } from './components/InventoryHistory';
import { ProgramManager } from './components/ProgramManager';
import { SettingsPanel } from './components/SettingsPanel';

function App() {
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
  // Sub-tab di dalam tab Barang: 'catat' = form input, 'stok' = daftar stok gudang
  const [barangSubTab, setBarangSubTab] = useState<'catat' | 'stok'>('catat');

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

  // 2. Hubungkan hook sinkronisasi offline-online
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

  // 3. Tab Routing
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // State untuk pencarian di tab Inventaris
  const [searchTerm, setSearchTerm] = useState<string>('');

  // 4. Handler penyimpanan Kas Baru asinkron ke IndexedDB
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

  // 5. Handler penyimpanan Barang Baru asinkron ke IndexedDB
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
      // Periksa apakah ini transaksi offline yang belum disinkronkan
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
      // Periksa apakah ini transaksi offline yang belum disinkronkan
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

  // Filter inventaris berdasarkan nama barang pencarian
  const filteredInvItems = invItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="app-container">
      {/* Navigasi Atas & Indikator Koneksi */}
      <Navbar
        isOnline={isOnline}
        isSyncing={isSyncing}
        syncProgressMsg={syncProgressMsg}
        isSimulatedOffline={isSimulatedOffline}
        queueCount={queueCount}
        onToggleSim={toggleConnectionSim}
        onManualSync={triggerSync}
        onOpenSettings={() => setActiveTab('pengaturan')}
        mosqueName={settings.mosqueName}
      />

      {/* Tabs Menu — 5 item utama, Pengaturan di Navbar, Inventaris merge ke Barang */}
      <div className="tabs-container">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
        >
          <LayoutDashboard size={18} />
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('catat_kas')}
          className={`tab-btn ${activeTab === 'catat_kas' ? 'active' : ''}`}
        >
          <PlusCircle size={18} />
          Kas
        </button>
        <button
          onClick={() => setActiveTab('catat_barang')}
          className={`tab-btn ${activeTab === 'catat_barang' ? 'active' : ''}`}
        >
          <PackageCheck size={18} />
          Barang
        </button>
        <button
          onClick={() => setActiveTab('program')}
          className={`tab-btn ${activeTab === 'program' ? 'active' : ''}`}
        >
          <CalendarCheck size={18} />
          Program
        </button>
        <button
          onClick={() => setActiveTab('laporan')}
          className={`tab-btn ${activeTab === 'laporan' ? 'active' : ''}`}
        >
          <FileText size={18} />
          Laporan
        </button>
      </div>

      {/* Area Konten Utama */}
      <main style={{ minHeight: '60vh' }}>
        {activeTab === 'dashboard' && (
          <Dashboard 
            onNavigateToTab={(tab) => setActiveTab(tab)} 
            cashSummary={cashSummary}
            queue={queueList}
            criticalItems={criticalItems}
          />
        )}

        {activeTab === 'catat_kas' && (
          <div className="dashboard-details-grid">
            <CashTransactionForm
              isOnline={isOnline}
              onSave={handleSaveCash}
              showToast={showToast}
              sheetsConfig={settings.appsScriptUrl ? { url: settings.appsScriptUrl, token: settings.appsScriptToken } : undefined}
            />
            <div className="glass-card">
              <CashHistory
                cashTransactions={cashHistory}
                onDelete={handleDeleteCash}
                onViewImage={(url) => setActiveModalImage(url)}
              />
            </div>
          </div>
        )}

        {activeTab === 'catat_barang' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Sub-tab: Catat vs Stok */}
            <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.04)', padding: '0.35rem', borderRadius: '14px', maxWidth: '340px', margin: '0 auto', width: '100%' }}>
              <button
                onClick={() => setBarangSubTab('catat')}
                className={`btn ${barangSubTab === 'catat' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, padding: '0.55rem', fontSize: '0.85rem', borderRadius: '10px' }}
              >
                <PackageCheck size={16} /> Catat Barang
              </button>
              <button
                onClick={() => setBarangSubTab('stok')}
                className={`btn ${barangSubTab === 'stok' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, padding: '0.55rem', fontSize: '0.85rem', borderRadius: '10px' }}
              >
                <FolderOpen size={16} /> Stok Gudang
              </button>
            </div>

            {/* Sub-tab Catat: Form input + riwayat mutasi */}
            {barangSubTab === 'catat' && (
              <div className="dashboard-details-grid">
                <InventoryForm
                  isOnline={isOnline}
                  onSave={handleSaveInventory}
                  showToast={showToast}
                  updateTrigger={updateTrigger}
                />
                <div className="glass-card">
                  <InventoryHistory
                    transactions={invHistory}
                    onDelete={handleDeleteInventory}
                  />
                </div>
              </div>
            )}

            {/* Sub-tab Stok: Daftar stok real-time + pencarian */}
            {barangSubTab === 'stok' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="glass-card flex-mobile-col">
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Stok Gudang Terkini</h3>
                  <div className="search-input-wrapper">
                    <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input
                      type="text"
                      placeholder="Cari barang..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="form-input"
                      style={{ paddingLeft: '2.5rem' }}
                    />
                  </div>
                </div>
                <div className="glass-card" style={{ textAlign: 'left' }}>
                  {/* Tabel Desktop */}
                  <div className="desktop-table-view">
                    <div className="table-container">
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>Nama Barang</th>
                            <th>Kategori</th>
                            <th>Stok</th>
                            <th>Satuan</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredInvItems.length === 0 ? (
                            <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>Tidak ada barang.</td></tr>
                          ) : (
                            filteredInvItems.map((item) => (
                              <tr key={item.name}>
                                <td style={{ fontWeight: 600 }}>{item.name}</td>
                                <td style={{ color: 'var(--text-secondary)' }}>{item.category}</td>
                                <td style={{ fontWeight: 800, color: item.stock === 0 ? 'var(--danger)' : item.stock < 10 ? 'var(--accent)' : 'var(--text-primary)' }}>{item.stock}</td>
                                <td>{item.unit}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {/* Kartu Mobile */}
                  <div className="mobile-card-list">
                    {filteredInvItems.length === 0 ? (
                      <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '1.5rem', fontSize: '0.85rem' }}>Tidak ada barang.</div>
                    ) : (
                      filteredInvItems.map((item) => (
                        <div key={item.name} className="mobile-data-card">
                          <div>
                            <h4 style={{ fontSize: '0.925rem', fontWeight: 700 }}>{item.name}</h4>
                            <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>{item.category}</span>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: item.stock === 0 ? 'var(--danger)' : item.stock < 10 ? 'var(--accent)' : 'var(--primary)' }}>{item.stock}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '0.2rem' }}>{item.unit}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}



        {activeTab === 'program' && (
          <ProgramManager
            programs={programs}
            onAdd={handleAddProgram}
            onDelete={handleDeleteProgram}
            showToast={showToast}
          />
        )}

        {activeTab === 'laporan' && (
          <ReportGenerator 
            showToast={showToast}
            updateTrigger={updateTrigger}
          />
        )}

        {activeTab === 'pengaturan' && (
          <SettingsPanel
            settings={settings}
            onSave={saveSettings}
            onReset={resetSettings}
            onSync={handleSyncToSheets}
            showToast={showToast}
          />
        )}
      </main>

      {/* Modal Pratinjau Foto Bukti Transaksi */}
      {activeModalImage && (
        <ImageModal
          imageUrl={activeModalImage}
          onClose={() => setActiveModalImage(null)}
        />
      )}

      {/* Toast Floating Notification System */}
      <div className="toasts-wrapper">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            <div className="toast-content">
              {toast.type === 'success' && <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />}
              {toast.type === 'info' && <Info size={18} style={{ color: 'var(--info)' }} />}
              {toast.type === 'error' && <AlertCircle size={18} style={{ color: 'var(--danger)' }} />}
              <span>{toast.message}</span>
            </div>
            <button 
              onClick={() => removeToast(toast.id)} 
              className="toast-close"
              title="Tutup notifikasi"
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
