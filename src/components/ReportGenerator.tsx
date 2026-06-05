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
import { FileText, Download, Share2, Calendar, Database, Eye, Table } from 'lucide-react';
import { jsPDF } from 'jspdf';

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

  // Pembuatan Berkas PDF menggunakan jsPDF secara client-side
  const handleExportPDF = () => {
    const doc = new jsPDF();
    const title = `Laporan Mesjid Digital - ${reportType === 'kas' ? 'Kas Bulanan' : reportType === 'stok' ? 'Stok Barang' : 'Daftar Inventaris'}`;
    const period = reportType !== 'inventaris' ? `Periode: ${months[selectedMonth]} ${selectedYear}` : 'Kondisi Stok Real-Time';

    // Desain Header PDF
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(16, 185, 129); // Emerald color
    doc.text('MESJID DIGITAL', 105, 15, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.text(title.toUpperCase(), 105, 23, { align: 'center' });
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text(period, 105, 29, { align: 'center' });
    
    // Garis Pemisah
    doc.setLineWidth(0.5);
    doc.setDrawColor(209, 213, 219);
    doc.line(15, 33, 195, 33);

    let yPosition = 42;

    // --- PDF KAS BULANAN ---
    if (reportType === 'kas' && reportData.cashSummary) {
      const summary = reportData.cashSummary;
      
      // Box Ringkasan
      doc.setFillColor(243, 244, 246);
      doc.rect(15, yPosition, 180, 32, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(55, 65, 81);
      doc.text(`Saldo Awal:  ${formatRupiah(summary.openingBalance)}`, 20, yPosition + 7);
      doc.text(`Pemasukan:   + ${formatRupiah(summary.totalIncome)}`, 20, yPosition + 14);
      doc.text(`Pengeluaran: - ${formatRupiah(summary.totalExpense)}`, 20, yPosition + 21);
      
      doc.setFontSize(11);
      doc.setTextColor(16, 185, 129);
      doc.text(`Saldo Akhir:  ${formatRupiah(summary.closingBalance)}`, 20, yPosition + 28);
      
      yPosition += 42;

      // Tabel Detail Transaksi
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(31, 41, 55);
      doc.text('RIWAYAT TRANSAKSI KAS', 15, yPosition);
      
      yPosition += 6;
      
      // Header Tabel
      doc.setFontSize(10);
      doc.setFillColor(16, 185, 129);
      doc.rect(15, yPosition, 180, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.text('Tanggal', 18, yPosition + 6);
      doc.text('Jenis', 45, yPosition + 6);
      doc.text('Kategori', 75, yPosition + 6);
      doc.text('Nominal', 145, yPosition + 6);

      yPosition += 8;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(55, 65, 81);

      if (summary.transactions.length === 0) {
        doc.text('Tidak ada data transaksi pada bulan ini.', 105, yPosition + 10, { align: 'center' });
      } else {
        summary.transactions.forEach((t) => {
          if (yPosition > 260) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(t.date, 18, yPosition + 6);
          doc.text(t.type === 'pemasukan' ? 'Masuk' : 'Keluar', 45, yPosition + 6);
          doc.text(t.category, 75, yPosition + 6);
          doc.text(formatRupiah(t.amount), 145, yPosition + 6);
          
          yPosition += 9;
        });
      }
    } 
    
    // --- PDF STOK BARANG ---
    else if (reportType === 'stok' && reportData.stockSummary) {
      const summary = reportData.stockSummary;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(31, 41, 55);
      doc.text('RIWAYAT MUTASI LOGISTIK BARANG', 15, yPosition);
      
      yPosition += 6;

      // Header Tabel
      doc.setFontSize(10);
      doc.setFillColor(16, 185, 129);
      doc.rect(15, yPosition, 180, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.text('Tanggal', 18, yPosition + 6);
      doc.text('Aktivitas', 45, yPosition + 6);
      doc.text('Nama Barang', 75, yPosition + 6);
      doc.text('Jumlah', 125, yPosition + 6);
      doc.text('Detail', 150, yPosition + 6);

      yPosition += 8;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(55, 65, 81);

      if (summary.transactions.length === 0) {
        doc.text('Tidak ada transaksi mutasi barang pada bulan ini.', 105, yPosition + 10, { align: 'center' });
      } else {
        summary.transactions.forEach((t) => {
          if (yPosition > 260) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(t.date, 18, yPosition + 6);
          doc.text(t.type === 'masuk' ? 'Barang Masuk' : 'Barang Keluar', 45, yPosition + 6);
          doc.text(t.itemName, 75, yPosition + 6);
          doc.text(`${t.amount} ${t.unit}`, 125, yPosition + 6);
          doc.text(t.type === 'masuk' ? (t.donatur || '-') : (t.description || '-'), 150, yPosition + 6);
          
          yPosition += 9;
        });
      }
    } 
    
    // --- PDF DAFTAR INVENTARIS ---
    else if (reportType === 'inventaris' && reportData.inventoryList) {
      const list = reportData.inventoryList;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(31, 41, 55);
      doc.text('DAFTAR STOK BARANG GUDANG AKTIF', 15, yPosition);
      
      yPosition += 6;

      // Header Tabel
      doc.setFontSize(10);
      doc.setFillColor(16, 185, 129);
      doc.rect(15, yPosition, 180, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.text('Nama Barang', 18, yPosition + 6);
      doc.text('Kategori', 70, yPosition + 6);
      doc.text('Stok Tersedia', 125, yPosition + 6);
      doc.text('Satuan', 160, yPosition + 6);

      yPosition += 8;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(55, 65, 81);

      if (list.items.length === 0) {
        doc.text('Tidak ada persediaan barang terdaftar di gudang.', 105, yPosition + 10, { align: 'center' });
      } else {
        list.items.forEach((item) => {
          if (yPosition > 260) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(item.name, 18, yPosition + 6);
          doc.text(item.category, 70, yPosition + 6);
          doc.text(String(item.stock), 125, yPosition + 6);
          doc.text(item.unit, 160, yPosition + 6);
          
          yPosition += 9;
        });
      }
    }

    // Blok Tanda Tangan Akuntansi / Hukum di bagian bawah PDF
    yPosition += 25;
    if (yPosition > 240) {
      doc.addPage();
      yPosition = 30;
    }
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Mengetahui,', 40, yPosition);
    doc.text('Dibuat Oleh,', 150, yPosition);
    
    yPosition += 22;
    doc.setFont('helvetica', 'bold');
    doc.text('___________________', 40, yPosition);
    doc.text('___________________', 150, yPosition);
    
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.text('Ketua DKM Masjid', 40, yPosition + 5);
    doc.text('Bendahara Masjid', 150, yPosition + 5);

    // Unduh PDF
    doc.save(`Laporan_Mesjid_Digital_${reportType}_${selectedMonth + 1}_${selectedYear}.pdf`);
    showToast('Laporan berhasil diekspor sebagai PDF.', 'success');
  };

  // Pembuatan dan Pengunduhan Berkas CSV (Untuk Spreadsheet Excel/Google Sheets)
  const handleExportCSV = () => {
    let csvContent = '\uFEFF'; // Byte Order Mark (BOM) agar Excel mengenali karakter UTF-8
    let filename = `Laporan_Mesjid_Digital_${reportType}_${selectedMonth + 1}_${selectedYear}.csv`;

    if (reportType === 'kas' && reportData.cashSummary) {
      const summary = reportData.cashSummary;
      csvContent += 'Tanggal,Jenis Transaksi,Kategori Kas,Keterangan,Nominal Rupiah\n';
      csvContent += `,,Saldo Awal Bulan,,${summary.openingBalance}\n`;
      summary.transactions.forEach((t) => {
        const desc = t.description ? t.description.replace(/"/g, '""') : '';
        csvContent += `"${t.date}","${t.type === 'pemasukan' ? 'Masuk' : 'Keluar'}","${t.category}","${desc}","${t.amount}"\n`;
      });
      csvContent += `,,Total Pemasukan,,${summary.totalIncome}\n`;
      csvContent += `,,Total Pengeluaran,,${summary.totalExpense}\n`;
      csvContent += `,,Saldo Akhir Kas,,${summary.closingBalance}\n`;
    } 
    
    else if (reportType === 'stok' && reportData.stockSummary) {
      const summary = reportData.stockSummary;
      csvContent += 'Tanggal,Aktivitas Logistik,Nama Barang,Jumlah,Satuan Takar,Keterangan/Donatur\n';
      summary.transactions.forEach((t) => {
        const detail = t.type === 'masuk' ? (t.donatur || 'Hamba Allah') : (t.description || '');
        const detailClean = detail.replace(/"/g, '""');
        csvContent += `"${t.date}","${t.type === 'masuk' ? 'Barang Masuk' : 'Barang Keluar'}","${t.itemName}","${t.amount}","${t.unit}","${detailClean}"\n`;
      });
    } 
    
    else if (reportType === 'inventaris' && reportData.inventoryList) {
      const list = reportData.inventoryList;
      filename = `Daftar_Stok_Gudang_Realtime_${Date.now()}.csv`;
      csvContent += 'Nama Barang,Kategori Logistik,Sisa Stok Tersedia,Satuan Takar\n';
      list.items.forEach((item) => {
        csvContent += `"${item.name}","${item.category}","${item.stock}","${item.unit}"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Laporan berhasil diekspor sebagai CSV.', 'success');
  };

  // Membagikan Laporan lewat WhatsApp Web
  const handleShareWhatsApp = () => {
    let message = '';
    
    if (reportType === 'kas' && reportData.cashSummary) {
      const summary = reportData.cashSummary;
      message = `*LAPORAN KAS BULANAN - MESJID DIGITAL*\n` +
                `Periode: ${months[selectedMonth]} ${selectedYear}\n\n` +
                `• *Saldo Awal:* ${formatRupiah(summary.openingBalance)}\n` +
                `• *Total Pemasukan:* + ${formatRupiah(summary.totalIncome)}\n` +
                `• *Total Pengeluaran:* - ${formatRupiah(summary.totalExpense)}\n` +
                `• *Saldo Akhir (Kas Bersih):* ${formatRupiah(summary.closingBalance)}\n\n` +
                `_Laporan digenerate otomatis oleh Aplikasi Mesjid Digital._`;
    } 
    
    else if (reportType === 'stok' && reportData.stockSummary) {
      const summary = reportData.stockSummary;
      let mutationText = '';
      
      if (summary.transactions.length === 0) {
        mutationText = 'Tidak ada transaksi mutasi barang pada periode ini.';
      } else {
        summary.transactions.slice(0, 10).forEach((t) => {
          mutationText += `- ${t.date} | ${t.type === 'masuk' ? 'MASUK' : 'KELUAR'}: ${t.itemName} (${t.amount} ${t.unit})\n`;
        });
        if (summary.transactions.length > 10) {
          mutationText += `- ... dan ${summary.transactions.length - 10} mutasi lainnya.\n`;
        }
      }

      message = `*LAPORAN MUTASI BARANG - MESJID DIGITAL*\n` +
                `Periode: ${months[selectedMonth]} ${selectedYear}\n\n` +
                `*Ringkasan Logistik (10 Teratas):*\n${mutationText}\n` +
                `_Laporan digenerate otomatis oleh Aplikasi Mesjid Digital._`;
    } 
    
    else if (reportType === 'inventaris' && reportData.inventoryList) {
      const list = reportData.inventoryList;
      let itemsText = '';

      if (list.items.length === 0) {
        itemsText = 'Tidak ada persediaan barang terdaftar di gudang.';
      } else {
        list.items.forEach((item) => {
          itemsText += `- ${item.name} (${item.category}): *${item.stock} ${item.unit}*\n`;
        });
      }

      message = `*LAPORAN DAFTAR INVENTARIS GUDANG (REAL-TIME)*\n` +
                `Mesjid Digital\n\n` +
                `*Daftar Persediaan Stok Barang:*\n${itemsText}\n` +
                `_Laporan digenerate otomatis oleh Aplikasi Mesjid Digital._`;
    }

    // Buka WhatsApp Web dengan payload teks ter-encode
    const encodedText = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank');
    showToast('Membuka tautan berbagi WhatsApp...', 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Panel Form Pilihan Laporan */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem', textAlign: 'left' }}>
          Pembuatan Laporan Sistem
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Pilih Jenis Laporan */}
          <div className="form-group">
            <label className="form-label">Pilih Jenis Laporan</label>
            <div className="report-select-grid">
              <button
                onClick={() => { setReportType('kas'); setIsGenerated(false); }}
                className={`btn ${reportType === 'kas' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, minWidth: '160px', gap: '0.4rem', padding: '0.65rem' }}
              >
                <FileText size={16} />
                Laporan Kas Bulanan
              </button>
              
              <button
                onClick={() => { setReportType('stok'); setIsGenerated(false); }}
                className={`btn ${reportType === 'stok' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, minWidth: '160px', gap: '0.4rem', padding: '0.65rem' }}
              >
                <Calendar size={16} />
                Laporan Stok Barang
              </button>
              
              <button
                onClick={() => { setReportType('inventaris'); setIsGenerated(false); }}
                className={`btn ${reportType === 'inventaris' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, minWidth: '160px', gap: '0.4rem', padding: '0.65rem' }}
              >
                <Database size={16} />
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
            style={{ width: '100%', padding: '0.8rem', fontWeight: 700 }}
          >
            <Eye size={16} />
            Generate Laporan
          </button>
        </div>
      </div>

      {/* Tampilan Output Pratinjau Laporan */}
      {isGenerated && (
        <div className="glass-card animate-in-fade" style={{ textAlign: 'left' }}>
          
          {/* Header Aksi Ekspor / Berbagi */}
          <div className="flex-mobile-col" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Pratinjau Hasil Laporan</h4>
              <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                Tinjau isi dokumen sebelum diekspor atau dibagikan
              </p>
            </div>
            
            {/* Tombol Bagikan / Expor */}
            <div className="report-action-group">
              <button
                onClick={handleExportPDF}
                className="btn btn-primary"
                style={{ padding: '0.5rem 0.85rem', fontSize: '0.8rem', gap: '0.4rem' }}
                title="Ekspor Laporan ke format PDF"
              >
                <Download size={14} />
                Ekspor PDF
              </button>
              
              <button
                onClick={handleExportCSV}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 0.85rem', fontSize: '0.8rem', gap: '0.4rem' }}
                title="Ekspor data ke CSV untuk Excel/Google Sheets"
              >
                <Table size={14} />
                Ekspor CSV
              </button>
              
              <button
                onClick={handleShareWhatsApp}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 0.85rem', fontSize: '0.8rem', gap: '0.4rem', borderColor: '#25D366', color: '#25D366' }}
              >
                <Share2 size={14} />
                Bagikan ke WA
              </button>
            </div>
          </div>

          {/* 3.1. Visual Pratinjau: Laporan Kas Bulanan */}
          {reportType === 'kas' && reportData.cashSummary && (
            <div className="report-view-box">
              <div className="report-header-print">
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>LAPORAN KAS BULANAN MASJID</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Periode: {months[selectedMonth]} {selectedYear}
                </p>
              </div>

              <div className="report-meta-grid">
                <div>
                  <p style={{ color: 'var(--text-secondary)' }}>Saldo Awal Bulan:</p>
                  <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>{formatRupiah(reportData.cashSummary.openingBalance)}</p>
                </div>
                <div>
                  <p style={{ color: 'var(--text-secondary)' }}>Saldo Akhir Kas:</p>
                  <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)' }}>
                    {formatRupiah(reportData.cashSummary.closingBalance)}
                  </p>
                </div>
                <div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Total Pemasukan: <span style={{ color: '#3B82F6', fontWeight: 600 }}>+{formatRupiah(reportData.cashSummary.totalIncome)}</span></p>
                </div>
                <div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Total Pengeluaran: <span style={{ color: 'var(--accent)', fontWeight: 600 }}>-{formatRupiah(reportData.cashSummary.totalExpense)}</span></p>
                </div>
              </div>

              <h5 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '1.5rem 0 0.5rem 0', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
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
                      {reportData.cashSummary.transactions.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                            Tidak ada data transaksi kas pada periode ini.
                          </td>
                        </tr>
                      ) : (
                        reportData.cashSummary.transactions.map((t) => (
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
                {reportData.cashSummary.transactions.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '1.5rem', fontSize: '0.85rem' }}>
                    Tidak ada data transaksi kas pada periode ini.
                  </div>
                ) : (
                  reportData.cashSummary.transactions.map((t) => (
                    <div key={t.id} className="mobile-data-card" style={{ display: 'block', padding: '0.85rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{t.date}</span>
                        <span className={`badge ${t.type === 'pemasukan' ? 'in' : 'out'}`}>
                          {t.type === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h4 style={{ fontSize: '0.925rem', fontWeight: 700 }}>{t.category}</h4>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                            {t.description || '-'}
                          </p>
                        </div>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: t.type === 'pemasukan' ? 'var(--primary)' : 'var(--danger)' }}>
                          {t.type === 'pemasukan' ? '+' : '-'}{formatRupiah(t.amount)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 3.2. Visual Pratinjau: Laporan Stok Barang */}
          {reportType === 'stok' && reportData.stockSummary && (
            <div className="report-view-box">
              <div className="report-header-print">
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>LAPORAN MUTASI LOGISTIK GUDANG</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
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
                      {reportData.stockSummary.transactions.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                            Tidak ada transaksi logistik barang pada periode ini.
                          </td>
                        </tr>
                      ) : (
                        reportData.stockSummary.transactions.map((t) => (
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
                {reportData.stockSummary.transactions.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '1.5rem', fontSize: '0.85rem' }}>
                    Tidak ada transaksi logistik barang pada periode ini.
                  </div>
                ) : (
                  reportData.stockSummary.transactions.map((t) => (
                    <div key={t.id} className="mobile-data-card" style={{ display: 'block', padding: '0.85rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{t.date}</span>
                        <span className={`badge ${t.type === 'masuk' ? 'in' : 'out'}`}>
                          {t.type === 'masuk' ? 'Barang Masuk' : 'Barang Keluar'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h4 style={{ fontSize: '0.925rem', fontWeight: 700 }}>{t.itemName}</h4>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                            {t.type === 'masuk' ? `Donatur: ${t.donatur || 'Hamba Allah'}` : `Detail: ${t.description || '-'}`}
                          </p>
                        </div>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: t.type === 'masuk' ? 'var(--primary)' : 'var(--danger)' }}>
                          {t.type === 'masuk' ? '+' : '-'}{t.amount} {t.unit}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 3.3. Visual Pratinjau: Daftar Inventaris Terkini */}
          {reportType === 'inventaris' && reportData.inventoryList && (
            <div className="report-view-box">
              <div className="report-header-print">
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>DAFTAR KONDISI INVENTARIS GUDANG</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
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
                      {reportData.inventoryList.items.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                            Gudang masjid kosong. Belum ada barang yang didaftarkan.
                          </td>
                        </tr>
                      ) : (
                        reportData.inventoryList.items.map((item) => (
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
                {reportData.inventoryList.items.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '1.5rem', fontSize: '0.85rem' }}>
                    Gudang masjid kosong. Belum ada barang yang didaftarkan.
                  </div>
                ) : (
                  reportData.inventoryList.items.map((item) => (
                    <div key={item.name} className="mobile-data-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem' }}>
                      <div>
                        <h4 style={{ fontSize: '0.925rem', fontWeight: 700 }}>{item.name}</h4>
                        <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>{item.category}</span>
                        <div style={{ marginTop: '0.25rem' }}>
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
                          fontSize: '1.05rem', 
                          fontWeight: 800, 
                          color: item.stock === 0 ? 'var(--danger)' : item.stock < 10 ? 'var(--accent)' : 'var(--primary)' 
                        }}>
                          {item.stock}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '0.2rem' }}>{item.unit}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};
