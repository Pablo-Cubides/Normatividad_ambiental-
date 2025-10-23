import type { Metadata } from 'next';
import './globals.css';
import ErrorBoundary from '@/components/ErrorBoundary';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Normatividad Ambiental Internacional | Consulta Estándares por País',
    template: '%s | Normatividad Ambiental'
  },
  description: 'Plataforma educativa para consultar y comparar normatividad ambiental de agua, aire, residuos y vertimientos en 10 países. Datos oficiales actualizados de Colombia, México, Perú, Chile, Argentina, Brasil, Estados Unidos y más.',
  keywords: [
    'normatividad ambiental',
    'estándares ambientales',
    'calidad del agua',
    'calidad del aire',
    'residuos sólidos',
    'vertimientos',
    'legislación ambiental',
    'normas ambientales',
    'agua potable',
    'contaminación',
    'Colombia',
    'México',
    'Perú',
    'Chile',
    'Argentina',
    'Brasil',
    'Estados Unidos',
  ],
  authors: [{ name: 'Pablo Cubides' }],
  creator: 'Pablo Cubides',
  publisher: 'Tu Empresa',
  
  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: baseUrl,
    title: 'Normatividad Ambiental Internacional',
    description: 'Consulta y compara estándares ambientales de agua, aire, residuos y vertimientos en 10 países de América y Europa.',
    siteName: 'Normatividad Ambiental',
    images: [
      {
        url: `${baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Normatividad Ambiental - Plataforma de Consulta de Estándares',
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'Normatividad Ambiental Internacional',
    description: 'Consulta estándares ambientales de agua, aire, residuos y vertimientos por país.',
    images: [`${baseUrl}/og-image.png`],
    creator: '@tuusuario', // Cambiar por tu usuario de Twitter
  },

  // Robots
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

  // Iconos y manifiestos
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },

  // Verificación
  verification: {
    google: '', // Agregar código de Google Search Console
    // yandex: '',
    // bing: '',
  },

  // Otros metadatos
  category: 'education',
  classification: 'Environmental Standards Database',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
