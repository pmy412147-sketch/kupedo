'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Edit, Pause, Play } from 'lucide-react';
import { toast } from 'sonner';

interface Ad {
  id: string;
  title: string;
  price: number;
  location: string;
  images: string[];
  status: string;
  created_at: string;
}

export default function MyAdsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    const fetchMyAds = async () => {
      try {
        const q = query(
          collection(db, 'ads'),
          where('user_id', '==', user.uid)
        );

        const snapshot = await getDocs(q);
        const adsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Ad));

        setAds(adsData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      } catch (error) {
        console.error('Error fetching ads:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyAds();
  }, [user, router]);

  const handleDelete = async (adId: string) => {
    if (!confirm('Naozaj chcete odstrániť tento inzerát?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'ads', adId));
      setAds(ads.filter(ad => ad.id !== adId));
      toast.success('Inzerát bol odstránený');
    } catch (error) {
      toast.error('Chyba pri odstraňovaní inzerátu');
    }
  };

  const handleToggleStatus = async (adId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';

    try {
      await updateDoc(doc(db, 'ads', adId), {
        status: newStatus,
        updatedAt: new Date()
      });

      setAds(ads.map(ad =>
        ad.id === adId ? { ...ad, status: newStatus } : ad
      ));

      toast.success(newStatus === 'active' ? 'Inzerát aktivovaný' : 'Inzerát pozastavený');
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
      <main className="min-h-screen bg-[#F8F9FA] dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Moje inzeráty</h1>
            <Button
              onClick={() => router.push('/pridat-inzerat')}
              style={{ backgroundColor: '#2ECC71' }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Pridať inzerát
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : ads.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-gray-500 mb-4">Nemáte žiadne inzeráty</p>
              <Button
                onClick={() => router.push('/pridat-inzerat')}
                style={{ backgroundColor: '#2ECC71' }}
              >
                Pridať prvý inzerát
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {ads.map((ad) => (
                <Card key={ad.id} className="p-4">
                  <div className="flex gap-4">
                    <div className="w-32 h-32 bg-gray-100 rounded flex-shrink-0">
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

                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-semibold mb-2">{ad.title}</h3>
                          <p className="text-2xl font-bold text-[#2ECC71] mb-2">
                            {ad.price > 0 ? `${ad.price} €` : 'Dohodou'}
                          </p>
                          <p className="text-gray-600">
                            {ad.location} • {new Date(ad.created_at).toLocaleDateString('sk-SK')}
                          </p>
                          <p className="text-sm text-gray-500 mt-2">
                            Stav: <span className={ad.status === 'active' ? 'text-green-600' : 'text-orange-600'}>
                              {ad.status === 'active' ? 'Aktívny' : 'Pozastavený'}
                            </span>
                          </p>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                          <Button
                            variant="outline"
                            onClick={() => router.push(`/upravit-inzerat/${ad.id}`)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Upraviť
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleToggleStatus(ad.id, ad.status)}
                          >
                            {ad.status === 'active' ? (
                              <>
                                <Pause className="h-4 w-4 mr-2" />
                                Pozastaviť
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4 mr-2" />
                                Aktivovať
                              </>
                            )}
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDelete(ad.id)}
                          >
                            <Trash2 className="h-4 w-4" />
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
    </>
  );
}
