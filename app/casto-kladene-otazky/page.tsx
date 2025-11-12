'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle, Users, ShoppingCart, DollarSign, Shield, Settings } from 'lucide-react';

export default function FAQPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-emerald-50 to-white dark:from-gray-900 dark:to-gray-800 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Často kladené otázky
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Nájdite odpovede na najčastejšie otázky o používaní Kupado.sk
            </p>
          </div>

          <div className="space-y-8">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg">
                  <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Všeobecné otázky</h2>
              </div>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Čo je Kupado.sk?</AccordionTrigger>
                  <AccordionContent>
                    Kupado.sk je moderná slovenská online platforma pre kúpu a predaj tovaru a služieb.
                    Spájame kupujúcich a predajcov rýchlo, jednoducho a bezpečne. Ponúkame wide škálu kategórií
                    od elektroniky až po nehnuteľnosti.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>Je používanie Kupado.sk bezplatné?</AccordionTrigger>
                  <AccordionContent>
                    Áno, základné používanie Kupado.sk je úplne bezplatné. Môžete pridávať neobmedzený počet
                    inzerátov zadarmo. Ponúkame aj plateé služby pre zvýšenie viditeľnosti vašich inzerátov,
                    ako sú zvýraznenia a TOP pozície.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>Potrebujem sa zaregistrovať?</AccordionTrigger>
                  <AccordionContent>
                    Na prehliadanie inzerátov nemusíte byť registrovaný, ale pre pridávanie vlastných inzerátov,
                    ukladanie obľúbených položiek a komunikáciu s ostatnými používateľmi je potrebná registrácia.
                    Registrácia je rýchla a bezplatná.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger>Ako sa zaregistrujem?</AccordionTrigger>
                  <AccordionContent>
                    Kliknite na tlačidlo "Prihlásiť sa" v pravom hornom rohu, následne vyberte "Registrácia".
                    Zadajte svoju emailovú adresu a zvoľte heslo. Po registrácii dostanete potvrdzovací email.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg">
                  <ShoppingCart className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pre predajcov</h2>
              </div>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-5">
                  <AccordionTrigger>Ako pridám inzerát?</AccordionTrigger>
                  <AccordionContent>
                    Po prihlásení kliknite na tlačidlo "+ Pridať inzerát" v hornej lište. Vyplňte požadované
                    informácie (názov, popis, cena, kategória), pridajte fotografie a zverejnite. Váš inzerát
                    bude online do niekoľkých minút.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6">
                  <AccordionTrigger>Koľko fotografií môžem pridať?</AccordionTrigger>
                  <AccordionContent>
                    Pri základnom bezplatnom inzeráte môžete pridať až 10 fotografií. Pri platenej službe
                    "Extra fotografie" môžete pridať až 20 fotografií.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-7">
                  <AccordionTrigger>Ako dlho je môj inzerát aktívny?</AccordionTrigger>
                  <AccordionContent>
                    Základné bezplatné inzeráty sú aktívne 60 dní. Po uplynutí tejto doby môžete inzerát
                    obnoviť jedným kliknutím. Inzeráty s platbenými službami zostávajú aktívne po dobu
                    trvania platenej služby.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-8">
                  <AccordionTrigger>Môžem upraviť už zverejnený inzerát?</AccordionTrigger>
                  <AccordionContent>
                    Áno, kedykoľvek môžete upraviť svoj inzerát. Prejdite do sekcie "Moje inzeráty", vyberte
                    inzerát, ktorý chcete upraviť, a kliknite na "Upraviť". Môžete zmeniť text, cenu, pridať
                    alebo odobrať fotografie.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-9">
                  <AccordionTrigger>Čo znamená zvýraznený inzerát?</AccordionTrigger>
                  <AccordionContent>
                    Zvýraznený inzerát je viditeľnejší než bežné inzeráty. Zobrazuje sa s farebným pozadím
                    na hlavnej stránke a vo výsledkoch vyhľadávania, má prioritu v zoradení a získa 3x viac
                    zobrazení než štandardný inzerát.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg">
                  <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pre kupujúcich</h2>
              </div>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-10">
                  <AccordionTrigger>Ako kontaktujem predajcu?</AccordionTrigger>
                  <AccordionContent>
                    Na stránke inzerátu kliknite na tlačidlo "Kontaktovať predajcu". Otvorí sa interný chat,
                    kde môžete poslať správu priamo predajcovi. Všetka komunikácia prebíha cez našu platformu
                    pre vašu bezpečnosť.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-11">
                  <AccordionTrigger>Ako si môžem uložiť zaujímavé inzeráty?</AccordionTrigger>
                  <AccordionContent>
                    Pri každom inzeráte je ikona srdca. Kliknutím na ňu pridáte inzerát do obľúbených.
                    Všetky vaše obľúbené inzeráty nájdete v sekcii "Obľúbené" po prihlásení.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-12">
                  <AccordionTrigger>Ako vyhľadávam konkrétny tovar?</AccordionTrigger>
                  <AccordionContent>
                    Použite vyhľadávacie pole v hornej časti stránky. Môžete zadať kľúčové slová a filtrovať
                    výsledky podľa kategórie, ceny, lokality a ďalších parametrov pre presnejšie výsledky.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-13">
                  <AccordionTrigger>Môžem vyjednávať o cene?</AccordionTrigger>
                  <AccordionContent>
                    Áno, cena uvedená v inzeráte je často východzou cenou a predajcovia sú zvyčajne otvorení
                    vyjednávaniu. Skontaktujte predajcu cez chat a kultúrne sa opýtajte, či je ochotný
                    diskutovať o cene.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg">
                  <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Bezpečnosť</h2>
              </div>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-14">
                  <AccordionTrigger>Je Kupado.sk bezpečná platforma?</AccordionTrigger>
                  <AccordionContent>
                    Áno, bezpečnosť našich používateľov je naša priorita. Používame moderné šifrovanie,
                    monitorujeme podozrivé aktivity a poskytujeme odporúčania pre bezpečné transakcie.
                    Všetka komunikácia prebieha cez našu zabezpečenú platformu.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-15">
                  <AccordionTrigger>Ako sa vyvarujem podvodníkov?</AccordionTrigger>
                  <AccordionContent>
                    Nikdy neposielajte peniaze vopred bez osobného stretnutia. Stretávajte sa na verejných
                    miestach. Dôverujte svojmu inštinktu - ak niečo vyzerá podozrivo, pravdepodobne to tak je.
                    Viac tipov nájdete v sekcii "Ako nakupovať bezpečne".
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-16">
                  <AccordionTrigger>Čo mám robiť, ak narazím na podozrivý inzerát?</AccordionTrigger>
                  <AccordionContent>
                    Každý inzerát má možnosť nahlásiť. Kliknite na "Nahlásiť inzerát" a vyberte dôvod.
                    Náš tím to preverí do 24 hodín a v prípade porušenia pravidiel inzerát odstránime.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-17">
                  <AccordionTrigger>Sú moje osobné údaje v bezpečí?</AccordionTrigger>
                  <AccordionContent>
                    Áno, vaše osobné údaje chránime v súlade s GDPR. Nikdy nepredávame vaše údaje tretím stranám.
                    Viac informácií nájdete v našich podmienkach ochrany osobných údajov.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg">
                  <Settings className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Účet a nastavenia</h2>
              </div>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-18">
                  <AccordionTrigger>Ako zmením svoje heslo?</AccordionTrigger>
                  <AccordionContent>
                    Po prihlásení prejdite do sekcie "Nastavenia" → "Zabezpečenie". Tam môžete zmeniť svoje
                    heslo po zadaní aktuálneho hesla a nového hesla.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-19">
                  <AccordionTrigger>Môžem vymazať svoj účet?</AccordionTrigger>
                  <AccordionContent>
                    Áno, môžete vymazať svoj účet kedykoľvek. Prejdite do "Nastavenia" → "Účet" a kliknite
                    na "Vymazať účet". Upozorňujeme, že táto akcia je nevratná a všetky vaše údaje a inzeráty
                    budú trvalo odstránené.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-20">
                  <AccordionTrigger>Ako vypnem notifikácie?</AccordionTrigger>
                  <AccordionContent>
                    V sekcii "Nastavenia" → "Notifikácie" si môžete prispôsobiť, aké typy notifikácií chcete
                    dostávať (emailom alebo push notifikácie). Môžete ich úplne vypnúť alebo si vybrať len
                    určité typy.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </Card>
          </div>

          <Card className="mt-8 p-8 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800">
            <div className="text-center">
              <HelpCircle className="h-12 w-12 text-emerald-600 dark:text-emerald-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                Nenašli ste odpoveď na svoju otázku?
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Kontaktujte našu podporu a radi vám pomôžeme
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <a href="mailto:info@kupado.sk" className="text-emerald-600 hover:text-emerald-700 font-semibold">
                  info@kupado.sk
                </a>
                <span className="text-gray-400">|</span>
                <a href="tel:+421900000000" className="text-emerald-600 hover:text-emerald-700 font-semibold">
                  +421 900 000 000
                </a>
              </div>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}
