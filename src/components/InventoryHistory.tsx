import React, { useState } from 'react';
import type { InventoryTransaction } from '../utils/storage';
import { Search, Trash2 } from 'lucide-react';

interface InventoryHistoryProps {
  transactions: InventoryTransaction[];
  onDelete: (id: string) => void;
}

// Komponen untuk menampilkan riwayat mutasi barang (masuk/keluar) di gudang
export const InventoryHistory: React.FC<InventoryHistoryProps> = ({
  transactions,
  onDelete,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter riwayat mutasi berdasarkan nama barang, donatur, atau keterangan
  const filtered = transactions.filter((tx) =>
    tx.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tx.donatur ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tx.description ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', height: '100%' }}>

      {/* Header & Pencarian */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Riwayat Mutasi</h3>
        <div className="search-input-wrapper" style={{ maxWidth: '200px' }}>
          <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Cari barang..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.1rem', minHeight: '32px', fontSize: '0.8rem', borderRadius: '6px' }}
          />
        </div>
      </div>

      {/* Tampilan Desktop: Tabel */}
      <div className="desktop-table-view" style={{ flex: 1, maxHeight: '380px', overflowY: 'auto' }}>
        <div className="table-container" style={{ marginTop: 0 }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Barang</th>
                <th>Aktivitas</th>
                <th>Keterangan</th>
                <th style={{ textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '1.5rem' }}>
                    Tidak ada riwayat mutasi.
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => (
                  <tr key={tx.id}>
                    <td>{tx.date}</td>
                    <td style={{ fontWeight: 600 }}>
                      {tx.itemName}
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>
                        {tx.category || '-'}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${tx.type === 'masuk' ? 'in' : 'out'}`} style={{ padding: '0.15rem 0.35rem', fontSize: '0.625rem' }}>
                        {tx.type === 'masuk' ? '+' : '-'}{tx.amount} {tx.unit}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {tx.type === 'masuk' ? (tx.donatur || 'Hamba Allah') : (tx.description || '-')}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Hapus mutasi "${tx.itemName}" (${tx.type === 'masuk' ? '+' : '-'}${tx.amount} ${tx.unit})?`)) {
                            onDelete(tx.id);
                          }
                        }}
                        className="btn btn-danger"
                        style={{ padding: '0.2rem', minHeight: '26px', minWidth: '26px', borderRadius: '4px', display: 'inline-flex' }}
                        title="Hapus Mutasi"
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tampilan Mobile: Kartu */}
      <div className="mobile-card-list" style={{ maxHeight: '320px', overflowY: 'auto' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '1rem', fontSize: '0.8rem' }}>
            Tidak ada riwayat mutasi.
          </div>
        ) : (
          filtered.map((tx) => (
            <div key={tx.id} className="mobile-data-card" style={{ display: 'block', padding: '0.65rem 0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{tx.date}</span>
                <span className={`badge ${tx.type === 'masuk' ? 'in' : 'out'}`} style={{ padding: '0.15rem 0.35rem', fontSize: '0.625rem' }}>
                  {tx.type === 'masuk' ? 'Masuk' : 'Keluar'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.45rem' }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700 }}>{tx.itemName}</h4>
                  <p style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
                    {tx.type === 'masuk' ? `Donatur: ${tx.donatur || 'Hamba Allah'}` : `Detail: ${tx.description || '-'}`}
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.85rem', color: tx.type === 'masuk' ? 'var(--primary)' : 'var(--danger)' }}>
                    {tx.type === 'masuk' ? '+' : '-'}{tx.amount} {tx.unit}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Hapus mutasi "${tx.itemName}"?`)) {
                        onDelete(tx.id);
                      }
                    }}
                    className="btn btn-danger"
                    style={{ padding: '0.2rem', minHeight: '26px', minWidth: '26px', borderRadius: '4px', display: 'inline-flex' }}
                    title="Hapus Mutasi"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
