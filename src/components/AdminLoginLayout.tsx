import React from 'react';
import { Moon } from 'lucide-react';
import { AdminLoginForm } from './AdminLoginForm';

interface AdminLoginLayoutProps {
  mosqueName: string;
  onLogin: (password: string) => boolean;
  onResetPassword: (token: string) => { ok: boolean; message: string };
  onCancel: () => void;
}

export const AdminLoginLayout: React.FC<AdminLoginLayoutProps> = ({
  mosqueName,
  onLogin,
  onResetPassword,
  onCancel
}) => {
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
        {/* Header Tambahan untuk Halaman Login Penuh */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            background: 'rgba(66, 133, 244, 0.08)', 
            color: 'var(--primary)', 
            width: '48px', 
            height: '48px', 
            borderRadius: '12px',
            marginBottom: '0.75rem',
            boxShadow: '0 4px 12px rgba(66, 133, 244, 0.1)'
          }}>
            <Moon size={24} style={{ color: 'var(--primary)' }} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
            {mosqueName || 'Masjid Digital'}
          </h2>
          <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Sistem Informasi Manajemen Mandiri Masjid
          </p>
        </div>

        <AdminLoginForm onLogin={onLogin} onResetPassword={onResetPassword} />

        {/* Tombol kembali ke dashboard utama */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <button
            onClick={onCancel}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: '0.8rem',
              cursor: 'pointer',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              transition: 'all 0.2s ease'
            }}
            className="hover-subtle"
          >
            ← Kembali ke Dashboard Utama
          </button>
        </div>
      </div>
    </div>
  );
};
