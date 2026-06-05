import React, { useState } from 'react';
import type { MosqueProgram } from '../utils/storage';
import {
  CalendarCheck,
  PlusCircle,
  Trash2,
  Clock,
  MapPin,
  User,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ProgramManagerProps {
  programs: MosqueProgram[];
  onAdd: (program: MosqueProgram) => void;
  onDelete: (id: string) => void;
  showToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

// Nama hari untuk dropdown pemilihan hari rutin
const DAYS_OF_WEEK = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Ahad'];

// Warna lencana per jenis pengulangan
const RECURRENCE_BADGE: Record<string, { label: string; color: string }> = {
  weekly: { label: 'Mingguan', color: '#10b981' },
  monthly: { label: 'Bulanan', color: '#3b82f6' },
  once: { label: 'Sekali', color: '#8b5cf6' },
};

// Komponen manajemen jadwal program/kegiatan masjid
export const ProgramManager: React.FC<ProgramManagerProps> = ({
  programs,
  onAdd,
  onDelete,
  showToast,
}) => {
  // State form tambah program
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('07:00');
  const [location, setLocation] = useState('');
  const [picName, setPicName] = useState('');
  const [description, setDescription] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<'weekly' | 'monthly'>('weekly');
  const [dayOrDate, setDayOrDate] = useState<string>('Jumat');

  // Reset form ke nilai awal
  const resetForm = () => {
    setTitle('');
    setTime('07:00');
    setLocation('');
    setPicName('');
    setDescription('');
    setIsRecurring(false);
    setRecurrenceType('weekly');
    setDayOrDate('Jumat');
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !location.trim() || !picName.trim()) {
      showToast('Judul, Lokasi, dan Penanggung Jawab harus diisi!', 'error');
      return;
    }

    const newProgram: MosqueProgram = {
      id: `prog_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: title.trim(),
      dayOrDate,
      time,
      location: location.trim(),
      picName: picName.trim(),
      description: description.trim() || undefined,
      isRecurring,
      recurrenceType: isRecurring ? recurrenceType : undefined,
      createdAt: Date.now(),
    };

    onAdd(newProgram);
    showToast(`Program "${title}" berhasil ditambahkan.`, 'success');
    resetForm();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Header dengan tombol tambah */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)', padding: '0.75rem', borderRadius: '12px' }}>
            <CalendarCheck size={28} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Program Masjid</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {programs.length} kegiatan terdaftar
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
          style={{ padding: '0.65rem 1.25rem', gap: '0.4rem' }}
        >
          {showForm ? <ChevronUp size={18} /> : <PlusCircle size={18} />}
          {showForm ? 'Tutup Form' : 'Tambah Program'}
        </button>
      </div>

      {/* Form Tambah Program */}
      {showForm && (
        <div className="glass-card" style={{ textAlign: 'left' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Form Tambah Program Kegiatan</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Judul Kegiatan */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="prog-title">Judul Kegiatan *</label>
              <input
                id="prog-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Cth: Kajian Ahad Pagi, Shalat Jumat"
                className="form-input"
                required
              />
            </div>

            <div className="form-grid-2">
              {/* Waktu */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="prog-time">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Clock size={13} /> Waktu *
                  </span>
                </label>
                <input
                  id="prog-time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              {/* Lokasi */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="prog-location">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <MapPin size={13} /> Lokasi *
                  </span>
                </label>
                <input
                  id="prog-location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Cth: Aula Masjid, Ruang Serbaguna"
                  className="form-input"
                  required
                />
              </div>
            </div>

            {/* Penanggung Jawab */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="prog-pic">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <User size={13} /> Penanggung Jawab *
                </span>
              </label>
              <input
                id="prog-pic"
                type="text"
                value={picName}
                onChange={(e) => setPicName(e.target.value)}
                placeholder="Cth: Ust. Abdullah, Bid. Pembinaan DKM"
                className="form-input"
                required
              />
            </div>

            {/* Jenis Pengulangan */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Jenis Kegiatan</label>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input
                    type="radio"
                    name="recurring"
                    checked={!isRecurring}
                    onChange={() => setIsRecurring(false)}
                  />
                  Kegiatan Sekali
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input
                    type="radio"
                    name="recurring"
                    checked={isRecurring}
                    onChange={() => setIsRecurring(true)}
                  />
                  Kegiatan Rutin
                </label>
              </div>
            </div>

            {/* Pengulangan: Hari atau Tanggal */}
            {isRecurring ? (
              <div className="form-grid-2">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="prog-recurrence-type">Frekuensi</label>
                  <select
                    id="prog-recurrence-type"
                    value={recurrenceType}
                    onChange={(e) => setRecurrenceType(e.target.value as 'weekly' | 'monthly')}
                    className="form-input"
                  >
                    <option value="weekly">Mingguan</option>
                    <option value="monthly">Bulanan</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="prog-day">
                    {recurrenceType === 'weekly' ? 'Hari' : 'Tanggal Ke-'}
                  </label>
                  {recurrenceType === 'weekly' ? (
                    <select
                      id="prog-day"
                      value={dayOrDate}
                      onChange={(e) => setDayOrDate(e.target.value)}
                      className="form-input"
                    >
                      {DAYS_OF_WEEK.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id="prog-day"
                      type="number"
                      min={1}
                      max={28}
                      value={dayOrDate}
                      onChange={(e) => setDayOrDate(e.target.value)}
                      placeholder="Cth: 15"
                      className="form-input"
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="prog-date">Tanggal Kegiatan</label>
                <input
                  id="prog-date"
                  type="date"
                  value={dayOrDate}
                  onChange={(e) => setDayOrDate(e.target.value)}
                  className="form-input"
                />
              </div>
            )}

            {/* Deskripsi */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="prog-desc">Keterangan (Opsional)</label>
              <textarea
                id="prog-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Informasi tambahan tentang kegiatan ini..."
                className="form-input"
                rows={2}
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* Tombol */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '0.75rem' }}>
                <PlusCircle size={16} /> Simpan Program
              </button>
              <button type="button" onClick={resetForm} className="btn btn-secondary" style={{ padding: '0.75rem 1.25rem' }}>
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Daftar Program */}
      {programs.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
          <CalendarCheck size={40} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
          <p style={{ fontSize: '0.9rem' }}>Belum ada program kegiatan yang terdaftar.</p>
          <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Klik "Tambah Program" untuk memulai.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {programs.map((prog) => {
            const recKey = prog.isRecurring ? (prog.recurrenceType ?? 'weekly') : 'once';
            const badge = RECURRENCE_BADGE[recKey];
            const scheduleLabel = prog.isRecurring
              ? `${prog.dayOrDate}, pukul ${prog.time}`
              : `${prog.dayOrDate} · ${prog.time}`;

            return (
              <div key={prog.id} className="glass-card program-card" style={{ textAlign: 'left', position: 'relative' }}>
                {/* Lencana Jenis */}
                <div style={{
                  position: 'absolute', top: '1rem', right: '1rem',
                  background: `${badge.color}22`, color: badge.color,
                  padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: '0.25rem'
                }}>
                  {prog.isRecurring && <RefreshCw size={10} />}
                  {badge.label}
                </div>

                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.6rem', paddingRight: '6rem' }}>
                  {prog.title}
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <Clock size={13} style={{ flexShrink: 0 }} />
                    <span>{scheduleLabel}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <MapPin size={13} style={{ flexShrink: 0 }} />
                    <span>{prog.location}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <User size={13} style={{ flexShrink: 0 }} />
                    <span>{prog.picName}</span>
                  </div>
                </div>

                {prog.description && (
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '0.6rem', marginBottom: '0.75rem' }}>
                    {prog.description}
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Hapus program "${prog.title}"?`)) {
                      onDelete(prog.id);
                    }
                  }}
                  className="btn btn-danger"
                  style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem', marginTop: 'auto' }}
                >
                  <Trash2 size={14} /> Hapus Program
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Catatan expand */}
      {programs.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-secondary)', justifyContent: 'center' }}>
          <ChevronDown size={12} />
          Menampilkan {programs.length} program. Diurutkan dari yang paling baru ditambahkan.
        </div>
      )}
    </div>
  );
};
