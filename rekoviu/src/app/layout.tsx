import type { Metadata } from 'next';
import './globals.css';
import { CursorEffect } from '@/components/common/CursorEffect';
import { BackgroundLayer } from '@/components/common/BackgroundLayer';
import { PageLoader } from '@/components/common/PageLoader';

export const metadata: Metadata = {
  title: 'REKOV | Hospital Self-Service Kiosk',
  description: 'KFC-style hospital self-service kiosk. Express check-in, triage, and live queue management.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <PageLoader />
        <CursorEffect />
        <BackgroundLayer />
        <div className="bg-grain"></div>
        <div className="vignette"></div>
        <div id="wm" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '18vw' }}>REKOV</div>
        {children}
      </body>
    </html>
  );
}
