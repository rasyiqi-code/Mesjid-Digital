import React from 'react';
import { Moon, Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface NavbarProps {
  isOnline: boolean;
  isSyncing: boolean;
  isSimulatedOffline: boolean;
  queueCount: number;
  onToggleSim: () => void;
  onManualSync: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isOnline,
  isSyncing,
  isSimulatedOffline,
  queueCount,
  onToggleSim,
  onManualSync,
}) => {
  return (
    <header className="nav-header">
      <div className="logo-section">
        <Moon className="logo-icon" size={32} />
        <div>
          <h1 className="logo-title">Mesjid Digital</h1>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textAlign: 'left' }}>
            Sistem Informasi & Manajemen Mandiri
          </p>
        </div>
      </div>

      <div className="conn-panel">
        {/* Status Koneksi */}
        <div className={`status-badge ${isOnline ? 'online' : 'offline'}`}>
          <span className={`status-dot ${isOnline ? 'online' : 'offline'}`}></span>
          {isOnline ? 'Tersambung (Online)' : 'Menunggu koneksi (Offline)'}
        </div>

        {/* Tombol Sinkronisasi Manual (jika ada data antrean dan sedang online) */}
        {queueCount > 0 && isOnline && (
          <button
            onClick={onManualSync}
            disabled={isSyncing}
            className="btn btn-secondary"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.775rem', gap: '0.35rem' }}
            title="Sinkronkan data sekarang"
          >
            <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
            Sync ({queueCount})
          </button>
        )}

        {/* Tombol Toggle Simulasi Offline */}
        <button
          onClick={onToggleSim}
          className={`btn ${isSimulatedOffline ? 'btn-accent' : 'btn-secondary'}`}
          style={{ padding: '0.35rem 0.75rem', fontSize: '0.775rem', gap: '0.35rem' }}
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
      </div>
    </header>
  );
};
