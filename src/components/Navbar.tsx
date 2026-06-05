import React from 'react';
import { Moon, Wifi, WifiOff, RefreshCw, Settings2 } from 'lucide-react';

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
}) => {
  return (
    <header className="nav-header">
      <div className="logo-section">
        <Moon className="logo-icon" size={32} />
        <div>
          <h1 className="logo-title">{mosqueName}</h1>
          <p className="logo-desc">
            Sistem Informasi &amp; Manajemen Mandiri
          </p>
        </div>
      </div>

      <div className="conn-panel">
        {/* Status Koneksi & Progres Sinkronisasi */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem' }}>
          <div className={`status-badge ${isOnline ? 'online' : 'offline'}`}>
            <span className={`status-dot ${isOnline ? 'online' : 'offline'}`}></span>
            {isOnline ? 'Tersambung (Online)' : 'Menunggu koneksi (Offline)'}
          </div>
          {isSyncing && syncProgressMsg && (
            <span style={{ 
              fontSize: '0.65rem', 
              color: 'var(--primary)', 
              fontWeight: 700, 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.25rem',
              textShadow: '0 0 8px rgba(16, 185, 129, 0.2)'
            }}>
              <RefreshCw size={10} style={{ animation: 'spin 1.5s linear infinite' }} />
              {syncProgressMsg}
            </span>
          )}
        </div>

        {/* Tombol Sinkronisasi Manual (jika ada data antrean dan sedang online) */}
        {queueCount > 0 && isOnline && (
          <button
            onClick={onManualSync}
            disabled={isSyncing}
            className="btn btn-secondary"
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.775rem', gap: '0.35rem', minHeight: '38px' }}
            title="Sinkronkan data sekarang"
          >
            <RefreshCw size={14} style={{ animation: isSyncing ? 'spin 1.5s linear infinite' : 'none' }} />
            Sync ({queueCount})
          </button>
        )}

        {/* Tombol Toggle Simulasi Offline */}
        <button
          onClick={onToggleSim}
          className={`btn ${isSimulatedOffline ? 'btn-accent' : 'btn-secondary'}`}
          style={{ padding: '0.4rem 0.75rem', fontSize: '0.775rem', gap: '0.35rem', minHeight: '38px' }}
          title={isSimulatedOffline ? 'Aktifkan koneksi internet' : 'Simulasikan hilangnya koneksi internet'}
        >
          {isSimulatedOffline ? (
            <>
              <WifiOff size={14} />
              Simulasi Offline
            </>
          ) : (
            <>
              <Wifi size={14} />
              Simulasi Online
            </>
          )}
        </button>

        {/* Tombol Pengaturan — dipindah ke sini agar bottom nav lebih ringkas */}
        <button
          onClick={onOpenSettings}
          className="btn btn-secondary"
          style={{ padding: '0.4rem 0.6rem', minHeight: '38px' }}
          title="Pengaturan"
          aria-label="Buka Pengaturan"
        >
          <Settings2 size={18} />
        </button>
      </div>
    </header>
  );
};
