import React, { useState, useEffect } from 'react';
import { Save, PlusCircle, MinusCircle } from 'lucide-react';
import { 
  getDBInventoryItems, 
  getDBItemStock
} from '../utils/db';
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
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [currentStock, setCurrentStock] = useState<number>(0);

  // Ambil daftar barang yang sudah pernah ada untuk saran pengisian (IndexedDB Asinkron)
  useEffect(() => {
    let active = true;
    getDBInventoryItems()
      .then((items) => {
        if (!active) return;
        setExistingItems(items.map(i => ({ name: i.name, unit: i.unit, category: i.category })));
      })
      .catch((err) => {
        console.error('Gagal mengambil daftar barang inventaris:', err);
      });
    return () => {
      active = false;
    };
  }, [updateTrigger, type]);

  // Autocomplete saran (derived state dihitung langsung saat render)
  const query = itemName.trim().toLowerCase();
  const filteredSuggestions = query
    ? existingItems
        .filter(item => item.name.toLowerCase().includes(query) && item.name.toLowerCase() !== query)
        .map(item => item.name)
    : [];

  // Pantau perubahan nama barang untuk pengecekan stok secara asinkron
  useEffect(() => {
    let active = true;
    const checkStock = async () => {
      if (itemName.trim()) {
        try {
          const stock = await getDBItemStock(itemName);
          if (active) setCurrentStock(stock);
        } catch {
          if (active) setCurrentStock(0);
        }
      } else {
        if (active) setCurrentStock(0);
      }
    };
    checkStock();
    return () => {
      active = false;
    };
  }, [itemName]);

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

  const executeSave = (trimmedName: string, amt: number) => {
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

    // Validasi stok asinkron jika barang keluar
    if (type === 'keluar') {
      getDBItemStock(trimmedName)
        .then((stock) => {
          if (amt > stock) {
            showToast(`Stok ${trimmedName} kurang! Stok saat ini: ${stock} ${unit}. Transaksi dibatalkan.`, 'error');
          } else {
            executeSave(trimmedName, amt);
          }
        })
        .catch((err) => {
          console.error('Error mengecek stok:', err);
          showToast('Sistem gagal memverifikasi ketersediaan stok.', 'error');
        });
    } else {
      executeSave(trimmedName, amt);
    }
  };

  return (
    <div className="glass-card" style={{ maxWidth: '650px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.85rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.45rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 800 }}>Logistik Barang</h2>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        
        {/* Toggle Barang Masuk / Keluar */}
        <div className="form-group" style={{ marginBottom: '0.5rem' }}>
          <label className="form-label">Jenis Logistik</label>
          <div className="form-toggle-group">
            <button
              type="button"
              onClick={() => { setType('masuk'); }}
              className={`btn ${type === 'masuk' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1, gap: '0.3rem', padding: '0.45rem', minHeight: '34px', fontSize: '0.8rem' }}
            >
              <PlusCircle size={15} />
              Barang Masuk
            </button>
            <button
              type="button"
              onClick={() => { setType('keluar'); }}
              className={`btn ${type === 'keluar' ? 'btn-danger' : 'btn-secondary'}`}
              style={{ flex: 1, gap: '0.3rem', padding: '0.45rem', minHeight: '34px', fontSize: '0.8rem' }}
            >
              <MinusCircle size={15} />
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
            placeholder="Ketik nama barang..."
            className="form-input"
            style={{ minHeight: '36px', padding: '0.45rem 0.65rem', fontSize: '0.85rem' }}
            required
            autoComplete="off"
          />
          {showSuggestions && filteredSuggestions.length > 0 && (
            <ul className="suggestions-list" style={{ marginTop: '0.1rem' }}>
              {filteredSuggestions.map((suggestion) => (
                <li
                  key={suggestion}
                  onMouseDown={() => handleSuggestionClick(suggestion)}
                  className="suggestion-item"
                  style={{ padding: '0.45rem 0.65rem', fontSize: '0.775rem' }}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
          
          {/* Tampilan Sisa Stok */}
          {itemName.trim() && (
            <div style={{ marginTop: '0.25rem', fontSize: '0.725rem', display: 'flex', justifyContent: 'space-between' }}>
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
            <label className="form-label" htmlFor="inv-amount">Jumlah</label>
            <input
              id="inv-amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
              placeholder="0"
              className="form-input"
              style={{ minHeight: '36px', padding: '0.45rem 0.65rem', fontSize: '0.85rem' }}
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="inv-unit">Satuan</label>
            <select
              id="inv-unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="form-select"
              style={{ minHeight: '36px', padding: '0.45rem 0.65rem', fontSize: '0.85rem' }}
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
              <label className="form-label" htmlFor="inv-donatur">Donatur / Sumber</label>
              <input
                id="inv-donatur"
                type="text"
                value={donatur}
                onChange={(e) => setDonatur(e.target.value)}
                placeholder="Nama donatur..."
                className="form-input"
                style={{ minHeight: '36px', padding: '0.45rem 0.65rem', fontSize: '0.85rem' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="inv-category">Kategori</label>
              <select
                id="inv-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="form-select"
                style={{ minHeight: '36px', padding: '0.45rem 0.65rem', fontSize: '0.85rem' }}
              >
                <option value="Bahan Pokok">Bahan Pokok</option>
                <option value="Sarana Ibadah">Sarana Ibadah</option>
                <option value="Kebersihan">Kebersihan</option>
                <option value="Operasional">Operasional</option>
                <option value="Habis Pakai">Habis Pakai</option>
              </select>
            </div>
          </div>
        )}

        {/* Barang Keluar: Keterangan / Peruntukan */}
        {type === 'keluar' && (
          <div className="form-group">
            <label className="form-label" htmlFor="inv-desc">Peruntukan Pengambilan</label>
            <textarea
              id="inv-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tulis tujuan pengambilan barang..."
              className="form-textarea"
              rows={2}
              style={{ minHeight: '50px', padding: '0.45rem 0.65rem', fontSize: '0.85rem' }}
              required
            />
          </div>
        )}

        {/* Tombol Simpan */}
        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', padding: '0.55rem', marginTop: '0.15rem', minHeight: '36px', borderRadius: '6px' }}
        >
          <Save size={14} />
          <span>{isOnline ? 'Simpan Transaksi Barang' : 'Simpan Sementara (Offline)'}</span>
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
