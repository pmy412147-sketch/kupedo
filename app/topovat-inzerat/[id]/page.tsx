'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Sparkles, TrendingUp, Eye, Clock } from 'lucide-react';

interface Ad {
  id: string;
  title: string;
  price: number;
  is_boosted: boolean;
  boosted_until: string | null;
}

const BOOST_PACKAGES = [
  {
    id: '7day',
    name: '7 dní',
    duration: 7,
    coins: 50,
    savings: 0,
    popular: false,
    benefits: [
      'Zvýraznenie v zozname',
      'Vyššia pozícia vo výsledkoch',
      '+300% viac zobrazení'
    ]
  },
  {
    id: '14day',
    name: '14 dní',
    duration: 14,
    coins: 90,
    savings: 10,
    popular: true,
    benefits: [
      'Zvýraznenie v zozname',
      'Vyššia pozícia vo výsledkoch',
      '+300% viac zobrazení',
      'Ušetríte 10 mincí'
    ]
  },
  {
    id: '30day',
    name: '30 dní',
    duration: 30,
    coins: 150,
    savings: 50,
    popular: false,
    benefits: [
      'Zvýraznenie v zozname',
      'Vyššia pozícia vo výsledkoch',
      '+300% viac zobrazení',
      'Ušetríte 50 mincí',
      'Najlepšia hodnota'
    ]
  }
];

export default function BoostAdPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [ad, setAd] = useState<Ad | null>(null);
  const [userCoins, setUserCoins] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (user) {
      loadAd();
      loadUserCoins();
    }
  }, [user, params.id]);

  const loadAd = async () => {
    const { data, error } = await supabase
      .from('ads')
      .select('id, title, price, is_boosted, boosted_until')
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Error loading ad:', error);
      return;
    }

    if (data) {
      setAd(data);
    }
    setLoading(false);
  };

  const loadUserCoins = async () => {
    const { data } = await supabase
      .from('user_coins')
      .select('balance')
      .eq('user_id', user?.id)
      .single();

    if (data) {
      setUserCoins(data.balance);
    }
  };

  const handleBoost = async (packageId: string) => {
    if (!user || !ad) return;

    const selectedPackage = BOOST_PACKAGES.find(p => p.id === packageId);
    if (!selectedPackage) return;

    if (userCoins < selectedPackage.coins) {
      alert('Nemáte dostatok mincí. Navštívte stránku Mince a dobite si kredit.');
      router.push('/mince');
      return;
    }

    setProcessing(true);

    try {
      const boostedUntil = new Date();
      boostedUntil.setDate(boostedUntil.getDate() + selectedPackage.duration);

      const { error: updateError } = await supabase
        .from('ads')
        .update({
          is_boosted: true,
          boosted_until: boostedUntil.toISOString()
        })
        .eq('id', ad.id);

      if (updateError) throw updateError;

      const { error: coinsError } = await supabase.rpc('deduct_coins', {
        user_uuid: user.id,
        amount: selectedPackage.coins
      });

      if (coinsError) throw coinsError;

      await supabase.from('coin_transactions').insert({
        user_id: user.id,
        amount: -selectedPackage.coins,
        type: 'boost',
        description: `TOP inzerát: ${ad.title} (${selectedPackage.name})`
      });

      alert(`Inzerát bol úspešne TOP-ovaný na ${selectedPackage.duration} dní!`);
      router.push(`/inzerat/${ad.id}`);
    } catch (error) {
      console.error('Error boosting ad:', error);
      alert('Nepodarilo sa TOP-ovať inzerát. Skúste to prosím znova.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <p className="text-gray-500">Načítavam...</p>
        </div>
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-gray-500">Inzerát sa nenašiel</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isAlreadyBoosted = ad.is_boosted && ad.boosted_until && new Date(ad.boosted_until) > new Date();

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">TOP-ovať inzerát</h1>
        <p className="text-gray-600">Zvýšte viditeľnosť vášho inzerátu a získajte viac záujemcov</p>
      </div>

      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Váš inzerát</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-lg">{ad.title}</p>
                <p className="text-emerald-600 font-bold">
                  {new Intl.NumberFormat('sk-SK', { style: 'currency', currency: 'EUR' }).format(ad.price)}
                </p>
              </div>
              {isAlreadyBoosted && (
                <div className="flex items-center gap-2 text-emerald-600">
                  <Sparkles className="h-5 w-5" />
                  <span className="font-semibold">Už je TOP</span>
                </div>
              )}
            </div>
            {isAlreadyBoosted && ad.boosted_until && (
              <p className="text-sm text-gray-500 mt-2">
                TOP platí do: {new Date(ad.boosted_until).toLocaleDateString('sk-SK', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mb-8">
        <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-emerald-600" />
              Prečo TOP-ovať inzerát?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <Eye className="h-5 w-5 text-emerald-600 mt-1" />
                <div>
                  <p className="font-semibold">Viac zobrazení</p>
                  <p className="text-sm text-gray-600">Až o 300% viac ľudí uvidí váš inzerát</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-emerald-600 mt-1" />
                <div>
                  <p className="font-semibold">Zvýraznenie</p>
                  <p className="text-sm text-gray-600">Váš inzerát bude farebne zvýraznený</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-emerald-600 mt-1" />
                <div>
                  <p className="font-semibold">Vyššia pozícia</p>
                  <p className="text-sm text-gray-600">Zobrazí sa vyššie vo výsledkoch</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Vyberte balíček</h2>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Váš zostatok:</span>
            <span className="font-bold text-lg text-emerald-600">{userCoins} mincí</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {BOOST_PACKAGES.map((pkg) => (
          <Card
            key={pkg.id}
            className={`relative ${pkg.popular ? 'border-emerald-500 border-2 shadow-lg' : ''}`}
          >
            {pkg.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-emerald-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Najpopulárnejšie
                </span>
              </div>
            )}
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-2">
                <Clock className="h-5 w-5 text-emerald-600" />
                {pkg.savings > 0 && (
                  <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-semibold">
                    Ušetríte {pkg.savings} mincí
                  </span>
                )}
              </div>
              <CardTitle className="text-2xl">{pkg.name}</CardTitle>
              <CardDescription>
                <span className="text-3xl font-bold text-emerald-600">{pkg.coins}</span>
                <span className="text-gray-600 ml-1">mincí</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {pkg.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => handleBoost(pkg.id)}
                disabled={processing || userCoins < pkg.coins}
                className="w-full"
                variant={pkg.popular ? 'default' : 'outline'}
              >
                {processing ? 'Spracováva sa...' : userCoins < pkg.coins ? 'Nedostatok mincí' : 'Aktivovať'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {userCoins < BOOST_PACKAGES[0].coins && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="py-6">
            <p className="text-center text-amber-900 mb-4">
              Nemáte dostatok mincí na TOP-ovanie inzerátu.
            </p>
            <div className="flex justify-center">
              <Button onClick={() => router.push('/mince')} variant="outline">
                Kúpiť mince
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
