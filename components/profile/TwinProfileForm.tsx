// components/profile/TwinProfileForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseAuth } from '@/lib/supabaseAuth';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { v4 as uuidv4 } from 'uuid'; // For generating unique filenames

export default function TwinProfileForm() {
  const router = useRouter();
  const [twinName, setTwinName] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Handle twin name change
  const handleTwinNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTwinName(e.target.value);
  };

  // Handle avatar file selection
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type and size
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        setError('Only JPEG, PNG, and GIF images are allowed.');
        return;
      }

      if (file.size > maxSize) {
        setError('Image size should be less than 5MB.');
        return;
      }

      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validate twin name
      if (!twinName.trim()) {
        throw new Error('Please provide a name for your Digital Twin.');
      }

      // Fetch the authenticated user
      const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated.');
      }

      if (!avatarFile) {
        throw new Error('Please select an avatar image.');
      }

      const userId = user.id;

      // Generate a unique filename within the user's directory
      const fileExtension = avatarFile.name.split('.').pop() || 'png';
      const uniqueFilename = `${userId}/${uuidv4()}.${fileExtension}`; // e.g., "user-id/uuid.png"

      // Upload the avatar image to Supabase Storage
      const { error: uploadError } = await supabaseAuth.storage
        .from('avatars')
        .upload(uniqueFilename, avatarFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get the public URL of the uploaded image
      const { data: publicUrlData } = supabaseAuth.storage
        .from('avatars')
        .getPublicUrl(uniqueFilename);

      if (!publicUrlData || !publicUrlData.publicUrl) {
        throw new Error('Failed to retrieve the public URL for the avatar.');
      }

      const avatarURL = publicUrlData.publicUrl;

      // Update the profiles table with the avatar URL, twin_name, and set profile_completed to true
      const { error: updateError } = await supabaseAuth
        .from('profiles')
        .update({ 
          avatar_url: avatarURL,
          twin_name: twinName.trim(),
          profile_completed: true // Set to true after completing profile
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      alert('Profile updated successfully!');
      
      // Redirect to the profile page
      router.push('/profile');
    } catch (error: any) {
      console.error('Profile update error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-[#161B22] p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-white mb-6">
        Design your Digital Twin
      </h2>
      <p className="text-white mb-6">
        Think of your digital twin as a digital podcast sherpa. They will be a clone of your brain and best ideas. They will guide you through your favourite podcasts extracting the biggest, most relevant ideas. They will hunt down the best podcasts while you sleep. They will help connect you with other curious humans who love nerding out on the same podcasts as you.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="twinName" className="block text-white mb-2">Give your Digital Twin a name</label>
          <Input
            id="twinName"
            type="text"
            placeholder="Give your Digital Twin a name"
            value={twinName}
            onChange={handleTwinNameChange}
            className="w-full bg-[#0E1116] border-none text-white"
            required
          />
        </div>

        <div>
          <label htmlFor="avatar" className="block text-white mb-2">Upload an image for your Digital Twin</label>
          <input
            id="avatar"
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="w-full text-white bg-[#0E1116] border-none"
            required
          />
          {avatarPreview && (
            <img
              src={avatarPreview}
              alt="Avatar Preview"
              className="mt-4 w-24 h-24 object-cover rounded-full"
            />
          )}
        </div>

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        <Button
          type="submit"
          className="w-full bg-[#21C55D] text-white"
          disabled={isLoading || !avatarFile || !twinName.trim()}
        >
          {isLoading ? 'Uploading...' : 'Upload Avatar'}
        </Button>
      </form>
    </div>
  );
}
