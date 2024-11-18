'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseAuth } from '@/lib/supabaseAuth';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { v4 as uuidv4 } from 'uuid';
import { UserCircle2 } from 'lucide-react';

export default function TwinProfileForm() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [twinName, setTwinName] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTwinNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTwinName(e.target.value);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
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
      if (!twinName.trim()) {
        throw new Error('Please provide a name for your Digital Twin.');
      }

      const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated.');
      }

      if (!avatarFile) {
        throw new Error('Please select an avatar image.');
      }

      const userId = user.id;
      const fileExtension = avatarFile.name.split('.').pop() || 'png';
      const uniqueFilename = `${userId}/${uuidv4()}.${fileExtension}`;

      const { error: uploadError } = await supabaseAuth.storage
        .from('avatars')
        .upload(uniqueFilename, avatarFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabaseAuth.storage
        .from('avatars')
        .getPublicUrl(uniqueFilename);

      if (!publicUrlData || !publicUrlData.publicUrl) {
        throw new Error('Failed to retrieve the public URL for the avatar.');
      }

      const avatarURL = publicUrlData.publicUrl;

      const { error: updateError } = await supabaseAuth
        .from('profiles')
        .update({ 
          avatar_url: avatarURL,
          twin_name: twinName.trim(),
          profile_completed: true
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      router.push('/profile');
    } catch (error: any) {
      console.error('Profile update error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!showForm) {
    return (
      <div className="w-full max-w-md mx-auto text-center">
        <h2 className="text-4xl font-bold text-white mb-6">
          Design your AI-Powered Podcast Servant
        </h2>
        <p className="text-white mb-8 leading-relaxed">
          Your digital twin will get to know you and your favourite podcasts. 
          It will help collect and curate your ideas and share them with others. 
          Your digital twin will interact with other agents, and search the web for 
          interesting connections and patterns and report back to you. They will be on dislay for others to see, so set them a cool name and display picture, but make sure your friends know who you are.
        </p>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-ctaGreen text-white py-6 px-8 text-lg hover:bg-ctaGreen/90 transition-colors"
        >
          Ready to design your agent?
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Empty Avatar Display */}
      <div className="flex justify-center mb-8">
        {avatarPreview ? (
          <img
            src={avatarPreview}
            alt="Avatar Preview"
            className="w-32 h-32 rounded-full border-2 border-ctaGreen object-cover"
          />
        ) : (
          <div className="w-32 h-32 rounded-full border-2 border-ctaGreen/50 flex items-center justify-center bg-background">
            <UserCircle2 className="w-24 h-24 text-ctaGreen/30" />
          </div>
        )}
      </div>

      <h2 className="text-4xl font-bold text-white text-center mb-8">
        Design your AI-Powered Podcast Twin
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="twinName" className="block text-white mb-2">Name your Twin</label>
          <Input
            id="twinName"
            type="text"
            placeholder="Give your Digital Twin a name"
            value={twinName}
            onChange={handleTwinNameChange}
            className="w-full bg-input border-none text-white"
            required
          />
        </div>

        <div>
          <label htmlFor="avatar" className="block text-white mb-2">Choose a pic for your twin</label>
          <div className="bg-input rounded-md p-2">
            <input
              id="avatar"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-ctaGreen file:text-white hover:file:bg-ctaGreen/90"
              required
            />
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        <Button
          type="submit"
          className="w-full bg-ctaGreen text-white py-6 text-lg hover:bg-ctaGreen/90 transition-colors"
          disabled={isLoading || !avatarFile || !twinName.trim()}
        >
          {isLoading ? 'Creating...' : 'Create Your Digital Twin'}
        </Button>
      </form>
    </div>
  );
}