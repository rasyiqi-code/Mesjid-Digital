/**
 * Masjid Digital — Google Apps Script Backend
 * ============================================
 * Bertindak sebagai API gateway gratis:
 *   - Menyimpan data transaksi ke Google Sheets
 *   - Menyimpan foto bukti ke Google Drive
 *
 * LANGKAH SETUP (lihat SETUP.md untuk detail lengkap):
 *   1. Buka script.google.com → Project Baru
 *   2. Paste seluruh isi file ini
 *   3. Jalankan fungsi setupSpreadsheet() dari menu Run
 *   4. Jalankan setSecretToken('token-rahasia-anda') dari menu Run
 *   5. Deploy → New Deployment → Web App → Execute as: Me → Who has access: Anyone
 *   6. Salin URL Web App → paste ke Pengaturan di aplikasi Masjid Digital
 */

// ─── Konfigurasi Internal ────────────────────────────────────────────────────

/** Kunci untuk Script Properties */
const PROP = {
  TOKEN: 'MASJID_TOKEN',
  SPREADSHEET_ID: 'SPREADSHEET_ID',
  FOLDER_ID: 'FOLDER_ID',
};

/** Nama tab di Spreadsheet */
const SHEET = {
  KAS: 'kas',
  BARANG: 'barang',
  PROGRAM: 'program',
  LAPORAN_KAS: 'laporan_kas',
};

/** Kolom header setiap tab */
const HEADERS = {
  KAS: ['id', 'type', 'category', 'amount', 'description', 'date', 'evidenceUrl'],
  BARANG: ['id', 'type', 'itemName', 'amount', 'unit', 'donatur', 'category', 'description', 'date'],
  PROGRAM: ['id', 'title', 'dayOrDate', 'time', 'location', 'picName', 'description', 'isRecurring', 'recurrenceType', 'createdAt'],
};

// ─── Fungsi Setup (Jalankan Satu Kali) ──────────────────────────────────────

/**
 * Inisialisasi Spreadsheet dan folder Drive.
 * Jalankan fungsi ini dari menu Run → setupSpreadsheet() sebelum deploy.
 * Token keamanan akan otomatis diset ke nilai DEFAULT_TOKEN di bawah.
 */

/** Token keamanan — ganti jika ingin menggunakan token berbeda */
const DEFAULT_TOKEN = 'masjid-muttaqin-2026';

function setupSpreadsheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const props = PropertiesService.getScriptProperties();

  // Simpan ID Spreadsheet
  props.setProperty(PROP.SPREADSHEET_ID, ss.getId());

  // Buat tab dan header untuk setiap store
  const sheetDefs = [
    { name: SHEET.KAS, headers: HEADERS.KAS },
    { name: SHEET.BARANG, headers: HEADERS.BARANG },
    { name: SHEET.PROGRAM, headers: HEADERS.PROGRAM },
  ];

  for (const def of sheetDefs) {
    let sheet = ss.getSheetByName(def.name);
    if (!sheet) {
      sheet = ss.insertSheet(def.name);
    }
    // Tulis header jika tab masih kosong
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(def.headers);
      sheet.getRange(1, 1, 1, def.headers.length)
        .setFontWeight('bold')
        .setBackground('#1e3a2f')
        .setFontColor('#ffffff');
    }
  }

  // Buat folder Drive khusus untuk foto bukti transaksi
  const folderName = 'Bukti Transaksi Masjid Digital';
  const existing = DriveApp.getFoldersByName(folderName);
  const folder = existing.hasNext() ? existing.next() : DriveApp.createFolder(folderName);
  props.setProperty(PROP.FOLDER_ID, folder.getId());

  // Set token keamanan otomatis
  props.setProperty(PROP.TOKEN, DEFAULT_TOKEN);

  // Buat sheet laporan_kas visual awal (template kosong)
  updateLaporanKasSheet(ss);

  return `✅ Setup selesai!\n  Spreadsheet: ${ss.getUrl()}\n  Folder Drive: https://drive.google.com/drive/folders/${folder.getId()}\n  Token: ${DEFAULT_TOKEN}`;
}


/**
 * Set token keamanan.
 * Contoh penggunaan di Apps Script editor:
 *   setSecretToken('masjid-alikhlas-2026')
 * Gunakan token yang sama di Pengaturan aplikasi.
 */
function setSecretToken(token) {
  if (!token || token.length < 6) {
    return '❌ Token harus minimal 6 karakter.';
  }
  PropertiesService.getScriptProperties().setProperty(PROP.TOKEN, token);
  return `✅ Token "${token}" berhasil disimpan.`;
}

// ─── Utilitas ────────────────────────────────────────────────────────────────

/** Verifikasi token dari request */
function verifyToken(token) {
  const stored = PropertiesService.getScriptProperties().getProperty(PROP.TOKEN);
  // Jika token belum diset, izinkan akses (untuk setup pertama kali)
  if (!stored) return true;
  return token === stored;
}

