'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Zap, Star, Crown } from 'lucide-react';

export default function PricingPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-emerald-50 to-white dark:from-gray-900 dark:to-gray-800 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Cenník služieb
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Zvýšte viditeľnosť svojich inzerátov a predávajte rýchlejšie
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="p-8 relative">
              <div className="mb-6">
                <div className="bg-gray-100 dark:bg-gray-800 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Základný</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Pre príležitostných predajcov</p>
              </div>

              <div className="mb-6">
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  Zadarmo
                </div>
                <p className="text-sm text-gray-500">Neobmedzený počet inzerátov</p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Neomedzený počet inzerátov</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Až 10 fotografií na inzerát</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Interný chat s kupujúcimi</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Základná štatistika inzerátu</span>
                </li>
              </ul>

              <Button variant="outline" className="w-full">
                Začať bezplatne
              </Button>
            </Card>

            <Card className="p-8 relative border-2 border-emerald-500 shadow-xl">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Najpopulárnejšie
              </div>

              <div className="mb-6">
                <div className="bg-emerald-100 dark:bg-emerald-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Star className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Zvýraznený</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Pre aktívnych predajcov</p>
              </div>

              <div className="mb-6">
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  5 €
                </div>
                <p className="text-sm text-gray-500">Za inzerát / 7 dní</p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Všetko zo Základného balíčka</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Zvýraznenie farbou na hlavnej stránke</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Pozícia v TOP výsledkoch vyhľadávania</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">3x viac zobrazení</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Detailné štatistiky a analýzy</span>
                </li>
              </ul>

              <Button className="w-full bg-emerald-500 hover:bg-emerald-600">
                Vybrať balíček
              </Button>
            </Card>

            <Card className="p-8 relative border-2 border-yellow-500">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Premium
              </div>

              <div className="mb-6">
                <div className="bg-yellow-100 dark:bg-yellow-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Crown className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">TOP pozícia</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Pre profesionálov</p>
              </div>

              <div className="mb-6">
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  15 €
                </div>
                <p className="text-sm text-gray-500">Za inzerát / 14 dní</p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Všetko zo Zvýrazneného balíčka</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">TOP 3 pozícia na hlavnej stránke</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Priorita vo vyhľadávaní</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Exkluzívny badge "TOP"</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">5x viac zobrazení</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Prémiová podpora</span>
                </li>
              </ul>

              <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white">
                Vybrať balíček
              </Button>
            </Card>
          </div>

          <Card className="p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Doplnkové služby</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border dark:border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Obnovenie inzerátu</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  Posunite váš inzerát na vrchol zoznamu
                </p>
                <div className="text-2xl font-bold text-emerald-600 mb-2">2 €</div>
                <p className="text-sm text-gray-500">Jednorazové obnovenie</p>
              </div>

              <div className="border dark:border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Extra fotografie</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  Pridajte až 20 fotografií namiesto štandardných 10
                </p>
                <div className="text-2xl font-bold text-emerald-600 mb-2">1 €</div>
                <p className="text-sm text-gray-500">Na inzerát</p>
              </div>

              <div className="border dark:border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Zdieľanie na sociálnych sieťach</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  Propagujeme váš inzerát na našich sociálnych sieťach
                </p>
                <div className="text-2xl font-bold text-emerald-600 mb-2">10 €</div>
                <p className="text-sm text-gray-500">Kampaň na 3 dni</p>
              </div>

              <div className="border dark:border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Balíček mincí</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  Kúpte si mince a použite ich na zvýraznenia a služby
                </p>
                <div className="text-2xl font-bold text-emerald-600 mb-2">Od 5 €</div>
                <p className="text-sm text-gray-500">Rôzne balíčky k dispozícii</p>
              </div>
            </div>
          </Card>

          <Card className="p-8 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                Máte otázky ohľadom cenníka?
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Kontaktujte nás a radi vám pomôžeme vybrať najlepší balíček pre vaše potreby
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Button variant="outline" size="lg">
                  Kontaktovať podporu
                </Button>
                <Button className="bg-emerald-500 hover:bg-emerald-600" size="lg">
                  Zobraziť FAQ
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}
