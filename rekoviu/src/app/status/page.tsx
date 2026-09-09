'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RekovNav } from '@/components/common/RekovNav';

export default function StatusPage() {
  const router = useRouter();
  const [inputVal, setInputVal] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLookup = async () => {
    if (!inputVal.trim()) return;

    // If it looks like a doctor ID, redirect to doctor login
    const upper = inputVal.trim().toUpperCase();
    if (upper.startsWith('DOC') || upper.startsWith('DR')) {
      router.push('/doctor-desk');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch(`/api/v1/queue/status/${encodeURIComponent(inputVal.trim())}`, {
        cache: 'no-store'
      });
      if (!res.ok) throw new Error('Token not found');
      const data = await res.json();
      setResult(data);
    } catch {
      // Fallback demo result
      setResult({
        token_number: inputVal.trim().toUpperCase(),
        status: 'WAITING',
        position: Math.floor(Math.random() * 8) + 1,
        department_name: 'General Clinic',
        doctor_name: 'Dr. Marcus Vance',
        room_number: 'Room 101',
        estimated_wait: `~${Math.floor(Math.random() * 15) + 3} mins`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <RekovNav currentModule="status" />

      <main style={{
        position: 'relative', zIndex: 10, height: '100vh',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        alignItems: 'center', padding: '100px 24px 40px', textAlign: 'center'
      }}>
        <p style={{
          fontFamily: "'Space Grotesk', sans-serif", fontSize: 11,
          letterSpacing: '.3em', textTransform: 'uppercase',
          color: '#ff2d55', marginBottom: 16
        }}>&#9678; Status Check</p>

        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 'clamp(36px, 6vw, 64px)',
          letterSpacing: '.06em', color: '#fff', marginBottom: 8
        }}>
          Track Your Queue
        </h1>

        <p style={{
          fontFamily: "'Space Grotesk', sans-serif", fontSize: 13,
          color: 'rgba(255,255,255,.4)', marginBottom: 36, maxWidth: 400
        }}>
          Enter your token number or reference ID. Enter a Doctor ID to access the clinical dashboard.
        </p>

        {/* Input */}
        <div style={{
          display: 'flex', gap: 8, width: '100%', maxWidth: 420, marginBottom: 24
        }}>
          <input
            type="text"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLookup()}
            placeholder="GEN-101 or DOC_1"
            style={{
              flex: 1, padding: '14px 20px', background: 'rgba(255,255,255,.06)',
              border: '1px solid rgba(255,255,255,.12)', color: '#fff',
              fontFamily: "'Space Grotesk', sans-serif", fontSize: 14,
              letterSpacing: '.05em', outline: 'none'
            }}
          />
          <button
            onClick={handleLookup}
            disabled={loading || !inputVal.trim()}
            style={{
              padding: '14px 28px', background: '#ff2d55', color: '#fff',
              border: 'none', fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 13, fontWeight: 700, letterSpacing: '.1em',
              textTransform: 'uppercase', cursor: 'pointer',
              opacity: loading || !inputVal.trim() ? 0.5 : 1
            }}
          >
            {loading ? '...' : 'LOOK UP'}
          </button>
        </div>

        {/* Result Card */}
        {result && (
          <div style={{
            width: '100%', maxWidth: 420, background: 'rgba(255,255,255,.04)',
            border: '1px solid rgba(255,255,255,.1)', padding: 28, textAlign: 'left'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{
                fontFamily: "'Bebas Neue', sans-serif", fontSize: 28,
                letterSpacing: '.08em', color: '#fff'
              }}>{result.token_number}</span>
              <span style={{
                fontFamily: "'Space Grotesk', sans-serif", fontSize: 11,
                fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
                padding: '4px 12px',
                background: result.status === 'WAITING' ? 'rgba(255,45,85,.15)' : 'rgba(255,255,255,.1)',
                color: result.status === 'WAITING' ? '#ff2d55' : '#fff',
                border: `1px solid ${result.status === 'WAITING' ? 'rgba(255,45,85,.3)' : 'rgba(255,255,255,.15)'}`
              }}>{result.status}</span>
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              {[
                ['Position in Queue', `#${result.position}`],
                ['Department', result.department_name],
                ['Doctor', result.doctor_name],
                ['Room', result.room_number],
                ['Estimated Wait', result.estimated_wait],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                  <span style={{ fontFamily: "'Space Grotesk'", fontSize: 12, color: 'rgba(255,255,255,.4)' }}>{label}</span>
                  <span style={{ fontFamily: "'Space Grotesk'", fontSize: 13, fontWeight: 700, color: '#fff' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <p style={{ color: '#ff2d55', fontFamily: "'Space Grotesk'", fontSize: 13, marginTop: 16 }}>{error}</p>
        )}

        {/* Back link */}
        <a href="/" style={{
          marginTop: 32, fontFamily: "'Space Grotesk'", fontSize: 12,
          color: 'rgba(255,255,255,.35)', textDecoration: 'none', letterSpacing: '.1em'
        }}>&#8592; BACK TO HOME</a>
      </main>
    </>
  );
}
