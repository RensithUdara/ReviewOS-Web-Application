import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Review Maintain',
  description: 'Google Business Profile review management dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
