import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { WalletProvider } from '@/components/providers/wallet-provider';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SplitSquads - Rewards-Sharing Social Staking on Solana',
  description: 'Join squads, stake $SPLIT tokens, and earn rewards based on your contribution and activity. Built on Solana.',
  keywords: ['solana', 'defi', 'staking', 'rewards', 'social', 'crypto'],
  authors: [{ name: 'SplitSquads Team' }],
  creator: 'SplitSquads',
  publisher: 'SplitSquads',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://splitsquads.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://splitsquads.com',
    siteName: 'SplitSquads',
    title: 'SplitSquads - Rewards-Sharing Social Staking',
    description: 'Join squads, stake $SPLIT tokens, and earn rewards based on your contribution and activity.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SplitSquads',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SplitSquads - Rewards-Sharing Social Staking',
    description: 'Join squads, stake $SPLIT tokens, and earn rewards based on your contribution and activity.',
    images: ['/og-image.png'],
    creator: '@splitsquads',
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
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <style dangerouslySetInnerHTML={{
          __html: `
            .wallet-adapter-button {
              background-color: #4EF2C4 !important;
              color: #0A0F14 !important;
              border-radius: 0.5rem !important;
              font-weight: 500 !important;
              transition: all 0.2s !important;
              border: none !important;
            }
            
            .wallet-adapter-button:hover {
              background-color: rgba(78, 242, 196, 0.9) !important;
              transform: scale(1.05) !important;
              box-shadow: 0 0 20px rgba(78, 242, 196, 0.3) !important;
            }
            
            .wallet-adapter-button:active {
              transform: scale(0.98) !important;
            }
            
            .wallet-adapter-dropdown {
              background-color: rgba(255, 255, 255, 0.08) !important;
              backdrop-filter: blur(24px) !important;
              border: 1px solid rgba(255, 255, 255, 0.15) !important;
              border-radius: 0.75rem !important;
            }
            
            .wallet-adapter-dropdown-list-item {
              background-color: transparent !important;
              color: white !important;
            }
            
            .wallet-adapter-dropdown-list-item:hover {
              background-color: rgba(255, 255, 255, 0.1) !important;
            }
          `
        }} />
      </head>
      <body className={inter.className}>
        <WalletProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </WalletProvider>
      </body>
    </html>
  );
}