import { jsPDF } from 'jspdf';
import type { CashTransaction, InventoryTransaction, InventoryItem } from './storage';

// Tipe data untuk input ekspor laporan
export interface ReportExportData {
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
}

// Ekspor PDF menggunakan jsPDF secara client-side
export const exportToPDF = (
  reportType: 'kas' | 'stok' | 'inventaris',
  reportData: ReportExportData,
  selectedMonth: number,
  selectedYear: number,
  months: string[],
  formatRupiah: (value: number) => string,
  showToast: (msg: string, type: 'success' | 'info' | 'error') => void
) => {
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

  // Blok Tanda Tangan
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

// Pembuatan dan Pengunduhan Berkas CSV
export const exportToCSV = (
  reportType: 'kas' | 'stok' | 'inventaris',
  reportData: ReportExportData,
  selectedMonth: number,
  selectedYear: number,
  showToast: (msg: string, type: 'success' | 'info' | 'error') => void
) => {
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
export const shareToWhatsApp = (
  reportType: 'kas' | 'stok' | 'inventaris',
  reportData: ReportExportData,
  selectedMonth: number,
  selectedYear: number,
  months: string[],
  formatRupiah: (value: number) => string,
  showToast: (msg: string, type: 'success' | 'info' | 'error') => void
) => {
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
