import type { CashTransaction, InventoryTransaction, SyncQueueItem, InventoryItem, MosqueProgram } from './storage';

const DB_NAME = 'mesjid_digital_db';
const DB_VERSION = 2; // Dinaikkan ke 2 karena penambahan store 'programs'
const STORES = {
  CASH: 'cash_transactions',
  INVENTORY: 'inventory_transactions',
  QUEUE: 'sync_queue',
  PROGRAMS: 'programs',
};

// Inisialisasi IndexedDB asinkron berbasis Promise
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Gagal membuka database lokal IndexedDB.'));
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Buat store transaksi kas jika belum ada
      if (!db.objectStoreNames.contains(STORES.CASH)) {
        db.createObjectStore(STORES.CASH, { keyPath: 'id' });
      }
      
      // Buat store transaksi barang jika belum ada
      if (!db.objectStoreNames.contains(STORES.INVENTORY)) {
        db.createObjectStore(STORES.INVENTORY, { keyPath: 'id' });
      }
      
      // Buat store antrean sinkronisasi jika belum ada
      if (!db.objectStoreNames.contains(STORES.QUEUE)) {
        db.createObjectStore(STORES.QUEUE, { keyPath: 'id' });
      }

      // Buat store jadwal program masjid (DB version 2)
      if (!db.objectStoreNames.contains(STORES.PROGRAMS)) {
        const programStore = db.createObjectStore(STORES.PROGRAMS, { keyPath: 'id' });
        // Indeks untuk sorting berdasarkan waktu pembuatan
        programStore.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
  });
};

// --- OPERASI GENERIC READ/WRITE INDEXEDDB ---

const getStoreData = <T>(storeName: string): Promise<T[]> => {
  return initDB().then((db) => {
    return new Promise<T[]>((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        // Urutkan data berdasarkan timestamp atau id secara terbalik (terbaru dahulu secara default)
        // Kita tangani sorting secara fleksibel di sisi pemanggil
        resolve(request.result as T[]);
      };

      request.onerror = () => {
        reject(new Error(`Gagal membaca data dari store: ${storeName}`));
      };
    });
  });
};

const putData = <T>(storeName: string, data: T): Promise<void> => {
  return initDB().then((db) => {
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error(`Gagal menulis data ke store: ${storeName}`));
    });
  });
};

const deleteData = (storeName: string, id: string): Promise<void> => {
  return initDB().then((db) => {
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error(`Gagal menghapus data di store: ${storeName} dengan ID: ${id}`));
    });
  });
};

const clearStore = (storeName: string): Promise<void> => {
  return initDB().then((db) => {
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error(`Gagal mengosongkan store: ${storeName}`));
    });
  });
};

// --- OPERASI KAS PROMISE API ---

