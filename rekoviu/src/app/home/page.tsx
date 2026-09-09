'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RekovNav } from '@/components/common/RekovNav';
import { useLanguage } from '@/contexts/LanguageContext';

const FEATURE_SLIDES = [
  {
    title: 'Express Check-In',
    desc: 'Walk in, tap the screen, select a department and doctor. Token issued in under 60 seconds.',
  },
  {
    title: 'Smart Triage Scoring',
    desc: 'Enter vitals at the kiosk. Emergency cases are automatically bumped to priority queue.',
  },
  {
    title: 'Live Queue Board',
    desc: 'Waiting room TV displays live token status. Audio call when your token is next.',
  },
  {
    title: 'Health Combo Packages',
    desc: 'Add lab tests and screening combos at check-in. Pre-bundled for speed.',
  },
  {
    title: 'Offline-First Database',
    desc: 'System works without internet. Syncs to cloud the moment connectivity returns.',
  },
];

export default function Home() {
  const router = useRouter();
  const { t } = useLanguage();
  const [slideIdx, setSlideIdx] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognitionInstance, setRecognitionInstance] = useState<any>(null);

  const prevSlide = () => setSlideIdx(i => (i - 1 + FEATURE_SLIDES.length) % FEATURE_SLIDES.length);
  const nextSlide = () => setSlideIdx(i => (i + 1) % FEATURE_SLIDES.length);

  const startVoice = async () => {
    if (isListening) {
      setIsListening(false);
      if (recognitionInstance) {
        recognitionInstance.stop();
      }
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("Browser does not support real-time speech recognition. Try Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript(t('listening'));
    };

    let finalFinalTranscript = '';

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      finalFinalTranscript += finalTranscript;
      setTranscript(finalFinalTranscript || interimTranscript);
    };

    recognition.onend = async () => {
      setIsListening(false);
      if (finalFinalTranscript && finalFinalTranscript !== t('listening')) {
        setTranscript(`${t('processing')}: "${finalFinalTranscript}"`);
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || `http://${window.location.hostname}:8000`;
          const res = await fetch(`${apiUrl}/api/v1/kiosk/voice-intent`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: finalFinalTranscript })
          });
          
          const data = await res.json();
          if (res.ok && data.department_id) {
            setTranscript(`${t('understood')}: "${data.raw_text}"`);
            localStorage.setItem('voice_intent_dept', data.department_id);
            setTimeout(() => router.push('/kiosk'), 1500);
          } else {
            setTranscript(t('network_error'));
            setTimeout(() => setTranscript(''), 3000);
          }
        } catch (err) {
          setTranscript(t('network_error'));
          setTimeout(() => setTranscript(''), 3000);
        }
      } else {
        setTranscript('');
      }
    };

    try {
      setRecognitionInstance(recognition);
      recognition.start();
    } catch (e) {
      console.error(e);
      alert('Microphone access denied or error starting recognition.');
    }
  };

  return (
    <>
      <RekovNav currentModule="home" />

      <main style={{
        position: 'relative', zIndex: 10, minHeight: '100vh',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        alignItems: 'center', padding: '100px 24px 100px', textAlign: 'center'
      }}>

        {/* Logo + Tagline */}
        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 'clamp(48px, 10vw, 100px)',
          letterSpacing: '.08em', color: 'var(--text-primary)', lineHeight: 1, marginBottom: 8
        }}>
          REKOV
        </h1>
        <p style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 13, letterSpacing: '.2em', textTransform: 'uppercase',
          color: 'var(--text-secondary)', marginBottom: 48
        }}>
          {t('hospital_system')}
        </p>

        {/* Main Action Cards */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16, width: '100%', maxWidth: 800, marginBottom: 48
        }}>
          {/* Card 1: Kiosk */}
          <Link href="/kiosk" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '36px 24px', background: 'var(--bg-card)',
            border: '1px solid var(--border-color)', textDecoration: 'none',
            transition: 'background .2s, border-color .2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,45,85,.12)'; e.currentTarget.style.borderColor = '#ff2d55' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.borderColor = 'var(--border-color)' }}
          >
            <span style={{ fontSize: 28, color: '#ff2d55', marginBottom: 12 }}>&#9672;</span>
            <span style={{
              fontFamily: "'Bebas Neue', sans-serif", fontSize: 22,
              letterSpacing: '.1em', color: 'var(--text-primary)'
            }}>{t('check_in')}</span>
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif", fontSize: 11,
              color: 'var(--text-secondary)', marginTop: 8, letterSpacing: '.05em'
            }}>{t('manual_entry')}</span>
          </Link>

          {/* Card 2: Status */}
          <Link href="/status" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '36px 24px', background: 'var(--bg-card)',
            border: '1px solid var(--border-color)', textDecoration: 'none',
            transition: 'background .2s, border-color .2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.borderColor = 'var(--text-primary)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.borderColor = 'var(--border-color)' }}
          >
            <span style={{ fontSize: 28, color: 'var(--text-primary)', marginBottom: 12 }}>&#9678;</span>
            <span style={{
              fontFamily: "'Bebas Neue', sans-serif", fontSize: 22,
              letterSpacing: '.1em', color: 'var(--text-primary)'
            }}>{t('status_check')}</span>
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif", fontSize: 11,
              color: 'var(--text-secondary)', marginTop: 8, letterSpacing: '.05em'
            }}>{t('token_lookup')}</span>
          </Link>

          {/* Card 3: Schedules */}
          <Link href="/schedules" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '36px 24px', background: 'var(--bg-card)',
            border: '1px solid var(--border-color)', textDecoration: 'none',
            transition: 'background .2s, border-color .2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.borderColor = 'var(--text-primary)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.borderColor = 'var(--border-color)' }}
          >
            <span style={{ fontSize: 28, color: 'var(--text-primary)', marginBottom: 12 }}>&#9638;</span>
            <span style={{
              fontFamily: "'Bebas Neue', sans-serif", fontSize: 22,
              letterSpacing: '.1em', color: 'var(--text-primary)'
            }}>{t('schedules')}</span>
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif", fontSize: 11,
              color: 'var(--text-secondary)', marginTop: 8, letterSpacing: '.05em'
            }}>{t('doctor_timings')}</span>
          </Link>
        </div>

        {/* Feature Slides */}
        <div style={{
          width: '100%', maxWidth: 500, position: 'relative',
          background: 'var(--bg-card)', border: '1px solid var(--border-color)',
          padding: '28px 48px', minHeight: 100
        }}>
          <button onClick={prevSlide} style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', color: 'var(--text-secondary)',
            fontSize: 20, cursor: 'pointer', padding: 4
          }}>&#8249;</button>

          <div style={{ textAlign: 'center' }}>
            <p style={{
              fontFamily: "'Space Grotesk', sans-serif", fontSize: 14,
              fontWeight: 700, color: '#ff2d55', letterSpacing: '.05em', marginBottom: 6
            }}>{FEATURE_SLIDES[slideIdx].title}</p>
            <p style={{
              fontFamily: "'Space Grotesk', sans-serif", fontSize: 12,
              color: 'var(--text-secondary)', lineHeight: 1.6
            }}>{FEATURE_SLIDES[slideIdx].desc}</p>
          </div>

          <button onClick={nextSlide} style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', color: 'var(--text-secondary)',
            fontSize: 20, cursor: 'pointer', padding: 4
          }}>&#8250;</button>
        </div>

        {/* Dots */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          {FEATURE_SLIDES.map((_, i) => (
            <button key={i} onClick={() => setSlideIdx(i)} style={{
              width: i === slideIdx ? 24 : 8, height: 4, borderRadius: 2,
              background: i === slideIdx ? '#ff2d55' : 'var(--border-color)',
              border: 'none', cursor: 'pointer', transition: 'width .3s, background .3s'
            }} />
          ))}
        </div>

        {/* Floating Voice Button */}
        <div style={{ position: 'fixed', bottom: 60, left: '50%', transform: 'translateX(-50%)', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <button onClick={startVoice} style={{
            width: 56, height: 56, borderRadius: '50%',
            background: isListening ? '#ff2d55' : 'var(--bg-card)',
            border: `1px solid ${isListening ? '#ff2d55' : 'var(--border-color)'}`,
            color: isListening ? '#fff' : 'var(--text-primary)',
            cursor: 'pointer', outline: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: isListening ? '0 0 24px rgba(255,45,85,0.5)' : '0 4px 16px rgba(0,0,0,0.3)',
            transition: 'all .3s ease',
            backdropFilter: 'blur(12px)'
          }}>
             <span style={{ animation: isListening ? 'pulse 1.5s infinite' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               {isListening ? (
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                   <rect x="9" y="2" width="6" height="11" rx="3"></rect>
                   <path d="M5 10v2a7 7 0 0 0 14 0v-2"></path>
                   <line x1="12" y1="19" x2="12" y2="22"></line>
                   <line x1="8" y1="22" x2="16" y2="22"></line>
                 </svg>
               ) : (
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                   <rect x="9" y="2" width="6" height="11" rx="3"></rect>
                   <path d="M5 10v2a7 7 0 0 0 14 0v-2"></path>
                   <line x1="12" y1="19" x2="12" y2="22"></line>
                   <line x1="8" y1="22" x2="16" y2="22"></line>
                 </svg>
               )}
             </span>
          </button>
          {transcript && (
             <div style={{ 
               position: 'absolute', top: '100%', marginTop: 16,
               background: 'var(--bg-card)', color: 'var(--text-primary)', padding: '10px 20px', 
               borderRadius: 24, fontSize: 14, fontFamily: "'Space Grotesk'", 
               backdropFilter: 'blur(10px)', border: '1px solid var(--border-color)', 
               width: 'max-content', maxWidth: 320, textAlign: 'center', animation: 'fadeIn 0.2s', boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
             }}>
                {transcript}
             </div>
          )}
        </div>

        {/* Bottom bar */}
        <div style={{
          position: 'absolute', bottom: 24, left: 0, right: 0,
          display: 'flex', justifyContent: 'center'
        }}>
          <p style={{
            fontFamily: "'Space Grotesk', sans-serif", fontSize: 10,
            color: 'var(--text-muted)', letterSpacing: '.1em'
          }}>&#169; 2025 REKOV SYSTEMS</p>
        </div>
      </main>
    </>
  );
}
