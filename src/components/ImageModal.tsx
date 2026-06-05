import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ImageModalProps {
  imageUrl: string;
  onClose: () => void;
}

// Komponen Modal untuk menampilkan foto bukti transaksi secara layar penuh (fullscreen)
export const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, onClose }) => {
  
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
      >
        {/* Tombol Tutup Modal */}
        <button 
          className="image-modal-close" 
          onClick={onClose}
          title="Tutup pratinjau"
        >
          <X size={20} />
        </button>
        
        {/* Gambar Bukti Transaksi */}
        <img 
          src={imageUrl} 
          alt="Bukti Transaksi Fullscreen" 
          className="image-modal-img" 
        />
      </div>
    </div>
  );
};
