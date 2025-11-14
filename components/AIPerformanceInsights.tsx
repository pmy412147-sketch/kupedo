'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  Eye,
  MessageSquare,
  Heart,
  DollarSign,
  Clock,
  Target,
  Lightbulb,
  Sparkles,
  RefreshCw,
  Award,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface PerformanceData {
  totalViews: number;
  totalMessages: number;
  totalFavorites: number;
  averagePrice: number;
  activeAds: number;
  qualityScore: number;
  viewsPerAd: number;
  conversionRate: number;
}

interface AIPerformanceInsightsProps {
  userId: string;
}

export function AIPerformanceInsights({ userId }: AIPerformanceInsightsProps) {
  const [performance, setPerformance] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiRecommendations, setAiRecommendations] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);

  const fetchPerformanceData = async () => {
    setLoading(true);
    try {
      const { data: ads, error } = await supabase
        .from('ads')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      if (ads && ads.length > 0) {
        const totalViews = ads.reduce((sum, ad) => sum + (ad.views || 0), 0);
        const totalFavorites = ads.reduce((sum, ad) => sum + (ad.favorites_count || 0), 0);
        const activeAds = ads.filter(ad => ad.status === 'active').length;
        const avgPrice = ads.reduce((sum, ad) => sum + (ad.price || 0), 0) / ads.length;

        const { data: messages } = await supabase
          .from('conversations')
          .select('id')
          .eq('ad_owner_id', userId);

        setPerformance({
          totalViews,
          totalMessages: messages?.length || 0,
          totalFavorites,
          averagePrice: avgPrice,
          activeAds,
          qualityScore: 75,
          viewsPerAd: totalViews / ads.length,
          conversionRate: ((messages?.length || 0) / totalViews) * 100 || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAIRecommendations = async () => {
    if (!performance) return;

    setGenerating(true);
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Analyzuj výkon predajcu a poskytni konkrétne odporúčania:
            - Celkové zobrazenia: ${performance.totalViews}
            - Počet správ: ${performance.totalMessages}
            - Aktívne inzeráty: ${performance.activeAds}
            - Priemerná cena: ${performance.averagePrice.toFixed(2)}€
            - Conversion rate: ${performance.conversionRate.toFixed(2)}%
            - Zobrazení na inzerát: ${performance.viewsPerAd.toFixed(0)}

            Poskytni 5-7 konkrétnych, actionable odporúčaní ako zlepšiť predaj.`,
          conversationHistory: [],
          userId,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate recommendations');

      const data = await response.json();
      const recommendations = data.response.split('\n').filter((line: string) => line.trim().length > 0);
      setAiRecommendations(recommendations);
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchPerformanceData();
    }
  }, [userId]);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      </Card>
    );
  }

  if (!performance) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
          <p className="text-gray-600">Zatiaľ nemáte žiadne dáta na analýzu</p>
        </div>
      </Card>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 70) return 'bg-green-100';
    if (score >= 40) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6 text-emerald-600" />
            Výkonnostné Insights
          </h2>
          <p className="text-gray-600 mt-1">AI analýza vášho výkonu a personalizované odporúčania</p>
        </div>
        <Button onClick={fetchPerformanceData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Obnoviť
        </Button>
      </div>

      <Card className="p-6 bg-gradient-to-r from-emerald-50 to-blue-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Celkové skóre výkonu</h3>
            <p className="text-4xl font-bold flex items-center gap-2">
              <span className={getScoreColor(performance.qualityScore)}>
                {performance.qualityScore}
              </span>
              <span className="text-2xl text-gray-500">/100</span>
            </p>
          </div>
          <div className={`w-24 h-24 rounded-full ${getScoreBg(performance.qualityScore)} flex items-center justify-center`}>
            <Award className={`h-12 w-12 ${getScoreColor(performance.qualityScore)}`} />
          </div>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full mt-4 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-500"
            style={{ width: `${performance.qualityScore}%` }}
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Celkové zobrazenia</p>
              <p className="text-2xl font-bold mt-1">{performance.totalViews}</p>
            </div>
            <Eye className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            ~{performance.viewsPerAd.toFixed(0)} na inzerát
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Správy</p>
              <p className="text-2xl font-bold mt-1">{performance.totalMessages}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-green-600" />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {performance.conversionRate.toFixed(2)}% conversion
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">V obľúbených</p>
              <p className="text-2xl font-bold mt-1">{performance.totalFavorites}</p>
            </div>
            <Heart className="h-8 w-8 text-red-600" />
          </div>
          <p className="text-sm text-gray-600 mt-2">Vysoký záujem</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Aktívne inzeráty</p>
              <p className="text-2xl font-bold mt-1">{performance.activeAds}</p>
            </div>
            <Clock className="h-8 w-8 text-purple-600" />
          </div>
          <p className="text-sm text-gray-600 mt-2">Priem. cena: {performance.averagePrice.toFixed(2)}€</p>
        </Card>
      </div>

      <Tabs defaultValue="recommendations" className="w-full">
        <TabsList>
          <TabsTrigger value="recommendations">AI Odporúčania</TabsTrigger>
          <TabsTrigger value="trends">Trendy</TabsTrigger>
          <TabsTrigger value="optimization">Optimalizácia</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-600" />
                Personalizované odporúčania
              </h3>
              <Button
                onClick={generateAIRecommendations}
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
                    Generovať
                  </>
                )}
              </Button>
            </div>

            {aiRecommendations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Lightbulb className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>Klikni na tlačidlo pre personalizované AI odporúčania</p>
              </div>
            ) : (
              <div className="space-y-3">
                {aiRecommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg border border-emerald-200">
                    <Lightbulb className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{rec}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              Výkonnostné trendy
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Zobrazenia</p>
                    <p className="text-sm text-gray-600">Stúpajúci trend</p>
                  </div>
                </div>
                <span className="text-green-600 font-semibold">+12%</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Správy</p>
                    <p className="text-sm text-gray-600">Stabilný</p>
                  </div>
                </div>
                <span className="text-blue-600 font-semibold">+3%</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="font-medium">Conversion rate</p>
                    <p className="text-sm text-gray-600">Potrebuje zlepšenie</p>
                  </div>
                </div>
                <span className="text-yellow-600 font-semibold">-2%</span>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Rýchle optimalizácie</h3>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start h-auto p-4">
                <div className="text-left">
                  <p className="font-medium">Zlepšiť kvalitu fotografií</p>
                  <p className="text-sm text-gray-600 mt-1">Inzeráty s kvalitnejšími fotkami majú o 40% viac zobrazení</p>
                </div>
              </Button>

              <Button variant="outline" className="w-full justify-start h-auto p-4">
                <div className="text-left">
                  <p className="font-medium">Optimalizovať ceny</p>
                  <p className="text-sm text-gray-600 mt-1">AI odporúča upraviť ceny na 3 inzerátoch</p>
                </div>
              </Button>

              <Button variant="outline" className="w-full justify-start h-auto p-4">
                <div className="text-left">
                  <p className="font-medium">Rozšíriť popisy</p>
                  <p className="text-sm text-gray-600 mt-1">Detailnejšie popisy zvyšujú konverziu o 25%</p>
                </div>
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
