export const categories = [
  { id: 'zvierata', name: 'Zvieratá', slug: 'zvierata', description: 'Psy, Mačky, Kone, ...', type: 'animals' },
  { id: 'deti', name: 'Deti', slug: 'deti', description: 'Autosedačky, Kočíky, ...', type: 'kids' },
  { id: 'reality', name: 'Reality', slug: 'reality', description: 'Byty predaj, Domy...', type: 'real-estate' },
  { id: 'praca', name: 'Práca', slug: 'praca', description: 'Administratíva, Brigády, ...', type: 'jobs' },
  { id: 'auto', name: 'Auto', slug: 'auto', description: 'Škoda, Fiat, VW, ...', type: 'vehicles' },
  { id: 'motocykle', name: 'Motocykle', slug: 'motocykle', description: 'Cestné motocykle, Skútre, ...', type: 'motorcycles' },
  { id: 'stroje', name: 'Stroje', slug: 'stroje', description: 'Drevoobrábacie, Kovoobrábacie ...', type: 'machines' },
  { id: 'dom-zahrada', name: 'Dom a záhrada', slug: 'dom-zahrada', description: 'Kosačky, Kotle, Bojlery ...', type: 'home-garden' },
  { id: 'pc', name: 'PC', slug: 'pc', description: 'Notebooky, Počítače, ...', type: 'computers' },
  { id: 'mobily', name: 'Mobily', slug: 'mobily', description: 'Apple, Google, Samsung, ...', type: 'mobile' },
  { id: 'foto', name: 'Foto', slug: 'foto', description: 'Fotoaparáty, Videokamery, ...', type: 'photo' },
  { id: 'elektro', name: 'Elektro', slug: 'elektro', description: 'Autorádia, Chladničky, ...', type: 'electronics' },
  { id: 'sport', name: 'Šport', slug: 'sport', description: 'Horské bicykle, Lyže, ...', type: 'sports' },
  { id: 'hudba', name: 'Hudba', slug: 'hudba', description: 'Bicie nástroje, Skúšobne ...', type: 'music' },
  { id: 'vstupenky', name: 'Vstupenky', slug: 'vstupenky', description: 'Letenky, Hudba, Koncerty, ...', type: 'tickets' },
  { id: 'knihy', name: 'Knihy', slug: 'knihy', description: 'Beletria, Učebnice, ...', type: 'books' },
  { id: 'nabytok', name: 'Nábytok', slug: 'nabytok', description: 'Kuchyne, Sedacie súpravy ...', type: 'furniture' },
  { id: 'oblecenie', name: 'Oblečenie', slug: 'oblecenie', description: 'Obuv, Šperky, Hodinky ...', type: 'fashion' },
  { id: 'sluzby', name: 'Služby', slug: 'sluzby', description: 'Doučovanie, Ubytovanie, ...', type: 'services' },
  { id: 'ostatne', name: 'Ostatné', slug: 'ostatne', description: 'Starožitnosti, Zberateľstvo ...', type: 'other' }
];

export const realEstateTypes = [
  'Predaj',
  'Prenájom',
  'Kúpa',
  'Podnájom',
  'Výmena',
  'Dražba'
];

export const realEstateKinds = {
  byty: [
    'Garsónka',
    'Dvojgarsónka',
    '1 izbový byt',
    '2 izbový byt',
    '3 izbový byt',
    '4 izbový byt',
    '5 a viac izbový byt',
    'Mezonet',
    'Apartmán',
    'Loft',
    'Iný byt'
  ],
  domy: [
    'Rodinný dom',
    'Rodinná vila',
    'Zrubový dom',
    'Bungalov',
    'Vidiecky dom',
    'Bývala poľnohosp. usadlosť',
    'Chata, drevenica, zrub',
    'Chalupa, rekreačný domček',
    'Záhradná chatka',
    'Iný objekt na rekreáciu'
  ],
  pozemky: [
    'Pozemok pre rod. domy',
    'Rekreačný pozemok',
    'Pozemok pre bytovú výstavbu',
    'Orná pôda',
    'Záhrada',
    'Priemyselná zóna',
    'Komerčná zóna',
    'Pozemok pre obč. vybavenosť',
    'Zmiešaná zóna',
    'Lesy',
    'Rybník, vodná plocha',
    'Lúka, pasienok',
    'Chmeľnica, vinica',
    'Sad',
    'Pozemok pre reklamu',
    'Iný stavebný pozemok',
    'Iný poľnohosp. pozemok'
  ],
  objekty: [
    'Garáž',
    'Hotel, penzión',
    'Objekt pre obchod',
    'Reštaurácia',
    'Skladový objekt',
    'Polyfunkčný objekt',
    'Administratívny objekt',
    'Výrobný objekt',
    'Historický objekt',
    'Nájomný dom',
    'Prevádzkový areál',
    'Poľnohosp. objekt',
    'Bytový dom',
    'Apartmánový dom',
    'Garážové státie'
  ]
};

export const realEstateConditions = [
  'Novostavba',
  'Kompletná rekonštrukcia',
  'Čiastočná rekonštrukcia',
  'Pôvodný stav',
  'Vo výstavbe',
  'Projekt'
];
