// components/header.tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';

type HeaderProps = {
  showFullNav?: boolean;
}

export default function Header({ showFullNav = true }: HeaderProps) {
  const router = useRouter();
  const { user, signOut, isLoading } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  console.log('Header render state:', { isLoading, hasUser: !!user });

  return (
    <header className="sticky top-0 z-50 bg-gray-800 p-4">
      <nav className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-6">
          {showFullNav ? (
            <>
              <Link href="/" className="text-white text-sm font-medium">
                Home
              </Link>
            </>
          ) : (
            <Link href="/" className="text-white text-sm font-medium">
              ← Back to Home
            </Link>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {!isLoading && user && (
            <>
              <Link
                href="/feed"
                className="text-white text-sm px-4 py-2 rounded bg-[#21C55D] hover:bg-[#1CA54C]"
              >
                Feed
              </Link>
              <Link
                href="/profile"
                className="text-white text-sm px-4 py-2 rounded bg-[#21C55D] hover:bg-[#1CA54C]"
              >
                Profile
              </Link>
              <button
                onClick={handleSignOut}
                className="text-white text-sm px-4 py-2 rounded bg-red-500 hover:bg-red-600 disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? 'Signing out...' : 'Sign Out'}
              </button>
            </>
          )}
          {!isLoading && !user && (
            <Link
              href="/auth/login"
              className="text-white text-sm px-4 py-2 rounded bg-[#21C55D] hover:bg-[#1CA54C]"
            >
              Sign In
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}