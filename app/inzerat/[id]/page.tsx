'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import { MapPin, Calendar, Heart, MessageSquare, User, ChevronLeft, ChevronRight, Check, Home, Maximize, Square } from 'lucide-react';
import { toast } from 'sonner';
import { GoogleAdSense } from '@/components/GoogleAdSense';
import { ImageLightbox } from '@/components/ImageLightbox';
import { FinancingCalculator } from '@/components/FinancingCalculator';

interface Ad {
  id: string;
  title: string;
  description: string;
  price: number;
  category_id: string;
  location: string;
  postal_code: string;
  street?: string;
  houseNumber?: string;
  user_id: string;
  images: string[];
  status: string;
  created_at: string;
  specs?: {
    brand?: string;
    model?: string;
    year?: number;
    mileage?: number;
    fuel?: string;
    transmission?: string;
    engine?: string;
    power?: string;
    engineVolume?: string;
    drive?: string;
    emission?: string;
    emissionClass?: string;
    co2Emissions?: string;
    doors?: number;
    seats?: number;
    color?: string;
    bodyType?: string;
    condition?: string;
    vin?: string;
    serviceHistory?: string;
    lastServiceDate?: string;
    lastServiceMileage?: number;
  };
  features?: {
    interior?: string[];
    infotainment?: string[];
    exterior?: string[];
    safety?: string[];
    other?: string[];
    extra?: string[];
  };
  realEstate?: {
    type?: string;
    kind?: string;
    kindCategory?: string;
    usableArea?: number;
    builtUpArea?: number;
    landArea?: number;
    condition?: string;
    energyCost?: number;
    priceNote?: string;
    videoUrl?: string;
  };
  categorySpecific?: Record<string, any>;
}

interface UserProfile {
  id: string;
  name: string;
  avatar_url?: string;
}

