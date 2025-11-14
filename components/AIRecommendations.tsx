'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, Heart, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';

interface Recommendation {
  id: string;
  recommended_ad_id: string;
  recommendation_type: string;
  score: number;
  reasoning: string;
  ads: {
    id: string;
    title: string;
    price: number;
    location: string;
    images: string[];
  };
}

export function AIRecommendations() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadRecommendations();
    }
  }, [user]);

  const loadRecommendations = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/ai/recommendations?userId=${user.id}&limit=6`);
      const data = await response.json();

      if (data.recommendations) {
        setRecommendations(data.recommendations);
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = async (recommendationId: string) => {
    try {
      await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recommendationId,
          interacted: true,
        }),
      });
    } catch (error) {
      console.error('Error tracking interaction:', error);
    }
  };

  const getRecommendationTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      similar_viewed: 'Podobné ako ste videli',
      similar_favorited: 'Podobné ako máte v obľúbených',
      price_match: 'Vo vašom cenovom rozpätí',
      category_interest: 'Z kategórií čo vás zaujímajú',
      collaborative: 'Odporúčané pre vás',
    };
    return labels[type] || 'Odporúčané';
  };

  if (!user || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-6 w-6 text-emerald-600" />
        <h2 className="text-2xl font-bold">AI Odporúčania pre vás</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((rec) => (
          <Link
            key={rec.id}
            href={`/inzerat/${rec.ads.id}`}
            onClick={() => handleClick(rec.id)}
          >
            <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer">
              <div className="relative aspect-square bg-gray-100">
                {rec.ads.images && rec.ads.images.length > 0 ? (
                  <Image
                    src={rec.ads.images[0]}
                    alt={rec.ads.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    Bez obrázka
                  </div>
                )}

                <div className="absolute top-2 left-2">
                  <Badge className="bg-emerald-600 text-white">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI Pick
                  </Badge>
                </div>

                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="bg-white/90">
                    {Math.round(rec.score * 100)}% zhoda
                  </Badge>
                </div>
              </div>

              <div className="p-4">
                <Badge variant="outline" className="mb-2 text-xs">
                  {getRecommendationTypeLabel(rec.recommendation_type)}
                </Badge>

                <h3 className="font-semibold line-clamp-2 mb-2">{rec.ads.title}</h3>

                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-emerald-600">
                    {rec.ads.price > 0 ? `${rec.ads.price.toLocaleString('sk-SK')} €` : 'Dohodou'}
                  </span>
                </div>

                <p className="text-sm text-gray-600 line-clamp-1">{rec.ads.location}</p>

                {rec.reasoning && (
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                    <TrendingUp className="h-3 w-3 inline mr-1" />
                    {rec.reasoning}
                  </p>
                )}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
