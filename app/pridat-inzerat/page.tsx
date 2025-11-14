'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { categories, realEstateTypes, realEstateKinds, realEstateConditions } from '@/lib/categories';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { X, Upload, Sparkles } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { getCategoryFields } from '@/lib/category-fields';
import { CategorySpecificFields } from '@/components/CategorySpecificFields';
import { InlineAIAssistant } from '@/components/InlineAIAssistant';

export default function AddAdPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category_id: '',
    location: '',
    postal_code: '',
    street: '',
    house_number: '',
    phone: ''
  });

  const [vehicleSpecs, setVehicleSpecs] = useState({
    brand: '',
    model: '',
    year: '',
    mileage: '',
    fuel: '',
    transmission: '',
    engine: '',
    power: '',
    engineVolume: '',
    drive: '',
    emission: '',
    emissionClass: '',
    co2Emissions: '',
    doors: '',
    seats: '',
    color: '',
    bodyType: '',
    condition: '',
    vin: '',
    serviceHistory: '',
    lastServiceDate: '',
    lastServiceMileage: ''
  });

  const [vehicleFeatures, setVehicleFeatures] = useState({
    interior: [] as string[],
    infotainment: [] as string[],
    exterior: [] as string[],
    safety: [] as string[],
    other: [] as string[],
    extra: [] as string[]
  });

  const [realEstateData, setRealEstateData] = useState({
    type: '',
    kind: '',
    kindCategory: 'byty',
    usableArea: '',
    builtUpArea: '',
    landArea: '',
    condition: '',
    energyCost: '',
    priceNote: '',
    videoUrl: ''
  });

  // Universal category-specific fields
  const [categorySpecificData, setCategorySpecificData] = useState<Record<string, any>>({});

  const featureOptions = {
    interior: [
      'Automatická klimatizácia',
      'Automaticky nastaviteľný volant pri nástupe',
      'Autorádio',
      'Bezkľúčové štartovanie',
      'Centrálne zamykanie',
      'Elektrická parkovacia brzda',
      'Elektrické okná',
      'Elektrické sedačky',
      'Kožené sedačky',
      'Kožený volant',
      'Multifunkčný volant',
      'Pamäť nastavenia sedadiel',
      'Palubný počítač',
      'Posilňovač riadenia',
      'Radenie pádlami pod volantom',
      'Stop Start systém',
      'Tempomat',
      'Tónované skla',
      'Ukotvenie pre detské sedačky',
      'Vyhrievané sedačky'
    ],
    infotainment: [
      'Android Auto',
      'Apple CarPlay',
      'Bezdrôtové nabíjanie telefónu',
      'Bluetooth pripojenie',
      'Navigácia',
      'Virtuálny kokpit'
    ],
    exterior: [
      'Automatické denné svetlá',
      'Bezkľúčové odomykanie',
      'Elektrické otváranie kufra',
      'Elektrické zrkadlá',
      'Hmlovky',
      'LED predné svetlomety',
      'LED svetlá na denné svietenie',
      'Originálne hliníkové disky',
      'Predný a zadný parkovací senzor',
      'Pozdĺžne strešné nosiče',
      'Zadné svetlá LED'
    ],
    safety: [
      'ABS',
      'Airbag vodiča',
      'Airbag spolujazdca',
      'Airbags',
      'Alarm',
      'Asistent rozjazdu do kopca',
      'Asistent zjazdu z kopca',
      'ASR',
      'Automatické zastavenie pred prekážkou',
      'ESP',
      'Kontrola tlaku pneumatík',
      'Systém upozornenia na vybočenie z jazdného pruhu'
    ],
    other: [
      'Automatické diaľkové svetlá',
      'Laktová opierka',
      'Rozpoznávanie dopravných značiek',
      'USB pripojenie (audio)',
      'USB-C zásuvka',
      'Voľba jazdného režimu'
    ],
    extra: [
      'Automatické parkovanie',
      'Kompresor - lepiaca súprava',
      'Parkovacia kamera',
      'Senzor dažďa'
    ]
  };

  const toggleFeature = (category: keyof typeof vehicleFeatures, feature: string) => {
    setVehicleFeatures(prev => ({
      ...prev,
      [category]: prev[category].includes(feature)
        ? prev[category].filter(f => f !== feature)
        : [...prev[category], feature]
    }));
  };

  const categoryType = categories.find(c => c.slug === selectedCategory)?.type;
  const maxImages = categoryType === 'real-estate' ? 50 : 10;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > maxImages) {
      toast.error(`Môžete nahrať maximálne ${maxImages} obrázkov`);
      return;
    }

    setImages([...images, ...files]);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Musíte sa prihlásiť');
      return;
    }

    if (!formData.title || !formData.description || !formData.category_id || !formData.location) {
      toast.error('Vyplňte všetky povinné polia');
      return;
    }

    if (formData.description.length < 20) {
      toast.error('Popis musí mať minimálne 20 znakov');
      return;
    }

    setLoading(true);

    try {
      const imageUrls: string[] = [];

      for (const image of images) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `ads/${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('ad-images')
          .upload(filePath, image);

        if (uploadError) {
          throw uploadError;
        }

        const { data: urlData } = supabase.storage
          .from('ad-images')
          .getPublicUrl(filePath);

        imageUrls.push(urlData.publicUrl);
      }

      const adData: any = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        user_id: user.id,
        images: imageUrls,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Build metadata object
      const metadata: any = {};

      // Add universal category-specific data
      if (Object.keys(categorySpecificData).length > 0) {
        metadata.categorySpecific = categorySpecificData;
      }

      if (categoryType === 'vehicles' || categoryType === 'motorcycles') {
        const hasSpecs = Object.values(vehicleSpecs).some(v => v !== '');
        if (hasSpecs) {
          const specs: any = {};
          if (vehicleSpecs.brand) specs.brand = vehicleSpecs.brand;
          if (vehicleSpecs.model) specs.model = vehicleSpecs.model;
          if (vehicleSpecs.year) specs.year = parseInt(vehicleSpecs.year);
          if (vehicleSpecs.mileage) specs.mileage = parseInt(vehicleSpecs.mileage);
          if (vehicleSpecs.fuel) specs.fuel = vehicleSpecs.fuel;
          if (vehicleSpecs.transmission) specs.transmission = vehicleSpecs.transmission;
          if (vehicleSpecs.engine) specs.engine = vehicleSpecs.engine;
          if (vehicleSpecs.power) specs.power = vehicleSpecs.power;
          if (vehicleSpecs.engineVolume) specs.engineVolume = vehicleSpecs.engineVolume;
          if (vehicleSpecs.drive) specs.drive = vehicleSpecs.drive;
          if (vehicleSpecs.emission) specs.emission = vehicleSpecs.emission;
          if (vehicleSpecs.emissionClass) specs.emissionClass = vehicleSpecs.emissionClass;
          if (vehicleSpecs.co2Emissions) specs.co2Emissions = vehicleSpecs.co2Emissions;
          if (vehicleSpecs.doors) specs.doors = parseInt(vehicleSpecs.doors);
          if (vehicleSpecs.seats) specs.seats = parseInt(vehicleSpecs.seats);
          if (vehicleSpecs.color) specs.color = vehicleSpecs.color;
          if (vehicleSpecs.bodyType) specs.bodyType = vehicleSpecs.bodyType;
          if (vehicleSpecs.condition) specs.condition = vehicleSpecs.condition;
          if (vehicleSpecs.vin) specs.vin = vehicleSpecs.vin;
          if (vehicleSpecs.serviceHistory) specs.serviceHistory = vehicleSpecs.serviceHistory;
          if (vehicleSpecs.lastServiceDate) specs.lastServiceDate = vehicleSpecs.lastServiceDate;
          if (vehicleSpecs.lastServiceMileage) specs.lastServiceMileage = parseInt(vehicleSpecs.lastServiceMileage);

          metadata.specs = specs;
        }

        const hasFeatures = Object.values(vehicleFeatures).some(arr => arr.length > 0);
        if (hasFeatures) {
          metadata.features = vehicleFeatures;
        }
      } else if (categoryType === 'real-estate') {
        const realEstate: any = {
          type: realEstateData.type,
          kind: realEstateData.kind,
          kindCategory: realEstateData.kindCategory,
          condition: realEstateData.condition
        };

        if (realEstateData.usableArea) realEstate.usableArea = parseFloat(realEstateData.usableArea);
        if (realEstateData.builtUpArea) realEstate.builtUpArea = parseFloat(realEstateData.builtUpArea);
        if (realEstateData.landArea) realEstate.landArea = parseFloat(realEstateData.landArea);
        if (realEstateData.energyCost) realEstate.energyCost = parseFloat(realEstateData.energyCost);
        if (realEstateData.priceNote) realEstate.priceNote = realEstateData.priceNote;
        if (realEstateData.videoUrl) realEstate.videoUrl = realEstateData.videoUrl;

        metadata.realEstate = realEstate;
      }

      // Only add metadata if it has content
      if (Object.keys(metadata).length > 0) {
        adData.metadata = metadata;
      }

      const { error: insertError } = await supabase
        .from('ads')
        .insert([adData]);

      if (insertError) {
        throw insertError;
      }

      toast.success('Inzerát bol úspešne pridaný');
      router.push('/moje-inzeraty');
    } catch (error) {
      console.error('Error creating ad:', error);
      toast.error('Chyba pri vytváraní inzerátu');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <p>Musíte sa prihlásiť</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#F8F9FA] dark:bg-gray-900 py-8 pb-24 md:pb-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* AI Assistant - Left Sidebar (sticky na desktop) */}
            {selectedCategory && user && (
              <div className="lg:col-span-4 order-2 lg:order-1">
                <div className="lg:sticky lg:top-24">
                  <InlineAIAssistant
                    formData={{
                      title: formData.title,
                      description: formData.description,
                      price: formData.price,
                      category_id: formData.category_id,
                      images: previews,
                    }}
                    onSuggestion={(field, value) => {
                      setFormData({ ...formData, [field]: value });
                    }}
                    userId={user.id}
                  />
                </div>
              </div>
            )}

            {/* Main Form - Right Side */}
            <div className={selectedCategory && user ? "lg:col-span-8 order-1 lg:order-2" : "lg:col-span-12"}>
              <Card className="p-8">
                <h1 className="text-3xl font-bold mb-8">Pridať inzerát</h1>

                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Kategória */}
                  <div className="space-y-3">
                    <Label htmlFor="category" className="text-base font-semibold">Kategória *</Label>
                    <Select
                      value={formData.category_id}
                      onValueChange={(v) => {
                        setFormData({ ...formData, category_id: v });
                        setSelectedCategory(v);
                      }}
                      required
                    >
                      <SelectTrigger id="category" className="h-11">
                        <SelectValue placeholder="Vyberte kategóriu" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.slug}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedCategory && (
                    <>

                  {/* Nadpis */}
                  <div className="space-y-3">
                    <Label htmlFor="title" className="text-base font-semibold">Nadpis *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value.slice(0, 50) })}
                      placeholder="Stručný a výstižný názov"
                      maxLength={50}
                      required
                      className="h-11"
                    />
                  </div>

                  {/* Text inzerátu */}
                  <div className="space-y-3">
                    <Label htmlFor="description" className="text-base font-semibold">
                      Text inzerátu *
                      <span className="text-sm text-gray-500 font-normal ml-2">
                        (Minimálne 20 znakov, Napísali ste {formData.description.length} znakov)
                      </span>
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Detailný popis..."
                      rows={8}
                      required
                      className="resize-none"
                    />
                  </div>


                  {/* Lokalita */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label htmlFor="location" className="text-base font-semibold">Mesto / Obec *</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="napr. Bratislava"
                        required
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="postal_code" className="text-base font-semibold">PSČ</Label>
                      <Input
                        id="postal_code"
                        value={formData.postal_code}
                        onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                        placeholder="napr. 81101"
                        className="h-11"
                      />
                    </div>
                  </div>


                  {/* Cena */}
                  <div className="space-y-3">
                    <Label htmlFor="price" className="text-base font-semibold">
                      Cena * (€)
                      <span className="text-sm text-gray-500 font-normal ml-2">0 = Dohodou</span>
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0 = Dohodou"
                      className="h-11"
                    />
                  </div>

                  {/* Telefónne číslo */}
                  <div className="space-y-3">
                    <Label htmlFor="phone" className="text-base font-semibold">
                      Telefónne číslo
                      <span className="text-sm text-gray-500 font-normal ml-2">(Nezobrazuje sa verejne)</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+421 XXX XXX XXX"
                      className="h-11"
                    />
                    <p className="text-sm text-gray-500">
                      Číslo sa nezobrazuje verejne. Používatelia uvidia len tlačidlo na zavolanie.
                    </p>
                  </div>


                  {(categoryType === 'vehicles' || categoryType === 'motorcycles') && (
                    <>
                      {/* Špecifikácie vozidla */}
                      <div className="border-t border-gray-200 pt-8 mt-8">
                        <h2 className="text-xl font-bold mb-6">Špecifikácie vozidla</h2>

                        {/* Základné údaje */}
                        <div className="mb-6">
                          <h3 className="text-base font-semibold mb-4 text-gray-700">Základné údaje</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="brand">Značka *</Label>
                              <Input
                                id="brand"
                                value={vehicleSpecs.brand}
                                onChange={(e) => setVehicleSpecs({ ...vehicleSpecs, brand: e.target.value })}
                                placeholder="napr. Volkswagen"
                                className="h-11"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="model">Model *</Label>
                              <Input
                                id="model"
                                value={vehicleSpecs.model}
                                onChange={(e) => setVehicleSpecs({ ...vehicleSpecs, model: e.target.value })}
                                placeholder="napr. Tiguan"
                                className="h-11"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="year">Rok výroby *</Label>
                              <Input
                                id="year"
                                type="number"
                                value={vehicleSpecs.year}
                                onChange={(e) => setVehicleSpecs({ ...vehicleSpecs, year: e.target.value })}
                                placeholder="napr. 2021"
                                className="h-11"
                                min="1900"
                                max={new Date().getFullYear() + 1}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="mileage">Tachometer (km) *</Label>
                              <Input
                                id="mileage"
                                type="number"
                                value={vehicleSpecs.mileage}
                                onChange={(e) => setVehicleSpecs({ ...vehicleSpecs, mileage: e.target.value })}
                                placeholder="napr. 190417"
                                className="h-11"
                                min="0"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Technické parametre */}
                        <div className="mb-6">
                          <h3 className="text-base font-semibold mb-4 text-gray-700">Technické parametre</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="fuel">Palivo *</Label>
                              <Select
                                value={vehicleSpecs.fuel}
                                onValueChange={(v) => setVehicleSpecs({ ...vehicleSpecs, fuel: v })}
                              >
                                <SelectTrigger id="fuel" className="h-11">
                                  <SelectValue placeholder="Vyberte palivo" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Benzín">Benzín</SelectItem>
                                  <SelectItem value="Diesel">Diesel</SelectItem>
                                  <SelectItem value="Elektro">Elektro</SelectItem>
                                  <SelectItem value="Hybrid">Hybrid</SelectItem>
                                  <SelectItem value="Plug-in hybrid">Plug-in hybrid</SelectItem>
                                  <SelectItem value="LPG">LPG</SelectItem>
                                  <SelectItem value="CNG">CNG</SelectItem>
                                  <SelectItem value="Vodík">Vodík</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="transmission">Prevodovka *</Label>
                              <Select
                                value={vehicleSpecs.transmission}
                                onValueChange={(v) => setVehicleSpecs({ ...vehicleSpecs, transmission: v })}
                              >
                                <SelectTrigger id="transmission" className="h-11">
                                  <SelectValue placeholder="Vyberte prevodovku" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Manuál">Manuál</SelectItem>
                                  <SelectItem value="Automat">Automat</SelectItem>
                                  <SelectItem value="Poloautomat">Poloautomat</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="power">Výkon (kW)</Label>
                              <Input
                                id="power"
                                type="number"
                                value={vehicleSpecs.power}
                                onChange={(e) => setVehicleSpecs({ ...vehicleSpecs, power: e.target.value })}
                                placeholder="napr. 110"
                                className="h-11"
                                min="0"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="engine">Objem motora (cm³)</Label>
                              <Input
                                id="engine"
                                type="number"
                                value={vehicleSpecs.engine}
                                onChange={(e) => setVehicleSpecs({ ...vehicleSpecs, engine: e.target.value })}
                                placeholder="napr. 1968"
                                className="h-11"
                                min="0"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="drive">Pohon</Label>
                              <Select
                                value={vehicleSpecs.drive}
                                onValueChange={(v) => setVehicleSpecs({ ...vehicleSpecs, drive: v })}
                              >
                                <SelectTrigger id="drive" className="h-11">
                                  <SelectValue placeholder="Vyberte pohon" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Predný">Predný</SelectItem>
                                  <SelectItem value="Zadný">Zadný</SelectItem>
                                  <SelectItem value="4x4">4x4 (AWD/4WD)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="emission">Emisná trieda</Label>
                              <Select
                                value={vehicleSpecs.emission}
                                onValueChange={(v) => setVehicleSpecs({ ...vehicleSpecs, emission: v })}
                              >
                                <SelectTrigger id="emission" className="h-11">
                                  <SelectValue placeholder="Vyberte emisnú triedu" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Euro 6">Euro 6</SelectItem>
                                  <SelectItem value="Euro 5">Euro 5</SelectItem>
                                  <SelectItem value="Euro 4">Euro 4</SelectItem>
                                  <SelectItem value="Euro 3">Euro 3</SelectItem>
                                  <SelectItem value="Iná">Iná</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>

                        {/* Karoséria a exteriér */}
                        <div className="mb-6">
                          <h3 className="text-base font-semibold mb-4 text-gray-700">Karoséria a exteriér</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="bodyType">Typ karosérie</Label>
                              <Select
                                value={vehicleSpecs.bodyType}
                                onValueChange={(v) => setVehicleSpecs({ ...vehicleSpecs, bodyType: v })}
                              >
                                <SelectTrigger id="bodyType" className="h-11">
                                  <SelectValue placeholder="Vyberte typ karosérie" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Sedan">Sedan</SelectItem>
                                  <SelectItem value="Hatchback">Hatchback</SelectItem>
                                  <SelectItem value="Combi">Combi</SelectItem>
                                  <SelectItem value="SUV">SUV</SelectItem>
                                  <SelectItem value="Kupé">Kupé</SelectItem>
                                  <SelectItem value="Kabriolet">Kabriolet</SelectItem>
                                  <SelectItem value="MPV">MPV</SelectItem>
                                  <SelectItem value="Pick-up">Pick-up</SelectItem>
                                  <SelectItem value="Dodávka">Dodávka</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="color">Farba</Label>
                              <Select
                                value={vehicleSpecs.color}
                                onValueChange={(v) => setVehicleSpecs({ ...vehicleSpecs, color: v })}
                              >
                                <SelectTrigger id="color" className="h-11">
                                  <SelectValue placeholder="Vyberte farbu" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Biela">Biela</SelectItem>
                                  <SelectItem value="Čierna">Čierna</SelectItem>
                                  <SelectItem value="Sivá">Sivá</SelectItem>
                                  <SelectItem value="Strieborná">Strieborná</SelectItem>
                                  <SelectItem value="Modrá">Modrá</SelectItem>
                                  <SelectItem value="Červená">Červená</SelectItem>
                                  <SelectItem value="Zelená">Zelená</SelectItem>
                                  <SelectItem value="Žltá">Žltá</SelectItem>
                                  <SelectItem value="Oranžová">Oranžová</SelectItem>
                                  <SelectItem value="Hnedá">Hnedá</SelectItem>
                                  <SelectItem value="Béžová">Béžová</SelectItem>
                                  <SelectItem value="Zlatá">Zlatá</SelectItem>
                                  <SelectItem value="Iná">Iná</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="seats">Počet sedadiel</Label>
                              <Select
                                value={vehicleSpecs.seats}
                                onValueChange={(v) => setVehicleSpecs({ ...vehicleSpecs, seats: v })}
                              >
                                <SelectTrigger id="seats" className="h-11">
                                  <SelectValue placeholder="Počet sedadiel" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="2">2</SelectItem>
                                  <SelectItem value="4">4</SelectItem>
                                  <SelectItem value="5">5</SelectItem>
                                  <SelectItem value="6">6</SelectItem>
                                  <SelectItem value="7">7</SelectItem>
                                  <SelectItem value="8">8</SelectItem>
                                  <SelectItem value="9">9</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="doors">Počet dverí</Label>
                              <Select
                                value={vehicleSpecs.doors}
                                onValueChange={(v) => setVehicleSpecs({ ...vehicleSpecs, doors: v })}
                              >
                                <SelectTrigger id="doors" className="h-11">
                                  <SelectValue placeholder="Počet dverí" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="2/3">2/3</SelectItem>
                                  <SelectItem value="4/5">4/5</SelectItem>
                                  <SelectItem value="6/7">6/7</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="vin">VIN (voliteľné)</Label>
                              <Input
                                id="vin"
                                value={vehicleSpecs.vin}
                                onChange={(e) => setVehicleSpecs({ ...vehicleSpecs, vin: e.target.value.toUpperCase() })}
                                placeholder="17-miestny VIN kód"
                                className="h-11"
                                maxLength={17}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Dodatočné informácie */}
                        <div className="mb-6">
                          <h3 className="text-base font-semibold mb-4 text-gray-700">Stav vozidla</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="condition">Stav</Label>
                              <Select
                                value={vehicleSpecs.condition}
                                onValueChange={(v) => setVehicleSpecs({ ...vehicleSpecs, condition: v })}
                              >
                                <SelectTrigger id="condition" className="h-11">
                                  <SelectValue placeholder="Vyberte stav" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Nové">Nové</SelectItem>
                                  <SelectItem value="Predvádzacie">Predvádzacie</SelectItem>
                                  <SelectItem value="Jazdené">Jazdené</SelectItem>
                                  <SelectItem value="Poškodené">Poškodené</SelectItem>
                                  <SelectItem value="Veterán">Veterán</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="engineVolume">Motor (napr. xDrive30d)</Label>
                              <Input
                                id="engineVolume"
                                value={vehicleSpecs.engineVolume}
                                onChange={(e) => setVehicleSpecs({ ...vehicleSpecs, engineVolume: e.target.value })}
                                placeholder="napr. xDrive30d, 2.0 TDI"
                                className="h-11"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="emissionClass">Emisná kalkulačka</Label>
                              <Input
                                id="co2Emissions"
                                value={vehicleSpecs.co2Emissions}
                                onChange={(e) => setVehicleSpecs({ ...vehicleSpecs, co2Emissions: e.target.value })}
                                placeholder="napr. 162 g/km"
                                className="h-11"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="serviceHistory">História servisu</Label>
                              <Input
                                id="serviceHistory"
                                value={vehicleSpecs.serviceHistory}
                                onChange={(e) => setVehicleSpecs({ ...vehicleSpecs, serviceHistory: e.target.value })}
                                placeholder="napr. Elektronická servisná knižka"
                                className="h-11"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="lastServiceDate">Posledný servis (dátum)</Label>
                              <Input
                                id="lastServiceDate"
                                type="date"
                                value={vehicleSpecs.lastServiceDate}
                                onChange={(e) => setVehicleSpecs({ ...vehicleSpecs, lastServiceDate: e.target.value })}
                                className="h-11"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="lastServiceMileage">Posledný servis (km)</Label>
                              <Input
                                id="lastServiceMileage"
                                type="number"
                                value={vehicleSpecs.lastServiceMileage}
                                onChange={(e) => setVehicleSpecs({ ...vehicleSpecs, lastServiceMileage: e.target.value })}
                                placeholder="napr. 210845"
                                className="h-11"
                                min="0"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Výbava */}
                      <div className="border-t border-gray-200 pt-8 mt-8">
                        <h2 className="text-xl font-bold mb-6">Výbava (nepovinné)</h2>
                        <div className="space-y-6">
                          <div>
                            <h3 className="text-base font-semibold mb-4">Interiér</h3>
                            <div className="grid grid-cols-2 gap-3">
                              {featureOptions.interior.map((feature) => (
                                <div key={feature} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`interior-${feature}`}
                                    checked={vehicleFeatures.interior.includes(feature)}
                                    onCheckedChange={() => toggleFeature('interior', feature)}
                                  />
                                  <label htmlFor={`interior-${feature}`} className="text-sm cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    {feature}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h3 className="text-base font-semibold mb-4">Infotainment</h3>
                            <div className="grid grid-cols-2 gap-3">
                              {featureOptions.infotainment.map((feature) => (
                                <div key={feature} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`infotainment-${feature}`}
                                    checked={vehicleFeatures.infotainment.includes(feature)}
                                    onCheckedChange={() => toggleFeature('infotainment', feature)}
                                  />
                                  <label htmlFor={`infotainment-${feature}`} className="text-sm cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    {feature}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h3 className="text-base font-semibold mb-4">Exteriér</h3>
                            <div className="grid grid-cols-2 gap-3">
                              {featureOptions.exterior.map((feature) => (
                                <div key={feature} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`exterior-${feature}`}
                                    checked={vehicleFeatures.exterior.includes(feature)}
                                    onCheckedChange={() => toggleFeature('exterior', feature)}
                                  />
                                  <label htmlFor={`exterior-${feature}`} className="text-sm cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    {feature}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h3 className="text-base font-semibold mb-4">Bezpečnosť</h3>
                            <div className="grid grid-cols-2 gap-3">
                              {featureOptions.safety.map((feature) => (
                                <div key={feature} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`safety-${feature}`}
                                    checked={vehicleFeatures.safety.includes(feature)}
                                    onCheckedChange={() => toggleFeature('safety', feature)}
                                  />
                                  <label htmlFor={`safety-${feature}`} className="text-sm cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    {feature}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h3 className="text-base font-semibold mb-4">Ostatné</h3>
                            <div className="grid grid-cols-2 gap-3">
                              {featureOptions.other.map((feature) => (
                                <div key={feature} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`other-${feature}`}
                                    checked={vehicleFeatures.other.includes(feature)}
                                    onCheckedChange={() => toggleFeature('other', feature)}
                                  />
                                  <label htmlFor={`other-${feature}`} className="text-sm cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    {feature}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h3 className="text-base font-semibold mb-4">Extra</h3>
                            <div className="grid grid-cols-2 gap-3">
                              {featureOptions.extra.map((feature) => (
                                <div key={feature} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`extra-${feature}`}
                                    checked={vehicleFeatures.extra.includes(feature)}
                                    onCheckedChange={() => toggleFeature('extra', feature)}
                                  />
                                  <label htmlFor={`extra-${feature}`} className="text-sm cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    {feature}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Universal Category-Specific Fields */}
                  {formData.category_id && getCategoryFields(formData.category_id).length > 0 && (
                    <div className="border-t border-gray-200 pt-8 mt-8">
                      <CategorySpecificFields
                        fields={getCategoryFields(formData.category_id)}
                        values={categorySpecificData}
                        onChange={(fieldId, value) => {
                          setCategorySpecificData(prev => ({
                            ...prev,
                            [fieldId]: value
                          }));
                        }}
                      />
                    </div>
                  )}

                  {/* Obrázky */}
                  <div className="border-t border-gray-200 pt-8 mt-8">
                    <Label className="text-base font-semibold">Obrázky (max {maxImages})</Label>
                    <div className="mt-4">
                      <label
                        htmlFor="images"
                        className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="text-center p-4">
                          <Upload className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                          <p className="text-base font-medium text-gray-700 dark:text-gray-300 mb-1">Presuňte fotky sem</p>
                          <p className="text-sm text-gray-500">
                            Nahrajte až {maxImages} fotiek. Max. veľkosť jednej fotky je až 10 MB.
                          </p>
                        </div>
                        <input
                          id="images"
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {previews.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-2">
                          Celkom: {images.length} z max. {maxImages} fotiek
                        </p>
                        <div className="grid grid-cols-4 gap-4">
                          {previews.map((preview, idx) => (
                            <div key={idx} className="relative bg-gray-100 rounded aspect-square">
                              <img
                                src={preview}
                                alt={`Preview ${idx + 1}`}
                                className="w-full h-full object-contain rounded"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(idx)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                              >
                                <X className="h-4 w-4" />
                              </button>
                              {idx === 0 && (
                                <div className="absolute bottom-0 left-0 right-0 bg-green-600 text-white text-xs py-1 text-center">
                                  Náhľad
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 text-base font-semibold"
                        style={{ backgroundColor: '#2ECC71' }}
                      >
                        {loading ? 'Ukladám...' : 'Pridať inzerát'}
                      </Button>
                    </>
                  )}
                </form>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
