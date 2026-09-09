import React from 'react';
import { Doctor } from '@/types';

interface DoctorCardProps {
  doctor: Doctor;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, isSelected, onSelect }) => {
  return (
    <button
      onClick={() => onSelect(doctor.id)}
      style={{
        width: '100%', display: 'flex', alignItems: 'start', textAlign: 'left',
        padding: '16px 20px', marginBottom: 8, cursor: 'pointer',
        background: isSelected ? 'rgba(255,45,85,.08)' : 'rgba(255,255,255,.03)',
        border: `1px solid ${isSelected ? 'rgba(255,45,85,.3)' : 'rgba(255,255,255,.08)'}`,
        transition: 'background .2s'
      }}
    >
      <div style={{
        width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginRight: 16, flexShrink: 0, fontSize: 22,
        background: isSelected ? 'rgba(255,45,85,.15)' : 'rgba(255,255,255,.05)',
        color: isSelected ? '#ff2d55' : 'rgba(255,255,255,.4)',
        border: `1px solid ${isSelected ? 'rgba(255,45,85,.2)' : 'rgba(255,255,255,.08)'}`
      }}>&#9673;</div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <h4 style={{
          fontFamily: "'Space Grotesk'", fontSize: 14, fontWeight: 700,
          color: isSelected ? '#fff' : 'rgba(255,255,255,.8)', marginBottom: 2,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
        }}>{doctor.name}</h4>
        <p style={{
          fontFamily: "'Space Grotesk'", fontSize: 11, color: '#ff2d55',
          marginBottom: 6
        }}>{doctor.specialty}</p>
        <div style={{ display: 'flex', gap: 16, fontFamily: "'Space Grotesk'", fontSize: 10, color: 'rgba(255,255,255,.35)' }}>
          <span>Wait: {doctor.estimated_wait_minutes}m</span>
          <span>{doctor.room_number}</span>
          <span>Rating: {doctor.rating}</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', marginLeft: 8 }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: doctor.is_available ? '#fff' : '#ff2d55'
        }} />
        <span style={{
          fontFamily: "'Space Grotesk'", fontSize: 14, fontWeight: 700,
          color: '#fff', marginTop: 12
        }}>${doctor.consultation_fee}</span>
      </div>
    </button>
  );
};
