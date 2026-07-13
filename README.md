# Mesjid-Digital 🕌

Sistem Informasi Manajemen Mandiri Masjid - Platform administrasi modern untuk pengelolaan data keuangan, inventaris, dan program masjid.

Aplikasi berbasis web yang dirancang khusus untuk memudahkan pengelolaan operasional masjid dengan penyimpanan data lokal, sinkronisasi real-time ke Google Sheets, dan akses berbasis peran.

## 🎯 Fitur Utama

- 💰 **Manajemen Kas & Keuangan** - Pencatatan transaksi kas masuk/keluar dengan bukti foto dan riwayat lengkap
- 📦 **Manajemen Inventaris** - Tracking stok gudang secara real-time, kategori barang, dan mutasi barang
- 📋 **Program Masjid** - Daftar dan kelola program-program yang dijalankan masjid
- 📊 **Laporan** - Generate laporan keuangan dan inventaris yang dapat diekspor
- 🔐 **Admin & Guest Access** - Role-based access control dengan login terpisah untuk admin dan tamu
- 💾 **Penyimpanan Lokal** - Data disimpan di IndexedDB untuk privasi maksimal
- 🔄 **Sinkronisasi Google Sheets** - Backup otomatis dan sinkronisasi data ke Google Sheets
- 📱 **Responsive Design** - Mobile-first design, bekerja sempurna di desktop maupun smartphone
- 🌐 **Offline-Ready** - Bekerja tanpa koneksi internet dengan queue management
- 🔔 **Real-time Notification** - Toast notifications untuk feedback pengguna
- 🎨 **Modern UI** - Interface yang clean dengan glass morphism design

## 🚀 Tech Stack

| Tool | Version | Kegunaan |
|------|---------|----------|
| **React** | 19.2.6 | UI Framework |
| **TypeScript** | 6.0.2 | Type Safety |
| **Vite** | 8.0.12 | Build Tool & Dev Server |
| **Capacitor** | 8.4.0 | Cross-platform (Android/iOS) |
| **Lucide React** | 1.17.0 | Icon Library |
| **jsPDF** | 4.2.1 | PDF Generation untuk laporan |
| **Canvas Confetti** | 1.9.4 | Celebration effects |
| **ESLint** | 10.3.0 | Code Quality |

## 📋 Persyaratan

- Node.js v16 atau lebih tinggi
- npm atau yarn
- (Opsional) Android Studio & Android SDK untuk development Android
- (Opsional) Xcode untuk development iOS (macOS only)

## 🛠️ Instalasi & Setup

### 1. Clone Repository
```bash
git clone https://github.com/rasyiqi-code/Mesjid-Digital.git
cd Mesjid-Digital
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Jalankan Development Server
```bash
npm run dev
```
Aplikasi akan tersedia di `http://localhost:5173`

### 4. Build untuk Production
```bash
npm run build
```

## 📜 Perintah yang Tersedia

```bash
npm run dev        # Jalankan development server dengan hot reload
npm run build      # Build untuk production
npm run preview    # Preview production build secara lokal
npm run lint       # Jalankan ESLint untuk cek kualitas kode
npm run lint --fix # Perbaiki issue ESLint secara otomatis
```

## 📱 Mobile Development (Capacitor)

### Setup Android
```bash
# Install Capacitor CLI
npm install -g @capacitor/cli

# Tambah platform Android
npx cap add android

# Build dan sync
npm run build
npx cap sync android

# Buka di Android Studio
npx cap open android
```

### Setup iOS
```bash
# Tambah platform iOS
npx cap add ios

# Build dan sync
npm run build
npx cap sync ios

# Buka di Xcode
npx cap open ios
```

## 📁 Struktur Project

```
Mesjid-Digital/
├── src/
│   ├── components/           # React components
│   │   ├── Navbar.tsx       # Navbar & sync indicator
│   │   ├── Sidebar.tsx      # Sidebar menu
│   │   ├── Dashboard.tsx    # Dashboard overview
│   │   ├── CashHistory.tsx  # Riwayat transaksi kas
│   │   ├── InventoryHistory.tsx  # Riwayat mutasi barang
│   │   ├── InventoryForm.tsx     # Form input barang
│   │   ├── CashTransactionForm.tsx # Form input kas
│   │   ├── ProgramManager.tsx    # Kelola program
│   │   ├── ReportGenerator.tsx   # Generate laporan PDF
│   │   ├── SettingsPanel.tsx     # Pengaturan & Google Sheets
│   │   └── ...
│   ├── hooks/
│   │   └── useMosqueData.ts # Custom hook untuk state management
│   ├── styles/
│   │   └── index.css        # Global styles
│   ├── App.tsx              # Main app component
│   └── main.tsx             # Entry point
├── public/                   # Static assets
├── android/                  # Android project (Capacitor)
├── ios/                      # iOS project (Capacitor)
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
├── vite.config.ts           # Vite config
├── eslint.config.js         # ESLint rules
└── README.md               # Documentation
```

## 🔑 Fitur Key

### Manajemen Kas
- Pencatatan transaksi masuk/keluar
- Attach bukti foto untuk setiap transaksi
- Filter dan pencarian transaksi
- Riwayat lengkap dengan tanggal dan nominal
- Ringkasan saldo kas

### Manajemen Inventaris
- Real-time stock tracking
- Pencatatan mutasi barang (in/out)
- Kategorisasi barang
- Alert stok kritis (< 10 unit)
- Pencarian barang

### Dashboard
- Overview kas terkini
- List barang stok kritis
- Antrian transaksi (queue)
- Status koneksi & sinkronisasi

### Admin & Keamanan
- Login terpisah untuk Admin dan Tamu
- Password reset
- Role-based access control
- Riwayat login

### Sinkronisasi & Backup
- Sinkronisasi real-time ke Google Sheets
- Apps Script URL & Token untuk keamanan
- Offline queue management
- Manual dan automatic sync

## 🔐 Data Privacy

Semua data disimpan **secara lokal** di IndexedDB (browser database) untuk privasi maksimal. Sinkronisasi ke Google Sheets adalah **optional** dan hanya jika Anda mengkonfigurasinya.

## 🤝 Kontribusi

Kami menerima kontribusi! Untuk berkontribusi:

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

Pastikan code lolos linting:
```bash
npm run lint -- --fix
```

## 📄 Lisensi

Project ini open source - silakan dimodifikasi sesuai kebutuhan masjid Anda.

## 🙏 Dukungan & Support

Untuk pertanyaan, laporan bug, atau request fitur, silakan buka [issue](https://github.com/rasyiqi-code/Mesjid-Digital/issues) di repository ini.

## 👨‍💻 Dibuat oleh

**RASYIQI** - [@rasyiqi-code](https://github.com/rasyiqi-code)

---

**Masjid Digital v1.3.0** - Simplifying Mosque Management 🌟
