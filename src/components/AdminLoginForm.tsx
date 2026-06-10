import React, { useState } from 'react';
import { Lock, KeyRound, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface AdminLoginFormProps {
  onLogin: (password: string) => boolean;
  onResetPassword: (token: string) => { ok: boolean; message: string };
}

export const AdminLoginForm: React.FC<AdminLoginFormProps> = ({ onLogin, onResetPassword }) => {
  const [mode, setMode] = useState<'login' | 'reset'>('login');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [isResetSuccess, setIsResetSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password.trim()) {
      setError('Kata sandi tidak boleh kosong.');
      return;
    }

    const success = onLogin(password);
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

  // ─── Render Mode Pemulihan Kata Sandi ──────────────────────────────────────
  if (mode === 'reset') {
    return (
      <div 
        className="glass-card animate-in-fade" 
        style={{ 
          maxWidth: '440px', 
          margin: '3rem auto', 
          padding: '2rem 1.5rem', 
          textAlign: 'center',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          boxShadow: '0 15px 30px rgba(0, 0, 0, 0.08)'
        }}
      >
        <div 
          style={{ 
            background: 'rgba(245, 158, 11, 0.08)', 
            color: 'var(--accent)', 
            width: '56px', 
            height: '56px', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 1.25rem auto',
            boxShadow: '0 0 20px rgba(245, 158, 11, 0.15)'
          }}
        >
          <KeyRound size={26} />
        </div>

        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.45rem 0' }}>
          Pemulihan Kata Sandi Admin
        </h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 1.5rem 0', textAlign: 'left' }}>
          Masukkan <strong>Token Keamanan Google Apps Script</strong> masjid Anda untuk memverifikasi kepemilikan dan mereset kata sandi admin ke bawaan (<code>admin123</code>).
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
                setMode('login');
                setIsResetSuccess(false);
                setResetMessage('');
                setPassword('');
              }}
              style={{ width: '100%', minHeight: '38px', borderRadius: '6px', fontWeight: 700 }}
            >
              Kembali ke Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleResetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
            
            <div className="form-group" style={{ textAlign: 'left', marginBottom: 0 }}>
              <label className="form-label" htmlFor="admin-reset-token">Token Google Apps Script</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <KeyRound 
                  size={14} 
                  style={{ 
                    position: 'absolute', 
                    left: '0.75rem', 
                    color: 'var(--text-secondary)' 
                  }} 
                />
                <input
                  id="admin-reset-token"
                  type="text"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  placeholder="Masukkan Token Keamanan Google"
                  className="form-input"
                  style={{ 
                    paddingLeft: '2.2rem', 
                    minHeight: '38px', 
                    fontSize: '0.85rem'
                  }}
                  required
                />
              </div>
            </div>

            {error && (
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.4rem', 
                  padding: '0.55rem 0.75rem', 
                  background: 'rgba(239, 68, 68, 0.08)', 
                  border: '1px solid rgba(239, 68, 68, 0.2)', 
                  borderRadius: '6px',
                  color: 'var(--danger)',
                  fontSize: '0.75rem',
                  textAlign: 'left'
                }}
              >
                <AlertCircle size={14} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.55rem', marginTop: '0.25rem' }}>
              <button 
                type="submit" 
                className="btn btn-primary"
                style={{ flex: 1, minHeight: '38px', borderRadius: '6px', fontWeight: 700, fontSize: '0.825rem' }}
              >
                Verifikasi & Reset
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => { setMode('login'); setError(''); setResetToken(''); }}
                style={{ flex: 1, minHeight: '38px', borderRadius: '6px', fontSize: '0.825rem' }}
              >
                Kembali
              </button>
            </div>

          </form>
        )}
      </div>
    );
  }

  // ─── Render Mode Login Biasa ───────────────────────────────────────────────
  return (
    <div 
      className="glass-card animate-in-fade" 
      style={{ 
        maxWidth: '440px', 
        margin: '3rem auto', 
        padding: '2rem 1.5rem', 
        textAlign: 'center',
        border: '1px solid rgba(66, 133, 244, 0.25)',
        boxShadow: '0 15px 30px rgba(0, 0, 0, 0.08)'
      }}
    >
      <div 
        style={{ 
          background: 'rgba(66, 133, 244, 0.08)', 
          color: '#4285f4', 
          width: '56px', 
          height: '56px', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          margin: '0 auto 1.25rem auto',
          boxShadow: '0 0 20px rgba(66, 133, 244, 0.15)'
        }}
      >
        <Lock size={26} />
      </div>

      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.45rem 0' }}>
        Verifikasi Akses Admin
      </h3>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 1.5rem 0' }}>
        Silakan masukkan kata sandi admin untuk masuk ke menu Pengaturan dan mengaktifkan hak akses penulisan data masjid.
      </p>

      <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
        
        <div className="form-group" style={{ textAlign: 'left', marginBottom: 0 }}>
          <label className="form-label" htmlFor="admin-login-pass">Kata Sandi Admin</label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <KeyRound 
              size={14} 
              style={{ 
                position: 'absolute', 
                left: '0.75rem', 
                color: 'var(--text-secondary)' 
              }} 
            />
            <input
              id="admin-login-pass"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan kata sandi admin"
              className="form-input"
              style={{ 
                paddingLeft: '2.2rem', 
                paddingRight: '2.5rem',
                minHeight: '38px', 
                fontSize: '0.85rem',
                fontFamily: showPassword ? 'sans-serif' : 'monospace'
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
              title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Lupa kata sandi */}
        <div style={{ textAlign: 'right', marginTop: '-0.45rem' }}>
          <button
            type="button"
            onClick={() => { setMode('reset'); setError(''); }}
            style={{
              background: 'none',
              border: 'none',
              color: '#4285f4',
              fontSize: '0.725rem',
              fontWeight: 700,
              cursor: 'pointer',
              padding: 0
            }}
          >
            Lupa Kata Sandi?
          </button>
        </div>

        {error && (
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.4rem', 
              padding: '0.55rem 0.75rem', 
              background: 'rgba(239, 68, 68, 0.08)', 
              border: '1px solid rgba(239, 68, 68, 0.2)', 
              borderRadius: '6px',
              color: 'var(--danger)',
              fontSize: '0.75rem',
              textAlign: 'left'
            }}
          >
            <AlertCircle size={14} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <button 
          type="submit" 
          className="btn btn-primary"
          style={{ 
            width: '100%', 
            minHeight: '38px', 
            borderRadius: '6px', 
            fontWeight: 700, 
            fontSize: '0.85rem',
            marginTop: '0.25rem'
          }}
        >
          Verifikasi & Masuk
        </button>

      </form>
    </div>
  );
};
