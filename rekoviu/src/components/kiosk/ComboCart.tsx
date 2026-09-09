import React from 'react';
import { HealthComboPackage } from '@/types';

interface ComboCartProps {
  combos: HealthComboPackage[];
  selectedComboIds: string[];
  onToggleCombo: (id: string) => void;
  baseFee: number;
}

export const ComboCart: React.FC<ComboCartProps> = ({ combos, selectedComboIds, onToggleCombo, baseFee }) => {
  const selectedCombos = combos.filter(c => selectedComboIds.includes(c.id));
  const comboTotal = selectedCombos.reduce((sum, c) => sum + c.price, 0);
  const grandTotal = baseFee + comboTotal;

  return (
    <div style={{
      background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.08)',
      display: 'flex', flexDirection: 'column', height: 480, overflow: 'hidden'
    }}>
      <div style={{
        padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,.06)',
        background: 'rgba(255,255,255,.03)'
      }}>
        <h2 style={{ fontFamily: "'Space Grotesk'", fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: '.05em' }}>
          DIAGNOSTIC ADD-ONS
        </h2>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
        {combos.map((combo) => {
          const isSelected = selectedComboIds.includes(combo.id);
          return (
            <div
              key={combo.id}
              onClick={() => onToggleCombo(combo.id)}
              style={{
                padding: '14px 16px', marginBottom: 8, cursor: 'pointer',
                display: 'flex', alignItems: 'start',
                background: isSelected ? 'rgba(255,45,85,.06)' : 'rgba(255,255,255,.02)',
                border: `1px solid ${isSelected ? 'rgba(255,45,85,.2)' : 'rgba(255,255,255,.06)'}`,
                transition: 'background .2s'
              }}
            >
              <div style={{
                width: 20, height: 20, borderRadius: '50%', marginRight: 12, marginTop: 2,
                border: `2px solid ${isSelected ? '#ff2d55' : 'rgba(255,255,255,.2)'}`,
                background: isSelected ? '#ff2d55' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, color: '#fff', flexShrink: 0
              }}>
                {isSelected ? '\u2713' : ''}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <h4 style={{ fontFamily: "'Space Grotesk'", fontSize: 12, fontWeight: 700, color: isSelected ? '#fff' : 'rgba(255,255,255,.7)' }}>
                    {combo.title}
                  </h4>
                  <span style={{ fontFamily: "'Space Grotesk'", fontSize: 12, fontWeight: 700, color: '#ff2d55', marginLeft: 8 }}>${combo.price}</span>
                </div>
                <p style={{ fontFamily: "'Space Grotesk'", fontSize: 10, color: 'rgba(255,255,255,.3)', lineHeight: 1.4, marginBottom: 6 }}>{combo.description}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {combo.included_tests.map((test, idx) => (
                    <span key={idx} style={{
                      fontFamily: "'Space Grotesk'", fontSize: 9, padding: '2px 6px',
                      background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)',
                      color: 'rgba(255,255,255,.4)'
                    }}>{test}</span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ padding: 20, borderTop: '1px solid rgba(255,255,255,.06)', background: 'rgba(0,0,0,.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Space Grotesk'", fontSize: 12, color: 'rgba(255,255,255,.35)', marginBottom: 6 }}>
          <span>Base Fee</span><span>${baseFee.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Space Grotesk'", fontSize: 12, color: 'rgba(255,255,255,.35)', marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,.06)' }}>
          <span>Add-ons</span><span>${comboTotal.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: "'Space Grotesk'", fontSize: 14, fontWeight: 700, color: '#fff' }}>Total</span>
          <span style={{ fontFamily: "'Bebas Neue'", fontSize: 28, color: '#ff2d55', letterSpacing: '.04em' }}>${grandTotal.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};
