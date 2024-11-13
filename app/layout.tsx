// app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';
import AuthWrapper from '@/components/AuthWrapper'; // Ensure correct path

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Sir H.C. Waif',
  description: 'Collective Augmented Intelligence',
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
