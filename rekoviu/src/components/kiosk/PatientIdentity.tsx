import React from 'react';

interface PatientIdentityProps {
  name: string;
  phone: string;
  onChange: (field: 'name' | 'phone', value: string) => void;
}

export const PatientIdentity: React.FC<PatientIdentityProps> = ({ name, phone, onChange }) => {
  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'transparent', fontSize: 20, fontWeight: 700,
    color: 'var(--text-primary)', outline: 'none', border: 'none',
    fontFamily: "'Space Grotesk', sans-serif"
  };

  const fieldWrap: React.CSSProperties = {
    background: 'var(--bg-card)', border: '1px solid var(--border-color)',
    padding: '20px 24px', marginBottom: 16
  };

  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: 32
    }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%', background: 'var(--text-primary)', margin: '0 auto 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <span style={{ fontSize: 24, color: 'var(--bg-main)' }}>{'\u25C8'}</span>
        </div>
        <h2 style={{ fontFamily: "'Bebas Neue'", fontSize: 28, color: 'var(--text-primary)', letterSpacing: '.06em' }}>PATIENT DETAILS</h2>
        <p style={{ fontFamily: "'Space Grotesk'", fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>
          Please enter your information to begin check-in.
        </p>
      </div>

      <div style={fieldWrap}>
        <label style={{ fontFamily: "'Space Grotesk'", fontSize: 11, color: '#ff2d55', display: 'block', marginBottom: 8, letterSpacing: '.1em', textTransform: 'uppercase' }}>Full Name</label>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="e.g. Jane Doe"
            value={name} 
            onChange={e => onChange('name', e.target.value)} 
            style={inputStyle} 
          />
        </div>
      </div>

      <div style={fieldWrap}>
        <label style={{ fontFamily: "'Space Grotesk'", fontSize: 11, color: '#ff2d55', display: 'block', marginBottom: 8, letterSpacing: '.1em', textTransform: 'uppercase' }}>Phone Number</label>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <input 
            type="tel" 
            placeholder="10-digit mobile number"
            value={phone} 
            onChange={e => onChange('phone', e.target.value)} 
            style={inputStyle} 
          />
        </div>
      </div>
      
      <div style={{
        marginTop: 24, padding: 16, border: '1px dashed rgba(255,45,85,.3)', 
        background: 'rgba(255,45,85,.05)', textAlign: 'center', cursor: 'pointer'
      }}>
        <p style={{ fontFamily: "'Space Grotesk'", fontSize: 12, color: '#ff2d55', fontWeight: 700, letterSpacing: '.05em' }}>
          SCAN ABHA CARD (OPTIONAL)
        </p>
      </div>
    </div>
  );
};
