import React, { useState } from 'react';
import type { AppSettings } from '../hooks/useSettings';
import { Save, RotateCcw, Settings2, Building2, Phone, AlertTriangle, User } from 'lucide-react';

interface SettingsPanelProps {
  settings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
  onReset: () => void;
  showToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

// Komponen panel pengaturan konfigurasi aplikasi masjid
export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onSave,
  onReset,
  showToast,
}) => {
  // State form lokal, sinkronisasi awal dari props
  const [mosqueName, setMosqueName] = useState(settings.mosqueName);
  const [dkmName, setDkmName] = useState(settings.dkmName);
  const [contactNumber, setContactNumber] = useState(settings.contactNumber);
  const [criticalStockThreshold, setCriticalStockThreshold] = useState(
    settings.criticalStockThreshold
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mosqueName.trim()) {
      showToast('Nama masjid tidak boleh kosong!', 'error');
      return;
    }
    if (criticalStockThreshold < 1 || criticalStockThreshold > 100) {
      showToast('Batas stok kritis harus antara 1 hingga 100.', 'error');
      return;
    }
    onSave({ mosqueName: mosqueName.trim(), dkmName: dkmName.trim(), contactNumber, criticalStockThreshold });
    showToast('Pengaturan berhasil disimpan.', 'success');
  };

  const handleReset = () => {
    if (confirm('Reset semua pengaturan ke nilai default?')) {
      onReset();
      // Sinkronkan ulang state form ke nilai default
      setMosqueName('Masjid Digital');
      setDkmName('DKM Masjid');
      setContactNumber('');
      setCriticalStockThreshold(10);
      showToast('Pengaturan berhasil direset ke nilai default.', 'info');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '680px', margin: '0 auto' }}>

      {/* Header */}
      <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)', padding: '0.75rem', borderRadius: '12px' }}>
          <Settings2 size={28} />
        </div>
        <div style={{ textAlign: 'left' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Pengaturan Aplikasi</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Konfigurasi identitas masjid dan preferensi sistem
          </p>
        </div>
      </div>

      {/* Form Pengaturan */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Identitas Masjid */}
        <div className="glass-card" style={{ textAlign: 'left' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 size={18} style={{ color: 'var(--primary)' }} />
            Identitas Masjid
          </h3>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="setting-mosque-name">Nama Masjid</label>
              <input
                id="setting-mosque-name"
                type="text"
                value={mosqueName}
                onChange={(e) => setMosqueName(e.target.value)}
                placeholder="Cth: Masjid Al-Ikhlas"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="setting-dkm-name">Nama Organisasi DKM</label>
              <input
                id="setting-dkm-name"
                type="text"
                value={dkmName}
                onChange={(e) => setDkmName(e.target.value)}
                placeholder="Cth: DKM Al-Ikhlas"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="setting-contact">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Phone size={13} />
                Nomor Kontak Pengurus (Opsional)
              </span>
            </label>
            <input
              id="setting-contact"
              type="tel"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              placeholder="Cth: 0812-3456-7890"
              className="form-input"
            />
          </div>
        </div>

        {/* Preferensi Sistem */}
        <div className="glass-card" style={{ textAlign: 'left' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={18} style={{ color: 'var(--accent)' }} />
            Preferensi Sistem
          </h3>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="setting-stock-threshold">
              Batas Stok Kritis (unit)
            </label>
            <input
              id="setting-stock-threshold"
              type="number"
              value={criticalStockThreshold}
              onChange={(e) => setCriticalStockThreshold(Number(e.target.value))}
              min={1}
              max={100}
              className="form-input"
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
              Barang dengan stok di bawah nilai ini akan ditandai sebagai kritis dan muncul sebagai peringatan di Dashboard.
              Nilai saat ini: <strong style={{ color: 'var(--accent)' }}>{criticalStockThreshold} unit</strong>
            </p>
          </div>
        </div>

        {/* Info Pengembang */}
        <div className="glass-card" style={{ textAlign: 'left', borderColor: 'rgba(59, 130, 246, 0.15)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={18} style={{ color: 'var(--info)' }} />
            Tentang Aplikasi
          </h3>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--text-primary)' }}>Masjid Digital</strong> — Sistem Informasi Manajemen Mandiri Masjid.
            <br />Versi <strong>1.2.0</strong> · Data tersimpan secara lokal di perangkat (IndexedDB).
            <br />Mendukung mode offline dengan sinkronisasi otomatis saat koneksi pulih.
          </p>
        </div>

        {/* Tombol Aksi */}
        <div style={{ display: 'flex', gap: '0.75rem', flexDirection: 'column' }}>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }}>
            <Save size={18} />
            Simpan Pengaturan
          </button>
          <button type="button" onClick={handleReset} className="btn btn-secondary" style={{ width: '100%', padding: '0.85rem' }}>
            <RotateCcw size={16} />
            Reset ke Default
          </button>
        </div>
      </form>
    </div>
  );
};
