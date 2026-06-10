import React, { useState } from 'react';
import type { AppSettings } from '../hooks/useSettings';
import { Save, RotateCcw } from 'lucide-react';
import { SettingsIdentitySection } from './SettingsIdentitySection';
import { SettingsSystemSection } from './SettingsSystemSection';
import { SettingsGoogleSection } from './SettingsGoogleSection';

interface SettingsPanelProps {
  settings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
  onReset: () => void;
  onSync: () => Promise<void>; // Handler sinkronisasi manual ke Google Sheets
  showToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onSave,
  onReset,
  onSync,
  showToast,
}) => {
  // ─── State Form Identitas ────────────────────────────────────────────────
  const [mosqueName, setMosqueName] = useState(settings.mosqueName);
  const [dkmName, setDkmName] = useState(settings.dkmName);
  const [contactNumber, setContactNumber] = useState(settings.contactNumber);
  const [criticalStockThreshold, setCriticalStockThreshold] = useState(
    settings.criticalStockThreshold
  );
  const [adminPassword, setAdminPassword] = useState(settings.adminPassword || 'admin123');

  // ─── State Form Google Integration ──────────────────────────────────────
  const [appsScriptUrl, setAppsScriptUrl] = useState(settings.appsScriptUrl);
  const [appsScriptToken, setAppsScriptToken] = useState(settings.appsScriptToken);
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState(settings.isAutoSyncEnabled ?? false);

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
    onSave({
      mosqueName: mosqueName.trim(),
      dkmName: dkmName.trim(),
      contactNumber,
      criticalStockThreshold,
      appsScriptUrl: appsScriptUrl.trim(),
      appsScriptToken: appsScriptToken.trim(),
      lastSyncedAt: settings.lastSyncedAt,
      isAutoSyncEnabled,
      adminPassword: adminPassword.trim() || 'admin123',
    });
    showToast('Pengaturan berhasil disimpan.', 'success');
  };

  const handleReset = () => {
    if (confirm('Reset semua pengaturan ke nilai default?')) {
      onReset();
      setMosqueName('Masjid Digital');
      setDkmName('DKM Masjid');
      setContactNumber('');
      setCriticalStockThreshold(10);
      setAppsScriptUrl('');
      setAppsScriptToken('');
      setIsAutoSyncEnabled(false);
      setAdminPassword('admin123');
      showToast('Pengaturan berhasil direset ke nilai default.', 'info');
    }
  };

  // Trigger sinkronisasi manual ke Google Sheets
  const handleSync = async () => {
    await onSync();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', width: '100%' }}>
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <div className="settings-grid-container">
          
          {/* Kolom Kiri: Form Identitas & Preferensi Sistem */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            
            <SettingsIdentitySection
              mosqueName={mosqueName}
              setMosqueName={setMosqueName}
              dkmName={dkmName}
              setDkmName={setDkmName}
              contactNumber={contactNumber}
              setContactNumber={setContactNumber}
            />

            <SettingsSystemSection
              criticalStockThreshold={criticalStockThreshold}
              setCriticalStockThreshold={setCriticalStockThreshold}
              adminPassword={adminPassword}
              setAdminPassword={setAdminPassword}
            />

            {/* Tombol Simpan & Reset */}
            <div style={{ display: 'flex', gap: '0.55rem', marginTop: '0.25rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '0.55rem', minHeight: '36px', borderRadius: '6px' }}>
                <Save size={14} /> Simpan Pengaturan
              </button>
              <button type="button" onClick={handleReset} className="btn btn-secondary" style={{ flex: 1, padding: '0.55rem', minHeight: '36px', borderRadius: '6px' }}>
                <RotateCcw size={12} /> Reset ke Default
              </button>
            </div>

          </div>

          {/* Kolom Kanan: Google Integration */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            
            <SettingsGoogleSection
              appsScriptUrl={appsScriptUrl}
              setAppsScriptUrl={setAppsScriptUrl}
              appsScriptToken={appsScriptToken}
              setAppsScriptToken={setAppsScriptToken}
              isAutoSyncEnabled={isAutoSyncEnabled}
              setIsAutoSyncEnabled={setIsAutoSyncEnabled}
              lastSyncedAt={settings.lastSyncedAt}
              onSync={handleSync}
              showToast={showToast}
            />

          </div>

        </div>
      </form>
    </div>
  );
};
