import type { CashTransaction, InventoryTransaction, MosqueProgram } from './storage';

// ─── Tipe Data ───────────────────────────────────────────────────────────────

export interface SheetsConfig {
  url: string;   // URL Google Apps Script Web App
  token: string; // Token keamanan yang cocok dengan yang diset di Apps Script
}

export interface SyncPayload {
  kas: CashTransaction[];
  barang: InventoryTransaction[];
  program: MosqueProgram[];
}

export interface SyncResult {
  ok: boolean;
  message?: string;
  counts?: { kas: number; barang: number; program: number };
  syncedAt?: string;
  error?: string;
}

export interface UploadImageResult {
  ok: boolean;
  url?: string;  // URL publik Google Drive untuk ditampilkan di <img>
  fileId?: string;
  error?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Validasi konfigurasi sebelum mengirim request.
 * Kembalikan pesan error jika tidak valid, null jika valid.
 */
export const validateConfig = (config: SheetsConfig): string | null => {
  if (!config.url || !config.url.startsWith('https://script.google.com/')) {
    return 'URL Apps Script tidak valid. Harus diawali dengan "https://script.google.com/"';
  }
  if (!config.token || config.token.length < 6) {
    return 'Token keamanan harus minimal 6 karakter.';
  }
  return null;
};

/**
 * Helper POST ke Apps Script endpoint.
 * Apps Script tidak mendukung CORS secara sempurna, jadi gunakan mode: 'no-cors' —
 * kita tidak bisa baca response body. Untuk operasi write (sync), ini cukup.
 * Untuk operasi yang perlu response (upload foto, ping), gunakan fetch biasa dengan
 * mode: 'cors' dan tambahkan header di Apps Script.
 *
 * CATATAN: Apps Script Web App dengan "Anyone" akses otomatis menangani preflight.
 */
const postToScript = async (config: SheetsConfig, body: object): Promise<unknown> => {
  const res = await fetch(config.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: config.token, ...body }),
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
  return res.json();
};

const getFromScript = async (config: SheetsConfig, params: Record<string, string>): Promise<unknown> => {
  const query = new URLSearchParams({ token: config.token, ...params }).toString();
  const res = await fetch(`${config.url}?${query}`);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
  return res.json();
};

// ─── API Publik ───────────────────────────────────────────────────────────────

/**
 * Test koneksi ke Apps Script — kirim ping dan verifikasi respons.
 * Kembalikan true jika berhasil, false + pesan error jika gagal.
 */
export const pingAppsScript = async (config: SheetsConfig): Promise<{ ok: boolean; message: string }> => {
  const configError = validateConfig(config);
  if (configError) {
    return { ok: false, message: configError };
  }

  try {
    const data = await getFromScript(config, { action: 'ping' }) as { ok: boolean; message?: string; error?: string };
    if (data.ok) {
      return { ok: true, message: data.message ?? 'Koneksi berhasil.' };
    }
    return { ok: false, message: data.error ?? 'Respons tidak valid dari server.' };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Gagal menghubungi server.';
    return { ok: false, message: msg };
  }
};

/**
 * Sinkronisasi seluruh data lokal ke Google Sheets sekaligus.
 * Data di Sheets akan ditimpa penuh dengan data lokal (source of truth = IndexedDB).
 */
export const syncAllToSheets = async (config: SheetsConfig, payload: SyncPayload): Promise<SyncResult> => {
  const configError = validateConfig(config);
  if (configError) {
    return { ok: false, error: configError };
  }

  try {
    const result = await postToScript(config, {
      action: 'sync_all',
      kas: payload.kas,
      barang: payload.barang,
      program: payload.program,
    }) as SyncResult;
    return result;
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Sinkronisasi gagal.';
    return { ok: false, error: msg };
  }
};

/**
 * Upload gambar (format base64 Data URL) ke Google Drive.
 * Kembalikan URL publik yang bisa langsung digunakan sebagai src gambar.
 *
 * @param config   Konfigurasi Apps Script
 * @param base64   String base64 lengkap dengan prefix ("data:image/jpeg;base64,...")
 * @param filename Nama file opsional di Google Drive
 */
export const uploadImageToDrive = async (
  config: SheetsConfig,
  base64: string,
  filename?: string
): Promise<UploadImageResult> => {
  const configError = validateConfig(config);
  if (configError) {
    return { ok: false, error: configError };
  }

  try {
    const result = await postToScript(config, {
      action: 'upload_image',
      base64,
      filename: filename ?? `bukti_${Date.now()}.jpg`,
    }) as UploadImageResult;
    return result;
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Upload gambar gagal.';
    return { ok: false, error: msg };
  }
};
