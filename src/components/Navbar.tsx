import React from 'react';
import { Moon, Wifi, WifiOff, RefreshCw, Settings2, PackageCheck, FolderOpen } from 'lucide-react';

interface NavbarProps {
  isOnline: boolean;
  isSyncing: boolean;
  syncProgressMsg?: string;
  isSimulatedOffline: boolean;
  queueCount: number;
  onToggleSim: () => void;
  onManualSync: () => void;
  onOpenSettings: () => void; // Buka tab Pengaturan dari tombol gear di navbar
  mosqueName?: string; // Nama masjid dari pengaturan, fallback ke default
  activeTab?: string;
  barangSubTab?: 'catat' | 'stok';
  setBarangSubTab?: (tab: 'catat' | 'stok') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isOnline,
  isSyncing,
  syncProgressMsg,
  isSimulatedOffline,
  queueCount,
  onToggleSim,
  onManualSync,
  onOpenSettings,
  mosqueName = 'Masjid Digital',
  activeTab,
  barangSubTab,
  setBarangSubTab,
}) => {
  return (
    <header className="nav-header" style={{ alignItems: 'center' }}>
      <div className="logo-section">
        {/* Tampilan logo hanya muncul di perangkat mobile (di desktop diwakili oleh sidebar) */}
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.4rem' 
          }} 
          className="mobile-logo-wrapper"
        >
          <Moon className="logo-icon" size={20} />
          <div>
            <h1 className="logo-title" style={{ fontSize: '0.95rem', fontWeight: 800 }}>{mosqueName}</h1>
          </div>
        </div>
      </div>

      {/* Tab switcher Barang di bagian tengah header utama ketika tab Barang aktif */}
      {activeTab === 'catat_barang' && setBarangSubTab && barangSubTab && (
        <div 
          className="header-tab-switcher" 
          style={{ 
            display: 'flex', 
            gap: '0.3rem', 
            background: 'rgba(255,255,255,0.8)', 
            padding: '0.2rem', 
            borderRadius: '8px', 
            border: '1px solid var(--border-subtle)',
            alignItems: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}
        >
          <button
            onClick={() => setBarangSubTab('catat')}
            className={`btn ${barangSubTab === 'catat' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ 
              padding: '0.35rem 0.65rem', 
              fontSize: '0.75rem', 
              borderRadius: '5px', 
              minHeight: '28px', 
              gap: '0.25rem',
              border: 'none'
            }}
          >
            <PackageCheck size={12} />
            <span>Mutasi</span>
          </button>
          <button
            onClick={() => setBarangSubTab('stok')}
            className={`btn ${barangSubTab === 'stok' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ 
              padding: '0.35rem 0.65rem', 
              fontSize: '0.75rem', 
              borderRadius: '5px', 
              minHeight: '28px', 
              gap: '0.25rem',
              border: 'none'
            }}
          >
            <FolderOpen size={12} />
            <span>Stok</span>
          </button>
        </div>
      )}

      <div className="conn-panel" style={{ gap: '0.4rem' }}>
        {/* Status Koneksi */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.1rem' }}>
          <div className={`status-badge ${isOnline ? 'online' : 'offline'}`} style={{ padding: '0.25rem 0.5rem', fontSize: '0.65rem' }}>
            <span className={`status-dot ${isOnline ? 'online' : 'offline'}`} style={{ width: '4px', height: '4px' }}></span>
            {isOnline ? 'Online' : 'Offline'}
          </div>
          {isSyncing && syncProgressMsg && (
            <span style={{ 
              fontSize: '0.6rem', 
              color: 'var(--primary)', 
              fontWeight: 700, 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.25rem',
              textShadow: '0 0 8px rgba(16, 185, 129, 0.2)'
            }}>
              <RefreshCw size={8} style={{ animation: 'spin 1.5s linear infinite' }} />
              {syncProgressMsg}
            </span>
          )}
        </div>

        {/* Tombol Sinkronisasi Manual */}
        {queueCount > 0 && isOnline && (
          <button
            onClick={onManualSync}
            disabled={isSyncing}
            className="btn btn-secondary"
            style={{ padding: '0.3rem 0.55rem', fontSize: '0.75rem', gap: '0.25rem', minHeight: '32px', borderRadius: '6px' }}
            title="Sinkronkan data sekarang"
          >
            <RefreshCw size={12} style={{ animation: isSyncing ? 'spin 1.5s linear infinite' : 'none' }} />
            <span>Sync ({queueCount})</span>
          </button>
        )}

        {/* Tombol Toggle Simulasi Offline */}
        <button
          onClick={onToggleSim}
          className={`btn ${isSimulatedOffline ? 'btn-accent' : 'btn-secondary'}`}
          style={{ padding: '0.3rem 0.55rem', fontSize: '0.75rem', gap: '0.25rem', minHeight: '32px', borderRadius: '6px' }}
          title={isSimulatedOffline ? 'Aktifkan koneksi internet' : 'Simulasikan hilangnya koneksi internet'}
        >
          {isSimulatedOffline ? (
            <>
              <WifiOff size={12} />
              <span>Offline</span>
            </>
          ) : (
            <>
              <Wifi size={12} />
              <span>Online</span>
            </>
          )}
        </button>

        {/* Tombol Pengaturan */}
        <button
          onClick={onOpenSettings}
          className="btn btn-secondary"
          style={{ padding: '0.3rem 0.45rem', minHeight: '32px', borderRadius: '6px' }}
          title="Pengaturan"
          aria-label="Buka Pengaturan"
        >
          <Settings2 size={15} />
        </button>
      </div>
    </header>
  );
};
