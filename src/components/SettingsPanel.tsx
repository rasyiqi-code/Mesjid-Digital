import React, { useState } from 'react';
import type { AppSettings } from '../hooks/useSettings';
import {
  Save,
  RotateCcw,
  Settings2,
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
} from 'lucide-react';
import { pingAppsScript } from '../utils/sheetsApi';

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '700px', margin: '0 auto' }}>

      {/* Header */}
      <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)', padding: '0.75rem', borderRadius: '12px' }}>
          <Settings2 size={28} />
        </div>
        <div style={{ textAlign: 'left' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Pengaturan Aplikasi</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Konfigurasi identitas masjid, preferensi sistem, dan integrasi Google
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* ── Identitas Masjid ─────────────────────────────────────────── */}
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
                <Phone size={13} /> Nomor Kontak Pengurus (Opsional)
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

        {/* ── Preferensi Sistem ────────────────────────────────────────── */}
        <div className="glass-card" style={{ textAlign: 'left' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={18} style={{ color: 'var(--accent)' }} />
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
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
              Barang di bawah <strong style={{ color: 'var(--accent)' }}>{criticalStockThreshold} unit</strong> ditandai kritis dan muncul sebagai peringatan di Dashboard.
            </p>
          </div>
        </div>

        {/* ── Integrasi Google ─────────────────────────────────────────── */}
        <div className="glass-card" style={{ textAlign: 'left', borderColor: 'rgba(66, 133, 244, 0.2)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Wifi size={18} style={{ color: '#4285f4' }} />
            Integrasi Google (Sheets + Drive)
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.55 }}>
            Hubungkan ke Google Sheets untuk backup data dan Google Drive untuk foto bukti transaksi.
            Lihat <strong>apps-script/SETUP.md</strong> untuk panduan setup.
          </p>

          <div className="form-group">
            <label className="form-label" htmlFor="setting-script-url">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Link2 size={13} /> URL Google Apps Script Web App
              </span>
            </label>
            <input
              id="setting-script-url"
              type="url"
              value={appsScriptUrl}
              onChange={(e) => { setAppsScriptUrl(e.target.value); setConnStatus('idle'); }}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="form-input"
              style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="setting-script-token">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <KeyRound size={13} /> Token Keamanan
              </span>
            </label>
            <input
              id="setting-script-token"
              type="password"
              value={appsScriptToken}
              onChange={(e) => { setAppsScriptToken(e.target.value); setConnStatus('idle'); }}
              placeholder="Token yang sama dengan di Apps Script"
              className="form-input"
            />
          </div>

          {/* Status hasil test koneksi */}
          {connStatus !== 'idle' && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              padding: '0.65rem 0.9rem', borderRadius: '10px', marginBottom: '1rem',
              background: connStatus === 'ok'
                ? 'rgba(16, 185, 129, 0.1)'
                : connStatus === 'error'
                  ? 'rgba(239, 68, 68, 0.1)'
                  : 'rgba(255,255,255,0.05)',
              border: `1px solid ${connStatus === 'ok' ? 'rgba(16,185,129,0.3)' : connStatus === 'error' ? 'rgba(239,68,68,0.3)' : 'transparent'}`,
            }}>
              {connStatus === 'testing' && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />}
              {connStatus === 'ok' && <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />}
              {connStatus === 'error' && <XCircle size={16} style={{ color: 'var(--danger)' }} />}
              <span style={{ fontSize: '0.8rem', color: connStatus === 'ok' ? 'var(--success)' : connStatus === 'error' ? 'var(--danger)' : 'var(--text-secondary)' }}>
                {connMessage}
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={handleTestConnection}
            disabled={connStatus === 'testing'}
            className="btn btn-secondary"
            style={{ width: '100%', padding: '0.65rem', marginBottom: 0 }}
          >
            {connStatus === 'testing'
              ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Menguji koneksi...</>
              : <><Wifi size={16} /> Test Koneksi</>
            }
          </button>
        </div>

        {/* ── Tombol Simpan & Reset ────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }}>
            <Save size={18} /> Simpan Pengaturan
          </button>
          <button type="button" onClick={handleReset} className="btn btn-secondary" style={{ width: '100%', padding: '0.85rem' }}>
            <RotateCcw size={16} /> Reset ke Default
          </button>
        </div>
      </form>

      {/* ── Sinkronisasi Manual ke Google Sheets ─────────────────────── */}
      <div className="glass-card" style={{
        textAlign: 'left',
        borderColor: settings.appsScriptUrl ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255,255,255,0.08)',
      }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RefreshCw size={18} style={{ color: 'var(--primary)' }} />
          Sinkronisasi ke Google Sheets
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          <Clock size={13} />
          {formatLastSynced(settings.lastSyncedAt)}
        </div>

        {!settings.appsScriptUrl ? (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
            Konfigurasi URL dan Token Google Apps Script di atas, lalu simpan pengaturan untuk mengaktifkan sinkronisasi.
          </p>
        ) : (
          <button
            type="button"
            onClick={handleSync}
            disabled={isSyncing}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem' }}
          >
            {isSyncing
              ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Menyinkronkan...</>
              : <><RefreshCw size={18} /> Sync Sekarang ke Google Sheets</>
            }
          </button>
        )}
      </div>

      {/* ── Tentang Aplikasi ─────────────────────────────────────────── */}
      <div className="glass-card" style={{ textAlign: 'left' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={18} style={{ color: 'var(--info)' }} />
          Tentang Aplikasi
        </h3>
        <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--text-primary)' }}>Masjid Digital</strong> — Sistem Informasi Manajemen Mandiri Masjid.
          <br />Versi <strong>1.3.0</strong> · Data lokal tersimpan di IndexedDB perangkat.
          <br />Mendukung mode offline-first dengan sinkronisasi opsional ke Google Sheets.
        </p>
      </div>

    </div>
  );
};
