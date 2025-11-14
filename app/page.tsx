'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { CategoryGrid } from '@/components/CategoryGrid';
import { FilterBar, FilterValues } from '@/components/FilterBar';
import { AdCard } from '@/components/AdCard';
import { Footer } from '@/components/Footer';
import { supabase, Ad } from '@/lib/supabase';
import { useSearchParams, useRouter } from 'next/navigation';
import { parseSearchQuery } from '@/lib/search-parser';
import { performEnhancedSearch } from '@/lib/search-utils';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Chrome as Home, SlidersHorizontal, Users, Package, Shield, TrendingUp, Sparkles, Award, Clock, CheckCircle, BarChart3, Eye } from 'lucide-react';
import { AdSenseInFeed } from '@/components/AdSenseInFeed';
import { AIChatAssistant } from '@/components/AIChatAssistant';
import { AIRecommendations } from '@/components/AIRecommendations';
import { SearchWithSuggestions } from '@/components/SearchWithSuggestions';


export default function HomePage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();

  const [heroFilters, setHeroFilters] = useState({
    searchQuery: '',
    category: 'vsetky',
    location: '',
    offer: '',
    propertyType: '',
    postalCode: '',
    radius: '10',
    priceFrom: '',
    priceTo: ''
  });

  const fetchAds = async (filters?: FilterValues) => {
    setLoading(true);
    try {
      const searchQuery = searchParams.get('search');

      if (searchQuery) {
        console.log('[Homepage] Using enhanced search for:', searchQuery);

        const parsed = parseSearchQuery(searchQuery);
        console.log('[Homepage] Parsed filters:', JSON.stringify(parsed.filters));
        console.log('[Homepage] Search terms:', parsed.searchTerms);

        const searchResult = await performEnhancedSearch(supabase, parsed, 50);
        console.log('[Homepage] Found', searchResult.totalCount, 'ads');

        setAds(searchResult.ads);
        setLoading(false);
        return;
      }

      let query = supabase
        .from('ads')
        .select('*')
        .eq('status', 'active')
        .order('is_boosted', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(50);

      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category_id', filters.category);
      }

      if (filters?.priceFrom) {
        const priceFrom = parseFloat(filters.priceFrom);
        query = query.gte('price', priceFrom);
      }

      if (filters?.priceTo) {
        const priceTo = parseFloat(filters.priceTo);
        query = query.lte('price', priceTo);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching ads:', error);
      } else {
        setAds(data || []);
      }
    } catch (error) {
      console.error('Error fetching ads:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      setHeroFilters(prev => ({ ...prev, searchQuery }));
    }
    fetchAds();
  }, [searchParams]);

  const handleHeroSearch = () => {
    const params = new URLSearchParams();

    if (heroFilters.searchQuery.trim()) {
      params.set('search', heroFilters.searchQuery.trim());
    }

    if (heroFilters.category !== 'vsetky') {
      router.push(`/kategoria/${heroFilters.category}?${params.toString()}`);
    } else {
      router.push(`/?${params.toString()}`);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-emerald-50 to-white dark:from-gray-900 dark:to-gray-800 pb-20 md:pb-0">
        <div className="relative h-auto lg:h-[500px] overflow-hidden rounded-none lg:rounded-2xl mx-0 lg:mx-4 my-0 lg:my-4 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 shadow-2xl">
          <div className="absolute inset-0">
            <svg className="absolute top-0 left-0 w-full h-full opacity-30" viewBox="0 0 1440 800" fill="none">
              <path d="M0 0C300 150 600 200 900 150C1200 100 1350 50 1440 0V800H0V0Z" fill="rgba(255,255,255,0.1)"/>
              <path d="M0 200C400 350 800 400 1200 300C1300 270 1370 240 1440 200V800H0V200Z" fill="rgba(255,255,255,0.05)"/>
            </svg>
          </div>

          <div className="absolute inset-y-0 right-0 w-1/2 hidden lg:flex items-center justify-center pointer-events-none pr-8">
            <img
              src="/ChatGPT Image 24. 10. 2025, 15_11_32 (1).png"
              alt="Kupedo Illustration"
              style={{ height: '105%' }}
              className="w-auto object-contain drop-shadow-2xl"
            />
          </div>

          <div className="container mx-auto px-4 lg:px-6 py-8 lg:py-0 h-full relative z-10 flex items-center">
            <div className="w-full lg:max-w-xl text-white">
              <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold mb-3 lg:mb-4 leading-tight drop-shadow-lg">
                Kúp. Predaj. Dohodni.
              </h1>
              <p className="text-base md:text-lg lg:text-xl mb-4 lg:mb-5 opacity-95 font-medium">
                Slovenský marketplace pre všetko čo potrebujete. Rýchlo a bezpečne.
              </p>
              <div className="flex gap-2 mb-4 lg:mb-6">
                <div className="w-2.5 h-2.5 bg-white rounded-full opacity-100"></div>
                <div className="w-2.5 h-2.5 bg-white rounded-full opacity-50"></div>
                <div className="w-2.5 h-2.5 bg-white rounded-full opacity-30"></div>
                <div className="w-2.5 h-2.5 bg-white rounded-full opacity-30"></div>
                <div className="w-2.5 h-2.5 bg-white rounded-full opacity-30"></div>
              </div>

              <div className="hidden lg:block bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-5" style={{ width: '130%', maxWidth: '850px' }}>
                <div className="mb-3">
                  <label className="text-xs text-gray-700 mb-1 block font-semibold">Čo hľadáte?</label>
                  <SearchWithSuggestions placeholder="napr. iPhone 15, byt v Bratislave..." className="w-full" />
                </div>
                <div className="grid grid-cols-5 gap-2 mb-3">
                  <div>
                    <label className="text-xs text-gray-700 mb-1 block font-semibold">Kategória</label>
                    <Select
                      value={heroFilters.category}
                      onValueChange={(v) => setHeroFilters({ ...heroFilters, category: v })}
                    >
                      <SelectTrigger className="h-10 text-xs text-gray-900">
                        <SelectValue placeholder="Všetky" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vsetky">Všetky</SelectItem>
                        <SelectItem value="zvierata">Zvieratá</SelectItem>
                        <SelectItem value="deti">Deti</SelectItem>
                        <SelectItem value="reality">Reality</SelectItem>
                        <SelectItem value="praca">Práca</SelectItem>
                        <SelectItem value="auto">Auto</SelectItem>
                        <SelectItem value="motocykle">Motocykle</SelectItem>
                        <SelectItem value="stroje">Stroje</SelectItem>
                        <SelectItem value="dom-zahrada">Dom a záhrada</SelectItem>
                        <SelectItem value="pc">PC</SelectItem>
                        <SelectItem value="mobily">Mobily</SelectItem>
                        <SelectItem value="foto">Foto</SelectItem>
                        <SelectItem value="elektro">Elektro</SelectItem>
                        <SelectItem value="sport">Šport</SelectItem>
                        <SelectItem value="hudba">Hudba</SelectItem>
                        <SelectItem value="vstupenky">Vstupenky</SelectItem>
                        <SelectItem value="knihy">Knihy</SelectItem>
                        <SelectItem value="nabytok">Nábytok</SelectItem>
                        <SelectItem value="oblecenie">Oblečenie</SelectItem>
                        <SelectItem value="sluzby">Služby</SelectItem>
                        <SelectItem value="ostatne">Ostatné</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs text-gray-700 mb-1 block font-semibold">PSČ</label>
                    <Input
                      placeholder="napr. 81101"
                      value={heroFilters.postalCode}
                      onChange={(e) => setHeroFilters({ ...heroFilters, postalCode: e.target.value })}
                      className="h-10 text-xs text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-700 mb-1 block font-semibold">Okolie</label>
                    <Select
                      value={heroFilters.radius}
                      onValueChange={(v) => setHeroFilters({ ...heroFilters, radius: v })}
                    >
                      <SelectTrigger className="h-10 text-xs text-gray-900">
                        <SelectValue placeholder="10 km" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 km</SelectItem>
                        <SelectItem value="10">10 km</SelectItem>
                        <SelectItem value="20">20 km</SelectItem>
                        <SelectItem value="50">50 km</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs text-gray-700 mb-1 block font-semibold">Cena od</label>
                    <Input
                      type="number"
                      placeholder="0 €"
                      value={heroFilters.priceFrom}
                      onChange={(e) => setHeroFilters({ ...heroFilters, priceFrom: e.target.value })}
                      className="h-10 text-xs text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-700 mb-1 block font-semibold">Cena do</label>
                    <Input
                      type="number"
                      placeholder="∞ €"
                      value={heroFilters.priceTo}
                      onChange={(e) => setHeroFilters({ ...heroFilters, priceTo: e.target.value })}
                      className="h-10 text-xs text-gray-900"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleHeroSearch}
                  className="w-full h-12 text-base font-semibold bg-emerald-500 hover:bg-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Search className="mr-2 h-5 w-5" />
                  Hľadať inzeráty
                </Button>
              </div>

              <div className="lg:hidden bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-4">
                <div className="mb-3">
                  <label className="text-xs text-gray-700 mb-1 block font-semibold">Čo hľadáte?</label>
                  <SearchWithSuggestions placeholder="napr. iPhone, byt..." className="w-full" />
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div>
                    <label className="text-xs text-gray-700 mb-1 block font-semibold">Kategória</label>
                    <Select
                      value={heroFilters.category}
                      onValueChange={(v) => setHeroFilters({ ...heroFilters, category: v })}
                    >
                      <SelectTrigger className="h-9 text-xs text-gray-900">
                        <SelectValue placeholder="Všetky" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vsetky">Všetky</SelectItem>
                        <SelectItem value="zvierata">Zvieratá</SelectItem>
                        <SelectItem value="deti">Deti</SelectItem>
                        <SelectItem value="reality">Reality</SelectItem>
                        <SelectItem value="praca">Práca</SelectItem>
                        <SelectItem value="auto">Auto</SelectItem>
                        <SelectItem value="motocykle">Motocykle</SelectItem>
                        <SelectItem value="stroje">Stroje</SelectItem>
                        <SelectItem value="dom-zahrada">Dom a záhrada</SelectItem>
                        <SelectItem value="pc">PC</SelectItem>
                        <SelectItem value="mobily">Mobily</SelectItem>
                        <SelectItem value="foto">Foto</SelectItem>
                        <SelectItem value="elektro">Elektro</SelectItem>
                        <SelectItem value="sport">Šport</SelectItem>
                        <SelectItem value="hudba">Hudba</SelectItem>
                        <SelectItem value="vstupenky">Vstupenky</SelectItem>
                        <SelectItem value="knihy">Knihy</SelectItem>
                        <SelectItem value="nabytok">Nábytok</SelectItem>
                        <SelectItem value="oblecenie">Oblečenie</SelectItem>
                        <SelectItem value="sluzby">Služby</SelectItem>
                        <SelectItem value="ostatne">Ostatné</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs text-gray-700 mb-1 block font-semibold">PSČ</label>
                    <Input
                      placeholder="81101"
                      value={heroFilters.postalCode}
                      onChange={(e) => setHeroFilters({ ...heroFilters, postalCode: e.target.value })}
                      className="h-9 text-xs text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-700 mb-1 block font-semibold">Okolie</label>
                    <Select
                      value={heroFilters.radius}
                      onValueChange={(v) => setHeroFilters({ ...heroFilters, radius: v })}
                    >
                      <SelectTrigger className="h-9 text-xs text-gray-900">
                        <SelectValue placeholder="10 km" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 km</SelectItem>
                        <SelectItem value="10">10 km</SelectItem>
                        <SelectItem value="20">20 km</SelectItem>
                        <SelectItem value="50">50 km</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs text-gray-700 mb-1 block font-semibold">Cena od</label>
                    <Input
                      type="number"
                      placeholder="0 €"
                      value={heroFilters.priceFrom}
                      onChange={(e) => setHeroFilters({ ...heroFilters, priceFrom: e.target.value })}
                      className="h-9 text-xs text-gray-900"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="text-xs text-gray-700 mb-1 block font-semibold">Cena do</label>
                  <Input
                    type="number"
                    placeholder="∞ €"
                    value={heroFilters.priceTo}
                    onChange={(e) => setHeroFilters({ ...heroFilters, priceTo: e.target.value })}
                    className="h-9 text-xs text-gray-900"
                  />
                </div>

                <Button
                  onClick={handleHeroSearch}
                  className="w-full h-11 text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 transition-all duration-200 shadow-lg"
                >
                  <Search className="mr-2 h-4 w-4" />
                  Hľadať inzeráty
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 lg:py-12">
          <div className="mb-6 lg:mb-8">
            <h2 className="text-xl lg:text-2xl font-bold mb-3 lg:mb-4 text-[#2C3E50] dark:text-white">Kategórie</h2>
            <CategoryGrid />
          </div>

          <div>
            <h2 className="text-xl lg:text-2xl font-bold mb-3 lg:mb-4 text-[#2C3E50] dark:text-white">
              Najnovšie inzeráty
            </h2>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-80 bg-gray-200 animate-pulse rounded-lg" />
                ))}
              </div>
            ) : ads.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                Žiadne inzeráty
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {ads.map((ad, index) => (
                  <React.Fragment key={ad.id}>
                    <AdCard
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
                    {(index + 1) % 8 === 0 && index !== ads.length - 1 && (
                      <AdSenseInFeed />
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>

          <div className="mt-16 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 lg:p-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-center mb-4 text-gray-900 dark:text-white">
              Prečo si vybrať Kupado.sk?
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
              Moderná platforma s tisíckami aktívnych používateľov a dennými novými inzerátmi
            </p>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl mb-4">
                  <Users className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">50K+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Aktívnych používateľov</div>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl mb-4">
                  <Package className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">100K+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Aktívnych inzerátov</div>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl mb-4">
                  <Shield className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">100%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Bezpečné transakcie</div>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl mb-4">
                  <TrendingUp className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">500+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Denných transakcií</div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <AIRecommendations />
        </div>

        {/* AI Features Showcase */}
        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full mb-4 shadow-sm">
                <Sparkles className="h-5 w-5 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">AI Funkcie</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Inteligentné nástroje pre váš úspech
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Využite pokročilé AI funkcie pre rýchlejší a efektívnejší predaj
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <button
                onClick={() => router.push('/ai-features')}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-xl transition-all text-left"
              >
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Search className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Vizuálne vyhľadávanie
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Nahrajte fotku a nájdite podobné produkty
                </p>
                <span className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                  Vyskúšať →
                </span>
              </button>

              <button
                onClick={() => router.push('/ai-features')}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-xl transition-all text-left"
              >
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Trhová analytika
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Cenové trendy a AI insights v reálnom čase
                </p>
                <span className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                  Zobraziť →
                </span>
              </button>

              <button
                onClick={() => router.push('/porovnat')}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-xl transition-all text-left"
              >
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Eye className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Porovnanie produktov
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Detailné AI porovnanie až 4 produktov
                </p>
                <span className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                  Porovnať →
                </span>
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <AIChatAssistant contextType="general" />
    </>
  );
}
