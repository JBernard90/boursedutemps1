import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { UserProvider } from '@/components/UserProvider';
import { Metadata } from 'next';

// Root layout for Bourse du Temps
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-heading',
});

export const metadata: Metadata = {
  title: 'Bourse du Temps',
  description: 'Échangez vos talents, apprenez gratuitement et construisez l\'avenir au sein de notre banque de temps solidaire.',
  keywords: ['bourse du temps', 'université senghor', 'échange de services', 'crédits temps', 'solidarité'],
    title: 'Bourse du Temps',
    description: 'Échangez vos talents, apprenez gratuitement et construisez l\'avenir au sein de notre banque de temps solidaire.',
    url: 'https://boursedutemps.vercel.app',
    siteName: 'Bourse du Temps',
    locale: 'fr_FR',
    type: 'website',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="font-sans antialiased">
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  )
}
