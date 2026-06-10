import React from 'react';
import type { InventoryTransaction } from '../utils/storage';

interface ReportPreviewStockProps {
  summary: {
    transactions: InventoryTransaction[];
  };
  months: string[];
  selectedMonth: number;
  selectedYear: number;
}

export const ReportPreviewStock: React.FC<ReportPreviewStockProps> = ({
  summary,
  months,
  selectedMonth,
  selectedYear,
}) => {
  return (
    <div className="report-view-box">
      <div className="report-header-print">
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>LAPORAN MUTASI LOGISTIK GUDANG</h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Periode: {months[selectedMonth]} {selectedYear}
        </p>
      </div>

      {/* Tampilan Desktop: Tabel */}
      <div className="desktop-table-view">
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Aktivitas</th>
                <th>Nama Barang</th>
                <th>Jumlah Mutasi</th>
                <th>Donatur / Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {summary.transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '1rem' }}>
                    Tidak ada transaksi logistik barang pada periode ini.
                  </td>
                </tr>
              ) : (
                summary.transactions.map((t) => (
                  <tr key={t.id}>
                    <td>{t.date}</td>
                    <td>
                      <span className={`badge ${t.type === 'masuk' ? 'in' : 'out'}`}>
                        {t.type === 'masuk' ? 'Barang Masuk' : 'Barang Keluar'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{t.itemName}</td>
                    <td style={{ fontWeight: 700 }}>
                      {t.type === 'masuk' ? '+' : '-'}{t.amount} {t.unit}
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {t.type === 'masuk' ? (t.donatur || 'Hamba Allah') : (t.description || '-')}
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
        {summary.transactions.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '1rem', fontSize: '0.85rem' }}>
            Tidak ada transaksi logistik barang pada periode ini.
          </div>
        ) : (
          summary.transactions.map((t) => (
            <div key={t.id} className="mobile-data-card" style={{ display: 'block', padding: '0.55rem 0.65rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{t.date}</span>
                <span className={`badge ${t.type === 'masuk' ? 'in' : 'out'}`}>
                  {t.type === 'masuk' ? 'Masuk' : 'Keluar'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 700 }}>{t.itemName}</h4>
                  <p style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
                    {t.type === 'masuk' ? `Donatur: ${t.donatur || 'Hamba Allah'}` : `Detail: ${t.description || '-'}`}
                  </p>
                </div>
                <div style={{ fontWeight: 800, fontSize: '0.825rem', color: t.type === 'masuk' ? 'var(--primary)' : 'var(--danger)' }}>
                  {t.type === 'masuk' ? '+' : '-'}{t.amount} {t.unit}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