export const getDBCashTransactions = async (): Promise<CashTransaction[]> => {
  const data = await getStoreData<CashTransaction>(STORES.CASH);
  const queueTxs = await getStoreData<SyncQueueItem>(STORES.QUEUE);
  
  const cashHistoryList = [...data];
  
  // Ambil transaksi kas yang masih mengantre di offline sync agar tampil secara real-time
  queueTxs.forEach((q) => {
    if (q.type === 'cash') {
      cashHistoryList.push(q.data as CashTransaction);
    }
  });

  // Urutkan tanggal terbaru di atas
  return cashHistoryList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const addDBCashTransaction = async (tx: CashTransaction): Promise<void> => {
  await putData<CashTransaction>(STORES.CASH, tx);
};

export const getDBCashBalance = async (): Promise<{ totalIn: number; totalOut: number; balance: number }> => {
  const txs = await getStoreData<CashTransaction>(STORES.CASH);
  const queueTxs = await getStoreData<SyncQueueItem>(STORES.QUEUE);
  
  let totalIn = 0;
  let totalOut = 0;
  
  // 1. Hitung transaksi kas yang sudah tersinkronisasi
  txs.forEach((t) => {
    if (t.type === 'pemasukan') totalIn += t.amount;
    else totalOut += t.amount;
  });

  // 2. Tambahkan transaksi kas yang masih dalam antrean offline agar saldo tetap akurat
  queueTxs.forEach((q) => {
    if (q.type === 'cash') {
      const t = q.data as CashTransaction;
      if (t.type === 'pemasukan') totalIn += t.amount;
      else totalOut += t.amount;
    }
  });

  return { totalIn, totalOut, balance: totalIn - totalOut };
};

// Menghapus transaksi kas berdasarkan ID
export const deleteDBCashTransaction = async (id: string): Promise<void> => {
  await deleteData(STORES.CASH, id);
};

// --- OPERASI INVENTARIS PROMISE API ---

export const getDBInventoryTransactions = async (): Promise<InventoryTransaction[]> => {
  const data = await getStoreData<InventoryTransaction>(STORES.INVENTORY);
  return data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const addDBInventoryTransaction = async (tx: InventoryTransaction): Promise<void> => {
  await putData<InventoryTransaction>(STORES.INVENTORY, tx);
};

// Menghapus transaksi inventaris (mutasi) berdasarkan ID
export const deleteDBInventoryTransaction = async (id: string): Promise<void> => {
  await deleteData(STORES.INVENTORY, id);
};

// Menghitung stok saat ini dengan menggabungkan transaksi utama + mutasi yang mengantre di offline sync
// Hal ini mencegah "double spending" stok atau pencatatan barang keluar yang tidak valid saat offline!
export const getDBInventoryItems = async (): Promise<InventoryItem[]> => {
  const mainTxs = await getStoreData<InventoryTransaction>(STORES.INVENTORY);
  const queueTxs = await getStoreData<SyncQueueItem>(STORES.QUEUE);
  
  const itemsMap: Record<string, InventoryItem> = {};

  // 1. Proses data utama (kronologis: terlama ke terbaru)
  const sortedMain = [...mainTxs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  sortedMain.forEach((t) => {
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
      if (itemsMap[key].stock < 0) itemsMap[key].stock = 0;
    }
  });

  // 2. Gabungkan mutasi dari antrean offline (jika ada) agar sisa stok akurat saat offline berturut-turut!
  queueTxs.forEach((q) => {
    if (q.type === 'inventory') {
      const t = q.data as InventoryTransaction;
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
        if (itemsMap[key].stock < 0) itemsMap[key].stock = 0;
      }
    }
  });

  return Object.values(itemsMap);
};

export const getDBItemStock = async (itemName: string): Promise<number> => {
  const items = await getDBInventoryItems();
  const key = itemName.trim().toLowerCase();
  const found = items.find((item) => item.name.toLowerCase() === key);
  return found ? found.stock : 0;
};

// --- OPERASI ANTREAN OFFLINE PROMISE API ---

export const getDBSyncQueue = async (): Promise<SyncQueueItem[]> => {
  const data = await getStoreData<SyncQueueItem>(STORES.QUEUE);
  return data.sort((a, b) => a.timestamp - b.timestamp); // Urutkan kronologis agar dikirim berurutan
};

export const addDBSyncQueue = async (type: 'cash' | 'inventory', data: CashTransaction | InventoryTransaction): Promise<void> => {
  const newItem: SyncQueueItem = {
    id: `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    action: 'create',
    data,
    timestamp: Date.now(),
  };
  await putData<SyncQueueItem>(STORES.QUEUE, newItem);
};

export const deleteDBSyncQueue = async (id: string): Promise<void> => {
  await deleteData(STORES.QUEUE, id);
};

export const clearDBSyncQueue = async (): Promise<void> => {
  await clearStore(STORES.QUEUE);
};

// --- DATA INITIAL SEEDING UNTUK INDEXEDDB ---

export const seedDBInitialData = async (): Promise<void> => {
  const dbCash = await getStoreData<CashTransaction>(STORES.CASH);
  const dbInv = await getStoreData<InventoryTransaction>(STORES.INVENTORY);

  if (dbCash.length === 0 && dbInv.length === 0) {
    const initialCash: CashTransaction[] = [
      {
        id: 'cash_1',
        type: 'pemasukan',
        category: 'Infaq Jumat',
        amount: 2500000,
        description: 'Infaq kotak amal Jumat berkah masjid',
        date: '2026-06-01',
      },
      {
        id: 'cash_2',
        type: 'pemasukan',
        category: 'Zakat Maal',
        amount: 5000000,
        description: 'Zakat mal dari H. Ahmad',
        date: '2026-06-02',
      },
      {
        id: 'cash_3',
        type: 'pengeluaran',
        category: 'Operasional',
        amount: 750000,
        description: 'Bayar tagihan listrik dan air masjid bulanan',
        date: '2026-06-03',
      },
      {
        id: 'cash_4',
        type: 'pengeluaran',
        category: 'Sosial',
        amount: 1000000,
        description: 'Santunan anak yatim piatu RW 04',
        date: '2026-06-04',
      },
    ];

    for (const tx of initialCash) {
      await putData<CashTransaction>(STORES.CASH, tx);
    }

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
        description: 'Bantuan sosial warga terdampak banjir bandang',
        category: 'Bahan Pokok',
        date: '2026-06-03',
      },
    ];

    for (const tx of initialInventory) {
      await putData<InventoryTransaction>(STORES.INVENTORY, tx);
    }
  }
};

// --- OPERASI PROGRAM MASJID PROMISE API ---

// Ambil seluruh jadwal program masjid, diurutkan dari terbaru
export const getDBPrograms = async (): Promise<MosqueProgram[]> => {
  const data = await getStoreData<MosqueProgram>(STORES.PROGRAMS);
  return data.sort((a, b) => b.createdAt - a.createdAt);
};

// Tambah atau perbarui jadwal program
export const addDBProgram = async (program: MosqueProgram): Promise<void> => {
  await putData<MosqueProgram>(STORES.PROGRAMS, program);
};

// Hapus jadwal program berdasarkan ID
export const deleteDBProgram = async (id: string): Promise<void> => {
  await deleteData(STORES.PROGRAMS, id);
};

