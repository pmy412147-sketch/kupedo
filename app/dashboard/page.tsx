'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  Eye,
  Heart,
  MessageSquare,
  DollarSign,
  BarChart3,
  Users,
  Clock,
  Download,
  RefreshCw
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface DashboardStats {
  totalAds: number;
  activeAds: number;
  totalViews: number;
  totalInteractions: number;
  totalFavorites: number;
  totalMessages: number;
  avgPrice: number;
  viewsToday: number;
  viewsThisWeek: number;
  conversionRate: number;
}

interface AdPerformance {
  id: string;
  title: string;
  views: number;
  interactions: number;
  favorites: number;
  messages: number;
  price: number;
  created_at: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topAds, setTopAds] = useState<AdPerformance[]>([]);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('7d');

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }
    loadDashboardData();
  }, [user, timeRange]);

  const loadDashboardData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const now = new Date();
      const startDate = timeRange === '7d'
        ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        : timeRange === '30d'
        ? new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        : new Date(0);

      // Get user's ads
      const { data: ads } = await supabase
        .from('ads')
        .select('*')
        .eq('user_id', user.id);

      if (!ads) return;

      const adIds = ads.map(ad => ad.id);

      // Get view stats
      const { data: views } = await supabase
        .from('listing_views')
        .select('*')
        .in('ad_id', adIds)
        .gte('viewed_at', startDate.toISOString());

      // Get interaction stats
      const { data: interactions } = await supabase
        .from('listing_interactions')
        .select('*')
        .in('ad_id', adIds)
        .gte('created_at', startDate.toISOString());

      // Calculate stats
      const totalAds = ads.length;
      const activeAds = ads.filter(ad => ad.status === 'active').length;
      const totalViews = views?.length || 0;
      const totalInteractions = interactions?.length || 0;
      const totalFavorites = ads.reduce((sum, ad) => sum + (ad.favorite_count || 0), 0);
      const totalMessages = ads.reduce((sum, ad) => sum + (ad.message_count || 0), 0);
      const avgPrice = ads.reduce((sum, ad) => sum + (ad.price || 0), 0) / totalAds;

      // Views today
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const viewsToday = views?.filter(v => new Date(v.viewed_at) >= todayStart).length || 0;

      // Views this week
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const viewsThisWeek = views?.filter(v => new Date(v.viewed_at) >= weekStart).length || 0;

      // Conversion rate (interactions / views)
      const conversionRate = totalViews > 0 ? (totalInteractions / totalViews) * 100 : 0;

      setStats({
        totalAds,
        activeAds,
        totalViews,
        totalInteractions,
        totalFavorites,
        totalMessages,
        avgPrice,
        viewsToday,
        viewsThisWeek,
        conversionRate
      });

      // Get top performing ads
      const adPerformance: AdPerformance[] = ads.map(ad => {
        const adViews = views?.filter(v => v.ad_id === ad.id).length || 0;
        const adInteractions = interactions?.filter(i => i.ad_id === ad.id).length || 0;

        return {
          id: ad.id,
          title: ad.title,
          views: adViews,
          interactions: adInteractions,
          favorites: ad.favorite_count || 0,
          messages: ad.message_count || 0,
          price: ad.price || 0,
          created_at: ad.created_at
        };
      });

      adPerformance.sort((a, b) => b.views - a.views);
      setTopAds(adPerformance.slice(0, 5));

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Sledujte výkonnosť vašich inzerátov</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadDashboardData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Obnoviť
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportovať
          </Button>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={timeRange === '7d' ? 'default' : 'outline'}
          onClick={() => setTimeRange('7d')}
        >
          Posledných 7 dní
        </Button>
        <Button
          variant={timeRange === '30d' ? 'default' : 'outline'}
          onClick={() => setTimeRange('30d')}
        >
          Posledných 30 dní
        </Button>
        <Button
          variant={timeRange === 'all' ? 'default' : 'outline'}
          onClick={() => setTimeRange('all')}
        >
          Všetko
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Celkové zobrazenia</CardTitle>
            <Eye className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalViews.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">
              +{stats?.viewsToday} dnes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interakcie</CardTitle>
            <MessageSquare className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalInteractions}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats?.conversionRate.toFixed(1)}% konverzia
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Obľúbené</CardTitle>
            <Heart className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalFavorites}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats?.totalAds} inzerátov
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Priemerná cena</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{stats?.avgPrice.toFixed(0)}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats?.activeAds} aktívnych
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Prehľad</TabsTrigger>
          <TabsTrigger value="performance">Výkonnosť</TabsTrigger>
          <TabsTrigger value="traffic">Návštevnosť</TabsTrigger>
          <TabsTrigger value="optimization">Optimalizácia</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top inzeráty</CardTitle>
              <CardDescription>Vaše najúspešnejšie inzeráty za vybrané obdobie</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topAds.map((ad, index) => (
                  <div key={ad.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-gray-400">#{index + 1}</div>
                      <div>
                        <Link href={`/inzerat/${ad.id}`} className="font-medium hover:text-emerald-600">
                          {ad.title}
                        </Link>
                        <div className="flex gap-4 mt-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {ad.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {ad.interactions}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {ad.favorites}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">€{ad.price}</div>
                      <div className="text-sm text-gray-500">
                        {ad.views > 0 ? ((ad.interactions / ad.views) * 100).toFixed(1) : 0}% konverzia
                      </div>
                    </div>
                  </div>
                ))}
                {topAds.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Zatiaľ nemáte žiadne inzeráty
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Výkonnosť inzerátov</CardTitle>
              <CardDescription>Detailná analýza výkonnosti vašich inzerátov</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Grafy výkonnosti budú dostupné po zbere dostatočného množstva dát</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="traffic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Zdroje návštevnosti</CardTitle>
              <CardDescription>Odkiaľ prichádzajú vaši návštevníci</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Analýza zdrojov návštevnosti bude dostupná čoskoro</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Optimalizačné odporúčania</CardTitle>
              <CardDescription>Zlepšite viditeľnosť a výkonnosť vašich inzerátov</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border border-emerald-200 bg-emerald-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-emerald-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-emerald-900">Pridajte viac fotografií</h4>
                      <p className="text-sm text-emerald-700 mt-1">
                        Inzeráty s 5+ fotografiami dostávajú o 40% viac zobrazení
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Aktualizujte staršie inzeráty</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Pravidelné aktualizácie udržiavajú inzeráty vyššie vo výsledkoch vyhľadávania
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-purple-200 bg-purple-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <BarChart3 className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-purple-900">Upravte ceny podľa trhu</h4>
                      <p className="text-sm text-purple-700 mt-1">
                        Analyzujte konkurenčné ceny a prispôsobte svoje ceny pre lepšiu konverziu
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
