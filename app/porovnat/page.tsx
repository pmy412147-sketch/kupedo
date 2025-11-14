'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { ProductComparison } from '@/components/ProductComparison';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function ComparePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [comparisonProducts, setComparisonProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('comparison_products');
    if (stored) {
      const productIds = JSON.parse(stored);
      loadProducts(productIds);
    }
  }, []);

  const loadProducts = async (productIds: string[]) => {
    try {
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .in('id', productIds);

      if (error) throw error;
      if (data) {
        setComparisonProducts(data);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);

    try {
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
        .eq('status', 'active')
        .limit(20);

      if (error) throw error;
      if (data) {
        setSearchResults(data);
      }
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setSearching(false);
    }
  };

  const addToComparison = (product: any) => {
    if (comparisonProducts.find((p) => p.id === product.id)) return;
    if (comparisonProducts.length >= 4) {
      alert('Môžete porovnať maximálne 4 produkty');
      return;
    }

    const updatedProducts = [...comparisonProducts, product];
    setComparisonProducts(updatedProducts);

    const productIds = updatedProducts.map((p) => p.id);
    localStorage.setItem('comparison_products', JSON.stringify(productIds));
  };

  const removeFromComparison = (productId: string) => {
    const updatedProducts = comparisonProducts.filter((p) => p.id !== productId);
    setComparisonProducts(updatedProducts);

    const productIds = updatedProducts.map((p) => p.id);
    localStorage.setItem('comparison_products', JSON.stringify(productIds));
  };

  const clearComparison = () => {
    setComparisonProducts([]);
    localStorage.removeItem('comparison_products');
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#F8F9FA] dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Späť
            </Button>

            <h1 className="text-3xl font-bold mb-2">Porovnanie produktov</h1>
            <p className="text-gray-600">
              Pridajte produkty a AI vytvorí detailnú analýzu
            </p>
          </div>

          {comparisonProducts.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  Porovnávané produkty ({comparisonProducts.length}/4)
                </h2>
                <Button variant="outline" size="sm" onClick={clearComparison}>
                  Vymazať všetky
                </Button>
              </div>

              <ProductComparison
                products={comparisonProducts}
                userId={user?.id}
                category={comparisonProducts[0]?.category_id || 'general'}
                onRemoveProduct={removeFromComparison}
              />
            </div>
          )}

          {comparisonProducts.length < 4 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Pridať produkt na porovnanie</h2>

              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Vyhľadajte produkt..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={searching}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {searchResults.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchResults.map((product) => (
                    <Card key={product.id} className="p-4">
                      <h3 className="font-semibold mb-2 line-clamp-2">{product.title}</h3>
                      <p className="text-lg font-bold text-emerald-600 mb-2">
                        {product.price === 0 ? 'Dohodou' : `${product.price.toLocaleString('sk-SK')} €`}
                      </p>
                      <Button
                        size="sm"
                        onClick={() => addToComparison(product)}
                        disabled={comparisonProducts.find((p) => p.id === product.id)}
                        style={{ backgroundColor: '#10b981' }}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Pridať na porovnanie
                      </Button>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>
      </main>
    </>
  );
}
