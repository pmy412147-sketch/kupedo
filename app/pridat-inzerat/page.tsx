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
import { X, Upload } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

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
    houseNumber: ''
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
    drive: '',
    emission: '',
    seats: '',
    color: '',
    bodyType: '',
    vin: ''
  });

  const [vehicleFeatures, setVehicleFeatures] = useState({
    interior: [] as string[],
    exterior: [] as string[],
    safety: [] as string[],
    infotainment: [] as string[]
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

  const featureOptions = {
    interior: [
      'Adaptívny tempomat',
      'Autorádio',
      'Centrálne zamykanie',
      'Elektrické okná',
      'Multifunkčný volant',
      'Posilňovač riadenia',
      'Radenie pádlami pod volantom',
      'Tónované skla',
      'Vyhrievané sedačky',
      'Vyhrievaný volant'
    ],
    exterior: [
      'Automatické denné svetlá',
      'Bezkľúčové odomykanie',
      'Bezkľúčové štartovanie',
      'Elektrická parkovacia brzda',
      'Kožený volant',
      'Palubný počítač',
      'Posúvacie zadné sedadlá',
      'Stop Start systém',
      'Ukotvenie pre detské sedačky'
    ],
    safety: [
      'ABS',
      'Airbag vodiča',
      'Airbag spolujazdca',
      'Asistent rozjazdu do kopca',
      'Asistent zjazdu z kopca',
      'ASR',
      'ESP',
      'Kontrola tlaku pneumatík',
      'Systém upozornenia na vybočenie z jazdného pruhu',
      'Automatické zastavenie pred prekážkou'
    ],
    infotainment: [
      'Android Auto',
      'Apple CarPlay',
      'Bluetooth pripojenie',
      'Navigácia',
      'MirrorLink',
      'Virtuálny kokpit'
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

      if (categoryType === 'vehicle') {
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
          if (vehicleSpecs.drive) specs.drive = vehicleSpecs.drive;
          if (vehicleSpecs.emission) specs.emission = vehicleSpecs.emission;
          if (vehicleSpecs.seats) specs.seats = parseInt(vehicleSpecs.seats);
          if (vehicleSpecs.color) specs.color = vehicleSpecs.color;
          if (vehicleSpecs.bodyType) specs.bodyType = vehicleSpecs.bodyType;
          if (vehicleSpecs.vin) specs.vin = vehicleSpecs.vin;

          adData.specs = specs;
        }

        const hasFeatures = Object.values(vehicleFeatures).some(arr => arr.length > 0);
        if (hasFeatures) {
          adData.features = vehicleFeatures;
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

        adData.realEstate = realEstate;
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
      <main className="min-h-screen bg-[#F8F9FA] dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
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
                  {categoryType === 'real-estate' && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="realEstateType">Typ *</Label>
                          <Select
                            value={realEstateData.type}
                            onValueChange={(v) => setRealEstateData({ ...realEstateData, type: v })}
                            required
                          >
                            <SelectTrigger id="realEstateType">
                              <SelectValue placeholder="Vyberte typ" />
                            </SelectTrigger>
                            <SelectContent>
                              {realEstateTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="kindCategory">Druh kategória *</Label>
                          <Select
                            value={realEstateData.kindCategory}
                            onValueChange={(v) => setRealEstateData({ ...realEstateData, kindCategory: v, kind: '' })}
                            required
                          >
                            <SelectTrigger id="kindCategory">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="byty">Byty</SelectItem>
                              <SelectItem value="domy">Domy</SelectItem>
                              <SelectItem value="pozemky">Pozemky</SelectItem>
                              <SelectItem value="objekty">Objekty</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="kind">Druh *</Label>
                        <Select
                          value={realEstateData.kind}
                          onValueChange={(v) => setRealEstateData({ ...realEstateData, kind: v })}
                          required
                        >
                          <SelectTrigger id="kind">
                            <SelectValue placeholder="Vyberte druh" />
                          </SelectTrigger>
                          <SelectContent>
                            {realEstateKinds[realEstateData.kindCategory as keyof typeof realEstateKinds]?.map((kind) => (
                              <SelectItem key={kind} value={kind}>
                                {kind}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

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

                  {categoryType === 'real-estate' && (
                    <>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="usableArea">Úžitková plocha (m²)</Label>
                          <Input
                            id="usableArea"
                            type="number"
                            step="0.01"
                            value={realEstateData.usableArea}
                            onChange={(e) => setRealEstateData({ ...realEstateData, usableArea: e.target.value })}
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <Label htmlFor="builtUpArea">Zastavaná plocha (m²)</Label>
                          <Input
                            id="builtUpArea"
                            type="number"
                            step="0.01"
                            value={realEstateData.builtUpArea}
                            onChange={(e) => setRealEstateData({ ...realEstateData, builtUpArea: e.target.value })}
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <Label htmlFor="landArea">Plocha pozemku (m²)</Label>
                          <Input
                            id="landArea"
                            type="number"
                            step="0.01"
                            value={realEstateData.landArea}
                            onChange={(e) => setRealEstateData({ ...realEstateData, landArea: e.target.value })}
                            placeholder="0"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="condition">Stav *</Label>
                        <Select
                          value={realEstateData.condition}
                          onValueChange={(v) => setRealEstateData({ ...realEstateData, condition: v })}
                          required
                        >
                          <SelectTrigger id="condition">
                            <SelectValue placeholder="Vyberte stav" />
                          </SelectTrigger>
                          <SelectContent>
                            {realEstateConditions.map((cond) => (
                              <SelectItem key={cond} value={cond}>
                                {cond}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

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

                  {categoryType === 'real-estate' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="street">Ulica</Label>
                        <Input
                          id="street"
                          value={formData.street}
                          onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                          placeholder="Názov ulice"
                        />
                      </div>
                      <div>
                        <Label htmlFor="houseNumber">Popisné číslo</Label>
                        <Input
                          id="houseNumber"
                          value={formData.houseNumber}
                          onChange={(e) => setFormData({ ...formData, houseNumber: e.target.value })}
                          placeholder="Číslo domu"
                        />
                      </div>
                    </div>
                  )}

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

                  {categoryType === 'real-estate' && (
                    <>
                      <div>
                        <Label htmlFor="energyCost">Energie (€/mesiac)</Label>
                        <Input
                          id="energyCost"
                          type="number"
                          step="0.01"
                          value={realEstateData.energyCost}
                          onChange={(e) => setRealEstateData({ ...realEstateData, energyCost: e.target.value })}
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <Label htmlFor="priceNote">Poznámka k cene</Label>
                        <Input
                          id="priceNote"
                          value={realEstateData.priceNote}
                          onChange={(e) => setRealEstateData({ ...realEstateData, priceNote: e.target.value })}
                          placeholder="Voliteľná poznámka"
                        />
                      </div>

                      <div>
                        <Label htmlFor="videoUrl">Video</Label>
                        <Input
                          id="videoUrl"
                          value={realEstateData.videoUrl}
                          onChange={(e) => setRealEstateData({ ...realEstateData, videoUrl: e.target.value })}
                          placeholder="Link na YouTube, videobhliadky.sk alebo matterport.com"
                        />
                      </div>
                    </>
                  )}

                  {categoryType === 'vehicle' && (
                    <>
                      {/* Špecifikácie vozidla */}
                      <div className="border-t border-gray-200 pt-8 mt-8">
                        <h2 className="text-xl font-bold mb-6">Špecifikácie vozidla (nepovinné)</h2>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="brand">Značka</Label>
                            <Input
                              id="brand"
                              value={vehicleSpecs.brand}
                              onChange={(e) => setVehicleSpecs({ ...vehicleSpecs, brand: e.target.value })}
                              placeholder="napr. Volkswagen"
                              className="h-11"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="model">Model</Label>
                            <Input
                              id="model"
                              value={vehicleSpecs.model}
                              onChange={(e) => setVehicleSpecs({ ...vehicleSpecs, model: e.target.value })}
                              placeholder="napr. Tiguan"
                              className="h-11"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="year">Rok výroby</Label>
                            <Input
                              id="year"
                              type="number"
                              value={vehicleSpecs.year}
                              onChange={(e) => setVehicleSpecs({ ...vehicleSpecs, year: e.target.value })}
                              placeholder="napr. 2021"
                              className="h-11"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="mileage">Tachometer (km)</Label>
                            <Input
                              id="mileage"
                              type="number"
                              value={vehicleSpecs.mileage}
                              onChange={(e) => setVehicleSpecs({ ...vehicleSpecs, mileage: e.target.value })}
                              placeholder="napr. 190417"
                              className="h-11"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="fuel">Palivo</Label>
                            <Input
                              id="fuel"
                              value={vehicleSpecs.fuel}
                              onChange={(e) => setVehicleSpecs({ ...vehicleSpecs, fuel: e.target.value })}
                              placeholder="napr. Diesel"
                              className="h-11"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="transmission">Prevodovka</Label>
                            <Input
                              id="transmission"
                              value={vehicleSpecs.transmission}
                              onChange={(e) => setVehicleSpecs({ ...vehicleSpecs, transmission: e.target.value })}
                              placeholder="napr. Automat"
                              className="h-11"
                            />
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
                        </div>
                      </div>
                    </>
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
      </main>
    </>
  );
}