export default function AdDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [ad, setAd] = useState<Ad | null>(null);
  const [seller, setSeller] = useState<UserProfile | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        // Track page view start time
        const startTime = Date.now();

        // Fetch ad from Supabase
        const { data: adData, error: adError } = await supabase
          .from('ads')
          .select('*')
          .eq('id', params.id as string)
          .maybeSingle();

        if (adError) {
          console.error('Error fetching ad:', adError);
          setLoading(false);
          return;
        }

        if (!adData) {
          console.log('Ad not found');
          setLoading(false);
          return;
        }

        // Parse metadata if it exists
        let parsedAd = { ...adData };
        if (adData.metadata) {
          parsedAd = {
            ...adData,
            specs: adData.metadata.specs || undefined,
            features: adData.metadata.features || undefined,
            realEstate: adData.metadata.realEstate || undefined,
            categorySpecific: adData.metadata.categorySpecific || undefined,
          };
        }

        setAd(parsedAd as Ad);

        // Fetch seller profile
        const { data: sellerData } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url')
          .eq('id', adData.user_id)
          .single();

        if (sellerData) {
          setSeller({
            id: sellerData.id,
            name: sellerData.display_name || 'Používateľ',
            avatar_url: sellerData.avatar_url
          } as UserProfile);
        }

        // Check if favorited
        if (user) {
          const { data: favData } = await supabase
            .from('favorites')
            .select('id')
            .eq('user_id', user.id)
            .eq('ad_id', params.id as string)
            .single();

          setIsFavorite(!!favData);
        }

        // Track view with analytics
        const { trackAdView } = await import('@/lib/analytics');
        trackAdView(params.id as string, user?.id);

        // Track duration on unmount
        return () => {
          const duration = Math.floor((Date.now() - startTime) / 1000);
          if (duration > 3) {
            trackAdView(params.id as string, user?.id, duration);
          }
        };
      } catch (error) {
        console.error('Error fetching ad:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAd();
  }, [params.id, user]);

  const toggleFavorite = async () => {
    if (!user) {
      toast.error('Musíte sa prihlásiť');
      return;
    }

    try {
      if (isFavorite) {
        // Remove from favorites
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('ad_id', params.id);

        setIsFavorite(false);
        toast.success('Odstránené z obľúbených');
      } else {
        // Add to favorites
        await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            ad_id: params.id,
            created_at: new Date().toISOString()
          });

        setIsFavorite(true);
        toast.success('Pridané do obľúbených');

        // Track interaction
        const { trackInteraction } = await import('@/lib/analytics');
        trackInteraction(params.id as string, 'save', user.id);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Chyba pri pridávaní do obľúbených');
    }
  };

  const handleContactSeller = async () => {
    if (!user) {
      toast.error('Musíte sa prihlásiť');
      return;
    }

    // Track interaction
    const { trackInteraction } = await import('@/lib/analytics');
    trackInteraction(params.id as string, 'click_message', user.uid);

    router.push(`/chat/${ad?.user_id}?ad=${params.id}`);
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-200 rounded-lg mb-4" />
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-1/4" />
          </div>
        </div>
      </>
    );
  }

  if (!ad) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <p>Inzerát nebol nájdený</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#F8F9FA] dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="p-6 mb-6">
                <div className="mb-4">
                  {ad.images.length > 0 ? (
                    <div className="relative">
                      <div
                        className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden cursor-pointer group"
                        onClick={() => setLightboxOpen(true)}
                      >
                        <img
                          src={ad.images[selectedImage]}
                          alt={ad.title}
                          className="w-full h-full object-contain transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                          <div className="bg-black/60 text-white px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            Kliknite pre zväčšenie
                          </div>
                        </div>
                        {ad.images.length > 1 && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImage((prev) => (prev === 0 ? ad.images.length - 1 : prev - 1));
                              }}
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-10"
                            >
                              <ChevronLeft className="h-6 w-6" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImage((prev) => (prev === ad.images.length - 1 ? 0 : prev + 1));
                              }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-10"
                            >
                              <ChevronRight className="h-6 w-6" />
                            </button>
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm z-10">
                              {selectedImage + 1} / {ad.images.length}
                            </div>
                          </>
                        )}
                      </div>
                      {ad.images.length > 1 && (
                        <div className="grid grid-cols-6 gap-2 mt-4">
                          {ad.images.map((img, idx) => (
                            <div
                              key={idx}
                              className={`relative aspect-square bg-gray-100 rounded cursor-pointer overflow-hidden ${
                                selectedImage === idx ? 'ring-2 ring-[#2ECC71]' : ''
                              }`}
                              onClick={() => setSelectedImage(idx)}
                            >
                              <img
                                src={img}
                                alt={`${ad.title} ${idx + 1}`}
                                className="w-full h-full object-contain"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                      Bez obrázku
                    </div>
                  )}
                </div>

                <h1 className="text-3xl font-bold mb-4">{ad.title}</h1>

                <div className="flex items-center gap-4 mb-6 text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {ad.location}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(ad.created_at).toLocaleDateString('sk-SK')}
                  </div>
                </div>

                {ad.realEstate ? (
                  <div className="mb-6">
                    <Card className="p-6 mb-4">
                      <h2 className="text-xl font-semibold mb-4">{ad.realEstate.kind}</h2>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        {ad.realEstate.usableArea && (
                          <div className="flex items-start gap-2">
                            <Home className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <p className="text-sm text-gray-600">Plocha bytu</p>
                              <p className="font-semibold">{ad.realEstate.usableArea} m²</p>
                            </div>
                          </div>
                        )}
                        {ad.realEstate.builtUpArea && (
                          <div className="flex items-start gap-2">
                            <Maximize className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <p className="text-sm text-gray-600">Zastavená plocha</p>
                              <p className="font-semibold break-words">{ad.realEstate.builtUpArea} m²</p>
                            </div>
                          </div>
                        )}
                        {ad.realEstate.condition && (
                          <div className="flex items-start gap-2">
                            <Square className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <p className="text-sm text-gray-600">Stav</p>
                              <p className="font-semibold break-words">{ad.realEstate.condition}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>

                    <Card className="p-6">
                      <h2 className="text-xl font-semibold mb-4">Popis nehnuteľnosti</h2>
                      <div className="relative">
                        <p className="whitespace-pre-wrap text-gray-700">
                          {showFullDescription
                            ? ad.description
                            : ad.description.slice(0, 200) + (ad.description.length > 200 ? '...' : '')
                          }
                        </p>
                        {ad.description.length > 200 && (
                          <button
                            onClick={() => setShowFullDescription(!showFullDescription)}
                            className="text-blue-600 hover:underline mt-2 font-medium"
                          >
                            {showFullDescription ? 'Zobraziť menej' : 'Čítať ďalej'}
                          </button>
                        )}
                      </div>
                    </Card>
                  </div>
                ) : (
                  <div className="prose max-w-none mb-6">
                    <h2 className="text-xl font-semibold mb-2">Popis</h2>
                    <p className="whitespace-pre-wrap">{ad.description}</p>
                  </div>
                )}
              </Card>

              {ad.specs && (
                <>
                  <Card className="p-6 mb-6">
                    <h2 className="text-2xl font-bold mb-6">Informácie o aute</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Detail vozidla</h3>
                        <div className="space-y-3">
                          {ad.specs.brand && (
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-gray-600">Skupina</span>
                              <span className="font-semibold">{ad.specs.brand}</span>
                            </div>
                          )}
                          {ad.specs.model && (
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-gray-600">Model</span>
                              <span className="font-semibold">{ad.specs.model}</span>
                            </div>
                          )}
                          {ad.specs.year && (
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-gray-600">Registrácia</span>
                              <span className="font-semibold">{ad.specs.year}</span>
                            </div>
                          )}
                          {ad.specs.mileage && (
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-gray-600">Tachometer</span>
                              <span className="font-semibold">{ad.specs.mileage.toLocaleString()} km</span>
                            </div>
                          )}
                          {ad.specs.bodyType && (
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-gray-600">Karoséria</span>
                              <span className="font-semibold">{ad.specs.bodyType}</span>
                            </div>
                          )}
                          {ad.specs.seats && (
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-gray-600">Miest na sedenie</span>
                              <span className="font-semibold">{ad.specs.seats} miest</span>
                            </div>
                          )}
                          {ad.specs.doors && (
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-gray-600">Počet dverí</span>
                              <span className="font-semibold">{ad.specs.doors}</span>
                            </div>
                          )}
                          {ad.specs.color && (
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-gray-600">Farba</span>
                              <span className="font-semibold">{ad.specs.color}</span>
                            </div>
                          )}
                          {ad.specs.condition && (
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-gray-600">Stav</span>
                              <span className="font-semibold">{ad.specs.condition}</span>
                            </div>
                          )}
                          {ad.specs.vin && (
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-gray-600">VIN</span>
                              <span className="font-semibold">{ad.specs.vin}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-4">Motor</h3>
                        <div className="space-y-3">
                          {ad.specs.fuel && (
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-gray-600">Palivo</span>
                              <span className="font-semibold">{ad.specs.fuel}</span>
                            </div>
                          )}
                          {ad.specs.transmission && (
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-gray-600">Prevodovka</span>
                              <span className="font-semibold">{ad.specs.transmission}</span>
                            </div>
                          )}
                          {ad.specs.engineVolume && (
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-gray-600">Motor</span>
                              <span className="font-semibold">{ad.specs.engineVolume}</span>
                            </div>
                          )}
                          {ad.specs.power && (
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-gray-600">Výkon</span>
                              <span className="font-semibold">{ad.specs.power} kW</span>
                            </div>
                          )}
                          {ad.specs.engine && (
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-gray-600">Objem motora</span>
                              <span className="font-semibold">{ad.specs.engine} cm³</span>
                            </div>
                          )}
                          {ad.specs.drive && (
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-gray-600">Pohon</span>
                              <span className="font-semibold">{ad.specs.drive}</span>
                            </div>
                          )}
                          {ad.specs.emission && (
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-gray-600">Emisná norma</span>
                              <span className="font-semibold">{ad.specs.emission}</span>
                            </div>
                          )}
                          {ad.specs.co2Emissions && (
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-gray-600">Emisie CO₂</span>
                              <span className="font-semibold">{ad.specs.co2Emissions}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>

                  {(ad.specs.serviceHistory || ad.specs.lastServiceDate || ad.specs.lastServiceMileage) && (
                    <Card className="p-6 mb-6">
                      <h2 className="text-2xl font-bold mb-6">Stav vozidla</h2>
                      <div className="space-y-3">
                        {ad.specs.serviceHistory && (
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-600">História</span>
                            <span className="font-semibold">{ad.specs.serviceHistory}</span>
                          </div>
                        )}
                        {ad.specs.lastServiceDate && ad.specs.lastServiceMileage && (
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-600">Posledný servis</span>
                            <span className="font-semibold">
                              {new Date(ad.specs.lastServiceDate).toLocaleDateString('sk-SK')} pri {ad.specs.lastServiceMileage.toLocaleString()} km
                            </span>
                          </div>
                        )}
                      </div>
                    </Card>
                  )}

                  {ad.features && (
                    <Card className="p-6 mb-6">
                      <h2 className="text-2xl font-bold mb-6">Výbava a prednosti vozidla</h2>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {ad.features.interior && ad.features.interior.length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold mb-4">Interiér</h3>
                            <div className="space-y-2">
                              {ad.features.interior.map((feature, idx) => (
                                <div key={idx} className="flex items-start gap-2">
                                  <Check className="h-5 w-5 text-[#2ECC71] flex-shrink-0 mt-0.5" />
                                  <span className="text-sm">{feature}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {ad.features.infotainment && ad.features.infotainment.length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold mb-4">Infotainment</h3>
                            <div className="space-y-2">
                              {ad.features.infotainment.map((feature, idx) => (
                                <div key={idx} className="flex items-start gap-2">
                                  <Check className="h-5 w-5 text-[#2ECC71] flex-shrink-0 mt-0.5" />
                                  <span className="text-sm">{feature}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {ad.features.exterior && ad.features.exterior.length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold mb-4">Exteriér</h3>
                            <div className="space-y-2">
                              {ad.features.exterior.map((feature, idx) => (
                                <div key={idx} className="flex items-start gap-2">
                                  <Check className="h-5 w-5 text-[#2ECC71] flex-shrink-0 mt-0.5" />
                                  <span className="text-sm">{feature}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {ad.features.safety && ad.features.safety.length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold mb-4">Bezpečnosť</h3>
                            <div className="space-y-2">
                              {ad.features.safety.map((feature, idx) => (
                                <div key={idx} className="flex items-start gap-2">
                                  <Check className="h-5 w-5 text-[#2ECC71] flex-shrink-0 mt-0.5" />
                                  <span className="text-sm">{feature}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {ad.features.other && ad.features.other.length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold mb-4">Ostatné</h3>
                            <div className="space-y-2">
                              {ad.features.other.map((feature, idx) => (
                                <div key={idx} className="flex items-start gap-2">
                                  <Check className="h-5 w-5 text-[#2ECC71] flex-shrink-0 mt-0.5" />
                                  <span className="text-sm">{feature}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {ad.features.extra && ad.features.extra.length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold mb-4">Extra</h3>
                            <div className="space-y-2">
                              {ad.features.extra.map((feature, idx) => (
                                <div key={idx} className="flex items-start gap-2">
                                  <Check className="h-5 w-5 text-[#2ECC71] flex-shrink-0 mt-0.5" />
                                  <span className="text-sm">{feature}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  )}
                </>
              )}

              {ad.categorySpecific && Object.keys(ad.categorySpecific).length > 0 && (
                <Card className="p-6 mb-6">
                  <h2 className="text-2xl font-bold mb-6">Vlastnosti</h2>

                  <div className="space-y-3">
                    {Object.entries(ad.categorySpecific).map(([key, value]) => {
                      if (!value || (Array.isArray(value) && value.length === 0)) return null;

                      const displayValue = Array.isArray(value)
                        ? value.join(', ')
                        : typeof value === 'object'
                        ? JSON.stringify(value)
                        : value.toString();

                      const displayKey = key
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/^./, str => str.toUpperCase())
                        .trim();

                      return (
                        <div key={key} className="flex justify-between py-2 border-b">
                          <span className="text-gray-600">{displayKey}</span>
                          <span className="font-semibold text-right">{displayValue}</span>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}
            </div>

            <div className="lg:col-span-1 space-y-6">
              <div className="sticky top-20 space-y-6">
                <Card className="p-6">
                  <div className="text-4xl font-bold text-[#2ECC71] mb-6">
                    {ad.price > 0 ? `${ad.price} €` : 'Dohodou'}
                  </div>

                  {user && user.uid !== ad.user_id && (
                    <div className="space-y-3 mb-6">
                      <Button
                        onClick={handleContactSeller}
                        className="w-full"
                        style={{ backgroundColor: '#2ECC71' }}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Kontaktovať predajcu
                      </Button>

                      <Button
                        onClick={toggleFavorite}
                        variant="outline"
                        className="w-full"
                      >
                        <Heart className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                        {isFavorite ? 'Odstániť z obľúbených' : 'Pridať do obľúbených'}
                      </Button>
                    </div>
                  )}

                  <div className="border-t pt-6">
                    <h3 className="font-semibold mb-4">Predajca</h3>
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar>
                        <AvatarImage src={seller?.avatar_url} />
                        <AvatarFallback>{seller?.name?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{seller?.name}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push(`/profil/${ad.user_id}`)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Zobraziť profil
                    </Button>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="text-center mb-3">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Sponzorované
                    </p>
                  </div>
                  <div style={{ minHeight: '250px', maxHeight: '400px' }} className="w-full bg-gray-100 rounded flex items-center justify-center">
                    <p className="text-gray-400">Reklamný banner</p>
                  </div>
                </Card>

                {ad.category_id === 'auto' && ad.price > 0 && (
                  <FinancingCalculator vehiclePrice={ad.price} />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {lightboxOpen && (
        <ImageLightbox
          images={ad.images}
          initialIndex={selectedImage}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}
