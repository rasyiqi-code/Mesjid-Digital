import React, { useState } from 'react';
import { Moon } from 'lucide-react';
import { GatekeeperGuestForm } from './GatekeeperGuestForm';
import { GatekeeperAdminForm } from './GatekeeperAdminForm';
import { GatekeeperResetForm } from './GatekeeperResetForm';

interface GatekeeperLayoutProps {
  mosqueName: string;
  onGuestAccess: (enteredName: string) => boolean;
  onAdminLogin: (password: string) => boolean;
  onResetPassword: (token: string) => { ok: boolean; message: string };
}

export const GatekeeperLayout: React.FC<GatekeeperLayoutProps> = ({
  mosqueName,
  onGuestAccess,
  onAdminLogin,
  onResetPassword
}) => {
  const [mode, setMode] = useState<'guest' | 'admin' | 'reset'>('guest');

  return (
    <div 
      className="login-fullscreen-wrapper animate-in-fade" 
      style={{ 
        display: 'flex', 
        flexDirection: 'column',
        minHeight: '100vh', 
        width: '100vw', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: 'var(--bg-main)', 
        padding: '1.5rem',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9999,
        overflowY: 'auto'
      }}
    >
      <div style={{ width: '100%', maxWidth: '440px', position: 'relative' }}>
        
        {/* Header Branding Masjid Digital */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            background: 'rgba(66, 133, 244, 0.08)', 
            color: 'var(--primary)', 
            width: '56px', 
            height: '56px', 
            borderRadius: '16px',
            marginBottom: '0.85rem',
            boxShadow: '0 6px 16px rgba(66, 133, 244, 0.12)'
          }}>
            <Moon size={28} style={{ color: 'var(--primary)' }} />
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
            {mosqueName || 'Masjid Digital'}
          </h2>
          <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
            Sistem Informasi Manajemen Mandiri Masjid
          </p>
        </div>

        {/* Kotak Utama / Glass Card */}
        <div 
          className="glass-card" 
          style={{ 
            padding: '2rem 1.5rem', 
            border: mode === 'admin' ? '1px solid rgba(66, 133, 244, 0.25)' : mode === 'reset' ? '1px solid rgba(245, 158, 11, 0.25)' : '1px solid var(--border-subtle)',
            boxShadow: '0 15px 30px rgba(0, 0, 0, 0.05)',
            textAlign: 'center'
          }}
        >
          {/* ─── MODE 1: MASUK SEBAGAI TAMU (GUEST) ─────────────────────────── */}
          {mode === 'guest' && (
            <GatekeeperGuestForm
              mosqueName={mosqueName}
              onGuestAccess={onGuestAccess}
              setMode={setMode}
              errorStyle={errorStyle}
              switchButtonStyle={switchButtonStyle}
            />
          )}

          {/* ─── MODE 2: LOGIN ADMIN ────────────────────────────────────────── */}
          {mode === 'admin' && (
            <GatekeeperAdminForm
              onAdminLogin={onAdminLogin}
              setMode={setMode}
              errorStyle={errorStyle}
              switchButtonStyle={switchButtonStyle}
            />
          )}

          {/* ─── MODE 3: RESET SANDI ADMIN (LUPA SANDI) ────────────────────── */}
          {mode === 'reset' && (
            <GatekeeperResetForm
              onResetPassword={onResetPassword}
              setMode={setMode}
              errorStyle={errorStyle}
            />
          )}

        </div>

      </div>
    </div>
  );
};

// ─── GAYA BERSAMA ────────────────────────────────────────────────────────────
const errorStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
  padding: '0.55rem 0.75rem',
  background: 'rgba(239, 68, 68, 0.08)',
  border: '1px solid rgba(239, 68, 68, 0.2)',
  borderRadius: '6px',
  color: 'var(--danger)',
  fontSize: '0.75rem',
  textAlign: 'left',
  lineHeight: 1.4
};

const switchButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--text-secondary)',
  fontSize: '0.775rem',
  fontWeight: 700,
  cursor: 'pointer',
  padding: '0.25rem 0.55rem',
  borderRadius: '6px',
  transition: 'all 0.2s ease'
};
