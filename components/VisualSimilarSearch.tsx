'use client';

import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Camera, Sparkles, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { AdCard } from '@/components/AdCard';

interface VisualSimilarSearchProps {
  onResultsFound?: (count: number) => void;
}

export function VisualSimilarSearch({ onResultsFound }: VisualSimilarSearchProps) {
  const [uploading, setUploading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Prosím nahrajte obrázok');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Obrázok je príliš veľký. Maximum je 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
      searchByImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const searchByImage = async (imageData: string) => {
    setSearching(true);
    setResults([]);
    setAnalysis('');

    try {
      // Visual search is not available with Claude 3 Haiku
      toast.info('Vyhľadávanie podľa obrázka je momentálne nedostupné. Použite textové vyhľadávanie.');
      setPreview(null);
    } catch (error) {
      console.error('Error in visual search:', error);
      toast.error('Nepodarilo sa vyhľadať podobné produkty');
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setPreview(null);
    setResults([]);
    setAnalysis('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200">
        <div className="flex items-start gap-3 mb-4">
          <Camera className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Vizuálne vyhľadávanie s AI</h3>
            <p className="text-sm text-gray-700">
              Nahrajte fotografiu produktu a AI nájde podobné inzeráty na základe vizuálnej podobnosti
            </p>
          </div>
        </div>

        {!preview ? (
          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            <Button
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
              size="lg"
              style={{ backgroundColor: '#10b981' }}
            >
              <Upload className="h-5 w-5 mr-2" />
              Nahrať obrázok
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-emerald-50 px-2 text-gray-500">alebo</span>
              </div>
            </div>

            <Button
              onClick={() => {
                if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                  toast.info('Fotoaparát bude dostupný v plnej verzii');
                } else {
                  toast.error('Fotoaparát nie je podporovaný v tomto zariadení');
                }
              }}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <Camera className="h-5 w-5 mr-2" />
              Odfotiť produkt
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg"
              />
              <Button
                onClick={clearSearch}
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {searching ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mx-auto mb-3" />
                <p className="text-sm text-gray-600">Analyzujem obrázok a hľadám podobné produkty...</p>
              </div>
            ) : analysis && (
              <Card className="p-4 bg-white">
                <div className="flex items-start gap-2">
                  <Sparkles className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">AI Analýza obrázka:</p>
                    <p className="text-sm text-gray-700">{analysis}</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
      </Card>

      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-600" />
              Podobné produkty ({results.length})
            </h3>
            <Button onClick={clearSearch} variant="outline" size="sm">
              Nové vyhľadávanie
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((ad, index) => (
              <AdCard key={ad.id || index} ad={ad} />
            ))}
          </div>
        </div>
      )}

      {results.length === 0 && preview && !searching && (
        <Card className="p-12 text-center">
          <ImageIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Žiadne výsledky</h3>
          <p className="text-gray-600 mb-4">Nenašli sme podobné produkty pre tento obrázok</p>
          <Button onClick={clearSearch} variant="outline">
            Skúsiť iný obrázok
          </Button>
        </Card>
      )}
    </div>
  );
}
