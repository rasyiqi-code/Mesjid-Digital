import React, { useEffect, useState } from 'react';
import { X, AlertCircle, ExternalLink } from 'lucide-react';

interface ImageModalProps {
  imageUrl: string;
  onClose: () => void;
}

// Komponen Modal untuk menampilkan foto bukti transaksi secara layar penuh (fullscreen)
export const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, onClose }) => {
  const [hasError, setHasError] = useState<boolean>(false);

  // Menangani penekanan tombol Escape untuk menutup modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Fungsi mengonversi tautan Google Drive uc?export=view menjadi file/d/.../view agar dapat dibuka secara langsung di peramban
  const getFriendlyDriveUrl = (url: string) => {
    if (url.includes('drive.google.com')) {
      const match = url.match(/(?:id=|\/d\/)([\w-]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/file/d/${match[1]}/view`;
      }
    }
    return url;
  };

  // Fungsi membuat tautan preview resmi Google Drive untuk di-embed dalam iframe
  const getDrivePreviewUrl = (url: string) => {
    if (url.includes('drive.google.com')) {
      const match = url.match(/(?:id=|\/d\/)([\w-]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
      }
    }
    return null;
  };

  const friendlyUrl = getFriendlyDriveUrl(imageUrl);
  const drivePreviewUrl = getDrivePreviewUrl(imageUrl);
  const isDriveUrl = imageUrl.includes('drive.google.com');

  return (
    <div 
      className="image-modal-overlay" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Pratinjau Foto Bukti Transaksi"
    >
      <div 
        className="image-modal-content animate-in-fade" 
        onClick={(e) => e.stopPropagation()}
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '1.25rem',
          minWidth: isDriveUrl || hasError ? '320px' : 'auto',
          width: drivePreviewUrl && !hasError ? '90vw' : 'auto',
          maxWidth: drivePreviewUrl && !hasError ? '800px' : '500px',
          background: 'var(--bg-card)',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--border-subtle)'
        }}
      >
        {/* Tombol Tutup Modal */}
        <button 
          className="image-modal-close" 
          onClick={onClose}
          title="Tutup pratinjau"
        >
          <X size={20} />
        </button>
        
        {/* Tampilan Fallback Jika Gambar Gagal Dimuat */}
        {hasError ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.75rem', padding: '0.85rem 0' }}>
            <div style={{ color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.08)', padding: '0.55rem', borderRadius: '50%', display: 'inline-flex' }}>
              <AlertCircle size={32} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>Gambar Gagal Dimuat</h4>
              <p style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', marginTop: '0.35rem', lineHeight: 1.4, maxWidth: '280px' }}>
                {isDriveUrl 
                  ? 'Pemuatan gambar Google Drive langsung diblokir oleh kebijakan keamanan Google (Error 403).' 
                  : 'Gagal mengambil data gambar dari tautan asal.'}
              </p>
            </div>
            <a 
              href={friendlyUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-primary"
              style={{ gap: '0.35rem', fontSize: '0.725rem', padding: '0.45rem 0.85rem', minHeight: '34px', borderRadius: '6px', textDecoration: 'none' }}
            >
              <ExternalLink size={13} />
              Buka Gambar di Tab Baru
            </a>
          </div>
        ) : drivePreviewUrl ? (
          /* Embed Viewer Google Drive Resmi */
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <iframe 
              src={drivePreviewUrl} 
              title="Pratinjau Bukti Transaksi Google Drive"
              style={{ 
                width: '100%', 
                height: '65vh', 
                minHeight: '350px',
                border: 'none', 
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.5)'
              }}
              allow="autoplay"
            />
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <a 
                href={friendlyUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ fontSize: '0.7rem', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}
              >
                <ExternalLink size={12} /> Buka di tab baru jika dokumen tidak muncul
              </a>
            </div>
          </div>
        ) : (
          /* Gambar Bukti Transaksi Biasa */
          <img 
            src={imageUrl} 
            alt="Bukti Transaksi Fullscreen" 
            className="image-modal-img" 
            onError={() => setHasError(true)}
            style={{ display: hasError ? 'none' : 'block' }}
          />
        )}
      </div>
    </div>
  );
};
