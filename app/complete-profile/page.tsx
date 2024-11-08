// app/complete-profile/page.tsx
'use client';

import TwinProfileForm from '@/components/profile/TwinProfileForm';
import Header from '@/components/header'; // If you have a Header component

export default function CompleteProfilePage() {
  return (
    <div className="min-h-screen bg-[#0E1116]">
      <Header showFullNav={false} /> {/* Optional: Include if you have a header */}
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-4rem)]">
        <TwinProfileForm />
      </div>
    </div>
  );
}
