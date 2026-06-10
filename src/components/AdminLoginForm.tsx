import React, { useState } from 'react';
import { Lock, KeyRound, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface AdminLoginFormProps {
  onLogin: (password: string) => boolean;
}

export const AdminLoginForm: React.FC<AdminLoginFormProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password.trim()) {
      setError('Kata sandi tidak boleh kosong.');
      return;
    }

    // Panggil callback login
    const success = onLogin(password);
    if (!success) {
      setError('Kata sandi yang Anda masukkan salah.');
    }
  };

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
      {/* Visual Header Ikon */}
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

      {/* Form Input */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
        
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

        {/* Tampilan Pesan Error */}
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
