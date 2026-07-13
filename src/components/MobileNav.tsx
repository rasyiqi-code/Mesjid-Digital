import React from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  PackageCheck, 
  FileText 
} from 'lucide-react';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setBarangSubTab: (subTab: 'catat' | 'stok') => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  setActiveTab,
  setBarangSubTab
}) => {
  return (
    <nav className="mobile-nav">
      <button
        onClick={() => setActiveTab('dashboard')}
        className={`mobile-nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
      >
        <LayoutDashboard size={16} />
        <span>Dashboard</span>
      </button>
      <button
        onClick={() => setActiveTab('kas')}
        className={`mobile-nav-btn ${activeTab === 'kas' ? 'active' : ''}`}
      >
        <BookOpen size={16} />
        <span>Kas</span>
      </button>
      <button
        onClick={() => { setActiveTab('catat_barang'); setBarangSubTab('catat'); }}
        className={`mobile-nav-btn ${activeTab === 'catat_barang' ? 'active' : ''}`}
      >
        <PackageCheck size={16} />
        <span>Barang</span>
      </button>

      <button
        onClick={() => setActiveTab('laporan')}
        className={`mobile-nav-btn ${activeTab === 'laporan' ? 'active' : ''}`}
      >
        <FileText size={16} />
        <span>Laporan</span>
      </button>
    </nav>
  );
};
