'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Coins, ShoppingCart, History, Check, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface CoinPackage {
  id: string;
  name: string;
  coins: number;
  bonus_coins: number;
  price_eur: number;
  display_order: number;
}

interface CoinTransaction {
  id: string;
  amount: number;
  transaction_type: string;
  description: string;
  created_at: string;
}

export default function MincePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [packages, setPackages] = useState<CoinPackage[]>([]);
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [coinBalance, setCoinBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    fetchData();

    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    const canceled = params.get('canceled');

    if (success === 'true') {
      toast.success('Platba úspešná!', {
        description: 'Vaše mince boli pripísané na účet. Môže to trvať niekoľko sekúnd.',
        duration: 5000,
      });
      window.history.replaceState({}, '', '/mince');
    }

    if (canceled === 'true') {
      toast.info('Platba zrušená', {
        description: 'Vaša platba bola zrušená. Mince neboli odpísané.',
        duration: 4000,
      });
      window.history.replaceState({}, '', '/mince');
    }
  }, [user, router]);

  const fetchData = async () => {
    setLoading(true);

    const { data: packagesData } = await supabase
      .from('coin_packages')
      .select('*')
      .eq('is_active', true)
      .order('display_order');

    if (packagesData) {
      setPackages(packagesData);
    }

    const { data: coinsData } = await supabase
      .from('user_coins')
      .select('balance')
      .eq('user_id', user!.id)
      .maybeSingle();

    if (coinsData) {
      setCoinBalance(coinsData.balance);
    }

    const { data: transactionsData } = await supabase
      .from('coin_transactions')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (transactionsData) {
      setTransactions(transactionsData);
    }

    setLoading(false);
  };

  const handlePurchase = async (pkg: CoinPackage) => {
    if (!user) return;

    setPurchasing(true);

    try {
      // Check if Stripe keys are configured
      const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

      if (!stripeKey) {
        toast.info('Stripe platby', {
          description: 'Pre aktiváciu platieb je potrebné nakonfigurovať Stripe API kľúče. Kontaktujte administrátora.',
          duration: 5000,
        });
        setPurchasing(false);
        return;
      }

      // Create Stripe Checkout Session
      const Stripe = (await import('@stripe/stripe-js')).loadStripe;
      const stripe = await Stripe(stripeKey);

      if (!stripe) {
        throw new Error('Failed to load Stripe');
      }

      // Call backend to create checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageId: pkg.id,
          userId: user.id,
          coins: pkg.coins,
          bonusCoins: pkg.bonus_coins,
          price: pkg.price_eur,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { sessionId } = await response.json();

      // Redirect to Stripe Checkout
      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      toast.error('Chyba pri platbe', {
        description: error.message || 'Nepodarilo sa spracovať platbu. Skúste to prosím znova.',
      });
    } finally {
      setPurchasing(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('sk-SK', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'welcome_bonus':
      case 'listing_reward':
      case 'purchase':
      case 'refund':
      case 'admin_adjustment':
        return 'text-green-600 dark:text-green-400';
      case 'boost_payment':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getTransactionLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      welcome_bonus: 'Uvítací bonus',
      listing_reward: 'Odmena za inzerát',
      purchase: 'Nákup mincí',
      boost_payment: 'Topovanie inzerátu',
      admin_adjustment: 'Úprava správcom',
      refund: 'Vrátenie mincí',
    };
    return labels[type] || type;
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900 mb-4">
            <Coins className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Kupado Mince
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Používajte mince na topovanie vašich inzerátov a získajte väčšiu viditeľnosť
          </p>

          <Card className="inline-block bg-white dark:bg-slate-800 border-2 border-emerald-200 dark:border-emerald-800">
            <CardContent className="pt-6 px-8 pb-6">
              <div className="text-sm text-muted-foreground mb-2">Váš aktuálny zostatok</div>
              <div className="flex items-center gap-3">
                <Coins className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                <span className="text-5xl font-bold text-emerald-700 dark:text-emerald-300">
                  {coinBalance}
                </span>
                <span className="text-2xl text-muted-foreground">mincí</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="packages" className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="packages" className="text-base">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Kúpiť mince
            </TabsTrigger>
            <TabsTrigger value="history" className="text-base">
              <History className="h-4 w-4 mr-2" />
              História transakcií
            </TabsTrigger>
          </TabsList>

          <TabsContent value="packages">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {packages.map((pkg) => {
                const totalCoins = pkg.coins + pkg.bonus_coins;
                const hasBonus = pkg.bonus_coins > 0;

                return (
                  <Card
                    key={pkg.id}
                    className="relative overflow-hidden hover:shadow-xl transition-all duration-300 border-2 hover:border-emerald-300 dark:hover:border-emerald-700"
                  >
                    {hasBonus && (
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold shadow-lg">
                          <Sparkles className="h-3 w-3 mr-1" />
                          +{pkg.bonus_coins} bonus
                        </Badge>
                      </div>
                    )}

                    <CardHeader className="text-center pb-4">
                      <CardTitle className="text-2xl mb-2">{pkg.name}</CardTitle>
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <Coins className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-4xl font-bold text-emerald-700 dark:text-emerald-300">
                          {totalCoins}
                        </span>
                        <span className="text-xl text-muted-foreground">mincí</span>
                      </div>
                      {hasBonus && (
                        <div className="text-sm text-muted-foreground">
                          {pkg.coins} + {pkg.bonus_coins} bonus
                        </div>
                      )}
                    </CardHeader>

                    <CardContent className="text-center">
                      <div className="mb-6">
                        <span className="text-4xl font-bold">€{pkg.price_eur}</span>
                      </div>

                      <Button
                        onClick={() => handlePurchase(pkg)}
                        disabled={purchasing}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-lg py-6"
                      >
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        {purchasing ? 'Spracúvam...' : 'Kúpiť teraz'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Ako fungujú mince?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 mt-2" />
                  <p className="text-sm text-muted-foreground">
                    <strong>Zarábajte mince:</strong> Dostanete mince za registráciu a pridávanie nových inzerátov
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 mt-2" />
                  <p className="text-sm text-muted-foreground">
                    <strong>Topujte inzeráty:</strong> Použite mince na topovanie vašich inzerátov a zobrazte sa na prvých pozíciách
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 mt-2" />
                  <p className="text-sm text-muted-foreground">
                    <strong>Väčšia viditeľnosť:</strong> Topované inzeráty získajú až 10x viac zobrazení a kontaktov
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>História transakcií</CardTitle>
                <CardDescription>
                  Prehľad všetkých vašich mincových transakcií
                </CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Zatiaľ nemáte žiadne transakcie</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="font-medium mb-1">{transaction.description}</div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <Badge variant="outline">
                              {getTransactionLabel(transaction.transaction_type)}
                            </Badge>
                            <span>{formatDate(transaction.created_at)}</span>
                          </div>
                        </div>
                        <div className={`text-2xl font-bold ${getTransactionColor(transaction.transaction_type)}`}>
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
