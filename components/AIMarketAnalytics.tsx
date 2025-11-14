'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Eye,
  MessageSquare,
  Clock,
  BarChart3,
  Users,
  Package,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface MarketStats {
  averagePrice: number;
  totalAds: number;
  activeUsers: number;
  viewsLastWeek: number;
  messagesLastWeek: number;
  priceTrend: 'up' | 'down' | 'stable';
  popularCategories: Array<{ name: string; count: number }>;
  priceRanges: Array<{ range: string; count: number }>;
}

interface AIMarketAnalyticsProps {
  category?: string;
}

export function AIMarketAnalytics({ category }: AIMarketAnalyticsProps) {
  const [stats, setStats] = useState<MarketStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);

  const fetchMarketStats = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('ads')
        .select('price, category_id, views, created_at, status');

      if (category) {
        query = query.eq('category_id', category);
      }

      const { data: ads, error } = await query.eq('status', 'active');

      if (error) throw error;

      if (ads && ads.length > 0) {
        const prices = ads.map(ad => ad.price).filter(p => p > 0);
        const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

        const categoryCount: { [key: string]: number } = {};
        ads.forEach(ad => {
          categoryCount[ad.category_id] = (categoryCount[ad.category_id] || 0) + 1;
        });

        const popularCategories = Object.entries(categoryCount)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        const priceRanges = [
          { range: '0-100€', count: prices.filter(p => p <= 100).length },
          { range: '100-500€', count: prices.filter(p => p > 100 && p <= 500).length },
          { range: '500-1000€', count: prices.filter(p => p > 500 && p <= 1000).length },
          { range: '1000€+', count: prices.filter(p => p > 1000).length },
        ];

        setStats({
          averagePrice: avgPrice,
          totalAds: ads.length,
          activeUsers: new Set(ads.map(ad => ad.user_id)).size,
          viewsLastWeek: ads.reduce((sum, ad) => sum + (ad.views || 0), 0),
          messagesLastWeek: 0,
          priceTrend: 'stable',
          popularCategories,
          priceRanges,
        });
      }
    } catch (error) {
      console.error('Error fetching market stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAIInsights = async () => {
    if (!stats) return;

    setGenerating(true);
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Analyzuj tento trhový prehľad a poskytni 5 kľúčových insights:
            - Priemerná cena: ${stats.averagePrice.toFixed(2)}€
            - Počet aktívnych inzerátov: ${stats.totalAds}
            - Aktívni používatelia: ${stats.activeUsers}
            - Zobrazenia za týždeň: ${stats.viewsLastWeek}
            - Populárne kategórie: ${stats.popularCategories.map(c => c.name).join(', ')}

            Poskytni konkrétne, actionable insights pre marketplace.`,
          conversationHistory: [],
          userId: 'system',
        }),
      });

      if (!response.ok) throw new Error('Failed to generate insights');

      const data = await response.json();
      const insights = data.response.split('\n').filter((line: string) => line.trim().length > 0);
      setAiInsights(insights);
    } catch (error) {
      console.error('Error generating AI insights:', error);
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    fetchMarketStats();
  }, [category]);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-emerald-600" />
            AI Trhová Analytika
          </h2>
          <p className="text-gray-600 mt-1">Inteligentné insights o trhu v reálnom čase</p>
        </div>
        <Button onClick={fetchMarketStats} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Obnoviť
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Priemerná cena</p>
              <p className="text-2xl font-bold mt-1">{stats.averagePrice.toFixed(2)}€</p>
            </div>
            <DollarSign className="h-8 w-8 text-emerald-600" />
          </div>
          <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
            <TrendingUp className="h-4 w-4" />
            <span>Stabilný trend</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Aktívne inzeráty</p>
              <p className="text-2xl font-bold mt-1">{stats.totalAds}</p>
            </div>
            <Package className="h-8 w-8 text-blue-600" />
          </div>
          <div className="flex items-center gap-1 mt-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>Aktuálne</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Aktívni používatelia</p>
              <p className="text-2xl font-bold mt-1">{stats.activeUsers}</p>
            </div>
            <Users className="h-8 w-8 text-purple-600" />
          </div>
          <div className="flex items-center gap-1 mt-2 text-sm text-purple-600">
            <TrendingUp className="h-4 w-4" />
            <span>Rastúci</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Zobrazenia (7 dní)</p>
              <p className="text-2xl font-bold mt-1">{stats.viewsLastWeek}</p>
            </div>
            <Eye className="h-8 w-8 text-orange-600" />
          </div>
          <div className="flex items-center gap-1 mt-2 text-sm text-orange-600">
            <TrendingUp className="h-4 w-4" />
            <span>Vysoký záujem</span>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="categories" className="w-full">
        <TabsList>
          <TabsTrigger value="categories">Populárne kategórie</TabsTrigger>
          <TabsTrigger value="prices">Cenové rozpätia</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Top 5 kategórií</h3>
            <div className="space-y-3">
              {stats.popularCategories.map((cat, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-semibold">
                      {index + 1}
                    </div>
                    <span className="font-medium">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full"
                        style={{ width: `${(cat.count / stats.totalAds) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">{cat.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="prices" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Distribúcia cien</h3>
            <div className="space-y-4">
              {stats.priceRanges.map((range, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{range.range}</span>
                    <span className="text-sm text-gray-600">{range.count} inzerátov</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-300"
                      style={{ width: `${(range.count / stats.totalAds) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-600" />
                AI Insights
              </h3>
              <Button
                onClick={generateAIInsights}
                disabled={generating}
                size="sm"
                style={{ backgroundColor: '#10b981' }}
              >
                {generating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generujem...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generovať Insights
                  </>
                )}
              </Button>
            </div>

            {aiInsights.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Sparkles className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>Klikni na tlačidlo pre vygenerovanie AI insights</p>
              </div>
            ) : (
              <div className="space-y-3">
                {aiInsights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      {index + 1}
                    </div>
                    <p className="text-sm text-gray-700 flex-1">{insight}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
