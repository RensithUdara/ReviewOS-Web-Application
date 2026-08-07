import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ReviewOS',
  description: 'Google Business Profile review operating system',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
