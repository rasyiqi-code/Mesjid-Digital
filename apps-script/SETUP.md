# Panduan Setup Google Apps Script — Masjid Digital

## Apa ini?

File `Code.gs` adalah backend **gratis** berbasis Google Apps Script yang menghubungkan
aplikasi Masjid Digital ke Google Sheets (database) dan Google Drive (penyimpanan foto).

Tidak perlu server, tidak perlu bayar hosting.

---

## Syarat

- Akun Google milik DKM/pengurus masjid
- Akses ke [script.google.com](https://script.google.com)

---

## Langkah Setup (Lakukan Satu Kali)

### 1. Buat Google Spreadsheet

1. Buka [sheets.google.com](https://sheets.google.com)
2. Buat Spreadsheet baru, beri nama: **"Database Masjid Digital"**
3. **Simpan dulu**, jangan tutup tab ini

### 2. Buat Project Apps Script

1. Di dalam Spreadsheet yang baru dibuat, klik **Extensions → Apps Script**
2. Akan terbuka editor script baru
3. **Hapus** semua kode yang ada di editor (biasanya ada `function myFunction() {}`)
4. **Paste** seluruh isi file `Code.gs` dari folder ini
5. Klik ikon 💾 **Save** atau tekan `Ctrl+S`
6. Beri nama project: **"Masjid Digital API"**

### 3. Jalankan Setup Awal

1. Di editor Apps Script, pilih fungsi **`setupSpreadsheet`** dari dropdown fungsi
2. Klik ▶️ **Run**
3. Akan muncul dialog izin akses Google → klik **Review permissions**
4. Pilih akun Google DKM → klik **Allow**
5. Tunggu hingga selesai — akan muncul log: `✅ Setup selesai!`

> Setelah ini, Spreadsheet akan punya 3 tab: **kas**, **barang**, **program**

### 4. Set Token Keamanan

Token ini mencegah orang lain mengakses API masjid Anda.

1. Di editor Apps Script, klik tombol ▶️ dropdown → pilih **`setSecretToken`**
2. **Edit** kode sementara untuk memanggil fungsi dengan token Anda:
   ```javascript
   // Contoh — ganti 'token-saya' dengan token pilihan Anda (min 6 karakter)
   setSecretToken('masjid-alikhlas-2026')
   ```
3. Klik ▶️ **Run**
4. **Hapus kembali** baris setSecretToken tersebut (token sudah tersimpan di server)
5. **Catat token ini** — akan diinput ke aplikasi Masjid Digital

> ⚠️ **Jangan** bagikan token ini ke sembarang orang.

### 5. Deploy sebagai Web App

1. Klik tombol **Deploy** (kanan atas) → **New deployment**
2. Klik ⚙️ di sebelah "Select type" → pilih **Web app**
3. Isi konfigurasi:
   - **Description**: `Masjid Digital API v1`
   - **Execute as**: `Me (nama@gmail.com)`
   - **Who has access**: `Anyone`
4. Klik **Deploy**
5. Copy **Web App URL** yang muncul (bentuknya seperti):
   ```
   https://script.google.com/macros/s/AKfycb.../exec
   ```
6. Klik **Done**

### 6. Konfigurasi di Aplikasi Masjid Digital

1. Buka aplikasi Masjid Digital
2. Buka tab **Pengaturan**
3. Di bagian **"Integrasi Google"**:
   - Paste **Web App URL** dari langkah 5
   - Masukkan **Token** dari langkah 4
4. Klik **Test Koneksi** → pastikan muncul ✅ berhasil
5. Klik **Simpan Pengaturan**

Selesai! Sekarang Anda bisa menekan **"Sync ke Google Sheets"** untuk sinkronisasi data.

---

## Cara Update Deployment

Jika kode di `Code.gs` diupdate:

1. Edit kode di Apps Script editor
2. Klik **Deploy** → **Manage deployments**
3. Klik ✏️ edit → **Version**: New version → **Deploy**

---

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| "Token tidak valid" | Pastikan token di Pengaturan sama persis dengan yang diset |
| "Spreadsheet belum di-setup" | Jalankan `setupSpreadsheet()` lagi dari editor |
| Foto tidak muncul | Google Drive mungkin butuh beberapa menit untuk link publik aktif |
| Koneksi timeout | Coba lagi — Apps Script kadang lambat di request pertama |

---

## Kuota Gratis Google

Apps Script gratis dengan batas harian:
- **Eksekusi script**: 6 jam/hari (lebih dari cukup untuk masjid)
- **Upload Drive**: 100 MB/hari
- **Baris di Sheets**: tidak terbatas

Untuk masjid kecil-menengah, kuota ini tidak akan pernah habis.
