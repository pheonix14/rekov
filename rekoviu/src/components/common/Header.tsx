'use client';

import { RekovNav } from './RekovNav';

export function Header({ currentModule }: { currentModule: string }) {
  return <RekovNav currentModule={currentModule} />;
}
