'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sparkles,
  MessageSquare,
  Camera,
  TrendingUp,
  Award,
  Search,
  Target,
  Shield,
  Zap,
  Brain,
  BarChart3,
  Bell,
  Eye,
  Lightbulb,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AIMarketAnalytics } from '@/components/AIMarketAnalytics';
import { AIPerformanceInsights } from '@/components/AIPerformanceInsights';
import { SmartNotifications } from '@/components/SmartNotifications';
import { VisualSimilarSearch } from '@/components/VisualSimilarSearch';
import { AIChatAssistant } from '@/components/AIChatAssistant';

export default function AIFeaturesPage() {
  const { user } = useAuth();
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  const features = [
    {
      id: 'chat',
      icon: MessageSquare,
      title: 'AI Chat Asistent',
      description: '24/7 inteligentný asistent pre odpovede na vaše otázky',
      color: 'bg-blue-500',
      benefits: ['Okamžité odpovede', 'Kontextové rady', 'Slovenský jazyk'],
    },
    {
      id: 'visual',
      icon: Camera,
      title: 'Vizuálne vyhľadávanie',
      description: 'Nahrajte fotku a nájdite podobné produkty',
      color: 'bg-purple-500',
      benefits: ['AI analýza obrázkov', 'Nájdenie podobných', 'Rýchle výsledky'],
    },
    {
      id: 'quality',
      icon: Award,
      title: 'Hodnotenie kvality',
      description: 'AI hodnotí kvalitu vašich inzerátov',
      color: 'bg-emerald-500',
      benefits: ['Skóre 0-100', 'Návr hy na zlepšenie', 'Detailná analýza'],
    },
    {
      id: 'analytics',
      icon: BarChart3,
      title: 'Trhová analytika',
      description: 'Inteligentné insights o trhu v reálnom čase',
      color: 'bg-orange-500',
      benefits: ['Cenové trendy', 'Populárne kategórie', 'AI insights'],
    },
    {
      id: 'performance',
      icon: Target,
      title: 'Výkonnostné insights',
      description: 'Personalizované odporúčania pre zlepšenie predaja',
      color: 'bg-red-500',
      benefits: ['Analýza výkonu', 'AI odporúčania', 'Optimalizácia'],
    },
    {
      id: 'notifications',
      icon: Bell,
      title: 'Smart notifikácie',
      description: 'AI prioritizované upozornenia',
      color: 'bg-yellow-500',
      benefits: ['Automatická priorita', 'Filtrovanie', 'Reálny čas'],
    },
    {
      id: 'price',
      icon: TrendingUp,
      title: 'Cenové odporúčania',
      description: 'AI navrhne optimálnu cenu pre váš produkt',
      color: 'bg-green-500',
      benefits: ['Trhová analýza', 'Konkurenčné ceny', 'Maximalizácia zisku'],
    },
    {
      id: 'fraud',
      icon: Shield,
      title: 'Detekcia podvodov',
      description: 'Automatická ochrana pred podvodnými inzerátmi',
      color: 'bg-indigo-500',
      benefits: ['AI bezpečnosť', 'Okamžitá detekcia', '99% presnosť'],
    },
    {
      id: 'description',
      icon: Lightbulb,
      title: 'Generovanie popisov',
      description: 'AI vytvorí profesionálny popis za pár sekúnd',
      color: 'bg-pink-500',
      benefits: ['3-krokový wizard', 'SEO optimalizácia', 'Profesionálny štýl'],
    },
    {
      id: 'semantic',
      icon: Search,
      title: 'Sémantické vyhľadávanie',
      description: 'Chápanie významu vašich hľadaní',
      color: 'bg-cyan-500',
      benefits: ['Inteligentné výsledky', 'Kontextové vyhľadávanie', 'Lepšie zásahy'],
    },
    {
      id: 'comparison',
      icon: Eye,
      title: 'Porovnanie produktov',
      description: 'Detailné AI porovnanie až 4 produktov',
      color: 'bg-teal-500',
      benefits: ['Side-by-side porovnanie', 'AI hodnotenie', 'Odporúčania'],
    },
    {
      id: 'recommendations',
      icon: Zap,
      title: 'Personalizované odporúčania',
      description: 'AI odporúčania na mieru pre každého používateľa',
      color: 'bg-violet-500',
      benefits: ['Učiaca sa AI', 'Relevantné návrhy', 'Zvýšený engagement'],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-100 to-blue-100 px-4 py-2 rounded-full mb-4">
            <Sparkles className="h-5 w-5 text-emerald-600" />
            <span className="text-sm font-semibold text-emerald-700">Powered by Google Gemini AI</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            AI Funkcie Kupado.sk
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Najmodernejšia AI marketplace platforma v Európe. Inteligentné funkcie, ktoré vám pomôžu predávať rýchlejšie a efektívnejšie.
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 gap-2">
            <TabsTrigger value="overview">Prehľad</TabsTrigger>
            <TabsTrigger value="analytics">Analytika</TabsTrigger>
            <TabsTrigger value="tools">Nástroje</TabsTrigger>
            <TabsTrigger value="notifications">Notifikácie</TabsTrigger>
            <TabsTrigger value="performance">Výkon</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <Card className="p-8 bg-gradient-to-r from-emerald-500 to-blue-600 text-white">
              <div className="flex items-start justify-between">
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold">15+ AI Funkcií</h2>
                  <p className="text-lg text-emerald-50 max-w-2xl">
                    Využívame najnovšie technológie umelej inteligencie od Google pre poskytnutie
                    najlepšieho marketplace zážitku. Každá funkcia je navrhnutá tak, aby vám ušetrila čas a zvýšila úspešnosť predaja.
                  </p>
                  <div className="flex items-center gap-6 pt-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold">99%</div>
                      <div className="text-sm text-emerald-100">Presnosť AI</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">&lt;1s</div>
                      <div className="text-sm text-emerald-100">Odozva</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">24/7</div>
                      <div className="text-sm text-emerald-100">Dostupnosť</div>
                    </div>
                  </div>
                </div>
                <Brain className="h-32 w-32 opacity-20" />
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => (
                <Card
                  key={feature.id}
                  className="p-6 hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => setActiveDemo(feature.id)}
                >
                  <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{feature.description}</p>
                  <div className="space-y-2">
                    {feature.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>

            <Card className="p-8 bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200">
              <div className="flex items-start gap-4">
                <Sparkles className="h-8 w-8 text-emerald-600 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold mb-2">Prečo používať AI funkcie?</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Ušetrite čas:</strong> AI automatizuje časovo náročné úlohy</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Predávajte viac:</strong> Optimalizované inzeráty = vyššia konverzia</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Lepšie rozhodnutia:</strong> Data-driven insights pre úspešný predaj</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Bezpečnosť:</strong> Automatická ochrana pred podvodmi</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <AIMarketAnalytics />
          </TabsContent>

          <TabsContent value="tools" className="space-y-6">
            <VisualSimilarSearch />
          </TabsContent>

          <TabsContent value="notifications">
            {user ? (
              <SmartNotifications userId={user.id} />
            ) : (
              <Card className="p-12 text-center">
                <Bell className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Prihláste sa</h3>
                <p className="text-gray-600 mb-4">Pre zobrazenie notifikácií sa prosím prihláste</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="performance">
            {user ? (
              <AIPerformanceInsights userId={user.id} />
            ) : (
              <Card className="p-12 text-center">
                <Target className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Prihláste sa</h3>
                <p className="text-gray-600 mb-4">Pre zobrazenie výkonnostných insights sa prosím prihláste</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-12 text-center">
          <Card className="p-8 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
            <h2 className="text-2xl font-bold mb-4">Začnite využívať AI funkcie ešte dnes</h2>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Všetky AI funkcie sú dostupné zadarmo pre všetkých používateľov.
              Prihláste sa a začnite predávať efektívnejšie s pomocou umelej inteligencie.
            </p>
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
              <Sparkles className="h-5 w-5 mr-2" />
              Vyskúšať AI funkcie
            </Button>
          </Card>
        </div>
      </main>

      <Footer />
      <AIChatAssistant contextType="general" />
    </div>
  );
}
