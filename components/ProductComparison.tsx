'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sparkles,
  TrendingUp,
  Award,
  X,
  Eye,
  Heart,
  MapPin
} from 'lucide-react';
import Image from 'next/image';

interface Product {
  id: string;
  title: string;
  price: number;
  location: string;
  images: string[];
  metadata?: any;
  [key: string]: any;
}

interface ProductComparisonProps {
  products: Product[];
  userId?: string;
  category: string;
  onRemoveProduct?: (productId: string) => void;
}

interface ComparisonResult {
  summary: string;
  comparison: {
    specifications: string;
    priceValue: string;
    condition: string;
  };
  recommendation: {
    bestChoice: number;
    reasoning: string;
  };
  suitability: Array<{
    productIndex: number;
    suitableFor: string;
  }>;
}

export function ProductComparison({
  products,
  userId,
  category,
  onRemoveProduct,
}: ProductComparisonProps) {
  const [comparisonData, setComparisonData] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [cached, setCached] = useState(false);

  useEffect(() => {
    if (products.length >= 2) {
      performComparison();
    }
  }, [products]);

  const performComparison = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/ai/compare-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products,
          userId,
          category,
        }),
      });

      if (!response.ok) {
        throw new Error('Nepodarilo sa porovnať produkty');
      }

      const data = await response.json();
      setComparisonData(data.comparison);
      setCached(data.cached || false);
    } catch (error) {
      console.error('Error comparing products:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'Dohodou';
    return `${price.toLocaleString('sk-SK')} €`;
  };

  const getBestChoiceBadge = (index: number) => {
    if (comparisonData && comparisonData.recommendation.bestChoice === index) {
      return (
        <Badge className="bg-emerald-600 text-white">
          <Award className="h-3 w-3 mr-1" />
          Najlepšia voľba
        </Badge>
      );
    }
    return null;
  };

  if (products.length < 2) {
    return (
      <Card className="p-8 text-center">
        <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Pridajte aspoň 2 produkty na porovnanie</h3>
        <p className="text-gray-600">
          AI vytvorí detailnú analýzu a pomôže vám vybrať najlepšiu možnosť
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map((product, index) => (
          <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              {onRemoveProduct && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 z-10 bg-white/90 hover:bg-white"
                  onClick={() => onRemoveProduct(product.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              {getBestChoiceBadge(index) && (
                <div className="absolute top-2 left-2 z-10">
                  {getBestChoiceBadge(index)}
                </div>
              )}
              <div className="aspect-square relative bg-gray-100">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[0]}
                    alt={product.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-400">Bez obrázka</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 space-y-2">
              <h3 className="font-semibold line-clamp-2 min-h-[3rem]">{product.title}</h3>

              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-emerald-600">
                  {formatPrice(product.price)}
                </span>
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-1" />
                {product.location}
              </div>

              {comparisonData?.suitability.find((s) => s.productIndex === index) && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-gray-600">
                    <span className="font-semibold">Vhodné pre:</span>{' '}
                    {comparisonData.suitability.find((s) => s.productIndex === index)?.suitableFor}
                  </p>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {loading ? (
        <Card className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </Card>
      ) : (
        comparisonData && (
          <Card className="p-6 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-emerald-600" />
                  AI Analýza porovnania
                </h2>
                {cached && (
                  <Badge variant="outline" className="mt-2">
                    Uložená analýza
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Zhrnutie</h3>
                <p className="text-gray-700 leading-relaxed">{comparisonData.summary}</p>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <Card className="p-4 bg-blue-50 dark:bg-blue-950">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    Špecifikácie
                  </h4>
                  <p className="text-sm text-gray-700">{comparisonData.comparison.specifications}</p>
                </Card>

                <Card className="p-4 bg-green-50 dark:bg-green-950">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    Pomer cena/výkon
                  </h4>
                  <p className="text-sm text-gray-700">{comparisonData.comparison.priceValue}</p>
                </Card>

                <Card className="p-4 bg-purple-50 dark:bg-purple-950">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                    Stav
                  </h4>
                  <p className="text-sm text-gray-700">{comparisonData.comparison.condition}</p>
                </Card>
              </div>

              <Card className="p-4 bg-emerald-50 dark:bg-emerald-950 border-emerald-200">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Award className="h-5 w-5 text-emerald-600" />
                  Odporúčanie AI
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {comparisonData.recommendation.reasoning}
                </p>
              </Card>
            </div>

            <div className="flex justify-center">
              <Button
                onClick={performComparison}
                variant="outline"
                disabled={loading}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Obnoviť analýzu
              </Button>
            </div>
          </Card>
        )
      )}
    </div>
  );
}
