import React, { useState } from 'react';
import {
  Wifi,
  Lock,
  Unlock,
  HelpCircle,
  Link2,
  KeyRound,
  Loader2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Clock,
} from 'lucide-react';
import { pingAppsScript } from '../utils/sheetsApi';
import { SetupGuideModal } from './SetupGuideModal';

interface SettingsGoogleSectionProps {
  appsScriptUrl: string;
  setAppsScriptUrl: (v: string) => void;
  appsScriptToken: string;
  setAppsScriptToken: (v: string) => void;
  isAutoSyncEnabled: boolean;
  setIsAutoSyncEnabled: (v: boolean) => void;
  lastSyncedAt: number | null;
  onSync: () => Promise<void>;
  showToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

type ConnectionStatus = 'idle' | 'testing' | 'ok' | 'error';

const formatLastSynced = (ts: number | null): string => {
  if (!ts) return 'Belum pernah sinkronisasi';
  const d = new Date(ts);
  return d.toLocaleString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export const SettingsGoogleSection: React.FC<SettingsGoogleSectionProps> = ({
  appsScriptUrl,
  setAppsScriptUrl,
  appsScriptToken,
  setAppsScriptToken,
  isAutoSyncEnabled,
  setIsAutoSyncEnabled,
  lastSyncedAt,
  onSync,
  showToast,
}) => {
  const [isGoogleLocked, setIsGoogleLocked] = useState<boolean>(true);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const [connStatus, setConnStatus] = useState<ConnectionStatus>('idle');
  const [connMessage, setConnMessage] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

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
    if (!appsScriptUrl) {
      showToast('Simpan konfigurasi Google terlebih dahulu sebelum sinkronisasi.', 'error');
      return;
    }
    setIsSyncing(true);
    await onSync();
    setIsSyncing(false);
  };

  return (
    <div className="glass-card mobile-flat" style={{ textAlign: 'left', borderColor: 'rgba(66, 133, 244, 0.2)', padding: '0.85rem 1rem' }}>
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

      {/* Toggle Auto-Sinkronisasi */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.55rem', background: 'rgba(0, 0, 0, 0.02)', padding: '0.65rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', marginBottom: '0.85rem' }}>
        <input
          id="setting-auto-sync"
          type="checkbox"
          checked={isAutoSyncEnabled}
          onChange={(e) => setIsAutoSyncEnabled(e.target.checked)}
          style={{ marginTop: '0.2rem', cursor: 'pointer' }}
          disabled={isGoogleLocked}
        />
        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
          <label htmlFor="setting-auto-sync" style={{ fontSize: '0.775rem', fontWeight: 700, cursor: 'pointer', color: 'var(--text-primary)' }}>
            Aktifkan Auto-Sinkronisasi ke Google Sheets
          </label>
          <span style={{ fontSize: '0.675rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginTop: '0.15rem' }}>
            Mengirimkan seluruh data secara otomatis 5.5 detik setelah ada pencatatan atau perubahan transaksi baru (saat online).
          </span>
        </div>
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
        style={{ width: '100%', padding: '0.45rem', minHeight: '34px', fontSize: '0.8rem', borderRadius: '6px', marginBottom: '0.85rem' }}
      >
        {connStatus === 'testing'
          ? <><Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> Menguji...</>
          : <><Wifi size={12} /> Test Koneksi</>
        }
      </button>

      {/* Garis Pembatas */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '0.85rem 0' }}></div>

      {/* Bagian Sinkronisasi Manual */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem', flexWrap: 'wrap', gap: '0.45rem' }}>
        <h4 style={{ fontSize: '0.85rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <RefreshCw size={13} style={{ color: 'var(--primary)' }} />
          Sinkronisasi ke Google Sheets
        </h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
          <Clock size={11} />
          <span>{formatLastSynced(lastSyncedAt)}</span>
        </div>
      </div>

      {!appsScriptUrl ? (
        <p style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', fontStyle: 'italic', margin: 0 }}>
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

      {/* Modal Dokumentasi Setup Google Apps Script */}
      {showGuideModal && (
        <SetupGuideModal onClose={() => setShowGuideModal(false)} />
      )}
    </div>
  );
};
