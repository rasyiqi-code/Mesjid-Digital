import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { AdminLoginLayout } from './components/AdminLoginLayout';
import { Dashboard } from './components/Dashboard';
import { CashHistory } from './components/CashHistory';
import { ImageModal } from './components/ImageModal';
import { InventoryHistory } from './components/InventoryHistory';
import { ProgramManager } from './components/ProgramManager';
import { SettingsPanel } from './components/SettingsPanel';
import { ReportGenerator } from './components/ReportGenerator';
import { CashTransactionForm } from './components/CashTransactionForm';
import { InventoryForm } from './components/InventoryForm';
import { useMosqueData } from './hooks/useMosqueData';
import { 
  Info, 
  CheckCircle2, 
  AlertCircle, 
  X,
  Search,
} from 'lucide-react';

function App() {
  const {
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
    isOnline,
    isSyncing,
    syncProgressMsg,
    queueCount,
    isSimulatedOffline,
    toasts,
    removeToast,
    cashSummary,
    queueList,
    criticalItems,
    cashHistory,
    invHistory,
    programs,
    filteredInvItems,
    settings,

    // Handlers
    handleLoginAdmin,
    handleResetAdminPassword,
    handleLogoutAdmin,
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
  } = useMosqueData();

  // Render Halaman Login Penuh (Fullscreen) tanpa header dan sidebar jika bukan Admin
  if (activeTab === 'pengaturan' && !isAdmin) {
    return (
      <AdminLoginLayout 
        mosqueName={settings.mosqueName}
        onLogin={handleLoginAdmin}
        onResetPassword={handleResetAdminPassword}
        onCancel={() => setActiveTab('dashboard')}
      />
    );
  }

  return (
    <div className="app-layout">
      {/* Sidebar untuk Desktop */}
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setBarangSubTab={setBarangSubTab}
        isAdmin={isAdmin}
        onLogoutAdmin={handleLogoutAdmin}
        mosqueName={settings.mosqueName}
      />

      {/* Floating Pill Menu untuk Mobile */}
      <MobileNav 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setBarangSubTab={setBarangSubTab}
      />

      {/* Pembungkus Konten Utama */}
      <div className="main-content">
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
          activeTab={activeTab}
          barangSubTab={barangSubTab}
          setBarangSubTab={setBarangSubTab}
          onOpenCashDrawer={() => setIsCashDrawerOpen(true)}
          onOpenInventoryDrawer={() => setIsInventoryDrawerOpen(true)}
          isProgramFormOpen={isProgramFormOpen}
          onToggleProgramForm={() => setIsProgramFormOpen(!isProgramFormOpen)}
          programCount={programs.length}
          isAdmin={isAdmin}
        />

        <main style={{ minHeight: '60vh' }} className="animate-in-fade">
          {activeTab === 'dashboard' && (
            <Dashboard 
              onNavigateToTab={(tab) => {
                if (tab === 'inventaris') {
                  setActiveTab('catat_barang');
                  setBarangSubTab('stok');
                } else {
                  setActiveTab(tab);
                }
              }} 
              cashSummary={cashSummary}
              queue={queueList}
              criticalItems={criticalItems}
              isAdmin={isAdmin}
            />
          )}

          {activeTab === 'kas' && (
            <div className="glass-card animate-in-fade" style={{ textAlign: 'left' }}>
              <CashHistory
                cashTransactions={cashHistory}
                onDelete={handleDeleteCash}
                onViewImage={(url) => setActiveModalImage(url)}
              />
            </div>
          )}

          {activeTab === 'catat_barang' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {/* Sub-tab Mutasi: Riwayat mutasi barang saja */}
              {barangSubTab === 'catat' && (
                <div className="glass-card animate-in-fade">
                  <InventoryHistory
                    transactions={invHistory}
                    onDelete={handleDeleteInventory}
                  />
                </div>
              )}

              {/* Sub-tab Stok: Daftar stok real-time + pencarian */}
              {barangSubTab === 'stok' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div className="glass-card flex-mobile-col" style={{ padding: '0.75rem 1rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Stok Gudang Terkini</h3>
                    <div className="search-input-wrapper">
                      <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                      <input
                        type="text"
                        placeholder="Cari barang..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="form-input"
                        style={{ paddingLeft: '2.1rem', minHeight: '34px', fontSize: '0.8rem' }}
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
                              <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '1.5rem' }}>Tidak ada barang.</td></tr>
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
                        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '1rem', fontSize: '0.8rem' }}>Tidak ada barang.</div>
                      ) : (
                        filteredInvItems.map((item) => (
                          <div key={item.name} className="mobile-data-card" style={{ padding: '0.65rem 0.85rem' }}>
                            <div>
                               <h4 style={{ fontSize: '0.85rem', fontWeight: 700 }}>{item.name}</h4>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{item.category}</span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: item.stock === 0 ? 'var(--danger)' : item.stock < 10 ? 'var(--accent)' : 'var(--primary)' }}>{item.stock}</span>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginLeft: '0.15rem' }}>{item.unit}</span>
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
              showForm={isProgramFormOpen}
              setShowForm={setIsProgramFormOpen}
            />
          )}

          {activeTab === 'laporan' && (
            <ReportGenerator 
              showToast={showToast}
              updateTrigger={0} // Trigger internal diatur oleh input form laporan
            />
          )}

          {activeTab === 'pengaturan' && isAdmin && (
            <SettingsPanel
              settings={settings}
              onSave={saveSettings}
              onReset={resetSettings}
              onSync={handleSyncToSheets}
              showToast={showToast}
            />
          )}

          {activeTab === 'tentang' && (
            <div className="glass-card animate-in-fade" style={{ textAlign: 'left', padding: '1.25rem', maxWidth: '600px', margin: '2rem auto', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ background: 'rgba(6, 182, 212, 0.08)', color: 'var(--info)', padding: '0.55rem', borderRadius: '10px' }}>
                  <Info size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Tentang Aplikasi
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.15rem 0 0 0' }}>
                    Sistem Informasi Manajemen Mandiri Masjid
                  </p>
                </div>
              </div>
              <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <p>
                  <strong style={{ color: 'var(--text-primary)' }}>Masjid Digital</strong> adalah platform administrasi modern yang dirancang khusus untuk mempermudah pengelolaan data keuangan, inventaris barang, serta jadwal kegiatan masjid secara mandiri, aman, dan efisien.
                </p>
                <p style={{ marginTop: '0.75rem' }}>
                  Seluruh data disimpan secara lokal di dalam basis data browser (IndexedDB) perangkat Anda demi privasi optimal, dengan opsi sinkronisasi real-time ke Google Sheets & pencadangan bukti fisik otomatis ke Google Drive melalui Google Apps Script.
                </p>
                <div style={{ marginTop: '1.25rem', padding: '0.75rem', background: 'rgba(0, 0, 0, 0.02)', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '0.75rem' }}>
                  <strong>Spesifikasi Sistem:</strong>
                  <br />• Versi Aplikasi: 1.3.0
                  <br />• Teknologi Penyimpanan: IndexedDB (Lokal Perangkat)
                  <br />• Lisensi: Open Source / Mandiri
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Footer khusus mobile */}
        <footer className="mobile-only" style={{ textAlign: 'center', padding: '1.25rem 0.5rem 0.5rem 0.5rem', marginTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
          <p style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', margin: 0 }}>
            <strong>Masjid Digital</strong> v1.3.0 · Data disimpan lokal di IndexedDB.
          </p>
        </footer>

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
                {toast.type === 'success' && <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />}
                {toast.type === 'info' && <Info size={16} style={{ color: 'var(--info)' }} />}
                {toast.type === 'error' && <AlertCircle size={16} style={{ color: 'var(--danger)' }} />}
                <span>{toast.message}</span>
              </div>
              <button 
                onClick={() => removeToast(toast.id)} 
                className="toast-close"
                title="Tutup notifikasi"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Drawer Formulir Transaksi Kas */}
      {isCashDrawerOpen && (
        <div className="drawer-overlay" onClick={() => setIsCashDrawerOpen(false)} />
      )}
      <div className={`drawer ${isCashDrawerOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <h3 className="drawer-title">Tambah Transaksi Kas</h3>
          <button 
            onClick={() => setIsCashDrawerOpen(false)} 
            className="drawer-close"
            title="Tutup panel"
          >
            <X size={16} />
          </button>
        </div>
        <div className="drawer-body">
          <CashTransactionForm
            isOnline={isOnline}
            onSave={async (data) => {
              await handleSaveCash(data);
              setIsCashDrawerOpen(false);
            }}
            showToast={showToast}
            sheetsConfig={settings.appsScriptUrl ? { url: settings.appsScriptUrl, token: settings.appsScriptToken } : undefined}
          />
        </div>
      </div>

      {/* Drawer Formulir Logistik Barang */}
      {isInventoryDrawerOpen && (
        <div className="drawer-overlay" onClick={() => setIsInventoryDrawerOpen(false)} />
      )}
      <div className={`drawer ${isInventoryDrawerOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <h3 className="drawer-title">Catat Mutasi Barang</h3>
          <button 
            onClick={() => setIsInventoryDrawerOpen(false)} 
            className="drawer-close"
            title="Tutup panel"
          >
            <X size={16} />
          </button>
        </div>
        <div className="drawer-body">
          <InventoryForm
            isOnline={isOnline}
            onSave={async (data) => {
              await handleSaveInventory(data);
              setIsInventoryDrawerOpen(false);
            }}
            showToast={showToast}
            updateTrigger={0}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
