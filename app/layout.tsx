import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { ConsentBanner } from '@/components/ConsentBanner';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Dealio.sk - Kúp. Predaj. Dohodni.',
  description: 'Slovenský marketplace pre nehnuteľnosti a automobily',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sk" suppressHydrationWarning>
      <head>
        <Script
          id="gtag-base"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7204460641314366"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <ThemeProvider attribute="class" defaultTheme="light">
          <AuthProvider>
            {children}
            <Toaster />
            <ConsentBanner />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
