import React from 'react';
import { Moon, Wifi, WifiOff, RefreshCw, Settings2, PackageCheck, FolderOpen, PlusCircle, ChevronUp } from 'lucide-react';

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
  activeTab: string;
  onOpenCashDrawer?: () => void;
  barangSubTab?: 'catat' | 'stok';
  setBarangSubTab?: (tab: 'catat' | 'stok') => void;
  onOpenInventoryDrawer?: () => void;
  isProgramFormOpen?: boolean;
  onToggleProgramForm?: () => void;
  programCount?: number;
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
  onOpenInventoryDrawer,
  onOpenCashDrawer,
  isProgramFormOpen,
  onToggleProgramForm,
  programCount = 0,
}) => {
  // Dapatkan informasi halaman dinamis secara modular
  const getPageInfo = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: 'Dashboard Utama',
          desc: 'Ikhtisar keuangan & logistik masjid'
        };
      case 'kas':
        return {
          title: 'Jurnal Kas Masjid',
          desc: 'Catatan pemasukan & pengeluaran uang real-time'
        };
      case 'catat_barang':
        return {
          title: 'Inventaris & Logistik',
          desc: 'Persediaan barang & mutasi logistik masjid'
        };
      case 'program':
        return {
          title: 'Program & Kegiatan',
          desc: `${programCount} kegiatan terdaftar`
        };
      case 'laporan':
        return {
          title: 'Laporan & Ekspor',
          desc: 'Unduh laporan keuangan & inventaris'
        };
      case 'pengaturan':
        return {
          title: 'Pengaturan Aplikasi',
          desc: 'Konfigurasi masjid & Google Sheets'
        };
      default:
        return {
          title: mosqueName,
          desc: 'Sistem Informasi Masjid'
        };
    }
  };

  const pageInfo = getPageInfo();

  return (
    <header className="nav-header" style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', width: '100%', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.65rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '0.65rem' }}>
        
        {/* Sisi Kiri: Logo Mobile (jika mobile) + Informasi Halaman Aktif */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
          {/* Logo Mobile */}
          <div className="mobile-only" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
            <Moon className="logo-icon" size={18} />
            <h1 className="logo-title" style={{ fontSize: '0.9rem', fontWeight: 800 }}>{mosqueName}</h1>
          </div>
          {/* Judul Halaman Utama */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              {pageInfo.title}
            </h2>
            <p className="desktop-only" style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', margin: '0.15rem 0 0 0' }}>
              {pageInfo.desc}
            </p>
          </div>
        </div>

        {/* Sisi Kanan: Switcher + Aksi Drawer + Status Koneksi */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          
          {/* Switcher Sub-tab Barang */}
          {activeTab === 'catat_barang' && setBarangSubTab && barangSubTab && (
            <div 
              style={{ 
                display: 'flex', 
                gap: '0.2rem', 
                background: 'rgba(0,0,0,0.03)', 
                padding: '0.15rem', 
                borderRadius: '6px', 
                border: '1px solid var(--border-subtle)',
                alignItems: 'center'
              }}
            >
              <button
                onClick={() => setBarangSubTab('catat')}
                className={`btn ${barangSubTab === 'catat' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ 
                  padding: '0.3rem 0.6rem', 
                  fontSize: '0.7rem', 
                  borderRadius: '4px', 
                  minHeight: '26px', 
                  gap: '0.2rem',
                  border: 'none'
                }}
              >
                <PackageCheck size={11} />
                <span>Mutasi</span>
              </button>
              <button
                onClick={() => setBarangSubTab('stok')}
                className={`btn ${barangSubTab === 'stok' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ 
                  padding: '0.3rem 0.6rem', 
                  fontSize: '0.7rem', 
                  borderRadius: '4px', 
                  minHeight: '26px', 
                  gap: '0.2rem',
                  border: 'none'
                }}
              >
                <FolderOpen size={11} />
                <span>Stok</span>
              </button>
            </div>
          )}

          {/* Tombol Aksi Halaman Kas (Tambah Transaksi) */}
          {activeTab === 'kas' && onOpenCashDrawer && (
            <button
              onClick={onOpenCashDrawer}
              className="btn btn-primary"
              style={{ gap: '0.3rem', padding: '0.35rem 0.75rem', fontSize: '0.75rem', minHeight: '32px', borderRadius: '6px' }}
            >
              <PlusCircle size={13} />
              <span>Tambah Transaksi</span>
            </button>
          )}

          {/* Tombol Aksi Halaman Barang (Catat Mutasi) */}
          {activeTab === 'catat_barang' && barangSubTab === 'catat' && onOpenInventoryDrawer && (
            <button
              onClick={onOpenInventoryDrawer}
              className="btn btn-primary"
              style={{ gap: '0.3rem', padding: '0.35rem 0.75rem', fontSize: '0.75rem', minHeight: '32px', borderRadius: '6px' }}
            >
              <PlusCircle size={13} />
              <span>Catat Mutasi</span>
            </button>
          )}

          {/* Tombol Aksi Halaman Program (Tambah/Tutup Program) */}
          {activeTab === 'program' && onToggleProgramForm && (
            <button
              onClick={onToggleProgramForm}
              className={`btn ${isProgramFormOpen ? 'btn-secondary' : 'btn-primary'}`}
              style={{ gap: '0.3rem', padding: '0.35rem 0.75rem', fontSize: '0.75rem', minHeight: '32px', borderRadius: '6px' }}
            >
              {isProgramFormOpen ? <ChevronUp size={13} /> : <PlusCircle size={13} />}
              <span>{isProgramFormOpen ? 'Tutup Form' : 'Tambah Program'}</span>
            </button>
          )}

          {/* Pembatas vertikal untuk memisahkan aksi halaman dengan status global (Hanya Desktop) */}
          <div className="desktop-only" style={{ width: '1px', height: '18px', background: 'var(--border-subtle)', margin: '0 0.15rem' }}></div>

          {/* Panel status jaringan & pengaturan */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            
            {/* Indikator Online/Offline */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <div className={`status-badge ${isOnline ? 'online' : 'offline'}`} style={{ padding: '0.2rem 0.45rem', fontSize: '0.625rem', minHeight: '22px' }}>
                <span className={`status-dot ${isOnline ? 'online' : 'offline'}`} style={{ width: '4px', height: '4px' }}></span>
                {isOnline ? 'Online' : 'Offline'}
              </div>
              {isSyncing && syncProgressMsg && (
                <span style={{ 
                  fontSize: '0.55rem', 
                  color: 'var(--primary)', 
                  fontWeight: 700, 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.15rem' 
                }}>
                  <RefreshCw size={8} style={{ animation: 'spin 1.5s linear infinite' }} />
                  {syncProgressMsg}
                </span>
              )}
            </div>

            {/* Tombol Sinkronisasi (Hanya muncul jika ada antrean) */}
            {queueCount > 0 && isOnline && (
              <button
                onClick={onManualSync}
                disabled={isSyncing}
                className="btn btn-secondary"
                style={{ padding: '0.25rem 0.45rem', fontSize: '0.7rem', gap: '0.2rem', minHeight: '28px', borderRadius: '5px' }}
                title="Sinkronkan data ke Google Sheets"
              >
                <RefreshCw size={10} style={{ animation: isSyncing ? 'spin 1.5s linear infinite' : 'none' }} />
                <span>Sync ({queueCount})</span>
              </button>
            )}

            {/* Tombol Toggle Koneksi Simulasi */}
            <button
              onClick={onToggleSim}
              className={`btn ${isSimulatedOffline ? 'btn-accent' : 'btn-secondary'}`}
              style={{ padding: '0.25rem 0.45rem', fontSize: '0.7rem', gap: '0.2rem', minHeight: '28px', borderRadius: '5px' }}
              title={isSimulatedOffline ? 'Aktifkan kembali koneksi internet' : 'Matikan koneksi internet (Simulasi)'}
            >
              {isSimulatedOffline ? <WifiOff size={10} /> : <Wifi size={10} />}
              <span className="desktop-only">{isSimulatedOffline ? 'Offline' : 'Online'}</span>
            </button>

            {/* Tombol Pengaturan */}
            <button
              onClick={onOpenSettings}
              className="btn btn-secondary"
              style={{ padding: '0.25rem 0.35rem', minHeight: '28px', borderRadius: '5px' }}
              title="Pengaturan"
              aria-label="Pengaturan"
            >
              <Settings2 size={12} />
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
