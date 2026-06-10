import React from 'react';
import { createPortal } from 'react-dom';
import { X, FileText, ShieldAlert, Sparkles } from 'lucide-react';

interface SetupGuideModalProps {
  onClose: () => void;
}

export const SetupGuideModal: React.FC<SetupGuideModalProps> = ({ onClose }) => {
  return createPortal(
    <div 
      className="drawer-overlay" 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        backgroundColor: 'rgba(0, 0, 0, 0.4)', 
        backdropFilter: 'blur(6px)', 
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div 
        className="glass-card animate-in-fade" 
        style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.98)', 
          width: '100%', 
          maxWidth: '100%', 
          maxHeight: '90vh', 
          overflowY: 'auto', 
          borderRadius: '16px', 
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)', 
          border: '1px solid var(--border-subtle)',
          padding: '1.5rem',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tombol Tutup */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'rgba(0, 0, 0, 0.03)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 0.15s ease'
          }}
          title="Tutup panduan"
        >
          <X size={16} />
        </button>

        {/* Header Modal */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ background: 'rgba(66, 133, 244, 0.08)', color: '#4285f4', padding: '0.55rem', borderRadius: '10px' }}>
            <FileText size={24} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Panduan Setup Integrasi Google
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.15rem 0 0 0' }}>
              Sinkronisasi basis data lokal ke Google Sheets & Google Drive secara gratis
            </p>
          </div>
        </div>

        {/* Konten Dokumentasi dengan Grid Responsif */}
        <div className="documentation-grid-container" style={{ textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-primary)', paddingRight: '0.25rem' }}>
          
          {/* Kolom Kiri: Penjelasan & Langkah 1-4 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <div style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(6, 182, 212, 0.05) 100%)', border: '1px solid rgba(16, 185, 129, 0.15)', borderRadius: '10px', padding: '0.75rem 1rem' }}>
              <h4 style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--primary)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Sparkles size={14} /> Apa itu Google Apps Script?
              </h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                Backend gratis berbasis Google Apps Script yang berfungsi sebagai penghubung (API) untuk menyimpan data transaksi secara real-time ke Google Sheets, serta mencadangkan foto bukti transaksi secara otomatis ke Google Drive masjid Anda tanpa biaya hosting.
              </p>
            </div>

            <div>
              <h4 style={{ fontWeight: 800, marginBottom: '0.65rem', color: 'var(--text-primary)' }}>Langkah Setup 1 s/d 4: Pembuatan & Inisialisasi</h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                
                {/* Step 1 */}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border-subtle)', borderRadius: '50%', width: '22px', height: '22px', fontSize: '0.7rem', fontWeight: 800, flexShrink: 0 }}>1</span>
                  <div>
                    <h5 style={{ fontWeight: 700, margin: 0 }}>Buat Google Spreadsheet</h5>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.775rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      Buka <a href="https://sheets.google.com" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 600 }}>sheets.google.com</a>, buat lembar kerja baru, lalu beri nama file: <strong>"Database Masjid Digital"</strong>.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border-subtle)', borderRadius: '50%', width: '22px', height: '22px', fontSize: '0.7rem', fontWeight: 800, flexShrink: 0 }}>2</span>
                  <div>
                    <h5 style={{ fontWeight: 700, margin: 0 }}>Buat Project Apps Script</h5>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.775rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      Di dalam Spreadsheet baru Anda, klik menu <strong>Extensions → Apps Script</strong>. Hapus semua kode default di dalam editor (seperti <code>function myFunction()</code>) dan ganti/paste dengan kode lengkap dari berkas <code>apps-script/Code.gs</code> di dalam folder proyek ini. Simpan project (tekan <code>Ctrl+S</code>) dengan nama: <strong>"Masjid Digital API"</strong>.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border-subtle)', borderRadius: '50%', width: '22px', height: '22px', fontSize: '0.7rem', fontWeight: 800, flexShrink: 0 }}>3</span>
                  <div>
                    <h5 style={{ fontWeight: 700, margin: 0 }}>Jalankan Setup Awal</h5>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.775rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      Di editor Apps Script, pilih fungsi <strong>setupSpreadsheet</strong> dari dropdown, lalu klik tombol ▶️ <strong>Run</strong>. Pilih akun Google Anda dan berikan semua izin akses yang diperlukan. Tunggu eksekusi selesai hingga muncul log: <code>✅ Setup selesai!</code>. Ini akan membuat 3 tab tabel: <strong>kas</strong>, <strong>barang</strong>, dan <strong>program</strong>.
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border-subtle)', borderRadius: '50%', width: '22px', height: '22px', fontSize: '0.7rem', fontWeight: 800, flexShrink: 0 }}>4</span>
                  <div>
                    <h5 style={{ fontWeight: 700, margin: 0 }}>Set Token Keamanan</h5>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.775rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      Token ini digunakan untuk mengamankan data API Anda. Di editor script, pilih fungsi <strong>setSecretToken</strong>. Edit baris kode sementara dengan token pilihan Anda (minimal 6 karakter), misalnya: <code>setSecretToken('masjid-muttaqin-2026')</code>, klik ▶️ <strong>Run</strong>, lalu **hapus kembali** baris token tersebut demi keamanan.
                    </p>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Kolom Kanan: Langkah 5-6, Troubleshooting & Peringatan */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <div>
              <h4 style={{ fontWeight: 800, marginBottom: '0.65rem', color: 'var(--text-primary)' }}>Langkah Setup 5 s/d 6: Deploy & Integrasi</h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                
                {/* Step 5 */}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border-subtle)', borderRadius: '50%', width: '22px', height: '22px', fontSize: '0.7rem', fontWeight: 800, flexShrink: 0 }}>5</span>
                  <div>
                    <h5 style={{ fontWeight: 700, margin: 0 }}>Deploy sebagai Web App</h5>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.775rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      Klik tombol <strong>Deploy (kanan atas) → New deployment</strong>. Klik ikon gerigi di sebelah "Select type", pilih <strong>Web app</strong>. Atur:
                      <br />• <strong>Execute as:</strong> Me (email Anda)
                      <br />• <strong>Who has access:</strong> Anyone (agar aplikasi web bisa mengakses)
                      <br />Klik <strong>Deploy</strong> dan salin <strong>Web App URL</strong> yang dihasilkan (bentuknya seperti: <code>https://script.google.com/macros/s/AKfycb.../exec</code>).
                    </p>
                  </div>
                </div>

                {/* Step 6 */}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border-subtle)', borderRadius: '50%', width: '22px', height: '22px', fontSize: '0.7rem', fontWeight: 800, flexShrink: 0 }}>6</span>
                  <div>
                    <h5 style={{ fontWeight: 700, margin: 0 }}>Konfigurasi di Aplikasi</h5>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.775rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      Buka halaman **Pengaturan** aplikasi ini. Buka kunci panel **"Integrasi Google"**, tempel URL Web App dari langkah 5, lalu masukkan Token Keamanan dari langkah 4. Terakhir, klik **Test Koneksi** untuk memverifikasi, lalu klik **Simpan Pengaturan**.
                    </p>
                  </div>
                </div>

              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem' }}>
              <h4 style={{ fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Troubleshooting</h4>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                  <thead>
                    <tr style={{ background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--border-subtle)' }}>
                      <th style={{ padding: '0.45rem', fontWeight: 700, textAlign: 'left' }}>Masalah</th>
                      <th style={{ padding: '0.45rem', fontWeight: 700, textAlign: 'left' }}>Penyebab & Solusi</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                      <td style={{ padding: '0.45rem', fontWeight: 700, color: 'var(--danger)', whiteSpace: 'nowrap' }}>"Token tidak valid"</td>
                      <td style={{ padding: '0.45rem', color: 'var(--text-secondary)' }}>Token keamanan di halaman pengaturan tidak sama dengan token yang dimasukkan saat menjalankan <code>setSecretToken</code> di Apps Script.</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                      <td style={{ padding: '0.45rem', fontWeight: 700, color: 'var(--danger)', whiteSpace: 'nowrap' }}>"Spreadsheet belum di-setup"</td>
                      <td style={{ padding: '0.45rem', color: 'var(--text-secondary)' }}>Ulangi menjalankan fungsi <code>setupSpreadsheet()</code> di editor Google Apps Script Anda untuk membuat tab tabel secara otomatis.</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                      <td style={{ padding: '0.45rem', fontWeight: 700, color: 'var(--danger)', whiteSpace: 'nowrap' }}>Timeout / Lambat</td>
                      <td style={{ padding: '0.45rem', color: 'var(--text-secondary)' }}>Google Apps Script terkadang lambat pada permintaan pertama setelah inaktif. Coba klik tombol uji koneksi kembali.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.15)', borderRadius: '8px', padding: '0.65rem 0.85rem' }}>
              <ShieldAlert size={16} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '0.1rem' }} />
              <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                <strong>Peringatan Keamanan:</strong> Jangan bagikan URL Web App atau Token Keamanan masjid Anda kepada pihak ketiga yang tidak berwenang. Siapa saja yang mengetahui token ini dapat mengubah data spreadsheet masjid Anda.
              </div>
            </div>

          </div>

        </div>

        {/* Footer Modal */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
          <button 
            type="button" 
            onClick={onClose} 
            className="btn btn-secondary"
            style={{ padding: '0.45rem 1rem', minHeight: '34px', fontSize: '0.8rem', borderRadius: '6px' }}
          >
            Tutup Dokumentasi
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
