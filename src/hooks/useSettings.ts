import { useState, useCallback } from 'react';

// Kunci localStorage untuk penyimpanan pengaturan aplikasi
const SETTINGS_KEY = 'mesjid_digital_settings';

export interface AppSettings {
  mosqueName: string;             // Nama masjid, tampil di Navbar dan PDF laporan
  dkmName: string;                // Nama organisasi DKM
  contactNumber: string;          // Nomor kontak pengurus (opsional)
  criticalStockThreshold: number; // Batas stok kritis (default: 10)
  // Konfigurasi integrasi Google (opsional)
  appsScriptUrl: string;          // URL Google Apps Script Web App
  appsScriptToken: string;        // Token keamanan yang sama dengan di Apps Script
  lastSyncedAt: number | null;    // Timestamp sinkronisasi terakhir (ms), null jika belum pernah
}

// Nilai default pengaturan jika belum pernah dikonfigurasi
const DEFAULT_SETTINGS: AppSettings = {
  mosqueName: 'Masjid Muttaqin',
  dkmName: 'DKM Masjid Muttaqin',
  contactNumber: '',
  criticalStockThreshold: 10,
  // Integrasi Google — diambil dari env jika ada, fallback ke hardcoded kode
  appsScriptUrl: import.meta.env.VITE_DEFAULT_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbzHs36-arIW9L0ouFMyaAAG6_HJRMMm10ucEb0BNiuUw00Fgg0sPj6AbS84xl61K-zv/exec',
  appsScriptToken: import.meta.env.VITE_DEFAULT_APPS_SCRIPT_TOKEN || 'masjid-muttaqin-2026',
  lastSyncedAt: null,
};


// Muat pengaturan dari localStorage, fallback ke nilai default
const loadSettings = (): AppSettings => {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch {
    // Abaikan error parsing, gunakan default
  }
  return DEFAULT_SETTINGS;
};

// Hook pengaturan aplikasi yang persisten via localStorage
export const useSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);

  // Simpan pengaturan baru ke state dan localStorage
  const saveSettings = useCallback((newSettings: AppSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    } catch {
      console.error('Gagal menyimpan pengaturan ke localStorage.');
    }
  }, []);

  // Update hanya field lastSyncedAt tanpa perlu rebuild seluruh settings
  const updateLastSynced = useCallback((timestamp: number) => {
    setSettings((prev) => {
      const updated = { ...prev, lastSyncedAt: timestamp };
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
      } catch {
        console.error('Gagal menyimpan waktu sinkronisasi.');
      }
      return updated;
    });
  }, []);

  // Reset pengaturan ke nilai default
  const resetSettings = useCallback(() => {
    saveSettings(DEFAULT_SETTINGS);
  }, [saveSettings]);

  return { settings, saveSettings, resetSettings, updateLastSynced };
};
