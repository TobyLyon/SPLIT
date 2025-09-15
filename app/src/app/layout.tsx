import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { WalletProvider } from '@/components/providers/wallet-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { NotificationContainer } from '@/components/ui/notifications';
import '@/styles/globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SPLIT - SocialFi Staking Game',
  description: 'The ultimate SocialFi staking game. Choose Split or Steal daily, build streaks, and compete with your squad on Solana.',
  keywords: ['solana', 'defi', 'staking', 'socialfi', 'game', 'split', 'steal', 'crypto'],
  authors: [{ name: 'SPLIT Team' }],
  creator: 'SPLIT',
  publisher: 'SPLIT',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://split.game'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://split.game',
    siteName: 'SPLIT',
    title: 'SPLIT - SocialFi Staking Game',
    description: 'The ultimate SocialFi staking game. Choose Split or Steal daily, build streaks, and compete with your squad.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SPLIT - SocialFi Staking Game',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SPLIT - SocialFi Staking Game',
    description: 'The ultimate SocialFi staking game. Choose Split or Steal daily, build streaks, and compete with your squad.',
    images: ['/og-image.png'],
    creator: '@splitgame',
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans`}>
        <QueryProvider>
          <WalletProvider>
            <div className="min-h-screen flex flex-col bg-bg text-ink">
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
            <NotificationContainer />
          </WalletProvider>
        </QueryProvider>
      </body>
    </html>
  );
}