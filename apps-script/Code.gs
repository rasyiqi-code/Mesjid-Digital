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
