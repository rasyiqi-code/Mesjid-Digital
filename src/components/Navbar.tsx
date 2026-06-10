import React, { useState } from 'react';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Settings2, 
  PackageCheck, 
  FolderOpen, 
  PlusCircle, 
  ChevronUp, 
  LogOut,
  ArrowLeft
} from 'lucide-react';

interface NavbarProps {
  isOnline: boolean;
  isSyncing: boolean;
  syncProgressMsg?: string;
  isSimulatedOffline: boolean;
  queueCount: number;
  onToggleSim: () => void;
  onManualSync: () => void;
  onOpenSettings: () => void;
  mosqueName?: string;
  activeTab: string;
  onOpenCashDrawer?: () => void;
  barangSubTab?: 'catat' | 'stok';
  setBarangSubTab?: (tab: 'catat' | 'stok') => void;
  onOpenInventoryDrawer?: () => void;
  isProgramFormOpen?: boolean;
  onToggleProgramForm?: () => void;
  programCount?: number;
  isAdmin: boolean;
  onLogoutAdmin: () => void;
  onLogoutGuest: () => void;
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
  isAdmin,
  onLogoutAdmin,
  onLogoutGuest,
}) => {
  // State untuk menampilkan toolbar utilitas bergantian di layar mobile
  const [showMobileToolbar, setShowMobileToolbar] = useState(false);

  // Dapatkan informasi halaman dinamis secara modular
  const getPageInfo = () => {
    switch (activeTab) {
      case 'dashboard':
        return { title: 'Dashboard Utama', desc: 'Ikhtisar keuangan & logistik masjid' };
      case 'kas':
        return { title: 'Jurnal Kas Masjid', desc: 'Catatan pemasukan & pengeluaran uang' };
      case 'catat_barang':
        return { title: 'Inventaris & Logistik', desc: 'Persediaan barang & mutasi logistik' };
      case 'program':
        return { title: 'Program & Kegiatan', desc: `${programCount} kegiatan terdaftar` };
      case 'laporan':
        return { title: 'Laporan & Ekspor', desc: 'Unduh laporan keuangan & inventaris' };
      case 'pengaturan':
        return { title: 'Pengaturan Aplikasi', desc: 'Konfigurasi masjid & Google Sheets' };
      case 'tentang':
        return { title: 'Tentang Aplikasi', desc: 'Informasi sistem manajemen mandiri' };
      default:
        return { title: mosqueName, desc: 'Sistem Informasi Masjid' };
    }
  };

  const pageInfo = getPageInfo();

  return (
    <header className="nav-header" style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', width: '100%', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.65rem' }}>
      
      {/* ─── TAMPILAN MOBILE: KONDISI TOOLBAR BERGANTIAN (AKSI VS UTILITAS) ─── */}
      {showMobileToolbar ? (
        // Mode A: Toolbar Utilitas (Tampil di mobile jika di-toggle aktif)
        <div className="mobile-only" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '0.5rem' }}>
          <button 
            onClick={() => setShowMobileToolbar(false)}
            className="btn btn-secondary"
            style={{ padding: '0.25rem 0.5rem', minHeight: '30px', borderRadius: '6px', fontSize: '0.75rem', gap: '0.2rem' }}
          >
            <ArrowLeft size={12} />
            <span>Kembali</span>
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            {/* Lencana Peran Ringkas */}
            <div style={{ padding: '0.2rem 0.4rem', fontSize: '0.6rem', background: isAdmin ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)', color: isAdmin ? 'var(--primary)' : 'var(--accent)', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '4px', fontWeight: 700 }}>
              {isAdmin ? 'Admin' : 'Tamu'}
            </div>

            {/* Tombol Sinkronisasi */}
            {queueCount > 0 && isOnline && (
              <button
                onClick={onManualSync}
                disabled={isSyncing}
                className="btn btn-secondary"
                style={{ padding: '0.25rem 0.45rem', fontSize: '0.65rem', gap: '0.2rem', minHeight: '30px', borderRadius: '5px' }}
              >
                <RefreshCw size={10} style={{ animation: isSyncing ? 'spin 1.5s linear infinite' : 'none' }} />
                <span>Sync ({queueCount})</span>
              </button>
            )}

            {/* Tombol Wifi Simulasi */}
            <button
              onClick={onToggleSim}
              className={`btn ${isSimulatedOffline ? 'btn-accent' : 'btn-secondary'}`}
              style={{ padding: '0.25rem 0.45rem', minHeight: '30px', borderRadius: '5px' }}
              title={isSimulatedOffline ? 'Aktifkan Internet' : 'Matikan Internet (Simulasi)'}
            >
              {isSimulatedOffline ? <WifiOff size={11} /> : <Wifi size={11} />}
            </button>

            {/* Tombol Pengaturan */}
            <button
              onClick={() => { onOpenSettings(); setShowMobileToolbar(false); }}
              className="btn btn-secondary"
              style={{ padding: '0.25rem 0.35rem', minHeight: '30px', borderRadius: '5px' }}
            >
              <Settings2 size={11} />
            </button>

            {/* Tombol Keluar Sesi */}
            <button
              onClick={() => { (isAdmin ? onLogoutAdmin : onLogoutGuest)(); setShowMobileToolbar(false); }}
              className="btn btn-secondary"
              style={{ padding: '0.25rem 0.35rem', minHeight: '30px', borderRadius: '5px', color: 'var(--danger)' }}
            >
              <LogOut size={11} />
            </button>
          </div>
        </div>
      ) : (
        // Mode B: Judul Halaman & Tombol Aksi Utama (Tampilan Mobile Bawaan)
        <div className="mobile-only" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '0.5rem' }}>
          
          {/* Sisi Kiri: Judul Halaman + Indikator Koneksi Kecil */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              {pageInfo.title}
            </h2>
            {/* Status dot online/offline ringkas */}
            <span 
              className={`status-dot ${isOnline ? 'online' : 'offline'}`} 
              style={{ width: '6px', height: '6px', borderRadius: '50%', display: 'inline-block', boxShadow: isOnline ? '0 0 6px var(--primary)' : '0 0 6px var(--danger)' }}
              title={isOnline ? 'Online' : 'Offline'}
            />
          </div>

          {/* Sisi Kanan: Switcher / Aksi Utama / Tombol Buka Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            {/* Switcher Tab Barang */}
            {activeTab === 'catat_barang' && setBarangSubTab && barangSubTab && (
              <div style={{ display: 'flex', gap: '0.15rem', background: 'rgba(0,0,0,0.03)', padding: '0.15rem', borderRadius: '6px', border: '1px solid var(--border-subtle)', alignItems: 'center' }}>
                <button
                  onClick={() => setBarangSubTab('catat')}
                  className={`btn ${barangSubTab === 'catat' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.65rem', borderRadius: '4px', minHeight: '24px', border: 'none' }}
                >
                  Mutasi
                </button>
                <button
                  onClick={() => setBarangSubTab('stok')}
                  className={`btn ${barangSubTab === 'stok' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.65rem', borderRadius: '4px', minHeight: '24px', border: 'none' }}
                >
                  Stok
                </button>
              </div>
            )}

            {/* Tombol Aksi Halaman (Tambah Transaksi/Mutasi/Program) - Icon Only di Mobile */}
            {activeTab === 'kas' && onOpenCashDrawer && isAdmin && (
              <button
                onClick={onOpenCashDrawer}
                className="btn btn-primary"
                style={{ padding: '0.3rem 0.5rem', minHeight: '30px', borderRadius: '6px' }}
                title="Tambah Transaksi"
              >
                <PlusCircle size={13} />
              </button>
            )}

            {activeTab === 'catat_barang' && barangSubTab === 'catat' && onOpenInventoryDrawer && isAdmin && (
              <button
                onClick={onOpenInventoryDrawer}
                className="btn btn-primary"
                style={{ padding: '0.3rem 0.5rem', minHeight: '30px', borderRadius: '6px' }}
                title="Catat Mutasi"
              >
                <PlusCircle size={13} />
              </button>
            )}

            {activeTab === 'program' && onToggleProgramForm && isAdmin && (
              <button
                onClick={onToggleProgramForm}
                className={`btn ${isProgramFormOpen ? 'btn-secondary' : 'btn-primary'}`}
                style={{ padding: '0.3rem 0.5rem', minHeight: '30px', borderRadius: '6px' }}
                title={isProgramFormOpen ? 'Tutup Form' : 'Tambah Program'}
              >
                {isProgramFormOpen ? <ChevronUp size={13} /> : <PlusCircle size={13} />}
              </button>
            )}

            {/* Tombol Buka Toolbar Utilitas (Menggantikan gear langsung) */}
            <button
              onClick={() => setShowMobileToolbar(true)}
              className="btn btn-secondary"
              style={{ padding: '0.3rem 0.45rem', minHeight: '30px', borderRadius: '6px' }}
              title="Buka Toolbar Status & Pengaturan"
            >
              <Settings2 size={13} />
            </button>
          </div>

        </div>
      )}

      {/* ─── TAMPILAN DESKTOP (Statis & Lengkap Berdampingan - Selalu Terlihat di Layar Lebar) ─── */}
      <div className="desktop-only" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        
        {/* Sisi Kiri: Judul Halaman Desktop */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            {pageInfo.title}
          </h2>
          <p style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', margin: '0.15rem 0 0 0' }}>
            {pageInfo.desc}
          </p>
        </div>

        {/* Sisi Rangan Desktop: Aksi & Utilitas Jaringan */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {/* Switcher Sub-tab Barang */}
          {activeTab === 'catat_barang' && setBarangSubTab && barangSubTab && (
            <div style={{ display: 'flex', gap: '0.2rem', background: 'rgba(0,0,0,0.03)', padding: '0.15rem', borderRadius: '6px', border: '1px solid var(--border-subtle)', alignItems: 'center' }}>
              <button
                onClick={() => setBarangSubTab('catat')}
                className={`btn ${barangSubTab === 'catat' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem', borderRadius: '4px', minHeight: '26px', gap: '0.2rem', border: 'none' }}
              >
                <PackageCheck size={11} />
                <span>Mutasi</span>
              </button>
              <button
                onClick={() => setBarangSubTab('stok')}
                className={`btn ${barangSubTab === 'stok' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem', borderRadius: '4px', minHeight: '26px', gap: '0.2rem', border: 'none' }}
              >
                <FolderOpen size={11} />
                <span>Stok</span>
              </button>
            </div>
          )}

          {/* Tombol Aksi Halaman */}
          {activeTab === 'kas' && onOpenCashDrawer && isAdmin && (
            <button
              onClick={onOpenCashDrawer}
              className="btn btn-primary"
              style={{ gap: '0.3rem', padding: '0.35rem 0.75rem', fontSize: '0.75rem', minHeight: '32px', borderRadius: '6px' }}
            >
              <PlusCircle size={13} />
              <span>Tambah Transaksi</span>
            </button>
          )}

          {activeTab === 'catat_barang' && barangSubTab === 'catat' && onOpenInventoryDrawer && isAdmin && (
            <button
              onClick={onOpenInventoryDrawer}
              className="btn btn-primary"
              style={{ gap: '0.3rem', padding: '0.35rem 0.75rem', fontSize: '0.75rem', minHeight: '32px', borderRadius: '6px' }}
            >
              <PlusCircle size={13} />
              <span>Catat Mutasi</span>
            </button>
          )}

          {activeTab === 'program' && onToggleProgramForm && isAdmin && (
            <button
              onClick={onToggleProgramForm}
              className={`btn ${isProgramFormOpen ? 'btn-secondary' : 'btn-primary'}`}
              style={{ gap: '0.3rem', padding: '0.35rem 0.75rem', fontSize: '0.75rem', minHeight: '32px', borderRadius: '6px' }}
            >
              {isProgramFormOpen ? <ChevronUp size={13} /> : <PlusCircle size={13} />}
              <span>{isProgramFormOpen ? 'Tutup Form' : 'Tambah Program'}</span>
            </button>
          )}

          {/* Pembatas */}
          <div style={{ width: '1px', height: '18px', background: 'var(--border-subtle)', margin: '0 0.15rem' }} />

          {/* Panel status jaringan & pengaturan */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.15rem' }}>
              <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                <div className="status-badge" style={{ padding: '0.2rem 0.45rem', fontSize: '0.625rem', minHeight: '22px', background: isAdmin ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)', color: isAdmin ? 'var(--primary)' : 'var(--accent)', border: '1px solid rgba(0,0,0,0.05)' }}>
                  {isAdmin ? 'Admin' : 'Lihat-Saja'}
                </div>
                <div className={`status-badge ${isOnline ? 'online' : 'offline'}`} style={{ padding: '0.2rem 0.45rem', fontSize: '0.625rem', minHeight: '22px' }}>
                  <span className={`status-dot ${isOnline ? 'online' : 'offline'}`} style={{ width: '4px', height: '4px' }}></span>
                  {isOnline ? 'Online' : 'Offline'}
                </div>
              </div>
              {isSyncing && syncProgressMsg && (
                <span style={{ fontSize: '0.55rem', color: 'var(--primary)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.15rem' }}>
                  <RefreshCw size={8} style={{ animation: 'spin 1.5s linear infinite' }} />
                  {syncProgressMsg}
                </span>
              )}
            </div>

            {queueCount > 0 && isOnline && (
              <button
                onClick={onManualSync}
                disabled={isSyncing}
                className="btn btn-secondary"
                style={{ padding: '0.25rem 0.45rem', fontSize: '0.7rem', gap: '0.2rem', minHeight: '28px', borderRadius: '5px' }}
              >
                <RefreshCw size={10} style={{ animation: isSyncing ? 'spin 1.5s linear infinite' : 'none' }} />
                <span>Sync ({queueCount})</span>
              </button>
            )}

            <button
              onClick={onToggleSim}
              className={`btn ${isSimulatedOffline ? 'btn-accent' : 'btn-secondary'}`}
              style={{ padding: '0.25rem 0.45rem', fontSize: '0.7rem', gap: '0.2rem', minHeight: '28px', borderRadius: '5px' }}
            >
              {isSimulatedOffline ? <WifiOff size={10} /> : <Wifi size={10} />}
              <span>{isSimulatedOffline ? 'Offline' : 'Online'}</span>
            </button>

            <button
              onClick={onOpenSettings}
              className="btn btn-secondary"
              style={{ padding: '0.25rem 0.35rem', minHeight: '28px', borderRadius: '5px' }}
            >
              <Settings2 size={12} />
            </button>

            <button
              onClick={isAdmin ? onLogoutAdmin : onLogoutGuest}
              className="btn btn-secondary hover-danger-btn"
              style={{ padding: '0.25rem 0.35rem', minHeight: '28px', borderRadius: '5px', color: 'var(--danger)' }}
            >
              <LogOut size={12} />
            </button>
          </div>

        </div>

      </div>

    </header>
  );
};
