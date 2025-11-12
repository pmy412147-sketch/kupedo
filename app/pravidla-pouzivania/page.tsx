'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export default function RulesPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-emerald-50 to-white dark:from-gray-900 dark:to-gray-800 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Pravidlá používania
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Pravidlá slušného správania a bezpečného používania platformy Kupado.sk
            </p>
          </div>

          <Card className="p-6 mb-8 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800">
            <div className="flex items-start gap-4">
              <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Naša vízia</h2>
                <p className="text-gray-700 dark:text-gray-300">
                  Kupado.sk má ambíciu vytvoriť bezpečné, férovré a príjemné prostredie pre všetkých používateľov.
                  Tieto pravidlá pomáhajú udržiavať kvalitu a dôveryhodnosť našej komunity.
                </p>
              </div>
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">1. Všeobecné pravidlá správania</h2>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Čo očakávame
                </h3>
                <ul className="space-y-2 ml-7">
                  <li className="text-gray-700 dark:text-gray-300">• Buďte úctiví a zdvorilí voči ostatným používateľom</li>
                  <li className="text-gray-700 dark:text-gray-300">• Komunikujte jasne a pravdivo</li>
                  <li className="text-gray-700 dark:text-gray-300">• Dodržiavajte dohodnuté termíny stretnutí</li>
                  <li className="text-gray-700 dark:text-gray-300">• Informujte o zmenách alebo problémoch včas</li>
                  <li className="text-gray-700 dark:text-gray-300">• Rešpektujte súkromie ostatných</li>
                  <li className="text-gray-700 dark:text-gray-300">• Nahlasujte podozrivé aktivity</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-red-600 dark:text-red-400 flex items-center gap-2">
                  <XCircle className="h-5 w-5" />
                  Zakázané správanie
                </h3>
                <ul className="space-y-2 ml-7">
                  <li className="text-gray-700 dark:text-gray-300">• Urážanie, obťažovanie alebo vyhrážanie iným používateľom</li>
                  <li className="text-gray-700 dark:text-gray-300">• Šírenie nenávistných alebo diskriminačných prejavov</li>
                  <li className="text-gray-700 dark:text-gray-300">• Spam a nevyžiadaná reklama</li>
                  <li className="text-gray-700 dark:text-gray-300">• Vydávanie sa za inú osobu alebo firmu</li>
                  <li className="text-gray-700 dark:text-gray-300">• Zneužívanie systému nahlasovania</li>
                </ul>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">2. Pravidlá pre inzeráty</h2>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Správne praktiky
                </h3>
                <ul className="space-y-2 ml-7">
                  <li className="text-gray-700 dark:text-gray-300">• Používajte vlastné, aktuálne fotografie</li>
                  <li className="text-gray-700 dark:text-gray-300">• Popíšte tovar presne a úplne</li>
                  <li className="text-gray-700 dark:text-gray-300">• Uveďte reálnu cenu alebo "Dohodou"</li>
                  <li className="text-gray-700 dark:text-gray-300">• Zvoľte správnu kategóriu</li>
                  <li className="text-gray-700 dark:text-gray-300">• Aktualizujte alebo odstráňte predané položky</li>
                  <li className="text-gray-700 dark:text-gray-300">• Jeden inzerát = jeden predmet (nie viac položiek v jednom)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-red-600 dark:text-red-400 flex items-center gap-2">
                  <XCircle className="h-5 w-5" />
                  Zakázané inzeráty
                </h3>
                <ul className="space-y-2 ml-7">
                  <li className="text-gray-700 dark:text-gray-300">• Ukradnuté alebo nelegálne získané veci</li>
                  <li className="text-gray-700 dark:text-gray-300">• Drogy, zbrane, výbušniny</li>
                  <li className="text-gray-700 dark:text-gray-300">• Falzifikáty a podvrhy</li>
                  <li className="text-gray-700 dark:text-gray-300">• Pornografický obsah</li>
                  <li className="text-gray-700 dark:text-gray-300">• Živé zvieratá (s výnimkami podľa zákona)</li>
                  <li className="text-gray-700 dark:text-gray-300">• Služby sexuálneho charakteru</li>
                  <li className="text-gray-700 dark:text-gray-300">• Pyramídové schémy a podvody</li>
                  <li className="text-gray-700 dark:text-gray-300">• Lieky a zdravotnícke pomôcky na predpis</li>
                  <li className="text-gray-700 dark:text-gray-300">• Nebezpečné chemikálie</li>
                  <li className="text-gray-700 dark:text-gray-300">• Chránené druhy rastlín a živočíchov</li>
                </ul>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">3. Pravidlá pre fotografie</h2>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Používajte vlastné fotografie</p>
                    <p className="text-sm">Fotografie musia byť vaše alebo musíte mať povolenie ich použiť</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Ukážte skutočný stav</p>
                    <p className="text-sm">Neupravujte fotografie tak, aby zavádzali o stave tovaru</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Žiadny nevhodný obsah</p>
                    <p className="text-sm">Fotografie nesmú obsahovať nahotu, násilie alebo urážlivý obsah</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Bez osobných údajov</p>
                    <p className="text-sm">Nezverejňujte fotografie s viditeľnými osobnými údajmi (adresy, doklady, atď.)</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">4. Pravidlá pre komunikáciu</h2>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p>
                  <strong>Odporúčame:</strong>
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Komunikujte cez interný chat platformy</li>
                  <li>Buďte jasní a konkrétni vo svojich otázkach</li>
                  <li>Odpovedajte v rozumnom čase (do 24 hodín)</li>
                  <li>Potvrdzujte dohodnuté stretnutia</li>
                </ul>

                <p className="mt-4">
                  <strong>Zakázané:</strong>
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Posielanie nevyžiadaných reklamných správ</li>
                  <li>Žiadanie o osobné alebo finančné údaje</li>
                  <li>Obťažovanie alebo opakované nechcené správy</li>
                  <li>Posielanie odkazov na phishingové stránky</li>
                  <li>Používanie vulgarizmov a urážok</li>
                </ul>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">5. Prevencia podvodov</h2>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-yellow-900 dark:text-yellow-200 mb-2">Nikdy:</p>
                      <ul className="space-y-1 text-sm text-yellow-800 dark:text-yellow-300">
                        <li>• Neposielajte peniaze vopred bez osobného stretnutia</li>
                        <li>• Neklikajte na podozrivé odkazy</li>
                        <li>• Nezverejňujte citlivé osobné údaje</li>
                        <li>• Neobchádzajte bezpečnostné mechanizmy platformy</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <p>
                  Ak narazíte na podozrivé správanie, okamžite to nahláste pomocou tlačidla "Nahlásiť" alebo
                  kontaktujte našu podporu.
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">6. Obmedzenia účtu</h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>
                  <strong>Jeden účet na osobu:</strong> Každý používateľ môže mať len jeden aktívny účet.
                  Viacero účtov je povolené len pre podnikateľské účely s predchádzajúcim súhlasom.
                </p>
                <p>
                  <strong>Obmedzenie počtu inzerátov:</strong> Bezplatní používatelia môžu mať až 50 aktívnych
                  inzerátov naraz. Pre viac inzerátov zvážte prémiový účet.
                </p>
                <p>
                  <strong>Obmedzenie obnovenia:</strong> Každý inzerát môžete obnoviť (posunúť hore) raz za 7 dní.
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">7. Dôsledky porušenia pravidiel</h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>Pri porušení týchto pravidiel môžeme podniknúť nasledujúce kroky:</p>

                <div className="space-y-4 mt-4">
                  <div className="border-l-4 border-yellow-500 pl-4">
                    <p className="font-semibold text-yellow-700 dark:text-yellow-400">Prvé porušenie</p>
                    <p className="text-sm">Upozornenie a odstránenie problémového obsahu</p>
                  </div>

                  <div className="border-l-4 border-orange-500 pl-4">
                    <p className="font-semibold text-orange-700 dark:text-orange-400">Opakované porušenie</p>
                    <p className="text-sm">Dočasné zablokovanie účtu (7-30 dní)</p>
                  </div>

                  <div className="border-l-4 border-red-500 pl-4">
                    <p className="font-semibold text-red-700 dark:text-red-400">Závažné alebo opakované porušenia</p>
                    <p className="text-sm">Trvalé zablokovanie účtu</p>
                  </div>

                  <div className="border-l-4 border-gray-500 pl-4">
                    <p className="font-semibold text-gray-700 dark:text-gray-400">Trestná činnosť</p>
                    <p className="text-sm">Oznámenie polícii a príslušným orgánom</p>
                  </div>
                </div>

                <p className="mt-4">
                  Rozhodnutia o porušení pravidiel podliehajú výhradne Prevádzkovateľovi. V prípadoch nejasností
                  sa snažíme komunikovať s používateľmi pred prijatím opatrení.
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">8. Nahlasovanie porušení</h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>Ak si myslíte, že niekto porušuje tieto pravidlá:</p>
                <ol className="list-decimal list-inside ml-4 space-y-2">
                  <li>Použite tlačidlo "Nahlásiť" na príslušnom inzeráte alebo profile</li>
                  <li>Vyberte dôvod nahlásenia</li>
                  <li>Poskytnite čo najviac detailov</li>
                  <li>Odošlite hlásenie</li>
                </ol>
                <p className="mt-4">
                  Všetky nahlásenia preverujeme do 24 hodín. Za falošné nahlásenia môže byť používateľ
                  potrestaný.
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">9. Odvolanie proti rozhodnutiu</h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>
                  Ak sa domnievate, že vaše konanie bolo nesprávne posúdené, môžete podať odvolanie:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Kontaktujte nás na info@kupado.sk</li>
                  <li>Uveďte ID vášho účtu a podrobnosti prípadu</li>
                  <li>Vysvetlite, prečo si myslíte, že rozhodnutie bolo nesprávne</li>
                  <li>Vyčkajte na odpoveď do 7 pracovných dní</li>
                </ul>
              </div>
            </Card>
          </div>

          <Card className="mt-8 p-8 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-emerald-600 dark:text-emerald-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                Ďakujeme, že dodržiavate pravidlá!
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Spoločne vytvárame bezpečné a príjemné prostredie pre všetkých používateľov.
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Otázky? Kontaktujte nás na <a href="mailto:info@kupado.sk" className="text-emerald-600 hover:underline font-semibold">info@kupado.sk</a>
              </p>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}
