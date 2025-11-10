'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { AdCard } from '@/components/AdCard';
import { FilterBar, FilterValues } from '@/components/FilterBar';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { categories } from '@/lib/categories';
import { useParams } from 'next/navigation';

interface Ad {
  id: string;
  title: string;
  price: number;
  location: string;
  images: string[];
  user_id: string;
  category_id: string;
}

export default function CategoryPage() {
  const params = useParams();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  const category = categories.find(c => c.slug === params.slug);

  const fetchAds = async (filters?: FilterValues) => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'ads'),
        where('status', '==', 'active'),
        orderBy('created_at', 'desc'),
        limit(50)
      );

      const snapshot = await getDocs(q);
      let adsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Ad));

      // Filter by category slug
      adsData = adsData.filter(ad => ad.category_id === params.slug);

      // Filter by price
      if (filters?.priceFrom) {
        const priceFrom = parseFloat(filters.priceFrom);
        adsData = adsData.filter(ad => ad.price >= priceFrom);
      }

      if (filters?.priceTo) {
        const priceTo = parseFloat(filters.priceTo);
        adsData = adsData.filter(ad => ad.price <= priceTo);
      }

      setAds(adsData);
    } catch (error) {
      console.error('Error fetching ads:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, [params.slug]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#F8F9FA] dark:bg-gray-900">
        <div className="bg-gradient-to-r from-[#2ECC71] to-[#27AE60] text-white py-12 mb-8">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold">
              {category?.name || 'Kategória'}
            </h1>
          </div>
        </div>

        <div className="container mx-auto px-4 pb-12">
          <div className="mb-6">
            <FilterBar onFilterChange={fetchAds} currentCategory={params.slug as string} />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-80 bg-gray-200 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : ads.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              V tejto kategórii nie sú žiadne inzeráty
            </div>
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