/** Buat ContentService response JSON dengan header CORS */
function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Tulis baris data ke sheet — hapus konten lama, tulis ulang dari awal */
function overwriteSheet(sheetName, headers, rows) {
  const spreadsheetId = PropertiesService.getScriptProperties().getProperty(PROP.SPREADSHEET_ID);

  if (!spreadsheetId) {
    throw new Error('Spreadsheet belum di-setup. Jalankan setupSpreadsheet() terlebih dahulu.');
  }

  const ss = SpreadsheetApp.openById(spreadsheetId);
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  // Hapus semua isi
  sheet.clearContents();

  // Tulis header
  sheet.appendRow(headers);
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground('#1e3a2f')
    .setFontColor('#ffffff');

  // Tulis baris data
  if (rows && rows.length > 0) {
    const values = rows.map(row =>
      headers.map(h => {
        const v = row[h];
        if (v === undefined || v === null) return '';
        if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
        return String(v);
      })
    );
    sheet.getRange(2, 1, values.length, headers.length).setValues(values);
  }

  return rows ? rows.length : 0;
}

// ─── Handler GET ─────────────────────────────────────────────────────────────

/**
 * doGet: endpoint untuk ping / test koneksi.
 * URL contoh: https://script.google.com/.../exec?action=ping&token=xxx
 */
function doGet(e) {
  try {
    const token = (e.parameter && e.parameter.token) || '';
    if (!verifyToken(token)) {
      return jsonResponse({ ok: false, error: 'Token tidak valid.' });
    }

    const action = (e.parameter && e.parameter.action) || 'ping';

    if (action === 'ping') {
      return jsonResponse({ ok: true, message: 'Masjid Digital API aktif 🕌' });
    }

    return jsonResponse({ ok: false, error: `Action tidak dikenal: ${action}` });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.toString() });
  }
}

// ─── Handler POST ────────────────────────────────────────────────────────────

/**
 * doPost: endpoint utama untuk sinkronisasi data dan upload foto.
 * Body: JSON { token, action, ...data }
 */
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const token = payload.token || '';

    if (!verifyToken(token)) {
      return jsonResponse({ ok: false, error: 'Token tidak valid.' });
    }

    const action = payload.action;

    switch (action) {

      // Sinkronisasi batch: semua data sekaligus
      case 'sync_all': {
        const kasCount = overwriteSheet(SHEET.KAS, HEADERS.KAS, payload.kas || []);
        const barangCount = overwriteSheet(SHEET.BARANG, HEADERS.BARANG, payload.barang || []);
        const programCount = overwriteSheet(SHEET.PROGRAM, HEADERS.PROGRAM, payload.program || []);
        
        // Perbarui sheet laporan_kas visual untuk embed website
        const spreadsheetId = PropertiesService.getScriptProperties().getProperty(PROP.SPREADSHEET_ID);
        if (spreadsheetId) {
          const ss = SpreadsheetApp.openById(spreadsheetId);
          updateLaporanKasSheet(ss);
        }

        return jsonResponse({
          ok: true,
          message: 'Sinkronisasi selesai.',
          counts: { kas: kasCount, barang: barangCount, program: programCount },
          syncedAt: new Date().toISOString(),
        });
      }

      // Upload foto bukti ke Google Drive
      case 'upload_image': {
        return handleUploadImage(payload.base64, payload.filename);
      }

      default:
        return jsonResponse({ ok: false, error: `Action tidak dikenal: ${action}` });
    }
  } catch (err) {
    return jsonResponse({ ok: false, error: err.toString() });
  }
}

// ─── Handler Upload Foto ─────────────────────────────────────────────────────

/**
 * Upload gambar base64 ke Google Drive.
 * Kembalikan URL publik (dapat langsung ditampilkan di <img src="...">).
 */
function handleUploadImage(base64Data, filename) {
  if (!base64Data) {
    return jsonResponse({ ok: false, error: 'Data gambar kosong.' });
  }

  // Pisahkan prefix "data:image/jpeg;base64,..." dari data aktual
  const match = base64Data.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    return jsonResponse({ ok: false, error: 'Format base64 tidak valid. Harus dimulai dengan "data:[mimeType];base64,"' });
  }

  const mimeType = match[1];
  const rawBase64 = match[2];
  const decoded = Utilities.base64Decode(rawBase64);
  const safeFilename = filename || `bukti_${Date.now()}.jpg`;
  const blob = Utilities.newBlob(decoded, mimeType, safeFilename);

  // Cari folder yang sudah dibuat saat setup
  const folderId = PropertiesService.getScriptProperties().getProperty(PROP.FOLDER_ID);
  const folder = folderId ? DriveApp.getFolderById(folderId) : DriveApp.getRootFolder();

  // Simpan file dan buat bisa diakses siapa saja (view only)
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  const fileId = file.getId();

  // URL format ini langsung bisa digunakan sebagai src gambar
  const publicUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;

  return jsonResponse({ ok: true, url: publicUrl, fileId: fileId });
}

