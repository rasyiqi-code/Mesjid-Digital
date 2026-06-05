import { useState, useCallback } from 'react';

// Kunci localStorage untuk penyimpanan pengaturan aplikasi
const SETTINGS_KEY = 'mesjid_digital_settings';

export interface AppSettings {
  mosqueName: string;       // Nama masjid, tampil di Navbar dan PDF laporan
  dkmName: string;          // Nama organisasi DKM
  contactNumber: string;    // Nomor kontak pengurus (opsional)
  criticalStockThreshold: number; // Batas stok kritis (default: 10)
}

// Nilai default pengaturan jika belum pernah dikonfigurasi
const DEFAULT_SETTINGS: AppSettings = {
  mosqueName: 'Masjid Digital',
  dkmName: 'DKM Masjid',
  contactNumber: '',
  criticalStockThreshold: 10,
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

  // Reset pengaturan ke nilai default
  const resetSettings = useCallback(() => {
    saveSettings(DEFAULT_SETTINGS);
  }, [saveSettings]);

  return { settings, saveSettings, resetSettings };
};
