'use client';

import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Camera, Sparkles, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface VisualSimilarSearchProps {
  onResultsFound?: (count: number) => void;
}

export function VisualSimilarSearch({ onResultsFound }: VisualSimilarSearchProps) {
  const [searching, setSearching] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

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
    setAnalysis('');

    try {
      const analyzeResponse = await fetch('/api/ai/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageData,
          userId: 'guest',
        }),
      });

      if (!analyzeResponse.ok) {
        throw new Error('Nepodarilo sa analyzovať obrázok');
      }

      const analyzeData = await analyzeResponse.json();
      setAnalysis(analyzeData.analysis);

      // Presmerovať na hlavnú stránku s výsledkami vyhľadávania
      toast.success(`Analyzované: ${analyzeData.analysis}`);

      // Krátka pauza aby používateľ videl toast
      setTimeout(() => {
        router.push(`/?search=${encodeURIComponent(analyzeData.analysis)}`);
      }, 1000);
    } catch (error) {
      console.error('Error in visual search:', error);
      toast.error('Nepodarilo sa vyhľadať podobné produkty');
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setPreview(null);
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

            {searching && (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mx-auto mb-3" />
                <p className="text-sm text-gray-600">Analyzujem obrázok pomocou AI...</p>
                <p className="text-xs text-gray-500 mt-2">Presmerujeme vás na výsledky vyhľadávania</p>
              </div>
            )}
          </div>
        )}
      </Card>

    </div>
  );
}
