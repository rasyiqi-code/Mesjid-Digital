import React, { useState } from 'react';
import { KeyRound, AlertCircle } from 'lucide-react';

interface GatekeeperResetFormProps {
  onResetPassword: (token: string) => { ok: boolean; message: string };
  setMode: (mode: 'guest' | 'admin' | 'reset') => void;
  errorStyle: React.CSSProperties;
}

export const GatekeeperResetForm: React.FC<GatekeeperResetFormProps> = ({
  onResetPassword,
  setMode,
  errorStyle,
}) => {
  const [resetToken, setResetToken] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [isResetSuccess, setIsResetSuccess] = useState(false);
  const [error, setError] = useState('');

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
            }}
            style={{ width: '100%', minHeight: '38px', borderRadius: '6px', fontWeight: 700 }}
          >
            Kembali ke Login Admin
          </button>
        </div>
      ) : (
        <form onSubmit={handleResetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} noValidate>
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
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
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
              onClick={() => setMode('admin')}
              style={{ flex: 1, minHeight: '38px', borderRadius: '6px', fontSize: '0.8rem' }}
            >
              Batal
            </button>
          </div>
        </form>
      )}
    </>
  );
};
