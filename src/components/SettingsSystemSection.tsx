import React from 'react';
import { AlertTriangle, KeyRound } from 'lucide-react';

interface SettingsSystemSectionProps {
  criticalStockThreshold: number;
  setCriticalStockThreshold: (v: number) => void;
  adminPassword: string;
  setAdminPassword: (v: string) => void;
}

export const SettingsSystemSection: React.FC<SettingsSystemSectionProps> = ({
  criticalStockThreshold,
  setCriticalStockThreshold,
  adminPassword,
  setAdminPassword,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {/* ── Preferensi Sistem ────────────────────────────────────────── */}
      <div className="glass-card mobile-flat" style={{ textAlign: 'left', padding: '0.85rem 1rem' }}>
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

      {/* ── Keamanan Admin ───────────────────────────────────────────── */}
      <div className="glass-card mobile-flat" style={{ textAlign: 'left', padding: '0.85rem 1rem' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <KeyRound size={15} style={{ color: 'var(--primary)' }} />
          Keamanan Admin
        </h3>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" htmlFor="setting-admin-password">Ubah Kata Sandi Admin</label>
          <input
            id="setting-admin-password"
            type="password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            placeholder="Masukkan kata sandi baru"
            className="form-input"
            style={{ minHeight: '36px', padding: '0.45rem 0.65rem', fontSize: '0.85rem' }}
          />
          <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Kata sandi ini digunakan untuk masuk ke mode admin di perangkat ini (default: <code>admin123</code>).
          </p>
        </div>
      </div>
    </div>
  );
};
