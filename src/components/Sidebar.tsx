import React from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  PackageCheck, 
  FileText, 
  Info, 
  LogIn, 
  LogOut, 
  Moon 
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setBarangSubTab: (subTab: 'catat' | 'stok') => void;
  isAdmin: boolean;
  onLogoutAdmin: () => void;
  onLogoutGuest: () => void;
  mosqueName: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  setBarangSubTab,
  isAdmin,
  onLogoutAdmin,
  onLogoutGuest,
  mosqueName
}) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Moon className="sidebar-logo-icon" size={24} />
        <span className="sidebar-logo-text">{mosqueName || 'Masjid Digital'}</span>
      </div>
      <nav className="sidebar-menu">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`sidebar-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          title="Dashboard Utama"
        >
          <LayoutDashboard size={16} />
          <span>Dashboard</span>
        </button>
        <button
          onClick={() => setActiveTab('kas')}
          className={`sidebar-btn ${activeTab === 'kas' ? 'active' : ''}`}
          title="Buku Jurnal Kas Masjid"
        >
          <BookOpen size={16} />
          <span>Kas</span>
        </button>
        <button
          onClick={() => { setActiveTab('catat_barang'); setBarangSubTab('catat'); }}
          className={`sidebar-btn ${activeTab === 'catat_barang' ? 'active' : ''}`}
          title="Inventaris & Logistik"
        >
          <PackageCheck size={16} />
          <span>Barang</span>
        </button>

        <button
          onClick={() => setActiveTab('laporan')}
          className={`sidebar-btn ${activeTab === 'laporan' ? 'active' : ''}`}
          title="Laporan & Ekspor"
        >
          <FileText size={16} />
          <span>Laporan</span>
        </button>
        <button
          onClick={() => setActiveTab('tentang')}
          className={`sidebar-btn ${activeTab === 'tentang' ? 'active' : ''}`}
          title="Tentang Aplikasi"
        >
          <Info size={16} />
          <span>Tentang</span>
        </button>
        <div style={{ flex: 1 }}></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: 'auto', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem', width: '100%' }}>
          {!isAdmin && (
            <button
              onClick={() => setActiveTab('pengaturan')}
              className="sidebar-btn"
              style={{ color: 'var(--primary)', border: 'none', padding: '0.45rem 0.75rem' }}
              title="Masuk Mode Admin"
            >
              <LogIn size={16} />
              <span>Login Admin</span>
            </button>
          )}
          <button
            onClick={isAdmin ? onLogoutAdmin : onLogoutGuest}
            className="sidebar-btn"
            style={{ 
              color: 'var(--danger)',
              border: 'none',
              padding: '0.45rem 0.75rem'
            }}
            title={isAdmin ? "Keluar Mode Admin" : "Keluar Sesi Tamu"}
          >
            <LogOut size={16} />
            <span>{isAdmin ? 'Logout Admin' : 'Keluar'}</span>
          </button>
        </div>
      </nav>
    </aside>
  );
};
