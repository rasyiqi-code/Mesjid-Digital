import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { CashTransactionForm } from './components/CashTransactionForm';
import { InventoryForm } from './components/InventoryForm';
import { ReportGenerator } from './components/ReportGenerator';
import { useOfflineSync } from './hooks/useOfflineSync';
import { 
  seedInitialData, 
  addCashTransactionDirectly, 
  addInventoryTransactionDirectly,
  addToSyncQueue,
  getInventoryTransactions,
  getInventoryItems
} from './utils/storage';
import type { 
  CashTransaction, 
  InventoryTransaction,
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
  PackageCheck
} from 'lucide-react';

function App() {
  // 1. Jalankan inisialisasi seeding data awal jika LocalStorage masih kosong
  useEffect(() => {
    seedInitialData();
  }, []);

  // State pemicu pembaruan UI lintas komponen
  const [updateTrigger, setUpdateTrigger] = useState<number>(0);

  const handleDataUpdated = () => {
    setUpdateTrigger((prev) => prev + 1);
  };

  // 2. Hubungkan hook sinkronisasi offline-online
  const {
    isOnline,
    isSyncing,
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
  const [invItems, setInvItems] = useState<InventoryItem[]>([]);
  const [invHistory, setInvHistory] = useState<InventoryTransaction[]>([]);

  // Update data inventaris saat tab aktif atau updateTrigger berubah
  useEffect(() => {
    setInvItems(getInventoryItems());
    setInvHistory(getInventoryTransactions());
  }, [updateTrigger, activeTab]);

  // 4. Handler penyimpanan Kas Baru
  const handleSaveCash = (data: Omit<CashTransaction, 'id' | 'date'>) => {
    const today = new Date().toISOString().split('T')[0];
    const newTx: CashTransaction = {
      ...data,
      id: `cash_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      date: today,
    };

    if (isOnline) {
      // Jika online, simpan ke database utama secara instan
      addCashTransactionDirectly(newTx);
      showToast('Transaksi Kas berhasil disimpan ke server.', 'success');
      handleDataUpdated();
    } else {
      // Jika offline, masukkan ke antrean lokal
      addToSyncQueue('cash', newTx);
      showToast('Offline: Transaksi Kas disimpan sementara di lokal.', 'info');
      handleDataUpdated();
    }
  };

  // 5. Handler penyimpanan Barang Baru
  const handleSaveInventory = (data: Omit<InventoryTransaction, 'id' | 'date'>) => {
    const today = new Date().toISOString().split('T')[0];
    const newTx: InventoryTransaction = {
      ...data,
      id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      date: today,
    };

    if (isOnline) {
      addInventoryTransactionDirectly(newTx);
      showToast('Mutasi Barang berhasil disimpan ke server.', 'success');
      handleDataUpdated();
    } else {
      addToSyncQueue('inventory', newTx);
      showToast('Offline: Mutasi Barang disimpan sementara di lokal.', 'info');
      handleDataUpdated();
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
            updateTrigger={updateTrigger} 
          />
        )}

        {activeTab === 'catat_kas' && (
          <CashTransactionForm
            isOnline={isOnline}
            onSave={handleSaveCash}
            showToast={showToast}
          />
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
            <div className="glass-card" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Daftar Inventaris Gudang</h3>
              <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
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

              {/* Riwayat Mutasi Logistik */}
              <div className="glass-card" style={{ textAlign: 'left' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.25rem' }}>Mutasi Terakhir</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                  Catatan keluar masuk barang di gudang
                </p>

                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Tanggal</th>
                        <th>Barang</th>
                        <th>Aktivitas</th>
                        <th>Keterangan / Donatur</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInvHistory.length === 0 ? (
                        <tr>
                          <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
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
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
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
