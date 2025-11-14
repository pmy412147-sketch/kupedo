'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, TrendingUp, Clock, Camera, X, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { VoiceSearch } from './VoiceSearch';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface SearchSuggestion {
  title: string;
  category: string;
  type: 'ad' | 'recent';
}

interface SearchWithSuggestionsProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchWithSuggestions({
  onSearch,
  placeholder = "Čo hľadáte?",
  className = ""
}: SearchWithSuggestionsProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        if (query.length === 0 && recentSearches.length > 0) {
          setSuggestions(
            recentSearches.slice(0, 5).map(search => ({
              title: search,
              category: '',
              type: 'recent' as const
            }))
          );
        } else {
          setSuggestions([]);
        }
        return;
      }

      try {
        const { data, error } = await supabase
          .from('ads')
          .select('title, category_id')
          .eq('status', 'active')
          .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
          .limit(8);

        if (error) {
          console.error('Error fetching suggestions:', error);
          return;
        }

        const uniqueTitles = new Set<string>();
        const adSuggestions: SearchSuggestion[] = [];

        data?.forEach(ad => {
          const lowerTitle = ad.title.toLowerCase();
          if (!uniqueTitles.has(lowerTitle)) {
            uniqueTitles.add(lowerTitle);
            adSuggestions.push({
              title: ad.title,
              category: ad.category_id,
              type: 'ad'
            });
          }
        });

        setSuggestions(adSuggestions);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [query, recentSearches]);

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      const newRecent = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 10);
      setRecentSearches(newRecent);
      localStorage.setItem('recentSearches', JSON.stringify(newRecent));

      if (onSearch) {
        onSearch(searchQuery);
      } else {
        router.push(`/?search=${encodeURIComponent(searchQuery)}`);
      }
      setShowSuggestions(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.title);
    handleSearch(suggestion.title);
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
      router.push(`/?visual=true&analysis=${encodeURIComponent(analyzeData.analysis)}`);

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
    <div ref={wrapperRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder={placeholder}
              className="pl-10 pr-4"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
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
          <VoiceSearch
            onSearch={(voiceQuery) => {
              setQuery(voiceQuery);
              handleSearch(voiceQuery);
            }}
          />
        </div>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          <div className="py-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-2.5 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
              >
                {suggestion.type === 'recent' ? (
                  <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                ) : (
                  <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {suggestion.title}
                  </p>
                  {suggestion.category && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {suggestion.category}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {showCamera && (
        <Card className="absolute z-50 w-full mt-2 p-4 shadow-lg">
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
