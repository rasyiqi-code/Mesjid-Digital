// Tipe data untuk transaksi Kas
export interface CashTransaction {
  id: string;
  type: 'pemasukan' | 'pengeluaran';
  category: string;
  amount: number;
  description: string;
  date: string;
  evidence?: string; // Menyimpan gambar bukti dalam format Base64
}

// Tipe data untuk transaksi Barang (Inventaris)
export interface InventoryTransaction {
  id: string;
  type: 'masuk' | 'keluar';
  itemName: string;
  amount: number;
  unit: string;
  donatur?: string; // Untuk barang masuk
  category: string; // Kategori barang, misal: 'Habis Pakai'
  description?: string; // Keterangan untuk barang keluar, misal: 'Untuk baksos'
  date: string;
}

// Rekapitulasi barang beserta stok terkininya
export interface InventoryItem {
  name: string;
  stock: number;
  unit: string;
  category: string;
}

// Tipe item di dalam antrean sinkronisasi offline
export interface SyncQueueItem {
  id: string;
  type: 'cash' | 'inventory';
  action: 'create';
  data: CashTransaction | InventoryTransaction;
  timestamp: number;
}

// Tipe data jadwal program/kegiatan masjid
export interface MosqueProgram {
  id: string;
  title: string;                             // Judul kegiatan, misal: "Kajian Ahad Pagi"
  dayOrDate: string;                         // Hari (misal: "Ahad") atau tanggal ISO (misal: "2026-06-10")
  time: string;                              // Waktu mulai, misal: "07:00"
  location: string;                          // Tempat kegiatan, misal: "Aula Masjid"
  picName: string;                           // Penanggung jawab
  description?: string;                      // Deskripsi opsional
  isRecurring: boolean;                      // true = rutin mingguan/bulanan, false = sekali
  recurrenceType?: 'weekly' | 'monthly';     // Jenis pengulangan jika rutin
  createdAt: number;                         // Timestamp pembuatan (ms)
}


// Kunci penyimpanan LocalStorage
const KEYS = {
  CASH_TRANSACTIONS: 'mesjid_digital_cash_transactions',
  INVENTORY_TRANSACTIONS: 'mesjid_digital_inventory_transactions',
  SYNC_QUEUE: 'mesjid_digital_sync_queue',
};

// --- PENGELOLAAN DATA KAS ---

export const getCashTransactions = (): CashTransaction[] => {
  const data = localStorage.getItem(KEYS.CASH_TRANSACTIONS);
  return data ? JSON.parse(data) : [];
};

export const saveCashTransactions = (transactions: CashTransaction[]): void => {
  localStorage.setItem(KEYS.CASH_TRANSACTIONS, JSON.stringify(transactions));
};

export const addCashTransactionDirectly = (transaction: CashTransaction): void => {
  const transactions = getCashTransactions();
  transactions.unshift(transaction); // Tambah di awal (terbaru dulu)
  saveCashTransactions(transactions);
};

export const getCashBalance = (): { totalIn: number; totalOut: number; balance: number } => {
  const transactions = getCashTransactions();
  let totalIn = 0;
  let totalOut = 0;
  
  transactions.forEach((t) => {
    if (t.type === 'pemasukan') {
      totalIn += t.amount;
    } else {
      totalOut += t.amount;
    }
  });

  return {
    totalIn,
    totalOut,
    balance: totalIn - totalOut,
  };
};

// --- PENGELOLAAN DATA INVENTARIS ---

export const getInventoryTransactions = (): InventoryTransaction[] => {
  const data = localStorage.getItem(KEYS.INVENTORY_TRANSACTIONS);
  return data ? JSON.parse(data) : [];
};

export const saveInventoryTransactions = (transactions: InventoryTransaction[]): void => {
  localStorage.setItem(KEYS.INVENTORY_TRANSACTIONS, JSON.stringify(transactions));
};

export const addInventoryTransactionDirectly = (transaction: InventoryTransaction): void => {
  const transactions = getInventoryTransactions();
  transactions.unshift(transaction);
  saveInventoryTransactions(transactions);
};

