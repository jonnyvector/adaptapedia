import type { Metadata } from 'next';
import { Sora, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import OnboardingBanner from '@/components/onboarding/OnboardingBanner';
import { AuthProvider } from '@/lib/auth-context';
import { ToastProvider } from '@/lib/toast-context';

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Adaptapedia',
  description: 'Compare books and their movie adaptations - community-powered database of differences',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const saved = localStorage.getItem('adaptapedia-theme');
                if (saved === 'dark' || saved === 'light') {
                  document.documentElement.setAttribute('data-theme', saved);
                } else {
                  // saved is 'system' or null - check system preference
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`flex flex-col min-h-screen ${sora.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
        <ToastProvider>
          <AuthProvider>
            <Header />
            <OnboardingBanner />
            <div className="flex-1 bg-white dark:bg-black">
              {children}
            </div>
            <Footer />
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
