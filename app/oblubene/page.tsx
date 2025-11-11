'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { AdCard } from '@/components/AdCard';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';

interface Ad {
  id: string;
  title: string;
  price: number;
  location: string;
  images: string[];
  user_id: string;
}

export default function FavoritesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    const fetchFavorites = async () => {
      try {
        const { data: favorites, error: favError } = await supabase
          .from('favorites')
          .select('ad_id')
          .eq('user_id', user.id);

        if (favError) {
          console.error('Error fetching favorites:', favError);
          setAds([]);
          return;
        }

        if (!favorites || favorites.length === 0) {
          setAds([]);
          return;
        }

        const adIds = favorites.map(f => f.ad_id);
        const { data: adsData, error: adsError } = await supabase
          .from('ads')
          .select('*')
          .in('id', adIds);

        if (adsError) {
          console.error('Error fetching ads:', adsError);
          setAds([]);
        } else {
          setAds(adsData || []);
        }
      } catch (error) {
        console.error('Error fetching favorites:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#F8F9FA] dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6">Obľúbené inzeráty</h1>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-80 bg-gray-200 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : ads.length === 0 ? (
            <Card className="p-12 text-center">
              <Heart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">Zatiaľ nemáte žiadne obľúbené inzeráty</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {ads.map((ad) => (
                <AdCard
                  key={ad.id}
                  id={ad.id}
                  title={ad.title}
                  price={ad.price}
                  location={ad.location}
                  images={ad.images}
                  user_id={ad.user_id}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
