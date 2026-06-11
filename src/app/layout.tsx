import type { Metadata } from 'next';
import { IBM_Plex_Sans_Arabic, Montserrat } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/AppContext';

const ibmPlex = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-ibm-plex',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['700', '800', '900'],
  style: ['normal', 'italic'],
  variable: '--font-montserrat',
});

export const metadata: Metadata = {
  title: 'Hakim TV - Next.js',
  description: 'Professional TV Streaming Application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${ibmPlex.className} selection:bg-purple-600 selection:text-white`} suppressHydrationWarning>
        <AppProvider>
          <div id="app-container">
            {children}
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
