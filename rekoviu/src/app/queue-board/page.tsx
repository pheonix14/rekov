'use client';

import React, { useEffect, useState } from 'react';
import { RekovNav } from '@/components/common/RekovNav';
import { StatusBadge } from '@/components/common/StatusBadge';
import { fetchQueueBoard } from '@/services/api';
import { QueueBoardResponse, QueueTicket } from '@/types';

export default function QueueBoardPage() {
  const [boardData, setBoardData] = useState<QueueBoardResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedTicket, setSearchedTicket] = useState<QueueTicket | null>(null);
  const [searchError, setSearchError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchQueueBoard();
      setBoardData(data);
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    setSearchedTicket(null);
    if (!boardData || !searchQuery.trim()) return;
    
    const query = searchQuery.trim().toLowerCase();
    
    // Check now calling
    if (boardData.now_calling?.ticket_id.toLowerCase() === query || boardData.now_calling?.token_number.toLowerCase() === query) {
      setSearchedTicket(boardData.now_calling);
      return;
    }
    
    // Check recently called
    const recent = boardData.recently_called.find(t => t.ticket_id.toLowerCase() === query || t.token_number.toLowerCase() === query);
    if (recent) {
      setSearchedTicket(recent);
      return;
    }
    
    // Check waiting
    const waiting = boardData.waiting_queue.find(t => t.ticket_id.toLowerCase() === query || t.token_number.toLowerCase() === query);
    if (waiting) {
      setSearchedTicket(waiting);
      return;
    }
    
    setSearchError('Ticket not found in active queue.');
  };

  if (!boardData) {
    return (
      <div style={{
        position: 'relative', zIndex: 10, height: '100vh', background: 'var(--bg-main)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{
          width: 48, height: 48, border: '3px solid rgba(255,255,255,.1)',
          borderTopColor: '#ff2d55', borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  const now = boardData.now_calling;

  return (
    <>
      <RekovNav currentModule="queue-board" />
      <main style={{
        position: 'relative', zIndex: 10, height: '100vh',
        display: 'flex', flexDirection: 'column', paddingTop: 80
      }}>
        <div className="rekov-responsive-grid" style={{ flex: 1, margin: 0, gap: 0, overflow: 'hidden' }}>

          {/* Left: NOW CALLING */}
          <div style={{
            flex: 1, flexBasis: '400px', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            borderRight: '1px solid rgba(255,255,255,.06)', padding: 32, textAlign: 'center'
          }}>
            <p style={{
              fontFamily: "'Space Grotesk'", fontSize: 11, letterSpacing: '.3em',
              textTransform: 'uppercase', color: '#ff2d55', marginBottom: 16
            }}>&#9673; NOW CALLING</p>

            {now ? (
              <>
                <h2 style={{
                  fontFamily: "'Bebas Neue'", fontSize: 'clamp(32px, 4vw, 48px)',
                  letterSpacing: '.06em', color: 'var(--text-primary)', lineHeight: 1, marginBottom: 12
                }}>{now.token_number}</h2>
                <p style={{
                  fontFamily: "'Space Grotesk'", fontSize: 18, fontWeight: 700,
                  color: 'rgba(255,255,255,.8)', marginBottom: 6
                }}>{now.patient_name}</p>
                <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                  <StatusBadge type={now.priority_level} />
                  <span style={{
                    fontFamily: "'Space Grotesk'", fontSize: 11, fontWeight: 700,
                    padding: '3px 10px', background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)', color: 'var(--text-primary)'
                  }}>{now.department_name}</span>
                </div>
                <div style={{
                  fontFamily: "'Bebas Neue'", fontSize: 36, color: '#ff2d55',
                  letterSpacing: '.08em', marginTop: 8
                }}>{now.room_number}</div>
                <p style={{
                  fontFamily: "'Space Grotesk'", fontSize: 12, color: 'rgba(255,255,255,.3)',
                  marginTop: 4
                }}>{now.doctor_name}</p>
              </>
            ) : (
              <p style={{
                fontFamily: "'Space Grotesk'", fontSize: 14, color: 'rgba(255,255,255,.25)'
              }}>Waiting for next patient...</p>
            )}
          </div>

          {/* Right: Queue List + Stats */}
          <div style={{ flex: 1, flexBasis: '400px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            {/* Stats Row */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1,
              borderBottom: '1px solid rgba(255,255,255,.06)',
              background: 'rgba(255,255,255,.04)'
            }}>
              <div style={{ padding: 20, borderRight: '1px solid rgba(255,255,255,.06)' }}>
                <p style={{ fontFamily: "'Space Grotesk'", fontSize: 13, color: 'var(--text-secondary)', letterSpacing: '.1em', marginBottom: 4 }}>TOTAL WAITING</p>
                <p style={{ fontFamily: "'Bebas Neue'", fontSize: 36, color: 'var(--text-primary)', letterSpacing: '.04em' }}>{boardData.waiting_queue.length}</p>
              </div>
              <div style={{ padding: 20 }}>
                <p style={{ fontFamily: "'Space Grotesk'", fontSize: 13, color: 'var(--text-secondary)', letterSpacing: '.1em', marginBottom: 4 }}>AVG WAIT</p>
                <p style={{ fontFamily: "'Bebas Neue'", fontSize: 36, color: 'var(--text-primary)', letterSpacing: '.04em' }}>{boardData.average_wait_minutes}<span style={{ fontSize: 18, color: 'var(--text-muted)' }}> min</span></p>
              </div>
            </div>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', padding: '16px 24px', gap: 16 }}>
              <input 
                type="text" 
                placeholder="ENTER TOKEN NUMBER" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value.toUpperCase())}
                style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: 14, outline: 'none', fontFamily: "'Space Grotesk'" }}
              />
              <button type="submit" style={{ background: '#ff2d55', color: '#fff', border: 'none', padding: '6px 12px', fontFamily: "'Space Grotesk'", fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>SEARCH</button>
            </form>

            {/* Waiting List */}
            <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: 16, marginBottom: 16 }}>
                <span style={{ fontFamily: "'Space Grotesk'", fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '.05em' }}>WAITING TO BE CALLED</span>
                <span style={{ fontFamily: "'Space Grotesk'", fontSize: 12, color: 'var(--text-secondary)' }}>UPDATED LIVE</span>
              </div>

              {boardData.waiting_queue.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center' }}>
                  <p style={{ fontFamily: "'Space Grotesk'", fontSize: 13, color: 'rgba(255,255,255,.2)' }}>Queue is empty</p>
                </div>
              ) : (
                boardData.waiting_queue.map((ticket, idx) => (
                  <div key={ticket.ticket_id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,.04)',
                    opacity: idx < 3 ? 1 : 0.5
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{
                        width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: "'Space Grotesk'", fontSize: 14, fontWeight: 700,
                        background: idx === 0 ? 'rgba(255,45,85,.12)' : 'rgba(255,255,255,.04)',
                        color: idx === 0 ? '#ff2d55' : 'rgba(255,255,255,.4)',
                        border: `1px solid ${idx === 0 ? 'rgba(255,45,85,.2)' : 'rgba(255,255,255,.08)'}`
                      }}>{idx + 1}</div>
                      <div>
                        <p style={{ fontFamily: "'Bebas Neue'", fontSize: 22, color: 'var(--text-primary)', letterSpacing: '.04em' }}>{ticket.token_number}</p>
                        <p style={{ fontFamily: "'Space Grotesk'", fontSize: 11, color: 'var(--text-secondary)' }}>{ticket.department_name}</p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontFamily: "'Bebas Neue'", fontSize: 18, color: '#ff2d55' }}>{ticket.room_number || 'WAIT'}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Recently Called */}
            {boardData.recently_called.length > 0 && (
              <div style={{
                borderTop: '1px solid rgba(255,255,255,.06)', padding: '16px 24px',
                flexShrink: 0
              }}>
                <p style={{ fontFamily: "'Space Grotesk'", fontSize: 10, color: 'rgba(255,255,255,.25)', letterSpacing: '.15em', textTransform: 'uppercase', marginBottom: 8 }}>RECENTLY CALLED</p>
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8 }}>
                  {boardData.recently_called.map(t => (
                    <div key={t.ticket_id} style={{
                      padding: '8px 16px', background: 'rgba(255,255,255,.03)',
                      border: '1px solid rgba(255,255,255,.06)', textAlign: 'center', minWidth: 80
                    }}>
                      <p style={{ fontFamily: "'Space Grotesk'", fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.5)' }}>{t.token_number}</p>
                      <p style={{ fontFamily: "'Space Grotesk'", fontSize: 10, color: '#ff2d55' }}>{t.room_number}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Search Result Modal */}
        {(searchedTicket || searchError) && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg-card)', backdropFilter: 'blur(8px)'
          }} onClick={() => { setSearchedTicket(null); setSearchError(''); }}>
            <div style={{
              background: 'var(--bg-main)', border: '1px solid var(--border-color)', padding: 32, maxWidth: 400, width: '100%',
              textAlign: 'center', position: 'relative'
            }} onClick={e => e.stopPropagation()}>
              {searchError ? (
                <>
                  <div style={{ fontSize: 32, marginBottom: 16 }}>{'X'}</div>
                  <h3 style={{ fontFamily: "'Bebas Neue'", fontSize: 24, color: '#ff2d55', marginBottom: 8 }}>NOT FOUND</h3>
                  <p style={{ fontFamily: "'Space Grotesk'", fontSize: 14, color: 'rgba(255,255,255,.6)', marginBottom: 24 }}>{searchError}</p>
                </>
              ) : searchedTicket && (
                <>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)', letterSpacing: '.1em' }}>TOKEN NUMBER</span>
                  <h3 style={{ fontFamily: "'Bebas Neue'", fontSize: 32, color: 'var(--text-primary)', marginBottom: 8 }}>{searchedTicket.token_number}</h3>
                  <p style={{ fontFamily: "'Space Grotesk'", fontSize: 16, fontWeight: 700, color: '#ff2d55', marginBottom: 4 }}>STATUS: {searchedTicket.status.replace('_', ' ')}</p>
                  <p style={{ fontFamily: "'Space Grotesk'", fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>{searchedTicket.patient_name} - {searchedTicket.department_name}</p>
                  <div style={{
                    display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
                    background: 'var(--bg-card)', padding: '12px', border: '1px solid var(--border-color)', marginBottom: 24
                  }}>
                    <span style={{ fontSize: 10, color: 'var(--text-secondary)', letterSpacing: '.1em', marginBottom: 4 }}>ROOM</span>
                    <span style={{ fontFamily: "'Bebas Neue'", fontSize: 28, color: 'var(--text-primary)' }}>{searchedTicket.room_number || 'PENDING'}</span>
                  </div>
                </>
              )}
              <button 
                onClick={() => { setSearchedTicket(null); setSearchError(''); }}
                style={{ width: '100%', padding: '12px', background: '#ff2d55', color: '#fff', border: 'none', fontFamily: "'Space Grotesk'", fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
              >
                CLOSE
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
