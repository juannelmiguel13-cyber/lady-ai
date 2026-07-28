import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Lady IA — Nutrición Clínica Inteligente',
  description:
    'Plataforma de nutrición clínica con inteligencia artificial. Genera dietas personalizadas basadas en tu perfil biométrico y condiciones médicas.',
  keywords: ['nutrición', 'IA', 'dieta', 'salud', 'medicina', 'nutrición clínica'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(24, 24, 27, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#fafafa',
              backdropFilter: 'blur(12px)',
            },
          }}
          richColors
        />
        {children}
      </body>
    </html>
  );
}
