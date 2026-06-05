import React, { useState } from 'react';
import type { CashTransaction } from '../utils/storage';
import { Search, Trash2, Image as ImageIcon } from 'lucide-react';

interface CashHistoryProps {
  cashTransactions: CashTransaction[];
  onDelete: (id: string) => void;
  onViewImage: (url: string) => void;
}

// Komponen untuk menampilkan daftar riwayat transaksi kas (Buku/Jurnal Kas)
export const CashHistory: React.FC<CashHistoryProps> = ({
  cashTransactions,
  onDelete,
  onViewImage,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Format angka ke format mata uang Rupiah
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  // Filter transaksi kas berdasarkan kata kunci kategori atau deskripsi
  const filteredTransactions = cashTransactions.filter((tx) =>
    tx.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', height: '100%' }}>
      
      {/* Header & Input Pencarian */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Riwayat Transaksi Kas</h3>
        <div className="search-input-wrapper" style={{ maxWidth: '250px' }}>
          <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Cari kas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.5rem', minHeight: '38px', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      {/* Tampilan Desktop: Tabel Transaksi */}
      <div className="desktop-table-view" style={{ flex: 1, maxHeight: '450px', overflowY: 'auto' }}>
        <div className="table-container" style={{ marginTop: 0 }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Jenis</th>
                <th>Kategori</th>
                <th>Nominal</th>
                <th>Bukti</th>
                <th style={{ textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                    Tidak ada transaksi kas ditemukan.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id}>
                    <td>{tx.date}</td>
                    <td>
                      <span className={`badge ${tx.type === 'pemasukan' ? 'in' : 'out'}`}>
                        {tx.type === 'pemasukan' ? 'Masuk' : 'Keluar'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      <div>{tx.category}</div>
                      {tx.description && (
                        <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', fontWeight: 'normal', marginTop: '0.15rem' }}>
                          {tx.description}
                        </div>
                      )}
                    </td>
                    <td style={{ fontWeight: 700, color: tx.type === 'pemasukan' ? 'var(--primary)' : 'var(--danger)' }}>
                      {tx.type === 'pemasukan' ? '+' : '-'}{formatRupiah(tx.amount)}
                    </td>
                    <td>
                      {tx.evidence ? (
                        <button
                          type="button"
                          onClick={() => onViewImage(tx.evidence!)}
                          className="btn btn-secondary"
                          style={{ padding: '0.25rem 0.5rem', minHeight: '32px', fontSize: '0.75rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                          title="Lihat Bukti Foto"
                        >
                          <ImageIcon size={14} />
                          <span>Lihat</span>
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>-</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Apakah Anda yakin ingin menghapus transaksi "${tx.category}" sebesar ${formatRupiah(tx.amount)}?`)) {
                            onDelete(tx.id);
                          }
                        }}
                        className="btn btn-danger"
                        style={{ padding: '0.25rem', minHeight: '32px', minWidth: '32px', borderRadius: '6px', display: 'inline-flex' }}
                        title="Hapus Transaksi"
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

      {/* Tampilan Mobile: Kartu Transaksi */}
      <div className="mobile-card-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {filteredTransactions.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '1.5rem', fontSize: '0.85rem' }}>
            Tidak ada transaksi kas ditemukan.
          </div>
        ) : (
          filteredTransactions.map((tx) => (
            <div key={tx.id} className="mobile-data-card" style={{ display: 'block', padding: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{tx.date}</span>
                <span className={`badge ${tx.type === 'pemasukan' ? 'in' : 'out'}`}>
                  {tx.type === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '0.925rem', fontWeight: 700 }}>{tx.category}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                    {tx.description || '-'}
                  </p>
                  {tx.evidence && (
                    <button
                      type="button"
                      onClick={() => onViewImage(tx.evidence!)}
                      className="btn btn-secondary"
                      style={{ padding: '0.2rem 0.4rem', minHeight: '28px', fontSize: '0.7rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.5rem' }}
                    >
                      <ImageIcon size={12} />
                      Pratinjau Bukti
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: tx.type === 'pemasukan' ? 'var(--primary)' : 'var(--danger)' }}>
                    {tx.type === 'pemasukan' ? '+' : '-'}{formatRupiah(tx.amount)}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Apakah Anda yakin ingin menghapus transaksi "${tx.category}"?`)) {
                        onDelete(tx.id);
                      }
                    }}
                    className="btn btn-danger"
                    style={{ padding: '0.25rem', minHeight: '32px', minWidth: '32px', borderRadius: '6px', display: 'inline-flex' }}
                    title="Hapus Transaksi"
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
