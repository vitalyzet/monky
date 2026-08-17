import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Monky - Anunțuri gratuite auto, moto, imobiliare și locuri de muncă',
  description: 'Peste 500.000 de anunțuri gratuite cu mașini, motociclete, echipamente și multe altele pe Monky.',
  openGraph: {
    title: 'Monky - Anunțuri de încredere',
    description: 'Platforma ta de anunțuri online cu filtre avansate și livrare prin curier.',
    siteName: 'Monky',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ro" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
