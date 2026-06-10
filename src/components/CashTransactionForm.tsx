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
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.85rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.45rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 800 }}>Pencatatan Kas</h2>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        
        {/* Toggle Pemasukan / Pengeluaran */}
        <div className="form-group" style={{ marginBottom: '0.5rem' }}>
          <label className="form-label">Jenis Transaksi</label>
          <div className="form-toggle-group">
            <button
              type="button"
              onClick={() => { setType('pemasukan'); setCategory(''); }}
              className={`btn ${type === 'pemasukan' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1, gap: '0.3rem', padding: '0.45rem', minHeight: '34px', fontSize: '0.8rem' }}
            >
              <ArrowUpRight size={15} />
              Pemasukan
            </button>
            <button
              type="button"
              onClick={() => { setType('pengeluaran'); setCategory(''); }}
              className={`btn ${type === 'pengeluaran' ? 'btn-danger' : 'btn-secondary'}`}
              style={{ flex: 1, gap: '0.3rem', padding: '0.45rem', minHeight: '34px', fontSize: '0.8rem' }}
            >
              <ArrowDownLeft size={15} />
              Pengeluaran
            </button>
          </div>
        </div>

        {/* Baris Kategori & Nominal (Grid 2-kolom) */}
        <div className="form-grid-2">
          {/* Pilihan Kategori */}
          <div className="form-group" style={{ position: 'relative' }}>
            <label className="form-label" htmlFor="cash-category">Kategori Kas</label>
            <select
              id="cash-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="form-select"
              style={{ minHeight: '36px', padding: '0.45rem 0.65rem', fontSize: '0.85rem' }}
              required
            >
              <option value="" disabled>-- Pilih Kategori --</option>
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
              <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                Rp
              </span>
              <input
                id="cash-amount"
                type="text"
                value={amountStr}
                onChange={handleAmountChange}
                placeholder="0"
                className="form-input"
                style={{ paddingLeft: '2.1rem', fontWeight: 700, fontSize: '0.95rem', minHeight: '36px' }}
                required
              />
            </div>
          </div>
        </div>

        {/* Input Keterangan Opsional */}
        <div className="form-group">
          <label className="form-label" htmlFor="cash-desc">Keterangan (Opsional)</label>
          <textarea
            id="cash-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tulis detail transaksi..."
            className="form-textarea"
            rows={2}
            style={{ minHeight: '50px', padding: '0.45rem 0.65rem', fontSize: '0.85rem' }}
          />
        </div>

        {/* Upload Foto Bukti */}
        <div className="form-group" style={{ marginBottom: '0.5rem' }}>
          <label className="form-label">Foto Bukti (Opsional)</label>
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
              style={{ padding: '0.55rem', minHeight: '65px' }}
            >
              <Camera size={20} style={{ color: 'var(--text-secondary)', marginBottom: '0.15rem' }} />
              <p style={{ fontSize: '0.75rem', fontWeight: 600 }}>Ambil foto bukti transaksi</p>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>PNG, JPG atau WEBP (Maks. 1.5MB)</p>
            </div>
          ) : (
            <div className="image-preview-container" style={{ maxWidth: '100px', maxHeight: '100px' }}>
              <img src={evidence} alt="Pratampil Bukti" className="image-preview" />
              <button 
                type="button" 
                onClick={handleRemoveImage}
                className="btn-remove-image"
                style={{ width: '24px', height: '24px', top: '0.35rem', right: '0.35rem' }}
                title="Hapus gambar"
              >
                <X size={12} />
              </button>
            </div>
          )}
        </div>

        {/* Tombol Simpan */}
        <button
          type="submit"
          disabled={isUploadingImage}
          className="btn btn-primary"
          style={{ width: '100%', padding: '0.55rem', marginTop: '0.15rem', minHeight: '36px', borderRadius: '6px' }}
        >
          {isUploadingImage
            ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Mengunggah...</>
            : <><Save size={14} /> <span>{isOnline ? 'Simpan Transaksi Kas' : 'Simpan Sementara (Offline)'}</span></>
          }
        </button>

        {!isOnline && (
          <p style={{ fontSize: '0.65rem', color: 'var(--accent)', textAlign: 'center', marginTop: '-0.35rem', fontWeight: 500 }}>
            * Koneksi offline. Data akan masuk antrean sinkronisasi lokal.
          </p>
        )}
      </form>
    </div>
  );
};
