import React, { useState } from 'react';
import { Eye, AlertCircle, ArrowRight } from 'lucide-react';

interface GatekeeperGuestFormProps {
  mosqueName: string;
  onGuestAccess: (enteredName: string) => boolean;
  setMode: (mode: 'guest' | 'admin' | 'reset') => void;
  errorStyle: React.CSSProperties;
  switchButtonStyle: React.CSSProperties;
}

export const GatekeeperGuestForm: React.FC<GatekeeperGuestFormProps> = ({
  mosqueName,
  onGuestAccess,
  setMode,
  errorStyle,
  switchButtonStyle,
}) => {
  const [guestName, setGuestName] = useState('');
  const [error, setError] = useState('');

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

  return (
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
        Silakan masukkan nama masjid "{mosqueName}" secara lengkap untuk membuka dasbor laporan keuangan dan logistik.
      </p>

      <form onSubmit={handleGuestSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} noValidate>
        <div className="form-group" style={{ textAlign: 'left', marginBottom: 0 }}>
          <input
            id="gate-guest-name"
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Nama Masjid"
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
          onClick={() => setMode('admin')}
          style={switchButtonStyle}
        >
          Masuk sebagai Pengurus (Admin) →
        </button>
      </div>
    </>
  );
};
