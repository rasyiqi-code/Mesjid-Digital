import React, { useState, useRef } from 'react';
import { Camera, X, Save, ArrowDownLeft, ArrowUpRight, Loader2 } from 'lucide-react';
import type { CashTransaction } from '../utils/storage';
import { uploadImageToDrive } from '../utils/sheetsApi';
import type { SheetsConfig } from '../utils/sheetsApi';

interface CashTransactionFormProps {
  isOnline: boolean;
  onSave: (transaction: Omit<CashTransaction, 'id' | 'date'>) => void;
  showToast: (msg: string, type: 'success' | 'info' | 'error') => void;
  sheetsConfig?: SheetsConfig; // Opsional: jika diset, foto diupload ke Google Drive
}

export const CashTransactionForm: React.FC<CashTransactionFormProps> = ({
  isOnline,
  onSave,
  showToast,
  sheetsConfig,
}) => {
  const [type, setType] = useState<'pemasukan' | 'pengeluaran'>('pemasukan');
  const [category, setCategory] = useState<string>('');
  const [amountStr, setAmountStr] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [evidence, setEvidence] = useState<string>(''); // base64 atau URL Drive
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Kategori bawaan untuk mempermudah pengisian
  const categories = {
    pemasukan: ['Infaq Jumat', 'Zakat Maal', 'Zakat Fitrah', 'Wakaf', 'Sponsorship', 'Donasi Khusus'],
    pengeluaran: ['Listrik & Air', 'Operasional Masjid', 'Gaji Marbot/Imam', 'Sosial/Santunan', 'Perbaikan Sarpras', 'Konsumsi Jumat'],
  };

  // Mengubah input angka ke format ribuan rupiah saat diketik
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value) {
      const formatted = parseInt(value, 10).toLocaleString('id-ID');
      setAmountStr(formatted);
    } else {
      setAmountStr('');
    }
  };

  // Mengubah gambar unggahan menjadi Base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1.5 * 1024 * 1024) {
        showToast('Ukuran gambar terlalu besar! Maksimal 1.5MB agar hemat penyimpanan.', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setEvidence(reader.result as string);
        showToast('Foto bukti transaksi berhasil diunggah.', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEvidence('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    showToast('Foto bukti dihapus.', 'info');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = parseInt(amountStr.replace(/[^0-9]/g, ''), 10);

    if (!category) {
      showToast('Harap pilih atau tulis kategori transaksi!', 'error');
      return;
    }
    if (!amount || amount <= 0) {
      showToast('Harap masukkan nominal uang yang valid!', 'error');
      return;
    }

    // Upload foto ke Google Drive jika konfigurasi tersedia dan ada foto terpilih
    let finalEvidence = evidence;
    const isDriveUrl = evidence.startsWith('https://drive.google.com/');
    if (evidence && !isDriveUrl && sheetsConfig?.url && sheetsConfig?.token) {
      setIsUploadingImage(true);
      showToast('Mengunggah foto bukti ke Google Drive...', 'info');
      const uploadResult = await uploadImageToDrive(
        sheetsConfig,
        evidence,
        `bukti_kas_${Date.now()}.jpg`
      );
      setIsUploadingImage(false);
      if (uploadResult.ok && uploadResult.url) {
        finalEvidence = uploadResult.url;
        showToast('Foto berhasil diupload ke Google Drive.', 'success');
      } else {
        // Fallback: simpan base64 lokal jika upload gagal
        showToast(`Upload foto gagal (${uploadResult.error ?? 'error'}). Foto disimpan lokal.`, 'info');
      }
    }

    onSave({
      type,
      category,
      amount,
      description,
      evidence: finalEvidence || undefined,
    });

    // Reset Form
    setCategory('');
    setAmountStr('');
    setDescription('');
    setEvidence('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="glass-card" style={{ maxWidth: '650px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Pencatatan Kas Masjid</h2>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* Toggle Pemasukan / Pengeluaran */}
        <div className="form-group">
          <label className="form-label">Jenis Transaksi Kas</label>
          <div className="form-toggle-group">
            <button
              type="button"
              onClick={() => { setType('pemasukan'); setCategory(''); }}
              className={`btn ${type === 'pemasukan' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1, gap: '0.4rem', padding: '0.65rem' }}
            >
              <ArrowUpRight size={18} />
              Pemasukan
            </button>
            <button
              type="button"
              onClick={() => { setType('pengeluaran'); setCategory(''); }}
              className={`btn ${type === 'pengeluaran' ? 'btn-danger' : 'btn-secondary'}`}
              style={{ flex: 1, gap: '0.4rem', padding: '0.65rem' }}
            >
              <ArrowDownLeft size={18} />
              Pengeluaran
            </button>
          </div>
        </div>

        {/* Pilihan Kategori */}
        <div className="form-group" style={{ position: 'relative' }}>
          <label className="form-label" htmlFor="cash-category">Kategori Kas</label>
          <select
            id="cash-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="form-select"
            required
          >
            <option value="" disabled>-- Pilih Kategori Kas --</option>
            {categories[type].map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
            <option value="Lainnya">Lainnya (Tulis di Keterangan)</option>
          </select>
        </div>

        {/* Input Nominal Rp */}
        <div className="form-group">
          <label className="form-label" htmlFor="cash-amount">Nominal Uang (Rp)</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Rp
            </span>
            <input
              id="cash-amount"
              type="text"
              value={amountStr}
              onChange={handleAmountChange}
              placeholder="0"
              className="form-input"
              style={{ paddingLeft: '2.75rem', fontWeight: 700, fontSize: '1.1rem' }}
              required
            />
          </div>
        </div>

        {/* Input Keterangan Opsional */}
        <div className="form-group">
          <label className="form-label" htmlFor="cash-desc">Keterangan Tambahan (Opsional)</label>
          <textarea
            id="cash-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tulis detail transaksi di sini..."
            className="form-textarea"
            rows={3}
          />
        </div>

        {/* Upload Foto Bukti */}
        <div className="form-group">
          <label className="form-label">Foto Bukti Transaksi (Opsional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            ref={fileInputRef}
            style={{ display: 'none' }}
            id="file-evidence-upload"
          />
          
          {!evidence ? (
            <div 
              className="image-upload-area"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera size={28} style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }} />
              <p style={{ fontSize: '0.825rem', fontWeight: 500 }}>Klik untuk mengambil foto atau unggah gambar bukti</p>
              <p style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>PNG, JPG atau WEBP (Maks. 1.5MB)</p>
            </div>
          ) : (
            <div className="image-preview-container">
              <img src={evidence} alt="Pratampil Bukti" className="image-preview" />
              <button 
                type="button" 
                onClick={handleRemoveImage}
                className="btn-remove-image"
                title="Hapus gambar"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Tombol Simpan */}
        <button
          type="submit"
          disabled={isUploadingImage}
          className="btn btn-primary"
          style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem' }}
        >
          {isUploadingImage
            ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Mengunggah foto...</>
            : <><Save size={18} />{isOnline ? 'Simpan Transaksi Kas' : 'Simpan Sementara (Offline)'}</>
          }
        </button>

        {!isOnline && (
          <p style={{ fontSize: '0.725rem', color: 'var(--accent)', textAlign: 'center', marginTop: '-0.5rem', fontWeight: 500 }}>
            * Koneksi offline. Data akan masuk antrean sinkronisasi lokal.
          </p>
        )}
      </form>
    </div>
  );
};
