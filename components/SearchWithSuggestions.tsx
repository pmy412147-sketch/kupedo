'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Search, TrendingUp, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { VoiceSearch } from './VoiceSearch';

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
  const wrapperRef = useRef<HTMLDivElement>(null);
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
    </div>
  );
}
