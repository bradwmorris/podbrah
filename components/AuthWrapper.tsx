// components/AuthWrapper.tsx
'use client';

import React from 'react';
import { AuthProvider } from '@/components/auth/AuthProvider';

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
};

export default AuthWrapper;
