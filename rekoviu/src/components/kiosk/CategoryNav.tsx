import React from 'react';
import { Department } from '@/types';

interface CategoryNavProps {
  departments: Department[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const DEPT_SYMBOLS: Record<string, string> = {
  'GEN': '\u2695',
  'CARD': '\u2661',
  'PED': '\u2606',
  'ORTH': '\u2726',
  'RX': '\u271A',
  'EMG': '\u26A0',
};

export const CategoryNav: React.FC<CategoryNavProps> = ({ departments, selectedId, onSelect }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8 }}>
      {departments.map((dep) => {
        const isSelected = selectedId === dep.id;
        const sym = DEPT_SYMBOLS[dep.code] || '\u2695';

        return (
          <button
            key={dep.id}
            onClick={() => onSelect(dep.id)}
            style={{
              padding: '28px 20px', textAlign: 'center', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              background: isSelected ? 'rgba(255,45,85,.08)' : 'rgba(255,255,255,.03)',
              border: `1px solid ${isSelected ? 'rgba(255,45,85,.3)' : 'rgba(255,255,255,.08)'}`,
              transition: 'background .2s, border-color .2s',
              position: 'relative'
            }}
          >
            <span style={{ fontSize: 28, marginBottom: 10, color: isSelected ? '#ff2d55' : 'rgba(255,255,255,.5)' }}>{sym}</span>
            <h3 style={{
              fontFamily: "'Space Grotesk'", fontSize: 14, fontWeight: 700,
              color: isSelected ? '#fff' : 'rgba(255,255,255,.7)', marginBottom: 4
            }}>{dep.name}</h3>
            <p style={{
              fontFamily: "'Space Grotesk'", fontSize: 11,
              color: 'rgba(255,255,255,.3)', lineHeight: 1.4
            }}>{dep.description}</p>
            {dep.wait_time_minutes > 0 && (
              <span style={{
                position: 'absolute', top: 8, right: 8,
                fontFamily: "'Space Grotesk'", fontSize: 9, fontWeight: 700,
                padding: '2px 8px', background: 'rgba(255,255,255,.06)',
                border: '1px solid rgba(255,255,255,.1)', color: 'rgba(255,255,255,.4)'
              }}>
                {dep.wait_time_minutes}m
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
