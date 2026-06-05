import { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { CashTransactionForm } from './components/CashTransactionForm';
import { InventoryForm } from './components/InventoryForm';
import { ReportGenerator } from './components/ReportGenerator';
import { useOfflineSync } from './hooks/useOfflineSync';
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
  deleteDBSyncQueue
} from './utils/db';
import type { 
  CashTransaction, 
  InventoryTransaction,
  SyncQueueItem,
  InventoryItem
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
  Trash2
} from 'lucide-react';
import { CashHistory } from './components/CashHistory';
import { ImageModal } from './components/ImageModal';

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
  const [activeModalImage, setActiveModalImage] = useState<string | null>(null);

  // Mengambil seluruh data asinkron dari IndexedDB secara terpusat
  const loadAllData = useCallback(async () => {
    try {
      const balanceData = await getDBCashBalance();
      const currentQueue = await getDBSyncQueue();
      const allItems = await getDBInventoryItems();
      const allTx = await getDBInventoryTransactions();
      const allCash = await getDBCashTransactions();

      setCashSummary(balanceData);
      setQueueList(currentQueue);
      setInvItems(allItems);
      setInvHistory(allTx);
      setCashHistory(allCash);
      
      // Barang dengan stok di bawah 10 unit dianggap kritis
      setCriticalItems(allItems.filter(item => item.stock < 10));
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

  // Filter inventaris berdasarkan nama barang pencarian
  const filteredInvItems = invItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInvHistory = invHistory.filter(tx => 
    tx.itemName.toLowerCase().includes(searchTerm.toLowerCase())
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
      />

      {/* Tabs Menu */}
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
          Catat Kas
        </button>
        <button
          onClick={() => setActiveTab('catat_barang')}
          className={`tab-btn ${activeTab === 'catat_barang' ? 'active' : ''}`}
        >
          <PackageCheck size={18} />
          Catat Barang
        </button>
        <button
          onClick={() => setActiveTab('inventaris')}
          className={`tab-btn ${activeTab === 'inventaris' ? 'active' : ''}`}
        >
          <FolderOpen size={18} />
          Inventaris
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
          <InventoryForm
            isOnline={isOnline}
            onSave={handleSaveInventory}
            showToast={showToast}
            updateTrigger={updateTrigger}
          />
        )}

        {activeTab === 'inventaris' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Filter/Pencarian Barang */}
            <div className="glass-card flex-mobile-col">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Daftar Inventaris Gudang</h3>
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

            <div className="dashboard-details-grid">
              {/* Rekap Stok Real-Time */}
              <div className="glass-card" style={{ textAlign: 'left' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.25rem' }}>Stok Gudang Terkini</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                  Kondisi persediaan barang aktif di gudang
                </p>

                {/* Tampilan Desktop: Tabel */}
                <div className="desktop-table-view">
                  <div className="table-container">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Nama Barang</th>
                          <th>Kategori</th>
                          <th>Stok Tersedia</th>
                          <th>Satuan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredInvItems.length === 0 ? (
                          <tr>
                            <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                              Tidak ada barang ditemukan.
                            </td>
                          </tr>
                        ) : (
                          filteredInvItems.map((item) => (
                            <tr key={item.name}>
                              <td style={{ fontWeight: 600 }}>{item.name}</td>
                              <td style={{ color: 'var(--text-secondary)' }}>{item.category}</td>
                              <td style={{ fontWeight: 800, color: item.stock > 0 ? 'var(--text-primary)' : 'var(--danger)' }}>
                                {item.stock}
                              </td>
                              <td>{item.unit}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Tampilan Mobile: Kartu Vertikal */}
                <div className="mobile-card-list">
                  {filteredInvItems.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '1.5rem', fontSize: '0.85rem' }}>
                      Tidak ada barang ditemukan.
                    </div>
                  ) : (
                    filteredInvItems.map((item) => (
                      <div key={item.name} className="mobile-data-card">
                        <div>
                          <h4 style={{ fontSize: '0.925rem', fontWeight: 700 }}>{item.name}</h4>
                          <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>{item.category}</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ 
                            fontSize: '1.05rem', 
                            fontWeight: 800, 
                            color: item.stock === 0 ? 'var(--danger)' : item.stock < 10 ? 'var(--accent)' : 'var(--primary)' 
                          }}>
                            {item.stock}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '0.2rem' }}>{item.unit}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Riwayat Mutasi Logistik */}
              <div className="glass-card" style={{ textAlign: 'left' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.25rem' }}>Mutasi Terakhir</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                  Catatan keluar masuk barang di gudang
                </p>

                {/* Tampilan Desktop: Tabel */}
                <div className="desktop-table-view">
                  <div className="table-container">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Tanggal</th>
                          <th>Barang</th>
                          <th>Aktivitas</th>
                          <th>Keterangan / Donatur</th>
                          <th style={{ textAlign: 'center' }}>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredInvHistory.length === 0 ? (
                          <tr>
                            <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                              Tidak ada riwayat mutasi barang.
                            </td>
                          </tr>
                        ) : (
                          filteredInvHistory.map((tx) => (
                            <tr key={tx.id}>
                              <td>{tx.date}</td>
                              <td style={{ fontWeight: 600 }}>{tx.itemName}</td>
                              <td>
                                <span className={`badge ${tx.type === 'masuk' ? 'in' : 'out'}`} style={{ gap: '0.2rem' }}>
                                  {tx.type === 'masuk' ? 'Masuk' : 'Keluar'}
                                  <span style={{ fontWeight: 700 }}>
                                    ({tx.amount} {tx.unit})
                                  </span>
                                </span>
                              </td>
                              <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                {tx.type === 'masuk' ? (tx.donatur || 'Hamba Allah') : (tx.description || '-')}
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <button
                                  onClick={() => {
                                    if (confirm(`Apakah Anda yakin ingin menghapus mutasi barang "${tx.itemName}"?`)) {
                                      handleDeleteInventory(tx.id);
                                    }
                                  }}
                                  className="btn btn-danger"
                                  style={{ padding: '0.25rem', minHeight: '32px', minWidth: '32px', borderRadius: '6px', display: 'inline-flex' }}
                                  title="Hapus Mutasi"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Tampilan Mobile: Kartu Vertikal */}
                <div className="mobile-card-list">
                  {filteredInvHistory.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '1.5rem', fontSize: '0.85rem' }}>
                      Tidak ada riwayat mutasi barang.
                    </div>
                  ) : (
                    filteredInvHistory.map((tx) => (
                      <div key={tx.id} className="mobile-data-card" style={{ display: 'block', padding: '0.85rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                          <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{tx.date}</span>
                          <span className={`badge ${tx.type === 'masuk' ? 'in' : 'out'}`}>
                            {tx.type === 'masuk' ? 'Barang Masuk' : 'Barang Keluar'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                          <div style={{ flex: 1 }}>
                            <h4 style={{ fontSize: '0.925rem', fontWeight: 700 }}>{tx.itemName}</h4>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                              {tx.type === 'masuk' ? `Donatur: ${tx.donatur || 'Hamba Allah'}` : `Detail: ${tx.description || '-'}`}
                            </p>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: tx.type === 'masuk' ? 'var(--primary)' : 'var(--danger)' }}>
                              {tx.type === 'masuk' ? '+' : '-'}{tx.amount} {tx.unit}
                            </div>
                            <button
                              onClick={() => {
                                if (confirm(`Apakah Anda yakin ingin menghapus mutasi barang "${tx.itemName}"?`)) {
                                  handleDeleteInventory(tx.id);
                                }
                              }}
                              className="btn btn-danger"
                              style={{ padding: '0.25rem', minHeight: '32px', minWidth: '32px', borderRadius: '6px', display: 'inline-flex' }}
                              title="Hapus Mutasi"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

          </div>
        )}

        {activeTab === 'laporan' && (
          <ReportGenerator 
            showToast={showToast}
            updateTrigger={updateTrigger}
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