// Menghitung stok saat ini dari daftar riwayat transaksi barang
export const getInventoryItems = (): InventoryItem[] => {
  const transactions = getInventoryTransactions();
  const itemsMap: Record<string, InventoryItem> = {};

  // Proses transaksi dari terlama ke terbaru untuk kalkulasi stok kronologis
  const sorted = [...transactions].reverse();

  sorted.forEach((t) => {
    const key = t.itemName.trim().toLowerCase();
    const displayName = t.itemName.trim();
    
    if (!itemsMap[key]) {
      itemsMap[key] = {
        name: displayName,
        stock: 0,
        unit: t.unit,
        category: t.category || 'Lainnya',
      };
    }

    if (t.type === 'masuk') {
      itemsMap[key].stock += t.amount;
    } else {
      itemsMap[key].stock -= t.amount;
      // Mencegah stok bernilai negatif akibat inkonsistensi
      if (itemsMap[key].stock < 0) {
        itemsMap[key].stock = 0;
      }
    }
  });

  return Object.values(itemsMap);
};

// Mendapatkan stok spesifik untuk nama barang tertentu
export const getItemStock = (itemName: string): number => {
  const items = getInventoryItems();
  const key = itemName.trim().toLowerCase();
  const found = items.find((item) => item.name.toLowerCase() === key);
  return found ? found.stock : 0;
};

// --- PENGELOLAAN ANTREAN OFFLINE ---

export const getSyncQueue = (): SyncQueueItem[] => {
  const data = localStorage.getItem(KEYS.SYNC_QUEUE);
  return data ? JSON.parse(data) : [];
};

export const saveSyncQueue = (queue: SyncQueueItem[]): void => {
  localStorage.setItem(KEYS.SYNC_QUEUE, JSON.stringify(queue));
};

export const addToSyncQueue = (type: 'cash' | 'inventory', data: CashTransaction | InventoryTransaction): void => {
  const queue = getSyncQueue();
  const newItem: SyncQueueItem = {
    id: `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    action: 'create',
    data,
    timestamp: Date.now(),
  };
  queue.push(newItem);
  saveSyncQueue(queue);
};

export const removeFromSyncQueue = (id: string): void => {
  const queue = getSyncQueue();
  const filtered = queue.filter((item) => item.id !== id);
  saveSyncQueue(filtered);
};

export const clearSyncQueue = (): void => {
  localStorage.removeItem(KEYS.SYNC_QUEUE);
};

// --- DUMMY DATA INAP (INITIAL SEEDING) ---
// Mengisi data awal jika LocalStorage masih kosong untuk kenyamanan demonstrasi
export const seedInitialData = (): void => {
  if (getCashTransactions().length === 0 && getInventoryTransactions().length === 0) {
    // Input kas awal
    const initialCash: CashTransaction[] = [
      {
        id: 'cash_1',
        type: 'pemasukan',
        category: 'Infaq Jumat',
        amount: 2500000,
        description: 'Infaq kotak amal Jumat berkah',
        date: '2026-06-01',
      },
      {
        id: 'cash_2',
        type: 'pemasukan',
        category: 'Zakat Mal',
        amount: 5000000,
        description: 'Zakat mal dari H. Ahmad',
        date: '2026-06-02',
      },
      {
        id: 'cash_3',
        type: 'pengeluaran',
        category: 'Operasional',
        amount: 750000,
        description: 'Bayar listrik dan air masjid',
        date: '2026-06-03',
      },
      {
        id: 'cash_4',
        type: 'pengeluaran',
        category: 'Sosial',
        amount: 1000000,
        description: 'Santunan anak yatim RW 04',
        date: '2026-06-04',
      },
    ];
    saveCashTransactions(initialCash);

    // Input inventaris awal
    const initialInventory: InventoryTransaction[] = [
      {
        id: 'inv_1',
        type: 'masuk',
        itemName: 'Beras',
        amount: 100,
        unit: 'Kg',
        donatur: 'Hamba Allah',
        category: 'Bahan Pokok',
        date: '2026-06-01',
      },
      {
        id: 'inv_2',
        type: 'masuk',
        itemName: 'Minyak Goreng',
        amount: 24,
        unit: 'Liter',
        donatur: 'Ibu Fatimah',
        category: 'Bahan Pokok',
        date: '2026-06-02',
      },
      {
        id: 'inv_3',
        type: 'keluar',
        itemName: 'Beras',
        amount: 20,
        unit: 'Kg',
        description: 'Bantuan sosial warga terdampak banjir',
        category: 'Bahan Pokok',
        date: '2026-06-03',
      },
    ];
    saveInventoryTransactions(initialInventory);
  }
};
