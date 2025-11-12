'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card } from '@/components/ui/card';

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-emerald-50 to-white dark:from-gray-900 dark:to-gray-800 py-12 pb-24 md:pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Obchodné podmienky
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Platné od 1. januára 2025
            </p>
          </div>

          <Card className="p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">1. Všeobecné ustanovenia</h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>
                  1.1. Tieto obchodné podmienky (ďalej len "Podmienky") upravujú vzájomné práva a povinnosti medzi
                  prevádzkovateľom webovej stránky Kupado.sk (ďalej len "Prevádzkovateľ") a používateľmi služieb
                  (ďalej len "Používateľ").
                </p>
                <p>
                  1.2. Používaním služieb Kupado.sk vyjadruje Používateľ súhlas s týmito Podmienkami.
                </p>
                <p>
                  1.3. Prevádzkovateľ si vyhradzuje právo kedykoľvek tieto Podmienky zmeniť. O zmene bude Používateľ
                  informovaný prostredníctvom webovej stránky.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">2. Registrácia a používateľský účet</h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>
                  2.1. Pre plné využívanie služieb je potrebná registrácia. Používateľ sa zaväzuje poskytnúť pravdivé
                  a aktuálne údaje.
                </p>
                <p>
                  2.2. Používateľ je zodpovedný za ochranu svojho hesla a nesmie umožniť jeho použitie tretími osobami.
                </p>
                <p>
                  2.3. Používateľ môže mať len jeden účet. Vytvorenie viacerých účtov je zakázané.
                </p>
                <p>
                  2.4. Používateľ musí mať minimálne 18 rokov. Mladší používatelia musia mať súhlas zákonného zástupcu.
                </p>
                <p>
                  2.5. Prevádzkovateľ si vyhradzuje právo zablokovať alebo zmazať účet, ktorý porušuje tieto Podmienky.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">3. Inzeráty a obsah</h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>
                  3.1. Používateľ je zodpovedný za obsah svojich inzerátov a musí sa ubezpečiť, že neporušuje
                  platné právne predpisy SR a EÚ.
                </p>
                <p>
                  3.2. Je zakázané zverejňovať inzeráty obsahujúce:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Nezákonný, podvodný alebo zavádzajúci obsah</li>
                  <li>Nebezpečné, ukradnuté alebo falšované výrobky</li>
                  <li>Drogy, zbrane, výbušniny a iný nebezpečný materiál</li>
                  <li>Pornografický, rasistický alebo urážlivý obsah</li>
                  <li>Živé zvieratá zakázané na predaj podľa právnych predpisov</li>
                  <li>Služby sexuálneho charakteru</li>
                  <li>Pyramídové alebo reťazové hry</li>
                </ul>
                <p>
                  3.3. Prevádzkovateľ si vyhradzuje právo odstrániť akýkoľvek inzerát, ktorý porušuje tieto Podmienky,
                  bez predchádzajúceho upozornenia.
                </p>
                <p>
                  3.4. Používateľ nesmie kopírovať cudzie inzeráty alebo použiť fotografie bez súhlasu majiteľa.
                </p>
                <p>
                  3.5. Inzeráty sú platné 60 dní od zverejnenia, pokiaľ nie sú predtým vymazané alebo upravené.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">4. Platené služby</h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>
                  4.1. Prevádzkovateľ ponúka platené služby na zvýšenie viditeľnosti inzerátov (zvýraznenie, TOP pozícia).
                </p>
                <p>
                  4.2. Ceny služieb sú uvedené v cenníku na webovej stránke a zahŕňajú DPH.
                </p>
                <p>
                  4.3. Platba sa vykonáva online cez platobné brány. Služba je aktivovaná po potvrdení platby.
                </p>
                <p>
                  4.4. Zakúpené služby nie sú vratné, s výnimkou prípadov, keď služba nebola poskytnutá z technických
                  dôvodov na strane Prevádzkovateľa.
                </p>
                <p>
                  4.5. Prevádzkovateľ nevydáva faktúry automaticky. Ak potrebujete faktúru, kontaktujte podporu.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">5. Komunikácia a transakcie</h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>
                  5.1. Kupado.sk slúži len ako platforma na spojenie kupujúcich a predajcov. Nie sme stranou transakcií
                  a nenesieme zodpovednosť za kvalitu, bezpečnosť alebo legálnosť ponúkaných položiek.
                </p>
                <p>
                  5.2. Používatelia sú zodpovední za vlastné transakcie a mali by dodržiavať bezpečnostné pokyny
                  zverejnené na stránke.
                </p>
                <p>
                  5.3. Komunikácia by mala prebiehať predovšetkým cez interný chat platformy.
                </p>
                <p>
                  5.4. Je zakázané používať služby na podvodné účely, vrátane phishingu, scamov a iných podvodných aktivít.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">6. Zodpovednosť</h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>
                  6.1. Prevádzkovateľ nezodpovedá za škody vzniknuté v súvislosti s používaním služieb, pokiaľ
                  nevznikli úmyselným konaním Prevádzkovateľa.
                </p>
                <p>
                  6.2. Prevádzkovateľ negarantuje nepretržitú dostupnosť služieb a nenesie zodpovednosť za
                  technické výpadky.
                </p>
                <p>
                  6.3. Používateľ zodpovedá za všetky aktivity vykonané pod jeho účtom.
                </p>
                <p>
                  6.4. Prevádzkovateľ si vyhradzuje právo dočasne pozastaviť služby za účelom údržby alebo
                  vylepšení bez predchádzajúceho upozornenia.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">7. Ochrana osobných údajov</h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>
                  7.1. Spracovanie osobných údajov sa riadi samostatným dokumentom "Ochrana osobných údajov"
                  v súlade s nariadením GDPR.
                </p>
                <p>
                  7.2. Registráciou Používateľ súhlasí so spracovaním svojich osobných údajov v rozsahu
                  uvedenom v Zásadách ochrany osobných údajov.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">8. Reklamácie a spory</h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>
                  8.1. Reklamácie týkajúce sa platených služieb môže Používateľ podať na email info@kupado.sk.
                </p>
                <p>
                  8.2. Prevádzkovateľ sa zaväzuje vybaviť reklamáciu do 30 dní od jej doručenia.
                </p>
                <p>
                  8.3. Spory medzi kupujúcimi a predajcami riešia strany priamo medzi sebou. Prevádzkovateľ
                  môže pomôcť sprostredkovaním komunikácie, ale nemá povinnosť spory riešiť.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">9. Ukončenie používania služieb</h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>
                  9.1. Používateľ môže kedykoľvek vymazať svoj účet v nastaveniach.
                </p>
                <p>
                  9.2. Prevádzkovateľ môže zablokovať alebo vymazať účet Používateľa, ktorý opakované porušuje
                  tieto Podmienky.
                </p>
                <p>
                  9.3. Po vymazaní účtu budú všetky inzeráty odstránené a osobné údaje vymazané v súlade
                  s GDPR, pokiaľ nie je ich uchovanie vyžadované zákonom.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">10. Záverečné ustanovenia</h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>
                  10.1. Tieto Podmienky sa riadia právnym poriadkom Slovenskej republiky.
                </p>
                <p>
                  10.2. Ak je niektoré ustanovenie týchto Podmienok neplatné alebo neúčinné, ostatné ustanovenia
                  zostávajú v platnosti.
                </p>
                <p>
                  10.3. Prevádzkovateľ si vyhradzuje právo kedykoľvek tieto Podmienky zmeniť. Aktuálna verzia
                  je vždy dostupná na webovej stránke.
                </p>
                <p>
                  10.4. Pre otázky ohľadom týchto Podmienok kontaktujte info@kupado.sk.
                </p>
              </div>
            </section>

            <section className="mt-8 pt-8 border-t dark:border-gray-700">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Kontaktné údaje prevádzkovateľa</h2>
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <p><strong>Názov:</strong> Kupado.sk</p>
                <p><strong>Email:</strong> info@kupado.sk</p>
                <p><strong>Telefón:</strong> +421 900 000 000</p>
                <p><strong>Adresa:</strong> Bratislava, Slovensko</p>
              </div>
            </section>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}
