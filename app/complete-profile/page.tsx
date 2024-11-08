// app/complete-profile/page.tsx
'use client';

import TwinProfileForm from '@/components/profile/TwinProfileForm';
import Header from '@/components/header'; // If you have a Header component

export default function CompleteProfilePage() {
  return (
    <div className="min-h-screen bg-background text-white flex flex-col">
      <Header showFullNav={false} /> {/* Optional: Include if you have a header */}
      <div className="flex items-center justify-center flex-1 p-4 sm:p-6 md:p-8">
        <TwinProfileForm />
      </div>
    </div>
  );
}
