'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Shield, AlertTriangle, CheckCircle, Users, Lock, Eye, FileText, CreditCard } from 'lucide-react';

export default function SafetyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-emerald-50 to-white dark:from-gray-900 dark:to-gray-800 py-12 pb-24 md:pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Ako nakupovať bezpečne
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Vaša bezpečnosť je naša priorita. Prečítajte si tieto odporúčania pre bezpečné nakupovanie a predávanie.
            </p>
          </div>

          <Card className="p-6 mb-8 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800">
            <div className="flex items-start gap-4">
              <Shield className="h-8 w-8 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Základné pravidlo</h2>
                <p className="text-gray-700 dark:text-gray-300">
                  Ak niečo vyzerá príliš dobre na to, aby to bola pravda, pravdepodobne to nie je pravda.
                  Dôverujte svojmu inštinktu a buďte opatrní pri podozrivých ponukách.
                </p>
              </div>
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">1. Osobné stretnutie</h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    Najlepší spôsob bezpečného nákupu je osobné stretnutie.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Stretávajte sa na verejných miestach (nákupné centrá, parkoviská, policajné stanice)
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Zoberte si niekoho so sebou
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Stretávajte sa počas dňa, nie v noci
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Informujte niekoho o vašom stretnutí (miesto, čas, s kým)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-lg">
                  <CreditCard className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">2. Bezpečné platby</h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    Zvoľte bezpečný spôsob platby, ktorý vás chráni.
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">
                        <strong>Najlepšie:</strong> Platba v hotovosti pri osobnom prevzatí tovaru
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">
                        <strong>Bezpečné:</strong> Bankový prevod až po prezretí tovaru
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Pri online platbách používajte len overené platobné brány
                      </span>
                    </div>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-red-900 dark:text-red-200 mb-1">Nikdy:</p>
                        <ul className="space-y-1 text-sm text-red-800 dark:text-red-300">
                          <li>• Neposielajte peniaze vopred bez osobného stretnutia</li>
                          <li>• Nepoužívajte neoverené platobné metódy</li>
                          <li>• Nedávajte zálohy cudzím ľuďom</li>
                          <li>• Neplatba cez zahraničné prevodové služby (Western Union, MoneyGram)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-lg">
                  <Eye className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">3. Kontrola tovaru</h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    Vždy si dôkladne prezrite tovar pred kúpou.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Otestujte funkčnosť (pri elektronike)
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Skontrolujte stav a poškodenia
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Overte sériové čísla a originálnosť
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Pri autách požadujte test jazdu a servisnú knihu
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Nespôsobte sa a venujte kontrole dostatok času
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">4. Varovné signály podvodov</h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    Buďte obozretní, ak zaznamenáte nasledujúce príznaky:
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Cena je výrazne nižšia než tržná hodnota
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Predajca naliehá na rýchle rozhodnutie alebo platbu vopred
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Komunikácia prebieha mimo platformu (WhatsApp, Telegram)
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Chýbajú fotografie alebo sú nekvalitné/ukradnuté z internetu
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Predajca odmietne osobné stretnutie
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Zvláštne alebo neprofesionálne správanie
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Požiadavka o platbu cez neštandardné metódy
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-lg">
                  <Lock className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">5. Ochrana osobných údajov</h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    Chráňte svoje osobné informácie.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Komunikujte cez internú správy platformy
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Nezdieľajte adresu bydliska (len miesto stretnutia)
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Nezdieľajte bankové údaje, heslá alebo PIN kódy
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Používajte silné, jedinečné heslá pre váš účet
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-lg">
                  <FileText className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">6. Dokumentácia transakcie</h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    Pri drahších nákupoch je dobré mať písomný záznam.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Urobte si písomnú zmluvu o kúpe (najmä pri autách, nehnuteľnostiach)
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Požadujte potvrdenie o platbe
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Uschovajte si všetku komunikáciu a fotografie inzerátu
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Pri autách overte, či má predajca právo vozidlo predať (techický preukaz)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <Card className="mt-8 p-6 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-8 w-8 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Čo robiť pri podozrení na podvod?</h3>
                <div className="space-y-2 text-gray-700 dark:text-gray-300">
                  <p>1. <strong>Okamžite ukončite komunikáciu</strong> s podozrivým používateľom</p>
                  <p>2. <strong>Nahlaste inzerát</strong> pomocou tlačidla "Nahlásiť" na stránke inzerátu</p>
                  <p>3. <strong>Kontaktujte našu podporu</strong> na info@kupado.sk</p>
                  <p>4. Ak ste už poslali peniaze, <strong>ihneď kontaktujte svoju banku a políciu</strong></p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="mt-8 p-8 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800">
            <div className="text-center">
              <Shield className="h-12 w-12 text-emerald-600 dark:text-emerald-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                Pomôžte nám vytvoriť bezpečné prostredie
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Nahlasujte podozrivé inzeráty a správanie. Spoločne môžeme urobiť Kupado.sk bezpečnejším miestom pre všetkých.
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
