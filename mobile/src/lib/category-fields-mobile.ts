export const mobileCategoryFields: Record<string, any> = {
  auto: {
    fields: [
      { id: 'brand', label: 'Značka', type: 'text', placeholder: 'napr. Volkswagen' },
      { id: 'model', label: 'Model', type: 'text', placeholder: 'napr. Golf' },
      { id: 'year', label: 'Rok výroby', type: 'number', placeholder: '2020' },
      { id: 'mileage', label: 'Kilometer', type: 'number', placeholder: '50000', unit: 'km' },
      { id: 'fuel', label: 'Palivo', type: 'select', options: ['Benzín', 'Diesel', 'Hybrid', 'Elektro', 'LPG'] },
      { id: 'transmission', label: 'Prevodovka', type: 'select', options: ['Manuál', 'Automat', 'Poloautomat'] },
      { id: 'bodyType', label: 'Karoséria', type: 'select', options: ['Sedan', 'Hatchback', 'Kombi', 'SUV', 'Kupé', 'MPV'] },
      { id: 'color', label: 'Farba', type: 'text', placeholder: 'Čierna' },
      { id: 'condition', label: 'Stav', type: 'select', options: ['Nové', 'Ojazdené', 'Predvádzacie', 'Poškodené'] },
    ]
  },

  reality: {
    fields: [
      { id: 'realEstateType', label: 'Typ ponuky', type: 'select', options: ['Predaj', 'Prenájom', 'Kúpa'], required: true },
      { id: 'propertyType', label: 'Typ nehnuteľnosti', type: 'select', options: ['Byt', 'Dom', 'Pozemok', 'Garáž'], required: true },
      { id: 'floorArea', label: 'Úžitková plocha', type: 'number', placeholder: '50', unit: 'm²' },
      { id: 'rooms', label: 'Počet izieb', type: 'select', options: ['Garsónka', '1', '2', '3', '4', '5', '6+'] },
      { id: 'floor', label: 'Poschodie', type: 'number', placeholder: '3' },
      { id: 'condition', label: 'Stav', type: 'select', options: ['Novostavba', 'Kompletná rekonštrukcia', 'Pôvodný stav', 'Vo výstavbe'] },
    ]
  },

  mobily: {
    fields: [
      { id: 'brand', label: 'Značka', type: 'select', options: ['Apple', 'Samsung', 'Xiaomi', 'Huawei', 'OnePlus', 'Google Pixel', 'Iná'], required: true },
      { id: 'model', label: 'Model', type: 'text', placeholder: 'iPhone 15 Pro', required: true },
      { id: 'storage', label: 'Úložisko', type: 'select', options: ['64 GB', '128 GB', '256 GB', '512 GB', '1 TB'] },
      { id: 'ram', label: 'RAM', type: 'select', options: ['4 GB', '6 GB', '8 GB', '12 GB', '16 GB'] },
      { id: 'condition', label: 'Stav', type: 'select', options: ['Nový', 'Ako nový', 'Veľmi dobrý', 'Dobrý', 'Poškodený'], required: true },
      { id: 'color', label: 'Farba', type: 'text', placeholder: 'Čierna' },
    ]
  },

  pc: {
    fields: [
      { id: 'type', label: 'Typ', type: 'select', options: ['Notebook', 'Stolný počítač', 'All-in-One', 'Tablet'], required: true },
      { id: 'brand', label: 'Značka', type: 'select', options: ['Acer', 'Apple', 'Asus', 'Dell', 'HP', 'Lenovo', 'MSI', 'Iná'], required: true },
      { id: 'processor', label: 'Procesor', type: 'text', placeholder: 'Intel Core i7' },
      { id: 'ram', label: 'RAM', type: 'select', options: ['4 GB', '8 GB', '16 GB', '32 GB', '64 GB'] },
      { id: 'storage', label: 'Úložisko', type: 'text', placeholder: '512 GB SSD' },
      { id: 'condition', label: 'Stav', type: 'select', options: ['Nový', 'Ako nový', 'Veľmi dobrý', 'Dobrý', 'Poškodený'], required: true },
    ]
  },

  motocykle: {
    fields: [
      { id: 'brand', label: 'Značka', type: 'select', options: ['Honda', 'Yamaha', 'Suzuki', 'Kawasaki', 'BMW', 'KTM', 'Ducati', 'Iná'], required: true },
      { id: 'model', label: 'Model', type: 'text', placeholder: 'CBR 600', required: true },
      { id: 'year', label: 'Rok výroby', type: 'number', placeholder: '2020' },
      { id: 'mileage', label: 'Kilometer', type: 'number', placeholder: '15000', unit: 'km' },
      { id: 'engineSize', label: 'Objem motora', type: 'number', placeholder: '600', unit: 'cm³' },
      { id: 'condition', label: 'Stav', type: 'select', options: ['Nový', 'Ojazdený', 'Poškodený'], required: true },
    ]
  },

  oblecenie: {
    fields: [
      { id: 'category', label: 'Kategória', type: 'select', options: ['Tričká', 'Nohavice', 'Šaty', 'Bundy', 'Obuv', 'Doplnky'] },
      { id: 'brand', label: 'Značka', type: 'text', placeholder: 'Zara' },
      { id: 'size', label: 'Veľkosť', type: 'select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
      { id: 'gender', label: 'Pohlavie', type: 'select', options: ['Pánske', 'Dámske', 'Unisex', 'Detské'] },
      { id: 'condition', label: 'Stav', type: 'select', options: ['Nové', 'Ako nové', 'Nosené'] },
    ]
  },

  sport: {
    fields: [
      { id: 'category', label: 'Kategória', type: 'select', options: ['Fitness', 'Bicykle', 'Lyže', 'Snowboard', 'Plávanie', 'Futbal', 'Tenis', 'Iné'] },
      { id: 'brand', label: 'Značka', type: 'text', placeholder: 'Nike' },
      { id: 'condition', label: 'Stav', type: 'select', options: ['Nové', 'Ako nové', 'Použité'] },
    ]
  },

  nabytok: {
    fields: [
      { id: 'category', label: 'Kategória', type: 'select', options: ['Sedačky', 'Stoly', 'Stoličky', 'Postele', 'Skrine', 'Kuchyne', 'Kúpeľňa', 'Iné'] },
      { id: 'material', label: 'Materiál', type: 'text', placeholder: 'Drevo, koža' },
      { id: 'dimensions', label: 'Rozmery', type: 'text', placeholder: '200x100x80 cm' },
      { id: 'condition', label: 'Stav', type: 'select', options: ['Nový', 'Ako nový', 'Použitý'] },
    ]
  },
};

export function getCategoryFields(categoryId: string) {
  return mobileCategoryFields[categoryId]?.fields || [];
}
