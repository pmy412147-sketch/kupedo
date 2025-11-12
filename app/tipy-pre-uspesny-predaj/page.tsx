'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Lightbulb, Camera, FileText, Euro, MessageSquare, Clock, TrendingUp, Shield } from 'lucide-react';

export default function TipsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-emerald-50 to-white dark:from-gray-900 dark:to-gray-800 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Tipy pre úspešný predaj
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Naučte sa, ako vytvoriť atraktívny inzerát a predať rýchlejšie
            </p>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-lg">
                  <Camera className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">1. Kvalitné fotografie</h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    Fotografie sú najdôležitejšou súčasťou vášho inzerátu. Používajte svetlé a čisté zábery z rôznych uhlov.
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                    <li>Fotografie robte pri dennom svetle</li>
                    <li>Vyčistite a upravte tovar pred fotením</li>
                    <li>Urobte minimálne 5-8 fotografií z rôznych uhlov</li>
                    <li>Zobrazte prípadné poškodenia alebo defekty</li>
                    <li>Nepoužívajte filtre, ukážte skutočný stav</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-lg">
                  <FileText className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">2. Podrobný a presný popis</h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    Dobrý popis odpovedá na všetky otázky potenciálneho kupujúceho ešte pred tým, než sa vás spýta.
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                    <li>Uveďte všetky technické parametre a špecifikácie</li>
                    <li>Popíšte stav tovaru, vek a použitie</li>
                    <li>Uveďte dôvod predaja</li>
                    <li>Zmieňte príslušenstvo a doplnky</li>
                    <li>Buďte úprimní ohľadom defektov</li>
                    <li>Použite správnu gramatiku a pravopis</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-lg">
                  <Euro className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">3. Správna cena</h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    Realistická cena je kľúčom k rýchlemu predaju. Príliš vysoká cena odradí kupujúcich, príliš nízka môže vzbudiť podozrenie.
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                    <li>Preskúmajte podobné inzeráty na trhu</li>
                    <li>Zohľadnite vek, stav a aktuálny dopyt</li>
                    <li>Nechajte si priestor na vyjednávanie (5-10%)</li>
                    <li>Aktualizujte cenu, ak sa tovar nepredáva</li>
                    <li>Pri výmene uveďte orientačnú hodnotu</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">4. Rýchla komunikácia</h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    Reagujte na správy čo najrýchlejšie. Každý odklad môže znamenať stratu potenciálneho kupca.
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                    <li>Odpovedajte do 24 hodín, ideálne ešte skôr</li>
                    <li>Buďte profesionálni a zdvorilí</li>
                    <li>Pripravte si odpovede na časté otázky</li>
                    <li>Ponúknite možnosť osobného stretnutia</li>
                    <li>Dodržiavajte dohodnuté termíny</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-lg">
                  <Clock className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">5. Správny čas zverejnenia</h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    Načasovanie môže ovplyvniť úspešnosť vášho inzerátu.
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                    <li>Najlepší čas: večer (18:00-21:00) a víkendy</li>
                    <li>Zohľadnite sezónnosť (napr. športové potreby, záhradná technika)</li>
                    <li>Aktualizujte inzerát pre lepšiu viditeľnosť</li>
                    <li>Sledujte výročné obdobia (Vianoce, začiatok školy, atď.)</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">6. Vylepšite viditeľnosť</h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    Využite naše plateé služby pre lepšiu viditeľnosť vášho inzerátu.
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                    <li>Zvážte zvýraznenie inzerátu na hlavnej stránke</li>
                    <li>TOP pozícia vo vyhľadávaní priláka viac záujemcov</li>
                    <li>Pravidelne obnovujte inzerát</li>
                    <li>Zdieľajte na sociálnych sieťach</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-lg">
                  <Shield className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">7. Bezpečnosť predaja</h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    Vždy dbajte na bezpečnosť pri osobnom stretnutí a platbe.
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                    <li>Stretávajte sa na verejných miestach</li>
                    <li>Berieť niekoho so sebou na stretnutie</li>
                    <li>Uprednostňujte platbu v hotovosti pri odovzdaní</li>
                    <li>Pri bankových prevodoch počkajte na potvrdenie</li>
                    <li>Dávajte pozor na podvodné správy a podozrivých kupujúcich</li>
                    <li>Nikdy neposkytujte osobné alebo bankové údaje cez správy</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>

          <Card className="mt-8 p-6 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800">
            <div className="flex items-start gap-4">
              <Lightbulb className="h-8 w-8 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Bonusový tip</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Ak váš inzerát nemal úspech po 2-3 týždňoch, zvážte úpravu ceny, pridanie nových fotografií
                  alebo prepracovanie popisu. Niekedy malé zmeny dokážu urobiť veľký rozdiel!
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}
