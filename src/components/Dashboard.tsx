import React from 'react';
import type { 
  CashTransaction, 
  InventoryTransaction,
  SyncQueueItem,
  InventoryItem 
} from '../utils/storage';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  AlertTriangle, 
  Clock, 
  Package
} from 'lucide-react';

interface DashboardProps {
  onNavigateToTab: (tab: string) => void;
  cashSummary: { totalIn: number; totalOut: number; balance: number };
  queue: SyncQueueItem[];
  criticalItems: InventoryItem[];
  isAdmin: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  onNavigateToTab, 
  cashSummary,
  queue,
  criticalItems,
  isAdmin
}) => {
  const { totalIn, totalOut, balance } = cashSummary;

  // Format rupiah
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  // Kalkulasi persentase tinggi grafik batang
  const maxAmount = Math.max(totalIn, totalOut, 1000000);
  const inHeight = Math.max((totalIn / maxAmount) * 100, 8);
  const outHeight = Math.max((totalOut / maxAmount) * 100, 8);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      
      {/* Banner Mode Lihat-Saja (Tampil jika bukan admin) */}
      {!isAdmin && (
        <div 
          className="glass-card animate-in-fade" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '0.45rem', 
            padding: '0.55rem 0.85rem', 
            background: 'rgba(245, 158, 11, 0.04)', 
            border: '1px solid rgba(245, 158, 11, 0.15)',
            color: 'var(--accent)',
            fontSize: '0.75rem',
            textAlign: 'center',
            fontWeight: 600,
            overflow: 'hidden'
          }}
        >
          <AlertTriangle size={14} style={{ flexShrink: 0 }} />
          <div className="mobile-marquee-container" style={{ flex: 1, textAlign: 'left' }}>
            <span className="mobile-marquee-content">
              Anda sedang dalam Mode Lihat-Saja (Tamu). Silakan login admin melalui menu Pengaturan untuk memasukkan data kas, barang, dan program.
            </span>
          </div>
        </div>
      )}

      {/* 1. Baris Ringkasan Kartu Kas */}
      <div className="dashboard-grid">
        <div className="glass-card stat-card balance">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p className="stat-title">Saldo Kas Masjid</p>
              <h3 className="stat-value text-glow-primary">{formatRupiah(balance)}</h3>
              <p className="stat-desc">Kas bersih siap digunakan</p>
            </div>
            <div style={{ background: 'rgba(16, 185, 129, 0.08)', color: 'var(--primary)', padding: '0.45rem', borderRadius: '8px' }}>
              <Wallet size={20} />
            </div>
          </div>
        </div>

        <div className="glass-card stat-card income">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p className="stat-title">Total Pemasukan</p>
              <h3 className="stat-value" style={{ color: '#3B82F6' }}>{formatRupiah(totalIn)}</h3>
              <p className="stat-desc">Bulan berjalan</p>
            </div>
            <div style={{ background: 'rgba(59, 130, 246, 0.08)', color: '#3B82F6', padding: '0.45rem', borderRadius: '8px' }}>
              <TrendingUp size={20} />
            </div>
          </div>
        </div>

        <div className="glass-card stat-card expense">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p className="stat-title">Total Pengeluaran</p>
              <h3 className="stat-value" style={{ color: 'var(--accent)' }}>{formatRupiah(totalOut)}</h3>
              <p className="stat-desc">Bulan berjalan</p>
            </div>
            <div style={{ background: 'rgba(245, 158, 11, 0.08)', color: 'var(--accent)', padding: '0.45rem', borderRadius: '8px' }}>
              <TrendingDown size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Baris Utama: Grafik Kas & Panel Antrean/Peringatan */}
      <div className="dashboard-details-grid">
        
        {/* Grafik Kas Kustom */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '0.85rem 1rem' }}>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.15rem', textAlign: 'left' }}>Visualisasi Keuangan</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.65rem', textAlign: 'left' }}>
              Perbandingan Pemasukan vs Pengeluaran saat ini
            </p>
          </div>
          
          <div className="custom-chart-container">
            <div className="chart-bars-wrapper">
              {/* Batang Pemasukan */}
              <div className="chart-column">
                <div className="chart-bar-track">
                  <div 
                    className="chart-bar-fill" 
                    style={{ height: `${inHeight}%` }}
                  >
                    <div className="chart-tooltip">{formatRupiah(totalIn)}</div>
                  </div>
                </div>
                <span className="chart-label">Pemasukan</span>
              </div>

              {/* Batang Pengeluaran */}
              <div className="chart-column">
                <div className="chart-bar-track">
                  <div 
                    className="chart-bar-fill expense" 
                    style={{ height: `${outHeight}%` }}
                  >
                    <div className="chart-tooltip">{formatRupiah(totalOut)}</div>
                  </div>
                </div>
                <span className="chart-label">Pengeluaran</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.45rem' }}>
              <span>Efisiensi Kas: {totalIn > 0 ? Math.round(((totalIn - totalOut) / totalIn) * 100) : 0}%</span>
              <span style={{ color: balance >= 0 ? 'var(--primary)' : 'var(--danger)' }}>
                {balance >= 0 ? 'Surplus' : 'Defisit'}
              </span>
            </div>
          </div>
        </div>

        {/* Panel Kanan: Peringatan Stok & Antrean Offline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          
          {/* Antrean Sinkronisasi (Hanya muncul jika ada antrean) */}
          {queue.length > 0 && (
            <div className="glass-card" style={{ borderColor: 'var(--accent)', background: 'rgba(245, 158, 11, 0.02)', padding: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.45rem', color: 'var(--accent)' }}>
                <Clock size={16} />
                <h3 style={{ fontSize: '0.9rem', fontWeight: 800 }}>Antrean Sinkronisasi ({queue.length})</h3>
              </div>
              <p style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', marginBottom: '0.65rem', textAlign: 'left' }}>
                Disimpan di lokal dan akan disinkronkan saat koneksi pulih.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '120px', overflowY: 'auto' }}>
                {queue.map((item) => (
                  <div 
                    key={item.id} 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '0.45rem 0.65rem', 
                      background: 'rgba(255, 255, 255, 0.02)', 
                      borderRadius: '6px', 
                      border: '1px solid rgba(245, 158, 11, 0.1)',
                      fontSize: '0.75rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span className={`badge ${item.type === 'cash' ? ((item.data as CashTransaction).type === 'pemasukan' ? 'in' : 'out') : 'in'}`} style={{ padding: '0.1rem 0.3rem', fontSize: '0.6rem' }}>
                        {item.type === 'cash' ? 'Uang' : 'Barang'}
                      </span>
                      <span style={{ fontWeight: 600 }}>
                        {item.type === 'cash' 
                          ? (item.data as CashTransaction).category 
                          : (item.data as InventoryTransaction).itemName
                        }
                      </span>
                    </div>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                      {item.type === 'cash'
                        ? formatRupiah((item.data as CashTransaction).amount)
                        : `${(item.data as InventoryTransaction).amount} ${(item.data as InventoryTransaction).unit}`
                      }
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alert Stok Kritis */}
          <div className="glass-card" style={{ flex: 1, padding: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.65rem' }}>
              <Package size={16} style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontSize: '0.9rem', fontWeight: 800 }}>Inventaris & Stok Kritis</h3>
            </div>
            
            {criticalItems.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '130px', overflowY: 'auto' }}>
                {criticalItems.map((item) => (
                  <div 
                    key={item.name} 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '0.45rem 0.65rem', 
                      background: 'rgba(239, 68, 68, 0.03)', 
                      borderRadius: '6px', 
                      border: '1px solid rgba(239, 68, 68, 0.1)',
                      fontSize: '0.75rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--danger)' }}>
                      <AlertTriangle size={13} />
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</span>
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--danger)' }}>
                      {item.stock === 0 ? 'Habis' : `${item.stock} ${item.unit}`}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                Semua stok barang di gudang aman (di atas 10 unit).
              </div>
            )}
            
            <button 
              onClick={() => onNavigateToTab('inventaris')}
              className="btn btn-secondary" 
              style={{ width: '100%', marginTop: '0.75rem', fontSize: '0.75rem', padding: '0.4rem', minHeight: '32px', borderRadius: '6px' }}
            >
              Lihat Semua Inventaris
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
