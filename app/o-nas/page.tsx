'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Target, Heart, Shield, Users, TrendingUp, Zap, Award, Globe } from 'lucide-react';

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-emerald-50 to-white dark:from-gray-900 dark:to-gray-800 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-12 text-center">
            <h1 className="text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              O nás
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Moderná platforma spájajúca kupujúcich a predajcov po celom Slovensku
            </p>
          </div>

          <Card className="p-8 mb-8">
            <div className="prose max-w-none">
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                Kupado.sk je inovatívna slovenská platforma, ktorá revolučne mení spôsob, akým ľudia kupujú
                a predávajú online. Naším cieľom je vytvoriť bezpečné, jednoduché a efektívne prostredie,
                kde sa kupujúci a predajcovia môžu spojiť a realizovať výhodné obchody.
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                Vznikli sme z potreby modernej, používateľsky prívetivej platformy, ktorá by kombinovala
                najlepšie praktiky globálnych trhových platforiem s hlbokým pochopením slovenského trhu
                a potrieb našich používateľov.
              </p>
            </div>
          </Card>

          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white">
              Naše hodnoty
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-lg">
                    <Shield className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Bezpečnosť</h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      Bezpečnosť našich používateľov je na prvom mieste. Implementujeme najnovšie
                      bezpečnostné opatrenia a aktívne bojujeme proti podvodom.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-lg">
                    <Heart className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Používateľ na prvom mieste</h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      Počúvame našich používateľov a neustále vylepšujeme platformu na základe ich
                      spätnej väzby a potrieb.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-lg">
                    <Zap className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Inovácia</h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      Neustále hľadáme nové spôsoby, ako zlepšiť používateľskú skúsenosť pomocou
                      najnovších technológií a trendov.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-lg">
                    <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Komunita</h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      Budujeme silnú komunitu používateľov, ktorí sa navzájom rešpektujú a podporujú
                      férovú online obchodnú kultúru.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <Card className="p-8 mb-8 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-900">
            <div className="flex items-center gap-3 mb-6">
              <Target className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Naša misia</h2>
            </div>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              Našou misiou je demokratizovať prístup k online obchodovaniu a umožniť každému na Slovensku
              jednoducho predávať a nakupovať. Veríme, že každá vec si zaslúži druhú šancu a každý by mal
              mať možnosť robiť výhodné obchody v bezpečnom prostredí.
            </p>
          </Card>

          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white">
              Čo nás odlišuje
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-lg flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
                      Moderné a intuitívne rozhranie
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      Naša platforma je navrhnutá s dôrazom na jednoduchoť a prehľadnosť. Či už ste
                      začiatočník alebo skúsený používateľ, u nás sa rýchlo zorientujete.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-lg flex-shrink-0">
                    <Shield className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
                      Pokročilá ochrana pred podvodmi
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      Využívame AI a moderné algoritmy na detekciu podozrivých aktivít a ochranu našich
                      používateľov pred podvodníkmi.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-lg flex-shrink-0">
                    <Zap className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
                      Rýchla a spoľahlivá podpora
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      Náš zákaznícky tím je vždy pripravený pomôcť. Odpovedáme na otázky rýchlo
                      a profesionálne.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-lg flex-shrink-0">
                    <Globe className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
                      Lokálne aj celoslovensky
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      Inteligentné vyhľadávanie podľa PSČ a vzdialenosti vám pomôže nájsť to,
                      čo hľadáte, priamo vo vašom okolí.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <Card className="p-8 mb-8">
            <h2 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white">
              Naše čísla
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">50K+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Aktívnych používateľov</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">100K+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Aktívnych inzerátov</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">500+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Denných transakcií</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">99%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Spokojnosť používateľov</div>
              </div>
            </div>
          </Card>

          <Card className="p-8 mb-8 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-900">
            <div className="flex items-center gap-3 mb-6">
              <Award className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Naša vízia do budúcnosti</h2>
            </div>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Neustále pracujeme na vylepšovaní našej platformy a pridávaní nových funkcií, ktoré
              vám uľahčia život. V budúcnosti plánujeme:
            </p>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                <span>Integráciu bezpečných online platieb</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                <span>Rozšírenie do ďalších krajín strednej Európy</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                <span>Mobilné aplikácie pre iOS a Android</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                <span>AI asistenta pre lepšie odporúčania a vyhľadávanie</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                <span>Integráciu s kuriérskými službami pre jednoduchšie doručenie</span>
              </li>
            </ul>
          </Card>

          <Card className="p-8 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
                Pridajte sa k nám!
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                Staňte sa súčasťou našej rastúcej komunity a objavte svet jednoduchého a bezpečného
                online obchodovania.
              </p>
              <div className="flex gap-4 justify-center flex-wrap text-sm text-gray-600 dark:text-gray-400">
                <div>
                  <strong>Email:</strong>{' '}
                  <a href="mailto:info@kupado.sk" className="text-emerald-600 hover:underline">
                    info@kupado.sk
                  </a>
                </div>
                <span className="hidden md:inline">|</span>
                <div>
                  <strong>Telefón:</strong>{' '}
                  <a href="tel:+421900000000" className="text-emerald-600 hover:underline">
                    +421 900 000 000
                  </a>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}
