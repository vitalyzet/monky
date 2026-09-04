import './globals.css';
import type { Metadata, Viewport } from 'next';
import { AuthProvider } from '@/lib/AuthContext';
import { ThemeProvider } from '@/lib/ThemeContext';
import { BottomNav } from '@/components/BottomNav';
import { Nunito } from 'next/font/google';

const nunito = Nunito({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-nunito',
});

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#131417' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://tevinde.ro'),
  title: {
    default: 'Tevinde.ro - Anunțuri gratuite auto, moto, imobiliare și locuri de muncă',
    template: '%s | Tevinde.ro',
  },
  description: 'Descoperă mii de anunțuri gratuite din toată România pe Tevinde.ro: autoturisme rulate, motociclete, apartamente, telefoane, locuri de muncă și servicii. Publică anunț gratuit în 30 de secunde!',
  keywords: [
    'anunturi gratuite',
    'anunturi auto romania',
    'masini de vanzare',
    'autoturisme second hand',
    'audi vanzare',
    'bmw vanzare',
    'volkswagen vanzare',
    'imobiliare bucuresti',
    'apartamente de vanzare',
    'motociclete de vanzare',
    'tevinde',
    'tevinde.ro',
    'locuri de munca',
    'electronice second hand',
    'cumparaturi online romania',
  ],
  authors: [{ name: 'Tevinde.ro' }],
  creator: 'Tevinde.ro',
  publisher: 'Tevinde.ro',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ro_RO',
    url: 'https://tevinde.ro',
    siteName: 'Tevinde.ro',
    title: 'Tevinde.ro - Anunțuri gratuite auto, moto, imobiliare și locuri de muncă',
    description: 'Platforma ta modernă de anunțuri online cu filtre avansate, hartă GPS, fotografii HD și contact direct cu vânzătorii.',
    images: [
      {
        url: '/tevinde-logo-thumb.png',
        width: 1200,
        height: 630,
        alt: 'Tevinde.ro - Anunțuri Gratuite',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tevinde.ro - Anunțuri gratuite în România',
    description: 'Cumpără și vinde rapid autoturisme, imobiliare, telefoane și multe altele pe Tevinde.ro.',
    images: ['/tevinde-logo-thumb.png'],
  },
  icons: {
    icon: [
      { url: '/6ba82cfe-a73d-4741-9f6b-3916424ba990.png' },
      { url: '/logo.svg', type: 'image/svg+xml' },
    ],
    apple: '/6ba82cfe-a73d-4741-9f6b-3916424ba990.png',
  },
  category: 'classifieds',
};

const jsonLdWebSite = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Tevinde.ro',
  alternateName: ['Tevinde', 'Tevinde Romania'],
  url: 'https://tevinde.ro',
  description: 'Anunțuri gratuite din România cu autoturisme, imobiliare, tehnologie și locuri de muncă.',
  inLanguage: 'ro-RO',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://tevinde.ro/cautare?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
};

const jsonLdOrganization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Tevinde.ro',
  url: 'https://tevinde.ro',
  logo: 'https://tevinde.ro/6ba82cfe-a73d-4741-9f6b-3916424ba990.png',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    availableLanguage: ['Romanian', 'English', 'Spanish'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ro" className={`dark ${nunito.variable}`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
        />
      </head>
      <body className="bg-[#F2F3F6] dark:bg-[#131417] text-slate-900 dark:text-slate-100 transition-colors duration-200 font-sans" suppressHydrationWarning>
        <AuthProvider>
          <ThemeProvider>
            {children}
            <BottomNav />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
