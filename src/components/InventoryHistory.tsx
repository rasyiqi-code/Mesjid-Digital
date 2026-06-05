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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', height: '100%' }}>

      {/* Header & Pencarian */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Riwayat Mutasi Barang</h3>
        <div className="search-input-wrapper" style={{ maxWidth: '250px' }}>
          <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Cari barang..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.5rem', minHeight: '38px', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      {/* Tampilan Desktop: Tabel */}
      <div className="desktop-table-view" style={{ flex: 1, maxHeight: '450px', overflowY: 'auto' }}>
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
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                    Tidak ada riwayat mutasi barang.
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => (
                  <tr key={tx.id}>
                    <td>{tx.date}</td>
                    <td style={{ fontWeight: 600 }}>
                      {tx.itemName}
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>
                        {tx.category}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${tx.type === 'masuk' ? 'in' : 'out'}`}>
                        {tx.type === 'masuk' ? '+' : '-'}{tx.amount} {tx.unit}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
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
                        style={{ padding: '0.25rem', minHeight: '32px', minWidth: '32px', borderRadius: '6px', display: 'inline-flex' }}
                        title="Hapus Mutasi"
                      >
                        <Trash2 size={14} />
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
      <div className="mobile-card-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '1.5rem', fontSize: '0.85rem' }}>
            Tidak ada riwayat mutasi barang.
          </div>
        ) : (
          filtered.map((tx) => (
            <div key={tx.id} className="mobile-data-card" style={{ display: 'block', padding: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{tx.date}</span>
                <span className={`badge ${tx.type === 'masuk' ? 'in' : 'out'}`}>
                  {tx.type === 'masuk' ? 'Barang Masuk' : 'Barang Keluar'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '0.925rem', fontWeight: 700 }}>{tx.itemName}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                    {tx.type === 'masuk' ? `Donatur: ${tx.donatur || 'Hamba Allah'}` : `Detail: ${tx.description || '-'}`}
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: tx.type === 'masuk' ? 'var(--primary)' : 'var(--danger)' }}>
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
                    style={{ padding: '0.25rem', minHeight: '32px', minWidth: '32px', borderRadius: '6px', display: 'inline-flex' }}
                    title="Hapus Mutasi"
                  >
                    <Trash2 size={14} />
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
