import React, { useState } from 'react';
import { KeyRound, Eye, AlertCircle } from 'lucide-react';

interface GatekeeperAdminFormProps {
  onAdminLogin: (password: string) => boolean;
  setMode: (mode: 'guest' | 'admin' | 'reset') => void;
  errorStyle: React.CSSProperties;
  switchButtonStyle: React.CSSProperties;
}

export const GatekeeperAdminForm: React.FC<GatekeeperAdminFormProps> = ({
  onAdminLogin,
  setMode,
  errorStyle,
  switchButtonStyle,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

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

  return (
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

      <form onSubmit={handleAdminSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} noValidate>
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
              autoComplete="new-password"
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
            onClick={() => setMode('reset')}
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
          onClick={() => setMode('guest')}
          style={switchButtonStyle}
        >
          ← Kembali ke Akses Pengunjung
        </button>
      </div>
    </>
  );
};
