import React, { useState } from 'react';
import type { AppSettings } from '../hooks/useSettings';
import {
  Save,
  RotateCcw,
  Building2,
  Phone,
  AlertTriangle,
  User,
  Link2,
  KeyRound,
  Wifi,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  Clock,
  Lock,
  Unlock,
  HelpCircle,
} from 'lucide-react';
import { pingAppsScript } from '../utils/sheetsApi';
import { SetupGuideModal } from './SetupGuideModal';

interface SettingsPanelProps {
  settings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
  onReset: () => void;
  onSync: () => Promise<void>; // Handler sinkronisasi manual ke Google Sheets
  showToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

// Status uji koneksi ke Google Apps Script
type ConnectionStatus = 'idle' | 'testing' | 'ok' | 'error';

// Format timestamp ke string yang mudah dibaca
const formatLastSynced = (ts: number | null): string => {
  if (!ts) return 'Belum pernah sinkronisasi';
  const d = new Date(ts);
  return d.toLocaleString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

// Komponen panel pengaturan konfigurasi aplikasi masjid
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

  // ─── State Form Google Integration ──────────────────────────────────────
  const [appsScriptUrl, setAppsScriptUrl] = useState(settings.appsScriptUrl);
  const [appsScriptToken, setAppsScriptToken] = useState(settings.appsScriptToken);
  const [isGoogleLocked, setIsGoogleLocked] = useState<boolean>(true);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const [connStatus, setConnStatus] = useState<ConnectionStatus>('idle');
  const [connMessage, setConnMessage] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

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
      setConnStatus('idle');
      showToast('Pengaturan berhasil direset ke nilai default.', 'info');
    }
  };

  // Uji koneksi ke Apps Script tanpa menyimpan pengaturan dulu
  const handleTestConnection = async () => {
    if (!appsScriptUrl.trim() || !appsScriptToken.trim()) {
      showToast('Isi URL dan Token terlebih dahulu sebelum test koneksi.', 'error');
      return;
    }
    setConnStatus('testing');
    setConnMessage('Menghubungi server...');
    const result = await pingAppsScript({ url: appsScriptUrl.trim(), token: appsScriptToken.trim() });
    if (result.ok) {
      setConnStatus('ok');
      setConnMessage(result.message);
    } else {
      setConnStatus('error');
      setConnMessage(result.message);
    }
  };

  // Trigger sinkronisasi manual ke Google Sheets
  const handleSync = async () => {
    if (!settings.appsScriptUrl || !settings.appsScriptToken) {
      showToast('Simpan konfigurasi Google terlebih dahulu sebelum sinkronisasi.', 'error');
      return;
    }
    setIsSyncing(true);
    await onSync();
    setIsSyncing(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>

      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <div className="settings-grid-container">
          
          {/* Kolom Kiri: Form Identitas & Preferensi Sistem */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            
            {/* ── Identitas Masjid ─────────────────────────────────────────── */}
            <div className="glass-card" style={{ textAlign: 'left', padding: '0.85rem 1rem' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Building2 size={15} style={{ color: 'var(--primary)' }} />
                Identitas Masjid
              </h3>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="setting-mosque-name">Nama Masjid *</label>
                  <input
                    id="setting-mosque-name"
                    type="text"
                    value={mosqueName}
                    onChange={(e) => setMosqueName(e.target.value)}
                    placeholder="Cth: Masjid Al-Ikhlas"
                    className="form-input"
                    style={{ minHeight: '36px', padding: '0.45rem 0.65rem', fontSize: '0.85rem' }}
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
                    style={{ minHeight: '36px', padding: '0.45rem 0.65rem', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="setting-contact">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <Phone size={12} /> Kontak Pengurus (Opsional)
                  </span>
                </label>
                <input
                  id="setting-contact"
                  type="tel"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="Cth: 0812-3456-7890"
                  className="form-input"
                  style={{ minHeight: '36px', padding: '0.45rem 0.65rem', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            {/* ── Preferensi Sistem ────────────────────────────────────────── */}
            <div className="glass-card" style={{ textAlign: 'left', padding: '0.85rem 1rem' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <AlertTriangle size={15} style={{ color: 'var(--accent)' }} />
                Preferensi Sistem
              </h3>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="setting-stock-threshold">Batas Stok Kritis (unit)</label>
                <input
                  id="setting-stock-threshold"
                  type="number"
                  value={criticalStockThreshold}
                  onChange={(e) => setCriticalStockThreshold(Number(e.target.value))}
                  min={1}
                  max={100}
                  className="form-input"
                  style={{ minHeight: '36px', padding: '0.45rem 0.65rem', fontSize: '0.85rem' }}
                />
                <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  Barang di bawah <strong style={{ color: 'var(--accent)' }}>{criticalStockThreshold} unit</strong> akan ditandai kritis di Dashboard.
                </p>
              </div>
            </div>

            {/* ── Tombol Simpan & Reset ────────────────────────────────────── */}
            <div style={{ display: 'flex', gap: '0.55rem', marginTop: '0.25rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '0.55rem', minHeight: '36px', borderRadius: '6px' }}>
                <Save size={14} /> Simpan Pengaturan
              </button>
              <button type="button" onClick={handleReset} className="btn btn-secondary" style={{ flex: 1, padding: '0.55rem', minHeight: '36px', borderRadius: '6px' }}>
                <RotateCcw size={12} /> Reset ke Default
              </button>
            </div>

          </div>

          {/* Kolom Kanan: Google Integration, Sync manual & Tentang */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            
            {/* ── Integrasi Google ─────────────────────────────────────────── */}
            <div className="glass-card" style={{ textAlign: 'left', borderColor: 'rgba(66, 133, 244, 0.2)', padding: '0.85rem 1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem', flexWrap: 'wrap', gap: '0.45rem' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Wifi size={15} style={{ color: '#4285f4' }} />
                  Integrasi Google
                </h3>
                <button
                  type="button"
                  onClick={() => setIsGoogleLocked(!isGoogleLocked)}
                  className="btn"
                  style={{
                    padding: '0.2rem 0.45rem',
                    minHeight: '26px',
                    borderRadius: '5px',
                    fontSize: '0.7rem',
                    gap: '0.25rem',
                    background: isGoogleLocked ? 'rgba(0,0,0,0.02)' : 'rgba(245, 158, 11, 0.08)',
                    color: isGoogleLocked ? 'var(--text-secondary)' : 'var(--accent)',
                    border: `1px solid ${isGoogleLocked ? 'var(--border-subtle)' : 'rgba(245, 158, 11, 0.2)'}`,
                    cursor: 'pointer'
                  }}
                  title={isGoogleLocked ? 'Klik untuk mengubah konfigurasi' : 'Kunci kembali konfigurasi'}
                >
                  {isGoogleLocked ? <Lock size={12} /> : <Unlock size={12} />}
                  <span>{isGoogleLocked ? 'Buka Kunci' : 'Terkunci'}</span>
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', background: 'rgba(66, 133, 244, 0.04)', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(66, 133, 244, 0.1)', marginBottom: '0.85rem' }}>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  Hubungkan ke Google Sheets & Drive.
                </span>
                <button
                  type="button"
                  onClick={() => setShowGuideModal(true)}
                  className="btn"
                  style={{
                    padding: '0.25rem 0.55rem',
                    minHeight: '26px',
                    borderRadius: '5px',
                    fontSize: '0.7rem',
                    gap: '0.2rem',
                    border: 'none',
                    background: 'rgba(66, 133, 244, 0.08)',
                    color: '#4285f4',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center'
                  }}
                >
                  <HelpCircle size={11} />
                  <span>Buka Panduan</span>
                </button>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="setting-script-url">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <Link2 size={12} /> URL Google Apps Script Web App
                  </span>
                </label>
                <input
                  id="setting-script-url"
                  type="url"
                  value={appsScriptUrl}
                  onChange={(e) => { setAppsScriptUrl(e.target.value); setConnStatus('idle'); }}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="form-input"
                  style={{ fontFamily: 'monospace', fontSize: '0.75rem', minHeight: '36px', padding: '0.45rem 0.65rem' }}
                  disabled={isGoogleLocked}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="setting-script-token">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <KeyRound size={12} /> Token Keamanan
                  </span>
                </label>
                <input
                  id="setting-script-token"
                  type="password"
                  value={appsScriptToken}
                  onChange={(e) => { setAppsScriptToken(e.target.value); setConnStatus('idle'); }}
                  placeholder="Token DKM"
                  className="form-input"
                  style={{ minHeight: '36px', padding: '0.45rem 0.65rem', fontSize: '0.85rem' }}
                  disabled={isGoogleLocked}
                />
              </div>

              {/* Status hasil test koneksi */}
              {connStatus !== 'idle' && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.45rem',
                  padding: '0.45rem 0.65rem', borderRadius: '6px', marginBottom: '0.65rem',
                  background: connStatus === 'ok'
                    ? 'rgba(16, 185, 129, 0.08)'
                    : connStatus === 'error'
                      ? 'rgba(239, 68, 68, 0.08)'
                      : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${connStatus === 'ok' ? 'rgba(16,185,129,0.2)' : connStatus === 'error' ? 'rgba(239,68,68,0.2)' : 'transparent'}`,
                }}>
                  {connStatus === 'testing' && <Loader2 size={13} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />}
                  {connStatus === 'ok' && <CheckCircle2 size={13} style={{ color: 'var(--success)' }} />}
                  {connStatus === 'error' && <XCircle size={13} style={{ color: 'var(--danger)' }} />}
                  <span style={{ fontSize: '0.75rem', color: connStatus === 'ok' ? 'var(--success)' : connStatus === 'error' ? 'var(--danger)' : 'var(--text-secondary)' }}>
                    {connMessage}
                  </span>
                </div>
              )}

              <button
                type="button"
                onClick={handleTestConnection}
                disabled={connStatus === 'testing'}
                className="btn btn-secondary"
                style={{ width: '100%', padding: '0.45rem', minHeight: '34px', fontSize: '0.8rem', borderRadius: '6px' }}
              >
                {connStatus === 'testing'
                  ? <><Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> Menguji...</>
                  : <><Wifi size={12} /> Test Koneksi</>
                }
              </button>
            </div>

            {/* ── Sinkronisasi Manual ke Google Sheets ─────────────────────── */}
            <div className="glass-card" style={{
              textAlign: 'left',
              padding: '0.85rem 1rem',
              borderColor: settings.appsScriptUrl ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)',
            }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <RefreshCw size={15} style={{ color: 'var(--primary)' }} />
                Sinkronisasi ke Google Sheets
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.725rem', color: 'var(--text-secondary)', marginBottom: '0.65rem' }}>
                <Clock size={12} />
                {formatLastSynced(settings.lastSyncedAt)}
              </div>

              {!settings.appsScriptUrl ? (
                <p style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                  Konfigurasi URL dan Token di atas terlebih dahulu.
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.55rem', minHeight: '36px', borderRadius: '6px' }}
                >
                  {isSyncing
                    ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Menyinkronkan...</>
                    : <><RefreshCw size={14} /> Sync Sekarang</>
                  }
                </button>
              )}
            </div>

            {/* ── Tentang Aplikasi ─────────────────────────────────────────── */}
            <div className="glass-card" style={{ textAlign: 'left', padding: '0.85rem 1rem' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.45rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <User size={15} style={{ color: 'var(--info)' }} />
                Tentang Aplikasi
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                <strong style={{ color: 'var(--text-primary)' }}>Masjid Digital</strong> — Sistem Informasi Manajemen Mandiri Masjid.
                <br />Versi 1.3.0 · Data disimpan lokal di IndexedDB perangkat.
              </p>
            </div>

          </div>

        </div>
      </form>

      {/* Modal Dokumentasi Setup Google Apps Script */}
      {showGuideModal && (
        <SetupGuideModal onClose={() => setShowGuideModal(false)} />
      )}

    </div>
  );
};
