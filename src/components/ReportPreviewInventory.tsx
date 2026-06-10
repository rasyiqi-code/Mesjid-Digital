import React from 'react';
import type { InventoryItem } from '../utils/storage';

interface ReportPreviewInventoryProps {
  list: {
    items: InventoryItem[];
  };
}

export const ReportPreviewInventory: React.FC<ReportPreviewInventoryProps> = ({ list }) => {
  return (
    <div className="report-view-box">
      <div className="report-header-print">
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>DAFTAR KONDISI INVENTARIS GUDANG</h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Status Terkini (Real-Time)
        </p>
      </div>

      {/* Tampilan Desktop: Tabel */}
      <div className="desktop-table-view">
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Nama Barang</th>
                <th>Kategori Logistik</th>
                <th>Sisa Stok Saat Ini</th>
                <th>Satuan Takaran</th>
                <th>Status Ketersediaan</th>
              </tr>
            </thead>
            <tbody>
              {list.items.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '1rem' }}>
                    Gudang masjid kosong. Belum ada barang yang didaftarkan.
                  </td>
                </tr>
              ) : (
                list.items.map((item) => (
                  <tr key={item.name}>
                    <td style={{ fontWeight: 600 }}>{item.name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{item.category}</td>
                    <td style={{ fontWeight: 800, color: item.stock > 0 ? 'var(--text-primary)' : 'var(--danger)' }}>
                      {item.stock}
                    </td>
                    <td>{item.unit}</td>
                    <td>
                      {item.stock === 0 ? (
                        <span className="badge out">Habis</span>
                      ) : item.stock < 10 ? (
                        <span className="badge out" style={{ color: 'var(--accent)', background: 'rgba(245, 158, 11, 0.1)' }}>Kritis</span>
                      ) : (
                        <span className="badge in">Sangat Cukup</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tampilan Mobile: Kartu Vertikal */}
      <div className="mobile-card-list">
        {list.items.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '1.5rem', fontSize: '0.85rem' }}>
            Gudang masjid kosong. Belum ada barang yang didaftarkan.
          </div>
        ) : (
          list.items.map((item) => (
            <div key={item.name} className="mobile-data-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.55rem 0.65rem' }}>
              <div>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 700 }}>{item.name}</h4>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{item.category}</span>
                <div style={{ marginTop: '0.2rem' }}>
                  {item.stock === 0 ? (
                    <span className="badge out" style={{ padding: '0.1rem 0.35rem', fontSize: '0.65rem' }}>Habis</span>
                  ) : item.stock < 10 ? (
                    <span className="badge out" style={{ padding: '0.1rem 0.35rem', fontSize: '0.65rem', color: 'var(--accent)', background: 'rgba(245, 158, 11, 0.1)' }}>Kritis</span>
                  ) : (
                    <span className="badge in" style={{ padding: '0.1rem 0.35rem', fontSize: '0.65rem' }}>Sangat Cukup</span>
                  )}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ 
                  fontSize: '0.85rem', 
                  fontWeight: 800, 
                  color: item.stock === 0 ? 'var(--danger)' : item.stock < 10 ? 'var(--accent)' : 'var(--primary)' 
                }}>
                  {item.stock}
                </span>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', marginLeft: '0.2rem' }}>{item.unit}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
