'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Edit, Pause, Play, TrendingUp, Coins } from 'lucide-react';
import { toast } from 'sonner';
import { BoostAdModal } from '@/components/BoostAdModal';

interface Ad {
  id: string;
  title: string;
  price: number;
  location: string;
  images: string[];
  status: string;
  created_at: string;
  is_boosted?: boolean;
  boosted_until?: string;
}

export default function MyAdsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [boostModalOpen, setBoostModalOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [coinBalance, setCoinBalance] = useState(0);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    fetchMyAds();
    fetchCoinBalance();
  }, [user, router]);

  const fetchCoinBalance = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_coins')
      .select('balance')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setCoinBalance(data.balance);
    }
  };

  const fetchMyAds = async () => {
    try {
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching ads:', error);
      } else {
        setAds(data || []);
      }
    } catch (error) {
      console.error('Error fetching ads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBoost = (ad: Ad) => {
    setSelectedAd(ad);
    setBoostModalOpen(true);
  };

  const handleBoostSuccess = () => {
    fetchMyAds();
    fetchCoinBalance();
  };

  const handleDelete = async (adId: string) => {
    if (!confirm('Naozaj chcete odstrániť tento inzerát?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('ads')
        .delete()
        .eq('id', adId);

      if (error) {
        toast.error('Chyba pri odstraňovaní inzerátu');
      } else {
        setAds(ads.filter(ad => ad.id !== adId));
        toast.success('Inzerát bol odstránený');
      }
    } catch (error) {
      toast.error('Chyba pri odstraňovaní inzerátu');
    }
  };

  const handleToggleStatus = async (adId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';

    try {
      const { error } = await supabase
        .from('ads')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', adId);

      if (error) {
        toast.error('Chyba pri zmene stavu');
      } else {
        setAds(ads.map(ad =>
          ad.id === adId ? { ...ad, status: newStatus } : ad
        ));
        toast.success(newStatus === 'active' ? 'Inzerát bol aktivovaný' : 'Inzerát bol pozastavený');
      }
    } catch (error) {
      toast.error('Chyba pri zmene stavu inzerátu');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#F8F9FA] dark:bg-gray-900 py-4 md:py-8 pb-20 md:pb-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4 md:mb-6">
            <h1 className="text-2xl md:text-3xl font-bold dark:text-white">Moje inzeráty</h1>
            <Button
              onClick={() => router.push('/pridat-inzerat')}
              style={{ backgroundColor: '#2ECC71' }}
              className="w-full md:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Pridať inzerát
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-3 md:gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : ads.length === 0 ? (
            <Card className="p-6 md:p-12 text-center">
              <p className="text-gray-500 mb-4">Nemáte žiadne inzeráty</p>
              <Button
                onClick={() => router.push('/pridat-inzerat')}
                style={{ backgroundColor: '#2ECC71' }}
              >
                Pridať prvý inzerát
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:gap-4">
              {ads.map((ad) => (
                <Card key={ad.id} className="p-3 md:p-4">
                  <div className="flex gap-3 md:gap-4">
                    <div className="w-20 h-20 md:w-32 md:h-32 bg-gray-100 rounded flex-shrink-0">
                      {ad.images[0] ? (
                        <img
                          src={ad.images[0]}
                          alt={ad.title}
                          className="w-full h-full object-contain rounded"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                          Bez obrázku
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 md:mb-2">
                            <h3 className="text-base md:text-xl font-semibold truncate dark:text-white">{ad.title}</h3>
                            {ad.is_boosted && ad.boosted_until && new Date(ad.boosted_until) > new Date() && (
                              <Badge className="bg-gradient-to-r from-amber-400 to-amber-600 text-white text-[10px] flex-shrink-0">
                                TOP
                              </Badge>
                            )}
                          </div>
                          <p className="text-xl md:text-2xl font-bold text-[#2ECC71] mb-1 md:mb-2">
                            {ad.price > 0 ? `${ad.price} €` : 'Dohodou'}
                          </p>
                          <p className="text-xs md:text-base text-gray-600 dark:text-gray-400 truncate">
                            {ad.location} • {new Date(ad.created_at).toLocaleDateString('sk-SK')}
                          </p>
                          <p className="text-xs md:text-sm text-gray-500 mt-1 md:mt-2">
                            Stav: <span className={ad.status === 'active' ? 'text-green-600' : 'text-orange-600'}>
                              {ad.status === 'active' ? 'Aktívny' : 'Pozastavený'}
                            </span>
                          </p>
                          {ad.is_boosted && ad.boosted_until && new Date(ad.boosted_until) > new Date() && (
                            <p className="text-xs md:text-sm text-amber-600 mt-1 flex items-center gap-1">
                              <TrendingUp className="h-3 w-3 md:h-4 md:w-4" />
                              <span className="truncate">Topované do: {new Date(ad.boosted_until).toLocaleDateString('sk-SK')}</span>
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:flex md:flex-row gap-2 md:flex-wrap">
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                            onClick={() => handleBoost(ad)}
                          >
                            <TrendingUp className="h-3 w-3 md:h-4 md:w-4 md:mr-2" />
                            <span className="text-xs md:text-sm">Topovať</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/upravit-inzerat/${ad.id}`)}
                          >
                            <Edit className="h-3 w-3 md:h-4 md:w-4 md:mr-2" />
                            <span className="text-xs md:text-sm">Upraviť</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleStatus(ad.id, ad.status)}
                          >
                            {ad.status === 'active' ? (
                              <>
                                <Pause className="h-3 w-3 md:h-4 md:w-4 md:mr-2" />
                                <span className="text-xs md:text-sm">Pauza</span>
                              </>
                            ) : (
                              <>
                                <Play className="h-3 w-3 md:h-4 md:w-4 md:mr-2" />
                                <span className="text-xs md:text-sm">Aktivovať</span>
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(ad.id)}
                          >
                            <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {selectedAd && (
        <BoostAdModal
          open={boostModalOpen}
          onClose={() => {
            setBoostModalOpen(false);
            setSelectedAd(null);
          }}
          adId={selectedAd.id}
          adTitle={selectedAd.title}
          userCoins={coinBalance}
          onSuccess={handleBoostSuccess}
        />
      )}
    </>
  );
}
