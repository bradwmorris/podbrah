// pages/auth/login/page.tsx
'use client';

import LoginForm from '@/components/auth/LoginForm';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Header from '@/components/header';

export default function LoginPage() {
  const { user, profileCompleted } = useAuth();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background text-white flex flex-col">
      <Header showFullNav={false} />
      <div className="flex items-center justify-center flex-1 p-4 sm:p-6 md:p-8">
        {/* Removed the onSuccess prop */}
        <LoginForm />
      </div>
    </div>
  );
}
