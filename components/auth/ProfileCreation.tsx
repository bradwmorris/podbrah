// components/auth/ProfileCreation.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseAuth } from '@/lib/supabaseAuth';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from './AuthProvider';

export default function ProfileCreation() {
  const router = useRouter();
  const { user, setProfileCompleted } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !displayName) {
      setDebugInfo('No user ID or display name');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Debug: Check if we can read the profile first
      setDebugInfo('Checking current profile...');
      const { data: currentProfile, error: readError } = await supabaseAuth
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (readError) {
        setDebugInfo(`Read error: ${readError.message}`);
        throw readError;
      }

      setDebugInfo(`Current profile: ${JSON.stringify(currentProfile)}`);

      // Attempt update
      setDebugInfo('Attempting update...');
      const updateData = {
        name: displayName,
        bio: bio || null,
        profile_completed: true,
        updated_at: new Date().toISOString()
      };

      setDebugInfo(`Update data: ${JSON.stringify(updateData)}`);

      const { data: updateResult, error: updateError } = await supabaseAuth
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)
        .select();

      if (updateError) {
        setDebugInfo(`Update error: ${updateError.message}`);
        throw updateError;
      }

      setDebugInfo(`Update successful: ${JSON.stringify(updateResult)}`);
      setProfileCompleted(true);
      router.push('/');
    } catch (err: any) {
      console.error('Profile update error:', err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-[#161B22] p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-white mb-6">Complete Your Profile</h2>
      
      {/* Debug info display */}
      {debugInfo && (
        <pre className="text-xs text-gray-400 mb-4 p-2 bg-black/30 rounded overflow-auto">
          {debugInfo}
        </pre>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-gray-300 mb-2">
            Display Name
          </label>
          <Input
            id="displayName"
            name="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full bg-[#0E1116] border-none text-white"
            required
          />
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-2">
            Bio (Optional)
          </label>
          <Textarea
            id="bio"
            name="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full bg-[#0E1116] border-none text-white"
            rows={3}
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm bg-red-100/10 p-2 rounded">{error}</p>
        )}

        <Button
          type="submit"
          className="w-full bg-[#21C55D] text-white hover:bg-[#1CA54C]"
          disabled={isLoading || !displayName}
        >
          {isLoading ? 'Updating Profile...' : 'Complete Profile'}
        </Button>
      </form>
    </div>
  );
}