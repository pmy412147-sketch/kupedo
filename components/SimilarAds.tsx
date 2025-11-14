'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { AdCard } from '@/components/AdCard';
import { Sparkles } from 'lucide-react';

interface SimilarAdsProps {
  adId: string;
  category: string;
}

export function SimilarAds({ adId, category }: SimilarAdsProps) {
  const [similarAds, setSimilarAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSimilarAds();
  }, [adId]);

  const loadSimilarAds = async () => {
    try {
      const response = await fetch(`/api/ai/similar-ads?adId=${adId}&limit=6`);
      const data = await response.json();

      if (data.similarAds) {
        setSimilarAds(data.similarAds);
      }
    } catch (error) {
      console.error('Error loading similar ads:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || similarAds.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="h-6 w-6 text-emerald-600" />
        <h2 className="text-2xl font-bold">Podobné inzeráty</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {similarAds.map((ad) => (
          <AdCard
            key={ad.id}
            id={ad.id}
            title={ad.title}
            price={ad.price}
            location={ad.location}
            images={ad.images}
            user_id={ad.user_id}
            created_at={ad.created_at}
            view_count={ad.view_count}
            is_boosted={ad.is_boosted}
            boosted_until={ad.boosted_until}
          />
        ))}
      </div>
    </div>
  );
}
