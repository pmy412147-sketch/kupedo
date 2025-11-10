'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingDown, TrendingUp } from 'lucide-react';

interface PricePoint {
  price: number;
  changed_at: string;
}

interface PriceTrendProps {
  adId: string;
  currentPrice: number;
}

export default function PriceTrendChart({ adId, currentPrice }: PriceTrendProps) {
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPriceHistory();
  }, [adId]);

  const loadPriceHistory = async () => {
    try {
      const { data } = await supabase
        .from('price_history')
        .select('price, changed_at')
        .eq('ad_id', adId)
        .order('changed_at', { ascending: true });

      if (data) {
        setPriceHistory(data);
      }
    } catch (error) {
      console.error('Error loading price history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cenový trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center text-gray-500">
            Načítavam...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (priceHistory.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cenový trend</CardTitle>
          <CardDescription>História zmien ceny</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p className="mb-2">Žiadne zmeny ceny</p>
            <p className="text-sm">Aktuálna cena: €{currentPrice}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const minPrice = Math.min(...priceHistory.map(p => p.price), currentPrice);
  const maxPrice = Math.max(...priceHistory.map(p => p.price), currentPrice);
  const priceRange = maxPrice - minPrice;
  const firstPrice = priceHistory[0].price;
  const lastPrice = priceHistory[priceHistory.length - 1].price;
  const priceChange = lastPrice - firstPrice;
  const priceChangePercent = (priceChange / firstPrice) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cenový trend</CardTitle>
        <CardDescription>
          {priceHistory.length} {priceHistory.length === 1 ? 'zmena' : priceHistory.length < 5 ? 'zmeny' : 'zmien'} ceny
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Price Change Summary */}
        <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-600">Začiatočná cena</p>
            <p className="text-2xl font-bold">€{firstPrice}</p>
          </div>
          <div className="flex items-center gap-2">
            {priceChange >= 0 ? (
              <TrendingUp className="h-8 w-8 text-emerald-600" />
            ) : (
              <TrendingDown className="h-8 w-8 text-red-600" />
            )}
            <div className={priceChange >= 0 ? 'text-emerald-600' : 'text-red-600'}>
              <p className="text-lg font-semibold">
                {priceChange >= 0 ? '+' : ''}€{Math.abs(priceChange).toFixed(0)}
              </p>
              <p className="text-sm">
                {priceChange >= 0 ? '+' : ''}{priceChangePercent.toFixed(1)}%
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Aktuálna cena</p>
            <p className="text-2xl font-bold">€{currentPrice}</p>
          </div>
        </div>

        {/* Simple Chart */}
        <div className="relative h-48">
          <svg width="100%" height="100%" className="overflow-visible">
            {/* Grid lines */}
            <line x1="0" y1="0" x2="100%" y2="0" stroke="#e5e7eb" strokeWidth="1" />
            <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#e5e7eb" strokeWidth="1" />
            <line x1="0" y1="100%" x2="100%" y2="100%" stroke="#e5e7eb" strokeWidth="1" />

            {/* Price line */}
            <polyline
              points={priceHistory.map((point, index) => {
                const x = (index / (priceHistory.length - 1)) * 100;
                const y = 100 - ((point.price - minPrice) / priceRange) * 80;
                return `${x}%,${y}%`;
              }).join(' ')}
              fill="none"
              stroke="#10b981"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points */}
            {priceHistory.map((point, index) => {
              const x = (index / (priceHistory.length - 1)) * 100;
              const y = 100 - ((point.price - minPrice) / priceRange) * 80;
              return (
                <circle
                  key={index}
                  cx={`${x}%`}
                  cy={`${y}%`}
                  r="5"
                  fill="#10b981"
                  stroke="white"
                  strokeWidth="2"
                />
              );
            })}
          </svg>

          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 -translate-x-full pr-2 h-full flex flex-col justify-between text-xs text-gray-500">
            <span>€{maxPrice}</span>
            <span>€{((maxPrice + minPrice) / 2).toFixed(0)}</span>
            <span>€{minPrice}</span>
          </div>
        </div>

        {/* Timeline */}
        <div className="mt-6 space-y-2">
          {priceHistory.map((point, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {new Date(point.changed_at).toLocaleDateString('sk-SK', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
              <span className="font-medium">€{point.price}</span>
              {index > 0 && (
                <span className={
                  point.price > priceHistory[index - 1].price
                    ? 'text-emerald-600'
                    : point.price < priceHistory[index - 1].price
                    ? 'text-red-600'
                    : 'text-gray-500'
                }>
                  {point.price > priceHistory[index - 1].price && '+'}
                  €{(point.price - priceHistory[index - 1].price).toFixed(0)}
                </span>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
