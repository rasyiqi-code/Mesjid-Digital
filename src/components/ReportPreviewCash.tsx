import React from 'react';
import type { CashTransaction } from '../utils/storage';

interface ReportPreviewCashProps {
  summary: {
    openingBalance: number;
    totalIncome: number;
    totalExpense: number;
    closingBalance: number;
    transactions: CashTransaction[];
  };
  months: string[];
  selectedMonth: number;
  selectedYear: number;
  formatRupiah: (value: number) => string;
}

export const ReportPreviewCash: React.FC<ReportPreviewCashProps> = ({
  summary,
  months,
  selectedMonth,
  selectedYear,
  formatRupiah,
}) => {
  return (
    <div className="report-view-box">
      <div className="report-header-print">
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>LAPORAN KAS BULANAN MASJID</h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Periode: {months[selectedMonth]} {selectedYear}
        </p>
      </div>

      <div className="report-meta-grid">
        <div>
          <p style={{ color: 'var(--text-secondary)' }}>Saldo Awal Bulan:</p>
          <p style={{ fontSize: '0.95rem', fontWeight: 700 }}>{formatRupiah(summary.openingBalance)}</p>
        </div>
        <div>
          <p style={{ color: 'var(--text-secondary)' }}>Saldo Akhir Kas:</p>
          <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)' }}>
            {formatRupiah(summary.closingBalance)}
          </p>
        </div>
        <div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
            Total Pemasukan: <span style={{ color: '#3B82F6', fontWeight: 600 }}>+{formatRupiah(summary.totalIncome)}</span>
          </p>
        </div>
        <div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
            Total Pengeluaran: <span style={{ color: 'var(--accent)', fontWeight: 600 }}>-{formatRupiah(summary.totalExpense)}</span>
          </p>
        </div>
      </div>

      <h5 style={{ fontSize: '0.8rem', fontWeight: 700, margin: '0.85rem 0 0.4rem 0', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
        Rincian Transaksi
      </h5>
      
      {/* Tampilan Desktop: Tabel */}
      <div className="desktop-table-view">
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Jenis</th>
                <th>Kategori</th>
                <th>Deskripsi</th>
                <th>Nominal</th>
              </tr>
            </thead>
            <tbody>
              {summary.transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '1rem' }}>
                    Tidak ada data transaksi kas pada periode ini.
                  </td>
                </tr>
              ) : (
                summary.transactions.map((t) => (
                  <tr key={t.id}>
                    <td>{t.date}</td>
                    <td>
                      <span className={`badge ${t.type === 'pemasukan' ? 'in' : 'out'}`}>
                        {t.type === 'pemasukan' ? 'Masuk' : 'Keluar'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{t.category}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{t.description || '-'}</td>
                    <td style={{ fontWeight: 700, color: t.type === 'pemasukan' ? 'var(--primary)' : 'var(--danger)' }}>
                      {t.type === 'pemasukan' ? '+' : '-'}{formatRupiah(t.amount)}
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
            Tidak ada data transaksi kas pada periode ini.
          </div>
        ) : (
          summary.transactions.map((t) => (
            <div key={t.id} className="mobile-data-card" style={{ display: 'block', padding: '0.55rem 0.65rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{t.date}</span>
                <span className={`badge ${t.type === 'pemasukan' ? 'in' : 'out'}`}>
                  {t.type === 'pemasukan' ? 'Masuk' : 'Keluar'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 700 }}>{t.category}</h4>
                  <p style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
                    {t.description || '-'}
                  </p>
                </div>
                <div style={{ fontWeight: 800, fontSize: '0.825rem', color: t.type === 'pemasukan' ? 'var(--primary)' : 'var(--danger)' }}>
                  {t.type === 'pemasukan' ? '+' : '-'}{formatRupiah(t.amount)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
