'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from './AuthModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Plus, Heart, MessageSquare, User, LogOut, Moon, Sun, Menu, ChartBar as BarChart3, Coins, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SearchWithSuggestions } from './SearchWithSuggestions';
import { VoiceSearch } from './VoiceSearch';
import { NotificationCenter } from './NotificationCenter';
import { supabase } from '@/lib/supabase';

export function Header() {
  const { user, userProfile, signOut } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coinBalance, setCoinBalance] = useState(0);
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadCoinBalance();

      // Subscribe to real-time updates
      const channel = supabase
        .channel('user-coins-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_coins',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            if (payload.new && 'balance' in payload.new) {
              setCoinBalance(payload.new.balance as number);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const loadCoinBalance = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_coins')
      .select('balance')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setCoinBalance(data.balance);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <img src="/ChatGPT Image 6. 11. 2025, 12_07_09.png" alt="Kupedo" className="w-10 h-10" />
              <span className="text-xl font-bold text-[#2C3E50] dark:text-white">Kupedo.sk</span>
            </Link>

            <div className="hidden md:flex flex-1 max-w-xl mx-8">
              <SearchWithSuggestions placeholder="Čo hľadáte? napr. iPhone, byt v Bratislave..." className="w-full" />
            </div>

            <div className="flex items-center gap-2">
              {user && <NotificationCenter />}

              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (isDark) {
                    document.documentElement.classList.remove('dark');
                    localStorage.setItem('theme', 'light');
                    setIsDark(false);
                  } else {
                    document.documentElement.classList.add('dark');
                    localStorage.setItem('theme', 'dark');
                    setIsDark(true);
                  }
                }}
                className="relative w-10 h-10"
                aria-label="Prepnúť tému"
              >
                {isDark ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
                <span className="sr-only">Prepnúť tému</span>
              </Button>

              {user ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => router.push('/mince')}
                    className="hidden md:flex items-center gap-2 px-4 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-950 border-2 border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/50 hover:scale-105 transition-all shadow-sm hover:shadow-md"
                    title="Moje mince - Kliknite pre nákup"
                  >
                    <Coins className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <div className="flex flex-col items-start">
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-500 font-medium leading-none">Moje mince</span>
                      <span className="text-lg font-bold text-emerald-700 dark:text-emerald-300 leading-none">{coinBalance}</span>
                    </div>
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push('/oblubene')}
                    className="hidden md:inline-flex"
                  >
                    <Heart className="h-5 w-5" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push('/spravy')}
                    className="hidden md:inline-flex"
                  >
                    <MessageSquare className="h-5 w-5" />
                  </Button>

                  <Button
                    onClick={() => router.push('/pridat-inzerat')}
                    className="hidden md:inline-flex bg-emerald-500 hover:bg-emerald-600 transition-all duration-200"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Pridať inzerát
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Avatar>
                          <AvatarImage src={userProfile?.avatar_url} />
                          <AvatarFallback>
                            {(userProfile?.displayName || userProfile?.name)?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push('/ai-features')}>
                        <Sparkles className="mr-2 h-4 w-4" />
                        AI Funkcie
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/profil/${user.id}`)}>
                        <User className="mr-2 h-4 w-4" />
                        Môj profil
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push('/moje-inzeraty')}>
                        <Menu className="mr-2 h-4 w-4" />
                        Moje inzeráty
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push('/mince')} className="bg-emerald-50 dark:bg-emerald-950">
                        <Coins className="mr-2 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="font-semibold">Moje mince ({coinBalance})</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={async () => {
                        try {
                          await signOut();
                          router.push('/');
                        } catch (error) {
                          console.error('Sign out error:', error);
                        }
                      }}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Odhlásiť sa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button onClick={() => setAuthModalOpen(true)} className="bg-emerald-500 hover:bg-emerald-600 transition-all duration-200">
                  Prihlásiť sa
                </Button>
              )}
            </div>
          </div>

          <div className="md:hidden pb-3">
            <SearchWithSuggestions placeholder="Hľadať..." className="w-full" />
          </div>
        </div>
      </header>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {user && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50">
          <div className="grid grid-cols-5 h-14 px-1">
            <button
              onClick={() => router.push('/')}
              className="flex flex-col items-center justify-center gap-0 text-gray-600 dark:text-gray-400 hover:text-emerald-500 transition-colors px-1"
            >
              <Search className="h-4 w-4" />
              <span className="text-[9px]">Hľadať</span>
            </button>
            <button
              onClick={() => router.push('/mince')}
              className="flex flex-col items-center justify-center gap-0 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-colors px-1"
            >
              <div className="relative">
                <Coins className="h-4 w-4" />
                {coinBalance > 0 && (
                  <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[7px] font-bold rounded-full w-2.5 h-2.5 flex items-center justify-center">
                    {coinBalance > 9 ? '9' : coinBalance}
                  </span>
                )}
              </div>
              <span className="text-[9px] font-semibold">Mince</span>
            </button>
            <button
              onClick={() => router.push('/oblubene')}
              className="flex flex-col items-center justify-center gap-0 text-gray-600 dark:text-gray-400 hover:text-emerald-500 transition-colors px-1"
            >
              <Heart className="h-4 w-4" />
              <span className="text-[9px]">Obľúbené</span>
            </button>
            <button
              onClick={() => router.push('/pridat-inzerat')}
              className="flex flex-col items-center justify-center gap-0 text-white bg-emerald-500 hover:bg-emerald-600 transition-colors px-1"
            >
              <Plus className="h-5 w-5" />
              <span className="text-[9px]">Pridať</span>
            </button>
            <button
              onClick={() => router.push('/spravy')}
              className="flex flex-col items-center justify-center gap-0 text-gray-600 dark:text-gray-400 hover:text-emerald-500 transition-colors px-1"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="text-[9px]">Správy</span>
            </button>
          </div>
        </nav>
      )}
    </>
  );
}
