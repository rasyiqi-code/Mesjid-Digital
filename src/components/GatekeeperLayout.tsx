import React, { useState } from 'react';
import { Moon, Eye, KeyRound, AlertCircle, ArrowRight } from 'lucide-react';

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
  const [guestName, setGuestName] = useState('');
  const [password, setPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [isResetSuccess, setIsResetSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!guestName.trim()) {
      setError('Nama masjid tidak boleh kosong.');
      return;
    }

    const success = onGuestAccess(guestName);
    if (!success) {
      setError(`Nama masjid yang Anda masukkan salah. Petunjuk: coba masukkan "${mosqueName}".`);
    }
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password.trim()) {
      setError('Kata sandi tidak boleh kosong.');
      return;
    }

    const success = onAdminLogin(password);
    if (!success) {
      setError('Kata sandi yang Anda masukkan salah.');
    }
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResetMessage('');

    if (!resetToken.trim()) {
      setError('Token tidak boleh kosong.');
      return;
    }

    const res = onResetPassword(resetToken.trim());
    if (res.ok) {
      setIsResetSuccess(true);
      setResetMessage(res.message);
      setResetToken('');
    } else {
      setError(res.message);
    }
  };

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
            <>
              <div 
                style={{ 
                  background: 'rgba(6, 182, 212, 0.08)', 
                  color: 'var(--info)', 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  margin: '0 auto 1.15rem auto'
                }}
              >
                <Eye size={22} />
              </div>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.45rem 0' }}>
                Akses Pengunjung (Lihat-Saja)
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 1.5rem 0' }}>
                Silakan masukkan nama masjid secara lengkap untuk membuka dasbor laporan keuangan dan logistik.
              </p>

              <form onSubmit={handleGuestSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group" style={{ textAlign: 'left', marginBottom: 0 }}>
                  <label className="form-label" htmlFor="gate-guest-name">Nama Masjid</label>
                  <input
                    id="gate-guest-name"
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder={`Contoh: ${mosqueName}`}
                    className="form-input"
                    style={{ minHeight: '38px', fontSize: '0.85rem' }}
                    required
                  />
                </div>

                {error && (
                  <div style={errorStyle}>
                    <AlertCircle size={14} style={{ flexShrink: 0 }} />
                    <span>{error}</span>
                  </div>
                )}

                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ width: '100%', minHeight: '38px', borderRadius: '6px', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                >
                  Buka Dasbor <ArrowRight size={14} />
                </button>
              </form>

              <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => { setMode('admin'); setError(''); }}
                  style={switchButtonStyle}
                >
                  Masuk sebagai Pengurus (Admin) →
                </button>
              </div>
            </>
          )}

          {/* ─── MODE 2: LOGIN ADMIN ────────────────────────────────────────── */}
          {mode === 'admin' && (
            <>
              <div 
                style={{ 
                  background: 'rgba(66, 133, 244, 0.08)', 
                  color: 'var(--primary)', 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  margin: '0 auto 1.15rem auto'
                }}
              >
                <KeyRound size={22} />
              </div>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.45rem 0' }}>
                Verifikasi Akses Admin
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 1.5rem 0' }}>
                Masukkan kata sandi administrator untuk mengaktifkan izin modifikasi data dan konfigurasi sistem.
              </p>

              <form onSubmit={handleAdminSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group" style={{ textAlign: 'left', marginBottom: 0 }}>
                  <label className="form-label" htmlFor="gate-admin-pass">Kata Sandi Admin</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      id="gate-admin-pass"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan kata sandi admin"
                      className="form-input"
                      style={{ 
                        paddingRight: '2.5rem',
                        minHeight: '38px', 
                        fontSize: '0.85rem'
                      }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '0.75rem',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        padding: 0
                      }}
                    >
                      {showPassword ? <Eye size={16} /> : <KeyRound size={16} />}
                    </button>
                  </div>
                </div>

                <div style={{ textAlign: 'right', marginTop: '-0.45rem' }}>
                  <button
                    type="button"
                    onClick={() => { setMode('reset'); setError(''); }}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                  >
                    Lupa Kata Sandi?
                  </button>
                </div>

                {error && (
                  <div style={errorStyle}>
                    <AlertCircle size={14} style={{ flexShrink: 0 }} />
                    <span>{error}</span>
                  </div>
                )}

                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ width: '100%', minHeight: '38px', borderRadius: '6px', fontWeight: 700, fontSize: '0.85rem' }}
                >
                  Verifikasi & Masuk
                </button>
              </form>

              <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', display: 'flex', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => { setMode('guest'); setError(''); }}
                  style={switchButtonStyle}
                >
                  ← Kembali ke Akses Pengunjung
                </button>
              </div>
            </>
          )}

          {/* ─── MODE 3: RESET SANDI ADMIN (LUPA SANDI) ────────────────────── */}
          {mode === 'reset' && (
            <>
              <div 
                style={{ 
                  background: 'rgba(245, 158, 11, 0.08)', 
                  color: 'var(--accent)', 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  margin: '0 auto 1.15rem auto'
                }}
              >
                <KeyRound size={22} />
              </div>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.45rem 0' }}>
                Pemulihan Sandi Admin
              </h3>
              <p style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 1.5rem 0', textAlign: 'left' }}>
                Masukkan <strong>Token Keamanan Google Apps Script</strong> masjid Anda untuk mereset kata sandi admin ke bawaan (<code>admin123</code>).
              </p>

              {isResetSuccess ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div 
                    style={{ 
                      padding: '0.75rem', 
                      background: 'rgba(16, 185, 129, 0.08)', 
                      border: '1px solid rgba(16, 185, 129, 0.2)', 
                      borderRadius: '8px',
                      color: 'var(--success)',
                      fontSize: '0.775rem',
                      textAlign: 'left',
                      lineHeight: 1.5
                    }}
                  >
                    {resetMessage}
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      setMode('admin');
                      setIsResetSuccess(false);
                      setResetMessage('');
                      setPassword('');
                    }}
                    style={{ width: '100%', minHeight: '38px', borderRadius: '6px', fontWeight: 700 }}
                  >
                    Kembali ke Login Admin
                  </button>
                </div>
              ) : (
                <form onSubmit={handleResetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="form-group" style={{ textAlign: 'left', marginBottom: 0 }}>
                    <label className="form-label" htmlFor="gate-reset-token">Token Apps Script</label>
                    <input
                      id="gate-reset-token"
                      type="text"
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                      placeholder="Masukkan token keamanan"
                      className="form-input"
                      style={{ minHeight: '38px', fontSize: '0.85rem' }}
                      required
                    />
                  </div>

                  {error && (
                    <div style={errorStyle}>
                      <AlertCircle size={14} style={{ flexShrink: 0 }} />
                      <span>{error}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      style={{ flex: 1, minHeight: '38px', borderRadius: '6px', fontWeight: 700, fontSize: '0.8rem' }}
                    >
                      Reset Sandi
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => { setMode('admin'); setError(''); }}
                      style={{ flex: 1, minHeight: '38px', borderRadius: '6px', fontSize: '0.8rem' }}
                    >
                      Batal
                    </button>
                  </div>
                </form>
              )}
            </>
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
  padding: '0.25rem 0.5rem',
  borderRadius: '6px',
  transition: 'all 0.2s ease'
};
