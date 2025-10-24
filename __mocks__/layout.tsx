// Mock for Next.js layout.tsx
// This provides the metadata that SEO tests expect

export const metadata = {
  title: 'Normas Ambientales - Legislación Ambiental Latinoamericana',
  description: 'Plataforma completa para consultar normas ambientales en América Latina. Encuentra legislación sobre agua, calidad del aire, residuos sólidos y vertimientos.',
  keywords: [
    'normas ambientales',
    'legislación ambiental',
    'América Latina',
    'agua',
    'calidad del aire',
    'residuos sólidos',
    'vertimientos',
    'medio ambiente',
    'regulaciones ambientales'
  ],
  authors: [{ name: 'Normas Ambientales Team' }],
  creator: 'Normas Ambientales',
  publisher: 'Normas Ambientales',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://normas-ambientales.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Normas Ambientales - Legislación Ambiental Latinoamericana',
    description: 'Plataforma completa para consultar normas ambientales en América Latina.',
    url: 'https://normas-ambientales.vercel.app',
    siteName: 'Normas Ambientales',
    locale: 'es_ES',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Normas Ambientales - Legislación Ambiental Latinoamericana',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Normas Ambientales - Legislación Ambiental Latinoamericana',
    description: 'Plataforma completa para consultar normas ambientales en América Latina.',
    images: ['/og-image.jpg'],
    creator: '@normasambientales',
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

// Mock React component export
const Layout = () => null;
export default Layout;