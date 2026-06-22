import type { ReactNode } from 'react';

// Root layout is required for the app/not-found.tsx to work.
// The [locale]/layout.tsx provides the actual <html> and <body> structure.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children as never;
}
