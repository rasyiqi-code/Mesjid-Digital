import React from 'react';
import { 
  getCashBalance, 
  getInventoryItems, 
  getSyncQueue
} from '../utils/storage';
import type { 
  CashTransaction, 
  InventoryTransaction 
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
  // Trigger update state dari luar
  updateTrigger: number;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigateToTab }) => {
  // Ambil saldo kas
  const { totalIn, totalOut, balance } = getCashBalance();

  // Ambil barang inventaris
  const items = getInventoryItems();

  // Ambil data antrean offline
  const queue = getSyncQueue();

  // Hitung barang dengan stok kritis (kurang dari 10 kg/liter/pcs)
  const criticalItems = items.filter(item => item.stock < 10);

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* 1. Baris Ringkasan Kartu Kas */}
      <div className="dashboard-grid">
        <div className="glass-card stat-card balance">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p className="stat-title">Saldo Kas Masjid</p>
              <h3 className="stat-value text-glow-primary">{formatRupiah(balance)}</h3>
              <p className="stat-desc">Kas bersih siap digunakan</p>
            </div>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)', padding: '0.6rem', borderRadius: '10px' }}>
              <Wallet size={24} />
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
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', padding: '0.6rem', borderRadius: '10px' }}>
              <TrendingUp size={24} />
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
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent)', padding: '0.6rem', borderRadius: '10px' }}>
              <TrendingDown size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Baris Utama: Grafik Kas & Panel Antrean/Peringatan */}
      <div className="dashboard-details-grid">
        
        {/* Grafik Kas Kustom */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem', textAlign: 'left' }}>Visualisasi Keuangan</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', textAlign: 'left' }}>
              Perbandingan Pemasukan vs Pengeluaran saat ini
            </p>
          </div>
          
          <div className="custom-chart-container">
            <div className="chart-bars-wrapper">
              {/* Batang Pemasukan */}
              <div className="chart-column">
                <div 
                  className="chart-bar-fill" 
                  style={{ height: `${inHeight}%` }}
                >
                  <div className="chart-tooltip">{formatRupiah(totalIn)}</div>
                </div>
                <span className="chart-label">Pemasukan</span>
              </div>

              {/* Batang Pengeluaran */}
              <div className="chart-column">
                <div 
                  className="chart-bar-fill expense" 
                  style={{ height: `${outHeight}%` }}
                >
                  <div className="chart-tooltip">{formatRupiah(totalOut)}</div>
                </div>
                <span className="chart-label">Pengeluaran</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.75rem' }}>
              <span>Efisiensi Kas: {totalIn > 0 ? Math.round(((totalIn - totalOut) / totalIn) * 100) : 0}%</span>
              <span style={{ color: balance >= 0 ? 'var(--primary)' : 'var(--danger)' }}>
                {balance >= 0 ? 'Surplus' : 'Defisit'}
              </span>
            </div>
          </div>
        </div>

        {/* Panel Kanan: Peringatan Stok & Antrean Offline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Antrean Sinkronisasi (Hanya muncul jika ada antrean) */}
          {queue.length > 0 && (
            <div className="glass-card" style={{ borderColor: 'var(--accent)', background: 'rgba(245, 158, 11, 0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--accent)' }}>
                <Clock size={20} />
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Antrean Sinkronisasi Offline ({queue.length})</h3>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem', textAlign: 'left' }}>
                Transaksi berikut disimpan di lokal dan akan disinkronkan otomatis saat koneksi pulih.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
                {queue.map((item) => (
                  <div 
                    key={item.id} 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '0.6rem 0.8rem', 
                      background: 'rgba(255, 255, 255, 0.03)', 
                      borderRadius: '8px', 
                      border: '1px solid rgba(245, 158, 11, 0.15)',
                      fontSize: '0.8rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className={`badge ${item.type === 'cash' ? ((item.data as CashTransaction).type === 'pemasukan' ? 'in' : 'out') : 'in'}`}>
                        {item.type === 'cash' ? 'Uang' : 'Barang'}
                      </span>
                      <span style={{ fontWeight: 600 }}>
                        {item.type === 'cash' 
                          ? (item.data as CashTransaction).category 
                          : (item.data as InventoryTransaction).itemName
                        }
                      </span>
                    </div>
                    <span style={{ color: 'var(--text-secondary)' }}>
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
          <div className="glass-card" style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Package size={20} style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Inventaris & Stok Kritis</h3>
            </div>
            
            {criticalItems.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {criticalItems.map((item) => (
                  <div 
                    key={item.name} 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '0.6rem 0.8rem', 
                      background: 'rgba(239, 68, 68, 0.05)', 
                      borderRadius: '8px', 
                      border: '1px solid rgba(239, 68, 68, 0.15)' 
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)' }}>
                      <AlertTriangle size={15} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</span>
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--danger)' }}>
                      {item.stock === 0 ? 'Habis' : `${item.stock} ${item.unit}`}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Semua stok barang di gudang aman (di atas 10 unit).
              </div>
            )}
            
            <button 
              onClick={() => onNavigateToTab('inventaris')}
              className="btn btn-secondary" 
              style={{ width: '100%', marginTop: '1.25rem', fontSize: '0.8rem', padding: '0.5rem' }}
            >
              Lihat Semua Inventaris
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
