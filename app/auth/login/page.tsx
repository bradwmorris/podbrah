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
    <div className="min-h-screen bg-[#0E1116]">
      <Header showFullNav={false} />
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-4rem)]">
        {/* Removed the onSuccess prop */}
        <LoginForm />
      </div>
    </div>
  );
}
