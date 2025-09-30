import './globals.css';

// Provide a metadataBase so Next can resolve absolute URLs for open graph / twitter images.
// Use an env var when available so deployments can override it. Fallback to localhost for dev.
export const metadata = {
  title: 'Normativa Hídrica',
  description: 'Explora y compara normativas ambientales por país y dominio',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head />
      <body>
        {children}
      </body>
    </html>
  );
}
