import React from 'react';
import { Building2, Phone } from 'lucide-react';

interface SettingsIdentitySectionProps {
  mosqueName: string;
  setMosqueName: (v: string) => void;
  dkmName: string;
  setDkmName: (v: string) => void;
  contactNumber: string;
  setContactNumber: (v: string) => void;
}

export const SettingsIdentitySection: React.FC<SettingsIdentitySectionProps> = ({
  mosqueName,
  setMosqueName,
  dkmName,
  setDkmName,
  contactNumber,
  setContactNumber,
}) => {
  return (
    <div className="glass-card mobile-flat" style={{ textAlign: 'left', padding: '0.85rem 1rem' }}>
      <h3 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <Building2 size={15} style={{ color: 'var(--primary)' }} />
        Identitas Masjid
      </h3>

      <div className="form-grid-2">
        <div className="form-group">
          <label className="form-label" htmlFor="setting-mosque-name">Nama Masjid *</label>
          <input
            id="setting-mosque-name"
            type="text"
            value={mosqueName}
            onChange={(e) => setMosqueName(e.target.value)}
            placeholder="Cth: Masjid Al-Ikhlas"
            className="form-input"
            style={{ minHeight: '36px', padding: '0.45rem 0.65rem', fontSize: '0.85rem' }}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="setting-dkm-name">Nama Organisasi DKM</label>
          <input
            id="setting-dkm-name"
            type="text"
            value={dkmName}
            onChange={(e) => setDkmName(e.target.value)}
            placeholder="Cth: DKM Al-Ikhlas"
            className="form-input"
            style={{ minHeight: '36px', padding: '0.45rem 0.65rem', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label" htmlFor="setting-contact">
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <Phone size={12} /> Kontak Pengurus (Opsional)
          </span>
        </label>
        <input
          id="setting-contact"
          type="tel"
          value={contactNumber}
          onChange={(e) => setContactNumber(e.target.value)}
          placeholder="Cth: 0812-3456-7890"
          className="form-input"
          style={{ minHeight: '36px', padding: '0.45rem 0.65rem', fontSize: '0.85rem' }}
        />
      </div>
    </div>
  );
};
