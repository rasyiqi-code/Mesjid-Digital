import React, { useState, useEffect } from 'react';
import { Save, PlusCircle, MinusCircle } from 'lucide-react';
import { 
  getInventoryItems, 
  getItemStock
} from '../utils/storage';
import type { InventoryTransaction } from '../utils/storage';

interface InventoryFormProps {
  isOnline: boolean;
  onSave: (transaction: Omit<InventoryTransaction, 'id' | 'date'>) => void;
  showToast: (msg: string, type: 'success' | 'info' | 'error') => void;
  updateTrigger: number;
}

export const InventoryForm: React.FC<InventoryFormProps> = ({
  isOnline,
  onSave,
  showToast,
  updateTrigger,
}) => {
  const [type, setType] = useState<'masuk' | 'keluar'>('masuk');
  const [itemName, setItemName] = useState<string>('');
  const [amount, setAmount] = useState<number | ''>('');
  const [unit, setUnit] = useState<string>('Kg');
  const [donatur, setDonatur] = useState<string>('');
  const [category, setCategory] = useState<string>('Bahan Pokok');
  const [description, setDescription] = useState<string>('');
  
  // State untuk autocomplete nama barang
  const [existingItems, setExistingItems] = useState<{ name: string; unit: string; category: string }[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [currentStock, setCurrentStock] = useState<number>(0);

  // Ambil daftar barang yang sudah pernah ada untuk saran pengisian
  useEffect(() => {
    const items = getInventoryItems();
    setExistingItems(items.map(i => ({ name: i.name, unit: i.unit, category: i.category })));
  }, [updateTrigger, type]);

  // Pantau perubahan nama barang untuk autocomplete dan pengecekan stok
  useEffect(() => {
    if (itemName.trim()) {
      // Autocomplete saran
      const query = itemName.toLowerCase();
      const filtered = existingItems
        .filter(item => item.name.toLowerCase().includes(query) && item.name.toLowerCase() !== query)
        .map(item => item.name);
      setFilteredSuggestions(filtered);

      // Cek sisa stok saat ini
      const stock = getItemStock(itemName);
      setCurrentStock(stock);
    } else {
      setFilteredSuggestions([]);
      setCurrentStock(0);
    }
  }, [itemName, existingItems]);

  const handleSuggestionClick = (name: string) => {
    setItemName(name);
    setShowSuggestions(false);
    
    // Set satuan dan kategori otomatis jika sudah ada datanya
    const found = existingItems.find(item => item.name.toLowerCase() === name.toLowerCase());
    if (found) {
      setUnit(found.unit);
      setCategory(found.category);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const amt = Number(amount);
    const trimmedName = itemName.trim();

    if (!trimmedName) {
      showToast('Harap isi nama barang!', 'error');
      return;
    }
    if (!amt || amt <= 0) {
      showToast('Harap masukkan jumlah barang yang valid!', 'error');
      return;
    }

    // Validasi stok jika barang keluar
    if (type === 'keluar') {
      const stock = getItemStock(trimmedName);
      if (amt > stock) {
        showToast(`Stok ${trimmedName} kurang! Stok saat ini: ${stock} ${unit}. Transaksi dibatalkan.`, 'error');
        return;
      }
    }

    onSave({
      type,
      itemName: trimmedName,
      amount: amt,
      unit,
      category: type === 'masuk' ? category : '', // Kategori hanya untuk barang masuk
      donatur: type === 'masuk' ? donatur : undefined,
      description: type === 'keluar' ? description : undefined,
    });

    // Reset Form
    setItemName('');
    setAmount('');
    setDonatur('');
    setDescription('');
    setCurrentStock(0);
    showToast('Pencatatan barang berhasil.', 'success');
  };

  return (
    <div className="glass-card" style={{ maxWidth: '650px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Pencatatan Barang (Gudang)</h2>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* Toggle Barang Masuk / Keluar */}
        <div className="form-group">
          <label className="form-label">Jenis Logistik Barang</label>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => { setType('masuk'); }}
              className={`btn ${type === 'masuk' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1, gap: '0.4rem', padding: '0.65rem' }}
            >
              <PlusCircle size={18} />
              Barang Masuk
            </button>
            <button
              type="button"
              onClick={() => { setType('keluar'); }}
              className={`btn ${type === 'keluar' ? 'btn-danger' : 'btn-secondary'}`}
              style={{ flex: 1, gap: '0.4rem', padding: '0.65rem' }}
            >
              <MinusCircle size={18} />
              Barang Keluar
            </button>
          </div>
        </div>

        {/* Input Nama Barang (dengan Autocomplete) */}
        <div className="form-group" style={{ position: 'relative' }}>
          <label className="form-label" htmlFor="inv-item-name">Nama Barang</label>
          <input
            id="inv-item-name"
            type="text"
            value={itemName}
            onChange={(e) => {
              setItemName(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Tulis nama barang, misal: Beras, Minyak..."
            className="form-input"
            required
            autoComplete="off"
          />
          {showSuggestions && filteredSuggestions.length > 0 && (
            <ul className="suggestions-list">
              {filteredSuggestions.map((suggestion) => (
                <li
                  key={suggestion}
                  onMouseDown={() => handleSuggestionClick(suggestion)}
                  className="suggestion-item"
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
          
          {/* Tampilan Sisa Stok khusus untuk Barang Keluar */}
          {itemName.trim() && (
            <div style={{ marginTop: '0.35rem', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Stok Saat Ini:</span>
              <span style={{ fontWeight: 700, color: currentStock > 0 ? 'var(--primary)' : 'var(--danger)' }}>
                {currentStock} {unit}
              </span>
            </div>
          )}
        </div>

        {/* Baris Input Jumlah & Satuan */}
        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label" htmlFor="inv-amount">Jumlah Barang</label>
            <input
              id="inv-amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
              placeholder="0"
              className="form-input"
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="inv-unit">Satuan Barang</label>
            <select
              id="inv-unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="form-select"
              required
            >
              <option value="Kg">Kg (Kilogram)</option>
              <option value="Liter">Liter</option>
              <option value="Pcs">Pcs (Pieces/Buah)</option>
              <option value="Dus">Dus / Karton</option>
              <option value="Karung">Karung</option>
            </select>
          </div>
        </div>

        {/* Barang Masuk: Donatur & Kategori */}
        {type === 'masuk' && (
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="inv-donatur">Nama Donatur / Sumber</label>
              <input
                id="inv-donatur"
                type="text"
                value={donatur}
                onChange={(e) => setDonatur(e.target.value)}
                placeholder="Bpk/Ibu/Hamba Allah..."
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="inv-category">Kategori Logistik</label>
              <select
                id="inv-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="form-select"
              >
                <option value="Bahan Pokok">Bahan Pokok (Sembako)</option>
                <option value="Sarana Ibadah">Sarana Ibadah</option>
                <option value="Kebersihan">Alat & Bahan Kebersihan</option>
                <option value="Operasional">Operasional Kantor</option>
                <option value="Habis Pakai">Barang Habis Pakai</option>
              </select>
            </div>
          </div>
        )}

        {/* Barang Keluar: Keterangan / Peruntukan */}
        {type === 'keluar' && (
          <div className="form-group">
            <label className="form-label" htmlFor="inv-desc">Keterangan Pengambilan / Peruntukan</label>
            <textarea
              id="inv-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tulis alasan pengambilan barang, misal: Untuk pembagian baksos..."
              className="form-textarea"
              rows={3}
              required
            />
          </div>
        )}

        {/* Tombol Simpan */}
        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem' }}
        >
          <Save size={18} />
          {isOnline ? 'Simpan Transaksi Barang' : 'Simpan Sementara (Offline)'}
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
