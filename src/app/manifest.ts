import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Tevinde.ro - Anunțuri Gratuite România',
    short_name: 'Tevinde.ro',
    description: 'Platformă modernă de anunțuri gratuite auto, moto, imobiliare, tehnologie și servicii în România.',
    start_url: '/',
    display: 'standalone',
    background_color: '#131417',
    theme_color: '#03c1a2',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/logo.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
