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
import { Search, Plus, Heart, MessageSquare, User, LogOut, Moon, Sun, Menu, BarChart3 } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { SearchWithSuggestions } from './SearchWithSuggestions';

export function Header() {
  const { user, userProfile, signOut } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <img src="/ChatGPT Image 6. 11. 2025, 12_07_09.png" alt="Kupado" className="w-10 h-10" />
              <span className="text-xl font-bold text-[#2C3E50] dark:text-white">Kupado.sk</span>
            </Link>

            <div className="hidden md:flex flex-1 max-w-xl mx-8">
              <SearchWithSuggestions placeholder="Čo hľadáte? napr. iPhone, byt v Bratislave..." className="w-full" />
            </div>

            <div className="flex items-center gap-2">
              {mounted && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="relative"
                  aria-label="Prepnúť tému"
                >
                  <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  <span className="sr-only">Prepnúť tému</span>
                </Button>
              )}

              {user ? (
                <>
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
                      <DropdownMenuItem onClick={() => router.push(`/profil/${user.id}`)}>
                        <User className="mr-2 h-4 w-4" />
                        Môj profil
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push('/moje-inzeraty')}>
                        <Menu className="mr-2 h-4 w-4" />
                        Moje inzeráty
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={signOut}>
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
          <div className="grid grid-cols-4 h-16">
            <button
              onClick={() => router.push('/')}
              className="flex flex-col items-center justify-center gap-1 text-gray-600 dark:text-gray-400 hover:text-emerald-500 transition-colors"
            >
              <Search className="h-5 w-5" />
              <span className="text-xs">Hľadať</span>
            </button>
            <button
              onClick={() => router.push('/oblubene')}
              className="flex flex-col items-center justify-center gap-1 text-gray-600 dark:text-gray-400 hover:text-emerald-500 transition-colors"
            >
              <Heart className="h-5 w-5" />
              <span className="text-xs">Obľúbené</span>
            </button>
            <button
              onClick={() => router.push('/pridat-inzerat')}
              className="flex flex-col items-center justify-center gap-1 text-white bg-emerald-500 hover:bg-emerald-600 transition-colors"
            >
              <Plus className="h-6 w-6" />
              <span className="text-xs">Pridať</span>
            </button>
            <button
              onClick={() => router.push('/spravy')}
              className="flex flex-col items-center justify-center gap-1 text-gray-600 dark:text-gray-400 hover:text-emerald-500 transition-colors"
            >
              <MessageSquare className="h-5 w-5" />
              <span className="text-xs">Správy</span>
            </button>
          </div>
        </nav>
      )}
    </>
  );
}
