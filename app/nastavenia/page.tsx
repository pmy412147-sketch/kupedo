'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2, Upload } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function SettingsPage() {
  const { user, refreshUserProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [formData, setFormData] = useState({
    displayName: '',
    phone: '',
    bio: '',
    location: '',
    avatar_url: ''
  });

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    loadUserProfile();
  }, [user, router]);

  const loadUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
      } else if (data) {
        setFormData({
          displayName: data.display_name || '',
          phone: data.phone || '',
          bio: data.bio || '',
          location: data.location || '',
          avatar_url: data.avatar_url || ''
        });
        setAvatarPreview(data.avatar_url || '');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      let avatarUrl = formData.avatar_url;

      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile, {
            upsert: true,
            contentType: avatarFile.type
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          alert(`Chyba pri nahrávaní obrázka: ${uploadError.message}`);
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);

        avatarUrl = publicUrl;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: formData.displayName,
          phone: formData.phone,
          bio: formData.bio,
          location: formData.location,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      await refreshUserProfile();
      alert('Profil úspešne aktualizovaný!');
      router.push(`/profil/${user.id}`);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Chyba pri aktualizácii profilu');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Späť
        </Button>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold mb-6">Upraviť profil</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center">
              <Avatar className="w-32 h-32 mb-4">
                <AvatarImage src={avatarPreview} />
                <AvatarFallback className="text-3xl">
                  {formData.displayName?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="avatar"
                className="cursor-pointer text-sm text-blue-600 hover:text-blue-800 flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Zmeniť profilovú fotku
              </label>
              <input
                id="avatar"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div>
              <Label htmlFor="displayName">Meno</Label>
              <Input
                id="displayName"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                placeholder="Vaše meno"
                required
              />
            </div>

            <div>
              <Label htmlFor="phone">Telefónne číslo</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+421 xxx xxx xxx"
              />
            </div>

            <div>
              <Label htmlFor="location">Lokalita</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Bratislava, Košice..."
              />
            </div>

            <div>
              <Label htmlFor="bio">O mne</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Niečo o sebe..."
                rows={4}
              />
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Ukladám...
                  </>
                ) : (
                  'Uložiť zmeny'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Zrušiť
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
