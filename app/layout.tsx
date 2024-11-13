// app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';
import AuthWrapper from '@/components/AuthWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'PodBrah',
  description: 'Your AI-Powered Podcast Twin',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthWrapper>
          {children}
        </AuthWrapper>
      </body>
    </html>
  );
}