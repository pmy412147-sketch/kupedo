'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Home, Search, Plus, MessageSquare, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';

export function MobileNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    loadUnreadCount();

    // Subscribe to real-time message updates
    const channel = supabase
      .channel('unread-messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`,
        },
        () => {
          loadUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const loadUnreadCount = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('receiver_id', user.id)
      .eq('read', false);

    setUnreadCount(data?.length || 0);
  };

  if (!user) return null;

  const navItems = [
    { icon: Home, label: 'Domov', path: '/', key: 'home' },
    { icon: Search, label: 'Hľadať', path: '/?focus=search', key: 'search' },
    { icon: Plus, label: 'Pridať', path: '/pridat-inzerat', key: 'add' },
    { icon: MessageSquare, label: 'Správy', path: '/spravy', key: 'messages', badge: unreadCount },
    { icon: User, label: 'Profil', path: `/profil/${user.id}`, key: 'profile' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-40">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.path || (item.key === 'home' && pathname === '/');
          const Icon = item.icon;

          return (
            <button
              key={item.key}
              onClick={() => router.push(item.path)}
              className="flex flex-col items-center justify-center flex-1 h-full relative"
            >
              <div className="relative">
                <Icon
                  className={`h-6 w-6 ${
                    isActive
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                />
                {item.badge && item.badge > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-[10px] rounded-full"
                  >
                    {item.badge > 9 ? '9+' : item.badge}
                  </Badge>
                )}
              </div>
              <span
                className={`text-[10px] mt-1 ${
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