/**
 * Membuat dan memperbarui sheet laporan_kas yang terformat rapi untuk di-embed ke website.
 * Fungsi ini otomatis menghitung saldo, pemasukan, pengeluaran, dan menampilkan
 * 50 transaksi terbaru dengan gaya visual hijau khas masjid.
 */
function updateLaporanKasSheet(ss) {
  const kasSheet = ss.getSheetByName(SHEET.KAS);
  if (!kasSheet) return;

  // 1. Ambil data transaksi mentah dari sheet kas
  const lastRow = kasSheet.getLastRow();
  let transactions = [];
  if (lastRow > 1) {
    const values = kasSheet.getRange(2, 1, lastRow - 1, HEADERS.KAS.length).getValues();
    transactions = values.map(row => {
      const t = {};
      HEADERS.KAS.forEach((h, idx) => {
        t[h] = row[idx];
      });
      return t;
    });
  }

  // 2. Hitung statistik kas secara kumulatif
  let totalIncome = 0;
  let totalExpense = 0;
  transactions.forEach(t => {
    const amount = Number(t.amount) || 0;
    if (t.type === 'pemasukan') {
      totalIncome += amount;
    } else if (t.type === 'pengeluaran') {
      totalExpense += amount;
    }
  });
  const balance = totalIncome - totalExpense;

  // Dapatkan atau buat sheet laporan_kas
  let reportSheet = ss.getSheetByName(SHEET.LAPORAN_KAS);
  if (!reportSheet) {
    reportSheet = ss.insertSheet(SHEET.LAPORAN_KAS);
  }

  // Hapus semua data dan format lama agar tata letak tetap konsisten
  reportSheet.clear();
  reportSheet.clearFormats();
  
  // Matikan gridlines untuk tampilan embed website yang lebih clean
  reportSheet.setHiddenGridlines(true);

  // 3. Tulis Judul Laporan (Header Utama)
  reportSheet.getRange('A1').setValue('LAPORAN RINGKASAN KEUANGAN KAS MASJID');
  reportSheet.getRange('A1:F1').merge();
  reportSheet.getRange('A1')
    .setFontWeight('bold')
    .setFontSize(14)
    .setFontColor('#ffffff')
    .setBackground('#1e3a2f') // Hijau gelap masjid
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  reportSheet.setRowHeight(1, 40);

  // Subtitle tanggal pembaharuan
  const formattedDate = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'dd MMM yyyy HH:mm');
  reportSheet.getRange('A2').setValue('Terakhir diperbarui secara otomatis pada: ' + formattedDate + ' WIB');
  reportSheet.getRange('A2:F2').merge();
  reportSheet.getRange('A2')
    .setFontStyle('italic')
    .setFontSize(9)
    .setFontColor('#555555')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  reportSheet.setRowHeight(2, 22);

  // 4. Buat Kotak Ringkasan Saldo (Baris 4 & 5)
  // Kolom A-B (Pemasukan), C-D (Pengeluaran), E-F (Saldo)
  reportSheet.getRange('A4:B4').merge().setValue('TOTAL PEMASUKAN');
  reportSheet.getRange('C4:D4').merge().setValue('TOTAL PENGELUARAN');
  reportSheet.getRange('E4:F4').merge().setValue('SALDO KAS SAAT INI');
  
  reportSheet.getRange('A4:F4')
    .setFontWeight('bold')
    .setFontSize(9)
    .setFontColor('#ffffff')
    .setBackground('#2d5a27') // Hijau daun
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');

  reportSheet.getRange('A5:B5').merge().setValue(totalIncome);
  reportSheet.getRange('C5:D5').merge().setValue(totalExpense);
  reportSheet.getRange('E5:F5').merge().setValue(balance);
  
  reportSheet.getRange('A5:F5')
    .setFontWeight('bold')
    .setFontSize(13)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  
  // Format Rupiah untuk box ringkasan
  reportSheet.getRange('A5:F5').setNumberFormat('"Rp"#,##0');
  
  // Warna khusus untuk membedakan Pemasukan, Pengeluaran, dan Saldo
  reportSheet.getRange('A5:B5').setFontColor('#2e7d32'); // Hijau tua
  reportSheet.getRange('C5:D5').setFontColor('#c62828'); // Merah tua
  reportSheet.getRange('E5:F5').setFontColor('#1565c0'); // Biru tua
  
  // Berikan border di kotak ringkasan
  const summaryRange = reportSheet.getRange('A4:F5');
  summaryRange.setBorder(true, true, true, true, true, true, '#cccccc', SpreadsheetApp.BorderStyle.SOLID);
  reportSheet.setRowHeight(4, 22);
  reportSheet.setRowHeight(5, 32);

  // 5. Bagian Riwayat Transaksi Terbaru (50 Data Teratas)
  reportSheet.getRange('A7').setValue('RIWAYAT TRANSAKSI TERBARU (Maksimal 50 Data Terakhir)');
  reportSheet.getRange('A7:F7').merge();
  reportSheet.getRange('A7')
    .setFontWeight('bold')
    .setFontSize(11)
    .setFontColor('#1e3a2f')
    .setVerticalAlignment('middle');
  reportSheet.setRowHeight(7, 30);

  // Header Tabel Transaksi (Baris 8)
  const tableHeaders = ['No', 'Tanggal', 'Kategori', 'Keterangan', 'Jenis', 'Jumlah'];
  reportSheet.getRange(8, 1, 1, 6).setValues([tableHeaders]);
  reportSheet.getRange('A8:F8')
    .setFontWeight('bold')
    .setFontSize(9)
    .setFontColor('#ffffff')
    .setBackground('#1e3a2f')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  reportSheet.setRowHeight(8, 25);

  // Urutkan transaksi dari tanggal terbaru ke terlama
  const recentTransactions = transactions
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 50);

  // Tulis data transaksi ke tabel
  if (recentTransactions.length > 0) {
    const tableData = recentTransactions.map((t, idx) => {
      // Format tanggal lokal (YYYY-MM-DD ke DD/MM/YYYY)
      let displayDate = t.date;
      if (t.date) {
        try {
          const d = new Date(t.date);
          const day = ('0' + d.getDate()).slice(-2);
          const month = ('0' + (d.getMonth() + 1)).slice(-2);
          const year = d.getFullYear();
          displayDate = day + '/' + month + '/' + year;
        } catch (e) {}
      }
      return [
        idx + 1,
        displayDate,
        t.category || '',
        t.description || '',
        t.type === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran',
        Number(t.amount) || 0
      ];
    });

    const startRow = 9;
    const numRows = tableData.length;
    
    // Tulis sekaligus untuk efisiensi
    reportSheet.getRange(startRow, 1, numRows, 6).setValues(tableData);

    const dataRange = reportSheet.getRange(startRow, 1, numRows, 6);
    dataRange.setFontSize(9).setVerticalAlignment('middle');
    
    // Set perataan kolom
    reportSheet.getRange(startRow, 1, numRows, 1).setHorizontalAlignment('center'); // No
    reportSheet.getRange(startRow, 2, numRows, 1).setHorizontalAlignment('center'); // Tanggal
    reportSheet.getRange(startRow, 3, numRows, 1).setHorizontalAlignment('left');   // Kategori
    reportSheet.getRange(startRow, 4, numRows, 1).setHorizontalAlignment('left');   // Keterangan
    reportSheet.getRange(startRow, 5, numRows, 1).setHorizontalAlignment('center'); // Jenis
    reportSheet.getRange(startRow, 6, numRows, 1).setHorizontalAlignment('right');  // Jumlah

    // Format Mata Uang Rupiah di kolom Jumlah
    reportSheet.getRange(startRow, 6, numRows, 1).setNumberFormat('"Rp"#,##0');

    // Beri gaya warna baris dan jenis transaksi
    for (let i = 0; i < numRows; i++) {
      const rowNum = startRow + i;
      const type = tableData[i][4];
      
      // Zebra striping latar belakang
      const bgColor = i % 2 === 0 ? '#ffffff' : '#f5f7f5';
      reportSheet.getRange(rowNum, 1, 1, 6).setBackground(bgColor);

      // Warna khusus teks untuk Pemasukan (Hijau) & Pengeluaran (Merah)
      if (type === 'Pemasukan') {
        reportSheet.getRange(rowNum, 5).setFontColor('#2e7d32').setFontWeight('bold');
        reportSheet.getRange(rowNum, 6).setFontColor('#2e7d32');
      } else {
        reportSheet.getRange(rowNum, 5).setFontColor('#c62828').setFontWeight('bold');
        reportSheet.getRange(rowNum, 6).setFontColor('#c62828');
      }
      
      reportSheet.setRowHeight(rowNum, 20);
    }

    // Beri border tipis untuk data tabel
    dataRange.setBorder(true, true, true, true, true, true, '#e0e0e0', SpreadsheetApp.BorderStyle.SOLID);
  }

  // Atur lebar kolom secara dinamis dengan sedikit tambahan padding agar tidak terpotong
  for (let col = 1; col <= 6; col++) {
    reportSheet.autoResizeColumn(col);
    const w = reportSheet.getColumnWidth(col);
    reportSheet.setColumnWidth(col, w + 12);
  }
}
