import Link from 'next/link';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Kupedo.sk</h3>
            <p className="text-sm mb-4 leading-relaxed">
              Slovenský marketplace pre všetko čo potrebujete. Spájame kupujúcich a predajcov rýchlo, jednoducho a bezpečne.
            </p>
            <div className="flex gap-3">
              <a href="#" className="hover:text-emerald-400 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-emerald-400 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-emerald-400 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Pre kupujúcich</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-emerald-400 transition-colors">
                  Prehliadať inzeráty
                </Link>
              </li>
              <li>
                <Link href="/oblubene" className="hover:text-emerald-400 transition-colors">
                  Obľúbené inzeráty
                </Link>
              </li>
              <li>
                <Link href="/ako-nakupovat-bezpecne" className="hover:text-emerald-400 transition-colors">
                  Ako nakupovať bezpečne
                </Link>
              </li>
              <li>
                <Link href="/casto-kladene-otazky" className="hover:text-emerald-400 transition-colors">
                  Často kladené otázky
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Pre predajcov</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/pridat-inzerat" className="hover:text-emerald-400 transition-colors">
                  Pridať inzerát
                </Link>
              </li>
              <li>
                <Link href="/moje-inzeraty" className="hover:text-emerald-400 transition-colors">
                  Moje inzeráty
                </Link>
              </li>
              <li>
                <Link href="/cennik-sluzieb" className="hover:text-emerald-400 transition-colors">
                  Cenník služieb
                </Link>
              </li>
              <li>
                <Link href="/tipy-pre-uspesny-predaj" className="hover:text-emerald-400 transition-colors">
                  Tipy pre úspešný predaj
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Kontakt</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <a href="mailto:info@kupedo.sk" className="hover:text-emerald-400 transition-colors">
                  info@kupedo.sk
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <a href="tel:+421900000000" className="hover:text-emerald-400 transition-colors">
                  +421 900 000 000
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Bratislava, Slovensko</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p className="text-gray-400">
              © 2025 Kupedo.sk. Všetky práva vyhradené.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/obchodne-podmienky" className="hover:text-emerald-400 transition-colors">
                Obchodné podmienky
              </Link>
              <Link href="/ochrana-osobnych-udajov" className="hover:text-emerald-400 transition-colors">
                Ochrana osobných údajov
              </Link>
              <Link href="/pravidla-pouzivania" className="hover:text-emerald-400 transition-colors">
                Pravidlá používania
              </Link>
              <Link href="/o-nas" className="hover:text-emerald-400 transition-colors">
                O nás
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
