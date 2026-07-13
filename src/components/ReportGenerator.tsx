import React, { useState } from 'react';
import { 
  getDBCashTransactions, 
  getDBInventoryTransactions, 
  getDBInventoryItems
} from '../utils/db';
import type { 
  CashTransaction, 
  InventoryTransaction,
  InventoryItem
} from '../utils/storage';
import { FileText, Calendar, Database, Eye, Download, Table, Share2, X } from 'lucide-react';
import { exportToPDF, exportToCSV, shareToWhatsApp } from '../utils/reportExporter';
import { ReportPreviewCash } from './ReportPreviewCash';
import { ReportPreviewStock } from './ReportPreviewStock';
import { ReportPreviewInventory } from './ReportPreviewInventory';

interface ExportedFileInfo {
  blob: Blob;
  filename: string;
  type: 'pdf' | 'csv';
  url: string;
}

interface ReportGeneratorProps {
  showToast: (msg: string, type: 'success' | 'info' | 'error') => void;
  updateTrigger: number;
}

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({ showToast }) => {
  // Jenis laporan: 'kas' | 'stok' | 'inventaris'
  const [reportType, setReportType] = useState<'kas' | 'stok' | 'inventaris'>('kas');
  
  // Filter bulan dan tahun
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  
  // Status apakah laporan sudah di-generate
  const [isGenerated, setIsGenerated] = useState<boolean>(false);

  // Status ekspor dokumen
  const [exportFile, setExportFile] = useState<ExportedFileInfo | null>(null);

  // Data hasil generasi laporan
  const [reportData, setReportData] = useState<{
    cashSummary?: {
      openingBalance: number;
      totalIncome: number;
      totalExpense: number;
      closingBalance: number;
      transactions: CashTransaction[];
    };
    stockSummary?: {
      transactions: InventoryTransaction[];
    };
    inventoryList?: {
      items: InventoryItem[];
    };
  }>({});

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const years = [2025, 2026, 2027];

  // Fungsi memformat rupiah
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  // Logika pembuatan/generasi laporan asinkron menggunakan IndexedDB
  const handleGenerateReport = async () => {
    try {
      if (reportType === 'kas') {
        const allCash = await getDBCashTransactions();
        
        // Filter transaksi kas untuk bulan & tahun terpilih
        const currentMonthCash = allCash.filter((t) => {
          const d = new Date(t.date);
          return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
        });

        // Hitung Saldo Awal (semua transaksi sebelum bulan terpilih)
        const previousCash = allCash.filter((t) => {
          const d = new Date(t.date);
          return d.getFullYear() < selectedYear || 
                 (d.getFullYear() === selectedYear && d.getMonth() < selectedMonth);
        });

        let openingBalance = 0;
        previousCash.forEach((t) => {
          if (t.type === 'pemasukan') openingBalance += t.amount;
          else openingBalance -= t.amount;
        });

        // Hitung total pemasukan & pengeluaran di bulan terpilih
        let totalIncome = 0;
        let totalExpense = 0;
        currentMonthCash.forEach((t) => {
          if (t.type === 'pemasukan') totalIncome += t.amount;
          else totalExpense += t.amount;
        });

        setReportData({
          cashSummary: {
            openingBalance,
            totalIncome,
            totalExpense,
            closingBalance: openingBalance + totalIncome - totalExpense,
            transactions: currentMonthCash,
          }
        });
        showToast('Laporan Kas Bulanan berhasil dimuat.', 'success');
      } 
      
      else if (reportType === 'stok') {
        const allInv = await getDBInventoryTransactions();
        
        // Filter log transaksi barang untuk bulan & tahun terpilih
        const currentMonthInv = allInv.filter((t) => {
          const d = new Date(t.date);
          return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
        });

        setReportData({
          stockSummary: {
            transactions: currentMonthInv,
          }
        });
        showToast('Laporan Stok Barang berhasil dimuat.', 'success');
      } 
      
      else if (reportType === 'inventaris') {
        const allItems = await getDBInventoryItems();
        setReportData({
          inventoryList: {
            items: allItems,
          }
        });
        showToast('Daftar Inventaris Terkini berhasil dimuat.', 'success');
      }

      setIsGenerated(true);
    } catch (err) {
      console.error(err);
      showToast('Gagal memuat data laporan dari database.', 'error');
    }
  };

  const handleExportPDF = () => {
    try {
      const res = exportToPDF(reportType, reportData, selectedMonth, selectedYear, months, formatRupiah);
      const url = URL.createObjectURL(res.blob);
      setExportFile({
        blob: res.blob,
        filename: res.filename,
        type: 'pdf',
        url
      });
      showToast('Laporan PDF berhasil disiapkan.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Gagal memproses ekspor PDF.', 'error');
    }
  };

  const handleExportCSV = () => {
    try {
      const res = exportToCSV(reportType, reportData, selectedMonth, selectedYear);
      const url = URL.createObjectURL(res.blob);
      setExportFile({
        blob: res.blob,
        filename: res.filename,
        type: 'csv',
        url
      });
      showToast('Laporan Excel (CSV) berhasil disiapkan.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Gagal memproses ekspor CSV.', 'error');
    }
  };

  const handleShareWhatsApp = () => {
    shareToWhatsApp(reportType, reportData, selectedMonth, selectedYear, months, formatRupiah, showToast);
  };

  const triggerDownload = () => {
    if (!exportFile) return;
    const link = document.createElement('a');
    link.href = exportFile.url;
    link.download = exportFile.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('File laporan berhasil diunduh.', 'success');
  };

  const handleShareWhatsAppFile = async () => {
    if (!exportFile) return;
    
    const mimeType = exportFile.type === 'pdf' ? 'application/pdf' : 'text/csv';
    const file = new File([exportFile.blob], exportFile.filename, { type: mimeType });
    
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: exportFile.filename,
          text: `Laporan Mesjid Digital - ${exportFile.filename}`
        });
        showToast('Berhasil memicu dialog berbagi.', 'success');
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      showToast('Membuka WhatsApp Web (berbagi pesan teks ringkasan)...', 'info');
      handleShareWhatsApp();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      
      {/* Panel Form Pilihan Laporan */}
      <div className="glass-card mobile-flat" style={{ padding: '0.85rem 1rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.65rem', textAlign: 'left' }}>
          Pembuatan Laporan Sistem
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          
          {/* Pilih Jenis Laporan */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Jenis Laporan</label>
            <div className="report-select-grid">
              <button
                onClick={() => { setReportType('kas'); setIsGenerated(false); }}
                className={`btn ${reportType === 'kas' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, minWidth: '120px', gap: '0.3rem', padding: '0.45rem', minHeight: '34px', fontSize: '0.8rem', borderRadius: '6px' }}
              >
                <FileText size={14} />
                Laporan Kas Bulanan
              </button>
              
              <button
                onClick={() => { setReportType('stok'); setIsGenerated(false); }}
                className={`btn ${reportType === 'stok' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, minWidth: '120px', gap: '0.3rem', padding: '0.45rem', minHeight: '34px', fontSize: '0.8rem', borderRadius: '6px' }}
              >
                <Calendar size={14} />
                Laporan Stok Barang
              </button>
              
              <button
                onClick={() => { setReportType('inventaris'); setIsGenerated(false); }}
                className={`btn ${reportType === 'inventaris' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, minWidth: '120px', gap: '0.3rem', padding: '0.45rem', minHeight: '34px', fontSize: '0.8rem', borderRadius: '6px' }}
              >
                <Database size={14} />
                Daftar Inventaris
              </button>
            </div>
          </div>

          {/* Filter Periode Bulan & Tahun (Disembunyikan untuk Daftar Inventaris karena real-time) */}
          {reportType !== 'inventaris' && (
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="report-month">Pilih Bulan</label>
                <select
                  id="report-month"
                  value={selectedMonth}
                  onChange={(e) => { setSelectedMonth(Number(e.target.value)); setIsGenerated(false); }}
                  className="form-select"
                  style={{ minHeight: '36px', padding: '0.45rem 0.65rem', fontSize: '0.85rem' }}
                >
                  {months.map((m, idx) => (
                    <option key={m} value={idx}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="report-year">Pilih Tahun</label>
                <select
                  id="report-year"
                  value={selectedYear}
                  onChange={(e) => { setSelectedYear(Number(e.target.value)); setIsGenerated(false); }}
                  className="form-select"
                  style={{ minHeight: '36px', padding: '0.45rem 0.65rem', fontSize: '0.85rem' }}
                >
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Tombol Generate */}
          <button
            onClick={handleGenerateReport}
            className="btn btn-accent"
            style={{ width: '100%', padding: '0.55rem', fontWeight: 700, minHeight: '36px', borderRadius: '6px', marginTop: '0.25rem' }}
          >
            <Eye size={14} />
            Generate Laporan
          </button>
        </div>
      </div>

      {/* Tampilan Output Pratinjau Laporan */}
      {isGenerated && (
        <div className="glass-card mobile-flat animate-in-fade" style={{ textAlign: 'left' }}>
          
          {/* Header Aksi Ekspor / Berbagi */}
          <div className="flex-mobile-col" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.65rem', marginBottom: '0.85rem' }}>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Pratinjau Hasil Laporan</h4>
              <p style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>
                Tinjau isi dokumen sebelum diekspor atau dibagikan
              </p>
            </div>
            
            {/* Tombol Bagikan / Expor */}
            <div className="report-action-group">
              <button
                onClick={handleExportPDF}
                className="btn btn-primary"
                style={{ padding: '0.4rem 0.65rem', fontSize: '0.75rem', gap: '0.3rem', minHeight: '32px', borderRadius: '5px' }}
                title="Ekspor Laporan ke format PDF"
              >
                <Download size={13} />
                Ekspor PDF
              </button>
              
              <button
                onClick={handleExportCSV}
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.65rem', fontSize: '0.75rem', gap: '0.3rem', minHeight: '32px', borderRadius: '5px' }}
                title="Ekspor data ke CSV untuk Excel/Google Sheets"
              >
                <Table size={13} />
                Ekspor CSV
              </button>
              
              <button
                onClick={handleShareWhatsApp}
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.65rem', fontSize: '0.75rem', gap: '0.3rem', borderColor: '#25D366', color: '#25D366', minHeight: '32px', borderRadius: '5px' }}
              >
                <Share2 size={13} />
                Bagikan ke WA
              </button>
            </div>
          </div>

          {/* 3.1. Visual Pratinjau: Laporan Kas Bulanan */}
          {reportType === 'kas' && reportData.cashSummary && (
            <ReportPreviewCash
              summary={reportData.cashSummary}
              months={months}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              formatRupiah={formatRupiah}
            />
          )}

          {/* 3.2. Visual Pratinjau: Laporan Stok Barang */}
          {reportType === 'stok' && reportData.stockSummary && (
            <ReportPreviewStock
              summary={reportData.stockSummary}
              months={months}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
            />
          )}

          {/* 3.3. Visual Pratinjau: Daftar Inventaris Terkini */}
          {reportType === 'inventaris' && reportData.inventoryList && (
            <ReportPreviewInventory
              list={reportData.inventoryList}
            />
          )}

        </div>
      )}

      {/* Modal Dialog Ekspor & Bagikan Laporan */}
      {exportFile && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(4, 6, 12, 0.85)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '1rem',
        }}>
          <div className="glass-card animate-in-fade" style={{
            width: '100%',
            maxWidth: '550px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '90vh',
            padding: 0,
            borderRadius: '12px'
          }}>
            {/* Header Modal */}
            <div style={{
              padding: '0.9rem 1.15rem',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.02)'
            }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800 }}>Dokumen Siap Diekspor</h4>
                <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  Laporan telah berhasil digenerate di browser Anda
                </p>
              </div>
              <button 
                onClick={() => {
                  URL.revokeObjectURL(exportFile.url);
                  setExportFile(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '0.2rem',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Konten Modal */}
            <div style={{ padding: '1.15rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              
              {/* Status Box */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '1px dashed var(--primary)',
                borderRadius: '8px'
              }}>
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary)',
                  color: '#fff',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontWeight: 800,
                  fontSize: '0.85rem'
                }}>
                  ✓
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', wordBreak: 'break-all' }}>
                    {exportFile.filename}
                  </p>
                  <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                    Format: {exportFile.type === 'pdf' ? 'Dokumen PDF' : 'Excel (CSV)'}
                  </p>
                </div>
              </div>

              {/* Preview Iframe (PDF) atau Info Box (CSV) */}
              {exportFile.type === 'pdf' ? (
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Pratampil Dokumen:</span>
                  <div style={{
                    marginTop: '0.35rem',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    height: '280px',
                    backgroundColor: '#fff'
                  }}>
                    <iframe 
                      src={exportFile.url} 
                      width="100%" 
                      height="100%" 
                      title="Pratampil Laporan PDF" 
                      style={{ border: 'none' }}
                    />
                  </div>
                </div>
              ) : (
                <div style={{
                  padding: '1.5rem 1rem',
                  textAlign: 'center',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  fontSize: '0.775rem',
                  color: 'var(--text-secondary)',
                  backgroundColor: 'rgba(255, 255, 255, 0.01)'
                }}>
                  <p style={{ margin: 0, fontWeight: 700 }}>Laporan berformat Excel/CSV telah selesai diproses.</p>
                  <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    Anda dapat langsung mengunduh file ini untuk membukanya secara rapi di aplikasi Microsoft Excel atau Google Sheets.
                  </p>
                </div>
              )}
            </div>

            {/* Footer Aksi */}
            <div style={{
              padding: '0.9rem 1.15rem',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              gap: '0.65rem',
              background: 'rgba(255, 255, 255, 0.02)'
            }}>
              <button
                onClick={triggerDownload}
                className="btn btn-primary"
                style={{ flex: 1, padding: '0.55rem', fontSize: '0.8rem', gap: '0.35rem', minHeight: '36px', borderRadius: '6px' }}
              >
                <Download size={14} />
                Unduh File
              </button>
              <button
                onClick={handleShareWhatsAppFile}
                className="btn btn-secondary"
                style={{
                  flex: 1,
                  padding: '0.55rem',
                  fontSize: '0.8rem',
                  gap: '0.35rem',
                  borderColor: '#25D366',
                  color: '#25D366',
                  minHeight: '36px',
                  borderRadius: '6px'
                }}
              >
                <Share2 size={14} />
                Kirim ke WA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
