export interface CategoryField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'checkbox' | 'textarea';
  options?: string[];
  placeholder?: string;
  required?: boolean;
  min?: number;
  max?: number;
  unit?: string;
  section?: string;
}

export const categorySpecificFields: Record<string, CategoryField[]> = {
  // REALITY
  reality: [
    {
      id: 'realEstateType',
      label: 'Typ ponuky',
      type: 'select',
      options: ['Predaj', 'Prenájom', 'Kúpa', 'Podnájom', 'Výmena', 'Dražba'],
      required: true,
      section: 'Základné informácie'
    },
    {
      id: 'propertyType',
      label: 'Typ nehnuteľnosti',
      type: 'select',
      options: ['Byt', 'Dom', 'Pozemok', 'Komerčný objekt', 'Garáž'],
      required: true,
      section: 'Základné informácie'
    },
    {
      id: 'propertySubtype',
      label: 'Podtyp',
      type: 'select',
      options: [], // Dynamicky podľa propertyType
      section: 'Základné informácie'
    },
    {
      id: 'floorArea',
      label: 'Úžitková plocha',
      type: 'number',
      unit: 'm²',
      min: 1,
      required: true,
      section: 'Rozloha'
    },
    {
      id: 'plotArea',
      label: 'Plocha pozemku',
      type: 'number',
      unit: 'm²',
      min: 0,
      section: 'Rozloha'
    },
    {
      id: 'rooms',
      label: 'Počet izieb',
      type: 'select',
      options: ['Garsónka', '1', '2', '3', '4', '5', '6+'],
      section: 'Dispozícia'
    },
    {
      id: 'floor',
      label: 'Poschodie',
      type: 'number',
      min: -3,
      max: 100,
      section: 'Dispozícia'
    },
    {
      id: 'totalFloors',
      label: 'Počet poschodí v budove',
      type: 'number',
      min: 1,
      max: 100,
      section: 'Dispozícia'
    },
    {
      id: 'condition',
      label: 'Stav',
      type: 'select',
      options: ['Novostavba', 'Kompletná rekonštrukcia', 'Čiastočná rekonštrukcia', 'Pôvodný stav', 'Vo výstavbe', 'Projekt'],
      section: 'Stav a vybavenie'
    },
    {
      id: 'ownership',
      label: 'Vlastníctvo',
      type: 'select',
      options: ['Osobné', 'Družstevné', 'Štátne', 'Iné'],
      section: 'Právne informácie'
    },
    {
      id: 'yearBuilt',
      label: 'Rok výstavby',
      type: 'number',
      min: 1800,
      max: new Date().getFullYear() + 5,
      section: 'Základné informácie'
    }
  ],

  // MOBILY
  mobily: [
    {
      id: 'brand',
      label: 'Značka',
      type: 'select',
      options: ['Apple', 'Samsung', 'Xiaomi', 'Huawei', 'OnePlus', 'Google Pixel', 'Oppo', 'Realme', 'Motorola', 'Nokia', 'Sony', 'Asus', 'Honor', 'Iná'],
      required: true,
      section: 'Základné informácie'
    },
    {
      id: 'model',
      label: 'Model',
      type: 'text',
      placeholder: 'napr. iPhone 15 Pro Max',
      required: true,
      section: 'Základné informácie'
    },
    {
      id: 'storage',
      label: 'Úložisko',
      type: 'select',
      options: ['16 GB', '32 GB', '64 GB', '128 GB', '256 GB', '512 GB', '1 TB', '2 TB'],
      section: 'Technické parametre'
    },
    {
      id: 'ram',
      label: 'RAM',
      type: 'select',
      options: ['2 GB', '3 GB', '4 GB', '6 GB', '8 GB', '12 GB', '16 GB', '18 GB'],
      section: 'Technické parametre'
    },
    {
      id: 'condition',
      label: 'Stav',
      type: 'select',
      options: ['Nový', 'Ako nový', 'Veľmi dobrý', 'Dobrý', 'Poškodený'],
      required: true,
      section: 'Stav'
    },
    {
      id: 'color',
      label: 'Farba',
      type: 'text',
      placeholder: 'napr. Čierna',
      section: 'Vzhľad'
    },
    {
      id: 'warranty',
      label: 'Záruka',
      type: 'select',
      options: ['Bez záruky', '3 mesiace', '6 mesiacov', '1 rok', '2 roky', '3 roky'],
      section: 'Záruka'
    },
    {
      id: 'batteryHealth',
      label: 'Zdravie batérie',
      type: 'number',
      unit: '%',
      min: 0,
      max: 100,
      section: 'Technické parametre'
    }
  ],

  // PC & NOTEBOOKY
  pc: [
    {
      id: 'type',
      label: 'Typ',
      type: 'select',
      options: ['Notebook', 'Stolný počítač', 'All-in-One', 'Tablet', 'Mini PC'],
      required: true,
      section: 'Základné informácie'
    },
    {
      id: 'brand',
      label: 'Značka',
      type: 'select',
      options: ['Acer', 'Apple', 'Asus', 'Dell', 'HP', 'Lenovo', 'MSI', 'Microsoft Surface', 'Razer', 'Samsung', 'Zostavený', 'Iná'],
      required: true,
      section: 'Základné informácie'
    },
    {
      id: 'processor',
      label: 'Procesor',
      type: 'text',
      placeholder: 'napr. Intel Core i7-13700K',
      section: 'Procesor a RAM'
    },
    {
      id: 'ram',
      label: 'RAM',
      type: 'select',
      options: ['4 GB', '8 GB', '16 GB', '32 GB', '64 GB', '128 GB'],
      section: 'Procesor a RAM'
    },
    {
      id: 'storage',
      label: 'Úložisko',
      type: 'text',
      placeholder: 'napr. 512 GB SSD + 1 TB HDD',
      section: 'Úložisko'
    },
    {
      id: 'gpu',
      label: 'Grafická karta',
      type: 'text',
      placeholder: 'napr. NVIDIA RTX 4070',
      section: 'Grafika'
    },
    {
      id: 'screenSize',
      label: 'Uhlopriečka displeja',
      type: 'number',
      unit: '"',
      min: 10,
      max: 50,
      section: 'Displej'
    },
    {
      id: 'condition',
      label: 'Stav',
      type: 'select',
      options: ['Nový', 'Ako nový', 'Veľmi dobrý', 'Dobrý', 'Poškodený'],
      required: true,
      section: 'Stav'
    },
    {
      id: 'warranty',
      label: 'Záruka',
      type: 'select',
      options: ['Bez záruky', '6 mesiacov', '1 rok', '2 roky', '3 roky'],
      section: 'Záruka'
    }
  ],

  // MOTOCYKLE
  motocykle: [
    {
      id: 'brand',
      label: 'Značka',
      type: 'select',
      options: ['Honda', 'Yamaha', 'Suzuki', 'Kawasaki', 'Harley-Davidson', 'BMW', 'KTM', 'Ducati', 'Triumph', 'Aprilia', 'MV Agusta', 'Royal Enfield', 'Iná'],
      required: true,
      section: 'Základné údaje'
    },
    {
      id: 'model',
      label: 'Model',
      type: 'text',
      placeholder: 'napr. CBR 600RR',
      required: true,
      section: 'Základné údaje'
    },
    {
      id: 'year',
      label: 'Rok výroby',
      type: 'number',
      min: 1950,
      max: new Date().getFullYear() + 1,
      required: true,
      section: 'Základné údaje'
    },
    {
      id: 'mileage',
      label: 'Najazdené kilometre',
      type: 'number',
      unit: 'km',
      min: 0,
      required: true,
      section: 'Základné údaje'
    },
    {
      id: 'engine',
      label: 'Objem motora',
      type: 'number',
      unit: 'cm³',
      min: 50,
      max: 3000,
      required: true,
      section: 'Technické parametre'
    },
    {
      id: 'power',
      label: 'Výkon',
      type: 'number',
      unit: 'kW',
      min: 1,
      section: 'Technické parametre'
    },
    {
      id: 'type',
      label: 'Typ motocykla',
      type: 'select',
      options: ['Cestný', 'Športový', 'Chopper', 'Cruiser', 'Enduro', 'Cross', 'Skúter', 'Quad', 'Naked', 'Touring', 'Elektro'],
      section: 'Typ'
    },
    {
      id: 'condition',
      label: 'Stav',
      type: 'select',
      options: ['Nový', 'Ojazdený', 'Havarovaný', 'Na diely'],
      required: true,
      section: 'Stav'
    },
    {
      id: 'color',
      label: 'Farba',
      type: 'text',
      placeholder: 'napr. Červená',
      section: 'Vzhľad'
    }
  ],

  // OBLEČENIE
  oblecenie: [
    {
      id: 'category',
      label: 'Kategória',
      type: 'select',
      options: ['Dámske oblečenie', 'Pánske oblečenie', 'Detské oblečenie', 'Obuv', 'Doplnky', 'Šperky', 'Hodinky'],
      required: true,
      section: 'Základné informácie'
    },
    {
      id: 'subcategory',
      label: 'Podkategória',
      type: 'select',
      options: ['Tričká', 'Košele', 'Nohavice', 'Šaty', 'Sukne', 'Bundy', 'Kabáty', 'Mikiny', 'Svetre', 'Športové oblečenie', 'Spodná bielizeň'],
      section: 'Základné informácie'
    },
    {
      id: 'brand',
      label: 'Značka',
      type: 'text',
      placeholder: 'napr. Nike',
      section: 'Značka'
    },
    {
      id: 'size',
      label: 'Veľkosť',
      type: 'select',
      options: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '34', '36', '38', '40', '42', '44', '46', '48', '50', 'Univerzálna'],
      section: 'Veľkosť'
    },
    {
      id: 'condition',
      label: 'Stav',
      type: 'select',
      options: ['Nové s visačkou', 'Nové bez visačky', 'Ako nové', 'Veľmi dobrý', 'Dobrý', 'Opotrebované'],
      required: true,
      section: 'Stav'
    },
    {
      id: 'material',
      label: 'Materiál',
      type: 'text',
      placeholder: 'napr. 100% bavlna',
      section: 'Materiál'
    },
    {
      id: 'color',
      label: 'Farba',
      type: 'text',
      placeholder: 'napr. Modrá',
      section: 'Vzhľad'
    },
    {
      id: 'gender',
      label: 'Pohlavie',
      type: 'select',
      options: ['Dámske', 'Pánske', 'Unisex', 'Dievčenské', 'Chlapčenské'],
      section: 'Pre koho'
    }
  ],

  // ŠPORT
  sport: [
    {
      id: 'category',
      label: 'Kategória',
      type: 'select',
      options: ['Bicykle', 'Lyžovanie', 'Snowboarding', 'Fitness', 'Plávanie', 'Turistika', 'Lezenie', 'Zimné športy', 'Vodné športy', 'Tenis', 'Golf', 'Futbal', 'Hokej', 'Iné'],
      required: true,
      section: 'Základné informácie'
    },
    {
      id: 'brand',
      label: 'Značka',
      type: 'text',
      placeholder: 'napr. Trek',
      section: 'Značka'
    },
    {
      id: 'condition',
      label: 'Stav',
      type: 'select',
      options: ['Nové', 'Ako nové', 'Veľmi dobrý', 'Dobrý', 'Opotrebované'],
      required: true,
      section: 'Stav'
    },
    {
      id: 'size',
      label: 'Veľkosť',
      type: 'text',
      placeholder: 'napr. M, 42, 170cm',
      section: 'Veľkosť'
    },
    {
      id: 'gender',
      label: 'Určenie',
      type: 'select',
      options: ['Pánske', 'Dámske', 'Unisex', 'Detské'],
      section: 'Pre koho'
    }
  ],

  // NÁBYTOK
  nabytok: [
    {
      id: 'category',
      label: 'Kategória',
      type: 'select',
      options: ['Sedacia súprava', 'Posteľ', 'Matrac', 'Skriňa', 'Komoda', 'Stôl', 'Stolička', 'Kuchyňa', 'Kúpeľňa', 'Detský nábytok', 'Kancelársky nábytok', 'Záhradný nábytok', 'Iné'],
      required: true,
      section: 'Základné informácie'
    },
    {
      id: 'material',
      label: 'Materiál',
      type: 'select',
      options: ['Drevo', 'Masív', 'Lamino', 'Kov', 'Sklo', 'Plast', 'Textil', 'Koža', 'Eko koža', 'Kombinácia materiálov'],
      section: 'Materiál'
    },
    {
      id: 'color',
      label: 'Farba',
      type: 'text',
      placeholder: 'napr. Biela',
      section: 'Vzhľad'
    },
    {
      id: 'condition',
      label: 'Stav',
      type: 'select',
      options: ['Nový', 'Ako nový', 'Veľmi dobrý', 'Dobrý', 'Opotrebovaný', 'Renovovaný'],
      required: true,
      section: 'Stav'
    },
    {
      id: 'dimensions',
      label: 'Rozmery (Š x V x H)',
      type: 'text',
      placeholder: 'napr. 200 x 80 x 60 cm',
      section: 'Rozmery'
    },
    {
      id: 'style',
      label: 'Štýl',
      type: 'select',
      options: ['Moderný', 'Klasický', 'Vidiecky', 'Minimalistický', 'Industriálny', 'Retro', 'Vintage', 'Škandinávsky'],
      section: 'Štýl'
    }
  ],

  // ELEKTRO
  elektro: [
    {
      id: 'category',
      label: 'Kategória',
      type: 'select',
      options: ['Televízory', 'Audio', 'Chladničky', 'Práčky', 'Sporáky', 'Mikrovlnky', 'Vysávače', 'Klimatizácia', 'Malé spotrebiče', 'Iné'],
      required: true,
      section: 'Základné informácie'
    },
    {
      id: 'brand',
      label: 'Značka',
      type: 'text',
      placeholder: 'napr. Samsung',
      section: 'Značka'
    },
    {
      id: 'model',
      label: 'Model',
      type: 'text',
      placeholder: 'napr. UE55TU7172',
      section: 'Model'
    },
    {
      id: 'condition',
      label: 'Stav',
      type: 'select',
      options: ['Nový', 'Nepoužitý', 'Ako nový', 'Veľmi dobrý', 'Dobrý', 'Poškodený'],
      required: true,
      section: 'Stav'
    },
    {
      id: 'warranty',
      label: 'Záruka',
      type: 'select',
      options: ['Bez záruky', '6 mesiacov', '1 rok', '2 roky', '3 roky', '5 rokov'],
      section: 'Záruka'
    },
    {
      id: 'energyClass',
      label: 'Energetická trieda',
      type: 'select',
      options: ['A+++', 'A++', 'A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G'],
      section: 'Spotreba'
    }
  ]
};

// Helper funkcia pre získanie polí podľa kategórie
export function getCategoryFields(categorySlug: string): CategoryField[] {
  return categorySpecificFields[categorySlug] || [];
}

// Helper funkcia pre získanie sekcií
export function getFieldSections(fields: CategoryField[]): string[] {
  const sections = new Set<string>();
  fields.forEach(field => {
    if (field.section) {
      sections.add(field.section);
    }
  });
  return Array.from(sections);
}
