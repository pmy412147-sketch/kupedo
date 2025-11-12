'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MapPin, MessageSquare, Heart, Edit, Eye, Clock, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { sk } from 'date-fns/locale';

interface AdCardProps {
  id: string;
  title: string;
  price: number;
  location: string;
  images: string[];
  user_id: string;
  created_at?: string;
  view_count?: number;
  is_boosted?: boolean;
  boosted_until?: string;
}

export function AdCard({ id, title, price, location, images, user_id, created_at, view_count, is_boosted, boosted_until }: AdCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (user) {
      checkFavoriteStatus();
    }
  }, [user, id]);

  const checkFavoriteStatus = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('ad_id', id)
      .maybeSingle();

    setIsFavorite(!!data);
  };

  const handleChatClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Musíte sa prihlásiť');
      return;
    }
    router.push(`/chat/${user_id}?ad=${id}`);
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!user) {
      alert('Musíte sa prihlásiť');
      return;
    }

    if (isFavorite) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('ad_id', id);
      setIsFavorite(false);
    } else {
      await supabase
        .from('favorites')
        .insert({ user_id: user.id, ad_id: id });
      setIsFavorite(true);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(`/upravit-inzerat/${id}`);
  };

  const timeAgo = created_at ? formatDistanceToNow(new Date(created_at), { addSuffix: true, locale: sk }) : '';

  return (
    <Link href={`/inzerat/${id}`}>
      <div
        className={`group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 h-full flex flex-col ${
          is_boosted && boosted_until && new Date(boosted_until) > new Date()
            ? 'border-2 border-amber-400 ring-2 ring-amber-200 dark:ring-amber-900'
            : 'border border-gray-100 dark:border-gray-700'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-700">
          {images[0] ? (
            <>
              <img
                src={images[0]}
                alt={title}
                className={`w-full h-full object-cover transition-transform duration-500 ${
                  isHovered ? 'scale-110' : 'scale-100'
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm">Bez obrázku</p>
              </div>
            </div>
          )}

          <button
            onClick={handleFavoriteClick}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg hover:scale-110 transition-all duration-200 z-10"
          >
            <Heart
              className={`h-5 w-5 transition-colors ${
                isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-300'
              }`}
            />
          </button>

          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {is_boosted && boosted_until && new Date(boosted_until) > new Date() && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold shadow-lg animate-pulse">
                <Sparkles className="h-3.5 w-3.5" />
                <span>TOP</span>
              </div>
            )}
            {view_count !== undefined && view_count > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs">
                <Eye className="h-3 w-3" />
                <span>{view_count}</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 flex flex-col flex-grow">
          <div className="flex justify-between items-start gap-2 mb-2">
            <h3 className="font-semibold text-base text-gray-900 dark:text-white line-clamp-2 flex-grow leading-tight">
              {title}
            </h3>
          </div>

          <div className="flex items-baseline gap-2 mb-3">
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {price > 0 ? `€${price.toLocaleString()}` : 'Dohodou'}
            </p>
          </div>

          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mb-3">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="line-clamp-1">{location}</span>
          </div>

          {created_at && (
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500 mb-4">
              <Clock className="h-3 w-3" />
              <span>{timeAgo}</span>
            </div>
          )}

          <div className="mt-auto">
            {user && user.id === user_id ? (
              <Button
                onClick={handleEditClick}
                variant="outline"
                className="w-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                size="sm"
              >
                <Edit className="h-4 w-4 mr-2" />
                Upraviť inzerát
              </Button>
            ) : user ? (
              <Button
                onClick={handleChatClick}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
                size="sm"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Kontaktovať
              </Button>
            ) : (
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  alert('Musíte sa prihlásiť');
                }}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
                size="sm"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Kontaktovať
              </Button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
