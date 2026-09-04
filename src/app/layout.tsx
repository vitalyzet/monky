import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from '@/lib/AuthContext';
import { ThemeProvider } from '@/lib/ThemeContext';
import { Nunito } from 'next/font/google';

const nunito = Nunito({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-nunito',
});

export const metadata: Metadata = {
  title: 'Tevinde.ro - Anunțuri gratuite auto, moto, imobiliare și locuri de muncă',
  description: 'Peste 500.000 de anunțuri gratuite cu mașini, motociclete, echipamente și multe altele pe Tevinde.ro.',
  openGraph: {
    title: 'Tevinde.ro - Anunțuri de încredere',
    description: 'Platforma ta de anunțuri online cu filtre avansate și livrare prin curier.',
    siteName: 'Tevinde.ro',
    type: 'website',
  },
  icons: {
    icon: '/6ba82cfe-a73d-4741-9f6b-3916424ba990.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ro" className={`dark ${nunito.variable}`} suppressHydrationWarning>
      <body className="bg-[#F2F3F6] dark:bg-[#131417] text-slate-900 dark:text-slate-100 transition-colors duration-200 font-sans" suppressHydrationWarning>
        <AuthProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
