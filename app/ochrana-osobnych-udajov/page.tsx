'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card } from '@/components/ui/card';

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-emerald-50 to-white dark:from-gray-900 dark:to-gray-800 py-12 pb-24 md:pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Ochrana osobných údajov
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Platné od 1. januára 2025 | V súlade s GDPR
            </p>
          </div>

          <Card className="p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">1. Úvod</h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>
                  Kupado.sk (ďalej len "my" alebo "prevádzkovateľ") rešpektuje vaše súkromie a zaväzuje sa chrániť
                  vaše osobné údaje. Táto Politika ochrany osobných údajov vysvetľuje, ako zbierame, používame,
                  zdieľame a chránime vaše osobné údaje v súlade s Nariadením Európskeho parlamentu a Rady (EÚ)
                  2016/679 (GDPR).
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">2. Správca osobných údajov</h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p><strong>Názov:</strong> Kupado.sk</p>
                <p><strong>Email:</strong> info@kupado.sk</p>
                <p><strong>Telefón:</strong> +421 900 000 000</p>
                <p><strong>Adresa:</strong> Bratislava, Slovensko</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">3. Aké osobné údaje zbierame</h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>
                  <strong>3.1. Údaje pri registrácii:</strong>
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Emailová adresa</li>
                  <li>Heslo (šifrované)</li>
                  <li>Meno a priezvisko (voliteľné)</li>
                  <li>Telefónne číslo (voliteľné)</li>
                </ul>

                <p className="mt-4">
                  <strong>3.2. Údaje pri vytváraní inzerátov:</strong>
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Názov a popis inzerátu</li>
                  <li>Fotografie</li>
                  <li>Cena a kategória</li>
                  <li>Lokalita</li>
                  <li>Kontaktné údaje (ak ich uvediete)</li>
                </ul>

                <p className="mt-4">
                  <strong>3.3. Automaticky zbierané údaje:</strong>
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>IP adresa</li>
                  <li>Typ prehliadača a zariadenia</li>
                  <li>Čas a dátum návštevy</li>
                  <li>Navštívené stránky</li>
                  <li>Cookies a podobné technológie</li>
                </ul>

                <p className="mt-4">
                  <strong>3.4. Údaje z komunikácie:</strong>
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Správy odoslané cez interný chat</li>
                  <li>Emailová korešpondencia s podporou</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">4. Účel spracovania osobných údajov</h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>Vaše osobné údaje používame na nasledujúce účely:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Vytvorenie a správa používateľského účtu</li>
                  <li>Zverejnenie a správa inzerátov</li>
                  <li>Umožnenie komunikácie medzi používateľmi</li>
                  <li>Poskytovanie zákazníckej podpory</li>
                  <li>Zlepšenie našich služieb a používateľskej skúsenosti</li>
                  <li>Odosielanie dôležitých oznámení o službách</li>
                  <li>Marketingové účely (so súhlasom)</li>
                  <li>Ochrana pred podvodmi a zneužitím služieb</li>
                  <li>Dodržiavanie zákonných povinností</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">5. Právny základ spracovania</h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>Osobné údaje spracovávame na základe:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li><strong>Súhlas:</strong> Váš výslovný súhlas so spracovaním údajov</li>
                  <li><strong>Plnenie zmluvy:</strong> Poskytovanie služieb, ktoré ste si objednali</li>
                  <li><strong>Oprávnený záujem:</strong> Zlepšovanie služieb, bezpečnosť platformy</li>
                  <li><strong>Zákonná povinnosť:</strong> Dodržiavanie právnych predpisov</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">6. Zdieľanie osobných údajov</h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>
                  6.1. Vaše osobné údaje nepredávame tretím stranám. Môžeme ich však zdieľať v nasledujúcich prípadoch:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li><strong>Poskytovatelia služieb:</strong> Cloudové úložisko, platobné brány, analytické nástroje</li>
                  <li><strong>Právne požiadavky:</strong> Keď to vyžaduje zákon alebo súdny príkaz</li>
                  <li><strong>Ochrana práv:</strong> Na ochranu našich práv, majetku alebo bezpečnosti</li>
                </ul>
                <p className="mt-4">
                  6.2. Všetci poskytovatelia služieb sú zmluvne zaviazaní chrániť vaše údaje a používať ich len
                  na dohodnuté účely.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">7. Doba uchovávania údajov</h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>Osobné údaje uchovávame len po dobu nevyhnutnú pre účely, na ktoré boli zhromaždené:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li><strong>Aktívne účty:</strong> Počas existencie účtu a používania služieb</li>
                  <li><strong>Neaktívne účty:</strong> 2 roky od poslednej aktivity, potom automaticky odstránime</li>
                  <li><strong>Vymazané účty:</strong> 30 dní na možnosť obnovenia, potom natrvalo odstránime</li>
                  <li><strong>Finančné záznamy:</strong> 10 rokov v súlade so zákonom</li>
                  <li><strong>Komunikácia:</strong> 3 roky od poslednej správy</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">8. Vaše práva</h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>Podľa GDPR máte nasledujúce práva:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li><strong>Právo na prístup:</strong> Získať kópiu vašich osobných údajov</li>
                  <li><strong>Právo na opravu:</strong> Opraviť nesprávne alebo neúplné údaje</li>
                  <li><strong>Právo na vymazanie:</strong> Požiadať o vymazanie vašich údajov ("právo byť zabudnutý")</li>
                  <li><strong>Právo na obmedzenie:</strong> Obmedziť spracovanie vašich údajov</li>
                  <li><strong>Právo na prenosnosť:</strong> Získať údaje v štruktúrovanom formáte</li>
                  <li><strong>Právo namietať:</strong> Namietať proti spracovaniu na základe oprávneného záujmu</li>
                  <li><strong>Právo odvolať súhlas:</strong> Kedykoľvek odvolať svoj súhlas so spracovaním</li>
                </ul>
                <p className="mt-4">
                  Pre uplatnenie týchto práv nás kontaktujte na email: info@kupado.sk
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">9. Bezpečnosť údajov</h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>
                  Implementovali sme primerané technické a organizačné opatrenia na ochranu vašich osobných údajov:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Šifrovanie údajov pri prenose (SSL/TLS)</li>
                  <li>Šifrované uloženie hesiel</li>
                  <li>Pravidelné bezpečnostné audity</li>
                  <li>Obmedzený prístup k osobným údajom</li>
                  <li>Pravidelné zálohovanie údajov</li>
                  <li>Monitorovanie podozrivých aktivít</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">10. Cookies a sledovacie technológie</h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>
                  10.1. Používame cookies a podobné technológie na zlepšenie funkčnosti stránky a analýzu návštevnosti.
                </p>
                <p>
                  10.2. Typy cookies, ktoré používame:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li><strong>Nevyhnutné cookies:</strong> Potrebné pre základnú funkčnosť stránky</li>
                  <li><strong>Analytické cookies:</strong> Pomáhajú nám pochopiť, ako používatelia využívajú stránku</li>
                  <li><strong>Funkčné cookies:</strong> Zapamätanie vašich preferencií</li>
                  <li><strong>Marketingové cookies:</strong> Zobrazenie relevantných reklám (so súhlasom)</li>
                </ul>
                <p className="mt-4">
                  10.3. Cookies môžete spravovať v nastaveniach vášho prehliadača alebo cez náš cookie banner.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">11. Prenos údajov mimo EÚ</h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>
                  11.1. Vaše údaje primárne spracovávame v rámci Európskeho hospodárskeho priestoru (EHP).
                </p>
                <p>
                  11.2. Ak dochádza k prenosu mimo EHP, zabezpečujeme primeranú úroveň ochrany pomocí:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Štandardných zmluvných doložiek schválených EÚ</li>
                  <li>Certifikácie Privacy Shield (ak je relevantné)</li>
                  <li>Iných právnych mechanizmov v súlade s GDPR</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">12. Deti a maloletí</h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>
                  Naše služby nie sú určené pre osoby mladšie ako 18 rokov. Vedomne nezbierame osobné údaje
                  od detí bez súhlasu zákonného zástupcu. Ak zistíme, že sme získali údaje od dieťaťa bez
                  súhlasu, tieto údaje okamžite vymažeme.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">13. Zmeny tejto politiky</h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>
                  Túto Politiku ochrany osobných údajov môžeme čas od času aktualizovať. O významných zmenách
                  vás budeme informovať emailom alebo oznámením na stránke. Odporúčame pravidelne kontrolovať
                  túto stránku pre aktuálne informácie.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">14. Kontakt a sťažnosti</h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>
                  Ak máte akékoľvek otázky alebo obavy ohľadom spracovania vašich osobných údajov, kontaktujte nás:
                </p>
                <p>
                  <strong>Email:</strong> info@kupado.sk<br />
                  <strong>Telefón:</strong> +421 900 000 000<br />
                  <strong>Adresa:</strong> Bratislava, Slovensko
                </p>
                <p className="mt-4">
                  Máte tiež právo podať sťažnosť na dozorný orgán:
                </p>
                <p>
                  <strong>Úrad na ochranu osobných údajov Slovenskej republiky</strong><br />
                  Hraničná 12<br />
                  820 07 Bratislava 27<br />
                  Slovenská republika<br />
                  <a href="https://dataprotection.gov.sk" className="text-emerald-600 hover:underline">
                    www.dataprotection.gov.sk
                  </a>
                </p>
              </div>
            </section>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}
