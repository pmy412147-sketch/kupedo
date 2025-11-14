'use client';

import { useState, useRef } from 'react';
import { Search, Camera, Loader2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface EnhancedSearchBarProps {
  onSearch?: (query: string) => void;
  onVisualSearch?: (imageUrl: string, analysis: string) => void;
}

export function EnhancedSearchBar({ onSearch, onVisualSearch }: EnhancedSearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleTextSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (onSearch) {
        onSearch(searchQuery);
      } else {
        router.push(`/?q=${encodeURIComponent(searchQuery)}`);
      }
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
    reader.onloadend = async () => {
      const imageData = reader.result as string;
      setPreview(imageData);
      await analyzeAndSearch(imageData);
    };
    reader.readAsDataURL(file);
  };

  const analyzeAndSearch = async (imageData: string) => {
    setAnalyzing(true);

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

      if (onVisualSearch) {
        onVisualSearch(imageData, analyzeData.analysis);
      } else {
        router.push(`/?visual=true&analysis=${encodeURIComponent(analyzeData.analysis)}`);
      }

      toast.success('Obrázok bol analyzovaný!');
      setShowCamera(false);
      setPreview(null);
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast.error('Nepodarilo sa analyzovať obrázok');
    } finally {
      setAnalyzing(false);
    }
  };

  const clearImage = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="relative w-full">
      <form onSubmit={handleTextSearch} className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Čo hľadáte? napr. iPhone, byt v Bratislave..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4"
          />
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setShowCamera(!showCamera)}
          className="relative"
          title="Vyhľadať podľa fotky"
        >
          <Camera className="h-4 w-4" />
        </Button>
      </form>

      {showCamera && (
        <Card className="absolute top-full mt-2 left-0 right-0 p-4 z-50 shadow-lg">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Vyhľadávanie podľa fotky</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowCamera(false);
                  clearImage();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {!preview ? (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />

                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                  style={{ backgroundColor: '#10b981' }}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Vybrať fotku
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  Nahrajte fotku produktu a AI nájde podobné inzeráty
                </p>
              </>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <Button
                    onClick={clearImage}
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    disabled={analyzing}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {analyzing && (
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                    <span>Analyzujem a hľadám podobné produkty...</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
